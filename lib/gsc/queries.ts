const GSC = "https://searchconsole.googleapis.com/webmasters/v3";
const GA4 = "https://analyticsdata.googleapis.com/v1beta";

type GscRow = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };
type Ga4Row = { dimensionValues: { value: string }[]; metricValues: { value: string }[] };

async function gscQuery(token: string, siteUrl: string, body: object): Promise<GscRow[]> {
  const res = await fetch(`${GSC}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return json.rows ?? [];
}

export async function fetchGSCTopQueries(token: string, siteUrl: string, from: string, to: string) {
  return gscQuery(token, siteUrl, {
    startDate: from,
    endDate: to,
    dimensions: ["query"],
    rowLimit: 50,
    orderBy: [{ fieldName: "clicks", sortOrder: "DESCENDING" }],
  });
}

export async function fetchGSCTopPages(token: string, siteUrl: string, from: string, to: string) {
  return gscQuery(token, siteUrl, {
    startDate: from,
    endDate: to,
    dimensions: ["page"],
    rowLimit: 25,
    orderBy: [{ fieldName: "clicks", sortOrder: "DESCENDING" }],
  });
}

export async function fetchGSCDailyTrend(token: string, siteUrl: string, from: string, to: string) {
  return gscQuery(token, siteUrl, {
    startDate: from,
    endDate: to,
    dimensions: ["date"],
    rowLimit: 500,
  });
}

export async function fetchGA4Channels(token: string, propertyId: string, from: string, to: string): Promise<Ga4Row[]> {
  const res = await fetch(`${GA4}/properties/${propertyId}:runReport`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      dateRanges: [{ startDate: from, endDate: to }],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }, { name: "newUsers" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 20,
    }),
  });
  const json = await res.json();
  return json.rows ?? [];
}
