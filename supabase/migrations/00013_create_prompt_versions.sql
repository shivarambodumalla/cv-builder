create table if not exists public.prompt_versions (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid references public.prompts(id) on delete cascade not null,
  content text not null,
  version int not null,
  created_at timestamptz default now()
);

alter table public.prompt_versions enable row level security;

create policy "Admin can read prompt_versions"
  on public.prompt_versions for select
  using (true);

create policy "Admin can insert prompt_versions"
  on public.prompt_versions for insert
  with check (true);
