"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";

export interface EmailLogRow {
  id: string;
  to_email: string;
  template_name: string;
  subject: string;
  status: string;
  error: string | null;
  created_at: string;
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
}

export function EmailLogsTable({ logs, total, page, pageSize, templates, query, status, template }: Props) {
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
        <h1 className="text-2xl font-bold">Email Logs</h1>
        <p className="text-sm text-muted-foreground">
          {pending ? "Loading…" : `${from}–${to} of ${total.toLocaleString()}`}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search by recipient or subject…"
            className="pl-8 h-9"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setParam("status", e.target.value)}
          className="h-9 rounded-md border bg-background px-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="sent">Sent</option>
          <option value="error">Error</option>
        </select>

        <select
          value={template}
          onChange={(e) => setParam("template", e.target.value)}
          className="h-9 rounded-md border bg-background px-2 text-sm max-w-[220px]"
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
            className="h-9"
            onClick={() => {
              setInput("");
              startTransition(() => router.replace("?", { scroll: false }));
            }}
          >
            <X className="h-3.5 w-3.5 mr-1" /> Clear
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-muted-foreground">
              <th className="px-3 py-2 font-medium">To</th>
              <th className="px-3 py-2 font-medium">Template</th>
              <th className="px-3 py-2 font-medium">Subject</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium whitespace-nowrap">Sent</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-3 py-2 font-medium max-w-[200px] truncate">{log.to_email}</td>
                <td className="px-3 py-2 whitespace-nowrap">{log.template_name}</td>
                <td className="px-3 py-2 text-muted-foreground max-w-[300px] truncate">{log.subject}</td>
                <td className="px-3 py-2">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${log.status === "sent" ? "bg-success/15 text-success" : "bg-error/15 text-error"}`}
                    title={log.error || undefined}
                  >
                    {log.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-muted-foreground">
                  {hasFilters ? "No emails match these filters" : "No emails sent yet"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              disabled={page <= 1 || pending}
              onClick={() => setParam("page", String(page - 1))}
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
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
