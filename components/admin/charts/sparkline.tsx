import { cn } from "@/lib/utils";
import { TONE_COLOR } from "./tones";
import type { SeriesTone } from "./types";

const W = 100;
const H = 32;
const PAD = 3;

/**
 * A trend line with a soft wash under it and a dot on the latest value: no
 * axes, no interaction. It stretches to its container's width and is pure
 * SVG, so server components can render it. Zero is the baseline, so an
 * all-zero series lies flat along the bottom.
 */
export function Sparkline({
  values,
  tone = "primary",
  label,
  className,
}: {
  values: number[];
  tone?: SeriesTone;
  /** Accessible description, e.g. "Signups, last 30 days". Hidden from screen readers without one. */
  label?: string;
  className?: string;
}) {
  if (values.length === 0) return null;
  const data = values.length === 1 ? [values[0], values[0]] : values;
  const lo = Math.min(0, ...data);
  const hi = Math.max(0, ...data);
  const span = hi - lo;
  const x = (i: number) => (i / (data.length - 1)) * W;
  const y = (v: number) => (span === 0 ? H - PAD : PAD + (1 - (v - lo) / span) * (H - PAD * 2));

  const line = data.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(2)},${y(v).toFixed(2)}`).join("");
  const base = y(Math.max(lo, 0)).toFixed(2);
  const area = `${line}L${W},${base}L0,${base}Z`;
  const color = TONE_COLOR[tone];
  const last = data.length - 1;

  return (
    <span
      className={cn("relative block h-8 w-full", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-full w-full overflow-visible">
        {span > 0 && <path d={area} fill={color} fillOpacity={0.12} />}
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {/* HTML dot: a circle inside the stretched SVG would turn into an ellipse. */}
      <span
        className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card"
        style={{ left: `${(x(last) / W) * 100}%`, top: `${(y(data[last]) / H) * 100}%`, backgroundColor: color }}
      />
    </span>
  );
}
