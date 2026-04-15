-- Lifetime PDF download counter (existing pdf_downloads_this_window is a rolling 7-day counter)
alter table profiles add column if not exists total_pdf_downloads int default 0;

-- Page session tracking: one row per page visit, duration filled in on leave
create table if not exists page_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  path text not null,
  entered_at timestamptz not null default now(),
  duration_ms int,
  created_at timestamptz not null default now()
);

create index if not exists page_sessions_user_id_idx on page_sessions(user_id);
create index if not exists page_sessions_created_at_idx on page_sessions(created_at desc);
create index if not exists page_sessions_user_path_idx on page_sessions(user_id, path);

alter table page_sessions enable row level security;

create policy "users insert own page sessions"
  on page_sessions for insert
  with check (user_id = auth.uid());

create policy "users update own page sessions"
  on page_sessions for update
  using (user_id = auth.uid());

create policy "users read own page sessions"
  on page_sessions for select
  using (user_id = auth.uid());
