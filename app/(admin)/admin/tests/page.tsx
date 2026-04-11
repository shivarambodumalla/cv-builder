import { createAdminClient } from "@/lib/supabase/admin";
import { TestsPageContent } from "./tests-page-content";

export const dynamic = "force-dynamic";

export default async function TestsPage() {
  const supabase = createAdminClient();

  const [{ data: testCases }, { data: testRuns }] = await Promise.all([
    supabase.from("test_cases").select("*").order("suite").order("name"),
    supabase
      .from("test_runs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <TestsPageContent testCases={testCases ?? []} testRuns={testRuns ?? []} />
  );
}
