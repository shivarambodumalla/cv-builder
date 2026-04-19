"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface FeatureData { calls: number; input: number; output: number; usd: number; inr: number }
interface DayData { date: string; calls: number; input: number; output: number; usd: number; inr: number; users: number }
interface ModelData { calls: number; input: number; output: number; usd: number }
interface TopUser { id: string; name: string; email: string; calls: number; usd: number; inr: number }

interface HistoryData {
  range: string;
  calls: number;
  users: number;
  inputTokens: number;
  outputTokens: number;
  totalUsd: number;
  totalInr: number;
  errors: number;
  byFeature: Record<string, FeatureData>;
  byDay: DayData[];
  byHour: Record<string, number>;
  byModel: Record<string, ModelData>;
  topUsers: TopUser[];
}

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(m) - 1]} ${y}`;
}

function prevMonth(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 2, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function nextMonth(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function UsageHistory() {
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const isCurrentMonth = month === currentMonth();

  const fetchData = useCallback(async (m: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${m}`);
      if (res.ok) setData(await res.json());
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(month); }, [month, fetchData]);

  const featureRows = data ? Object.entries(data.byFeature).sort((a, b) => b[1].usd - a[1].usd) : [];
  const totalCalls = featureRows.reduce((s, [, d]) => s + d.calls, 0);
  const totalInput = featureRows.reduce((s, [, d]) => s + d.input, 0);
  const totalOutput = featureRows.reduce((s, [, d]) => s + d.output, 0);
  const totalUsd = featureRows.reduce((s, [, d]) => s + d.usd, 0);
  const totalInr = featureRows.reduce((s, [, d]) => s + d.inr, 0);
  const daysWithData = data?.byDay?.length ?? 1;
  const dailyAvgUsd = daysWithData > 0 ? totalUsd / daysWithData : 0;

  return (
    <div className="space-y-6">
      {/* Month selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">Monthly Usage</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonth(prevMonth(month))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-20 text-center">{monthLabel(month)}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonth(nextMonth(month))} disabled={isCurrentMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && data && (
        <>
          {/* Month summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card label="Calls" value={String(data.calls)} />
            <Card label="Users" value={String(data.users)} />
            <Card label="In Tokens" value={fmtTokens(data.inputTokens)} sub={data.inputTokens.toLocaleString()} />
            <Card label="Out Tokens" value={fmtTokens(data.outputTokens)} sub={data.outputTokens.toLocaleString()} />
            <Card label="Cost (USD)" value={`$${data.totalUsd.toFixed(4)}`} />
            <Card label="Cost (INR)" value={`₹${data.totalInr.toFixed(2)}`} />
          </div>

          {/* Projections (current month only) */}
          {isCurrentMonth && daysWithData > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card label="Days Active" value={String(daysWithData)} />
              <Card label="Daily Avg (USD)" value={`$${dailyAvgUsd.toFixed(4)}`} />
              <Card label="Projected Month" value={`$${(dailyAvgUsd * new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()).toFixed(2)}`} />
              <Card label="Errors" value={String(data.errors)} highlight={data.errors > 0} />
            </div>
          )}

          {/* Cost by feature */}
          {featureRows.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">By Feature</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-1.5">Feature</th>
                      <th className="pb-1.5 text-right">Calls</th>
                      <th className="pb-1.5 text-right">In</th>
                      <th className="pb-1.5 text-right">Out</th>
                      <th className="pb-1.5 text-right">USD</th>
                      <th className="pb-1.5 text-right">INR</th>
                      <th className="pb-1.5 text-right">Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureRows.map(([f, d]) => (
                      <tr key={f} className="border-b">
                        <td className="py-1.5 font-medium">{f}</td>
                        <td className="py-1.5 text-right">{d.calls}</td>
                        <td className="py-1.5 text-right">{fmtTokens(d.input)}</td>
                        <td className="py-1.5 text-right">{fmtTokens(d.output)}</td>
                        <td className="py-1.5 text-right">${d.usd.toFixed(6)}</td>
                        <td className="py-1.5 text-right">₹{d.inr.toFixed(2)}</td>
                        <td className="py-1.5 text-right">${d.calls > 0 ? (d.usd / d.calls).toFixed(6) : "0"}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t font-semibold">
                      <td className="py-1.5">Total</td>
                      <td className="py-1.5 text-right">{totalCalls}</td>
                      <td className="py-1.5 text-right">{fmtTokens(totalInput)}</td>
                      <td className="py-1.5 text-right">{fmtTokens(totalOutput)}</td>
                      <td className="py-1.5 text-right">${totalUsd.toFixed(6)}</td>
                      <td className="py-1.5 text-right">₹{totalInr.toFixed(2)}</td>
                      <td className="py-1.5 text-right">${totalCalls > 0 ? (totalUsd / totalCalls).toFixed(6) : "0"}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* By model */}
          {Object.keys(data.byModel).length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">By Model</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-1.5">Model</th>
                      <th className="pb-1.5 text-right">Calls</th>
                      <th className="pb-1.5 text-right">In Tokens</th>
                      <th className="pb-1.5 text-right">Out Tokens</th>
                      <th className="pb-1.5 text-right">USD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.byModel).sort((a, b) => b[1].usd - a[1].usd).map(([m, d]) => (
                      <tr key={m} className="border-b">
                        <td className="py-1.5 font-medium">{m}</td>
                        <td className="py-1.5 text-right">{d.calls}</td>
                        <td className="py-1.5 text-right">{fmtTokens(d.input)}</td>
                        <td className="py-1.5 text-right">{fmtTokens(d.output)}</td>
                        <td className="py-1.5 text-right">${d.usd.toFixed(6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Daily breakdown */}
          {data.byDay.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">Daily Breakdown</h3>
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-1.5">Date</th>
                      <th className="pb-1.5 text-right">Calls</th>
                      <th className="pb-1.5 text-right">Users</th>
                      <th className="pb-1.5 text-right">In</th>
                      <th className="pb-1.5 text-right">Out</th>
                      <th className="pb-1.5 text-right">USD</th>
                      <th className="pb-1.5 text-right">INR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byDay.map((d) => (
                      <tr key={d.date} className="border-b hover:bg-muted/30">
                        <td className="py-1.5 font-medium">{new Date(d.date + "T00:00:00Z").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</td>
                        <td className="py-1.5 text-right">{d.calls}</td>
                        <td className="py-1.5 text-right">{d.users}</td>
                        <td className="py-1.5 text-right">{fmtTokens(d.input)}</td>
                        <td className="py-1.5 text-right">{fmtTokens(d.output)}</td>
                        <td className="py-1.5 text-right">${d.usd.toFixed(6)}</td>
                        <td className="py-1.5 text-right">₹{d.inr.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t font-semibold sticky bottom-0 bg-background">
                      <td className="py-1.5">Total</td>
                      <td className="py-1.5 text-right">{data.byDay.reduce((s, d) => s + d.calls, 0)}</td>
                      <td className="py-1.5 text-right">{new Set(data.topUsers.map((u) => u.id)).size}</td>
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

          {/* Peak hours (today/single day) */}
          {Object.keys(data.byHour).length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">Activity by Hour (UTC)</h3>
              <div className="flex items-end gap-[2px] h-16">
                {Array.from({ length: 24 }, (_, h) => {
                  const count = data.byHour[String(h)] ?? 0;
                  const max = Math.max(...Object.values(data.byHour), 1);
                  const pct = (count / max) * 100;
                  return (
                    <div key={h} className="flex-1 flex flex-col items-center gap-0.5" title={`${h}:00 UTC | ${count} calls`}>
                      <div className="w-full bg-primary/70 rounded-sm transition-all" style={{ height: `${Math.max(pct, 2)}%` }} />
                      {h % 6 === 0 && <span className="text-[8px] text-muted-foreground">{h}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top users this period */}
          {data.topUsers.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">Top Users</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-1.5">User</th>
                      <th className="pb-1.5 text-right">Calls</th>
                      <th className="pb-1.5 text-right">USD</th>
                      <th className="pb-1.5 text-right">INR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topUsers.map((u) => (
                      <tr key={u.id} className="border-b">
                        <td className="py-1.5">
                          <div>
                            <span className="text-xs font-medium">{u.name || "—"}</span>
                            <span className="text-[10px] text-muted-foreground ml-1.5">{u.email}</span>
                          </div>
                        </td>
                        <td className="py-1.5 text-right">{u.calls}</td>
                        <td className="py-1.5 text-right">${u.usd.toFixed(6)}</td>
                        <td className="py-1.5 text-right">₹{u.inr.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data.calls === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No usage data for {monthLabel(month)}</p>
          )}
        </>
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
