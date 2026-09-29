// Bing Webmaster Tools JSON API: read-only reports for the admin marketing
// dashboard and scripts/bing-report.ts. Server-side only: the API key travels
// in the query string, so this module must never be imported by a client
// component (type-only imports are fine) and the key must never be logged or
// returned. Only Get* methods are called here; Submit*/Remove* are out of scope.

const BASE = "https://ssl.bing.com/webmaster/api.svc/json";
const DEFAULT_SITE_URL = "https://thecvedge.com/";
const TIMEOUT_MS = 20_000;

export function isBingConfigured() {
  return !!process.env.BING_WEBMASTER_API_KEY;
}

function siteUrl() {
  return process.env.BING_SITE_URL || DEFAULT_SITE_URL;
}

export class BingApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BingApiError";
  }
}

function redact(text: string, key: string) {
  return key ? text.split(key).join("[redacted]") : text;
}

async function call<T>(method: string): Promise<T> {
  const key = process.env.BING_WEBMASTER_API_KEY ?? "";
  if (!key) throw new BingApiError("BING_WEBMASTER_API_KEY is not set");
  const url = `${BASE}/${method}?siteUrl=${encodeURIComponent(siteUrl())}&apikey=${encodeURIComponent(key)}`;

  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new BingApiError(`${method}: request failed (${redact(msg, key)})`);
  }

  const body = await res.text();
  if (!res.ok) {
    let detail = body.slice(0, 200);
    try {
      const parsed = JSON.parse(body) as { Message?: string; ErrorCode?: number };
      if (parsed.Message) detail = parsed.Message;
    } catch {
      // non-JSON error page; keep the truncated body
    }
    throw new BingApiError(`${method}: HTTP ${res.status} ${redact(detail, key)}`);
  }

  try {
    return (JSON.parse(body) as { d: T }).d;
  } catch {
    throw new BingApiError(`${method}: response was not JSON`);
  }
}

// ─── Dates ───────────────────────────────────────────────────────────────────

