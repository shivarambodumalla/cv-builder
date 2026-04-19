import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const admin = createAdminClient();
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range"); // "today" | "YYYY-MM" | "YYYY-MM-DD"

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  // Always fetch global settings
  const { data: globalSettings } = await admin
    .from("ai_settings")
    .select("daily_spend_cap_usd, usd_to_inr_rate")
    .eq("feature", "global")
    .single();

  // Default: today's data
  let startDate = todayStart.toISOString();
  let endDate = new Date(todayStart.getTime() + 86400000).toISOString();

  if (range && range !== "today") {
    if (/^\d{4}-\d{2}$/.test(range)) {
      // Month: "2026-04"
      const [y, m] = range.split("-").map(Number);
      startDate = new Date(Date.UTC(y, m - 1, 1)).toISOString();
      endDate = new Date(Date.UTC(y, m, 1)).toISOString();
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(range)) {
      // Day: "2026-04-06"
      startDate = new Date(`${range}T00:00:00Z`).toISOString();
      endDate = new Date(new Date(`${range}T00:00:00Z`).getTime() + 86400000).toISOString();
    }
  }

  const { data: logs } = await admin
    .from("ai_usage_logs")
    .select("feature, model, input_tokens, output_tokens, cost_usd, cost_inr, user_id, status, created_at")
    .gte("created_at", startDate)
    .lt("created_at", endDate)
    .order("created_at", { ascending: false });

  const rows = logs ?? [];
  const calls = rows.length;
  const users = new Set(rows.map((r) => r.user_id).filter(Boolean)).size;
  const inputTokens = rows.reduce((s, r) => s + (r.input_tokens ?? 0), 0);
  const outputTokens = rows.reduce((s, r) => s + (r.output_tokens ?? 0), 0);
  const totalUsd = rows.reduce((s, r) => s + Number(r.cost_usd ?? 0), 0);
  const totalInr = rows.reduce((s, r) => s + Number(r.cost_inr ?? 0), 0);
  const errors = rows.filter((r) => r.status === "error").length;

  // By feature
  const byFeature: Record<string, { calls: number; input: number; output: number; usd: number; inr: number }> = {};
  for (const l of rows) {
    const f = l.feature;
    if (!byFeature[f]) byFeature[f] = { calls: 0, input: 0, output: 0, usd: 0, inr: 0 };
    byFeature[f].calls++;
    byFeature[f].input += l.input_tokens ?? 0;
    byFeature[f].output += l.output_tokens ?? 0;
    byFeature[f].usd += Number(l.cost_usd ?? 0);
    byFeature[f].inr += Number(l.cost_inr ?? 0);
  }

  // By day (for month view)
  const byDay: Record<string, { calls: number; input: number; output: number; usd: number; inr: number; users: Set<string> }> = {};
  for (const l of rows) {
    const day = l.created_at.slice(0, 10);
    if (!byDay[day]) byDay[day] = { calls: 0, input: 0, output: 0, usd: 0, inr: 0, users: new Set() };
    byDay[day].calls++;
    byDay[day].input += l.input_tokens ?? 0;
    byDay[day].output += l.output_tokens ?? 0;
    byDay[day].usd += Number(l.cost_usd ?? 0);
    byDay[day].inr += Number(l.cost_inr ?? 0);
    if (l.user_id) byDay[day].users.add(l.user_id);
  }
  const dailyBreakdown = Object.entries(byDay)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, d]) => ({ date, calls: d.calls, input: d.input, output: d.output, usd: d.usd, inr: d.inr, users: d.users.size }));

  // By hour (for today view)
  const byHour: Record<number, number> = {};
  for (const l of rows) {
    const h = new Date(l.created_at).getUTCHours();
    byHour[h] = (byHour[h] ?? 0) + 1;
  }

  // By model
  const byModel: Record<string, { calls: number; input: number; output: number; usd: number }> = {};
  for (const l of rows) {
    const m = l.model || "unknown";
    if (!byModel[m]) byModel[m] = { calls: 0, input: 0, output: 0, usd: 0 };
    byModel[m].calls++;
    byModel[m].input += l.input_tokens ?? 0;
    byModel[m].output += l.output_tokens ?? 0;
    byModel[m].usd += Number(l.cost_usd ?? 0);
  }

  // Top users for this period
  const userMap: Record<string, { calls: number; usd: number; inr: number }> = {};
  for (const l of rows) {
    if (!l.user_id) continue;
    if (!userMap[l.user_id]) userMap[l.user_id] = { calls: 0, usd: 0, inr: 0 };
    userMap[l.user_id].calls++;
    userMap[l.user_id].usd += Number(l.cost_usd ?? 0);
    userMap[l.user_id].inr += Number(l.cost_inr ?? 0);
  }
  const topUsersSorted = Object.entries(userMap).sort((a, b) => b[1].usd - a[1].usd).slice(0, 10);

  // Enrich top users with name + email from profiles
  const topUserIds = topUsersSorted.map(([id]) => id);
  const profileMap: Record<string, { name: string; email: string }> = {};
  if (topUserIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", topUserIds);
    for (const pr of profiles ?? []) {
      profileMap[pr.id] = { name: pr.full_name ?? "", email: pr.email ?? "" };
    }
  }

  return NextResponse.json({
    range: range || "today",
    calls, users, inputTokens, outputTokens, totalUsd, totalInr, errors,
    cap: globalSettings?.daily_spend_cap_usd ?? 10,
    rate: globalSettings?.usd_to_inr_rate ?? 83.50,
    byFeature,
    byDay: dailyBreakdown,
    byHour,
    byModel,
    topUsers: topUsersSorted.map(([id, d]) => ({
      id,
      name: profileMap[id]?.name || "",
      email: profileMap[id]?.email || "",
      ...d,
    })),
    fetchedAt: new Date().toISOString(),
  });
}
