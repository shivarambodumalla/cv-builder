import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, CreditCard, BarChart3, Activity, ArrowRight, TrendingUp } from "lucide-react";
import { ActivityChart } from "./activity-chart";
import { RegistrationsChart } from "./registrations-chart";

export const metadata: Metadata = {
  title: "Admin Dashboard",
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
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setUTCDate(now.getUTCDate() - 29);
  thirtyDaysAgo.setUTCHours(0, 0, 0, 0);
  const thirtyDaysAgoDate = thirtyDaysAgo.toISOString().slice(0, 10);
  const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

  const [
    { data: profiles },
    { count: totalCvs },
    { count: totalAtsReports },
    { data: engagementRows },
    { data: pageViewRows },
    { data: visitorViewRows },
    { data: cvsCreatedRows },
    { data: pdfDownloadRows },
  ] = await Promise.all([
    supabase.from("profiles").select("plan, created_at, email, full_name"),
    supabase.from("cvs").select("*", { count: "exact", head: true }),
    supabase.from("ats_reports").select("*", { count: "exact", head: true }),
    supabase.from("user_activity_metrics").select("dau, wau, mau, stickiness_pct"),
    supabase.from("page_views").select("view_date, count").gte("view_date", thirtyDaysAgoDate),
    supabase.from("visitor_page_views").select("view_date, visitor_id").gte("view_date", thirtyDaysAgoDate).limit(20000),
    supabase.from("cvs").select("created_at").gte("created_at", thirtyDaysAgoISO),
    supabase.from("user_activity").select("created_at").eq("event", "Downloaded PDF").gte("created_at", thirtyDaysAgoISO),
  ]);

  const engagement = engagementRows?.[0] ?? { dau: 0, wau: 0, mau: 0, stickiness_pct: 0 };

  // Build the 30-day date spine (oldest → newest)
  const days30: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(now.getUTCDate() - i);
    days30.push(d.toISOString().slice(0, 10));
  }

  // Aggregate each data source into a day → count map
  const pvByDay = new Map<string, number>();
  for (const r of pageViewRows ?? []) {
    const key = String(r.view_date).slice(0, 10);
    pvByDay.set(key, (pvByDay.get(key) ?? 0) + Number(r.count));
  }

  // Unique visitors per day: deduplicate (visitor_id, view_date) pairs
  const uvByDay = new Map<string, Set<string>>();
  for (const r of visitorViewRows ?? []) {
    const row = r as { view_date: string; visitor_id: string };
    const key = String(row.view_date).slice(0, 10);
    if (!uvByDay.has(key)) uvByDay.set(key, new Set());
    uvByDay.get(key)!.add(row.visitor_id);
  }
  const uvCountByDay = new Map([...uvByDay.entries()].map(([k, s]) => [k, s.size]));

  const adminEmails = new Set(
    (process.env.ADMIN_EMAIL ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)
  );
  const nonAdminProfiles = (profiles ?? []).filter(
    (p) => !adminEmails.has((p.email ?? "").toLowerCase())
  );

  const groupByDay = (rows: { created_at: string }[]) => {
    const m = new Map<string, number>();
    for (const r of rows) {
      const k = r.created_at.slice(0, 10);
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  };
  const signupsByDay = groupByDay(nonAdminProfiles.map((p) => ({ created_at: p.created_at })));
  const cvsByDay = groupByDay(cvsCreatedRows ?? []);
  const pdfByDay = groupByDay(pdfDownloadRows ?? []);

  const buildSeries = (byDay: Map<string, number>) =>
    days30.map((day) => ({ day, value: byDay.get(day) ?? 0 }));

  // hex fill colours for each row — safe for inline style
  const activitySeries = [
    { label: "Page Views", data: buildSeries(pvByDay), hex: "#6366f1" },
    { label: "Unique Visitors", data: buildSeries(uvCountByDay), hex: "#8b5cf6" },
    { label: "Signups", data: buildSeries(signupsByDay), hex: "#059669" },
    { label: "CVs Created", data: buildSeries(cvsByDay), hex: "#1a7a6d" },
    { label: "PDF Downloads", data: buildSeries(pdfByDay), hex: "#d97706" },
  ].map((s) => ({
    ...s,
    total: s.data.reduce((sum, d) => sum + d.value, 0),
    max: Math.max(1, ...s.data.map((d) => d.value)),
  }));

  const totalUsers = profiles?.length ?? 0;
  const planCounts: Record<string, number> = { free: 0, starter: 0, pro: 0 };
  for (const p of profiles ?? []) {
    planCounts[p.plan] = (planCounts[p.plan] ?? 0) + 1;
  }

  const paidCount = planCounts.starter + planCounts.pro;
  const conversionRate = totalUsers ? Math.round((paidCount / totalUsers) * 100) : 0;

  const todayISO = todayStart.toISOString();
  const weekISO = weekStart.toISOString();
  const monthISO = monthStart.toISOString();

  // New signups
  const newToday = profiles?.filter((p) => p.created_at >= todayISO).length ?? 0;
  const newThisWeek = profiles?.filter((p) => p.created_at >= weekISO).length ?? 0;
  const newThisMonth = profiles?.filter((p) => p.created_at >= monthISO).length ?? 0;

  const regToday = nonAdminProfiles.filter((p) => p.created_at >= todayISO).length;
  const regThisWeek = nonAdminProfiles.filter((p) => p.created_at >= weekISO).length;
  const regThisMonth = nonAdminProfiles.filter((p) => p.created_at >= monthISO).length;
  const signupSeries = buildSeries(signupsByDay);
  const signupTotal30 = signupSeries.reduce((s, d) => s + d.value, 0);

  // Recent signups (last 6, excluding admins)
  const recentSignups = [...nonAdminProfiles]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)
    .map((p) => {
      const diffMs = now.getTime() - new Date(p.created_at).getTime();
      const diffH = Math.floor(diffMs / 3_600_000);
      const diffD = Math.floor(diffH / 24);
      const ago = diffH < 1 ? "just now" : diffH < 24 ? `${diffH}h ago` : `${diffD}d ago`;
      return { email: p.email, name: p.full_name, plan: p.plan, ago };
    });


  const nonClickableStats = [
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

  const planBars = [
    { label: "Free", count: planCounts.free, color: "bg-muted-foreground/30" },
    { label: "Starter", count: planCounts.starter, color: "bg-primary/50" },
    { label: "Pro", count: planCounts.pro, color: "bg-primary" },
  ].filter((b) => b.count > 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-6 text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Total Users — clickable */}
          <Link href="/admin/users" className="group">
            <Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-muted/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
                {/* Plan split bar */}
                <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  {planBars.map((b) => (
                    <div
                      key={b.label}
                      className={`${b.color} h-full`}
                      style={{ width: `${Math.round((b.count / totalUsers) * 100)}%` }}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Free: {planCounts.free} · Starter: {planCounts.starter} · Pro: {planCounts.pro}
                </p>
                {newThisWeek > 0 && (
                  <p className="flex items-center gap-1 text-xs text-success font-medium">
                    <TrendingUp className="h-3 w-3" />
                    +{newThisWeek} this week · +{newToday} today
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>

          {/* Paid Subscriptions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Paid Subscriptions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-2xl font-bold">{paidCount.toLocaleString()}</div>
              {/* Conversion bar */}
              <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary" style={{ width: `${conversionRate}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">{conversionRate}% conversion rate</p>
            </CardContent>
          </Card>

          {nonClickableStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{stat.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Signups */}
      {/* <div>
        <h2 className="mb-4 text-lg font-semibold tracking-tight flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          Recent Signups
        </h2>
        <Card>
          <CardContent className="p-0">
            {recentSignups.length === 0 ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">No signups yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground">User</th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground">Plan</th>
                    <th className="px-6 py-2 text-right text-xs font-medium text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSignups.map((u, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="px-6 py-2.5">
                        <p className="font-medium truncate max-w-[220px]">{u.name ?? u.email}</p>
                        {u.name && <p className="text-xs text-muted-foreground truncate max-w-[220px]">{u.email}</p>}
                      </td>
                      <td className="px-6 py-2.5">
                        <Badge
                          variant="secondary"
                          className={`capitalize text-[10px] ${
                            u.plan === "pro" ? "bg-primary/10 text-primary" :
                            u.plan === "starter" ? "bg-blue-500/10 text-blue-600" :
                            "bg-muted text-muted-foreground"
                          }`}
                        >
                          {u.plan}
                        </Badge>
                      </td>
                      <td className="px-6 py-2.5 text-right text-xs text-muted-foreground tabular-nums">{u.ago}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div> */}

      {/* Registrations histogram */}
      <RegistrationsChart
        data={signupSeries}
        days30={days30}
        newToday={regToday}
        newThisWeek={regThisWeek}
        newThisMonth={regThisMonth}
        total={signupTotal30}
      />

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

        <ActivityChart series={activitySeries} days30={days30} />
      </div>

    </div>
  );
}
