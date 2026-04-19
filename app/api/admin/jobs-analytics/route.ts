import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { EXCLUDED_USER_IDS } from "@/lib/admin/constants";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (!from || !to) return NextResponse.json({ error: "from and to required" }, { status: 400 });

  const admin = createAdminClient();
  const excl = `(${EXCLUDED_USER_IDS.join(",")})`;

  // Parallel queries — all exclude test users
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
    admin.from("job_clicks").select("id", { count: "exact", head: true })
      .gte("created_at", from).lte("created_at", to).not("user_id", "in", excl),
    admin.from("saved_jobs").select("id", { count: "exact", head: true })
      .gte("saved_at", from).lte("saved_at", to).not("user_id", "in", excl),
    admin.from("page_sessions").select("user_id", { count: "exact", head: true })
      .like("path", "/my-jobs%").gte("created_at", from).lte("created_at", to).not("user_id", "in", excl),
    admin.from("job_clicks").select("created_at")
      .gte("created_at", from).lte("created_at", to).not("user_id", "in", excl)
      .order("created_at", { ascending: true }),
    admin.from("job_clicks").select("job_title, company, match_score, redirect_url")
      .gte("created_at", from).lte("created_at", to).not("user_id", "in", excl)
      .order("created_at", { ascending: false }).limit(100),
    admin.from("job_clicks").select("company")
      .gte("created_at", from).lte("created_at", to).not("user_id", "in", excl),
    admin.from("job_clicks").select("provider")
      .gte("created_at", from).lte("created_at", to).not("user_id", "in", excl),
    admin.from("job_clicks").select("source")
      .gte("created_at", from).lte("created_at", to).not("user_id", "in", excl),
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

  // Recent 50 applications with user profiles (excluding test users)
  const { data: recentClicks } = await admin
    .from("job_clicks")
    .select("id, user_id, job_title, company, location, match_score, salary_min, salary_max, created_at, source")
    .gte("created_at", from)
    .lte("created_at", to)
    .not("user_id", "in", excl)
    .order("created_at", { ascending: false })
    .limit(50);

  // Get user profiles for the clickers
  const clickUserIds = [...new Set((recentClicks ?? []).map(c => c.user_id).filter(Boolean))];
  const userMap: Record<string, { name: string; email: string; role: string | null; city: string | null }> = {};
  if (clickUserIds.length > 0) {
    const [{ data: profiles }, { data: cvRoles }] = await Promise.all([
      admin.from("profiles").select("id, full_name, email, signup_city, signup_country").in("id", clickUserIds),
      admin.from("cvs").select("user_id, target_role").in("user_id", clickUserIds).not("target_role", "is", null).order("updated_at", { ascending: false }),
    ]);
    const roleMap = new Map<string, string>();
    for (const cv of cvRoles ?? []) { if (!roleMap.has(cv.user_id) && cv.target_role) roleMap.set(cv.user_id, cv.target_role); }
    for (const p of profiles ?? []) {
      userMap[p.id] = {
        name: p.full_name ?? "",
        email: p.email ?? "",
        role: roleMap.get(p.id) ?? null,
        city: [p.signup_city, p.signup_country].filter(Boolean).join(", ") || null,
      };
    }
  }

  const recentApplications = (recentClicks ?? []).map(c => ({
    id: c.id,
    jobTitle: c.job_title,
    company: c.company,
    location: c.location,
    matchScore: c.match_score,
    salary: c.salary_min && c.salary_max ? `$${Math.round(c.salary_min / 1000)}k–$${Math.round(c.salary_max / 1000)}k` : c.salary_min ? `$${Math.round(c.salary_min / 1000)}k+` : null,
    source: c.source || "app",
    appliedAt: c.created_at,
    user: userMap[c.user_id] ?? { name: "", email: "", role: null, city: null },
  }));

  // User profiling: aggregate by user — who applies the most, avg match score, locations
  const userStats: Record<string, { name: string; email: string; role: string | null; city: string | null; clicks: number; saves: number; scores: number[] }> = {};
  for (const c of recentClicks ?? []) {
    if (!c.user_id) continue;
    if (!userStats[c.user_id]) {
      const u = userMap[c.user_id] ?? { name: "", email: "", role: null, city: null };
      userStats[c.user_id] = { ...u, clicks: 0, saves: 0, scores: [] };
    }
    userStats[c.user_id].clicks++;
    if (c.match_score) userStats[c.user_id].scores.push(c.match_score);
  }
  const topApplicants = Object.entries(userStats)
    .map(([id, u]) => ({
      id,
      name: u.name,
      email: u.email,
      role: u.role,
      city: u.city,
      clicks: u.clicks,
      avgScore: u.scores.length > 0 ? Math.round(u.scores.reduce((a, b) => a + b, 0) / u.scores.length) : 0,
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 15);

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
    recentApplications,
    topApplicants,
  });
}
