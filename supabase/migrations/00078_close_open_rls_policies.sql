-- Close RLS policies that let the public anon key read and write tables.
--
-- Several migrations added "service role" policies written as
-- `FOR ALL USING (true)` with no TO clause. A policy without a role applies to
-- every role, including `anon`, whose key ships in the site's JavaScript, so
-- anyone could read and write these tables through the REST API (confirmed
-- 2026-09-28 on checkout_intents, account_deletions, cv_review_*,
-- mentorship_*, visitor_page_views). The service role bypasses RLS, so these
-- policies were never needed for server code: every query on these tables
-- goes through createAdminClient().
--
-- Also removed: public SELECT on internal tables (AI prompt versions, E2E test
-- runs, missing-role requests), and user write access to CV-review rows,
-- which let an owner raise their own edit_rounds_limit or change status. All
-- user-facing CV-review writes go through the admin API; owners keep read.
--
-- Each statement is guarded because not every table exists in every
-- environment (guarantee_claims, for one, is absent in production).

DO $$
DECLARE
  p record;
BEGIN
  FOR p IN
    SELECT * FROM (VALUES
      ('account_deletions',          'service_all_account_deletions'),
      ('blog_link_clicks',           'service_all_blog_link_clicks'),
      ('checkout_intents',           'service_all_checkout_intents'),
      ('cv_reviews',                 'admin_all_reviews'),
      ('cv_review_files',            'admin_all_review_files'),
      ('cv_review_messages',         'admin_all_messages'),
      ('cv_review_suggestions',      'admin_all_suggestions'),
      ('cv_review_notifications',    'admin_all_notifications'),
      ('guarantee_claims',           'Service role claims'),
      ('mentorship_cta_clicks',      'service_all_mentorship_cta_clicks'),
      ('mentorship_leads',           'service_all_mentorship_leads'),
      ('mentorship_lead_activities', 'service_all_mentorship_lead_activities'),
      ('mentorship_visitor_views',   'service_all_mentorship_visitor_views'),
      ('visitor_page_views',         'service_all_visitor_page_views'),
      ('prompt_versions',            'Admin can read prompt_versions'),
      ('test_runs',                  'Admin read test_runs'),
      ('test_results',               'Admin read test_results'),
      ('missing_roles',              'Anyone can read missing_roles')
    ) AS t(tbl, pol)
  LOOP
    IF to_regclass('public.' || p.tbl) IS NOT NULL THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.pol, p.tbl);
    END IF;
  END LOOP;

  -- CV-review owners: read their own rows only (was FOR ALL).
  IF to_regclass('public.cv_reviews') IS NOT NULL THEN
    DROP POLICY IF EXISTS "user_own_reviews" ON public.cv_reviews;
    CREATE POLICY "user_own_reviews" ON public.cv_reviews
      FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF to_regclass('public.cv_review_files') IS NOT NULL THEN
    DROP POLICY IF EXISTS "user_own_review_files" ON public.cv_review_files;
    CREATE POLICY "user_own_review_files" ON public.cv_review_files
      FOR SELECT TO authenticated
      USING (review_id IN (SELECT id FROM public.cv_reviews WHERE user_id = auth.uid()));
  END IF;
  IF to_regclass('public.cv_review_messages') IS NOT NULL THEN
    DROP POLICY IF EXISTS "user_own_messages" ON public.cv_review_messages;
    CREATE POLICY "user_own_messages" ON public.cv_review_messages
      FOR SELECT TO authenticated
      USING (review_id IN (SELECT id FROM public.cv_reviews WHERE user_id = auth.uid()));
  END IF;
  IF to_regclass('public.cv_review_notifications') IS NOT NULL THEN
    DROP POLICY IF EXISTS "user_own_notifications" ON public.cv_review_notifications;
    CREATE POLICY "user_own_notifications" ON public.cv_review_notifications
      FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;
