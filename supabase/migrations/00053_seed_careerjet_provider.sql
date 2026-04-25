-- Seed Careerjet as a third job provider alongside Adzuna and Jooble.
-- Public API is HTTP-only (no HTTPS); affid acts as the API key.
-- Paid partnership — runs at the highest priority so its listings win
-- the cross-provider title+company dedup in searchAllProviders().

insert into public.job_providers (name, display_name, api_base_url, app_id, app_key, enabled, priority)
values (
  'careerjet',
  'Careerjet',
  'http://public.api.careerjet.net/search',
  null,
  '46743b137b3795260d6187e084b7648a',
  true,
  10
)
on conflict (name) do update set
  display_name = excluded.display_name,
  api_base_url = excluded.api_base_url,
  app_key = excluded.app_key,
  enabled = excluded.enabled,
  priority = excluded.priority,
  updated_at = now();
