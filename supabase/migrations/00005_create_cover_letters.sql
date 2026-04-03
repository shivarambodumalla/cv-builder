create table public.cover_letters (
  id uuid primary key default gen_random_uuid(),
  cv_id uuid references public.cvs(id) on delete cascade not null,
  job_match_id uuid references public.job_matches(id),
  content text,
  created_at timestamptz default now()
);

alter table public.cover_letters enable row level security;

create policy "Users can view own cover_letters"
  on public.cover_letters for select
  using (cv_id in (select id from public.cvs where user_id = auth.uid()));

create policy "Users can insert own cover_letters"
  on public.cover_letters for insert
  with check (cv_id in (select id from public.cvs where user_id = auth.uid()));

create policy "Users can update own cover_letters"
  on public.cover_letters for update
  using (cv_id in (select id from public.cvs where user_id = auth.uid()));

create policy "Users can delete own cover_letters"
  on public.cover_letters for delete
  using (cv_id in (select id from public.cvs where user_id = auth.uid()));
