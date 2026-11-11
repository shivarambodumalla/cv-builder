-- The feedback-request email goes once, the day after a user's FIRST PDF
-- download (app/api/cron/feedback-request). The export route sets this column
-- only when total_pdf_downloads was 0, so it stays NULL for everyone who had
-- already downloaded before this migration and they are never emailed: the
-- email starts with fresh users, with no backlog. Deliberately not backfilled.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_pdf_download_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_profiles_first_pdf_download
  ON profiles(first_pdf_download_at)
  WHERE first_pdf_download_at IS NOT NULL AND feedback_email_sent_at IS NULL;
