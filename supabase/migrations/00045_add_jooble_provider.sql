-- Add Jooble as a job provider
-- Jooble API: POST https://jooble.org/api/{api-key}
-- Rate limit: 500 requests (default)

INSERT INTO job_providers (name, display_name, api_base_url, app_id, app_key, enabled, priority)
VALUES (
  'jooble',
  'Jooble',
  'https://jooble.org/api/d95eb935-b30b-46eb-86dd-82e402476d59',
  '',
  'd95eb935-b30b-46eb-86dd-82e402476d59',
  true,
  2
)
ON CONFLICT (name) DO UPDATE SET
  app_key = EXCLUDED.app_key,
  api_base_url = EXCLUDED.api_base_url,
  enabled = EXCLUDED.enabled,
  priority = EXCLUDED.priority,
  updated_at = NOW();
