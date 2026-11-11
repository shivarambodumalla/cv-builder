import { createAdminClient } from "@/lib/supabase/admin";
import { internalUserIds } from "@/lib/admin/constants";
import { fetchAll, load, must, type Loaded } from "@/lib/admin/query";
import {
  bucketFor,
  bucketStart,
  bucketsIn,
  previousRange,
  type Bucket,
  type ResolvedRange,
} from "@/lib/admin/date-range";

/**
 * Data for the admin Home dashboard. All counting runs in Postgres
 * (migration 00085, admin_* functions), so a 1-year range is a handful of
 * round trips. Series come back already bucketed by day, week or month to
 * match the range. Internal (test/admin) accounts are excluded everywhere.
 */

export interface ChartData {
  bucket: Bucket;
  buckets: { key: string; label: string }[];
}

export interface Kpi {
  value: number;
  previous: number;
  spark: number[];
}

export interface DashboardOverview extends ChartData {
  kpis: {
    pageViews: Kpi;
    visitors: Kpi;
    signups: Kpi;
    newPro: Kpi;
    revenue: Kpi;
    aiCost: Kpi;
  };
  series: {
    pageViews: number[];
    visitors: number[];
    signups: number[];
    newRevenue: number[];
    renewalRevenue: number[];
    newPro: number[];
    paywallBlocked: number[];
    clickedPay: number[];
    aiCost: number[];
  };
}

export interface FunnelStep {
  key: string;
  label: string;
  value: number;
  href?: string;
  hint?: string;
}

export interface TopPage {
  path: string;
  pageViews: number;
  visitors: number;
}

export interface TopUser {
  userId: string;
  userNumber: number;
  name: string;
  email: string;
  plan: string;
  countryCode: string | null;
  actions: number;
  timeMs: number;
  aiCost: number;
}

export type BreakdownDimension = "country" | "channel" | "plan" | "age" | "experience";
export type Breakdown = Record<BreakdownDimension, { bucket: string; users: number }[]>;

const PAYWALL_EVENTS = ["feature_blocked", "Clicked pay button"];
const ATS_EVENTS = ["Ran ATS analysis", "Ran ATS scan"];

type Db = ReturnType<typeof createAdminClient>;

async function exclude(): Promise<string[]> {
  return Array.from(await internalUserIds());
}

