-- Fix Supabase linter warnings on user_profile_enriched:
--   * auth_users_exposed: view joins auth.users and was exposed to anon/authenticated via PostgREST
--   * security_definer_view: view ran with creator's privileges, bypassing RLS
-- Only the admin panel reads this view, via the service_role client, so PostgREST access
-- for anon/authenticated is unnecessary. Recreate with security_invoker=true and restrict grants.
drop view if exists public.user_profile_enriched;

create view public.user_profile_enriched
with (security_invoker = true) as
with latest_cv as (
  select distinct on (user_id)
    user_id,
    id as cv_id,
    title as cv_title,
    target_role as cv_target_role,
    parsed_json,
    updated_at as cv_updated_at
  from cvs
  order by user_id, updated_at desc
),
current_exp as (
  select distinct on (c.user_id)
    c.user_id,
    exp->>'role' as current_role,
    exp->>'company' as current_company
  from cvs c,
       jsonb_array_elements(coalesce(c.parsed_json->'experience'->'items', '[]'::jsonb)) as exp
  where (exp->>'isCurrent')::boolean = true
  order by c.user_id, c.updated_at desc
),
latest_edu as (
  select distinct on (c.user_id)
    c.user_id,
    edu->>'institution' as institution,
    edu->>'degree' as degree,
    edu->>'field' as field
  from cvs c,
       jsonb_array_elements(coalesce(c.parsed_json->'education'->'items', '[]'::jsonb)) as edu
  order by c.user_id, c.updated_at desc
),
cv_counts as (
  select user_id, count(*)::int as total_cvs from cvs group by user_id
)
select
  p.id,
  p.email,
  p.full_name,
  p.avatar_url,
  p.created_at as joined_at,
  u.last_sign_in_at,
  p.plan,
  p.subscription_status,
  p.subscription_period,
  p.current_period_end,
  p.signup_city,
  p.signup_region,
  p.signup_country,
  p.signup_country_code,
  p.signup_ip,
  p.signup_location_captured_at,
  p.target_role as profile_target_role,
  p.location as profile_location,
  p.linkedin_url,
  p.github_url,
  p.portfolio_url,
  p.employment_status,
  p.preferred_job_type,
  p.experience_level,
  p.industry,
  p.country,
  p.last_seen_at,
  lc.cv_id as latest_cv_id,
  lc.cv_title as latest_cv_title,
  coalesce(p.target_role, lc.cv_target_role) as resolved_target_role,
  lc.parsed_json->'contact'->>'name' as cv_name,
  lc.parsed_json->'contact'->>'location' as cv_location,
  lc.parsed_json->'contact'->>'linkedin' as cv_linkedin,
  lc.parsed_json->'contact'->>'website' as cv_website,
  coalesce(p.location, lc.parsed_json->'contact'->>'location') as resolved_location,
  coalesce(p.linkedin_url, lc.parsed_json->'contact'->>'linkedin') as resolved_linkedin,
  coalesce(p.portfolio_url, lc.parsed_json->'contact'->>'website') as resolved_portfolio,
  lc.parsed_json->'contact'->>'phone' as phone,
  lc.parsed_json->'targetTitle'->>'title' as target_title_from_cv,
  ce.current_role,
  ce.current_company,
  le.institution as college,
  le.degree,
  le.field as field_of_study,
  coalesce(cc.total_cvs, 0) as total_cvs,
  p.ats_scans_this_window,
  p.job_matches_this_window,
  p.cover_letters_this_window,
  p.ai_rewrites_this_window,
  p.pdf_downloads_this_window,
  p.total_pdf_downloads,
  p.usage_window_start
from profiles p
left join auth.users u on u.id = p.id
left join latest_cv lc on lc.user_id = p.id
left join current_exp ce on ce.user_id = p.id
left join latest_edu le on le.user_id = p.id
left join cv_counts cc on cc.user_id = p.id;

revoke all on public.user_profile_enriched from anon, authenticated;
grant select on public.user_profile_enriched to service_role;
