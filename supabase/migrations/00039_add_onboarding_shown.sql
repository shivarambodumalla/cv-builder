ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_shown boolean DEFAULT false;
