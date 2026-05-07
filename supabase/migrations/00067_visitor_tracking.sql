-- Anonymous unique visitor tracking via localStorage UUID
-- GDPR-safe: UUID is client-generated, never linked to user identity

CREATE TABLE IF NOT EXISTS visitor_page_views (
  visitor_id uuid NOT NULL,
  path text NOT NULL,
  view_date date NOT NULL DEFAULT CURRENT_DATE,
  PRIMARY KEY (visitor_id, path, view_date)
);

CREATE INDEX IF NOT EXISTS idx_vpv_date ON visitor_page_views(view_date);
CREATE INDEX IF NOT EXISTS idx_vpv_visitor ON visitor_page_views(visitor_id);

ALTER TABLE visitor_page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_all_visitor_page_views" ON visitor_page_views FOR ALL USING (true);

-- Replace 2-param function with 3-param version (optional visitor_id)
DROP FUNCTION IF EXISTS increment_page_view(text, date);

CREATE OR REPLACE FUNCTION increment_page_view(
  page_path text,
  view_day date,
  p_visitor_id uuid DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  -- Always increment aggregate hit counter
  INSERT INTO page_views (path, view_date, count)
  VALUES (page_path, view_day, 1)
  ON CONFLICT (path, view_date)
  DO UPDATE SET count = page_views.count + 1;

  -- Record unique visitor (idempotent — one row per visitor per path per day)
  IF p_visitor_id IS NOT NULL THEN
    INSERT INTO visitor_page_views (visitor_id, path, view_date)
    VALUES (p_visitor_id, page_path, view_day)
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

-- Count distinct visitors across all tracked paths in a date range
-- page_path = NULL means across all paths (global unique visitors)
CREATE OR REPLACE FUNCTION funnel_unique_visitors(
  from_date date,
  to_date date,
  page_path text DEFAULT NULL
)
RETURNS TABLE(unique_visitors bigint) LANGUAGE sql STABLE AS $$
  SELECT COUNT(DISTINCT visitor_id)::bigint
  FROM visitor_page_views
  WHERE view_date >= from_date
    AND view_date <= to_date
    AND (page_path IS NULL OR path = page_path);
$$;
