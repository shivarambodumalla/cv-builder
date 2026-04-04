create table public.keyword_lists (
  id uuid primary key default gen_random_uuid(),
  role text unique not null,
  required jsonb default '[]',
  important jsonb default '[]',
  nice_to_have jsonb default '[]',
  synonym_map jsonb default '{}',
  updated_at timestamptz default now()
);

alter table public.keyword_lists enable row level security;

create policy "Authenticated users can read keyword_lists"
  on public.keyword_lists for select
  using (auth.role() = 'authenticated');

create policy "Admin can insert keyword_lists"
  on public.keyword_lists for insert
  with check (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

create policy "Admin can update keyword_lists"
  on public.keyword_lists for update
  using (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

create policy "Admin can delete keyword_lists"
  on public.keyword_lists for delete
  using (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));
