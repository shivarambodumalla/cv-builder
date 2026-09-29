import { cn } from "@/lib/utils";
import { MOVE_TYPE_LABELS, type MoveType, type RoleMarket } from "@/lib/career-path/types";
import { formatJobCount, formatSalaryRange } from "./format";

// Quiet, report-style pieces shared by the tool, the plan page and the role
// pages. Move types are a small square marker plus a text label: teal (step
// up), navy (sideways), outlined (career change). Fit is a number with a thin
// bar. Numbers use the mono face with small uppercase labels.

const MOVE_MARKER: Record<MoveType, string> = {
  step_up: "bg-primary",
  lateral: "bg-[#1E3A5F]",
  pivot: "border border-foreground bg-transparent",
};

export function MoveTypeBadge({ moveType, className }: { moveType: MoveType; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium", className)}>
      <span className={cn("h-2 w-2 shrink-0", MOVE_MARKER[moveType])} aria-hidden="true" />
      {MOVE_TYPE_LABELS[moveType]}
    </span>
  );
}

/** "82% fit" with a thin bar. The number carries the meaning; the bar is decorative. */
export function FitMeter({ fit, className }: { fit: number; className?: string }) {
  const value = Math.max(0, Math.min(100, Math.round(fit)));
  return (
    <span className={cn("inline-flex items-center gap-2.5 whitespace-nowrap text-sm", className)}>
      <span className="font-mono font-semibold tabular-nums">{value}% fit</span>
      <span className="relative h-1 w-16 overflow-hidden bg-border" aria-hidden="true">
        <span className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${value}%` }} />
      </span>
    </span>
  );
}

/** Plain tags for skills. No icons, square-ish corners so they read as data, not buttons. */
export function SkillChips({ skills, label }: { skills: string[]; label: string }) {
  if (skills.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={label}>
      {skills.map((s) => (
        <li key={s} className="rounded-[4px] border bg-background px-2 py-1 text-[13px] leading-tight">
          {s}
        </li>
      ))}
    </ul>
  );
}

/** Mono label ("OPEN JOBS, US"), big figure. Renders nothing when neither number is known. */
export function MarketStats({ market, className }: { market: RoleMarket | null; className?: string }) {
  if (!market) return null;
  const jobs = formatJobCount(market);
  const pay = formatSalaryRange(market);
  if (!jobs && !pay) return null;
  const code = market.country.toUpperCase();
  return (
    <dl className={cn("grid grid-cols-2 gap-x-6 gap-y-3", className)}>
      {jobs && (
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Open jobs, {code}</dt>
          <dd className="mt-1 font-mono text-xl font-semibold tabular-nums sm:text-2xl">{jobs}</dd>
        </div>
      )}
      {pay && (
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Advertised pay</dt>
          <dd className="mt-1 font-mono text-xl font-semibold tabular-nums sm:text-2xl">{pay}</dd>
        </div>
      )}
    </dl>
  );
}
