-- Aggregates for the admin Home dashboard. Counting happens here so a 1-year
-- range costs one round trip instead of paging raw rows into Node. Days are
-- UTC. Every function takes p_exclude (test and admin accounts) and is
-- callable only by the service role.
--
-- /popup/* paths in page_views are popup telemetry, not page views, so they
-- are left out of traffic.

CREATE INDEX IF NOT EXISTS idx_user_activity_event_created ON user_activity(event, created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_subscription_history_started ON subscription_history(started_at);
CREATE INDEX IF NOT EXISTS idx_vpv_date_path ON visitor_page_views(view_date, path);

-- UTC bounds of a day range as timestamptz.
CREATE OR REPLACE FUNCTION public.admin_day_start(p_day date)
RETURNS timestamptz LANGUAGE sql IMMUTABLE AS $$
  SELECT p_day::timestamp AT TIME ZONE 'UTC';
$$;

-- Page views and unique visitors per day.
CREATE OR REPLACE FUNCTION public.admin_traffic_daily(p_from date, p_to date)
RETURNS TABLE(day date, page_views bigint, visitors bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH days AS (SELECT gs::date AS day FROM generate_series(p_from, p_to, interval '1 day') gs),
  pv AS (
    SELECT view_date, SUM(count)::bigint AS views FROM page_views
    WHERE view_date BETWEEN p_from AND p_to AND path NOT LIKE '/popup/%'
    GROUP BY view_date
  ),
  vv AS (
    SELECT view_date, COUNT(DISTINCT visitor_id)::bigint AS visitors FROM visitor_page_views
    WHERE view_date BETWEEN p_from AND p_to AND path NOT LIKE '/popup/%'
    GROUP BY view_date
  )
  SELECT d.day, COALESCE(pv.views, 0), COALESCE(vv.visitors, 0)
  FROM days d LEFT JOIN pv ON pv.view_date = d.day LEFT JOIN vv ON vv.view_date = d.day
  ORDER BY d.day;
$$;

-- Range totals (unique visitors across the whole range, not a sum of days).
CREATE OR REPLACE FUNCTION public.admin_traffic_totals(p_from date, p_to date)
RETURNS TABLE(page_views bigint, visitors bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    (SELECT COALESCE(SUM(count), 0)::bigint FROM page_views
      WHERE view_date BETWEEN p_from AND p_to AND path NOT LIKE '/popup/%'),
    (SELECT COUNT(DISTINCT visitor_id)::bigint FROM visitor_page_views
      WHERE view_date BETWEEN p_from AND p_to AND path NOT LIKE '/popup/%');
$$;

CREATE OR REPLACE FUNCTION public.admin_top_pages(p_from date, p_to date, p_limit int DEFAULT 5)
RETURNS TABLE(path text, page_views bigint, visitors bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH top AS (
    SELECT pv.path, SUM(pv.count)::bigint AS views FROM page_views pv
    WHERE pv.view_date BETWEEN p_from AND p_to AND pv.path NOT LIKE '/popup/%'
    GROUP BY pv.path ORDER BY 2 DESC LIMIT p_limit
  )
  SELECT t.path, t.views,
    (SELECT COUNT(DISTINCT v.visitor_id)::bigint FROM visitor_page_views v
      WHERE v.path = t.path AND v.view_date BETWEEN p_from AND p_to)
  FROM top t ORDER BY t.views DESC;
$$;

CREATE OR REPLACE FUNCTION public.admin_signups_daily(p_from date, p_to date, p_exclude uuid[] DEFAULT '{}')
RETURNS TABLE(day date, signups bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH days AS (SELECT gs::date AS day FROM generate_series(p_from, p_to, interval '1 day') gs),
  s AS (
    SELECT (p.created_at AT TIME ZONE 'UTC')::date AS day, COUNT(*)::bigint AS n FROM profiles p
    WHERE p.created_at >= admin_day_start(p_from) AND p.created_at < admin_day_start(p_to + 1)
      AND NOT (p.id = ANY(p_exclude))
    GROUP BY 1
  )
  SELECT d.day, COALESCE(s.n, 0) FROM days d LEFT JOIN s ON s.day = d.day ORDER BY d.day;
$$;

-- Distinct users and event count per day for the given events.
CREATE OR REPLACE FUNCTION public.admin_events_daily(p_from date, p_to date, p_events text[], p_exclude uuid[] DEFAULT '{}')
RETURNS TABLE(day date, event text, users bigint, events bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (a.created_at AT TIME ZONE 'UTC')::date, a.event, COUNT(DISTINCT a.user_id)::bigint, COUNT(*)::bigint
  FROM user_activity a
  WHERE a.event = ANY(p_events)
    AND a.created_at >= admin_day_start(p_from) AND a.created_at < admin_day_start(p_to + 1)
    AND (a.user_id IS NULL OR NOT (a.user_id = ANY(p_exclude)))
  GROUP BY 1, 2;
$$;

-- Distinct users across the whole range per event (funnel steps).
CREATE OR REPLACE FUNCTION public.admin_event_users(p_from date, p_to date, p_events text[], p_exclude uuid[] DEFAULT '{}')
RETURNS TABLE(event text, users bigint, events bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a.event, COUNT(DISTINCT a.user_id)::bigint, COUNT(*)::bigint
  FROM user_activity a
  WHERE a.event = ANY(p_events)
    AND a.created_at >= admin_day_start(p_from) AND a.created_at < admin_day_start(p_to + 1)
    AND (a.user_id IS NULL OR NOT (a.user_id = ANY(p_exclude)))
  GROUP BY a.event;
$$;

-- Distinct users who did ANY of the events in the range (e.g. "hit paywall").
CREATE OR REPLACE FUNCTION public.admin_any_event_users(p_from date, p_to date, p_events text[], p_exclude uuid[] DEFAULT '{}')
RETURNS bigint
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COUNT(DISTINCT a.user_id)::bigint FROM user_activity a
  WHERE a.event = ANY(p_events)
    AND a.created_at >= admin_day_start(p_from) AND a.created_at < admin_day_start(p_to + 1)
    AND a.user_id IS NOT NULL AND NOT (a.user_id = ANY(p_exclude));
$$;

-- Money per day. First payments are de-duplicated per subscription (the
-- success page and the webhook can both record one); CV review refunds are
-- not subscription money.
CREATE OR REPLACE FUNCTION public.admin_payments_daily(p_from date, p_to date, p_exclude uuid[] DEFAULT '{}')
RETURNS TABLE(day date, new_payments bigint, new_revenue numeric, renewals bigint, renewal_revenue numeric, refunds bigint, refund_amount numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH days AS (SELECT gs::date AS day FROM generate_series(p_from, p_to, interval '1 day') gs),
  scoped AS (
    SELECT h.* FROM subscription_history h
    WHERE h.started_at >= admin_day_start(p_from) AND h.started_at < admin_day_start(p_to + 1)
      AND NOT (h.user_id = ANY(p_exclude)) AND COALESCE(h.plan, '') <> 'cv_review'
  ),
  firsts AS (
    SELECT DISTINCT ON (COALESCE(subscription_id, user_id::text || ':' || (started_at AT TIME ZONE 'UTC')::date))
      (started_at AT TIME ZONE 'UTC')::date AS day, amount
    FROM scoped WHERE status = 'active' AND amount > 0
    ORDER BY COALESCE(subscription_id, user_id::text || ':' || (started_at AT TIME ZONE 'UTC')::date), started_at
  ),
  f AS (SELECT day, COUNT(*)::bigint n, SUM(amount) amt FROM firsts GROUP BY day),
  r AS (SELECT (started_at AT TIME ZONE 'UTC')::date day, COUNT(*)::bigint n, SUM(amount) amt FROM scoped WHERE status = 'renewal' GROUP BY 1),
  x AS (SELECT (started_at AT TIME ZONE 'UTC')::date day, COUNT(*)::bigint n, SUM(amount) amt FROM scoped WHERE status = 'refunded' GROUP BY 1)
  SELECT d.day,
    COALESCE(f.n, 0), COALESCE(f.amt, 0),
    COALESCE(r.n, 0), COALESCE(r.amt, 0),
    COALESCE(x.n, 0), COALESCE(x.amt, 0)
  FROM days d LEFT JOIN f ON f.day = d.day LEFT JOIN r ON r.day = d.day LEFT JOIN x ON x.day = d.day
  ORDER BY d.day;
$$;

-- AI cost per day: live logs where they exist, the daily rollup after the
-- 90-day log retention has removed them.
CREATE OR REPLACE FUNCTION public.admin_ai_cost_daily(p_from date, p_to date)
RETURNS TABLE(day date, cost_usd numeric, calls bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH days AS (SELECT gs::date AS day FROM generate_series(p_from, p_to, interval '1 day') gs),
  logs AS (
    SELECT (created_at AT TIME ZONE 'UTC')::date day, SUM(cost_usd) cost, COUNT(*)::bigint calls FROM ai_usage_logs
    WHERE created_at >= admin_day_start(p_from) AND created_at < admin_day_start(p_to + 1)
    GROUP BY 1
  ),
  rollup AS (
    SELECT date AS day, SUM(total_cost_usd) cost, SUM(total_calls)::bigint calls FROM ai_usage_daily
    WHERE date BETWEEN p_from AND p_to GROUP BY date
  )
  SELECT d.day, COALESCE(l.cost, r.cost, 0), COALESCE(l.calls, r.calls, 0)
  FROM days d LEFT JOIN logs l ON l.day = d.day LEFT JOIN rollup r ON r.day = d.day
  ORDER BY d.day;
$$;

-- Most engaged users in the range, ranked by p_order: 'actions' (tracked
-- events), 'time' (time on pages) or 'ai_cost'.
CREATE OR REPLACE FUNCTION public.admin_top_users(
  p_from date, p_to date, p_exclude uuid[] DEFAULT '{}', p_order text DEFAULT 'actions', p_limit int DEFAULT 5
)
RETURNS TABLE(user_id uuid, user_number bigint, full_name text, email text, plan text, country_code text,
              actions bigint, time_ms bigint, ai_cost numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH act AS (
    SELECT a.user_id, COUNT(*)::bigint n FROM user_activity a
    WHERE a.created_at >= admin_day_start(p_from) AND a.created_at < admin_day_start(p_to + 1)
      AND a.user_id IS NOT NULL AND a.event NOT LIKE 'Pre-login:%' AND a.event NOT LIKE 'popover_%' AND a.event <> 'page_view'
    GROUP BY a.user_id
  ),
  tm AS (
    SELECT s.user_id, SUM(s.duration_ms)::bigint t FROM page_sessions s
    WHERE s.created_at >= admin_day_start(p_from) AND s.created_at < admin_day_start(p_to + 1)
    GROUP BY s.user_id
  ),
  ai AS (
    SELECT l.user_id, SUM(l.cost_usd) c FROM ai_usage_logs l
    WHERE l.created_at >= admin_day_start(p_from) AND l.created_at < admin_day_start(p_to + 1) AND l.user_id IS NOT NULL
    GROUP BY l.user_id
  ),
  ids AS (SELECT user_id FROM act UNION SELECT user_id FROM tm UNION SELECT user_id FROM ai)
  SELECT p.id, p.user_number, p.full_name, p.email, p.plan, p.signup_country_code,
    COALESCE(act.n, 0), COALESCE(tm.t, 0), COALESCE(ai.c, 0)
  FROM ids
  JOIN profiles p ON p.id = ids.user_id
  LEFT JOIN act ON act.user_id = ids.user_id
  LEFT JOIN tm ON tm.user_id = ids.user_id
  LEFT JOIN ai ON ai.user_id = ids.user_id
  WHERE NOT (p.id = ANY(p_exclude))
  ORDER BY
    CASE p_order WHEN 'time' THEN COALESCE(tm.t, 0)::numeric
                 WHEN 'ai_cost' THEN COALESCE(ai.c, 0)
                 ELSE COALESCE(act.n, 0)::numeric END DESC,
    COALESCE(act.n, 0) DESC
  LIMIT p_limit;
$$;

-- Who signed up in the range, split by country, channel, plan, estimated age
-- and years of experience.
CREATE OR REPLACE FUNCTION public.admin_signup_breakdown(p_from date, p_to date, p_exclude uuid[] DEFAULT '{}')
RETURNS TABLE(dimension text, bucket text, users bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH s AS (
    SELECT p.*, EXTRACT(YEAR FROM NOW())::int - p.estimated_birth_year AS age FROM profiles p
    WHERE p.created_at >= admin_day_start(p_from) AND p.created_at < admin_day_start(p_to + 1)
      AND NOT (p.id = ANY(p_exclude))
  )
  SELECT 'country', COALESCE(NULLIF(signup_country_code, ''), 'unknown'), COUNT(*)::bigint FROM s GROUP BY 2
  UNION ALL
  SELECT 'channel', COALESCE(acquisition_channel, 'unknown'), COUNT(*)::bigint FROM s GROUP BY 2
  UNION ALL
  SELECT 'plan', COALESCE(plan, 'free'), COUNT(*)::bigint FROM s GROUP BY 2
  UNION ALL
  SELECT 'age',
    CASE WHEN age IS NULL THEN 'unknown' WHEN age < 25 THEN '18–24' WHEN age < 35 THEN '25–34'
         WHEN age < 45 THEN '35–44' ELSE '45+' END,
    COUNT(*)::bigint FROM s GROUP BY 2
  UNION ALL
  SELECT 'experience',
    CASE WHEN years_experience IS NULL THEN 'unknown' WHEN years_experience < 2 THEN '0–2 yrs'
         WHEN years_experience < 5 THEN '2–5 yrs' WHEN years_experience < 10 THEN '5–10 yrs' ELSE '10+ yrs' END,
    COUNT(*)::bigint FROM s GROUP BY 2;
$$;

DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'admin_traffic_daily', 'admin_traffic_totals', 'admin_top_pages', 'admin_signups_daily',
    'admin_events_daily', 'admin_event_users', 'admin_any_event_users', 'admin_payments_daily',
    'admin_ai_cost_daily', 'admin_top_users', 'admin_signup_breakdown'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%I FROM PUBLIC, anon, authenticated', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I TO service_role', fn);
  END LOOP;
END $$;
