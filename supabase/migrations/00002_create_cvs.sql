create table public.cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text,
  raw_text text,
  parsed_json jsonb,
  is_active bool default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.cvs enable row level security;

create policy "Users can view own cvs"
  on public.cvs for select
  using (user_id = auth.uid());

create policy "Users can insert own cvs"
  on public.cvs for insert
  with check (user_id = auth.uid());

create policy "Users can update own cvs"
  on public.cvs for update
  using (user_id = auth.uid());

create policy "Users can delete own cvs"
  on public.cvs for delete
  using (user_id = auth.uid());
