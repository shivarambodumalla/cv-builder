"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type SortKey = "name" | "location" | "total_cvs" | "total_pdf_downloads" | "plan" | "last_active" | "joined_at";
type SortDir = "asc" | "desc";
const PAGE_SIZE_OPTIONS = [25, 50, 100, 250];

export interface AdminUserRow {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: string;
  subscription_status?: string | null;
  joined_at: string;
  last_active: string | null;
  total_cvs: number;
  total_pdf_downloads: number;
  signup_city: string | null;
  signup_country: string | null;
  signup_country_code: string | null;
  profile_location: string | null;
  country: string | null;
  cv_location: string | null;
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

const planClass: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  starter: "bg-primary/10 text-primary",
  pro: "bg-primary text-primary-foreground",
};

function initials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0]?.toUpperCase() ?? "?";
}

function locationFor(user: AdminUserRow): { line: string | null; cc: string | null } {
  const signupParts = [user.signup_city, user.signup_country].filter(Boolean);
  if (signupParts.length > 0) return { line: signupParts.join(", "), cc: user.signup_country_code };
  if (user.profile_location || user.country) {
    const line = [user.profile_location, user.country].filter(Boolean).join(", ");
    return { line: line || null, cc: null };
  }
  return { line: user.cv_location, cc: null };
}

function sortValue(u: AdminUserRow, key: SortKey): string | number {
  switch (key) {
    case "name": return (u.full_name ?? u.email).toLowerCase();
    case "location": return (locationFor(u).line ?? "").toLowerCase();
    case "total_cvs": return u.total_cvs;
    case "total_pdf_downloads": return u.total_pdf_downloads;
    case "plan": return u.plan;
    case "last_active": return u.last_active ? new Date(u.last_active).getTime() : 0;
    case "joined_at": return u.joined_at ? new Date(u.joined_at).getTime() : 0;
  }
}

function SortHeader({
  label,
  sortKey,
  current,
  dir,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = current === sortKey;
  return (
    <th className={`px-4 py-3 font-medium text-muted-foreground ${align === "right" ? "text-right" : "text-left"}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 hover:text-foreground transition-colors",
          active && "text-foreground"
        )}
      >
        {label}
        {active ? (
          dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </button>
    </th>
  );
}

export function AdminUsersTable({ users }: { users: AdminUserRow[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("joined_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [pageSize, setPageSize] = useState<number>(50);
  const [page, setPage] = useState(1);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(["total_cvs", "total_pdf_downloads", "last_active", "joined_at"].includes(key) ? "desc" : "asc");
    }
    setPage(1);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = !q
      ? users
      : users.filter((u) => {
          const loc = locationFor(u).line ?? "";
          return (
            u.email.toLowerCase().includes(q) ||
            (u.full_name ?? "").toLowerCase().includes(q) ||
            loc.toLowerCase().includes(q) ||
            (u.signup_country ?? "").toLowerCase().includes(q) ||
            (u.signup_city ?? "").toLowerCase().includes(q)
          );
        });
    const sorted = [...base].sort((a, b) => {
      const av = sortValue(a, sortKey);
      const bv = sortValue(b, sortKey);
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [users, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <span className="text-sm text-muted-foreground">{users.length} total</span>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or location..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Show</span>
              <select
                className="rounded-md border bg-background px-2 py-1 text-xs"
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              >
                {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <span>per page</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <SortHeader label="User" sortKey="name" current={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortHeader label="Location" sortKey="location" current={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortHeader label="CVs" sortKey="total_cvs" current={sortKey} dir={sortDir} onSort={handleSort} align="right" />
                  <SortHeader label="Downloads" sortKey="total_pdf_downloads" current={sortKey} dir={sortDir} onSort={handleSort} align="right" />
                  <SortHeader label="Plan" sortKey="plan" current={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortHeader label="Last Active" sortKey="last_active" current={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortHeader label="Joined" sortKey="joined_at" current={sortKey} dir={sortDir} onSort={handleSort} />
                </tr>
              </thead>
              <tbody>
                {paged.map((user) => {
                  const { line: locationLine, cc } = locationFor(user);
                  return (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/admin/users/${user.id}`} className="flex items-center gap-3 group">
                          <Avatar className="h-8 w-8 shrink-0">
                            {user.avatar_url ? <AvatarImage src={user.avatar_url} alt={user.full_name || user.email} referrerPolicy="no-referrer" /> : null}
                            <AvatarFallback className="bg-muted text-xs font-semibold">
                              {initials(user.full_name, user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium group-hover:underline truncate">
                              {user.full_name || "—"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {locationLine ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span>{locationLine}</span>
                            {cc && (
                              <span className="text-[10px] font-semibold uppercase opacity-60">{cc}</span>
                            )}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{user.total_cvs}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{user.total_pdf_downloads}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className={`${planClass[user.plan] ?? ""} capitalize text-[10px]`}>
                          {user.plan}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {user.last_active ? timeAgo(user.last_active) : "Never"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(user.joined_at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No users match.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 text-xs text-muted-foreground sm:flex-row">
              <span>
                Showing <span className="font-medium text-foreground">{start + 1}</span>–
                <span className="font-medium text-foreground">{Math.min(start + pageSize, filtered.length)}</span> of{" "}
                <span className="font-medium text-foreground">{filtered.length}</span>
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </Button>
                <span className="px-2">
                  Page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
                  <span className="font-medium text-foreground">{totalPages}</span>
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
