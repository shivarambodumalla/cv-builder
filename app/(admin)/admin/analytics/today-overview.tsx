"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";

interface TodayData {
  calls: number;
  users: number;
  inputTokens: number;
  outputTokens: number;
  totalUsd: number;
  totalInr: number;
  errors: number;
  cap: number;
  rate: number;
  byFeature: Record<string, { calls: number; input: number; output: number; usd: number; inr: number }>;
  fetchedAt: string;
}

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function capColor(p: number) {
  if (p < 50) return "bg-success";
  if (p < 80) return "bg-warning";
  return "bg-error";
}

export function TodayOverview({ initial }: { initial: TodayData }) {
  const [data, setData] = useState<TodayData>(initial);
  const [ago, setAgo] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setAgo(0);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    const poll = setInterval(refresh, 30_000);
    const tick = setInterval(() => setAgo((a) => a + 1), 1000);
    return () => { clearInterval(poll); clearInterval(tick); };
  }, [refresh]);

  const capPct = data.cap > 0 ? Math.min(100, Math.round((data.totalUsd / data.cap) * 100)) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Today (live)</h2>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">
            {ago < 5 ? "Just now" : ago < 60 ? `${ago}s ago` : `${Math.floor(ago / 60)}m ago`}
          </span>
          <button onClick={refresh} className="text-muted-foreground hover:text-foreground">
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <Card label="AI Calls" value={String(data.calls)} />
        <Card label="Unique Users" value={String(data.users)} />
        <Card label="Input Tokens" value={fmtTokens(data.inputTokens)} sub={data.inputTokens.toLocaleString()} />
        <Card label="Output Tokens" value={fmtTokens(data.outputTokens)} sub={data.outputTokens.toLocaleString()} />
        <Card label="Cost (USD)" value={`$${data.totalUsd.toFixed(4)}`} />
        <Card label="Cost (INR)" value={`₹${data.totalInr.toFixed(2)}`} />
        <Card label="Errors" value={String(data.errors)} highlight={data.errors > 0} />
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Spend Cap</p>
          <p className="text-lg font-bold">${data.totalUsd.toFixed(2)} / ${data.cap.toFixed(2)}</p>
          <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full transition-all ${capColor(capPct)}`} style={{ width: `${capPct}%` }} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">{capPct}% used</p>
        </div>
      </div>

      {/* Per-feature breakdown */}
      {Object.keys(data.byFeature).length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">Today by Feature</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-1.5">Feature</th>
                  <th className="pb-1.5 text-right">Calls</th>
                  <th className="pb-1.5 text-right">In Tokens</th>
                  <th className="pb-1.5 text-right">Out Tokens</th>
                  <th className="pb-1.5 text-right">USD</th>
                  <th className="pb-1.5 text-right">INR</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.byFeature)
                  .sort((a, b) => b[1].usd - a[1].usd)
                  .map(([f, d]) => (
                    <tr key={f} className="border-b">
                      <td className="py-1.5 font-medium">{f}</td>
                      <td className="py-1.5 text-right">{d.calls}</td>
                      <td className="py-1.5 text-right">{fmtTokens(d.input)}</td>
                      <td className="py-1.5 text-right">{fmtTokens(d.output)}</td>
                      <td className="py-1.5 text-right">${d.usd.toFixed(6)}</td>
                      <td className="py-1.5 text-right">₹{d.inr.toFixed(2)}</td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr className="border-t font-semibold">
                  <td className="py-1.5">Total</td>
                  <td className="py-1.5 text-right">{data.calls}</td>
                  <td className="py-1.5 text-right">{fmtTokens(data.inputTokens)}</td>
                  <td className="py-1.5 text-right">{fmtTokens(data.outputTokens)}</td>
                  <td className="py-1.5 text-right">${data.totalUsd.toFixed(6)}</td>
                  <td className="py-1.5 text-right">₹{data.totalInr.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? "border-red-300 dark:border-red-800" : ""}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold ${highlight ? "text-red-600" : ""}`}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
