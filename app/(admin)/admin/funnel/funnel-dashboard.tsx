"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2, AlertTriangle } from "lucide-react";

interface Stage {
  key: string;
  label: string;
  count: number;
}

interface FunnelData {
  stages: Stage[];
  extras: Stage[];
}

type Preset = "today" | "3d" | "7d" | "30d" | "90d" | "365d" | "all" | "custom";

function getRange(preset: Preset): { from: string; to: string } {
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  const toStr = to.toISOString();

  if (preset === "all") return { from: "2020-01-01T00:00:00.000Z", to: toStr };

  const from = new Date();
  from.setHours(0, 0, 0, 0);
  switch (preset) {
    case "today": break;
    case "3d": from.setDate(from.getDate() - 2); break;
    case "7d": from.setDate(from.getDate() - 6); break;
    case "30d": from.setDate(from.getDate() - 29); break;
    case "90d": from.setDate(from.getDate() - 89); break;
    case "365d": from.setDate(from.getDate() - 364); break;
    default: break;
  }
  return { from: from.toISOString(), to: toStr };
}

const PRESETS: { key: Preset; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "3d", label: "3 Days" },
  { key: "7d", label: "Week" },
  { key: "30d", label: "Month" },
  { key: "90d", label: "Quarter" },
  { key: "365d", label: "Year" },
  { key: "all", label: "All Time" },
  { key: "custom", label: "Custom" },
];

function pct(count: number, base: number): number {
  if (base === 0) return 0;
  return Math.round((count / base) * 1000) / 10;
}

function fmtPct(n: number): string {
  return `${n}%`;
}

function fmtNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

