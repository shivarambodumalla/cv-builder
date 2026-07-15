-- Mentorship telemetry v2: visitor geo + CTA click tracking

-- Geo columns on visitor views (from Vercel x-vercel-ip-* headers)
ALTER TABLE mentorship_visitor_views
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS city text;

-- CTA click events (one row per click, unlike views which dedup per day)
CREATE TABLE IF NOT EXISTS mentorship_cta_clicks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id uuid,
  cta text NOT NULL,
  path text,
  country_code text,
  city text,
  created_at timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mcc_created_at ON mentorship_cta_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_mcc_cta ON mentorship_cta_clicks(cta);

ALTER TABLE mentorship_cta_clicks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_all_mentorship_cta_clicks" ON mentorship_cta_clicks;
CREATE POLICY "service_all_mentorship_cta_clicks" ON mentorship_cta_clicks FOR ALL USING (true);

-- increment_mentorship_view() is superseded by a direct upsert in the telemetry
-- route; kept so the previously deployed code keeps working until the next deploy.
