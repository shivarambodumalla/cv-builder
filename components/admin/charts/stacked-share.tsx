import { cn } from "@/lib/utils";
import { formatShare, formatValue } from "./format";
import { CATEGORICAL_ORDER, TONE_COLOR } from "./tones";
import type { SeriesTone } from "./types";

/**
 * Teal steps, light to dark, for ordered parts (age bands, tiers). Checked
 * with the dataviz validator in --ordinal mode on the card surface: monotone
 * lightness, ≥0.06 between neighbours, light end 2:1.
 */
const ORDINAL_RAMP = ["#6aaea2", "#3f9586", "#1a7a6d", "#105c52", "#08403a"];

/**
 * Colours for parts that came without a tone. Nominal parts take the fixed
 * categorical order; ordered parts take evenly spaced ramp steps. Parts past
 * what either can tell apart go grey, never a recycled hue; the legend still
 * names and counts each one.
 */
function fillColors(tones: (SeriesTone | undefined)[], ordinal: boolean): string[] {
  const untoned = tones.filter((t) => !t).length;
  const ramp =
    untoned === 1
      ? [ORDINAL_RAMP[2]]
      : untoned <= ORDINAL_RAMP.length
        ? Array.from({ length: untoned }, (_, j) => ORDINAL_RAMP[Math.round((j * (ORDINAL_RAMP.length - 1)) / (untoned - 1))])
        : [];
  let next = 0;
  return tones.map((tone) => {
    if (tone) return TONE_COLOR[tone];
    const j = next++;
    if (ordinal) return ramp[j] ?? TONE_COLOR.muted;
    return TONE_COLOR[CATEGORICAL_ORDER[j] ?? "muted"];
  });
}

/**
 * One whole split into parts (plan mix, channel mix, age bands): a thin 100%
 * bar plus a legend that carries every count and share, so colour is never
 * the only way to read it. Server-safe.
 */
export function StackedShare({
  items,
  ordinal = false,
  emptyText = "No data in this range",
  className,
}: {
  items: { label: string; value: number; tone?: SeriesTone }[];
  /** The parts have a natural order (age bands, tiers): untoned parts get one-hue steps instead of distinct hues. */
  ordinal?: boolean;
  emptyText?: string;
  className?: string;
}) {
  const total = items.reduce((sum, it) => sum + Math.max(0, it.value), 0);
  if (total === 0) return <p className={cn("text-xs text-muted-foreground", className)}>{emptyText}</p>;

  const colors = fillColors(
    items.map((it) => it.tone),
    ordinal,
  );
  const summary = items.map((it) => `${it.label} ${formatValue(it.value)} (${formatShare(it.value, total)})`).join(", ");

  return (
    <div className={cn("min-w-0", className)}>
      <div role="img" aria-label={summary} className="flex h-2 gap-0.5 overflow-hidden rounded-full">
        {items.map((it, i) =>
          it.value > 0 ? (
            <span
              key={it.label}
              title={`${it.label}: ${formatValue(it.value)} (${formatShare(it.value, total)})`}
              className="h-full min-w-0.5"
              style={{ flex: `${it.value} 1 0%`, backgroundColor: colors[i] }}
            />
          ) : null,
        )}
      </div>
      <ul className="mt-3 space-y-1 text-xs">
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: colors[i] }} aria-hidden />
            <span className="min-w-0 flex-1 truncate text-foreground" title={it.label}>
              {it.label}
            </span>
            <span className="shrink-0 font-semibold tabular-nums text-foreground">{formatValue(it.value)}</span>
            <span className="w-12 shrink-0 text-right tabular-nums text-muted-foreground">{formatShare(it.value, total)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
