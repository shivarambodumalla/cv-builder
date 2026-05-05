-- Admin user search function: handles all server-side filtering including JSONB
-- skill/certification/education queries. Called exclusively via service_role.

CREATE OR REPLACE FUNCTION public.admin_search_users(
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
    b.employment_status, b.best_ats_score, b.primary_goal,
    b.job_clicks, b.saved_jobs, b.stories,
    b.signup_city, b.signup_country, b.signup_country_code,
    b.profile_location, b.country, b.cv_location, b.phone,
    b.linkedin_url, b.github_url, b.portfolio_url,
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
    b.joined_at DESC
  LIMIT  p_page_size
  OFFSET (p_page - 1) * p_page_size;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_search_users FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_search_users TO service_role;

-- ── Filter options: autocomplete suggestions ──────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_filter_options(
  p_type  text,
  p_query text DEFAULT ''
)
RETURNS TABLE (value text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  CASE p_type
    WHEN 'skills' THEN
      RETURN QUERY
        SELECT DISTINCT skill #>> '{}' AS value
        FROM profiles p,
             jsonb_array_elements(p.skills) AS cat,
             jsonb_array_elements(cat->'skills') AS skill
        WHERE p.skills IS NOT NULL
          AND (p_query = '' OR skill #>> '{}' ILIKE '%' || p_query || '%')
        ORDER BY value
        LIMIT 30;

    WHEN 'roles' THEN
      RETURN QUERY
        SELECT DISTINCT p.target_role AS value
        FROM profiles p
        WHERE p.target_role IS NOT NULL
          AND (p_query = '' OR p.target_role ILIKE '%' || p_query || '%')
        ORDER BY value
        LIMIT 30;

    WHEN 'certifications' THEN
      RETURN QUERY
        SELECT DISTINCT cert->>'name' AS value
        FROM profiles p,
             jsonb_array_elements(p.certifications) AS cert
        WHERE p.certifications IS NOT NULL
          AND (p_query = '' OR cert->>'name' ILIKE '%' || p_query || '%')
        ORDER BY value
        LIMIT 30;

    WHEN 'institutions' THEN
      RETURN QUERY
        SELECT DISTINCT edu->>'institution' AS value
        FROM profiles p,
             jsonb_array_elements(p.education) AS edu
        WHERE p.education IS NOT NULL
          AND edu->>'institution' IS NOT NULL
          AND (p_query = '' OR edu->>'institution' ILIKE '%' || p_query || '%')
        ORDER BY value
        LIMIT 30;

    WHEN 'fields' THEN
      RETURN QUERY
        SELECT DISTINCT edu->>'field' AS value
        FROM profiles p,
             jsonb_array_elements(p.education) AS edu
        WHERE p.education IS NOT NULL
          AND edu->>'field' IS NOT NULL
          AND (p_query = '' OR edu->>'field' ILIKE '%' || p_query || '%')
        ORDER BY value
        LIMIT 30;

    ELSE
      RETURN;
  END CASE;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_filter_options FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_filter_options TO service_role;
