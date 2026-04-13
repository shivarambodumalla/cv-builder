import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendLimitReset, sendReactivation } from "@/lib/email/triggers";

export async function GET(request: Request) {
  // Verify cron secret (Vercel sends this)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Get all profiles that need reset
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, ats_scans_this_window, ai_rewrites_this_window, job_matches_this_window, cover_letters_this_window, fix_all_this_week, cv_tailor_this_week, last_seen_at")
    .order("id");

  if (!profiles) return NextResponse.json({ reset: 0 });

  let resetCount = 0;
  let emailsSent = 0;

  for (const profile of profiles) {
    // Reset all counters
    await supabase.from("profiles").update({
      ats_scans_this_window: 0,
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
      week_reset_at: new Date().toISOString(),
      usage_window_start: new Date().toISOString(),
      limit_emails_sent: {},
    }).eq("id", profile.id);

    resetCount++;

    // Determine if active or inactive
    const wasActive = (profile.ats_scans_this_window || 0) > 0 ||
      (profile.ai_rewrites_this_window || 0) > 0 ||
      (profile.job_matches_this_window || 0) > 0 ||
      (profile.fix_all_this_week || 0) > 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const isInactive = !profile.last_seen_at || new Date(profile.last_seen_at) < sevenDaysAgo;

    if (profile.email) {
      if (wasActive) {
        await sendLimitReset(profile.email, profile.full_name || "");
        emailsSent++;
      } else if (isInactive) {
        await sendReactivation(profile.email, profile.full_name || "");
        emailsSent++;
      }
    }
  }

  console.log(`[weekly-reset] Reset ${resetCount} profiles, sent ${emailsSent} emails`);
  return NextResponse.json({ reset: resetCount, emails: emailsSent });
}
