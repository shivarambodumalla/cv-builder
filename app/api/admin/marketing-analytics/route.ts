import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getGscAccessToken, getGa4AccessToken, isGscConfigured, isGa4Configured } from "@/lib/gsc/client";
import {
  fetchGSCTopQueries,
  fetchGSCTopPages,
  fetchGSCDailyTrend,
  fetchGA4Channels,
} from "@/lib/gsc/queries";

export const dynamic = "force-dynamic";

function defaultDates() {
  // GSC data has a 3–4 day lag
  const to = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
  const from = new Date(Date.now() - 31 * 86400000).toISOString().slice(0, 10);
  return { from, to };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const defaults = defaultDates();
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ?? defaults.from;
  const to = searchParams.get("to") ?? defaults.to;

  const gscOn = isGscConfigured();
  const ga4On = isGa4Configured();

  if (!gscOn && !ga4On) {
    return NextResponse.json({ configured: false });
  }

  const [gscToken, ga4Token] = await Promise.all([
    gscOn ? getGscAccessToken() : Promise.resolve(null),
    ga4On ? getGa4AccessToken() : Promise.resolve(null),
  ]);

  const siteUrl = process.env.GSC_SITE_URL!;
  const propertyId = process.env.GA4_PROPERTY_ID!;

  const [rawQueries, rawPages, rawTrend, rawChannels] = await Promise.all([
    gscOn && gscToken ? fetchGSCTopQueries(gscToken, siteUrl, from, to) : Promise.resolve([]),
    gscOn && gscToken ? fetchGSCTopPages(gscToken, siteUrl, from, to) : Promise.resolve([]),
    gscOn && gscToken ? fetchGSCDailyTrend(gscToken, siteUrl, from, to) : Promise.resolve([]),
    ga4On && ga4Token ? fetchGA4Channels(ga4Token, propertyId, from, to) : Promise.resolve([]),
  ]);

  const topQueries = rawQueries.map((r) => ({
    query: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: Math.round(r.ctr * 10000) / 100,
    position: Math.round(r.position * 10) / 10,
  }));

  const topPages = rawPages.map((r) => ({
    page: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: Math.round(r.ctr * 10000) / 100,
    position: Math.round(r.position * 10) / 10,
  }));

  const trend = rawTrend.map((r) => ({
    date: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
  }));

  const totalClicks = trend.reduce((s, d) => s + d.clicks, 0);
  const totalImpressions = trend.reduce((s, d) => s + d.impressions, 0);
  const avgCtr = totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 10000) / 100 : 0;
  const avgPosition =
    topQueries.length > 0
      ? Math.round((topQueries.reduce((s, q) => s + q.position, 0) / topQueries.length) * 10) / 10
      : 0;

  const channels = rawChannels.map((r) => ({
    channel: r.dimensionValues[0].value,
    sessions: parseInt(r.metricValues[0].value, 10),
    newUsers: parseInt(r.metricValues[1].value, 10),
  }));

  return NextResponse.json({
    configured: true,
    gscConfigured: gscOn && !!gscToken,
    ga4Configured: ga4On && !!ga4Token,
    summary: { totalClicks, totalImpressions, avgCtr, avgPosition },
    topQueries,
    topPages,
    trend,
    channels,
  });
}
