import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MOVE_TYPE_LABELS, type MoveType } from "@/lib/career-path/types";

const MOVE_VARIANT: Record<MoveType, "default" | "secondary" | "outline"> = {
  step_up: "default",
  lateral: "secondary",
  pivot: "outline",
};

export function MoveTypeBadge({ moveType, className }: { moveType: MoveType; className?: string }) {
  return (
    <Badge variant={MOVE_VARIANT[moveType]} className={cn("whitespace-nowrap font-medium", className)}>
      {MOVE_TYPE_LABELS[moveType]}
    </Badge>
  );
}

/** Fit percentage with a small bar. The bar is decorative; the number carries the meaning. */
export function FitMeter({ fit, className }: { fit: number; className?: string }) {
  const value = Math.max(0, Math.min(100, Math.round(fit)));
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border" aria-hidden="true">
        <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
      <span className="text-sm font-semibold tabular-nums">{value}% fit</span>
    </div>
  );
}

export function SkillChips({ skills, label }: { skills: string[]; label: string }) {
  if (skills.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={label}>
      {skills.map((s) => (
        <li key={s} className="rounded-full border bg-background px-2.5 py-1 text-xs font-medium">
          {s}
        </li>
      ))}
    </ul>
  );
}
