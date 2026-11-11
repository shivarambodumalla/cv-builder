import Link from "next/link";
import { cn } from "@/lib/utils";

export type Tone = "success" | "warning" | "error" | "neutral";

const TONE_TEXT: Record<Tone, string> = {
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
  neutral: "text-muted-foreground",
};

const TONE_BAR: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  neutral: "bg-primary",
};

/**
 * The one number tile for admin pages: label, value, an optional line under
 * it (a comparison or context) and an optional meter. Status colour comes
 * only from the success / warning / error tokens.
 */
export function StatTile({
  label,
  value,
  note,
  tone = "neutral",
  meter,
  href,
  className,
}: {
  label: string;
  value: React.ReactNode;
  /** Line under the value, e.g. "+18% vs last Wed" or "2 monthly, 1 yearly". */
  note?: React.ReactNode;
  /** Colours the note (and meter). */
  tone?: Tone;
  /** 0..1 fill for a small bar under the note, e.g. spend against a cap. */
  meter?: number;
  href?: string;
  className?: string;
}) {
  const body = (
    <>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-2xl font-bold tracking-tight tabular-nums">{value}</span>
      {note && <span className={cn("text-xs tabular-nums", TONE_TEXT[tone])}>{note}</span>}
      {meter !== undefined && (
        <span className="mt-1 block h-1 overflow-hidden rounded-full bg-muted" aria-hidden>
          <span
            className={cn("block h-full rounded-full", TONE_BAR[tone])}
            style={{ width: `${Math.max(0, Math.min(1, meter)) * 100}%` }}
          />
        </span>
      )}
    </>
  );

  const base = cn("flex min-w-0 flex-col gap-0.5 rounded-lg border bg-card p-4", className);
  return href ? (
    <Link href={href} className={cn(base, "transition-colors hover:border-primary/40 hover:bg-muted/40")}>
      {body}
    </Link>
  ) : (
    <div className={base}>{body}</div>
  );
}

/** Percentage change as a tile note: "+18% vs last Wed", toned by direction. */
export function changeNote(
  current: number,
  previous: number,
  label: string,
): { note: string; tone: Tone } {
  if (previous === 0) return { note: current === 0 ? `no change ${label}` : `new ${label}`, tone: "neutral" };
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return { note: `same ${label}`, tone: "neutral" };
  return { note: `${pct > 0 ? "+" : ""}${pct}% ${label}`, tone: pct > 0 ? "success" : "warning" };
}
