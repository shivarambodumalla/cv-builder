import { TEMPLATES_MD, NEXT_STEP_MD, type DraftPost } from "./types";

export const DRAFTS_12: DraftPost[] = [
  {
    slug: "new-grad-software-engineer-resume",
    title: "New Grad Software Engineer Resume: No Internship, Still Hired",
    seo_title: "New Grad Software Engineer Resume: No Internship Needed",
    seo_description: "How to write a new grad software engineer resume without an internship: projects that count, open source, hackathons, coursework and a one-page layout.",
    brief: "No internship is a gap, not a verdict. A new grad resume built on real projects, shipped code and clear technical detail can still get past the screen and into interviews.",
    tags: ["Role Guides", "Resume Writing", "Keywords"],
    read_time_minutes: 6,
    content_md: `# New Grad Software Engineer Resume

Most advice for new grad software engineers assumes you had an internship. Many graduates did not: the market was tight, they worked another job to pay for school, or they switched into computer science late. Recruiters know this. What they need from your resume is evidence that you can write, ship and reason about real code. An internship is one source of that evidence. It is not the only one.

This guide covers how to build a one-page new grad resume around projects, open source and other work that proves the same thing.

## What Recruiters Look For in a New Grad

For entry-level engineering roles, recruiters and hiring managers usually check:

1. **Can you build something that works?** Real projects with users, deployment or measurable behavior.
2. **Do you know the stack?** Languages and tools that match the posting.
3. **Can you work with others?** Team projects, code review, open source, collaboration.
4. **Are you learning fast?** Progression across projects, new tools picked up, harder problems over time.

Your resume should answer each one with specifics.

## Section Order Without an Internship

- **Header:** name, city and state (or "open to relocation"), email, phone, GitHub, LinkedIn, portfolio if it has real work.
- **Education:** degree, school, graduation month and year, GPA if 3.5 or above.
- **Technical skills:** grouped, three or four lines.
- **Projects:** the main section. Three or four strong ones.
- **Experience:** any job, including non-technical, kept short.
- **Activities:** hackathons, teaching assistant roles, clubs with real output.

Education goes first for new grads because it is your most recent and relevant credential. Projects go above non-technical experience because they carry the technical evidence.

## Projects That Count

Recruiters see many tutorial clones: to-do apps, weather apps and course projects every classmate also built. These do not stand out. A project that counts usually has at least two of these:

- **Real users:** even 30 classmates using a scheduling tool counts.
- **Deployment:** it runs somewhere, not only on your laptop.
- **Technical depth:** a non-trivial problem such as concurrency, caching, a data pipeline, authentication or performance work.
- **Measurable results:** load times, query speed, test coverage, number of users.

Write project bullets like work bullets: what you built, how, and what happened.

> Before: Made a website for tracking study groups using React and Node.
>
> After: Built and deployed a study-group scheduler (React, Node.js, PostgreSQL) used by 200+ students across four courses; added Redis caching that cut page load from 2.1s to 0.4s.

> Before: Worked on a machine learning project.
>
> After: Trained a text classifier in PyTorch on 50K support tickets to route issues by category at 87% accuracy; served it behind a FastAPI endpoint with a Docker deploy.

Each project gets a title line with the stack and a link, then two or three bullets. The [software engineer resume guide](/blog/software-engineer-resume-guide-2026) covers bullet patterns in more depth.

## Open Source Contributions

Merged pull requests in real projects are strong evidence: your code passed someone else's review. List them as a project or a separate section.

> Contributed three merged pull requests to an open source Python CLI library, including a fix for a Windows path-handling bug reported by multiple users and a new test suite for config parsing.

Even small fixes count if they are real. Documentation-only changes are fine to include but carry less weight than code.

## Hackathons, TA Roles and Campus Work

- **Hackathons:** list the project, what you built and any placing. "Built a real-time transit delay notifier in 36 hours; won second place out of 60 teams."
- **Teaching assistant or tutor:** shows depth in a subject and communication. "TA for Data Structures, held weekly office hours for 80 students and graded assignments in Java."
- **Research:** describe the engineering. Code, data and tools you wrote, not only the topic.
- **Campus or freelance work:** building a site for a student organization or a small business is real client work.

## Coursework: Only What Adds Something

A list of courses rarely helps; every CS graduate took Data Structures and Algorithms. Include coursework only if it is advanced or directly relevant to the role, such as distributed systems for a backend role or computer graphics for a game studio, and keep it to one line.

## Non-Technical Jobs Still Belong

A retail, restaurant or warehouse job shows reliability, time management and working under pressure. Keep it, but compress it to one or two bullets. If you automated something or used data on the job, lead with that.

## Skills: Group and Be Honest

- **Languages:** Python, Java, TypeScript, C++
- **Frameworks:** React, Node.js, Spring Boot, FastAPI
- **Tools and platforms:** Git, Docker, PostgreSQL, AWS, Linux, CI/CD
- **Concepts:** REST APIs, testing, data structures, system design basics

List only what you can discuss in an interview. A technical screen will often probe anything listed. Match the posting's language: if it says "TypeScript" and you used it, make sure it appears.

## One Page, Clean Layout

New grad resumes should be one page. Use a single column, standard section headings and a readable font at 10.5 to 11 points. Avoid skill bars, logos and photos. The [one-page resume guide](/blog/how-to-write-a-one-page-resume) has a cutting order if you run over.
${TEMPLATES_MD}
## Related Guides

- [Software Engineer Resume Guide 2026](/blog/software-engineer-resume-guide-2026)
- [Internship Resume for College Students](/blog/internship-resume-college-students-2026)
- [Resume With No Experience](/blog/resume-with-no-experience-2026)
- [Back-End Developer Resume Guide 2026](/blog/back-end-developer-resume-guide-2026)

## Frequently asked questions

### Can I get a software engineering job without an internship?

Yes. Many new grads are hired on the strength of projects, open source work, hackathons, research or part-time technical work. The resume needs to show that you have built and shipped real code.

### How many projects should a new grad resume have?

Three or four strong ones. Quality matters more than count: deployed projects with users or measurable results beat a long list of tutorial apps.

### Should education go first on a new grad resume?

Yes. For recent graduates, education is the most recent credential. Put it at the top, followed by skills and projects.

### Should I include my GPA?

Include it if it is 3.5 or higher, or if the employer asks for it. Otherwise leave it off and let your projects carry the resume.

### Do non-technical jobs belong on a software engineer resume?

Yes, briefly. They show reliability and work habits. Keep them to one or two bullets and place them below your projects.
${NEXT_STEP_MD}`,
  },
  {
    slug: "mechanical-engineer-resume-guide-2026",
    title: "Mechanical Engineer Resume Guide 2026: CAD, Design and Test Evidence",
    seo_title: "Mechanical Engineer Resume Guide 2026: CAD, Design, Test",
    seo_description: "How to write a mechanical engineer resume in 2026: CAD and simulation keywords, GD&T, EIT or PE status, and bullets that show design and test results.",
    brief: "Mechanical engineering hiring managers want to see what you designed, how you proved it worked, and what it cost. Here is how to turn CAD skills and test work into resume evidence.",
    tags: ["Role Guides", "Keywords", "Resume Writing"],
    read_time_minutes: 6,
    content_md: `# Mechanical Engineer Resume Guide 2026

A mechanical engineering resume often reads like a software list: SolidWorks, ANSYS, MATLAB, AutoCAD. Those tools matter, and applicant tracking systems search for them, but a hiring manager reading the resume wants something else: what you designed, how you validated it, and what it achieved in cost, weight, reliability or schedule.

This guide covers keywords by category, how to list licensure, and bullet examples for design, test and manufacturing roles.

## What Hiring Managers Look For

Mechanical engineering roles vary widely, from product design and HVAC to automotive, aerospace, manufacturing and energy. Most postings still look for evidence in four areas:

1. **Design:** concepts, CAD models, drawings, tolerancing.
2. **Analysis:** hand calculations, FEA, CFD, thermal and fatigue analysis.
3. **Test and validation:** test plans, prototypes, data, failure analysis.
4. **Manufacturing:** design for manufacturing, supplier work, cost and production support.

Show where your strengths are, and match them to the posting.

## Keywords by Category

Use the exact tool and standard names from the posting.

- **CAD and PLM:** SolidWorks, CATIA, Creo, Siemens NX, Inventor, AutoCAD, Teamcenter, Windchill
- **Analysis and simulation:** ANSYS, Abaqus, COMSOL, SolidWorks Simulation, FEA, CFD, MATLAB, Simulink, Python
- **Design practice:** GD&T (ASME Y14.5), tolerance stack-up analysis, DFM, DFA, DFMEA, design reviews, engineering change orders
- **Test and quality:** test plans, DOE, root cause analysis, 8D, PFMEA, PPAP, first article inspection, Six Sigma
- **Manufacturing:** injection molding, sheet metal, CNC machining, additive manufacturing, casting, welding, assembly
- **Domain:** HVAC, thermal management, mechanisms, pressure vessels (ASME BPVC), automotive, aerospace, medical devices

Do not list every tool you have opened. Interviewers may ask you to walk through a model or analysis in any tool you name.

## Listing EIT and PE Status

Licensure matters more in some fields (building systems, consulting, utilities, public works) than others (consumer products, many manufacturing roles). List it clearly if you have it.

- **EIT or EI:** after passing the Fundamentals of Engineering (FE) exam, administered by NCEES, many states grant an Engineer in Training or Engineer Intern designation.
- **PE:** Professional Engineer, licensed by a state board after the Principles and Practice of Engineering (PE) exam and required experience.

Write it with the state:

> Professional Engineer (PE), Mechanical, State of Ohio
> Engineer in Training (EIT), Texas · FE exam passed 2025

You can also add "PE" after your name in the header if you are licensed.

## Bullets That Show Design and Test Evidence

A strong mechanical engineering bullet names what you did, the method or tool, and the measurable result.

> Before: Designed parts in SolidWorks.
>
> After: Redesigned a cast aluminum motor bracket in SolidWorks, validated with FEA and fatigue testing; cut weight 22% and unit cost $3.40 while passing a 1M-cycle vibration test.

> Before: Did testing on products.
>
> After: Wrote and ran thermal test plans for a battery enclosure; correlated CFD results within 5% of test data and identified a hot spot that drove a vent redesign before tooling release.

> Before: Supported manufacturing.
>
> After: Resolved a recurring assembly interference through a tolerance stack-up and GD&T revision, reducing line rejects from 4% to under 0.5%.

> Before: Worked with suppliers.
>
> After: Led DFM reviews with three injection molding suppliers, consolidating two parts into one and saving $85K a year at production volume.

If you cannot share exact figures because of confidentiality, use percentages or relative terms: "reduced part count by a third", "cut test cycle time in half".

## New Graduates: Projects and Teams

Entry-level mechanical engineers can lean on capstone projects, competition teams and co-ops.

- **Capstone design:** describe the problem, your role, the analysis and the result.
- **Competition teams:** Formula SAE, Baja SAE, robotics, rocketry and similar teams are well known to hiring managers. Name your subsystem and what you delivered.
- **Co-ops and internships:** treat as full job entries.
- **Lab and machine shop skills:** list hands-on skills such as manual machining or welding if you have them.

> Suspension lead, Formula SAE team: designed and analyzed control arms in SolidWorks and ANSYS, reducing unsprung mass by 1.8 kg; manufactured and tested parts in the university shop before competition.

## Structure and Format

- **Summary:** title, years, domain, one result. "Mechanical design engineer with five years in consumer electronics enclosures; led three products from concept to mass production."
- **Skills:** grouped by category.
- **Experience:** reverse chronological, three to five bullets per recent role.
- **Projects:** for new grads or when they show skills the jobs don't.
- **Education and licensure:** degree, school, year; FE, EIT or PE status.

One page for early career; two pages for experienced engineers with substantial project history. Use a single-column layout and standard headings. Portfolio images belong in a separate portfolio link, not inside the resume.
${TEMPLATES_MD}
## Related Guides

- [Resume Keywords That Get You Hired](/blog/resume-keywords-that-get-you-hired)
- [Project Manager Resume Guide 2026](/blog/project-manager-resume-guide-2026)
- [Internship Resume for College Students](/blog/internship-resume-college-students-2026)
- [How to Write Resume Bullet Points That Show Impact](/blog/how-to-write-resume-bullet-points-that-show-impact-with-examples)

## Frequently asked questions

### What skills should a mechanical engineer put on a resume?

The CAD platform the posting names, analysis tools such as ANSYS or MATLAB, design practices like GD&T and DFM, and test and manufacturing skills that match the role. Group them by category for quick scanning.

### Should I list the FE exam or EIT on my resume?

Yes. Write the designation and state, such as "EIT, Texas", or note that you passed the FE exam. It shows progress toward licensure, which matters more in consulting, building systems and public sector work.

### How do I show results if my work is confidential?

Use percentages and relative changes instead of absolute figures, and describe the product category rather than the specific program. "Reduced part weight by 20%" is informative without disclosing details.

### Should I include Formula SAE or other student teams?

Yes, especially as a new graduate. Hiring managers recognize these teams. Name your subsystem, the tools you used and the measurable result.

### Should I put CAD images on my resume?

No. Images can break applicant tracking systems and take space from evidence. Put images in an online portfolio and link to it from your header.
${NEXT_STEP_MD}`,
  },
  {
    slug: "resume-for-over-50-2026",
    title: "Resume for Workers Over 50: Cutting Age Signals Without Hiding Experience",
    seo_title: "Resume for Over 50: Cut Age Signals, Keep Your Experience",
    seo_description: "How to write a resume over 50: age signals to remove, the 15-year window, graduation dates, showing current skills, and what the ADEA covers.",
    brief: "Experience is an asset, but a resume that starts in 1989 invites assumptions before anyone reads your results. Here is how to keep the depth and drop the signals that work against you.",
    tags: ["Resume Writing", "Job Search", "Keywords"],
    read_time_minutes: 6,
    content_md: `# Resume for Workers Over 50

Age discrimination in hiring is illegal in the US for workers 40 and over, but it is hard to prove and it still happens, often unconsciously, in the few seconds a recruiter spends on a first read. A resume that lists every role back to the start of your career, graduation years from decades ago and software nobody uses anymore can invite assumptions before your results are read.

The goal is not to hide your age or pretend to be younger. It is to present your experience the way any strong resume does: recent, relevant and focused on results. This guide covers what to cut, what to keep and how to show you are current.

## What the Law Covers

The Age Discrimination in Employment Act (ADEA) protects job applicants and employees aged 40 and over from age-based discrimination in hiring, promotion, pay and other terms of employment. It applies to employers with 20 or more employees, including state and local governments, as well as employment agencies and labor organizations. Many states have their own laws that apply to smaller employers. The [EEOC](https://www.eeoc.gov/age-discrimination) enforces the federal law and explains how to file a charge.

The law does not require you to share your age, and a resume never needs to show it. Removing age signals is a normal resume practice, not a deception: you are choosing what is relevant, as every applicant does.

## Use a 15-Year Window for Detail

Recruiters read your last two or three roles closely and the rest as background. A common approach for experienced candidates:

- **Last 10 to 15 years:** full entries with results-based bullets.
- **Earlier roles:** either a short "Earlier Career" section with titles and employers but no dates, or left off if they add nothing to the target role.

> Earlier Career: Regional Sales Manager, Midwest Distributors · Account Executive, Acme Office Supply

Keep an earlier role in full only if it is directly relevant: for example, it is where you built a skill the target job requires and you have not used it since.

## Remove Graduation Dates

You do not need to put graduation years on your degree. List the degree, field and school. This is standard for experienced candidates of any age, because the year adds nothing once you have a career behind you.

> B.S. Mechanical Engineering, Purdue University

Do the same for certifications earned long ago unless they require renewal and are current, in which case the current status matters more than the original date.

## Cut Other Age Signals

- **An AOL or Hotmail email address.** Use a simple Gmail or custom domain address with your name.
- **A landline or fax number.** One mobile number is enough.
- **"References available upon request" and an objective statement.** Both are dated conventions.
- **Outdated software and skills.** Lotus Notes, WordPerfect or old operating systems suggest your toolset stopped years ago.
- **Two spaces after periods, all-caps headings and dense Times New Roman.** Small formatting habits can date a document. Use a clean modern template.
- **"30+ years of experience" in the summary.** Say "extensive experience" or name the depth through results: "led operations across four plants".

## Show You Are Current

The strongest response to age bias is evidence that your skills are up to date.

- **Recent tools:** name the platforms you use now, matching the job posting. "Salesforce, HubSpot, Tableau, Microsoft 365, Teams" says more than "computer literate".
- **Recent learning:** certifications, courses or new methods from the last few years belong in a dedicated section.
- **Modern practices:** remote collaboration, data-driven decision making, AI-assisted workflows if you use them.
- **LinkedIn:** an updated profile with a current photo and recent activity shows engagement. The resume and profile should tell the same story.

> Led migration of the regional sales team from spreadsheets to Salesforce, building dashboards used by 30 reps and cutting weekly reporting time from six hours to one.

That one bullet answers the unspoken question about adaptability better than any adjective.

## Frame Experience as Value, Not Length

Seniority is valuable when it is described as outcomes and scope. Lead with results that only someone with your depth could deliver:

- Turnarounds, crises handled, teams rebuilt
- Mentoring and developing other managers
- Long-term client relationships and their revenue
- Cost, risk and process improvements with numbers

The [executive resume guide](/blog/executive-resume-guide-2026) covers how to present scope for senior roles.

## Be Open About Level

Some candidates over 50 want a step back from management, more flexibility or a different field. If so, write the summary for the role you want and keep the bullets focused on the work it involves. Overqualification concerns are easier to address when the resume clearly targets the level you are applying for. If you are changing direction entirely, the [career change resume guide](/blog/career-change-resume-2026) shows how to reframe experience, and the [layoff resume guide](/blog/resume-after-layoff-2026) covers returning to the market after a sudden exit.

## Length and Format

Two pages are acceptable for experienced professionals if the second page holds relevant results. Use a single-column layout with standard headings so applicant tracking systems read it correctly, and a modern sans-serif or clean serif font at 10.5 to 11 points.
${TEMPLATES_MD}
## Related Guides

- [Executive Resume Guide 2026](/blog/executive-resume-guide-2026)
- [Resume After a Layoff](/blog/resume-after-layoff-2026)
- [Career Change Resume](/blog/career-change-resume-2026)
- [How to Explain an Employment Gap](/blog/employment-gap-on-resume-2026)

## Frequently asked questions

### How far back should a resume go if I am over 50?

Give full detail for the last 10 to 15 years. Earlier roles can go in a short "Earlier Career" list without dates, or be left off if they are not relevant to the target job.

### Should I remove graduation dates from my resume?

You can, and many experienced candidates do. List the degree, field and school. The year adds little once you have significant work experience.

### Is it dishonest to leave older jobs off my resume?

No. A resume is a selection of relevant experience, not a complete record. If an application form asks for a full employment history, complete that form accurately.

### Does the ADEA protect job applicants?

Yes. The Age Discrimination in Employment Act protects applicants and employees aged 40 and over at employers with 20 or more employees. Many state laws cover smaller employers too.

### Is a two-page resume acceptable for older workers?

Yes, if the second page contains relevant results. Do not fill it with older duties; cut those first.
${NEXT_STEP_MD}`,
  },
  {
    slug: "operations-manager-resume-guide-2026",
    title: "Operations Manager Resume Guide 2026: Cost, Throughput and Teams",
    seo_title: "Operations Manager Resume Guide 2026: Cost, Throughput",
    seo_description: "How to write an operations manager resume in 2026: KPIs to show, Lean and Six Sigma keywords, and bullets for warehouse, logistics and service teams.",
    brief: "Operations managers are hired to make things cheaper, faster and more reliable. A resume that shows those three things in numbers, with the team behind them, is the one that gets the call.",
    tags: ["Role Guides", "Keywords", "Resume Writing"],
    read_time_minutes: 6,
    content_md: `# Operations Manager Resume Guide 2026

Operations is the most quantified management job. Cost per unit, throughput, on-time delivery, error rates, labor productivity and safety incidents are tracked weekly or daily. Hiring managers expect an operations manager's resume to speak that language. Instead, many resumes describe responsibility: "oversaw daily operations", "managed a team", "ensured efficiency". Those phrases fit every candidate.

This guide covers the KPIs to feature, keywords by area, bullet examples for warehouse, logistics and service operations, and how to show leadership alongside numbers.

## What Hiring Managers Look For

Operations postings usually want evidence in four areas:

1. **Cost:** labor, materials, overhead, waste.
2. **Throughput and service:** volume handled, cycle time, on-time performance.
3. **Quality and safety:** error rates, defects, incidents, audit results.
4. **People:** team size, hiring, training, retention, engagement.

The best bullets show all of these at once: a change you led, the team that delivered it, and the numbers that moved.

## KPIs to Feature

Pick the ones relevant to your industry and the posting.

- **Warehouse and distribution:** units per hour, order accuracy, pick rate, dock-to-stock time, inventory accuracy, on-time shipping, cost per order
- **Logistics and transportation:** on-time delivery, freight cost per unit, fleet utilization, carrier performance, route efficiency
- **Manufacturing:** OEE, yield, scrap rate, downtime, changeover time, cost per unit
- **Service operations:** service level, response time, backlog, cost per contact, customer satisfaction
- **People:** headcount managed, turnover, absenteeism, safety incident rate (TRIR), training completion

## Keywords by Category

- **Methods:** Lean, Six Sigma (Green Belt, Black Belt), Kaizen, 5S, value stream mapping, continuous improvement, root cause analysis, standard work
- **Planning:** capacity planning, workforce planning, demand forecasting, S&OP, inventory management, budgeting, P&L management
- **Systems:** ERP (SAP, Oracle, NetSuite), WMS (Manhattan, Blue Yonder), TMS, Microsoft Excel, Power BI, Tableau
- **Compliance and safety:** OSHA, ISO 9001, safety programs, audits, vendor compliance
- **Leadership:** hiring, coaching, performance management, cross-functional collaboration, change management

List certifications such as Lean Six Sigma belts, APICS/ASCM credentials (CPIM, CSCP) or PMP with the issuing body.

## Bullets That Show Cost, Throughput and Teams

> Before: Managed warehouse operations and staff.
>
> After: Ran a 180,000 sq ft distribution center with 120 associates across two shifts; raised units per hour 18% and order accuracy to 99.7% through slotting changes and standard work.

> Before: Responsible for reducing costs.
>
> After: Cut annual freight spend by $1.2M by consolidating LTL shipments and renegotiating three carrier contracts, with no drop in on-time delivery.

> Before: Improved processes.
>
> After: Led a Lean value stream project on returns processing that cut cycle time from five days to 36 hours and freed four FTEs for redeployment to outbound.

> Before: Handled safety.
>
> After: Rebuilt the site safety program with daily huddles and near-miss reporting; recordable incidents fell from nine to two year over year.

> Before: Managed team members.
>
> After: Hired and trained 40 seasonal associates for peak, reaching productivity targets in two weeks instead of four; reduced first-90-day turnover by a third.

Notice the pattern: a specific action, the scale, and a before-and-after number.

## Service and Office Operations

Operations managers outside warehouses and plants, in healthcare, financial services, SaaS or hospitality, should translate the same idea into their KPIs.

> Redesigned intake and scheduling for a 12-clinic network, cutting average patient wait for new appointments from 19 to 8 days.

> Introduced workflow automation in back-office claims processing, reducing backlog by 60% and cost per claim by 25% within six months.

## Show the Scope Up Front

Operations hiring managers want scale in the first few lines. Your summary should include:

- Industry and type of operation
- Site size, team size, budget or volume
- One or two headline results

> Operations manager with ten years in third-party logistics; runs multi-shift sites of up to 200 associates and $15M annual budgets; known for productivity gains through Lean and WMS optimization.

## Common Mistakes

- **Responsibilities without results.** "Oversaw daily operations" fits every candidate. Replace it with a KPI that moved.
- **Numbers without context.** "Managed $5M" means more as "managed a $5M budget and came in 4% under".
- **Ignoring people.** Operations is a team result. Show hiring, training and retention alongside cost and throughput.
- **Methodology name-dropping.** Listing Lean and Six Sigma without a project that used them adds little.
- **No safety evidence.** In warehouses and plants, a safety record is often a deciding factor.

## Structure and Format

- **Summary:** scope and headline results, three lines.
- **Skills and certifications:** grouped.
- **Experience:** reverse chronological; for each role, one scope line (site, team, budget) followed by four or five results.
- **Education:** degree and field.

One page if you have under ten years of experience; two pages for senior operations leaders with multiple sites. Use a single-column layout so applicant tracking systems read it correctly.

If you are coming from the military, many operations skills translate directly; the [military to civilian resume guide](/blog/military-to-civilian-resume-2026) shows how. If you are moving toward program or project leadership, see the [project manager resume guide](/blog/project-manager-resume-guide-2026).
${TEMPLATES_MD}
## Related Guides

- [Project Manager Resume Guide 2026](/blog/project-manager-resume-guide-2026)
- [Executive Resume Guide 2026](/blog/executive-resume-guide-2026)
- [Military to Civilian Resume](/blog/military-to-civilian-resume-2026)
- [Resume Action Verbs by Category](/blog/resume-action-verbs-2026)

## Frequently asked questions

### What should an operations manager put on a resume?

Scope (site, team size, budget), the KPIs you improved (cost, throughput, quality, safety), methods such as Lean or Six Sigma, and the systems you used. Every recent bullet should include a number.

### Which certifications help an operations manager resume?

Lean Six Sigma belts, ASCM credentials such as CPIM or CSCP, and PMP are common. List them with the issuing body and match the ones the posting mentions.

### How do I show leadership on an operations resume?

Combine people results with business results: hiring and training numbers, turnover improvements, and the operational outcomes your team delivered.

### Should an operations manager resume be one or two pages?

One page for under ten years of experience. Two pages for senior leaders running multiple sites or large budgets, as long as both pages carry results.

### How do I list confidential cost figures?

Use percentages or ranges where exact figures are sensitive: "reduced freight cost by 12%" is still a strong, credible result.
${NEXT_STEP_MD}`,
  },
  {
    slug: "data-engineer-resume-guide-2026",
    title: "Data Engineer Resume Guide 2026: Pipelines, Scale and Reliability",
    seo_title: "Data Engineer Resume Guide 2026: Pipelines, Scale, SLAs",
    seo_description: "How to write a data engineer resume in 2026: Spark, Airflow, dbt and warehouse keywords, showing data volume and reliability, and examples by seniority.",
    brief: "Data engineering resumes are judged on scale and reliability: how much data, how fast, how often it broke and what you did about it. Here is how to put those numbers on one page.",
    tags: ["Role Guides", "Keywords", "Resume Writing"],
    read_time_minutes: 6,
    content_md: `# Data Engineer Resume Guide 2026

Data engineering hiring managers read resumes looking for three things: the size of the data you handled, the reliability of what you built, and the people who depended on it. Most resumes give them a stack list instead: Spark, Kafka, Airflow, dbt, Snowflake, AWS. The stack matters for keyword matching, but every candidate lists it.

This guide covers keywords by layer, how to show scale and reliability, bullet examples by seniority, and how to structure the resume.

## What Hiring Managers Look For

1. **Scale:** data volumes, event rates, number of sources, size of the warehouse.
2. **Reliability:** SLAs, freshness, data quality, incident reduction.
3. **Cost and performance:** query speed, compute cost, pipeline run time.
4. **Enablement:** analysts, data scientists and product teams who rely on your data.

A strong resume shows at least one of these in nearly every bullet.

## Keywords by Layer

Use the exact names from the posting. Group by layer so a recruiter sees your coverage.

- **Languages:** SQL, Python, Scala, Java
- **Processing:** Apache Spark, PySpark, Flink, Beam, pandas
- **Streaming and ingestion:** Kafka, Kinesis, Pub/Sub, Fivetran, Airbyte, Debezium, CDC
- **Orchestration and transformation:** Apache Airflow, Dagster, Prefect, dbt
- **Storage and warehouses:** Snowflake, BigQuery, Redshift, Databricks, Delta Lake, Apache Iceberg, PostgreSQL, S3
- **Cloud and infrastructure:** AWS, GCP, Azure, Terraform, Docker, Kubernetes, CI/CD
- **Quality and governance:** data quality testing, Great Expectations, dbt tests, data contracts, lineage, data catalog, access controls

Do not list a tool you cannot discuss in depth. Data engineering interviews commonly include SQL exercises and system design questions about pipelines you claim to have built.

## Show Scale With Real Numbers

Volume is the first thing a reviewer checks. State it with units.

- Rows or events per day
- Terabytes or petabytes in the warehouse
- Number of sources or pipelines
- Number of downstream users or dashboards

> Before: Built ETL pipelines with Spark.
>
> After: Built PySpark batch pipelines processing 3 TB of clickstream data daily from 40 sources into Delta Lake, feeding product analytics for 15 teams.

## Show Reliability and Quality

Reliability is what separates mid-level from senior data engineers. Show freshness, uptime, failures prevented and incidents reduced.

> Before: Maintained Airflow DAGs.
>
> After: Re-architected 120 Airflow DAGs with retries, idempotent loads and alerting; pipeline failures needing manual fixes fell from about ten a week to one, and the daily finance tables met their 7 a.m. SLA every day for two quarters.

> Before: Added data quality checks.
>
> After: Introduced dbt tests and data contracts on core revenue models, catching schema changes upstream before they broke executive dashboards.

## Show Cost and Performance

Cloud warehouse costs are a common concern, and engineers who control them stand out.

> Cut monthly Snowflake spend by 35% by clustering large tables, right-sizing warehouses and moving rarely queried data to cheaper storage.

> Reduced the nightly model build from four hours to 50 minutes by converting full refreshes to incremental dbt models.

## Bullets by Seniority

**Entry-level and junior:** focus on pipelines you built end to end and the tools you used. Personal projects with real public datasets help.

> Built a pipeline ingesting public transit data every five minutes via API into PostgreSQL with Airflow, with dbt models and a dashboard; documented on GitHub.

**Mid-level:** focus on ownership of systems, scale and reliability.

**Senior and staff:** focus on architecture decisions, platform standards and cross-team impact.

> Led migration from an on-premises Hadoop cluster to Databricks on AWS for 200+ pipelines, with zero data loss and a 40% reduction in infrastructure cost; defined the team's pipeline standards and code review practices.

## Moving From Analyst or Software Engineering

Data analysts moving into engineering should highlight SQL depth, automation and any pipeline or modeling work. The [data analyst resume guide](/blog/data-analyst-resume-guide-2026) shows the analyst side. Software engineers should emphasize distributed systems, data-heavy services and backend work; the [back-end developer resume guide](/blog/back-end-developer-resume-guide-2026) covers that framing. Cloud certifications such as AWS or Google Cloud data engineering credentials can help with keyword matching during a transition, as described in the [cloud engineer resume guide](/blog/cloud-engineer-resume-guide-2026).

## Common Mistakes

- **Stack lists with no scale.** Every bullet names a tool and none states a volume.
- **Listing every tool you have touched.** Interviewers will ask about each one.
- **Ignoring the consumers of your data.** Say who relied on the pipelines and what they did with them.
- **No reliability story.** Hiring managers expect failures; they want to know how you reduced them.
- **Architecture diagrams inside the resume.** They break parsing. Link to a README instead.

## Structure and Format

- **Header:** name, location, email, phone, LinkedIn, GitHub.
- **Summary:** title, years, domain, scale and one result.
- **Skills:** grouped by layer.
- **Experience:** reverse chronological, three to five bullets for recent roles, each with a number.
- **Projects:** for junior candidates or to show tools not used at work.
- **Education and certifications.**

One page for under ten years of experience. Use a single-column layout; architecture diagrams belong in a portfolio or GitHub README, not on the resume.
${TEMPLATES_MD}
## Related Guides

- [Data Analyst Resume Guide 2026](/blog/data-analyst-resume-guide-2026)
- [Data Scientist Resume Guide 2026](/blog/data-scientist-resume-guide-2026)
- [Cloud Engineer Resume Guide 2026](/blog/cloud-engineer-resume-guide-2026)
- [Back-End Developer Resume Guide 2026](/blog/back-end-developer-resume-guide-2026)

## Frequently asked questions

### What skills should a data engineer put on a resume?

SQL and Python first, then the processing, orchestration and warehouse tools the posting names, such as Spark, Airflow, dbt, Snowflake or BigQuery. Group them by layer and add cloud and data quality tools you have used.

### How do I show scale on a data engineering resume?

Use concrete units: rows or events per day, terabytes stored, number of pipelines or sources, and the number of teams using your data.

### How do I show reliability?

Describe SLAs met, failure rates before and after your work, data quality checks you added and incidents you prevented. Reliability results are often what separates senior candidates.

### Are certifications useful for data engineers?

They can help, especially when moving into the field, because they match keywords and show cloud knowledge. Hands-on pipeline results still carry more weight in interviews.

### Should I include personal projects?

Yes, if you are junior or switching from another role. A deployed pipeline with real data, orchestration and tests on GitHub demonstrates skills that a course certificate cannot.
${NEXT_STEP_MD}`,
  },
];
