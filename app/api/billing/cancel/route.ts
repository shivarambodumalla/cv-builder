import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("subscription_status, subscription_id, current_period_end")
    .eq("id", user.id)
    .single();

  if (!profile || profile.subscription_status !== "active") {
    return NextResponse.json({ error: "No active subscription" }, { status: 400 });
  }

  // If there's a real Lemon Squeezy subscription, cancel via API
  if (profile.subscription_id) {
    try {
      const { cancelSubscription } = await import("@lemonsqueezy/lemonsqueezy.js");
      const { configureLemonSqueezy } = await import("@/lib/lemonsqueezy");
      configureLemonSqueezy();
      await cancelSubscription(profile.subscription_id);
    } catch (err) {
      console.error("[cancel] Lemon Squeezy cancel failed:", err);
      // Continue — still mark as cancelled locally
    }
  }

  // Mark as cancelled — keep pro access until current_period_end
  await admin.from("profiles").update({
    subscription_status: "cancelled",
  }).eq("id", user.id);

  // Record in subscription history
  await admin.from("subscription_history").insert({
    user_id: user.id,
    plan: "pro",
    period: "cancelled",
    status: "cancelled",
    amount: 0,
    started_at: new Date().toISOString(),
    ends_at: profile.current_period_end,
  });

  return NextResponse.json({ ok: true, access_until: profile.current_period_end });
}
