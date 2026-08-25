import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Pay-button click tracking. Recorded server-side at checkout creation, so it
 * survives ad blockers and cannot be forged from the client. Fire-and-forget:
 * analytics must never block or break a purchase.
 */

export async function recordCheckoutIntent(params: {
  userId: string;
  email: string | null;
  period: string;
  variantId: string | null;
  checkoutUrl: string | null;
}): Promise<void> {
  try {
    await createAdminClient().from("checkout_intents").insert({
      user_id: params.userId,
      email: params.email,
      period: params.period,
      variant_id: params.variantId,
      checkout_url: params.checkoutUrl,
    });
  } catch (err) {
    console.error("[checkout-intent] record failed:", err);
  }
}

/**
 * Marks the user's most recent unconverted click as paid. Scoped to the latest
 * open intent so a user who abandons twice and buys on the third attempt does
 * not retroactively mark the abandoned ones as conversions.
 */
export async function markIntentConverted(params: {
  userId: string;
  orderId?: string | null;
  subscriptionId?: string | null;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data: open } = await admin
      .from("checkout_intents")
      .select("id")
      .eq("user_id", params.userId)
      .is("converted_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!open) return;

    await admin.from("checkout_intents").update({
      converted_at: new Date().toISOString(),
      order_id: params.orderId ?? null,
      subscription_id: params.subscriptionId ?? null,
    }).eq("id", open.id);
  } catch (err) {
    console.error("[checkout-intent] convert failed:", err);
  }
}
