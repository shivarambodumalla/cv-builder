-- Free plan paywall (2026-11-09): one lifetime ATS scan, unlimited footered
-- PDF downloads, everything else Pro-only. Quota values live in plan_limits
-- (scripts/seed-plan-config.ts --force); this migration adds the columns the
-- new rules need and locks the ATS report body away from the browser.
--
-- total_ats_scans is a lifetime counter: checkLimit() in lib/billing/limits.ts
-- lists it in TOTAL_COLUMNS, so neither the 7-day window reset nor the Monday
-- reset (cron/weekly-reset) touches it. ats_scans_this_window stays but is no
-- longer written.
--
-- fix_all_used_at was written by /api/cv/fix-all and read by
-- lib/guarantee/check.ts without any migration creating it, so the guarantee
-- could never be claimed. Created here with the type both sides assume.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_ats_scans int NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fix_all_used_at timestamptz;

-- Everyone who has already run a scan has used their free one.
UPDATE public.profiles p
SET total_ats_scans = 1
WHERE p.total_ats_scans = 0
  AND EXISTS (
    SELECT 1
    FROM public.ats_reports r
    JOIN public.cvs c ON c.id = r.cv_id
    WHERE c.user_id = p.id
  );

-- The report body (issues, fixes, missing keywords) is what the paywall sells
-- after the free scan, so the browser must not be able to read it through the
-- anon key + the user's session. A column-level REVOKE is a no-op while the
-- table-level SELECT grant (Supabase's default) exists, so drop that and grant
-- back only the summary columns. The existing SELECT policy still scopes rows
-- to the owner. INSERT/UPDATE/DELETE grants are untouched: the editor's
-- debounced `update({ overall_score }).eq("id", …)` only needs SELECT on id.
-- Server code reads report_data through createAdminClient() (service role
-- bypasses grants and RLS).
REVOKE SELECT ON public.ats_reports FROM anon, authenticated;
GRANT SELECT (id, cv_id, score, overall_score, confidence, created_at)
  ON public.ats_reports TO authenticated;
