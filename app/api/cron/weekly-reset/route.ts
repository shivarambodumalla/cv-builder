import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Zeroes the 7-day window and Monday counters on every profile.
 *
 * Retired from vercel.json on 2026-11-09: checkLimit() already resets each
 * user's window and week on expiry, so the Monday run only spent CPU and
 * emailed every profile (Pro included) that their limits were back. Kept as a
 * manual, CRON_SECRET-protected utility; it sends no email.
 *
 * Never touches total_ats_scans: that is the lifetime ATS scan count
 * (TOTAL_COLUMNS in lib/billing/limits.ts) that gates the free plan's one scan.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { count, error } = await supabase
    .from("profiles")
    .update(
      {
        ai_rewrites_this_window: 0,
        job_matches_this_window: 0,
        cover_letters_this_window: 0,
        pdf_downloads_this_window: 0,
        fix_all_this_week: 0,
        cv_tailor_this_week: 0,
        offer_eval_this_week: 0,
        portfolio_scan_this_week: 0,
        story_summary_this_week: 0,
        interview_prep_this_week: 0,
        week_reset_at: now,
        usage_window_start: now,
        limit_emails_sent: {},
      },
      { count: "exact" }
    )
    .not("id", "is", null);

  if (error) {
    console.error("[weekly-reset] failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`[weekly-reset] Reset ${count ?? 0} profiles`);
  return NextResponse.json({ reset: count ?? 0 });
}
