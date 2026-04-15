-- Phase 1: profile enrichment for user-facing /profile page + admin analytics

alter table profiles add column if not exists target_role text;
alter table profiles add column if not exists location text;
alter table profiles add column if not exists linkedin_url text;
alter table profiles add column if not exists github_url text;
alter table profiles add column if not exists portfolio_url text;
alter table profiles add column if not exists employment_status text default 'actively_looking'
  check (employment_status in ('actively_looking', 'open_to_opportunities', 'not_looking'));
alter table profiles add column if not exists preferred_job_type text[];
alter table profiles add column if not exists experience_level text
  check (experience_level is null or experience_level in ('early', 'mid', 'senior', 'expert'));
alter table profiles add column if not exists industry text;
alter table profiles add column if not exists country text;
alter table profiles add column if not exists last_seen_at timestamptz default now();

-- Aggregated view: profile + latest CV derived fields
-- Uses parsed_json (NOT 'content'). Experience items use `role`, `isCurrent` (camelCase).
create or replace view user_profile_enriched as
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
  -- Profile-level overrides
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
  -- Derived from latest CV
  lc.cv_id as latest_cv_id,
  lc.cv_title as latest_cv_title,
  coalesce(p.target_role, lc.cv_target_role) as resolved_target_role,
  lc.parsed_json->'contact'->>'name' as cv_name,
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
  -- Usage (rolling 7-day window per CLAUDE.md)
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

grant select on user_profile_enriched to authenticated;
