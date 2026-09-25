import type { ResumeDesignSettings, ResumeContent } from "./types";

export const DEFAULT_DESIGN: ResumeDesignSettings = {
  template: "classic",
  font: "clean",
  accentColor: "#0D9488",
  lineSpacing: 1.4,
  headerAlignment: "left",
  dateFormat: "short",
  bodySize: "M",
  nameSize: "M",
  bulletStyle: "dot",
  paperSize: "a4",
  sectionOrder: [
    "contact",
    "targetTitle",
    "summary",
    "experience",
    "education",
    "skills",
    "certifications",
    "awards",
    "projects",
    "volunteering",
    "publications",
  ],
  sectionSpacing: 16,
  marginX: 0.75,
  marginY: 0.5,
  pageBreaks: [],
  nameWeight: "bold",
  sectionHeadingSize: "M",
  sectionHeadingWeight: "bold",
  sectionHeadingCase: "uppercase",
  contactSeparator: "pipe",
  sidebarSections: ["contact", "targetTitle", "skills", "education", "certifications"],
  avatarMode: "initials",
  avatarShape: "circle",
  avatarSize: 84,
  avatarPosition: "right",
  avatarInitialsBg: "accent",
  skillsStyle: "inline",
};

export const DEFAULT_CONTENT: ResumeContent = {
  sections: {
    contact: true,
    targetTitle: true,
    summary: true,
    experience: true,
    education: true,
    skills: true,
    certifications: true,
    awards: false,
    projects: false,
    volunteering: false,
    publications: false,
  },
  contact: { name: "", email: "", phone: "", location: "", linkedin: "", website: "" },
  targetTitle: { title: "" },
  summary: { content: "" },
  experience: { items: [] },
  education: { items: [] },
  skills: { categories: [] },
  certifications: { items: [] },
  awards: { items: [] },
  projects: { items: [] },
  volunteering: { items: [] },
  publications: { items: [] },
};

/**
 * Countries where Letter (8.5 × 11 in) is the working paper size. Everyone
 * else, including the UK, India and the Gulf, prints on A4. Used only to pick
 * the default for a *new* CV — the designer panel still lets anyone switch.
 */
const LETTER_COUNTRIES = new Set(["US", "CA", "MX"]);

export function paperSizeForCountry(
  countryCode: string | null | undefined
): ResumeDesignSettings["paperSize"] {
  return countryCode && LETTER_COUNTRIES.has(countryCode.toUpperCase()) ? "letter" : "a4";
}

/**
 * Default secondary-column sections per two-column template. For sidebar
 * layouts (sidebar, sidebar-right, divide, folio, electric-lilac,
 * executive-sidebar, clean-sidebar, orchid) this is the LEFT column; for
 * header-on-top layouts (two-column, aurora, executive-pro, blueprint,
 * coastal, portrait) it is the RIGHT column. The other column follows
 * sectionOrder. Must mirror each template's own fallback constant.
 */
export const COLUMN_DEFAULTS_BY_TEMPLATE: Record<string, string[]> = {
  sidebar: ["contact", "targetTitle", "skills", "education", "certifications"],
  "sidebar-right": ["contact", "targetTitle", "skills", "education", "certifications"],
  divide: ["contact", "targetTitle", "skills", "education", "certifications"],
  folio: ["contact", "targetTitle", "skills", "education", "certifications"],
  "executive-sidebar": ["contact", "targetTitle", "skills", "education", "certifications"],
  "clean-sidebar": ["contact", "targetTitle", "skills", "education", "certifications"],
  "electric-lilac": ["education", "skills"],
  orchid: ["contact", "targetTitle", "skills", "summary"],
  "two-column": ["education", "certifications", "skills"],
  aurora: ["skills", "education", "certifications"],
  "executive-pro": ["skills", "awards", "certifications", "publications"],
  blueprint: ["summary", "skills", "experience", "projects", "awards", "publications"],
  coastal: ["skills", "awards", "certifications"],
  portrait: ["skills", "certifications", "awards"],
};

export function defaultSidebarSections(template: string): string[] {
  return COLUMN_DEFAULTS_BY_TEMPLATE[template] ?? DEFAULT_DESIGN.sidebarSections!;
}
