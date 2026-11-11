"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  RANGE_LABELS,
  resolveRange,
  type RangePreset,
  type ResolvedRange,
} from "@/lib/admin/date-range";

/** The current range from the URL, for client dashboards that fetch their own data. */
export function useAdminRange(fallback: Exclude<RangePreset, "custom"> = "30d"): ResolvedRange {
  const params = useSearchParams();
  const key = params.toString();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => resolveRange(new URLSearchParams(key), fallback), [key, fallback]);
}

/**
 * Preset buttons (a select on phones) plus optional custom dates. Writes the
 * choice to the URL, which server pages read via resolveRange(searchParams)
 * and client dashboards via useAdminRange().
 */
export function DateRangePicker({
  presets = ["7d", "30d", "90d", "custom"],
  fallback = "30d",
  className,
}: {
  presets?: RangePreset[];
  fallback?: Exclude<RangePreset, "custom">;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = useAdminRange(fallback);
  const [customFrom, setCustomFrom] = useState(current.from);
  const [customTo, setCustomTo] = useState(current.to);

  function push(next: Record<string, string | null>) {
    const q = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null) q.delete(k);
      else q.set(k, v);
    }
    router.replace(`${pathname}?${q.toString()}`, { scroll: false });
  }

  function choose(preset: RangePreset) {
    if (preset === "custom") push({ range: "custom", from: customFrom, to: customTo });
    else push({ range: preset, from: null, to: null });
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Phones: one select instead of a row of buttons */}
      <label className="sr-only" htmlFor="admin-range-select">Date range</label>
      <select
        id="admin-range-select"
        value={current.preset}
        onChange={(e) => choose(e.target.value as RangePreset)}
        className="h-11 rounded-md border bg-background px-3 text-sm sm:hidden"
      >
        {presets.map((p) => (
          <option key={p} value={p}>{RANGE_LABELS[p]}</option>
        ))}
      </select>

      <div role="group" aria-label="Date range" className="hidden overflow-hidden rounded-md border sm:inline-flex">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => choose(p)}
            aria-pressed={current.preset === p}
            className={cn(
              "px-3 py-1.5 text-xs font-medium transition-colors",
              current.preset === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {RANGE_LABELS[p]}
          </button>
        ))}
      </div>

      {current.preset === "custom" && (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            aria-label="From"
            value={customFrom}
            max={customTo}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="h-11 rounded-md border bg-background px-2 text-xs sm:h-8"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            aria-label="To"
            value={customTo}
            min={customFrom}
            onChange={(e) => setCustomTo(e.target.value)}
            className="h-11 rounded-md border bg-background px-2 text-xs sm:h-8"
          />
          <button
            type="button"
            onClick={() => push({ range: "custom", from: customFrom, to: customTo })}
            className="h-11 rounded-md border px-3 text-xs font-medium hover:bg-muted sm:h-8"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
