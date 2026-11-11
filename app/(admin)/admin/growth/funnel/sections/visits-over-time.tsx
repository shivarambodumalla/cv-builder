"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatTile } from "@/components/admin/stat-tile";
import type { TimePoint } from "./types";

export function VisitsOverTime({ visits, signups, days }: { visits: TimePoint[]; signups: TimePoint[]; days: number }) {
  const [hover, setHover] = useState<number | null>(null);

  // Bucket by range length: daily up to two months, then weekly, then monthly
  const bucket: "day" | "week" | "month" = days > 180 ? "month" : days > 60 ? "week" : "day";

  function bucketKey(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00Z");
    if (bucket === "month") return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    if (bucket === "week") {
      // ISO week start (Monday)
      const day = d.getUTCDay();
      const diff = day === 0 ? -6 : 1 - day;
      const monday = new Date(d); monday.setUTCDate(d.getUTCDate() + diff);
      return monday.toISOString().slice(0, 10);
    }
    return dateStr;
  }

  function bucketLabel(key: string): string {
    if (bucket === "month") {
      const [y, m] = key.split("-");
      return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    }
    if (bucket === "week") {
      return new Date(key + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    return new Date(key + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  const vMap = new Map<string, number>();
  for (const pt of visits) vMap.set(bucketKey(pt.date), (vMap.get(bucketKey(pt.date)) ?? 0) + pt.count);
  const sMap = new Map<string, number>();
  for (const pt of signups) sMap.set(bucketKey(pt.date), (sMap.get(bucketKey(pt.date)) ?? 0) + pt.count);

  const keys = [...vMap.keys()].sort();
  const rows = keys.map(k => ({ key: k, label: bucketLabel(k), visits: vMap.get(k) ?? 0, signups: sMap.get(k) ?? 0 }));
  const maxVisits = Math.max(1, ...rows.map(r => r.visits));
  const totalVisits = rows.reduce((sum, r) => sum + r.visits, 0);
  const totalSignups = rows.reduce((sum, r) => sum + r.signups, 0);
  const nonZeroRows = rows.filter(r => r.visits > 0);
  const avgVisits = nonZeroRows.length > 0 ? Math.round(totalVisits / nonZeroRows.length) : 0;
  const peakVisits = rows.reduce((best, r) => r.visits > (best?.visits ?? 0) ? r : best, rows[0]);
  const bestSignupDay = rows.reduce((best, r) => r.signups > (best?.signups ?? 0) ? r : best, rows[0]);
  const conversionPct = totalVisits > 0 ? Math.round((totalSignups / totalVisits) * 1000) / 10 : 0;

  // Trend: compare first half vs second half average
  const half = Math.floor(rows.length / 2);
  const firstHalfAvg = half > 0 ? rows.slice(0, half).reduce((s, r) => s + r.visits, 0) / half : 0;
  const secondHalfAvg = rows.length - half > 0 ? rows.slice(half).reduce((s, r) => s + r.visits, 0) / (rows.length - half) : 0;
  const trendPct = firstHalfAvg > 0 ? Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100) : 0;

  const bucketLabelName = bucket === "month" ? "month" : bucket === "week" ? "week" : "day";

  return (
    <div className="rounded-xl border p-5">
      <div className="flex items-center gap-2 mb-1">
        <BarChart3 className="h-4 w-4 text-blue-500" />
        <h2 className="text-sm font-semibold">Visits Over Time</h2>
        <span className="text-[10px] text-muted-foreground ml-auto capitalize">
          {bucket === "month" ? "Monthly" : bucket === "week" ? "Weekly" : "Daily"}
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">No visit data in this period.</p>
      ) : (
        <>
          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-4 pt-2">
            <StatTile label="Total views" value={totalVisits.toLocaleString()} note={`${avgVisits.toLocaleString()}/avg ${bucketLabelName}`} />
            <StatTile
              label="Signups"
              value={totalSignups.toLocaleString()}
              note={`${conversionPct}% conv.`}
              tone={conversionPct >= 5 ? "success" : conversionPct >= 2 ? "warning" : "neutral"}
            />
            <StatTile label={`Peak ${bucketLabelName}`} value={peakVisits.visits.toLocaleString()} note={peakVisits.label} />
            <StatTile
              label="Best signup"
              value={bestSignupDay.signups.toLocaleString()}
              note={bestSignupDay.signups > 0 ? bestSignupDay.label : "–"}
              tone={bestSignupDay.signups > 0 ? "success" : "neutral"}
            />
            <StatTile
              label="Trend"
              value={trendPct > 0 ? `+${trendPct}%` : `${trendPct}%`}
              note="2nd half vs 1st"
              tone={trendPct > 10 ? "success" : trendPct < -10 ? "error" : "neutral"}
            />
          </div>

          {/* Chart with tooltip lifted outside overflow */}
          <div className="relative">
            {hover !== null && rows[hover] && (() => {
              const r = rows[hover];
              const convPct = r.visits > 0 ? Math.round((r.signups / r.visits) * 1000) / 10 : 0;
              return (
                <div className="pointer-events-none absolute top-0 left-0 right-0 z-20 flex justify-center">
                  <div className="rounded-md bg-foreground text-background text-[10.5px] px-3 py-1.5 shadow-lg whitespace-nowrap">
                    <span className="font-semibold">{r.label}</span>
                    <span className="text-background/60 mx-1.5">·</span>
                    <span>{r.visits.toLocaleString()} views</span>
                    <span className="text-background/60 mx-1.5">·</span>
                    <span>{r.signups} signups</span>
                    {r.visits > 0 && (
                      <>
                        <span className="text-background/60 mx-1.5">·</span>
                        <span>{convPct}% conv.</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}
            <div className="overflow-x-auto pt-9 pb-2" onMouseLeave={() => setHover(null)}>
              <div className="flex items-end gap-1" style={{ height: 180, minWidth: rows.length * (bucket === "day" ? 22 : 40) }}>
                {rows.map((r, i) => {
                  const visitsH = Math.max((r.visits / maxVisits) * 140, r.visits > 0 ? 3 : 0);
                  const signupsH = r.visits > 0 ? Math.max((r.signups / maxVisits) * 140, r.signups > 0 ? 2 : 0) : 0;
                  const isHover = hover === i;
                  return (
                    <div
                      key={r.key}
                      className="relative flex flex-col items-center gap-1 flex-1 cursor-pointer"
                      style={{ minWidth: bucket === "day" ? 18 : 36 }}
                      onMouseEnter={() => setHover(i)}
                    >
                      <div className="relative w-full flex items-end justify-center" style={{ height: 150 }}>
                        <div
                          className={cn("w-full max-w-[28px] rounded-t transition-colors", isHover ? "bg-blue-500/70" : "bg-blue-500/40")}
                          style={{ height: visitsH }}
                        />
                        {r.signups > 0 && (
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[28px] rounded-t bg-success" style={{ height: signupsH }} />
                        )}
                      </div>
                      <span className="text-[9px] text-muted-foreground tabular-nums truncate w-full text-center">
                        {bucket === "day" && rows.length > 20
                          ? (i % Math.ceil(rows.length / 10) === 0 ? r.label : "")
                          : r.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-blue-500/40 inline-block" /> Anonymous visits</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-success inline-block" /> Signups</span>
            <span className="text-muted-foreground/60">· Hover bars for details</span>
          </div>
        </>
      )}
    </div>
  );
}
