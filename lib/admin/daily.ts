/**
 * Server-side numbers for the admin Home and the Growth › Paywall / Revenue /
 * Traffic tabs. Every function leaves out internal accounts (internalUserIds)
 * and returns a Loaded<T>, so one failed query shows "Couldn't load" in its
 * own block instead of taking the page down.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { internalUserIds } from "@/lib/admin/constants";
import { daysIn, presetRange, rangeFromDays, type ResolvedRange } from "@/lib/admin/date-range";
import { channelLabel } from "@/lib/analytics/channel";
import { plural } from "@/lib/admin/format";
import { fetchAll, load, must, mustCount, type Loaded } from "@/lib/admin/query";

export type { Loaded };

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

/**
 * The Lemon Squeezy webhook started writing renewal rows with this release.
 * Set it to the day the release reaches production: renewal revenue before it
 * is missing from subscription_history.
 */
export const RENEWALS_RECORDED_FROM = "2026-11-11";

/** The free-plan paywall went live on this UTC day (pricing strategy Nov 2026). */
export const PAYWALL_LAUNCH_DAY = "2026-11-09";

// ── Payments ───────────────────────────────────────────────────────────

interface HistoryRow {
  id: string;
  user_id: string;
  period: string | null;
  amount: number | string | null;
  status: string;
  started_at: string;
  subscription_id: string | null;
}

export type PaymentType = "first" | "renewal" | "refund" | "cancel";

export interface PaymentEvent {
  id: string;
  userId: string;
  period: string | null;
  amount: number;
  type: PaymentType;
  at: string;
}

const TYPE_BY_STATUS: Record<string, PaymentType> = {
  active: "first",
  renewal: "renewal",
  refunded: "refund",
  cancelled: "cancel",
};

/**
 * Money rows in a range, oldest first. A first payment can be written twice
 * (the checkout success redirect and the webhook both record it), so first
 * payments are kept once per subscription.
 */
async function paymentEvents(range: ResolvedRange): Promise<PaymentEvent[]> {
  const db = createAdminClient();
  const [internal, rows] = await Promise.all([
    internalUserIds(),
    fetchAll<HistoryRow>((from, to) =>
      db
        .from("subscription_history")
        .select("id, user_id, period, amount, status, started_at, subscription_id")
        .in("status", Object.keys(TYPE_BY_STATUS))
        .neq("plan", "cv_review")
        .gte("started_at", range.fromIso)
        .lte("started_at", range.toIso)
        .order("started_at", { ascending: true })
        .order("id", { ascending: true })
        .range(from, to),
    ),
  ]);

  const seenSubs = new Set<string>();
  const out: PaymentEvent[] = [];
  for (const r of rows) {
    if (internal.has(r.user_id)) continue;
    const type = TYPE_BY_STATUS[r.status];
    const amount = Number(r.amount ?? 0);
    if (type === "first") {
      if (amount <= 0) continue;
      const key = r.subscription_id ?? `row:${r.id}`;
      if (seenSubs.has(key)) continue;
      seenSubs.add(key);
    }
    out.push({ id: r.id, userId: r.user_id, period: r.period, amount, type, at: r.started_at });
  }
  return out;
}

export interface MoneySummary {
  revenue: number;
  firstPayments: { count: number; users: number; sum: number; byPeriod: Record<string, number> };
  renewals: { count: number; sum: number };
  cancellations: number;
  refunds: { count: number; sum: number };
}

