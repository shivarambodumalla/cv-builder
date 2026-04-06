-- Pricing config table
CREATE TABLE IF NOT EXISTS pricing_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan text NOT NULL,
  period text NOT NULL,
  original_price numeric(8,2) NOT NULL,
  sale_price numeric(8,2) NOT NULL,
  currency text DEFAULT 'USD',
  lemon_squeezy_variant_id text,
  enabled bool DEFAULT true,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(plan, period)
);

ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_pricing" ON pricing_config
  FOR SELECT USING (true);

CREATE POLICY "admin_write_pricing" ON pricing_config
  FOR ALL USING (
    auth.jwt() ->> 'email' = current_setting('app.admin_email', true)
  );

-- Default pricing
INSERT INTO pricing_config (plan, period, original_price, sale_price, currency, enabled)
VALUES
  ('free', 'forever', 0, 0, 'USD', true),
  ('pro', 'weekly', 10, 5, 'USD', true),
  ('pro', 'monthly', 35, 14, 'USD', true),
  ('pro', 'yearly', 420, 120, 'USD', true)
ON CONFLICT (plan, period) DO NOTHING;

-- Profile billing columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_period text DEFAULT null;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_id text DEFAULT null;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_period_end timestamptz DEFAULT null;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pdf_downloads_this_week int DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pdf_downloads_week_reset date DEFAULT CURRENT_DATE;

-- Usage counters
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ats_scans_this_month int DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS job_matches_this_month int DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_letters_this_month int DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_rewrites_this_month int DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS usage_reset_date date DEFAULT CURRENT_DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC';

-- Subscription history
CREATE TABLE IF NOT EXISTS subscription_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan text NOT NULL,
  period text NOT NULL,
  amount numeric(8,2) NOT NULL,
  currency text DEFAULT 'USD',
  status text NOT NULL, -- 'active' | 'cancelled' | 'expired' | 'mock'
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz DEFAULT null,
  subscription_id text
);

ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_history" ON subscription_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "service_write_history" ON subscription_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "service_update_history" ON subscription_history
  FOR UPDATE USING (true);

-- Increment usage counter function
CREATE OR REPLACE FUNCTION public.increment_usage(user_id uuid, column_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  EXECUTE format(
    'UPDATE public.profiles SET %I = COALESCE(%I, 0) + 1 WHERE id = $1',
    column_name, column_name
  ) USING user_id;
END;
$$;
