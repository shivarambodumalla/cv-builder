import { createAdminClient } from "@/lib/supabase/admin";
import { RunDetailContent } from "./run-detail-content";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  const supabase = createAdminClient();

  const [{ data: run }, { data: results }] = await Promise.all([
    supabase.from("test_runs").select("*").eq("id", runId).single(),
    supabase
      .from("test_results")
      .select("*")
      .eq("run_id", runId)
      .order("suite")
      .order("test_name"),
  ]);

  if (!run) notFound();

  return <RunDetailContent run={run} results={results ?? []} />;
}
