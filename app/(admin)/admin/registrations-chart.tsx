"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const VB_W = 640;
const VB_H = 120;
const PAD = { top: 8, right: 8, bottom: 24, left: 28 };
const CW = VB_W - PAD.left - PAD.right;
const CH = VB_H - PAD.top - PAD.bottom;
const TOOLTIP_W = 160;

export function RegistrationsChart({
  data,
  days30,
  newToday,
  newThisWeek,
  newThisMonth,
  total,
}: {
  data: { day: string; value: number }[];
  days30: string[];
  newToday: number;
  newThisWeek: number;
  newThisMonth: number;
  total: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const n = days30.length;
  const maxVal = Math.max(1, ...data.map((d) => d.value));
  const barW = CW / n;
  const gap = Math.max(1, barW * 0.2);

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; top: number } | null>(null);

  const getIdx = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const { left, width } = svg.getBoundingClientRect();
    const svgX = ((clientX - left) / width) * VB_W - PAD.left;
    const idx = Math.floor(svgX / barW);
    return idx >= 0 && idx < n ? idx : null;
  };

  const show = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const idx = getIdx(clientX);
    if (idx === null) return;
    const { top } = svg.getBoundingClientRect();
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

  const stats = [
    { label: "Today", value: newToday },
    { label: "This week", value: newThisWeek },
    { label: "This month", value: newThisMonth },
    { label: "30-day total", value: total },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Users className="h-4 w-4 text-muted-foreground" />
              Registrations — last 30 days
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {days30[0].slice(5)} → {days30[n - 1].slice(5)} · excluding admins
            </p>
          </div>
          <div className="flex gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-right">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold tabular-nums" style={{ color: "var(--success)" }}>
                  {s.value}
                </p>
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
            {/* Y-axis grid + labels */}
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
                  <text
                    x={PAD.left - 4}
                    y={y + 3}
                    textAnchor="end"
                    fontSize={7}
                    fill="currentColor"
                    fillOpacity={0.38}
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {data.map((d, i) => {
              const barH = Math.max(d.value === 0 ? 0 : 1.5, (d.value / maxVal) * CH);
              const x = PAD.left + i * barW + gap / 2;
              const y = PAD.top + CH - barH;
              const isHovered = hoveredIdx === i;
              return (
                <rect
                  key={d.day}
                  x={x}
                  y={y}
                  width={barW - gap}
                  height={barH}
                  rx={1.5}
                  fill="#059669"
                  fillOpacity={d.value === 0 ? 0.12 : isHovered ? 1 : 0.65}
                />
              );
            })}

            {/* X-axis labels */}
            {days30.map((day, i) => {
              if (i !== 0 && i !== n - 1 && i % 7 !== 0) return null;
              return (
                <text
                  key={day}
                  x={PAD.left + i * barW + barW / 2}
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

            {/* Hover capture */}
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

      {tooltipPos && hoveredIdx !== null && (
        <div
          className="pointer-events-none fixed z-[9999] rounded-lg border border-border bg-popover shadow-xl"
          style={{ left: tooltipLeft, bottom: tooltipBottom, width: TOOLTIP_W }}
        >
          <div className="px-3 py-2.5">
            <p className="text-[11px] font-semibold">{days30[hoveredIdx]}</p>
            <p className="mt-0.5 text-sm font-bold tabular-nums" style={{ color: "var(--success)" }}>
              {data[hoveredIdx].value.toLocaleString()} signup{data[hoveredIdx].value !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
