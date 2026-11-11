"use client";

import { useId, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  /** Makes the header clickable; nulls sort last in both directions. */
  sortValue?: (row: T) => string | number | null | undefined;
  align?: "left" | "right" | "center";
  /** Extra classes for this column's th and td (widths, nowrap…). */
  className?: string;
}

type SortDir = "asc" | "desc";

const ALIGN: Record<NonNullable<DataTableColumn<unknown>["align"]>, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

/**
 * The one admin table: optional client search over chosen fields, sort by
 * clicking a header, pagination (25/50/100) and an empty state. It scrolls
 * sideways inside its own container so the page never does, and rows are at
 * least 44px tall on phones.
 *
 * Server-paginated tables pass `paginate={false}` and render their own pager.
 */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  searchFields,
  searchPlaceholder = "Search…",
  emptyText = "Nothing here yet.",
  loading = false,
  toolbar,
  paginate = true,
  pageSizes = [25, 50, 100],
  initialSort,
  rowClassName,
  className,
}: {
  rows: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string;
  /** Values the search box matches against (case-insensitive). No search box without it. */
  searchFields?: (row: T) => (string | null | undefined)[];
  searchPlaceholder?: string;
  emptyText?: React.ReactNode;
  /** Shows a spinner instead of the empty text while the first load runs. */
  loading?: boolean;
  /** Filters or buttons shown beside the search box. */
  toolbar?: React.ReactNode;
  paginate?: boolean;
  pageSizes?: number[];
  initialSort?: { key: string; dir: SortDir };
  rowClassName?: (row: T) => string | undefined;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: SortDir } | null>(initialSort ?? null);
  const [pageSize, setPageSize] = useState(pageSizes[0]);
  const [page, setPage] = useState(0);
  const pageSizeId = useId();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !searchFields) return rows;
    return rows.filter((r) => searchFields(r).some((v) => v?.toLowerCase().includes(q)));
  }, [rows, query, searchFields]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return filtered;
    const get = col.sortValue;
    const sign = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      if (va == null || va === "") return vb == null || vb === "" ? 0 : 1;
      if (vb == null || vb === "") return -1;
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * sign;
      return String(va).localeCompare(String(vb), undefined, { numeric: true }) * sign;
    });
  }, [filtered, sort, columns]);

  const pageCount = paginate ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const current = Math.min(page, pageCount - 1);
  const visible = paginate ? sorted.slice(current * pageSize, (current + 1) * pageSize) : sorted;

  function toggleSort(key: string) {
    setPage(0);
    setSort((s) => (s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }

  const showPager = paginate && sorted.length > pageSizes[0];

  return (
    <div className={cn("space-y-3", className)}>
      {(searchFields || toolbar) && (
        <div className="flex flex-wrap items-center gap-2">
          {searchFields && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="h-11 w-full rounded-md border bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring sm:h-9"
              />
            </div>
          )}
          {toolbar}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
              {columns.map((col) => {
                const active = sort?.key === col.key;
                const align = ALIGN[col.align ?? "left"];
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                    className={cn("px-3 py-2 font-medium whitespace-nowrap", align, col.className)}
                  >
                    {col.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className={cn(
                          "inline-flex min-h-[44px] items-center gap-1 hover:text-foreground sm:min-h-0",
                          active && "text-foreground",
                        )}
                      >
                        {col.header}
                        {active && (sort.dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-10 text-center text-muted-foreground">
                  {loading ? (
                    <Loader2 className="inline h-5 w-5 animate-spin" aria-label="Loading" />
                  ) : query && rows.length > 0 ? (
                    "No rows match your search."
                  ) : (
                    emptyText
                  )}
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr key={rowKey(row)} className={cn("h-11 border-b last:border-0 hover:bg-muted/30 sm:h-auto", rowClassName?.(row))}>
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-3 py-2", ALIGN[col.align ?? "left"], col.className)}>
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPager && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="tabular-nums">
            {current * pageSize + 1}–{Math.min((current + 1) * pageSize, sorted.length)} of {sorted.length.toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor={pageSizeId}>Rows per page</label>
            <select
              id={pageSizeId}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              className="h-11 rounded-md border bg-background px-2 text-xs sm:h-8"
            >
              {pageSizes.map((n) => (
                <option key={n} value={n}>{n} / page</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setPage(current - 1)}
              disabled={current === 0}
              aria-label="Previous page"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border hover:bg-muted disabled:opacity-40 sm:h-8 sm:w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage(current + 1)}
              disabled={current >= pageCount - 1}
              aria-label="Next page"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border hover:bg-muted disabled:opacity-40 sm:h-8 sm:w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
