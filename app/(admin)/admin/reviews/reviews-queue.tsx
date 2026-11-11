"use client";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";

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

const STATUS_CONFIG: Record<ReviewStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-warning/15 text-warning" },
  in_progress: { label: "In progress", className: "bg-primary/15 text-primary" },
  completed: { label: "Complete", className: "bg-success/15 text-success" },
  cancelled: { label: "Cancelled", className: "bg-error/15 text-error" },
};

const STATUS_ORDER: Record<ReviewStatus, number> = { pending: 0, in_progress: 1, completed: 2, cancelled: 3 };

const FILTERS = ["all", "pending", "in_progress", "completed"] as const;

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const COLUMNS: DataTableColumn<Review>[] = [
  {
    key: "user",
    header: "User",
    sortValue: (r) => r.profile?.full_name || r.profile?.email,
    cell: (r) => (
      <>
        <div className="font-medium">{r.profile?.full_name || "–"}</div>
        <div className="text-xs text-muted-foreground">{r.profile?.email || "–"}</div>
      </>
    ),
  },
  {
    key: "tier",
    header: "Tier",
    sortValue: (r) => r.tier,
    cell: (r) => (
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize bg-[#065F46]/10 text-[#065F46]">{r.tier}</span>
    ),
  },
  {
    key: "role",
    header: "Target role",
    sortValue: (r) => r.target_role,
    className: "text-muted-foreground max-w-[160px] truncate",
    cell: (r) => r.target_role || "–",
  },
  { key: "country", header: "Country", sortValue: (r) => r.target_country, className: "text-muted-foreground", cell: (r) => r.target_country || "–" },
  {
    key: "status",
    header: "Status",
    sortValue: (r) => STATUS_ORDER[r.status],
    cell: (r) => {
      const st = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.pending;
      return <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap", st.className)}>{st.label}</span>;
    },
  },
  {
    key: "submitted",
    header: "Submitted",
    sortValue: (r) => r.created_at,
    className: "text-muted-foreground text-xs whitespace-nowrap",
    cell: (r) => timeAgo(r.created_at),
  },
  {
    key: "rounds",
    header: "Rounds",
    className: "text-muted-foreground text-xs",
    cell: (r) => `${r.edit_rounds_used}/${r.edit_rounds_limit === 999 ? "∞" : r.edit_rounds_limit}`,
  },
  {
    key: "open",
    header: <span className="sr-only">Open</span>,
    cell: (r) => (
      <Link
        href={`/admin/reviews/${r.id}`}
        className="inline-flex min-h-[44px] items-center whitespace-nowrap rounded-lg bg-[#065F46] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-80 sm:min-h-0"
      >
        Review →
      </Link>
    ),
  },
];

export function ReviewsQueue({ reviews }: { reviews: Review[] }) {
  const [filter, setFilter] = useState<"all" | ReviewStatus>("all");

  // Open work first (pending, then in progress), oldest first within each
  const sorted = [...reviews].sort((a, b) => {
    if (STATUS_ORDER[a.status] !== STATUS_ORDER[b.status]) return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const filtered = filter === "all" ? sorted : sorted.filter((r) => r.status === filter);

  return (
    <DataTable
      rows={filtered}
      columns={COLUMNS}
      rowKey={(r) => r.id}
      searchFields={(r) => [r.profile?.full_name, r.profile?.email, r.target_role, r.target_country]}
      searchPlaceholder="Search name, email or role"
      emptyText="No reviews found."
      toolbar={
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "min-h-[44px] px-3 py-1.5 rounded-full text-xs font-medium transition-colors sm:min-h-0",
                filter === f ? "bg-[#065F46] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {f === "all" ? "All" : f === "in_progress" ? "In progress" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      }
    />
  );
}
