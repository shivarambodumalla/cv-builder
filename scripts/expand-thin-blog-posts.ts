// Rewrite the thin blog posts flagged during the AdSense "low value content" review.
//
// Eight published posts sat between 178 and 356 words — short enough that Google's
// thin-content guidance applies directly. This script replaces their bodies with
// full articles and fixes the duplicate PM guide.
//
// Run: npx tsx scripts/expand-thin-blog-posts.ts
// Add --dry to print what would change without writing.
import { createAdminClient } from "../lib/supabase/admin";
import * as dotenv from "dotenv";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
dotenv.config({ path: ".env.local" });

const DRY = process.argv.includes("--dry");

/** Where the pre-update snapshot is written, so a bad run can be reverted. */
const BACKUP_PATH = join(
  process.cwd(),
  `blog-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
);

interface PostUpdate {
  slug: string;
  title?: string;
  brief?: string;
  seo_title?: string;
  seo_description?: string;
  read_time_minutes?: number;
  content_html?: string;
  /** Set false to retire a post (used for the duplicate PM guide). */
  is_published?: boolean;
}

const POSTS: PostUpdate[] = [
  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: "how-to-increase-your-ats-score-from-60-to-90",
    title: "How to Increase Your ATS Score from 60% to 90%+",
    brief:
      "A 60% ATS score usually fails for four specific, fixable reasons. Here is how to diagnose which one is costing you points and what to change, section by section.",
    seo_title: "How to Increase Your ATS Score from 60% to 90%+ (2026 Guide) | CVEdge",
    seo_description:
      "Scoring around 60% on an ATS check? Learn the four issues that cause it — keyword gaps, unmeasured bullets, missing sections and parsing failures — and how to fix each.",
    read_time_minutes: 9,
    content_html: `<p>A 60% ATS score is a specific diagnosis, not a vague warning. Scores in that band almost always come from the same four problems, and each one is fixable in an afternoon. This guide walks through diagnosing which are costing you points, in the order that recovers the most score for the least work.</p>

<h2>What an ATS score actually measures</h2>
<p>An applicant tracking system does not read your CV the way a person does. It parses your document into structured fields — contact block, work history, education, skills — and then evaluates how well that structured data matches the role. Scoring tools model the same process, which is why a beautifully designed CV can score badly: the design interferes with parsing before content is ever assessed.</p>
<p>Most scoring breaks into six areas: contact details, section completeness, keyword coverage, measurable results, bullet quality, and formatting. A 60% score usually means passing three or four of these and failing badly on the rest. The fix is finding out which.</p>

<h2>Problem 1: keyword coverage (usually the biggest single gap)</h2>
<p>Keyword matching is the heaviest-weighted component in most scoring models, and it is where mid-range scores lose the most ground. The mistake is not that people omit keywords entirely — it is that they use a different vocabulary than the job description.</p>
<p>If a posting asks for "stakeholder management" and your CV says "worked with business partners", a human reads them as the same thing and a keyword matcher does not. The same applies to tool names: "AWS" and "Amazon Web Services" are not automatically equivalent, and neither are "CI/CD" and "continuous integration".</p>
<p><strong>How to fix it:</strong> pull the ten most repeated terms out of the job description and check each one against your CV. Where a term is genuinely part of your experience but phrased differently, adopt the posting's wording. Where you have a real gap, leave it — inserting skills you do not have simply moves the failure to the interview.</p>
<p>One practical detail: spell out the acronym and the expansion together on first use, as in "continuous integration (CI/CD)". That satisfies both a literal matcher and a human reader.</p>

<h2>Problem 2: bullets without results</h2>
<p>The second-largest source of lost points is bullets that describe responsibilities instead of outcomes. "Responsible for managing the reporting process" states a job description. It contains no evidence of scale, no result, and nothing to distinguish you from every other applicant with the same title.</p>
<p>The structure that scores well is consistent across roles: a strong action verb, the specific thing you did, and a measurable result.</p>
<ul>
<li><strong>Before:</strong> "Responsible for improving the reporting process."</li>
<li><strong>After:</strong> "Automated 30 recurring reports into self-serve dashboards, removing 12 analyst-hours per week and cutting stakeholder turnaround from 2 days to immediate."</li>
</ul>
<p>Aim for a result on the majority of your bullets rather than all of them — some genuinely have no number attached, and forcing one produces obviously invented figures.</p>
<p><strong>If you do not know the number:</strong> estimate a defensible range rather than omitting it. "Reduced processing time by roughly 40%" is credible and can be discussed in an interview. Precision you cannot defend is worse than an honest approximation.</p>

<h2>Problem 3: missing or non-standard sections</h2>
<p>Parsers look for conventional section headings. Creative alternatives — "Where I've Been" instead of "Experience", "My Toolkit" instead of "Skills" — frequently fail to map, and content underneath an unrecognised heading may be dropped from the structured record entirely.</p>
<p>Use the standard headings: Professional Summary, Experience, Education, Skills, and Certifications where relevant. This is one of the rare cases where being conventional is strictly better.</p>
<p>A missing skills section is especially costly, because it is where keyword matching does most of its work. If yours is absent or buried at the bottom in prose, adding a clean, scannable list is often worth several points on its own.</p>

<h2>Problem 4: formatting that breaks parsing</h2>
<p>These issues are invisible on screen and severe in effect:</p>
<ul>
<li><strong>Tables and text boxes.</strong> Multi-column layouts built with tables often parse in the wrong reading order, interleaving unrelated lines.</li>
<li><strong>Headers and footers.</strong> Contact details placed in a document header are sometimes not extracted at all — the single most damaging version of this problem, since it can make you unreachable.</li>
<li><strong>Images and icons.</strong> Skill ratings shown as filled circles carry no text. An icon beside your phone number is not a phone number.</li>
<li><strong>Unusual fonts.</strong> Decorative or non-embedded fonts can extract as garbled characters.</li>
<li><strong>Wrong file type.</strong> Submit PDF unless the posting asks for .docx. Never submit an image or a design-tool export that contains no selectable text.</li>
</ul>
<p>A quick self-test: open your PDF, select all, copy, and paste into a plain text editor. What you see is approximately what the parser sees. If the order is scrambled or your contact details are missing, that is your score problem.</p>

<h2>The order to work in</h2>
<p>Fixing these in sequence recovers score efficiently:</p>
<ol>
<li><strong>Formatting first.</strong> No other fix matters if half your CV is not being read. Move contact details into the body, remove tables, flatten to a single column.</li>
<li><strong>Sections second.</strong> Standard headings, with a real skills section present.</li>
<li><strong>Keywords third.</strong> Align vocabulary with the posting, honestly.</li>
<li><strong>Bullets last.</strong> The most time-consuming and the most valuable in interviews, so it repays the effort twice.</li>
</ol>
<p>Most CVs stuck in the 60s clear the 85–90 band after the first three steps alone.</p>

<h2>A caution about scores</h2>
<p>An ATS score is a proxy, not the goal. It measures whether your CV is machine-readable and relevant to a specific posting; it cannot measure whether your experience is compelling. A 95% score on a CV of vague, unmeasured bullets will still lose to a 78% CV that clearly demonstrates someone shipped valuable work.</p>
<p>Treat the score as a floor to clear rather than a number to maximise. Once you are consistently above 85, further effort is better spent on the strength of your bullets than on chasing the last few points.</p>

<h2>Check where you actually stand</h2>
<p>Guessing which of the four problems applies to you is slower than measuring it. <a href="/upload-resume">Upload your CV for a free ATS score</a> and you will see the category-level breakdown — which area is costing you points and the specific issues inside it — so you can start with whichever fix moves you the furthest.</p>`,
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: "resume-keywords-that-get-you-hired",
    title: "Resume Keywords That Get You Hired (And the Ones That Waste Space)",
    brief:
      "Not all keywords are worth including. Here is how keyword matching actually works, which terms carry weight, where to place them, and the filler that costs you space without earning anything.",
    seo_title: "Resume Keywords That Actually Work in 2026 | CVEdge",
    seo_description:
      "Which resume keywords matter, which are filler, and where to place them. How ATS keyword matching really works, with examples of strong and wasted terms.",
    read_time_minutes: 8,
    content_html: `<p>Most keyword advice reduces to "use words from the job description", which is true and not very useful. The harder questions are which words carry weight, where they should appear, and which popular terms are pure filler. This guide answers those.</p>

<h2>How keyword matching actually works</h2>
<p>Applicant tracking systems do not simply count word occurrences. Most weight keywords by where they appear and how recently: a skill in your current role's bullets counts for more than the same skill listed in a role from eight years ago, and a term appearing in both your skills section and your experience reads as substantiated rather than claimed.</p>
<p>Two consequences follow. First, a skills section alone is weak evidence — the strongest position is a term that appears in your skills list <em>and</em> in a bullet showing you used it. Second, repetition beyond that adds nothing. Naming the same tool six times does not multiply anything; it just costs you space.</p>

<h2>The four keyword types that carry weight</h2>

<h3>1. Hard skills and tools</h3>
<p>Named technologies, platforms, and systems — Python, Salesforce, Kubernetes, SAP, Figma, Snowflake. These are unambiguous and easily matched, which makes them the highest-signal terms available. If a posting names a specific tool and you have genuinely used it, it should appear.</p>

<h3>2. Methodologies and frameworks</h3>
<p>Domain-specific approaches: A/B testing, dimensional modelling, contract testing, SOX compliance, design systems, incident postmortems. These distinguish practitioners from people who list tools they have only touched, because they imply how you work rather than what you have installed.</p>

<h3>3. Certifications and qualifications</h3>
<p>AWS Solutions Architect, CISSP, PMP, CPA, CFA. These are frequently used as hard filters, and their absence can eliminate an application regardless of everything else. Write both the acronym and the full name, since postings vary in which they use.</p>

<h3>4. Role and domain vocabulary</h3>
<p>The language of the specific function: "cohort retention" for analysts, "error budget" for SRE, "underwriting" for insurance, "revenue recognition" for accounting. This is the vocabulary that signals you have actually worked in the field, and it is the category most candidates under-use.</p>

<h2>The keywords that waste space</h2>
<p>These appear on a large share of CVs and earn close to nothing:</p>
<ul>
<li><strong>"Hard-working", "detail-oriented", "team player", "results-driven".</strong> Unverifiable, universally claimed, and never used as screening criteria. Every applicant asserts them, so they carry no discriminating information.</li>
<li><strong>"Microsoft Office", "email", "internet".</strong> Assumed for any professional role. Listing them signals a thin skill set rather than a broad one.</li>
<li><strong>"Agile", "Scrum", "SDLC" on their own.</strong> Not useless, but so common in technology CVs that they rarely differentiate. If you list them, attach evidence — running a specific process change is worth more than the label.</li>
<li><strong>"Responsible for".</strong> Not a keyword at all, but it consumes the highest-value real estate on the page: the opening words of a bullet, which is where scanning attention lands.</li>
<li><strong>Buzzwords without substance</strong> — "synergy", "leverage", "thought leader", "rockstar". These actively damage credibility with human reviewers while contributing nothing to matching.</li>
</ul>

<h2>Where to place keywords</h2>
<p>Placement matters more than frequency. In rough order of value:</p>
<ol>
<li><strong>Professional summary.</strong> The first thing read by both parser and human. Three or four sentences naming your specialisation, level, and strongest result will naturally contain your most important terms.</li>
<li><strong>Current or most recent role's bullets.</strong> Weighted most heavily by recency, and the most convincing place for a skill to appear because it comes with context.</li>
<li><strong>Skills section.</strong> Clean, scannable, grouped by category. This is where matching does most of its literal work.</li>
<li><strong>Job titles.</strong> If your internal title was "Growth Ninja", write the functional equivalent — "Growth Marketing Manager (internal title: Growth Ninja)" — so the role is recognisable.</li>
</ol>

<h2>The synonym problem</h2>
<p>The most common invisible failure is having the right experience under the wrong label. Some frequent mismatches:</p>
<ul>
<li>"Client relationship management" versus "stakeholder management"</li>
<li>"Amazon Web Services" versus "AWS"</li>
<li>"Machine learning" versus "predictive modelling"</li>
<li>"People management" versus "line management" versus "team leadership"</li>
<li>"Business intelligence" versus "analytics" versus "reporting"</li>
</ul>
<p>Where you genuinely have the experience, adopt the posting's phrasing. Where a term is standard in your industry but written differently in the posting, include both once — "line management (people management)" reads naturally and satisfies either matcher.</p>

<h2>How many keywords is enough?</h2>
<p>There is no fixed number, and pursuing one leads to keyword stuffing, which modern systems detect and human reviewers find obvious. A more useful test: take the ten most repeated substantive terms in the job description and check that the ones you genuinely have appear somewhere natural in your CV. That is generally sufficient.</p>
<p>Stuffing fails in a specific way worth understanding. A block of thirty comma-separated technologies with no supporting bullets reads to a hiring manager as someone who has heard of thirty things — which is a weaker position than clear depth in six.</p>

<h2>Tailoring without rewriting everything</h2>
<p>Tailoring per application is genuinely effective and does not require starting over. In practice it means adjusting three things: the summary's opening line to match the target role, the ordering of your skills so the relevant ones appear first, and two or three bullets reworded toward the posting's emphasis. That takes about ten minutes and captures most of the benefit.</p>

<h2>Find your gaps automatically</h2>
<p>Comparing your CV against a posting by hand is slow and easy to get wrong. Paste any job description into <a href="/upload-resume">CVEdge's Job Match</a> and it identifies which keywords are missing, which are already covered, and which would raise your match score most — so you can tailor from evidence rather than guesswork.</p>`,
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: "how-ats-filters-resumes",
    title: "How ATS Filters Resumes: What Actually Happens After You Click Apply",
    brief:
      "Applicant tracking systems are widely misunderstood. Here is what they genuinely do, what they do not, and where applications are actually rejected.",
    seo_title: "How ATS Filters Resumes — What Really Happens in 2026 | CVEdge",
    seo_description:
      "What an applicant tracking system actually does with your CV: parsing, search, ranking and knockout questions — and where most rejections really happen.",
    read_time_minutes: 9,
    content_html: `<p>Applicant tracking systems attract more myth than almost any other part of hiring. The common story — that a robot reads your CV, scores it, and auto-rejects you below a threshold — is mostly wrong, and believing it leads people to optimise for the wrong things. Here is what actually happens after you click apply.</p>

<h2>What an ATS actually is</h2>
<p>An ATS is a database with a workflow attached. Its primary job is administrative: store applications, track candidates through stages, keep records for compliance, and let recruiters search and filter. Systems like Workday, Greenhouse, Lever, iCIMS and Taleo are fundamentally organisational tools, not judges.</p>
<p>This distinction matters because it changes where your effort should go. Most systems are not scoring you against a threshold and rejecting you automatically. What they are doing is deciding whether you appear in the recruiter's search results — which has a similar practical effect and a completely different fix.</p>

<h2>Step 1: parsing</h2>
<p>Your document is converted into structured data — name, contact details, employment history with dates and titles, education, skills. This is the step where formatting causes real damage.</p>
<p>Parsers work by recognising conventional patterns. Standard headings, a linear top-to-bottom reading order, and text that is actually text all parse reliably. What breaks: contact details in a document header (sometimes not extracted at all), multi-column layouts built with tables (which can interleave unrelated lines), skills shown as icons or rating bars (no text to read), and any CV submitted as an image.</p>
<p>Parsing failures are the most consequential problem in the pipeline precisely because they are invisible. Your CV looks perfect on screen while the record behind it is missing your phone number or has your job titles scrambled.</p>

<h2>Step 2: knockout questions</h2>
<p>This is where genuine automatic rejection does happen — not from your CV, but from the application form. Questions like "Are you legally authorised to work in this country?", "Do you have 5+ years of experience with X?", or "Are you willing to relocate?" can be configured to reject immediately on the wrong answer.</p>
<p>These are worth taking seriously because they are absolute in a way that CV screening is not. Answer them accurately and carefully; a careless answer here ends the application regardless of how strong your CV is.</p>

<h2>Step 3: search and ranking</h2>
<p>Here is the part most people get wrong. In the large majority of cases, a recruiter opens the system and searches — by keyword, title, location, or a saved filter — and works through the results. Your CV is not being scored in isolation; it is competing for visibility in a search.</p>
<p>This reframes the keyword question usefully. Keywords matter not because a robot assigns you points, but because they determine whether you surface when a recruiter searches "Kubernetes" for a platform role. If your CV describes the work without ever naming the technology, you may simply not appear in the result set.</p>
<p>Some systems do offer ranking or match scoring, and larger companies with high application volume use them more. Even then, these usually rank and surface rather than reject outright.</p>

<h2>Step 4: human review</h2>
<p>A recruiter looks at the CVs that surfaced. Multiple eye-tracking studies over the past decade have put the initial scan in the range of a few seconds — the widely cited figure is around six to eight seconds, and while the precise number varies by study and methodology, the general finding is robust: the first pass is very fast and pattern-based.</p>
<p>In that scan, attention concentrates on your most recent title and company, dates and any gaps, and whether the top of the page signals relevance to the role. This is why the top third of page one carries disproportionate weight, and why a summary that immediately states your specialisation and level outperforms one that opens with generic ambition.</p>

<h2>What ATS does not do</h2>
<p>Several persistent myths are worth dismissing:</p>
<ul>
<li><strong>It does not reject 75% of CVs automatically.</strong> This statistic circulates constantly and traces back to vendor marketing rather than research. Most rejection is human.</li>
<li><strong>It is not defeated by white-text keyword stuffing.</strong> Hidden text is extracted as normal text and reads as obvious manipulation to the human who then sees it. This tactic gets applications binned.</li>
<li><strong>It does not require a plain, ugly CV.</strong> It requires a parseable one. Clean single-column designs with real text can be visually attractive; what breaks is tables, headers, images and columns, not styling.</li>
<li><strong>It does not read your cover letter as a filter.</strong> Cover letters are usually stored and read later by a human, if at all.</li>
</ul>

<h2>Where applications actually fail</h2>
<p>In rough order of frequency:</p>
<ol>
<li><strong>Genuine mismatch.</strong> The unglamorous leading cause. Most rejections are because the application was not competitive against the field, not because of formatting.</li>
<li><strong>Invisibility in search.</strong> Relevant experience described in vocabulary that does not match how recruiters search.</li>
<li><strong>Parsing damage.</strong> Formatting choices that corrupt the structured record.</li>
<li><strong>Knockout answers.</strong> Form questions answered in a disqualifying way.</li>
<li><strong>Weak first impression.</strong> Surviving to human review but failing the six-second scan because the top of the page does not establish relevance.</li>
</ol>

<h2>What this means practically</h2>
<p>Optimise for two readers, in this order. Make the document machine-readable: single column, standard headings, contact details in the body, real text, PDF. Then make it convincing to a human: a summary that states what you specialise in and at what level, bullets with results, and the most relevant material in the top third of page one.</p>
<p>Those two things together handle everything an ATS genuinely does, and they leave you with a CV that also works when it reaches a person — which is where the actual decision gets made.</p>

<h2>See what the parser sees</h2>
<p>The fastest way to find parsing problems is to look at the extracted output rather than the design. <a href="/upload-resume">Upload your CV to CVEdge</a> for a free breakdown of how it parses, which sections are recognised, and what a recruiter's search would find.</p>`,
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: "best-resume-format-for-ats-templates-that-actually-work",
    title: "The Best Resume Format for ATS (And the Ones That Quietly Break It)",
    brief:
      "Chronological, functional or hybrid? Single or two-column? Here is which resume format survives parsing, which section order works, and the design choices that silently destroy your application.",
    seo_title: "Best Resume Format for ATS in 2026 — What Actually Parses | CVEdge",
    seo_description:
      "Which resume format works with applicant tracking systems: chronological vs functional vs hybrid, single vs two-column, section order, length and file type — with the choices that break parsing.",
    read_time_minutes: 9,
    content_html: `<p>Resume format advice tends to collapse into "keep it simple", which leaves the actual decisions unanswered. Should you use two columns? Where does the skills section go? Is a functional CV really fatal? This guide answers the format questions specifically, and separates the choices that genuinely break parsing from the ones that are merely unfashionable.</p>

<h2>The three structural formats</h2>

<h3>Reverse chronological — the default, and correct for most people</h3>
<p>Roles listed newest first, each with dates, company and bullets. This is what parsers are built around and what recruiters expect, and it is the right choice for the large majority of applications.</p>
<p>It works because it answers the two questions a reviewer asks first: what are you doing now, and how did you get there. Any format that obscures those questions creates friction.</p>

<h3>Functional — almost always a mistake</h3>
<p>Skills grouped by theme, with employment history reduced to a bare list at the bottom. It is usually chosen to disguise gaps or a career change, and it fails on both counts.</p>
<p>Parsers struggle with it because achievements are detached from employers and dates, so the structured record ends up with skills that belong to no job and roles with no content. Recruiters, meanwhile, recognise the format instantly and read it as concealment — which draws attention to exactly what it was meant to hide.</p>
<p>If you have gaps or are changing field, the better answer is a chronological CV with a strong summary that frames the transition, and a brief honest note on any significant gap.</p>

<h3>Hybrid — useful for career changers</h3>
<p>A skills summary near the top, followed by a full reverse-chronological history. This gives you a place to establish relevance immediately without hiding your timeline.</p>
<p>It parses cleanly because the employment history is intact, and it genuinely helps when your job titles do not signal what you can do. Keep the skills block tight — four to six lines, not half a page.</p>

<h2>Single column versus two column</h2>
<p>This is the format question with the largest real consequence, and the answer is more specific than "avoid columns".</p>
<p>The problem is not visual columns as such — it is <strong>how the columns are built</strong>. Layouts constructed with tables or text boxes frequently parse in the wrong reading order, interleaving your sidebar with your main content so that a skills list ends up spliced through your job history. The extracted text becomes incoherent even though the page looks fine.</p>
<p>Two-column layouts built as proper flowing text can parse acceptably, but you have no way of knowing which kind you have from looking at it, and you cannot control which parser receives it. For an application that matters, single column is the choice that removes the risk entirely.</p>
<p>A practical compromise: use a two-column design for the version you send directly to humans or attach to networking messages, and a single-column version for portal applications.</p>

<h2>Section order that works</h2>
<p>Parsers cope with reordering better than humans do, so section order is mostly about the six-second scan. A reliable arrangement:</p>
<ol>
<li><strong>Contact details</strong> — in the body of the document, never in a header</li>
<li><strong>Professional summary</strong> — three or four sentences stating specialisation, level and your strongest result</li>
<li><strong>Experience</strong> — reverse chronological, most detail on the most recent role</li>
<li><strong>Skills</strong> — grouped and scannable</li>
<li><strong>Education</strong></li>
<li><strong>Certifications, projects, publications</strong> — as relevant</li>
</ol>
<p>Two exceptions. Recent graduates should put education above experience, since it is the strongest thing they have. Candidates in fields where a licence or certification is a hard requirement — nursing, accountancy, some engineering disciplines — should surface it near the top rather than burying it.</p>

<h2>Headings: be conventional</h2>
<p>Use "Experience", "Education", "Skills", "Certifications". Parsers map these reliably. Creative alternatives — "Where I've Been", "My Toolkit", "The Journey So Far" — may not map at all, and content under an unrecognised heading can be dropped from the structured record.</p>
<p>This is one of the few places where originality has no upside and a real downside.</p>

<h2>The design choices that silently break parsing</h2>
<ul>
<li><strong>Contact details in the document header.</strong> The most damaging single mistake, because it can leave you unreachable. Some parsers never read header content.</li>
<li><strong>Tables and text boxes.</strong> Reading order corruption, as above.</li>
<li><strong>Skill rating bars and icons.</strong> A five-dot proficiency indicator contains no text. So does a phone icon standing in for the word "phone". Whatever the graphic implies, the parser sees nothing.</li>
<li><strong>Text inside images.</strong> A CV exported as an image, or a design with a graphical name banner, extracts as nothing at all.</li>
<li><strong>Unusual or non-embedded fonts.</strong> Can extract as garbled characters. Stick to widely available typefaces.</li>
<li><strong>Dense multi-level nesting.</strong> Sub-bullets under sub-bullets often flatten unpredictably.</li>
</ul>

<h2>Length and file type</h2>
<p>On length: one page under roughly three years of experience, two pages for most mid-career professionals, and two to three for senior people with genuine publication or certification depth. The old one-page absolute is not a parser requirement and has not been a general expectation for years — but a two-page CV padded to reach length is worse than a tight single page.</p>
<p>On file type: submit PDF unless the posting explicitly asks for .docx. Modern parsers handle PDF well, and it preserves your layout. The one caveat is that the PDF must contain real selectable text — an exported image dressed up as a PDF parses as an empty document.</p>

<h2>The two-minute self-test</h2>
<p>Open your CV, select all, copy, and paste into a plain text editor. What appears is roughly what a parser extracts. Check three things: are your contact details present, is the reading order sensible, and did every section survive? If any answer is no, that is a format problem worth fixing before you apply anywhere else.</p>

<h2>Start from a format that already parses</h2>
<p>Rebuilding a layout to be parser-safe is fiddly. Every CVEdge template is single-column-safe by construction, with contact details in the body and no tables or image-based text — and you can <a href="/upload-resume">check any CV's parsing for free</a> to see exactly how it extracts before you send it.</p>`,
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: "front-end-developer-resume-guide-2026",
    title: "Front-End Developer Resume Guide 2026: What Hiring Managers Look For",
    brief:
      "Framework lists do not differentiate front-end CVs any more. Here is what does: performance numbers, accessibility work, and evidence you understand the platform beneath the framework.",
    seo_title: "Front-End Developer Resume Guide 2026 — Examples & Metrics | CVEdge",
    seo_description:
      "How to write a front-end developer resume in 2026: the metrics that matter (Core Web Vitals, bundle size), before/after bullet examples, skills to list, and what gets CVs screened out.",
    read_time_minutes: 9,
    content_html: `<p>Nearly every front-end CV lists React and TypeScript, which means neither one differentiates you. What separates the CVs that get calls is evidence of what happened after the component rendered: how fast the page was, whether it worked for everyone, and whether you understand the platform under the framework.</p>

<h2>What hiring managers are actually screening for</h2>
<p>Front-end hiring has consolidated around three signals.</p>
<p><strong>Performance ownership.</strong> Core Web Vitals are now a shared vocabulary, and a candidate who can say "cut LCP from 4.1s to 1.6s" has demonstrated diagnosis, measurement and follow-through in a single line. A candidate who says "optimised performance" has demonstrated nothing.</p>
<p><strong>Accessibility competence.</strong> This has moved from bonus to baseline at any company with legal exposure, and it is increasingly a scored interview round. Concrete remediation work — violations closed, standards met, automated checks added — is unusual enough on a CV to stand out.</p>
<p><strong>Platform depth.</strong> Interviewers routinely ask candidates to predict output order across promises and timeouts, implement debounce from scratch, or explain how the browser paints. CVs that read as framework-only invite scepticism about whether that depth exists.</p>

<h2>The metrics that belong on a front-end CV</h2>
<p>These are the numbers that make front-end work rankable:</p>
<ul>
<li>LCP, INP and CLS, stated before and after</li>
<li>Bundle size in KB</li>
<li>Time to interactive, ideally on a named device class</li>
<li>Lighthouse scores</li>
<li>Accessibility violations closed, against a named standard</li>
<li>Conversion or task-completion rate on the surfaces you built</li>
<li>Components shipped and reused across teams</li>
</ul>
<p>Naming the device matters more than people expect. "Cut time-to-interactive to 2.1s on mid-tier Android" is far stronger than the same number without context, because it shows you tested under the constraint your users actually have rather than on your own laptop.</p>

<h2>Before and after: front-end bullets</h2>

<p><strong>Weak:</strong> "Built responsive user interfaces using React, Redux, and CSS."</p>
<p><strong>Strong:</strong> "Rebuilt the product listing page in React with virtualised rendering, holding 60fps scroll on 500+ items and cutting time-to-interactive from 6.2s to 2.1s on mid-tier Android."</p>
<p><em>Why:</em> the framework names told the reviewer nothing, because everyone lists them. Naming the technique, the constraint and the measured result proves the depth the tools alone only imply.</p>

<p><strong>Weak:</strong> "Made the website accessible and compliant with standards."</p>
<p><strong>Strong:</strong> "Closed 340 axe-reported WCAG 2.2 AA violations across 60 screens and added automated accessibility checks to CI, preventing regressions on every subsequent PR."</p>
<p><em>Why:</em> "made accessible" is unverifiable and reads as box-ticking. The CI gate is the important half — it shows you fixed the process rather than doing a one-off cleanup, which is what senior front-end hiring looks for.</p>

<p><strong>Weak:</strong> "Worked closely with designers to implement mockups."</p>
<p><strong>Strong:</strong> "Built and documented a 40-component design system in Storybook adopted by 5 product teams, cutting new-feature UI build time roughly 30%."</p>
<p><em>Why:</em> implementing mockups is the baseline expectation. Reframing the same collaboration as leverage other teams consumed moves the bullet from execution to impact.</p>

<h2>A summary that positions you</h2>
<p>Three or four sentences naming your specialisation, your level and your strongest result:</p>
<blockquote><p>Front-end developer with 5 years in React and TypeScript, focused on performance and accessibility in high-traffic e-commerce. Cut largest-contentful-paint from 4.1s to 1.6s across the checkout funnel, lifting mobile conversion 8%. Led the WCAG 2.2 AA remediation of a 60-screen product surface.</p></blockquote>
<p>Note what this does: it establishes a niche (performance and accessibility, e-commerce), a level, and two results — all before the reviewer reaches your first job.</p>

<h2>Skills worth listing</h2>
<p><strong>Core:</strong> semantic HTML, modern CSS (grid, flexbox, container queries), JavaScript fundamentals, TypeScript, React, state management, web accessibility (WCAG), Core Web Vitals, cross-browser debugging.</p>
<p><strong>Tools:</strong> React, Next.js, TypeScript, Tailwind CSS, Vite, Webpack, Jest, Playwright, Storybook, Figma, Lighthouse, axe DevTools.</p>
<p>Keep this block tight. A list of thirty technologies reads as unfamiliarity with all of them; a focused list of twelve with bullets that substantiate them reads as depth.</p>

<h2>What gets front-end CVs screened out</h2>
<ul>
<li><strong>No link to anything deployed.</strong> Conspicuous in this discipline specifically, because reviewers actually click. Two or three deployed projects with visible source beat a portfolio site.</li>
<li><strong>Framework lists with no platform fundamentals underneath.</strong> Invites the interview questions you least want.</li>
<li><strong>No performance or accessibility numbers anywhere.</strong> Reads as pixel-pushing rather than engineering.</li>
<li><strong>"Pixel-perfect" as a selling point.</strong> Signals a handoff mindset rather than a product one.</li>
<li><strong>A slow or inaccessible portfolio site.</strong> It is a work sample, and it will be judged as one.</li>
</ul>

<h2>How this scales by level</h2>
<ul>
<li><strong>Junior (0–2 yrs):</strong> deployed work and comfort with a framework plus real CSS.</li>
<li><strong>Mid (2–5 yrs):</strong> at least one measured Core Web Vitals or bundle improvement you owned.</li>
<li><strong>Senior (5–8 yrs):</strong> a design system, migration, or accessibility programme adopted beyond your own team.</li>
<li><strong>Lead (8+ yrs):</strong> framework or tooling decisions and their organisational effect.</li>
</ul>

<h2>Next steps</h2>
<p>See the full breakdown of <a href="/resume-examples/frontend-developer">front-end developer CV examples</a>, or prepare for the loop with <a href="/interview-prep/frontend-developer">front-end interview questions</a> and what each round is scored on. You can also <a href="/upload-resume">check your CV's ATS score free</a> to see which sections are costing you points.</p>`,
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: "full-stack-developer-resume-guide-2026",
    title: "Full Stack Developer Resume Guide 2026: How to Show Depth, Not Just Breadth",
    brief:
      "The full stack CV's core problem is reading as a generalist with no depth anywhere. Here is how to declare a centre of gravity and prove range with one feature owned end to end.",
    seo_title: "Full Stack Developer Resume Guide 2026 — Examples & Tips | CVEdge",
    seo_description:
      "How to write a full stack developer resume that shows real depth: declaring a centre of gravity, end-to-end feature bullets, the metrics that matter, and what gets these CVs rejected.",
    read_time_minutes: 9,
    content_html: `<p>The full stack CV has one characteristic failure mode: it lists every layer and convinces a reviewer of depth in none of them. Hiring managers are staffing a specific gap, and a CV that claims equal strength across ten technologies is harder to route than one that says clearly where its centre of gravity sits.</p>

<h2>Declare a centre of gravity</h2>
<p>The single highest-leverage change most full stack CVs can make is stating a lean. "Full stack engineer, backend-leaning" tells a reviewer where to place you and costs you nothing — you are still credible for full stack roles, and you become credible for backend ones too.</p>
<p>Without it, a reviewer has to guess, and the default guess is shallow. With it, your deepest work has an obvious frame, and the breadth reads as range on top of a foundation rather than as a substitute for one.</p>

<h2>Prove range with one feature, not ten technologies</h2>
<p>Breadth is best demonstrated by walking a single feature through every layer. This is more convincing than any list, because it shows the seams — the parts only someone who has actually built end to end would mention.</p>
<p><strong>Weak:</strong> "Worked on both frontend and backend development using the MERN stack."</p>
<p><strong>Strong:</strong> "Owned the subscription billing feature end to end: Postgres schema, Stripe webhook handling with idempotency, and the self-serve upgrade UI — lifting paid conversion from 3.1% to 3.5%."</p>
<p><em>Why:</em> "both frontend and backend" is the claim every full stack CV makes. Walking one feature through all three layers proves the span concretely, and the idempotency detail signals real depth rather than tutorial familiarity — it is exactly the kind of thing that only comes up when you have handled a retried webhook in production.</p>

<h2>Two more before-and-after pairs</h2>

<p><strong>Weak:</strong> "Built and maintained web applications for various clients."</p>
<p><strong>Strong:</strong> "Delivered 4 client applications as sole engineer, including a logistics dashboard handling 20k daily events that replaced a manual process costing ~15 hours/week."</p>
<p><em>Why:</em> "various clients" hides the scope entirely. The count, the sole-engineer ownership and the process the software replaced convert vague agency work into evidence of independent delivery.</p>

<p><strong>Weak:</strong> "Used AWS for deployment and hosting of applications."</p>
<p><strong>Strong:</strong> "Moved deploys from manual EC2 uploads to a Terraform-defined ECS pipeline with GitHub Actions, cutting release time from 2 hours to 9 minutes and enabling daily releases."</p>
<p><em>Why:</em> naming a cloud provider is not an achievement. The before/after and the behaviour it unlocked turn infrastructure familiarity into a measurable outcome.</p>

<h2>The metrics available to you</h2>
<p>Full stack engineers have an advantage most specialists do not: proximity to product metrics. Use it.</p>
<ul>
<li>Features shipped end to end</li>
<li>Conversion or activation lift</li>
<li>p95 latency on services you own</li>
<li>Users or tenants served</li>
<li>Release frequency and lead time</li>
<li>Cost saved, or manual hours removed</li>
</ul>
<p>A full stack CV with no product metric anywhere has left its strongest card unplayed.</p>

<h2>A summary that lands</h2>
<blockquote><p>Full stack engineer (backend-leaning) with 6 years at early-stage SaaS. Owned subscription billing end to end — Stripe integration, Postgres schema, and self-serve upgrade flow — lifting paid conversion 14%. Comfortable from query plans to React state, and the first engineer on-call for a platform serving 500k users.</p></blockquote>
<p>The lean is stated in the first four words. The end-to-end feature proves range. "Query plans to React state" names both extremes concretely. On-call ownership signals production maturity.</p>

<h2>Skills worth listing</h2>
<p><strong>Core:</strong> API design, relational data modelling, React and component architecture, authentication and authorisation, caching, testing across layers, deployment pipelines, debugging across the stack.</p>
<p><strong>Tools:</strong> TypeScript, React, Next.js, Node.js, Python, PostgreSQL, Redis, Prisma, Docker, AWS, Vercel, GitHub Actions, Stripe.</p>
<p>Group them so the reviewer can see structure rather than a wall of names. Ordering matters — put the layer you lean toward first.</p>

<h2>What gets full stack CVs rejected</h2>
<ul>
<li><strong>Equal-weight claims across ten technologies</strong> with no stated centre of gravity.</li>
<li><strong>No end-to-end feature described</strong> — only layer-specific tasks, which undercuts the entire premise of the title.</li>
<li><strong>"MERN stack" as the headline qualification.</strong> An acronym is not a capability.</li>
<li><strong>No product metric anywhere</strong>, wasting the discipline's main advantage.</li>
<li><strong>No indication of scale</strong> — users, traffic, data volume — which makes every claim unrankable.</li>
</ul>

<h2>Is full stack still credible?</h2>
<p>Yes, and it is strongest at startups and scale-ups where owning a feature end to end is genuinely the job. It is weakest when it reads as an absence of specialisation. The way to keep it credible is exactly the approach above: declare a lean, prove it with one system you owned properly, and show the breadth through features delivered across the stack.</p>
<p>It is worth knowing that the highest compensation bands cluster at companies that hire by discipline. A full stack engineer with genuine depth in one area typically interviews successfully for the specialist role too — which is often the more reliable route to those bands.</p>

<h2>Next steps</h2>
<p>See <a href="/resume-examples/full-stack-developer">full stack developer CV examples</a> with level-by-level positioning, or work through <a href="/interview-prep/full-stack-developer">full stack interview questions</a> covering the seam rounds candidates most often fail. You can also <a href="/upload-resume">check your CV's ATS score free</a>.</p>`,
  },

  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: "how-recruiters-really-read-your-resume-backed-by-data",
    title: "How Recruiters Really Read Your Resume (What the Research Shows)",
    brief:
      "Eye-tracking research shows the first pass over a CV is fast and pattern-based. Here is where attention actually goes, what the studies do and do not establish, and how to structure a page around it.",
    seo_title: "How Recruiters Really Read Your Resume — The Research | CVEdge",
    seo_description:
      "What eye-tracking studies show about how recruiters scan CVs: the six-second first pass, the F-pattern, where attention concentrates, and how to structure your resume around it.",
    read_time_minutes: 8,
    content_html: `<p>The claim that recruiters spend about six seconds on a CV gets repeated constantly, usually without context. It comes from real research, it is more nuanced than the headline suggests, and understanding what it does and does not establish changes how you should structure a page.</p>

<h2>Where the number comes from</h2>
<p>Two eye-tracking studies are the source. A 2012 study by TheLadders reported an average initial scan of roughly six seconds. A 2018 follow-up by the same organisation reported around 7.4 seconds. Both used eye-tracking equipment on professional recruiters reviewing real CVs.</p>
<p>Two caveats are worth stating, because they are usually omitted. These were vendor-run studies with modest sample sizes, not peer-reviewed research, so the precise figure should be held loosely. And the number describes the <em>initial triage pass</em> — the decision about whether a CV is worth reading — not the total time spent on candidates who survive it. A CV that clears the first pass gets minutes, not seconds.</p>
<p>What the research supports robustly is the shape of the behaviour rather than the exact duration: the first pass is fast, pattern-based, and concentrated on a small number of fields.</p>

<h2>What the eye actually looks at</h2>
<p>Across both studies, gaze concentrated on a consistent set of elements during the initial scan:</p>
<ul>
<li><strong>Name</strong></li>
<li><strong>Current title and company</strong></li>
<li><strong>Current position start and end dates</strong></li>
<li><strong>Previous title and company</strong></li>
<li><strong>Previous position dates</strong></li>
<li><strong>Education</strong></li>
</ul>
<p>Notice what is absent: your bullets. During the first pass, the detailed content you spent the most time writing is largely skimmed rather than read. It matters enormously — but only after the scan has decided you are worth a second look.</p>

<h2>The F-pattern</h2>
<p>Reading-behaviour research more broadly — including long-standing web usability work by the Nielsen Norman Group — describes an F-shaped scanning pattern: a horizontal sweep across the top, a shorter sweep lower down, then a vertical scan along the left edge.</p>
<p>Applied to a CV, this has three practical consequences:</p>
<ol>
<li><strong>The top third of page one carries disproportionate weight.</strong> It receives the horizontal sweep and is where the relevance decision is made.</li>
<li><strong>The left edge is scanned more than the right.</strong> The first few words of each bullet are read; the ends of lines often are not.</li>
<li><strong>Content low on page two receives very little first-pass attention.</strong> Anything you need seen should not live there.</li>
</ol>

<h2>What this means for structure</h2>

<h3>Front-load the top third</h3>
<p>Your name, a clear current title, and a three-to-four sentence summary stating your specialisation, level and strongest result. This is the highest-value real estate on the document. A summary that opens with generic ambition — "seeking a challenging role where I can grow" — wastes it entirely.</p>

<h3>Start bullets with the strongest words</h3>
<p>Because the left edge is scanned and line-ends often are not, the opening words of each bullet do most of the work. "Responsible for managing..." spends that position on nothing. "Cut p99 latency 78%..." spends it on the result.</p>
<p>Where possible, move the number toward the front rather than burying it at the end of a long clause.</p>

<h3>Make titles and dates unambiguous</h3>
<p>Since titles, companies and dates absorb most of the first-pass attention, they should be instantly parseable. Consistent formatting, no ambiguity about which line is the company and which is the role, and no gaps left unexplained. If your internal title was non-standard, write the functional equivalent alongside it.</p>

<h3>Keep the most relevant material on page one</h3>
<p>Reverse chronological order usually handles this automatically. Where it does not — for instance, if your most relevant experience is three roles back — a hybrid format with a skills summary near the top lets you establish relevance without disturbing the timeline.</p>

<h2>What the research does not say</h2>
<p>A few reasonable-sounding conclusions that the data does not support:</p>
<ul>
<li><strong>That design tricks buy you attention.</strong> Attention concentrated on standard fields, not on visual flourishes. Unusual layouts more often slowed comprehension than helped it.</li>
<li><strong>That bullets do not matter.</strong> They matter decisively — in the second pass, and in the interview. The scan decides whether there is a second pass.</li>
<li><strong>That one page is required.</strong> Length was not the variable; clarity of the top third was.</li>
<li><strong>That six seconds is your total.</strong> It is the triage budget, not the review budget.</li>
</ul>

<h2>The practical summary</h2>
<p>Write for two passes. The first is fast, pattern-based and concentrated on the top third, your titles and your dates — so make those instantly legible and put your strongest positioning statement where the sweep lands. The second is a genuine read, where your bullets and their results determine whether you get a call.</p>
<p>Most CVs are written entirely for the second pass and lose at the first. Fixing the top third is usually the highest-return edit available.</p>

<h2>See how yours scans</h2>
<p><a href="/upload-resume">Upload your CV to CVEdge free</a> for a breakdown of how it parses, whether your summary and titles are doing their job, and which sections are costing you attention in that first pass.</p>`,
  },

  // ── Second pass ─────────────────────────────────────────────────────────────
  // A deeper audit (threshold raised from 360 to 400 words) surfaced five more
  // borderline posts. Expanded for the same reason as the first batch.
  {
    slug: "devops-engineer-resume-guide-2026",
    title: "DevOps Engineer Resume Guide 2026: The Metrics That Get You Hired",
    brief:
      "DevOps is one of the most quantifiable disciplines in tech, and most DevOps CVs contain no numbers. Here are the metrics hiring managers compare, with before/after bullet examples.",
    seo_title: "DevOps Engineer Resume Guide 2026 — DORA Metrics & Examples | CVEdge",
    seo_description:
      "How to write a DevOps engineer resume: the DORA metrics that matter, cost and reliability numbers, before/after bullets, and the tool-list mistake that gets CVs rejected.",
    read_time_minutes: 9,
    content_html: `<p>DevOps is among the most measurable disciplines in technology — deployment frequency, lead time, failure rate, recovery time and cloud spend are all tracked as a matter of course. Which makes it striking how many DevOps CVs contain no numbers at all, listing tools instead. That gap is the single biggest opportunity available to you.</p>

<h2>Speak in DORA metrics</h2>
<p>The four DORA metrics are the shared vocabulary of the discipline, and hiring managers use them to compare candidates directly:</p>
<ul>
<li><strong>Deployment frequency</strong> — how often you ship</li>
<li><strong>Lead time for change</strong> — commit to production</li>
<li><strong>Change-failure rate</strong> — what proportion of deploys cause a problem</li>
<li><strong>Mean time to recovery (MTTR)</strong> — how fast you recover when they do</li>
</ul>
<p>The most persuasive DevOps bullet shape moves speed and stability together, because improving one at the cost of the other is easy and improving both is the actual job: "Raised deploy frequency from weekly to 40x/day while cutting change-failure rate from 18% to 4%."</p>
<p>Alongside DORA, two more families of number carry weight: reliability (uptime against SLO, incident volume, alert and page counts) and cost (monthly cloud spend reduced, in percentage and absolute terms).</p>

<h2>Before and after: DevOps bullets</h2>

<p><strong>Weak:</strong> "Managed CI/CD pipelines and automated deployment processes."</p>
<p><strong>Strong:</strong> "Rebuilt 30 Jenkins pipelines as reusable GitHub Actions workflows, cutting mean pipeline time from 22 to 6 minutes and lifting deploy frequency from weekly to 40x/day."</p>
<p><em>Why:</em> managing pipelines is the role's baseline. The migration scope, the time saved and the deployment-frequency change tie the work to the metric the discipline is judged on.</p>

<p><strong>Weak:</strong> "Responsible for cloud infrastructure and cost optimisation on AWS."</p>
<p><strong>Strong:</strong> "Cut AWS spend 34% ($780k/yr) by rightsizing 200 over-provisioned instances, moving batch workloads to spot, and adding per-team cost alerting — with no SLO regression."</p>
<p><em>Why:</em> cost bullets are only credible with a reliability caveat attached, because anyone can save money by degrading service. Naming three mechanisms shows the analysis; "no SLO regression" pre-empts the obvious challenge.</p>

<p><strong>Weak:</strong> "Monitored systems and responded to incidents as part of the on-call rotation."</p>
<p><strong>Strong:</strong> "Cut MTTR from 47 to 12 minutes by replacing 140 threshold alerts with 18 SLO-based ones and adding runbook links to every page, reducing after-hours pages ~70%."</p>
<p><em>Why:</em> being on-call is participation, not achievement. The alert reduction demonstrates judgement about signal versus noise — and after-hours page volume is a number every hiring manager instantly understands.</p>

<h2>A summary that positions you</h2>
<blockquote><p>DevOps engineer with 6 years running Kubernetes platforms for regulated fintech. Took deploy frequency from weekly to 40x/day while cutting change-failure rate from 18% to 4%, and reduced AWS spend 34% ($780k/yr) through rightsizing and spot adoption. Owns SLO definition and the blameless postmortem process.</p></blockquote>

<h2>Skills worth listing</h2>
<p><strong>Core:</strong> infrastructure as code, Kubernetes operations, CI/CD design, observability and alerting, incident response, cloud cost management, Linux and networking, scripting, secrets management.</p>
<p><strong>Tools:</strong> Terraform, Kubernetes, Docker, AWS, Azure, GCP, GitHub Actions, Jenkins, ArgoCD, Helm, Prometheus, Grafana, Datadog, Ansible, Vault, Bash, Python.</p>
<p>List these compactly. A wall of forty tools is the characteristic DevOps CV mistake — it reads as exposure rather than depth, and it crowds out the numbers that would actually differentiate you.</p>

<h2>What gets DevOps CVs rejected</h2>
<ul>
<li><strong>Tool lists with no metrics.</strong> The dominant failure, and unusually costly here because the metrics are so readily available.</li>
<li><strong>No incident stories</strong>, which suggests you have not carried production responsibility.</li>
<li><strong>"Automated processes" with no before/after timing.</strong></li>
<li><strong>Cost savings with no reliability context</strong>, which reads as risk-taking rather than engineering.</li>
</ul>

<h2>DevOps or SRE?</h2>
<p>They overlap but weight differently. DevOps centres on delivery — pipelines, infrastructure as code, developer experience — measured on how fast and safely teams ship. SRE centres on reliability of running systems, formalised through SLOs and error budgets, with more software engineering and more on-call. Loops reflect this: SRE includes more coding, DevOps more tooling and pipeline design. Position your CV for whichever you are applying to.</p>

<h2>Next steps</h2>
<p>See <a href="/resume-examples/devops-engineer">DevOps engineer CV examples</a> with level-by-level positioning, or work through <a href="/interview-prep/devops-engineer">DevOps interview questions</a> — including the live troubleshooting round that carries the most weight. You can also <a href="/upload-resume">check your CV's ATS score free</a>.</p>`,
  },

  {
    slug: "how-to-write-resume-bullet-points-that-show-impact-with-examples",
    title: "How to Write Resume Bullet Points That Show Impact (With Examples)",
    brief:
      "Most bullets describe duties. The ones that get interviews state what changed and by how much. Here is the structure, what to do when you have no numbers, and twelve before/after rewrites.",
    seo_title: "How to Write Resume Bullet Points That Show Impact | CVEdge",
    seo_description:
      "The structure behind resume bullets that get interviews: action verb, specific work, measurable result. Includes what to do when you have no metrics and 12 before/after examples.",
    read_time_minutes: 9,
    content_html: `<p>The difference between a CV that gets calls and one that does not is usually not the experience — it is whether the bullets describe duties or outcomes. "Responsible for managing the reporting process" and "Automated 30 recurring reports, removing 12 analyst-hours per week" can describe the same job. Only one gets read.</p>

<h2>The structure</h2>
<p>Strong bullets share a consistent shape: <strong>a strong action verb + the specific thing you did + a measurable result</strong>.</p>
<p>Each part is doing work. The verb establishes agency. The specific work makes it credible and gives the interviewer something to ask about. The result is what makes a reviewer stop scanning.</p>
<p>A useful ordering trick: because the left edge of each line gets scanned and line-ends often do not, move the result toward the front where it fits naturally. "Cut p99 latency 78% by batching ORM queries" lands harder than the same content with the number buried at the end.</p>

<h2>Twelve rewrites</h2>
<ol>
<li><strong>Before:</strong> "Responsible for social media accounts." <strong>After:</strong> "Grew LinkedIn following from 4k to 27k in 11 months, driving 18% of inbound demo requests."</li>
<li><strong>Before:</strong> "Helped improve the onboarding process." <strong>After:</strong> "Redesigned onboarding around a single activation moment, lifting week-1 activation from 22% to 34%."</li>
<li><strong>Before:</strong> "Worked on the company website." <strong>After:</strong> "Rebuilt the marketing site in Next.js, cutting LCP from 4.1s to 1.6s and lifting mobile conversion 8%."</li>
<li><strong>Before:</strong> "Managed a team of engineers." <strong>After:</strong> "Grew and led a team of 7 engineers, cutting median PR review time from 3 days to 6 hours and reducing voluntary attrition to zero over two years."</li>
<li><strong>Before:</strong> "Handled customer support tickets." <strong>After:</strong> "Resolved ~60 tickets/week at 96% CSAT, and wrote the billing runbook that cut escalations to engineering 40%."</li>
<li><strong>Before:</strong> "Assisted with financial reporting." <strong>After:</strong> "Rebuilt the monthly close model, cutting close from 9 days to 4 and eliminating three recurring reconciliation errors."</li>
<li><strong>Before:</strong> "Performed data analysis for the marketing team." <strong>After:</strong> "Identified that 31% of signup drop-off came from one verification step; removing it lifted completed signups 22% with no increase in fraud."</li>
<li><strong>Before:</strong> "Used SQL to pull reports." <strong>After:</strong> "Automated 30 recurring reporting requests into self-serve Looker explores, removing ~12 analyst-hours per week."</li>
<li><strong>Before:</strong> "Involved in the migration project." <strong>After:</strong> "Led the zero-downtime migration of a 400M-row Postgres table across two sprints with no customer-visible errors."</li>
<li><strong>Before:</strong> "Created training materials for new hires." <strong>After:</strong> "Built a 12-module onboarding curriculum that cut new-hire time-to-first-deploy from 3 weeks to 6 days."</li>
<li><strong>Before:</strong> "Participated in the on-call rotation." <strong>After:</strong> "Cut MTTR from 47 to 12 minutes by replacing 140 threshold alerts with 18 SLO-based ones."</li>
<li><strong>Before:</strong> "Worked with stakeholders to gather requirements." <strong>After:</strong> "Ran 40 customer interviews that reframed a requested export feature as a reporting-trust problem; the resulting feature hit 60% adoption versus 8% for the original request."</li>
</ol>

<h2>What to do when you have no numbers</h2>
<p>This is the most common objection, and it has three good answers.</p>
<p><strong>Estimate a defensible range.</strong> "Reduced processing time by roughly 40%" is credible and can be discussed in an interview. An honest approximation beats both false precision and no number at all.</p>
<p><strong>Use a different dimension.</strong> If you cannot measure the outcome, measure the scope: how many people, how many systems, how much data, how often, over what period. "Supported 14 internal teams across 3 time zones" carries real information without an outcome metric.</p>
<p><strong>State the before and after qualitatively.</strong> "Replaced a manual spreadsheet process with an automated pipeline, ending weekly reconciliation errors" has no percentage and still shows a clear change of state.</p>
<p>What not to do is invent figures. Numbers you cannot defend become the worst possible interview topic, and interviewers probe them precisely because they are easy to check.</p>

<h2>Verbs to use and to avoid</h2>
<p><strong>Use:</strong> built, led, cut, grew, shipped, designed, migrated, automated, negotiated, rebuilt, launched, reduced, unblocked.</p>
<p><strong>Avoid:</strong> responsible for, helped with, worked on, involved in, assisted, participated in, tasked with. These consume the highest-value position on the line — its first words — while conveying nothing about what you actually did.</p>
<p>Also worth retiring: "successfully" (if it were unsuccessful you would not list it) and "various" (which hides scope rather than summarising it).</p>

<h2>How many bullets, and how much detail</h2>
<p>Three to five bullets for your current role, two to four for the previous one, and one to two for anything older than about eight years. Weight detail toward recency, because that is where reviewers concentrate.</p>
<p>Aim for a result on most bullets rather than all of them. Some genuinely have none, and forcing one produces obviously manufactured figures — which does more damage than the missing number would have.</p>

<h2>Rewrite yours automatically</h2>
<p>If you are staring at a bullet and cannot see the version with the result in it, <a href="/upload-resume">upload your CV to CVEdge</a>. The AI rewriter converts duty-shaped bullets into outcome-shaped ones and flags where a number is missing, using <code>[X]</code> placeholders rather than inventing figures.</p>`,
  },

  {
    slug: "cybersecurity-analyst-resume-guide-2026",
    title: "Cybersecurity Analyst Resume Guide 2026: Proving You Can Actually Defend",
    brief:
      "Security CVs are heavy on certifications and light on evidence. Here is what hiring managers look for, the metrics that make detection work credible, and before/after bullets.",
    seo_title: "Cybersecurity Analyst Resume Guide 2026 — Skills & Examples | CVEdge",
    seo_description:
      "How to write a cybersecurity analyst resume: the detection and response metrics that matter, certifications worth listing, before/after bullet examples, and common rejections.",
    read_time_minutes: 9,
    content_html: `<p>Security hiring has an evidence problem. Certifications are easy to list and hard to interpret, so hiring managers have learned to look past them for signs you have actually detected, investigated and contained something. That is what your CV needs to demonstrate.</p>

<h2>What hiring managers screen for</h2>
<p><strong>Detection and response experience.</strong> Alerts triaged, incidents investigated, dwell time, false-positive rate. Concrete numbers here separate people who have worked a SOC queue from people who have studied for an exam.</p>
<p><strong>Tooling depth over tooling breadth.</strong> Genuine fluency in one SIEM is worth more than a list of six. Interviewers ask how you built a detection rule, how you tuned it, and what it missed.</p>
<p><strong>Judgement about risk.</strong> Security work is a constant negotiation between control and friction. Evidence that you have made that trade-off deliberately — and can explain a case where you accepted a risk — is a senior signal.</p>
<p><strong>Communication.</strong> Much of the job is persuading engineers and executives to do something inconvenient. Bullets showing you drove adoption of a control matter as much as the control itself.</p>

<h2>Metrics that make security work credible</h2>
<ul>
<li>Alerts triaged per week, and false-positive rate before and after tuning</li>
<li>Mean time to detect and mean time to respond</li>
<li>Incidents investigated, and how many were true positives</li>
<li>Vulnerabilities remediated, weighted by severity, and time-to-patch</li>
<li>Phishing simulation click-through rate before and after training</li>
<li>Coverage: endpoints, systems or business units monitored</li>
<li>Audit or compliance outcomes — findings closed, controls passed</li>
</ul>

<h2>Before and after: security bullets</h2>

<p><strong>Weak:</strong> "Monitored security alerts and responded to incidents using Splunk."</p>
<p><strong>Strong:</strong> "Triaged ~400 alerts/week in Splunk across 12k endpoints, and cut false positives 62% by rewriting 40 detection rules — reducing analyst time on noise by roughly 15 hours/week."</p>
<p><em>Why:</em> monitoring alerts is the job description. Volume, coverage and the tuning work show you improved the queue rather than just working it.</p>

<p><strong>Weak:</strong> "Performed vulnerability assessments and reported findings."</p>
<p><strong>Strong:</strong> "Ran quarterly authenticated scans across 800 hosts and drove critical-severity time-to-patch from 45 days to 9 by agreeing SLAs with four engineering teams and publishing a shared remediation dashboard."</p>
<p><em>Why:</em> finding vulnerabilities is easy; getting them fixed is the hard part and the part that reduces risk. The SLA negotiation shows the influence dimension of the role.</p>

<p><strong>Weak:</strong> "Assisted with security awareness training for employees."</p>
<p><strong>Strong:</strong> "Redesigned phishing simulation and training for 2,400 staff, cutting click-through from 18% to 4% over three campaigns and raising report rate to 61%."</p>
<p><em>Why:</em> the report rate is the detail that shows real understanding — reducing clicks matters, but training people to report is what shortens detection time on a genuine attack.</p>

<h2>A summary that positions you</h2>
<blockquote><p>Security analyst with 4 years in a 24/7 SOC covering 12k endpoints. Cut alert false positives 62% by rewriting detection logic, and reduced critical time-to-patch from 45 days to 9 by negotiating remediation SLAs with engineering. GIAC-certified, strongest in detection engineering and incident triage.</p></blockquote>

<h2>Certifications: which ones, and where</h2>
<p>Certifications matter more in security than in most disciplines, because they are frequently used as hard filters. Security+ for entry level, GIAC certifications (GCIA, GCIH) for detection and response depth, CISSP for senior and management-track roles, OSCP where offensive skill is relevant.</p>
<p>List them prominently — a dedicated line near the top rather than buried at the bottom. Write the acronym and the full name, since postings vary in which they use. But keep them in proportion: a CV that leads with five certifications and contains no evidence of applied work reads as someone who studies rather than defends.</p>

<h2>Skills worth listing</h2>
<p><strong>Core:</strong> SIEM operation and detection engineering, incident response, threat hunting, vulnerability management, log analysis, network fundamentals, malware triage, MITRE ATT&amp;CK, risk assessment.</p>
<p><strong>Tools:</strong> Splunk, Microsoft Sentinel, CrowdStrike, Wireshark, Nessus, Qualys, Burp Suite, Suricata, Python, PowerShell.</p>

<h2>What gets security CVs rejected</h2>
<ul>
<li><strong>Certifications with no applied evidence.</strong> The most common pattern, and hiring managers are explicitly wary of it.</li>
<li><strong>Long tool lists with no depth in any one.</strong></li>
<li><strong>No volume or coverage numbers</strong>, which makes the environment you worked in impossible to gauge.</li>
<li><strong>Vague incident language.</strong> "Responded to security incidents" without type, scope or outcome tells a reviewer nothing.</li>
<li><strong>Overclaiming.</strong> Security interviewers probe hard, and inflated claims fail fast in a discipline built on scepticism.</li>
</ul>

<h2>Next steps</h2>
<p>See <a href="/resume-examples/security-analyst">security analyst CV examples</a>, or <a href="/upload-resume">check your CV's ATS score free</a> to find which sections are costing you points before you apply.</p>`,
  },

  {
    slug: "ai-resume-builder-vs-manual",
    title: "AI Resume Builder vs Writing It Yourself: An Honest Comparison",
    brief:
      "AI is genuinely good at some parts of resume writing and bad at others. Here is where each approach wins, where AI-written CVs fail, and how to combine them.",
    seo_title: "AI Resume Builder vs Manual Writing — Honest Comparison 2026 | CVEdge",
    seo_description:
      "Should you use an AI resume builder or write it yourself? Where AI genuinely helps, where it fails, how recruiters spot AI-written CVs, and the hybrid approach that works best.",
    read_time_minutes: 8,
    content_html: `<p>We build an AI resume tool, so treat what follows with appropriate scepticism — but the honest answer is that AI is genuinely good at some parts of this and genuinely bad at others, and knowing which is which will get you a better CV than committing fully to either approach.</p>

<h2>Where AI genuinely helps</h2>

<h3>Restructuring bullets you have already written</h3>
<p>This is the strongest use case by a distance. You know what you did; the difficulty is compressing it into a line that leads with the result. Give a model "I was in charge of the reporting process and made it faster by automating some of it" and it will reliably return something closer to "Automated recurring reporting, cutting turnaround from 2 days to same-day." The raw material is yours; the compression is mechanical.</p>

<h3>Vocabulary alignment</h3>
<p>Spotting that a posting says "stakeholder management" where your CV says "worked with business partners" is tedious and error-prone by hand. Comparing two documents for terminology gaps is exactly what these systems are good at.</p>

<h3>Formatting and consistency</h3>
<p>Tense consistency, parallel bullet structure, date formatting, and parser-safe layout are rule-following tasks. Doing them manually is a poor use of your time.</p>

<h3>Beating the blank page</h3>
<p>A mediocre first draft you can react to is more useful than an empty document. Editing is easier than generating.</p>

<h2>Where AI fails</h2>

<h3>It does not know what you did</h3>
<p>The fundamental limit. A model given a job title will produce plausible-sounding achievements for that title — which are fiction. Every number it invents is a trap you walk into during the interview, and interviewers probe numbers precisely because they are checkable.</p>
<p>Any tool that generates achievements from a title alone is producing liabilities, not a CV.</p>

<h3>It flattens voice</h3>
<p>Unconstrained models converge on the same register: "spearheaded", "leveraged", "cutting-edge solutions", "results-driven professional". Recruiters read hundreds of CVs a week and this pattern has become conspicuous. Uniform polish across every bullet reads as generated, and generated reads as unexamined.</p>

<h3>It cannot judge relevance</h3>
<p>Deciding that your two years in logistics matter more than your five in retail <em>for this particular application</em> requires understanding the target role's priorities. That judgement remains yours.</p>

<h3>It over-claims</h3>
<p>Models trained to be helpful tend to upgrade "helped with" to "led". Sometimes that is a fair reframing; sometimes it is a misrepresentation you will have to defend. Always check the seniority implied by a rewrite.</p>

<h2>Can recruiters tell?</h2>
<p>Often, yes — not through detection tools, which are unreliable, but through pattern recognition. The signals are consistent: every bullet the same length and rhythm, uniformly grandiose verbs, achievements with suspiciously round numbers, and a summary of generic superlatives with no specific claim.</p>
<p>Worth being clear about what is actually penalised. Using AI is not the problem; nobody objects to spell-check. What gets penalised is a CV that reads as though the candidate did not think about it — because that predicts how they will approach the job.</p>

<h2>The hybrid approach</h2>
<ol>
<li><strong>You write the raw material.</strong> Brain-dump what you did, in whatever form. Include numbers wherever you can recall or reconstruct them.</li>
<li><strong>AI restructures it.</strong> Compress into result-first bullets, enforce parallel structure, fix tense.</li>
<li><strong>AI finds keyword gaps</strong> against the specific posting.</li>
<li><strong>You verify every claim.</strong> Check each number, each verb's seniority, each implied scope. Remove anything you would not want examined.</li>
<li><strong>You re-inject specificity.</strong> Restore the concrete detail that makes it yours — the odd system name, the unusual constraint, the thing only someone who was there would mention.</li>
</ol>
<p>Step five is what most people skip, and it is where the difference shows. Specific detail is the strongest available signal of authenticity, and it also gives the interviewer something to ask about — which is the point of the document.</p>

<h2>What good tooling should do</h2>
<p>Judge a resume tool by whether it refuses to invent. Ours uses <code>[X]</code> placeholders where a metric is missing rather than filling in a plausible figure, because a blank you fill in honestly is worth more than a number you have to defend. That constraint is the difference between a tool that helps and one that hands you a problem.</p>

<h2>Try the middle path</h2>
<p><a href="/upload-resume">Upload your CV to CVEdge</a> for a free ATS score and bullet-level rewrite suggestions — you keep the underlying claims, the tool handles structure and keyword alignment, and nothing gets fabricated on your behalf.</p>`,
  },

  {
    slug: "resume-vs-cv-what-recruiters-actually-expect-in-2026",
    title: "Resume vs CV: What Recruiters Actually Expect in 2026",
    brief:
      "The difference depends entirely on where you are applying. Here is what each term means by region, what each document should contain, and the details that get international applications rejected.",
    seo_title: "Resume vs CV — What Recruiters Expect by Region in 2026 | CVEdge",
    seo_description:
      "Resume vs CV: what the terms mean in the US, UK, Europe, Middle East and Asia, what each document should contain, and the regional details that get applications rejected.",
    read_time_minutes: 8,
    content_html: `<p>"Resume" and "CV" mean different things depending on who is asking, and applying with the wrong assumption is a genuine and avoidable source of rejection — particularly for international applications. Here is what each term means where.</p>

<h2>United States and Canada</h2>
<p><strong>Resume</strong> is the default: one to two pages, tailored per application, covering relevant experience rather than everything you have done.</p>
<p><strong>CV</strong> in North America means something specific and narrow — an exhaustive academic document listing publications, grants, conference presentations and teaching. It is used for academia, research and some medical roles, and it can run to many pages. If a US employer outside those fields asks for a CV, they almost certainly mean a resume.</p>
<p><strong>Critically:</strong> no photo, no date of birth, no marital status, no nationality. US and Canadian employers frequently discard applications containing these, because their presence creates discrimination-liability exposure. This is the single most common mistake on applications sent from regions where photos are standard.</p>

<h2>United Kingdom and Ireland</h2>
<p><strong>CV</strong> is the standard term for what Americans call a resume. Two pages is the norm; one page is acceptable early-career.</p>
<p>No photo, and date of birth is not expected. A brief personal statement at the top is conventional. Listing "References available on request" is unnecessary — it is assumed, and it consumes a line you could use better.</p>

<h2>Continental Europe</h2>
<p>Conventions vary meaningfully by country, and the differences are worth checking rather than assuming.</p>
<p>In <strong>Germany</strong>, applications are traditionally more formal and photos have been common, though the practice has been declining since anti-discrimination legislation. German applications may also include certificates and references as attachments.</p>
<p>In <strong>France</strong>, one to two pages, and photos are common though not required. In the <strong>Netherlands</strong> and <strong>Scandinavia</strong>, conventions run closer to the UK, and photos are less usual.</p>
<p>The <strong>Europass</strong> format exists and is accepted across the EU, though many private-sector recruiters find it rigid and it is rarely the strongest choice outside public-sector or cross-border applications.</p>

<h2>Middle East (UAE, Saudi Arabia, Qatar)</h2>
<p><strong>CV</strong> is the term used. Expectations here differ most from Western norms, and applications that ignore them stand out.</p>
<p>Photos are common and often expected. Nationality is frequently included, and is genuinely relevant to employers navigating visa and quota requirements. Date of birth and marital status appear more often than in Western markets. Also worth stating explicitly: your visa status, notice period, and whether you hold a local driving licence — these are practical screening criteria in the region.</p>
<p>Three pages is more acceptable than in the UK or US.</p>

<h2>India, Singapore and much of Asia</h2>
<p><strong>Resume</strong> and <strong>CV</strong> are used more or less interchangeably in India, with "resume" more common in the private sector. Two to three pages is normal, and more personal detail traditionally appears than would be usual in the West.</p>
<p>For multinational employers in <strong>Singapore</strong> and <strong>Hong Kong</strong>, conventions run closer to UK and US norms — brief, no photo. Match the company's origin rather than the country you are applying from.</p>

<h2>The practical rule</h2>
<p>Match the destination, not your origin. If you are applying from a region where photos are standard to a company in one where they are a liability, remove the photo. If you are applying from the UK to the Gulf, adding visa status and notice period will help you.</p>
<p>Where the employer is a multinational, follow the conventions of the country the role is based in — that is where the hiring manager sits.</p>

<h2>What does not change</h2>
<p>Regional formatting differs; the substance does not. Everywhere, the CV that wins states what you did, at what scale, and what changed as a result. Everywhere, bullets that describe duties rather than outcomes underperform. Everywhere, the top third of page one carries disproportionate weight.</p>
<p>Get the substance right once, then adjust the regional presentation per application. That is a ten-minute change, not a rewrite.</p>

<h2>Build both versions</h2>
<p>CVEdge lets you keep multiple versions of the same underlying content, so you can maintain a photo-free two-page version for UK and US applications and a fuller version for the Gulf without rewriting anything. <a href="/upload-resume">Start free</a>, or read our region-specific guides on <a href="/blog/uae-resume-format-2026">UAE resume format</a> and <a href="/blog/saudi-arabia-cv-format-guide-2026">Saudi Arabia CV format</a>.</p>`,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // Metadata-only fix. This post carried the seo_title and seo_description of
  // "why-you-re-not-hearing-back-after-applying" — evidently copy-pasted at
  // creation — so Google saw a title about job applications on an article about
  // ATS software, and two URLs competed on identical metadata. Body is fine
  // (only 6% overlap between the two), so only the metadata is corrected.
  {
    slug: "what-is-ats-software-and-how-does-it-work",
    seo_title: "What Is ATS Software and How Does It Work? (2026 Guide) | CVEdge",
    seo_description:
      "What an applicant tracking system actually does with your CV — parsing, keyword search, ranking and knockout questions — and what it does not do.",
    brief:
      "Applicant tracking systems are widely misunderstood. Here is what ATS software actually does with your CV, how recruiters really use it, and which myths to ignore.",
  },

  // ────────────────────────────────────────────────────────────────────────────
  // The duplicate PM guide. Two near-identical posts compete with each other and
  // read as scaled content; retire the weaker one rather than expanding it.
  {
    slug: "project-manager-resume-guide-2026-2",
    is_published: false,
  },
];

