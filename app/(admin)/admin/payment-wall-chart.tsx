"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import type { WallDay } from "@/lib/admin/payment-wall";

const VB_W = 640;
const VB_H = 120;
const PAD = { top: 8, right: 8, bottom: 24, left: 28 };
const CW = VB_W - PAD.left - PAD.right;
const CH = VB_H - PAD.top - PAD.bottom;
const TOOLTIP_W = 180;

const SKIPPED = "var(--warning)";
const NOT_CLOSED = "var(--success)";

export function PaymentWallChart({
  series,
  totalOpens,
  totalSkipped,
  totalUsers,
  paidUsers,
}: {
  series: WallDay[];
  totalOpens: number;
  totalSkipped: number;
  totalUsers: number;
  paidUsers: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const n = series.length;
  const maxVal = Math.max(1, ...series.map((d) => d.skipped + d.notClosed));
  const barW = CW / n;
  const gap = Math.max(1, barW * 0.2);

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; top: number } | null>(null);

  const show = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const { left, width, top } = svg.getBoundingClientRect();
    const idx = Math.floor((((clientX - left) / width) * VB_W - PAD.left) / barW);
    if (idx < 0 || idx >= n) return;
    setHoveredIdx(idx);
    setTooltipPos({ x: clientX, top });
  };

  const hide = () => { setHoveredIdx(null); setTooltipPos(null); };

  const tooltipLeft = tooltipPos
    ? Math.max(8, Math.min((typeof window !== "undefined" ? window.innerWidth : 1200) - TOOLTIP_W - 8, tooltipPos.x - TOOLTIP_W / 2))
    : 0;
  const tooltipBottom = tooltipPos
    ? (typeof window !== "undefined" ? window.innerHeight : 800) - tooltipPos.top + 10
    : 0;

  const skipPct = totalOpens ? Math.round((totalSkipped / totalOpens) * 100) : 0;
  const stats = [
    { label: "Wall hits", value: totalOpens },
    { label: "Users", value: totalUsers },
    { label: "Skipped", value: `${skipPct}%` },
    { label: "Paid", value: paidUsers },
  ];

  const hovered = hoveredIdx !== null ? series[hoveredIdx] : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Payment wall: last 30 days
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Upgrade modal opens · signed-in users, excluding admins
            </p>
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm" style={{ background: SKIPPED }} />
                Skipped (closed it)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm" style={{ background: NOT_CLOSED }} />
                Didn&apos;t close (checkout or left)
              </span>
            </div>
          </div>
          <div className="flex gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-right">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            preserveAspectRatio="none"
            className="w-full"
            style={{ height: VB_H, display: "block" }}
          >
            {[0, 0.5, 1].map((v) => {
              const y = PAD.top + (1 - v) * CH;
              const label = v === 0 ? 0 : v === 0.5 ? Math.round(maxVal / 2) : maxVal;
              return (
                <g key={v}>
                  <line
                    x1={PAD.left}
                    y1={y}
                    x2={VB_W - PAD.right}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity={v === 0 ? 0.12 : 0.06}
                    strokeWidth={1}
                  />
                  <text x={PAD.left - 4} y={y + 3} textAnchor="end" fontSize={7} fill="currentColor" fillOpacity={0.38}>
                    {label}
                  </text>
                </g>
              );
            })}

            {series.map((d, i) => {
              const x = PAD.left + i * barW + gap / 2;
              const skippedH = (d.skipped / maxVal) * CH;
              const notClosedH = (d.notClosed / maxVal) * CH;
              const opacity = hoveredIdx === i ? 1 : 0.75;
              return (
                <g key={d.day}>
                  {d.skipped > 0 && (
                    <rect x={x} y={PAD.top + CH - skippedH} width={barW - gap} height={skippedH} fill={SKIPPED} fillOpacity={opacity} />
                  )}
                  {d.notClosed > 0 && (
                    <rect
                      x={x}
                      y={PAD.top + CH - skippedH - notClosedH}
                      width={barW - gap}
                      height={notClosedH}
                      fill={NOT_CLOSED}
                      fillOpacity={opacity}
                    />
                  )}
                </g>
              );
            })}

            {series.map((d, i) => {
              if (i !== 0 && i !== n - 1 && i % 7 !== 0) return null;
              return (
                <text
                  key={d.day}
                  x={PAD.left + i * barW + barW / 2}
                  y={VB_H - 5}
                  textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
                  fontSize={8}
                  fill="currentColor"
                  fillOpacity={0.45}
                >
                  {d.day.slice(5)}
                </text>
              );
            })}

            <rect
              x={PAD.left}
              y={PAD.top}
              width={CW}
              height={CH}
              fill="transparent"
              className="cursor-crosshair"
              onMouseMove={(e) => show(e.clientX)}
              onMouseLeave={hide}
              onTouchMove={(e) => e.touches[0] && show(e.touches[0].clientX)}
              onTouchEnd={hide}
            />
          </svg>
        </div>
      </CardContent>

      {tooltipPos && hovered && (
        <div
          className="pointer-events-none fixed z-[9999] rounded-lg border border-border bg-popover shadow-xl"
          style={{ left: tooltipLeft, bottom: tooltipBottom, width: TOOLTIP_W }}
        >
          <div className="space-y-0.5 px-3 py-2.5 text-xs">
            <p className="text-[11px] font-semibold">{hovered.day}</p>
            <p className="tabular-nums">
              {hovered.skipped + hovered.notClosed} hits · {hovered.users} user{hovered.users !== 1 ? "s" : ""}
            </p>
            <p className="tabular-nums" style={{ color: SKIPPED }}>{hovered.skipped} skipped</p>
            <p className="tabular-nums" style={{ color: NOT_CLOSED }}>{hovered.notClosed} didn&apos;t close</p>
          </div>
        </div>
      )}
    </Card>
  );
}
