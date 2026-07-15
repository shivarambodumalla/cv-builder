// Reset mentorship visitor/click counters (leads and activities are kept).
// Run: npx tsx scripts/reset-mentorship-counters.ts
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const { createAdminClient } = await import("../lib/supabase/admin");
  const admin = createAdminClient();

  const { count: viewCount } = await admin
    .from("mentorship_visitor_views")
    .select("*", { count: "exact", head: true });

  const { error: viewError } = await admin
    .from("mentorship_visitor_views")
    .delete()
    .gte("view_date", "1970-01-01");
  if (viewError) throw new Error(`visitor_views delete failed: ${viewError.message}`);
  console.log(`mentorship_visitor_views: deleted ${viewCount ?? 0} rows`);

  // Clicks table only exists after migration 00072 — skip cleanly if missing
  const { count: clickCount, error: clickCountError } = await admin
    .from("mentorship_cta_clicks")
    .select("*", { count: "exact", head: true });
  if (clickCountError) {
    console.log(`mentorship_cta_clicks: skipped (${clickCountError.message})`);
    return;
  }
  const { error: clickError } = await admin
    .from("mentorship_cta_clicks")
    .delete()
    .gte("created_at", "1970-01-01");
  if (clickError) throw new Error(`cta_clicks delete failed: ${clickError.message}`);
  console.log(`mentorship_cta_clicks: deleted ${clickCount ?? 0} rows`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
