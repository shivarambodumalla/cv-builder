import { MousePointerClick, TrendingDown, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { fp, p } from "./format";
import type { FunnelData } from "./types";

/** Where visitors land, signed-in page use, bounces and signup sources. */
export function VisitorFlow({ data, signups }: { data: FunnelData; signups: number }) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Where visitors land */}
        <div className="rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-4">
            <MousePointerClick className="h-4 w-4 text-purple-500" />
            <h2 className="text-sm font-semibold">Where visitors land</h2>
            <span className="text-[10px] text-muted-foreground ml-auto">{data.totalAnonVisits.toLocaleString()} total views</span>
          </div>
          <div className="space-y-2">
            {data.pageVisits.filter(pv => pv.type === "public" && pv.count > 0).map((pv) => {
              const barW = data.totalAnonVisits > 0 ? Math.max((pv.count / data.totalAnonVisits) * 100, 1) : 0;
              return (
                <div key={pv.path} className="flex items-center gap-3">
                  <span className="text-xs font-medium w-24 truncate">{pv.label}</span>
                  <div className="flex-1 h-5 rounded bg-muted/50 overflow-hidden relative">
                    <div className="h-full rounded bg-purple-500/20" style={{ width: `${barW}%` }} />
                    <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-bold tabular-nums">{pv.count.toLocaleString()}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground tabular-nums w-10 text-right">{fp(p(pv.count, data.totalAnonVisits))}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Authenticated page usage */}
        <div className="rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-[#065F46]" />
            <h2 className="text-sm font-semibold">Authenticated page usage</h2>
          </div>
          <div className="space-y-2">
            {data.pageVisits.filter(pv => pv.type === "private").map((pv) => {
              const maxPrivate = Math.max(...data.pageVisits.filter(x => x.type === "private").map(x => x.count), 1);
              const barW = Math.max((pv.count / maxPrivate) * 100, 1);
              return (
                <div key={pv.path} className="flex items-center gap-3">
                  <span className="text-xs font-medium w-28 truncate">{pv.label}</span>
                  <div className="flex-1 h-5 rounded bg-muted/50 overflow-hidden relative">
                    <div className="h-full rounded bg-[#065F46]/20" style={{ width: `${barW}%` }} />
                    <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-bold tabular-nums">{pv.count.toLocaleString()}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground tabular-nums w-10 text-right">{signups > 0 ? fp(p(pv.count, signups)) : "–"}</span>
                </div>
              );
            })}
            {data.pageVisits.filter(pv => pv.type === "private").every(pv => pv.count === 0) && (
              <p className="text-xs text-muted-foreground py-4 text-center">No authenticated page sessions recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── 4. BOUNCE + SIGNUP SOURCES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Where visitors bounce */}
        <div className="rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-error" />
            <h2 className="text-sm font-semibold">Where visitors bounce</h2>
          </div>
          <p className="text-[11px] text-muted-foreground mb-4">Pages with high view counts but low progression to login/signup</p>
          {data.bounceAnalysis.length > 0 ? (
            <div className="space-y-2.5">
              {data.bounceAnalysis.map((b) => (
                <div key={b.path} className="flex items-center gap-3">
                  <span className="text-xs font-medium w-24 truncate">{b.label}</span>
                  <div className="flex-1 h-5 rounded bg-muted/50 overflow-hidden relative">
                    <div className="h-full rounded bg-error/20" style={{ width: `${b.bouncePct}%` }} />
                    <div className="h-full rounded bg-success/30 absolute top-0 left-0" style={{ width: `${b.reachLoginPct}%` }} />
                  </div>
                  <div className="text-right shrink-0 w-20">
                    <span className={cn("text-xs font-bold tabular-nums", b.bouncePct >= 80 ? "text-error" : b.bouncePct >= 50 ? "text-warning" : "text-success")}>{b.bouncePct}%</span>
                    <span className="text-[9px] text-muted-foreground ml-1">bounce</span>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3 pt-2 border-t text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-error/20 inline-block" /> Bounced (didn&apos;t reach login)</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-success/30 inline-block" /> Proceeded to login</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-4 text-center">No page view data in this period.</p>
          )}
        </div>

        {/* Where signups come from */}
        <div className="rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-success" />
            <h2 className="text-sm font-semibold">Where signups come from</h2>
          </div>
          <p className="text-[11px] text-muted-foreground mb-4">First page new users visit after signing up. Indicates what brought them in</p>
          {data.signupSources.length > 0 ? (
            <div className="space-y-2.5">
              {data.signupSources.map((s, i) => {
                const maxCount = data.signupSources[0]?.count || 1;
                const barW = Math.max((s.count / maxCount) * 100, 3);
                return (
                  <div key={s.page} className="flex items-center gap-3">
                    <span className={cn("text-xs font-bold w-5 text-center tabular-nums", i === 0 ? "text-success" : "text-muted-foreground")}>#{i + 1}</span>
                    <span className="text-xs font-medium w-28 truncate">{s.page.replace(/^\//, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "Homepage"}</span>
                    <div className="flex-1 h-5 rounded bg-muted/50 overflow-hidden relative">
                      <div className="h-full rounded bg-success/20" style={{ width: `${barW}%` }} />
                      <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-bold tabular-nums">{s.count}</span>
                    </div>
                    <span className="text-[10px] font-semibold tabular-nums text-muted-foreground w-10 text-right">{s.pct}%</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-4 text-center">No signup source data yet. Users need page_session tracking after signup.</p>
          )}
        </div>
      </div>
    </>
  );
}
