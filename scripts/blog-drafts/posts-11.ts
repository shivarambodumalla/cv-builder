import { TEMPLATES_MD, NEXT_STEP_MD, type DraftPost } from "./types";

export const DRAFTS_11: DraftPost[] = [
  {
    slug: "data-analyst-resume-guide-2026",
    title: "Data Analyst Resume Guide 2026: SQL, Dashboards and Business Impact",
    seo_title: "Data Analyst Resume Guide 2026: SQL, Dashboards, Impact",
    seo_description: "How to write a data analyst resume in 2026: SQL, BI and Python keywords recruiters search, bullets that show business impact, and entry-level tips.",
    brief: "Hiring managers do not shortlist analysts for knowing SQL. They shortlist the ones whose analysis changed a decision. Here is how to show that on one page.",
    tags: ["Role Guides", "Keywords", "Resume Writing"],
    read_time_minutes: 7,
    content_md: `# Data Analyst Resume Guide 2026

Most data analyst resumes read like a tool inventory: SQL, Excel, Tableau, Python, listed in a block and repeated in every bullet. Recruiters screening analyst roles see that list on nearly every application, so it stops telling them anything. What separates a shortlisted resume is evidence that your analysis led somewhere: a decision made, a cost found, a metric moved, a report someone stopped building by hand.

This guide covers the keywords applicant tracking systems look for, how to write bullets that show business impact, and how the resume changes between entry-level and experienced analysts.

## What Hiring Managers Screen For

An analyst job posting usually asks for three things, whatever the industry:

1. **Getting the data:** writing SQL against real databases, joining messy sources, cleaning and validating.
2. **Making it readable:** dashboards, reports and charts that non-technical people use.
3. **Changing a decision:** turning numbers into a recommendation and seeing it acted on.

Most resumes prove the first, some prove the second, and few prove the third. The third is what moves you from "qualified" to "interview".

## Keywords by Category

Group your skills so a recruiter can scan them in seconds, and mirror the exact names from the posting. ATS matching is literal: "Power BI" and "PowerBI" may not be treated as the same term.

- **Querying and data:** SQL, PostgreSQL, MySQL, SQL Server, BigQuery, Snowflake, data cleaning, data validation, ETL
- **Analysis:** Excel (pivot tables, Power Query, XLOOKUP), Python (pandas, NumPy), R, statistics, A/B testing, cohort analysis, forecasting, regression
- **Visualization and BI:** Tableau, Power BI, Looker, Looker Studio, dashboard design, KPI reporting
- **Business context:** stakeholder management, requirements gathering, financial analysis, marketing analytics, product analytics, supply chain metrics

Only list what you can be tested on. Analyst interviews often include a live SQL exercise or a take-home case, and a skill you cannot demonstrate will cost more than its absence.

## Bullets That Show Impact

A strong analyst bullet has four parts: the question, the method, the output, and what changed because of it.

> Before: Created dashboards in Tableau for the sales team.
>
> After: Built a Tableau pipeline dashboard used by 40 account executives weekly, replacing a manual Excel report and cutting forecast prep from two days to two hours.

> Before: Analyzed customer data using SQL.
>
> After: Identified through SQL cohort analysis that customers onboarded by phone churned 30% less; the finding funded a phone onboarding pilot for all enterprise accounts.

> Before: Responsible for monthly reporting.
>
> After: Automated 12 monthly finance reports with Python and SQL, removing roughly 25 hours of manual work per month and eliminating copy-paste errors flagged in the prior audit.

If you do not know the exact outcome, use what you do know: who used the output, how often, and what it replaced. "Used by the leadership team in quarterly planning" is honest and still shows reach.

## Structure for a Data Analyst Resume

- **Header:** name, city and state, phone, email, LinkedIn, and a portfolio or GitHub link if it contains real work.
- **Summary:** two or three lines. Title, years, domain, one result. The [summary examples guide](/blog/resume-summary-examples-2026) has the formula.
- **Skills:** grouped as above, four lines at most.
- **Experience:** reverse chronological, three to five bullets for recent roles.
- **Projects:** essential for entry-level candidates, optional later.
- **Education and certifications:** degree, school, year. Certifications such as the Google Data Analytics certificate or Microsoft's Power BI certification belong here; they help with keyword matching but do not replace evidence.

One page is the standard for analysts with under ten years of experience. The [one-page resume guide](/blog/how-to-write-a-one-page-resume) covers what to cut.

## Entry-Level: Projects Do the Work Experience Cannot

If you are a graduate, a bootcamp finisher or moving from another field, projects carry your resume. A good analyst project:

- Uses a real, messy public dataset rather than a cleaned tutorial file.
- Asks a business question, not "exploring the Titanic dataset".
- Ends with a recommendation and a chart someone could act on.
- Links to code or a published dashboard.

> Analyzed three years of city 311 complaint data (1.2M rows) in SQL and Tableau; found that 18% of noise complaints came from five blocks and proposed targeted enforcement hours. Dashboard published on Tableau Public.

Two strong projects beat five tutorial copies. If you are switching careers, frame past work in analyst terms: an operations coordinator who built Excel trackers and reported weekly numbers already did analyst work. The [career change resume guide](/blog/career-change-resume-2026) shows how to reframe it.

## Experienced Analysts: Show Scope and Ownership

After three or four years, recruiters look for signs you are ready for senior or lead roles:

- **Ownership:** you defined the metrics, not only reported them.
- **Scale:** data volumes, number of stakeholders, number of teams relying on your work.
- **Influence:** recommendations adopted, budgets moved, experiments designed.
- **Enablement:** self-serve dashboards that reduced ad hoc requests, documentation, mentoring junior analysts.

If you are moving toward machine learning or modeling, the [data scientist resume guide](/blog/data-scientist-resume-guide-2026) explains how expectations change. If you are moving toward pipelines and infrastructure, see the [data engineer resume guide](/blog/data-engineer-resume-guide-2026).

## Common Mistakes

- **Tool lists with no outcomes.** Every bullet says "using SQL" and none says what was learned.
- **Skill bars and star ratings.** "SQL: 4/5" means nothing to a recruiter and confuses parsers.
- **Two-column layouts with skills in a sidebar.** Some ATS parsers read columns out of order and lose the sidebar. A single column is safer.
- **Listing every library.** Matplotlib, Seaborn and Plotly in one line is noise. Name the stack the posting asks for.
- **No link to work.** For analysts, a portfolio is often the tiebreaker between two similar resumes.
${TEMPLATES_MD}
## Related Guides

- [Data Scientist Resume Guide 2026](/blog/data-scientist-resume-guide-2026)
- [Business Analyst Resume Guide 2026](/blog/business-analyst-resume-guide-2026)
- [Resume Keywords That Get You Hired](/blog/resume-keywords-that-get-you-hired)
- [How to Write Resume Bullet Points That Show Impact](/blog/how-to-write-resume-bullet-points-that-show-impact-with-examples)

## Frequently asked questions

### What skills should a data analyst put on a resume?

SQL first, then the analysis tool the posting names (Excel, Python or R), then the BI tool (Tableau, Power BI or Looker). Add business skills such as stakeholder reporting or A/B testing when the role mentions them. Match the posting's exact spelling.

### Do I need a portfolio as a data analyst?

For entry-level and career-change candidates, yes: it is the main evidence you can do the work. For experienced analysts it is optional, because your experience bullets carry the proof, but a published dashboard still helps.

### Are data analytics certificates worth listing?

List them in an education or certifications section. They help with keyword matching and show initiative, but recruiters weigh projects and work results more heavily than certificates alone.

### How long should a data analyst resume be?

One page for under ten years of experience. Senior and lead analysts with broad scope can use two, as long as the second page holds results rather than older duties.

### How do I show impact if I do not know the business result?

Describe the reach of your work instead: who used it, how often, what it replaced and how much time it saved. Those facts are verifiable and still show value.
${NEXT_STEP_MD}`,
  },
  {
    slug: "military-to-civilian-resume-2026",
    title: "Military to Civilian Resume: Translating Rank, MOS and Duties",
    seo_title: "Military to Civilian Resume: Translate Rank, MOS and Duties",
    seo_description: "How to turn military experience into a civilian resume: translating rank and MOS, removing jargon, listing a clearance, and using SkillBridge and O*NET tools.",
    brief: "Civilian recruiters respect military service but cannot read it. The work is translation: same achievements, in the words a hiring manager and an ATS recognize.",
    tags: ["Resume Writing", "Job Search", "Role Guides"],
    read_time_minutes: 6,
    content_md: `# Military to Civilian Resume

A military career produces exactly what civilian employers say they want: leadership under pressure, accountability for people and equipment, and training that most companies would never fund. The problem is that it is described in a language civilian recruiters do not speak. An applicant tracking system will not match "NCOIC" to "operations supervisor", and a recruiter skimming for seconds will not stop to decode it.

Your resume's job is translation. The achievements stay the same; the words change.

## Start With the Target, Not the Record

Your service record lists everything. A civilian resume lists what supports one target role. Before writing, pick the civilian job title you are applying for and collect three or four postings for it. Those postings give you the vocabulary, the keywords and the order of priorities.

Two free tools help map military experience to civilian work:

- The **[O*NET military crosswalk](https://www.onetonline.org/crosswalk/MOC/)** lets you enter an Army or Marine Corps MOS, Air Force or Space Force specialty code, or Navy or Coast Guard rating and see related civilian occupations, with the tasks and skills each one involves.
- Your **Transition Assistance Program (TAP)** includes employment workshops and resume support before separation.

Use the crosswalk to find language, not to limit your options. It suggests occupations; it does not decide what you are qualified for.

## Translate Rank Into Scope

Rank tells a military reader your level of responsibility. A civilian reader needs that responsibility spelled out. Do not lead with rank in the title line; lead with a civilian equivalent and state the scope in the bullets.

> Before: Staff Sergeant, 92Y Unit Supply Specialist
>
> After: Supply Operations Supervisor (U.S. Army, Staff Sergeant)

Then put numbers on it: people supervised, value of equipment accounted for, budget managed, locations supported. Civilian hiring managers understand "led a team of 14" and "accountable for $8M in equipment" immediately.

Common translations, used as starting points only:

- Squad leader, section chief: team lead, supervisor
- Platoon sergeant, NCOIC: operations supervisor, operations manager
- Platoon leader, company commander: manager, operations manager, program manager
- Executive officer: deputy manager, chief of staff
- First sergeant, senior enlisted advisor: senior operations manager, personnel and operations lead

Pick the one that matches the postings you collected, not the most senior-sounding option.

## Remove the Jargon

Go line by line and replace every acronym and military term a civilian would not know.

- **Acronyms:** spell out or replace. "PCS" becomes "relocated"; "TDY" becomes "temporary assignment"; "OER/NCOER" becomes "performance review".
- **Unit names:** "2nd Battalion, 75th Ranger Regiment" can stay as the employer line, but the bullets should not depend on knowing what it is.
- **Operations and exercises:** name them only if the scale is described. "Supported a multinational training exercise with 3,000 participants" says more than the exercise name.
- **Awards:** keep one or two that a civilian can understand from a short phrase, such as an award "for leading a logistics overhaul that cut equipment downtime by 20%". Drop the rest.

> Before: Served as NCOIC for BN S4 shop; maintained 100% accountability of all MTOE property during CTC rotation.
>
> After: Supervised a six-person logistics team; maintained full accountability of $12M in vehicles and equipment during a month-long field training exercise with zero losses.

## Lead With Results, Like Any Other Resume

Military bullets often describe duties: "responsible for training", "tasked with maintenance". Civilian recruiters screen for outcomes. Use the same structure as any strong resume bullet: action, scale, result. The [bullet point guide](/blog/how-to-write-resume-bullet-points-that-show-impact-with-examples) covers the pattern.

Strong results from military roles usually fall into a few categories:

- Readiness rates and inspection results
- Training throughput and qualification pass rates
- Equipment availability and maintenance turnaround
- Cost savings, inventory accuracy and supply turnaround
- Safety records

## Listing a Security Clearance

An active clearance is valuable for defense contractors and federal roles, because it saves the employer time and cost. List it clearly near the top, either in the summary or a short line under the header:

> Active TS/SCI security clearance

State the level and that it is active. Do not include investigation details or anything about classified work beyond what is publicly describable. If the clearance is inactive, you can say "previously held" with the level; whether it can be reinstated depends on how long it has lapsed and the sponsoring agency's rules.

## Use SkillBridge if You Are Still Serving

The DoD SkillBridge program lets eligible service members spend up to their final 180 days of service in civilian training, apprenticeships or internships with approved employers, typically while keeping military pay and benefits. Participation requires command approval. A SkillBridge placement gives you a civilian job title, civilian references and civilian vocabulary before you separate, and it belongs on your resume as experience.

## Format and Length

- **One page** for most enlisted and junior officer transitions; two pages for senior officers and senior NCOs with broad scope.
- **Reverse chronological**, with each assignment or position as its own entry when responsibilities changed meaningfully.
- **Single column**, standard headings, no photos or insignia.
- **Education and training:** list civilian degrees and certifications first. Military courses only where they map to the target role, translated: "Leadership development course (four weeks)" rather than the course acronym.

If you are applying to federal civilian jobs on USAJOBS, the rules are different and the resume is longer. The [federal resume guide](/blog/federal-resume-format-usajobs-2026) covers that format.
${TEMPLATES_MD}
## Related Guides

- [Career Change Resume](/blog/career-change-resume-2026)
- [Federal Resume Format for USAJOBS](/blog/federal-resume-format-usajobs-2026)
- [Operations Manager Resume Guide 2026](/blog/operations-manager-resume-guide-2026)
- [Resume Action Verbs by Category](/blog/resume-action-verbs-2026)

## Frequently asked questions

### Should I put my military rank on a civilian resume?

Yes, but not as the job title. Use a civilian equivalent title and add the rank in parentheses or on the employer line. The scope of the role, described with numbers, matters more than the rank itself.

### How do I find civilian jobs that match my MOS?

Search your MOS, specialty code or rating in the O*NET military crosswalk. It lists related civilian occupations with their typical tasks and skills, which also gives you keywords for your resume.

### How should I list a security clearance?

State the level and status near the top: "Active Secret clearance" or "Active TS/SCI clearance". Do not add investigation details or describe classified work.

### Should I include military awards?

Include one or two that you can explain in plain words with a result attached. A long list of decorations means little to civilian recruiters and takes space better used for achievements.

### How long should a military to civilian resume be?

One page for most transitions. Two pages are fine for senior officers and senior NCOs whose scope and results fill them. Federal resumes for USAJOBS follow different, longer conventions.
${NEXT_STEP_MD}`,
  },
  {
    slug: "customer-service-resume-guide-2026",
    title: "Customer Service Resume Guide 2026: Metrics That Prove It",
    seo_title: "Customer Service Resume Guide 2026: Metrics That Prove It",
    seo_description: "How to write a customer service resume in 2026: the CSAT, AHT and resolution metrics to include, keywords by channel, and call center and retail examples.",
    brief: "Every customer service resume says \"excellent communication skills\". The ones that get interviews show the numbers support teams are actually measured on.",
    tags: ["Role Guides", "Resume Writing", "Keywords"],
    read_time_minutes: 6,
    content_md: `# Customer Service Resume Guide 2026

Customer service is one of the most measured jobs there is. Most support teams track satisfaction scores, handle time, resolution rates and volume, often daily. Yet most customer service resumes describe the work with adjectives: "friendly", "patient", "strong communicator". Hiring managers read those words on every application.

The fix is simple: use the numbers you were already measured on. This guide covers which metrics to include, the keywords for call center, retail and remote support roles, and bullet examples for each.

## The Metrics That Matter

Support managers know these terms, and many job postings use them. Use the ones your team tracked, and use the real figures you remember or can find in old reviews.

- **CSAT (customer satisfaction score):** the percentage of customers rating an interaction positively.
- **NPS (Net Promoter Score):** how likely customers are to recommend the company.
- **FCR (first contact resolution):** the share of issues solved without a follow-up.
- **AHT (average handle time):** how long an interaction takes, including after-call work.
- **Volume:** calls, chats, emails or tickets handled per day or week.
- **QA score:** internal quality audit results.
- **Escalation rate, retention or save rate, upsell or conversion rate:** where relevant.

A good bullet pairs a metric with a comparison: against target, against team average, or before and after a change.

> Before: Answered customer calls and resolved issues.
>
> After: Handled 60+ inbound calls daily with a 94% CSAT against an 88% team target; ranked in the top three of a 25-agent team for two consecutive quarters.

Never invent a number. If you do not have exact figures, use what you can stand behind: "consistently above target", volume ranges, or rankings.

## Keywords by Channel

Applicant tracking systems match terms from the posting. Use the exact words the employer uses, grouped so a recruiter can scan them.

- **Channels:** inbound and outbound calls, live chat, email support, social media support, in-person service
- **Systems:** Zendesk, Salesforce Service Cloud, Freshdesk, ServiceNow, HubSpot, Gorgias, Intercom, POS systems
- **Skills:** de-escalation, complaint resolution, troubleshooting, order management, returns and refunds, billing support, account management, upselling, knowledge base writing
- **Compliance:** PCI compliance, HIPAA (for healthcare support), call scripting and QA standards

Soft skills like empathy and patience matter, but listing them proves nothing. Show them through results: a high CSAT on escalated calls proves de-escalation better than the word.

## Call Center and Contact Center Roles

Call center hiring focuses on reliability and efficiency. Emphasize volume, handle time, adherence and quality.

> Reduced average handle time from 7.5 to 5.8 minutes over six months by building a personal shortcut library for the 20 most common billing questions, while keeping QA scores above 95%.

> Maintained 98% schedule adherence across 18 months and trained four new hires on call flows and the CRM.

## Retail and In-Person Service

Retail resumes should connect service to sales and store results.

> Resolved returns and complaints at a high-volume service desk serving 300+ customers per day; trained as the store's escalation point for manager-level issues.

> Raised loyalty program sign-ups at checkout from 8% to 15% of transactions, the highest rate in a 12-store district.

## Remote and Technical Support

Remote employers screen for written communication, self-management and tool fluency. Technical support adds troubleshooting depth.

> Resolved 40+ chat and email tickets per day in Zendesk with a 92% CSAT and 85% first contact resolution; wrote 30 knowledge base articles that cut repeat tickets on password resets by roughly a quarter.

> Diagnosed connectivity and account issues for a SaaS product, escalating with full reproduction steps; engineering adopted my escalation template for the whole support team.

The [remote job resume guide](/blog/remote-job-resume-2026) covers what remote employers look for beyond the metrics.

## Moving Up: Team Lead and Supervisor

If you have handled escalations, trained new hires or covered for a supervisor, list it. These are the signals hiring managers look for when promoting or hiring leads:

- Training and onboarding new agents
- Handling escalated or high-value accounts
- QA reviews of other agents
- Process improvements, macros or knowledge base work
- Covering shift supervision

## Structure and Format

- **Summary:** two lines with your channel, years and best metric. "Customer support specialist with four years in high-volume SaaS chat support; 93% average CSAT and top-quartile resolution rates."
- **Skills:** channels, systems and core skills, three lines at most.
- **Experience:** three to five bullets per recent role, each with a number where possible.
- **Education:** high school diploma or degree, plus relevant certifications.

Keep it to one page, single column, with standard headings. If you are applying for your first service role, the [resume with no experience guide](/blog/resume-with-no-experience-2026) shows how to use school, volunteer and part-time work.
${TEMPLATES_MD}
## Related Guides

- [Remote Job Resume](/blog/remote-job-resume-2026)
- [Skills to Put on a Resume in 2026](/blog/skills-to-put-on-a-resume-2026)
- [Administrative Assistant Resume Guide 2026](/blog/administrative-assistant-resume-guide-2026)
- [Resume Summary Examples for 2026](/blog/resume-summary-examples-2026)

## Frequently asked questions

### What should I put on a customer service resume?

Your channels, the systems you used, and the metrics you were measured on: CSAT, handle time, first contact resolution and volume. Use bullets that pair each number with a comparison, such as team average or target.

### What if I do not remember my exact metrics?

Use what you can stand behind: rankings, "above target for six consecutive months", or approximate volume ranges. Old performance reviews and emails often contain the figures. Never invent a number.

### Should I list soft skills like patience and empathy?

Show them through results rather than listing them. A high satisfaction score on escalated calls or a retention rate proves those skills more convincingly than the words themselves.

### How do I move from customer service into another career?

Highlight transferable work: training, process improvement, data you tracked and cross-team escalations. Those map to operations, account management and customer success roles.

### Is a customer service resume one page?

Yes, for nearly all candidates. Keep three to five strong bullets for recent roles and compress older ones to a line or two.
${NEXT_STEP_MD}`,
  },
  {
    slug: "administrative-assistant-resume-guide-2026",
    title: "Administrative Assistant Resume Guide 2026: Show the Scope You Support",
    seo_title: "Administrative Assistant Resume Guide 2026",
    seo_description: "How to write an administrative assistant resume in 2026: keywords and tools, calendar and travel bullet examples, and how to show executive support scope.",
    brief: "Good administrative work is invisible when it goes right, which makes it hard to put on a resume. The answer is scope: who you supported, how much, and what ran smoothly because of you.",
    tags: ["Role Guides", "Resume Writing", "Keywords"],
    read_time_minutes: 6,
    content_md: `# Administrative Assistant Resume Guide 2026

Administrative assistants keep offices running, and when they do the job well, nobody notices. That is the challenge of writing the resume: duties like "managed calendars" and "answered phones" appear on every application and say nothing about how well you did them or for whom.

The way through is scope. Recruiters hiring for administrative roles want to know who you supported, how many people and moving parts you handled, which tools you used, and what improved because you were there. This guide shows how to write that clearly.

## What Recruiters Screen For

Administrative job postings tend to cluster around four areas:

1. **Calendar and communication management:** scheduling, meeting coordination, inbox triage.
2. **Travel and events:** booking, itineraries, expense reports, event logistics.
3. **Office operations:** supplies, vendors, facilities, onboarding.
4. **Documents and data:** reports, presentations, records, spreadsheets.

Your resume should show competence in the areas the posting stresses, with numbers that show scale.

## Keywords by Category

Match the exact terms in the posting. If it says "Microsoft 365", do not write only "Office".

- **Software:** Microsoft 365 (Outlook, Word, Excel, PowerPoint, Teams), Google Workspace, Zoom, Slack, SharePoint, Concur, Expensify, QuickBooks, DocuSign, Salesforce
- **Scheduling and travel:** calendar management, meeting coordination, travel booking, itinerary planning, expense reporting
- **Office operations:** vendor management, office supply ordering, facilities coordination, new hire onboarding, mail and shipping
- **Documents and records:** document preparation, data entry, record keeping, meeting minutes, filing systems, confidentiality
- **Industry terms:** legal (case files, court filing deadlines), medical (patient scheduling, insurance verification), real estate, education

Typing speed is worth listing only if the posting asks for it.

## Bullets That Show Scope

Turn each duty into a statement of scale or result.

> Before: Managed calendars for executives.
>
> After: Managed calendars for three senior vice presidents across four time zones, coordinating 40+ meetings per week and resolving conflicts with no double bookings.

> Before: Booked travel for staff.
>
> After: Booked domestic and international travel for a 25-person sales team; consolidated bookings with one agency, cutting average airfare cost by about 15%.

> Before: Ordered office supplies.
>
> After: Took over vendor management for a 60-person office, renegotiating supply and catering contracts and saving an estimated $8,000 a year.

> Before: Helped with onboarding.
>
> After: Built a new-hire onboarding checklist and welcome packet used for 30+ hires, reducing first-week IT and access issues reported to managers.

If a result is hard to measure, describe reliability and trust: "sole point of contact for confidential board materials" says a lot.

## Executive Assistant Scope

If you supported senior leaders, say who, without naming them if confidentiality matters. Recruiters filling executive assistant roles weigh the level and number of executives heavily.

- "Supported the CEO and CFO of a 300-person company"
- "Prepared board meeting packets for quarterly meetings"
- "Acted as gatekeeper for the CEO's inbox, triaging 150+ emails daily"

Mentioning budget, confidential information and stakeholder management signals readiness for executive support roles.

## Progression to Office Manager

Many administrative careers move toward office management or operations. If you want that next step, give more space to bullets about:

- Budgets you tracked or controlled
- Vendors and contracts you managed
- Processes you created or improved
- People you trained or supervised
- Office moves, renovations or system rollouts you coordinated

> Coordinated an office relocation for 45 employees over one weekend, managing movers, IT setup and seating plans; the team was fully operational Monday morning.

The [operations manager resume guide](/blog/operations-manager-resume-guide-2026) shows how those bullets look at the next level.

## Structure and Format

- **Summary:** two or three lines: title, years, who you support, one strength. "Executive assistant with six years supporting C-suite leaders in financial services; manages complex calendars, board materials and international travel."
- **Skills:** software and core skills, grouped.
- **Experience:** reverse chronological, three to five bullets for recent roles.
- **Education and certifications:** degree or diploma, plus certifications such as Microsoft Office Specialist if you have them.

One page is standard. Use a single-column layout so applicant tracking systems read sections in order, and standard headings such as Experience, Skills and Education.

## Industry Variations

Administrative roles look different by sector, and recruiters in each one search for their own terms.

- **Legal:** case file management, court filing deadlines, document review support, billing entries, confidentiality.
- **Medical:** patient scheduling, insurance verification, medical records, HIPAA.
- **Education:** student records, parent communication, enrollment, staff scheduling.
- **Real estate and property:** lease files, tenant communication, maintenance requests, closing coordination.

If you are moving between sectors, keep the transferable core (scheduling, documents, vendors) and pick up the new sector's vocabulary from three or four postings.

## Common Mistakes

- **Listing duties without scale.** "Answered phones" without volume or context adds nothing.
- **Generic skills lists.** "Organized, detail-oriented, team player" appears on every application.
- **Outdated software.** Drop legacy tools no one uses anymore and add what the posting names.
- **Typos.** An administrative resume with errors undermines the core claim of the job. Proofread twice, then read it aloud.
${TEMPLATES_MD}
## Related Guides

- [Skills to Put on a Resume in 2026](/blog/skills-to-put-on-a-resume-2026)
- [Customer Service Resume Guide 2026](/blog/customer-service-resume-guide-2026)
- [Resume Summary Examples for 2026](/blog/resume-summary-examples-2026)
- [How to Write a One-Page Resume](/blog/how-to-write-a-one-page-resume)

## Frequently asked questions

### What skills should an administrative assistant list?

Software first (Microsoft 365 or Google Workspace, plus scheduling, expense and CRM tools the posting names), then core skills such as calendar management, travel booking, vendor management and document preparation.

### How do I make administrative duties sound impressive?

Add scope and results. Say how many people you supported, how many meetings or bookings you handled, and what you improved, such as cost savings, faster processes or fewer errors.

### What is the difference between an administrative assistant and an executive assistant resume?

An executive assistant resume emphasizes the seniority of the people supported, confidentiality, board and stakeholder work, and gatekeeping. An administrative assistant resume focuses more on office operations and team support.

### Should I include typing speed?

Only if the posting asks for it or the role is heavily data-entry focused. Otherwise it takes space better used for results.

### How long should an administrative assistant resume be?

One page. Even with many years of experience, compress older roles to a line or two and keep the space for recent, relevant work.
${NEXT_STEP_MD}`,
  },
  {
    slug: "medical-assistant-resume-guide-2026",
    title: "Medical Assistant Resume Guide 2026: Certifications, Clinical and Admin Skills",
    seo_title: "Medical Assistant Resume Guide 2026: Skills and Credentials",
    seo_description: "How to write a medical assistant resume in 2026: listing CMA, RMA or CCMA credentials, clinical and front-office skills, EHR systems and externships.",
    brief: "Clinics screen medical assistant resumes for three things: the right credential, the right mix of clinical and front-office skills, and the EHR you already know. Here is how to make each one easy to find.",
    tags: ["Role Guides", "Resume Writing", "Keywords"],
    read_time_minutes: 6,
    content_md: `# Medical Assistant Resume Guide 2026

Medical assistant hiring moves fast. Clinics and physician groups often screen dozens of applications for a single opening, and the first pass usually checks three things: whether you hold a recognized credential, whether you can handle both clinical and administrative work, and whether you already know an electronic health record (EHR) system they use. If those are buried, the resume gets passed over.

This guide covers how to list credentials, which skills to include, how to use an externship when you are new, and bullet examples that show what you can do.

## Lead With Your Credential

Many employers prefer or require certification. Put it in your header line or summary as well as a certifications section, so it is seen in the first seconds.

The main national credentials, and who issues them:

- **CMA (AAMA):** Certified Medical Assistant, from the American Association of Medical Assistants
- **RMA (AMT):** Registered Medical Assistant, from American Medical Technologists
- **CCMA (NHA):** Certified Clinical Medical Assistant, from the National Healthcareer Association
- **NCMA (NCCT):** National Certified Medical Assistant, from the National Center for Competency Testing

Write the credential with its issuing body, as above, because employers may specify which ones they accept. Add CPR or BLS certification (and the provider, such as the American Heart Association) with its expiry date. Phlebotomy or EKG technician certifications belong here too.

> Maria Lopez, CCMA
> Certified Clinical Medical Assistant (NHA) · BLS (American Heart Association), valid through 2027

If your certification exam is scheduled, write "CMA (AAMA) exam scheduled, March 2027". It shows you are close.

Some states have their own rules on what medical assistants may do, such as injections or X-rays. If you hold a state-specific permit or limited license, list it.

## Clinical and Administrative Skills

Most medical assistant roles mix the two. Group skills so a hiring manager sees both halves quickly, and match the terms in the posting.

- **Clinical:** vital signs, patient intake, rooming, medication administration, injections, phlebotomy and venipuncture, EKG, specimen collection, wound care, sterilization, assisting with minor procedures, point-of-care testing
- **Administrative:** patient scheduling, check-in and check-out, insurance verification, prior authorizations, referrals, medical records, billing support, phone triage under protocol
- **Systems:** Epic, Cerner (Oracle Health), athenahealth, eClinicalWorks, NextGen, practice management systems
- **Compliance:** HIPAA, OSHA standards, infection control

Name the EHR systems you have used. Clinics on the same system can onboard you faster, and recruiters often search for those names.

## Bullets That Show What You Did

Medical assisting bullets should show volume, accuracy and the setting.

> Before: Took patient vitals and prepared exam rooms.
>
> After: Roomed 25–30 patients per day in a busy family medicine practice, recording vitals and histories in Epic and keeping the providers on schedule.

> Before: Performed blood draws.
>
> After: Performed 15+ venipunctures daily across pediatric and adult patients with a first-attempt success rate well above clinic expectations.

> Before: Handled insurance.
>
> After: Verified insurance and obtained prior authorizations for a three-provider specialty clinic, reducing same-day appointment cancellations caused by coverage issues.

> Before: Helped in the front office.
>
> After: Cross-covered front desk during staffing gaps, managing check-in, scheduling and co-pay collection for up to 80 patients per day.

The setting matters, because specialty clinics value relevant experience. Name it: pediatrics, family medicine, dermatology, cardiology, urgent care, OB/GYN.

## Common Mistakes

- **Credential buried at the bottom.** Many clinics filter on it first; keep it in the header or summary.
- **No EHR named.** "Electronic records" is weaker than "Epic" or "athenahealth".
- **Only clinical or only front-office skills.** Most roles want both, so show both.
- **Expired CPR or BLS.** Renew before applying, or note the renewal date.
- **Vague setting.** "Clinic" says less than "four-provider pediatric practice".

## New Graduates: Use Your Externship

If you have just finished a program, your externship is your work experience. Treat it as a job entry, with the clinic name, dates, hours and real bullets.

> Medical Assistant Extern, Riverside Family Health · 160 hours
> - Roomed patients, recorded vitals and updated histories in eClinicalWorks under supervision.
> - Performed injections and point-of-care tests including strep and glucose testing.
> - Supported front desk scheduling and insurance verification during peak hours.

List your program in the education section, with the school and completion date. If the program is accredited (for example by CAAHEP or ABHES), you can note that, because it affects which certification exams you can sit.

Earlier work in retail, food service or caregiving still counts. It shows reliability, customer handling and comfort in fast-paced settings. Keep it short and focus on transferable skills.

## Structure and Format

- **Header:** name with credential, city and state, phone, email.
- **Summary:** two lines: credential, years, setting, strongest skills.
- **Certifications:** credential, CPR or BLS with expiry, other certifications.
- **Skills:** clinical, administrative, systems.
- **Experience or externship:** reverse chronological.
- **Education:** program, school, year.

Keep it to one page and single column. If you plan to move into nursing later, the [registered nurse resume guide](/blog/registered-nurse-resume-guide-2026) shows how licensing and clinical evidence are presented at the next level.
${TEMPLATES_MD}
## Related Guides

- [Registered Nurse Resume Guide 2026](/blog/registered-nurse-resume-guide-2026)
- [Resume With No Experience](/blog/resume-with-no-experience-2026)
- [Skills to Put on a Resume in 2026](/blog/skills-to-put-on-a-resume-2026)
- [Customer Service Resume Guide 2026](/blog/customer-service-resume-guide-2026)

## Frequently asked questions

### Which medical assistant certification should I list?

List the one you hold, with its issuing body: CMA (AAMA), RMA (AMT), CCMA (NHA) or NCMA (NCCT). Employers may specify which credentials they accept, so writing the issuer avoids confusion.

### Can I apply without being certified yet?

Yes. Many employers hire graduates who are about to sit the exam. Write the credential and the scheduled exam date so the employer knows certification is close.

### Should I list the EHR systems I know?

Yes, by name. Epic, Cerner, athenahealth and eClinicalWorks are common, and clinics using the same system value candidates who need less training.

### How do I write a medical assistant resume with no experience?

Treat your externship as a job: clinic, dates, hours and specific tasks. Add your program, certifications and any customer-facing work that shows reliability.

### Should I include CPR or BLS certification?

Yes, with the provider and expiry date. Many clinics require current BLS, and listing it saves the recruiter a question.
${NEXT_STEP_MD}`,
  },
];
