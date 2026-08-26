/**
 * Reconciles Lemon Squeezy (source of truth for money) against profiles and
 * subscription_history (source of truth for access).
 *
 * The store had no webhook registered, so every subscription_created /
 * _cancelled / _expired event since launch was dropped. Profiles were only ever
 * activated by the /api/billing/success redirect fallback, which cannot record
 * the LS subscription id and never fires for anyone who closed the tab before
 * being redirected. This script finds and repairs that drift.
 *
 *   npx tsx scripts/reconcile-lemonsqueezy.ts          # dry run, reports only
 *   npx tsx scripts/reconcile-lemonsqueezy.ts --apply  # writes the fixes
 *
 * It never creates profiles: a paid order with no account needs a human to
 * contact the customer, because access is keyed to an auth user that only they
 * can create by signing in with that email. It also never touches a profile
 * whose access was granted by an admin, since that is intentional goodwill
 * Lemon Squeezy has no record of.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
// Lemon Squeezy can end a cancelled subscription before the term the customer
// paid for. Unless the order was actually refunded, we keep access through that
// paid term — the same policy the cancel route and webhook already implement.
// --strict-expiry mirrors Lemon Squeezy's ends_at exactly instead.
const STRICT_EXPIRY = process.argv.includes("--strict-expiry");

const PRICE_BY_PERIOD: Record<string, number> = { weekly: 5, monthly: 14, yearly: 120 };

/** Postgres and Lemon Squeezy format the same instant differently, so compare by value. */
function sameInstant(a: string | null, b: string | null): boolean {
  if (!a || !b) return a === b;
  const ta = new Date(a).getTime();
  const tb = new Date(b).getTime();
  return Number.isFinite(ta) && Number.isFinite(tb) && ta === tb;
}

function inferPeriod(variantName?: string): string {
  const lower = (variantName || "").toLowerCase();
  if (lower.includes("week")) return "weekly";
  if (lower.includes("year") || lower.includes("annual")) return "yearly";
  return "monthly";
}

type LsSub = {
  id: string;
  attributes: {
    user_email: string;
    status: string;
    variant_name: string;
    order_id: number;
    created_at: string;
    renews_at: string | null;
    ends_at: string | null;
    cancelled: boolean;
  };
};

