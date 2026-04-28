-- Blog link click tracking
-- Aggregated by (post_slug, link_url, click_date) — GDPR-safe, no personal data

CREATE TABLE IF NOT EXISTS blog_link_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug text NOT NULL,
  link_url text NOT NULL,
  link_text text,
  click_date date NOT NULL DEFAULT CURRENT_DATE,
  count int NOT NULL DEFAULT 1,
  UNIQUE(post_slug, link_url, click_date)
);

CREATE INDEX IF NOT EXISTS idx_blog_link_clicks_slug ON blog_link_clicks(post_slug);
CREATE INDEX IF NOT EXISTS idx_blog_link_clicks_date ON blog_link_clicks(click_date);

ALTER TABLE blog_link_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_all_blog_link_clicks" ON blog_link_clicks FOR ALL USING (true);

-- Atomic upsert for link clicks
CREATE OR REPLACE FUNCTION increment_blog_link_click(
  p_post_slug text,
  p_link_url text,
  p_link_text text,
  p_click_day date
)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO blog_link_clicks (post_slug, link_url, link_text, click_date, count)
  VALUES (p_post_slug, p_link_url, p_link_text, p_click_day, 1)
  ON CONFLICT (post_slug, link_url, click_date)
  DO UPDATE SET count = blog_link_clicks.count + 1;
END;
$$;
