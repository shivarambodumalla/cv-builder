import { Activity } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { internalUserIds } from "@/lib/admin/constants";
import { daysIn, presetRange } from "@/lib/admin/date-range";
import { summarizePaymentWall } from "@/lib/admin/payment-wall";
import { fetchAll, load, must } from "@/lib/admin/query";
import { int } from "@/lib/admin/format";
import { StatTile } from "@/components/admin/stat-tile";
import { LoadError } from "@/components/admin/home/block";
import { ActivityChart } from "@/components/admin/activity-chart";
import { RegistrationsChart } from "./registrations-chart";
import { PaymentWallChart } from "./payment-wall-chart";

type DayRow = { user_id: string | null; created_at: string };

/**
 * Registrations, payment wall and engagement over a fixed last-30-days
 * window (UTC). The funnel below has its own range control.
 */
async function loadCharts() {
  const db = createAdminClient();
  const range = presetRange("30d");
  const days30 = daysIn(range);
  const now = new Date();
  const monthStart = `${now.toISOString().slice(0, 7)}-01T00:00:00.000Z`;
  const weekStart = new Date(Date.parse(presetRange("7d").fromIso) - 86_400_000).toISOString();
  const todayStart = presetRange("today").fromIso;
  const signupsFrom = monthStart < range.fromIso ? monthStart : range.fromIso;

  const [internal, engagementRes, pageViews, visitorsByDay, signups, cvs, pdfs, wallEvents, paidRows] = await Promise.all([
    internalUserIds(),
    db.from("user_activity_metrics").select("dau, wau, mau, stickiness_pct"),
    fetchAll<{ view_date: string; count: number }>((from, to) =>
      db.from("page_views").select("view_date, count").gte("view_date", range.from).order("id").range(from, to),
    ),
    // One distinct count per day; reading raw visitor rows would hit the row cap.
    Promise.all(
      days30.map(async (day) => {
        const res = await db
          .rpc("funnel_unique_visitors", { from_date: day, to_date: day })
          .single<{ unique_visitors: number }>();
        return [day, Number(must(res)?.unique_visitors ?? 0)] as const;
      }),
    ),
    fetchAll<{ id: string; created_at: string }>((from, to) =>
      db.from("profiles").select("id, created_at").gte("created_at", signupsFrom).order("id").range(from, to),
    ),
    fetchAll<DayRow>((from, to) =>
      db.from("cvs").select("user_id, created_at").gte("created_at", range.fromIso).order("id").range(from, to),
    ),
    fetchAll<DayRow>((from, to) =>
      db
        .from("user_activity")
        .select("user_id, created_at")
        .eq("event", "Downloaded PDF")
        .gte("created_at", range.fromIso)
        .order("id")
        .range(from, to),
    ),
    fetchAll<{ user_id: string; event: string; created_at: string }>((from, to) =>
      db
        .from("user_activity")
        .select("user_id, event, created_at")
        .in("event", ["Saw upgrade modal", "Dismissed upgrade modal"])
        .gte("created_at", range.fromIso)
        .order("id")
        .range(from, to),
    ),
    fetchAll<{ user_id: string }>((from, to) =>
      db
        .from("subscription_history")
        .select("user_id")
        .eq("status", "active")
        .gt("amount", 0)
        .gte("started_at", range.fromIso)
        .order("id")
        .range(from, to),
    ),
  ]);

  const engagement = (must(engagementRes) ?? [])[0] ?? { dau: 0, wau: 0, mau: 0, stickiness_pct: 0 };
  const external = <T extends { user_id: string | null }>(rows: T[]) =>
    rows.filter((r) => !r.user_id || !internal.has(r.user_id));
  const realSignups = signups.filter((p) => !internal.has(p.id));

  const countByDay = (rows: { created_at: string }[]) => {
    const m = new Map<string, number>();
    for (const r of rows) {
      const k = r.created_at.slice(0, 10);
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  };
  const pvByDay = new Map<string, number>();
  for (const r of pageViews) {
    const k = String(r.view_date).slice(0, 10);
    pvByDay.set(k, (pvByDay.get(k) ?? 0) + Number(r.count));
  }
  const series = (byDay: Map<string, number>) => days30.map((day) => ({ day, value: byDay.get(day) ?? 0 }));

  const signupSeries = series(countByDay(realSignups.filter((p) => p.created_at >= range.fromIso)));
  const activitySeries = [
    { label: "Page Views", data: series(pvByDay), hex: "#6366f1" },
    { label: "Unique Visitors", data: series(new Map(visitorsByDay)), hex: "#8b5cf6" },
    { label: "Signups", data: signupSeries, hex: "#059669" },
    { label: "CVs Created", data: series(countByDay(external(cvs))), hex: "#1a7a6d" },
    { label: "PDF Downloads", data: series(countByDay(external(pdfs))), hex: "#d97706" },
  ].map((s) => ({
    ...s,
    total: s.data.reduce((sum, d) => sum + d.value, 0),
    max: Math.max(1, ...s.data.map((d) => d.value)),
  }));

  const paymentWall = summarizePaymentWall(external(wallEvents), days30);
  const wallPaidUsers = new Set(paidRows.map((r) => r.user_id).filter((id) => paymentWall.userIds.has(id))).size;

  return {
    days30,
    engagement,
    activitySeries,
    paymentWall,
    wallPaidUsers,
    registrations: {
      data: signupSeries,
      newToday: realSignups.filter((p) => p.created_at >= todayStart).length,
      newThisWeek: realSignups.filter((p) => p.created_at >= weekStart).length,
      newThisMonth: realSignups.filter((p) => p.created_at >= monthStart).length,
      total: signupSeries.reduce((s, d) => s + d.value, 0),
    },
  };
}

export async function FunnelCharts() {
  const res = await load("funnel charts", loadCharts);
  if (!res.ok) return <LoadError what="the 30-day charts" error={res.error} />;
  const { days30, engagement, activitySeries, paymentWall, wallPaidUsers, registrations } = res.data;

  return (
    <div className="space-y-8">
      <RegistrationsChart days30={days30} {...registrations} />

      <PaymentWallChart
        series={paymentWall.series}
        totalOpens={paymentWall.totalOpens}
        totalSkipped={paymentWall.totalSkipped}
        totalUsers={paymentWall.totalUsers}
        paidUsers={wallPaidUsers}
      />

      <div>
        <h2 className="mb-4 flex flex-wrap items-center gap-2 text-lg font-semibold tracking-tight">
          <Activity className="h-5 w-5 text-muted-foreground" />
          Engagement
          <span className="text-xs font-normal text-muted-foreground">excludes passive popover impressions</span>
        </h2>
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="DAU" value={int(engagement.dau ?? 0)} note="Active in last 24h" />
          <StatTile label="WAU" value={int(engagement.wau ?? 0)} note="Active in last 7 days" />
          <StatTile label="MAU" value={int(engagement.mau ?? 0)} note="Active in last 30 days" />
          <StatTile label="Stickiness" value={`${engagement.stickiness_pct ?? 0}%`} note="DAU / MAU (20%+ is healthy)" />
        </div>
        <ActivityChart series={activitySeries} days30={days30} />
      </div>
    </div>
  );
}
