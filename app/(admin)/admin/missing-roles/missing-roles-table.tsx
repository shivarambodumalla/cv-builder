"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

  async function handleDismiss(id: string) {
    setDismissingId(id);
    try {
      const res = await fetch(`/api/admin/missing-roles/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMissingRoles((prev) => prev.filter((r) => r.id !== id));
      }
    } finally {
      setDismissingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Missing Roles</h1>
        <span className="text-sm text-muted-foreground">
          {missingRoles.length} unique role{missingRoles.length !== 1 ? "s" : ""}
        </span>
      </div>

      <Card>
        <CardHeader />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Requests
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    First Requested By
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    First Requested
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {missingRoles.map((role) => (
                  <tr
                    key={role.id}
                    className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-3 font-bold">{role.role_name}</td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {role.domain || "Unknown"}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant="secondary">{role.count}</Badge>
                    </td>
                    <td
                      className="px-6 py-3 text-muted-foreground"
                      title={role.first_requested_by}
                    >
                      {truncateEmail(role.first_requested_by)}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {timeAgo(role.first_requested_at)}
                    </td>
                    <td className="px-6 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        disabled={dismissingId === role.id}
                        onClick={() => handleDismiss(role.id)}
                      >
                        {dismissingId === role.id ? "Dismissing..." : "Dismiss"}
                      </Button>
                    </td>
                  </tr>
                ))}
                {missingRoles.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      No missing role requests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
