"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ActivityCategory, ActivityItem } from "@/lib/admin/activity-feed";

type Filter = "key" | "all" | ActivityCategory;

const CATEGORY: Record<ActivityCategory, { label: string; dot: string }> = {
  paywall: { label: "Paywall", dot: "bg-warning" },
  billing: { label: "Billing", dot: "bg-success" },
  product: { label: "Product", dot: "bg-primary" },
  ai: { label: "AI calls", dot: "bg-[#1E3A5F]" },
  account: { label: "Account", dot: "bg-foreground" },
  popups: { label: "Popups", dot: "bg-muted-foreground/50" },
  pages: { label: "Page views", dot: "bg-muted-foreground/30" },
};

const CATEGORY_ORDER: ActivityCategory[] = ["paywall", "billing", "product", "ai", "account", "popups", "pages"];
/** Page views and popups are noise for "what did this person do"; hidden by default. */
const NOISE: ActivityCategory[] = ["pages", "popups"];
const PAGE_SIZE = 100;

function formatTime(iso: string): string {
  const d = new Date(iso);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ActivityTimeline({ items, failed }: { items: ActivityItem[]; failed: string[] }) {
  const [filter, setFilter] = useState<Filter>("key");
  const [shown, setShown] = useState(PAGE_SIZE);

  const counts = useMemo(() => {
    const m = new Map<ActivityCategory, number>();
    for (const i of items) m.set(i.category, (m.get(i.category) ?? 0) + 1);
    return m;
  }, [items]);

  const visible = useMemo(
    () =>
      items.filter((i) =>
        filter === "all" ? true : filter === "key" ? !NOISE.includes(i.category) : i.category === filter,
      ),
    [items, filter],
  );

  const keyCount = items.filter((i) => !NOISE.includes(i.category)).length;
  const weekAgo = Date.now() - 7 * 86_400_000;
  const thisWeek = items.filter((i) => !NOISE.includes(i.category) && new Date(i.at).getTime() > weekAgo).length;

  const chips: { key: Filter; label: string; count: number }[] = [
    { key: "key", label: "Key actions", count: keyCount },
    { key: "all", label: "Everything", count: items.length },
    ...CATEGORY_ORDER.filter((c) => (counts.get(c) ?? 0) > 0).map((c) => ({
      key: c as Filter,
      label: CATEGORY[c].label,
      count: counts.get(c) ?? 0,
    })),
  ];

  function choose(next: Filter) {
    setFilter(next);
    setShown(PAGE_SIZE);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {failed.length > 0 && (
          <p role="alert" className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
            Couldn&apos;t load: {failed.join(", ")}. The rest is shown.
          </p>
        )}

        <div className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-muted/30">
          {[
            { label: "Key actions", value: keyCount },
            { label: "This week", value: thisWeek },
            { label: "Paywall hits", value: counts.get("paywall") ?? 0 },
          ].map((s) => (
            <div key={s.label} className="px-3 py-2">
              <p className="text-[10px] uppercase text-muted-foreground">{s.label}</p>
              <p className="mt-0.5 text-lg font-bold tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>

        <div role="group" aria-label="Filter activity" className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              aria-pressed={filter === c.key}
              onClick={() => choose(c.key)}
              className={cn(
                "flex min-h-[44px] items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors sm:min-h-[30px]",
                filter === c.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {c.label}
              <span className="tabular-nums opacity-70">{c.count}</span>
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {items.length === 0 ? "No activity recorded for this user yet." : "Nothing in this filter."}
          </p>
        ) : (
          <ul className="space-y-2.5">
            {visible.slice(0, shown).map((i) => (
              <li key={i.id} className="flex items-start gap-3 text-sm">
                <span
                  className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", CATEGORY[i.category].dot)}
                  title={CATEGORY[i.category].label}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-medium">
                      <span className="sr-only">{CATEGORY[i.category].label}: </span>
                      {i.label}
                    </p>
                    <span className="shrink-0 text-right text-xs tabular-nums text-muted-foreground">{formatTime(i.at)}</span>
                  </div>
                  {(i.detail || i.page) && (
                    <p className="mt-0.5 break-words text-xs text-muted-foreground">
                      {i.detail}
                      {i.detail && i.page && " · "}
                      {i.page && <span className="font-mono">{i.page}</span>}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {visible.length > shown && (
          <button
            type="button"
            onClick={() => setShown((n) => n + PAGE_SIZE)}
            className="min-h-[44px] w-full rounded-md border text-xs font-medium text-muted-foreground hover:bg-muted sm:min-h-[36px]"
          >
            Show {Math.min(PAGE_SIZE, visible.length - shown)} more of {visible.length - shown}
          </button>
        )}
      </CardContent>
    </Card>
  );
}
