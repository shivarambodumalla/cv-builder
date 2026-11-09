-- Free plan paywall (2026-11-09), part 1 of 2: columns and backfill.
-- Safe to apply BEFORE the code deploy: it only adds columns the new code
-- reads and fills one of them. Part 2 (00082) changes grants and must run
-- AFTER the deploy, because the old editor page reads ats_reports.report_data
-- with the user's session.
--
-- Quota values live in plan_limits (scripts/seed-plan-config.ts --force, run
-- after the deploy). total_ats_scans is a lifetime counter: checkLimit() in
-- lib/billing/limits.ts lists it in TOTAL_COLUMNS, so no reset touches it.
-- ats_scans_this_window stays but is no longer written.
--
-- fix_all_used_at was written by /api/cv/fix-all and read by
-- lib/guarantee/check.ts without any migration creating it, so the guarantee
-- could never be claimed. Created here with the type both sides assume.
--
-- The weekly counters from 00028 were never applied to production (probed
-- 2026-11-09), so they are repeated here with IF NOT EXISTS: checkLimit()'s
-- Monday reset and the weekly gates write to them.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_ats_scans int NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fix_all_used_at timestamptz;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fix_all_this_week integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cv_tailor_this_week integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS offer_eval_this_week integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS portfolio_scan_this_week integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS story_summary_this_week integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interview_prep_this_week integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS week_reset_at timestamptz DEFAULT now();

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
