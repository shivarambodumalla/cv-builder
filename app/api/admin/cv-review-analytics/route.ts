import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { REVIEW_TIERS } from "@/lib/cv-review/config";
import { getGa4AccessToken, getGscAccessToken, isGa4Configured, isGscConfigured } from "@/lib/gsc/client";

export const dynamic = "force-dynamic";

const GA4_API = "https://analyticsdata.googleapis.com/v1beta";
const GSC_API = "https://searchconsole.googleapis.com/webmasters/v3";

async function fetchGA4EventCounts(
  token: string,
  propertyId: string,
  from: string,
  to: string,
  events: string[]
): Promise<Record<string, number> | null> {
  try {
    const res = await fetch(`${GA4_API}/properties/${propertyId}:runReport`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate: from, endDate: to }],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: { fieldName: "eventName", inListFilter: { values: events } },
        },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const counts: Record<string, number> = {};
    for (const row of data.rows ?? []) {
      counts[row.dimensionValues[0].value] = Number(row.metricValues[0].value);
    }
    return counts;
  } catch {
    return null;
  }
}

async function fetchGA4PageViews(
  token: string,
  propertyId: string,
  from: string,
  to: string,
  pagePath: string
): Promise<number> {
  try {
    const res = await fetch(`${GA4_API}/properties/${propertyId}:runReport`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate: from, endDate: to }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        dimensionFilter: {
          filter: { fieldName: "pagePath", stringFilter: { matchType: "BEGINS_WITH", value: pagePath } },
        },
      }),
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return (data.rows ?? []).reduce((sum: number, r: { metricValues: { value: string }[] }) => sum + Number(r.metricValues[0].value), 0);
  } catch {
    return 0;
  }
}

async function fetchGA4DailyTrend(
  token: string,
  propertyId: string,
  from: string,
  to: string
): Promise<{ date: string; event: string; count: number }[]> {
  try {
    const res = await fetch(`${GA4_API}/properties/${propertyId}:runReport`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate: from, endDate: to }],
        dimensions: [{ name: "date" }, { name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            inListFilter: { values: ["cv_review_funnel_view", "cv_review_funnel_click", "begin_checkout", "cv_review_section_view", "purchase"] },
          },
        },
        orderBys: [{ dimension: { dimensionName: "date" } }],
        limit: 2000,
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.rows ?? []).map((r: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }) => ({
      date: r.dimensionValues[0].value, // YYYYMMDD
      event: r.dimensionValues[1].value,
      count: Number(r.metricValues[0].value),
    }));
  } catch {
    return [];
  }
}