async function main() {
  const supabase = createAdminClient();
  let updated = 0;
  let missing = 0;
  const backup: Record<string, unknown>[] = [];

  for (const post of POSTS) {
    const { slug, ...fields } = post;

    // Select every field this script can overwrite, so the snapshot is a
    // complete restore point rather than a partial one.
    const { data: existing, error: findErr } = await supabase
      .from("blog_posts")
      .select(
        "id, slug, title, brief, seo_title, seo_description, read_time_minutes, content_html, is_published, updated_at"
      )
      .eq("slug", slug)
      .maybeSingle();

    if (findErr) {
      console.error(`Lookup failed for ${slug}: ${findErr.message}`);
      continue;
    }
    if (!existing) {
      console.warn(`No post found with slug "${slug}" — skipping.`);
      missing++;
      continue;
    }

    const words = fields.content_html
      ? fields.content_html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length
      : 0;

    if (DRY) {
      console.log(
        fields.is_published === false
          ? `[dry] would UNPUBLISH ${slug}`
          : `[dry] would update ${slug} → ~${words} words`
      );
      continue;
    }

    backup.push(existing);

    const { error } = await supabase
      .from("blog_posts")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("slug", slug);

    if (error) {
      console.error(`Failed to update ${slug}: ${error.message}`);
      continue;
    }

    console.log(
      fields.is_published === false ? `Unpublished ${slug}` : `Updated ${slug} (~${words} words)`
    );
    updated++;
  }

  if (backup.length > 0) {
    writeFileSync(BACKUP_PATH, JSON.stringify(backup, null, 2));
    console.log(`\nPre-update snapshot written to ${BACKUP_PATH}`);
    console.log("Restore with: npx tsx scripts/expand-thin-blog-posts.ts --restore <file>");
  }

  console.log(`\nDone: ${updated} updated, ${missing} not found.${DRY ? " (dry run)" : ""}`);
}

/** Restore posts from a snapshot produced by a previous run. */
async function restore(file: string) {
  const supabase = createAdminClient();
  const rows = JSON.parse(require("node:fs").readFileSync(file, "utf8")) as Record<string, unknown>[];
  let restored = 0;

  for (const row of rows) {
    const { id: _id, slug, ...fields } = row as { id: string; slug: string };
    const { error } = await supabase.from("blog_posts").update(fields).eq("slug", slug);
    if (error) {
      console.error(`Failed to restore ${slug}: ${error.message}`);
      continue;
    }
    console.log(`Restored ${slug}`);
    restored++;
  }
  console.log(`\nRestored ${restored} posts from ${file}.`);
}

const restoreIdx = process.argv.indexOf("--restore");
const run = restoreIdx !== -1 ? restore(process.argv[restoreIdx + 1]) : main();

run.catch((e) => {
  console.error(e);
  process.exit(1);
});
