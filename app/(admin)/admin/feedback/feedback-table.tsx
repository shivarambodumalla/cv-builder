"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { StatTile } from "@/components/admin/stat-tile";
import type { RatingStats } from "@/lib/feedback/stats";

export interface FeedbackRow {
  id: string;
  rating: number;
  comment: string | null;
  source: "popup" | "email";
  can_publish: boolean;
  status: "new" | "published" | "archived";
  created_at: string;
  email: string | null;
  full_name: string | null;
  user_number: number | null;
  plan: string | null;
}

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${n} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= n ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
      ))}
    </span>
  );
}

export function FeedbackTable({ rows: initial, stats, minPublic }: { rows: FeedbackRow[]; stats: RatingStats; minPublic: number }) {
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(id: string, action: "publish" | "unpublish" | "archive" | "restore") {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: data.status } : r)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const live = stats.count >= minPublic;
  const maxBucket = Math.max(1, ...Object.values(stats.distribution));
  const actionClass = "min-h-[44px] sm:min-h-0";

  const columns: DataTableColumn<FeedbackRow>[] = [
    {
      key: "when",
      header: "When",
      sortValue: (r) => r.created_at,
      className: "whitespace-nowrap text-xs text-muted-foreground",
      cell: (r) => new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    },
    {
      key: "user",
      header: "User",
      sortValue: (r) => r.full_name || r.email,
      className: "min-w-[160px]",
      cell: (r) => (
        <>
          {r.user_number ? (
            <Link href={`/admin/users/${r.user_number}`} className="font-medium hover:underline">{r.full_name || r.email || `#${r.user_number}`}</Link>
          ) : (
            <span>{r.full_name || r.email || "Unknown"}</span>
          )}
          <p className="text-xs text-muted-foreground">{r.email}{r.plan ? ` · ${r.plan}` : ""}</p>
        </>
      ),
    },
    { key: "rating", header: "Rating", sortValue: (r) => r.rating, className: "whitespace-nowrap", cell: (r) => <Stars n={r.rating} /> },
    {
      key: "comment",
      header: "Comment",
      className: "max-w-md min-w-[200px]",
      cell: (r) =>
        r.comment ? (
          <>
            <p className="whitespace-pre-wrap">{r.comment}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{r.can_publish ? "OK to quote (first name + photo)" : "Private"}</p>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">–</span>
        ),
    },
    { key: "source", header: "Via", sortValue: (r) => r.source, className: "text-xs capitalize", cell: (r) => r.source },
    { key: "status", header: "Status", sortValue: (r) => r.status, className: "text-xs capitalize", cell: (r) => r.status },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      className: "whitespace-nowrap",
      cell: (r) => (
        <div className="inline-flex gap-1">
          {r.status === "new" && r.comment && r.can_publish && (
            <Button size="sm" variant="outline" className={actionClass} disabled={busy === r.id} onClick={() => act(r.id, "publish")}>Publish</Button>
          )}
          {r.status === "published" && (
            <Button size="sm" variant="outline" className={actionClass} disabled={busy === r.id} onClick={() => act(r.id, "unpublish")}>Unpublish</Button>
          )}
          {r.status !== "archived" ? (
            <Button size="sm" variant="ghost" className={actionClass} disabled={busy === r.id} onClick={() => act(r.id, "archive")}>Archive</Button>
          ) : (
            <Button size="sm" variant="ghost" className={actionClass} disabled={busy === r.id} onClick={() => act(r.id, "restore")}>Restore</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="Average" value={stats.count ? `${stats.average.toFixed(1)} / 5` : "–"} />
        <StatTile
          label="Ratings"
          value={stats.count}
          note={live ? "Shown on homepage with AggregateRating" : `${minPublic - stats.count} more before it goes public`}
          tone={live ? "success" : "warning"}
        />
        <div className="col-span-2 rounded-lg border bg-card p-4 sm:col-span-1">
          <p className="text-xs font-medium text-muted-foreground mb-2">Distribution</p>
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((n) => {
              const c = stats.distribution[n as 1 | 2 | 3 | 4 | 5];
              return (
                <div key={n} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-muted-foreground">{n}</span>
                  <div className="h-2 flex-1 rounded bg-muted overflow-hidden">
                    <div className="h-full bg-warning" style={{ width: `${(c / maxBucket) * 100}%` }} />
                  </div>
                  <span className="w-6 text-right tabular-nums">{c}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(r) => r.id}
        initialSort={{ key: "when", dir: "desc" }}
        searchFields={(r) => [r.full_name, r.email, r.comment]}
        searchPlaceholder="Search name, email or comment"
        emptyText="No feedback yet. It arrives after users download a PDF."
        rowClassName={(r) => cn("align-top", r.status === "archived" && "opacity-50")}
      />
    </div>
  );
}
