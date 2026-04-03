create table public.job_matches (
  id uuid primary key default gen_random_uuid(),
  cv_id uuid references public.cvs(id) on delete cascade not null,
  job_title text,
  job_description text,
  match_score int,
  missing_keywords jsonb,
  created_at timestamptz default now()
);

alter table public.job_matches enable row level security;

create policy "Users can view own job_matches"
  on public.job_matches for select
  using (cv_id in (select id from public.cvs where user_id = auth.uid()));

create policy "Users can insert own job_matches"
  on public.job_matches for insert
  with check (cv_id in (select id from public.cvs where user_id = auth.uid()));

create policy "Users can update own job_matches"
  on public.job_matches for update
  using (cv_id in (select id from public.cvs where user_id = auth.uid()));

create policy "Users can delete own job_matches"
  on public.job_matches for delete
  using (cv_id in (select id from public.cvs where user_id = auth.uid()));
