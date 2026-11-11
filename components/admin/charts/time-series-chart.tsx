"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { formatTick, formatValue } from "./format";
import { TONE_COLOR } from "./tones";
import type { ChartBucket, ChartSeries, ValueFormat } from "./types";

// Geometry, in CSS px. The SVG is drawn at its measured width, never scaled,
// so text and strokes keep their size at every width.
const TICK_FONT = 11;
const CHAR_W = 6.6; // average Geist glyph at 11px, a little generous
const PAD_TOP = 8;
const PAD_RIGHT = 8;
const X_AXIS_BAND = 24;
const BAR_MAX = 24;
const BAR_GAP = 2;
const LABEL_GAP = 10;

type Kind = NonNullable<ChartSeries["kind"]>;

const valueAt = (s: ChartSeries, i: number) => s.values[i] ?? 0;

/** 1, 2, 2.5 or 5 times a power of ten, at least `raw`. */
function niceStep(raw: number, integer: boolean): number {
  const power = 10 ** Math.floor(Math.log10(raw));
  const f = raw / power;
  let step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * power;
  if (integer && !Number.isInteger(step)) step = step < 1 ? 1 : Math.ceil(step / 5) * 5;
  return step;
}

/** A 0-based domain with 3–4 round ticks covering [lo, hi]. */
function niceScale(lo: number, hi: number, integer: boolean) {
  const top = hi > lo ? hi : lo + 1;
  const step = niceStep((top - lo) / 3, integer);
  const min = Math.floor(lo / step) * step;
  const max = Math.ceil(top / step) * step;
  const ticks: number[] = [];
  for (let t = min; t <= max + step / 2; t += step) ticks.push(Number(t.toPrecision(12)));
  return { min, max, ticks };
}

/** A bar from the baseline to `y`, rounded 4px at the data end only. */
function barPath(x: number, w: number, y: number, base: number): string {
  const h = Math.abs(base - y);
  if (h < 0.5 || w <= 0) return "";
  const r = Math.min(4, w / 2, h);
  if (y <= base) {
    return `M${x},${base}V${y + r}A${r},${r} 0 0 1 ${x + r},${y}H${x + w - r}A${r},${r} 0 0 1 ${x + w},${y + r}V${base}Z`;
  }
  return `M${x},${base}V${y - r}A${r},${r} 0 0 0 ${x + r},${y}H${x + w - r}A${r},${r} 0 0 0 ${x + w},${y - r}V${base}Z`;
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(Math.floor(el.getBoundingClientRect().width));
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

function LegendKey({ kind, color }: { kind: Kind; color: string }) {
  return kind === "line" ? (
    <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
  ) : (
    <span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: color }} aria-hidden />
  );
}

/**
 * Values over time on one y scale: lines, soft areas and (grouped) bars can
 * share a chart. Hover, tap or focus + arrow keys move a crosshair whose
 * tooltip lists every visible series for that bucket; legend items toggle
 * their series. Renders up to a year of daily buckets: x labels thin out so
 * they never overlap, and the latest bucket is always labelled.
 */
