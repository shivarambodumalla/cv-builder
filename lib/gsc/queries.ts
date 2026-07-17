const GSC = "https://searchconsole.googleapis.com/webmasters/v3";
const GA4 = "https://analyticsdata.googleapis.com/v1beta";

export type GscRow = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };
export type Ga4Row = { dimensionValues: { value: string }[]; metricValues: { value: string }[] };

async function gscQuery(token: string, siteUrl: string, body: object): Promise<GscRow[]> {
  const res = await fetch(`${GSC}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return json.rows ?? [];
}

async function ga4Query(token: string, propertyId: string, body: object): Promise<Ga4Row[]> {
  const res = await fetch(`${GA4}/properties/${propertyId}:runReport`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return json.rows ?? [];
}

// ─── GSC ─────────────────────────────────────────────────────────────────────

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

// Returns the top (query, page) pair per keyword — lets us map keyword → landing page
export async function fetchGSCQueryPages(token: string, siteUrl: string, from: string, to: string) {
  return gscQuery(token, siteUrl, {
    startDate: from,
    endDate: to,
    dimensions: ["query", "page"],
    rowLimit: 50,
    orderBy: [{ fieldName: "clicks", sortOrder: "DESCENDING" }],
  });
}

// Previous-period queries for position delta calculation
export async function fetchGSCPrevPeriodQueries(token: string, siteUrl: string, from: string, to: string) {
  return gscQuery(token, siteUrl, {
    startDate: from,
    endDate: to,
    dimensions: ["query"],
    rowLimit: 100,
  });
}

// ─── GSC (page-filtered, e.g. mentorship cluster) ────────────────────────────

function pageFilter(pageRegex: string) {
  return {
    dimensionFilterGroups: [
      { filters: [{ dimension: "page", operator: "includingRegex", expression: pageRegex }] },
    ],
  };
}

export async function fetchGSCFilteredQueries(token: string, siteUrl: string, from: string, to: string, pageRegex: string) {
  return gscQuery(token, siteUrl, {
    startDate: from,
    endDate: to,
    dimensions: ["query"],
    rowLimit: 50,
    orderBy: [{ fieldName: "impressions", sortOrder: "DESCENDING" }],
    ...pageFilter(pageRegex),
  });
}

export async function fetchGSCFilteredCountries(token: string, siteUrl: string, from: string, to: string, pageRegex: string) {
  return gscQuery(token, siteUrl, {
    startDate: from,
    endDate: to,
    dimensions: ["country"],
    rowLimit: 25,
    orderBy: [{ fieldName: "impressions", sortOrder: "DESCENDING" }],
    ...pageFilter(pageRegex),
  });
}

export async function fetchGSCFilteredTrend(token: string, siteUrl: string, from: string, to: string, pageRegex: string) {
  return gscQuery(token, siteUrl, {
    startDate: from,
    endDate: to,
    dimensions: ["date"],
    rowLimit: 500,
    ...pageFilter(pageRegex),
  });
}

export async function fetchGSCFilteredPages(token: string, siteUrl: string, from: string, to: string, pageRegex: string) {
  return gscQuery(token, siteUrl, {
    startDate: from,
    endDate: to,
    dimensions: ["page"],
    rowLimit: 25,
    orderBy: [{ fieldName: "impressions", sortOrder: "DESCENDING" }],
    ...pageFilter(pageRegex),
  });
}

// ─── GA4 ─────────────────────────────────────────────────────────────────────

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
