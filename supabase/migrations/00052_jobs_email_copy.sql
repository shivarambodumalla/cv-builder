-- Editable copy overrides for the React-rendered jobs emails.
-- One row per template, JSONB so we can extend the field set without
-- another migration. Read at send time with a 5-minute cache; missing
-- rows / missing keys fall back to the defaults baked into the React
-- components.
create table if not exists public.jobs_email_copy (
  template_name text primary key,
  copy jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.jobs_email_copy enable row level security;

-- Service role (admin client) is the only writer/reader; no user policies.

-- Seed empty rows so the admin editor has something to load.
insert into public.jobs_email_copy (template_name, copy) values
  ('jobs_weekly', '{}'::jsonb),
  ('jobs_weekly_empty', '{}'::jsonb),
  ('welcome_jobs', '{}'::jsonb)
on conflict (template_name) do nothing;
