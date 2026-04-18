-- Anonymous page view tracking (GDPR-safe: no personal data, just path + daily counts)
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  view_date date NOT NULL DEFAULT CURRENT_DATE,
  count int NOT NULL DEFAULT 1,
  UNIQUE(path, view_date)
);

CREATE INDEX IF NOT EXISTS idx_page_views_date ON page_views(view_date);
CREATE INDEX IF NOT EXISTS idx_page_views_path_date ON page_views(path, view_date);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_all_page_views" ON page_views FOR ALL USING (true);

-- Atomic increment (upsert)
CREATE OR REPLACE FUNCTION increment_page_view(page_path text, view_day date)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO page_views (path, view_date, count)
  VALUES (page_path, view_day, 1)
  ON CONFLICT (path, view_date)
  DO UPDATE SET count = page_views.count + 1;
END;
$$;

-- Funnel RPC: get page view counts for a date range
CREATE OR REPLACE FUNCTION funnel_page_views(from_date date, to_date date, page_path text)
RETURNS TABLE(total bigint) LANGUAGE sql STABLE AS $$
  SELECT COALESCE(SUM(count), 0)::bigint
  FROM page_views
  WHERE path = page_path
  AND view_date >= from_date AND view_date <= to_date;
$$;
