"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2, TrendingUp, TrendingDown, Eye, MousePointerClick, XCircle } from "lucide-react";

type Preset = "today" | "7d" | "30d" | "90d" | "180d" | "365d" | "custom";

function getRange(preset: Preset): { from: string; to: string } {
  const to = new Date(); to.setHours(23, 59, 59, 999);
  const from = new Date(); from.setHours(0, 0, 0, 0);
  switch (preset) {
    case "7d": from.setDate(from.getDate() - 6); break;
    case "30d": from.setDate(from.getDate() - 29); break;
    case "90d": from.setDate(from.getDate() - 89); break;
    case "180d": from.setDate(from.getDate() - 179); break;
    case "365d": from.setDate(from.getDate() - 364); break;
  }
  return { from: from.toISOString(), to: to.toISOString() };
}

const PRESETS: { key: Preset; label: string }[] = [
  { key: "today", label: "Today" }, { key: "7d", label: "Week" }, { key: "30d", label: "Month" },
  { key: "90d", label: "3 Months" }, { key: "180d", label: "6 Months" }, { key: "365d", label: "1 Year" },
  { key: "custom", label: "Custom" },
];

interface InterventionMetric {
  id: string;
  label: string;
  category: "signup_modal" | "popover" | "inline";
  shown: number;
  clicked: number;
  dismissed: number;
  conversionPct: number;
}

interface InterventionData {
  interventions: InterventionMetric[];
  totals: { shown: number; clicked: number; dismissed: number; conversionPct: number };
}

export function InterventionsDashboard() {
  const [preset, setPreset] = useState<Preset>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [data, setData] = useState<InterventionData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (pr: Preset, cfrom?: string, cto?: string) => {
    setLoading(true);
    let from: string, to: string;
    if (pr === "custom" && cfrom && cto) { from = new Date(cfrom).toISOString(); to = new Date(cto + "T23:59:59.999Z").toISOString(); }
    else ({ from, to } = getRange(pr));
    const res = await fetch(`/api/admin/interventions?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData("30d"); }, [fetchData]);

  function handlePreset(pr: Preset) { setPreset(pr); if (pr !== "custom") fetchData(pr); }

  return (
    <div className="space-y-6">
      {/* Date range */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex gap-1 rounded-lg bg-muted p-0.5">
          {PRESETS.map((pr) => (
            <button key={pr.key} onClick={() => handlePreset(pr.key)} className={cn("rounded-md px-3 py-1.5 text-xs transition-colors", preset === pr.key ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground")}>
              {pr.label}
            </button>
          ))}
        </div>
        {preset === "custom" && (
          <div className="flex items-end gap-2">
            <div><label className="text-[10px] text-muted-foreground">From</label><Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="h-8 text-xs w-36" /></div>
            <div><label className="text-[10px] text-muted-foreground">To</label><Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="h-8 text-xs w-36" /></div>
            <Button size="sm" className="h-8 text-xs" onClick={() => fetchData("custom", customFrom, customTo)} disabled={!customFrom || !customTo || loading}>Apply</Button>
          </div>
        )}
      </div>

      {loading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-16 justify-center"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>}

      {data && !loading && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Eye} label="Total Shown" value={data.totals.shown} />
            <SummaryCard icon={MousePointerClick} label="Total Clicked" value={data.totals.clicked} color="text-success" />
            <SummaryCard icon={XCircle} label="Total Dismissed" value={data.totals.dismissed} />
            <SummaryCard icon={TrendingUp} label="Overall Conversion" value={`${data.totals.conversionPct}%`} color={data.totals.conversionPct >= 10 ? "text-success" : data.totals.conversionPct >= 5 ? "text-warning" : "text-error"} />
          </div>

          {/* By category */}
          {(["signup_modal", "popover", "inline"] as const).map((cat) => {
            const items = data.interventions.filter(i => i.category === cat);
            if (items.length === 0) return null;
            const catLabel = cat === "signup_modal" ? "Signup Modals" : cat === "popover" ? "Popovers" : "Inline Nudges";
            const catColor = cat === "signup_modal" ? "bg-[#065F46]" : cat === "popover" ? "bg-primary" : "bg-muted-foreground";
            return (
              <div key={cat} className="rounded-xl border overflow-hidden">
                <div className="border-b px-4 py-3 bg-muted/20 flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full", catColor)} />
                  <h2 className="text-sm font-semibold">{catLabel}</h2>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/10">
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Intervention</th>
                      <th className="text-right px-4 py-2 font-medium text-muted-foreground">Shown</th>
                      <th className="text-right px-4 py-2 font-medium text-muted-foreground">Clicked</th>
                      <th className="text-right px-4 py-2 font-medium text-muted-foreground">Dismissed</th>
                      <th className="text-right px-4 py-2 font-medium text-muted-foreground">Conv. %</th>
                      <th className="px-4 py-2 w-32"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((i) => (
                      <tr key={i.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-2.5 font-medium">{i.label}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums">{i.shown}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-success font-semibold">{i.clicked}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{i.dismissed}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className={cn("font-bold tabular-nums", i.conversionPct >= 20 ? "text-success" : i.conversionPct >= 5 ? "text-warning" : "text-muted-foreground")}>
                            {i.conversionPct}%
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          {i.shown > 0 && (
                            <div className="flex gap-0.5 h-2 rounded-full overflow-hidden bg-muted">
                              <div className="bg-success rounded-l-full" style={{ width: `${i.conversionPct}%` }} />
                              <div className="bg-error/30" style={{ width: `${100 - i.conversionPct}%` }} />
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number | string; color?: string }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
      </div>
      <p className={cn("text-2xl font-bold tabular-nums", color)}>{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  );
}
