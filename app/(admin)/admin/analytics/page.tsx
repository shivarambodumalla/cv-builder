import { createAdminClient } from "@/lib/supabase/admin";
import { SpendMonitor } from "./spend-monitor";

export const dynamic = "force-dynamic";

function fmt(n: number, decimals = 2) {
  return n.toFixed(decimals);
}

function pct(a: number, b: number) {
  return b > 0 ? Math.round((a / b) * 100) : 0;
}

function capColor(p: number) {
  if (p < 50) return "bg-green-500";
  if (p < 80) return "bg-yellow-500";
  return "bg-red-500";
}

export default async function AnalyticsPage() {
  const supabase = createAdminClient();

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);

  const [
    { data: todayLogs },
    { data: globalSettings },
    { data: thirtyDayLogs },
    { data: weekLogs },
    { data: dailyAgg },
  ] = await Promise.all([
    supabase.from("ai_usage_logs").select("feature, input_tokens, output_tokens, cost_usd, cost_inr, user_id, status").gte("created_at", todayStart.toISOString()),
    supabase.from("ai_settings").select("daily_spend_cap_usd, usd_to_inr_rate").eq("feature", "global").single(),
    supabase.from("ai_usage_logs").select("feature, input_tokens, output_tokens, cost_usd, cost_inr, user_id, status").gte("created_at", thirtyDaysAgo.toISOString()),
    supabase.from("ai_usage_logs").select("feature, status").gte("created_at", sevenDaysAgo.toISOString()),
    supabase.from("ai_usage_daily").select("*").gte("date", thirtyDaysAgo.toISOString().slice(0, 10)).order("date"),
  ]);

  // --- SECTION 1: Today overview ---
  const today = todayLogs ?? [];
  const todayCalls = today.length;
  const todayUsers = new Set(today.map((r) => r.user_id).filter(Boolean)).size;
  const todayTokens = today.reduce((s, r) => s + (r.input_tokens ?? 0) + (r.output_tokens ?? 0), 0);
  const todayUsd = today.reduce((s, r) => s + Number(r.cost_usd ?? 0), 0);
  const todayInr = today.reduce((s, r) => s + Number(r.cost_inr ?? 0), 0);
  const cap = globalSettings?.daily_spend_cap_usd ?? 10;
  const capPct = pct(todayUsd, cap);

  // --- SECTION 3: Cost by feature (30d) ---
  const logs30 = thirtyDayLogs ?? [];
  const byFeature: Record<string, { calls: number; input: number; output: number; usd: number; inr: number }> = {};
  for (const l of logs30) {
    const f = l.feature;
    if (!byFeature[f]) byFeature[f] = { calls: 0, input: 0, output: 0, usd: 0, inr: 0 };
    byFeature[f].calls++;
    byFeature[f].input += l.input_tokens ?? 0;
    byFeature[f].output += l.output_tokens ?? 0;
    byFeature[f].usd += Number(l.cost_usd ?? 0);
    byFeature[f].inr += Number(l.cost_inr ?? 0);
  }
  const featureRows = Object.entries(byFeature).sort((a, b) => b[1].usd - a[1].usd);

  // --- SECTION 2: 30-day trend ---
  const dailyRows = dailyAgg ?? [];
  const totalMonth = logs30.reduce((s, r) => s + Number(r.cost_usd ?? 0), 0);
  const totalMonthInr = logs30.reduce((s, r) => s + Number(r.cost_inr ?? 0), 0);
  const daysWithData = new Set((dailyRows).map((r) => r.date)).size || 1;
  const dailyAvg = totalMonth / daysWithData;
  const daysRemaining = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();
  const projected = totalMonth + dailyAvg * daysRemaining;

  // --- SECTION 5: Top consumers ---
  const userCosts: Record<string, { usd: number; inr: number; calls: number }> = {};
  for (const l of logs30) {
    if (!l.user_id) continue;
    if (!userCosts[l.user_id]) userCosts[l.user_id] = { usd: 0, inr: 0, calls: 0 };
    userCosts[l.user_id].usd += Number(l.cost_usd ?? 0);
    userCosts[l.user_id].inr += Number(l.cost_inr ?? 0);
    userCosts[l.user_id].calls++;
  }
  const topUsers = Object.entries(userCosts).sort((a, b) => b[1].usd - a[1].usd).slice(0, 20);

  // Fetch profiles for top users
  const topUserIds = topUsers.map(([id]) => id);
  const { data: profiles } = topUserIds.length > 0
    ? await supabase.from("profiles").select("id, full_name, plan").in("id", topUserIds)
    : { data: [] };
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  // --- SECTION 6: Error rate (7d) ---
  const week = weekLogs ?? [];
  const errByFeature: Record<string, { total: number; errors: number }> = {};
  for (const l of week) {
    if (!errByFeature[l.feature]) errByFeature[l.feature] = { total: 0, errors: 0 };
    errByFeature[l.feature].total++;
    if (l.status === "error") errByFeature[l.feature].errors++;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">AI Analytics</h1>

      {/* SECTION 1 — Today */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Today</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card label="AI Calls" value={String(todayCalls)} />
          <Card label="Unique Users" value={String(todayUsers)} />
          <Card label="Total Tokens" value={todayTokens.toLocaleString()} />
          <Card label="Cost (USD)" value={`$${fmt(todayUsd, 4)}`} />
          <Card label="Cost (INR)" value={`₹${fmt(todayInr, 2)}`} />
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Spend Cap</p>
            <p className="text-lg font-bold">${fmt(todayUsd, 2)} / ${fmt(cap, 2)}</p>
            <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full ${capColor(capPct)}`} style={{ width: `${Math.min(capPct, 100)}%` }} />
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">{capPct}% used</p>
          </div>
        </div>
      </div>

      {/* SECTION 2 — Month summary */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">30-Day Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card label="Total (USD)" value={`$${fmt(totalMonth, 4)}`} />
          <Card label="Total (INR)" value={`₹${fmt(totalMonthInr, 2)}`} />
          <Card label="Daily Avg" value={`$${fmt(dailyAvg, 4)}`} />
          <Card label="Projected Month" value={`$${fmt(projected, 2)}`} />
        </div>
      </div>

      {/* SECTION 3 — Cost by feature */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Cost by Feature (30d)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2">Feature</th>
                <th className="pb-2 text-right">Calls</th>
                <th className="pb-2 text-right">Input Tokens</th>
                <th className="pb-2 text-right">Output Tokens</th>
                <th className="pb-2 text-right">USD</th>
                <th className="pb-2 text-right">INR</th>
                <th className="pb-2 text-right">Avg/call</th>
              </tr>
            </thead>
            <tbody>
              {featureRows.map(([f, d]) => (
                <tr key={f} className="border-b">
                  <td className="py-2 font-medium">{f}</td>
                  <td className="py-2 text-right">{d.calls}</td>
                  <td className="py-2 text-right">{d.input.toLocaleString()}</td>
                  <td className="py-2 text-right">{d.output.toLocaleString()}</td>
                  <td className="py-2 text-right">${fmt(d.usd, 4)}</td>
                  <td className="py-2 text-right">₹{fmt(d.inr, 2)}</td>
                  <td className="py-2 text-right">${d.calls > 0 ? fmt(d.usd / d.calls, 6) : "0"}</td>
                </tr>
              ))}
              {featureRows.length === 0 && (
                <tr><td colSpan={7} className="py-4 text-center text-muted-foreground">No data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 5 — Top consumers */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Top 20 Consumers (30d)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2">User</th>
                <th className="pb-2">Plan</th>
                <th className="pb-2 text-right">Calls</th>
                <th className="pb-2 text-right">USD</th>
                <th className="pb-2 text-right">INR</th>
              </tr>
            </thead>
            <tbody>
              {topUsers.map(([uid, d]) => {
                const p = profileMap.get(uid);
                return (
                  <tr key={uid} className={`border-b ${d.usd > 1 ? "bg-amber-50 dark:bg-amber-950/20" : ""}`}>
                    <td className="py-2 font-medium">{p?.full_name || uid.slice(0, 8)}</td>
                    <td className="py-2">{p?.plan ?? "free"}</td>
                    <td className="py-2 text-right">{d.calls}</td>
                    <td className="py-2 text-right">${fmt(d.usd, 4)}</td>
                    <td className="py-2 text-right">₹{fmt(d.inr, 2)}</td>
                  </tr>
                );
              })}
              {topUsers.length === 0 && (
                <tr><td colSpan={5} className="py-4 text-center text-muted-foreground">No data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 6 — Error rate */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Error Rate (7d)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2">Feature</th>
                <th className="pb-2 text-right">Calls</th>
                <th className="pb-2 text-right">Errors</th>
                <th className="pb-2 text-right">Rate</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(errByFeature).map(([f, d]) => {
                const rate = pct(d.errors, d.total);
                return (
                  <tr key={f} className="border-b">
                    <td className="py-2 font-medium">{f}</td>
                    <td className="py-2 text-right">{d.total}</td>
                    <td className="py-2 text-right">{d.errors}</td>
                    <td className="py-2 text-right">
                      <span className={rate > 5 ? "text-red-600 font-bold" : ""}>{rate}%</span>
                    </td>
                  </tr>
                );
              })}
              {Object.keys(errByFeature).length === 0 && (
                <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">No data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 7 — Spend monitor */}
      <SpendMonitor
        currentSpend={todayUsd}
        currentCap={cap}
        currentRate={globalSettings?.usd_to_inr_rate ?? 83.50}
      />
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
