import { cn } from "@/lib/utils";
import { fmtDuration } from "./format";
import type { LandingPageRow } from "./types";

export function LandingPageQuality({ rows }: { rows: LandingPageRow[] }) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b">
        <h3 className="text-sm font-semibold">Landing Page Quality</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">Which entry points engage users vs bounce them</p>
      </div>
      {rows.length === 0 ? (
        <p className="p-6 text-sm text-muted-foreground">No landing page data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Page</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-16">Sessions</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-16">Engaged</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-16">Avg time</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-14">Bounce</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-14">New %</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.page} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-[11px] max-w-xs">
                    <span className="line-clamp-1 text-muted-foreground">{row.page || "/"}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{row.sessions.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    <span
                      className={cn(
                        "px-1 py-0.5 rounded",
                        row.engagementRate >= 60
                          ? "text-success"
                          : row.engagementRate >= 40
                          ? "text-warning"
                          : "text-error"
                      )}
                    >
                      {row.engagementRate}%
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                    {fmtDuration(row.avgDuration)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                    {row.bounceRate}%
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                    {row.newUsersPercent}%
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
