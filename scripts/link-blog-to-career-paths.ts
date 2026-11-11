// Adds one contextual link from each role resume guide in blog_posts to the
// matching /career-path/<role> page (and the career-change post to the tool).
// The blog lives in the DB, so this patches rows. Dry run by default: prints
// slug · the heading the paragraph lands before · inserted text. Nothing is
// written without --apply.
//
//   npx tsx scripts/link-blog-to-career-paths.ts          # dry run
//   npx tsx scripts/link-blog-to-career-paths.ts --apply  # write
//
// Only content_html is patched: it is what the page renders, and most of these
// posts carry an older markdown draft with different headings (see CLAUDE.md,
// Blog). Each post names the <h2> the paragraph goes before, chosen by hand so
// the link closes the section about levels or next steps where one exists.
// Idempotent: a post that already links to the target is left alone.
import { createClient } from "@supabase/supabase-js";
import { hasCareerPathPage, roleLabel } from "@/lib/roles/career-moves/pages";
import { plural, roleNoun } from "@/components/career-path/role-page/role-page-copy";

process.loadEnvFile(".env.local");

interface Link {
  /** Career path role slug; "" = the /career-path tool. */
  role: string;
  /** Text the <h2> starts with; the paragraph is inserted just before it. */
  before: string;
}

const LINKS: Record<string, Link> = {
  "software-engineer-resume-guide-2026": { role: "software-engineer", before: "Frequently asked questions" },
  "full-stack-developer-resume-guide-2026": { role: "full-stack-developer", before: "Next steps" },
  "front-end-developer-resume-guide-2026": { role: "frontend-developer", before: "Next steps" },
  "back-end-developer-resume-guide-2026": { role: "backend-developer", before: "Formatting" },
  "devops-engineer-resume-guide-2026": { role: "devops-engineer", before: "Two things that quietly weaken" },
  "cloud-engineer-resume-guide-2026": { role: "cloud-engineer", before: "What Weakens a Cloud Resume" },
  "data-scientist-resume-guide-2026": { role: "data-scientist", before: "Frequently asked questions" },
  "qa-engineer-resume-guide-2026": { role: "qa-engineer", before: "QA Engineer Resume FAQ" },
  "ux-designer-resume-guide-2026": { role: "ux-designer", before: "Frequently asked questions" },
  "business-analyst-resume-guide-2026": { role: "business-analyst", before: "Related Resume Guides" },
  "product-manager-resume-guide-2026-ats-keywords-examples-free-templates": { role: "product-manager", before: "Frequently asked questions" },
  "cybersecurity-analyst-resume-guide-2026": { role: "security-analyst", before: "Next steps" },
  "career-change-resume-2026": { role: "", before: "Related Guides" },
};

function sentence(role: string): { href: string; html: string } {
  if (!role) {
    const href = "/career-path";
    const anchor = "free career path finder";
    const rest = "shows 3 to 5 roles your experience fits, with live US job counts and pay for each.";
    return {
      href,
      html: `<p>Not sure which role to aim for? The <a href="${href}">${anchor}</a> ${rest}</p>`,
    };
  }
  const label = roleLabel(role);
  const href = `/career-path/${role}`;
  const anchor = `${roleNoun(label)} career path`;
  const rest = `shows where ${plural(label)} usually move next, the skills each move takes and live US pay.`;
  return {
    href,
    html: `<p>Planning the step after this one? The <a href="${href}">${anchor}</a> ${rest}</p>`,
  };
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function main() {
  const apply = process.argv.includes("--apply");
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

  for (const { role } of Object.values(LINKS)) {
    if (role && !hasCareerPathPage(role)) throw new Error(`No career path page for "${role}"`);
  }

  const { data: posts, error } = await db
    .from("blog_posts")
    .select("id, slug, content_html")
    .in("slug", Object.keys(LINKS));
  if (error) throw new Error(error.message);

  console.log(`${apply ? "APPLY" : "DRY RUN"} · ${posts.length} of ${Object.keys(LINKS).length} posts found\n`);
  const missing = Object.keys(LINKS).filter((slug) => !posts.some((p) => p.slug === slug));
  if (missing.length) console.log(`Not in blog_posts: ${missing.join(", ")}\n`);

  let changed = 0;
  let problems = 0;
  for (const post of posts) {
    const link = LINKS[post.slug];
    const s = sentence(link.role);
    const html: string = post.content_html ?? "";
    if (html.includes(`href="${s.href}"`)) {
      console.log(`${post.slug} · already links, skipped`);
      continue;
    }
    const heading = new RegExp(`<h2[^>]*>\\s*${escapeRegExp(link.before)}`, "i");
    const matches = html.match(new RegExp(heading.source, "gi")) ?? [];
    if (matches.length !== 1) {
      console.log(`${post.slug} · PROBLEM: ${matches.length} <h2> match "${link.before}", skipped`);
      problems++;
      continue;
    }
    const at = html.search(heading);
    console.log(`${post.slug} · before <h2>${link.before}\n    + ${s.html}`);
    changed++;
    if (apply) {
      const { error: upErr } = await db
        .from("blog_posts")
        .update({ content_html: `${html.slice(0, at)}${s.html}\n${html.slice(at)}` })
        .eq("id", post.id);
      if (upErr) throw new Error(`${post.slug}: ${upErr.message}`);
    }
  }

  console.log(`\n${changed} post(s) ${apply ? "updated" : "would change"}, ${problems} problem(s).${apply ? "" : " Re-run with --apply to write."}`);
  if (problems) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
