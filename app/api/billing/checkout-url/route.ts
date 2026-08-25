import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCheckoutUrl } from "@/lib/billing/checkout";
import { recordCheckoutIntent } from "@/lib/billing/intents";
import { logServerActivity } from "@/lib/analytics/server-log";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { period } = await request.json();

  if (!["weekly", "monthly", "yearly"].includes(period)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  try {
    const { url, variantId } = await getCheckoutUrl(period, user.email || "", user.id);

    // This route is only ever reached by a click on the pay button, so it is
    // the truthful place to count intent — before the user leaves for the
    // payment page and possibly never comes back.
    await recordCheckoutIntent({
      userId: user.id,
      email: user.email ?? null,
      period,
      variantId,
      checkoutUrl: url,
    });
    logServerActivity(createAdminClient(), user.id, "Clicked pay button", { period });

    return NextResponse.json({ url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[checkout-url] Failed:", msg);
    return NextResponse.json({ error: `Checkout failed: ${msg}` }, { status: 500 });
  }
}
