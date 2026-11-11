"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Minus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { positionBadge } from "./format";
import { classifyIntent, INTENT_STYLES, isBranded, type Intent } from "./intent";
import type { PageRow, QueryRow } from "./types";

function PositionDelta({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-muted-foreground">–</span>;
  if (delta === 0) return (
    <span className="inline-flex items-center gap-0.5 text-muted-foreground">
      <Minus className="h-2.5 w-2.5" />
    </span>
  );
  const improved = delta > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[10px] font-medium",
        improved ? "text-success" : "text-error"
      )}
    >
      {improved ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
      {Math.abs(delta)}
    </span>
  );
}

export function EnhancedQueryTable({ rows, hasGa4 }: { rows: QueryRow[]; hasGa4: boolean }) {
  const [search, setSearch] = useState("");
  const [intentFilter, setIntentFilter] = useState<Intent | "all">("all");
  const [brandedFilter, setBrandedFilter] = useState<"all" | "branded" | "non-branded">("all");

  const enriched = rows.map((r) => ({
    ...r,
    intent: classifyIntent(r.query),
    branded: isBranded(r.query),
  }));

  const filtered = enriched.filter((r) => {
    if (search && !r.query.toLowerCase().includes(search.toLowerCase())) return false;
    if (intentFilter !== "all" && r.intent !== intentFilter) return false;
    if (brandedFilter === "branded" && !r.branded) return false;
    if (brandedFilter === "non-branded" && r.branded) return false;
    return true;
  });

  const intents: (Intent | "all")[] = [
    "all", "transactional", "informational", "template", "interview prep", "comparison", "navigational",
  ];

  const maxClicks = Math.max(...rows.map((r) => r.clicks), 1);

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter keywords…"
            className="h-11 w-full pl-9 pr-3 text-xs border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring sm:h-auto sm:w-auto sm:py-1.5"
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-0.5">
          {(["all", "branded", "non-branded"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setBrandedFilter(v)}
              className={cn(
                "min-h-[44px] rounded-md px-2.5 py-1 text-xs capitalize transition-colors sm:min-h-0",
                brandedFilter === v ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {intents.map((i) => (
            <button
              key={i}
              onClick={() => setIntentFilter(i)}
              className={cn(
                "min-h-[44px] rounded-md px-2 py-1 text-[10px] capitalize transition-colors border sm:min-h-0",
                intentFilter === i
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No keywords match filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Keyword</th>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground w-24">Intent</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Page</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-20">Position</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-12">CTR</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-14">Clicks</th>
                  {hasGa4 && (
                    <>
                      <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-16">Sessions</th>
                      <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-16">Engaged</th>
                    </>
                  )}
                  <th className="px-4 py-2.5 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((row) => (
                  <tr key={row.query} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium line-clamp-1 max-w-[180px]">{row.query}</span>
                        {row.branded && (
                          <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-700 dark:text-teal-400 font-medium">
                            brand
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded font-medium capitalize",
                          INTENT_STYLES[row.intent]
                        )}
                      >
                        {row.intent}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[140px]">
                      {row.page ? (
                        <span className="text-muted-foreground line-clamp-1 text-[11px]">{row.page}</span>
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded font-medium",
                            positionBadge(row.position)
                          )}
                        >
                          #{row.position}
                        </span>
                        <PositionDelta delta={row.positionDelta} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{row.ctr}%</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">{row.clicks.toLocaleString()}</td>
                    {hasGa4 && (
                      <>
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                          {row.sessions != null ? row.sessions.toLocaleString() : "–"}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                          {row.engagementRate != null ? `${row.engagementRate}%` : "–"}
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3">
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(row.clicks / maxClicks) * 100}%`, opacity: 0.6 }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">
        {filtered.length} of {rows.length} keywords
        {hasGa4 && " · Sessions and engagement rate are from the keyword's associated landing page"}
      </p>
    </div>
  );
}

export function PageTable({ rows }: { rows: PageRow[] }) {
  const maxClicks = Math.max(...rows.map((r) => r.clicks), 1);
  return (
    <div className="rounded-xl border bg-card overflow-x-auto">
      {rows.length === 0 ? (
        <p className="p-6 text-sm text-muted-foreground">No page data available.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Page</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-20">Clicks</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-24">Impressions</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-16">CTR</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-20">Position</th>
              <th className="px-4 py-2.5 w-28" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => {
              const path = row.page.replace(/^https?:\/\/[^/]+/, "");
              return (
                <tr key={row.page} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 max-w-xs">
                    <a
                      href={row.page}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[44px] items-center gap-1 group hover:text-primary transition-colors sm:min-h-0"
                    >
                      <span className="line-clamp-1 text-sm">{path || "/"}</span>
                      <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">{row.clicks.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{row.impressions.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{row.ctr}%</td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", positionBadge(row.position))}>
                      #{row.position}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(row.clicks / maxClicks) * 100}%`, opacity: 0.6 }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
