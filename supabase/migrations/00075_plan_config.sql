-- Plan limits, template tiering, and billing toggles moved out of code and into
-- the database, so packaging experiments (which templates are Pro, how many ATS
-- scans a free user gets) can be run from /admin/plans without a deploy.
--
-- lib/billing/limits.ts keeps its hardcoded PLAN_LIMITS as a fallback: if these
-- tables are empty or unreachable, gating behaves exactly as it did before.

-- ── Per-plan numeric quotas ──
CREATE TABLE IF NOT EXISTS plan_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan text NOT NULL CHECK (plan IN ('free', 'pro')),
  feature text NOT NULL,
  limit_value int NOT NULL,          -- -1 = unlimited
  label text NOT NULL,
  reset_type text NOT NULL DEFAULT 'window7' CHECK (reset_type IN ('window7', 'weekly', 'total')),
  sort_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plan, feature)
);

-- ── Which templates exist, what tier they sit in, whether they are listed ──
CREATE TABLE IF NOT EXISTS template_catalog (
  slug text PRIMARY KEY,
  label text NOT NULL,
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  enabled boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── Loose key/value for packaging toggles ──
CREATE TABLE IF NOT EXISTS billing_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE plan_limits      ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_settings ENABLE ROW LEVEL SECURITY;

-- Readable by anyone: these are pricing-page facts, not secrets. The editor and
-- the marketing template gallery both need them client-side.
DROP POLICY IF EXISTS "read_plan_limits" ON plan_limits;
CREATE POLICY "read_plan_limits" ON plan_limits FOR SELECT USING (true);

DROP POLICY IF EXISTS "read_template_catalog" ON template_catalog;
CREATE POLICY "read_template_catalog" ON template_catalog FOR SELECT USING (true);

DROP POLICY IF EXISTS "read_billing_settings" ON billing_settings;
CREATE POLICY "read_billing_settings" ON billing_settings FOR SELECT USING (true);

-- Writes are service-role only (admin routes use the service client).
DROP POLICY IF EXISTS "service_write_plan_limits" ON plan_limits;
CREATE POLICY "service_write_plan_limits" ON plan_limits FOR ALL
  TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_write_template_catalog" ON template_catalog;
CREATE POLICY "service_write_template_catalog" ON template_catalog FOR ALL
  TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_write_billing_settings" ON billing_settings;
CREATE POLICY "service_write_billing_settings" ON billing_settings FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_template_catalog_tier ON template_catalog(tier, sort_order);
