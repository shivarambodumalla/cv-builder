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
  variantId: string
) {
  configureLemonSqueezy();

  const storeId = process.env.LEMONSQUEEZY_STORE_ID!;

  const { data, error } = await lsCreateCheckout(storeId, variantId, {
    checkoutData: {
      email,
      custom: { user_id: userId },
    },
    productOptions: {
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/billing`,
    },
  });

  if (error) throw new Error(error.message);

  return data!.data.attributes.url;
}

export async function getSubscription(subscriptionId: string) {
  configureLemonSqueezy();

  const { data, error } = await lsGetSubscription(subscriptionId);

  if (error) throw new Error(error.message);

  return data!.data;
}
