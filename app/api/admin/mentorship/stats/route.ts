import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function dayRange(fromDay: string, toDay: string): string[] {
  const days: string[] = [];
  const cursor = new Date(`${fromDay}T00:00:00Z`);
  const end = new Date(`${toDay}T00:00:00Z`);
  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const admin = createAdminClient();

  // Unique visitors on the mentorship landing page
  let visitorQuery = admin
    .from("mentorship_visitor_views")
    .select("visitor_id, view_date, country_code, city");
  if (from) visitorQuery = visitorQuery.gte("view_date", from.slice(0, 10));
  if (to) visitorQuery = visitorQuery.lte("view_date", to.slice(0, 10));
  const { data: visitorRows } = await visitorQuery;
  const views = visitorRows ?? [];
  const visitors = new Set(views.map((r) => r.visitor_id)).size;

  // CTA clicks in range
  let clickQuery = admin.from("mentorship_cta_clicks").select("cta, created_at");
  if (from) clickQuery = clickQuery.gte("created_at", from);
  if (to) clickQuery = clickQuery.lte("created_at", to);
  const { data: clickRows } = await clickQuery;
  const clicks = clickRows ?? [];

  // Leads in range
  let leadQuery = admin.from("mentorship_leads").select("id, status, score, created_at");
  if (from) leadQuery = leadQuery.gte("created_at", from);
  if (to) leadQuery = leadQuery.lte("created_at", to);
  const { data: leads } = await leadQuery;
  const allLeads = leads ?? [];

  // Activity counts in range
  let activityQuery = admin
    .from("mentorship_lead_activities")
    .select("event");
  if (from) activityQuery = activityQuery.gte("created_at", from);
  if (to) activityQuery = activityQuery.lte("created_at", to);
  const { data: activities } = await activityQuery;
  const eventCounts: Record<string, number> = {};
  for (const a of activities ?? []) {
    eventCounts[a.event] = (eventCounts[a.event] ?? 0) + 1;
  }

  const byStatus: Record<string, number> = {};
  for (const l of allLeads) {
    byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;
  }

  // Daily series: unique visitors + CTA clicks per day, contiguous
  const visitorsByDay: Record<string, Set<string>> = {};
  for (const v of views) {
    (visitorsByDay[v.view_date] ??= new Set()).add(v.visitor_id);
  }
  const clicksByDay: Record<string, number> = {};
  for (const c of clicks) {
    const day = String(c.created_at).slice(0, 10);
    clicksByDay[day] = (clicksByDay[day] ?? 0) + 1;
  }
  const today = new Date().toISOString().slice(0, 10);
  const dataDays = [...Object.keys(visitorsByDay), ...Object.keys(clicksByDay)].sort();
  const firstDay = from ? from.slice(0, 10) : dataDays[0] ?? today;
  const lastDay = to ? to.slice(0, 10) : today;
  const daily = dayRange(firstDay, lastDay).map((day) => ({
    day,
    visitors: visitorsByDay[day]?.size ?? 0,
    clicks: clicksByDay[day] ?? 0,
  }));

  // Visitor locations: unique visitors grouped by country + city
  const locationMap: Record<string, { country_code: string | null; city: string | null; ids: Set<string> }> = {};
  for (const v of views) {
    const key = `${v.country_code ?? "?"}|${v.city ?? "?"}`;
    const entry = (locationMap[key] ??= {
      country_code: v.country_code ?? null,
      city: v.city ?? null,
      ids: new Set(),
    });
    entry.ids.add(v.visitor_id);
  }
  const locations = Object.values(locationMap)
    .map(({ country_code, city, ids }) => ({ country_code, city, visitors: ids.size }))
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 20);

  const enrolled = byStatus["enrolled"] ?? 0;
  const totalLeads = allLeads.length;

  return NextResponse.json({
    visitors,
    ctaClicks: clicks.length,
    leads: totalLeads,
    curriculumViews: eventCounts["viewed_curriculum"] ?? 0,
    downloads: eventCounts["downloaded_pdf"] ?? 0,
    calls: eventCounts["call_completed"] ?? 0,
    callsBooked: byStatus["call_booked"] ?? 0,
    applications: byStatus["applied"] ?? 0,
    enrolled,
    hotLeads: allLeads.filter((l) => (l.score ?? 0) >= 100).length,
    conversionPct: totalLeads === 0 ? 0 : Math.round((enrolled / totalLeads) * 1000) / 10,
    leadConversionPct: visitors === 0 ? 0 : Math.round((totalLeads / visitors) * 1000) / 10,
    byStatus,
    daily,
    locations,
  });
}
