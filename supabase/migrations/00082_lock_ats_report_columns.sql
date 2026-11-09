-- Free plan paywall (2026-11-09), part 2 of 2: hide the ATS report body from
-- the browser. Apply AFTER the code deploy (the new editor page reads
-- ats_reports through createAdminClient(); the old one used the user session
-- and would lose the report).
--
-- The report body (issues, fixes, missing keywords) is what the paywall sells
-- after the free scan, so the browser must not be able to read it through the
-- anon key + the user's session. A column-level REVOKE is a no-op while the
-- table-level SELECT grant (Supabase's default) exists, so drop that and grant
-- back only the summary columns. The existing SELECT policy still scopes rows
-- to the owner. INSERT/UPDATE/DELETE grants are untouched: the editor's
-- debounced `update({ overall_score }).eq("id", …)` only needs SELECT on id.
-- Server code reads report_data through the service role, which bypasses
-- grants and RLS.
REVOKE SELECT ON public.ats_reports FROM anon, authenticated;
GRANT SELECT (id, cv_id, score, overall_score, confidence, created_at)
  ON public.ats_reports TO authenticated;
