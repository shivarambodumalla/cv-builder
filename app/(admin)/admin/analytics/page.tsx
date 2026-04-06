import { createAdminClient } from "@/lib/supabase/admin";
import { SpendMonitor } from "./spend-monitor";
import { TodayOverview } from "./today-overview";
import { UsageHistory } from "./usage-history";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AnalyticsPage() {
  const supabase = createAdminClient();

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const [{ data: todayLogs }, { data: globalSettings }] = await Promise.all([
    supabase.from("ai_usage_logs").select("feature, input_tokens, output_tokens, cost_usd, cost_inr, user_id, status").gte("created_at", todayStart.toISOString()),
    supabase.from("ai_settings").select("daily_spend_cap_usd, usd_to_inr_rate").eq("feature", "global").single(),
  ]);

  const today = todayLogs ?? [];
  const todayUsd = today.reduce((s, r) => s + Number(r.cost_usd ?? 0), 0);
  const todayInr = today.reduce((s, r) => s + Number(r.cost_inr ?? 0), 0);
  const cap = globalSettings?.daily_spend_cap_usd ?? 10;

  const todayByFeature: Record<string, { calls: number; input: number; output: number; usd: number; inr: number }> = {};
  for (const l of today) {
    const f = l.feature;
    if (!todayByFeature[f]) todayByFeature[f] = { calls: 0, input: 0, output: 0, usd: 0, inr: 0 };
    todayByFeature[f].calls++;
    todayByFeature[f].input += l.input_tokens ?? 0;
    todayByFeature[f].output += l.output_tokens ?? 0;
    todayByFeature[f].usd += Number(l.cost_usd ?? 0);
    todayByFeature[f].inr += Number(l.cost_inr ?? 0);
  }

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">AI Analytics</h1>

      {/* Today — real-time, auto-refreshes every 30s */}
      <TodayOverview initial={{
        calls: today.length,
        users: new Set(today.map((r) => r.user_id).filter(Boolean)).size,
        inputTokens: today.reduce((s, r) => s + (r.input_tokens ?? 0), 0),
        outputTokens: today.reduce((s, r) => s + (r.output_tokens ?? 0), 0),
        totalUsd: todayUsd,
        totalInr: todayInr,
        errors: today.filter((r) => r.status === "error").length,
        cap,
        rate: globalSettings?.usd_to_inr_rate ?? 83.50,
        byFeature: todayByFeature,
        fetchedAt: new Date().toISOString(),
      }} />

      {/* Monthly usage with history navigation */}
      <UsageHistory />

      {/* Spend monitor + model pricing */}
      <SpendMonitor
        currentSpend={todayUsd}
        currentCap={cap}
        currentRate={globalSettings?.usd_to_inr_rate ?? 83.50}
      />
    </div>
  );
}
