import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const supabase = createAdminClient();

  // Get user email for notification
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, plan")
    .eq("id", id)
    .single();

  if (!profile || profile.plan !== "pro") {
    return NextResponse.json({ error: "User is not on Pro plan" }, { status: 400 });
  }

  // Cancel on Lemon Squeezy if there's a real subscription
  const { data: sub } = await supabase
    .from("profiles")
    .select("subscription_id")
    .eq("id", id)
    .single();

  if (sub?.subscription_id && !sub.subscription_id.startsWith("admin_grant_")) {
    try {
      const { cancelSubscription } = await import("@lemonsqueezy/lemonsqueezy.js");
      const { configureLemonSqueezy } = await import("@/lib/lemonsqueezy");
      configureLemonSqueezy();
      await cancelSubscription(sub.subscription_id);
    } catch (err) {
      console.error("[admin/suspend] Lemon Squeezy cancel failed:", err);
    }
  }

  // Suspend: revoke Pro, set to free
  await supabase.from("profiles").update({
    plan: "free",
    subscription_status: "free",
    subscription_period: null,
    current_period_end: null,
    ats_scans_this_month: 0,
    job_matches_this_month: 0,
    cover_letters_this_month: 0,
    ai_rewrites_this_month: 0,
    pdf_downloads_this_week: 0,
  }).eq("id", id);

  // Record in history
  await supabase.from("subscription_history").insert({
    user_id: id,
    plan: "pro",
    period: "suspended",
    amount: 0,
    currency: "USD",
    status: "suspended",
    started_at: new Date().toISOString(),
  });

  // Send suspension email (fire & forget)
  try {
    const { sendEmail } = await import("@/lib/email/sender");
    if (profile.email) {
      sendEmail({
        to: profile.email,
        templateName: "subscription_suspended",
        variables: {},
        userId: id,
      }).catch(() => {});
    }
  } catch {
    // Email sending is optional
  }

  return NextResponse.json({ message: `Subscription suspended for ${profile.email}. User set to free plan.` });
}
