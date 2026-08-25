// Second thin-content pass, after AdSense rejected the site a second time.
//
// The August 14 remediation measured word counts by crawling the rendered page,
// which includes roughly 130 words of navigation, footer and CTA chrome on every
// URL. A 316-word article measured as ~450 and cleared the 400-word bar, so the
// audit concluded "the only page under 400 words is /terms" while fifteen
// articles were in fact between 290 and 457 words. This script measures the
// article body only, and fixes what that measurement actually finds.
//
// Twelve posts are rewritten to full length. Three are retired: each covered the
// same ground as a longer surviving article, so the topic now has one canonical
// page instead of two competing ones. Their URLs 301 to the survivor — see the
// redirects block in next.config.mjs, which must ship in the same deploy.
//
// Run: npx tsx scripts/expand-thin-blog-posts-2.ts
//      npx tsx scripts/expand-thin-blog-posts-2.ts --dry
//      npx tsx scripts/expand-thin-blog-posts-2.ts --restore <backup-file.json>
import { createAdminClient } from "../lib/supabase/admin";
import * as dotenv from "dotenv";
import { writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
dotenv.config({ path: ".env.local" });

const DRY = process.argv.includes("--dry");
const RESTORE_IDX = process.argv.indexOf("--restore");

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
  /** Set false to retire a post whose topic is better served by another URL. */
  is_published?: boolean;
}

/**
 * The three retired duplicates. Each 301s to the article named in the comment,
 * which covers the same topic at three to four times the length.
 */
const RETIRED: PostUpdate[] = [
  // → /blog/ats-resume-format-what-actually-works-in-2026 (870 words).
  // Also carried a typo in both title and slug: "ATS Resume gude 2026".
  { slug: "ats-resume-gude-2026", is_published: false },
  // → /blog/how-to-get-past-the-ats (1,208 words). Near-identical title.
  { slug: "how-to-get-past-the-ats-in-2026-complete-resume-optimization-guide", is_published: false },
  // → /blog/how-to-tailor-your-cv-for-a-job-description (967 words).
  { slug: "how-to-tailor-your-resume-for-every-job-application-step-by-step-guide", is_published: false },
];

