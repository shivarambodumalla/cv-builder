import { createAdminClient } from "@/lib/supabase/admin";
import { configureLemonSqueezy } from "@/lib/lemonsqueezy";

/**
 * Reconciles Lemon Squeezy against profiles.
 *
 * Exists because payment and fulfilment are separate systems: a purchase can
 * succeed upstream and never activate here (missing webhook, failed delivery,
 * user closing the tab before the success redirect). Without this, an unactivated
 * paying customer is invisible until they complain — or silently churn.
 */

export type Discrepancy = {
  kind: "not_activated" | "orphaned_payment" | "over_granted";
  subscriptionId: string | null;
  email: string | null;
  userId: string | null;
  detail: string;
  healed: boolean;
};

type LsSubscription = {
  id: string;
  attributes: {
    user_email: string;
    status: string;
    variant_name: string;
    renews_at: string | null;
    created_at: string;
  };
};

function inferPeriod(variantName?: string): string {
  const lower = (variantName || "").toLowerCase();
  if (lower.includes("week")) return "weekly";
  if (lower.includes("year") || lower.includes("annual")) return "yearly";
  return "monthly";
}

async function fetchActiveSubscriptions(): Promise<LsSubscription[]> {
  configureLemonSqueezy();
  const { listSubscriptions } = await import("@lemonsqueezy/lemonsqueezy.js");

  const all: LsSubscription[] = [];
  let page = 1;

  // Paginate: a store with more subscriptions than one page must not be
  // silently truncated, or reconciliation quietly stops covering newer customers.
  for (;;) {
    const { data, error } = await listSubscriptions({
      filter: { storeId: process.env.LEMONSQUEEZY_STORE_ID },
      page: { number: page, size: 100 },
    });
    if (error) throw new Error(error.message);

    const batch = (data?.data ?? []) as unknown as LsSubscription[];
    all.push(...batch);

    const lastPage = data?.meta?.page?.lastPage ?? page;
    if (page >= lastPage || batch.length === 0) break;
    page++;
  }

  // "active" and "on_trial" are entitled; "past_due" still has access upstream.
  return all.filter((s) => ["active", "on_trial", "past_due"].includes(s.attributes.status));
}

export async function reconcileSubscriptions(): Promise<{
  checked: number;
  discrepancies: Discrepancy[];
}> {
  const admin = createAdminClient();
  const subscriptions = await fetchActiveSubscriptions();
  const discrepancies: Discrepancy[] = [];

  const activeIds = new Set<string>();

  for (const sub of subscriptions) {
    activeIds.add(sub.id);
    const email = sub.attributes.user_email?.toLowerCase() ?? null;

    // Match on subscription_id first — it is unambiguous. Fall back to email,
    // but only on an exact single match, so a shared or reused address can
    // never grant Pro to the wrong account.
    let { data: profile } = await admin
      .from("profiles")
      .select("id, email, plan, subscription_status")
      .eq("subscription_id", sub.id)
      .maybeSingle();

    if (!profile && email) {
      const { data: byEmail } = await admin
        .from("profiles")
        .select("id, email, plan, subscription_status")
        .ilike("email", email);
      if (byEmail?.length === 1) profile = byEmail[0];
    }

    if (!profile) {
      // No account to attach the payment to. Check whether they deleted it —
      // that turns an unexplained orphan into an explained one.
      const { data: deleted } = await admin
        .from("account_deletions")
        .select("user_id, deleted_at, subscription_cancelled")
        .or(`subscription_id.eq.${sub.id}${email ? `,email.eq.${email}` : ""}`)
        .maybeSingle();

      discrepancies.push({
        kind: "orphaned_payment",
        subscriptionId: sub.id,
        email,
        userId: deleted?.user_id ?? null,
        detail: deleted
          ? `Account deleted ${deleted.deleted_at}; upstream subscription still ${sub.attributes.status}. Cancel and refund.`
          : `Paying since ${sub.attributes.created_at} but no account exists. Contact customer or refund.`,
        healed: false,
      });
      continue;
    }

    if (profile.plan !== "pro" || profile.subscription_status !== "active") {
      // Upstream says they are paying, so they are entitled. Heal it.
      const { error } = await admin
        .from("profiles")
        .update({
          plan: "pro",
          subscription_status: "active",
          subscription_id: sub.id,
          subscription_period: inferPeriod(sub.attributes.variant_name),
          current_period_end: sub.attributes.renews_at,
        })
        .eq("id", profile.id);

      discrepancies.push({
        kind: "not_activated",
        subscriptionId: sub.id,
        email: profile.email,
        userId: profile.id,
        detail: `Paying upstream (${sub.attributes.status}) but was plan=${profile.plan}, status=${profile.subscription_status}.${error ? ` Heal FAILED: ${error.message}` : " Activated automatically."}`,
        healed: !error,
      });
    }
  }

  // The reverse direction: Pro locally with no live subscription upstream.
  const { data: locallyPro } = await admin
    .from("profiles")
    .select("id, email, subscription_id, current_period_end")
    .eq("plan", "pro")
    .eq("subscription_status", "active");

  for (const p of locallyPro ?? []) {
    // Admin grants have no upstream counterpart by design.
    if (!p.subscription_id || p.subscription_id.startsWith("admin_grant_")) continue;
    if (activeIds.has(p.subscription_id)) continue;

    discrepancies.push({
      kind: "over_granted",
      subscriptionId: p.subscription_id,
      email: p.email,
      userId: p.id,
      detail: `Pro locally but subscription ${p.subscription_id} is not active upstream. Not auto-revoked — verify before downgrading.`,
      healed: false,
    });
  }

  return { checked: subscriptions.length, discrepancies };
}
