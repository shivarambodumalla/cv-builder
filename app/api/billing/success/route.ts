import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { markIntentConverted } from "@/lib/billing/intents";
import { findEntitledSubscription, inferPeriod } from "@/lib/billing/reconcile";
import { alertAdmin } from "@/lib/email/alert";

/**
 * Lemon Squeezy redirects here after checkout. The webhook is what activates
 * Pro; this is the safety net for when the redirect beats it (or, in test
 * mode, the webhook never reaches localhost).
 *
 * Reaching this URL proves nothing — anyone signed in can open it — so Pro is
 * granted only when Lemon Squeezy reports a live subscription for the
 * signed-in user's email.
 */
export async function GET() {
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
      await markIntentConverted({ userId: user.id });
      return NextResponse.redirect(`${appUrl}/dashboard`);
    }

    const subscription = user.email ? await findEntitledSubscription(user.email) : null;

    if (!subscription) {
      // Nothing paid under this email (yet). A buyer who changed the email at
      // checkout is still activated by the webhook, which carries the user id.
      console.warn(`[billing/success] no live subscription for ${user.id}, not activating`);
      return NextResponse.redirect(`${appUrl}/dashboard`);
    }

    const period = inferPeriod(subscription.attributes.variant_name);

    await admin.from("profiles").update({
      plan: "pro",
      subscription_status: "active",
      subscription_id: subscription.id,
      subscription_period: period,
      current_period_end: subscription.attributes.renews_at,
    }).eq("id", user.id);

    // Record in subscription history
    const priceMap: Record<string, number> = { weekly: 5, monthly: 14, yearly: 120 };
    const { error: historyError } = await admin.from("subscription_history").insert({
      user_id: user.id,
      plan: "pro",
      period,
      status: "active",
      amount: priceMap[period] || 14,
      subscription_id: subscription.id,
      started_at: subscription.attributes.created_at,
      ended_at: subscription.attributes.renews_at,
    });

    if (historyError) {
      console.error("[billing/success] subscription_history insert failed:", historyError);
      alertAdmin("Subscription History", historyError.message, { userId: user.id, period });
    }

    await markIntentConverted({ userId: user.id, subscriptionId: subscription.id });

    return NextResponse.redirect(`${appUrl}/dashboard`);
  } catch (err) {
    console.error("[billing/success] activation check failed:", err);
    return NextResponse.redirect(`${appUrl}/dashboard`);
  }
}
