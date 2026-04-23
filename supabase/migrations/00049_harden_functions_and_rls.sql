-- Fix Supabase linter warnings:
--   * function_search_path_mutable — pin search_path on funnel/RPC functions so
--     a malicious schema on search_path cannot shadow referenced objects.
--   * rls_policy_always_true — drop redundant USING(true)/WITH CHECK(true)
--     policies that applied to PUBLIC. All flagged tables are written through
--     the admin (service_role) client, which bypasses RLS, so these policies
--     were no-ops that also opened the tables to anon/authenticated if the
--     PostgREST schema exposure ever changed.

-- ─── 1. Pin search_path on RPC functions ───────────────────────────────────
alter function public.funnel_cv_created(timestamptz, timestamptz)      set search_path = public, pg_temp;
alter function public.funnel_ats_scanned(timestamptz, timestamptz)     set search_path = public, pg_temp;
alter function public.funnel_job_matched(timestamptz, timestamptz)     set search_path = public, pg_temp;
alter function public.funnel_cover_letter(timestamptz, timestamptz)    set search_path = public, pg_temp;
alter function public.funnel_pdf_downloaded(timestamptz, timestamptz)  set search_path = public, pg_temp;
alter function public.funnel_interview_prep(timestamptz, timestamptz)  set search_path = public, pg_temp;
alter function public.funnel_visited_dashboard(timestamptz, timestamptz) set search_path = public, pg_temp;
alter function public.funnel_visited_upload(timestamptz, timestamptz)    set search_path = public, pg_temp;
alter function public.funnel_visited_editor(timestamptz, timestamptz)    set search_path = public, pg_temp;
alter function public.funnel_visited_pricing(timestamptz, timestamptz)   set search_path = public, pg_temp;
alter function public.funnel_fix_all_used(timestamptz, timestamptz)      set search_path = public, pg_temp;
alter function public.funnel_ai_rewrite_used(timestamptz, timestamptz)   set search_path = public, pg_temp;
alter function public.increment_page_view(text, date)                    set search_path = public, pg_temp;
alter function public.funnel_page_views(date, date, text)                set search_path = public, pg_temp;

-- ─── 2. Drop redundant "always true" RLS policies ──────────────────────────
-- ai_usage_logs / ai_usage_daily — admin_read_* policies (auth.jwt check)
-- remain in place for admin read access.
drop policy if exists "service_insert_usage_logs"  on public.ai_usage_logs;
drop policy if exists "service_delete_usage_logs"  on public.ai_usage_logs;
drop policy if exists "service_insert_usage_daily" on public.ai_usage_daily;
drop policy if exists "service_update_usage_daily" on public.ai_usage_daily;

-- brand_settings — authenticated_read_brand remains for client reads.
drop policy if exists "service_write_brand" on public.brand_settings;

-- Email system — admin-only tables, access via service_role client.
drop policy if exists "service_all_email_templates" on public.email_templates;
drop policy if exists "service_all_email_logs"      on public.email_logs;
drop policy if exists "service_all_campaigns"       on public.campaigns;

-- job_providers — admin panel only, service_role client.
drop policy if exists "service_all_job_providers" on public.job_providers;

-- missing_roles — written by server (analyse route) via service_role.
drop policy if exists "Anyone can insert missing_roles" on public.missing_roles;
drop policy if exists "Anyone can delete missing_roles" on public.missing_roles;
-- keep "Anyone can read missing_roles" (SELECT-only, intentionally permissive).

-- page_views — written via increment_page_view RPC from admin client.
drop policy if exists "service_all_page_views" on public.page_views;

-- prompt_versions — admin panel only.
drop policy if exists "Admin can insert prompt_versions" on public.prompt_versions;

-- stories / story_sources — user access covered by "Users own *" policies.
drop policy if exists "Service role stories"       on public.stories;
drop policy if exists "Service role story_sources" on public.story_sources;

-- subscription_history — written by Lemon Squeezy webhook via service_role.
drop policy if exists "service_write_history"  on public.subscription_history;
drop policy if exists "service_update_history" on public.subscription_history;

-- test_cases — admin panel only.
drop policy if exists "Admin all test_cases" on public.test_cases;