export function TimeSeriesChart({
  buckets,
  series,
  height = 220,
  format = "number",
  emptyText = "No data in this range",
  label,
  className,
}: {
  buckets: ChartBucket[];
  series: ChartSeries[];
  /** Total height in px, x-axis labels included. */
  height?: number;
  format?: ValueFormat;
  emptyText?: string;
  /** Accessible name, e.g. "Signups per day". Defaults to the series names. */
  label?: string;
  className?: string;
}) {
  const [wrapRef, width] = useWidth<HTMLDivElement>();
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
  const [active, setActive] = useState<number | null>(null);
  const hintId = useId();

  const n = buckets.length;
  const visible = useMemo(() => series.filter((s) => !hidden.has(s.name)), [series, hidden]);
  const isEmpty = n === 0 || series.every((s) => s.values.every((v) => !v));

  const geo = useMemo(() => {
    const all = visible.flatMap((s) => s.values.slice(0, n));
    const lo = Math.min(0, ...all);
    const hi = Math.max(0, ...all);
    const integer = format !== "usd" && all.every((v) => Number.isInteger(v));
    const scale = niceScale(lo, hi, integer);
    const tickLabels = scale.ticks.map((t) => formatTick(t, format));

    const padLeft = Math.ceil(Math.max(...tickLabels.map((t) => t.length)) * CHAR_W) + 8;
    const plotW = Math.max(width - padLeft - PAD_RIGHT, 1);
    const plotH = Math.max(height - PAD_TOP - X_AXIS_BAND, 1);
    const y = (v: number) => PAD_TOP + (1 - (v - scale.min) / (scale.max - scale.min)) * plotH;
    const crisp = (v: number) => Math.round(v) + 0.5;

    // Bars need a band per bucket; line-only charts run edge to edge.
    const bars = visible.filter((s) => s.kind === "bar");
    const banded = series.some((s) => s.kind === "bar");
    const slot = banded ? plotW / Math.max(n, 1) : plotW / Math.max(n - 1, 1);
    const cx = (i: number) => (banded ? padLeft + slot * (i + 0.5) : n === 1 ? padLeft + plotW / 2 : padLeft + slot * i);

    // Grouped bars: capped at 24px, 2px gap between neighbours when there's room.
    const gap = bars.length > 1 && slot >= 12 ? BAR_GAP : 0;
    const groupW = Math.min(slot * (slot >= 6 ? 0.72 : 0.85), bars.length * BAR_MAX + (bars.length - 1) * gap);
    const barW = bars.length ? Math.max((groupW - (bars.length - 1) * gap) / bars.length, 0.5) : 0;
    const base = y(Math.max(scale.min, Math.min(0, scale.max)));

    const barPaths = bars.map((s, j) => {
      let d = "";
      for (let i = 0; i < n; i++) {
        const x = cx(i) - groupW / 2 + j * (barW + gap);
        d += barPath(x, barW, y(valueAt(s, i)), base);
      }
      return { s, d };
    });

    const linePaths = visible
      .filter((s) => s.kind !== "bar")
      .map((s) => {
        const pts = Array.from({ length: n }, (_, i) => [cx(i), y(valueAt(s, i))] as const);
        const line = pts.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`).join("");
        const area =
          s.kind === "area" && n > 1 ? `${line}L${pts[n - 1][0].toFixed(1)},${base}L${pts[0][0].toFixed(1)},${base}Z` : "";
        return { s, pts, line, area };
      });

    // X labels: walk back from the latest bucket at a stride wide enough for
    // the longest label, then drop any that would still collide at the edges.
    const longest = Math.max(1, ...buckets.map((b) => b.label.length)) * CHAR_W;
    const stride = Math.max(1, Math.ceil((longest + LABEL_GAP) / slot));
    const xLabels: { i: number; x: number }[] = [];
    let leftEdge = Infinity;
    for (let i = n - 1; i >= 0; i -= stride) {
      const w = buckets[i].label.length * CHAR_W;
      const x = Math.min(Math.max(cx(i), w / 2), width - w / 2);
      if (x + w / 2 + LABEL_GAP > leftEdge) continue;
      xLabels.push({ i, x });
      leftEdge = x - w / 2;
    }

    return { scale, tickLabels, padLeft, plotH, y, crisp, banded, slot, cx, barPaths, linePaths, xLabels };
  }, [visible, series, buckets, n, width, height, format]);

  const indexAt = (clientX: number, el: HTMLElement) => {
    const x = clientX - el.getBoundingClientRect().left - geo.padLeft;
    const i = geo.banded ? Math.floor(x / geo.slot) : Math.round(x / geo.slot);
    return Math.max(0, Math.min(n - 1, i));
  };

  const toggle = (name: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else if (series.length - next.size > 1) next.add(name); // keep one series on screen
      return next;
    });

  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys: Record<string, (i: number) => number | null> = {
      ArrowLeft: (i) => Math.max(0, i - 1),
      ArrowRight: (i) => Math.min(n - 1, i + 1),
      Home: () => 0,
      End: () => n - 1,
      Escape: () => null,
    };
    const move = keys[e.key];
    if (!move) return;
    e.preventDefault();
    setActive((i) => move(i ?? n - 1));
  };

  const name = label ?? series.map((s) => s.name).join(", ");
  const readout =
    active !== null && buckets[active]
      ? `${buckets[active].label}: ${visible.map((s) => `${s.name} ${formatValue(valueAt(s, active), format)}`).join(", ")}`
      : "";

  return (
    <div className={cn("min-w-0", className)}>
      {series.length > 1 && (
        <div className="mb-2 flex flex-wrap gap-x-4">
          {series.map((s) => {
            const on = !hidden.has(s.name);
            return (
              <button
                key={s.name}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(s.name)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-1.5 rounded text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-0 sm:py-1 motion-safe:transition-opacity",
                  !on && "line-through opacity-50",
                )}
              >
                <LegendKey kind={s.kind ?? "line"} color={TONE_COLOR[s.tone]} />
                {s.name}
              </button>
            );
          })}
        </div>
      )}

      <div ref={wrapRef} className="relative w-full" style={{ height }}>
        {isEmpty ? (
          <div className="flex h-full items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
            {emptyText}
          </div>
        ) : (
          width > 0 && (
            <div
              tabIndex={0}
              role="group"
              aria-roledescription="chart"
              aria-label={name}
              aria-describedby={hintId}
              onKeyDown={onKeyDown}
              onFocus={() => setActive((i) => i ?? n - 1)}
              onBlur={() => setActive(null)}
              onPointerDown={(e) => setActive(indexAt(e.clientX, e.currentTarget))}
              onPointerMove={(e) => setActive(indexAt(e.clientX, e.currentTarget))}
              onPointerLeave={(e) => {
                // a tap keeps its readout; a mouse leaving clears it
                if (e.pointerType === "mouse") setActive(null);
              }}
              className="h-full cursor-crosshair rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ touchAction: "pan-y" }}
            >
              <svg width={width} height={height} className="block overflow-visible font-sans tabular-nums" aria-hidden>
                {/* grid + y ticks */}
                {geo.scale.ticks.map((t, k) => (
                  <g key={t}>
                    <line
                      x1={geo.padLeft}
                      x2={width - PAD_RIGHT}
                      y1={geo.crisp(geo.y(t))}
                      y2={geo.crisp(geo.y(t))}
                      stroke={t === 0 ? "var(--muted-foreground)" : "var(--border)"}
                      strokeOpacity={t === 0 ? 0.35 : 0.8}
                    />
                    <text
                      x={geo.padLeft - 8}
                      y={geo.y(t)}
                      textAnchor="end"
                      dominantBaseline="middle"
                      fontSize={TICK_FONT}
                      fill="var(--muted-foreground)"
                    >
                      {geo.tickLabels[k]}
                    </text>
                  </g>
                ))}

                {/* hovered bucket: a soft column behind the marks */}
                {active !== null && geo.banded && (
                  <rect
                    x={geo.cx(active) - geo.slot / 2}
                    y={PAD_TOP}
                    width={geo.slot}
                    height={geo.plotH}
                    fill="var(--foreground)"
                    fillOpacity={0.06}
                  />
                )}

                {geo.linePaths.map(({ s, area }) =>
                  area ? <path key={`a-${s.name}`} d={area} fill={TONE_COLOR[s.tone]} fillOpacity={0.1} /> : null,
                )}
                {geo.barPaths.map(({ s, d }) => (
                  <path key={`b-${s.name}`} d={d} fill={TONE_COLOR[s.tone]} />
                ))}

                {active !== null && !geo.banded && (
                  <line
                    x1={geo.crisp(geo.cx(active))}
                    x2={geo.crisp(geo.cx(active))}
                    y1={PAD_TOP}
                    y2={PAD_TOP + geo.plotH}
                    stroke="var(--muted-foreground)"
                    strokeOpacity={0.5}
                  />
                )}

                {geo.linePaths.map(({ s, line }) => (
                  <g key={`l-${s.name}`}>
                    {/* over bars, a 2px surface ring keeps the line readable */}
                    {geo.barPaths.length > 0 && (
                      <path d={line} fill="none" stroke="var(--card)" strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
                    )}
                    <path
                      d={line}
                      fill="none"
                      stroke={TONE_COLOR[s.tone]}
                      strokeWidth={2}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </g>
                ))}

                {/* latest value, and the hovered one, as ringed dots */}
                {geo.linePaths.map(({ s, pts }) =>
                  (active === null || active === n - 1 ? [n - 1] : [n - 1, active]).map((i) => (
                    <circle
                      key={`d-${s.name}-${i}`}
                      cx={pts[i][0]}
                      cy={pts[i][1]}
                      r={4}
                      fill={TONE_COLOR[s.tone]}
                      stroke="var(--card)"
                      strokeWidth={2}
                    />
                  )),
                )}

                {geo.xLabels.map(({ i, x }) => (
                  <text
                    key={buckets[i].key}
                    x={x}
                    y={PAD_TOP + geo.plotH + 16}
                    textAnchor="middle"
                    fontSize={TICK_FONT}
                    fill="var(--muted-foreground)"
                  >
                    {buckets[i].label}
                  </text>
                ))}
              </svg>

              {active !== null && buckets[active] && (
                <div
                  className="pointer-events-none absolute z-10 min-w-[8rem] max-w-[min(15rem,calc(100%-1rem))] rounded-md border bg-popover px-3 py-2 text-xs shadow-md"
                  style={
                    geo.cx(active) > width / 2
                      ? { top: PAD_TOP, right: width - geo.cx(active) + 10 }
                      : { top: PAD_TOP, left: geo.cx(active) + 10 }
                  }
                >
                  <p className="mb-1 font-medium text-muted-foreground">{buckets[active].label}</p>
                  <ul className="space-y-0.5">
                    {visible.map((s) => (
                      <li key={s.name} className="flex items-center gap-2">
                        <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ backgroundColor: TONE_COLOR[s.tone] }} />
                        <span className="font-semibold tabular-nums text-foreground">
                          {formatValue(valueAt(s, active), format)}
                        </span>
                        <span className="truncate text-muted-foreground">{s.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        )}
        <p id={hintId} className="sr-only">
          Use the left and right arrow keys to read each period. A table of every value follows.
        </p>
        <p className="sr-only" aria-live="polite">
          {readout}
        </p>
      </div>

      {!isEmpty && (
        // sr-only on the wrapper: a <table> ignores the 1px box and would stretch the page
        <div className="sr-only">
          <table>
            <caption>{name}</caption>
            <thead>
              <tr>
                <th scope="col">Period</th>
                {series.map((s) => (
                  <th key={s.name} scope="col">
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {buckets.map((b, i) => (
                <tr key={b.key}>
                  <th scope="row">{b.label}</th>
                  {series.map((s) => (
                    <td key={s.name}>{formatValue(valueAt(s, i), format)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
