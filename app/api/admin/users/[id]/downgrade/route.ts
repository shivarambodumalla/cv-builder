import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const supabase = createAdminClient();

  // Cancel on Lemon Squeezy if there's a real subscription
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_id")
    .eq("id", id)
    .single();

  if (profile?.subscription_id && !profile.subscription_id.startsWith("admin_grant_")) {
    try {
      const { cancelSubscription } = await import("@lemonsqueezy/lemonsqueezy.js");
      const { configureLemonSqueezy } = await import("@/lib/lemonsqueezy");
      configureLemonSqueezy();
      await cancelSubscription(profile.subscription_id);
    } catch (err) {
      console.error("[admin/downgrade] Lemon Squeezy cancel failed:", err);
    }
  }

  await supabase.from("profiles").update({
    plan: "free",
    subscription_status: "free",
    subscription_period: null,
    subscription_id: null,
    current_period_end: null,
  }).eq("id", id);

  return NextResponse.json({ message: "Downgraded to free plan" });
}
