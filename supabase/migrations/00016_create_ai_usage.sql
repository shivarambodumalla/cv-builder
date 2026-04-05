-- AI usage logging
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address text,
  feature text NOT NULL,
  model text NOT NULL,
  input_tokens int NOT NULL DEFAULT 0,
  output_tokens int NOT NULL DEFAULT 0,
  cost_usd numeric(10,8) NOT NULL DEFAULT 0,
  cost_inr numeric(10,4) NOT NULL DEFAULT 0,
  usd_to_inr_rate numeric(6,2) DEFAULT 83.50,
  status text DEFAULT 'success',
  error text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user ON ai_usage_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_feature ON ai_usage_logs(feature, created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_date ON ai_usage_logs(created_at);

-- Daily aggregation
CREATE TABLE IF NOT EXISTS ai_usage_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  feature text NOT NULL,
  total_calls int DEFAULT 0,
  total_input_tokens int DEFAULT 0,
  total_output_tokens int DEFAULT 0,
  total_cost_usd numeric(10,6) DEFAULT 0,
  total_cost_inr numeric(10,2) DEFAULT 0,
  unique_users int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(date, feature)
);

-- Spend cap + exchange rate on ai_settings
ALTER TABLE ai_settings
ADD COLUMN IF NOT EXISTS daily_spend_cap_usd numeric(8,2) DEFAULT 10.00;

ALTER TABLE ai_settings
ADD COLUMN IF NOT EXISTS usd_to_inr_rate numeric(6,2) DEFAULT 83.50;

-- Global settings row
INSERT INTO ai_settings (feature, max_tokens, temperature, enabled, daily_spend_cap_usd, usd_to_inr_rate)
VALUES ('global', 0, 0, true, 10.00, 83.50)
ON CONFLICT (feature) DO NOTHING;

-- RLS
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_usage_logs" ON ai_usage_logs
  FOR SELECT USING (
    auth.jwt() ->> 'email' = current_setting('app.admin_email', true)
  );

CREATE POLICY "service_insert_usage_logs" ON ai_usage_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "admin_read_usage_daily" ON ai_usage_daily
  FOR SELECT USING (
    auth.jwt() ->> 'email' = current_setting('app.admin_email', true)
  );

CREATE POLICY "service_insert_usage_daily" ON ai_usage_daily
  FOR INSERT WITH CHECK (true);

CREATE POLICY "service_update_usage_daily" ON ai_usage_daily
  FOR UPDATE USING (true);

CREATE POLICY "service_delete_usage_logs" ON ai_usage_logs
  FOR DELETE USING (true);