function summarizeMoney(events: PaymentEvent[]): MoneySummary {
  const first = events.filter((e) => e.type === "first");
  const renewals = events.filter((e) => e.type === "renewal");
  const refunds = events.filter((e) => e.type === "refund");
  const byPeriod: Record<string, number> = {};
  for (const e of first) {
    const p = e.period ?? "unknown";
    byPeriod[p] = (byPeriod[p] ?? 0) + 1;
  }
  const sum = (list: PaymentEvent[]) => Math.round(list.reduce((s, e) => s + e.amount, 0) * 100) / 100;
  return {
    revenue: sum([...first, ...renewals]),
    firstPayments: { count: first.length, users: new Set(first.map((e) => e.userId)).size, sum: sum(first), byPeriod },
    renewals: { count: renewals.length, sum: sum(renewals) },
    cancellations: events.filter((e) => e.type === "cancel").length,
    refunds: { count: refunds.length, sum: sum(refunds) },
  };
}

export interface ActivePro {
  total: number;
  byPeriod: Record<string, number>;
}

/** Pro now: plan pro and the paid term not over (a cancelled sub keeps Pro until then). */
async function activePro(): Promise<ActivePro> {
  const db = createAdminClient();
  const nowIso = new Date().toISOString();
  const [internal, rows] = await Promise.all([
    internalUserIds(),
    fetchAll<{ id: string; subscription_period: string | null }>((from, to) =>
      db
        .from("profiles")
        .select("id, subscription_period")
        .eq("plan", "pro")
        .or(`current_period_end.is.null,current_period_end.gt.${nowIso}`)
        .order("id")
        .range(from, to),
    ),
  ]);
  const byPeriod: Record<string, number> = {};
  let total = 0;
  for (const r of rows) {
    if (internal.has(r.id)) continue;
    total++;
    const p = r.subscription_period ?? "unknown";
    byPeriod[p] = (byPeriod[p] ?? 0) + 1;
  }
  return { total, byPeriod };
}

const PAYWALL_EVENTS = ["feature_blocked", "Saw upgrade modal"];

/** PostgREST filter value excluding internal ids from a profiles count. */
function notInList(ids: Set<string>): string {
  return `(${Array.from(ids).join(",")})`;
}

async function signupCounts(range: ResolvedRange, internal: Set<string>): Promise<{ all: number; us: number }> {
  const db = createAdminClient();
  const base = () => {
    let q = db
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", range.fromIso)
      .lte("created_at", range.toIso);
    if (internal.size) q = q.not("id", "in", notInList(internal));
    return q;
  };
  const [all, us] = await Promise.all([base(), base().eq("signup_country_code", "US")]);
  return { all: mustCount(all), us: mustCount(us) };
}

// ── Paywall by feature ─────────────────────────────────────────────────

export const PAYWALL_FEATURE_LABELS: Record<string, string> = {
  ats_scan: "ATS scan limit",
  fix_all: "Fix All",
  ai_rewrite: "AI rewrite",
  job_match: "Job Match",
  jd_red_flag: "JD red flags",
  cv_tailor: "Tailor CV",
  cover_letter: "Cover letter",
  offer_eval: "Offer evaluation",
  interview_prep: "Interview prep",
  story_summary: "Story summary",
  portfolio_scan: "Portfolio scan",
  pdf_download: "PDF footer",
  cv_limit: "Resume limit",
  template: "Locked template",
  generic: "Upgrade button",
};

/** Upgrade-modal trigger → the feature key feature_blocked uses. */
const TRIGGER_FEATURE: Record<string, string> = {
  ats_limit: "ats_scan",
  rewrite_limit: "ai_rewrite",
  job_match_limit: "job_match",
  cover_letter_limit: "cover_letter",
  fix_all_limit: "fix_all",
  cv_tailor_limit: "cv_tailor",
  offer_eval_limit: "offer_eval",
  portfolio_scan_limit: "portfolio_scan",
  story_summary_limit: "story_summary",
  interview_prep_limit: "interview_prep",
  cv_limit: "cv_limit",
  template_locked: "template",
  download: "pdf_download",
  generic: "generic",
};

export function paywallFeatureLabel(key: string): string {
  return PAYWALL_FEATURE_LABELS[key] ?? key.replace(/_/g, " ");
}

