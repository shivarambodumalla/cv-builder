import { createAdminClient } from "@/lib/supabase/admin";
import { checkLimit, needsMonthlyReset, needsWeeklyReset, type LimitCheckResult } from "./limits";

export async function checkFeatureAccess(
  userId: string,
  feature: string
): Promise<LimitCheckResult> {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, subscription_status, current_period_end, ats_scans_this_month, job_matches_this_month, cover_letters_this_month, ai_rewrites_this_month, pdf_downloads_this_week, pdf_downloads_week_reset, usage_reset_date")
    .eq("id", userId)
    .single();

  if (!profile) return { allowed: false, used: 0, limit: 0, reason: "no_profile" };

  // Check if cancelled subscription has expired
  if (profile.subscription_status === "cancelled" && profile.current_period_end) {
    if (new Date(profile.current_period_end) < new Date()) {
      await supabase.from("profiles").update({
        plan: "free",
        subscription_status: "free",
        subscription_id: null,
        subscription_period: null,
      }).eq("id", userId);
      profile.plan = "free";
      profile.subscription_status = "free";
    }
  }

  // Reset monthly counters if needed
  if (needsMonthlyReset(profile)) {
    await supabase.from("profiles").update({
      ats_scans_this_month: 0,
      job_matches_this_month: 0,
      cover_letters_this_month: 0,
      ai_rewrites_this_month: 0,
      usage_reset_date: new Date().toISOString().split("T")[0],
    }).eq("id", userId);

    profile.ats_scans_this_month = 0;
    profile.job_matches_this_month = 0;
    profile.cover_letters_this_month = 0;
    profile.ai_rewrites_this_month = 0;
  }

  // Reset weekly PDF counter if needed
  if (needsWeeklyReset(profile)) {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

    await supabase.from("profiles").update({
      pdf_downloads_this_week: 0,
      pdf_downloads_week_reset: monday.toISOString().split("T")[0],
    }).eq("id", userId);

    profile.pdf_downloads_this_week = 0;
  }

  return checkLimit(profile, feature);
}

export async function incrementUsage(userId: string, feature: string): Promise<void> {
  const supabase = createAdminClient();

  const columnMap: Record<string, string> = {
    ats_scan: "ats_scans_this_month",
    job_match: "job_matches_this_month",
    cover_letter: "cover_letters_this_month",
    ai_rewrite: "ai_rewrites_this_month",
    pdf_download: "pdf_downloads_this_week",
  };

  const column = columnMap[feature];
  if (!column) return;

  // Use RPC to safely increment
  await supabase.rpc("increment_usage", { user_id: userId, column_name: column });
}
