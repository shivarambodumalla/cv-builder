import { TEMPLATES_MD, NEXT_STEP_MD, type DraftPost } from "./types";

export const DRAFTS_2: DraftPost[] = [
  {
    slug: "workday-resume-tips-2026",
    title: "Applying Through Workday: How to Make Your Resume Parse Correctly",
    seo_title: "Workday Resume Tips: Make Your Resume Parse Correctly",
    seo_description: "Why Workday applications mangle resumes, how its parser fills the form, which layouts break it, and the fix-and-verify routine to run before you submit.",
    brief: "Workday is the application portal behind a large share of Fortune 500 careers pages, and its parser is famously literal. What it reads well, what it drops, and how to check before you hit submit.",
    tags: ["ATS", "Job Search", "CV Format"],
    read_time_minutes: 7,
    content_md: `# Applying Through Workday: How to Make Your Resume Parse Correctly

If you have applied to a large American employer recently, you have met Workday: the portal that asks you to upload a resume, then presents a multi-page form pre-filled with what it extracted, often with your job titles in the wrong fields and your dates missing. Candidates blame themselves, spend twenty minutes retyping, and still wonder whether the recruiter sees the garbled version or the fixed one.

This guide explains what Workday's parser is doing, which resume layouts it reads well, and how to verify your application before submitting.

## What Workday Actually Does With Your Resume

Workday Recruiting stores the uploaded file and separately parses it into structured fields: name, contact details, each work experience entry (employer, title, start and end dates, location, description), education entries, and skills. The parsed fields populate the candidate profile the recruiter searches and filters. The original file is attached and can be opened, but recruiters filtering by title, years or skill are querying the parsed data, not the PDF.

So a badly parsed resume has two problems: the form you must correct, and a profile that may already be wrong in the fields recruiters search.

## Layouts That Break the Parser

Workday's parser (like most) reads text in the order it appears in the file and looks for recognisable patterns: a line that looks like a job title followed by a line that looks like a company and a date range. Anything that disrupts that order confuses it.

- **Two-column layouts.** Text is read across the columns or one column at a time, so dates from a sidebar land in the wrong job or nowhere.
- **Tables.** Cells are read in an unpredictable order. A table used to align dates on the right is the most common single cause of missing dates.
- **Text boxes and headers.** Contact details placed in the document header of a Word file are often not read at all.
- **Icons and graphics.** A phone icon instead of the word "Phone" removes the label the parser uses to identify the number.
- **Non-standard headings.** "Where I've Worked" is not recognised as an experience section. "Experience" or "Work Experience" is.
- **Dates in unusual formats.** "Summer 2024" and "2023 to now" parse worse than "Jun 2024 – Aug 2024" and "Mar 2023 – Present".

## Layout That Parses Cleanly

- Single column, Letter size, standard margins.
- Contact details in the body of the document, not the header, each on its own line or separated by pipes.
- Section headings in plain words: Summary, Experience, Education, Skills, Certifications.
- Each job as: Job Title on one line, Company, City, State on the next, then the date range on its own line or at the end of the company line, then bullets.
- Month and year dates, consistent throughout.
- Bullets as real bullet characters, not symbols or images.
- PDF exported from Word or Google Docs, or a DOCX. Not a scan, not a design-tool export with text converted to outlines.

The [ATS format guide](/blog/best-resume-format-for-ats-templates-that-actually-work) goes deeper on the design choices that silently break parsing.

## The Verify-and-Fix Routine

1. Upload the resume and let Workday parse it.
2. Read every pre-filled field before moving on. Do not trust the "looks about right" impression; check each job's title, employer, dates and location.
3. Correct every error in the form. The parsed fields, not the file, are what recruiters search.
4. Where Workday adds a "skills" field, add the tools and technologies from the posting that you genuinely have. This field is searchable.
5. Answer the screening questions accurately. Work authorisation and minimum qualification questions are commonly configured as knockouts.
6. Before submitting, review the summary page. It shows the profile the recruiter will see.

If the same fields are wrong every time, the layout is the cause. Fix the file and re-upload rather than retyping on every application.

## Test Before You Apply

You can see roughly what Workday will extract by running the file through a free [ATS resume checker](/upload-resume), which shows the parsed fields as well as a score. If the checker reads your dates and titles correctly, Workday almost certainly will. If it does not, fix the layout first.

## Fields Workday Cares About That Resumes Often Omit

- **Location per job.** Many resumes list a city only in the contact block. Add city and state to each role.
- **End dates.** "Present" is fine; a missing end date is often parsed as a one-day job.
- **Employer names as registered.** "Google" parses; "Google (Alphabet Inc.)" sometimes splits.
- **Degree and field separately.** "BS, Computer Science" parses into two fields; "Computer Science degree" may not.

## Reusing Your Workday Profile

Workday installations are per employer, so a profile at one company does not carry to another, although "autofill from LinkedIn" and "autofill from resume" both exist. Keep one clean, parse-friendly master resume and use it everywhere; the ten minutes you save per application add up across a job search.
${TEMPLATES_MD}
## Related Guides

- [The Best Resume Format for ATS](/blog/best-resume-format-for-ats-templates-that-actually-work)
- [How ATS Filters Resumes](/blog/how-ats-filters-resumes)
- [US Resume Format 2026](/blog/us-resume-format-2026)

## Frequently asked questions

### Does the recruiter see my uploaded resume or the parsed version?

Both exist, but recruiters search and filter on the parsed fields. A recruiter filtering for candidates with five years in a title will never open your PDF if the parsed dates say two years.

### Why does Workday put my job title in the company field?

Its parser expects title first, then company and dates, on separate lines. If your resume puts the company in bold above the title, or both on one line separated by a comma, the parser guesses. Reorder to title, then company, then dates.

### Should I retype everything instead of uploading?

Upload, then correct. Manual entry alone leaves the resume attachment empty, and some recruiters open it. Uploading a clean file gives you both a correct profile and a readable document.

### Is Workday the same as an ATS?

Workday Recruiting is one of the major applicant tracking systems, alongside Greenhouse, Lever, iCIMS and Taleo. The parsing advice here applies to all of them; Workday is simply the one where candidates see the parsed result most directly.
${NEXT_STEP_MD}`,
  },
  {
    slug: "remote-job-resume-2026",
    title: "Remote Job Resume: What Employers Screen For in 2026",
    seo_title: "Remote Job Resume: What Employers Screen For in 2026",
    seo_description: "How to write a resume for remote jobs: the location line, proving you have worked remotely, the tools employers screen for, and time-zone framing.",
    brief: "Remote postings draw ten times the applicants. The specific evidence that gets a remote resume past the first screen: location handling, demonstrated remote results, and the collaboration tools that act as keywords.",
    tags: ["Job Search", "Resume Writing"],
    read_time_minutes: 6,
    content_md: `# Remote Job Resume: What Employers Screen For in 2026

Remote postings attract far more applications than office roles, which means the first screen is harsher and more automated. Recruiters filtering a remote pipeline are looking for a small number of specific signals: that you are in a location the company can employ, that you have delivered results without a manager in the room, and that you already use the tools the team runs on. A resume that makes those three things obvious in the first ten seconds gets read; one that leaves them to be inferred does not.

## The Location Line

Remote does not mean location-free. Most US employers can only hire in states where they are registered for payroll and tax, and many remote postings state "US only" or list eligible states. Recruiters filter on location, so the contact block must carry one.

Write your city and state, then a remote signal if it applies:

> Denver, CO · Remote (US) · Open to Mountain or Pacific hours

Do not write "Location: Remote" alone; the parser and the recruiter both need a real place. If you are outside the US applying for a US-remote role, state your country and time zone honestly. Misrepresenting location is discovered at payroll and withdraws offers.

## Prove You Have Done It Before

The strongest evidence for a remote role is a result delivered remotely. If any of your previous roles was remote or hybrid, say so in the job line and let the bullets show what you shipped.

> Senior Product Designer, Northwind Health (Remote, US), Mar 2022 – Present

> Led the redesign of the patient scheduling flow with a fully distributed team across four time zones; completion rate rose from 61% to 84% over two releases.

Terms that carry weight because recruiters search for them: "distributed team", "asynchronous", "across time zones", "remote-first". Use them where they are true.

## The Habits Employers Screen For

Remote hiring managers worry about three things: communication, self-direction and reliability. Each can be evidenced in a bullet rather than claimed in a summary.

- **Written communication:** "Wrote the team's onboarding runbook, cutting new-hire ramp from 6 weeks to 3."
- **Self-direction:** "Owned the quarterly roadmap for the payments squad end to end; delivered 11 of 12 committed items."
- **Reliability and rhythm:** "Ran the weekly async status process for a 14-person team for two years; zero missed stakeholder updates."

"Self-motivated" and "excellent communicator" in a skills list are the claims; bullets like these are the proof.

## Tools as Keywords

Remote teams run on named tools, and postings list them. Include the ones you use in a grouped skills line, and mention the important ones in bullets where they were part of the work.

- Communication: Slack, Microsoft Teams, Zoom, Loom
- Work management: Jira, Asana, Linear, Notion, Confluence, Trello
- Engineering and design: GitHub, GitLab, Figma
- Documentation and async: Google Workspace, Notion, Miro

A recruiter searching a remote pipeline for "Slack AND Jira AND Notion" will find the resumes that list them.

## Time Zones and Availability

If the posting names a time zone or core hours, state that you can meet them. If you are several zones away, say what overlap you offer: "Available 8am to 2pm Eastern daily". Vague willingness reads as a problem to be managed; a specific overlap reads as a solution.

## Home Setup, Equipment and Contractors

For employee roles, do not list your home office setup; it is assumed. For contractor and freelance remote work, a short line on availability, hours per week and invoicing arrangement can help, and past client results belong under Experience like any job.

## The Summary for a Remote Application

Three lines, with remote experience stated if you have it:

> Customer success manager with 6 years in B2B SaaS, the last 4 fully remote managing a $5M renewal book across US and EU accounts. Held net revenue retention at 110% with a distributed team of three; built the async QBR process the department now uses.

## Mistakes That Remove Remote Candidates Early

- No location, or "Remote" as the only location.
- Applying from an ineligible state or country without reading the posting.
- Claiming remote skills in adjectives rather than bullets.
- A two-column or graphic layout that the applicant tracking system cannot parse. Remote pipelines are large enough that nobody opens a badly parsed file.
- Sending a generic resume. Remote postings list their tools and their working norms; mirror them.
${TEMPLATES_MD}
## Related Guides

- [Resume Summary Examples for 2026](/blog/resume-summary-examples-2026)
- [Resume Keywords That Get You Hired](/blog/resume-keywords-that-get-you-hired)
- [How to Tailor Your Resume for a Job Description](/blog/how-to-tailor-your-cv-for-a-job-description)

## Frequently asked questions

### Should I put "remote" as my location on a resume?

No. Put your real city and state, then add "Remote (US)" or "Open to remote" after it. Employers filter on location for payroll and tax reasons and need a real place.

### How do I show remote work experience if my old job was in an office?

Point to the parts that were remote in practice: distributed stakeholders, async documentation, cross-time-zone projects, the pandemic period if your team worked from home. Evidence results delivered without co-location.

### Do remote resumes need to be different from normal ones?

The format is the same. The differences are the location line, explicit remote experience in job lines and bullets, and the collaboration tools listed as skills.

### Can I apply to US remote jobs from another country?

Only if the posting allows it; most US-remote roles are US-only for legal and tax reasons. Where international hiring is allowed, state your country and time-zone overlap plainly.
${NEXT_STEP_MD}`,
  },
  {
    slug: "executive-resume-guide-2026",
    title: "Executive Resume Guide 2026: Two Pages That Show Scope and Results",
    seo_title: "Executive Resume Guide 2026: Show Scope and Results",
    seo_description: "How to write a director, VP or C-level resume for US employers: two-page structure, a scope line for every role, P&L evidence and what search firms screen.",
    brief: "At the executive level the resume is read by search consultants, boards and CEOs, and the questions change: what did you own, what moved, and can it be verified. Structure, scope lines and examples.",
    tags: ["Role Guides", "Resume Writing"],
    read_time_minutes: 7,
    content_md: `# Executive Resume Guide 2026

An executive resume is read by different people for different reasons. A retained search consultant reads it to decide whether you fit a brief. A board member reads it to judge whether you have run something of comparable scale. A CEO reads it to see what you changed. All three are asking the same two questions: what did you own, and what happened because you owned it. A resume that lists responsibilities answers neither.

This guide covers the two-page structure US executive hiring expects, the scope line that belongs under every role, and the evidence that gets a director, VP or C-level candidate onto a shortlist.

## Two Pages, and Why Not Three

Two pages is the American executive standard. The first page carries the summary, a short block of career highlights and the current or most recent role; the second carries earlier roles, board positions, education and credentials. A third page reads as an inability to prioritise, which is a disqualifying trait at this level. Roles more than fifteen years old are compressed to one line each; early-career roles can be summarised in a single "Earlier career" line.

## The Summary at Executive Level

Three to four lines. The scale of what you have run, the domains, the pattern of results, and the type of role you are seeking if it narrows usefully.

> Chief Operating Officer with 18 years in consumer healthcare, most recently running operations, supply chain and customer service ($420M revenue, 1,900 staff, 6 sites) for a PE-backed brand through a successful exit at 3.1x. Track record of margin expansion and integration: three acquisitions integrated, EBITDA margin from 11% to 19%.

## The Scope Line

Under each role's title and dates, before the bullets, put one line stating what you owned: revenue or budget, headcount, geographies, functions, reporting line. This is the single most useful addition to most executive resumes because it lets a reader calibrate every bullet that follows.

> VP Engineering, Meridian Software (Austin, TX), 2021 – Present
> Scope: 140 engineers across 4 product lines; $38M budget; reported to the CEO; member of the executive team.

## Bullets That Move at This Level

Executive bullets are outcomes with the mechanism named, so a reader can judge whether the result was yours. Four to six for the current role, three or four for the previous, fewer below.

> Led the replatforming from a monolith to services over 18 months; release cadence went from monthly to daily and infrastructure cost fell 34% ($6.1M annualised).

> Restructured the sales organisation into industry verticals; new-logo ARR grew 47% year on year and average deal size doubled to $210K.

> Negotiated and integrated the acquisition of a 90-person analytics firm; retained 94% of its staff at 12 months and cross-sold its product into 60 existing accounts.

Numbers should be verifiable: revenue, margin, headcount, cost, growth rates, deal sizes, retention. Search firms and boards check references against them.

## Career Highlights Block

Between the summary and the first role, three to five bullets pulling the biggest results from anywhere in the career. This is what a consultant reads if they read nothing else, and it is where an exit, a turnaround, a major launch or an award belongs.

## Board, Advisory and Governance

List board seats, advisory roles and committee memberships in a short section with dates and the organisation's scale. Non-profit boards count. For public company boards, name the committees.

## Education, Credentials and Recognition

Degrees with institution and year. Executive education (Harvard, Wharton, Stanford programs) in one line each. Professional credentials (CPA, PE, PMP) and relevant licences. Awards and speaking only where they are notable; a line, not a section.

## What Search Firms Screen For

- Scale match: revenue, headcount and complexity comparable to the brief.
- Pattern: a repeatable type of result (growth, turnaround, integration, transformation) rather than one lucky year.
- Trajectory: increasing scope over time, with reasons for any sideways or downward move.
- Industry adjacency: enough domain overlap to be credible with the board.
- Stability: tenures long enough to have seen results land, typically three years or more.

Gaps and short tenures are not disqualifying, but they will be asked about. A one-line explanation in the resume ("Company acquired; role eliminated in integration") pre-empts the question.

## Format

Single column, conservative typography, Letter size, PDF. Executive resumes still pass through applicant tracking systems at large employers and through search-firm databases that parse them, so the same rules apply: no tables, no columns, no graphics. Restraint is also the correct signal at this level. The [ATS format guide](/blog/best-resume-format-for-ats-templates-that-actually-work) covers what breaks parsing.

## What Weakens an Executive Resume

- A list of responsibilities without a scope line or outcomes.
- Claiming company-level results with no mechanism showing your part in them.
- A dense first page with no highlights block.
- Three or more pages.
- A photo, personal details or an objective statement.
- Vague verbs: "spearheaded", "drove", "transformational" without numbers.
${TEMPLATES_MD}
## Related Guides

- [Resume Summary Examples for 2026](/blog/resume-summary-examples-2026)
- [How to Write Resume Bullet Points That Show Impact](/blog/how-to-write-resume-bullet-points-that-show-impact-with-examples)
- [US Resume Format 2026](/blog/us-resume-format-2026)

## Frequently asked questions

### How long should an executive resume be?

Two pages. Page one holds the summary, highlights and current role; page two the earlier roles, boards and education. Three pages signals poor prioritisation.

### Should an executive resume include a photo?

No. US convention excludes photos at every level, and executive search firms follow it.

### Do executives need to worry about ATS?

Yes. Large employers route executive applications through the same systems, and search firms parse resumes into databases. A single-column, plainly formatted PDF parses in both.

### How do I handle a short tenure or a company that failed?

State the reason in one line under the role: acquisition, restructuring, funding. A brief factual explanation reads better than an unexplained gap that a consultant will ask about anyway.
${NEXT_STEP_MD}`,
  },
  {
    slug: "registered-nurse-resume-guide-2026",
    title: "Registered Nurse Resume Guide 2026: Licenses, Units and Evidence",
    seo_title: "Registered Nurse Resume Guide 2026: What Hospitals Screen",
    seo_description: "How to write an RN resume for US hospitals: license and certification lines, unit type and ratios, clinical metrics, EHR systems, and examples by specialty.",
    brief: "Nurse recruiters screen for license, unit experience and certifications before anything else. Where each goes, the clinical numbers that distinguish a resume, and before-and-after bullets for med-surg, ICU and ED.",
    tags: ["Role Guides", "Resume Writing"],
    read_time_minutes: 7,
    content_md: `# Registered Nurse Resume Guide 2026

Nurse recruiters read a resume in a fixed order: license and state, certifications, unit type and years, then everything else. A resume that buries the license under a summary paragraph or lists "patient care" without a unit type or a ratio forces the recruiter to hunt for what they need, and in a hospital with two hundred open positions they do not hunt. This guide covers where each element goes, what to quantify, and how to write clinical bullets that show judgment rather than tasks.

## The Header Does Clinical Work

Put credentials after your name, in the order used in US practice: highest degree, licensure, national certifications.

> **Jordan Alvarez, BSN, RN, CCRN**
> Phoenix, AZ · (602) 555-0142 · jordan.alvarez@email.com · linkedin.com/in/jordanalvarezrn

Directly under the contact line, a licensure line:

> RN license: Arizona (compact), active, expires 03/2028 · BLS, ACLS, PALS (AHA) · CCRN (AACN), 2024

Recruiters filter on state license and compact status before reading further. Putting it in the header removes their first question.

## Summary With Unit and Scale

> Critical care nurse (BSN, RN, CCRN) with 6 years in a 24-bed medical ICU at a Level I trauma center, 2 years as charge nurse. Precepted 9 new graduates; led the CLABSI bundle audit that took unit infection rate to zero for 14 consecutive months.

Unit type, bed count, facility level and years are the calibration a recruiter needs. Ratios can go here or in the role's scope line.

## Experience Entries

Each role: title, unit, facility with city and state, dates. Then a scope line, then three to five bullets.

> Staff Nurse, Medical ICU (24 beds), Banner University Medical Center, Phoenix, AZ · Jun 2020 – Present
> Scope: 1:2 ratio; ventilated, CRRT and post-cardiac-arrest patients; charge nurse two shifts a week.

Bullets that distinguish:

> Managed care for ventilated and CRRT patients with 1:2 ratios; zero central-line infections on my assignments over 14 months during the CLABSI bundle initiative.

> Precepted 9 new-graduate nurses through 12-week orientations; all 9 passed competency validation on first attempt.

> Served as Epic super-user for the unit's 2024 upgrade; trained 40 staff and logged 30 workflow issues resolved before go-live.

> Reduced unit fall rate 38% over one year as lead of the mobility protocol working group.

The pattern is clinical scope plus a measurable outcome. Fall rates, infection rates, restraint use, pressure injury incidence, throughput, orientation completion, patient satisfaction scores and audit results are all numbers nurses can legitimately claim a share in.

## Examples by Specialty

**Emergency department:**
> Triaged an average of 45 patients per shift in a 60-bed ED with 90K annual visits; door-to-provider time for ESI 2 patients held under 10 minutes on my triage shifts.

**Medical-surgical:**
> Managed 1:5 assignments on a 32-bed telemetry unit; led the bedside shift report rollout that raised HCAHPS nurse communication scores from the 48th to the 71st percentile.

**Labor and delivery:**
> Provided care through 300+ deliveries a year including high-risk inductions; fetal monitoring certified (C-EFM); precepted 4 new L&D nurses.

**Operating room:**
> Circulated and scrubbed for 600+ orthopedic and general cases a year; led count reconciliation changes that eliminated retained-item near-misses for 18 months.

**Home health:**
> Managed a caseload of 28 Medicare patients across Maricopa County; OASIS accuracy audits at 99%; 30-day readmission rate for my caseload 11% against an agency average of 17%.

## Skills Section

Clinical skills and systems, grouped. EHR systems are searchable keywords: Epic, Cerner (Oracle Health), Meditech. Equipment and modalities: ventilators, CRRT, IABP, ECMO, telemetry, PCA pumps. Certifications repeated here if space allows. No soft skills.

## Education and Clinical Training

Degree, school, city and state, year. For new graduates, list clinical rotations with unit and hours, and any capstone or preceptorship placement, because that is your unit experience.

## New Graduate Nurses

Lead with license status ("RN, NCLEX passed May 2026, Texas license pending" or "active"), then education with rotations and hours, then any nurse-tech, CNA or externship roles with the same result-led bullets. A residency application is screened for license, GPA and clinical hours; make all three easy to find.

## Travel and Contract Nurses

List each assignment with facility, unit, dates and the agency in parentheses. Recruiters for travel roles screen on unit experience across facilities, so consistency of unit type and clear dates matter more than the number of assignments.

## Mistakes That Get Nurse Resumes Set Aside

- License and state missing from the header.
- "Provided patient care" without unit type, ratio or outcome.
- Expired certifications listed without dates.
- A two-column template that separates the license line from the name when parsed. Hospital systems use the same applicant tracking software as every other large employer; the [ATS format guide](/blog/best-resume-format-for-ats-templates-that-actually-work) covers what breaks.
- Three pages. Two is the maximum even for long clinical careers.
${TEMPLATES_MD}
## Related Guides

- [Resume Summary Examples for 2026](/blog/resume-summary-examples-2026)
- [Nursing and Healthcare CV for the Gulf](/blog/nursing-healthcare-cv-gulf)
- [How to Write Resume Bullet Points That Show Impact](/blog/how-to-write-resume-bullet-points-that-show-impact-with-examples)

## Frequently asked questions

### Where do I put my nursing license on a resume?

In the header, directly under your contact details: state, compact status, active status and expiry. Credentials (BSN, RN, CCRN) go after your name. Recruiters filter on these before reading anything else.

### How long should a nurse resume be?

One page for under about eight years of experience, two pages for experienced nurses with multiple specialties or leadership roles. Never three.

### Should I list every certification?

List current ones with the issuing body and year. Drop expired certifications unless you are renewing them, and say so. BLS, ACLS and PALS are expected and should be present; specialty certifications (CCRN, CEN, CNOR) are differentiators.

### What metrics can a nurse put on a resume?

Patient ratios, bed counts, infection and fall rates, HCAHPS scores, orientation completions, audit results, throughput times, readmission rates and volumes such as deliveries or cases per year. Any unit-level result you contributed to can be cited with your role in it stated honestly.
${NEXT_STEP_MD}`,
  },
  {
    slug: "sales-account-executive-resume-guide-2026",
    title: "Account Executive Resume Guide 2026: Quota, Pipeline and Proof",
    seo_title: "Account Executive Resume Guide 2026: Quota and Proof",
    seo_description: "How to write an account executive resume: quota attainment by year, deal size and cycle, the methodology and tools recruiters search for, with examples.",
    brief: "Sales resumes are judged on numbers first and everything else second. The attainment table, the metrics that matter by segment, and the bullets that turn a quota history into a shortlist.",
    tags: ["Role Guides", "Resume Writing"],
    read_time_minutes: 6,
    content_md: `# Account Executive Resume Guide 2026

Sales hiring managers read a resume for one thing before anything else: did you hit your number, and how often. A sales resume without quota attainment by year is read as a resume from someone who did not, and everything else on it is discounted. Once the numbers are there, the questions become segment, deal size, cycle length and method, because those decide whether your record transfers to their market.

This guide covers the attainment evidence, the metrics by segment, the keywords recruiters search, and bullet rewrites for account executive, SDR and sales leadership resumes.

## Attainment First

Under each sales role, give quota attainment for every full year, with the quota itself. A compact form works:

> Quota attainment: FY2025 127% ($3.1M on $2.45M) · FY2024 104% ($2.3M on $2.2M) · FY2023 91% ($1.6M on $1.75M)

Include the miss. A record of 127%, 104% and 91% is credible; a record that only shows the good year is assumed to hide worse ones. Presidents Club, top-percentile rankings and awards go beside the attainment line.

## The Scope Line

Under the title and dates, one line calibrating the role: segment, territory, average deal size, sales cycle, products.

> Scope: Enterprise (1,000 to 10,000 employees), US East; ACV $60K to $250K; 4 to 7 month cycle; HR and payroll suite; new logo plus expansion.

Recruiters match this line against their brief. A mid-market rep with $30K deals applying for an enterprise role with $300K deals will be asked about the gap; the scope line lets them see the fit or the stretch immediately.

## Metrics by Segment

**SDR and BDR:** meetings booked per month against target, qualified pipeline generated, conversion from meeting to opportunity, activity volumes if they are notable, and the promotion timeline.

> Booked 38 qualified meetings a month against a target of 25 (152%); pipeline sourced $4.2M in FY2025; promoted to AE in 14 months.

**Mid-market and SMB AE:** attainment, deal count, average deal size, cycle, win rate, and any multi-threading or land-and-expand results.

> Closed 61 new logos in FY2025 at an average ACV of $28K; win rate 31% against a team average of 24%.

**Enterprise AE:** attainment, deal size, named-account wins where public, cycle, multi-year value, and executive-level relationships.

> Landed a $640K three-year agreement with a Fortune 500 retailer after a nine-month cycle, displacing an incumbent vendor; expanded to $1.1M in year two.

**Account management and customer success sales:** renewal rate, net revenue retention, expansion revenue, churn prevented.

> Managed a $7M renewal book at 94% gross retention and 118% net retention; expansion revenue $1.3M in FY2025.

**Sales leadership:** team attainment, ramp time, rep retention, hiring, pipeline coverage.

> Led a team of 9 AEs to 112% of a $14M team quota; cut average ramp to first deal from 5 months to 3 with a rebuilt onboarding program; rep retention 100% over two years.

## Methodology and Tools as Keywords

Recruiters search for the methodology and stack the team runs on. Name them where true: MEDDIC, MEDDPICC, Challenger, SPIN, Sandler, Command of the Message. Tools: Salesforce, HubSpot, Outreach, Salesloft, Gong, ZoomInfo, LinkedIn Sales Navigator, Apollo, Clari. A grouped skills line plus mention inside bullets where they mattered.

## Bullet Rewrites

> Before: Responsible for prospecting and closing new business in assigned territory.
>
> After: Built the Southeast territory from zero to $1.9M ARR in 18 months through outbound sequences in Outreach and a partner referral program that sourced 30% of pipeline.

> Before: Exceeded sales targets and built strong customer relationships.
>
> After: 127% of a $2.45M quota in FY2025; closed the company's largest deal of the year ($410K) by multi-threading into the CFO and COO over a six-month cycle.

> Before: Managed the full sales cycle.
>
> After: Ran 40 to 50 active opportunities in Salesforce with a 4-month average cycle; maintained 3.2x pipeline coverage and a 29% win rate.

## Summary

> Enterprise account executive with 7 years selling HR and payroll software to companies of 1,000 to 10,000 employees. 127% of quota in FY2025 ($3.1M closed), Presidents Club 2024 and 2025; average deal $85K, MEDDPICC-trained, Salesforce and Gong.

## What Weakens a Sales Resume

- No attainment numbers, or attainment without the quota it was measured against.
- Only the best year shown.
- Activity metrics (calls made, emails sent) in place of outcomes for AE roles.
- Vague verbs: "drove revenue", "exceeded expectations".
- A creative layout. Sales orgs at scale use applicant tracking systems too; the [ATS format guide](/blog/best-resume-format-for-ats-templates-that-actually-work) explains what breaks parsing.
${TEMPLATES_MD}
## Related Guides

- [Resume Summary Examples for 2026](/blog/resume-summary-examples-2026)
- [Customer Success Manager Resume Guide 2026](/blog/customer-success-manager-resume-guide-2026)
- [Resume Keywords That Get You Hired](/blog/resume-keywords-that-get-you-hired)

## Frequently asked questions

### Should I include a year where I missed quota?

Yes. A record with one miss among hits is credible; a record with only hits is assumed to be edited. State the attainment and, if there is a short reason (territory change, product launch delay), give it in a few words.

### What if my quota is confidential?

Give attainment as a percentage and deal sizes as ranges. "118% of quota; deals $40K to $150K" is enough for a recruiter to calibrate without disclosing the number.

### How long should a sales resume be?

One page for individual contributors with under ten years, two for sales leaders. Attainment lines are compact; there is rarely a reason to exceed one page as an AE.

### Do sales resumes need keywords for ATS?

Yes. Recruiters search for methodology (MEDDIC, Challenger) and tools (Salesforce, Gong, Outreach) as well as segment terms (enterprise, mid-market, new logo). Include the ones that are true in your skills line and bullets.
${NEXT_STEP_MD}`,
  },
];
