"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useAdminRange } from "@/components/admin/date-range-picker";
import { StatTile } from "@/components/admin/stat-tile";

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
  const { fromIso, toIso } = useAdminRange();
  const [data, setData] = useState<InterventionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch(`/api/admin/interventions?from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load popup data (${res.status})`);
        const json: InterventionData = await res.json();
        if (!cancelled) setData(json);
      })
      .catch((err: Error) => {
        console.error("[interventions] load failed:", err);
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fromIso, toIso]);

  const conv = data?.totals.conversionPct ?? 0;

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-error">{error}</p>}
      {loading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-16 justify-center"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>}

      {data && !loading && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatTile label="Total Shown" value={data.totals.shown.toLocaleString()} />
            <StatTile label="Total Clicked" value={data.totals.clicked.toLocaleString()} />
            <StatTile label="Total Dismissed" value={data.totals.dismissed.toLocaleString()} />
            <StatTile
              label="Overall Conversion"
              value={`${conv}%`}
              note={conv >= 10 ? "Good" : conv >= 5 ? "Fair" : "Low"}
              tone={conv >= 10 ? "success" : conv >= 5 ? "warning" : "error"}
            />
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
                <div className="overflow-x-auto">
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
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
