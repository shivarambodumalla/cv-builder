"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";

export interface EmailLogRow {
  id: string;
  to_email: string;
  template_name: string;
  subject: string;
  status: string;
  error: string | null;
  created_at: string;
  delivered_at: string | null;
  opened_at: string | null;
  open_count: number;
  clicked_at: string | null;
  click_count: number;
}

export interface EngagementSummaryRow {
  template_name: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
}

interface Props {
  logs: EmailLogRow[];
  total: number;
  page: number;
  pageSize: number;
  templates: string[];
  query: string;
  status: string;
  template: string;
  engagement: EngagementSummaryRow[];
  engagementWindowDays: number;
}

function pct(numerator: number, denominator: number): string {
  if (denominator <= 0) return "–";
  return `${Math.round((numerator / denominator) * 100)}%`;
}

const dash = <span className="text-muted-foreground/60">–</span>;

// Search, filters and paging run on the server (URL params), so the table
// only renders the current page: no client sort or search.
const COLUMNS: DataTableColumn<EmailLogRow>[] = [
  { key: "to", header: "To", className: "font-medium max-w-[200px] truncate", cell: (log) => log.to_email },
  { key: "template", header: "Template", className: "whitespace-nowrap", cell: (log) => log.template_name },
  { key: "subject", header: "Subject", className: "text-muted-foreground max-w-[300px] truncate", cell: (log) => log.subject },
  {
    key: "status",
    header: "Status",
    cell: (log) => (
      <span
        className={`text-xs px-1.5 py-0.5 rounded ${log.status === "sent" ? "bg-success/15 text-success" : "bg-error/15 text-error"}`}
        title={log.error || undefined}
      >
        {log.status}
      </span>
    ),
  },
  {
    key: "delivered",
    header: <span title="Delivered by Resend">Delivered</span>,
    className: "whitespace-nowrap",
    cell: (log) => <span title={log.delivered_at ?? undefined}>{log.delivered_at ? <span className="text-success">✓</span> : dash}</span>,
  },
  {
    key: "opens",
    header: <span title="Opens (count)">Opens</span>,
    className: "whitespace-nowrap tabular-nums",
    cell: (log) => <span title={log.opened_at ?? undefined}>{log.open_count > 0 ? log.open_count : dash}</span>,
  },
  {
    key: "clicks",
    header: <span title="Link clicks (count)">Clicks</span>,
    className: "whitespace-nowrap tabular-nums",
    cell: (log) => <span title={log.clicked_at ?? undefined}>{log.click_count > 0 ? log.click_count : dash}</span>,
  },
  {
    key: "sent",
    header: "Sent",
    className: "text-muted-foreground whitespace-nowrap",
    cell: (log) => new Date(log.created_at).toLocaleString(),
  },
];

export function EmailLogsTable({
  logs, total, page, pageSize, templates, query, status, template,
  engagement, engagementWindowDays,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [input, setInput] = useState(query);

  // Debounce search input → URL
  useEffect(() => {
    if (input === query) return;
    const t = setTimeout(() => {
      const sp = new URLSearchParams(params);
      if (input) sp.set("q", input); else sp.delete("q");
      sp.delete("page"); // reset to page 1 on new search
      startTransition(() => router.replace(`?${sp.toString()}`, { scroll: false }));
    }, 350);
    return () => clearTimeout(t);
  }, [input, query, params, router]);

  function setParam(key: string, value: string) {
    const sp = new URLSearchParams(params);
    if (value) sp.set(key, value); else sp.delete(key);
    if (key !== "page") sp.delete("page");
    startTransition(() => router.replace(`?${sp.toString()}`, { scroll: false }));
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const hasFilters = !!(query || status || template);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Email Logs</h2>
        <p className="text-sm text-muted-foreground">
          {pending ? "Loading…" : `${from}–${to} of ${total.toLocaleString()}`}
        </p>
      </div>

      {engagement.length > 0 && (
        <div className="rounded-md border bg-muted/30">
          <div className="flex flex-wrap items-center justify-between gap-1 px-3 py-2 border-b">
            <h2 className="text-sm font-semibold">Engagement: last {engagementWindowDays} days</h2>
            <p className="text-[11px] text-muted-foreground">
              Open/click rates inflated by image pre-fetch (Apple Mail). Read directionally.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="px-3 py-1.5 font-medium">Template</th>
                  <th className="px-3 py-1.5 font-medium text-right">Sent</th>
                  <th className="px-3 py-1.5 font-medium text-right">Delivered</th>
                  <th className="px-3 py-1.5 font-medium text-right">Open rate</th>
                  <th className="px-3 py-1.5 font-medium text-right">Click rate</th>
                </tr>
              </thead>
              <tbody>
                {engagement.map((r) => (
                  <tr key={r.template_name} className="border-t">
                    <td className="px-3 py-1.5 font-medium">{r.template_name}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{r.sent.toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">
                      {pct(r.delivered, r.sent)}
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums">
                      <span className="font-medium">{pct(r.opened, r.delivered || r.sent)}</span>
                      <span className="text-muted-foreground"> ({r.opened.toLocaleString()})</span>
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums">
                      <span className="font-medium">{pct(r.clicked, r.delivered || r.sent)}</span>
                      <span className="text-muted-foreground"> ({r.clicked.toLocaleString()})</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search by recipient or subject…"
            className="pl-8 h-11 sm:h-9"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setParam("status", e.target.value)}
          className="h-11 rounded-md border bg-background px-2 text-sm sm:h-9"
        >
          <option value="">All statuses</option>
          <option value="sent">Sent</option>
          <option value="error">Error</option>
        </select>

        <select
          value={template}
          onChange={(e) => setParam("template", e.target.value)}
          className="h-11 rounded-md border bg-background px-2 text-sm max-w-[220px] sm:h-9"
        >
          <option value="">All templates</option>
          {templates.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-11 sm:h-9"
            onClick={() => {
              setInput("");
              startTransition(() => router.replace("?", { scroll: false }));
            }}
          >
            <X className="h-3.5 w-3.5 mr-1" /> Clear
          </Button>
        )}
      </div>

      <DataTable
        rows={logs}
        columns={COLUMNS}
        rowKey={(log) => log.id}
        paginate={false}
        emptyText={hasFilters ? "No emails match these filters" : "No emails sent yet"}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-11 sm:h-8"
              disabled={page <= 1 || pending}
              onClick={() => setParam("page", String(page - 1))}
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-11 sm:h-8"
              disabled={page >= totalPages || pending}
              onClick={() => setParam("page", String(page + 1))}
            >
              Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
