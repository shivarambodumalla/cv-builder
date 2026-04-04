export const ROLE_TAXONOMY = {
  "Design": [
    "UX Designer", "UI Designer", "Product Designer",
    "Interaction Designer", "Visual Designer",
    "Motion Designer", "Graphic Designer", "Brand Designer",
    "Design Lead", "Senior Designer", "Principal Designer",
    "Head of Design", "Design Director", "VP of Design",
    "Design Manager", "Design Researcher", "UX Researcher",
    "Service Designer", "Design Systems Designer",
    "Accessibility Designer",
  ],
  "Engineering": [
    "Frontend Engineer", "Backend Engineer",
    "Full Stack Engineer", "Mobile Engineer iOS",
    "Mobile Engineer Android", "React Native Engineer",
    "DevOps Engineer", "Site Reliability Engineer",
    "Platform Engineer", "Infrastructure Engineer",
    "Cloud Engineer", "Security Engineer", "QA Engineer",
    "Test Automation Engineer", "Embedded Systems Engineer",
    "Firmware Engineer", "Game Developer", "AR/VR Developer",
    "Blockchain Developer", "ML Engineer",
  ],
  "Product": [
    "Product Manager", "Senior Product Manager",
    "Principal Product Manager", "Group Product Manager",
    "Director of Product", "VP of Product",
    "Head of Product", "Product Owner",
    "Technical Product Manager", "Growth Product Manager",
    "Platform Product Manager",
  ],
  "Data": [
    "Data Analyst", "Senior Data Analyst",
    "Data Scientist", "Senior Data Scientist",
    "ML Engineer", "AI Engineer", "Data Engineer",
    "Analytics Engineer", "Business Intelligence Analyst",
    "Research Scientist", "Computer Vision Engineer",
    "NLP Engineer",
  ],
  "Marketing": [
    "Growth Marketer", "Performance Marketer",
    "Content Marketer", "SEO Specialist", "SEM Specialist",
    "Email Marketer", "Social Media Manager",
    "Brand Manager", "Product Marketing Manager",
    "Demand Generation Manager", "Marketing Analyst",
    "Content Strategist", "Copywriter",
    "Marketing Director", "VP Marketing", "CMO",
  ],
  "Sales": [
    "Sales Development Rep", "Account Executive",
    "Senior Account Executive", "Enterprise AE",
    "Sales Manager", "Sales Director", "VP Sales",
    "Customer Success Manager", "Account Manager",
    "Business Development Manager", "Partnerships Manager",
    "Revenue Operations",
  ],
  "Operations": [
    "Project Manager", "Program Manager",
    "Operations Manager", "Chief of Staff",
    "Business Analyst", "Strategy Analyst",
    "Management Consultant", "Scrum Master",
    "Agile Coach", "Office Manager", "Executive Assistant",
  ],
  "Finance": [
    "Financial Analyst", "Senior Financial Analyst",
    "FP&A Analyst", "Investment Analyst",
    "Private Equity Analyst", "VC Analyst",
    "Risk Analyst", "Compliance Analyst",
    "Finance Manager", "CFO",
  ],
  "HR & People": [
    "HR Generalist", "HR Business Partner",
    "Talent Acquisition", "Recruiter",
    "Technical Recruiter", "People Operations",
    "Compensation Analyst", "L&D Specialist",
    "HR Director", "Chief People Officer",
  ],
  "Customer Support": [
    "Support Specialist", "Customer Success",
    "Technical Support", "Support Lead",
    "Support Manager", "Community Manager",
  ],
  "Content & Writing": [
    "Technical Writer", "Content Writer",
    "UX Writer", "Journalist", "Editor",
    "Scriptwriter", "Grant Writer",
  ],
  "Legal & Compliance": [
    "Legal Counsel", "Contract Manager",
    "Compliance Officer", "Privacy Analyst",
  ],
  "Research": [
    "UX Researcher", "Market Researcher",
    "Research Analyst", "Academic Researcher",
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
  return null;
}

export function getRolesForDomain(domain: string): string[] {
  return [...(ROLE_TAXONOMY[domain as Domain] || [])];
}

export function getDomains(): Domain[] {
  return Object.keys(ROLE_TAXONOMY) as Domain[];
}

export const ROLE_KEYWORD_MAPPING: Record<string, string> = {
  "principal designer": "Design Manager",
  "design lead": "Design Lead",
  "ux lead": "Design Lead",
  "product design lead": "Design Lead",
  "head of design": "Head of Design",
  "senior designer": "Senior Designer",
  "junior designer": "UX Designer",
  "ux/ui designer": "UX Designer",
  "ui/ux designer": "UX Designer",
  "web designer": "Visual Designer",
  "senior ux designer": "UX Designer",
  "lead designer": "Design Lead",
  "design director": "Design Director",
  "vp design": "VP of Design",
  "senior product designer": "Product Designer",
  "staff designer": "Principal Designer",
  "senior frontend developer": "Frontend Engineer",
  "frontend developer": "Frontend Engineer",
  "backend developer": "Backend Engineer",
  "full stack developer": "Full Stack Engineer",
  "software developer": "Full Stack Engineer",
  "software engineer": "Full Stack Engineer",
  "senior software engineer": "Full Stack Engineer",
  "senior product manager": "Senior Product Manager",
  "project manager": "Project Manager",
  "program manager": "Program Manager",
  "data analyst": "Data Analyst",
  "senior data analyst": "Senior Data Analyst",
  "marketing manager": "Product Marketing Manager",
  "content writer": "Content Writer",
  "technical writer": "Technical Writer",
  "hr manager": "HR Business Partner",
  "recruiter": "Recruiter",
  "account executive": "Account Executive",
  "customer success manager": "Customer Success Manager",
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
