-- AI Product Design Mentorship Program tables

-- Anonymous visitor tracking before lead submission (mirrors visitor_page_views)
CREATE TABLE IF NOT EXISTS mentorship_visitor_views (
  visitor_id uuid NOT NULL,
  path text NOT NULL,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  view_date date NOT NULL DEFAULT CURRENT_DATE,
  PRIMARY KEY (visitor_id, path, view_date)
);

CREATE INDEX IF NOT EXISTS idx_mvv_visitor ON mentorship_visitor_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_mvv_date ON mentorship_visitor_views(view_date);

ALTER TABLE mentorship_visitor_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_all_mentorship_visitor_views" ON mentorship_visitor_views;
CREATE POLICY "service_all_mentorship_visitor_views" ON mentorship_visitor_views FOR ALL USING (true);

-- Lead records for mentorship program
CREATE TABLE IF NOT EXISTS mentorship_leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  country text,
  country_code text,
  experience_level text,
  consent_at timestamptz,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'viewed_curriculum', 'downloaded_curriculum', 'call_booked', 'applied', 'interview', 'enrolled', 'rejected', 'lost')),
  score integer DEFAULT 0,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  device text,
  ip text,
  visitor_id uuid,
  owner_admin_email text,
  tags text[] DEFAULT '{}',
  email_stage integer DEFAULT 0,
  email_stage_at timestamptz,
  whatsapp_stage integer DEFAULT 0,
  whatsapp_stage_at timestamptz,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ml_email ON mentorship_leads(email);
CREATE INDEX IF NOT EXISTS idx_ml_status ON mentorship_leads(status);
CREATE INDEX IF NOT EXISTS idx_ml_created_at ON mentorship_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_ml_owner ON mentorship_leads(owner_admin_email);
CREATE INDEX IF NOT EXISTS idx_ml_score ON mentorship_leads(score DESC);

ALTER TABLE mentorship_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_all_mentorship_leads" ON mentorship_leads;
CREATE POLICY "service_all_mentorship_leads" ON mentorship_leads FOR ALL USING (true);

-- HubSpot-style activity timeline
CREATE TABLE IF NOT EXISTS mentorship_lead_activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL REFERENCES mentorship_leads ON DELETE CASCADE,
  event text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mla_lead_id ON mentorship_lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_mla_created_at ON mentorship_lead_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mla_event ON mentorship_lead_activities(event);

ALTER TABLE mentorship_lead_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_all_mentorship_lead_activities" ON mentorship_lead_activities;
CREATE POLICY "service_all_mentorship_lead_activities" ON mentorship_lead_activities FOR ALL USING (true);

-- Helper: increment mentorship visitor views (mirrors increment_page_view)
CREATE OR REPLACE FUNCTION increment_mentorship_view(
  page_path text,
  view_day date,
  p_visitor_id uuid DEFAULT NULL,
  p_utm_source text DEFAULT NULL,
  p_utm_medium text DEFAULT NULL,
  p_utm_campaign text DEFAULT NULL,
  p_utm_content text DEFAULT NULL,
  p_utm_term text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF p_visitor_id IS NOT NULL THEN
    INSERT INTO mentorship_visitor_views (visitor_id, path, view_date, utm_source, utm_medium, utm_campaign, utm_content, utm_term)
    VALUES (p_visitor_id, page_path, view_day, p_utm_source, p_utm_medium, p_utm_campaign, p_utm_content, p_utm_term)
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;