async function isOrderRefunded(apiKey: string, orderId: number): Promise<boolean> {
  const res = await fetch(`https://api.lemonsqueezy.com/v1/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/vnd.api+json" },
  });
  if (!res.ok) return false;
  const json = await res.json();
  return Boolean(json.data?.attributes?.refunded);
}

async function fetchAllSubscriptions(apiKey: string, storeId: string): Promise<LsSub[]> {
  const headers = { Authorization: `Bearer ${apiKey}`, Accept: "application/vnd.api+json" };
  const out: LsSub[] = [];
  let url: string | null =
    `https://api.lemonsqueezy.com/v1/subscriptions?filter[store_id]=${storeId}&page[size]=100`;

  while (url) {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Lemon Squeezy ${res.status}: ${await res.text()}`);
    const json = await res.json();
    out.push(...(json.data ?? []));
    url = json.links?.next ?? null;
  }
  return out;
}

async function main() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!apiKey || !storeId) throw new Error("LEMONSQUEEZY_API_KEY and LEMONSQUEEZY_STORE_ID are required");

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  console.log(APPLY ? "MODE: APPLY (writing changes)\n" : "MODE: DRY RUN (no writes)\n");

  const subs = await fetchAllSubscriptions(apiKey, storeId);
  console.log(`Lemon Squeezy subscriptions: ${subs.length}\n`);

  const orphans: string[] = [];
  let fixes = 0;

  for (const sub of subs) {
    const a = sub.attributes;
    const period = inferPeriod(a.variant_name);
    // LS grants access while active or while a cancelled sub runs out its paid term.
    const isActive = a.status === "active" || a.status === "on_trial";

    const refunded = isActive ? false : await isOrderRefunded(apiKey, a.order_id);
    // Honour the paid term for a cancellation that was never refunded.
    const paidThrough =
      !isActive && !refunded && !STRICT_EXPIRY && a.renews_at ? a.renews_at : a.ends_at || a.renews_at;
    const accessEnd = paidThrough;

    const { data: profile } = await db
      .from("profiles")
      .select("id, email, plan, subscription_status, subscription_id, current_period_end")
      .eq("email", a.user_email)
      .maybeSingle();

    console.log(
      `--- ${a.user_email}  LS:${a.status} sub=${sub.id} order=${a.order_id} ${period}` +
        (refunded ? "  REFUNDED" : "")
    );

    if (!profile) {
      console.log("    ORPHAN: paid order with no profile row — needs manual outreach");
      orphans.push(`${a.user_email} (sub ${sub.id}, order ${a.order_id}, LS status ${a.status})`);
      continue;
    }

    // Access granted by an admin is deliberate goodwill that Lemon Squeezy knows
    // nothing about -- most often for someone who paid but could not be matched
    // to an account. Reconciling it against LS would quietly revoke it.
    if (String(profile.subscription_id ?? "").startsWith("admin_grant_")) {
      console.log(`    skipped: admin-granted access (${profile.subscription_id}) — left untouched`);
      continue;
    }

    const updates: Record<string, unknown> = {};

    if (profile.subscription_id !== sub.id) {
      updates.subscription_id = sub.id;
      console.log(`    subscription_id: ${profile.subscription_id ?? "null"} -> ${sub.id}`);
    }

    const desiredStatus = isActive ? "active" : a.cancelled ? "cancelled" : "expired";
    if (profile.subscription_status !== desiredStatus) {
      updates.subscription_status = desiredStatus;
      console.log(`    subscription_status: ${profile.subscription_status} -> ${desiredStatus}`);
    }

    // Access is kept through the paid term even after cancellation — matching
    // the policy the cancel route and the webhook already implement.
    const stillPaidFor = accessEnd ? new Date(accessEnd) > new Date() : false;
    const desiredPlan = isActive || stillPaidFor ? "pro" : "free";
    if (profile.plan !== desiredPlan) {
      updates.plan = desiredPlan;
      console.log(`    plan: ${profile.plan} -> ${desiredPlan}`);
    }

    if (accessEnd && !sameInstant(profile.current_period_end, accessEnd)) {
      updates.current_period_end = accessEnd;
      updates.subscription_period = period;
      console.log(`    current_period_end: ${profile.current_period_end ?? "null"} -> ${accessEnd}`);
    }

    // Backfill the purchase into subscription_history if it never landed.
    const { data: history } = await db
      .from("subscription_history")
      .select("id")
      .eq("user_id", profile.id)
      .eq("subscription_id", sub.id)
      .maybeSingle();

    const needsHistory = !history;
    if (needsHistory) console.log(`    subscription_history: missing -> insert (${period}, $${PRICE_BY_PERIOD[period]})`);

    if (Object.keys(updates).length === 0 && !needsHistory) {
      console.log("    in sync");
      continue;
    }
    fixes++;

    if (!APPLY) continue;

    if (Object.keys(updates).length > 0) {
      const { error } = await db.from("profiles").update(updates).eq("id", profile.id);
      if (error) console.error("    profile update FAILED:", error.message);
    }
    if (needsHistory) {
      const { error } = await db.from("subscription_history").insert({
        user_id: profile.id,
        plan: "pro",
        period,
        status: isActive ? "active" : "cancelled",
        amount: PRICE_BY_PERIOD[period],
        currency: "USD",
        subscription_id: sub.id,
        started_at: a.created_at,
        ended_at: accessEnd,
      });
      if (error) console.error("    history insert FAILED:", error.message);
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(APPLY ? `Applied fixes to ${fixes} subscription(s).` : `${fixes} subscription(s) need fixes. Re-run with --apply.`);
  if (orphans.length) {
    console.log(`\nORPHANED PAID ORDERS (${orphans.length}) — no account exists, manual action required:`);
    orphans.forEach((o) => console.log(`  - ${o}`));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
