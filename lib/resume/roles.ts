export const ROLE_TAXONOMY = {
  "Design": [
    "UX Designer", "Product Designer", "UI Designer", "Visual Designer",
    "Interaction Designer", "Motion Designer", "Service Designer",
    "UX Researcher", "Design Operations Manager", "Graphic Designer",
    "Design Manager", "Principal Designer", "Head of Design",
    "Design Lead", "Product Illustrator", "Visual Design Lead",
    "UX Strategist", "Design Technologist",
  ],
  "Engineering": [
    "Software Engineer", "Frontend Engineer", "Backend Engineer",
    "Full Stack Engineer", "Mobile Developer (Android)", "Mobile Developer (iOS)",
    "QA Engineer", "SDET", "DevOps Engineer", "Site Reliability Engineer",
    "Platform Engineer", "Cloud Engineer", "Infrastructure Engineer",
    "Systems Engineer", "Security Engineer", "Embedded Systems Engineer",
    "Firmware Engineer", "Game Developer", "Staff Software Engineer",
    "Principal Software Engineer", "Engineering Manager",
    "Release Engineer", "Build Engineer",
  ],
  "AI / Data": [
    "Data Analyst", "Data Scientist", "Data Engineer",
    "Machine Learning Engineer", "AI Engineer", "Generative AI Engineer",
    "NLP Engineer", "Computer Vision Engineer", "Deep Learning Engineer",
    "Analytics Engineer", "BI Engineer", "Data Architect",
    "Big Data Engineer", "Decision Scientist", "Statistician",
    "Prompt Engineer", "AI Solutions Architect", "Responsible AI Specialist",
    "LLM Engineer", "Analytics Manager", "Data Governance Specialist",
  ],
  "Product": [
    "Product Manager", "Senior Product Manager", "Associate Product Manager",
    "Technical Product Manager", "Growth Product Manager",
    "Platform Product Manager", "Product Operations Manager",
    "Program Manager", "Product Analyst", "Scrum Master",
    "Director of Product", "VP of Product", "Chief Product Officer",
    "Product Strategy Manager", "Product Growth Analyst",
  ],
  "Marketing": [
    "Product Marketing Manager", "Growth Marketer",
    "Digital Marketing Specialist", "Performance Marketer",
    "SEO Specialist", "SEM Specialist", "Content Marketer",
    "Social Media Manager", "Brand Manager", "Lifecycle / CRM Marketer",
    "Email Marketing Specialist", "Marketing Analyst",
    "Marketing Operations Manager", "Demand Generation Manager",
    "CRO Specialist",
  ],
  "Sales": [
    "Account Executive", "Sales Development Representative",
    "Business Development Representative", "Sales Manager",
    "Solutions Consultant", "Pre-Sales Engineer", "Partnerships Manager",
    "Revenue Operations Manager", "Key Account Manager",
    "Enterprise Account Executive", "Customer Success Operations",
    "GTM Strategy Manager", "Channel Sales Manager",
    "Customer Success Manager",
  ],
  "Operations": [
    "Project Manager", "Business Analyst", "Operations Manager",
    "Strategy & Operations Manager", "Program Operations Manager",
    "Supply Chain Analyst", "Logistics Manager",
    "Process Improvement Specialist", "Chief of Staff",
    "Strategy Consultant", "Operations Analyst",
    "Transformation Manager",
  ],
  "HR / People": [
    "HR Business Partner", "Recruiter", "Talent Acquisition Specialist",
    "People Operations Manager", "HR Operations Specialist",
    "Learning & Development Specialist", "HR Analyst",
    "People Analytics Specialist", "Employer Branding Specialist",
    "Diversity & Inclusion Specialist",
  ],
  "Finance": [
    "Financial Analyst", "Accountant", "Finance Manager",
    "Investment Analyst", "Risk Analyst", "FP&A Analyst",
    "Audit Associate", "Corporate Finance Manager",
    "Equity Research Analyst", "Credit Analyst", "Valuation Analyst",
  ],
  "Content": [
    "Technical Writer", "UX Writer", "Content Writer", "Copywriter",
    "Content Strategist", "Instructional Designer", "Editor",
    "Content Operations Manager", "Script Writer",
    "Knowledge Base Manager",
  ],
  "Mechanical": [
    "Mechanical Engineer", "Manufacturing Engineer", "Process Engineer",
    "Quality Engineer", "Industrial Engineer", "Design Engineer (Mechanical)",
    "Maintenance Engineer", "Robotics Engineer", "Electrical Engineer",
    "Tool Design Engineer", "Safety Engineer", "Environmental Engineer",
    "Process Safety Engineer", "Welding Engineer", "NDT Engineer",
  ],
  "New Age": [
    "Developer Advocate", "Community Lead", "No-Code Developer",
    "Creator / Influencer", "AI Trainer / Data Annotator",
  ],
} as const;

