import Link from "next/link";
import { TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatShare, formatValue } from "./format";

export interface FunnelStep {
  label: string;
  value: number;
  href?: string;
  /** Short note under the step, e.g. which event counts. */
  hint?: string;
}

/** Index of the step with the lowest conversion from the one before, if any step loses people. */
function biggestDrop(steps: FunnelStep[]): number | null {
  let worst: number | null = null;
  let worstRate = 1;
  for (let i = 1; i < steps.length; i++) {
    const prev = steps[i - 1].value;
    if (prev <= 0) continue;
    const rate = steps[i].value / prev;
    if (rate < worstRate) {
      worstRate = rate;
      worst = i;
    }
  }
  return worst;
}

/**
 * Funnel as horizontal bars, each sized against the first step. Every row
 * prints its count, the conversion from the step before and its share of
 * the first step; the step that loses the most people is flagged with the
 * warning token, an icon and the words "biggest drop". Server-safe.
 */
export function FunnelChart({
  steps,
  emptyText = "No data in this range",
  className,
}: {
  steps: FunnelStep[];
  emptyText?: string;
  className?: string;
}) {
  const first = steps[0]?.value ?? 0;
  if (steps.length === 0 || steps.every((s) => s.value === 0)) {
    return <p className={cn("text-xs text-muted-foreground", className)}>{emptyText}</p>;
  }
  const drop = biggestDrop(steps);

  return (
    <ol className={cn("min-w-0 space-y-1", className)}>
      {steps.map((step, i) => {
        const width = first > 0 ? Math.max(0, Math.min(1, step.value / first)) : 0;
        const isDrop = i === drop;
        const body = (
          <>
            <span className="flex items-baseline justify-between gap-3 text-xs">
              <span className="min-w-0 truncate font-medium text-foreground" title={step.label}>
                {step.label}
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-foreground">{formatValue(step.value)}</span>
            </span>
            <span className="mt-1 block h-2 rounded-r bg-foreground/[0.06]" aria-hidden>
              <span
                className={cn("block h-full rounded-r bg-primary", step.value > 0 && "min-w-0.5")}
                style={{ width: `${width * 100}%` }}
              />
            </span>
            <span className="mt-1 flex flex-wrap items-center justify-between gap-x-3 text-[11px] text-muted-foreground">
              <span className="min-w-0 truncate">{step.hint}</span>
              {i > 0 && (
                <span className="flex flex-wrap items-center gap-x-1 tabular-nums">
                  {/* Warning as a tint + icon + words: the token is too light to be text on the card. */}
                  {isDrop && (
                    <span className="inline-flex items-center gap-1 rounded bg-warning/15 px-1.5 font-medium text-foreground">
                      <TrendingDown className="h-3 w-3 text-warning" aria-hidden />
                      Biggest drop
                    </span>
                  )}
                  <span className={cn(isDrop && "font-medium text-foreground")}>
                    {formatShare(step.value, steps[i - 1].value)} of previous
                  </span>
                  <span aria-hidden>·</span>
                  <span>{formatShare(step.value, first)} of first</span>
                </span>
              )}
            </span>
          </>
        );
        const row = "block rounded-md px-2 py-1.5";
        return (
          <li key={step.label}>
            {step.href ? (
              <Link
                href={step.href}
                className={cn(
                  row,
                  "min-h-11 hover:bg-foreground/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                {body}
              </Link>
            ) : (
              <div className={row}>{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
