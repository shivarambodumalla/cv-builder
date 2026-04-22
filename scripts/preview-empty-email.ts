/**
 * Render the empty-match retention email to tmp/empty-email-preview.html
 * so you can open it in a browser without needing DB columns in place yet.
 *
 *   npx tsx scripts/preview-empty-email.ts
 */

import { render } from "@react-email/render";
import { writeFileSync, mkdirSync } from "fs";
import { WeeklyJobsEmptyEmail } from "../components/emails/weekly-jobs-empty-email";
import { getAdjacentRoles, getRotatingTip, getAtsMessage } from "../lib/email/jobs-email-helpers";
import type { ResumeContent } from "../lib/resume/types";

const sampleCv = {
  targetTitle: { title: "Product Manager" },
  experience: { items: [{ role: "Product Manager" }] },
} as ResumeContent;

const ats = getAtsMessage(72);
const tip = getRotatingTip("sample-user-id");
const adj = getAdjacentRoles(sampleCv);
const adjacentRoles: [string, string, string] = [
  adj[0] || "Senior Specialist",
  adj[1] || "Team Lead",
  adj[2] || "Consultant",
];

const APP_URL = "https://www.thecvedge.com";

async function main() {
  const html = await render(
    WeeklyJobsEmptyEmail({
      firstName: "Siva",
      targetTitle: "Product Manager",
      atsScore: 72,
      atsLabel: ats.label,
      atsMessage: ats.message,
      rotatingTip: tip,
      adjacentRoles,
      improveScoreUrl: `${APP_URL}/dashboard`,
      browseAdjacentUrl: `${APP_URL}/jobs`,
      updatePreferencesUrl: `${APP_URL}/settings`,
      viewMatchesUrl: `${APP_URL}/jobs`,
      unsubscribeUrl: `${APP_URL}/unsubscribe`,
      preferencesUrl: `${APP_URL}/settings`,
      appUrl: APP_URL,
    })
  );

  mkdirSync("tmp", { recursive: true });
  const path = "tmp/empty-email-preview.html";
  writeFileSync(path, html, "utf-8");
  console.log(`✓ wrote ${path}`);
  console.log(`  open with: open ${path}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
