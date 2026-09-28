import type {
  AwardItem,
  CertificationItem,
  EducationItem,
  ExperienceItem,
  ResumeContent,
  SkillCategory,
  TemplateName,
} from "./types";

/**
 * Fictional US candidates used for template thumbnails and sample CVs.
 *
 * Every detail is invented: names, employers, phone numbers (the reserved
 * 555-01xx range) and example.com addresses. Universities and certifications
 * are real, as they are on any real resume. Headshots are AI-generated and
 * live in scripts/assets/personas/<slug>.jpg.
 *
 * Each persona carries more than one page of content on purpose. The
 * thumbnail generator (scripts/generate-template-thumbnails.ts) trims older
 * bullets until the CV fits page 1 of each template, so dense sidebar layouts
 * and roomy single-column ones both end up full but not overflowing.
 */

export type PersonaSlug =
  | "marcus-reed"
  | "kevin-park"
  | "ryan-oconnor"
  | "aaliyah-johnson"
  | "emily-carter"
  | "sofia-ramirez"
  | "jordan-ellis"
  | "maya-thompson"
  | "michael-torres"
  | "james-whitaker"
  | "daniel-chen"
  | "rachel-brooks"
  | "chris-walker"
  | "nicole-adams"
  | "olivia-nguyen";

interface PersonaInput {
  name: string;
  /** Email/LinkedIn handle; defaults to first initial + last name. */
  handle?: string;
  title: string;
  location: string;
  phone: string;
  github?: string;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillCategory[];
  certifications?: CertificationItem[];
  awards?: AwardItem[];
}

function job(
  role: string,
  company: string,
  location: string,
  startDate: string,
  endDate: string,
  bullets: string[]
): ExperienceItem {
  return { role, company, location, startDate, endDate, isCurrent: endDate === "", bullets };
}

function school(institution: string, degree: string, field: string, startDate: string, endDate: string): EducationItem {
  return { institution, degree, field, startDate, endDate };
}

function cert(name: string, issuer: string, year: string): CertificationItem {
  return { name, issuer, startDate: year, endDate: "", isCurrent: false };
}

function persona(p: PersonaInput): ResumeContent {
  // Short handles so contact lines fit narrow sidebars without breaking mid-word.
  const [first, ...rest] = p.name.toLowerCase().replace(/[^a-z ]/g, "").split(" ");
  const last = rest.join("");
  const handle = p.handle ?? `${first[0]}${last}`;
  const email = `${handle}@example.com`;
  const certifications = p.certifications ?? [];
  const awards = p.awards ?? [];
  return {
    sections: {
      contact: true,
      targetTitle: true,
      summary: true,
      experience: true,
      education: true,
      skills: true,
      certifications: certifications.length > 0,
      awards: awards.length > 0,
      projects: false,
      volunteering: false,
      publications: false,
    },
    contact: {
      name: p.name,
      email,
      phone: p.phone,
      location: p.location,
      linkedin: `linkedin.com/in/${handle}`,
      github: p.github ?? "",
      website: "",
    },
    targetTitle: { title: p.title },
    summary: { content: p.summary },
    experience: { items: p.experience },
    education: { items: p.education },
    skills: { categories: p.skills },
    certifications: { items: certifications },
    awards: { items: awards },
    projects: { items: [] },
    volunteering: { items: [] },
    publications: { items: [] },
  };
}

