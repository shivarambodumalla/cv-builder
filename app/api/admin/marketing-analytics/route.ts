import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getGscAccessToken, getGa4AccessToken, isGscConfigured, isGa4Configured } from "@/lib/gsc/client";
import {
  fetchGSCTopQueries,
  fetchGSCTopPages,
  fetchGSCDailyTrend,
  fetchGSCQueryPages,
  fetchGSCPrevPeriodQueries,
  fetchGA4Channels,
  fetchGA4Geo,
  fetchGA4Devices,
  fetchGA4NewVsReturning,
  fetchGA4SessionQualityByChannel,
  fetchGA4LandingPages,
  fetchGA4DayOfWeek,
  fetchGA4Hourly,
} from "@/lib/gsc/queries";

export const dynamic = "force-dynamic";

function defaultDates() {
  const to = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
  const from = new Date(Date.now() - 31 * 86400000).toISOString().slice(0, 10);
  return { from, to };
}

function prevPeriod(from: string, to: string) {
  const fromDate = new Date(from + "T00:00:00Z");
  const toDate = new Date(to + "T00:00:00Z");
  const days = Math.round((toDate.getTime() - fromDate.getTime()) / 86400000) + 1;
  const prevTo = new Date(fromDate.getTime() - 86400000).toISOString().slice(0, 10);
  const prevFrom = new Date(fromDate.getTime() - days * 86400000).toISOString().slice(0, 10);
  return { prevFrom, prevTo };
}

function pct(n: number, d: number) {
  return d > 0 ? Math.round((n / d) * 100) : 0;
}

