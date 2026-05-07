"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FilterSidebar, FilterState, DEFAULT_FILTERS, countActiveFilters } from "./filter-sidebar";
import { AdminUsersTable, type AdminUserRow, type SortKey, type SortDir } from "@/app/(admin)/admin/users/users-table";

// ─── URL builder ──────────────────────────────────────────────────────────────

function buildParams(
  f: FilterState,
  search: string,
  sortBy: string,
  sortDir: string,
  page: number,
  pageSize: number,
): URLSearchParams {
  const p = new URLSearchParams();
  if (f.plan)              p.set("plan",              f.plan);
  if (f.subscription_status) p.set("subscription_status", f.subscription_status);
  if (f.joined_from)       p.set("joined_from",       f.joined_from);
  if (f.joined_to)         p.set("joined_to",         f.joined_to);
  if (f.last_active_days)  p.set("last_active_days",  f.last_active_days);
  if (f.country_code)      p.set("country_code",      f.country_code);
  if (f.city)              p.set("city",              f.city);
  if (f.role)              p.set("role",              f.role);
  if (f.industries.length) p.set("industries",        f.industries.join(","));
  if (f.experience_levels.length) p.set("experience_levels", f.experience_levels.join(","));
  if (f.years_exp_min)     p.set("years_exp_min",     f.years_exp_min);
  if (f.years_exp_max)     p.set("years_exp_max",     f.years_exp_max);
  if (f.skills.length)     p.set("skills",            f.skills.join(","));
  p.set("skills_match", f.skills_match);
  if (f.certification)     p.set("certification",     f.certification);
  if (f.degree)            p.set("degree",            f.degree);
  if (f.field_of_study)    p.set("field_of_study",    f.field_of_study);
  if (f.institution)       p.set("institution",       f.institution);
  if (f.ats_min)           p.set("ats_min",           f.ats_min);
  if (f.ats_max)           p.set("ats_max",           f.ats_max);
  if (f.has_downloads)     p.set("has_downloads",     f.has_downloads);
  if (f.has_stories)       p.set("has_stories",       f.has_stories);
  if (f.has_job_clicks)    p.set("has_job_clicks",    f.has_job_clicks);
  if (f.min_cvs)           p.set("min_cvs",           f.min_cvs);
  if (f.has_linkedin)      p.set("has_linkedin",      f.has_linkedin);
  if (f.has_github)        p.set("has_github",        f.has_github);
  if (f.has_portfolio)     p.set("has_portfolio",     f.has_portfolio);
  if (f.has_phone)         p.set("has_phone",         f.has_phone);
  if (search)              p.set("search",            search);
  p.set("sort_by",   sortBy);
  p.set("sort_dir",  sortDir);
  p.set("page",      String(page));
  p.set("page_size", String(pageSize));
  return p;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UsersClient() {
  const [filters, setFilters]   = useState<FilterState>(DEFAULT_FILTERS);
  const [search, setSearch]     = useState("");
  const [sortKey, setSortKey]   = useState<SortKey>("joined_at");
  const [sortDir, setSortDir]   = useState<SortDir>("desc");
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const [users, setUsers]     = useState<AdminUserRow[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchUsers = useCallback(async (
    f: FilterState, q: string, sk: SortKey, sd: SortDir, pg: number, ps: number,
  ) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    try {
      const params = buildParams(f, q, sk, sd, pg, ps);
      const res = await fetch(`/api/admin/users/search?${params}`, {
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error("fetch failed");
      const { users: rows, total: t } = await res.json();
      setUsers(rows ?? []);
      setTotal(t ?? 0);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setUsers([]);
        setTotal(0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchUsers(filters, search, sortKey, sortDir, page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced re-fetch when filters/search change → reset page
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPage(1);
      fetchUsers(filters, search, sortKey, sortDir, 1, pageSize);
    }, 500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, search]);

  // Immediate re-fetch when sort or pagination changes
  useEffect(() => {
    fetchUsers(filters, search, sortKey, sortDir, page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortKey, sortDir, page, pageSize]);

  function handleSort(key: SortKey) {
    const newDir =
      key === sortKey ? (sortDir === "asc" ? "desc" : "asc") :
      ["total_cvs","total_pdf_downloads","job_clicks","saved_jobs","stories","last_active","joined_at","years_experience","best_ats_score"].includes(key)
        ? "desc" : "asc";
    setSortKey(key);
    setSortDir(newDir);
    setPage(1);
  }

  async function handleExport(visibleCols: Set<string>) {
    const params = buildParams(filters, search, sortKey, sortDir, 1, 10000);
    try {
      const res = await fetch(`/api/admin/users/search?${params}`);
      const { users: all } = await res.json();
      downloadCsv(all ?? [], visibleCols);
    } catch {
      // silent — user will notice nothing downloaded
    }
  }

  const totalActive = countActiveFilters(filters);

  function handleToggleFilters() {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileOpen(true);
    } else {
      setDesktopOpen((v) => !v);
    }
  }

  const sidebar = (
    <FilterSidebar
      filters={filters}
      onChange={setFilters}
      totalActive={totalActive}
    />
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <span className="text-sm text-muted-foreground">{total.toLocaleString()} total</span>
      </div>

      {/* Mobile sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-80 p-0 flex flex-col">
          <SheetHeader className="px-4 py-3 border-b shrink-0">
            <SheetTitle className="text-sm font-semibold">Filters</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            {sidebar}
          </div>
        </SheetContent>
      </Sheet>

      {/* Layout */}
      <div className="flex gap-4 items-start">
        {desktopOpen && (
          <aside className="hidden md:block w-64 shrink-0 sticky top-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
            {sidebar}
          </aside>
        )}
        <div className="flex-1 min-w-0">
          <AdminUsersTable
            users={users}
            total={total}
            loading={loading}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(n: number) => { setPageSize(n); setPage(1); }}
            search={search}
            onSearchChange={(s: string) => setSearch(s)}
            onExport={handleExport}
            onToggleFilters={handleToggleFilters}
            filtersActive={totalActive}
          />
        </div>
      </div>
    </div>
  );
}

// ─── CSV helpers (moved here from users-table) ────────────────────────────────

import { resolveCountry } from "./country-data";

const ALL_CSV_COLS = [
  { key: "user_number",         label: "#" },
  { key: "name",                label: "Name" },
  { key: "email",               label: "Email" },
  { key: "plan",                label: "Plan" },
  { key: "joined_at",           label: "Joined" },
  { key: "last_active",         label: "Last Active" },
  { key: "signup_location",     label: "Signup Location" },
  { key: "cv_location",         label: "CV Location" },
  { key: "country",             label: "Country" },
  { key: "role",                label: "Role" },
  { key: "industry",            label: "Industry" },
  { key: "experience_level",    label: "Exp Level" },
  { key: "years_experience",    label: "Yrs Exp" },
  { key: "employment_status",   label: "Employment" },
  { key: "best_ats_score",      label: "Best ATS" },
  { key: "primary_goal",        label: "Primary Goal" },
  { key: "total_cvs",           label: "CVs" },
  { key: "total_pdf_downloads", label: "Downloads" },
  { key: "job_clicks",          label: "Job Clicks" },
  { key: "saved_jobs",          label: "Saved Jobs" },
  { key: "stories",             label: "Stories" },
  { key: "linkedin_url",        label: "LinkedIn" },
  { key: "github_url",          label: "GitHub" },
  { key: "portfolio_url",       label: "Portfolio" },
  { key: "phone",               label: "Phone" },
  { key: "cv_preview",          label: "CV Preview Link" },
];

function getCsvValue(u: AdminUserRow, key: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.thecvedge.com";
  switch (key) {
    case "user_number":       return String(u.user_number);
    case "name":              return u.full_name || "";
    case "email":             return u.email || "";
    case "plan":              return u.plan;
    case "joined_at":         return new Date(u.joined_at).toISOString().replace("T", " ").slice(0, 16) + " UTC";
    case "last_active":       return u.last_active ? new Date(u.last_active).toISOString().split("T")[0] : "";
    case "signup_location": {
      const rc = resolveCountry(u.signup_country_code, u.signup_country);
      return [u.signup_city, rc?.name ?? u.signup_country].filter(Boolean).join(", ");
    }
    case "cv_location":       return u.cv_location || "";
    case "country": {
      const rc = resolveCountry(u.signup_country_code, u.signup_country);
      return rc?.name ?? u.country ?? u.signup_country ?? "";
    }
    case "role":              return u.target_role || "";
    case "industry":          return u.industry || "";
    case "experience_level":  return u.experience_level || "";
    case "years_experience":  return u.years_experience != null ? String(u.years_experience) : "";
    case "employment_status": return u.employment_status || "";
    case "best_ats_score":    return u.best_ats_score != null ? String(u.best_ats_score) : "";
    case "primary_goal":      return u.primary_goal || "";
    case "total_cvs":         return String(u.total_cvs);
    case "total_pdf_downloads": return String(u.total_pdf_downloads);
    case "job_clicks":        return String(u.job_clicks);
    case "saved_jobs":        return String(u.saved_jobs);
    case "stories":           return String(u.stories);
    case "linkedin_url":      return u.linkedin_url || "";
    case "github_url":        return u.github_url || "";
    case "portfolio_url":     return u.portfolio_url || "";
    case "phone":             return u.phone || "";
    case "cv_preview":        return u.latest_cv_id ? `${origin}/api/admin/cv/${u.latest_cv_id}/pdf` : "";
    default: return "";
  }
}

function downloadCsv(rows: AdminUserRow[], visibleCols: Set<string>) {
  const cols = ALL_CSV_COLS.filter((c) => visibleCols.has(c.key));
  const header = cols.map((c) => `"${c.label}"`).join(",");
  const lines = [
    header,
    ...rows.map((u) =>
      cols.map((c) => `"${getCsvValue(u, c.key).replace(/"/g, '""')}"`).join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = `cvedge-users-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
