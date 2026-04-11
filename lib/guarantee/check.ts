import { createAdminClient } from "@/lib/supabase/admin";

interface GuaranteeResult {
  eligible: boolean;
  reason: string;
}

export async function checkGuaranteeEligibility(userId: string): Promise<GuaranteeResult> {
  const supabase = createAdminClient();

  // Must be Pro
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, subscription_status, created_at")
    .eq("id", userId)
    .single();

  if (!profile || profile.subscription_status !== "active") {
    return { eligible: false, reason: "Pro subscription required" };
  }

  // Account must be less than 14 days old
  const accountAge = Date.now() - new Date(profile.created_at).getTime();
  if (accountAge > 14 * 24 * 60 * 60 * 1000) {
    return { eligible: false, reason: "Guarantee period expired (14 days from signup)" };
  }

  // Must have run ATS analysis
  const { data: reports } = await supabase
    .from("ats_reports")
    .select("score, cv_id")
    .eq("cv_id", (await supabase.from("cvs").select("id").eq("user_id", userId).limit(1).single()).data?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(1);

  if (!reports?.length) {
    return { eligible: false, reason: "Run an ATS analysis first" };
  }

  const latestScore = reports[0].score;

  // Score must be below 80
  if (latestScore >= 80) {
    return { eligible: false, reason: "Your score is already 80+" };
  }

  // Must have used Fix All (check fix_all_used_at or fix_all_count_week)
  const { data: profileFull } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pf = profileFull as any;
  if (!pf?.fix_all_used_at) {
    return { eligible: false, reason: "Use Fix All at least once before claiming" };
  }

  // Check for existing claim
  const { data: existingClaim } = await supabase
    .from("guarantee_claims")
    .select("id")
    .eq("user_id", userId)
    .limit(1)
    .single();

  if (existingClaim) {
    return { eligible: false, reason: "You already have a pending guarantee claim" };
  }

  return { eligible: true, reason: "Eligible for guarantee" };
}
