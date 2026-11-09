import {
  lemonSqueezySetup,
  createCheckout as lsCreateCheckout,
  getSubscription as lsGetSubscription,
} from "@lemonsqueezy/lemonsqueezy.js";

export function configureLemonSqueezy() {
  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY!,
    onError: (error) => console.error("LemonSqueezy error:", error.message),
  });
}

export async function createCheckout(
  userId: string,
  email: string,
  variantId: string,
  period?: string,
  discountCode?: string
) {
  configureLemonSqueezy();

  const storeId = process.env.LEMONSQUEEZY_STORE_ID!;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.thecvedge.com");
  const redirectUrl = `${appUrl}/api/billing/success${period ? `?period=${period}` : ""}`;

  const build = (code?: string) =>
    lsCreateCheckout(storeId, variantId, {
      checkoutData: {
        email,
        custom: { user_id: userId },
        // Pre-applies the promo so the checkout opens on the discounted total.
        ...(code ? { discountCode: code } : {}),
      },
      productOptions: {
        redirectUrl,
      },
    });

  let { data, error } = await build(discountCode);

  // A deleted or expired code must never block a payment: fall back to the list price.
  if (error && discountCode) {
    console.warn(`[lemonsqueezy] checkout with code ${discountCode} failed (${error.message}); retrying without it`);
    ({ data, error } = await build());
  }

  if (error) throw new Error(error.message);

  return data!.data.attributes.url;
}

export async function getSubscription(subscriptionId: string) {
  configureLemonSqueezy();

  const { data, error } = await lsGetSubscription(subscriptionId);

  if (error) throw new Error(error.message);

  return data!.data;
}
