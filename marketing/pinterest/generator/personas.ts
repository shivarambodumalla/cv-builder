import type { ResumeContent } from "../../../lib/resume/types";

const SECTIONS = {
  contact: true, targetTitle: true, summary: true, experience: true, education: true, skills: true,
  certifications: true, awards: false, projects: false, volunteering: false, publications: false,
};
const empty = { awards: { items: [] }, projects: { items: [] }, volunteering: { items: [] }, publications: { items: [] } };

type P = Omit<ResumeContent, "sections" | "awards" | "projects" | "volunteering" | "publications"> & Partial<ResumeContent>;
const cv = (p: P, extra: Partial<typeof SECTIONS> = {}): ResumeContent =>
  ({ ...empty, ...p, sections: { ...SECTIONS, ...extra } }) as ResumeContent;

export const PERSONAS: Record<string, ResumeContent> = {
  swe: cv({
    contact: { name: "Jordan Reyes", email: "jordan.reyes@email.com", phone: "(512) 555-0147", location: "Austin, TX", linkedin: "linkedin.com/in/jordanreyes", website: "github.com/jreyes" },
    targetTitle: { title: "Senior Software Engineer" },
    summary: { content: "Backend-leaning software engineer with 7 years building payment and data platforms in Go, Python and TypeScript. Led migrations that cut infrastructure cost 38% and brought p99 latency under 120 ms for 9M monthly users." },
    experience: { items: [
      { company: "Northwind Payments", role: "Senior Software Engineer", location: "Austin, TX", startDate: "Mar 2022", endDate: "", isCurrent: true, bullets: [
        "Designed an event-driven ledger service in Go processing 3.1M transactions/day at 99.99% uptime",
        "Cut AWS spend 38% ($410K/yr) by moving batch jobs from EC2 to spot-backed Kubernetes",
        "Led a team of 5 through a zero-downtime Postgres 11→15 upgrade across 14 databases",
        "Mentored 4 engineers; two promoted to Software Engineer II within 12 months" ] },
      { company: "Brightline Health", role: "Software Engineer", location: "Remote", startDate: "Jun 2019", endDate: "Feb 2022", isCurrent: false, bullets: [
        "Built a HIPAA-compliant scheduling API in Python/FastAPI used by 1,200 clinics",
        "Reduced page load time 61% by introducing Redis caching and query batching",
        "Shipped a React Native patient app rated 4.8★ across 90K App Store reviews" ] },
      { company: "Cedar Analytics", role: "Software Engineer Intern", location: "Dallas, TX", startDate: "May 2018", endDate: "Aug 2018", isCurrent: false, bullets: [
        "Automated nightly ETL validation, catching 97% of schema drift before production" ] },
    ] },
    education: { items: [{ institution: "University of Texas at Austin", degree: "B.S.", field: "Computer Science", startDate: "2015", endDate: "2019" }] },
    skills: { categories: [
      { name: "Languages", skills: ["Go", "Python", "TypeScript", "SQL"] },
      { name: "Cloud & Data", skills: ["AWS", "Kubernetes", "Terraform", "PostgreSQL", "Kafka"] },
      { name: "Practices", skills: ["System design", "CI/CD", "Observability"] } ] },
    certifications: { items: [{ name: "AWS Certified Solutions Architect – Associate", issuer: "Amazon Web Services", startDate: "2023", endDate: "", isCurrent: false }] },
  }),
  pm: cv({
    contact: { name: "Morgan Ellis", email: "morgan.ellis@email.com", phone: "(312) 555-0192", location: "Chicago, IL", linkedin: "linkedin.com/in/morganellis", website: "" },
    targetTitle: { title: "Senior Project Manager, PMP" },
    summary: { content: "PMP-certified project manager with 8 years delivering software and operations programs for healthcare and logistics firms. Consistently ships on schedule: 22 of the last 24 projects delivered on time and within 5% of budget." },
    experience: { items: [
      { company: "Lakeview Logistics", role: "Senior Project Manager", location: "Chicago, IL", startDate: "Jan 2021", endDate: "", isCurrent: true, bullets: [
        "Directed a $4.2M warehouse management system rollout across 11 distribution centers",
        "Reduced order-to-ship time 27% by redesigning handoffs between 6 operations teams",
        "Built a portfolio dashboard in Power BI now used by the COO for weekly reviews" ] },
      { company: "Meridian Health Partners", role: "Project Manager", location: "Evanston, IL", startDate: "Aug 2017", endDate: "Dec 2020", isCurrent: false, bullets: [
        "Managed EHR integration for 3 hospitals and 40 clinics serving 250K patients",
        "Cut vendor onboarding from 90 to 45 days with a standardized intake process",
        "Coordinated 30-person cross-functional team through Joint Commission audit" ] },
      { company: "Prairie Consulting Group", role: "Business Analyst", location: "Chicago, IL", startDate: "Jun 2015", endDate: "Jul 2017", isCurrent: false, bullets: [
        "Documented requirements for 12 client engagements with a 96% sign-off rate" ] },
    ] },
    education: { items: [{ institution: "University of Illinois Urbana-Champaign", degree: "B.S.", field: "Industrial Engineering", startDate: "2011", endDate: "2015" }] },
    skills: { categories: [
      { name: "Methods", skills: ["Agile", "Scrum", "Waterfall", "Risk management"] },
      { name: "Tools", skills: ["Jira", "Smartsheet", "MS Project", "Power BI"] } ] },
    certifications: { items: [
      { name: "Project Management Professional (PMP)", issuer: "PMI", startDate: "2019", endDate: "", isCurrent: false },
      { name: "Certified ScrumMaster (CSM)", issuer: "Scrum Alliance", startDate: "2018", endDate: "", isCurrent: false } ] },
  }),
  exec: cv({
    contact: { name: "Dana Whitfield", email: "dana.whitfield@email.com", phone: "(303) 555-0118", location: "Denver, CO", linkedin: "linkedin.com/in/danawhitfield", website: "" },
    targetTitle: { title: "Vice President of Operations" },
    summary: { content: "Operations executive with 15 years scaling multi-site businesses from $40M to $310M in revenue. Known for building accountable teams, disciplined planning cycles and margin gains that hold." },
    experience: { items: [
      { company: "Summit Outdoor Co.", role: "Vice President of Operations", location: "Denver, CO", startDate: "Apr 2019", endDate: "", isCurrent: true, bullets: [
        "Lead 420 staff across manufacturing, fulfillment and customer care in 5 states",
        "Grew EBITDA margin from 9.1% to 14.6% in three years through network redesign",
        "Opened a 280,000 sq ft fulfillment center on time and $1.3M under budget" ] },
      { company: "Front Range Foods", role: "Director of Operations", location: "Boulder, CO", startDate: "Feb 2014", endDate: "Mar 2019", isCurrent: false, bullets: [
        "Scaled production 3.4× while holding on-time delivery above 98%",
        "Negotiated supplier contracts saving $2.8M annually" ] },
      { company: "Keystone Advisory", role: "Senior Consultant, Supply Chain", location: "Chicago, IL", startDate: "Jul 2010", endDate: "Jan 2014", isCurrent: false, bullets: [
        "Delivered inventory optimization for Fortune 500 retailers, freeing $60M+ in working capital" ] },
    ] },
    education: { items: [
      { institution: "University of Colorado Boulder", degree: "MBA", field: "Operations Management", startDate: "2008", endDate: "2010" },
      { institution: "Colorado State University", degree: "B.S.", field: "Business Administration", startDate: "2004", endDate: "2008" } ] },
    skills: { categories: [
      { name: "Leadership", skills: ["P&L ownership", "M&A integration", "Lean Six Sigma"] },
      { name: "Systems", skills: ["SAP", "NetSuite", "Tableau"] } ] },
    certifications: { items: [{ name: "Lean Six Sigma Black Belt", issuer: "ASQ", startDate: "2016", endDate: "", isCurrent: false }] },
  }),
  marketing: cv({
    contact: { name: "Avery Collins", email: "avery.collins@email.com", phone: "(646) 555-0163", location: "New York, NY", linkedin: "linkedin.com/in/averycollins", website: "averycollins.com" },
    targetTitle: { title: "Growth Marketing Manager" },
    summary: { content: "Growth marketer with 6 years across DTC and B2B SaaS. Owns paid, lifecycle and SEO programs end to end; most recently grew qualified pipeline 142% while lowering blended CAC 31%." },
    experience: { items: [
      { company: "Hearth & Home", role: "Growth Marketing Manager", location: "New York, NY", startDate: "May 2022", endDate: "", isCurrent: true, bullets: [
        "Manage a $3.5M annual paid budget across Meta, Google and TikTok at 4.2× ROAS",
        "Launched lifecycle email program that lifted repeat purchase rate from 18% to 29%",
        "Grew organic traffic 3.1× in 14 months with a 120-page content hub" ] },
      { company: "Relay Software", role: "Demand Generation Specialist", location: "Brooklyn, NY", startDate: "Jan 2020", endDate: "Apr 2022", isCurrent: false, bullets: [
        "Increased MQL-to-SQL conversion 44% by rebuilding HubSpot lead scoring",
        "Ran 30+ webinars generating $2.1M in sourced pipeline" ] },
      { company: "Bloom Agency", role: "Marketing Coordinator", location: "New York, NY", startDate: "Jul 2018", endDate: "Dec 2019", isCurrent: false, bullets: [
        "Coordinated campaigns for 9 retail clients with a 95% on-time launch rate" ] },
    ] },
    education: { items: [{ institution: "New York University", degree: "B.A.", field: "Communications", startDate: "2014", endDate: "2018" }] },
    skills: { categories: [
      { name: "Channels", skills: ["Paid social", "SEM", "SEO", "Lifecycle"] },
      { name: "Tools", skills: ["HubSpot", "GA4", "Klaviyo", "Figma", "SQL"] } ] },
    certifications: { items: [{ name: "Google Ads Search Certification", issuer: "Google", startDate: "2024", endDate: "", isCurrent: false }] },
  }),
  grad: cv({
    contact: { name: "Taylor Brooks", email: "taylor.brooks@email.com", phone: "(617) 555-0134", location: "Boston, MA", linkedin: "linkedin.com/in/taylorbrooks", website: "" },
    targetTitle: { title: "Financial Analyst" },
    summary: { content: "Economics graduate with two finance internships and hands-on experience building three-statement models, DCF valuations and investor-ready dashboards. Seeking an analyst role in corporate finance or investment banking." },
    experience: { items: [
      { company: "Harbor Street Capital", role: "Investment Banking Summer Analyst", location: "Boston, MA", startDate: "Jun 2025", endDate: "Aug 2025", isCurrent: false, bullets: [
        "Built comparable-company and DCF models for 3 live sell-side mandates ($80M–$350M)",
        "Drafted 20+ pages of a confidential information memorandum reviewed by the MD",
        "Screened 150 potential buyers and prioritized a 25-name outreach list" ] },
      { company: "Beacon Medical Devices", role: "FP&A Intern", location: "Cambridge, MA", startDate: "Jun 2024", endDate: "Aug 2024", isCurrent: false, bullets: [
        "Automated the monthly variance report in Excel/VBA, saving the team 12 hours a month",
        "Analyzed $18M in operating spend and flagged $640K in duplicate vendor contracts" ] },
      { company: "Economics Department", role: "Research Assistant", location: "Ann Arbor, MI", startDate: "Sep 2023", endDate: "May 2025", isCurrent: false, bullets: [
        "Cleaned and analyzed 2M-row labor dataset in Stata for a faculty working paper" ] },
    ] },
    education: { items: [{ institution: "University of Michigan", degree: "B.A.", field: "Economics, Minor in Statistics · GPA 3.8", startDate: "2021", endDate: "2025" }] },
    skills: { categories: [
      { name: "Finance", skills: ["Financial modeling", "DCF", "LBO", "Valuation"] },
      { name: "Tools", skills: ["Excel", "PowerPoint", "Python", "Stata", "Capital IQ"] } ] },
    certifications: { items: [{ name: "Bloomberg Market Concepts", issuer: "Bloomberg", startDate: "2024", endDate: "", isCurrent: false }] },
    projects: { items: [
      { name: "Student Investment Fund — Portfolio Manager", url: "", startDate: "Sep 2023", endDate: "May 2025", bullets: [
        "Managed the $1.2M consumer sector sleeve; outperformed the S&P 500 benchmark by 3.1% in 2024",
        "Pitched 6 equities to the investment committee; 4 were added to the fund" ] },
      { name: "Undergraduate Finance Club — VP of Education", url: "", startDate: "Jan 2023", endDate: "May 2025", bullets: [
        "Ran weekly modeling workshops for 80+ members; 14 members landed banking internships" ] } ] },
  }, { projects: true }),
  accountant: cv({
    contact: { name: "Jamie Ortiz", email: "jamie.ortiz@email.com", phone: "(704) 555-0176", location: "Charlotte, NC", linkedin: "linkedin.com/in/jamieortiz", website: "" },
    targetTitle: { title: "Senior Accountant, CPA" },
    summary: { content: "CPA with 6 years in public accounting and corporate reporting. Closes the books in four days, keeps audits clean and has led two ERP migrations without a restatement." },
    experience: { items: [
      { company: "Carolina Health Systems", role: "Senior Accountant", location: "Charlotte, NC", startDate: "Mar 2022", endDate: "", isCurrent: true, bullets: [
        "Shortened month-end close from 8 to 4 business days for a $900M revenue organization",
        "Owned revenue recognition under ASC 606 for 14 service lines",
        "Led NetSuite migration of 6 entities with zero audit findings" ] },
      { company: "Hollis & Grant LLP", role: "Audit Senior Associate", location: "Charlotte, NC", startDate: "Sep 2019", endDate: "Feb 2022", isCurrent: false, bullets: [
        "Managed fieldwork for 9 audit clients in manufacturing and healthcare",
        "Trained 6 first-year associates on testing controls and workpaper standards" ] },
      { company: "Hollis & Grant LLP", role: "Audit Associate", location: "Charlotte, NC", startDate: "Aug 2018", endDate: "Aug 2019", isCurrent: false, bullets: [
        "Tested internal controls for SOX 404 engagements totaling $2B in revenue" ] },
    ] },
    education: { items: [{ institution: "UNC Charlotte", degree: "M.Acc.", field: "Accounting", startDate: "2017", endDate: "2018" }, { institution: "UNC Charlotte", degree: "B.S.", field: "Accounting", startDate: "2013", endDate: "2017" }] },
    skills: { categories: [
      { name: "Accounting", skills: ["GAAP", "ASC 606", "SOX", "Consolidations"] },
      { name: "Systems", skills: ["NetSuite", "SAP", "BlackLine", "Excel"] } ] },
    certifications: { items: [{ name: "Certified Public Accountant (CPA)", issuer: "North Carolina State Board", startDate: "2020", endDate: "", isCurrent: false }] },
  }),
  analyst: cv({
    contact: { name: "Sam Carter", email: "sam.carter@email.com", phone: "(404) 555-0129", location: "Atlanta, GA", linkedin: "linkedin.com/in/samcarter", website: "" },
    targetTitle: { title: "Data Analyst" },
    summary: { content: "Data analyst with 4 years turning messy retail and marketing data into decisions. Builds the SQL models, dashboards and experiments behind pricing and retention strategy." },
    experience: { items: [
      { company: "Peachtree Retail Group", role: "Data Analyst", location: "Atlanta, GA", startDate: "Feb 2023", endDate: "", isCurrent: true, bullets: [
        "Built a churn model in Python that targeted a win-back campaign worth $1.9M in revenue",
        "Rebuilt 40 Tableau dashboards on dbt models, cutting refresh failures 85%",
        "Designed A/B tests for pricing pages that raised conversion 11%" ] },
      { company: "Southern Bell Media", role: "Junior Data Analyst", location: "Atlanta, GA", startDate: "Jul 2021", endDate: "Jan 2023", isCurrent: false, bullets: [
        "Automated weekly audience reports, saving 10 analyst-hours a week",
        "Consolidated 5 ad-platform feeds into a single BigQuery reporting layer" ] },
    ] },
    education: { items: [{ institution: "Georgia Institute of Technology", degree: "B.S.", field: "Business Analytics", startDate: "2017", endDate: "2021" }] },
    skills: { categories: [
      { name: "Analysis", skills: ["SQL", "Python", "A/B testing", "Forecasting"] },
      { name: "Tools", skills: ["Tableau", "dbt", "BigQuery", "Looker"] } ] },
    certifications: { items: [{ name: "Google Data Analytics Certificate", issuer: "Google", startDate: "2021", endDate: "", isCurrent: false }] },
  }),
  sales: cv({
    contact: { name: "Casey Morgan", email: "casey.morgan@email.com", phone: "(212) 555-0187", location: "New York, NY", linkedin: "linkedin.com/in/caseymorgan", website: "" },
    targetTitle: { title: "Enterprise Account Executive" },
    summary: { content: "Enterprise AE with 7 years selling SaaS into Fortune 1000 accounts. 128% average quota attainment and a record of opening new verticals from zero." },
    experience: { items: [
      { company: "Crestline Software", role: "Enterprise Account Executive", location: "New York, NY", startDate: "Jan 2022", endDate: "", isCurrent: true, bullets: [
        "Closed $4.8M in new ARR in FY2025, 134% of quota, #2 of 38 AEs",
        "Landed the company's first two banking logos, each with a $600K+ first-year contract",
        "Cut average sales cycle from 7.5 to 5 months with a mutual action plan playbook" ] },
      { company: "Parkside Data", role: "Mid-Market Account Executive", location: "New York, NY", startDate: "Mar 2019", endDate: "Dec 2021", isCurrent: false, bullets: [
        "Averaged 121% of quota across three years; Presidents' Club 2020 and 2021",
        "Built a partner channel that sourced 22% of regional pipeline" ] },
      { company: "Parkside Data", role: "Sales Development Representative", location: "New York, NY", startDate: "Jun 2017", endDate: "Feb 2019", isCurrent: false, bullets: [
        "Booked 310 qualified meetings, top SDR for 5 consecutive quarters" ] },
    ] },
    education: { items: [{ institution: "Boston College", degree: "B.A.", field: "Economics", startDate: "2013", endDate: "2017" }] },
    skills: { categories: [
      { name: "Sales", skills: ["MEDDICC", "Enterprise negotiation", "Forecasting"] },
      { name: "Tools", skills: ["Salesforce", "Gong", "Outreach", "LinkedIn Sales Navigator"] } ] },
    certifications: { items: [] },
    awards: { items: [
      { title: "Presidents' Club", issuer: "Parkside Data", date: "2020, 2021", description: "Top 5% of the sales organization two years running" },
      { title: "Rookie of the Year", issuer: "Crestline Software", date: "2022", description: "Highest first-year bookings in company history" } ] },
  }, { certifications: false, awards: true }),
  designer: cv({
    contact: { name: "Riley Chen", email: "riley.chen@email.com", phone: "(415) 555-0152", location: "San Francisco, CA", linkedin: "linkedin.com/in/rileychen", website: "rileychen.design" },
    targetTitle: { title: "Senior Product Designer" },
    summary: { content: "Product designer with 7 years shaping consumer and fintech apps from research to launch. Pairs systems thinking with craft; my last redesign raised activation 23% for 4M users." },
    experience: { items: [
      { company: "Fable Finance", role: "Senior Product Designer", location: "San Francisco, CA", startDate: "Apr 2022", endDate: "", isCurrent: true, bullets: [
        "Led the onboarding redesign that raised 7-day activation from 41% to 64%",
        "Built a 180-component design system adopted by 6 product squads",
        "Ran 60+ usability sessions; findings shaped the 2025 product roadmap" ] },
      { company: "Wander Travel", role: "Product Designer", location: "Oakland, CA", startDate: "Jun 2019", endDate: "Mar 2022", isCurrent: false, bullets: [
        "Designed the booking flow for iOS and Android, lifting conversion 18%",
        "Partnered with engineering to cut design-to-ship time from 5 weeks to 2" ] },
      { company: "Studio North", role: "UX Designer", location: "San Jose, CA", startDate: "Aug 2017", endDate: "May 2019", isCurrent: false, bullets: [
        "Delivered UX for 14 client products across health, retail and education" ] },
    ] },
    education: { items: [{ institution: "California College of the Arts", degree: "BFA", field: "Interaction Design", startDate: "2013", endDate: "2017" }] },
    skills: { categories: [
      { name: "Design", skills: ["Product design", "Design systems", "Prototyping", "UX research"] },
      { name: "Tools", skills: ["Figma", "Framer", "Maze", "Webflow"] } ] },
    certifications: { items: [{ name: "Google UX Design Certificate", issuer: "Google", startDate: "2020", endDate: "", isCurrent: false }] },
  }),
  founder: cv({
    contact: { name: "Alex Kim", email: "alex.kim@email.com", phone: "(213) 555-0144", location: "Los Angeles, CA", linkedin: "linkedin.com/in/alexkim", website: "alexkim.co" },
    targetTitle: { title: "Founder & Head of Product" },
    summary: { content: "Two-time founder and product lead. Took a meal-planning app from idea to 250K users and an acquisition; now looking to lead product at a Series B–C startup." },
    experience: { items: [
      { company: "Pantry (acquired by FreshCart)", role: "Co-founder & CEO", location: "Los Angeles, CA", startDate: "Jan 2021", endDate: "Jun 2025", isCurrent: false, bullets: [
        "Grew the app to 250K users and $2.4M ARR with a 9-person team",
        "Raised a $3.5M seed round led by two LA-based funds",
        "Negotiated the acquisition and led integration of the product into FreshCart" ] },
      { company: "Loop Labs", role: "Senior Product Manager", location: "Santa Monica, CA", startDate: "Mar 2018", endDate: "Dec 2020", isCurrent: false, bullets: [
        "Owned the creator payouts product, growing monthly payouts from $200K to $3M",
        "Introduced quarterly discovery sprints adopted across 4 product teams" ] },
    ] },
    education: { items: [{ institution: "UCLA", degree: "B.S.", field: "Cognitive Science", startDate: "2012", endDate: "2016" }] },
    skills: { categories: [
      { name: "Product", skills: ["Strategy", "Discovery", "Pricing", "Analytics"] },
      { name: "Leadership", skills: ["Fundraising", "Hiring", "M&A"] } ] },
    certifications: { items: [] },
    awards: { items: [
      { title: "Startup of the Year finalist", issuer: "LA Tech Awards", date: "2023", description: "" },
      { title: "Demo Day winner", issuer: "LA Startup Accelerator", date: "2021", description: "" } ] },
  }, { certifications: false, awards: true }),
};