async function fetchGSCCvReview(
  token: string,
  siteUrl: string,
  from: string,
  to: string
): Promise<{ totalClicks: number; totalImpressions: number; avgCtr: number; avgPosition: number; queries: { query: string; clicks: number; impressions: number; ctr: number; position: number }[] }> {
  const empty = { totalClicks: 0, totalImpressions: 0, avgCtr: 0, avgPosition: 0, queries: [] };
  try {
    const [summaryRes, queryRes] = await Promise.all([
      fetch(`${GSC_API}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: from,
          endDate: to,
          dimensions: ["page"],
          dimensionFilterGroups: [{
            filters: [{ dimension: "page", operator: "contains", expression: "/cv-review" }],
          }],
          rowLimit: 5,
        }),
      }),
      fetch(`${GSC_API}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: from,
          endDate: to,
          dimensions: ["query"],
          dimensionFilterGroups: [{
            filters: [{ dimension: "page", operator: "contains", expression: "/cv-review" }],
          }],
          rowLimit: 20,
          orderBy: [{ fieldName: "clicks", sortOrder: "DESCENDING" }],
        }),
      }),
    ]);

    if (!summaryRes.ok || !queryRes.ok) return empty;
    const [summaryData, queryData] = await Promise.all([summaryRes.json(), queryRes.json()]);

    const totalClicks = (summaryData.rows ?? []).reduce((s: number, r: { clicks: number }) => s + r.clicks, 0);
    const totalImpressions = (summaryData.rows ?? []).reduce((s: number, r: { impressions: number }) => s + r.impressions, 0);
    const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
    const positionSum = (summaryData.rows ?? []).reduce((s: number, r: { position: number; clicks: number }) => s + r.position * r.clicks, 0);
    const avgPosition = totalClicks > 0 ? positionSum / totalClicks : 0;

    const queries = (queryData.rows ?? []).map((r: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }) => ({
      query: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r.ctr,
      position: r.position,
    }));

    return { totalClicks, totalImpressions, avgCtr, avgPosition, queries };
  } catch {
    return empty;
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ?? new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const to = searchParams.get("to") ?? new Date().toISOString().slice(0, 10);

  const supabase = createAdminClient();

  const fromTs = from + "T00:00:00.000Z";
  const toTs = to + "T23:59:59.999Z";

  // DB queries — all parallel
  const { data: reviews } = await supabase
    .from("cv_reviews")
    .select("id, status, tier, price_paid, created_at, user_id")
    .gte("created_at", fromTs)
    .lte("created_at", toTs)
    .order("created_at", { ascending: false });

  const all = reviews ?? [];

  const totalRevenue = all.reduce((s, r) => s + (r.price_paid ?? 0), 0);
  const avgOrderValue = all.length > 0 ? totalRevenue / all.length : 0;

  const tierStats: Record<string, { count: number; revenue: number; price: number; name: string }> = {};
  for (const key of Object.keys(REVIEW_TIERS) as (keyof typeof REVIEW_TIERS)[]) {
    const tierReviews = all.filter((r) => r.tier === key);
    tierStats[key] = {
      name: REVIEW_TIERS[key].name,
      price: REVIEW_TIERS[key].price,
      count: tierReviews.length,
      revenue: tierReviews.reduce((s, r) => s + (r.price_paid ?? 0), 0),
    };
  }

  const statusStats = {
    pending: all.filter((r) => r.status === "pending").length,
    in_progress: all.filter((r) => r.status === "in_progress").length,
    completed: all.filter((r) => r.status === "completed").length,
    cancelled: all.filter((r) => r.status === "cancelled").length,
  };

  // Revenue by day (fill gaps)
  const revenueByDay = new Map<string, { revenue: number; orders: number }>();
  for (const r of all) {
    const day = r.created_at.slice(0, 10);
    const existing = revenueByDay.get(day) ?? { revenue: 0, orders: 0 };
    revenueByDay.set(day, { revenue: existing.revenue + (r.price_paid ?? 0), orders: existing.orders + 1 });
  }
  const revenueTimeline: { date: string; revenue: number; orders: number }[] = [];
  const startD = new Date(from + "T00:00:00Z");
  const endD = new Date(to + "T00:00:00Z");
  for (let d = new Date(startD); d <= endD; d.setUTCDate(d.getUTCDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    revenueTimeline.push({ date: key, ...(revenueByDay.get(key) ?? { revenue: 0, orders: 0 }) });
  }

  // GA4 + GSC — use same OAuth token as marketing analytics
  const propertyId = process.env.GA4_PROPERTY_ID;
  const siteUrl = process.env.GSC_SITE_URL;
  const ga4On = isGa4Configured() && !!propertyId;
  const gscOn = isGscConfigured() && !!siteUrl;

  // GA4 data lags ~24-48h — cap to yesterday
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const ga4From = from < yesterday ? from : yesterday;
  const ga4To = to < yesterday ? to : yesterday;

  const [ga4Token, gscToken] = await Promise.all([
    ga4On ? getGa4AccessToken() : Promise.resolve(null),
    gscOn ? getGscAccessToken() : Promise.resolve(null),
  ]);

  const [ga4Events, ga4PageViews, ga4DailyRows, gscData] = await Promise.all([
    ga4Token && propertyId
      ? fetchGA4EventCounts(ga4Token, propertyId, ga4From, ga4To, [
          "cv_review_funnel_view",
          "cv_review_funnel_click",
          "cv_review_checkout_view",
          "begin_checkout",
          "purchase",
        ])
      : Promise.resolve(null),
    ga4Token && propertyId
      ? fetchGA4PageViews(ga4Token, propertyId, ga4From, ga4To, "/cv-review")
      : Promise.resolve(0),
    ga4Token && propertyId
      ? fetchGA4DailyTrend(ga4Token, propertyId, ga4From, ga4To)
      : Promise.resolve([]),
    gscToken && siteUrl
      ? fetchGSCCvReview(gscToken, siteUrl, ga4From, ga4To)
      : Promise.resolve({ totalClicks: 0, totalImpressions: 0, avgCtr: 0, avgPosition: 0, queries: [] }),
  ]);

  // Build funnel steps — prefer GA4 for top-of-funnel, DB for conversions
  const pageViews = ga4Events?.cv_review_funnel_view ?? ga4PageViews ?? 0;
  const ctaClicks = ga4Events?.cv_review_funnel_click ?? 0;
  const checkoutViews = ga4Events?.cv_review_checkout_view ?? 0;
  const beginCheckout = ga4Events?.begin_checkout ?? 0;
  const ga4Purchases = ga4Events?.purchase ?? 0;
  const purchases = all.length;

  const funnel = [
    { key: "page_views", label: "Page Views", count: pageViews, source: "ga4", color: "bg-purple-500" },
    { key: "cta_clicks", label: "CTA Clicks", count: ctaClicks, source: "ga4", color: "bg-blue-500" },
    { key: "checkout_views", label: "Checkout Views", count: checkoutViews, source: "ga4", color: "bg-[#1a7a6d]" },
    { key: "begin_checkout", label: "Begin Checkout", count: beginCheckout, source: "ga4", color: "bg-amber-500" },
    { key: "ga4_purchases", label: "GA4 Purchases", count: ga4Purchases, source: "ga4", color: "bg-[#065F46]" },
    { key: "purchases", label: "DB Orders", count: purchases, source: "db", color: "bg-emerald-700" },
  ];

  // Daily GA4 trend keyed by date
  const ga4ByDate: Record<string, { views: number; clicks: number; checkouts: number; purchases: number; sectionViews: number }> = {};
  for (const row of ga4DailyRows) {
    const dateKey = `${row.date.slice(0, 4)}-${row.date.slice(4, 6)}-${row.date.slice(6, 8)}`;
    if (!ga4ByDate[dateKey]) ga4ByDate[dateKey] = { views: 0, clicks: 0, checkouts: 0, purchases: 0, sectionViews: 0 };
    if (row.event === "cv_review_funnel_view") ga4ByDate[dateKey].views += row.count;
    if (row.event === "cv_review_funnel_click") ga4ByDate[dateKey].clicks += row.count;
    if (row.event === "begin_checkout") ga4ByDate[dateKey].checkouts += row.count;
    if (row.event === "purchase") ga4ByDate[dateKey].purchases = (ga4ByDate[dateKey].purchases ?? 0) + row.count;
    if (row.event === "cv_review_section_view") ga4ByDate[dateKey].sectionViews = (ga4ByDate[dateKey].sectionViews ?? 0) + row.count;
  }

  // Merge revenue timeline with GA4 daily
  const timeline = revenueTimeline.map((pt) => ({
    ...pt,
    ga4Views: ga4ByDate[pt.date]?.views ?? 0,
    ga4Clicks: ga4ByDate[pt.date]?.clicks ?? 0,
    ga4Checkouts: ga4ByDate[pt.date]?.checkouts ?? 0,
    ga4Purchases: ga4ByDate[pt.date]?.purchases ?? 0,
    ga4SectionViews: ga4ByDate[pt.date]?.sectionViews ?? 0,
  }));

  return NextResponse.json({
    totalRevenue,
    totalOrders: purchases,
    avgOrderValue,
    tierStats,
    statusStats,
    funnel,
    timeline,
    recentOrders: all.slice(0, 15).map((r) => ({
      id: r.id,
      status: r.status,
      tier: r.tier,
      price_paid: r.price_paid,
      created_at: r.created_at,
      user_id: r.user_id,
    })),
    gsc: {
      clicks: gscData.totalClicks,
      impressions: gscData.totalImpressions,
      ctr: gscData.avgCtr,
      position: gscData.avgPosition,
      queries: gscData.queries,
    },
    ga4Available: !!ga4Events,
    gscAvailable: gscData.totalImpressions > 0,
  });
}
