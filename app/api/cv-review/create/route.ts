import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { configureLemonSqueezy } from "@/lib/lemonsqueezy";
import { createCheckout as lsCreateCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { REVIEW_TIERS, ReviewTier } from "@/lib/cv-review/config";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { tier, target_role, target_country, user_notes } = body;

  if (!tier || !REVIEW_TIERS[tier as ReviewTier]) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }
  if (!target_role || !target_country) {
    return NextResponse.json({ error: "target_role and target_country are required" }, { status: 400 });
  }

  const _tierConfig = REVIEW_TIERS[tier as ReviewTier];

  // Get variant ID from env
  const variantIdMap: Record<string, string | undefined> = {
    starter: process.env.LS_CV_REVIEW_STARTER_VARIANT_ID,
    standard: process.env.LS_CV_REVIEW_STANDARD_VARIANT_ID,
    pro: process.env.LS_CV_REVIEW_PRO_VARIANT_ID,
  };
  const variantId = variantIdMap[tier];
  if (!variantId) {
    return NextResponse.json({ error: "Payment not configured for this tier" }, { status: 500 });
  }

  configureLemonSqueezy();
  const storeId = process.env.LEMONSQUEEZY_STORE_ID!;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.thecvedge.com";

  const { data, error } = await lsCreateCheckout(storeId, variantId, {
    checkoutData: {
      email: user.email!,
      custom: {
        user_id: user.id,
        tier,
        target_role,
        target_country,
        user_notes: user_notes || "",
        product_type: "cv_review",
      },
    },
    productOptions: {
      redirectUrl: `${appUrl}/cv-review/pending`,
    },
  });

  if (error) {
    console.error("[cv-review/create]", error);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }

  return NextResponse.json({ checkout_url: data!.data.attributes.url });
}
