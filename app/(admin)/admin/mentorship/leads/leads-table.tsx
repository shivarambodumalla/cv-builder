"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2, Flame } from "lucide-react";

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
    const params = new URLSearchParams({ status, sort });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/mentorship/leads?${params}`);
    if (!res.ok) {
      setError(`Failed to load leads (${res.status})`);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setLeads(data.leads);
    setTotal(data.total);
    setLoading(false);
  }, [status, search, sort]);

  useEffect(() => {
    const t = setTimeout(fetchLeads, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchLeads, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground">{total} total</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm"
          >
            <option value="created_at">Newest</option>
            <option value="score">Highest score</option>
            <option value="updated_at">Last activity</option>
          </select>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/mentorship">Dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors",
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

      <div className="border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="px-4 py-2.5 font-medium">Lead</th>
              <th className="px-4 py-2.5 font-medium">Country</th>
              <th className="px-4 py-2.5 font-medium">Experience</th>
              <th className="px-4 py-2.5 font-medium">Source</th>
              <th className="px-4 py-2.5 font-medium">Score</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Owner</th>
              <th className="px-4 py-2.5 font-medium">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {loading && leads.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <Loader2 className="w-5 h-5 animate-spin inline text-muted-foreground" />
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  No leads yet.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    <Link href={`/admin/mentorship/leads/${lead.id}`} className="hover:underline">
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-xs text-muted-foreground">{lead.email}</div>
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">{lead.country_code || "—"}</td>
                  <td className="px-4 py-2.5">{lead.experience_level || "—"}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {lead.utm_source || "direct"}
                    {lead.utm_campaign ? ` / ${lead.utm_campaign}` : ""}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1 font-semibold">
                      {lead.score >= 100 && <Flame className="w-3.5 h-3.5 text-warning" />}
                      {lead.score}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", STATUS_COLORS[lead.status] || "bg-secondary")}>
                      {lead.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {lead.owner_admin_email?.split("@")[0] || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{timeAgo(lead.updated_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
