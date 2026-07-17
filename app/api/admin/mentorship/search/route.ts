import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getGscAccessToken, isGscConfigured } from "@/lib/gsc/client";
import {
  fetchGSCFilteredQueries,
  fetchGSCFilteredCountries,
  fetchGSCFilteredTrend,
  fetchGSCFilteredPages,
} from "@/lib/gsc/queries";

export const dynamic = "force-dynamic";

// Mentorship SEO cluster: landing pages + funnel blog posts
const MENTORSHIP_PAGE_REGEX =
  "(ai-product-design|ux-mentorship|learn-product-design|product-design-course|product-design-mentor|product-design-portfolio-review|ai-product-designer-salary)";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  if (!isGscConfigured()) return NextResponse.json({ configured: false });
  const token = await getGscAccessToken();
  if (!token) return NextResponse.json({ configured: false });

  const siteUrl = process.env.GSC_SITE_URL!;

  // GSC data lags ~2-3 days; clamp the end date accordingly
  const maxTo = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
  const { searchParams } = new URL(request.url);
  const requestedTo = searchParams.get("to")?.slice(0, 10) ?? maxTo;
  const to = requestedTo > maxTo ? maxTo : requestedTo;
  const from =
    searchParams.get("from")?.slice(0, 10) ??
    new Date(Date.now() - 31 * 86400000).toISOString().slice(0, 10);

  const [rawQueries, rawCountries, rawTrend, rawPages] = await Promise.all([
    fetchGSCFilteredQueries(token, siteUrl, from, to, MENTORSHIP_PAGE_REGEX),
    fetchGSCFilteredCountries(token, siteUrl, from, to, MENTORSHIP_PAGE_REGEX),
    fetchGSCFilteredTrend(token, siteUrl, from, to, MENTORSHIP_PAGE_REGEX),
    fetchGSCFilteredPages(token, siteUrl, from, to, MENTORSHIP_PAGE_REGEX),
  ]);

  const round1 = (n: number) => Math.round(n * 10) / 10;
  const ctrPct = (ctr: number) => Math.round(ctr * 10000) / 100;

  const trend = rawTrend.map((r) => ({
    date: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
  }));
  const totalClicks = trend.reduce((s, d) => s + d.clicks, 0);
  const totalImpressions = trend.reduce((s, d) => s + d.impressions, 0);
  const avgCtr = totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 10000) / 100 : 0;
  // Impression-weighted average position across queries
  const weighted = rawQueries.reduce((s, q) => s + q.position * q.impressions, 0);
  const queryImpressions = rawQueries.reduce((s, q) => s + q.impressions, 0);
  const avgPosition = queryImpressions > 0 ? round1(weighted / queryImpressions) : 0;

  return NextResponse.json({
    configured: true,
    range: { from, to },
    summary: { totalImpressions, totalClicks, avgCtr, avgPosition },
    queries: rawQueries.map((r) => ({
      query: r.keys[0],
      impressions: r.impressions,
      clicks: r.clicks,
      ctr: ctrPct(r.ctr),
      position: round1(r.position),
    })),
    countries: rawCountries.map((r) => ({
      // GSC returns ISO-3166-1 alpha-3 lowercase (e.g. "usa")
      country: r.keys[0],
      impressions: r.impressions,
      clicks: r.clicks,
    })),
    pages: rawPages.map((r) => ({
      page: r.keys[0].replace(/^https?:\/\/[^/]+/, "").replace(/\?.*$/, ""),
      impressions: r.impressions,
      clicks: r.clicks,
      ctr: ctrPct(r.ctr),
      position: round1(r.position),
    })),
    trend,
  });
}