const POSTS: PostUpdate[] = [
  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: "your-cv-is-failing-before-a-human-sees-it-here-s-why",
    title: "Your CV Is Failing Before a Human Sees It — How to See What the Parser Sees",
    brief:
      "Parsing failures are invisible from your side: the CV looks perfect on screen while the record behind it is missing your phone number. Three ways to see the extracted version, and what to fix when it is wrong.",
    seo_title: "See What the ATS Extracted From Your CV | CVEdge",
    seo_description:
      "Your CV can look perfect and still parse badly. How to inspect the structured record an ATS builds from your file, and the formatting choices that corrupt it.",
    read_time_minutes: 8,
    content_html: `<p>There is a specific failure mode that almost nobody checks for, because from the applicant's side it is completely invisible. Your CV looks exactly as you designed it. The PDF opens correctly. You send it, and the record that arrives on the other side is missing your phone number, or has your job titles interleaved with your dates, or lists your most recent employer as the name of a section heading.</p>
<p>This is a parsing failure, and it is different from every other reason an application fails. A weak bullet is still a readable bullet. A mismatched application is still a legible CV. A parsing failure produces a corrupted record, and no amount of rewriting fixes it because the words never survived the conversion.</p>

<h2>What the parser is actually building</h2>
<p>When you upload a file, the system does not store your document as the thing it screens. It converts it into structured fields: name, email, phone, then a list of employment entries each with a title, an employer, a start date and an end date, then education, then skills. That structured record is what a recruiter searches against and what appears in their list view.</p>
<p>Parsers do this by recognising conventional patterns — a line that looks like a heading, a date range in a familiar shape, a block of text positioned where experience usually sits. They are pattern matchers, not readers. When your document matches the conventions, extraction is near-perfect. When it does not, the parser does not report an error; it guesses, and the guess is what gets stored.</p>

<h2>Three ways to see the extracted version</h2>
<p>You do not have to speculate about this. There are three practical ways to inspect what actually comes out of your file.</p>
<h3>1. The select-and-paste test</h3>
<p>Open your CV as a PDF, select all, copy, and paste into a plain text editor. What you see is close to the raw text stream a parser starts from. Read it in that order. If your name and contact details are absent, they are sitting in a document header that many parsers never read. If lines from your left and right columns alternate mid-sentence, your two-column layout is being read across rather than down. If a whole section is missing, it was an image.</p>
<p>This test takes thirty seconds and catches the majority of serious parsing damage.</p>
<h3>2. Upload it to a parser and read the fields back</h3>
<p>The paste test shows you the text stream but not the field assignment. To see that, put the file through a tool that shows you the structured output — which employer it assigned to which title, which dates it attached to which role. <a href="https://www.thecvedge.com/upload-resume">CVEdge's checker</a> does this free and without an account, and any tool that shows extracted fields rather than only a score will do the same job.</p>
<p>What you are looking for is not the score. It is whether the fields are right.</p>
<h3>3. Save as plain text and read the result</h3>
<p>Export or save your CV as .txt from your editor. This forces every visual element to resolve to text or disappear. Anything that vanishes — a skills rating bar, an icon standing in for "email", a logo carrying your name — was never text, and was never going to be extracted.</p>

<h2>What actually breaks extraction</h2>
<p>In rough order of how much damage they cause:</p>
<ul>
<li><strong>Contact details in a document header or footer.</strong> The single most costly formatting choice, because the failure removes the recruiter's ability to contact you at all. Put your name, email, phone and location in the body of the first page.</li>
<li><strong>Multi-column layouts built with tables or text boxes.</strong> A parser reading a two-column CV may read straight across the page, producing lines that mix your skills list into your job history. Some modern parsers handle columns well; many do not, and you cannot tell which one is on the other end.</li>
<li><strong>Text rendered as an image.</strong> A CV exported as a picture, a logo containing your name, a screenshot of a chart. There is no text to extract, so nothing is extracted.</li>
<li><strong>Non-standard section headings.</strong> "Where I have made an impact" is a lovely heading that a parser does not recognise as Experience. Use the conventional words. Creativity in the headings costs you the structure and buys nothing.</li>
<li><strong>Skills shown as ratings.</strong> Five filled dots next to "Python" communicates nothing to a parser, and honestly not much to a recruiter either.</li>
<li><strong>Unusual date formats.</strong> "Summer '22 – present" is human-readable and machine-hostile. Use a consistent, conventional format such as "Mar 2022 – Present" throughout.</li>
</ul>

<h2>What does not break it</h2>
<p>It is worth being clear about the other direction, because a lot of advice overcorrects into recommending genuinely bad CVs. Parsers do not require an ugly document. Colour is fine. A sensible non-default typeface is fine. Bold text, horizontal rules, a tasteful accent on section headings — all fine, because none of them change the text stream or the reading order.</p>
<p>What matters is structure, not decoration: real text, one clear reading order, conventional headings, contact details in the body. A CV can be well designed and parse perfectly. The two are not in tension, and any advice that tells you to strip your CV back to unstyled black Times New Roman is solving the problem with a sledgehammer.</p>

<h2>The order to fix things in</h2>
<p>If the paste test reveals problems, fix them before you touch anything else about your CV. There is no point rewriting bullets for impact when the bullets are being shuffled into the wrong job. Move contact details into the body, collapse a broken two-column layout into a single column or rebuild it without tables, replace image-based elements with text, and normalise the headings and dates.</p>
<p>Then re-run the paste test. When the plain text version reads correctly top to bottom, the structural problem is solved and the ordinary work of making the content compelling can begin — which is where the rest of the effort belongs.</p>
<p>You can check the extracted fields for your own CV in about a minute with the <a href="https://www.thecvedge.com/upload-resume">free ATS checker</a>, no account required.</p>`,
  },
  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: "common-resume-mistakes-that-cost-you-interviews-and-how-to-fix-them",
    title: "Common Resume Mistakes That Cost You Interviews (And How to Fix Them)",
    brief:
      "The recurring faults that cost interviews are duller than most advice suggests: unmeasured bullets, buried relevance, and formatting that breaks parsing. Each one, what it costs, and the fix.",
    seo_title: "Resume Mistakes That Get You Rejected — With Fixes | CVEdge",
    seo_description:
      "The resume mistakes that actually cost interviews, ordered by how much damage they do — and the specific fix for each one.",
    read_time_minutes: 9,
    content_html: `<p>Most lists of resume mistakes are padded with things that do not matter much — a photo, an objective statement, the word "references available on request". Those are minor. The faults that genuinely cost interviews are duller and more structural, and they show up in the large majority of CVs that get rejected. Here they are, roughly in order of how much damage each one does.</p>

<h2>1. Responsibilities where outcomes should be</h2>
<p>This is the most common serious fault, and it is nearly universal. A bullet that reads "Responsible for managing the social media accounts" describes the job description you were given, not what you did with it. Every person who held that title could write the same line, which means it distinguishes you from nobody.</p>
<p><strong>The fix:</strong> for each bullet, ask what changed because you were the one doing it. Then state the change. "Responsible for managing social media" becomes "Grew organic social referrals from 4% to 11% of signups over eight months by shifting posting cadence and rebuilding the content calendar around product launches."</p>
<p>If you genuinely cannot recall a number, state the outcome qualitatively and specifically rather than reaching for a fake one. "Rebuilt the content calendar around product launches, which became the team's standard approach for subsequent releases" is honest and still says something.</p>

<h2>2. Numbers you cannot defend</h2>
<p>The overcorrection to the fault above is worse than the fault. Inventing "increased efficiency by 40%" because the advice said to use metrics creates the single worst interview topic available to you, because interviewers probe numbers precisely because numbers are checkable. Being unable to explain where your own figure came from ends the conversation.</p>
<p><strong>The fix:</strong> use only numbers you could walk someone through. Where a number would help but you do not have it, an honest range or a scale indicator works: "a team of six", "across roughly 200 stores", "the second-largest of our four regions". Scale is a metric even when magnitude is not.</p>

<h2>3. Relevance buried below the fold</h2>
<p>A recruiter's first pass over a CV is very fast — the widely cited figure is six to eight seconds, and while the precise number varies by study, the finding that the first scan is brief and pattern-based is robust. In that time, attention goes to your most recent title, your current employer, your dates, and whether the top of the page signals relevance to the role in front of them.</p>
<p>If the thing that makes you a strong candidate for this specific job is in the fourth bullet of your second role, it will not be found.</p>
<p><strong>The fix:</strong> treat the top third of page one as the only guaranteed real estate. A two-line summary that states your specialisation and level, followed immediately by your most recent role with its strongest bullets first. Order bullets within each role by relevance to the job you are applying for, not chronologically or by how proud you are of them.</p>

<h2>4. Formatting that breaks the parse</h2>
<p>Contact details in a document header that parsers do not read. Two-column layouts built with tables that get read across rather than down. Skills shown as rating bars with no underlying text. Any of these can corrupt the structured record built from your file, and the failure is silent.</p>
<p><strong>The fix:</strong> select all in your PDF, copy, and paste into a plain text editor. If that plain text version reads correctly in order and contains your phone number, you are fine. If it does not, fix the structure before anything else — there is no value in polishing bullets that arrive scrambled.</p>

<h2>5. One CV sent everywhere</h2>
<p>The same document sent to forty postings will be a poor match for most of them, because job descriptions in the same nominal role differ substantially in what they emphasise. A CV optimised for none of them is competing against CVs optimised for each.</p>
<p><strong>The fix:</strong> tailoring does not mean rewriting. It means a focused edit of three things — the summary line, the skills section, and the ordering and wording of four or five bullets — to match the vocabulary and priorities of the specific posting. Fifteen minutes per application, applied to fewer applications, beats forty untailored sends.</p>

<h2>6. Vocabulary that does not match how recruiters search</h2>
<p>If a posting says "Kubernetes" and your CV says "container orchestration", a keyword search will not surface you. This is not because a robot is scoring you down; it is because recruiters search their applicant database by keyword and work through the results, and you are not in the result set.</p>
<p><strong>The fix:</strong> name the specific technologies, tools, methodologies and certifications the posting names, in the same words, wherever they are genuinely true of your experience. Write both forms where both are used in your field: "container orchestration (Kubernetes)".</p>
<p>This is not permission to stuff keywords. Hidden white text and irrelevant skill lists are transparent to the human who eventually reads the document, and they read as manipulation.</p>

<h2>7. Unexplained gaps and vague dates</h2>
<p>Employment gaps are common and rarely disqualifying. What creates suspicion is trying to obscure one — dropping months and showing only years so a fourteen-month gap looks like a seamless transition. Recruiters notice this pattern, and having noticed it, they now wonder what else is being smoothed over.</p>
<p><strong>The fix:</strong> use consistent month-and-year dates throughout, and give a gap a one-line factual explanation where it helps: "Career break — full-time caregiving" or "Sabbatical, travel". Stated plainly, it stops being a question.</p>

<h2>8. Length that does not match your experience</h2>
<p>A three-page CV from someone with four years of experience signals an inability to prioritise. A one-page CV from someone with eighteen years signals that most of the relevant evidence has been cut. Neither is fatal, and both are easy to get right.</p>
<p><strong>The fix:</strong> roughly one page up to about ten years, two pages beyond that. Older roles compress to a title, employer and dates. Nothing before about fifteen years back needs bullets at all unless it is unusually relevant.</p>

<h2>Where to start</h2>
<p>Fix them in order. The parse first, because everything else depends on it. Then relevance and ordering, because that is what the six-second scan sees. Then the bullets themselves, which is the slowest work and the one most people start with.</p>
<p>If you want the specific list for your own CV rather than the general one, the <a href="https://www.thecvedge.com/upload-resume">free checker</a> reports which of these are present in your document and where.</p>`,
  },
  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: "best-resume-builder-2026",
    title: "Best Resume Builder for 2026: 7 Tools Compared",
    brief:
      "Seven resume builders compared on the thing that decides interviews — whether the tool improves what your CV says, not how it looks. Includes where each one puts its paywall.",
    seo_title: "Best Resume Builder 2026 — 7 Tools Compared Honestly | CVEdge",
    seo_description:
      "An honest comparison of seven resume builders in 2026: what each one actually does, where the paywall sits, and which type of tool fits which problem.",
    read_time_minutes: 9,
    content_html: `<p>Resume builders fall into three groups that solve genuinely different problems, and most comparison articles muddle them together. Some are design tools: they give you a good-looking document quickly. Some are analysis tools: they tell you what is wrong with the document you already have. A few try to do both. Picking well starts with knowing which problem you actually have.</p>
<p>We build one of the tools on this list, so read our own entry with that in mind. We have tried to be specific about where the others are genuinely better.</p>

<h2>First: which problem do you have?</h2>
<p>If you have no CV, or one so old it needs starting over, you have a <strong>construction</strong> problem and you want a builder with good templates and a fast editor.</p>
<p>If you have a CV that is not getting responses, you have a <strong>diagnosis</strong> problem, and a template will not help you. You need something that tells you what is failing — parsing, keyword coverage, or the content itself.</p>
<p>Most people applying unsuccessfully have the second problem and buy a tool for the first, which is why so many people end up with a beautifully formatted CV that performs exactly as badly as the old one.</p>

<h2>The comparison</h2>

<h3>CVEdge</h3>
<p><em>Analysis-first, with a builder attached.</em> Scores your CV across six categories, shows the specific issues behind the score, and rewrites bullets from what you actually wrote rather than generating claims from your job title. Free tier includes ATS scoring, the full issue breakdown, twenty-four templates and PDF export without a watermark.</p>
<p><strong>Where it is weaker:</strong> the template library is smaller than the design-led tools, and if what you want is a visually distinctive creative CV, several tools below do that better. The AI rewriter deliberately inserts <code>[X]</code> placeholders instead of inventing metrics, which is the right behaviour but means more work for you.</p>

<h3>Zety</h3>
<p><em>Design-led.</em> Strong templates, a genuinely pleasant editor, and pre-written content suggestions by job title that are useful as a starting point when you are staring at a blank page.</p>
<p><strong>Where it is weaker:</strong> you build free and pay to download, which people regularly discover at the end of the process. ATS feedback is light — it checks structure more than substance. The content suggestions are generic by construction, and a CV assembled from them reads like one.</p>

<h3>Teal</h3>
<p><em>Job-search management.</em> The strongest tool on this list for tracking applications: a browser extension that saves postings, a pipeline view, and per-job CV versions. If you are running thirty live applications, this is the one that stops you losing track.</p>
<p><strong>Where it is weaker:</strong> it manages your search better than it improves your CV. Matching and analysis exist but are not the depth of a dedicated checker, and the free tier limits how much of the analysis you can see.</p>

<h3>Resume.io</h3>
<p><em>Fast and polished.</em> Probably the quickest path from nothing to a professional-looking PDF. The editor is clean and the output is consistently good-looking.</p>
<p><strong>Where it is weaker:</strong> subscription required to download, and it is a construction tool with little diagnostic depth. If your CV already exists and is not working, this will make it prettier and no more effective.</p>

<h3>Enhancv</h3>
<p><em>Personal branding.</em> The most distinctive output of any tool here — custom sections, personality-led layouts, room to present yourself as more than a job history. Genuinely good for design, brand and creative roles where the CV is itself a work sample.</p>
<p><strong>Where it is weaker:</strong> the layouts that make it distinctive are also the ones most likely to parse badly, particularly the multi-column and infographic styles. For a corporate or high-volume application process, that is a real risk.</p>

<h3>Kickresume</h3>
<p><em>Beginner-friendly.</em> A large library of filled-in example CVs by role, which is the fastest way to understand what a finished CV in your field looks like when you have never written one. Good for students and career changers.</p>
<p><strong>Where it is weaker:</strong> examples are a floor, not a ceiling. Following one closely produces a competent, unremarkable CV, and the optimisation tooling is thin.</p>

<h3>Resume Worded</h3>
<p><em>Feedback-focused.</em> Line-by-line scoring with specific critiques of individual bullets, plus a LinkedIn review. The feedback is often sharper and more granular than the competition.</p>
<p><strong>Where it is weaker:</strong> it critiques more than it builds — you will be editing your CV somewhere else — and the free tier is limited enough that serious use means paying.</p>

<h2>What most of these get wrong</h2>
<p>The common failure across the category is optimising appearance and calling it optimisation. A tool that checks whether you have a skills section, whether your bullets start with verbs, and whether the document is one page can return a high score for a CV that says nothing specific about what you achieved. Structural checks are easy to automate; judging whether your experience is compelling is not, and no current tool does it well.</p>
<p>The second failure is fabrication. Several builders will generate achievements from a job title, producing plausible-sounding accomplishments you never had. These read fine on the page and fall apart in the interview, because interviewers ask about numbers specifically. Any tool that writes your experience for you is handing you a liability.</p>

<h2>How to choose</h2>
<ul>
<li><strong>No CV yet:</strong> a design-led builder — Resume.io, Zety or Kickresume — to get to a solid first draft fast.</li>
<li><strong>CV exists but gets no responses:</strong> an analysis tool first. Find out whether the problem is parsing, keyword coverage or content before you redesign anything.</li>
<li><strong>Running many applications at once:</strong> Teal, for the tracking alone.</li>
<li><strong>Design or creative role:</strong> Enhancv, with the caveat that you should check the output parses and keep a plain version for portals.</li>
<li><strong>Want detailed line-level critique:</strong> Resume Worded.</li>
</ul>
<p>Whichever you use, the honest summary is that a tool can fix presentation, parsing and vocabulary. It cannot make a weak application competitive, and any tool promising otherwise is selling you something. If your CV accurately represents strong, relevant experience and still gets no responses, the problem is usually one of the first three — which is at least the good news, because those are the fixable ones.</p>
<p>You can check where yours stands with the <a href="https://www.thecvedge.com/upload-resume">free ATS checker</a> without creating an account.</p>`,
  },
  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: "zety-alternative-free-resume-builder",
    title: "Zety Alternative: What Changes If You Switch",
    brief:
      "Zety lets you build free and charges to download. What a genuinely free alternative changes about the workflow, where the real trade-offs sit, and how to move an existing CV across.",
    seo_title: "Zety Alternative 2026 — Free Resume Builder With ATS Scoring | CVEdge",
    seo_description:
      "Considering a Zety alternative? What you gain and give up moving to a free builder with real ATS scoring, and how to migrate a CV you already built.",
    read_time_minutes: 8,
    content_html: `<p>Zety is a good product. The templates are well made, the editor is pleasant to use, and the pre-written content suggestions genuinely help when you are looking at an empty page. Most people who go looking for an alternative are not unhappy with the quality — they are unhappy with the moment they discover the download is paid, after investing an hour in building the document.</p>
<p>We make one of the alternatives, so treat this as an interested party trying to be accurate rather than a neutral review. The trade-offs below are real ones.</p>

<h2>What you are actually paying for</h2>
<p>Zety's model is build-free, pay-to-download. That is a legitimate business model and not a scam — the value was delivered, the payment is for the output. But it has two practical consequences worth knowing before you start.</p>
<p>The first is timing: the cost appears at the point of maximum sunk effort, which is uncomfortable even when the price is fair. The second is iteration cost. A CV is not a document you write once. You will revise it as you apply to different roles, and if each export sits behind a subscription, the natural instinct is to send the same version everywhere rather than tailor it — which is exactly the behaviour that reduces your response rate.</p>

<h2>What a free alternative changes</h2>
<p>The substantive difference is not the money. It is that free export removes the friction from iteration.</p>
<p>Tailoring a CV to a specific posting is one of the highest-return things you can do per unit of effort: edit the summary, adjust the skills list, reorder and reword a handful of bullets to match the posting's vocabulary. It takes about fifteen minutes. It only happens in practice if exporting the result is free, because otherwise every tailored version has a price attached.</p>
<p>The second difference, at least in our case, is what the tool does beyond formatting. Zety's ATS feedback is real but light — it checks structure more than substance. An analysis-first tool scores keyword coverage against the actual posting, flags bullets that state responsibilities rather than outcomes, and shows the extracted fields so you can see whether your contact details survived the parse.</p>

<h2>What you give up</h2>
<p>Being straightforward about this: Zety's template library is larger than ours, and several of its designs are better looking than anything we ship. If your priority is a visually distinctive document and your applications go to people rather than portals, that is a real argument for staying.</p>
<p>Zety's content suggestions by job title are also genuinely useful for people starting cold. Our rewriter deliberately will not do that — it restructures what you have written and inserts an <code>[X]</code> placeholder where a metric is missing rather than inventing a figure. That is the right behaviour, because an invented number is the worst possible interview topic, but it does mean the blank page is still your problem to solve.</p>
<p>And if you have already built and paid for a CV you are happy with, there is no reason to move. Switching tools is not a strategy.</p>

<h2>Other alternatives worth knowing</h2>
<p>It is not a two-horse race, and the right answer depends on your problem:</p>
<ul>
<li><strong>Resume.io</strong> — similar build-free-pay-to-download model, faster editor, comparable template quality. A lateral move rather than a fix if the paywall is your objection.</li>
<li><strong>Teal</strong> — much stronger if your real problem is managing thirty live applications rather than producing one document.</li>
<li><strong>Enhancv</strong> — better for creative and design roles where the CV is a work sample, with the caveat that its most distinctive layouts carry the most parsing risk.</li>
<li><strong>A plain document in Google Docs</strong> — genuinely viable. A well-structured single-column CV with standard headings, real text and contact details in the body parses perfectly and costs nothing. Builders add convenience and analysis, not a capability you lack.</li>
</ul>

<h2>Moving a CV you already built</h2>
<p>If you do switch, you do not need to retype anything.</p>
<ol>
<li><strong>Get the content out.</strong> If you already downloaded a PDF, that is your source. If not, select all in the Zety preview, copy, and paste into a plain text file — you lose formatting and keep every word, which is what matters.</li>
<li><strong>Import it.</strong> Upload the PDF or paste the text into the new tool and let it parse the structure. Expect to correct a few field assignments; parsing is good, not perfect.</li>
<li><strong>Check the extraction before the design.</strong> Confirm every role, date and contact detail came across correctly. This is the step people skip, and it is the one that matters.</li>
<li><strong>Pick a template last.</strong> Choose the layout after the content is right, not before.</li>
<li><strong>Run an analysis pass.</strong> Score the imported CV, read the specific issues, and fix them before you send it anywhere.</li>
</ol>
<p>Budget twenty minutes for the whole migration.</p>

<h2>The honest summary</h2>
<p>If your CV is well written and simply needs a good-looking container, Zety does that well and the fee is not unreasonable. If your CV is not getting responses, no builder in this category will fix that by making it prettier, and the useful question is which tool tells you <em>why</em> — parsing, keyword coverage, or content — so you know what to change.</p>
<p>That diagnosis is free here: the <a href="https://www.thecvedge.com/upload-resume">ATS checker</a> reports your score, the extracted fields and the specific issues found without an account or a card.</p>`,
  },
  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: "uae-resume-format-2026",
    title: "UAE Resume Format 2026: What Gulf Recruiters Expect",
    brief:
      "A UAE CV follows different conventions to a US or UK one — on photos, personal details and visa status. What to include, what to leave out, and why the norms differ.",
    seo_title: "UAE Resume Format 2026 — What Gulf Recruiters Expect | CVEdge",
    seo_description:
      "How a UAE CV differs from a Western one: photo and personal details conventions, visa status, notice period, and the structure Gulf recruiters expect in 2026.",
    read_time_minutes: 9,
    content_html: `<p>A CV that works in London or San Francisco is not quite the right document for Dubai or Abu Dhabi. The differences are not cosmetic. They come from a labour market where the great majority of the workforce is expatriate, where hiring is tied to visa sponsorship, and where a recruiter's first practical question is often not about your skills at all but about how quickly and cheaply you can start.</p>
<p>This is what changes, and why.</p>

<h2>The structural difference: sponsorship drives screening</h2>
<p>In most Western markets, work authorisation is a background check late in the process. In the UAE, employment and residency are directly linked — your employer sponsors your residence visa — so your current status has an immediate cost implication for the hiring company.</p>
<p>This single fact explains most of the convention differences below. A recruiter sorting a hundred applications is filtering on availability and transfer cost as much as on capability, and a CV that leaves those questions unanswered gets set aside in favour of one that answers them.</p>

<h2>Personal details: what to include</h2>
<p>Gulf CVs conventionally carry personal information that a US CV would deliberately omit. Include:</p>
<ul>
<li><strong>Nationality.</strong> Standard and expected. It is relevant to visa processing and quota considerations.</li>
<li><strong>Current visa status.</strong> The most useful line you can add. State it plainly: "Employment visa (transferable)", "Visit visa", "Golden Visa", "Spouse-sponsored — no sponsorship required", or "Requires sponsorship". A candidate who needs no new sponsorship is materially cheaper and faster to hire, and if that is you, say so where it will be seen.</li>
<li><strong>Current location.</strong> "Dubai, UAE" tells a recruiter you are available for an in-person interview this week. If you are applying from abroad, say so and state your notice period and availability.</li>
<li><strong>Notice period.</strong> Include it. "Available immediately" or "30 days' notice" is a genuine differentiator in a market that hires quickly.</li>
<li><strong>Languages, with honest proficiency levels.</strong> Arabic is a real advantage for client-facing, government-adjacent and public-sector-linked roles. If you have it, list the level accurately — "conversational" and "business fluent" are different claims and both get tested.</li>
</ul>
<p>On <strong>photographs</strong>: a professional headshot is conventional and widely expected in the region. It is not mandatory and its absence will not disqualify you, but its presence is unremarkable here in a way it would not be in the US or UK. If you include one, make it a plain professional headshot.</p>
<p>Some older Gulf CV templates also ask for date of birth, marital status, religion and passport number. These conventions are fading, and there is no need to volunteer them. Date of birth and marital status still appear commonly enough to be unremarkable if you include them; passport numbers should never be on a document you email widely, for straightforward security reasons.</p>

<h2>What to leave out</h2>
<p>The UAE market runs on international norms for the actual professional content. Skip the padding: an objective statement that says you are seeking a challenging role, a full list of every school you attended, references and their contact details, and any personal detail that is not one of the practical ones above.</p>

<h2>Structure that works</h2>
<ol>
<li><strong>Header</strong> — name, phone with UAE or international country code, email, location, LinkedIn. In the body of the page, never in a document header, which many parsers do not read.</li>
<li><strong>Status line</strong> — nationality, visa status, notice period. One line, immediately visible.</li>
<li><strong>Professional summary</strong> — two or three lines stating your specialisation, years of experience, and regional experience if you have it. "Eight years in FMCG supply chain, five of them across GCC markets" does more work than any adjective.</li>
<li><strong>Experience</strong> — reverse chronological, with outcomes rather than duties, and regional context named where relevant.</li>
<li><strong>Education and certifications</strong> — including attestation status if your degree is already attested, which saves the employer a step.</li>
<li><strong>Skills and languages.</strong></li>
</ol>

<h2>Regional experience is a differentiator — name it</h2>
<p>If you have worked in the GCC before, make that explicit rather than leaving it to be inferred from an employer name a recruiter may not recognise. Name the markets: "Managed distributor relationships across UAE, Oman and Bahrain." Employers value regional familiarity because business norms, regulatory environments and client expectations differ enough that it genuinely shortens ramp-up.</p>
<p>If you have not worked in the region, do not manufacture it. Emphasise transferable scale and any multicultural or multi-market experience you do have.</p>

<h2>Degree attestation</h2>
<p>Employment offers in the UAE typically require your educational certificates to be attested through the relevant authorities in your home country and by UAE authorities. It is a process that takes real time. If yours is already done, one line — "Bachelor of Engineering, attested" — is a small, concrete advantage. If it is not, start it early; it becomes the bottleneck between offer and start date more often than anything else.</p>
<p>Requirements change, so verify the current process with the relevant UAE authority rather than relying on any article, including this one.</p>

<h2>Formatting still has to parse</h2>
<p>Large UAE employers and the regional job portals run applicant tracking systems like everyone else. The Gulf conventions above change what information you include; they do not change the mechanics. Single-column layout, standard section headings, real text rather than images, contact details in the body, and consistent month-and-year dates.</p>
<p>The quickest check: open your PDF, select all, copy, paste into a plain text editor. If it reads correctly in order and contains your phone number, it will parse.</p>

<h2>One document per market</h2>
<p>If you are applying to both Gulf and Western roles, keep two versions. The UAE version carries nationality, visa status and notice period, and possibly a photo. The US or UK version carries none of them — in those markets the same details are at best noise and at worst a legal complication for the employer. Maintaining both takes minutes and prevents sending the wrong one.</p>
<p>For a deeper regional read, see our <a href="https://www.thecvedge.com/blog/saudi-arabia-cv-format-guide-2026">Saudi Arabia CV guide</a>, which covers the Saudization considerations specific to KSA, or check your current CV against ATS parsing with the <a href="https://www.thecvedge.com/upload-resume">free checker</a>.</p>`,
  },
  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: "dubai-cv-format-for-indian-professionals",
    title: "Dubai CV Format for Indian Professionals: What Actually Changes",
    brief:
      "Indian CV conventions and Dubai expectations differ in specific ways — length, salary history, personal details and how experience is framed. What to change when you apply to the UAE.",
    seo_title: "Dubai CV Format for Indian Professionals 2026 | CVEdge",
    seo_description:
      "The specific differences between an Indian CV and a Dubai one: length, salary expectations, notice period, attestation, and how to frame Indian experience for UAE recruiters.",
    read_time_minutes: 9,
    content_html: `<p>Indian professionals are among the largest groups in the UAE workforce, and the path from an Indian job to a Dubai one is well worn. But the CV that got you your current role in Bengaluru or Mumbai is not quite the document a Dubai recruiter is expecting, and the gaps are specific rather than general.</p>
<p>This covers what actually changes. For the broader regional conventions — visa status, photographs, personal details — see our <a href="https://www.thecvedge.com/blog/uae-resume-format-2026">UAE resume format guide</a>; this piece is about the differences that are particular to moving from an Indian CV.</p>

<h2>1. Length: cut it roughly in half</h2>
<p>Indian CVs commonly run three to five pages, and in some sectors that is entirely normal — a detailed project-by-project listing is a genuine convention in Indian IT services, where staffing decisions are made against specific technology stacks.</p>
<p>Dubai recruiters expect two pages, and one if you have under about seven years of experience. The instinct to include every project is the single most common thing Indian applicants need to unlearn. Consolidate: your last three roles get bullets, older roles get a title, employer and dates, and the project list becomes a skills section plus two or three representative examples.</p>

<h2>2. Remove salary history — but be ready for the question</h2>
<p>Many Indian CV templates include current CTC, expected CTC, or both. Take them off the document. Stating a number on the CV anchors the negotiation before you have had a chance to demonstrate value, and it is not a UAE convention.</p>
<p>You will still be asked, usually early and often by the recruiter rather than the employer. Prepare a researched AED figure rather than converting your rupee salary. Direct conversion is the classic mistake: it ignores that UAE income is not taxed, that housing and schooling are frequently the largest costs and are sometimes allowances rather than salary, and that the market rate for your role in Dubai has little relationship to the market rate in India.</p>
<p>Research the AED range for your role and level on the regional job portals, then think in terms of a total package — base, housing allowance, transport, annual flights, medical cover, schooling if you have children — rather than a single number.</p>

<h2>3. Notice period is a real screening criterion</h2>
<p>Indian notice periods of 60 or 90 days are standard at home and long by Gulf standards, where hiring often moves quickly. This genuinely costs candidates opportunities when an employer needs someone in four weeks.</p>
<p>Put your notice period on the CV rather than letting it surface late. If it is negotiable, say so: "90 days' notice, buy-out negotiable" is a materially different proposition from "90 days" alone, and it is worth confirming what your current employer will accept before you start applying.</p>

<h2>4. Add the status line Indian CVs do not have</h2>
<p>Include nationality, current visa status and current location near the top. A recruiter needs to know whether you are applying from India and will need sponsorship, or are already in the UAE on a transferable visa. These are not details to bury — they change the cost and timeline of hiring you, and one line answers them.</p>

<h2>5. Reframe employer names that will not be recognised</h2>
<p>Large Indian employers are well known in the Gulf. Mid-size ones and domestic-market brands often are not, and a recruiter cannot judge the scale of your experience from a name they have never seen.</p>
<p>Add a short parenthetical: "Regional FMCG distributor, ₹800 crore revenue, 1,200 staff" or "Series B fintech, 4 million users". One clause converts an unknown name into a known scale. Do the same for scale within your bullets — team size, budget owned, transaction volume, number of markets.</p>

<h2>6. Start degree attestation early</h2>
<p>UAE employment offers typically require your degree certificate to be attested — for Indian qualifications this generally runs through the issuing university, state-level authorities, the Ministry of External Affairs, and the UAE embassy, then through UAE authorities on arrival. It takes real time and is the most common cause of a delayed start date.</p>
<p>If yours is done, note it on the CV: "B.Tech, attested". If it is not, begin it before you have an offer rather than after. Requirements and routes change, so verify the current process with the relevant authorities rather than relying on any article.</p>

<h2>7. Adjust the vocabulary</h2>
<p>Some standard Indian professional English reads as unfamiliar to a Gulf recruiter working in international business English. A few conventions worth adjusting:</p>
<ul>
<li><strong>"CTC"</strong> — not used in the UAE. Talk about total package if it comes up.</li>
<li><strong>"Lakh" and "crore"</strong> — convert to international notation on the CV. "₹800 crore" can stay if you also give a rough equivalent, but "8 billion rupees" or an approximate AED or USD figure travels better.</li>
<li><strong>"Do the needful", "revert back", "prepone"</strong> — common and perfectly clear in India, unfamiliar or odd-sounding elsewhere. Worth editing out of a document being read internationally.</li>
<li><strong>Honorifics and formal salutations</strong> in a covering email. Keep it direct and brief.</li>
</ul>

<h2>8. Name any GCC or international exposure you have</h2>
<p>Regional experience is a genuine differentiator. If you have worked on GCC accounts from India, handled Middle East clients, travelled to the region for delivery, or worked in a multinational with regional reporting lines, make it explicit — a recruiter will not infer it from an employer name.</p>
<p>If you have none, do not invent it. Emphasise scale, multicultural team experience and any multi-market work instead.</p>

<h2>The mechanics still apply</h2>
<p>UAE employers and the regional portals run applicant tracking systems. Single column, standard headings, real text rather than images, contact details in the body of the page rather than a document header, and consistent month-and-year dates. Check by pasting your PDF into a plain text editor — if it reads correctly in order, it will parse.</p>
<p>You can check the extracted fields and ATS score for your CV free at <a href="https://www.thecvedge.com/upload-resume">CVEdge</a>, no account needed.</p>`,
  },
  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: "saudi-arabia-cv-format-guide-2026",
    title: "Saudi Arabia CV Format Guide 2026: Writing for the KSA Market",
    brief:
      "A Saudi CV is screened against different pressures to a UAE one — Saudization quotas, Vision 2030 sector growth, and Arabic capability. What that changes about what you put on the page.",
    seo_title: "Saudi Arabia CV Format 2026 — Writing for the KSA Market | CVEdge",
    seo_description:
      "How a KSA CV differs from a UAE or Western one: Saudization considerations, Vision 2030 sectors, Arabic language, iqama status, and the structure Saudi recruiters expect.",
    read_time_minutes: 9,
    content_html: `<p>Saudi Arabia and the UAE are often treated as one market by people applying from outside the region. They are not. The Saudi labour market has its own dynamics — a national employment policy that directly shapes hiring, a large state-driven investment programme creating demand in specific sectors, and a different balance of Arabic and English in day-to-day business.</p>
<p>Those differences change what belongs on your CV. If you have already read our <a href="https://www.thecvedge.com/blog/uae-resume-format-2026">UAE guide</a>, the shared Gulf conventions carry across; this covers what is particular to KSA.</p>

<h2>Saudization shapes the screening</h2>
<p>Saudi Arabia operates a national employment programme, commonly known as Saudization or Nitaqat, which sets targets for the proportion of Saudi nationals employed by companies, with the specifics varying by sector and company size. Certain roles and professions have been progressively restricted to Saudi nationals over recent years.</p>
<p>Two practical consequences for an applicant:</p>
<p><strong>If you are a Saudi national</strong>, this is a substantial advantage and your CV should make your nationality immediately visible at the top. Employers have quota targets to meet and actively recruit against them.</p>
<p><strong>If you are an expatriate</strong>, the useful response is to make the case for specialist scarcity. Companies hire expatriates where the skills are not readily available locally, so a CV that reads as generic and interchangeable competes badly, while one that demonstrates specific, hard-to-source technical depth competes well. Be concrete about the specialism, the certifications, and the scale of systems or projects you have handled.</p>
<p>Programme rules and restricted-profession lists change regularly. Verify the current position for your sector with the relevant Saudi authority rather than relying on any article, including this one.</p>

<h2>Vision 2030 concentrates the demand</h2>
<p>Saudi Arabia's economic diversification programme has concentrated hiring in identifiable areas: giga-projects and construction, tourism and hospitality, entertainment and events, renewable energy, mining, healthcare, financial services, logistics, and technology and digital infrastructure.</p>
<p>If your experience touches any of these, connect it explicitly rather than leaving the relevance implicit. A project manager who has delivered large-scale infrastructure, a hospitality operator who has opened new properties, an energy engineer with renewables experience — each of these is directly relevant to stated national priorities, and saying so in the summary line is more effective than any adjective.</p>
<p>This is also where the honest caution applies: sector relevance helps, but claiming alignment you do not have is transparent to anyone who works in it.</p>

<h2>Arabic matters more here than in the UAE</h2>
<p>Business in Saudi Arabia is conducted in both Arabic and English, with the balance depending heavily on sector and employer. Government-linked entities, public-facing roles and much of the domestic corporate sector use Arabic considerably more than the equivalent roles in Dubai.</p>
<p>If you have Arabic, state the level accurately and specifically — "Native", "Business fluent, written and spoken", "Conversational" are meaningfully different claims and each will be tested. If you do not, it is not a barrier for most technical and specialist roles, and there is no benefit to overstating it.</p>

<h2>The status line for KSA</h2>
<p>As in the UAE, put the practical availability facts near the top:</p>
<ul>
<li><strong>Nationality.</strong> Prominent, particularly for Saudi and GCC nationals.</li>
<li><strong>Iqama status</strong> if you are already in the Kingdom — whether you hold a residence permit and whether it is transferable. A candidate already resident with a transferable iqama is faster and cheaper to hire than one requiring a new visa from abroad.</li>
<li><strong>Current location</strong> — Riyadh, Jeddah, Dammam, or applying from abroad.</li>
<li><strong>Notice period and availability.</strong></li>
<li><strong>Languages with honest levels.</strong></li>
</ul>
<p>A professional photograph is conventional and expected, as elsewhere in the Gulf, and its absence is not disqualifying.</p>

<h2>Professional licensing and certificate attestation</h2>
<p>Several professions in Saudi Arabia require registration or accreditation with the relevant national body before you can practise — engineering, healthcare and accounting among them. If you hold the relevant registration, or have begun the process, put it on the CV. It removes a question the employer would otherwise have to raise.</p>
<p>Educational certificates generally require attestation through your home country's authorities and Saudi authorities, as in the UAE, and the process takes time. If it is done, say so. Verify current requirements with the relevant authority; they change.</p>

<h2>Structure</h2>
<ol>
<li><strong>Header</strong> — name, phone with country code, email, city, LinkedIn, in the body of the page rather than a document header.</li>
<li><strong>Status line</strong> — nationality, iqama status, location, notice period.</li>
<li><strong>Summary</strong> — two or three lines: specialism, years, and sector alignment where genuine. "Twelve years in large-scale infrastructure delivery, including four years on GCC giga-projects" does the work of a paragraph.</li>
<li><strong>Experience</strong> — reverse chronological, outcomes rather than duties, with scale stated. Project value, team size, and asset or system scale are the currency here.</li>
<li><strong>Education, licensing and certifications.</strong></li>
<li><strong>Skills and languages.</strong></li>
</ol>
<p>Two pages. One if you are under about seven years in.</p>

<h2>Scale is the metric that travels</h2>
<p>Saudi employers, particularly on the large programmes, hire for demonstrated capacity to operate at size. Where you have it, quantify it: contract value managed, square metres delivered, headcount led, plant capacity, transaction volume, number of sites. A bullet that says "Led delivery of a SAR 400 million package across three sites, 140 staff" answers the scale question directly, and scale questions are what these screens are for.</p>
<p>Where you do not have that scale, do not manufacture it — state what you did have accurately and let the specialism carry the argument instead.</p>

<h2>The parsing mechanics are the same</h2>
<p>Large Saudi employers and the regional portals run applicant tracking systems. Single column, conventional English section headings even where the role is Arabic-speaking, real text rather than images, and consistent month-and-year dates. If you submit an Arabic version, submit it as a separate document rather than mixing scripts in one file, which parsers handle poorly.</p>
<p>Check yours by pasting the PDF into a plain text editor, or run it through the <a href="https://www.thecvedge.com/upload-resume">free ATS checker</a> to see the extracted fields.</p>`,
  },
  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: "ux-designer-resume-guide-2026",
    title: "UX Designer Resume Guide 2026: The CV Next to the Portfolio",
    brief:
      "A UX CV is screened alongside your portfolio, which changes what belongs on it. What hiring managers actually read the CV for, and the framing that separates shortlisted candidates.",
    seo_title: "UX Designer Resume Guide 2026 — What Gets You Shortlisted | CVEdge",
    seo_description:
      "A UX designer CV is read next to the portfolio, not instead of it. What that changes about what to include, how to frame outcomes, and what hiring managers screen for.",
    read_time_minutes: 9,
    content_html: `<p>Every other profession's CV has to carry the whole argument on its own. A UX designer's does not — it arrives attached to a portfolio, and the portfolio will do most of the persuading. That changes the CV's job in a way most UX resume advice misses entirely.</p>
<p>The CV is not a compressed portfolio. It is the document that decides whether the portfolio gets opened, and then the document a hiring manager returns to for the things a portfolio is bad at showing.</p>

<h2>What the CV is actually for</h2>
<p>Portfolios are excellent at demonstrating craft and process on two or three projects. They are poor at communicating three things a hiring manager needs to know:</p>
<ul>
<li><strong>Scope and level.</strong> Did you own a product area or execute assigned screens? Were you the only designer or one of twelve? A beautiful case study rarely makes this clear.</li>
<li><strong>Context and constraint.</strong> Agency or in-house. B2B or consumer. Regulated or not. Startup ambiguity or enterprise process. These change what your experience is worth for a given role.</li>
<li><strong>Breadth over time.</strong> The portfolio shows three projects. The CV shows the shape of a career.</li>
</ul>
<p>Write the CV to answer those, and let the portfolio do craft.</p>

<h2>The summary line does real work here</h2>
<p>UX is a wide title covering research-heavy roles, interaction and systems work, visual and brand-adjacent design, and product design that is nearly product management. Hiring managers screen for fit within that range, and a summary that says "passionate about user-centred design" tells them nothing.</p>
<p>State the specialism, the level, and the domain in one sentence. "Product designer, seven years, B2B SaaS — mostly complex data workflows for enterprise operations teams, with a design systems background" is immediately placeable. Someone hiring for a consumer mobile role will pass, correctly, and someone hiring for enterprise tooling will open the portfolio.</p>
<p>Being filtered out fast by roles that were never a fit is a feature.</p>

<h2>Outcomes, when you can get them</h2>
<p>Designers face a genuine measurement problem that engineers largely do not. You rarely own the metric, the metric often moves for reasons beyond the design, and in enterprise or early-stage contexts it may not be instrumented at all.</p>
<p>The honest hierarchy, best to worst:</p>
<ol>
<li><strong>A business or product metric you can defend.</strong> "Redesigned the onboarding flow; activation rose from 34% to 51% over the following quarter." Only use this if you can explain the measurement and what else was changing at the time — you will be asked.</li>
<li><strong>A usability or research metric.</strong> Task completion, time on task, error rate, support ticket volume for a specific flow. Often more directly attributable to your work than a revenue number, and more defensible.</li>
<li><strong>Scale and adoption.</strong> "Design system adopted by four product teams, covering roughly 80% of the app surface." Real, checkable, and it demonstrates influence rather than output.</li>
<li><strong>Decision and outcome, stated qualitatively.</strong> "Research with twelve operations users showed the proposed dashboard solved a problem nobody had; the team redirected the quarter to queue management instead." No number, genuinely impressive, and it demonstrates the thing senior designers are actually hired for.</li>
</ol>
<p>The fourth is far better than an invented version of the first. Fabricated design metrics collapse under one follow-up question.</p>

<h2>What hiring managers screen out on</h2>
<ul>
<li><strong>"We" throughout.</strong> The most common fault in design CVs and portfolios both. Collaborative work is the norm and nobody expects you to claim the whole thing, but a document where every sentence is "we" hides what you personally did. Say what you owned.</li>
<li><strong>Tool lists as a proxy for skill.</strong> Figma is assumed. Listing it alongside eleven other tools with proficiency bars consumes space and communicates nothing. Name tools once, briefly, and spend the space on what you did with them.</li>
<li><strong>Process described as a deliverable.</strong> "Conducted user research, created personas, built wireframes, delivered high-fidelity mockups" is a list of artefacts. It does not say what you learned or what changed as a result. Artefacts are means.</li>
<li><strong>Unsolicited redesigns as the lead experience.</strong> Fine as a portfolio piece early on. On the CV, real constrained work outranks a self-directed redesign of a famous app every time.</li>
<li><strong>No portfolio link, or a broken one.</strong> Trivially avoidable and it happens constantly. Put the link in the header, check it, and if it is password-protected put the password next to it.</li>
</ul>

<h2>What has changed recently</h2>
<p>Two shifts are worth reflecting on the CV if they are genuinely true of you.</p>
<p>The first is <strong>AI-adjacent design work</strong>. Designing for non-deterministic systems — confidence states, error recovery, trust, streaming responses — is a specialism most designers have not practised, and it is being actively hired for. If you have shipped it, name it specifically rather than adding "AI" to a skills list.</p>
<p>The second is <strong>designers who build</strong>. Fluency with modern prototyping and code-adjacent tooling, enough to ship working prototypes rather than mockups, compresses team iteration loops. Where it is real, it belongs on the CV.</p>
<p>Both are genuine differentiators and both are easy to overclaim, which means both get probed in interviews.</p>

<h2>Format and parsing</h2>
<p>Design CVs suffer more parsing damage than any other profession's, for the obvious reason: designers design them. Multi-column layouts, contact details in a styled header, skill rating bars, and portfolio links embedded in an image are all common and all break extraction.</p>
<p>Your CV is a work sample, so it should look considered — but a well-set single-column document with clear typography, generous spacing and one accent colour looks better than most two-column CVs anyway, and it parses. Keep the visual ambition in the portfolio, where it belongs and where it is actually assessed.</p>
<p>Paste your PDF into a plain text editor to check the reading order, or run it through the <a href="https://www.thecvedge.com/upload-resume">free ATS checker</a>. For role-specific interview preparation, see our <a href="https://www.thecvedge.com/interview-prep/ux-designer">UX designer interview guide</a>.</p>`,
  },
  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: "back-end-developer-resume-guide-2026",
    title: "Back-End Developer Resume Guide 2026: Showing Scale and Ownership",
    brief:
      "Back-end CVs under-communicate the two things that actually get them shortlisted: the scale the systems ran at, and what the author owned when things broke.",
    seo_title: "Back-End Developer Resume Guide 2026 — Scale and Ownership | CVEdge",
    seo_description:
      "What separates a shortlisted back-end CV: system scale, production ownership and failure handling, stated concretely. Bullet rewrites and the keywords that matter.",
    read_time_minutes: 9,
    content_html: `<p>Back-end work has a presentation problem that front-end work does not. Nobody can see it. A front-end developer can link to something and the reviewer immediately understands the surface. A back-end developer writes "Built REST APIs using Node.js and PostgreSQL" and the reviewer learns almost nothing — not whether the API served forty requests a day or forty thousand a second, not whether it was a greenfield service or a migration off a fifteen-year-old system, not whether it stayed up.</p>
<p>Almost every weak back-end CV has the same underlying fault: it lists the technologies and omits the scale and the ownership, which are the two things being screened for.</p>

<h2>State the scale, always</h2>
<p>Scale is what converts a technology list into evidence. It is usually the fastest single improvement available to a back-end CV, and most people have the numbers and simply do not think to include them.</p>
<p>Useful dimensions, depending on your system:</p>
<ul>
<li><strong>Traffic</strong> — requests per second, daily API calls, peak versus steady state.</li>
<li><strong>Data</strong> — rows, table size, ingest rate, retention.</li>
<li><strong>Throughput</strong> — messages processed, jobs per hour, batch sizes.</li>
<li><strong>Latency</strong> — p50, p95, p99. Naming p99 rather than "average response time" signals you know which number matters.</li>
<li><strong>Availability</strong> — uptime against a target, incident count, error budget.</li>
<li><strong>Money</strong> — transaction volume, payment throughput, infrastructure cost.</li>
<li><strong>Blast radius</strong> — how many services or downstream consumers depended on yours.</li>
</ul>
<p>Compare: "Built REST APIs using Node.js and PostgreSQL" against "Built and ran the order-ingest API in Node.js and PostgreSQL — 3,000 requests per second at peak, p99 under 120ms, serving six downstream services." Same work. The second one is a candidate.</p>

<h2>Ownership is the second signal</h2>
<p>Interview loops for mid-level and above are heavily weighted toward what you did when something broke, because that is where the difference between someone who ships features and someone who runs a system shows up. Your CV should establish that you have been on that side of the line.</p>
<p>Concretely, that means bullets covering:</p>
<ul>
<li><strong>On-call.</strong> That you carried a pager, and roughly what the rotation looked like.</li>
<li><strong>An incident you owned.</strong> What broke, how you found it, what you changed so it could not recur. This is the highest-value bullet on a back-end CV and it is very frequently missing.</li>
<li><strong>A migration you ran.</strong> Schema changes on live tables, a datastore move, a language or framework upgrade — with the zero-downtime strategy named, because that is the interesting part.</li>
<li><strong>Something you deleted or simplified.</strong> Removing a service, collapsing a redundant layer, retiring a queue. Senior signal, rarely claimed.</li>
</ul>

<h2>Bullet rewrites</h2>
<p><strong>Weak:</strong> "Responsible for maintaining microservices architecture."<br>
<strong>Better:</strong> "Owned four services in a 30-service estate, including the payments gateway; carried a one-in-five on-call rotation and cut our page volume by roughly half over two quarters by fixing the top three recurring alert causes."</p>
<p><strong>Weak:</strong> "Optimised database queries for better performance."<br>
<strong>Better:</strong> "Traced a checkout latency regression to an unindexed join added in a prior release; added a covering index and rewrote the query, taking p99 from 2.4s to 180ms on a 40-million-row table."</p>
<p><strong>Weak:</strong> "Worked with Kafka for event processing."<br>
<strong>Better:</strong> "Moved order fulfilment from synchronous HTTP calls to Kafka, handling roughly 12 million events a day; designed the idempotency and replay strategy so duplicate deliveries could not double-charge customers."</p>
<p>Notice that each rewrite names the mechanism. "Optimised queries" is a claim; "added a covering index and rewrote the query" is a demonstration. Interviewers read for the mechanism because it is the part that cannot be faked.</p>

<h2>Keywords that determine whether you surface</h2>
<p>Recruiters search their applicant database by keyword, so the practical function of a technology name on your CV is to put you in the result set. Name specifics, not categories.</p>
<p><strong>Languages and runtimes:</strong> the specific ones — Java, Go, Python, Node.js, C#, Rust, Kotlin — with versions or major frameworks where they matter (Spring Boot, .NET, Django, FastAPI, Express, NestJS).</p>
<p><strong>Data:</strong> PostgreSQL, MySQL, MongoDB, Redis, Cassandra, DynamoDB, Elasticsearch, ClickHouse. Name the actual engine, not "SQL databases".</p>
<p><strong>Messaging and streaming:</strong> Kafka, RabbitMQ, SQS, Pub/Sub, Kinesis.</p>
<p><strong>Infrastructure:</strong> AWS, GCP or Azure with the specific services you actually used, plus Docker, Kubernetes, Terraform.</p>
<p><strong>Practices:</strong> CI/CD, observability, distributed tracing, load testing, blue-green or canary deploys.</p>
<p>Write both forms where a field uses both: "container orchestration (Kubernetes)". And only list what you would be comfortable being questioned on for ten minutes — a padded skills section is a list of topics you have invited into the interview.</p>

<h2>Structure by level</h2>
<p><strong>Junior.</strong> Projects carry the CV when employment does not. A deployed side project with a real database, tests and a public repository is worth more than three coursework entries. Show that you have shipped something that runs.</p>
<p><strong>Mid-level.</strong> The centre of gravity is ownership of a service or component, plus evidence of production responsibility. This is where the on-call and incident bullets start mattering most.</p>
<p><strong>Senior and above.</strong> Scope widens to design decisions, trade-offs and influence beyond your own code — the migration you led, the standard you set, the engineers you brought along. Reviewers are reading for judgment, so bullets should show a decision and its reasoning, not just an outcome.</p>

<h2>Formatting</h2>
<p>One page under about ten years, two beyond it. Single column, standard headings, contact details in the body rather than a document header, real text rather than images, and a GitHub link only if the profile there is worth opening.</p>
<p>Skip the skill rating bars. Claiming "Python: 4/5" invites a question about what the missing fifth is, and it is not text a parser can read anyway.</p>
<p>Check the parse by pasting your PDF into a plain text editor, or use the <a href="https://www.thecvedge.com/upload-resume">free ATS checker</a> to see the extracted fields. For interview preparation, our <a href="https://www.thecvedge.com/interview-prep/backend-developer">back-end developer interview guide</a> covers the questions these CVs get tested against.</p>`,
  },
  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: "financial-analyst-resume-guide-2026",
    title: "Financial Analyst Resume Guide 2026: Showing Judgment, Not Just Models",
    brief:
      "Financial analyst CVs list the models built and omit the decisions they informed. What hiring managers screen for across FP&A, corporate finance and investment roles.",
    seo_title: "Financial Analyst Resume Guide 2026 — What Gets Shortlisted | CVEdge",
    seo_description:
      "How to write a financial analyst CV that shows judgment rather than tool proficiency: bullet rewrites, keywords by specialism, and what differs across FP&A and investment roles.",
    read_time_minutes: 9,
    content_html: `<p>"Financial analyst" covers work that has little in common day to day. An FP&A analyst at a software company runs the forecast cycle and partners with department heads on budgets. A corporate development analyst builds acquisition models. An equity research associate writes notes on a coverage universe. A credit analyst sizes counterparty risk. The title is the same and the screening criteria are not.</p>
<p>The first job of the CV is therefore to say which of these you are, quickly. The second is to show judgment rather than tool proficiency — which is where most of these CVs fall down.</p>

<h2>The recurring fault: modelling as the achievement</h2>
<p>A great many analyst CVs read as a list of artefacts. "Built three-statement models." "Prepared monthly variance analysis." "Developed dashboards in Power BI." Every one of these describes work that was produced, and none says whether anyone did anything differently as a result.</p>
<p>Financial analysis is a decision-support function. Its value is realised when a decision changes. A CV that never connects analysis to a decision is describing the mechanics of the job while omitting the point of it.</p>
<p><strong>Weak:</strong> "Prepared monthly variance analysis for departmental budgets."<br>
<strong>Better:</strong> "Ran monthly variance analysis across eleven cost centres; traced a recurring overspend to duplicated vendor contracts across two regions, and the consolidation that followed removed roughly £340k of annualised cost."</p>
<p><strong>Weak:</strong> "Built three-statement financial models for potential acquisitions."<br>
<strong>Better:</strong> "Built the operating model for six acquisition targets in the £20–80m range; the sensitivity work on customer concentration for one target reframed the committee discussion and the deal was not pursued."</p>
<p>That second example is worth noting: the deal did not happen, and it is still the stronger bullet. Analysis that prevents a bad decision is exactly as valuable as analysis that enables a good one, and saying so demonstrates that you understand what the role is for.</p>

<h2>Scale and scope belong on the page</h2>
<p>An analyst who forecasts a £4m departmental budget and one who owns a £400m P&L are doing recognisably different jobs. Reviewers cannot tell which you are unless you say. Include, where relevant:</p>
<ul>
<li>Revenue or budget under your analysis</li>
<li>Number of cost centres, business units, entities or legal entities</li>
<li>Deal sizes and count</li>
<li>Portfolio or book size</li>
<li>Reporting audience — whether your work went to a manager, a CFO, an investment committee or a board</li>
<li>Team context — whether you were one of twenty analysts or the whole finance function</li>
</ul>
<p>That last one matters more than people expect. Being the only analyst at a fast-growing company is a different and often more impressive job than a junior seat in a large team, and the CV should make it visible.</p>

<h2>Say which specialism you are</h2>
<p>Put it in the summary line. "FP&A analyst, four years, SaaS — owns the annual planning cycle and monthly forecast for a £60m ARR business" is placeable in one read. So is "Corporate development analyst, three years — mid-market industrials M&A, twelve completed transactions."</p>
<p>Vagueness here is costly, because a reviewer with a specific opening will simply move on rather than work out whether you fit.</p>

<h2>Keywords, by specialism</h2>
<p>Recruiters search their databases by keyword, so name the specifics.</p>
<p><strong>FP&A:</strong> budgeting, forecasting, variance analysis, rolling forecast, month-end close, management reporting, KPI reporting, business partnering, headcount planning, scenario modelling, and the actual systems — NetSuite, SAP, Oracle, Workday Adaptive, Anaplan, Hyperion.</p>
<p><strong>Corporate finance and M&A:</strong> three-statement modelling, DCF, LBO, comparable company analysis, precedent transactions, accretion/dilution, due diligence, valuation, CIM, data room.</p>
<p><strong>Investment and research:</strong> equity research, financial statement analysis, sector coverage, earnings models, initiation notes, portfolio analysis, risk metrics.</p>
<p><strong>Across all of them:</strong> Excel at the level you actually work — name specific capabilities such as Power Query or advanced modelling rather than "advanced Excel", which everyone claims. SQL if you have it, and it increasingly matters. Power BI or Tableau. Python or R for the analytics-heavy roles. Accounting standards where relevant: IFRS, GAAP.</p>
<p><strong>Qualifications</strong> are load-bearing in this field in a way they are not in some others. CFA level and status, ACA, ACCA, CIMA, CPA, or an in-progress qualification with the expected completion date. Put them in the header area, not buried at the bottom.</p>

<h2>Accuracy is being assessed by the document itself</h2>
<p>This is specific to finance. The CV of a person whose job is precision is read as a work sample of precision. A number that does not add up, an inconsistent date format, a currency symbol used carelessly, or a typo in a figure does disproportionate damage here compared with other professions.</p>
<p>Be consistent about currency and units throughout, use the same date format everywhere, and check every figure you cite. Have someone else read it — you will not catch your own transposed digits.</p>

<h2>Confidentiality</h2>
<p>Deal and client information is frequently confidential. The convention is to describe rather than name: "a mid-market industrials manufacturer, c. £45m revenue" rather than the company. Reviewers understand this completely, and a CV that names things it should not raises a genuine question about judgment.</p>

<h2>Format</h2>
<p>One page for under about ten years, two beyond. Single column, standard headings, contact details in the body rather than a document header, real text rather than images. Investment banking and some investment management screens have their own strong formatting conventions, so if you are targeting those specifically, follow the format your target firms expect.</p>
<p>Check the parse with the <a href="https://www.thecvedge.com/upload-resume">free ATS checker</a>, which shows the extracted fields as well as a score.</p>`,
  },
  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: "hr-manager-resume-guide-2026",
    title: "HR Manager Resume Guide 2026: Writing for the People Who Screen CVs",
    brief:
      "HR managers are screened by other HR professionals, which raises the bar on the document itself. What separates a shortlisted HR CV — and why generic people-person language fails hardest here.",
    seo_title: "HR Manager Resume Guide 2026 — What HR Screeners Look For | CVEdge",
    seo_description:
      "How to write an HR manager CV that survives screening by other HR professionals: scope, employee relations evidence, systems, and the metrics that actually land.",
    read_time_minutes: 9,
    content_html: `<p>HR managers have a distinctive problem when they apply for jobs: they are being screened by people who screen CVs professionally. Every shortcut is familiar to the reader, because the reader uses the same ones. Generic competency language — "strong communicator", "passionate about people", "strategic HR business partner" — lands worse here than in any other field, because the person reading it has rejected a hundred CVs that said the same thing.</p>
<p>The compensating advantage is that a specific, well-evidenced HR CV stands out sharply against that background.</p>

<h2>Define the scope in the first two lines</h2>
<p>"HR Manager" spans an enormous range. It can mean the entire people function at a 60-person company, or a specialist managing employee relations in a division of 4,000. It can be generalist or heavily weighted toward one discipline. It can include payroll or not, recruitment or not, and the difference between operating in one jurisdiction and eleven is substantial.</p>
<p>State it immediately: "HR Manager, six years — sole HR lead for a 180-person manufacturing business across two UK sites, covering the full employee lifecycle including ER, payroll oversight and H&S coordination." A reviewer knows exactly what you are in one sentence.</p>
<p>Include headcount supported, number of sites or jurisdictions, whether you manage a team, sector, and which disciplines you own directly versus partner on.</p>

<h2>The metrics that actually mean something</h2>
<p>HR is measurable, and HR CVs routinely fail to measure. But not all the available numbers say what people think they say.</p>
<p><strong>Numbers that land:</strong></p>
<ul>
<li><strong>Time to hire and cost per hire</strong>, with the before and after. "Reduced average time to hire from 47 to 29 days by restructuring the interview process and introducing structured scorecards."</li>
<li><strong>Retention or regretted attrition</strong>, ideally segmented. "Cut first-year attrition in the warehouse population from 38% to 22% over eighteen months."</li>
<li><strong>Employee relations volume and outcome.</strong> "Handled 40+ formal ER cases including twelve disciplinaries and four grievances; no tribunal claims arising."</li>
<li><strong>Engagement survey movement</strong>, with participation rate — a score that moved on 30% participation means much less than one on 85%, and quoting the participation rate signals you know that.</li>
<li><strong>Absence rates</strong>, where you ran an intervention against them.</li>
<li><strong>Cost.</strong> Recruitment agency spend reduced, benefits renegotiated, restructures delivered within budget.</li>
</ul>
<p><strong>Numbers that do not:</strong> "Managed HR for 200 employees" is scope, not achievement — useful context, but not a result. "Improved company culture" is unmeasurable as written. "Achieved 95% employee satisfaction" without the participation rate or the instrument is a number a fellow HR professional will immediately discount.</p>

<h2>Employee relations is where credibility is established</h2>
<p>ER is the discipline that separates HR managers who have handled hard things from those who have administered easy ones, and it is the most under-described area on most HR CVs.</p>
<p>Be concrete about volume and type — disciplinaries, grievances, performance management, sickness and capability, TUPE, redundancy and restructure, tribunal exposure. Name the frameworks you have worked within, and be accurate about your role: whether you advised managers, ran cases yourself, or led the organisational process.</p>
<p>Confidentiality obviously applies. Describe the category and the outcome, never the individual. "Led a 40-role redundancy consultation across two sites, completed on schedule with no successful claims" says everything needed without identifying anyone.</p>

<h2>Systems and compliance are searchable</h2>
<p>HRIS experience is a hard filter in many screens, and recruiters search by product name. List the actual systems: Workday, SAP SuccessFactors, BambooHR, Personio, HiBob, ADP, Sage, Ceridian, Oracle HCM. Add applicant tracking systems separately — Greenhouse, Lever, Workable, Teamtailor — and payroll systems if you have owned payroll.</p>
<p>Name the employment law framework you operate under, because it does not transfer automatically across jurisdictions: UK employment law, TUPE, GDPR as it applies to employee data, or the equivalents for your market. If you have multi-jurisdiction experience, say which jurisdictions — it is a genuine differentiator and reviewers will not assume it.</p>
<p><strong>Qualifications</strong> carry real weight. CIPD level and membership status, SHRM-CP or SHRM-SCP, PHR or SPHR, or an in-progress qualification with its expected date. Put them near the top.</p>

<h2>The strategic claim needs evidence</h2>
<p>Almost every HR CV claims to be strategic rather than transactional. The claim is only worth making if something on the page demonstrates it.</p>
<p>What demonstrates it: a workforce plan you built and what it changed. A restructure you designed rather than administered. A pay and grading framework you introduced. A policy change you drove that had a measurable effect. Evidence of influencing a decision above your level.</p>
<p>What does not: the word "strategic".</p>

<h2>The document is being read as a work sample</h2>
<p>More than in most professions, an HR manager's CV is assessed as evidence of professional judgment about CVs. Typos, inconsistent formatting, three pages of undifferentiated duties, an objective statement, or a photograph on a UK or US application all read as an HR professional who does not follow their own guidance.</p>
<p>Two pages maximum, one if you are earlier in your career. Standard headings. Contact details in the body of the page, not a document header — and yes, HR CVs get parsed by applicant tracking systems too, which is a detail worth getting right when you administer one.</p>
<p>Check yours against the <a href="https://www.thecvedge.com/upload-resume">free ATS checker</a> to see what the extraction actually produces.</p>`,
  },
  // ────────────────────────────────────────────────────────────────────────────
  {
    slug: "scrum-master-resume-guide-2026",
    title: "Scrum Master Resume Guide 2026: Evidence Over Ceremony",
    brief:
      "Scrum Master CVs list ceremonies facilitated and certifications held. Hiring managers are screening for whether teams got measurably better. What to show instead.",
    seo_title: "Scrum Master Resume Guide 2026 — Evidence Over Ceremony | CVEdge",
    seo_description:
      "How to write a Scrum Master CV that shows team outcomes rather than ceremonies run: the metrics that land, what certifications are worth, and bullet rewrites.",
    read_time_minutes: 9,
    content_html: `<p>The Scrum Master market has tightened considerably. A wave of hiring during large agile transformations was followed by a wave of consolidation, and many organisations that once ran one Scrum Master per team now expect the role to be combined with delivery management, product ownership or engineering management. The practical effect is that CVs which describe the role as running ceremonies compete poorly, because ceremony facilitation is precisely the part organisations decided they could absorb.</p>
<p>What is still hired, and hired well, is someone who demonstrably makes teams deliver better. The CV has to show that.</p>

<h2>The fault: describing the framework instead of the results</h2>
<p>The typical Scrum Master CV reads as a description of Scrum. "Facilitated daily stand-ups, sprint planning, sprint reviews and retrospectives." "Maintained the sprint backlog." "Removed impediments." "Shielded the team from external distractions."</p>
<p>Everyone with the title did all of these. They are the job description, not the contribution. A reviewer reading twenty such CVs cannot distinguish between them, and picks on certification and industry instead — which is not a competition you want to be in.</p>
<p>The alternative is to write about what changed on the teams you worked with.</p>

<h2>Metrics that hold up</h2>
<p>Agile metrics are easy to game and experienced hiring managers know which ones are hollow.</p>
<p><strong>Velocity increases are the weakest claim available.</strong> "Increased team velocity by 40%" invites the obvious response that story points are relative and locally defined, and inflating them requires no improvement at all. Avoid it, or explain the measurement carefully.</p>
<p><strong>What actually lands:</strong></p>
<ul>
<li><strong>Cycle time and lead time.</strong> Time from work started to delivered, or from request to delivered. Objective, comparable, and directly meaningful to a business. "Reduced median cycle time from 11 days to 4 by breaking down stories and capping work in progress."</li>
<li><strong>Predictability.</strong> The proportion of sprint commitments met, or forecast accuracy. Often more valuable to stakeholders than raw speed, and rarely claimed.</li>
<li><strong>Quality.</strong> Escaped defects, production incidents, change failure rate, rework percentage. A team that got faster and buggier did not improve.</li>
<li><strong>Deployment frequency and change lead time.</strong> Where you influenced them, they are strong evidence because they are hard to fake.</li>
<li><strong>Flow.</strong> Work in progress reduced, blocked time reduced, queue length.</li>
<li><strong>Team health</strong>, with the instrument named — retrospective sentiment, team health checks, attrition on the team.</li>
</ul>

<h2>Bullet rewrites</h2>
<p><strong>Weak:</strong> "Facilitated all Scrum ceremonies for a team of eight."<br>
<strong>Better:</strong> "Ran delivery for an eight-person platform team; introduced explicit WIP limits and story slicing that took median cycle time from 11 days to 4 over two quarters, with sprint commitment accuracy rising from around 60% to over 85%."</p>
<p><strong>Weak:</strong> "Removed impediments and shielded the team from distractions."<br>
<strong>Better:</strong> "Identified that roughly a third of sprint capacity was going to unplanned support work; negotiated a rotating support role with the product owner so the remaining capacity became forecastable, which ended three consecutive quarters of missed commitments."</p>
<p><strong>Weak:</strong> "Coached the team on agile best practices."<br>
<strong>Better:</strong> "Coached two teams through the shift from six-week releases to weekly; ran the first eight releases as mob sessions until the team was confident, then handed the process over entirely."</p>
<p>The pattern in every rewrite is the same: name the specific problem, name the specific intervention, name what changed. The intervention is the part that shows judgment, and it is the part generic CVs omit.</p>

<h2>Be honest about scope and context</h2>
<p>Reviewers want to know what you were actually operating in, and it varies enormously:</p>
<ul>
<li>How many teams, and how many people</li>
<li>Whether teams were co-located, distributed, or across time zones</li>
<li>Framework in practice — Scrum, Kanban, Scrumban, SAFe, LeSS — and honestly, since "we called it Scrum and ran two-week waterfalls" is a real and common situation you can describe as a starting point you improved</li>
<li>Organisational maturity when you arrived and when you left</li>
<li>Whether the role also carried delivery management, release management, RTE or product responsibilities</li>
<li>Technical context — the domain, and whether you could engage with the engineering substance</li>
</ul>
<p>That last one is increasingly a differentiator. Scrum Masters who understand the technical work well enough to have useful conversations about architecture, testing strategy and technical debt are markedly more valuable than those who can only manage process, and this is worth evidencing.</p>

<h2>Certifications: necessary, not sufficient</h2>
<p>CSM, PSM I–III, SAFe SA or SPC, ICAgile, PMI-ACP. List them with the awarding body and year, near the top.</p>
<p>They are frequently a hard filter, so having the relevant one matters. But they no longer distinguish candidates, because most applicants hold at least one — a two-day CSM course and a passed exam is a low bar and everyone knows it. PSM II and III carry more weight because they are harder. Treat certification as the entry ticket and let the outcomes section do the actual persuading.</p>

<h2>Position for how the role is being hired now</h2>
<p>Given the consolidation described above, it is worth being explicit about the adjacent capability you bring. Delivery management, release coordination, programme-level work, product ownership experience, people management, or engineering background all widen the set of roles your CV fits, and many current postings are looking for exactly that combination.</p>
<p>If you have it, put it in the summary line rather than leaving it to be discovered in the third bullet of your second role.</p>

<h2>Format</h2>
<p>One page under about ten years, two beyond it. Single column, standard headings, contact details in the body of the page rather than a document header, consistent month-and-year dates. Certifications high on the page, outcomes in the experience section, and the framework vocabulary present but not doing the heavy lifting.</p>
<p>You can check how yours parses and scores with the <a href="https://www.thecvedge.com/upload-resume">free ATS checker</a>.</p>`,
  },
  // ────────────────────────────────────────────────────────────────────────────
  // Full replacement. The original was the weakest article on the site — it
  // opened by invoking the reader's unemployment and stress as a sales lever
  // ("while they're desperate for a callback"), then ran a one-sided feature
  // comparison. Manipulative framing is a quality problem independent of length.
  {
    slug: "jobscan-alternative-the-best-free-ats-checker-in-2026",
    title: "Jobscan Alternative: What You Gain and Give Up",
    brief:
      "Jobscan's match rate is genuinely useful and genuinely metered. An honest look at what changes if you move to a free ATS checker — including what Jobscan does better.",
    seo_title: "Jobscan Alternative 2026 — An Honest Comparison | CVEdge",
    seo_description:
      "Looking for a Jobscan alternative? What the free options do well, what Jobscan still does better, and how to decide which one fits your search.",
    read_time_minutes: 9,
    content_html: `<p>Jobscan does one thing and does it well: it compares your CV against a specific job description and tells you how closely they match, which keywords the posting uses that your CV does not, and roughly where you stand. For a tool with that narrow a remit, the execution is good and the keyword extraction is better than most.</p>
<p>The reason people look for alternatives is almost never quality. It is that the free tier is metered to a small number of scans per month, and CV tailoring is inherently repetitive — you want to run it against every posting you apply to, which is exactly the usage the free tier is designed to limit.</p>
<p>We make one of the alternatives, so read this as an interested party trying to be accurate. Where Jobscan is better, it is said so below.</p>

<h2>What a match score actually tells you</h2>
<p>Worth being clear about this before comparing tools, because it changes how much any of them are worth.</p>
<p>A match score is a vocabulary comparison. It measures overlap between the language of the posting and the language of your CV. That is genuinely useful, because recruiters search their applicant database by keyword and a CV that describes your work in different words than the recruiter searches for will not appear in the results.</p>
<p>What it does not measure is whether you are a good candidate. A CV can reach a high match rate by echoing the posting's vocabulary while saying nothing specific about what you achieved. Treating the score as a target rather than a diagnostic is how people end up with keyword-dense CVs that read as hollow to the human who eventually opens them.</p>
<p>So the honest framing: use any of these tools to find vocabulary gaps, then close the real ones and ignore the rest.</p>

<h2>Where Jobscan is genuinely strong</h2>
<ul>
<li><strong>Keyword extraction from the posting.</strong> Its parsing of which terms matter in a job description, and how it weights hard skills against soft ones, is well tuned.</li>
<li><strong>The comparison view.</strong> Side-by-side presentation of what the posting asks for against what your CV contains is clear and immediately actionable.</li>
<li><strong>LinkedIn optimisation.</strong> A separate feature that several free alternatives, including ours, do not offer at all.</li>
<li><strong>Focus.</strong> It does not try to be a builder, a tracker and a cover letter generator. There is real value in a tool that does one job.</li>
</ul>

<h2>Where the limits bite</h2>
<p>The free tier's scan limit is the main one, and it interacts badly with the workflow the tool is for. Tailoring is worth doing per application; a small monthly allowance means either paying or rationing the thing the tool is best at.</p>
<p>The second limit is scope. Jobscan diagnoses vocabulary gaps and stops there. It will not rewrite the bullet, will not tell you your contact details are in a document header that parsers do not read, and will not help with the content quality problem that is usually the real reason a CV underperforms. That is a reasonable product decision, but it means a match score alone is rarely the whole answer.</p>

<h2>The alternatives</h2>
<h3>CVEdge</h3>
<p>Scores your CV against a job description without a scan cap or an account, and adds the parts Jobscan deliberately leaves out: an ATS analysis across six categories, the extracted fields so you can see what a parser actually got from your file, and bullet rewriting that works from what you wrote rather than generating claims from your job title.</p>
<p><strong>Where it is weaker:</strong> no LinkedIn optimisation. Our keyword extraction is good but Jobscan's is arguably better tuned on ambiguous postings. And because we also build CVs, the tool is broader and therefore less focused than a dedicated scanner.</p>

<h3>Resume Worded</h3>
<p>Sharper line-by-line critique of individual bullets than either of the above, plus a LinkedIn review. Best if what you want is feedback on writing quality rather than keyword coverage. The free tier is limited enough that regular use means paying.</p>

<h3>Teal</h3>
<p>Includes CV-to-posting matching, but its real strength is managing the search — saving postings, tracking applications, keeping per-job CV versions. If you are running many applications at once, the tracking is worth more than the matching.</p>

<h3>Doing it manually</h3>
<p>Genuinely viable and worth saying. Paste the job description into a document, highlight every noun that names a skill, tool, methodology or qualification, and check each against your CV. It takes fifteen minutes and produces most of the value of an automated scan, because the analysis is not complicated — the tools are selling convenience and consistency, not a capability you lack.</p>

<h2>How to choose</h2>
<ul>
<li><strong>You tailor for most applications and hit the scan cap:</strong> an uncapped free tool, or pay for Jobscan if you value its extraction specifically.</li>
<li><strong>You have a match score and still get no responses:</strong> the problem is not vocabulary. Look at parsing and content quality — a broader ATS analysis will tell you which.</li>
<li><strong>You want your writing critiqued:</strong> Resume Worded.</li>
<li><strong>You are drowning in applications:</strong> Teal, for the tracking.</li>
<li><strong>You apply to a handful of carefully chosen roles:</strong> do it manually and spend the time on the cover letter instead.</li>
</ul>

<h2>The honest summary</h2>
<p>If Jobscan is working for you and the cost is manageable, there is no strong reason to move. If the scan cap is the friction, an uncapped alternative removes it. And if you have optimised your match rate and are still not hearing back, that is genuinely useful information: it means keyword coverage was not your bottleneck, and the effort belongs on parsing, on what your bullets actually say, or on whether the roles you are applying to are the right ones.</p>
<p>You can check parsing, extracted fields and an ATS score for your CV free at <a href="https://www.thecvedge.com/upload-resume">CVEdge</a>, without an account.</p>`,
  },
];