function qualityScore(sessions: number, engaged: number, avgDuration: number, pagesPerSession: number): number {
  const engRate = sessions > 0 ? engaged / sessions : 0;
  return Math.round(
    engRate * 50 +
    Math.min(avgDuration / 180, 1) * 30 +
    Math.min(Math.max(pagesPerSession - 1, 0) / 3, 1) * 20
  );
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const defaults = defaultDates();
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ?? defaults.from;
  const to = searchParams.get("to") ?? defaults.to;
  const { prevFrom, prevTo } = prevPeriod(from, to);

  const gscOn = isGscConfigured();
  const ga4On = isGa4Configured();

  if (!gscOn && !ga4On) return NextResponse.json({ configured: false });

  const [gscToken, ga4Token] = await Promise.all([
    gscOn ? getGscAccessToken() : Promise.resolve(null),
    ga4On ? getGa4AccessToken() : Promise.resolve(null),
  ]);

  const siteUrl = process.env.GSC_SITE_URL!;
  const propertyId = process.env.GA4_PROPERTY_ID!;

  const gsc = gscOn && gscToken;
  const ga4 = ga4On && ga4Token;

  const [
    rawQueries,
    rawPages,
    rawTrend,
    rawQueryPages,
    rawPrevQueries,
    rawChannels,
    rawGeo,
    rawDevices,
    rawNvR,
    rawSessionQuality,
    rawLandingPages,
    rawDayOfWeek,
    rawHourly,
  ] = await Promise.all([
    gsc ? fetchGSCTopQueries(gscToken!, siteUrl, from, to) : Promise.resolve([]),
    gsc ? fetchGSCTopPages(gscToken!, siteUrl, from, to) : Promise.resolve([]),
    gsc ? fetchGSCDailyTrend(gscToken!, siteUrl, from, to) : Promise.resolve([]),
    gsc ? fetchGSCQueryPages(gscToken!, siteUrl, from, to) : Promise.resolve([]),
    gsc ? fetchGSCPrevPeriodQueries(gscToken!, siteUrl, prevFrom, prevTo) : Promise.resolve([]),
    ga4 ? fetchGA4Channels(ga4Token!, propertyId, from, to) : Promise.resolve([]),
    ga4 ? fetchGA4Geo(ga4Token!, propertyId, from, to) : Promise.resolve([]),
    ga4 ? fetchGA4Devices(ga4Token!, propertyId, from, to) : Promise.resolve([]),
    ga4 ? fetchGA4NewVsReturning(ga4Token!, propertyId, from, to) : Promise.resolve([]),
    ga4 ? fetchGA4SessionQualityByChannel(ga4Token!, propertyId, from, to) : Promise.resolve([]),
    ga4 ? fetchGA4LandingPages(ga4Token!, propertyId, from, to) : Promise.resolve([]),
    ga4 ? fetchGA4DayOfWeek(ga4Token!, propertyId, from, to) : Promise.resolve([]),
    ga4 ? fetchGA4Hourly(ga4Token!, propertyId, from, to) : Promise.resolve([]),
  ]);

  // ── Trend & summary ──────────────────────────────────────────────────────────
  const trend = rawTrend.map((r) => ({
    date: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
  }));
  const totalClicks = trend.reduce((s, d) => s + d.clicks, 0);
  const totalImpressions = trend.reduce((s, d) => s + d.impressions, 0);
  const avgCtr = totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 10000) / 100 : 0;

  // ── Previous period position map ─────────────────────────────────────────────
  const prevPosMap = new Map<string, number>();
  rawPrevQueries.forEach((r) => prevPosMap.set(r.keys[0], Math.round(r.position * 10) / 10));

  // ── Query → page map (first occurrence wins = highest-click page) ─────────────
  const queryPageMap = new Map<string, string>();
  rawQueryPages.forEach((r) => {
    if (!queryPageMap.has(r.keys[0])) queryPageMap.set(r.keys[0], r.keys[1]);
  });

  // ── GA4 landing page engagement map (path → metrics) ─────────────────────────
  const landingMap = new Map<
    string,
    { sessions: number; engagementRate: number; avgDuration: number; bounceRate: number }
  >();
  rawLandingPages.forEach((r) => {
    const path = r.dimensionValues[0].value.replace(/\?.*$/, "");
    const sessions = parseInt(r.metricValues[0].value, 10);
    const engaged = parseInt(r.metricValues[1].value, 10);
    const avgDur = parseFloat(r.metricValues[2].value);
    const bounce = parseFloat(r.metricValues[3].value);
    landingMap.set(path, {
      sessions,
      engagementRate: pct(engaged, sessions),
      avgDuration: Math.round(avgDur),
      bounceRate: Math.round(bounce * 100),
    });
  });

  // ── Enriched queries ─────────────────────────────────────────────────────────
  const avgPosition =
    rawQueries.length > 0
      ? Math.round((rawQueries.reduce((s, q) => s + q.position, 0) / rawQueries.length) * 10) / 10
      : 0;

  const topQueries = rawQueries.map((r) => {
    const query = r.keys[0];
    const fullPage = queryPageMap.get(query) ?? null;
    const page = fullPage ? fullPage.replace(/^https?:\/\/[^/]+/, "").replace(/\?.*$/, "") : null;
    const prevPosition = prevPosMap.get(query) ?? null;
    const ga4Page = page ? landingMap.get(page) ?? null : null;
    return {
      query,
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: Math.round(r.ctr * 10000) / 100,
      position: Math.round(r.position * 10) / 10,
      prevPosition,
      positionDelta: prevPosition !== null ? Math.round((prevPosition - r.position) * 10) / 10 : null,
      page,
      sessions: ga4Page?.sessions ?? null,
      engagementRate: ga4Page?.engagementRate ?? null,
      avgDuration: ga4Page?.avgDuration ?? null,
    };
  });

  const topPages = rawPages.map((r) => ({
    page: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: Math.round(r.ctr * 10000) / 100,
    position: Math.round(r.position * 10) / 10,
  }));

  // ── Channels ─────────────────────────────────────────────────────────────────
  const channels = rawChannels
    .filter((r) => r.dimensionValues[0].value !== "(other)")
    .map((r) => ({
      channel: r.dimensionValues[0].value,
      sessions: parseInt(r.metricValues[0].value, 10),
      newUsers: parseInt(r.metricValues[1].value, 10),
    }));

  // ── Geo ──────────────────────────────────────────────────────────────────────
  const geo = rawGeo
    .filter((r) => r.dimensionValues[0].value !== "(not set)")
    .map((r) => ({
      country: r.dimensionValues[0].value,
      countryCode: r.dimensionValues[1].value,
      sessions: parseInt(r.metricValues[0].value, 10),
      newUsers: parseInt(r.metricValues[1].value, 10),
      engagedSessions: parseInt(r.metricValues[2].value, 10),
    }));

  // ── Devices ──────────────────────────────────────────────────────────────────
  const totalDeviceSessions = rawDevices.reduce(
    (s, r) => s + parseInt(r.metricValues[0].value, 10), 0
  ) || 1;

  const devices = rawDevices
    .filter((r) => r.dimensionValues[0].value !== "(not set)")
    .map((r) => {
      const sessions = parseInt(r.metricValues[0].value, 10);
      const engaged = parseInt(r.metricValues[1].value, 10);
      const avgDuration = parseFloat(r.metricValues[2].value);
      const pagesPerSession = parseFloat(r.metricValues[3].value);
      return {
        device: r.dimensionValues[0].value,
        sessions,
        sharePercent: pct(sessions, totalDeviceSessions),
        engagementRate: pct(engaged, sessions),
        avgDuration: Math.round(avgDuration),
        pagesPerSession: Math.round(pagesPerSession * 10) / 10,
        qualityScore: qualityScore(sessions, engaged, avgDuration, pagesPerSession),
      };
    });

  // ── New vs Returning ─────────────────────────────────────────────────────────
  const newVsReturning = rawNvR
    .filter((r) => ["new", "returning"].includes(r.dimensionValues[0].value))
    .map((r) => {
      const sessions = parseInt(r.metricValues[0].value, 10);
      const engaged = parseInt(r.metricValues[1].value, 10);
      const avgDuration = parseFloat(r.metricValues[2].value);
      const pagesPerSession = parseFloat(r.metricValues[3].value);
      return {
        type: r.dimensionValues[0].value as "new" | "returning",
        sessions,
        engagementRate: pct(engaged, sessions),
        avgDuration: Math.round(avgDuration),
        pagesPerSession: Math.round(pagesPerSession * 10) / 10,
      };
    });

  // ── Session quality by channel ───────────────────────────────────────────────
  const sessionQuality = rawSessionQuality
    .filter((r) => r.dimensionValues[0].value !== "(other)")
    .map((r) => {
      const sessions = parseInt(r.metricValues[0].value, 10);
      const engaged = parseInt(r.metricValues[1].value, 10);
      const avgDuration = parseFloat(r.metricValues[2].value);
      const pagesPerSession = parseFloat(r.metricValues[3].value);
      const bounceRate = parseFloat(r.metricValues[4].value);
      return {
        channel: r.dimensionValues[0].value,
        sessions,
        engagementRate: pct(engaged, sessions),
        avgDuration: Math.round(avgDuration),
        pagesPerSession: Math.round(pagesPerSession * 10) / 10,
        bounceRate: Math.round(bounceRate * 100),
        qualityScore: qualityScore(sessions, engaged, avgDuration, pagesPerSession),
      };
    });

  // ── Landing pages ─────────────────────────────────────────────────────────────
  const landingPages = rawLandingPages
    .filter((r) => r.dimensionValues[0].value !== "(not set)")
    .map((r) => {
      const sessions = parseInt(r.metricValues[0].value, 10);
      const engaged = parseInt(r.metricValues[1].value, 10);
      const avgDuration = parseFloat(r.metricValues[2].value);
      const bounceRate = parseFloat(r.metricValues[3].value);
      const newUsers = parseInt(r.metricValues[4].value, 10);
      return {
        page: r.dimensionValues[0].value.replace(/\?.*$/, ""),
        sessions,
        engagementRate: pct(engaged, sessions),
        avgDuration: Math.round(avgDuration),
        bounceRate: Math.round(bounceRate * 100),
        newUsersPercent: pct(newUsers, sessions),
      };
    });

  // ── Day of week (0=Sun … 6=Sat, sorted numerically) ─────────────────────────
  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayOfWeek = Array.from({ length: 7 }, (_, i) => ({ day: DAY_LABELS[i], sessions: 0 }));
  rawDayOfWeek.forEach((r) => {
    const idx = parseInt(r.dimensionValues[0].value, 10);
    if (idx >= 0 && idx <= 6) dayOfWeek[idx].sessions = parseInt(r.metricValues[0].value, 10);
  });

  // ── Hourly (0–23, sorted numerically) ────────────────────────────────────────
  const hourly = Array.from({ length: 24 }, (_, i) => ({ hour: i, sessions: 0 }));
  rawHourly.forEach((r) => {
    const h = parseInt(r.dimensionValues[0].value, 10);
    if (h >= 0 && h <= 23) hourly[h].sessions = parseInt(r.metricValues[0].value, 10);
  });

  return NextResponse.json({
    configured: true,
    gscConfigured: gscOn && !!gscToken,
    ga4Configured: ga4On && !!ga4Token,
    summary: { totalClicks, totalImpressions, avgCtr, avgPosition },
    topQueries,
    topPages,
    trend,
    channels,
    geo,
    devices,
    newVsReturning,
    sessionQuality,
    landingPages,
    dayOfWeek,
    hourly,
  });
}
