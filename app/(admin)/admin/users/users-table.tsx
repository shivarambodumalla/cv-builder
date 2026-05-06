"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight,
  Search, Download, Columns3, X, ExternalLink, Loader2, SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveCountry } from "@/components/admin/users/country-data";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortKey =
  | "user_number" | "name" | "role" | "location" | "total_cvs"
  | "total_pdf_downloads" | "job_clicks" | "saved_jobs" | "stories"
  | "plan" | "last_active" | "joined_at" | "industry" | "experience_level"
  | "years_experience" | "best_ats_score";
export type SortDir = "asc" | "desc";

const PAGE_SIZE_OPTIONS = [25, 50, 100, 250];

export interface AdminUserRow {
  id: string;
  user_number: number;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: string;
  subscription_status?: string | null;
  joined_at: string;
  last_active: string | null;
  target_role: string | null;
  industry: string | null;
  experience_level: string | null;
  years_experience: number | null;
  employment_status: string | null;
  best_ats_score: number | null;
  primary_goal: string | null;
  total_cvs: number;
  total_pdf_downloads: number;
  job_clicks: number;
  saved_jobs: number;
  stories: number;
  signup_city: string | null;
  signup_country: string | null;
  signup_country_code: string | null;
  profile_location: string | null;
  country: string | null;
  cv_location: string | null;
  phone: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  latest_cv_id: string | null;
}

// ─── Column Definitions ───────────────────────────────────────────────────────

interface ColDef {
  key: string;
  label: string;
  defaultOn: boolean;
  sortable?: SortKey;
  align?: "right";
}

export const COLUMN_GROUPS: { label: string; cols: ColDef[] }[] = [
  {
    label: "Identity",
    cols: [
      { key: "user_number", label: "#",           defaultOn: true,  sortable: "user_number", align: "right" },
      { key: "name",        label: "Name",         defaultOn: true,  sortable: "name" },
      { key: "email",       label: "Email",        defaultOn: false },
      { key: "plan",        label: "Plan",         defaultOn: true,  sortable: "plan" },
      { key: "joined_at",   label: "Joined",       defaultOn: true,  sortable: "joined_at" },
      { key: "last_active", label: "Last Active",  defaultOn: true,  sortable: "last_active" },
    ],
  },
  {
    label: "Location",
    cols: [
      { key: "signup_location", label: "Signup Location", defaultOn: true,  sortable: "location" },
      { key: "cv_location",     label: "CV Location",     defaultOn: false },
      { key: "country",         label: "Country",         defaultOn: false },
    ],
  },
  {
    label: "Professional",
    cols: [
      { key: "role",              label: "Role",         defaultOn: true,  sortable: "role" },
      { key: "industry",          label: "Industry",     defaultOn: false, sortable: "industry" },
      { key: "experience_level",  label: "Exp Level",    defaultOn: false, sortable: "experience_level" },
      { key: "years_experience",  label: "Yrs Exp",      defaultOn: false, sortable: "years_experience", align: "right" },
      { key: "employment_status", label: "Employment",   defaultOn: false },
      { key: "best_ats_score",    label: "Best ATS",     defaultOn: false, sortable: "best_ats_score", align: "right" },
      { key: "primary_goal",      label: "Primary Goal", defaultOn: false },
    ],
  },
  {
    label: "Activity",
    cols: [
      { key: "total_cvs",           label: "CVs",        defaultOn: true, sortable: "total_cvs",           align: "right" },
      { key: "total_pdf_downloads", label: "Downloads",  defaultOn: true, sortable: "total_pdf_downloads", align: "right" },
      { key: "job_clicks",          label: "Job Clicks", defaultOn: true, sortable: "job_clicks",          align: "right" },
      { key: "saved_jobs",          label: "Saved Jobs", defaultOn: true, sortable: "saved_jobs",          align: "right" },
      { key: "stories",             label: "Stories",    defaultOn: true, sortable: "stories",             align: "right" },
    ],
  },
  {
    label: "Links & Contact",
    cols: [
      { key: "linkedin_url",  label: "LinkedIn",  defaultOn: false },
      { key: "github_url",    label: "GitHub",    defaultOn: false },
      { key: "portfolio_url", label: "Portfolio", defaultOn: false },
      { key: "phone",         label: "Phone",     defaultOn: false },
    ],
  },
  {
    label: "CV",
    cols: [
      { key: "cv_preview", label: "CV Preview Link", defaultOn: false },
    ],
  },
];

