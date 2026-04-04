alter table public.cvs add column if not exists target_domain text;
alter table public.cvs add column if not exists target_role text;
alter table public.cvs add column if not exists redirect_token text;
alter table public.cvs add column if not exists status text default 'active';

create index if not exists idx_cvs_redirect_token on public.cvs (redirect_token) where redirect_token is not null;

create table if not exists public.missing_roles (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  domain text,
  requested_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.missing_roles enable row level security;

create policy "Authenticated users can insert missing_roles"
  on public.missing_roles for insert
  with check (auth.uid() is not null);

create policy "Authenticated users can read own missing_roles"
  on public.missing_roles for select
  using (requested_by = auth.uid());
