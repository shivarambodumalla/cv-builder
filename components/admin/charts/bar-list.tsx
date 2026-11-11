import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatValue } from "./format";
import type { ValueFormat } from "./types";

export interface BarListItem {
  label: string;
  value: number;
  /** Extra context beside the value, e.g. "312 visitors". */
  secondary?: string;
  href?: string;
}

/**
 * A ranked list ("top pages"): label left, value right, a soft bar behind the
 * row sized against the largest value (or `max`). Items render in the order
 * given, so pass them ranked. Rows with an href are links, 44px tall on
 * phones. Server-safe.
 */
export function BarList({
  items,
  format = "number",
  max,
  emptyText = "No data in this range",
  className,
}: {
  items: BarListItem[];
  format?: ValueFormat;
  /** Value that fills a whole row. Defaults to the largest item. */
  max?: number;
  emptyText?: string;
  className?: string;
}) {
  if (items.length === 0) return <p className={cn("text-xs text-muted-foreground", className)}>{emptyText}</p>;
  const top = max ?? Math.max(0, ...items.map((it) => it.value));

  return (
    <ul className={cn("min-w-0 space-y-1 text-xs", className)}>
      {items.map((it) => {
        const share = top > 0 ? Math.max(0, Math.min(1, it.value / top)) : 0;
        const body = (
          <>
            <span
              aria-hidden
              className="absolute left-0 top-1/2 h-7 -translate-y-1/2 rounded-r bg-primary/15"
              style={{ width: `${share * 100}%` }}
            />
            <span className="relative min-w-0 flex-1 truncate text-foreground" title={it.label}>
              {it.label}
            </span>
            {it.secondary && (
              <span className="relative shrink-0 tabular-nums text-muted-foreground">{it.secondary}</span>
            )}
            <span className="relative shrink-0 font-semibold tabular-nums text-foreground">
              {formatValue(it.value, format)}
            </span>
          </>
        );
        const row = "relative flex min-h-8 items-center gap-3 rounded px-2";
        return (
          <li key={`${it.label}-${it.href ?? ""}`}>
            {it.href ? (
              <Link
                href={it.href}
                className={cn(
                  row,
                  "min-h-11 hover:bg-foreground/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-8",
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
    </ul>
  );
}
