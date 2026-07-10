import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

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
    .select("visitor_id");
  if (from) visitorQuery = visitorQuery.gte("view_date", from.slice(0, 10));
  if (to) visitorQuery = visitorQuery.lte("view_date", to.slice(0, 10));
  const { data: visitorRows } = await visitorQuery;
  const visitors = new Set((visitorRows ?? []).map((r) => r.visitor_id)).size;

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

  const enrolled = byStatus["enrolled"] ?? 0;
  const totalLeads = allLeads.length;

  return NextResponse.json({
    visitors,
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
  });
}
