"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2, AlertTriangle, UserPlus, Layout, Upload, FileText, Pencil, ScanLine, Sparkles, Wand2, Briefcase, Mail, Download, CreditCard, Crown } from "lucide-react";

interface Stage {
  key: string;
  label: string;
  count: number;
  icon?: string;
}

interface FunnelData {
  acquisition: Stage[];
  engagement: Stage[];
  conversion: Stage[];
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

const ICON_MAP: Record<string, React.ElementType> = {
  "user-plus": UserPlus, layout: Layout, upload: Upload, "file-text": FileText,
  edit: Pencil, scan: ScanLine, sparkles: Sparkles, wand: Wand2,
  briefcase: Briefcase, mail: Mail, download: Download, "credit-card": CreditCard, crown: Crown,
};

function pct(count: number, base: number): number {
  if (base === 0) return 0;
  return Math.round((count / base) * 1000) / 10;
}

function fmtPct(n: number): string { return `${n}%`; }

export function FunnelDashboard() {
  const [preset, setPreset] = useState<Preset>("30d");
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

  useEffect(() => { fetchFunnel("30d"); }, [fetchFunnel]);

  function handlePreset(p: Preset) {
    setPreset(p);
    if (p !== "custom") fetchFunnel(p);
  }

  const base = data?.acquisition[0]?.count ?? 0;

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
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard label="Signups" value={base} color="text-foreground" />
            <SummaryCard label="CVs Created" value={data.engagement.find(s => s.key === "cv_created")?.count ?? 0} sub={base > 0 ? `${fmtPct(pct(data.engagement.find(s => s.key === "cv_created")?.count ?? 0, base))} of signups` : undefined} />
            <SummaryCard label="PDF Downloads" value={data.engagement.find(s => s.key === "pdf_downloaded")?.count ?? 0} sub={base > 0 ? `${fmtPct(pct(data.engagement.find(s => s.key === "pdf_downloaded")?.count ?? 0, base))} of signups` : undefined} />
            <SummaryCard label="Pro Upgrades" value={data.conversion.find(s => s.key === "upgraded")?.count ?? 0} color="text-success" sub={base > 0 ? `${fmtPct(pct(data.conversion.find(s => s.key === "upgraded")?.count ?? 0, base))} conversion` : undefined} />
          </div>

          {/* Funnel sections */}
          <FunnelSection title="Acquisition" description="How users arrive and onboard" stages={data.acquisition} base={base} accentClass="bg-blue-500" />
          <FunnelSection title="Engagement" description="Feature adoption and depth of usage" stages={data.engagement} base={base} accentClass="bg-[#065F46]" />
          <FunnelSection title="Conversion" description="Path to paid" stages={data.conversion} base={base} accentClass="bg-amber-500" />

          {/* Drop-off insights */}
          <DropoffInsights data={data} base={base} />

          {/* Extra metrics */}
          {data.extras.length > 0 && (
            <div className="rounded-lg border">
              <div className="border-b px-4 py-3">
                <h2 className="text-sm font-semibold">Additional Metrics</h2>
              </div>
              <div className="divide-y">
                {data.extras.map((e) => (
                  <div key={e.key} className="px-4 py-3 flex items-center justify-between">
                    <span className="text-sm">{e.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold tabular-nums">{e.count.toLocaleString()}</span>
                      {base > 0 && (
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                          {fmtPct(pct(e.count, base))} of signups
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Funnel Section ── */
function FunnelSection({ title, description, stages, base, accentClass }: { title: string; description: string; stages: Stage[]; base: number; accentClass: string }) {
  const sectionBase = stages[0]?.count ?? 0;

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="border-b px-4 py-3 flex items-center gap-3">
        <div className={cn("h-2 w-2 rounded-full", accentClass)} />
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-end gap-2" style={{ height: 160 }}>
          {stages.map((stage, i) => {
            const maxCount = sectionBase || 1;
            const barH = Math.max((stage.count / maxCount) * 130, 4);
            const stepPct = i > 0 && stages[i - 1].count > 0 ? pct(stage.count, stages[i - 1].count) : null;
            const Icon = ICON_MAP[stage.icon || ""] || FileText;

            return (
              <div key={stage.key} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-[11px] font-bold tabular-nums">{stage.count.toLocaleString()}</span>
                {stepPct !== null && (
                  <span className={cn(
                    "text-[9px] font-semibold tabular-nums px-1 py-0.5 rounded-full",
                    stepPct >= 60 ? "bg-success/15 text-success" :
                    stepPct >= 30 ? "bg-warning/15 text-warning" :
                    "bg-error/15 text-error"
                  )}>
                    {fmtPct(stepPct)}
                  </span>
                )}
                {i === 0 && <div className="h-4" />}
                <div className={cn("w-full rounded-t-md transition-all duration-500 max-w-[60px]", accentClass, i > 0 && "opacity-80")} style={{ height: barH }} />
                <Icon className="h-3 w-3 text-muted-foreground mt-1" />
                <span className="text-[9px] text-muted-foreground text-center leading-tight h-6">{stage.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data table */}
      <div className="border-t">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left px-4 py-2 font-semibold text-muted-foreground">Stage</th>
              <th className="text-right px-4 py-2 font-semibold text-muted-foreground">Users</th>
              <th className="text-right px-4 py-2 font-semibold text-muted-foreground">Of Signups</th>
              <th className="text-right px-4 py-2 font-semibold text-muted-foreground">Step Conv.</th>
              <th className="text-right px-4 py-2 font-semibold text-muted-foreground">Drop</th>
            </tr>
          </thead>
          <tbody>
            {stages.map((stage, i) => {
              const prev = i === 0 ? stage.count : stages[i - 1].count;
              const ofSignups = pct(stage.count, base);
              const stepConv = i === 0 ? 100 : pct(stage.count, prev);
              const dropOff = i === 0 ? 0 : pct(prev - stage.count, prev);
              const Icon = ICON_MAP[stage.icon || ""] || FileText;

              return (
                <tr key={stage.key} className={cn("border-b last:border-0", dropOff > 50 && i > 0 && "bg-error/5")}>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="font-medium">{stage.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right font-bold tabular-nums">{stage.count.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{fmtPct(ofSignups)}</td>
                  <td className="px-4 py-2 text-right">
                    {i === 0 ? <span className="text-muted-foreground">—</span> : (
                      <span className={cn("font-semibold tabular-nums", stepConv >= 60 ? "text-success" : stepConv >= 30 ? "text-warning" : "text-error")}>
                        {fmtPct(stepConv)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {i === 0 ? <span className="text-muted-foreground">—</span> : dropOff > 0 ? (
                      <span className={cn("font-semibold tabular-nums", dropOff >= 50 ? "text-error" : dropOff >= 30 ? "text-warning" : "text-muted-foreground")}>
                        {fmtPct(dropOff)}
                      </span>
                    ) : <span className="text-success font-semibold">0%</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Drop-off Insights ── */
function DropoffInsights({ data, base }: { data: FunnelData; base: number }) {
  const allStages = [...data.acquisition, ...data.engagement, ...data.conversion];
  const drops: { from: string; to: string; dropPct: number; lost: number }[] = [];

  for (let i = 1; i < allStages.length; i++) {
    const prev = allStages[i - 1];
    const curr = allStages[i];
    if (prev.count === 0) continue;
    const drop = pct(prev.count - curr.count, prev.count);
    if (drop >= 20) {
      drops.push({ from: prev.label, to: curr.label, dropPct: drop, lost: prev.count - curr.count });
    }
  }

  // Sort by biggest drop
  drops.sort((a, b) => b.dropPct - a.dropPct);

  if (drops.length === 0 && base === 0) return null;

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-warning" /> Drop-off Insights
      </h3>
      {drops.length === 0 ? (
        <p className="text-sm text-muted-foreground">No significant drop-offs detected (&gt;20%).</p>
      ) : (
        <div className="space-y-2">
          {drops.slice(0, 5).map((d, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className={cn("shrink-0 mt-0.5 h-2 w-2 rounded-full", d.dropPct >= 50 ? "bg-error" : "bg-warning")} />
              <div>
                <span className="font-medium">{d.from} → {d.to}:</span>{" "}
                <span className={d.dropPct >= 50 ? "text-error font-semibold" : "text-warning font-semibold"}>
                  {fmtPct(d.dropPct)} drop
                </span>
                <span className="text-muted-foreground">{" — "}{d.lost.toLocaleString()}{" users did not proceed."}</span>
                {d.dropPct >= 50 && <span className="text-error text-xs ml-1 font-medium">Critical</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Summary Card ── */
function SummaryCard({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("text-lg font-bold tabular-nums mt-0.5", color)}>{typeof value === "number" ? value.toLocaleString() : value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}
