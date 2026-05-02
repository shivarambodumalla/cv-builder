import { configureLemonSqueezy } from "@/lib/lemonsqueezy";
import { createCheckout as lsCreateCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import type { ReviewTier } from "@/lib/cv-review/config";

const VARIANT_IDS: Record<ReviewTier, string | undefined> = {
  starter: process.env.LS_CV_REVIEW_STARTER_VARIANT_ID,
  standard: process.env.LS_CV_REVIEW_STANDARD_VARIANT_ID,
  pro: process.env.LS_CV_REVIEW_PRO_VARIANT_ID,
};

export async function createReviewCheckout(
  tier: ReviewTier,
  userId: string,
  userEmail: string,
  metadata: Record<string, string>
): Promise<string> {
  const variantId = VARIANT_IDS[tier];
  if (!variantId) {
    throw new Error(`No Lemon Squeezy variant configured for tier: ${tier}`);
  }

  configureLemonSqueezy();

  const storeId = process.env.LEMONSQUEEZY_STORE_ID!;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.thecvedge.com";

  const { data, error } = await lsCreateCheckout(storeId, variantId, {
    checkoutData: {
      email: userEmail,
      custom: {
        user_id: userId,
        product_type: "cv_review",
        tier,
        ...metadata,
      },
    },
    productOptions: {
      redirectUrl: `${appUrl}/cv-review/pending`,
    },
  });

  if (error) throw new Error(error.message);
  return data!.data.attributes.url;
}
