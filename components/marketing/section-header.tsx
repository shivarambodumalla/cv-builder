import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The homepage's one header pattern: label pill, heading, one-line subheading.
 * Same sizes and spacing in every section so the page reads as one system.
 * `invert` is for dark (navy) sections.
 */
export function SectionHeader({
  eyebrow,
  title,
  sub,
  invert = false,
  action,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: ReactNode;
  invert?: boolean;
  /** Optional control aligned to the right of the header on desktop (e.g. "Browse templates"). */
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 md:mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        <span
          className={cn(
            "inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
            invert ? "bg-white/15 text-white" : "bg-primary/10 text-[#145f55]"
          )}
        >
          {eyebrow}
        </span>
        <h2 className="mt-3 text-[1.75rem] sm:text-4xl md:text-[2.5rem] font-bold tracking-tight leading-[1.15]">{title}</h2>
        {sub && (
          <p className={cn("mt-3 text-[15px] sm:text-lg leading-relaxed", invert ? "text-white/85" : "text-muted-foreground")}>{sub}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