export interface PaywallRow {
  feature: string;
  label: string;
  /** Users blocked by the server or shown the upgrade modal for this feature. */
  hit: number;
  /** Users shown the upgrade modal for it. */
  modal: number;
  /** Users whose pay click came within 24h of hitting this feature last. */
  clickedPay: number;
  paid: number;
}

export interface PaywallSummary {
  rows: PaywallRow[];
  totals: { hit: number; modal: number; clickedPay: number; paid: number };
  /** Pay clicks / payments with no paywall in the 24h before (pricing page, banners). */
  direct: { clickedPay: number; paid: number };
  abandoned: { checkouts: number; users: number };
}

interface WallTouch {
  userId: string;
  feature: string;
  modal: boolean;
  at: number;
}

interface ActivityRow {
  user_id: string | null;
  event: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

async function paywallSummary(range: ResolvedRange): Promise<PaywallSummary> {
  const db = createAdminClient();
  const lookbackIso = new Date(Date.parse(range.fromIso) - DAY_MS).toISOString();
  const [internal, activity, intents, payments] = await Promise.all([
    internalUserIds(),
    fetchAll<ActivityRow>((from, to) =>
      db
        .from("user_activity")
        .select("user_id, event, metadata, created_at")
        .in("event", PAYWALL_EVENTS)
        .gte("created_at", lookbackIso)
        .lte("created_at", range.toIso)
        .order("id")
        .range(from, to),
    ),
    fetchAll<{ user_id: string; created_at: string; converted_at: string | null }>((from, to) =>
      db
        .from("checkout_intents")
        .select("user_id, created_at, converted_at")
        .gte("created_at", range.fromIso)
        .lte("created_at", range.toIso)
        .order("id")
        .range(from, to),
    ),
    paymentEvents(range),
  ]);

  const touchesByUser = new Map<string, WallTouch[]>();
  for (const r of activity) {
    if (!r.user_id || internal.has(r.user_id)) continue;
    const meta = r.metadata ?? {};
    const modal = r.event === "Saw upgrade modal";
    const feature = modal
      ? TRIGGER_FEATURE[String(meta.trigger ?? "generic")] ?? String(meta.trigger ?? "generic")
      : String(meta.feature ?? "unknown");
    const list = touchesByUser.get(r.user_id) ?? [];
    list.push({ userId: r.user_id, feature, modal, at: Date.parse(r.created_at) });
    touchesByUser.set(r.user_id, list);
  }
  for (const list of touchesByUser.values()) list.sort((a, b) => a.at - b.at);

  const fromMs = Date.parse(range.fromIso);
  const sets = new Map<string, { hit: Set<string>; modal: Set<string>; clickedPay: Set<string>; paid: Set<string> }>();
  const bucket = (feature: string) => {
    let b = sets.get(feature);
    if (!b) {
      b = { hit: new Set(), modal: new Set(), clickedPay: new Set(), paid: new Set() };
      sets.set(feature, b);
    }
    return b;
  };

  const allHit = new Set<string>();
  const allModal = new Set<string>();
  for (const list of touchesByUser.values()) {
    for (const t of list) {
      if (t.at < fromMs) continue;
      const b = bucket(t.feature);
      b.hit.add(t.userId);
      if (t.modal) {
        b.modal.add(t.userId);
        allModal.add(t.userId);
      }
      allHit.add(t.userId);
    }
  }

  /** The user's last paywall touch in the 24h before `at`. */
  const lastTouch = (userId: string, at: number): WallTouch | undefined => {
    const list = touchesByUser.get(userId);
    if (!list) return undefined;
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].at > at) continue;
      return at - list[i].at <= DAY_MS ? list[i] : undefined;
    }
    return undefined;
  };

  const clicked = new Set<string>();
  const directClicked = new Set<string>();
  const abandoned = { checkouts: 0, users: new Set<string>() };
  for (const i of intents) {
    if (internal.has(i.user_id)) continue;
    if (!i.converted_at) {
      abandoned.checkouts++;
      abandoned.users.add(i.user_id);
    }
    const touch = lastTouch(i.user_id, Date.parse(i.created_at));
    if (touch) {
      bucket(touch.feature).clickedPay.add(i.user_id);
      clicked.add(i.user_id);
    } else {
      directClicked.add(i.user_id);
    }
  }

  const paid = new Set<string>();
  const directPaid = new Set<string>();
  for (const p of payments) {
    if (p.type !== "first") continue;
    const touch = lastTouch(p.userId, Date.parse(p.at));
    if (touch) {
      bucket(touch.feature).paid.add(p.userId);
      paid.add(p.userId);
    } else {
      directPaid.add(p.userId);
    }
  }

  const rows: PaywallRow[] = Array.from(sets.entries())
    .map(([feature, b]) => ({
      feature,
      label: paywallFeatureLabel(feature),
      hit: b.hit.size,
      modal: b.modal.size,
      clickedPay: b.clickedPay.size,
      paid: b.paid.size,
    }))
    .sort((a, b) => b.hit - a.hit || b.paid - a.paid || a.label.localeCompare(b.label));

  return {
    rows,
    totals: { hit: allHit.size, modal: allModal.size, clickedPay: clicked.size, paid: paid.size },
    direct: {
      clickedPay: Array.from(directClicked).filter((id) => !clicked.has(id)).length,
      paid: Array.from(directPaid).filter((id) => !paid.has(id)).length,
    },
    abandoned: { checkouts: abandoned.checkouts, users: abandoned.users.size },
  };
}

