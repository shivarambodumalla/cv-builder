create table public.ai_settings (
  id uuid primary key default gen_random_uuid(),
  feature text unique not null,
  max_tokens int not null,
  temperature float default 0,
  enabled bool default true,
  updated_at timestamptz default now()
);

alter table public.ai_settings enable row level security;

create policy "Authenticated users can read ai_settings"
  on public.ai_settings for select
  using (auth.role() = 'authenticated');

create policy "Admin can insert ai_settings"
  on public.ai_settings for insert
  with check (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

create policy "Admin can update ai_settings"
  on public.ai_settings for update
  using (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

create policy "Admin can delete ai_settings"
  on public.ai_settings for delete
  using (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

insert into public.ai_settings (feature, max_tokens, temperature, enabled) values
  ('ats_analysis', 1000, 0, true),
  ('job_match', 600, 0, true),
  ('cover_letter', 800, 0.7, true),
  ('bullet_rewrite', 200, 0.3, true),
  ('cv_parse', 1000, 0, true);
