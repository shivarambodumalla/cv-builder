import { unstable_cache } from "next/cache";
import { getGscAccessToken } from "./client";

const GSC = "https://searchconsole.googleapis.com/webmasters/v3";
const GA4 = "https://analyticsdata.googleapis.com/v1beta";

export type GscRow = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };
export type Ga4Row = { dimensionValues: { value: string }[]; metricValues: { value: string }[] };

// ─── Search Console ──────────────────────────────────────────────────────────

export type GscDimension = "query" | "page" | "date" | "country" | "device";

export interface SearchPerformanceQuery {
  /** Inclusive, YYYY-MM-DD. */
  from: string;
  to: string;
  dimensions: GscDimension[];
  /** RE2 pattern the page URL must match, e.g. "/cv-review". */
  pageRegex?: string;
  rowLimit?: number;
  orderBy?: "clicks" | "impressions";
}

async function querySearchAnalytics(q: SearchPerformanceQuery): Promise<GscRow[]> {
  const siteUrl = process.env.GSC_SITE_URL;
  const token = await getGscAccessToken();
  if (!siteUrl || !token) throw new Error("Search Console is not configured, or Google refused the token");

  const res = await fetch(`${GSC}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      startDate: q.from,
      endDate: q.to,
      dimensions: q.dimensions,
      ...(q.rowLimit ? { rowLimit: q.rowLimit } : {}),
      ...(q.orderBy ? { orderBy: [{ fieldName: q.orderBy, sortOrder: "DESCENDING" }] } : {}),
      ...(q.pageRegex
        ? {
            dimensionFilterGroups: [
              { filters: [{ dimension: "page", operator: "includingRegex", expression: q.pageRegex }] },
            ],
          }
        : {}),
    }),
  });
  if (!res.ok) throw new Error(`Search Console ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  return json.rows ?? [];
}

/**
 * One Search Console query, cached for an hour per argument set so admin
 * dashboards reopened through the day don't call Google each time. Failures
 * throw inside the cache (so they are never cached), are logged here, and
 * come back as no rows.
 */
export async function fetchSearchPerformance(q: SearchPerformanceQuery): Promise<GscRow[]> {
  const key = [q.from, q.to, q.dimensions.join(","), q.pageRegex ?? "", String(q.rowLimit ?? ""), q.orderBy ?? ""];
  try {
    return await unstable_cache(() => querySearchAnalytics(q), ["gsc-search-performance", ...key], {
      revalidate: 3600,
    })();
  } catch (err) {
    console.error("[gsc/queries] search performance query failed:", err);
    return [];
  }
}

// Search Console finalises a day about 3 days later. A range that reaches past
// that is shifted back with its length kept, so "last 7 days" still holds 7
// days of data.
export const GSC_LAG_DAYS = 3;

export function searchConsoleWindow(from: string, to: string): { from: string; to: string } {
  const maxTo = new Date(Date.now() - GSC_LAG_DAYS * 86400000).toISOString().slice(0, 10);
  if (to <= maxTo) return { from, to };
  const shift = Date.parse(`${to}T00:00:00Z`) - Date.parse(`${maxTo}T00:00:00Z`);
  return { from: new Date(Date.parse(`${from}T00:00:00Z`) - shift).toISOString().slice(0, 10), to: maxTo };
}

// ─── GA4 ─────────────────────────────────────────────────────────────────────

/** One GA4 runReport. Null (logged) when Google answers with an error. */
export async function runGa4Report(token: string, propertyId: string, body: object): Promise<Ga4Row[] | null> {
  try {
    const res = await fetch(`${GA4}/properties/${propertyId}:runReport`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error(`[gsc/queries] GA4 report failed ${res.status}:`, (await res.text()).slice(0, 200));
      return null;
    }
    const json = await res.json();
    return json.rows ?? [];
  } catch (err) {
    console.error("[gsc/queries] GA4 report failed:", err);
    return null;
  }
}

async function ga4Query(token: string, propertyId: string, body: object): Promise<Ga4Row[]> {
  return (await runGa4Report(token, propertyId, body)) ?? [];
}

export async function fetchGA4Channels(token: string, propertyId: string, from: string, to: string): Promise<Ga4Row[]> {
  return ga4Query(token, propertyId, {
    dateRanges: [{ startDate: from, endDate: to }],
    dimensions: [{ name: "sessionDefaultChannelGroup" }],
    metrics: [{ name: "sessions" }, { name: "newUsers" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 20,
  });
}

// country + countryId so we can match to topojson names & generate flag emoji
export async function fetchGA4Geo(token: string, propertyId: string, from: string, to: string): Promise<Ga4Row[]> {
  return ga4Query(token, propertyId, {
    dateRanges: [{ startDate: from, endDate: to }],
    dimensions: [{ name: "country" }, { name: "countryId" }],
    metrics: [
      { name: "sessions" },
      { name: "newUsers" },
      { name: "engagedSessions" },
    ],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 50,
  });
}

export async function fetchGA4Devices(token: string, propertyId: string, from: string, to: string): Promise<Ga4Row[]> {
  return ga4Query(token, propertyId, {
    dateRanges: [{ startDate: from, endDate: to }],
    dimensions: [{ name: "deviceCategory" }],
    metrics: [
      { name: "sessions" },
      { name: "engagedSessions" },
      { name: "averageSessionDuration" },
      { name: "screenPageViewsPerSession" },
    ],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
  });
}

export async function fetchGA4NewVsReturning(token: string, propertyId: string, from: string, to: string): Promise<Ga4Row[]> {
  return ga4Query(token, propertyId, {
    dateRanges: [{ startDate: from, endDate: to }],
    dimensions: [{ name: "newVsReturning" }],
    metrics: [
      { name: "sessions" },
      { name: "engagedSessions" },
      { name: "averageSessionDuration" },
      { name: "screenPageViewsPerSession" },
    ],
  });
}

export async function fetchGA4SessionQualityByChannel(token: string, propertyId: string, from: string, to: string): Promise<Ga4Row[]> {
  return ga4Query(token, propertyId, {
    dateRanges: [{ startDate: from, endDate: to }],
    dimensions: [{ name: "sessionDefaultChannelGroup" }],
    metrics: [
      { name: "sessions" },
      { name: "engagedSessions" },
      { name: "averageSessionDuration" },
      { name: "screenPageViewsPerSession" },
      { name: "bounceRate" },
    ],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 10,
  });
}

export async function fetchGA4LandingPages(token: string, propertyId: string, from: string, to: string): Promise<Ga4Row[]> {
  return ga4Query(token, propertyId, {
    dateRanges: [{ startDate: from, endDate: to }],
    dimensions: [{ name: "landingPage" }],
    metrics: [
      { name: "sessions" },
      { name: "engagedSessions" },
      { name: "averageSessionDuration" },
      { name: "bounceRate" },
      { name: "newUsers" },
    ],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 20,
  });
}

export async function fetchGA4DayOfWeek(token: string, propertyId: string, from: string, to: string): Promise<Ga4Row[]> {
  return ga4Query(token, propertyId, {
    dateRanges: [{ startDate: from, endDate: to }],
    dimensions: [{ name: "dayOfWeek" }],
    metrics: [{ name: "sessions" }],
  });
}

export async function fetchGA4Hourly(token: string, propertyId: string, from: string, to: string): Promise<Ga4Row[]> {
  return ga4Query(token, propertyId, {
    dateRanges: [{ startDate: from, endDate: to }],
    dimensions: [{ name: "hour" }],
    metrics: [{ name: "sessions" }],
  });
}
