import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckout } from "@/lib/lemonsqueezy";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { variantId } = body as { variantId?: string };

  if (!variantId) {
    return NextResponse.json(
      { error: "variantId is required" },
      { status: 400 }
    );
  }

  const allowed = [
    process.env.LEMONSQUEEZY_STARTER_VARIANT_ID,
    process.env.LEMONSQUEEZY_PRO_VARIANT_ID,
  ];

  if (!allowed.includes(variantId)) {
    return NextResponse.json(
      { error: "Invalid variant" },
      { status: 400 }
    );
  }

  try {
    const checkoutUrl = await createCheckout(
      user.id,
      user.email!,
      variantId
    );

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}
