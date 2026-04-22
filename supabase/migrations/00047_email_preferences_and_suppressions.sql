-- Email system: per-type opt-out flags, hard suppression list, sent-job dedup, drop legacy waitlist

-- ─────────────────────────────────────────────────────────────────
-- profiles: email opt-out flags + welcome-sent flag
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_jobs_weekly BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_product_updates BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_tips BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS welcome_jobs_email_sent BOOLEAN NOT NULL DEFAULT false;

-- ─────────────────────────────────────────────────────────────────
-- email_suppressions: hard block list (bounces, complaints, manual)
-- Checked before every non-transactional send.
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_suppressions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL,
  reason     text NOT NULL,
  source     text,
  created_at timestamptz DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_suppressions_email ON email_suppressions(lower(email));

ALTER TABLE email_suppressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_all_email_suppressions"
  ON email_suppressions FOR ALL
  USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────────
-- email_sent_jobs: track which job IDs were sent to which user
-- Enables "fresh every send" dedup across Tue/Wed/Thu digests.
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_sent_jobs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id        text NOT NULL,
  template_name text NOT NULL,
  sent_at       timestamptz DEFAULT NOW(),
  UNIQUE(user_id, job_id, template_name)
);

CREATE INDEX IF NOT EXISTS idx_email_sent_jobs_user_sent ON email_sent_jobs(user_id, sent_at DESC);

ALTER TABLE email_sent_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_all_email_sent_jobs"
  ON email_sent_jobs FOR ALL
  USING (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────────
-- Drop legacy job_waitlist (jobs page is live, no signup flow)
-- ─────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS job_waitlist;