export const PERSONAS: Record<PersonaSlug, ResumeContent> = {
  "marcus-reed": persona({
    name: "Marcus Reed",
    title: "Senior Software Engineer",
    location: "Austin, TX",
    phone: "(512) 555-0142",
    github: "github.com/marcusreed-dev",
    summary:
      "Senior software engineer with 9 years of experience building payment and data platforms in TypeScript and Go. Led the rebuild of a checkout service handling $1.2B in annual volume and cut p95 latency by 62%. Comfortable owning systems end to end, from API design to on-call.",
    experience: [
      job("Senior Software Engineer", "Tallgrass Labs", "Austin, TX", "Mar 2022", "", [
        "Led a team of 5 to rebuild the checkout service in Go, cutting p95 latency from 840ms to 320ms across $1.2B in annual volume",
        "Designed an event-driven order pipeline on Kafka that removed 14 nightly batch jobs and reduced data lag from 6 hours to 90 seconds",
        "Introduced contract testing across 22 services, lowering production incidents by 38% year over year",
        "Mentored 4 engineers to promotion and ran the backend interview loop for 30+ hires",
      ]),
      job("Software Engineer II", "Ridgeline Payments", "Austin, TX", "Jun 2019", "Feb 2022", [
        "Built a React and Node.js merchant dashboard adopted by 18,000 small businesses in its first year",
        "Migrated the core ledger from MySQL to PostgreSQL with zero downtime, saving $240K a year in licensing",
        "Automated PCI evidence collection with Terraform and AWS Config, shortening audits from 6 weeks to 10 days",
        "Cut CI build time by 55% by parallelizing test suites and caching Docker layers",
      ]),
      job("Software Engineer", "Harborview Systems", "Dallas, TX", "Jul 2017", "May 2019", [
        "Shipped 40+ features for a logistics tracking platform serving 2M shipments a month",
        "Wrote the company's first GraphQL gateway, reducing mobile API calls per screen from 7 to 2",
        "Improved search relevance with Elasticsearch tuning, raising click-through by 21%",
      ]),
    ],
    education: [school("The University of Texas at Austin", "B.S.", "Computer Science", "2013", "2017")],
    skills: [
      { name: "Languages", skills: ["TypeScript", "Go", "Python", "SQL"] },
      { name: "Frameworks", skills: ["React", "Node.js", "Next.js", "gRPC", "GraphQL"] },
      { name: "Cloud & Data", skills: ["AWS", "Kubernetes", "Terraform", "PostgreSQL", "Kafka", "Redis"] },
    ],
    certifications: [cert("AWS Certified Solutions Architect – Associate", "Amazon Web Services", "2023")],
    awards: [
      { title: "Engineering Excellence Award", issuer: "Tallgrass Labs", date: "2024", description: "Checkout rebuild shipped two months early." },
    ],
  }),

  "kevin-park": persona({
    name: "Kevin Park",
    title: "Senior Data Scientist",
    location: "San Francisco, CA",
    phone: "(415) 555-0178",
    github: "github.com/kpark-ds",
    summary:
      "Data scientist with 9 years of experience in experimentation, forecasting and machine learning for fintech and healthcare. Built models that drive $30M+ in annual decisions and an experimentation platform used by 12 product teams.",
    experience: [
      job("Senior Data Scientist", "Quillfield", "San Francisco, CA", "Apr 2022", "", [
        "Built a credit-risk model in XGBoost that lowered 90-day default rates by 17% while approving 9% more applicants",
        "Designed the company's A/B testing platform with CUPED variance reduction, now running 150+ experiments a year",
        "Partnered with finance on a demand forecast that improved cash planning accuracy from 81% to 94%",
        "Led a 3-person squad and set review standards for all production models",
      ]),
      job("Data Scientist", "Brightwater Health", "Oakland, CA", "Aug 2019", "Mar 2022", [
        "Predicted appointment no-shows with 0.86 AUC, enabling reminders that recovered $2.1M in annual revenue",
        "Built patient-segmentation dashboards in Tableau used weekly by 40 clinic managers",
        "Moved feature pipelines from ad hoc SQL to dbt and Snowflake, cutting refresh failures by 70%",
        "Presented model findings to the executive team every quarter",
      ]),
      job("Data Analyst", "Summit Retail Group", "Los Angeles, CA", "Jul 2015", "Jul 2017", [
        "Automated weekly sales reporting for 220 stores, saving analysts 15 hours a week",
        "Ran pricing tests on 1,400 SKUs that lifted gross margin by 2.3 points",
        "Built a store-level labor model that reduced overtime costs by $900K a year",
      ]),
    ],
    education: [
      school("University of California, Berkeley", "M.S.", "Statistics", "2017", "2019"),
      school("University of California, Los Angeles", "B.S.", "Mathematics", "2011", "2015"),
    ],
    skills: [
      { name: "Machine Learning", skills: ["Python", "scikit-learn", "PyTorch", "XGBoost", "forecasting"] },
      { name: "Data", skills: ["SQL", "Spark", "dbt", "Snowflake", "Airflow"] },
      { name: "Analytics", skills: ["A/B testing", "causal inference", "Tableau", "Looker"] },
    ],
    certifications: [cert("Google Cloud Professional Data Engineer", "Google Cloud", "2024")],
    awards: [
      { title: "Data Science Impact Award", issuer: "Quillfield", date: "2024", description: "Credit model adopted across all lending products." },
    ],
  }),

  "ryan-oconnor": persona({
    name: "Ryan O'Connor",
    title: "Senior Cloud Engineer",
    location: "Denver, CO",
    phone: "(720) 555-0119",
    github: "github.com/roconnor-ops",
    summary:
      "Cloud engineer with 8 years of experience running AWS and Kubernetes platforms at scale. Cut infrastructure spend by $1.4M a year and took a healthcare network to 99.99% uptime. Strong in Terraform, observability and incident response.",
    experience: [
      job("Senior Cloud Engineer", "Aspenline Software", "Denver, CO", "Jan 2022", "", [
        "Consolidated 3 AWS organizations into a Terraform-managed landing zone covering 140 accounts",
        "Cut annual cloud spend by $1.4M through rightsizing, Savings Plans and spot-based Kubernetes node pools",
        "Built golden-path deployment templates that took new services from 2 weeks to 1 day to production",
        "Ran the on-call rotation and reduced mean time to recovery from 52 to 14 minutes",
      ]),
      job("DevOps Engineer", "Mile High Health Network", "Denver, CO", "May 2019", "Dec 2021", [
        "Migrated 60 clinical applications from on-premise VMware to EKS with no patient-facing downtime",
        "Achieved 99.99% availability for the patient portal serving 1.1M members",
        "Implemented HIPAA-aligned logging and alerting in Datadog, passing two external audits with no findings",
      ]),
      job("Systems Administrator", "Silverpine Credit Union", "Boulder, CO", "Jun 2017", "Apr 2019", [
        "Automated server patching for 300 hosts with Ansible, cutting maintenance windows by 75%",
        "Rolled out MFA and SSO to 450 staff in 6 weeks",
      ]),
    ],
    education: [school("Colorado State University", "B.S.", "Information Technology", "2013", "2017")],
    skills: [
      { name: "Cloud", skills: ["AWS", "Azure", "GCP"] },
      { name: "Infrastructure as Code", skills: ["Terraform", "Ansible", "CloudFormation"] },
      { name: "Containers", skills: ["Kubernetes", "Docker", "Helm", "Argo CD"] },
      { name: "Observability", skills: ["Datadog", "Prometheus", "Grafana"] },
    ],
    certifications: [
      cert("AWS Certified DevOps Engineer – Professional", "Amazon Web Services", "2024"),
      cert("Certified Kubernetes Administrator (CKA)", "The Linux Foundation", "2023"),
      cert("HashiCorp Certified: Terraform Associate", "HashiCorp", "2022"),
    ],
  }),

  "aaliyah-johnson": persona({
    name: "Aaliyah Johnson",
    title: "Senior Product Manager",
    location: "Atlanta, GA",
    phone: "(404) 555-0163",
    summary:
      "Product manager with 8 years of experience shipping B2B SaaS and marketplace products. Grew a self-serve product from $4M to $19M ARR and led pricing changes that lifted expansion revenue by 31%. Known for crisp discovery and cross-functional alignment.",
    experience: [
      job("Senior Product Manager", "Canvasly", "Atlanta, GA", "Feb 2022", "", [
        "Own the self-serve product line, growing ARR from $4M to $19M in 3 years",
        "Redesigned onboarding with design and data teams, raising week-one activation from 34% to 52%",
        "Led a usage-based pricing launch that increased expansion revenue by 31%",
        "Run quarterly planning for 4 squads and 28 engineers",
      ]),
      job("Product Manager", "Fieldstone Commerce", "Atlanta, GA", "Jun 2020", "Jan 2022", [
        "Launched seller analytics used by 60% of active merchants within 6 months",
        "Cut checkout abandonment by 18% by shipping saved payment methods and address autofill",
        "Set up a customer advisory board of 12 merchants that shaped the 2021 roadmap",
      ]),
      job("Associate Product Manager", "Brightpath Learning", "Nashville, TN", "Jun 2016", "Jun 2018", [
        "Shipped a teacher gradebook used in 1,200 schools",
        "Wrote the first product analytics tracking plan, moving the team off gut-feel prioritization",
      ]),
    ],
    education: [
      school("Emory University", "MBA", "Business Administration", "2018", "2020"),
      school("Georgia Institute of Technology", "B.S.", "Industrial Engineering", "2012", "2016"),
    ],
    skills: [
      { name: "Product", skills: ["roadmapping", "discovery", "pricing", "experimentation", "go-to-market"] },
      { name: "Data", skills: ["SQL", "Amplitude", "Looker"] },
      { name: "Delivery", skills: ["Agile", "Jira", "Figma"] },
    ],
    certifications: [cert("Certified Scrum Product Owner (CSPO)", "Scrum Alliance", "2021")],
  }),

  "emily-carter": persona({
    name: "Emily Carter",
    title: "Director of Marketing",
    location: "Chicago, IL",
    phone: "(312) 555-0127",
    summary:
      "Marketing leader with 11 years of experience across brand, demand generation and lifecycle for consumer and B2B brands. Manage a $4.5M budget and a team of 9, and grew marketing-sourced revenue by 64% in two years.",
    experience: [
      job("Director of Marketing", "Harlow & Finch", "Chicago, IL", "Mar 2022", "", [
        "Lead a 9-person team across brand, performance and lifecycle with a $4.5M annual budget",
        "Grew marketing-sourced revenue by 64% in two years while holding CAC flat",
        "Relaunched the brand and website, lifting direct traffic by 41% and conversion by 23%",
        "Built a lifecycle program in HubSpot that now drives 28% of repeat purchases",
      ]),
      job("Senior Marketing Manager", "Prairie Software", "Chicago, IL", "Jan 2018", "Feb 2022", [
        "Ran demand generation for a $40M ARR product, delivering 3,200 SQLs a year",
        "Launched an ABM program for 150 enterprise accounts that sourced $6.8M in pipeline",
        "Cut paid search cost per lead by 35% through restructured campaigns and landing page tests",
      ]),
      job("Marketing Manager", "Brick & Lantern Agency", "Chicago, IL", "Jun 2014", "Dec 2017", [
        "Managed integrated campaigns for 12 retail and hospitality clients",
        "Grew the agency's social practice from 2 to 9 retained clients",
        "Launched a restaurant group's loyalty program that reached 45,000 members",
      ]),
    ],
    education: [school("University of Illinois Urbana-Champaign", "B.S.", "Marketing", "2010", "2014")],
    skills: [
      { name: "Marketing", skills: ["brand strategy", "demand generation", "lifecycle", "SEO", "paid social"] },
      { name: "Tools", skills: ["HubSpot", "Salesforce", "GA4", "Google Ads", "Meta Ads Manager"] },
      { name: "Leadership", skills: ["budget ownership", "team building", "agency management"] },
    ],
    certifications: [
      cert("Google Ads Search Certification", "Google", "2024"),
      cert("Inbound Marketing Certification", "HubSpot Academy", "2023"),
    ],
    awards: [{ title: "President's Award", issuer: "Harlow & Finch", date: "2023", description: "Brand relaunch." }],
  }),

  "sofia-ramirez": persona({
    name: "Sofia Ramirez",
    title: "Growth Marketing Lead",
    location: "Los Angeles, CA",
    phone: "(213) 555-0186",
    summary:
      "Growth marketer with 7 years of experience scaling consumer apps and DTC brands. Took a subscription app from 40K to 310K paying users and cut blended CAC by 29%. Hands-on across paid social, CRO and lifecycle.",
    experience: [
      job("Growth Marketing Lead", "Palmcrest", "Los Angeles, CA", "May 2022", "", [
        "Scaled paying subscribers from 40K to 310K through paid social, creators and referral",
        "Cut blended CAC by 29% by rebuilding creative testing across Meta and TikTok",
        "Launched a referral program that now drives 18% of new subscriptions",
        "Manage a $2.8M paid media budget and 2 growth marketers",
      ]),
      job("Growth Marketing Manager", "Juniper Beauty", "Los Angeles, CA", "Mar 2020", "Apr 2022", [
        "Grew DTC revenue from $6M to $15M in two years",
        "Ran 60+ landing page and checkout tests, lifting conversion rate from 2.1% to 3.4%",
        "Built Klaviyo flows that raised email revenue share from 12% to 27%",
      ]),
      job("Digital Marketing Specialist", "Coastline Credit", "San Diego, CA", "Jun 2018", "Feb 2020", [
        "Managed Google Ads campaigns generating 9,000 loan applications a year",
        "Set up GA4 and Looker Studio reporting used by the whole marketing team",
        "Cut cost per funded loan by 19% with new audience targeting",
      ]),
    ],
    education: [school("San Diego State University", "B.S.", "Marketing", "2014", "2018")],
    skills: [
      { name: "Growth", skills: ["acquisition", "CRO", "lifecycle email", "referral", "creative testing"] },
      { name: "Channels", skills: ["Meta Ads", "TikTok Ads", "Google Ads", "Klaviyo"] },
      { name: "Analytics", skills: ["GA4", "Amplitude", "Looker", "SQL"] },
    ],
    certifications: [cert("Meta Certified Media Buying Professional", "Meta", "2023")],
    awards: [{ title: "Growth Team of the Year", issuer: "Palmcrest", date: "2024", description: "Referral launch." }],
  }),

  "jordan-ellis": persona({
    name: "Jordan Ellis",
    title: "Senior Product Designer",
    location: "Seattle, WA",
    phone: "(206) 555-0134",
    summary:
      "Product designer with 8 years of experience in consumer mobile and SaaS. Led the redesign of a travel booking app that raised conversion by 27% and built a design system used by 60 engineers. Strong in research-led interaction design and prototyping.",
    experience: [
      job("Senior Product Designer", "Cascadia Maps", "Seattle, WA", "Apr 2022", "", [
        "Led the redesign of trip booking on iOS and Android, raising conversion by 27%",
        "Built and maintain a Figma design system with 180 components used by 60 engineers",
        "Run monthly usability studies with 8–10 travelers and turn findings into roadmap bets",
        "Mentor 3 designers and co-lead design critique across the product org",
        "Shipped an accessibility overhaul that brought the app to WCAG 2.1 AA",
      ]),
      job("Product Designer", "Rainier Health", "Seattle, WA", "Jan 2019", "Mar 2022", [
        "Designed a patient check-in flow that cut front-desk wait times by 40%",
        "Shipped an accessible appointment scheduler that meets WCAG 2.1 AA",
        "Partnered with research on 30+ interviews that reshaped the provider app",
        "Cut support tickets about billing by 35% with a redesigned statements page",
        "Ran a design sprint with clinicians that shaped the telehealth launch",
      ]),
      job("UX Designer", "Pike Street Studio", "Seattle, WA", "Jun 2016", "Dec 2018", [
        "Designed websites and apps for 15 clients in retail, food and nonprofit",
        "Introduced clickable prototypes to client reviews, halving revision rounds",
        "Redesigned a food bank's volunteer sign-up, doubling monthly registrations",
      ]),
    ],
    education: [school("University of Washington", "B.Des.", "Interaction Design", "2012", "2016")],
    skills: [
      { name: "Design", skills: ["interaction design", "prototyping", "design systems", "visual design"] },
      { name: "Research", skills: ["usability testing", "interviews", "journey mapping"] },
      { name: "Tools", skills: ["Figma", "Framer", "Maze", "Jira"] },
    ],
    certifications: [cert("UX Certification", "Nielsen Norman Group", "2022")],
  }),

  "maya-thompson": persona({
    name: "Maya Thompson",
    handle: "mayat",
    title: "Senior Brand Designer",
    location: "Brooklyn, NY",
    phone: "(718) 555-0151",
    summary:
      "Brand designer with 8 years of experience creating identity systems, packaging and campaigns for consumer brands. Led a rebrand that lifted aided awareness by 22 points and art-directed campaigns reaching 40M people.",
    experience: [
      job("Senior Brand Designer", "Stoop & Co.", "Brooklyn, NY", "Jun 2022", "", [
        "Led a full rebrand across packaging, web and retail, lifting aided awareness by 22 points",
        "Art-directed 3 national campaigns with combined reach of 40M",
        "Built brand guidelines and a template library that cut agency spend by $300K a year",
        "Manage 2 designers and a pool of freelance illustrators and photographers",
      ]),
      job("Brand Designer", "Hudson Row Studio", "New York, NY", "Mar 2019", "May 2022", [
        "Designed identities for 20+ startups and restaurants across New York",
        "Created packaging for a beverage line that sold into 1,500 stores",
        "Produced motion assets for social campaigns in After Effects",
        "Pitched and won 6 new clients with the creative director",
      ]),
      job("Junior Designer", "Atlas Print House", "Jersey City, NJ", "Jul 2017", "Feb 2019", [
        "Prepared print files for 300+ jobs a year with zero reprints for file errors",
        "Designed seasonal catalogs and in-store signage",
        "Rebuilt the studio's file templates, cutting prepress time by 30%",
      ]),
    ],
    education: [school("Pratt Institute", "B.F.A.", "Communications Design", "2013", "2017")],
    skills: [
      { name: "Brand", skills: ["identity systems", "art direction", "packaging", "typography"] },
      { name: "Digital", skills: ["web design", "social campaigns", "motion"] },
      { name: "Tools", skills: ["Figma", "Illustrator", "Photoshop", "InDesign", "After Effects"] },
    ],
    awards: [{ title: "Studio Design Award", issuer: "Hudson Row Studio", date: "2021", description: "Beverage packaging." }],
  }),

  "michael-torres": persona({
    name: "Michael Torres",
    title: "VP of Engineering",
    location: "Charlotte, NC",
    phone: "(704) 555-0192",
    summary:
      "Engineering leader with 18 years of experience, the last 8 running teams of 40 to 120 engineers in fintech and logistics. Scaled an engineering org 3x through a Series C, cut cloud costs by 35% and led SOC 2 and PCI DSS programs from zero.",
    experience: [
      job("VP of Engineering", "Queensbridge Financial", "Charlotte, NC", "Jan 2021", "", [
        "Lead 120 engineers across 14 teams building lending and payments products",
        "Scaled the org from 40 to 120 engineers through a Series C while keeping regretted attrition under 5%",
        "Cut cloud costs by 35% ($3.1M a year) with a FinOps program and platform consolidation",
        "Led SOC 2 Type II and PCI DSS certification, unlocking 6 enterprise bank partnerships",
      ]),
      job("Director of Engineering", "Piedmont Logistics Software", "Charlotte, NC", "Mar 2016", "Dec 2020", [
        "Ran 5 teams building route optimization software used by 900 carriers",
        "Moved the company from quarterly releases to daily deploys",
        "Hired and developed 6 engineering managers, 4 of them promoted from within",
      ]),
      job("Engineering Manager", "Carolina Freight Tech", "Raleigh, NC", "Jun 2012", "Feb 2016", [
        "Managed 12 engineers building the carrier mobile app, rated 4.7 stars on 40K reviews",
        "Introduced on-call and incident review practices still in use today",
      ]),
      job("Senior Software Engineer", "Carolina Freight Tech", "Raleigh, NC", "Jul 2008", "May 2012", [
        "Built the dispatch API that processed 3M loads a year",
      ]),
    ],
    education: [
      school("University of North Carolina at Chapel Hill", "Executive MBA", "Business Administration", "2014", "2016"),
      school("North Carolina State University", "B.S.", "Computer Engineering", "2004", "2008"),
    ],
    skills: [
      { name: "Leadership", skills: ["org design", "hiring", "budget ownership", "engineering strategy"] },
      { name: "Technical", skills: ["distributed systems", "cloud architecture", "AWS", "Java", "Go"] },
      { name: "Compliance", skills: ["SOC 2", "PCI DSS", "risk management"] },
    ],
  }),

  "james-whitaker": persona({
    name: "James Whitaker",
    title: "Senior Accountant, CPA",
    location: "Boston, MA",
    phone: "(617) 555-0105",
    summary:
      "CPA with 10 years of experience in public accounting and corporate finance. Shortened month-end close from 10 days to 5, led an ASC 606 implementation and support SOX compliance for a $600M revenue business.",
    experience: [
      job("Senior Accountant", "Beacon Hill Capital Partners", "Boston, MA", "Apr 2021", "", [
        "Own month-end close for 4 entities with $600M in combined revenue, cutting close from 10 days to 5",
        "Led the ASC 606 revenue recognition review for 300 customer contracts",
        "Reconcile 120 balance sheet accounts monthly in BlackLine with zero audit adjustments in 2024",
        "Built NetSuite saved searches that replaced 12 manual Excel reports",
      ]),
      job("Staff Accountant", "Charles River Biotech", "Cambridge, MA", "Jun 2018", "Mar 2021", [
        "Managed accounts payable for 1,100 vendors and $85M in annual spend",
        "Documented and tested 40 SOX controls ahead of the company's first 404(b) audit",
        "Prepared grant accounting for $12M in NIH funding",
      ]),
      job("Audit Associate", "Whitman & Rowe LLP", "Boston, MA", "Sep 2015", "May 2018", [
        "Audited financial statements for 15 clients in manufacturing and life sciences",
        "Supervised 3 interns during busy season",
      ]),
    ],
    education: [school("Bentley University", "B.S.", "Accountancy", "2011", "2015")],
    skills: [
      { name: "Accounting", skills: ["US GAAP", "month-end close", "reconciliations", "ASC 606", "SOX"] },
      { name: "Systems", skills: ["NetSuite", "SAP", "BlackLine", "Excel (advanced)"] },
      { name: "Reporting", skills: ["financial statements", "variance analysis", "audit support"] },
    ],
    certifications: [cert("Certified Public Accountant (CPA)", "Massachusetts Board of Public Accountancy", "2017")],
  }),

  "daniel-chen": persona({
    name: "Daniel Chen",
    title: "Engagement Manager",
    location: "New York, NY",
    phone: "(212) 555-0147",
    summary:
      "Management consultant with 10 years of experience in growth strategy and operations for financial services and retail clients. Led 14 engagements that delivered $180M in identified value, and manage teams of 4 to 8 consultants.",
    experience: [
      job("Engagement Manager", "Whitlock Advisory", "New York, NY", "Sep 2022", "", [
        "Lead teams of 4–8 consultants on growth and operations work for Fortune 500 clients",
        "Delivered a pricing redesign for a national retailer worth $42M in annual margin",
        "Built a branch network model for a regional bank that closed 30 branches and saved $26M a year",
        "Sold $9M in follow-on work through client relationships",
      ]),
      job("Senior Consultant", "Whitlock Advisory", "New York, NY", "Aug 2020", "Aug 2022", [
        "Ran workstreams on 8 engagements in banking, insurance and consumer goods",
        "Redesigned claims operations for a P&C insurer, cutting cycle time by 22%",
        "Built a customer lifetime value model adopted by a client's marketing team of 60",
        "Coached 6 analysts and led campus recruiting at 2 universities",
      ]),
      job("Business Analyst", "Park & Hale Consulting", "Boston, MA", "Jul 2015", "Jun 2018", [
        "Supported due diligence on 11 private equity deals worth $2.4B",
        "Built market sizing models used in client board presentations",
        "Automated the firm's benchmarking database, saving analysts 10 hours a week",
      ]),
    ],
    education: [
      school("Columbia Business School", "MBA", "Finance and Strategy", "2018", "2020"),
      school("Cornell University", "B.A.", "Economics", "2011", "2015"),
    ],
    skills: [
      { name: "Strategy", skills: ["growth strategy", "pricing", "market sizing", "due diligence"] },
      { name: "Analysis", skills: ["financial modeling", "Excel", "SQL", "Tableau"] },
      { name: "Leadership", skills: ["client management", "team leadership", "executive presentations"] },
    ],
    certifications: [cert("Chartered Financial Analyst (CFA) Level II", "CFA Institute", "2019")],
    awards: [
      { title: "Dean's Fellow", issuer: "Columbia Business School", date: "2020", description: "Top 5% of graduating class." },
    ],
  }),

  "rachel-brooks": persona({
    name: "Rachel Brooks",
    title: "Registered Nurse, BSN",
    location: "Phoenix, AZ",
    phone: "(602) 555-0173",
    summary:
      "Emergency department registered nurse with 9 years of experience in Level I trauma and critical care. Charge nurse for a 42-bed ED seeing 90,000 visits a year. Led a triage redesign that cut door-to-provider time by 31%.",
    experience: [
      job("Charge Nurse, Emergency Department", "Saguaro Regional Medical Center", "Phoenix, AZ", "Jan 2021", "", [
        "Coordinate staffing and patient flow for a 42-bed Level I trauma ED with 90,000 annual visits",
        "Led a triage redesign that cut door-to-provider time from 38 to 26 minutes",
        "Precept new graduate nurses, with 14 of 15 retained past their first year",
        "Serve on the sepsis committee that raised bundle compliance from 71% to 89%",
      ]),
      job("Registered Nurse, ICU", "Camelback Health", "Scottsdale, AZ", "Jun 2018", "Dec 2020", [
        "Cared for 2–3 critically ill patients per shift in a 24-bed medical ICU",
        "Managed ventilated patients and titrated vasoactive drips during COVID-19 surges",
        "Trained 20 nurses on the new Epic documentation workflow",
      ]),
      job("Registered Nurse, Med/Surg", "Sonoran Community Hospital", "Tempe, AZ", "Aug 2016", "May 2018", [
        "Provided care for 5–6 patients per shift on a 32-bed medical-surgical unit",
        "Earned the unit's Daisy nomination for patient advocacy",
      ]),
    ],
    education: [school("Arizona State University", "B.S.", "Nursing", "2012", "2016")],
    skills: [
      { name: "Clinical", skills: ["triage", "trauma care", "critical care", "IV therapy", "patient assessment"] },
      { name: "Systems", skills: ["Epic", "Cerner", "Pyxis"] },
      { name: "Leadership", skills: ["charge nurse", "precepting", "quality improvement"] },
    ],
    certifications: [
      cert("Certified Emergency Nurse (CEN)", "BCEN", "2020"),
      cert("Advanced Cardiovascular Life Support (ACLS)", "American Heart Association", "2025"),
      cert("Pediatric Advanced Life Support (PALS)", "American Heart Association", "2025"),
      cert("Registered Nurse License", "Arizona State Board of Nursing", "2016"),
    ],
  }),

  "chris-walker": persona({
    name: "Chris Walker",
    title: "Regional Sales Director",
    location: "Dallas, TX",
    phone: "(214) 555-0158",
    summary:
      "Enterprise SaaS sales leader with 12 years of experience and 3 President's Club finishes. Lead a 14-person team carrying a $38M quota and grew regional bookings by 46% in two years.",
    experience: [
      job("Regional Sales Director", "Lone Star Cloud Solutions", "Dallas, TX", "Feb 2022", "", [
        "Lead 11 account executives and 3 SDRs carrying a $38M annual quota across the South Central region",
        "Grew regional bookings by 46% in two years, finishing at 112% of plan in 2024",
        "Rolled out MEDDICC qualification, raising win rate from 21% to 29%",
        "Closed the company's largest deal, a $4.2M three-year contract with a healthcare system",
        "Hired and ramped 6 account executives to full quota in under 5 months",
      ]),
      job("Enterprise Account Executive", "Bluebonnet Software", "Austin, TX", "Jan 2017", "Jan 2022", [
        "Averaged 128% of quota over five years, with President's Club in 2019 and 2021",
        "Opened 9 new Fortune 1000 logos worth $7.5M in ARR",
        "Built partner-sourced pipeline with 3 systems integrators",
        "Shortened average sales cycle from 7 to 5 months with mutual action plans",
        "Ranked in the top 3 of 40 account executives for four straight years",
      ]),
      job("Account Executive", "Trinity Office Systems", "Dallas, TX", "Jun 2013", "Dec 2016", [
        "Sold managed print and IT services to mid-market firms, reaching #1 of 24 reps in 2015",
        "Grew territory revenue from $1.1M to $2.6M in three years",
        "Built a referral program with 40 accounting firms that sourced 30% of new deals",
      ]),
    ],
    education: [school("Texas A&M University", "B.B.A.", "Marketing", "2009", "2013")],
    skills: [
      { name: "Sales", skills: ["enterprise SaaS", "MEDDICC", "forecasting", "negotiation", "pipeline management"] },
      { name: "Leadership", skills: ["coaching", "hiring", "territory planning"] },
      { name: "Tools", skills: ["Salesforce", "Gong", "Outreach", "LinkedIn Sales Navigator"] },
    ],
    awards: [
      { title: "President's Club", issuer: "Lone Star Cloud Solutions", date: "2024", description: "112% of regional plan." },
      { title: "President's Club", issuer: "Bluebonnet Software", date: "2021", description: "134% of quota." },
    ],
  }),

  "nicole-adams": persona({
    name: "Nicole Adams",
    title: "Head of Customer Success",
    location: "Nashville, TN",
    phone: "(615) 555-0139",
    summary:
      "Customer success leader with 12 years of experience in B2B SaaS. Built a 22-person CS team from scratch, raised net revenue retention from 98% to 118% and cut logo churn in half.",
    experience: [
      job("Head of Customer Success", "Cumberland HR", "Nashville, TN", "Mar 2021", "", [
        "Built the customer success, onboarding and support teams from 3 to 22 people",
        "Raised net revenue retention from 98% to 118% across 1,800 customers",
        "Cut annual logo churn from 14% to 7% with health scoring in Gainsight",
        "Launched a customer education program with 9,000 course completions",
        "Partnered with sales on renewals worth $14M a year, closing 96% on time",
      ]),
      job("Senior Customer Success Manager", "Brightline Payroll", "Nashville, TN", "Jan 2017", "Feb 2021", [
        "Managed a $6M book of 45 enterprise accounts with 97% gross retention",
        "Ran quarterly business reviews that sourced $1.3M in expansion",
        "Designed the onboarding playbook that cut time to first payroll from 45 to 21 days",
        "Led the voice-of-customer program feeding the product roadmap",
        "Mentored 4 CSMs, 2 of them promoted to senior roles",
      ]),
      job("Customer Success Manager", "Honeybee Scheduling", "Louisville, KY", "Jun 2013", "Dec 2016", [
        "Supported 200 small-business customers and kept churn under 2% a month",
        "Created the help center, deflecting 1,500 tickets a quarter",
        "Trained 5 new CSMs on product and renewal process",
      ]),
    ],
    education: [school("Belmont University", "B.B.A.", "Management", "2009", "2013")],
    skills: [
      { name: "Customer Success", skills: ["onboarding", "renewals", "expansion", "QBRs", "churn analysis"] },
      { name: "Leadership", skills: ["team building", "playbooks", "cross-functional alignment"] },
      { name: "Tools", skills: ["Gainsight", "Salesforce", "Zendesk", "Looker"] },
    ],
    certifications: [cert("Certified Customer Success Manager (CCSM)", "SuccessCOACHING", "2022")],
  }),

  "olivia-nguyen": persona({
    name: "Olivia Nguyen",
    title: "Business Analyst",
    location: "Columbus, OH",
    phone: "(614) 555-0166",
    summary:
      "Recent finance graduate with two analytics internships and hands-on experience in SQL, Power BI and financial modeling. Built a claims dashboard now used by 25 managers and won a national case competition.",
    experience: [
      job("Business Analyst Intern", "Buckeye Mutual Insurance", "Columbus, OH", "May 2025", "Aug 2025", [
        "Built a Power BI claims dashboard now used weekly by 25 regional managers",
        "Analyzed 180,000 claims in SQL to find a billing error worth $420K a year",
        "Mapped the subrogation process and proposed changes that cut handoffs from 9 to 5",
      ]),
      job("Data Analytics Intern", "Scioto Retail Group", "Columbus, OH", "May 2024", "Aug 2024", [
        "Automated a weekly inventory report in Python, saving the planning team 6 hours a week",
        "Forecast holiday demand for 300 SKUs within 4% of actual sales",
      ]),
      job("Undergraduate Research Assistant", "The Ohio State University", "Columbus, OH", "Aug 2023", "May 2025", [
        "Cleaned and analyzed survey data from 2,400 respondents for a household finance study",
        "Co-authored a working paper on student debt and early-career saving",
      ]),
    ],
    education: [school("The Ohio State University", "B.S.", "Business Administration, Finance", "2022", "2026")],
    skills: [
      { name: "Analysis", skills: ["Excel", "SQL", "Power BI", "Tableau", "Python (pandas)"] },
      { name: "Business", skills: ["financial modeling", "process mapping", "requirements gathering"] },
    ],
    certifications: [cert("Microsoft Certified: Power BI Data Analyst Associate", "Microsoft", "2025")],
    awards: [
      { title: "1st Place, National Case Competition", issuer: "Fisher College of Business", date: "2025", description: "" },
      { title: "Dean's List", issuer: "The Ohio State University", date: "2022–2026", description: "" },
    ],
  }),
};

