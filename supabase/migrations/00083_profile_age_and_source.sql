-- Estimated age and first-touch signup source for the admin Users table.
--
-- profiles.estimated_birth_year / estimated_age_basis: guessed from CV
-- education and first-job dates by lib/resume/estimated-age.ts (written by
-- syncProfileFromCv). Stored as a birth year so it never goes stale.
--
-- profiles.acquisition_*: where the user came from on their first visit,
-- copied from visitor_first_touch at signup by /api/telemetry/attribute-visitor.
--
-- admin_search_users is recreated (from 00065) with age, source and the sort
-- keys the Users table already offered but SQL ignored (user_number, role,
-- location, industry, experience_level, saved_jobs, stories).

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS estimated_birth_year smallint;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS estimated_age_basis text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS acquisition_channel text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS acquisition_source text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS acquisition_campaign text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS acquisition_landing_path text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS acquisition_referrer_host text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS acquisition_captured_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_profiles_acquisition_channel ON profiles(acquisition_channel);

-- One row per anonymous visitor (localStorage cvx_vid): the first landing page,
-- referrer host and campaign tags. Written by /api/telemetry/page-view with the
-- service role; no policies, so anon and authenticated can't read or write it.
CREATE TABLE IF NOT EXISTS visitor_first_touch (
  visitor_id    uuid PRIMARY KEY,
  landing_path  text NOT NULL,
  referrer_host text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_term      text,
  utm_content   text,
  click_id      text CHECK (click_id IN ('gclid', 'msclkid', 'fbclid')),
  channel       text NOT NULL,
  source        text,
  country_code  text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vft_created ON visitor_first_touch(created_at);
ALTER TABLE visitor_first_touch ENABLE ROW LEVEL SECURITY;

-- The return type changes, so CREATE OR REPLACE is not enough.
DROP FUNCTION IF EXISTS public.admin_search_users;

CREATE FUNCTION public.admin_search_users(
  p_plan              text      DEFAULT NULL,
  p_subscription_status text    DEFAULT NULL,
  p_joined_from       timestamptz DEFAULT NULL,
  p_joined_to         timestamptz DEFAULT NULL,
  p_last_active_days  integer   DEFAULT NULL,
  p_country_code      text      DEFAULT NULL,
  p_city              text      DEFAULT NULL,
  p_role              text      DEFAULT NULL,
  p_industries        text[]    DEFAULT NULL,
  p_experience_levels text[]    DEFAULT NULL,
  p_years_exp_min     numeric   DEFAULT NULL,
  p_years_exp_max     numeric   DEFAULT NULL,
  p_age_min           integer   DEFAULT NULL,
  p_age_max           integer   DEFAULT NULL,
  p_acquisition_channel text    DEFAULT NULL,
  p_employment_status text      DEFAULT NULL,
  p_primary_goal      text      DEFAULT NULL,
  p_skills            text[]    DEFAULT NULL,
  p_skills_match      text      DEFAULT 'any',
  p_certification     text      DEFAULT NULL,
  p_degree            text      DEFAULT NULL,
  p_field_of_study    text      DEFAULT NULL,
  p_institution       text      DEFAULT NULL,
  p_ats_min           integer   DEFAULT NULL,
  p_ats_max           integer   DEFAULT NULL,
  p_has_downloads     boolean   DEFAULT NULL,
  p_has_stories       boolean   DEFAULT NULL,
  p_has_job_clicks    boolean   DEFAULT NULL,
  p_min_cvs           integer   DEFAULT NULL,
  p_has_linkedin      boolean   DEFAULT NULL,
  p_has_github        boolean   DEFAULT NULL,
  p_has_portfolio     boolean   DEFAULT NULL,
  p_has_phone         boolean   DEFAULT NULL,
  p_search            text      DEFAULT NULL,
  p_sort_by           text      DEFAULT 'joined_at',
  p_sort_dir          text      DEFAULT 'desc',
  p_page              integer   DEFAULT 1,
  p_page_size         integer   DEFAULT 50
)
RETURNS TABLE (
  id                  uuid,
  user_number         bigint,
  email               text,
  full_name           text,
  avatar_url          text,
  plan                text,
  subscription_status text,
  joined_at           timestamptz,
  last_active         timestamptz,
  total_cvs           bigint,
  total_pdf_downloads integer,
  target_role         text,
  industry            text,
  experience_level    text,
  years_experience    numeric,
  estimated_birth_year smallint,
  estimated_age_basis text,
  employment_status   text,
  best_ats_score      integer,
  primary_goal        text,
  job_clicks          bigint,
  saved_jobs          bigint,
  stories             bigint,
  signup_city         text,
  signup_country      text,
  signup_country_code text,
  profile_location    text,
  country             text,
  cv_location         text,
  phone               text,
  linkedin_url        text,
  github_url          text,
  portfolio_url       text,
  acquisition_channel text,
  acquisition_source  text,
  latest_cv_id        uuid,
  total_count         bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH latest_cv AS (
    SELECT DISTINCT ON (c.user_id)
      c.user_id,
      c.id          AS cv_id,
      c.target_role AS cv_target_role,
      c.updated_at  AS cv_updated_at
    FROM cvs c
    ORDER BY c.user_id, c.updated_at DESC
  ),
  cv_counts AS (
    SELECT c.user_id, count(*)::bigint AS total
    FROM cvs c
    GROUP BY c.user_id
  ),
  base AS (
    SELECT
      p.id,
      p.user_number,
      p.email,
      p.full_name,
      p.avatar_url,
      p.plan,
      p.subscription_status,
      p.created_at                                          AS joined_at,
      GREATEST(u.last_sign_in_at, lc.cv_updated_at)        AS last_active,
      COALESCE(cc.total, 0)                                 AS total_cvs,
      p.total_pdf_downloads,
      COALESCE(p.target_role, lc.cv_target_role)           AS target_role,
      p.industry,
      p.experience_level,
      p.years_experience,
      p.estimated_birth_year,
      p.estimated_age_basis,
      p.employment_status,
      p.best_ats_score,
      p.primary_goal,
      (SELECT count(*) FROM job_clicks jc WHERE jc.user_id = p.id)  AS job_clicks,
      (SELECT count(*) FROM saved_jobs sj WHERE sj.user_id = p.id)  AS saved_jobs,
      (SELECT count(*) FROM stories s  WHERE s.user_id  = p.id AND s.is_active = true) AS stories,
      p.signup_city,
      p.signup_country,
      p.signup_country_code,
      p.location     AS profile_location,
      p.country,
      p.cv_location,
      p.phone,
      p.linkedin_url,
      p.github_url,
      p.portfolio_url,
      p.acquisition_channel,
      p.acquisition_source,
      lc.cv_id       AS latest_cv_id
    FROM profiles p
    LEFT JOIN auth.users u  ON u.id  = p.id
    LEFT JOIN latest_cv  lc ON lc.user_id = p.id
    LEFT JOIN cv_counts  cc ON cc.user_id = p.id
    WHERE
      -- Account filters
      (p_plan IS NULL OR p.plan = p_plan)
      AND (p_subscription_status IS NULL OR p.subscription_status = p_subscription_status)
      AND (p_joined_from IS NULL OR p.created_at >= p_joined_from)
      AND (p_joined_to   IS NULL OR p.created_at <= p_joined_to)
      AND (p_last_active_days IS NULL OR
           GREATEST(u.last_sign_in_at, lc.cv_updated_at) >= NOW() - (p_last_active_days * INTERVAL '1 day'))
      AND (p_primary_goal IS NULL OR p.primary_goal = p_primary_goal)
      -- Location
      AND (p_country_code IS NULL
           OR p.signup_country_code = p_country_code
           OR p.signup_country      = p_country_code)
      AND (p_city IS NULL OR p.signup_city ILIKE '%' || p_city || '%')
      -- Professional
      AND (p_role IS NULL OR COALESCE(p.target_role, lc.cv_target_role) ILIKE '%' || p_role || '%')
      AND (p_industries        IS NULL OR p.industry          = ANY(p_industries))
      AND (p_experience_levels IS NULL OR p.experience_level  = ANY(p_experience_levels))
      AND (p_years_exp_min IS NULL OR p.years_experience >= p_years_exp_min)
      AND (p_years_exp_max IS NULL OR p.years_experience <= p_years_exp_max)
      -- Age bounds become birth-year bounds: older than p_age_min = born on or before.
      AND (p_age_min IS NULL OR p.estimated_birth_year <= EXTRACT(YEAR FROM NOW())::int - p_age_min)
      AND (p_age_max IS NULL OR p.estimated_birth_year >= EXTRACT(YEAR FROM NOW())::int - p_age_max)
      AND (p_acquisition_channel IS NULL
           OR COALESCE(p.acquisition_channel, 'unknown') = p_acquisition_channel)
      AND (p_employment_status IS NULL OR p.employment_status = p_employment_status)
      -- Activity
      AND (p_ats_min    IS NULL OR p.best_ats_score       >= p_ats_min)
      AND (p_ats_max    IS NULL OR p.best_ats_score       <= p_ats_max)
      AND (p_has_downloads IS NULL
           OR (p_has_downloads  = true  AND p.total_pdf_downloads  > 0)
           OR (p_has_downloads  = false AND p.total_pdf_downloads  = 0))
      AND (p_min_cvs IS NULL OR COALESCE(cc.total, 0) >= p_min_cvs)
      AND (p_has_stories IS NULL
           OR (p_has_stories = true  AND EXISTS (SELECT 1 FROM stories s WHERE s.user_id = p.id AND s.is_active = true))
           OR (p_has_stories = false AND NOT EXISTS (SELECT 1 FROM stories s WHERE s.user_id = p.id AND s.is_active = true)))
      AND (p_has_job_clicks IS NULL
           OR (p_has_job_clicks = true  AND EXISTS (SELECT 1 FROM job_clicks jc WHERE jc.user_id = p.id))
           OR (p_has_job_clicks = false AND NOT EXISTS (SELECT 1 FROM job_clicks jc WHERE jc.user_id = p.id)))
      -- Links
      AND (p_has_linkedin  IS NULL OR (p_has_linkedin  = (p.linkedin_url  IS NOT NULL)))
      AND (p_has_github    IS NULL OR (p_has_github    = (p.github_url    IS NOT NULL)))
      AND (p_has_portfolio IS NULL OR (p_has_portfolio = (p.portfolio_url IS NOT NULL)))
      AND (p_has_phone     IS NULL OR (p_has_phone     = (p.phone         IS NOT NULL)))
      -- Free-text search
      AND (p_search IS NULL
           OR p.email     ILIKE '%' || p_search || '%'
           OR p.full_name ILIKE '%' || p_search || '%')
      -- Skills (JSONB)
      AND (
        p_skills IS NULL
        OR (
          p.skills IS NOT NULL
          AND CASE WHEN p_skills_match = 'all' THEN
            (SELECT COUNT(DISTINCT term)
             FROM UNNEST(p_skills) AS term
             WHERE EXISTS (
               SELECT 1
               FROM jsonb_array_elements(p.skills) AS cat,
                    jsonb_array_elements(cat->'skills') AS skill
               WHERE skill #>> '{}' ILIKE '%' || term || '%'
             )
            ) = array_length(p_skills, 1)
          ELSE
            EXISTS (
              SELECT 1 FROM UNNEST(p_skills) AS term
              WHERE EXISTS (
                SELECT 1
                FROM jsonb_array_elements(p.skills) AS cat,
                     jsonb_array_elements(cat->'skills') AS skill
                WHERE skill #>> '{}' ILIKE '%' || term || '%'
              )
            )
          END
        )
      )
      -- Certifications (JSONB)
      AND (p_certification IS NULL OR (
        p.certifications IS NOT NULL AND
        EXISTS (
          SELECT 1 FROM jsonb_array_elements(p.certifications) AS cert
          WHERE cert->>'name' ILIKE '%' || p_certification || '%'
        )
      ))
      -- Education (JSONB)
      AND (p_degree IS NULL OR (
        p.education IS NOT NULL AND
        EXISTS (SELECT 1 FROM jsonb_array_elements(p.education) AS edu
                WHERE edu->>'degree' ILIKE '%' || p_degree || '%')
      ))
      AND (p_field_of_study IS NULL OR (
        p.education IS NOT NULL AND
        EXISTS (SELECT 1 FROM jsonb_array_elements(p.education) AS edu
                WHERE edu->>'field' ILIKE '%' || p_field_of_study || '%')
      ))
      AND (p_institution IS NULL OR (
        p.education IS NOT NULL AND
        EXISTS (SELECT 1 FROM jsonb_array_elements(p.education) AS edu
                WHERE edu->>'institution' ILIKE '%' || p_institution || '%')
      ))
  )
  SELECT
    b.id, b.user_number, b.email, b.full_name, b.avatar_url,
    b.plan, b.subscription_status, b.joined_at, b.last_active,
    b.total_cvs, b.total_pdf_downloads, b.target_role,
    b.industry, b.experience_level, b.years_experience,
    b.estimated_birth_year, b.estimated_age_basis,
    b.employment_status, b.best_ats_score, b.primary_goal,
    b.job_clicks, b.saved_jobs, b.stories,
    b.signup_city, b.signup_country, b.signup_country_code,
    b.profile_location, b.country, b.cv_location, b.phone,
    b.linkedin_url, b.github_url, b.portfolio_url,
    b.acquisition_channel, b.acquisition_source,
    b.latest_cv_id,
    COUNT(*) OVER() AS total_count
  FROM base b
  ORDER BY
    CASE WHEN p_sort_by = 'joined_at'         AND p_sort_dir = 'asc'  THEN b.joined_at          END ASC  NULLS LAST,
    CASE WHEN p_sort_by = 'joined_at'         AND p_sort_dir = 'desc' THEN b.joined_at          END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'last_active'       AND p_sort_dir = 'asc'  THEN b.last_active        END ASC  NULLS LAST,
    CASE WHEN p_sort_by = 'last_active'       AND p_sort_dir = 'desc' THEN b.last_active        END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'best_ats_score'    AND p_sort_dir = 'asc'  THEN b.best_ats_score     END ASC  NULLS LAST,
    CASE WHEN p_sort_by = 'best_ats_score'    AND p_sort_dir = 'desc' THEN b.best_ats_score     END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'years_experience'  AND p_sort_dir = 'asc'  THEN b.years_experience  END ASC  NULLS LAST,
    CASE WHEN p_sort_by = 'years_experience'  AND p_sort_dir = 'desc' THEN b.years_experience  END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'total_cvs'         AND p_sort_dir = 'asc'  THEN b.total_cvs         END ASC  NULLS LAST,
    CASE WHEN p_sort_by = 'total_cvs'         AND p_sort_dir = 'desc' THEN b.total_cvs         END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'total_pdf_downloads' AND p_sort_dir = 'asc'  THEN b.total_pdf_downloads END ASC  NULLS LAST,
    CASE WHEN p_sort_by = 'total_pdf_downloads' AND p_sort_dir = 'desc' THEN b.total_pdf_downloads END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'job_clicks'        AND p_sort_dir = 'asc'  THEN b.job_clicks        END ASC  NULLS LAST,
    CASE WHEN p_sort_by = 'job_clicks'        AND p_sort_dir = 'desc' THEN b.job_clicks        END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'name'              AND p_sort_dir = 'asc'  THEN LOWER(COALESCE(b.full_name, b.email)) END ASC  NULLS LAST,
    CASE WHEN p_sort_by = 'name'              AND p_sort_dir = 'desc' THEN LOWER(COALESCE(b.full_name, b.email)) END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'plan'              AND p_sort_dir = 'asc'  THEN b.plan              END ASC  NULLS LAST,
    CASE WHEN p_sort_by = 'plan'              AND p_sort_dir = 'desc' THEN b.plan              END DESC NULLS LAST,
    -- Ascending age = descending birth year.
    CASE WHEN p_sort_by = 'estimated_age'     AND p_sort_dir = 'asc'  THEN b.estimated_birth_year END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'estimated_age'     AND p_sort_dir = 'desc' THEN b.estimated_birth_year END ASC  NULLS LAST,
    CASE WHEN p_sort_by = 'acquisition_channel' AND p_sort_dir = 'asc'  THEN b.acquisition_channel END ASC  NULLS LAST,
    CASE WHEN p_sort_by = 'acquisition_channel' AND p_sort_dir = 'desc' THEN b.acquisition_channel END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'user_number'       AND p_sort_dir = 'asc'  THEN b.user_number       END ASC  NULLS LAST,
    CASE WHEN p_sort_by = 'user_number'       AND p_sort_dir = 'desc' THEN b.user_number       END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'role'              AND p_sort_dir = 'asc'  THEN LOWER(b.target_role) END ASC  NULLS LAST,
    CASE WHEN p_sort_by = 'role'              AND p_sort_dir = 'desc' THEN LOWER(b.target_role) END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'location'          AND p_sort_dir = 'asc'  THEN LOWER(CONCAT_WS(', ', b.signup_country, b.signup_city)) END ASC  NULLS LAST,
    CASE WHEN p_sort_by = 'location'          AND p_sort_dir = 'desc' THEN LOWER(CONCAT_WS(', ', b.signup_country, b.signup_city)) END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'industry'          AND p_sort_dir = 'asc'  THEN b.industry          END ASC  NULLS LAST,
    CASE WHEN p_sort_by = 'industry'          AND p_sort_dir = 'desc' THEN b.industry          END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'experience_level'  AND p_sort_dir = 'asc'  THEN b.experience_level  END ASC  NULLS LAST,
    CASE WHEN p_sort_by = 'experience_level'  AND p_sort_dir = 'desc' THEN b.experience_level  END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'saved_jobs'        AND p_sort_dir = 'asc'  THEN b.saved_jobs        END ASC  NULLS LAST,
    CASE WHEN p_sort_by = 'saved_jobs'        AND p_sort_dir = 'desc' THEN b.saved_jobs        END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'stories'           AND p_sort_dir = 'asc'  THEN b.stories           END ASC  NULLS LAST,
    CASE WHEN p_sort_by = 'stories'           AND p_sort_dir = 'desc' THEN b.stories           END DESC NULLS LAST,
    b.joined_at DESC
  LIMIT  p_page_size
  OFFSET (p_page - 1) * p_page_size;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_search_users FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_search_users TO service_role;