export function getPaywall(range: ResolvedRange): Promise<Loaded<PaywallSummary>> {
  return load("paywall", () => paywallSummary(range));
}

export interface PaywallEra {
  label: string;
  range: ResolvedRange;
  signups: number;
  summary: PaywallSummary;
}

/** The 30 days before the free-plan paywall launch against the days since. */
export function getPaywallLaunchComparison(): Promise<Loaded<{ before: PaywallEra; after: PaywallEra }>> {
  return load("paywall launch comparison", async () => {
    const launch = Date.parse(`${PAYWALL_LAUNCH_DAY}T00:00:00Z`);
    const day = (ms: number) => new Date(ms).toISOString().slice(0, 10);
    const before = rangeFromDays(day(launch - 30 * DAY_MS), day(launch - DAY_MS));
    const after = rangeFromDays(PAYWALL_LAUNCH_DAY, presetRange("today").to);
    const internal = await internalUserIds();
    const [bSum, aSum, bSign, aSign] = await Promise.all([
      paywallSummary(before),
      paywallSummary(after),
      signupCounts(before, internal),
      signupCounts(after, internal),
    ]);
    return {
      before: { label: "30 days before", range: before, signups: bSign.all, summary: bSum },
      after: { label: `Since ${PAYWALL_LAUNCH_DAY}`, range: after, signups: aSign.all, summary: aSum },
    };
  });
}

// ── Needs a reply ──────────────────────────────────────────────────────

export type ReplyTone = "error" | "warning" | "success";

export interface ReplyItem {
  key: string;
  tone: ReplyTone;
  text: string;
  detail?: string;
  href: string;
  linkLabel: string;
  /** Oldest waiting item, for ordering within a tone. */
  since?: string;
}

const TONE_RANK: Record<ReplyTone, number> = { error: 0, warning: 1, success: 2 };

function waitingFor(iso: string): string {
  const hours = Math.floor((Date.now() - Date.parse(iso)) / HOUR_MS);
  if (hours < 1) return "under an hour";
  if (hours < 48) return plural(hours, "hour");
  return plural(Math.floor(hours / 24), "day");
}

