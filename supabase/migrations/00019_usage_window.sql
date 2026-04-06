-- 7-day rolling window for free tier usage
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS usage_window_start timestamptz DEFAULT now();

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS ats_scans_this_window int DEFAULT 0;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS job_matches_this_window int DEFAULT 0;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS cover_letters_this_window int DEFAULT 0;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS ai_rewrites_this_window int DEFAULT 0;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS pdf_downloads_this_window int DEFAULT 0;
