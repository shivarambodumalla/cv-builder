"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country_code: string | null;
  experience_level: string | null;
  status: string;
  score: number;
  utm_source: string | null;
  utm_campaign: string | null;
  owner_admin_email: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const STATUSES = [
  "all", "new", "viewed_curriculum", "downloaded_curriculum", "call_booked",
  "applied", "interview", "enrolled", "rejected", "lost",
] as const;

const STATUS_COLORS: Record<string, string> = {
  new: "bg-secondary text-secondary-foreground",
  viewed_curriculum: "bg-primary/15 text-primary",
  downloaded_curriculum: "bg-primary/15 text-primary",
  call_booked: "bg-warning/15 text-warning",
  applied: "bg-warning/15 text-warning",
  interview: "bg-warning/15 text-warning",
  enrolled: "bg-success/15 text-success",
  rejected: "bg-error/15 text-error",
  lost: "bg-error/15 text-error",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Sorting and search run on the server (sort select + search box), so the
// columns carry no sortValue.
const COLUMNS: DataTableColumn<Lead>[] = [
  {
    key: "lead",
    header: "Lead",
    cell: (lead) => (
      <Link href={`/admin/course/leads/${lead.id}`} className="block hover:underline">
        <div className="font-medium">{lead.name}</div>
        <div className="text-xs text-muted-foreground">{lead.email}</div>
      </Link>
    ),
  },
  { key: "country", header: "Country", cell: (lead) => lead.country_code || "–" },
  { key: "experience", header: "Experience", cell: (lead) => lead.experience_level || "–" },
  {
    key: "source",
    header: "Source",
    className: "text-xs text-muted-foreground",
    cell: (lead) => `${lead.utm_source || "direct"}${lead.utm_campaign ? ` / ${lead.utm_campaign}` : ""}`,
  },
  {
    key: "score",
    header: "Score",
    cell: (lead) => (
      <span className="inline-flex items-center gap-1 font-semibold">
        {lead.score >= 100 && <Flame className="w-3.5 h-3.5 text-warning" />}
        {lead.score}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (lead) => (
      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap", STATUS_COLORS[lead.status] || "bg-secondary")}>
        {lead.status.replace(/_/g, " ")}
      </span>
    ),
  },
  {
    key: "owner",
    header: "Owner",
    className: "text-xs text-muted-foreground",
    cell: (lead) => lead.owner_admin_email?.split("@")[0] || "–",
  },
  {
    key: "activity",
    header: "Last Activity",
    className: "text-xs text-muted-foreground whitespace-nowrap",
    cell: (lead) => timeAgo(lead.updated_at),
  },
];

export function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"created_at" | "score" | "updated_at">("created_at");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ status, sort });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/mentorship/leads?${params}`);
      if (!res.ok) throw new Error(`Failed to load leads (${res.status})`);
      const data = await res.json();
      setLeads(data.leads);
      setTotal(data.total);
    } catch (err) {
      console.error("[leads] load failed:", err);
      setError(err instanceof Error ? err.message : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [status, search, sort]);

  useEffect(() => {
    const t = setTimeout(fetchLeads, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchLeads, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Leads</h2>
          <p className="text-sm text-muted-foreground">{total} total</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Input
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full sm:h-10 sm:w-56"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="h-11 px-3 border border-input rounded-md bg-background text-sm sm:h-10"
          >
            <option value="created_at">Newest</option>
            <option value="score">Highest score</option>
            <option value="updated_at">Last activity</option>
          </select>
          <Button asChild variant="outline" size="sm" className="min-h-[44px] sm:min-h-0">
            <Link href="/admin/course">Dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              "min-h-[44px] px-3 py-1 rounded-full text-xs font-medium transition-colors sm:min-h-0",
              status === s
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground"
            )}
          >
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <DataTable
        rows={leads}
        columns={COLUMNS}
        rowKey={(lead) => lead.id}
        loading={loading}
        emptyText="No leads yet."
      />
    </div>
  );
}
