-- Funnel RPC functions: return distinct user counts within a date range

CREATE OR REPLACE FUNCTION funnel_cv_created(from_ts timestamptz, to_ts timestamptz)
RETURNS TABLE(count bigint) LANGUAGE sql STABLE AS $$
  SELECT COUNT(DISTINCT user_id)::bigint FROM cvs
  WHERE created_at >= from_ts AND created_at <= to_ts;
$$;

CREATE OR REPLACE FUNCTION funnel_ats_scanned(from_ts timestamptz, to_ts timestamptz)
RETURNS TABLE(count bigint) LANGUAGE sql STABLE AS $$
  SELECT COUNT(DISTINCT c.user_id)::bigint FROM ats_reports ar
  JOIN cvs c ON ar.cv_id = c.id
  WHERE ar.created_at >= from_ts AND ar.created_at <= to_ts;
$$;

CREATE OR REPLACE FUNCTION funnel_job_matched(from_ts timestamptz, to_ts timestamptz)
RETURNS TABLE(count bigint) LANGUAGE sql STABLE AS $$
  SELECT COUNT(DISTINCT c.user_id)::bigint FROM job_matches jm
  JOIN cvs c ON jm.cv_id = c.id
  WHERE jm.created_at >= from_ts AND jm.created_at <= to_ts;
$$;

CREATE OR REPLACE FUNCTION funnel_cover_letter(from_ts timestamptz, to_ts timestamptz)
RETURNS TABLE(count bigint) LANGUAGE sql STABLE AS $$
  SELECT COUNT(DISTINCT c.user_id)::bigint FROM cover_letters cl
  JOIN cvs c ON cl.cv_id = c.id
  WHERE cl.created_at >= from_ts AND cl.created_at <= to_ts;
$$;

CREATE OR REPLACE FUNCTION funnel_pdf_downloaded(from_ts timestamptz, to_ts timestamptz)
RETURNS TABLE(count bigint) LANGUAGE sql STABLE AS $$
  SELECT COUNT(DISTINCT user_id)::bigint FROM cvs
  WHERE download_count > 0
  AND created_at >= from_ts AND created_at <= to_ts;
$$;

CREATE OR REPLACE FUNCTION funnel_interview_prep(from_ts timestamptz, to_ts timestamptz)
RETURNS TABLE(count bigint) LANGUAGE sql STABLE AS $$
  SELECT COUNT(DISTINCT user_id)::bigint FROM stories
  WHERE created_at >= from_ts AND created_at <= to_ts;
$$;
