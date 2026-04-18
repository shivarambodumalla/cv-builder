-- Job providers managed via admin panel (not env vars)
CREATE TABLE IF NOT EXISTS job_providers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  api_base_url text,
  app_id text,
  app_key text,
  enabled boolean DEFAULT true,
  priority integer DEFAULT 0,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Seed Adzuna as default provider
INSERT INTO job_providers (name, display_name, api_base_url, app_id, app_key, enabled, priority)
VALUES ('adzuna', 'Adzuna', 'https://api.adzuna.com/v1/api/jobs', 'af2f1b2c', '13ef2e1743789b97e7bff09b60230dbd', true, 1)
ON CONFLICT (name) DO NOTHING;

ALTER TABLE job_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_all_job_providers" ON job_providers FOR ALL USING (true);

-- Update job_clicks to track which provider
ALTER TABLE job_clicks ADD COLUMN IF NOT EXISTS provider text DEFAULT 'adzuna';
