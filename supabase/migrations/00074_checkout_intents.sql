-- Pay-button click tracking: intent to pay, and whether it converted.
--
-- Previously the only record of a purchase attempt lived in Lemon Squeezy, so
-- a click that never became a payment — or a payment that never activated —
-- was invisible. This records the click at the moment the checkout is created
-- server-side, which is both ad-blocker proof and impossible to fake from the
-- client.
--
-- No FK to auth.users on purpose: like account_deletions, the row must outlive
-- the account so a deleted user's funnel history is not silently rewritten.

CREATE TABLE IF NOT EXISTS checkout_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text,
  period text NOT NULL,
  variant_id text,
  checkout_url text,
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Set when payment is confirmed (webhook, success redirect, or reconciliation).
  converted_at timestamptz,
  order_id text,
  subscription_id text
);

CREATE INDEX IF NOT EXISTS idx_checkout_intents_user ON checkout_intents(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkout_intents_created ON checkout_intents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkout_intents_unconverted
  ON checkout_intents(created_at DESC) WHERE converted_at IS NULL;

ALTER TABLE checkout_intents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_all_checkout_intents" ON checkout_intents FOR ALL USING (true);

-- ── Funnel RPCs (same signature as the existing funnel_* family) ──

CREATE OR REPLACE FUNCTION funnel_clicked_pay(from_ts timestamptz, to_ts timestamptz)
RETURNS TABLE(count bigint) LANGUAGE sql STABLE AS $$
  SELECT COUNT(DISTINCT user_id)::bigint FROM checkout_intents
  WHERE created_at >= from_ts AND created_at <= to_ts;
$$;

CREATE OR REPLACE FUNCTION funnel_paid(from_ts timestamptz, to_ts timestamptz)
RETURNS TABLE(count bigint) LANGUAGE sql STABLE AS $$
  SELECT COUNT(DISTINCT user_id)::bigint FROM checkout_intents
  WHERE converted_at IS NOT NULL
  AND created_at >= from_ts AND created_at <= to_ts;
$$;

-- Who clicked pay, and whether it converted — the actionable list.
-- One row per user (aggregated across their attempts), newest first.
CREATE OR REPLACE FUNCTION funnel_pay_clickers(from_ts timestamptz, to_ts timestamptz)
RETURNS TABLE(
  user_id uuid,
  email text,
  period text,
  attempts bigint,
  first_clicked_at timestamptz,
  last_clicked_at timestamptz,
  converted_at timestamptz
) LANGUAGE sql STABLE AS $$
  SELECT
    ci.user_id,
    (array_agg(ci.email  ORDER BY ci.created_at DESC))[1] AS email,
    (array_agg(ci.period ORDER BY ci.created_at DESC))[1] AS period,
    COUNT(*)::bigint      AS attempts,
    MIN(ci.created_at)    AS first_clicked_at,
    MAX(ci.created_at)    AS last_clicked_at,
    MAX(ci.converted_at)  AS converted_at
  FROM checkout_intents ci
  WHERE ci.created_at >= from_ts AND ci.created_at <= to_ts
  GROUP BY ci.user_id
  ORDER BY MAX(ci.created_at) DESC;
$$;
