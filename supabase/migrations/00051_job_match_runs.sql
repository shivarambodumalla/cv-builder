-- Observability for the weekly-jobs matcher. One row per matchJobsForCV call
-- so we can query: how many users got real matches vs empty, and WHY
-- (provider returned nothing? location filter ate everything? scores too low?).
create table if not exists public.job_match_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  template text not null,
  run_at timestamptz not null default now(),

  -- inputs
  search_country text,
  preferred_locations text[],

  -- funnel counts
  provider_jobs integer not null default 0,
  location_filtered integer not null default 0,
  best_count integer not null default 0,
  more_count integer not null default 0,

  -- score distribution (coarse)
  median_score integer not null default 0,
  max_score integer not null default 0,

  -- outcome
  fresh_count integer not null default 0,
  outcome text not null,        -- sent | will_fall_through_empty | match_error
  error text
);

create index if not exists idx_job_match_runs_run_at
  on public.job_match_runs(run_at desc);

create index if not exists idx_job_match_runs_outcome
  on public.job_match_runs(outcome, run_at desc);

create index if not exists idx_job_match_runs_user
  on public.job_match_runs(user_id, run_at desc);

alter table public.job_match_runs enable row level security;

-- Service role (admin client) is the only writer; no user-facing policies.
