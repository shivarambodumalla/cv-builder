ALTER TABLE email_templates
ADD COLUMN IF NOT EXISTS after_cta_html text;
