import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getGscAccessToken, isGscConfigured } from "@/lib/gsc/client";
import { fetchSearchPerformance, searchConsoleWindow } from "@/lib/gsc/queries";
import { presetRange } from "@/lib/admin/date-range";

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

  const { searchParams } = new URL(request.url);
  const defaults = presetRange("30d");
  const { from, to } = searchConsoleWindow(
    searchParams.get("from")?.slice(0, 10) ?? defaults.from,
    searchParams.get("to")?.slice(0, 10) ?? defaults.to,
  );

  const [rawQueries, rawCountries, rawTrend, rawPages] = await Promise.all([
    fetchSearchPerformance({ from, to, pageRegex: MENTORSHIP_PAGE_REGEX, dimensions: ["query"], rowLimit: 50, orderBy: "impressions" }),
    fetchSearchPerformance({ from, to, pageRegex: MENTORSHIP_PAGE_REGEX, dimensions: ["country"], rowLimit: 25, orderBy: "impressions" }),
    fetchSearchPerformance({ from, to, pageRegex: MENTORSHIP_PAGE_REGEX, dimensions: ["date"], rowLimit: 500 }),
    fetchSearchPerformance({ from, to, pageRegex: MENTORSHIP_PAGE_REGEX, dimensions: ["page"], rowLimit: 25, orderBy: "impressions" }),
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
