"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  async function act(id: string, action: "publish" | "archive" | "restore") {
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

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Average</p>
          <p className="text-3xl font-bold">{stats.count ? stats.average.toFixed(1) : "–"}<span className="text-base font-normal text-muted-foreground"> / 5</span></p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Ratings</p>
          <p className="text-3xl font-bold">{stats.count}</p>
          <p className={`text-xs mt-1 ${live ? "text-success" : "text-warning"}`}>
            {live ? "Shown on homepage with AggregateRating" : `${minPublic - stats.count} more before it goes public`}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-2">Distribution</p>
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

      {/* Rows */}
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No feedback yet. It arrives after users download a PDF.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">When</th>
                <th className="px-3 py-2 text-left font-medium">User</th>
                <th className="px-3 py-2 text-left font-medium">Rating</th>
                <th className="px-3 py-2 text-left font-medium">Comment</th>
                <th className="px-3 py-2 text-left font-medium">Via</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={`border-t align-top ${r.status === "archived" ? "opacity-50" : ""}`}>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td className="px-3 py-2 min-w-[160px]">
                    {r.user_number ? (
                      <Link href={`/admin/users/${r.user_number}`} className="font-medium hover:underline">{r.full_name || r.email || `#${r.user_number}`}</Link>
                    ) : (
                      <span>{r.full_name || r.email || "Unknown"}</span>
                    )}
                    <p className="text-xs text-muted-foreground">{r.email}{r.plan ? ` · ${r.plan}` : ""}</p>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap"><Stars n={r.rating} /></td>
                  <td className="px-3 py-2 max-w-md">
                    {r.comment ? <p className="whitespace-pre-wrap">{r.comment}</p> : <span className="text-xs text-muted-foreground">—</span>}
                    {r.comment && (
                      <p className="mt-1 text-[11px] text-muted-foreground">{r.can_publish ? "OK to quote (first name)" : "Private"}</p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs capitalize">{r.source}</td>
                  <td className="px-3 py-2 text-xs capitalize">{r.status}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <div className="inline-flex gap-1">
                      {r.status === "new" && r.comment && r.can_publish && (
                        <Button size="sm" variant="outline" disabled={busy === r.id} onClick={() => act(r.id, "publish")}>Publish</Button>
                      )}
                      {r.status !== "archived" ? (
                        <Button size="sm" variant="ghost" disabled={busy === r.id} onClick={() => act(r.id, "archive")}>Archive</Button>
                      ) : (
                        <Button size="sm" variant="ghost" disabled={busy === r.id} onClick={() => act(r.id, "restore")}>Restore</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
