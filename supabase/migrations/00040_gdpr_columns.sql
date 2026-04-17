-- GDPR compliance columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cookie_consent_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deletion_requested_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deletion_completed_at timestamptz;
