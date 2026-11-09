/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Verifies that lib/billing/pricing.ts matches Lemon Squeezy (read-only):
 * every promo code exists, is published, has the same percentage and duration,
 * and every variant's list price matches PRO_PLANS. Run before a deploy that
 * touches pricing:  npx tsx scripts/check-promo-codes.ts
 * Exits 1 on any mismatch so it can gate a release.
 */
require("dotenv").config({ path: ".env.local" });

import { BILLING_PERIODS, PRO_PLANS, PROMO } from "../lib/billing/pricing";

const API = "https://api.lemonsqueezy.com/v1";
const headers = {
  Accept: "application/vnd.api+json",
  Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY ?? ""}`,
};

type Discount = { attributes: { code: string; amount: number; amount_type: string; status: string; duration: string } };
type Variant = { id: string; attributes: { name: string; price: number; status: string } };

async function get<T>(path: string): Promise<T[]> {
  const res = await fetch(`${API}${path}`, { headers });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  const body = (await res.json()) as { data: T[] };
  return body.data;
}

async function main() {
  const problems: string[] = [];
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!process.env.LEMONSQUEEZY_API_KEY || !storeId) {
    console.error("LEMONSQUEEZY_API_KEY and LEMONSQUEEZY_STORE_ID must be set in .env.local");
    process.exit(1);
  }

  if (PROMO) {
    const discounts = await get<Discount>(`/discounts?filter[store_id]=${storeId}&page[size]=100`);
    for (const period of BILLING_PERIODS) {
      const want = PROMO[period];
      const found = discounts.find((d) => d.attributes.code === want.code);
      if (!found) {
        problems.push(`${want.code}: not found in Lemon Squeezy`);
        continue;
      }
      const a = found.attributes;
      if (a.status !== "published") problems.push(`${want.code}: status is ${a.status}, not published`);
      if (a.amount_type !== "percent") problems.push(`${want.code}: amount_type is ${a.amount_type}, expected percent`);
      if (a.amount !== want.percent) problems.push(`${want.code}: ${a.amount}% in Lemon Squeezy, ${want.percent}% in pricing.ts`);
      if (a.duration !== want.duration) problems.push(`${want.code}: duration ${a.duration} in Lemon Squeezy, ${want.duration} in pricing.ts`);
      console.log(`${want.code}: ${a.amount}% ${a.duration} ${a.status}`);
    }
  } else {
    console.log("PROMO is null: no codes to check");
  }

  // Variant list prices (pricing_config holds the variant IDs; the names match PRO_PLANS labels).
  const variants = await get<Variant>(`/variants?page[size]=100`);
  for (const period of BILLING_PERIODS) {
    const plan = PRO_PLANS[period];
    const v = variants.find((x) => x.attributes.name === plan.label && x.attributes.status === "published");
    if (!v) {
      problems.push(`${plan.label}: no published variant with that name`);
      continue;
    }
    const price = v.attributes.price / 100;
    if (price !== plan.listPrice) problems.push(`${plan.label}: variant ${v.id} is $${price}, pricing.ts says $${plan.listPrice}`);
    console.log(`${plan.label}: variant ${v.id} $${price}`);
  }

  if (problems.length) {
    console.error("\nMISMATCH:\n- " + problems.join("\n- "));
    process.exit(1);
  }
  console.log("\nOK: pricing.ts matches Lemon Squeezy");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
