"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The actions of one plan phase as real checkboxes. Progress is a per-browser
 * convenience kept in localStorage; the page works the same without it.
 */
export function PlanChecklist({
  storageKey,
  actions,
}: {
  storageKey: string;
  actions: string[];
}) {
  const [done, setDone] = useState<Set<number>>(new Set());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw)
        setDone(
          new Set(
            (JSON.parse(raw) as number[]).filter((n) => Number.isInteger(n)),
          ),
        );
    } catch {
      // Storage blocked or corrupt: start unchecked.
    }
  }, [storageKey]);

  function toggle(i: number) {
    setDone((cur) => {
      const next = new Set(cur);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      try {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify(Array.from(next)),
        );
      } catch {
        // Not persisted; the checkbox still works for this visit.
      }
      return next;
    });
  }

  return (
    <ul className="space-y-1.5">
      {actions.map((action, i) => {
        const checked = done.has(i);
        return (
          <li key={i}>
            <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1.5 sm:min-h-0">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(i)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-[#065F46]"
              />
              <span
                className={cn(
                  "text-sm leading-relaxed",
                  checked && "text-[#78716C] line-through",
                )}
              >
                {action}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