/** One source of work. A failed check becomes an error row, never a silent gap. */
async function replySource(name: string, fn: () => Promise<ReplyItem[]>): Promise<ReplyItem[]> {
  try {
    return await fn();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[admin/daily] needs-reply ${name} failed:`, message);
    return [{ key: `${name}-failed`, tone: "error", text: `Couldn't check ${name}`, detail: message, href: "/admin", linkLabel: "Retry" }];
  }
}

export async function getNeedsReply(): Promise<ReplyItem[]> {
  const db = createAdminClient();

  const sources = await Promise.all([
    replySource("CV reviews", async () => {
      const rows = must(
        await db
          .from("cv_reviews")
          .select("created_at")
          .in("status", ["pending", "in_progress"])
          .order("created_at", { ascending: true }),
      ) as { created_at: string }[];
      if (!rows.length) return [];
      const oldest = rows[0].created_at;
      const late = Date.now() - Date.parse(oldest) > DAY_MS; // the promise is a reply within 24 hours
      return [{
        key: "reviews",
        tone: late ? "error" : "warning",
        text: `${plural(rows.length, "CV review")} waiting`,
        detail: `oldest ${waitingFor(oldest)}`,
        href: "/admin/reviews",
        linkLabel: "Reviews",
        since: oldest,
      }];
    }),
    replySource("guarantee claims", async () => {
      const claims = must(
        await db
          .from("guarantee_claims")
          .select("id, user_id, current_score, created_at")
          .in("status", ["pending", "reviewing"])
          .order("created_at", { ascending: true }),
      ) as { id: string; user_id: string; current_score: number | null; created_at: string }[];
      if (!claims.length) return [];
      const profiles = must(
        await db.from("profiles").select("id, user_number").in("id", claims.map((c) => c.user_id)),
      ) as { id: string; user_number: number | null }[];
      const numberOf = new Map(profiles.map((p) => [p.id, p.user_number]));
      return claims.map((c) => {
        const n = numberOf.get(c.user_id);
        return {
          key: `claim-${c.id}`,
          tone: "error" as const,
          text: `80+ guarantee claim${c.current_score != null ? ` (score ${c.current_score})` : ""}`,
          detail: `waiting ${waitingFor(c.created_at)}`,
          href: n ? `/admin/users/${n}` : "/admin/users",
          linkLabel: n ? `User #${n}` : "Users",
          since: c.created_at,
        };
      });
    }),
    replySource("tests", async () => {
      const run = must(
        await db
          .from("test_runs")
          .select("id, run_number, status, failed, created_at")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ) as { id: string; run_number: number; status: string; failed: number | null; created_at: string } | null;
      if (!run || (run.status !== "failed" && run.status !== "error")) return [];
      return [{
        key: "tests",
        tone: "error",
        text: run.status === "error" ? `E2E run #${run.run_number} errored` : `E2E run #${run.run_number}: ${plural(run.failed ?? 0, "test")} failed`,
        detail: waitingFor(run.created_at) + " ago",
        href: `/admin/tests/runs/${run.id}`,
        linkLabel: "Run",
        since: run.created_at,
      }];
    }),
    replySource("feedback", async () => {
      const rows = must(
        await db
          .from("feedback")
          .select("created_at")
          .lte("rating", 3)
          .eq("status", "new")
          .order("created_at", { ascending: true }),
      ) as { created_at: string }[];
      if (!rows.length) return [];
      return [{
        key: "feedback",
        tone: "warning",
        text: `${plural(rows.length, "low rating")} (3★ or less) unread`,
        detail: `oldest ${waitingFor(rows[0].created_at)}`,
        href: "/admin/feedback",
        linkLabel: "Feedback",
        since: rows[0].created_at,
      }];
    }),
    replySource("course leads", async () => {
      const rows = must(
        await db
          .from("mentorship_leads")
          .select("created_at")
          .eq("status", "new")
          .order("created_at", { ascending: true }),
      ) as { created_at: string }[];
      if (!rows.length) return [];
      return [{
        key: "leads",
        tone: "warning",
        text: `${plural(rows.length, "new course lead")}`,
        detail: `oldest ${waitingFor(rows[0].created_at)}`,
        href: "/admin/course/leads",
        linkLabel: "Leads",
        since: rows[0].created_at,
      }];
    }),
  ]);

  return sources
    .flat()
    .sort((a, b) => TONE_RANK[a.tone] - TONE_RANK[b.tone] || (a.since ?? "").localeCompare(b.since ?? ""));
}

