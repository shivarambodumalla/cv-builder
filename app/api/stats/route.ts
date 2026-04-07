import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createAdminClient();
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const [{ count }, { data: last }] = await Promise.all([
    supabase.from("ats_reports").select("id", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
    supabase.from("ats_reports").select("created_at").order("created_at", { ascending: false }).limit(1).single(),
  ]);

  return NextResponse.json({
    todayCount: count ?? 0,
    lastReportAt: last?.created_at ?? null,
  });
}
