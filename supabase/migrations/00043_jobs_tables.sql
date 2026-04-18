-- Jobs feature: job_clicks, saved_jobs, preferred_locations tables

-- ─────────────────────────────────────────────────────────────────
-- job_clicks: track every outbound job click per user
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_clicks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id       text NOT NULL,
  job_title    text,
  company      text,
  location     text,
  salary_min   numeric,
  salary_max   numeric,
  match_score  integer,
  job_board    text DEFAULT 'adzuna',
  redirect_url text,
  source       text DEFAULT 'web',
  created_at   timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_clicks_user_id   ON job_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_job_clicks_created_at ON job_clicks(created_at DESC);

ALTER TABLE job_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_job_clicks"
  ON job_clicks FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "service_all_job_clicks"
  ON job_clicks FOR ALL
  USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────────
-- saved_jobs: jobs bookmarked by users
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_jobs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id       text NOT NULL,
  job_title    text,
  company      text,
  location     text,
  salary_min   numeric,
  salary_max   numeric,
  redirect_url text,
  match_score  integer,
  job_board    text DEFAULT 'adzuna',
  status       text DEFAULT 'active',
  saved_at     timestamptz DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_status  ON saved_jobs(status);

ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_saved_jobs"
  ON saved_jobs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "service_all_saved_jobs"
  ON saved_jobs FOR ALL
  USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────────
-- preferred_locations: user job search location preferences
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS preferred_locations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  location      text NOT NULL,
  location_type text,
  priority      integer DEFAULT 0,
  created_at    timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_preferred_locations_user_id ON preferred_locations(user_id);

ALTER TABLE preferred_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_preferred_locations"
  ON preferred_locations FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "service_all_preferred_locations"
  ON preferred_locations FOR ALL
  USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────────
-- profiles: add jobs-related columns
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_locations_set boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS job_search_active boolean DEFAULT true;
