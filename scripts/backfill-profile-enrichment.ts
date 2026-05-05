/**
 * One-time backfill: populate profile enrichment columns for all existing users.
 *
 * Reads each user's latest CV parsed_json and their best ATS score, then
 * writes the derived fields to profiles. Run once after migration 00064.
 *
 * Usage:  npx tsx scripts/backfill-profile-enrichment.ts
 */

/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { computeYearsOfExperience } from "../lib/resume/years-of-experience";
import type { ResumeContent } from "../lib/resume/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ── Inline copies of sync helpers (no Next.js deps) ──────────────────────────

const INDUSTRY_MAP: Record<string, string> = {
  "software engineer": "Technology", "software developer": "Technology",
  "frontend engineer": "Technology", "backend engineer": "Technology",
  "full stack": "Technology", "fullstack": "Technology",
  "devops": "Technology", "sre": "Technology", "platform engineer": "Technology",
  "data engineer": "Technology", "ml engineer": "Technology",
  "ai engineer": "Technology", "cloud engineer": "Technology",
  "mobile developer": "Technology", "ios developer": "Technology",
  "android developer": "Technology", "web developer": "Technology",
  "qa engineer": "Technology", "test engineer": "Technology",
  "security engineer": "Technology", "solutions architect": "Technology",
  "technical lead": "Technology", "tech lead": "Technology",
  "cto": "Technology", "vp engineering": "Technology",
  "product manager": "Product", "product owner": "Product",
  "program manager": "Product", "technical program manager": "Product",
  "data scientist": "Analytics", "data analyst": "Analytics",
  "business analyst": "Analytics", "business intelligence": "Analytics",
  "analytics engineer": "Analytics",
  "designer": "Design", "ux designer": "Design", "ui designer": "Design",
  "product designer": "Design", "graphic designer": "Design",
  "creative director": "Design",
  "marketing": "Marketing", "growth": "Marketing", "seo": "Marketing",
  "content strategist": "Marketing", "brand": "Marketing",
  "sales": "Sales", "account executive": "Sales", "account manager": "Sales",
  "business development": "Sales",
  "finance": "Finance", "financial analyst": "Finance", "accountant": "Finance",
  "cfo": "Finance", "investment": "Finance", "banking": "Finance",
  "hr": "HR", "recruiter": "HR", "talent": "HR", "people ops": "HR",
  "human resources": "HR",
  "operations": "Operations", "coo": "Operations", "supply chain": "Operations",
  "project manager": "Operations",
  "lawyer": "Legal", "attorney": "Legal", "legal": "Legal", "counsel": "Legal",
  "nurse": "Healthcare", "doctor": "Healthcare", "physician": "Healthcare",
  "healthcare": "Healthcare",
  "teacher": "Education", "professor": "Education", "educator": "Education",
  "ceo": "Executive", "president": "Executive", "chief": "Executive",
  "vice president": "Executive", "director": "Executive",
};

function inferIndustry(targetRole: string | null | undefined): string | null {
  if (!targetRole) return null;
  const lower = targetRole.toLowerCase();
  for (const [kw, industry] of Object.entries(INDUSTRY_MAP)) {
    if (lower.includes(kw)) return industry;
  }
  return null;
}

function inferExperienceLevel(years: number | null): string | null {
  if (years === null) return null;
  if (years < 2) return "early";
  if (years < 5) return "mid";
  if (years < 10) return "senior";
  return "expert";
}

function extractGithubUrl(content: ResumeContent): string | null {
  const website = content.contact?.website;
  if (website?.includes("github.com")) return website;
  for (const proj of content.projects?.items ?? []) {
    if (proj.url?.includes("github.com")) return proj.url;
  }
  return null;
}

