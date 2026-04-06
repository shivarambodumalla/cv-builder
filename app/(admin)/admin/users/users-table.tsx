"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Search } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  plan: string;
  subscription_status?: string;
  created_at: string;
  last_active: string | null;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const planColors: Record<string, string> = {
  free: "bg-secondary text-secondary-foreground",
  starter: "bg-primary/10 text-foreground",
  pro: "bg-primary text-primary-foreground",
};

export function AdminUsersTable({ users }: { users: Profile[] }) {
  const [search, setSearch] = useState("");

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <span className="text-sm text-muted-foreground">
          {users.length} total
        </span>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-3">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="font-medium hover:underline"
                      >
                        {user.full_name || "—"}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${planColors[user.plan] ?? ""}`}
                      >
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {user.last_active ? timeAgo(user.last_active) : "Never"}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      No users match that email.
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