/** "/Date(1790517096000)/" → Date. Negative or missing timestamps mean "never". */
export function parseBingDate(value: string | null | undefined): Date | null {
  const m = value?.match(/\/Date\((-?\d+)/);
  if (!m) return null;
  const ms = Number(m[1]);
  return ms > 0 ? new Date(ms) : null;
}

function isoDay(value: string): string {
  return parseBingDate(value)?.toISOString().slice(0, 10) ?? "";
}

function isoTime(value: string): string | null {
  return parseBingDate(value)?.toISOString() ?? null;
}

// ─── Raw fetchers ────────────────────────────────────────────────────────────

export interface BingTrafficDay {
  date: string; // YYYY-MM-DD (UTC)
  clicks: number;
  impressions: number;
}

/** One weekly row per query (or page). `key` is the query text or the page URL. */
export interface BingSearchRow {
  key: string;
  date: string;
  clicks: number;
  impressions: number;
  avgImpressionPosition: number;
  avgClickPosition: number | null;
}

export interface BingCrawlDay {
  date: string;
  inIndex: number;
  inLinks: number;
  crawledPages: number;
  crawlErrors: number;
  code2xx: number;
  code4xx: number;
  code5xx: number;
  blockedByRobotsTxt: number;
}

export interface BingSitemap {
  url: string;
  type: string;
  status: string;
  urlCount: number;
  lastCrawled: string | null; // ISO timestamp
  submitted: string | null;
}

export interface BingQuota {
  daily: number;
  monthly: number;
}

type RawTraffic = { Date: string; Clicks: number; Impressions: number };
type RawSearch = {
  Query: string;
  Date: string;
  Clicks: number;
  Impressions: number;
  AvgImpressionPosition: number;
  AvgClickPosition: number;
};
type RawCrawl = {
  Date: string;
  InIndex: number;
  InLinks: number;
  CrawledPages: number;
  CrawlErrors: number;
  Code2xx: number;
  Code4xx: number;
  Code5xx: number;
  BlockedByRobotsTxt: number;
};
type RawFeed = {
  Url: string;
  Type: string;
  Status: string;
  UrlCount: number;
  LastCrawled: string;
  Submitted: string;
};

const byDate = <T extends { date: string }>(a: T, b: T) => a.date.localeCompare(b.date);

export async function fetchBingTraffic(): Promise<BingTrafficDay[]> {
  const rows = await call<RawTraffic[]>("GetRankAndTrafficStats");
  return (rows ?? [])
    .map((r) => ({ date: isoDay(r.Date), clicks: r.Clicks, impressions: r.Impressions }))
    .filter((r) => r.date)
    .sort(byDate);
}

function mapSearchRows(rows: RawSearch[] | null): BingSearchRow[] {
  return (rows ?? [])
    .map((r) => ({
      key: r.Query,
      date: isoDay(r.Date),
      clicks: r.Clicks,
      impressions: r.Impressions,
      avgImpressionPosition: r.AvgImpressionPosition,
      avgClickPosition: r.AvgClickPosition > 0 ? r.AvgClickPosition : null,
    }))
    .filter((r) => r.date && r.key);
}

export async function fetchBingQueryStats(): Promise<BingSearchRow[]> {
  return mapSearchRows(await call<RawSearch[]>("GetQueryStats"));
}

export async function fetchBingPageStats(): Promise<BingSearchRow[]> {
  return mapSearchRows(await call<RawSearch[]>("GetPageStats"));
}

export async function fetchBingCrawlStats(): Promise<BingCrawlDay[]> {
  const rows = await call<RawCrawl[]>("GetCrawlStats");
  return (rows ?? [])
    .map((r) => ({
      date: isoDay(r.Date),
      inIndex: r.InIndex,
      inLinks: r.InLinks,
      crawledPages: r.CrawledPages,
      crawlErrors: r.CrawlErrors,
      code2xx: r.Code2xx,
      code4xx: r.Code4xx,
      code5xx: r.Code5xx,
      blockedByRobotsTxt: r.BlockedByRobotsTxt,
    }))
    .filter((r) => r.date)
    .sort(byDate);
}

export async function fetchBingSitemaps(): Promise<BingSitemap[]> {
  const rows = await call<RawFeed[]>("GetFeeds");
  return (rows ?? []).map((r) => ({
    url: r.Url,
    type: r.Type,
    status: r.Status,
    urlCount: r.UrlCount,
    lastCrawled: isoTime(r.LastCrawled),
    submitted: isoTime(r.Submitted),
  }));
}

export async function fetchBingUrlSubmissionQuota(): Promise<BingQuota> {
  const q = await call<{ DailyQuota: number; MonthlyQuota: number }>("GetUrlSubmissionQuota");
  return { daily: q?.DailyQuota ?? 0, monthly: q?.MonthlyQuota ?? 0 };
}

// ─── Aggregation ─────────────────────────────────────────────────────────────

const inWindow = (date: string, from: string, to: string) => date >= from && date <= to;

function ctrPct(clicks: number, impressions: number) {
  return impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0;
}

export function sumTraffic(days: BingTrafficDay[], from: string, to: string) {
  const rows = days.filter((d) => inWindow(d.date, from, to));
  const clicks = rows.reduce((s, d) => s + d.clicks, 0);
  const impressions = rows.reduce((s, d) => s + d.impressions, 0);
  return { clicks, impressions, ctr: ctrPct(clicks, impressions) };
}

export interface BingMonth {
  month: string; // YYYY-MM
  clicks: number;
  impressions: number;
}

export function trafficByMonth(days: BingTrafficDay[]): BingMonth[] {
  const map = new Map<string, BingMonth>();
  for (const d of days) {
    const month = d.date.slice(0, 7);
    const m = map.get(month) ?? { month, clicks: 0, impressions: 0 };
    m.clicks += d.clicks;
    m.impressions += d.impressions;
    map.set(month, m);
  }
  return [...map.values()].sort((a, b) => a.month.localeCompare(b.month));
}

export interface BingTopRow {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number; // impression-weighted average impression position
}

/**
 * Collapses Bing's weekly rows into one row per query/page over the window,
 * ranked by clicks then impressions. Rows are weekly buckets keyed by date, so
 * windows shorter than a few weeks are approximate.
 */
export function topRows(rows: BingSearchRow[], from: string, to: string, limit = 25): BingTopRow[] {
  const map = new Map<string, { clicks: number; impressions: number; posWeight: number }>();
  for (const r of rows) {
    if (!inWindow(r.date, from, to)) continue;
    const a = map.get(r.key) ?? { clicks: 0, impressions: 0, posWeight: 0 };
    a.clicks += r.clicks;
    a.impressions += r.impressions;
    a.posWeight += r.avgImpressionPosition * r.impressions;
    map.set(r.key, a);
  }
  return [...map.entries()]
    .map(([key, a]) => ({
      key,
      clicks: a.clicks,
      impressions: a.impressions,
      ctr: ctrPct(a.clicks, a.impressions),
      position: a.impressions > 0 ? Math.round((a.posWeight / a.impressions) * 10) / 10 : 0,
    }))
    .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
    .slice(0, limit);
}

/** Impression-weighted average position across every query row in the window. */
export function avgPosition(rows: BingSearchRow[], from: string, to: string) {
  let weight = 0;
  let impressions = 0;
  for (const r of rows) {
    if (!inWindow(r.date, from, to)) continue;
    weight += r.avgImpressionPosition * r.impressions;
    impressions += r.impressions;
  }
  return impressions > 0 ? Math.round((weight / impressions) * 10) / 10 : 0;
}

export interface BingIndexHealth {
  asOf: string | null; // date of the latest crawl-stats row
  inIndex: number;
  inLinks: number;
  blockedByRobotsTxt: number;
  crawledPages: number; // summed over the window
  crawlErrors: number; // summed over the window
  code4xx: number; // summed over the window
  code5xx: number; // summed over the window
  latestCrawl: string | null; // last day Bing crawled at least one page
}

/**
 * InIndex, InLinks and BlockedByRobotsTxt are running snapshots, so they come
 * from the latest row. Crawled pages and error counts are daily, so they sum
 * over the window.
 */
export function indexHealth(days: BingCrawlDay[], from: string, to: string): BingIndexHealth {
  const latest = days[days.length - 1];
  const windowRows = days.filter((d) => inWindow(d.date, from, to));
  const sum = (k: "crawledPages" | "crawlErrors" | "code4xx" | "code5xx") =>
    windowRows.reduce((s, d) => s + d[k], 0);
  const lastCrawled = [...days].reverse().find((d) => d.crawledPages > 0);
  return {
    asOf: latest?.date ?? null,
    inIndex: latest?.inIndex ?? 0,
    inLinks: latest?.inLinks ?? 0,
    blockedByRobotsTxt: latest?.blockedByRobotsTxt ?? 0,
    crawledPages: sum("crawledPages"),
    crawlErrors: sum("crawlErrors"),
    code4xx: sum("code4xx"),
    code5xx: sum("code5xx"),
    latestCrawl: lastCrawled?.date ?? null,
  };
}

// ─── Report ──────────────────────────────────────────────────────────────────

export interface BingReportData {
  from: string;
  to: string;
  dataThrough: string | null; // latest day Bing has traffic data for
  summary: { clicks: number; impressions: number; ctr: number; position: number };
  monthly: BingMonth[]; // all history Bing returns (~6 months)
  topQueries: BingTopRow[];
  topPages: BingTopRow[];
  index: BingIndexHealth;
  sitemaps: BingSitemap[];
  quota: BingQuota;
}

export type BingReport =
  | { status: "not_configured" }
  | { status: "error"; message: string }
  | ({ status: "ok" } & BingReportData);

/** Fetches every report in parallel. Never throws: failures come back as status "error". */
export async function getBingReport(from: string, to: string, limit = 25): Promise<BingReport> {
  if (!isBingConfigured()) return { status: "not_configured" };
  try {
    const [traffic, queries, pages, crawl, sitemaps, quota] = await Promise.all([
      fetchBingTraffic(),
      fetchBingQueryStats(),
      fetchBingPageStats(),
      fetchBingCrawlStats(),
      fetchBingSitemaps(),
      fetchBingUrlSubmissionQuota(),
    ]);
    const totals = sumTraffic(traffic, from, to);
    return {
      status: "ok",
      from,
      to,
      dataThrough: traffic[traffic.length - 1]?.date ?? null,
      summary: { ...totals, position: avgPosition(queries, from, to) },
      monthly: trafficByMonth(traffic),
      topQueries: topRows(queries, from, to, limit),
      topPages: topRows(pages, from, to, limit),
      index: indexHealth(crawl, from, to),
      sitemaps,
      quota,
    };
  } catch (err) {
    const message = err instanceof BingApiError ? err.message : "Unexpected error loading Bing data";
    console.error("[bing/client] report failed:", message);
    return { status: "error", message };
  }
}
