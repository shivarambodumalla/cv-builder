"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type ChartSeries = {
  label: string;
  hex: string;
  total: number;
  max: number;
  data: { day: string; value: number }[];
};

const VB_W = 640;
const VB_H = 160;
const PAD = { top: 10, right: 8, bottom: 22, left: 8 };
const CW = VB_W - PAD.left - PAD.right;
const CH = VB_H - PAD.top - PAD.bottom;

const xAt = (i: number, n: number) => PAD.left + (i / Math.max(n - 1, 1)) * CW;
const yAt = (norm: number) => PAD.top + (1 - Math.max(0, Math.min(1, norm))) * CH;

const TOOLTIP_W = 208; // w-52 in px

export function ActivityChart({
  series,
  days30,
  title = "Activity — last 30 days",
}: {
  series: ChartSeries[];
  days30: string[];
  title?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const n = days30.length;

  // hoveredIdx drives crosshair + dots inside the SVG
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  // tooltipPos drives the fixed tooltip bubble (screen coordinates)
  const [tooltipPos, setTooltipPos] = useState<{
    x: number;   // cursor screen-x (px from left of viewport)
    top: number; // SVG top edge in viewport (px from top)
  } | null>(null);

  // Precompute SVG paths — all series share the same scale (global max)
  const globalMax = Math.max(1, ...series.map((s) => s.max));
  const paths = series.map((s) => {
    const pts = s.data.map((d, i) => ({
      x: xAt(i, n),
      y: yAt(globalMax > 0 ? d.value / globalMax : 0),
    }));
    const line = pts
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
      .join(" ");
    const area =
      line +
      ` L${pts[n - 1].x.toFixed(2)},${yAt(0).toFixed(2)} L${pts[0].x.toFixed(2)},${yAt(0).toFixed(2)} Z`;
    return { ...s, pts, line, area };
  });

  // Convert a pointer clientX → day index
  const resolveIdx = (clientX: number): number | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const { left, width } = svg.getBoundingClientRect();
    const svgX = ((clientX - left) / width) * VB_W;
    const frac = Math.max(0, Math.min(1, (svgX - PAD.left) / CW));
    return Math.round(frac * (n - 1));
  };

  const showTooltip = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const idx = resolveIdx(clientX);
    if (idx === null) return;
    const { top } = svg.getBoundingClientRect();
    setHoveredIdx(idx);
    setTooltipPos({ x: clientX, top });
  };

  const hideTooltip = () => {
    setHoveredIdx(null);
    setTooltipPos(null);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGRectElement>) =>
    showTooltip(e.clientX);
  const handleMouseLeave = () => hideTooltip();

  const handleTouchMove = (e: React.TouchEvent<SVGRectElement>) => {
    if (!e.touches[0]) return;
    showTooltip(e.touches[0].clientX);
  };
  const handleTouchEnd = () => hideTooltip();

  // Funnel rows for the tooltip
  const pvDay = hoveredIdx !== null ? series[0].data[hoveredIdx].value : null;
  const funnelRows =
    hoveredIdx !== null
      ? series.map((s, si) => {
          const value = s.data[hoveredIdx].value;
          const pct =
            si === 0 || pvDay == null || pvDay === 0
              ? null
              : Math.round((value / pvDay) * 100);
          return { label: s.label, hex: s.hex, value, pct, isBaseline: si === 0 };
        })
      : null;

  // Fixed tooltip position — clamped so it never overflows the viewport
  const tooltipLeft = tooltipPos
    ? Math.max(
        8,
        Math.min(
          (typeof window !== "undefined" ? window.innerWidth : 1200) - TOOLTIP_W - 8,
          tooltipPos.x - TOOLTIP_W / 2,
        ),
      )
    : 0;
  // Sits just above the SVG top edge
  const tooltipBottom = tooltipPos
    ? (typeof window !== "undefined" ? window.innerHeight : 800) - tooltipPos.top + 10
    : 0;

  const hoverX = hoveredIdx !== null ? xAt(hoveredIdx, n) : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          {days30[0].slice(5)} → {days30[n - 1].slice(5)} · all series on a shared scale
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Legend */}
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {series.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <div
                className="h-[3px] w-5 shrink-0 rounded-full"
                style={{ backgroundColor: s.hex }}
              />
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <span className="text-xs font-bold tabular-nums" style={{ color: s.hex }}>
                {s.total.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Scrollable chart wrapper — full width on desktop, scrolls on mobile */}
        <div className="overflow-x-auto">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            preserveAspectRatio="none"
            className="w-full"
            style={{ height: VB_H, display: "block" }}
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((v) => (
              <line
                key={v}
                x1={PAD.left}
                y1={yAt(v)}
                x2={VB_W - PAD.right}
                y2={yAt(v)}
                stroke="currentColor"
                strokeOpacity={v === 0 ? 0.15 : 0.06}
                strokeWidth={1}
              />
            ))}

            {/* Filled areas */}
            {paths.map((s) => (
              <path
                key={`${s.label}-area`}
                d={s.area}
                fill={s.hex}
                fillOpacity={0.1}
                stroke="none"
              />
            ))}

            {/* Lines */}
            {paths.map((s) => (
              <path
                key={`${s.label}-line`}
                d={s.line}
                fill="none"
                stroke={s.hex}
                strokeWidth={1.75}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={hoveredIdx !== null ? 0.45 : 1}
              />
            ))}

            {/* Crosshair + dots */}
            {hoverX !== null && hoveredIdx !== null && (
              <>
                <line
                  x1={hoverX}
                  y1={PAD.top}
                  x2={hoverX}
                  y2={yAt(0)}
                  stroke="currentColor"
                  strokeOpacity={0.3}
                  strokeWidth={1}
                  strokeDasharray="3 2"
                />
                {paths.map((s) => (
                  <circle
                    key={s.label}
                    cx={s.pts[hoveredIdx].x}
                    cy={s.pts[hoveredIdx].y}
                    r={3.5}
                    fill={s.hex}
                    stroke="white"
                    strokeWidth={1.5}
                  />
                ))}
              </>
            )}

            {/* X-axis labels */}
            {days30.map((day, i) => {
              if (i !== 0 && i !== n - 1 && i % 7 !== 0) return null;
              return (
                <text
                  key={day}
                  x={xAt(i, n)}
                  y={VB_H - 5}
                  textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
                  fontSize={8}
                  fill="currentColor"
                  fillOpacity={0.45}
                >
                  {day.slice(5)}
                </text>
              );
            })}

            {/* Invisible interaction capture — mouse + touch */}
            <rect
              x={0}
              y={0}
              width={VB_W}
              height={VB_H}
              fill="transparent"
              className="cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          </svg>
        </div>
      </CardContent>

      {/* Fixed tooltip — rendered relative to viewport so it's never clipped */}
      {tooltipPos && funnelRows && hoveredIdx !== null && (
        <div
          className="pointer-events-none fixed z-[9999] w-52 rounded-lg border border-border bg-popover shadow-xl"
          style={{ left: tooltipLeft, bottom: tooltipBottom }}
        >
          <div className="px-3 py-2.5">
            <p className="mb-2 text-[11px] font-semibold">{days30[hoveredIdx]}</p>
            <div className="space-y-1.5">
              {funnelRows.map((r, ri) => (
                <div key={r.label} className="flex items-center gap-1.5">
                  <span className="w-2.5 shrink-0 text-center text-[10px] text-muted-foreground">
                    {ri > 0 ? "↓" : ""}
                  </span>
                  <div
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: r.hex }}
                  />
                  <span className="flex-1 truncate text-[11px] text-muted-foreground">
                    {r.label}
                    {r.isBaseline && (
                      <span className="ml-0.5 text-[9px] opacity-50">visits</span>
                    )}
                  </span>
                  <span
                    className="text-[11px] font-semibold tabular-nums"
                    style={{ color: r.hex }}
                  >
                    {r.value.toLocaleString()}
                  </span>
                  {r.pct !== null ? (
                    <span className="w-9 text-right text-[10px] text-muted-foreground">
                      ({r.pct}%)
                    </span>
                  ) : !r.isBaseline ? (
                    <span className="w-9 text-right text-[10px] text-muted-foreground">—</span>
                  ) : (
                    <span className="w-9" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
