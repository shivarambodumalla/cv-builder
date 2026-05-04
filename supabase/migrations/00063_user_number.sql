-- Add sequential user number to profiles for human-friendly identification

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_number BIGINT;

-- Backfill existing users in sign-up order
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM profiles
)
UPDATE profiles SET user_number = ranked.rn
FROM ranked WHERE profiles.id = ranked.id;

-- Create sequence starting after the highest assigned number
CREATE SEQUENCE IF NOT EXISTS profiles_user_number_seq;
SELECT setval('profiles_user_number_seq', COALESCE(MAX(user_number), 0)) FROM profiles;

ALTER TABLE profiles
  ALTER COLUMN user_number SET DEFAULT nextval('profiles_user_number_seq'),
  ALTER COLUMN user_number SET NOT NULL;

ALTER SEQUENCE profiles_user_number_seq OWNED BY profiles.user_number;

-- Recreate user_profile_enriched to include user_number
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
  p.created_at AS joined_at,
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
  p.target_role AS profile_target_role,
  p.location AS profile_location,
  p.linkedin_url,
  p.github_url,
  p.portfolio_url,
  p.employment_status,
  p.preferred_job_type,
  p.experience_level,
  p.industry,
  p.country,
  p.last_seen_at,
  lc.cv_id AS latest_cv_id,
  lc.cv_title AS latest_cv_title,
  COALESCE(p.target_role, lc.cv_target_role) AS resolved_target_role,
  lc.parsed_json->'contact'->>'name' AS cv_name,
  lc.parsed_json->'contact'->>'location' AS cv_location,
  lc.parsed_json->'contact'->>'linkedin' AS cv_linkedin,
  lc.parsed_json->'contact'->>'website' AS cv_website,
  COALESCE(p.location, lc.parsed_json->'contact'->>'location') AS resolved_location,
  COALESCE(p.linkedin_url, lc.parsed_json->'contact'->>'linkedin') AS resolved_linkedin,
  COALESCE(p.portfolio_url, lc.parsed_json->'contact'->>'website') AS resolved_portfolio,
  lc.parsed_json->'contact'->>'phone' AS phone,
  lc.parsed_json->'targetTitle'->>'title' AS target_title_from_cv,
  ce.current_role,
  ce.current_company,
  le.institution AS college,
  le.degree,
  le.field AS field_of_study,
  COALESCE(cc.total_cvs, 0) AS total_cvs,
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
