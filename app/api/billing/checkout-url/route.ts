import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCheckoutUrl } from "@/lib/billing/checkout";

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
    const url = await getCheckoutUrl(period, user.email || "", user.id);
    return NextResponse.json({ url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[checkout-url] Failed:", msg);
    return NextResponse.json({ error: `Checkout failed: ${msg}` }, { status: 500 });
  }
}
