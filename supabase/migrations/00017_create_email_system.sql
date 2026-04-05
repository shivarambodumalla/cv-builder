-- Brand settings
CREATE TABLE IF NOT EXISTS brand_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_color text DEFAULT '#0D9488',
  logo_text text DEFAULT 'CVEdge',
  support_email text DEFAULT 'hello@thecvedge.com',
  app_url text DEFAULT 'https://www.thecvedge.com',
  updated_at timestamptz DEFAULT now()
);

INSERT INTO brand_settings (primary_color, logo_text, support_email, app_url)
VALUES ('#0D9488', 'CVEdge', 'hello@thecvedge.com', 'https://www.thecvedge.com')
ON CONFLICT DO NOTHING;

-- Email templates
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  subject text NOT NULL,
  heading text NOT NULL,
  subheading text NOT NULL,
  cta_text text,
  cta_url text,
  body_html text,
  enabled bool DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Seed 9 default templates
INSERT INTO email_templates (name, subject, heading, subheading, cta_text, cta_url) VALUES
('confirm_signup', 'Confirm your CVEdge account', 'Confirm your email.', 'Click below to activate your account and start optimising your CV.', 'Confirm email', '{{confirmUrl}}'),
('welcome', 'Welcome to CVEdge', 'Your CV journey starts now.', 'Upload your CV and get your ATS score in under 3 minutes.', 'Upload my CV', '{{appUrl}}/upload-resume'),
('password_reset', 'Reset your CVEdge password', 'Reset your password.', 'Click below to set a new password. This link expires in 1 hour.', 'Reset password', '{{resetUrl}}'),
('ats_report_ready', 'Your ATS score is ready — {{score}}%', 'Your ATS score: {{score}}%', '{{issueCount}} issues found. Fix them to improve your chances of getting shortlisted.', 'View my report', '{{appUrl}}/resume/{{cvId}}'),
('job_match_ready', 'Your job match score: {{matchScore}}%', 'You match {{matchScore}}% of this role.', 'See exactly what keywords you are missing and how to close the gap.', 'View match report', '{{appUrl}}/resume/{{cvId}}'),
('cover_letter_ready', 'Your cover letter is ready', 'Your cover letter is ready.', 'Review, edit and download your personalised cover letter for {{jobTitle}} at {{company}}.', 'View cover letter', '{{appUrl}}/resume/{{cvId}}'),
('upgrade_prompt', 'You have used all your free scans', 'Ready to go deeper?', 'You have used all 3 free ATS scans. Upgrade to get unlimited scans, job matching and cover letters.', 'Upgrade for $12/month', '{{appUrl}}/pricing'),
('reactivation', 'Your CV is still waiting', 'Your CV score is waiting.', 'You signed up {{daysAgo}} days ago but have not uploaded your CV yet. It takes less than 3 minutes.', 'Upload my CV now', '{{appUrl}}/upload-resume'),
('inactive_user', 'You have not used CVEdge in a while', 'Come back and land that role.', 'Your CV could be stronger. Run a fresh ATS analysis and see what has changed.', 'Analyse my CV', '{{appUrl}}/dashboard')
ON CONFLICT (name) DO NOTHING;

-- Email logs
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  template_name text,
  to_email text,
  subject text,
  status text DEFAULT 'sent',
  error text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_date ON email_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_template ON email_logs(template_name, created_at);

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  template_name text NOT NULL,
  segment text NOT NULL,
  status text DEFAULT 'draft',
  sent_count int DEFAULT 0,
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Profile columns for email tracking
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS reactivation_email_sent timestamptz;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS upgrade_email_sent bool DEFAULT false;

-- RLS
ALTER TABLE brand_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_brand" ON brand_settings FOR SELECT USING (true);
CREATE POLICY "service_write_brand" ON brand_settings FOR ALL USING (true);
CREATE POLICY "service_all_email_templates" ON email_templates FOR ALL USING (true);
CREATE POLICY "service_all_email_logs" ON email_logs FOR ALL USING (true);
CREATE POLICY "service_all_campaigns" ON campaigns FOR ALL USING (true);
