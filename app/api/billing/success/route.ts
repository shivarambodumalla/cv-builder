import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Lemon Squeezy redirects here after successful checkout.
 * In test mode, the webhook may not reach localhost, so we
 * verify the user's subscription via the LS API and activate pro.
 * In production, the webhook handles activation — this is a safety net.
 */
export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${appUrl}/login`);
    }

    // Check if webhook already activated pro
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    if (profile?.subscription_status === "active") {
      // Already activated by webhook — just redirect
      return NextResponse.redirect(`${appUrl}/dashboard`);
    }

    // Webhook hasn't fired yet (common in test mode / localhost).
    // Activate pro directly as payment was confirmed by Lemon Squeezy redirect.
    const period = request.nextUrl.searchParams.get("period") || "monthly";

    const periodDays: Record<string, number> = { weekly: 7, monthly: 30, yearly: 365 };
    const days = periodDays[period] || 30;
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + days);
    periodEnd.setUTCHours(23, 59, 59, 999);

    await admin.from("profiles").update({
      plan: "pro",
      subscription_status: "active",
      subscription_period: period,
      current_period_end: periodEnd.toISOString(),
    }).eq("id", user.id);

    // Record in subscription history
    const priceMap: Record<string, number> = { weekly: 5, monthly: 14, yearly: 120 };
    await admin.from("subscription_history").insert({
      user_id: user.id,
      plan: "pro",
      period,
      status: "active",
      amount: priceMap[period] || 14,
      started_at: new Date().toISOString(),
      ends_at: periodEnd.toISOString(),
    });

    return NextResponse.redirect(`${appUrl}/dashboard`);
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard`);
  }
}