function buildUpdates(content: ResumeContent) {
  const yearsExp = computeYearsOfExperience(content);
  const targetRole = content.targetTitle?.title?.trim() || null;
  const industry = inferIndustry(targetRole);
  const experienceLevel = inferExperienceLevel(yearsExp);
  const githubUrl = extractGithubUrl(content);
  const website = content.contact?.website;
  const portfolioUrl = !website?.includes("github.com") ? website || null : null;

  const updates: Record<string, unknown> = {
    latest_cv_parsed_json: content,
    cv_location: content.contact?.location?.trim() || null,
    phone: content.contact?.phone?.trim() || null,
    summary: content.summary?.content?.trim() || null,
    skills: (content.skills?.categories?.length ?? 0) > 0 ? content.skills.categories : null,
    certifications: (content.certifications?.items?.length ?? 0) > 0 ? content.certifications.items : null,
    education: (content.education?.items?.length ?? 0) > 0 ? content.education.items : null,
    years_experience: yearsExp,
    experience_level: experienceLevel,
  };

  if (targetRole) updates.target_role = targetRole;
  if (industry) updates.industry = industry;
  if (content.contact?.linkedin?.trim()) updates.linkedin_url = content.contact.linkedin.trim();
  if (githubUrl) updates.github_url = githubUrl;
  if (portfolioUrl) updates.portfolio_url = portfolioUrl;

  return updates;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Fetching latest CV per user…");

  // Fetch latest CV per user (ordered desc so first hit = latest)
  const { data: cvs, error: cvsErr } = await supabase
    .from("cvs")
    .select("id, user_id, parsed_json")
    .not("parsed_json", "is", null)
    .order("updated_at", { ascending: false });

  if (cvsErr) throw new Error(`Failed to fetch CVs: ${cvsErr.message}`);

  // Dedupe: keep only latest CV per user, skip orphaned rows with null user_id
  const latestByUser = new Map<string, { cvId: string; content: ResumeContent }>();
  for (const cv of cvs ?? []) {
    if (!cv.user_id || cv.user_id === "null") continue;
    if (!latestByUser.has(cv.user_id)) {
      latestByUser.set(cv.user_id, { cvId: cv.id, content: cv.parsed_json as ResumeContent });
    }
  }

  console.log(`Found ${latestByUser.size} users with CVs.`);

  // Fetch best ATS score per user
  const { data: atsRows } = await supabase
    .from("ats_reports")
    .select("cv_id, overall_score, score");

  // Map cv_id → user_id from our CV list
  const cvToUser = new Map<string, string>();
  for (const cv of cvs ?? []) cvToUser.set(cv.id, cv.user_id);

  const bestAts = new Map<string, number>();
  for (const row of atsRows ?? []) {
    const userId = cvToUser.get(row.cv_id);
    if (!userId) continue;
    const score = row.overall_score ?? row.score ?? 0;
    if (score > (bestAts.get(userId) ?? 0)) bestAts.set(userId, score);
  }

  // Process in batches to avoid overwhelming Supabase
  const BATCH = 50;
  const entries = Array.from(latestByUser.entries());
  let success = 0;
  let failed = 0;

  for (let i = 0; i < entries.length; i += BATCH) {
    const batch = entries.slice(i, i + BATCH);

    await Promise.all(
      batch.map(async ([userId, { content }]) => {
        try {
          const updates = buildUpdates(content);
          const ats = bestAts.get(userId);
          if (ats) updates.best_ats_score = ats;

          const { error } = await supabase
            .from("profiles")
            .update(updates)
            .eq("id", userId);

          if (error) {
            console.error(`  ✗ ${userId}: ${error.message}`);
            failed++;
          } else {
            success++;
          }
        } catch (err) {
          console.error(`  ✗ ${userId}:`, err);
          failed++;
        }
      }),
    );

    console.log(`  Processed ${Math.min(i + BATCH, entries.length)} / ${entries.length}…`);
  }

  // Users with no CVs — still backfill best_ats_score if they have ATS reports
  const usersWithoutCv = new Set<string>();
  for (const [userId] of bestAts) {
    if (!latestByUser.has(userId)) usersWithoutCv.add(userId);
  }

  if (usersWithoutCv.size > 0) {
    console.log(`Backfilling best_ats_score for ${usersWithoutCv.size} users without CVs…`);
    await Promise.all(
      Array.from(usersWithoutCv).map(async (userId) => {
        const { error } = await supabase
          .from("profiles")
          .update({ best_ats_score: bestAts.get(userId) })
          .eq("id", userId);
        if (error) console.error(`  ✗ ${userId}: ${error.message}`);
      }),
    );
  }

  console.log(`\nDone. ${success} updated, ${failed} failed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
