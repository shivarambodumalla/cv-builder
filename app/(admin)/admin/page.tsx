import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, FileText, CreditCard, BarChart3, MousePointerClick, Activity } from "lucide-react";

const CPC = 0.15;

export const metadata: Metadata = {
  title: "Admin Dashboard | CVEdge",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);
  const weekStart = new Date(now);
  weekStart.setUTCDate(now.getUTCDate() - 7);
  weekStart.setUTCHours(0, 0, 0, 0);
  const monthStart = new Date(now);
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const [
    { data: profiles },
    { count: totalCvs },
    { count: totalAtsReports },
    { data: jobClicks },
    { data: engagementRows },
    { data: dauDailyRows },
  ] = await Promise.all([
    supabase.from("profiles").select("plan"),
    supabase.from("cvs").select("*", { count: "exact", head: true }),
    supabase.from("ats_reports").select("*", { count: "exact", head: true }),
    supabase.from("job_clicks").select("id, company, job_title, match_score, created_at"),
    supabase.from("user_activity_metrics").select("dau, wau, mau, stickiness_pct"),
    supabase.from("user_activity_daily").select("day, dau"),
  ]);

  const engagement = engagementRows?.[0] ?? { dau: 0, wau: 0, mau: 0, stickiness_pct: 0 };

  // Pad missing days with 0 so the chart always shows a full 30-day window.
  const dauByDay = new Map<string, number>();
  for (const r of dauDailyRows ?? []) {
    if (r.day) dauByDay.set(String(r.day), Number(r.dau ?? 0));
  }
  const dauSeries: { day: string; dau: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(now.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    dauSeries.push({ day: key, dau: dauByDay.get(key) ?? 0 });
  }
  const dauMax = Math.max(1, ...dauSeries.map((p) => p.dau));
  const dauTotal = dauSeries.reduce((s, p) => s + p.dau, 0);
  const dauAvg = Math.round(dauTotal / dauSeries.length);
  const firstHalf = dauSeries.slice(0, 15).reduce((s, p) => s + p.dau, 0);
  const secondHalf = dauSeries.slice(15).reduce((s, p) => s + p.dau, 0);
  const dauTrendPct = firstHalf > 0
    ? Math.round(((secondHalf - firstHalf) / firstHalf) * 100)
    : secondHalf > 0
      ? 100
      : 0;

  const totalUsers = profiles?.length ?? 0;
  const planCounts: Record<string, number> = { free: 0, starter: 0, pro: 0 };
  for (const p of profiles ?? []) {
    planCounts[p.plan] = (planCounts[p.plan] ?? 0) + 1;
  }

  const paidCount = planCounts.starter + planCounts.pro;

  // Job clicks aggregation
  const clicks = jobClicks ?? [];
  const todayISO = todayStart.toISOString();
  const weekISO = weekStart.toISOString();
  const monthISO = monthStart.toISOString();
  const todayClicks = clicks.filter((c) => c.created_at >= todayISO).length;
  const weekClicks = clicks.filter((c) => c.created_at >= weekISO).length;
  const monthClicks = clicks.filter((c) => c.created_at >= monthISO).length;
  const allTimeClicks = clicks.length;

  // Top 5 companies
  const companyMap: Record<string, number> = {};
  for (const c of clicks) {
    if (c.company) companyMap[c.company] = (companyMap[c.company] ?? 0) + 1;
  }
  const topCompanies = Object.entries(companyMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([company, count]) => ({ company, count }));

  // Top 5 roles
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
      avgMatchScore: d.scoreCount > 0 ? Math.round(d.totalScore / d.scoreCount) : null,
    }));

  const stats = [
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      detail: `Free: ${planCounts.free} · Starter: ${planCounts.starter} · Pro: ${planCounts.pro}`,
      icon: Users,
    },
    {
      title: "Paid Subscriptions",
      value: paidCount.toLocaleString(),
      detail: `${totalUsers ? Math.round((paidCount / totalUsers) * 100) : 0}% conversion rate`,
      icon: CreditCard,
    },
    {
      title: "Total CVs",
      value: (totalCvs ?? 0).toLocaleString(),
      detail: `${totalUsers ? ((totalCvs ?? 0) / totalUsers).toFixed(1) : "0"} per user avg`,
      icon: FileText,
    },
    {
      title: "ATS Reports",
      value: (totalAtsReports ?? 0).toLocaleString(),
      detail: `${totalCvs ? ((totalAtsReports ?? 0) / totalCvs).toFixed(1) : "0"} per CV avg`,
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-6 text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.detail}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Engagement — engaged active users (excludes passive popover events) */}
      <div>
        <h2 className="mb-4 text-lg font-semibold tracking-tight flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          Engagement
          <span className="text-xs font-normal text-muted-foreground">excludes passive popover impressions</span>
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {[
            { label: "DAU", value: engagement.dau ?? 0, hint: "Active in last 24h" },
            { label: "WAU", value: engagement.wau ?? 0, hint: "Active in last 7 days" },
            { label: "MAU", value: engagement.mau ?? 0, hint: "Active in last 30 days" },
            {
              label: "Stickiness",
              value: `${engagement.stickiness_pct ?? 0}%`,
              hint: "DAU / MAU — 20%+ is healthy",
            },
          ].map((m) => (
            <Card key={m.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{m.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{m.value.toLocaleString?.() ?? m.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{m.hint}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 30-day DAU trend */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">DAU — last 30 days</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                30-day avg {dauAvg.toLocaleString()} · 2nd half vs 1st{" "}
                <span
                  className={
                    dauTrendPct > 10
                      ? "text-success font-medium"
                      : dauTrendPct < -10
                        ? "text-error font-medium"
                        : "text-muted-foreground"
                  }
                >
                  {dauTrendPct > 0 ? `+${dauTrendPct}%` : `${dauTrendPct}%`}
                </span>
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1" style={{ height: 140 }}>
              {dauSeries.map((p, i) => {
                const h = Math.max((p.dau / dauMax) * 120, p.dau > 0 ? 3 : 0);
                const showLabel = i === 0 || i === dauSeries.length - 1 || i % 7 === 0;
                return (
                  <div
                    key={p.day}
                    className="group relative flex flex-1 flex-col items-center gap-1"
                    title={`${p.day}: ${p.dau} DAU`}
                  >
                    <div className="flex w-full items-end justify-center" style={{ height: 120 }}>
                      <div
                        className="w-full max-w-[18px] rounded-t bg-primary/40 transition-colors group-hover:bg-primary/70"
                        style={{ height: h }}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground tabular-nums truncate w-full text-center">
                      {showLabel ? p.day.slice(5) : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Clicks Revenue */}
      <div>
        <h2 className="mb-4 text-lg font-semibold tracking-tight flex items-center gap-2">
          <MousePointerClick className="h-5 w-5 text-muted-foreground" />
          Job Clicks Revenue
          <span className="text-xs font-normal text-muted-foreground">@ $0.15 CPC</span>
        </h2>

        {/* Click + Revenue stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {[
            { label: "Today", clicks: todayClicks },
            { label: "This Week", clicks: weekClicks },
            { label: "This Month", clicks: monthClicks },
            { label: "All Time", clicks: allTimeClicks },
          ].map(({ label, clicks: c }) => (
            <Card key={label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{c.toLocaleString()}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  ${(c * CPC).toFixed(2)} estimated revenue
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tables */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Companies */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Top Companies by Clicks</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {topCompanies.length === 0 ? (
                <p className="px-6 py-4 text-sm text-muted-foreground">No data yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground">Company</th>
                      <th className="px-6 py-2 text-right text-xs font-medium text-muted-foreground">Clicks</th>
                      <th className="px-6 py-2 text-right text-xs font-medium text-muted-foreground">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCompanies.map(({ company, count }) => (
                      <tr key={company} className="border-b last:border-0">
                        <td className="px-6 py-2.5 font-medium">{company}</td>
                        <td className="px-6 py-2.5 text-right tabular-nums">{count}</td>
                        <td className="px-6 py-2.5 text-right tabular-nums text-muted-foreground">
                          ${(count * CPC).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {/* Top Roles */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Top Roles by Clicks</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {topRoles.length === 0 ? (
                <p className="px-6 py-4 text-sm text-muted-foreground">No data yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground">Role</th>
                      <th className="px-6 py-2 text-right text-xs font-medium text-muted-foreground">Clicks</th>
                      <th className="px-6 py-2 text-right text-xs font-medium text-muted-foreground">Avg Match</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topRoles.map(({ role, count, avgMatchScore }) => (
                      <tr key={role} className="border-b last:border-0">
                        <td className="px-6 py-2.5 font-medium">{role}</td>
                        <td className="px-6 py-2.5 text-right tabular-nums">{count}</td>
                        <td className="px-6 py-2.5 text-right tabular-nums text-muted-foreground">
                          {avgMatchScore != null ? `${avgMatchScore}%` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
