"use client";
import { useState } from "react";
import Link from "next/link";

type ReviewStatus = "pending" | "in_progress" | "completed" | "cancelled";

interface Review {
  id: string;
  tier: string;
  status: ReviewStatus;
  target_role: string | null;
  target_country: string | null;
  edit_rounds_used: number;
  edit_rounds_limit: number;
  price_paid: number;
  created_at: string;
  profile: { full_name: string | null; email: string | null } | null;
}

const STATUS_CONFIG: Record<ReviewStatus, { label: string; bg: string; color: string }> = {
  pending: { label: "Pending", bg: "#FEF3C7", color: "#92400E" },
  in_progress: { label: "In progress", bg: "#EFF6FF", color: "#1D4ED8" },
  completed: { label: "Complete", bg: "hsl(var(--primary) / 0.08)", color: "hsl(var(--primary))" },
  cancelled: { label: "Cancelled", bg: "#FEF2F2", color: "#991B1B" },
};

const FILTERS = ["all", "pending", "in_progress", "completed"] as const;

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function ReviewsQueue({ reviews }: { reviews: Review[] }) {
  const [filter, setFilter] = useState<"all" | ReviewStatus>("all");

  const sorted = [...reviews].sort((a, b) => {
    const order: Record<string, number> = { pending: 0, in_progress: 1, completed: 2, cancelled: 3 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const filtered = filter === "all" ? sorted : sorted.filter((r) => r.status === filter);

  return (
    <div>
      {/* Filter pills */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === f ? "text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            style={{ background: filter === f ? "hsl(var(--primary))" : undefined }}>
            {f === "all" ? "All" : f === "in_progress" ? "In progress" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tier</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Target role</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Country</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Submitted</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rounds</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">No reviews found.</td></tr>
            ) : (
              filtered.map((r) => {
                const st = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.pending;
                return (
                  <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.profile?.full_name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{r.profile?.email || "—"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize" style={{ background: "hsl(var(--primary) / 0.08)", color: "hsl(var(--primary))" }}>{r.tier}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">{r.target_role || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.target_country || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{timeAgo(r.created_at)}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {r.edit_rounds_used}/{r.edit_rounds_limit === 999 ? "∞" : r.edit_rounds_limit}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/reviews/${r.id}`} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-80" style={{ background: "hsl(var(--primary))" }}>
                        Review →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