export const TEMPLATE_PERSONA: Record<string, string> = {
  classic: "pm", sharp: "swe", minimal: "swe", "two-column": "swe",
  executive: "exec", regent: "exec", ledger: "exec", vantage: "exec",
  aurora: "marketing", "bold-accent": "marketing", coastal: "marketing", "clean-sidebar": "marketing",
  "classic-serif": "grad", harvard: "grad",
  sterling: "accountant", ember: "analyst", canopy: "sales",
  portrait: "designer", orchid: "designer", linen: "designer", graphite: "designer",
  meridian: "founder",
};

// Extra sections so every template's first page reads as a full résumé.
const add = (k: string, extra: Partial<ResumeContent>, show: Partial<ResumeContent["sections"]>) => {
  PERSONAS[k] = { ...PERSONAS[k], ...extra, sections: { ...PERSONAS[k].sections, ...show } };
};
add("swe", { projects: { items: [
  { name: "ledgerlite — open-source double-entry library", url: "github.com/jreyes/ledgerlite", startDate: "2023", endDate: "", bullets: [
    "Go library for idempotent ledger writes; 2.3K GitHub stars and used in production by 40+ companies" ] },
  { name: "Austin Code Mentors", url: "", startDate: "2021", endDate: "", bullets: [
    "Volunteer mentor for bootcamp graduates; 11 of 14 mentees hired as engineers within 6 months" ] } ] } }, { projects: true });
