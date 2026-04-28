import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ?? new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const to = searchParams.get("to") ?? new Date().toISOString().slice(0, 10);

  const admin = createAdminClient();

  const [pageViewsRes, dailyTrendRes, linkClicksRes] = await Promise.all([
    // Views per blog path in range
    admin
      .from("page_views")
      .select("path, count")
      .like("path", "/blog%")
      .gte("view_date", from)
      .lte("view_date", to),

    // Daily totals across all blog paths
    admin
      .from("page_views")
      .select("view_date, count")
      .like("path", "/blog%")
      .gte("view_date", from)
      .lte("view_date", to)
      .order("view_date", { ascending: true }),

    // Top clicked links across all blog posts
    admin
      .from("blog_link_clicks")
      .select("post_slug, link_url, link_text, count")
      .gte("click_date", from)
      .lte("click_date", to),
  ]);

  // Aggregate page views by path
  const viewsByPath: Record<string, number> = {};
  for (const row of pageViewsRes.data ?? []) {
    viewsByPath[row.path] = (viewsByPath[row.path] ?? 0) + (row.count ?? 0);
  }

  // Aggregate daily totals
  const dailyMap: Record<string, number> = {};
  for (const row of dailyTrendRes.data ?? []) {
    const d = row.view_date as string;
    dailyMap[d] = (dailyMap[d] ?? 0) + (row.count ?? 0);
  }
  const dailyTrend = Object.entries(dailyMap)
    .map(([date, views]) => ({ date, views }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Aggregate link clicks by (post_slug, link_url)
  const clickMap: Record<string, { postSlug: string; linkUrl: string; linkText: string; clicks: number }> = {};
  for (const row of linkClicksRes.data ?? []) {
    const key = `${row.post_slug}||${row.link_url}`;
    if (!clickMap[key]) {
      clickMap[key] = { postSlug: row.post_slug, linkUrl: row.link_url, linkText: row.link_text ?? "", clicks: 0 };
    }
    clickMap[key].clicks += row.count ?? 0;
  }
  const topLinks = Object.values(clickMap).sort((a, b) => b.clicks - a.clicks).slice(0, 50);

  // Top posts sorted by views
  const topPosts = Object.entries(viewsByPath)
    .filter(([path]) => path !== "/blog")
    .map(([path, views]) => ({ path, slug: path.replace("/blog/", ""), views }))
    .sort((a, b) => b.views - a.views);

  const totalViews = Object.values(viewsByPath).reduce((s, v) => s + v, 0);
  const indexViews = viewsByPath["/blog"] ?? 0;
  const postViews = totalViews - indexViews;

  return NextResponse.json({ totalViews, indexViews, postViews, topPosts, dailyTrend, topLinks });
}
