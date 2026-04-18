-- Funnel RPC: distinct users who visited specific pages (via user_activity events)

CREATE OR REPLACE FUNCTION funnel_visited_dashboard(from_ts timestamptz, to_ts timestamptz)
RETURNS TABLE(count bigint) LANGUAGE sql STABLE AS $$
  SELECT COUNT(DISTINCT user_id)::bigint FROM user_activity
  WHERE event = 'Opened dashboard'
  AND created_at >= from_ts AND created_at <= to_ts;
$$;

CREATE OR REPLACE FUNCTION funnel_visited_upload(from_ts timestamptz, to_ts timestamptz)
RETURNS TABLE(count bigint) LANGUAGE sql STABLE AS $$
  SELECT COUNT(DISTINCT user_id)::bigint FROM user_activity
  WHERE event = 'Opened upload page'
  AND created_at >= from_ts AND created_at <= to_ts;
$$;

CREATE OR REPLACE FUNCTION funnel_visited_editor(from_ts timestamptz, to_ts timestamptz)
RETURNS TABLE(count bigint) LANGUAGE sql STABLE AS $$
  SELECT COUNT(DISTINCT user_id)::bigint FROM user_activity
  WHERE event = 'Opened CV editor'
  AND created_at >= from_ts AND created_at <= to_ts;
$$;

CREATE OR REPLACE FUNCTION funnel_visited_pricing(from_ts timestamptz, to_ts timestamptz)
RETURNS TABLE(count bigint) LANGUAGE sql STABLE AS $$
  SELECT COUNT(DISTINCT user_id)::bigint FROM user_activity
  WHERE event = 'Opened pricing page'
  AND created_at >= from_ts AND created_at <= to_ts;
$$;

CREATE OR REPLACE FUNCTION funnel_fix_all_used(from_ts timestamptz, to_ts timestamptz)
RETURNS TABLE(count bigint) LANGUAGE sql STABLE AS $$
  SELECT COUNT(DISTINCT user_id)::bigint FROM user_activity
  WHERE event = 'Used Fix All'
  AND created_at >= from_ts AND created_at <= to_ts;
$$;

CREATE OR REPLACE FUNCTION funnel_ai_rewrite_used(from_ts timestamptz, to_ts timestamptz)
RETURNS TABLE(count bigint) LANGUAGE sql STABLE AS $$
  SELECT COUNT(DISTINCT user_id)::bigint FROM user_activity
  WHERE event IN ('Used AI rewrite', 'Accepted AI rewrite')
  AND created_at >= from_ts AND created_at <= to_ts;
$$;
