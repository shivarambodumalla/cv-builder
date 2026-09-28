-- The testimonials table from 00046 never reached production, so the admin
-- "Publish" action (feedback → testimonial) failed and the homepage showed a
-- hardcoded list of invented quotes. Create the table without seed rows and
-- remove 00046's invented seed rows wherever that migration did run. Only
-- real, consented testimonials belong here (FTC 16 CFR 465).

CREATE TABLE IF NOT EXISTS testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quote text NOT NULL,
  name text NOT NULL,
  role text NOT NULL,
  company text NOT NULL DEFAULT '',
  gradient text DEFAULT 'from-pink-500 to-yellow-400',
  avatar_bg text DEFAULT 'bg-rose-100',
  sort_order integer DEFAULT 0,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Public read of enabled rows only. Writes go through the service role
-- (admin API), which bypasses RLS. 00046's "service_all_testimonials" policy
-- was FOR ALL USING (true) with no role, letting anyone holding the public
-- anon key insert or edit homepage testimonials, so it is dropped.
DROP POLICY IF EXISTS "service_all_testimonials" ON testimonials;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'testimonials' AND policyname = 'public_read_testimonials') THEN
    CREATE POLICY "public_read_testimonials" ON testimonials FOR SELECT USING (enabled = true);
  END IF;
END $$;

DELETE FROM testimonials
WHERE (name, company) IN (
  ('Priya Sharma', 'Google'),
  ('James Chen', 'Meta'),
  ('Sarah Mitchell', 'Amazon'),
  ('Marcus Johnson', 'Netflix'),
  ('Emily Rodriguez', 'Apple'),
  ('Daniel Kim', 'Stripe'),
  ('Rachel Foster', 'Microsoft'),
  ('Nina Patel', 'Salesforce')
);
