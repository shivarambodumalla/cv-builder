/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TEST_CASES = [
  // ATS Analysis Flow
  { suite: "ATS Analysis Flow", name: "ATS tab loads", description: "Verify ATS tab renders with score or analyse button", spec_file: "tests/e2e/ats-flow.spec.ts" },
  { suite: "ATS Analysis Flow", name: "Fix All button visibility check", description: "Check Fix All button state based on ATS score", spec_file: "tests/e2e/ats-flow.spec.ts" },
  // Job Match Flow
  { suite: "Job Match Flow", name: "Job match tab loads", description: "Verify Job Match tab renders with JD input or results", spec_file: "tests/e2e/job-match-flow.spec.ts" },
  // Billing Gate Flow
  { suite: "Billing Gate Flow", name: "Upgrade modal shows for ATS limit", description: "Verify upgrade modal shows when ATS scan limit is reached", spec_file: "tests/e2e/billing-gate.spec.ts" },
  // Dashboard Flow
  { suite: "Dashboard Flow", name: "Dashboard loads", description: "Verify dashboard renders with create button or content", spec_file: "tests/e2e/dashboard.spec.ts" },
  { suite: "Dashboard Flow", name: "Dashboard shows test resume", description: "Verify seeded test resume card is visible", spec_file: "tests/e2e/dashboard.spec.ts" },
];

async function seed() {
  // Clear existing test cases first
  const { error: deleteError } = await supabase.from("test_cases").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (deleteError) {
    console.error("Failed to clear test_cases:", deleteError.message);
  } else {
    console.log("✓ Cleared existing test cases");
  }

  // Insert fresh
  const rows = TEST_CASES.map((tc) => ({
    ...tc,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("test_cases").insert(rows);
  if (error) {
    console.error("Insert error:", error.message);
  } else {
    console.log(`✓ Inserted ${rows.length} test cases`);
  }

  // Verify
  const { data } = await supabase
    .from("test_cases")
    .select("suite, name, spec_file, is_active")
    .order("suite")
    .order("name");

  console.log("\nTest cases in database:");
  console.table(data);
}

seed().catch(console.error);
