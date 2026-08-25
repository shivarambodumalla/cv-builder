// Repair blog metadata flagged in the second AdSense "low value content" review.
//
// Two problems, both visible to a human reviewer on the first page they open:
//
//   1. Tag spam. 49 posts carried 240 distinct tags — an average of five each,
//      with 31 posts over six. Most are Hashnode import residue, including
//      outright typos ("resime", "free-reume", "free-resume-nulder"), three
//      spellings of the same tag on one post ("atsoptimization",
//      "ats-optimization", "ats-optimisation"), irrelevant stuffing
//      ("scholarship-resume-tips" on an AI-tooling post), and one 130-character
//      tag ending "eventbeep-beep-platform". Tags render as chips on the post
//      and are emitted as BlogPosting.keywords in JSON-LD, so this reads as
//      keyword stuffing to both a reviewer and a crawler.
//
//   2. Blank excerpts. 23 of 49 posts had an empty `brief`, so their cards on
//      /blog rendered with no description at all.
//
// This script replaces the tag vocabulary with a controlled set of at most
// three tags per post, and writes a real excerpt for every post missing one.
//
// Run: npx tsx scripts/fix-blog-metadata.ts
//      npx tsx scripts/fix-blog-metadata.ts --dry
//      npx tsx scripts/fix-blog-metadata.ts --restore <backup-file.json>
import { createAdminClient } from "../lib/supabase/admin";
import * as dotenv from "dotenv";
import { writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
dotenv.config({ path: ".env.local" });

const DRY = process.argv.includes("--dry");
const RESTORE_IDX = process.argv.indexOf("--restore");

const BACKUP_PATH = join(
  process.cwd(),
  `blog-metadata-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
);

/**
 * The whole tag vocabulary. Eleven readable labels replacing 240 slugs. Kept
 * deliberately small: a tag is only useful if it groups posts, and a tag used
 * once is decoration. Displayed verbatim as the chip label.
 */
const TAGS = {
  ats: "ATS",
  writing: "Resume Writing",
  format: "CV Format",
  keywords: "Keywords",
  jobSearch: "Job Search",
  roleGuide: "Role Guides",
  tools: "Tool Comparison",
  gulf: "Gulf Careers",
  design: "Product Design",
  salary: "Salary",
  interview: "Interview Prep",
} as const;

const T = TAGS;

/** Canonical tags per post. Max three, most specific first. */
const POST_TAGS: Record<string, string[]> = {
  // ─── ATS mechanics ─────────────────────────────────────────────────────────
  "how-ats-filters-resumes": [T.ats, T.jobSearch],
  "what-is-ats-software-and-how-does-it-work": [T.ats],
  "why-your-cv-never-reaches-a-human-recruiter": [T.ats, T.jobSearch],
  "your-cv-is-failing-before-a-human-sees-it-here-s-why": [T.ats, T.format],
  "why-you-re-not-hearing-back-after-applying": [T.ats, T.jobSearch],
  "why-am-i-not-getting-interviews": [T.jobSearch, T.ats],
  "how-to-get-past-the-ats": [T.ats, T.keywords, T.format],
  "how-to-increase-your-ats-score-from-60-to-90": [T.ats, T.writing],
  "free-ats-checker-how-to-check-your-cv-score-in-2026": [T.ats, T.tools],
  "how-recruiters-really-read-your-resume-backed-by-data": [T.jobSearch, T.writing],

  // ─── Format & writing ──────────────────────────────────────────────────────
  "ats-resume-format-what-actually-works-in-2026": [T.format, T.ats],
  "best-resume-format-for-ats-templates-that-actually-work": [T.format, T.ats],
  "resume-vs-cv-what-recruiters-actually-expect-in-2026": [T.format, T.writing],
  "how-to-write-resume-bullets-that-pass-ats": [T.writing, T.ats],
  "how-to-write-resume-bullet-points-that-show-impact-with-examples": [T.writing],
  "resume-keywords-that-get-you-hired": [T.keywords, T.ats],
  "how-to-tailor-your-cv-for-a-job-description": [T.keywords, T.jobSearch],
  "common-resume-mistakes-that-cost-you-interviews-and-how-to-fix-them": [T.writing, T.format],

  // ─── Tool comparisons ──────────────────────────────────────────────────────
  "best-resume-builder-2026": [T.tools],
  "best-free-resume-checker-tools-in-2026": [T.tools, T.ats],
  "zety-alternative-free-resume-builder": [T.tools],
  "resume-io-alternative": [T.tools],
  "jobscan-alternative-the-best-free-ats-checker-in-2026": [T.tools, T.ats],
  "ai-resume-builder-vs-manual": [T.tools, T.writing],

  // ─── Role guides ───────────────────────────────────────────────────────────
  "software-engineer-resume-guide-2026": [T.roleGuide, T.writing],
  "front-end-developer-resume-guide-2026": [T.roleGuide, T.writing],
  "back-end-developer-resume-guide-2026": [T.roleGuide, T.writing],
  "full-stack-developer-resume-guide-2026": [T.roleGuide, T.writing],
  "devops-engineer-resume-guide-2026": [T.roleGuide, T.writing],
  "data-scientist-resume-guide-2026": [T.roleGuide, T.keywords],
  "cybersecurity-analyst-resume-guide-2026": [T.roleGuide, T.writing],
  "qa-engineer-resume-guide-2026": [T.roleGuide, T.writing],
  "ux-designer-resume-guide-2026": [T.roleGuide, T.design],
  "product-manager-resume-guide-2026-ats-keywords-examples-free-templates": [T.roleGuide, T.keywords],
  "project-manager-resume-guide-2026": [T.roleGuide, T.writing],
  "business-analyst-resume-guide-2026": [T.roleGuide, T.writing],
  "marketing-manager-resume-guide-2026": [T.roleGuide, T.writing],
  "financial-analyst-resume-guide-2026": [T.roleGuide, T.writing],
  "hr-manager-resume-guide-2026": [T.roleGuide, T.writing],
  "scrum-master-resume-guide-2026": [T.roleGuide, T.writing],

  // ─── Gulf market ───────────────────────────────────────────────────────────
  "uae-resume-format-2026": [T.gulf, T.format],
  "dubai-cv-format-for-indian-professionals": [T.gulf, T.format],
  "saudi-arabia-cv-format-guide-2026": [T.gulf, T.format],

  // ─── Retired by expand-thin-blog-posts-2.ts ────────────────────────────────
  // Kept in the map so this script covers every published row and its "no
  // entry in POST_TAGS" warning stays meaningful.
  "ats-resume-gude-2026": [T.ats, T.format],
  "how-to-get-past-the-ats-in-2026-complete-resume-optimization-guide": [T.ats, T.keywords],
  "how-to-tailor-your-resume-for-every-job-application-step-by-step-guide": [T.keywords, T.jobSearch],

  // ─── Product design track ──────────────────────────────────────────────────
  "ai-product-designer-salary-guide": [T.design, T.salary],
  "product-design-portfolio-review-checklist": [T.design, T.jobSearch],
  "how-much-does-a-product-design-mentor-cost": [T.design, T.salary],
};

/**
 * Excerpts for the 23 posts that had none. Written to describe what the article
 * actually argues, not to repeat the title — these render as the card text on
 * /blog and, where seo_description is missing, as the meta description.
 */
const BRIEFS: Record<string, string> = {
  "ats-resume-format-what-actually-works-in-2026":
    "Two-column layouts, tables and header contact details are the formatting choices that quietly corrupt your CV during parsing. What survives, what breaks, and how to tell which camp your CV is in.",
  "best-free-resume-checker-tools-in-2026":
    "Most free resume checkers give you a score and stop there. A comparison of what each tool actually inspects, where the free tier ends, and which ones change your CV rather than grading it.",
  "best-resume-builder-2026":
    "Seven resume builders compared on the thing that decides interviews — whether the tool improves what your CV says, not how it looks. Includes where each one puts its paywall.",
  "common-resume-mistakes-that-cost-you-interviews-and-how-to-fix-them":
    "The recurring faults that cost interviews are duller than most advice suggests: unmeasured bullets, buried relevance, and formatting that breaks parsing. Each one, why it costs you, and the fix.",
  "data-scientist-resume-guide-2026":
    "Data science CVs fail on the same thing repeatedly — describing models built rather than decisions changed. Bullet rewrites, the keywords that matter, and how to show business impact.",
  "free-ats-checker-how-to-check-your-cv-score-in-2026":
    "How to check what an applicant tracking system extracts from your CV, what a score does and does not measure, and how to read the result without over-fitting to a number.",
  "how-to-get-past-the-ats":
    "The eight changes that actually move an ATS outcome, in order of effect — and the popular tactics that do nothing or actively hurt. No keyword stuffing.",
  "how-to-tailor-your-cv-for-a-job-description":
    "Tailoring is not rewriting your CV for every application. It is a focused edit of the summary, the skills list and three or four bullets — here is how to decide which ones.",
  "how-to-write-resume-bullets-that-pass-ats":
    "A bullet that survives both parsing and the six-second human scan follows a specific shape: action, mechanism, measured outcome. The formula, with before-and-after rewrites.",
  "jobscan-alternative-the-best-free-ats-checker-in-2026":
    "Jobscan's match rate is useful but metered. An honest look at what you give up moving to a free ATS checker, and what you gain.",
  "marketing-manager-resume-guide-2026":
    "Marketing CVs list channels owned when hiring managers are reading for pipeline moved. How to reframe channel work as revenue contribution, with keyword coverage by specialism.",
  "product-manager-resume-guide-2026-ats-keywords-examples-free-templates":
    "PM CVs are screened for evidence you owned an outcome, not that you ran a process. Bullet rewrites, the ATS keywords that matter, and how positioning changes by level.",
  "resume-io-alternative":
    "Resume.io gates the download behind a subscription. A comparison of what changes if you move — pricing, ATS scoring, watermarks — and how to migrate an existing CV.",
  "software-engineer-resume-guide-2026":
    "Engineering CVs get read for production ownership, not feature lists. What to include at each level, which keywords determine whether you surface in recruiter search, and bullets that show scope.",
  "ux-designer-resume-guide-2026":
    "A UX CV is screened alongside your portfolio, which changes what belongs on it. What hiring managers read the CV for, and the framing that separates shortlisted candidates.",
  "why-am-i-not-getting-interviews":
    "Seven reasons applications go unanswered, ordered by how often they are the real cause — starting with the one nobody wants to hear and ending with the ones that are genuinely fixable.",
  "why-you-re-not-hearing-back-after-applying":
    "Silence after applying usually means one of four things. How to work out which one applies to you, and what to change in each case.",
  "why-your-cv-never-reaches-a-human-recruiter":
    "The widely quoted claim that 75% of CVs are auto-rejected is vendor marketing, not research. What actually stops a CV reaching a recruiter, and which parts you control.",
  "your-cv-is-failing-before-a-human-sees-it-here-s-why":
    "Parsing failures are invisible from your side — the CV looks perfect on screen while the record behind it is missing your phone number. How to see what the parser saw.",
  "zety-alternative-free-resume-builder":
    "Zety lets you build free and charges to download. What a genuinely free alternative changes about the workflow, and where the real trade-offs sit.",
  // These three are retired by expand-thin-blog-posts-2.ts. Briefs are written
  // anyway so the cards read correctly if a retirement is ever reverted.
  "ats-resume-gude-2026":
    "A short guide to ATS-safe resume formatting, superseded by the full 2026 format article.",
  "how-to-get-past-the-ats-in-2026-complete-resume-optimization-guide":
    "An early, shorter take on getting past applicant tracking systems, superseded by the complete playbook.",
  "how-to-tailor-your-resume-for-every-job-application-step-by-step-guide":
    "A step-by-step take on tailoring, superseded by the fuller job-description tailoring guide.",
};

interface Snapshot {
  id: string;
  slug: string;
  brief: string | null;
  tags: string[] | null;
}

async function main() {
  const supabase = createAdminClient();

  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("id, slug, brief, tags")
    .eq("is_published", true);

  if (error) throw new Error(error.message);

  const backup: Snapshot[] = [];
  let tagged = 0;
  let briefed = 0;
  let untouched = 0;
  const unmapped: string[] = [];

  for (const post of posts ?? []) {
    const slug = post.slug as string;
    const update: Record<string, unknown> = {};

    const nextTags = POST_TAGS[slug];
    if (!nextTags) {
      unmapped.push(slug);
    } else {
      const current = ((post.tags as string[] | null) ?? []).join("|");
      if (current !== nextTags.join("|")) {
        update.tags = nextTags;
        tagged++;
      }
    }

    if (!String(post.brief ?? "").trim() && BRIEFS[slug]) {
      update.brief = BRIEFS[slug];
      briefed++;
    }

    if (Object.keys(update).length === 0) {
      untouched++;
      continue;
    }

    if (DRY) {
      console.log(`[dry] ${slug} →`, Object.keys(update).join(", "));
      continue;
    }

    backup.push({
      id: post.id as string,
      slug,
      brief: post.brief as string | null,
      tags: post.tags as string[] | null,
    });

    // `updated_at` is deliberately not touched here. This is a metadata repair,
    // not a content revision, and bumping the date would mislabel every post as
    // freshly updated in the sitemap and the "Updated" line on the page.
    const { error: updErr } = await supabase.from("blog_posts").update(update).eq("id", post.id);
    if (updErr) {
      console.error(`Failed to update ${slug}: ${updErr.message}`);
      continue;
    }
    console.log(`Updated ${slug} — ${Object.keys(update).join(", ")}`);
  }

  if (unmapped.length > 0) {
    console.warn(
      `\n${unmapped.length} published post(s) have no entry in POST_TAGS and kept their existing tags:`
    );
    unmapped.forEach((s) => console.warn(`  ${s}`));
    console.warn("Add them to POST_TAGS and re-run.");
  }

  if (backup.length > 0) {
    writeFileSync(BACKUP_PATH, JSON.stringify(backup, null, 2));
    console.log(`\nPre-update snapshot written to ${BACKUP_PATH}`);
  }

  console.log(
    `\nDone: ${tagged} retagged, ${briefed} excerpts written, ${untouched} already correct.${DRY ? " (dry run)" : ""}`
  );
}

async function restore(file: string) {
  const supabase = createAdminClient();
  const snapshots: Snapshot[] = JSON.parse(readFileSync(file, "utf8"));
  for (const s of snapshots) {
    const { error } = await supabase
      .from("blog_posts")
      .update({ brief: s.brief, tags: s.tags })
      .eq("id", s.id);
    console.log(error ? `Failed ${s.slug}: ${error.message}` : `Restored ${s.slug}`);
  }
}

const run = RESTORE_IDX !== -1 ? restore(process.argv[RESTORE_IDX + 1]) : main();
run.catch((e) => {
  console.error(e);
  process.exit(1);
});
