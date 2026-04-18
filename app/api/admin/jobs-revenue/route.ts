import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const CPC = 0.15; // $0.15 per click

export async function GET() {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  const admin = createAdminClient();

  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);

  const weekStart = new Date(now);
  weekStart.setUTCDate(now.getUTCDate() - 7);
  weekStart.setUTCHours(0, 0, 0, 0);

  const monthStart = new Date(now);
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  // Fetch all clicks for aggregation
  const { data: allClicks, error } = await admin
    .from("job_clicks")
    .select("id, company, job_title, match_score, created_at");

  if (error) {
    return NextResponse.json({ error: "Failed to fetch job clicks" }, { status: 500 });
  }

  const clicks = allClicks ?? [];

  const todayISO = todayStart.toISOString();
  const weekISO = weekStart.toISOString();
  const monthISO = monthStart.toISOString();

  const todayCount = clicks.filter((c) => c.created_at >= todayISO).length;
  const weekCount = clicks.filter((c) => c.created_at >= weekISO).length;
  const monthCount = clicks.filter((c) => c.created_at >= monthISO).length;
  const allTimeCount = clicks.length;

  // Top 5 companies by click count
  const companyMap: Record<string, number> = {};
  for (const c of clicks) {
    if (c.company) {
      companyMap[c.company] = (companyMap[c.company] ?? 0) + 1;
    }
  }
  const topCompanies = Object.entries(companyMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([company, count]) => ({ company, count, revenue: +(count * CPC).toFixed(2) }));

  // Top 5 roles by click count with avg match score
  const roleMap: Record<string, { count: number; totalScore: number; scoreCount: number }> = {};
  for (const c of clicks) {
    if (c.job_title) {
      if (!roleMap[c.job_title]) roleMap[c.job_title] = { count: 0, totalScore: 0, scoreCount: 0 };
      roleMap[c.job_title].count++;
      if (c.match_score != null) {
        roleMap[c.job_title].totalScore += c.match_score;
        roleMap[c.job_title].scoreCount++;
      }
    }
  }
  const topRoles = Object.entries(roleMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([role, d]) => ({
      role,
      count: d.count,
      revenue: +(d.count * CPC).toFixed(2),
      avgMatchScore: d.scoreCount > 0 ? Math.round(d.totalScore / d.scoreCount) : null,
    }));

  return NextResponse.json({
    cpcUsd: CPC,
    clicks: {
      today: todayCount,
      week: weekCount,
      month: monthCount,
      allTime: allTimeCount,
    },
    revenue: {
      today: +(todayCount * CPC).toFixed(2),
      week: +(weekCount * CPC).toFixed(2),
      month: +(monthCount * CPC).toFixed(2),
      allTime: +(allTimeCount * CPC).toFixed(2),
    },
    topCompanies,
    topRoles,
  });
}