/** Sums daily rows into the range's buckets, in bucket order. */
function bucketize<T extends { day: string }>(
  rows: T[],
  buckets: { key: string }[],
  bucket: Bucket,
  value: (row: T) => number,
): number[] {
  const index = new Map(buckets.map((b, i) => [b.key, i]));
  const out = new Array(buckets.length).fill(0);
  for (const row of rows) {
    const i = index.get(bucketStart(String(row.day).slice(0, 10), bucket));
    if (i !== undefined) out[i] += value(row);
  }
  return out;
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const num = (v: unknown) => Number(v ?? 0) || 0;

interface TrafficRow { day: string; page_views: number; visitors: number }
interface SignupRow { day: string; signups: number }
interface EventRow { day: string; event: string; users: number; events: number }
interface PaymentRow {
  day: string;
  new_payments: number;
  new_revenue: number;
  renewals: number;
  renewal_revenue: number;
  refunds: number;
  refund_amount: number;
}
interface AiRow { day: string; cost_usd: number; calls: number }

async function periodTotals(db: Db, r: ResolvedRange, ex: string[]) {
  const [traffic, signups, payments, ai] = await Promise.all([
    db.rpc("admin_traffic_totals", { p_from: r.from, p_to: r.to }),
    db.rpc("admin_signups_daily", { p_from: r.from, p_to: r.to, p_exclude: ex }),
    db.rpc("admin_payments_daily", { p_from: r.from, p_to: r.to, p_exclude: ex }),
    db.rpc("admin_ai_cost_daily", { p_from: r.from, p_to: r.to }),
  ]);
  const t = (must(traffic) as { page_views: number; visitors: number }[])[0];
  const pay = must(payments) as PaymentRow[];
  return {
    pageViews: num(t?.page_views),
    visitors: num(t?.visitors),
    signups: sum((must(signups) as SignupRow[]).map((r) => num(r.signups))),
    newPro: sum(pay.map((p) => num(p.new_payments))),
    revenue: sum(pay.map((p) => num(p.new_revenue) + num(p.renewal_revenue))),
    aiCost: sum((must(ai) as AiRow[]).map((a) => num(a.cost_usd))),
  };
}

export function getOverview(range: ResolvedRange): Promise<Loaded<DashboardOverview>> {
  return load("dashboard overview", async () => {
    const db = createAdminClient();
    const ex = await exclude();
    const bucket = bucketFor(range);
    const buckets = bucketsIn(range, bucket);
    const args = { p_from: range.from, p_to: range.to };

    const [traffic, signups, events, payments, ai, current, previous] = await Promise.all([
      db.rpc("admin_traffic_daily", args),
      db.rpc("admin_signups_daily", { ...args, p_exclude: ex }),
      db.rpc("admin_events_daily", { ...args, p_events: PAYWALL_EVENTS, p_exclude: ex }),
      db.rpc("admin_payments_daily", { ...args, p_exclude: ex }),
      db.rpc("admin_ai_cost_daily", args),
      periodTotals(db, range, ex),
      periodTotals(db, previousRange(range), ex),
    ]);

    const trafficRows = must(traffic) as TrafficRow[];
    const signupRows = must(signups) as SignupRow[];
    const eventRows = must(events) as EventRow[];
    const paymentRows = must(payments) as PaymentRow[];
    const aiRows = must(ai) as AiRow[];
    const by = <T extends { day: string }>(rows: T[], f: (r: T) => number) => bucketize(rows, buckets, bucket, f);
    const eventUsers = (name: string) => by(eventRows.filter((e) => e.event === name), (e) => num(e.users));

    const series = {
      pageViews: by(trafficRows, (r) => num(r.page_views)),
      visitors: by(trafficRows, (r) => num(r.visitors)),
      signups: by(signupRows, (r) => num(r.signups)),
      newRevenue: by(paymentRows, (r) => num(r.new_revenue)),
      renewalRevenue: by(paymentRows, (r) => num(r.renewal_revenue)),
      newPro: by(paymentRows, (r) => num(r.new_payments)),
      paywallBlocked: eventUsers("feature_blocked"),
      clickedPay: eventUsers("Clicked pay button"),
      aiCost: by(aiRows, (r) => num(r.cost_usd)),
    };

    const kpi = (key: keyof typeof current, spark: number[]): Kpi => ({
      value: current[key],
      previous: previous[key],
      spark,
    });

    return {
      bucket,
      buckets,
      series,
      kpis: {
        pageViews: kpi("pageViews", series.pageViews),
        visitors: kpi("visitors", series.visitors),
        signups: kpi("signups", series.signups),
        newPro: kpi("newPro", series.newPro),
        revenue: kpi("revenue", series.newRevenue.map((v, i) => v + series.renewalRevenue[i])),
        aiCost: kpi("aiCost", series.aiCost),
      },
    };
  });
}

/** Visitor to paid, each step counted as distinct people in the range. */
export function getFunnel(range: ResolvedRange): Promise<Loaded<FunnelStep[]>> {
  return load("dashboard funnel", async () => {
    const db = createAdminClient();
    const ex = await exclude();
    const args = { p_from: range.from, p_to: range.to, p_exclude: ex };
    const [traffic, signups, events, ats, paywall, payments, cvRows] = await Promise.all([
      db.rpc("admin_traffic_totals", { p_from: range.from, p_to: range.to }),
      db.rpc("admin_signups_daily", args),
      db.rpc("admin_event_users", { ...args, p_events: ["Downloaded PDF", "Clicked pay button"] }),
      db.rpc("admin_any_event_users", { ...args, p_events: ATS_EVENTS }),
      db.rpc("admin_any_event_users", { ...args, p_events: ["feature_blocked", "Saw upgrade modal"] }),
      db.rpc("admin_payments_daily", args),
      // The "Created CV" activity event is never logged in practice, so count from the table.
      fetchAll<{ user_id: string | null }>((from, to) =>
        db
          .from("cvs")
          .select("user_id")
          .gte("created_at", range.fromIso)
          .lte("created_at", range.toIso)
          .order("id")
          .range(from, to),
      ),
    ]);
    const createdCv = new Set(cvRows.map((r) => r.user_id).filter((id): id is string => !!id && !ex.includes(id))).size;
    const visitors = num((must(traffic) as { visitors: number }[])[0]?.visitors);
    const signupCount = sum((must(signups) as SignupRow[]).map((r) => num(r.signups)));
    const eventUsers = new Map((must(events) as { event: string; users: number }[]).map((e) => [e.event, num(e.users)]));
    const paid = sum((must(payments) as PaymentRow[]).map((p) => num(p.new_payments)));

    return [
      { key: "visitors", label: "Visitors", value: visitors, href: "/admin/growth/traffic", hint: "Unique visitors to marketing pages" },
      { key: "signups", label: "Signed up", value: signupCount, href: "/admin/users" },
      { key: "created_cv", label: "Created a CV", value: createdCv },
      { key: "ats", label: "Ran ATS scan", value: num(must(ats)) },
      { key: "download", label: "Downloaded PDF", value: eventUsers.get("Downloaded PDF") ?? 0 },
      { key: "paywall", label: "Hit the paywall", value: num(must(paywall)), href: "/admin/growth/paywall" },
      { key: "clicked_pay", label: "Clicked pay", value: eventUsers.get("Clicked pay button") ?? 0, href: "/admin/growth/paywall" },
      { key: "paid", label: "Paid", value: paid, href: "/admin/growth/revenue" },
    ];
  });
}

export function getTopPages(range: ResolvedRange, limit = 5): Promise<Loaded<TopPage[]>> {
  return load("dashboard top pages", async () => {
    const rows = must(
      await createAdminClient().rpc("admin_top_pages", { p_from: range.from, p_to: range.to, p_limit: limit }),
    ) as { path: string; page_views: number; visitors: number }[];
    return rows.map((r) => ({ path: r.path, pageViews: num(r.page_views), visitors: num(r.visitors) }));
  });
}

export type TopUsersOrder = "actions" | "time" | "ai_cost";

export function getTopUsers(range: ResolvedRange, order: TopUsersOrder = "actions", limit = 5): Promise<Loaded<TopUser[]>> {
  return load("dashboard top users", async () => {
    const rows = must(
      await createAdminClient().rpc("admin_top_users", {
        p_from: range.from,
        p_to: range.to,
        p_exclude: await exclude(),
        p_order: order,
        p_limit: limit,
      }),
    ) as {
      user_id: string; user_number: number; full_name: string | null; email: string; plan: string;
      country_code: string | null; actions: number; time_ms: number; ai_cost: number;
    }[];
    return rows.map((r) => ({
      userId: r.user_id,
      userNumber: num(r.user_number),
      name: r.full_name || r.email,
      email: r.email,
      plan: r.plan,
      countryCode: r.country_code,
      actions: num(r.actions),
      timeMs: num(r.time_ms),
      aiCost: num(r.ai_cost),
    }));
  });
}

export function getBreakdown(range: ResolvedRange): Promise<Loaded<Breakdown>> {
  return load("dashboard breakdown", async () => {
    const rows = must(
      await createAdminClient().rpc("admin_signup_breakdown", {
        p_from: range.from,
        p_to: range.to,
        p_exclude: await exclude(),
      }),
    ) as { dimension: BreakdownDimension; bucket: string; users: number }[];
    const out: Breakdown = { country: [], channel: [], plan: [], age: [], experience: [] };
    for (const r of rows) out[r.dimension]?.push({ bucket: r.bucket, users: num(r.users) });
    for (const key of Object.keys(out) as BreakdownDimension[]) out[key].sort((a, b) => b.users - a.users);
    return out;
  });
}

/**
 * Whether migration 00085 (the admin_* functions) is in the database. Home
 * falls back to the previous dashboard until it is, instead of showing a
 * page of errors. Any other failure counts as ready, so real query errors
 * still surface on the cards.
 */
export async function dashboardFunctionsReady(): Promise<boolean> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await createAdminClient().rpc("admin_traffic_totals", { p_from: today, p_to: today });
    return !(error && (error.code === "PGRST202" || error.code === "42883"));
  } catch {
    return true;
  }
}