// ── Revenue detail ─────────────────────────────────────────────────────

export interface RevenueDay {
  day: string;
  first: number;
  renewal: number;
  refund: number;
}

export interface RevenueDetail {
  summary: MoneySummary;
  activePro: ActivePro;
  days: RevenueDay[];
  latest: (PaymentEvent & { userNumber: number | null })[];
}

export function getRevenue(range: ResolvedRange): Promise<Loaded<RevenueDetail>> {
  return load("revenue", async () => {
    const db = createAdminClient();
    const [events, pro] = await Promise.all([paymentEvents(range), activePro()]);
    const byDay = new Map(daysIn(range).map((day) => [day, { day, first: 0, renewal: 0, refund: 0 }]));
    for (const e of events) {
      const d = byDay.get(e.at.slice(0, 10));
      if (!d) continue;
      if (e.type === "first") d.first += e.amount;
      else if (e.type === "renewal") d.renewal += e.amount;
      else if (e.type === "refund") d.refund += e.amount;
    }
    const latestEvents = events.filter((e) => e.type !== "cancel").slice(-25).reverse();
    const ids = Array.from(new Set(latestEvents.map((e) => e.userId)));
    const profiles = ids.length
      ? (must(await db.from("profiles").select("id, user_number").in("id", ids)) as { id: string; user_number: number | null }[])
      : [];
    const numberOf = new Map(profiles.map((p) => [p.id, p.user_number]));
    return {
      summary: summarizeMoney(events),
      activePro: pro,
      days: Array.from(byDay.values()),
      latest: latestEvents.map((e) => ({ ...e, userNumber: numberOf.get(e.userId) ?? null })),
    };
  });
}

// ── Signups by channel ─────────────────────────────────────────────────

export interface ChannelRow {
  channel: string;
  label: string;
  signups: number;
  sources: { source: string; signups: number }[];
}

export function getSignupsByChannel(range: ResolvedRange): Promise<Loaded<{ total: number; rows: ChannelRow[] }>> {
  return load("signups by channel", async () => {
    const db = createAdminClient();
    const [internal, rows] = await Promise.all([
      internalUserIds(),
      fetchAll<{ id: string; acquisition_channel: string | null; acquisition_source: string | null }>((from, to) =>
        db
          .from("profiles")
          .select("id, acquisition_channel, acquisition_source")
          .gte("created_at", range.fromIso)
          .lte("created_at", range.toIso)
          .order("id")
          .range(from, to),
      ),
    ]);
    const byChannel = new Map<string, Map<string, number>>();
    let total = 0;
    for (const r of rows) {
      if (internal.has(r.id)) continue;
      total++;
      const channel = r.acquisition_channel ?? "unknown";
      const sources = byChannel.get(channel) ?? new Map<string, number>();
      const source = r.acquisition_source ?? "(none)";
      sources.set(source, (sources.get(source) ?? 0) + 1);
      byChannel.set(channel, sources);
    }
    const out: ChannelRow[] = Array.from(byChannel.entries())
      .map(([channel, sources]) => ({
        channel,
        label: channelLabel(channel),
        signups: Array.from(sources.values()).reduce((s, n) => s + n, 0),
        sources: Array.from(sources.entries())
          .map(([source, signups]) => ({ source, signups }))
          .sort((a, b) => b.signups - a.signups),
      }))
      .sort((a, b) => b.signups - a.signups);
    return { total, rows: out };
  });
}
