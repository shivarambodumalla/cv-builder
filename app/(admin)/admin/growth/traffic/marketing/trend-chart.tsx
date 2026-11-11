"use client";

import { useState } from "react";
import { fmt, fmtDate } from "./format";
import type { TrendPoint } from "./types";

export function TrendChart({
  trend,
  title = "Daily trend",
  formatLabel = fmtDate,
}: {
  trend: TrendPoint[];
  title?: string;
  formatLabel?: (date: string) => string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const maxClicks = Math.max(...trend.map((d) => d.clicks), 1);
  const maxImpressions = Math.max(...trend.map((d) => d.impressions), 1);
  const totalClicks = trend.reduce((s, d) => s + d.clicks, 0);
  const totalImpressions = trend.reduce((s, d) => s + d.impressions, 0);

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-primary opacity-80" />
            <span className="text-muted-foreground">Clicks</span>
            <span className="font-semibold tabular-nums">{fmt(totalClicks)}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-400 opacity-60" />
            <span className="text-muted-foreground">Impressions</span>
            <span className="font-semibold tabular-nums">{fmt(totalImpressions)}</span>
          </span>
        </div>
      </div>

      {trend.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No trend data yet.</p>
      ) : (
        <>
          <div className="relative flex items-end gap-0.5 h-32">
            {trend.map((d, i) => {
              const clickH = Math.max(2, (d.clicks / maxClicks) * 100);
              const impH = Math.max(2, (d.impressions / maxImpressions) * 100);
              const isHov = hovered === i;
              return (
                <div
                  key={d.date}
                  className="relative flex-1 h-full flex items-end cursor-default"
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Impressions — ghost background bar, own scale */}
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-t bg-blue-400 transition-opacity duration-100"
                    style={{ height: `${impH}%`, opacity: isHov ? 0.35 : 0.18 }}
                  />
                  {/* Clicks — foreground bar, own scale */}
                  <div
                    className="relative z-10 w-full rounded-t bg-primary transition-opacity duration-100"
                    style={{ height: `${clickH}%`, opacity: isHov ? 1 : 0.72 }}
                  />
                  {/* Tooltip */}
                  {isHov && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-popover border rounded-lg px-2.5 py-2 text-[11px] whitespace-nowrap z-20 shadow-md pointer-events-none">
                      <p className="font-semibold mb-1 text-foreground">{formatLabel(d.date)}</p>
                      <div className="space-y-0.5">
                        <p className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-sm bg-primary opacity-80 shrink-0" />
                          <span className="text-muted-foreground">Clicks</span>
                          <span className="font-medium text-foreground ml-auto pl-3 tabular-nums">{d.clicks.toLocaleString()}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-sm bg-blue-400 opacity-60 shrink-0" />
                          <span className="text-muted-foreground">Impressions</span>
                          <span className="font-medium text-foreground ml-auto pl-3 tabular-nums">{d.impressions.toLocaleString()}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span>{formatLabel(trend[0]?.date ?? "")}</span>
            <span>{formatLabel(trend[trend.length - 1]?.date ?? "")}</span>
          </div>
        </>
      )}
    </div>
  );
}
