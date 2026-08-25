/**
 * Registers (or updates) the Lemon Squeezy webhook.
 *
 * The store had no webhook at all, so subscription_created was never delivered
 * and no purchase could ever self-activate. This script is idempotent: run it
 * again after rotating the secret and it updates in place rather than creating
 * a duplicate endpoint.
 *
 *   npx tsx scripts/register-lemonsqueezy-webhook.ts
 *
 * The signing secret MUST match LEMONSQUEEZY_WEBHOOK_SECRET in the deployment
 * environment. If it does not, every delivery fails signature verification and
 * the store will look correctly configured while silently dropping every event.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

const EVENTS = [
  "subscription_created",
  "subscription_updated",
  "subscription_cancelled",
  "subscription_expired",
  "order_created",
];

async function main() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.thecvedge.com";

  if (!apiKey || !storeId || !secret) {
    throw new Error("LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_STORE_ID and LEMONSQUEEZY_WEBHOOK_SECRET are all required");
  }
  if (secret.includes("local")) {
    throw new Error(`Refusing to register with a local-looking secret (${secret.slice(0, 12)}…). Use the deployed value.`);
  }

  const url = `${appUrl}/api/webhooks/lemonsqueezy`;
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
  };

  const listRes = await fetch(
    `https://api.lemonsqueezy.com/v1/webhooks?filter[store_id]=${storeId}`,
    { headers }
  );
  const list = await listRes.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing = (list.data ?? []).find((w: any) => w.attributes.url === url);

  const attributes = { url, events: EVENTS, secret };

  if (existing) {
    const res = await fetch(`https://api.lemonsqueezy.com/v1/webhooks/${existing.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ data: { type: "webhooks", id: existing.id, attributes } }),
    });
    if (!res.ok) throw new Error(`Update failed: ${res.status} ${await res.text()}`);
    console.log(`Updated webhook ${existing.id} -> ${url}`);
  } else {
    const res = await fetch("https://api.lemonsqueezy.com/v1/webhooks", {
      method: "POST",
      headers,
      body: JSON.stringify({
        data: {
          type: "webhooks",
          attributes,
          relationships: { store: { data: { type: "stores", id: String(storeId) } } },
        },
      }),
    });
    if (!res.ok) throw new Error(`Create failed: ${res.status} ${await res.text()}`);
    const created = await res.json();
    console.log(`Created webhook ${created.data.id} -> ${url}`);
  }

  console.log(`Events: ${EVENTS.join(", ")}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