export type Domain = keyof typeof ROLE_TAXONOMY;

export function getAllRoles(): string[] {
  const roles: string[] = [];
  for (const domain of Object.values(ROLE_TAXONOMY)) {
    for (const role of domain) {
      if (!roles.includes(role)) roles.push(role);
    }
  }
  return roles;
}

export function getDomainForRole(role: string): string | null {
  for (const [domain, roles] of Object.entries(ROLE_TAXONOMY)) {
    if ((roles as readonly string[]).includes(role)) return domain;
  }
  // Fuzzy: check if the role text matches any known role
  const lower = role.toLowerCase();
  for (const [domain, roles] of Object.entries(ROLE_TAXONOMY)) {
    for (const r of roles) {
      if (r.toLowerCase() === lower) return domain;
    }
  }
  return null;
}

export function getRolesForDomain(domain: string): string[] {
  return [...(ROLE_TAXONOMY[domain as Domain] || [])];
}

export function getDomains(): Domain[] {
  return Object.keys(ROLE_TAXONOMY) as Domain[];
}

export const ROLE_KEYWORD_MAPPING: Record<string, string> = {
  // Design
  "user experience designer": "UX Designer", "ux design": "UX Designer", "ux/ui designer": "UX Designer", "ui/ux designer": "UX Designer",
  "product design": "Product Designer", "senior product designer": "Product Designer",
  "user interface designer": "UI Designer", "ui design": "UI Designer",
  "graphic design": "Graphic Designer", "visual communications": "Graphic Designer",
  "ixd": "Interaction Designer", "interaction design": "Interaction Designer",
  "motion design": "Motion Designer", "animation designer": "Motion Designer",
  "service design": "Service Designer",
  "user researcher": "UX Researcher", "ux research": "UX Researcher", "design researcher": "UX Researcher",
  "design ops": "Design Operations Manager", "designops": "Design Operations Manager",
  "design lead manager": "Design Manager",
  "staff designer": "Principal Designer",
  "director of design": "Head of Design", "vp design": "Head of Design",
  "lead designer": "Design Lead", "senior design lead": "Design Lead",
  "experience strategist": "UX Strategist",
  "creative technologist": "Design Technologist", "design engineer": "Design Technologist",
  // Engineering
  "swe": "Software Engineer", "software developer": "Software Engineer", "programmer": "Software Engineer",
  "frontend developer": "Frontend Engineer", "front end engineer": "Frontend Engineer", "ui engineer": "Frontend Engineer",
  "backend developer": "Backend Engineer", "back end engineer": "Backend Engineer", "server side engineer": "Backend Engineer",
  "full stack developer": "Full Stack Engineer", "fullstack engineer": "Full Stack Engineer",
  "android developer": "Mobile Developer (Android)", "android engineer": "Mobile Developer (Android)",
  "ios developer": "Mobile Developer (iOS)", "ios engineer": "Mobile Developer (iOS)", "swift developer": "Mobile Developer (iOS)",
  "quality assurance engineer": "QA Engineer", "qa analyst": "QA Engineer", "tester": "QA Engineer",
  "software development engineer in test": "SDET", "test automation engineer": "SDET",
  "devops": "DevOps Engineer", "dev ops engineer": "DevOps Engineer",
  "sre": "Site Reliability Engineer", "reliability engineer": "Site Reliability Engineer",
  "platform dev": "Platform Engineer",
  "cloud architect": "Cloud Engineer", "cloud developer": "Cloud Engineer",
  "infra engineer": "Infrastructure Engineer",
  "systems architect": "Systems Engineer",
  "cybersecurity engineer": "Security Engineer", "application security engineer": "Security Engineer", "infosec engineer": "Security Engineer",
  "embedded engineer": "Embedded Systems Engineer",
  "firmware developer": "Firmware Engineer",
  "game engineer": "Game Developer", "unity developer": "Game Developer", "unreal developer": "Game Developer",
  "staff engineer": "Staff Software Engineer", "staff swe": "Staff Software Engineer",
  "principal engineer": "Principal Software Engineer", "principal swe": "Principal Software Engineer",
  "em": "Engineering Manager", "eng manager": "Engineering Manager", "software engineering manager": "Engineering Manager",
  "release manager": "Release Engineer",
  "build systems engineer": "Build Engineer", "ci engineer": "Build Engineer",
  // AI / Data
  "analyst": "Data Analyst", "business data analyst": "Data Analyst",
  "ds": "Data Scientist", "applied scientist": "Data Scientist",
  "data pipeline engineer": "Data Engineer", "etl engineer": "Data Engineer",
  "ml engineer": "Machine Learning Engineer", "mle": "Machine Learning Engineer", "machine learning": "Machine Learning Engineer",
  "artificial intelligence engineer": "AI Engineer", "ai developer": "AI Engineer",
  "genai engineer": "Generative AI Engineer", "llm developer": "LLM Engineer", "generative ai": "Generative AI Engineer",
  "natural language processing engineer": "NLP Engineer", "nlp scientist": "NLP Engineer",
  "cv engineer": "Computer Vision Engineer", "vision engineer": "Computer Vision Engineer",
  "deep learning scientist": "Deep Learning Engineer",
  "analytics dev": "Analytics Engineer", "dbt engineer": "Analytics Engineer",
  "business intelligence engineer": "BI Engineer", "bi developer": "BI Engineer",
  "enterprise data architect": "Data Architect",
  "hadoop engineer": "Big Data Engineer", "spark engineer": "Big Data Engineer",
  "applied decision scientist": "Decision Scientist",
  "biostatistician": "Statistician", "quantitative analyst": "Statistician",
  "ai prompt specialist": "Prompt Engineer", "llm prompt engineer": "Prompt Engineer",
  "ai architect": "AI Solutions Architect", "ml architect": "AI Solutions Architect",
  "ai ethics": "Responsible AI Specialist", "trustworthy ai": "Responsible AI Specialist",
  "large language model engineer": "LLM Engineer",
  "head of analytics": "Analytics Manager", "director of analytics": "Analytics Manager",
  "data steward": "Data Governance Specialist", "data governance analyst": "Data Governance Specialist",
  // Product
  "pm": "Product Manager", "product owner": "Product Manager",
  "senior pm": "Senior Product Manager", "sr pm": "Senior Product Manager",
  "apm": "Associate Product Manager", "junior pm": "Associate Product Manager",
  "tpm": "Technical Product Manager", "technical pm": "Technical Product Manager",
  "growth pm": "Growth Product Manager", "product growth manager": "Growth Product Manager",
  "platform pm": "Platform Product Manager",
  "product ops": "Product Operations Manager", "product operations": "Product Operations Manager",
  "programme manager": "Program Manager", "pgm": "Program Manager",
  "product data analyst": "Product Analyst",
  "agile coach": "Scrum Master", "scrum coach": "Scrum Master",
  "product director": "Director of Product",
  "vice president product": "VP of Product", "vp pm": "VP of Product",
  "cpo": "Chief Product Officer", "head of product": "Chief Product Officer",
  "product strategist": "Product Strategy Manager",
  "growth analyst": "Product Growth Analyst",
  // Marketing
  "pmm": "Product Marketing Manager", "product marketer": "Product Marketing Manager",
  "growth hacker": "Growth Marketer", "growth marketing manager": "Growth Marketer",
  "digital marketer": "Digital Marketing Specialist", "online marketing specialist": "Digital Marketing Specialist",
  "performance marketing manager": "Performance Marketer", "paid marketing": "Performance Marketer",
  "seo analyst": "SEO Specialist", "search engine optimisation": "SEO Specialist",
  "paid search specialist": "SEM Specialist", "google ads specialist": "SEM Specialist",
  "content marketing manager": "Content Marketer", "content marketing specialist": "Content Marketer",
  "social media specialist": "Social Media Manager", "social media executive": "Social Media Manager",
  "brand marketing manager": "Brand Manager", "brand strategist": "Brand Manager",
  "crm manager": "Lifecycle / CRM Marketer", "retention marketer": "Lifecycle / CRM Marketer",
  "email marketer": "Email Marketing Specialist",
  "marketing data analyst": "Marketing Analyst",
  "marketing ops": "Marketing Operations Manager", "mops": "Marketing Operations Manager",
  "demand gen": "Demand Generation Manager", "pipeline marketing manager": "Demand Generation Manager",
  "conversion rate optimisation": "CRO Specialist",
  // Sales
  "ae": "Account Executive", "sales executive": "Account Executive",
  "sdr": "Sales Development Representative", "outbound sdr": "Sales Development Representative",
  "bdr": "Business Development Representative", "business development": "Business Development Representative",
  "regional sales manager": "Sales Manager", "sales team lead": "Sales Manager",
  "solutions architect sales": "Solutions Consultant", "value consultant": "Solutions Consultant",
  "sales engineer": "Pre-Sales Engineer", "presales consultant": "Pre-Sales Engineer",
  "partner manager": "Partnerships Manager", "alliances manager": "Partnerships Manager",
  "revops": "Revenue Operations Manager", "revenue ops": "Revenue Operations Manager",
  "kam": "Key Account Manager", "strategic account manager": "Key Account Manager",
  "enterprise sales": "Enterprise Account Executive", "enterprise ae": "Enterprise Account Executive",
  "cs ops": "Customer Success Operations", "customer success ops": "Customer Success Operations",
  "go to market manager": "GTM Strategy Manager", "gtm manager": "GTM Strategy Manager",
  "channel manager": "Channel Sales Manager", "partner sales manager": "Channel Sales Manager",
  "csm": "Customer Success Manager", "customer success": "Customer Success Manager",
  // Operations
  "project lead": "Project Manager",
  "ba": "Business Analyst", "business systems analyst": "Business Analyst",
  "ops manager": "Operations Manager", "head of operations": "Operations Manager",
  "strategy and ops": "Strategy & Operations Manager", "biz ops manager": "Strategy & Operations Manager",
  "program ops": "Program Operations Manager",
  "supply chain specialist": "Supply Chain Analyst", "scm analyst": "Supply Chain Analyst",
  "logistics coordinator": "Logistics Manager", "supply chain manager": "Logistics Manager",
  "process analyst": "Process Improvement Specialist", "continuous improvement specialist": "Process Improvement Specialist", "lean specialist": "Process Improvement Specialist",
  "cos": "Chief of Staff",
  "management consultant": "Strategy Consultant", "strategy advisor": "Strategy Consultant",
  "ops analyst": "Operations Analyst", "business operations analyst": "Operations Analyst",
  "change manager": "Transformation Manager", "digital transformation manager": "Transformation Manager",
  // HR
  "hrbp": "HR Business Partner", "hr partner": "HR Business Partner",
  "talent acquisition": "Recruiter", "technical recruiter": "Recruiter",
  "ta specialist": "Talent Acquisition Specialist",
  "people ops": "People Operations Manager", "hr operations manager": "People Operations Manager",
  "hr ops": "HR Operations Specialist", "hr administrator": "HR Operations Specialist",
  "l&d specialist": "Learning & Development Specialist", "training specialist": "Learning & Development Specialist",
  "people analyst": "HR Analyst", "hr data analyst": "HR Analyst",
  "workforce analytics": "People Analytics Specialist",
  "employer brand manager": "Employer Branding Specialist",
  "dei specialist": "Diversity & Inclusion Specialist", "diversity manager": "Diversity & Inclusion Specialist",
  // Finance
  "finance analyst": "Financial Analyst", "financial planning analyst": "Financial Analyst",
  "chartered accountant": "Accountant", "ca": "Accountant", "cpa": "Accountant",
  "head of finance": "Finance Manager",
  "equity analyst": "Investment Analyst", "research analyst": "Investment Analyst",
  "credit risk analyst": "Risk Analyst", "risk manager": "Risk Analyst",
  "financial planning and analysis": "FP&A Analyst", "fp and a": "FP&A Analyst",
  "auditor": "Audit Associate", "internal auditor": "Audit Associate",
  "corporate finance": "Corporate Finance Manager",
  "equity researcher": "Equity Research Analyst",
  "lending analyst": "Credit Analyst",
  "business valuation analyst": "Valuation Analyst", "dcf analyst": "Valuation Analyst",
  // Content
  "tech writer": "Technical Writer", "documentation writer": "Technical Writer",
  "ux content designer": "UX Writer", "product writer": "UX Writer",
  "blog writer": "Content Writer", "web content writer": "Content Writer",
  "advertising copywriter": "Copywriter", "copy strategist": "Copywriter",
  "content strategy manager": "Content Strategist", "head of content": "Content Strategist",
  "elearning designer": "Instructional Designer", "curriculum designer": "Instructional Designer",
  "content editor": "Editor", "managing editor": "Editor",
  "content ops": "Content Operations Manager",
  "scriptwriter": "Script Writer", "video scriptwriter": "Script Writer",
  "knowledge manager": "Knowledge Base Manager", "documentation manager": "Knowledge Base Manager",
  // Mechanical
  "mech engineer": "Mechanical Engineer",
  "production engineer": "Manufacturing Engineer", "mfg engineer": "Manufacturing Engineer",
  "chemical process engineer": "Process Engineer",
  "qe": "Quality Engineer",
  "ie": "Industrial Engineer",
  "mechanical design engineer": "Design Engineer (Mechanical)", "cad engineer": "Design Engineer (Mechanical)",
  "plant maintenance engineer": "Maintenance Engineer",
  "robotics developer": "Robotics Engineer", "automation engineer": "Robotics Engineer",
  "ee": "Electrical Engineer", "electronics engineer": "Electrical Engineer",
  "tooling engineer": "Tool Design Engineer",
  "health safety engineer": "Safety Engineer", "hse engineer": "Safety Engineer",
  "env engineer": "Environmental Engineer", "sustainability engineer": "Environmental Engineer",
  // New Age
  "devrel": "Developer Advocate", "developer relations": "Developer Advocate", "developer evangelist": "Developer Advocate",
  "community manager": "Community Lead", "community builder": "Community Lead",
  "nocode developer": "No-Code Developer", "bubble developer": "No-Code Developer", "webflow developer": "No-Code Developer",
  "content creator": "Creator / Influencer", "influencer": "Creator / Influencer", "youtuber": "Creator / Influencer",
  "data annotator": "AI Trainer / Data Annotator", "ai data trainer": "AI Trainer / Data Annotator", "rlhf trainer": "AI Trainer / Data Annotator",
};

export function resolveRole(freeText: string): string | null {
  const lower = freeText.toLowerCase().trim();

  if (ROLE_KEYWORD_MAPPING[lower]) return ROLE_KEYWORD_MAPPING[lower];

  const allRoles = getAllRoles();
  const exactMatch = allRoles.find((r) => r.toLowerCase() === lower);
  if (exactMatch) return exactMatch;

  const containsMatch = allRoles.find(
    (r) => lower.includes(r.toLowerCase()) || r.toLowerCase().includes(lower)
  );
  if (containsMatch) return containsMatch;

  const words = lower.split(/[\s,]+/).filter((w) => w.length > 2);
  for (const role of allRoles) {
    const roleLower = role.toLowerCase();
    const matchCount = words.filter((w) => roleLower.includes(w)).length;
    if (matchCount >= 2 || (words.length === 1 && matchCount === 1)) return role;
  }

  return null;
}