export function FunnelDashboard() {
  const [preset, setPreset] = useState<Preset>("7d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchFunnel = useCallback(async (p: Preset, cfrom?: string, cto?: string) => {
    setLoading(true);
    setError("");

    let from: string, to: string;
    if (p === "custom" && cfrom && cto) {
      from = new Date(cfrom).toISOString();
      to = new Date(cto + "T23:59:59.999Z").toISOString();
    } else {
      ({ from, to } = getRange(p));
    }

    const res = await fetch(`/api/admin/funnel?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.error || `Failed (${res.status})`);
      setLoading(false);
      return;
    }

    setData(await res.json());
    setLoading(false);
  }, []);

  // Auto-load on mount with "Week"
  useEffect(() => { fetchFunnel("7d"); }, [fetchFunnel]);

  function handlePreset(p: Preset) {
    setPreset(p);
    if (p !== "custom") fetchFunnel(p);
  }

  const base = data?.stages[0]?.count ?? 0;
  const maxCount = base || 1;

  return (
    <div className="space-y-6">
      {/* Time window selector */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex gap-1 rounded-lg bg-muted p-0.5">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => handlePreset(p.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs transition-colors",
                preset === p.key ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {preset === "custom" && (
          <div className="flex items-end gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground">From</label>
              <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="h-8 text-xs w-36" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">To</label>
              <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="h-8 text-xs w-36" />
            </div>
            <Button size="sm" className="h-8 text-xs" onClick={() => fetchFunnel("custom", customFrom, customTo)} disabled={!customFrom || !customTo || loading}>
              Apply
            </Button>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-16 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading funnel...
        </div>
      )}

      {data && !loading && (
        <>
          {/* ── Bar chart funnel ── */}
          <div className="rounded-lg border bg-background p-6">
            {/* Bars */}
            <div className="flex items-end justify-center gap-2 sm:gap-4" style={{ height: 280 }}>
              {data.stages.map((stage, i) => {
                const barHeight = maxCount > 0 ? Math.max((stage.count / maxCount) * 240, 4) : 4;
                const stepPct = i > 0 && data.stages[i - 1].count > 0
                  ? pct(stage.count, data.stages[i - 1].count)
                  : null;

                return (
                  <div key={stage.key} className="flex flex-col items-center gap-1 flex-1 max-w-[100px]">
                    {/* Count label */}
                    <span className="text-xs font-bold tabular-nums text-foreground">{fmtNum(stage.count)}</span>

                    {/* Conversion arrow from previous */}
                    {stepPct !== null && (
                      <div className="flex items-center gap-0.5 -mb-0.5">
                        <span className={cn(
                          "text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full",
                          stepPct >= 60 ? "bg-success/15 text-success" :
                          stepPct >= 30 ? "bg-warning/15 text-warning" :
                          "bg-error/15 text-error"
                        )}>
                          {fmtPct(stepPct)}
                        </span>
                      </div>
                    )}
                    {i === 0 && <div className="h-[18px]" />}

                    {/* Bar */}
                    <div
                      className={cn(
                        "w-full rounded-t-md transition-all duration-500",
                        i === 0 ? "bg-primary" : "bg-primary/70"
                      )}
                      style={{ height: barHeight }}
                    />

                    {/* Label */}
                    <span className="text-[10px] text-muted-foreground text-center leading-tight mt-1 h-8 flex items-start">
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Data table ── */}
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Stage</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Users</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Of Signups</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Step Conv.</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Drop-off</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Users Lost</th>
                </tr>
              </thead>
              <tbody>
                {data.stages.map((stage, i) => {
                  const prev = i === 0 ? stage.count : data.stages[i - 1].count;
                  const ofSignups = pct(stage.count, base);
                  const stepConv = i === 0 ? 100 : pct(stage.count, prev);
                  const dropOff = i === 0 ? 0 : pct(prev - stage.count, prev);
                  const usersLost = i === 0 ? 0 : prev - stage.count;

                  return (
                    <tr key={stage.key} className={cn("border-b last:border-0", dropOff > 50 && i > 0 && "bg-error/5")}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                            i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          )}>{i + 1}</span>
                          <span className="font-medium text-sm">{stage.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold tabular-nums">{stage.count.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{fmtPct(ofSignups)}</td>
                      <td className="px-4 py-2.5 text-right">
                        {i === 0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <span className={cn(
                            "font-semibold tabular-nums",
                            stepConv >= 60 ? "text-success" : stepConv >= 30 ? "text-warning" : "text-error"
                          )}>{fmtPct(stepConv)}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {i === 0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : dropOff > 0 ? (
                          <span className={cn(
                            "font-semibold tabular-nums",
                            dropOff >= 50 ? "text-error" : dropOff >= 30 ? "text-warning" : "text-muted-foreground"
                          )}>{fmtPct(dropOff)}</span>
                        ) : (
                          <span className="text-success font-semibold">0%</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        {i === 0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : usersLost > 0 ? (
                          <span className="text-error">{usersLost.toLocaleString()}</span>
                        ) : (
                          <span className="text-success">0</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Drop-off insights ── */}
          {base > 0 && (
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" /> Drop-off Insights
              </h3>
              <div className="space-y-2">
                {data.stages.slice(1).map((stage, idx) => {
                  const i = idx + 1;
                  const prev = data.stages[i - 1];
                  const lost = prev.count - stage.count;
                  const drop = prev.count > 0 ? pct(lost, prev.count) : 0;
                  if (drop < 20) return null;

                  return (
                    <div key={stage.key} className="flex items-start gap-3 text-sm">
                      <span className={cn(
                        "shrink-0 mt-0.5 h-2 w-2 rounded-full",
                        drop >= 50 ? "bg-error" : "bg-warning"
                      )} />
                      <div>
                        <span className="font-medium">{prev.label} → {stage.label}:</span>{" "}
                        <span className={drop >= 50 ? "text-error font-semibold" : "text-warning font-semibold"}>
                          {fmtPct(drop)} drop
                        </span>
                        <span className="text-muted-foreground"> — {lost.toLocaleString()} users didn't proceed.</span>
                        {drop >= 50 && (
                          <span className="text-error text-xs ml-1 font-medium">Critical</span>
                        )}
                      </div>
                    </div>
                  );
                }).filter(Boolean)}
                {data.stages.slice(1).every((s, idx) => {
                  const prev = data.stages[idx];
                  return prev.count === 0 || pct(prev.count - s.count, prev.count) < 20;
                }) && (
                  <p className="text-sm text-muted-foreground">No significant drop-offs detected (&gt;20%).</p>
                )}
              </div>
            </div>
          )}

          {/* ── Summary row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard label="Total Signups" value={base.toLocaleString()} />
            <SummaryCard
              label="End-to-End"
              value={fmtPct(pct(data.stages[data.stages.length - 1]?.count ?? 0, base))}
              sub={`${base} → ${data.stages[data.stages.length - 1]?.count ?? 0}`}
            />
            {data.extras.map((e) => (
              <SummaryCard
                key={e.key}
                label={e.label}
                value={e.count.toLocaleString()}
                sub={base > 0 ? `${fmtPct(pct(e.count, base))} of signups` : undefined}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-lg font-bold tabular-nums mt-0.5">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}
