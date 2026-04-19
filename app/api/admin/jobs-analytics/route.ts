import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (!from || !to) return NextResponse.json({ error: "from and to required" }, { status: 400 });

  const admin = createAdminClient();

  // Parallel queries
  const [
    { count: totalClicks },
    { count: totalSaves },
    { count: uniqueSearchers },
    { data: clicksByDay },
    { data: topJobs },
    { data: topCompanies },
    { data: providerBreakdown },
    { data: clicksBySource },
  ] = await Promise.all([
    // Total apply clicks
    admin.from("job_clicks").select("id", { count: "exact", head: true })
      .gte("created_at", from).lte("created_at", to),
    // Total saves
    admin.from("saved_jobs").select("id", { count: "exact", head: true })
      .gte("saved_at", from).lte("saved_at", to),
    // Unique users who searched (visited /my-jobs)
    admin.from("page_sessions").select("user_id", { count: "exact", head: true })
      .like("path", "/my-jobs%")
      .gte("created_at", from).lte("created_at", to),
    // Clicks by day
    admin.from("job_clicks").select("created_at")
      .gte("created_at", from).lte("created_at", to)
      .order("created_at", { ascending: true }),
    // Top clicked jobs
    admin.from("job_clicks").select("job_title, company, match_score, redirect_url")
      .gte("created_at", from).lte("created_at", to)
      .order("created_at", { ascending: false })
      .limit(100),
    // Top companies
    admin.from("job_clicks").select("company")
      .gte("created_at", from).lte("created_at", to),
    // Provider breakdown
    admin.from("job_clicks").select("provider")
      .gte("created_at", from).lte("created_at", to),
    // Clicks by source
    admin.from("job_clicks").select("source")
      .gte("created_at", from).lte("created_at", to),
  ]);

  // Aggregate clicks by day
  const dailyMap: Record<string, number> = {};
  for (const c of clicksByDay ?? []) {
    const day = c.created_at.slice(0, 10);
    dailyMap[day] = (dailyMap[day] ?? 0) + 1;
  }
  const daily = Object.entries(dailyMap).sort(([a], [b]) => a.localeCompare(b)).map(([date, clicks]) => ({ date, clicks }));

  // Aggregate top jobs (by title+company)
  const jobMap: Record<string, { title: string; company: string; clicks: number; avgScore: number; scores: number[] }> = {};
  for (const j of topJobs ?? []) {
    const key = `${j.job_title}::${j.company}`;
    if (!jobMap[key]) jobMap[key] = { title: j.job_title, company: j.company, clicks: 0, avgScore: 0, scores: [] };
    jobMap[key].clicks++;
    if (j.match_score) jobMap[key].scores.push(j.match_score);
  }
  const topJobsList = Object.values(jobMap)
    .map(j => ({ ...j, avgScore: j.scores.length > 0 ? Math.round(j.scores.reduce((a, b) => a + b, 0) / j.scores.length) : 0 }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  // Aggregate top companies
  const companyMap: Record<string, number> = {};
  for (const c of topCompanies ?? []) {
    companyMap[c.company] = (companyMap[c.company] ?? 0) + 1;
  }
  const topCompaniesList = Object.entries(companyMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([company, clicks]) => ({ company, clicks }));

  // Provider breakdown
  const providerMap: Record<string, number> = {};
  for (const p of providerBreakdown ?? []) {
    const name = p.provider || "unknown";
    providerMap[name] = (providerMap[name] ?? 0) + 1;
  }
  const providers = Object.entries(providerMap).sort((a, b) => b[1] - a[1]).map(([name, clicks]) => ({ name, clicks }));

  // Source breakdown
  const sourceMap: Record<string, number> = {};
  for (const s of clicksBySource ?? []) {
    const name = s.source || "app";
    sourceMap[name] = (sourceMap[name] ?? 0) + 1;
  }
  const sources = Object.entries(sourceMap).sort((a, b) => b[1] - a[1]).map(([name, clicks]) => ({ name, clicks }));

  // Revenue estimate
  const cpc = 0.15;
  const revenue = (totalClicks ?? 0) * cpc;

  // Funnel: searchers → clickers → savers
  const funnel = [
    { step: "Job Searchers", count: uniqueSearchers ?? 0 },
    { step: "Applied (Clicked)", count: totalClicks ?? 0 },
    { step: "Saved Jobs", count: totalSaves ?? 0 },
  ];

  return NextResponse.json({
    totalClicks: totalClicks ?? 0,
    totalSaves: totalSaves ?? 0,
    uniqueSearchers: uniqueSearchers ?? 0,
    revenue: Math.round(revenue * 100) / 100,
    cpc,
    daily,
    topJobs: topJobsList,
    topCompanies: topCompaniesList,
    providers,
    sources,
    funnel,
  });
}
