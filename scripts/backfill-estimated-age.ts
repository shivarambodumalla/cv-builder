/**
 * Backfill profiles.estimated_birth_year / estimated_age_basis from each
 * user's latest CV. New and edited CVs are covered by syncProfileFromCv; this
 * is for everyone who saved a CV before migration 00083. Writes only those two
 * columns.
 *
 * Usage:
 *   npx tsx scripts/backfill-estimated-age.ts --dry-run   # counts by basis, no writes
 *   npx tsx scripts/backfill-estimated-age.ts
 */

/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { estimateBirthYear } from "../lib/resume/estimated-age";
import type { ResumeContent } from "../lib/resume/types";

const DRY_RUN = process.argv.includes("--dry-run");
const PAGE = 1000;
const BATCH = 50;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function latestCvPerUser(): Promise<Map<string, ResumeContent>> {
  const latest = new Map<string, ResumeContent>();
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("cvs")
      .select("user_id, parsed_json")
      .not("parsed_json", "is", null)
      .not("user_id", "is", null)
      .order("updated_at", { ascending: false })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`Failed to fetch CVs: ${error.message}`);
    for (const cv of data ?? []) {
      if (!latest.has(cv.user_id)) latest.set(cv.user_id, cv.parsed_json as ResumeContent);
    }
    if (!data || data.length < PAGE) break;
  }
  return latest;
}

async function main() {
  const latest = await latestCvPerUser();
  console.log(`${latest.size} users with a CV.${DRY_RUN ? " Dry run: nothing is written." : ""}`);

  const byBasis = new Map<string, number>();
  const ages: number[] = [];
  const updates: { id: string; estimated_birth_year: number | null; estimated_age_basis: string | null }[] = [];
  const thisYear = new Date().getUTCFullYear();

  for (const [userId, content] of latest) {
    const estimate = estimateBirthYear(content);
    const key = estimate?.basis ?? "none";
    byBasis.set(key, (byBasis.get(key) ?? 0) + 1);
    if (estimate) ages.push(thisYear - estimate.birthYear);
    updates.push({
      id: userId,
      estimated_birth_year: estimate?.birthYear ?? null,
      estimated_age_basis: estimate?.basis ?? null,
    });
  }

  console.log("\nBy basis:");
  for (const [basis, n] of [...byBasis].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${basis.padEnd(16)} ${n}`);
  }
  if (ages.length > 0) {
    ages.sort((a, b) => a - b);
    const median = ages[Math.floor(ages.length / 2)];
    console.log(`\nEstimated ages: min ${ages[0]}, median ${median}, max ${ages[ages.length - 1]}`);
  }
  if (DRY_RUN) return;

  let ok = 0;
  let failed = 0;
  for (let i = 0; i < updates.length; i += BATCH) {
    await Promise.all(
      updates.slice(i, i + BATCH).map(async ({ id, ...fields }) => {
        const { error } = await supabase.from("profiles").update(fields).eq("id", id);
        if (error) {
          failed++;
          console.error(`  ✗ ${id}: ${error.message}`);
        } else {
          ok++;
        }
      }),
    );
  }
  console.log(`\nDone. ${ok} updated, ${failed} failed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
