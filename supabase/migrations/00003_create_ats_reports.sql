create table public.ats_reports (
  id uuid primary key default gen_random_uuid(),
  cv_id uuid references public.cvs(id) on delete cascade not null,
  score int,
  issues jsonb,
  suggestions jsonb,
  created_at timestamptz default now()
);

alter table public.ats_reports enable row level security;

create policy "Users can view own ats_reports"
  on public.ats_reports for select
  using (cv_id in (select id from public.cvs where user_id = auth.uid()));

create policy "Users can insert own ats_reports"
  on public.ats_reports for insert
  with check (cv_id in (select id from public.cvs where user_id = auth.uid()));

create policy "Users can update own ats_reports"
  on public.ats_reports for update
  using (cv_id in (select id from public.cvs where user_id = auth.uid()));

create policy "Users can delete own ats_reports"
  on public.ats_reports for delete
  using (cv_id in (select id from public.cvs where user_id = auth.uid()));
