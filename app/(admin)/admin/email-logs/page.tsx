import { createAdminClient } from "@/lib/supabase/admin";
import type { Metadata } from "next";
import { EmailLogsTable, type EmailLogRow } from "./email-logs-table";

export const metadata: Metadata = { title: "Email Logs | CVEdge Admin" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; template?: string; page?: string }>;
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
    .select("id, to_email, template_name, subject, status, error, created_at", { count: "exact" })
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

  // Distinct templates for the filter dropdown. Sample the most recent 2k
  // sends — enough to cover every active template without scanning the full
  // table. Logs for retired templates drop off the list once they age out,
  // which is fine: the free-text search still finds them.
  const { data: templateRows } = await supabase
    .from("email_logs")
    .select("template_name")
    .order("created_at", { ascending: false })
    .limit(2000);
  const templates = Array.from(
    new Set((templateRows ?? []).map((r) => r.template_name).filter(Boolean))
  ).sort();

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
    />
  );
}
