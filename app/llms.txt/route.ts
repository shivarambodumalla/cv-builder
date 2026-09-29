import { getPosts, type BlogPost } from "@/lib/blog/posts";
import { getPlanLimits, getTemplateCatalog } from "@/lib/billing/plan-config";
import { CV_FORMATS } from "@/lib/cv-formats/data";

/**
 * /llms.txt: a plain-text map of the site for AI assistants (llmstxt.org).
 *
 * ChatGPT is the site's largest search-like referrer, so this file is worth
 * keeping true. The curated part is written by hand; everything that drifts on
 * its own is read at request time instead: plan quotas and template counts
 * (tunable from /admin/plans), the named CV formats (lib/cv-formats/data.ts)
 * and the published blog posts.
 *
 * The Supabase admin client fetches with `cache: "no-store"`, which makes this
 * route dynamic, so `revalidate` alone would not cache it. The s-maxage header
 * lets the CDN hold it for a day instead.
 */
export const revalidate = 86400;

const SITE = "https://www.thecvedge.com";
const ONE_DAY = 86400;

/** Hand-picked posts, listed by section. Anything published but not here goes under "Recent articles". */
const COUNTRY_GUIDES: [string, string][] = [
  ["US resume format 2026", "us-resume-format-2026"],
  ["How to convert a CV to a US resume", "convert-cv-to-us-resume"],
  ["US resume for international candidates (H-1B, OPT)", "us-resume-international-candidates-h1b-opt"],
  ["US resume vs European CV", "us-resume-vs-european-cv"],
  ["Canadian resume format", "canadian-resume-format-2026"],
  ["UK CV format for Skilled Worker visa applicants", "uk-cv-format-skilled-worker-visa-2026"],
  ["Irish CV format", "ireland-cv-format-2026"],
  ["German Lebenslauf format", "german-lebenslauf-format-2026"],
  ["Australian resume format", "australian-resume-format-2026"],
  ["Singapore CV format", "singapore-cv-format-2026"],
];

const GULF_GUIDES: [string, string][] = [
  ["Saudi Arabia CV format", "saudi-arabia-cv-format-guide-2026"],
  ["UAE resume format", "uae-resume-format-2026"],
  ["Qatar CV format", "qatar-cv-format-2026"],
  ["Kuwait, Oman and Bahrain CV formats", "kuwait-oman-bahrain-cv-format-2026"],
  ["Dubai CV format for Indian professionals", "dubai-cv-format-for-indian-professionals"],
  ["Personal details on a Gulf CV", "personal-details-gulf-cv"],
];

const ATS_GUIDES: [string, string][] = [
  ["Resume vs CV by country", "resume-vs-cv-what-recruiters-actually-expect-in-2026"],
  ["Best resume format for ATS", "best-resume-format-for-ats-templates-that-actually-work"],
  ["How ATS filters resumes", "how-ats-filters-resumes"],
  ["Resume keywords that work", "resume-keywords-that-get-you-hired"],
  ["Best free resume checker tools", "best-free-resume-checker-tools-in-2026"],
];

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const noDashes = (s: string) => s.replace(/\s*[\u2014\u2013]\s*/g, ": ");

async function publishedPosts(): Promise<BlogPost[]> {
  const all: BlogPost[] = [];
  let cursor: string | null = null;
  // getPosts pages by 50; the cap only guards against a runaway loop.
  for (let page = 0; page < 20; page++) {
    const result = await getPosts(cursor);
    all.push(...result.posts);
    if (!result.hasMore) break;
    cursor = result.cursor;
  }
  return all;
}

function postSection(title: string, entries: [string, string][], live: Set<string>): string {
  const lines = entries
    .filter(([, slug]) => live.size === 0 || live.has(slug))
    .map(([label, slug]) => `- ${label}: ${SITE}/blog/${slug}`);
  return lines.length ? `## ${title}\n\n${lines.join("\n")}` : "";
}