const ALL_COLS = COLUMN_GROUPS.flatMap((g) => g.cols);
const DEFAULT_VISIBLE = new Set(ALL_COLS.filter((c) => c.defaultOn).map((c) => c.key));

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  free:    "bg-muted text-muted-foreground",
  starter: "bg-primary/10 text-primary",
  pro:     "bg-primary text-primary-foreground",
};

function initials(name: string | null, email: string): string {
  if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  return email[0]?.toUpperCase() ?? "?";
}

function locationFor(user: AdminUserRow): { line: string | null; cc: string | null } {
  const resolved = resolveCountry(user.signup_country_code, user.signup_country);
  const countryName = resolved?.name ?? user.signup_country ?? null;
  const signupParts = [user.signup_city, countryName].filter(Boolean);
  if (signupParts.length > 0) return { line: signupParts.join(", "), cc: user.signup_country_code };
  if (user.profile_location || user.country) {
    return { line: [user.profile_location, user.country].filter(Boolean).join(", ") || null, cc: null };
  }
  return { line: user.cv_location, cc: null };
}

// ─── Sort Header ──────────────────────────────────────────────────────────────

function SortHeader({
  label, sortKey, current, dir, onSort, align = "left",
}: {
  label: string; sortKey: SortKey; current: SortKey; dir: SortDir;
  onSort: (k: SortKey) => void; align?: "left" | "right";
}) {
  const active = current === sortKey;
  return (
    <th className={`px-4 py-3 font-medium text-muted-foreground ${align === "right" ? "text-right" : "text-left"}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn("inline-flex items-center gap-1 hover:text-foreground transition-colors", active && "text-foreground")}
      >
        {label}
        {active
          ? dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
          : <ArrowUpDown className="h-3 w-3 opacity-40" />}
      </button>
    </th>
  );
}

// ─── Column Picker ────────────────────────────────────────────────────────────

function ColumnPicker({
  visible, onChange,
}: { visible: Set<string>; onChange: (next: Set<string>) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const allKeys = ALL_COLS.map((c) => c.key);
  const allOn   = allKeys.every((k) => visible.has(k));

  function toggle(key: string) {
    const next = new Set(visible);
    next.has(key) ? next.delete(key) : next.add(key);
    onChange(next);
  }

  function toggleGroup(keys: string[], on: boolean) {
    const next = new Set(visible);
    keys.forEach((k) => (on ? next.add(k) : next.delete(k)));
    onChange(next);
  }

  return (
    <div className="relative" ref={ref}>
      <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setOpen((v) => !v)}>
        <Columns3 className="h-3.5 w-3.5" />
        Columns
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-lg border bg-background shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-2.5">
            <span className="text-xs font-semibold text-foreground">Visible columns</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => onChange(allOn ? new Set(DEFAULT_VISIBLE) : new Set(allKeys))}
              >
                {allOn ? "Reset defaults" : "Select all"}
              </button>
              <button type="button" onClick={() => setOpen(false)}>
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto p-3 space-y-4">
            {COLUMN_GROUPS.map((group) => {
              const groupKeys  = group.cols.map((c) => c.key);
              const groupAllOn = groupKeys.every((k) => visible.has(k));
              return (
                <div key={group.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.label}
                    </span>
                    <button
                      type="button"
                      className="text-[11px] text-muted-foreground hover:text-foreground"
                      onClick={() => toggleGroup(groupKeys, !groupAllOn)}
                    >
                      {groupAllOn ? "None" : "All"}
                    </button>
                  </div>
                  <div className="space-y-1">
                    {group.cols.map((col) => (
                      <label
                        key={col.key}
                        className="flex cursor-pointer items-center gap-2.5 rounded px-2 py-1 hover:bg-muted/60"
                      >
                        <input
                          type="checkbox"
                          checked={visible.has(col.key)}
                          onChange={() => toggle(col.key)}
                          className="h-3.5 w-3.5 accent-primary"
                        />
                        <span className="text-xs">{col.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Cell Renderer ────────────────────────────────────────────────────────────

function Cell({ user, colKey }: { user: AdminUserRow; colKey: string }) {
  const { line: locationLine, cc } = locationFor(user);

  switch (colKey) {
    case "user_number":
      return (
        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground text-xs font-mono">
          {user.user_number}
        </td>
      );
    case "name":
      return (
        <td className="px-4 py-3">
          <Link href={`/admin/users/${user.user_number}`} className="flex items-center gap-3 group">
            <Avatar className="h-8 w-8 shrink-0">
              {user.avatar_url && (
                <AvatarImage src={user.avatar_url} alt={user.full_name || user.email} referrerPolicy="no-referrer" />
              )}
              <AvatarFallback className="bg-muted text-xs font-semibold">
                {initials(user.full_name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium group-hover:underline truncate">{user.full_name || "—"}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </Link>
        </td>
      );
    case "email":
      return (
        <td className="px-4 py-3 text-xs text-muted-foreground">
          {user.email}
        </td>
      );
    case "plan":
      return (
        <td className="px-4 py-3">
          <Badge variant="secondary" className={`${planClass[user.plan] ?? ""} capitalize text-[10px]`}>
            {user.plan}
          </Badge>
        </td>
      );
    case "joined_at":
      return (
        <td className="px-4 py-3 text-muted-foreground text-xs">
          {new Date(user.joined_at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
        </td>
      );
    case "last_active":
      return (
        <td className="px-4 py-3 text-muted-foreground text-xs">
          {user.last_active ? timeAgo(user.last_active) : "Never"}
        </td>
      );
    case "signup_location":
      return (
        <td className="px-4 py-3 text-muted-foreground text-xs">
          {locationLine ? (
            <span className="inline-flex items-center gap-1.5">
              {locationLine}
              {cc && <span className="text-[10px] font-semibold uppercase opacity-60">{cc}</span>}
            </span>
          ) : "—"}
        </td>
      );
    case "cv_location":
      return (
        <td className="px-4 py-3 text-muted-foreground text-xs">
          {user.cv_location || <span className="opacity-30">—</span>}
        </td>
      );
    case "country":
      return (
        <td className="px-4 py-3 text-muted-foreground text-xs">
          {user.country || user.signup_country || <span className="opacity-30">—</span>}
        </td>
      );
    case "role":
      return (
        <td className="px-4 py-3">
          {user.target_role
            ? <span className="text-xs text-muted-foreground">{user.target_role}</span>
            : <span className="text-xs text-muted-foreground/30">—</span>}
        </td>
      );
    case "industry":
      return (
        <td className="px-4 py-3 text-xs text-muted-foreground">
          {user.industry || <span className="opacity-30">—</span>}
        </td>
      );
    case "experience_level": {
      const EXP_LABEL: Record<string, string> = { early: "Early Career", mid: "Mid", senior: "Senior", expert: "Expert" };
      return (
        <td className="px-4 py-3 text-xs text-muted-foreground">
          {user.experience_level ? (EXP_LABEL[user.experience_level] ?? user.experience_level) : <span className="opacity-30">—</span>}
        </td>
      );
    }
    case "years_experience":
      return (
        <td className="px-4 py-3 text-right tabular-nums text-xs">
          {user.years_experience != null ? `${user.years_experience}y` : <span className="text-muted-foreground/30">—</span>}
        </td>
      );
    case "employment_status":
      return (
        <td className="px-4 py-3 text-xs text-muted-foreground capitalize">
          {user.employment_status?.replace(/_/g, " ") || <span className="opacity-30">—</span>}
        </td>
      );
    case "best_ats_score":
      return (
        <td className="px-4 py-3 text-right tabular-nums text-xs">
          {user.best_ats_score != null
            ? <span className={cn(
                "font-semibold",
                user.best_ats_score >= 75 ? "text-success" :
                user.best_ats_score >= 60 ? "text-warning" : "text-error",
              )}>{user.best_ats_score}</span>
            : <span className="text-muted-foreground/30">—</span>}
        </td>
      );
    case "primary_goal":
      return (
        <td className="px-4 py-3 text-xs text-muted-foreground capitalize">
          {user.primary_goal?.replace(/_/g, " ") || <span className="opacity-30">—</span>}
        </td>
      );
    case "total_cvs":
      return <td className="px-4 py-3 text-right tabular-nums text-xs">{user.total_cvs || <span className="text-muted-foreground/30">—</span>}</td>;
    case "total_pdf_downloads":
      return <td className="px-4 py-3 text-right tabular-nums text-xs">{user.total_pdf_downloads || <span className="text-muted-foreground/30">—</span>}</td>;
    case "job_clicks":
      return <td className="px-4 py-3 text-right tabular-nums text-xs">{user.job_clicks || <span className="text-muted-foreground/30">—</span>}</td>;
    case "saved_jobs":
      return <td className="px-4 py-3 text-right tabular-nums text-xs">{user.saved_jobs || <span className="text-muted-foreground/30">—</span>}</td>;
    case "stories":
      return <td className="px-4 py-3 text-right tabular-nums text-xs">{user.stories || <span className="text-muted-foreground/30">—</span>}</td>;
    case "linkedin_url":
      return (
        <td className="px-4 py-3 text-xs">
          {user.linkedin_url
            ? <a href={user.linkedin_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline truncate max-w-[140px]">
                LinkedIn <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            : <span className="text-muted-foreground/30">—</span>}
        </td>
      );
    case "github_url":
      return (
        <td className="px-4 py-3 text-xs">
          {user.github_url
            ? <a href={user.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline truncate max-w-[140px]">
                GitHub <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            : <span className="text-muted-foreground/30">—</span>}
        </td>
      );
    case "portfolio_url":
      return (
        <td className="px-4 py-3 text-xs">
          {user.portfolio_url
            ? <a href={user.portfolio_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline truncate max-w-[140px]">
                Portfolio <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            : <span className="text-muted-foreground/30">—</span>}
        </td>
      );
    case "phone":
      return (
        <td className="px-4 py-3 text-xs text-muted-foreground">
          {user.phone || <span className="opacity-30">—</span>}
        </td>
      );
    case "cv_preview":
      return (
        <td className="px-4 py-3 text-xs">
          {user.latest_cv_id
            ? <a
                href={`/api/admin/cv/${user.latest_cv_id}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                View PDF <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            : <span className="text-muted-foreground/30">—</span>}
        </td>
      );
    default:
      return <td className="px-4 py-3" />;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface AdminUsersTableProps {
  users: AdminUserRow[];
  total: number;
  loading: boolean;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (n: number) => void;
  search: string;
  onSearchChange: (s: string) => void;
  onExport: (visibleCols: Set<string>) => void;
  onToggleFilters: () => void;
  filtersActive: number;
}

export function AdminUsersTable({
  users, total, loading,
  sortKey, sortDir, onSort,
  page, pageSize, onPageChange, onPageSizeChange,
  search, onSearchChange, onExport,
  onToggleFilters, filtersActive,
}: AdminUsersTableProps) {
  const [visibleCols, setVisibleCols] = useState<Set<string>>(DEFAULT_VISIBLE);

  const totalPages  = Math.max(1, Math.ceil(total / pageSize));
  const start       = (page - 1) * pageSize + 1;
  const end         = Math.min(page * pageSize, total);
  const renderedCols = ALL_COLS.filter((c) => visibleCols.has(c.key));

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter toggle — first, always visible */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs shrink-0"
            onClick={onToggleFilters}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {filtersActive > 0 && (
              <span className="rounded-full bg-primary text-primary-foreground text-[10px] px-1.5 font-medium leading-4">
                {filtersActive}
              </span>
            )}
          </Button>

          {/* Search — grows to fill remaining space */}
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, email, role…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>

          {/* Right-side controls */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground hidden sm:inline">Show</span>
            <select
              className="rounded-md border bg-background px-2 py-1 text-xs"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <ColumnPicker visible={visibleCols} onChange={setVisibleCols} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => onExport(visibleCols)}
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>


      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {renderedCols.map((col) =>
                  col.sortable ? (
                    <SortHeader
                      key={col.key}
                      label={col.label}
                      sortKey={col.sortable}
                      current={sortKey}
                      dir={sortDir}
                      onSort={onSort}
                      align={col.align}
                    />
                  ) : (
                    <th
                      key={col.key}
                      className={`px-4 py-3 font-medium text-muted-foreground ${col.align === "right" ? "text-right" : "text-left"}`}
                    >
                      {col.label}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={renderedCols.length} className="px-4 py-12 text-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" />
                  </td>
                </tr>
              )}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={renderedCols.length} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No users match the current filters.
                  </td>
                </tr>
              )}
              {!loading && users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                >
                  {renderedCols.map((col) => (
                    <Cell key={col.key} user={user} colKey={col.key} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {total > 0 && !loading && (
          <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 text-xs text-muted-foreground sm:flex-row">
            <span>
              Showing{" "}
              <span className="font-medium text-foreground">{start}</span>–
              <span className="font-medium text-foreground">{end}</span>{" "}
              of <span className="font-medium text-foreground">{total.toLocaleString()}</span>
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button" variant="outline" size="sm" className="h-7 px-2"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </Button>
              <span className="px-2">
                Page <span className="font-medium text-foreground">{page}</span> of{" "}
                <span className="font-medium text-foreground">{totalPages}</span>
              </span>
              <Button
                type="button" variant="outline" size="sm" className="h-7 px-2"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
