"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import type { GroupedMissingRole } from "./page";

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function truncateEmail(email: string, max = 24): string {
  return email.length > max ? email.slice(0, max) + "..." : email;
}

export function MissingRolesTable({
  missingRoles: initial,
}: {
  missingRoles: GroupedMissingRole[];
}) {
  const [missingRoles, setMissingRoles] = useState(initial);
  const [dismissingId, setDismissingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleDismiss(id: string) {
    setDismissingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/missing-roles/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Couldn't dismiss that role (${res.status})`);
      setMissingRoles((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("[missing-roles] dismiss failed:", err);
      setError(err instanceof Error ? err.message : "Couldn't dismiss that role");
    } finally {
      setDismissingId(null);
    }
  }

  const columns: DataTableColumn<GroupedMissingRole>[] = [
    { key: "role", header: "Role", sortValue: (r) => r.role_name, className: "font-bold", cell: (r) => r.role_name },
    {
      key: "domain",
      header: "Domain",
      sortValue: (r) => r.domain,
      className: "text-muted-foreground",
      cell: (r) => r.domain || "Unknown",
    },
    { key: "count", header: "Requests", sortValue: (r) => r.count, cell: (r) => <Badge variant="secondary">{r.count}</Badge> },
    {
      key: "by",
      header: "First Requested By",
      className: "text-muted-foreground",
      cell: (r) => <span title={r.first_requested_by}>{truncateEmail(r.first_requested_by)}</span>,
    },
    {
      key: "at",
      header: "First Requested",
      sortValue: (r) => r.first_requested_at,
      className: "whitespace-nowrap text-muted-foreground",
      cell: (r) => timeAgo(r.first_requested_at),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (r) => (
        <Button
          variant="ghost"
          size="sm"
          className="min-h-[44px] text-destructive hover:text-destructive sm:min-h-0"
          disabled={dismissingId === r.id}
          onClick={() => handleDismiss(r.id)}
        >
          {dismissingId === r.id ? "Dismissing..." : "Dismiss"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Missing Roles</h2>
        <span className="text-sm text-muted-foreground">
          {missingRoles.length} unique role{missingRoles.length !== 1 ? "s" : ""}
        </span>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <DataTable
        rows={missingRoles}
        columns={columns}
        rowKey={(r) => r.id}
        searchFields={(r) => [r.role_name, r.domain, r.first_requested_by]}
        searchPlaceholder="Search role, domain or email"
        emptyText="No missing role requests."
      />
    </div>
  );
}
