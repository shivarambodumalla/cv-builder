-- Profile enrichment: add CV-derived snapshot columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cv_location text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS years_experience numeric(4,1);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS summary text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS certifications jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS education jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS latest_cv_parsed_json jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS best_ats_score integer;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_goal text;

-- Rebuild user_profile_enriched to expose new enrichment columns.
-- cv_location and phone in the view now COALESCE persisted profile value
-- with live parsed_json so the view is accurate before the first sync runs.
DROP VIEW IF EXISTS public.user_profile_enriched;

CREATE VIEW public.user_profile_enriched
WITH (security_invoker = true) AS
WITH latest_cv AS (
  SELECT DISTINCT ON (user_id)
    user_id,
    id AS cv_id,
    title AS cv_title,
    target_role AS cv_target_role,
    parsed_json,
    updated_at AS cv_updated_at
  FROM cvs
  ORDER BY user_id, updated_at DESC
),
current_exp AS (
  SELECT DISTINCT ON (c.user_id)
    c.user_id,
    exp->>'role' AS current_role,
    exp->>'company' AS current_company
  FROM cvs c,
       jsonb_array_elements(COALESCE(c.parsed_json->'experience'->'items', '[]'::jsonb)) AS exp
  WHERE (exp->>'isCurrent')::boolean = TRUE
  ORDER BY c.user_id, c.updated_at DESC
),
latest_edu AS (
  SELECT DISTINCT ON (c.user_id)
    c.user_id,
    edu->>'institution' AS institution,
    edu->>'degree' AS degree,
    edu->>'field' AS field
  FROM cvs c,
       jsonb_array_elements(COALESCE(c.parsed_json->'education'->'items', '[]'::jsonb)) AS edu
  ORDER BY c.user_id, c.updated_at DESC
),
cv_counts AS (
  SELECT user_id, count(*)::int AS total_cvs FROM cvs GROUP BY user_id
)
SELECT
  p.id,
  p.user_number,
  p.email,
  p.full_name,
  p.avatar_url,
  p.created_at                                                         AS joined_at,
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
  p.target_role                                                        AS profile_target_role,
  p.location                                                           AS profile_location,
  p.linkedin_url,
  p.github_url,
  p.portfolio_url,
  p.employment_status,
  p.preferred_job_type,
  p.experience_level,
  p.industry,
  p.country,
  p.last_seen_at,
  -- Enrichment columns (synced from latest CV by syncProfileFromCv)
  p.years_experience,
  p.best_ats_score,
  p.primary_goal,
  p.summary,
  p.skills,
  p.certifications,
  p.education,
  p.latest_cv_parsed_json,
  -- cv_location and phone: prefer persisted value, fall back to live parse
  COALESCE(p.cv_location, lc.parsed_json->'contact'->>'location')    AS cv_location,
  COALESCE(p.phone,       lc.parsed_json->'contact'->>'phone')       AS phone,
  lc.cv_id                                                             AS latest_cv_id,
  lc.cv_title                                                          AS latest_cv_title,
  COALESCE(p.target_role, lc.cv_target_role)                         AS resolved_target_role,
  lc.parsed_json->'contact'->>'name'                                  AS cv_name,
  lc.parsed_json->'contact'->>'linkedin'                              AS cv_linkedin,
  lc.parsed_json->'contact'->>'website'                              AS cv_website,
  COALESCE(p.location, p.cv_location, lc.parsed_json->'contact'->>'location') AS resolved_location,
  COALESCE(p.linkedin_url, lc.parsed_json->'contact'->>'linkedin')   AS resolved_linkedin,
  COALESCE(p.portfolio_url, lc.parsed_json->'contact'->>'website')   AS resolved_portfolio,
  lc.parsed_json->'targetTitle'->>'title'                             AS target_title_from_cv,
  ce.current_role,
  ce.current_company,
  le.institution                                                       AS college,
  le.degree,
  le.field                                                             AS field_of_study,
  COALESCE(cc.total_cvs, 0)                                          AS total_cvs,
  p.ats_scans_this_window,
  p.job_matches_this_window,
  p.cover_letters_this_window,
  p.ai_rewrites_this_window,
  p.pdf_downloads_this_window,
  p.total_pdf_downloads,
  p.usage_window_start
FROM profiles p
LEFT JOIN auth.users u ON u.id = p.id
LEFT JOIN latest_cv lc ON lc.user_id = p.id
LEFT JOIN current_exp ce ON ce.user_id = p.id
LEFT JOIN latest_edu le ON le.user_id = p.id
LEFT JOIN cv_counts cc ON cc.user_id = p.id;

REVOKE ALL ON public.user_profile_enriched FROM anon, authenticated;
GRANT SELECT ON public.user_profile_enriched TO service_role;