const ALL = [...POSTS, ...RETIRED];

function bodyWords(html: string): number {
  return html
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

async function main() {
  const supabase = createAdminClient();
  let updated = 0;
  let retired = 0;
  let missing = 0;
  const backup: Record<string, unknown>[] = [];

  for (const post of ALL) {
    const { slug, ...fields } = post;

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

    const isRetirement = fields.is_published === false;
    const before = bodyWords((existing.content_html as string) ?? "");
    const after = fields.content_html ? bodyWords(fields.content_html) : before;

    if (!isRetirement && after < 700) {
      console.error(`REFUSING ${slug}: rewrite is only ${after} words. Fix the content first.`);
      continue;
    }

    if (DRY) {
      console.log(
        isRetirement
          ? `[dry] would RETIRE ${slug} (${before} words)`
          : `[dry] would rewrite ${slug}: ${before} → ${after} words`
      );
      continue;
    }

    backup.push(existing);

    // A rewrite is a genuine content revision, so updated_at moves and the post
    // shows an "Updated" date. Retirements move it too — the row changed state.
    const { error } = await supabase
      .from("blog_posts")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", existing.id);

    if (error) {
      console.error(`Failed to update ${slug}: ${error.message}`);
      continue;
    }

    if (isRetirement) {
      console.log(`Retired ${slug} (was ${before} words) — 301 configured in next.config.mjs`);
      retired++;
    } else {
      console.log(`Rewrote ${slug}: ${before} → ${after} words`);
      updated++;
    }
  }

  if (backup.length > 0) {
    writeFileSync(BACKUP_PATH, JSON.stringify(backup, null, 2));
    console.log(`\nPre-update snapshot written to ${BACKUP_PATH}`);
    console.log(`Restore with: npx tsx scripts/expand-thin-blog-posts-2.ts --restore ${BACKUP_PATH}`);
  }

  console.log(
    `\nDone: ${updated} rewritten, ${retired} retired, ${missing} not found.${DRY ? " (dry run)" : ""}`
  );
}

/** Restore posts from a snapshot produced by a previous run. */
async function restore(file: string) {
  const supabase = createAdminClient();
  const snapshots: Record<string, unknown>[] = JSON.parse(readFileSync(file, "utf8"));
  for (const s of snapshots) {
    const { id, ...fields } = s;
    const { error } = await supabase.from("blog_posts").update(fields).eq("id", id);
    console.log(error ? `Failed ${s.slug}: ${error.message}` : `Restored ${s.slug}`);
  }
}

const run = RESTORE_IDX !== -1 ? restore(process.argv[RESTORE_IDX + 1]) : main();
run.catch((e) => {
  console.error(e);
  process.exit(1);
});
