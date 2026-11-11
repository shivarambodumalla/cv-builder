import { cn } from "@/lib/utils";
import { StatTile } from "@/components/admin/stat-tile";
import { fp, p, rateTone } from "./format";
import type { FunnelStep } from "./types";

/**
 * A funnel as a row of tiles: each step's count and, from the second step on,
 * its conversion from the step before (green ≥30%, amber ≥10%, red below).
 */
export function StepTiles({
  steps,
  className,
  format = (s) => s.count.toLocaleString(),
  showConversion = () => true,
  extraNote,
}: {
  steps: FunnelStep[];
  className?: string;
  format?: (step: FunnelStep) => string;
  showConversion?: (step: FunnelStep) => boolean;
  /** Note for a step that has no conversion line (e.g. the first). */
  extraNote?: (step: FunnelStep, index: number) => string | undefined;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {steps.map((step, i) => {
        const prev = i > 0 ? steps[i - 1].count : step.count;
        const convPct = prev > 0 ? p(step.count, prev) : 0;
        const conv = i > 0 && prev > 0 && showConversion(step);
        return (
          <StatTile
            key={step.key}
            label={step.label}
            value={format(step)}
            note={conv ? `${fp(convPct)} from prev` : extraNote?.(step, i)}
            tone={conv ? rateTone(convPct, 30, 10) : "neutral"}
          />
        );
      })}
    </div>
  );
}
