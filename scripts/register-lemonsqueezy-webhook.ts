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
 * Rather than guess at that, this script asks the deployed endpoint directly
 * before registering anything -- see verifySecretAgainstDeployment.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import crypto from "crypto";

// Only events the handler actually acts on. Subscribing to more just produces
// traffic that falls through to the default branch. This list is authoritative:
// re-running the script resets the store's selection to exactly these.
const EVENTS = [
  "subscription_created",
  "subscription_updated",
  "subscription_cancelled",
  "subscription_expired",
  "subscription_payment_failed",
  "subscription_payment_refunded",
  "order_created",
  "order_refunded",
];

/**
 * Asks the deployed endpoint whether it verifies against this secret, without
 * writing anything. The route checks the HMAC signature before it parses the
 * body, so a signed but deliberately malformed payload separates the two cases:
 * 400 means the signature passed and only JSON parsing failed, 401 means the
 * deployment is holding a different secret. Nothing is persisted either way.
 *
 * This replaces an earlier string heuristic that guessed whether a secret
 * "looked local" -- it produced false positives on perfectly valid secrets.
 */
async function verifySecretAgainstDeployment(url: string, secret: string) {
  const body = "{not-valid-json";
  const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-signature": signature },
      body,
    });
  } catch (err) {
    throw new Error(`Could not reach ${url}: ${(err as Error).message}`);
  }

  if (res.status === 400) {
    console.log(`Verified: ${url} accepts this signing secret.`);
    return;
  }
  if (res.status === 401) {
    throw new Error(
      `Refusing to register: ${url} rejected this signature, so the deployment holds a ` +
        `different LEMONSQUEEZY_WEBHOOK_SECRET. Registering anyway would look correct ` +
        `while silently dropping every event. Set both sides to the same value first.`
    );
  }
  if (res.status === 500) {
    throw new Error(`Refusing to register: ${url} has no LEMONSQUEEZY_WEBHOOK_SECRET set.`);
  }
  throw new Error(`Refusing to register: unexpected ${res.status} from ${url}: ${(await res.text()).slice(0, 200)}`);
}

async function main() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.thecvedge.com";

  if (!apiKey || !storeId || !secret) {
    throw new Error("LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_STORE_ID and LEMONSQUEEZY_WEBHOOK_SECRET are all required");
  }
  const url = `${appUrl}/api/webhooks/lemonsqueezy`;

  await verifySecretAgainstDeployment(url, secret);
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
