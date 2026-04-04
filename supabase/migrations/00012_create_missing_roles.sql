create table if not exists public.missing_roles (
  id uuid primary key default gen_random_uuid(),
  role_name text not null,
  domain text,
  user_id uuid not null,
  created_at timestamptz default now()
);

alter table public.missing_roles enable row level security;

create policy "Anyone can insert missing_roles"
  on public.missing_roles for insert
  with check (true);

create policy "Anyone can read missing_roles"
  on public.missing_roles for select
  using (true);

create policy "Anyone can delete missing_roles"
  on public.missing_roles for delete
  using (true);