add("pm", { volunteering: { items: [
  { role: "Program Lead (Volunteer)", organization: "Chicago Food Depository", startDate: "2019", endDate: "", bullets: [
    "Planned logistics for 12 community food drives distributing 180,000 meals",
    "Recruited and scheduled a rotating crew of 60 volunteers" ] } ] } }, { volunteering: true });
add("exec", { volunteering: { items: [
  { role: "Board Member, Finance Committee", organization: "Denver Youth Sports League", startDate: "2018", endDate: "", bullets: [
    "Oversee a $1.8M annual budget serving 6,000 young athletes",
    "Led a capital campaign that raised $750K for two new turf fields" ] } ] },
  awards: { items: [
    { title: "Operations Leader of the Year", issuer: "Colorado Manufacturing Council", date: "2023", description: "Recognized for the fulfillment network redesign" } ] } },
  { volunteering: true, awards: true });
add("marketing", { projects: { items: [
  { name: "Rebrand launch — Hearth & Home", url: "", startDate: "2023", endDate: "", bullets: [
    "Led a 6-agency rebrand rollout across web, packaging and retail; brand search volume up 58%" ] } ] } }, { projects: true });
add("analyst", { projects: { items: [
  { name: "Store-level demand forecast", url: "", startDate: "2024", endDate: "", bullets: [
    "Prophet + XGBoost model forecasting weekly demand for 320 stores at 8.4% MAPE",
    "Adopted by the supply team to set orders, reducing stockouts 19%" ] },
  { name: "Atlanta Open Data volunteer", url: "", startDate: "2022", endDate: "", bullets: [
    "Built a public dashboard of city 311 requests viewed 25K times in its first year" ] } ] } }, { projects: true });
add("designer", { awards: { items: [
  { title: "Webby Award Honoree, Financial Services App", issuer: "The Webby Awards", date: "2024", description: "" } ] },
  projects: { items: [
    { name: "Open Budget design system", url: "rileychen.design/open-budget", startDate: "2023", endDate: "", bullets: [
      "Free Figma kit for civic budgeting apps, duplicated by 9,000+ designers" ] } ] } }, { awards: true, projects: true });
add("founder", { volunteering: { items: [
  { role: "Mentor", organization: "LA Startup Accelerator", startDate: "2022", endDate: "", bullets: [
    "Advise 5 early-stage founders per cohort on product strategy and fundraising" ] } ] },
  projects: { items: [
    { name: "Founder Notes newsletter", url: "", startDate: "2021", endDate: "", bullets: [
      "Weekly essays on consumer product; 14K subscribers with a 52% open rate" ] } ] } }, { volunteering: true, projects: true });
add("accountant", { volunteering: { items: [
  { role: "VITA Tax Preparer (Volunteer)", organization: "IRS Volunteer Income Tax Assistance", startDate: "2019", endDate: "", bullets: [
    "Prepared 200+ free returns for low-income families, securing $310K in refunds and credits" ] } ] } }, { volunteering: true });