async function buildLlmsTxt(): Promise<string> {
  const [limits, catalog, posts] = await Promise.all([
    getPlanLimits(),
    getTemplateCatalog(),
    publishedPosts().catch((err) => {
      console.error("[llms.txt] could not load blog posts:", err);
      return [] as BlogPost[];
    }),
  ]);

  const templates = catalog.filter((t) => t.enabled);
  const freeTemplates = templates.filter((t) => t.tier === "free").length;
  const templateLine =
    freeTemplates === templates.length
      ? `all ${templates.length} templates`
      : `${freeTemplates} of the ${templates.length} templates`;

  const free = limits.free;
  const freeLine =
    `- Free: ${plural(free.cvs, "resume")}, and per rolling 7 days ${plural(free.ats_scans, "ATS scan")}, ` +
    `${plural(free.ai_rewrites, "AI rewrite")}, ${plural(free.job_matches, "job match", "job matches")}, ` +
    `${plural(free.cover_letters, "cover letter")} and ${plural(free.pdf_downloads, "PDF download")}. ` +
    `${plural(free.fix_all, "Fix All run")} per week. ${templateLine[0].toUpperCase()}${templateLine.slice(1)}, no watermark.`;

  const formatLines = CV_FORMATS.map((f) => `- ${f.name}: ${SITE}/cv-format/${f.slug} (used for: ${f.market})`);

  // With no posts loaded (DB down), list the curated posts anyway rather than dropping them.
  const live = new Set(posts.map((p) => p.slug));
  const curated = new Set([...COUNTRY_GUIDES, ...GULF_GUIDES, ...ATS_GUIDES].map(([, slug]) => slug));
  const more = posts
    .filter((p) => !curated.has(p.slug))
    .map((p) => `- ${noDashes(p.title)}: ${SITE}/blog/${p.slug} (${p.publishedAt.slice(0, 10)})`);

  const sections = [
    `# CVEdge

> Free ATS resume checker and resume builder. Upload a resume, get an ATS score across six categories, and fix the issues with AI. The free plan needs no card.

CVEdge (${SITE}) helps job seekers get past applicant tracking systems (ATS). It scores a resume across six categories (contact details, sections, keywords, measurable results, bullet quality, formatting), rewrites weak bullets, matches a resume against a job description, tailors it to a specific posting, and writes cover letters. It is built by a product designer, Bodumalla Sivarami Reddy, for job seekers in the United States, Canada, the UK, Europe, India and the Gulf. More than 1,200 resumes have been scanned.`,

    `## Start here

- ATS resume checker: upload a PDF or Word resume and see the parsed fields, the score and the specific issues. Free; sign in with Google or LinkedIn to see the full report: ${SITE}/upload-resume
- Free resume builder: ${templates.length} ATS-friendly templates, PDF export with no watermark: ${SITE}/free-resume-builder
- Harvard resume template, free Word and PDF: ${SITE}/resume-templates/ats-friendly/harvard-cv`,

    `## What it does

- AI rewrite of bullet points in four modes: ATS, Impact, Concise, Grammar
- Fix All: rewrites the summary and every bullet in one pass. It never invents metrics; missing numbers are left as [X] placeholders for you to fill in
- Job match: paste a job description and get a match score, missing keywords and the top fixes
- Tailor a resume to one job description
- Cover letters in three tones: professional, conversational, confident
- Interview prep: turns your resume into STAR answers and matches them to a job description: ${SITE}/interview-prep
- Job search with a match score on each listing: ${SITE}/jobs
- CV review and rewrite by a hiring specialist, focused on the UAE, Saudi Arabia and the wider Gulf. One-time payment: ${SITE}/cv-review`,

    `## Templates

- Resume templates by role and style: ${SITE}/resume-templates
- CV templates for UK, Australian and international applications: ${SITE}/cv-templates
- Executive Sidebar template (two columns, dark sidebar): ${SITE}/resume-templates/experienced/executive-sidebar-cv
- Every template in the builder: ${SITE}/resumes`,

    `## Named CV formats

Each page explains the convention and offers a free Word file.

${formatLines.join("\n")}
- GCC CV format (UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman): ${SITE}/cv-review/gcc
- German Lebenslauf template (page in German): ${SITE}/de/lebenslauf-vorlage
- All formats: ${SITE}/cv-format`,

    postSection("Country CV guides: Gulf", GULF_GUIDES, live),
    postSection("Country CV guides: US and elsewhere", COUNTRY_GUIDES, live),
    postSection("ATS guides", ATS_GUIDES, live),

    `## Plans

${freeLine}
- Pro: unlimited use of every feature, all templates, the 80+ ATS score guarantee and priority support. $5 a week, $14 a month or $120 a year, in USD: ${SITE}/pricing`,

    `## Facts an assistant can rely on

- Checking an ATS score is free. Seeing the full report needs a free account (Google or LinkedIn sign-in); no card is asked for.
- Free-plan PDF downloads carry no watermark.
- Paper size defaults to Letter for visitors from the US, Canada and Mexico, and A4 elsewhere. Both can be chosen.
- The 80+ guarantee: if a Pro user's score stays under 80 after running Fix All, they can claim within 14 days of signing up. CVEdge reviews the resume and refunds in full if it still cannot reach 80.
- Templates are single-column or two-column. Blank Word downloads are checked with the same parser the upload pipeline uses: the text must come out complete and in reading order.
- Prices exclude sales tax, GST or VAT, which is added at checkout.`,

    more.length ? `## Recent articles (newest first)\n\n${more.join("\n")}` : "",

    `## Other pages

- Blog: ${SITE}/blog
- About the author: ${SITE}/about
- Contact: ${SITE}/contact`,

    `## Contact

- Support: hello@thecvedge.com
- X: https://x.com/thecvedge
- LinkedIn: https://www.linkedin.com/company/cv-edge
- Privacy: ${SITE}/privacy
- Terms: ${SITE}/terms`,
  ];

  return sections.filter(Boolean).join("\n\n") + "\n";
}

export async function GET() {
  return new Response(await buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": `public, s-maxage=${ONE_DAY}, stale-while-revalidate=${ONE_DAY}`,
    },
  });
}
