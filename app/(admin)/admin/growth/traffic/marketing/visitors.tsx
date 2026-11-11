import { cn } from "@/lib/utils";
import { channelColor, fmtDuration, qualityBadge, qualityLabel } from "./format";
import type { NvRRow, SessionQualityRow } from "./types";

export function NewVsReturning({ rows }: { rows: NvRRow[] }) {
  const total = rows.reduce((s, r) => s + r.sessions, 0) || 1;
  const newRow = rows.find((r) => r.type === "new");
  const retRow = rows.find((r) => r.type === "returning");

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold">New vs Returning</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No data available.</p>
      ) : (
        <>
          {/* Split bar */}
          <div className="flex rounded-lg overflow-hidden h-3">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${Math.round(((newRow?.sessions ?? 0) / total) * 100)}%`, opacity: 0.8 }}
            />
            <div
              className="h-full bg-primary"
              style={{ width: `${Math.round(((retRow?.sessions ?? 0) / total) * 100)}%`, opacity: 0.8 }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { row: newRow, label: "New visitors", color: "bg-blue-500" },
              { row: retRow, label: "Returning", color: "bg-primary" },
            ].map(({ row, label, color }) => (
              <div key={label} className="rounded-lg border bg-muted/20 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={cn("inline-block w-2 h-2 rounded-full", color)} />
                  <span className="text-xs font-medium">{label}</span>
                  <span className="ml-auto text-xs font-bold">
                    {row ? Math.round((row.sessions / total) * 100) : 0}%
                  </span>
                </div>
                {row ? (
                  <div className="space-y-1 text-[11px] text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Sessions</span>
                      <span className="tabular-nums font-medium text-foreground">
                        {row.sessions.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Engaged</span>
                      <span className="tabular-nums font-medium text-foreground">{row.engagementRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg time</span>
                      <span className="tabular-nums font-medium text-foreground">
                        {fmtDuration(row.avgDuration)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pages/visit</span>
                      <span className="tabular-nums font-medium text-foreground">{row.pagesPerSession}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground">No data</p>
                )}
              </div>
            ))}
          </div>

          {retRow && newRow && retRow.engagementRate > newRow.engagementRate && (
            <p className="text-[11px] text-muted-foreground border-t pt-3">
              Returning visitors are{" "}
              <span className="text-success font-medium">
                {retRow.engagementRate - newRow.engagementRate}% more engaged
              </span>{" "}
              , a strong remarketing signal.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export function SessionQualityTable({ rows }: { rows: SessionQualityRow[] }) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <h3 className="text-sm font-semibold">Session Quality by Channel</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No session data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-muted-foreground font-medium">Channel</th>
                <th className="text-right py-2 text-muted-foreground font-medium w-16">Sessions</th>
                <th className="text-right py-2 text-muted-foreground font-medium w-16">Engaged</th>
                <th className="text-right py-2 text-muted-foreground font-medium w-16">Avg time</th>
                <th className="text-right py-2 text-muted-foreground font-medium w-14">Pg/visit</th>
                <th className="text-right py-2 text-muted-foreground font-medium w-14">Bounce</th>
                <th className="text-right py-2 text-muted-foreground font-medium w-20">Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.channel} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={cn("inline-block w-2 h-2 rounded-full shrink-0", channelColor(r.channel))} />
                      <span className="font-medium">{r.channel}</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-right tabular-nums">{r.sessions.toLocaleString()}</td>
                  <td className="py-2.5 text-right tabular-nums">{r.engagementRate}%</td>
                  <td className="py-2.5 text-right tabular-nums">{fmtDuration(r.avgDuration)}</td>
                  <td className="py-2.5 text-right tabular-nums">{r.pagesPerSession}</td>
                  <td className="py-2.5 text-right tabular-nums text-muted-foreground">{r.bounceRate}%</td>
                  <td className="py-2.5 text-right">
                    <span className={cn("px-1.5 py-0.5 rounded font-medium", qualityBadge(r.qualityScore))}>
                      {qualityLabel(r.qualityScore)} · {r.qualityScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
