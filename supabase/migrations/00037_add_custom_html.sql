ALTER TABLE email_templates
ADD COLUMN IF NOT EXISTS custom_html text;

COMMENT ON COLUMN email_templates.custom_html IS 'When set, overrides the base email layout entirely with raw HTML';
