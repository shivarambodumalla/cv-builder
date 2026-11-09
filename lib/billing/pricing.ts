/**
 * Single source of truth for what Pro costs and how it is promoted.
 *
 * List prices mirror the Lemon Squeezy variants (pricing_config only supplies
 * variant IDs to checkout). PROMO mirrors the discount codes created in
 * Lemon Squeezy → Discounts; `scripts/check-promo-codes.ts` verifies the two
 * agree. Every price a visitor sees (pricing page, upgrade modal, banners,
 * llms.txt) comes from here, so changing a number or switching the promo off
 * (`PROMO = null`) is one edit.
 */

export type BillingPeriod = "weekly" | "monthly" | "yearly";

export interface ProPlan {
  period: BillingPeriod;
  label: string;
  /** Regular price in USD, what the subscription renews at. */
  listPrice: number;
  per: "week" | "month" | "year";
}

export const PRO_PLANS: Record<BillingPeriod, ProPlan> = {
  weekly: { period: "weekly", label: "Weekly", listPrice: 5, per: "week" },
  monthly: { period: "monthly", label: "Monthly", listPrice: 14, per: "month" },
  yearly: { period: "yearly", label: "Yearly", listPrice: 120, per: "year" },
};

export const BILLING_PERIODS: BillingPeriod[] = ["weekly", "monthly", "yearly"];

export interface Promo {
  /** Discount code as created in Lemon Squeezy; sent with the checkout so it arrives pre-applied. */
  code: string;
  percent: number;
  /** "once" = first payment only, renewals at list price. "forever" = every payment. */
  duration: "once" | "forever";
}

/** Set to `null` to end the promotion everywhere at once. */
export const PROMO: Record<BillingPeriod, Promo> | null = {
  weekly: { code: "PROWEEK", percent: 75, duration: "once" },
  monthly: { code: "PROMONTH", percent: 80, duration: "once" },
  yearly: { code: "PROYEAR", percent: 90, duration: "once" },
};

/**
 * Approximate USD→INR rate for the "≈ ₹" line shown to visitors in India.
 * Display only: Lemon Squeezy charges in USD. Update when the rate drifts.
 */
export const USD_TO_INR = 86;

export function promoFor(period: BillingPeriod): Promo | null {
  return PROMO?.[period] ?? null;
}

/** What the first payment costs, after the promo if there is one. */
export function firstPaymentUsd(period: BillingPeriod): number {
  const plan = PRO_PLANS[period];
  const promo = promoFor(period);
  if (!promo) return plan.listPrice;
  return Math.round(plan.listPrice * (100 - promo.percent)) / 100;
}

/** "$5", "$1.25" */
export function formatUsd(amount: number): string {
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`;
}

/** "₹108", rounded to the rupee. */
export function formatInr(usd: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Math.round(usd * USD_TO_INR)
  );
}

function cheapestPeriod(): BillingPeriod {
  return BILLING_PERIODS.reduce((best, p) => (firstPaymentUsd(p) < firstPaymentUsd(best) ? p : best));
}

/** The cheapest way in, for banners: "From $1.25 for your first week" or "From $2.31/week". */
export function proFromLabel(): string {
  if (PROMO) {
    const p = cheapestPeriod();
    return `From ${formatUsd(firstPaymentUsd(p))} for your first ${PRO_PLANS[p].per}`;
  }
  return `From ${formatUsd(Math.round((PRO_PLANS.yearly.listPrice / 52) * 100) / 100)}/week`;
}

/** Same, as a clause: "Pro from $1.25 for your first week". */
export function proFromPhrase(): string {
  const label = proFromLabel();
  return `Pro ${label.charAt(0).toLowerCase()}${label.slice(1)}`;
}

/** Full price sentence for text surfaces (llms.txt, FAQs). */
export function pricingSentence(): string {
  const list = `${formatUsd(PRO_PLANS.weekly.listPrice)} a week, ${formatUsd(PRO_PLANS.monthly.listPrice)} a month or ${formatUsd(PRO_PLANS.yearly.listPrice)} a year, in USD`;
  if (!PROMO) return `Pro costs ${list}.`;
  const firsts = BILLING_PERIODS.map(
    (p) => `${formatUsd(firstPaymentUsd(p))} for the first ${PRO_PLANS[p].per} with code ${PROMO[p].code}`
  );
  return `Pro costs ${list}. Discount codes cut the first payment: ${firsts.join(", ")}. Renewals are at the regular price.`;
}
