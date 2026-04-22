/**
 * Send a test weekly-jobs email.
 *
 * Usage:
 *   npx tsx scripts/send-test-weekly-jobs.ts [email] [--force-sample] [--empty]
 *
 * Behavior:
 *   - Resolves user by email (defaults to ADMIN_EMAIL first entry)
 *   - Uses their latest CV for matches; sends the empty-match template if no matches
 *   - --force-sample: always send sample-data main template (for design review)
 *   - --empty: force the empty-match retention template (for design review)
 *   - Sends to the same email; bypasses duplicate-send guard via overrideTo
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { createAdminClient } from "../lib/supabase/admin";
import { sendWeeklyJobsEmail } from "../lib/email/weekly-jobs";

async function main() {
  const argEmail = process.argv[2];
  const adminEmail = (process.env.ADMIN_EMAIL || "").split(",")[0]?.trim();
  const targetEmail = argEmail || adminEmail;

  if (!targetEmail) {
    console.error("No email provided and ADMIN_EMAIL not set");
    process.exit(1);
  }

  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("id, email")
    .ilike("email", targetEmail)
    .maybeSingle();

  if (error) {
    console.error("Profile lookup failed:", error.message);
    process.exit(1);
  }

  if (!profile) {
    console.error(`No profile found for email: ${targetEmail}`);
    console.error("Tip: sign up with this email first, or pass --force-sample with a different target.");
    process.exit(1);
  }

  console.log(`→ sending to ${profile.email} (user ${profile.id})`);

  const forceSample = process.argv.includes("--force-sample");
  const forceEmpty = process.argv.includes("--empty");

  const result = await sendWeeklyJobsEmail(profile.id, {
    forceSample,
    overrideTo: profile.email, // bypasses duplicate-send guard for test flows
    template: forceEmpty ? "jobs_weekly_empty" : undefined,
  });

  console.log("✓ result:", result);
}

main().catch((err) => {
  console.error("✗ failed:", err);
  process.exit(1);
});
