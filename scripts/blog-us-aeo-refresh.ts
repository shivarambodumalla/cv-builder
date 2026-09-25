// Blog hygiene + AEO refresh, September 2026.
//
// What the audit found (see memory: project-paying-customer-geography-2026-09):
//   - 57 of 70 stored seo_titles ended in "| CVEdge", which the layout's title
//     template appends again → "… | CVEdge | CVEdge" in Google.
//   - 44 seo_descriptions were over 160 chars, under 110, or carried the
//     double spaces left by an old import (they truncate mid-word in SERPs).
//   - 5 posts were already 301-redirected in next.config.mjs but still
//     published, so they sat in the sitemap and blog listing as redirect chains.
//   - No post had a FAQ block, so nothing emitted FAQPage schema and there was
//     little quotable passage-level content for AI answer engines to cite.
//   - The blog had one US-specific article while the only paying market is the US.
//
// This script:
//   1. strips the brand suffix from every seo_title and shortens the 4 that are
//      still over 60 chars;
//   2. rewrites the flagged descriptions to 110–158 chars;
//   3. unpublishes the 5 redirected posts;
//   4. appends a "Frequently asked questions" block (h2 + h3/p pairs, the shape
//      lib/blog/posts.ts:extractFaq reads) to 30 high-traffic or US-relevant posts;
//   5. inserts 3 new US-direction articles.
//
// Run: npx tsx scripts/blog-us-aeo-refresh.ts --dry     # report only
//      npx tsx scripts/blog-us-aeo-refresh.ts           # apply (writes a backup first)
//      npx tsx scripts/blog-us-aeo-refresh.ts --restore <backup.json>
import { createAdminClient } from "../lib/supabase/admin";
import * as dotenv from "dotenv";
import { writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
dotenv.config({ path: ".env.local" });

const DRY = process.argv.includes("--dry");
const RESTORE_IDX = process.argv.indexOf("--restore");
const BACKUP_PATH = join(
  process.env.BLOG_BACKUP_DIR || process.cwd(),
  `blog-refresh-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
);

// ── 1. Titles still over 60 chars once the suffix is gone ─────────────────────
const TITLES: Record<string, string> = {
  "project-manager-resume-guide-2026": "Project Manager Resume Guide 2026: ATS Keywords & Examples",
  "business-analyst-resume-guide-2026": "Business Analyst Resume Guide 2026: ATS Keywords & Examples",
  "qa-engineer-resume-guide-2026": "QA Engineer Resume Guide 2026: ATS Keywords & Examples",
  "marketing-manager-resume-guide-2026": "Marketing Manager Resume Guide 2026: Keywords & Examples",
};

// ── 2. Descriptions: 110–158 chars, no double spaces, no mid-word truncation ──
const DESCRIPTIONS: Record<string, string> = {
  "cv-photo-rules-by-country-2026": "Should you put a photo on your CV? Country-by-country rules for the US, UK, Germany, the Gulf, Australia and Canada, and why photos hurt ATS parsing.",
  "is-europass-good-2026": "An honest look at the Europass CV: where it helps, why recruiters and ATS systems struggle with it, and what to use instead for private-sector jobs.",
  "relocating-abroad-cv-rewrite": "A seven-step method for adapting your CV to a new country: work rights, credential equivalence, employer context, local conventions and keywords.",
  "us-resume-vs-european-cv": "US resume vs European CV: length, personal details, photos, references and tone compared, plus exactly what to change when you apply across the Atlantic.",
  "singapore-cv-format-2026": "How to write a CV for Singapore: length, personal details, the Fair Consideration Framework, salary expectations and what Employment Pass applicants show.",
  "australian-resume-format-2026": "How to write an Australian resume: the right length, why photos are omitted, selection criteria, referees and what Australian recruiters screen for.",
  "canadian-resume-format-2026": "How to adapt a resume for Canada: personal details to remove, work authorization, Canadian experience, credential recognition and bilingual roles in Quebec.",
  "uk-cv-format-skilled-worker-visa-2026": "How to write a UK CV when you need Skilled Worker sponsorship: stating visa status, finding licensed sponsors and the conventions British recruiters expect.",
  "ireland-cv-format-2026": "How to write an Irish CV: length, personal details to omit, work permit status, the Critical Skills list and what multinational vs domestic employers expect.",
  "qatar-cv-format-2026": "How to structure a CV for Qatar: the personal details Doha recruiters expect, project-cycle framing, certifications that count and the ATS systems in use.",
  "uae-golden-visa-cv-guide": "How to structure a CV that supports a UAE Golden Visa application: evidence-first framing, documented achievement and how it differs from a job-seeking CV.",
  "oil-gas-energy-engineer-cv-gulf": "How to write an energy sector CV for the Gulf: project phase framing, asset types, standards and codes, HSE credentials and a structure that parses in ATS.",
  "personal-details-gulf-cv": "Photo, nationality, date of birth, marital status and visa status on a Gulf CV: which fields help, which are neutral and which now hurt you with recruiters.",
  "german-lebenslauf-format-2026": "How to write a German Lebenslauf: tabular layout, whether to include a photo under the AGG, Anschreiben, Arbeitszeugnisse and what recruiters expect in 2026.",
  "nursing-healthcare-cv-gulf": "How to write a healthcare CV for the UAE, Saudi Arabia and Qatar: licensing status, clinical specialty, patient acuity, documented hours and the right format.",
  "product-design-portfolio-review-checklist": "Review your design portfolio like a hiring manager: a 27-point checklist covering structure, case studies, visual craft and the AI-era signals companies want.",
  "ai-product-designer-salary-guide": "What an AI product designer earns in 2026: salary ranges for the US, UK, Europe, the Gulf, Singapore and India, plus the skills that command a premium.",
  "how-much-does-a-product-design-mentor-cost": "What a product design mentor costs in 2026: free mentorship, hourly rates, subscriptions and structured 1:1 programs compared, and what each tier delivers.",
  "saudi-arabia-cv-format-guide-2026": "How a Saudi CV differs from a UAE or Western one: Saudization, Vision 2030 sectors, Arabic, iqama status and the structure KSA recruiters expect in 2026.",
  "dubai-cv-format-for-indian-professionals": "What changes between an Indian CV and a Dubai one: length, salary history, notice period, attestation and how to frame Indian experience for UAE recruiters.",
  "financial-analyst-resume-guide-2026": "How to write a financial analyst resume that shows judgment, not just modelling: bullet rewrites, keywords by specialty and FP&A vs investment differences.",
  "hr-manager-resume-guide-2026": "How to write an HR manager resume that survives screening by other HR professionals: scope, employee relations evidence, systems and the metrics that land.",
  "business-analyst-resume-guide-2026": "Write an ATS-friendly business analyst resume: proven keywords, requirements-gathering examples, stakeholder management skills and free templates.",
  "cybersecurity-analyst-resume-guide-2026": "How to write a cybersecurity analyst resume: the detection and response metrics that matter, certifications worth listing and before/after bullet examples.",
  "devops-engineer-resume-guide-2026": "How to write a DevOps engineer resume: the DORA metrics that matter, cost and reliability numbers, before/after bullets and the tool-list mistake to avoid.",
  "full-stack-developer-resume-guide-2026": "How to write a full stack developer resume that shows depth: pick a centre of gravity, write end-to-end feature bullets and use metrics that get shortlisted.",
  "back-end-developer-resume-guide-2026": "What separates a shortlisted back-end resume: system scale, production ownership and failure handling stated concretely, with bullet rewrites and keywords.",
  "front-end-developer-resume-guide-2026": "How to write a front-end developer resume: Core Web Vitals and bundle-size metrics, before/after bullet examples, skills to list and what gets you screened.",
  "ux-designer-resume-guide-2026": "A UX designer resume is read next to the portfolio, not instead of it. What that changes about what to include, how to frame outcomes and what gets screened.",
  "data-scientist-resume-guide-2026": "Land data science interviews in 2026: real bullet rewrites, 60+ ATS keywords (Python, MLflow, XGBoost) and the metric-led approach that gets shortlisted.",
  "how-recruiters-really-read-your-resume-backed-by-data": "What eye-tracking research shows about how recruiters scan resumes: the six-second first pass, the F-pattern, where attention lands and how to structure.",
  "ai-resume-builder-vs-manual": "AI resume builder or write it yourself? Where AI genuinely helps, where it fails, how recruiters spot AI-written resumes and the hybrid approach that works.",
  "how-to-write-resume-bullet-points-that-show-impact-with-examples": "The structure behind resume bullets that get interviews: action verb, specific work, measurable result. What to do without metrics, plus 12 examples.",
  "best-resume-format-for-ats-templates-that-actually-work": "Which resume format works with ATS: chronological vs functional vs hybrid, one column vs two, section order, length and file type, and what breaks parsing.",
  "resume-vs-cv-what-recruiters-actually-expect-in-2026": "Resume vs CV: what each term means in the US, UK, Europe, the Middle East and Asia, what each document should contain and the details that get you rejected.",
  "how-to-increase-your-ats-score-from-60-to-90": "Scoring around 60% on an ATS check? The four issues that cause it: keyword gaps, unmeasured bullets, missing sections, parsing failures, and how to fix them.",
  "software-engineer-resume-guide-2026": "How to write a software engineer resume that passes ATS in 2026: what to include, which keywords matter, how to structure it and how to fix it free with AI.",
  "ats-resume-format-what-actually-works-in-2026": "Two-column resumes look great but fail ATS software. The exact resume format that passes ATS in 2026: fonts, layout, sections, file type, plus a free check.",
  "why-your-cv-never-reaches-a-human-recruiter": "Most resumes are rejected by ATS software before a recruiter reads them. Find out why it is happening to yours and fix it free in under 8 minutes.",
  "free-ats-checker-how-to-check-your-cv-score-in-2026": "Check your resume's ATS score free in under 3 minutes. CVEdge shows exactly why your CV gets rejected and fixes it with AI. No credit card needed.",
  "how-to-write-resume-bullets-that-pass-ats": "Weak resume bullets get filtered by ATS before anyone reads them. The exact formula for writing bullets that pass ATS screening and impress recruiters.",
  "how-to-tailor-your-cv-for-a-job-description": "Sending the same CV to every job is killing your chances. How to tailor your CV to any job description in under 5 minutes using AI, with a free tool.",
  "best-free-resume-checker-tools-in-2026": "An honest comparison of the best free resume checker tools in 2026: which ones actually fix your CV rather than just scoring it, and which cost nothing.",
  "why-you-re-not-hearing-back-after-applying": "Applied to dozens of jobs with no response? It is usually not your experience. Your CV is being filtered by ATS software. Find out why and fix it free.",
};

// ── 3. Already 301-redirected in next.config.mjs; retire from listing + sitemap ──
const UNPUBLISH = [
  "project-manager-resume-guide-2026-2",
  "ats-resume-gude-2026",
  "how-to-get-past-the-ats-in-2026-complete-resume-optimization-guide",
  "how-to-tailor-your-resume-for-every-job-application-step-by-step-guide",
  "your-cv-is-failing-before-a-human-sees-it-here-s-why",
];

// ── 4. FAQ blocks ─────────────────────────────────────────────────────────────
type QA = [string, string];
const FAQS: Record<string, QA[]> = {
  "saudi-arabia-cv-format-guide-2026": [
    ["Should a CV for Saudi Arabia include a photo?", "It is still common and many Saudi employers expect one, but keep it out of the layout structure: a small headshot in the header, not a sidebar or two-column grid that breaks ATS parsing. For multinationals and government entities using an online portal, a plain no-photo version is the safer file."],
    ["How long should a Saudi Arabia CV be?", "Two pages for most professionals, three for senior or highly technical roles with long project lists. Lead with a status line (nationality, iqama or visa status, location, notice period) so the recruiter's first practical questions are answered before they read your experience."],
    ["Do I need Arabic on my CV for KSA?", "Write the CV in English unless the posting is in Arabic, but state your Arabic level honestly in the languages line. For government-linked employers and Saudization-sensitive roles, Arabic is a genuine differentiator; for multinational technical roles it is usually a plus rather than a requirement."],
    ["What is Saudization and why does it affect my CV?", "Saudization (Nitaqat) sets targets for the share of Saudi nationals in a company's workforce. Employers screen expatriate candidates against those quotas, so make your nationality, current status and the specialist skills that justify an expatriate hire clear in the first few lines."],
  ],
  "best-free-resume-checker-tools-in-2026": [
    ["What is the best free resume checker in 2026?", "For a full ATS score plus fixes, CVEdge is free and needs no account: it shows the parsed fields, a score across six categories and rewrites the weak bullets with AI. Jobscan is strong for job-description matching but meters free scans. Resume.io and Zety score inside paid builders."],
    ["Are free resume checkers accurate?", "They estimate. No public tool sees the exact ranking model of Workday, Greenhouse or Lever, so treat any score as a diagnosis of parsing, keywords, structure and measurable results rather than a prediction of one employer's decision. A tool that shows what it extracted from your file is more trustworthy than one that only gives a number."],
    ["Do I need to upload my resume to check its ATS score?", "Yes, because the check has to parse the actual file. Upload the PDF or Word document you would send, not a pasted text version, since formatting is one of the main things that breaks parsing."],
    ["How often should I check my resume?", "Once for the master version, then once per tailored version before you submit it. Re-check after any layout change, because moving to a two-column template or adding a graphic can drop a score that was previously fine."],
  ],
  "marketing-manager-resume-guide-2026": [
    ["What keywords should a marketing manager resume include?", "The terms in the posting first: channel names (paid social, SEO, email, ABM), tooling (HubSpot, Salesforce, GA4, Marketo) and outcome words (pipeline, CAC, ROAS, MQL to SQL conversion). Place them in bullets that show results, not only in a skills list."],
    ["How do I show results on a marketing resume?", "Every bullet should carry a number: budget managed, pipeline or revenue influenced, conversion lift, CAC reduction, audience growth. Write \"Cut CAC 31% by shifting $400K of paid spend to organic and lifecycle email\" rather than \"Managed paid and organic channels\"."],
    ["Should a marketing manager resume be one page or two?", "One page under about eight years of experience, two pages for senior managers with several teams or budgets to describe. American recruiters expect brevity; in the UK or Gulf, two pages is the norm."],
    ["Which resume template works for marketing roles?", "A single-column, reverse-chronological template with standard headings. Visual templates signal creativity but parse badly in ATS; keep the design work for your portfolio link."],
  ],
  "product-manager-resume-guide-2026-ats-keywords-examples-free-templates": [
    ["What do recruiters look for in a product manager resume?", "Evidence you shipped: named products or features, the metric that moved, the size of the team or budget, and the level you operated at. A PM resume that lists responsibilities without outcomes reads as junior regardless of title."],
    ["What are the most important ATS keywords for a PM resume?", "Match the posting, but the recurring ones are roadmap, product strategy, discovery, A/B testing, OKRs, PRDs, stakeholder management, go-to-market, retention, activation and the specific tools named (Jira, Amplitude, Mixpanel, Figma). Use them inside result bullets."],
    ["How long should a product manager resume be?", "One page for under ten years of experience, two for senior, group or director roles. Cut older roles to a line each rather than dropping the page limit."],
    ["Should I include side projects on a PM resume?", "Yes if you are early-career or moving into product, and only if you can state a result (users, revenue, a launch). A projects section with outcomes beats a longer skills list."],
  ],
  "software-engineer-resume-guide-2026": [
    ["How long should a software engineer resume be?", "One page for up to about ten years of experience, two pages at staff or principal level. Recruiters and ATS both favour a tight, single-column document over a long one."],
    ["Should I list every technology I have used?", "No. List the stack you can be interviewed on today, grouped by category (languages, frameworks, cloud, data), and put the important ones inside bullets where they are attached to a result. A 40-item skills list dilutes keyword weight."],
    ["How do I show impact as a software engineer?", "Attach a number to the work: latency cut, throughput gained, cost saved, incidents reduced, users served, revenue enabled. \"Reduced p95 API latency from 800ms to 120ms by adding a Redis cache layer\" is stronger than \"Worked on API performance\"."],
    ["Do GitHub or portfolio links matter?", "For early-career and open-source-heavy roles, yes; put the link in the contact line. For senior roles they matter less than the results in your bullets, but a clean link never hurts."],
  ],
  "uae-resume-format-2026": [
    ["Should a UAE resume include a photo and personal details?", "A photo, nationality, visa status and location are still commonly expected by UAE recruiters. Date of birth and marital status are declining and can be left out. Keep the photo small and in the header so the layout still parses."],
    ["What is the ideal length of a CV for Dubai?", "Two pages. One page reads as thin to Gulf recruiters, three or more gets skimmed. Put a status line (nationality, visa status, location, notice period) directly under your name."],
    ["Do I need to mention my visa status on a UAE CV?", "Yes. Employment and residency are linked in the UAE, so \"Employment visa, transferable\" or \"Visit visa, available immediately\" answers the recruiter's first practical question and stops your CV being set aside."],
    ["Is degree attestation required to work in the UAE?", "For most professional roles the employer will need your degree attested for the work permit. Starting attestation early and noting \"Degree attested (MOFA)\" on the CV removes a delay that can cost you an offer."],
  ],
  "devops-engineer-resume-guide-2026": [
    ["What metrics should a DevOps resume include?", "The DORA four: deployment frequency, lead time for changes, change-failure rate and mean time to recovery, plus cloud cost and availability numbers. Show before and after values rather than a single figure."],
    ["How do I list tools without it looking like a keyword dump?", "Group them (CI/CD, IaC, cloud, observability, containers) and keep the list to what you can be interviewed on. Then put the most important tools inside bullets attached to an outcome, which is where ATS ranking gives them weight."],
    ["DevOps or SRE: which title should I use?", "Use the title the posting uses, and mirror its language. If your work was reliability-first (SLOs, error budgets, on-call), SRE framing is honest; if it was delivery-first (pipelines, environments, releases), DevOps is. Do not claim both in the same headline."],
    ["Are certifications worth listing on a DevOps resume?", "AWS, Azure, GCP and Kubernetes (CKA, CKAD) certifications are recognised keywords and worth a line each. Do not list expired or entry-level certificates once you have senior experience."],
  ],
  "dubai-cv-format-for-indian-professionals": [
    ["What should I remove from my Indian CV for Dubai?", "Salary history, the declaration and signature block, \"Date and Place\", father's name, passport number, and 10th and 12th board marks. Keep nationality, visa status and a photo, which Gulf recruiters still expect."],
    ["How long should my Dubai CV be if my Indian CV is four pages?", "Two pages. Cut older roles to one line each, keep only projects with a stated result, and move the detailed project list to a separate document you can send on request."],
    ["Should I mention my notice period on a CV for the UAE?", "Yes, in a status line under your name: nationality, current visa status, location and notice period. Availability is a real screening criterion in the UAE because visa processing already adds weeks."],
    ["How do I explain an Indian employer a Dubai recruiter may not know?", "Add a short descriptor after the name: \"Infosys (IT services, 300,000+ employees)\" or \"a Series B fintech in Bengaluru\". Scale and sector are what the recruiter needs to place your experience."],
  ],
  "ux-designer-resume-guide-2026": [
    ["Do UX designers need a resume if they have a portfolio?", "Yes. The resume decides whether the portfolio is opened, and it is where hiring managers look for scope, level, team size and business outcomes, which portfolios show badly."],
    ["How long should a UX designer resume be?", "One page for most designers, two for leads and managers with multiple teams. Put the portfolio link in the contact line and keep the visual design of the resume itself plain so it parses."],
    ["What metrics can a UX designer put on a resume?", "Task completion or conversion lift, support tickets reduced, time-on-task cut, retention or activation change, and research volume (interviews run, studies shipped). Where nothing was measured, state the scope instead: users, platforms, team."],
    ["Should a UX resume be visually designed?", "No. A designed layout with columns and icons signals craft but breaks ATS parsing. Use a single-column template and let the portfolio carry the visual argument."],
  ],
  "resume-io-alternative": [
    ["Is there a free alternative to Resume.io?", "Yes. CVEdge builds and exports resumes free with no watermark, and adds an ATS score, AI bullet rewrites and job-description matching that Resume.io does not include. Canva (design-first) and Google Docs templates are other free options."],
    ["Can I export a resume from Resume.io for free?", "Resume.io's free tier limits downloads; PDF export is part of the paid plan. Copying your content into a free builder takes a few minutes and avoids the renewal."],
    ["Does Resume.io pass ATS?", "Its simpler templates parse fine; the two-column and graphic ones can lose section order. Whatever builder you use, run the exported PDF through a free ATS check before applying."],
    ["How do I move my resume from Resume.io to CVEdge?", "Export or copy the text, upload the PDF at thecvedge.com/upload-resume, and the parser rebuilds it into an editable resume with a score in under a minute."],
  ],
  "ai-resume-builder-vs-manual": [
    ["Can recruiters tell if a resume was written by AI?", "Often, when it is generic: inflated verbs, no specific numbers, and summaries that could describe anyone. They cannot tell when AI restructured bullets that already contained your real work and metrics."],
    ["Is it safe to use AI for my resume?", "Yes, if you supply the facts and the AI supplies the structure. The risk is fabrication: an AI asked to \"improve\" a bullet with no metric will invent one. Use a tool that flags missing data instead of filling it in."],
    ["What is the best way to combine AI and manual writing?", "Write a rough draft of what you actually did, including numbers, then let AI tighten each bullet into action, work, result form and align keywords with the job description. Review every line before sending."],
    ["Do AI-written resumes pass ATS?", "Formatting and keywords decide ATS parsing, not authorship. An AI-assisted resume in a single-column template with the posting's terms in its bullets will parse and rank well; a manually written two-column PDF may not."],
  ],
  "data-scientist-resume-guide-2026": [
    ["What should a data scientist resume emphasise?", "Business impact first: the decision or revenue a model changed, the size of the lift, and the scale of data. Then the stack (Python, SQL, scikit-learn, XGBoost, PyTorch, MLflow, Spark, cloud) inside those bullets."],
    ["Should I list Kaggle or personal projects?", "Yes for early-career candidates, with a stated outcome or ranking. For experienced data scientists, production models with measured impact matter far more than competitions."],
    ["How long should a data scientist resume be?", "One page under about eight years, two for senior and lead roles. Publications and talks go in a short section at the end, not in the experience block."],
    ["Which ATS keywords matter most for data science roles?", "The posting's own terms, typically machine learning, statistical modelling, A/B testing, feature engineering, model deployment, and the named libraries and platforms. Put them in bullets that carry results, not only in a skills list."],
  ],
  "kuwait-oman-bahrain-cv-format-2026": [
    ["Are CV conventions the same across Kuwait, Oman and Bahrain?", "Mostly: two pages, single column, a status line with nationality and visa, PDF. They differ in sector mix, how strongly localisation policy (Kuwaitisation, Omanisation, Bahrainisation) shapes screening, and how much personal detail recruiters expect."],
    ["Do I need a photo on a CV for Kuwait, Oman or Bahrain?", "It is still commonly expected in all three. Keep it small in the header so the document still parses, and drop it for multinational employers that use an online application portal."],
    ["Should I mention my visa status?", "Yes. State it in the first lines: current country, visa type, transferability and notice period. Availability is one of the first things a Gulf recruiter checks."],
    ["Which template should I use for Gulf applications?", "A single-column ATS template such as Harvard or Classic, with a status line added under the name. Avoid sidebars and tables; they break parsing in the systems Gulf employers use."],
  ],
  "us-resume-vs-european-cv": [
    ["What is the difference between a resume and a CV?", "In the United States a resume is a one to two page document tailored per job, and a CV is a long academic record used in research, medicine and academia. In the UK, Europe, India and the Gulf, CV simply means the standard application document."],
    ["Should a US resume have a photo?", "No, never. US employers avoid holding protected characteristics such as appearance, age or nationality, and many will discard a resume with a photo unread."],
    ["How long should a resume be in the US?", "One page for up to roughly ten years of experience, two pages for senior candidates. European CVs run two pages as standard, so cut hard when converting."],
    ["Do I need a cover letter in the US?", "It is optional and often unread for most private-sector roles, though some applications require one. In Germany, Switzerland and much of Europe it is part of the expected package."],
  ],
  "canadian-resume-format-2026": [
    ["What should I remove from a resume for Canada?", "Photo, date of birth, age, marital status, nationality, religion, gender, health status and Social Insurance Number. Canadian human rights law restricts what employers may consider, so most redact or discard resumes carrying those fields."],
    ["Do Canadian resumes use Letter or A4 paper?", "Letter (8.5 by 11 inches), the same as the United States. Set your document to Letter before exporting a PDF so it prints without scaling."],
    ["Should I state my work authorisation on a Canadian resume?", "Yes, in one line: \"Canadian permanent resident\", \"Open work permit valid to 2027\", or \"Requires LMIA sponsorship\". It answers a screening question the recruiter would otherwise have to ask."],
    ["How long is a Canadian resume?", "Two pages is normal for experienced professionals, one page for new graduates. It is closer to US convention than to European, with achievement-led bullets and reverse-chronological order."],
  ],
  "resume-vs-cv-what-recruiters-actually-expect-in-2026": [
    ["Is a CV the same as a resume?", "Only outside North America. In the US and Canada, a resume is the standard one to two page application document and a CV is a long academic record. In the UK, Europe, India, the Gulf and most of Asia, CV means the standard document and \"resume\" is rarely used."],
    ["If a US employer asks for a CV, what do they mean?", "Outside academia, research and medicine, they almost always mean a resume. Send one to two pages, achievement-led, no photo or personal details."],
    ["Should I keep two versions?", "Yes if you apply across markets: a one-page US-style resume with American spelling, and a two-page CV with local conventions for the UK, Europe or the Gulf. Both come from the same master content."],
    ["Does an ATS treat resumes and CVs differently?", "No. The parser looks for the same fields: contact block, roles with dates, education, skills. Length and personal details are recruiter conventions, not parser requirements."],
  ],
  "best-resume-format-for-ats-templates-that-actually-work": [
    ["What is the best resume format for ATS?", "Reverse-chronological, single column, standard section headings (Experience, Education, Skills), no tables or text boxes, saved as PDF or DOCX. It is what parsers are built around."],
    ["Do two-column resumes fail ATS?", "Often. Many parsers read across columns, merging a sidebar's dates and skills into the main text. If you must use two columns, keep contact details and experience in the main column and check the parsed output."],
    ["Is a functional resume bad for ATS?", "Yes, in practice. Grouping skills without dated roles leaves the parser with no work history to score, and recruiters read it as hiding gaps. A hybrid format with a short skills summary above a chronological history is the safe compromise."],
    ["PDF or Word for ATS?", "Either, if the posting does not specify. Modern systems parse PDFs well; use DOCX only when the application form asks for it, and never send an image-based PDF or a scan."],
  ],
  "how-to-get-past-the-ats": [
    ["How do I know if my resume is being rejected by ATS?", "A pattern of no responses from roles you are qualified for, especially through Workday, Greenhouse, Lever or iCIMS portals, usually means parsing or keyword problems. Run the file through a free ATS check to see what the parser extracts."],
    ["What ATS score do I need?", "Aim for 80 or above on a six-category check. Scores under 60 usually mean a structural problem such as a two-column layout or missing sections, not a lack of experience."],
    ["Do keywords have to match the job description exactly?", "Close to it. Parsers match terms and common variants, so use the posting's phrasing (\"project management\", not only \"PM\") and place keywords in bullets, where they carry more weight than in a skills list."],
    ["Does a good ATS score guarantee an interview?", "No. It gets your resume in front of a recruiter; the content then has to persuade a person. Treat the score as the entry ticket, not the goal."],
  ],
  "why-your-cv-never-reaches-a-human-recruiter": [
    ["Why am I not hearing back after applying online?", "Most large employers route applications through an ATS that parses and ranks resumes before a recruiter looks. If your file parses badly or lacks the posting's keywords, it sits low in the list and is never opened."],
    ["How can I tell if the ATS parsed my resume correctly?", "Upload it to a free ATS checker that shows the extracted fields. If your job titles, dates or skills come out garbled or missing, the employer's system likely saw the same thing."],
    ["What are the most common reasons resumes fail ATS?", "Two-column or graphic layouts, non-standard section headings, missing keywords from the posting, and bullets with no measurable results. All four are fixable in an afternoon."],
    ["Is it worth applying without fixing my resume first?", "No. Every submission of a broken file is a wasted application; fixing the format once improves every application that follows."],
  ],
  "free-ats-checker-how-to-check-your-cv-score-in-2026": [
    ["How can I check my resume's ATS score for free?", "Upload the PDF or Word file at thecvedge.com/upload-resume. It shows the parsed fields, a score across six categories and the specific issues, without an account or card."],
    ["What is a good ATS score?", "80 and above is interview-ready; 60 to 79 needs work, usually keywords or measurable results; under 60 almost always means a formatting problem that breaks parsing."],
    ["Is a free ATS checker as good as a paid one?", "For diagnosing parsing, structure, keywords and bullet quality, yes. Paid tools mostly add volume (more scans) and job-description matching, which CVEdge also includes on its free tier."],
    ["Will the checker share my resume?", "CVEdge processes the file to score it and does not sell or share resume content. You can delete the resume from your account at any time."],
  ],
  "jobscan-alternative-the-best-free-ats-checker-in-2026": [
    ["What is the best free alternative to Jobscan?", "CVEdge offers job-description matching and an ATS score free, with AI rewrites for the gaps it finds. Resume Worded and Teal are other options with different free limits."],
    ["How many free scans does Jobscan allow?", "Jobscan meters its free tier to a small number of scans per month; the limit changes, so check their pricing page. The paid plan removes the cap."],
    ["Is Jobscan's match rate accurate?", "It is a good keyword-overlap measure, and keyword overlap is a large part of how recruiters search inside an ATS. It is not a prediction of an interview; the bullets still have to persuade a person."],
    ["Can I tailor my resume without a tool?", "Yes: copy the posting, highlight repeated skills and tools, and make sure each appears in a bullet with a result. A tool makes this faster and catches synonyms you would miss."],
  ],
  "zety-alternative-free-resume-builder": [
    ["Is Zety free to download?", "No. Zety lets you build for free but the download is paid, typically a low-cost trial that converts to a monthly subscription. Check the terms before entering card details."],
    ["What is a free alternative to Zety with no watermark?", "CVEdge exports PDF resumes free with no watermark and adds an ATS score and AI rewrites. Google Docs templates and Canva are free for design-only needs."],
    ["Can I move a resume built in Zety to another builder?", "Yes. Copy the text section by section, or if you have a PDF, upload it to a builder with a parser and it will rebuild the document as editable fields."],
    ["Are Zety templates ATS-friendly?", "The simple single-column ones are. The two-column and icon-heavy designs can lose section order in ATS parsing, so check the exported PDF before applying."],
  ],
  "best-resume-builder-2026": [
    ["What is the best free resume builder in 2026?", "For an ATS-safe resume with a score and AI rewrites, CVEdge. For visual templates, Canva. For a plain document, Google Docs. The right choice depends on whether your problem is building a document or fixing one."],
    ["Are paid resume builders worth it?", "Only if the paid feature solves your specific problem, such as unlimited job-description matching. Paying for templates alone is rarely worth it when free builders export without watermarks."],
    ["Which resume builders pass ATS?", "Any builder whose single-column templates export as text-based PDF. Avoid templates with tables, sidebars or icons, whichever tool you use, and test the export with an ATS checker."],
    ["Do resume builders sell my data?", "Policies vary. Read the privacy page; a builder that requires a card before download or emails aggressively is a signal to check carefully."],
  ],
  "what-is-ats-software-and-how-does-it-work": [
    ["What does ATS stand for?", "Applicant Tracking System: the software employers use to receive, store, search and rank job applications. Workday, Greenhouse, Lever, iCIMS and Taleo are the common ones."],
    ["Does an ATS automatically reject resumes?", "Rarely on its own. Knockout questions (work authorisation, minimum qualifications) reject automatically; otherwise the ATS ranks and filters, and a low-ranked resume is simply never opened by a recruiter."],
    ["How does an ATS read a resume?", "It parses the file into fields (contact, roles, dates, education, skills), then lets recruiters search and sort on those fields. Layouts the parser cannot read produce empty or garbled fields."],
    ["Do all companies use an ATS?", "Almost all large and mid-size employers do. Small companies may read email applications directly, but anything applied for through a careers portal goes through an ATS."],
  ],
  "how-to-increase-your-ats-score-from-60-to-90": [
    ["Why is my ATS score stuck around 60?", "Usually one of four issues: keyword gaps against the posting, bullets with no measurable result, missing or non-standard sections, or a layout that breaks parsing. Fix in that order for the fastest gain."],
    ["How quickly can I raise an ATS score?", "Formatting and section fixes take an hour and can add 15 to 20 points. Keyword and bullet rewrites take an afternoon per tailored version."],
    ["Does adding more keywords always increase the score?", "Only when they appear in bullets attached to real work. Stuffing a skills list raises the count but not the rank, and recruiters notice."],
    ["Is a 90 ATS score realistic?", "Yes for a tailored resume in a single-column template with the posting's terms in result-led bullets. A generic resume sent to every job rarely gets past the high 70s."],
  ],
  "how-ats-filters-resumes": [
    ["Does an ATS reject resumes automatically?", "Only through knockout questions on the application form. Otherwise it parses, stores and ranks; rejection happens when a recruiter never opens a low-ranked or badly parsed resume."],
    ["What does an ATS look for first?", "Parseable fields: name, contact details, job titles, employers, dates, education and skills. Then the recruiter's search terms, which are usually the posting's key skills and titles."],
    ["Can an ATS read a PDF?", "Yes, if the PDF contains real text. Scanned images, text in graphics and some two-column layouts parse badly. Check by uploading the file to a free ATS checker."],
    ["Where do most applications actually fail?", "At the search and ranking stage: the resume parsed but did not contain the terms the recruiter searched for, or ranked below the twenty or so they had time to open."],
  ],
  "resume-keywords-that-get-you-hired": [
    ["Where should keywords go on a resume?", "In experience bullets attached to a result, with a supporting skills section. A keyword that appears in both places reads as substantiated; one that appears only in a skills list carries little weight."],
    ["How many keywords should a resume have?", "Enough to cover the posting's core requirements, typically eight to fifteen distinct skills or tools, each used once or twice naturally. More than that reads as stuffing."],
    ["Do ATS systems understand synonyms?", "Partially. Many match common variants, but not reliably, so use the posting's exact phrasing for the important terms and add a common variant once if the field uses both."],
    ["Which resume keywords are a waste of space?", "Soft-skill filler such as \"team player\", \"hard-working\" and \"detail-oriented\", and generic verbs like \"responsible for\". They do not appear in recruiter searches and displace terms that do."],
  ],
  "how-to-tailor-your-cv-for-a-job-description": [
    ["How long does it take to tailor a resume for a job?", "Under five minutes with a match tool: paste the posting, add the missing keywords to relevant bullets and reorder your skills. Manually, budget about thirty minutes per application."],
    ["Should I tailor my resume for every application?", "Yes for roles you genuinely want. Tailoring the summary, skills and two or three bullets per role is usually enough; you do not need to rewrite the document."],
    ["What should I change when tailoring?", "The summary line, the order of skills, the specific tools and terms in your bullets, and the job title framing if the posting uses a different name for the same role."],
    ["Can tailoring hurt my resume?", "Only if you add claims you cannot back up in an interview. Match the language, not the requirements you do not meet."],
  ],
  "australian-resume-format-2026": [
    ["How long should an Australian resume be?", "Two to three pages for experienced professionals, up to four in academia, government and senior technical roles. A one-page resume reads as missing detail in Australia."],
    ["Should an Australian resume include a photo?", "No. Australian anti-discrimination practice means most employers prefer no photo, date of birth or marital status. Name, location, phone, email and LinkedIn are enough."],
    ["Do I need to address selection criteria?", "For government and many large-organisation roles, yes, in a separate document that answers each criterion with an example. For private-sector roles it is rarely required."],
    ["Should I list referees on an Australian resume?", "Yes, or state \"Referees available on request\" if you prefer to warn them first. Two referees, usually recent managers, is the norm."],
  ],
  "uk-cv-format-skilled-worker-visa-2026": [
    ["Should I mention that I need visa sponsorship on my UK CV?", "Yes, plainly, in one line near the top: \"Requires Skilled Worker sponsorship\". Hiding it wastes everyone's time and licensed sponsors will ask anyway."],
    ["How do I find UK employers that can sponsor me?", "Check the Home Office register of licensed sponsors on GOV.UK before applying. Only employers on that register can issue a Certificate of Sponsorship."],
    ["How long should a UK CV be?", "Two pages. Single column, no photo, no date of birth, with a short personal profile at the top and reverse-chronological experience."],
    ["Does my job title need to match a Skilled Worker occupation code?", "The employer maps the role to an eligible occupation code, but making the match visible in your CV (title, duties, level) helps them see that sponsorship is straightforward."],
  ],
  "cv-photo-rules-by-country-2026": [
    ["Should I put a photo on my resume in the US?", "No. US employers avoid resumes with photos because appearance, age and ethnicity are protected characteristics; many discard them unread."],
    ["Which countries expect a photo on a CV?", "Germany, Switzerland and Austria traditionally, though it is now optional under the AGG; the Gulf states, much of Asia and parts of southern Europe still commonly expect one."],
    ["Does a photo affect ATS parsing?", "Yes. A photo pushes the layout into a header block or sidebar, which is where parsers most often lose contact details and section order. If you include one, keep it small and in a single-column layout."],
    ["What if I am not sure whether to include a photo?", "Leave it out. No employer rejects a strong CV for lacking a photo, but several markets penalise having one."],
  ],
};

// ── 5. New US-direction articles ──────────────────────────────────────────────
interface NewPost {
  slug: string;
  title: string;
  seo_title: string;
  seo_description: string;
  brief: string;
  tags: string[];
  read_time_minutes: number;
  content_html: string;
}

const TEMPLATES_BLOCK = `
<h2>Templates That Parse Cleanly</h2>
<p><strong><a href="/resume-templates/ats-friendly/harvard-cv">Harvard Resume Template</a></strong> — the single-column academic-standard layout, and the most downloaded template on CVEdge. Set it to Letter and it is the safest US default.</p>
<p><strong><a href="/resume-templates/ats-friendly/classic-cv">Classic Resume Template</a></strong> — standard headings, no graphics, parses cleanly in Greenhouse, Workday, Lever and iCIMS.</p>
<p><strong><a href="/resume-templates/experienced/executive-cv">Executive Resume Template</a></strong> — for senior candidates who need the summary and leadership scope to land before the role history.</p>`;

const NEW_POSTS: NewPost[] = [
  {
    slug: "us-resume-format-2026",
    title: "US Resume Format 2026: What American Recruiters Expect",
    seo_title: "US Resume Format 2026: What American Recruiters Expect",
    seo_description: "The US resume format in 2026: one page, Letter size, no photo, achievement-led bullets and standard headings that parse in Workday, Greenhouse and Lever.",
    brief: "What a resume looks like when it is written for the American market: length, paper size, what to leave out, how to write bullets, and how it differs from the CV you may already have.",
    tags: ["CV Format", "Resume Writing", "ATS"],
    read_time_minutes: 7,
    content_html: `<h1>US Resume Format 2026</h1>
<p>American employers do not read CVs. They read resumes, and the difference is not only the word. A US resume is shorter, carries less personal information, leads with results rather than duties, and is printed on a different paper size from the document most of the world calls a CV. Candidates applying from the UK, India, the Gulf or Europe fail on these conventions far more often than they fail on qualifications.</p>
<p>This guide sets out the format American recruiters expect in 2026, section by section. If you are converting an existing CV, read this first and then the <a href="/blog/convert-cv-to-us-resume">step-by-step conversion guide</a>. Check whatever you have now with the free <a href="/upload-resume">ATS resume checker</a>.</p>

<h2>One Page, Sometimes Two</h2>
<p>One page is the rule for anyone with up to roughly ten years of experience. Two pages is accepted for senior managers, directors and specialists with long project histories. Three pages is never right outside academia and federal hiring. A US recruiter spends seconds on a first pass, and a long document reads as an inability to prioritise, not as depth.</p>
<p>To hit one page: keep three to five bullets for your current and previous role, one or two for anything older, and cut roles more than fifteen years back to a single line or drop them.</p>

<h2>Letter Size, Not A4</h2>
<p>US documents are 8.5 by 11 inches (Letter). A4 is 8.27 by 11.69 inches: narrower and taller. A resume laid out on A4 prints on a US printer with clipped or scaled margins, and a careful recruiter notices the odd proportions on screen. Set the paper size to Letter before you export the PDF. CVEdge does this automatically for visitors in the United States and Canada, and the designer panel lets you switch either way.</p>

<h2>What Never Goes on a US Resume</h2>
<ul>
<li>Photograph</li>
<li>Date of birth or age</li>
<li>Marital status, children, religion, gender</li>
<li>Nationality or passport number</li>
<li>Full street address (city and state is enough)</li>
<li>Social Security number</li>
<li>Salary history or expectations</li>
<li>"References available on request"</li>
<li>A declaration, signature, or "Date and Place" line</li>
<li>An objective statement ("Seeking a challenging role…")</li>
</ul>
<p>The personal fields are not merely unfashionable. Several are protected characteristics under US employment law, and employers avoid holding them because doing so creates legal exposure. A resume with a photo is frequently discarded unread for exactly that reason.</p>

<h2>The Contact Block</h2>
<p>Name on the first line, then one line of contact details: city and state (Austin, TX), phone number, email, LinkedIn URL. Add a portfolio or GitHub link if the role is design or engineering. Write the phone number in US form, (512) 555-0143, or with a country code if you are abroad, +91 98765 43210. Use a plain email address at a mainstream provider.</p>

<h2>Section Order</h2>
<ol>
<li><strong>Summary</strong> — two or three lines stating your title, years of experience, domain and one headline result. Optional, but it is where the recruiter's eye lands first.</li>
<li><strong>Experience</strong> — reverse chronological. Company, title, location, month and year dates, then bullets.</li>
<li><strong>Education</strong> — degree, major, school, year. Goes above Experience only for current students and new graduates.</li>
<li><strong>Skills</strong> — grouped by category, tools and technologies only, no rating bars and no soft skills.</li>
<li><strong>Certifications, Projects, Publications</strong> — only when they carry weight for the role.</li>
</ol>
<p>Use exactly those heading words. Applicant tracking systems map "Experience", "Education" and "Skills" reliably; "Career Journey" or "Where I've Been" may not be recognised as sections at all.</p>

<h2>How Americans Write Bullets</h2>
<p>Every bullet is a result, not a duty. Start with a past-tense verb (present tense for your current role), describe the specific work, and end with the measurable outcome. No "I", no "responsible for", no full sentences with articles.</p>
<blockquote>
<p>Before: Responsible for managing the regional sales team and improving performance.</p>
<p>After: Led a 12-person regional sales team to 118% of quota ($9.4M) in FY2025, up from 87% the prior year, by rebuilding the pipeline review process.</p>
</blockquote>
<p>Where a metric was not measured, give scale instead: team size, budget, users, markets, transactions. A bullet with no number and no scale is the single most common weakness in resumes that parse fine but still get no response. The <a href="/blog/how-to-write-resume-bullet-points-that-show-impact-with-examples">bullet-writing guide</a> has twelve before-and-after examples.</p>

<h2>Dates, Spelling and Numbers</h2>
<ul>
<li>Dates as Month YYYY: Mar 2023 – Present. Years alone are acceptable for older roles.</li>
<li>American spelling: optimize, organization, program, center, analyze, color.</li>
<li>Currency in US dollars with a dollar sign: $2.3M, $480K. Convert other currencies at an approximate rate rather than leaving rupees, dirhams or pounds unexplained.</li>
<li>State abbreviations in the postal form: CA, TX, NY.</li>
<li>Degree names in full on first use: Bachelor of Science in Computer Science.</li>
</ul>

<h2>Education the American Way</h2>
<p>Degree, major, institution, city and state, graduation year. GPA only if it is 3.5 or higher and you graduated in the last few years. No high school once you hold a degree. For a degree earned abroad, write the degree name as it appears on the certificate and add the US equivalent in parentheses if it is not obvious: Bachelor of Technology (B.Tech), Electronics (equivalent to a US bachelor's degree). A formal credential evaluation is only needed if the employer asks for one.</p>

<h2>The ATS Layer</h2>
<p>Most US employers with more than a few hundred staff receive applications through Workday, Greenhouse, Lever, iCIMS or Taleo. Those systems parse the file into fields and let recruiters search them. Single column, standard headings, no tables, no text boxes, no icons, saved as a text-based PDF unless the form asks for Word. Keywords from the posting belong inside your bullets, where they are attached to evidence, not only in the skills list. The <a href="/blog/best-resume-format-for-ats-templates-that-actually-work">ATS format guide</a> covers the layout choices that silently break parsing.</p>

<h2>Federal Resumes Are Different</h2>
<p>Applications through USAJOBS follow a separate convention: several pages, hours worked per week, supervisor names and contact permission, and detailed duty descriptions matched to the posting's questionnaire. Do not send a one-page private-sector resume to a federal posting, and do not send a federal resume anywhere else.</p>

<h2>Canada: Almost the Same</h2>
<p>Canadian resumes use Letter paper, omit photos and personal details, and lead with achievements in the same way. Two pages is more readily accepted than in the US, a work authorisation line is expected, and bilingual roles in Quebec may need a French version. The <a href="/blog/canadian-resume-format-2026">Canadian resume guide</a> covers the differences.</p>
${TEMPLATES_BLOCK}

<h2>Related Guides</h2>
<ul>
<li><a href="/blog/convert-cv-to-us-resume">How to Convert Your CV to a US Resume</a></li>
<li><a href="/blog/us-resume-international-candidates-h1b-opt">US Resume for International Candidates: H-1B and OPT</a></li>
<li><a href="/blog/us-resume-vs-european-cv">US Resume vs European CV</a></li>
<li><a href="/blog/resume-vs-cv-what-recruiters-actually-expect-in-2026">Resume vs CV: What Recruiters Expect</a></li>
</ul>

<h2>Frequently asked questions</h2>
<h3>How long should a US resume be in 2026?</h3>
<p>One page for up to about ten years of experience, two pages for senior candidates. Three pages is only normal for academic CVs and federal applications.</p>
<h3>Should a US resume include a photo?</h3>
<p>No. Appearance, age and ethnicity are protected characteristics, and many US employers discard resumes with photos unread to avoid the legal exposure of holding that information.</p>
<h3>What paper size is a US resume?</h3>
<p>Letter, 8.5 by 11 inches. A4 prints with clipped margins on US printers and looks subtly wrong on screen. Set Letter before exporting the PDF.</p>
<h3>Is a resume the same as a CV in the United States?</h3>
<p>No. In the US a CV is a long academic document listing publications, grants and teaching, used in academia, research and medicine. For every other job, the employer wants a resume, even if the posting says CV.</p>

<h2>Next Step</h2>
<p>Upload your current document to the free <a href="/upload-resume">ATS resume checker</a> to see what a US employer's system will extract from it, then fix the gaps before you apply.</p>`,
  },
  {
    slug: "convert-cv-to-us-resume",
    title: "How to Convert Your CV to a US Resume (Step by Step)",
    seo_title: "How to Convert Your CV to a US Resume (Step by Step)",
    seo_description: "Turn a UK, Indian, Gulf or European CV into a US resume in ten steps: what to delete, how to cut to one page, rewrite bullets with results and fix education.",
    brief: "A ten-step conversion for candidates applying to American employers from abroad: what to delete, what to compress, how to reframe employers and degrees, and how to check the result parses.",
    tags: ["CV Format", "Resume Writing", "Job Search"],
    read_time_minutes: 8,
    content_html: `<h1>How to Convert Your CV to a US Resume</h1>
<p>If you have a CV that works in London, Bengaluru, Dubai or Berlin, you already have most of the raw material for a US resume. What you do not have is the shape. The conversion is mostly subtraction and reframing, and it takes an afternoon if you work through it in order. This guide is the order.</p>
<p>It assumes you have read what the target looks like: the <a href="/blog/us-resume-format-2026">US resume format guide</a>. If you need visa sponsorship, also read the <a href="/blog/us-resume-international-candidates-h1b-opt">guide for international candidates</a> before you start, because it changes what goes in your header.</p>

<h2>Step 1: Rename It and Resize It</h2>
<p>Call the file a resume: <em>Priya-Sharma-Resume.pdf</em>, not <em>Priya_CV_Final_v3.pdf</em>. Change the page size to Letter (8.5 by 11 inches). If your document is in Word, that is Layout, Size, Letter. If you rebuild it in CVEdge from the US or Canada, Letter is already the default.</p>

<h2>Step 2: Delete the Personal Fields</h2>
<p>Remove, without exception: photograph, date of birth, age, gender, marital status, nationality, passport number, religion, father's or husband's name, full home address, and any "Personal Details" section that held them. Remove the declaration ("I hereby declare that the above information is true…"), the signature line and "Date and Place". Remove "References available on request" and any named referees. Remove salary history and expected salary.</p>
<p>Keep: your name, city and state (or city and country if you are abroad), phone, email, LinkedIn. That is the whole header.</p>

<h2>Step 3: Cut to One Page</h2>
<p>Under ten years of experience, one page. Over that, two at most. The cut is easier than it looks once the personal section, declaration and references are gone. Then: three to five bullets for your current and previous role, one or two for older roles, and a single line for anything more than fifteen years back. Drop the detailed project-by-project appendix that Indian and Gulf CVs often carry; it can be a separate document you send on request.</p>

<h2>Step 4: Turn Duties Into Results</h2>
<p>This is the biggest substantive change. A UK or Indian CV describes the role; a US resume describes what changed because you were in it. Rewrite each bullet as verb, specific work, measurable result.</p>
<blockquote>
<p>Before: Handled end-to-end recruitment for the engineering vertical and coordinated with stakeholders.</p>
<p>After: Filled 64 engineering roles in FY2025 at a median 31 days to hire, down from 52, by moving screening to structured phone interviews.</p>
</blockquote>
<p>Convert currency to US dollars at an approximate rate and say so: ₹40 crore becomes about $4.8M; AED 3.2M becomes about $870K. A number in a currency the recruiter cannot read is the same as no number. Where you genuinely have no metric, state scale: team size, budget, users, regions.</p>

<h2>Step 5: Explain Employers and Titles</h2>
<p>An American recruiter may not know Infosys from a ten-person agency, or that "Senior Executive" at an Indian firm is an early-career title. Add a descriptor after any employer that is not a household name in the US: <em>Wipro (IT services, 230,000 employees)</em>, <em>a Series B fintech in Dubai</em>. Keep your official job title, because background checks will confirm it, but use the first bullet to state the scope in US terms: "Managed a team of 8 and a $1.2M budget" says more than any title.</p>

<h2>Step 6: Rebuild Education</h2>
<p>List the degree, major, institution, location and year. Drop 10th and 12th standard results, school names and percentages. Do not convert your percentage or CGPA to a US GPA yourself unless you know the official scale; either omit it or state the original ("First Class, 78%"). Write the degree name as it appears on the certificate and add an equivalence only where it is not obvious: <em>Bachelor of Technology (B.Tech), Computer Science</em> is understood; <em>B.Com (equivalent to a US bachelor's degree in commerce)</em> may need the note. A WES or similar credential evaluation is only needed if the employer asks.</p>

<h2>Step 7: Rebuild the Skills Section</h2>
<p>Tools, technologies, languages and certifications, grouped by category. No rating bars, no percentages, no "communication skills" or "team player". Keep it to what you could be interviewed on today. The skills that matter most should also appear inside your experience bullets, where an ATS gives them more weight.</p>

<h2>Step 8: Fix Dates, Spelling and Phone</h2>
<p>Dates as Month YYYY (Jun 2021 – Aug 2024). American spelling throughout: optimize, organization, analyze, program. Phone number with a country code if you are outside the US, +44 7700 900123, and an email at a mainstream provider. If you are abroad, put your real city and country in the header and add a line such as "Relocating to Seattle, WA in January 2027" only if it is true. Do not borrow a US address.</p>

<h2>Step 9: Decide What to Say About Work Authorisation</h2>
<p>US resumes usually say nothing about visa status; the application form asks. State it on the resume only when it removes friction: "US citizen" or "Green card holder, no sponsorship required" if you are applying from overseas, or "F-1 OPT, work-authorised through May 2027, STEM extension eligible" if you are a recent graduate. Never write that you need sponsorship in the header; answer that question honestly on the form. The <a href="/blog/us-resume-international-candidates-h1b-opt">international candidates guide</a> covers the detail.</p>

<h2>Step 10: Check That It Parses</h2>
<p>Upload the finished PDF to the free <a href="/upload-resume">ATS resume checker</a>. It shows the fields a Workday or Greenhouse parser would extract, a score across six categories, and the specific bullets that still lack results. Fix anything that comes out garbled before you send it.</p>

<h2>A Conversion Checklist</h2>
<ul>
<li>Letter size, one page (two if senior), file named as a resume</li>
<li>No photo, date of birth, nationality, marital status, address, declaration or references</li>
<li>Every bullet has a verb, specific work and a number or a stated scale</li>
<li>Currency in US dollars; employers explained; titles kept but scope stated</li>
<li>Education limited to degrees, no school marks</li>
<li>Skills grouped, no soft skills, no rating bars</li>
<li>Month YYYY dates, American spelling, country-coded phone</li>
<li>Authorisation stated only where it helps; answered honestly on the form</li>
<li>Parsed cleanly by an ATS checker</li>
</ul>
${TEMPLATES_BLOCK}

<h2>Related Guides</h2>
<ul>
<li><a href="/blog/us-resume-format-2026">US Resume Format 2026</a></li>
<li><a href="/blog/us-resume-vs-european-cv">US Resume vs European CV</a></li>
<li><a href="/blog/dubai-cv-format-for-indian-professionals">Dubai CV Format for Indian Professionals</a></li>
<li><a href="/blog/relocating-abroad-cv-rewrite">Relocating Abroad? How to Rewrite Your CV</a></li>
</ul>

<h2>Frequently asked questions</h2>
<h3>What is the biggest difference between a CV and a US resume?</h3>
<p>Length and emphasis. A CV describes the role over two or more pages; a US resume describes measurable results in one page and omits every personal detail except contact information.</p>
<h3>Should I convert my Indian CGPA to a US GPA?</h3>
<p>Not by yourself. Scales differ by university and a self-converted GPA can be challenged in a background check. State the original mark or omit it; provide a formal evaluation only if the employer requests one.</p>
<h3>Do I need a US address on my resume?</h3>
<p>No. Use your real city and country. If you have a confirmed relocation date, state it in one line. A borrowed US address is discovered at the background check and reads as dishonest.</p>
<h3>Should I keep my original CV?</h3>
<p>Yes. Keep a master document with everything, then produce a one-page US resume and a two-page CV from it as needed. Applying across markets with the wrong document is one of the most common reasons strong candidates hear nothing back.</p>

<h2>Next Step</h2>
<p>Build the converted version in the free <a href="/free-resume-builder">resume builder</a> on a Letter-size template, then check it with the <a href="/upload-resume">ATS checker</a> before your first US application.</p>`,
  },
  {
    slug: "us-resume-international-candidates-h1b-opt",
    title: "US Resume for International Candidates: H-1B and OPT",
    seo_title: "US Resume for International Candidates: H-1B and OPT",
    seo_description: "How to write a US resume when you need sponsorship: what to say about H-1B, OPT and CPT, where work authorization belongs and how to make sponsoring you easy.",
    brief: "For F-1 students, OPT holders and professionals applying from abroad: how US employers screen for work authorization, what belongs on the resume versus the application form, and how to present yourself as a low-friction hire.",
    tags: ["Job Search", "CV Format", "Resume Writing"],
    read_time_minutes: 8,
    content_html: `<h1>US Resume for International Candidates</h1>
<p>An international candidate's US application has to clear two screens: the normal one (can you do the job) and a second one that domestic candidates never face (can this employer legally and practically hire you). Most candidates write for the first screen and either ignore the second or handle it in the wrong place. This guide covers what belongs on the resume, what belongs on the application form, and how to make sponsoring you look like a small task rather than a large one.</p>
<p>Nothing here is immigration advice. Visa rules, caps and dates change; check <a href="https://www.uscis.gov" rel="nofollow">USCIS</a> for the current position. The resume advice holds regardless.</p>

<h2>How US Employers Screen for Work Authorization</h2>
<p>Almost every US application form asks two questions: "Are you legally authorized to work in the United States?" and "Will you now or in the future require sponsorship for employment visa status?" In most applicant tracking systems those are knockout questions: an employer that has decided not to sponsor configures the system to filter on the answer, and no resume wording changes that. An employer that does sponsor uses the answers to route you correctly.</p>
<p>Two consequences follow. First, answer the form honestly; a wrong answer is discovered at the offer stage and withdraws it. Second, the resume is not where the sponsorship conversation happens, so the header should not lead with visa status unless stating it helps you.</p>

<h2>What to Put on the Resume</h2>
<p>The default is nothing. A US resume normally carries no line about nationality, visa or authorization. State it only when it removes a doubt the recruiter would otherwise carry:</p>
<ul>
<li><strong>You are applying from abroad and need no sponsorship</strong> (US citizen, green card, or an EAD that does not depend on the employer): one line, "US citizen" or "Permanent resident, no sponsorship required". Without it, a foreign address makes the recruiter assume the opposite.</li>
<li><strong>You are on F-1 OPT</strong>: "F-1 OPT, work-authorized through May 2027; STEM OPT extension eligible". The end date tells the employer how long they have before an H-1B decision, and the STEM note tells them the runway may be three years, not one.</li>
<li><strong>You already hold an H-1B</strong>: "H-1B holder, transferable". A transfer is not subject to the annual lottery, which is the single most reassuring fact an employer can read.</li>
</ul>
<p>Do not write "Requires H-1B sponsorship" in the header. It is true, it belongs on the form, and putting it above your name makes it the first thing a recruiter reads about you.</p>

<h2>OPT and CPT on the Resume</h2>
<p>Optional Practical Training gives F-1 graduates twelve months of work authorization after completing a degree, with a 24-month extension for eligible STEM degrees. Curricular Practical Training covers internships during the degree. On the resume, none of that needs explaining: list CPT internships and OPT jobs under Experience like any other role, with employer, title, dates and result bullets. The only place the visa category appears is the single status line described above, and only if you choose to include it.</p>
<p>The best thing an OPT candidate can do is make the internships look like jobs: named projects, real metrics, technologies used. "Summer intern" with no bullets is the most common weakness in F-1 resumes.</p>

<h2>H-1B: What Recruiters Know and What They Worry About</h2>
<p>The H-1B is employer-sponsored and capped. Each year 65,000 visas are available, with a further 20,000 for holders of US master's degrees or higher. Registration opens in March, selection is by lottery, and employment can start on October 1. Employers who sponsor accept a filing cost and an uncertainty that they might do the work and lose the lottery. That is the worry your resume has to answer.</p>
<p>Three things reduce it. A degree that clearly matches the role (the visa requires a "specialty occupation" tied to the degree field). A title and skill set that map directly to the posting, so the job description for the petition writes itself. And measurable results that make the hire worth the cost. A vague resume from a candidate who needs sponsorship is an easy no; a precise one is a calculation.</p>
<p>Cap-exempt employers, chiefly universities, university-affiliated nonprofits and nonprofit research organisations, can file at any time without the lottery. If your profile fits, target them explicitly.</p>

<h2>Applying From Outside the United States</h2>
<ul>
<li>Use your real city and country in the header. Do not borrow a US address; it surfaces in the background check.</li>
<li>Phone number with country code and, if it helps, a note on interview availability in US hours: "Available for interviews 8am–6pm Eastern".</li>
<li>If you have a confirmed relocation date, state it in one line. If you do not, say nothing; "willing to relocate" is assumed.</li>
<li>Convert currency in your bullets to US dollars and explain employers a US recruiter will not know: <em>Tata Consultancy Services (IT services, 600,000 employees)</em>.</li>
</ul>

<h2>Education and Credentials</h2>
<p>A US degree is listed normally. A degree earned abroad gets its certificate name plus an equivalence note if the name is unfamiliar. For H-1B purposes the employer's immigration counsel may request a formal credential evaluation later; you do not need one to apply. Do not translate your marks to a US GPA yourself.</p>

<h2>Mistakes That Cost International Candidates Interviews</h2>
<ul>
<li>Visa status in the headline or summary instead of a discreet line, or omitted entirely when it would have reassured.</li>
<li>Answering "no sponsorship required" on the form while on OPT. OPT is authorization now; the form usually asks about the future too.</li>
<li>A photograph, nationality, date of birth or marital status carried over from a home-country CV.</li>
<li>A three-page CV. American recruiters stop reading; see the <a href="/blog/us-resume-format-2026">US resume format guide</a>.</li>
<li>Internships and research assistantships listed without results.</li>
<li>Applying only to household-name companies. Mid-size employers and cap-exempt institutions sponsor more readily than their brands suggest.</li>
</ul>
${TEMPLATES_BLOCK}

<h2>Related Guides</h2>
<ul>
<li><a href="/blog/us-resume-format-2026">US Resume Format 2026</a></li>
<li><a href="/blog/convert-cv-to-us-resume">How to Convert Your CV to a US Resume</a></li>
<li><a href="/blog/uk-cv-format-skilled-worker-visa-2026">UK CV Format for Skilled Worker Visa Sponsorship</a></li>
<li><a href="/blog/canadian-resume-format-2026">Canadian Resume Format 2026</a></li>
</ul>

<h2>Frequently asked questions</h2>
<h3>Should I put my visa status on my US resume?</h3>
<p>Only when it removes friction: no sponsorship needed while applying from abroad, an OPT end date with STEM eligibility, or a transferable H-1B. If you need new sponsorship, leave it off the resume and answer the application form honestly.</p>
<h3>Can I say I do not need sponsorship while on OPT?</h3>
<p>Not if the form asks about the future. OPT authorises you now, but you will need an H-1B or another status later, and most forms ask "now or in the future". Answer yes to future sponsorship and let the OPT end date on your resume show the runway.</p>
<h3>Which employers sponsor H-1B visas?</h3>
<p>Past sponsors are public: the US Department of Labor publishes disclosure data and USCIS runs an H-1B employer data hub listing petitions by company. Universities, affiliated nonprofits and research organisations are cap-exempt and can file outside the lottery.</p>
<h3>Will an ATS reject me for needing sponsorship?</h3>
<p>Only if the employer configured the sponsorship question as a knockout, in which case nothing on the resume changes it. Where it is not a knockout, a precise, results-led resume that matches the posting is what gets you through.</p>

<h2>Next Step</h2>
<p>Check that your resume parses cleanly and that every role carries a result with the free <a href="/upload-resume">ATS resume checker</a>. Then apply to employers who can actually say yes.</p>`,
  },
];

// ── helpers ───────────────────────────────────────────────────────────────────
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const stripSuffix = (t: string) => t.replace(/\s*[|—–-]\s*CVEdge\s*$/i, "").trim();

function faqHtml(items: QA[]): string {
  return `\n<h2>Frequently asked questions</h2>\n` + items.map(([q, a]) => `<h3>${esc(q)}</h3>\n<p>${esc(a)}</p>`).join("\n") + "\n";
}

/** Insert the FAQ block before a trailing "Next Step"/CTA h2 when there is one, else append. */
function withFaq(html: string, items: QA[]): string {
  const block = faqHtml(items);
  const idx = html.search(/<h2[^>]*>\s*(Next Steps?|The Bottom Line|Final Thoughts)\s*<\/h2>/i);
  if (idx >= 0) return html.slice(0, idx) + block + html.slice(idx);
  return html.trimEnd() + "\n" + block;
}

function assertLengths() {
  const bad: string[] = [];
  for (const [slug, d] of Object.entries(DESCRIPTIONS)) if (d.length < 110 || d.length > 158 || /\s{2,}/.test(d)) bad.push(`desc ${slug} (${d.length})`);
  for (const [slug, t] of Object.entries(TITLES)) if (t.length > 60) bad.push(`title ${slug} (${t.length})`);
  for (const p of NEW_POSTS) {
    if (p.seo_title.length > 60) bad.push(`new title ${p.slug} (${p.seo_title.length})`);
    if (p.seo_description.length < 110 || p.seo_description.length > 158) bad.push(`new desc ${p.slug} (${p.seo_description.length})`);
    if (!/<h2>Frequently asked questions<\/h2>/.test(p.content_html)) bad.push(`new post ${p.slug} has no FAQ block`);
  }
  if (bad.length) { console.error("Length checks failed:\n  " + bad.join("\n  ")); process.exit(1); }
}

async function main() {
  const db = createAdminClient();

  if (RESTORE_IDX >= 0) {
    const file = process.argv[RESTORE_IDX + 1];
    const rows = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>[];
    for (const r of rows) {
      const { slug, ...rest } = r;
      const { error } = await db.from("blog_posts").update(rest).eq("slug", slug as string);
      if (error) console.error("restore failed", slug, error.message);
    }
    console.log(`restored ${rows.length} rows from ${file}`);
    return;
  }

  assertLengths();

  const { data: posts, error } = await db.from("blog_posts").select("slug, title, seo_title, seo_description, content_html, is_published");
  if (error) throw new Error(error.message);
  const bySlug = new Map(posts!.map((p) => [p.slug as string, p]));

  const updates: { slug: string; patch: Record<string, unknown>; why: string[] }[] = [];
  for (const p of posts!) {
    const slug = p.slug as string;
    const patch: Record<string, unknown> = {};
    const why: string[] = [];

    const currentTitle = (p.seo_title as string | null) ?? (p.title as string);
    let title = stripSuffix(currentTitle);
    if (TITLES[slug]) title = TITLES[slug];
    if (title !== p.seo_title) { patch.seo_title = title; why.push(`title ${currentTitle.length}→${title.length}`); }

    if (DESCRIPTIONS[slug] && DESCRIPTIONS[slug] !== p.seo_description) {
      patch.seo_description = DESCRIPTIONS[slug];
      why.push(`desc ${(p.seo_description as string | null)?.length ?? 0}→${DESCRIPTIONS[slug].length}`);
    }

    if (UNPUBLISH.includes(slug) && p.is_published) { patch.is_published = false; why.push("unpublish (301 in next.config.mjs)"); }

    if (FAQS[slug] && !UNPUBLISH.includes(slug)) {
      const html = (p.content_html as string) ?? "";
      if (/<h2[^>]*>[^<]*(?:\bFAQs?\b|frequently asked)[^<]*<\/h2>/i.test(html)) {
        why.push("FAQ SKIPPED: post already has a FAQ heading");
      } else {
        patch.content_html = withFaq(html, FAQS[slug]);
        why.push(`+FAQ(${FAQS[slug].length})`);
      }
    }

    if (Object.keys(patch).length) updates.push({ slug, patch, why });
  }

  const missingFaqTargets = Object.keys(FAQS).filter((s) => !bySlug.has(s));
  const missingDescTargets = Object.keys(DESCRIPTIONS).filter((s) => !bySlug.has(s));
  if (missingFaqTargets.length || missingDescTargets.length) {
    console.error("Unknown slugs:", { missingFaqTargets, missingDescTargets });
    process.exit(1);
  }

  const inserts = NEW_POSTS.filter((p) => !bySlug.has(p.slug));
  const skippedInserts = NEW_POSTS.filter((p) => bySlug.has(p.slug)).map((p) => p.slug);

  console.log(`${DRY ? "[DRY RUN] " : ""}${updates.length} posts to update, ${inserts.length} to insert${skippedInserts.length ? ` (already exist: ${skippedInserts.join(", ")})` : ""}`);
  for (const u of updates) console.log(`  ${u.slug}: ${u.why.join("; ")}`);
  for (const p of inserts) console.log(`  + ${p.slug} (${p.content_html.replace(/<[^>]+>/g, " ").split(/\s+/).length} words)`);
  if (DRY) return;

  // Backup every row we are about to touch (restore with --restore <file>).
  const backup = updates.map((u) => {
    const row = bySlug.get(u.slug)!;
    const snap: Record<string, unknown> = { slug: u.slug };
    for (const k of Object.keys(u.patch)) snap[k] = row[k as keyof typeof row];
    return snap;
  });
  writeFileSync(BACKUP_PATH, JSON.stringify(backup, null, 2));
  console.log(`backup written: ${BACKUP_PATH}`);

  let ok = 0;
  for (const u of updates) {
    const { error: e } = await db.from("blog_posts").update(u.patch).eq("slug", u.slug);
    if (e) console.error("  update failed", u.slug, e.message); else ok++;
  }
  console.log(`updated ${ok}/${updates.length}`);

  for (const p of inserts) {
    const { error: e } = await db.from("blog_posts").insert({
      slug: p.slug,
      title: p.title,
      seo_title: p.seo_title,
      seo_description: p.seo_description,
      brief: p.brief,
      tags: p.tags,
      read_time_minutes: p.read_time_minutes,
      content_html: p.content_html,
      content_md: null,
      cover_image_url: null,
      author_name: "CVEdge",
      is_published: true,
      published_at: new Date().toISOString(),
    });
    if (e) console.error("  insert failed", p.slug, e.message); else console.log(`  inserted ${p.slug}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