/**
 * Which persona each template's thumbnail shows. Chosen so every category
 * page, the homepage grid, the features tabs and the hero animation show
 * different people, and no face repeats within five cards on /resumes or the
 * editor picker. Re-check those surfaces before reassigning.
 */
export const TEMPLATE_PERSONA: Record<TemplateName, PersonaSlug> = {
  classic: "michael-torres",
  "classic-serif": "rachel-brooks",
  sharp: "ryan-oconnor",
  minimal: "olivia-nguyen",
  executive: "chris-walker",
  "executive-pro": "daniel-chen",
  sidebar: "jordan-ellis",
  "sidebar-right": "kevin-park",
  "two-column": "marcus-reed",
  divide: "emily-carter",
  folio: "maya-thompson",
  metro: "aaliyah-johnson",
  harvard: "daniel-chen",
  ledger: "james-whitaker",
  aurora: "jordan-ellis",
  "electric-lilac": "maya-thompson",
  "bold-accent": "emily-carter",
  "executive-sidebar": "nicole-adams",
  "clean-sidebar": "sofia-ramirez",
  blueprint: "maya-thompson",
  wentworth: "nicole-adams",
  orchid: "rachel-brooks",
  coastal: "chris-walker",
  portrait: "sofia-ramirez",
  regent: "michael-torres",
  meridian: "ryan-oconnor",
  vantage: "aaliyah-johnson",
  linen: "daniel-chen",
  graphite: "olivia-nguyen",
  sterling: "james-whitaker",
  ember: "marcus-reed",
  canopy: "kevin-park",
};
