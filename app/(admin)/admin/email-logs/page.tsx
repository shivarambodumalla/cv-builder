import { createAdminClient } from "@/lib/supabase/admin";
import type { Metadata } from "next";
import { EmailLogsTable, type EmailLogRow, type EngagementSummaryRow } from "./email-logs-table";

export const metadata: Metadata = { title: "Email Logs | CVEdge Admin" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;
const ENGAGEMENT_WINDOW_DAYS = 30;

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; template?: string; page?: string }>;
}

interface EngagementSampleRow {
  template_name: string | null;
  status: string | null;
  delivered_at: string | null;
  open_count: number | null;
  click_count: number | null;
}

// Build per-template aggregates from the most recent N days of email_logs.
// Counts a row as "opened" / "clicked" once regardless of repeat events —
// what we care about is unique reach, not total fires.
function summarizeEngagement(rows: EngagementSampleRow[]): EngagementSummaryRow[] {
  const map = new Map<string, EngagementSummaryRow>();
  for (const r of rows) {
    if (!r.template_name) continue;
    if (r.status !== "sent") continue;
    let agg = map.get(r.template_name);
    if (!agg) {
      agg = { template_name: r.template_name, sent: 0, delivered: 0, opened: 0, clicked: 0 };
      map.set(r.template_name, agg);
    }
    agg.sent += 1;
    if (r.delivered_at) agg.delivered += 1;
    if ((r.open_count ?? 0) > 0) agg.opened += 1;
    if ((r.click_count ?? 0) > 0) agg.clicked += 1;
  }
  return Array.from(map.values()).sort((a, b) => b.sent - a.sent);
}

export default async function EmailLogsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const query = (sp.q ?? "").trim();
  const status = (sp.status ?? "").trim();
  const template = (sp.template ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const supabase = createAdminClient();

  let q = supabase
    .from("email_logs")
    .select(
      "id, to_email, template_name, subject, status, error, created_at, delivered_at, opened_at, open_count, clicked_at, click_count",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (status) q = q.eq("status", status);
  if (template) q = q.eq("template_name", template);
  if (query) {
    // Escape PostgREST reserved chars in `or` filter values.
    const safe = query.replace(/[,()]/g, " ").trim();
    if (safe) q = q.or(`to_email.ilike.%${safe}%,subject.ilike.%${safe}%`);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, count } = await q.range(from, to);

  // Distinct templates for the filter dropdown + engagement aggregates: pull
  // a single window of recent sends and derive both. Sampling the last
  // ENGAGEMENT_WINDOW_DAYS keeps the rates current and avoids dragging in
  // retired templates.
  const since = new Date(Date.now() - ENGAGEMENT_WINDOW_DAYS * 86400 * 1000).toISOString();
  const { data: engagementRows } = await supabase
    .from("email_logs")
    .select("template_name, status, delivered_at, open_count, click_count")
    .gte("created_at", since)
    .limit(20000);

  const templates = Array.from(
    new Set((engagementRows ?? []).map((r) => r.template_name).filter(Boolean))
  ).sort() as string[];

  const engagement = summarizeEngagement((engagementRows ?? []) as EngagementSampleRow[]);

  return (
    <EmailLogsTable
      logs={(data ?? []) as EmailLogRow[]}
      total={count ?? 0}
      page={page}
      pageSize={PAGE_SIZE}
      templates={templates}
      query={query}
      status={status}
      template={template}
      engagement={engagement}
      engagementWindowDays={ENGAGEMENT_WINDOW_DAYS}
    />
  );
}
