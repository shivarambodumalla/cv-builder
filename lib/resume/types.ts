export type TemplateName = "classic" | "sharp" | "minimal" | "executive" | "sidebar";
export type FontFamily = "classic" | "clean" | "elegant" | "strong";
export type AccentColor = "slate" | "teal" | "navy" | "rust" | "plum" | "deepRed" | "darkGold" | "forestGreen" | "steelBlue" | "softPurple" | "lavender" | "warmOrange" | "slateGray";
export type HeaderAlignment = "left" | "center" | "right";
export type DateFormat = "short" | "long" | "numeric";
export type BodySize = "S" | "M" | "L";
export type NameSize = "S" | "M" | "L";
export type BulletStyle = "dot" | "dash" | "arrow" | "none";
export type FontWeight = "light" | "regular" | "medium" | "bold" | "black";
export type TextCase = "as-written" | "uppercase" | "capitalize";
export type ContactSeparator = "pipe" | "dot" | "dash" | "comma" | "none";

export const CONTACT_SEPARATOR_MAP: Record<ContactSeparator, string> = {
  pipe: " | ",
  dot: " · ",
  dash: " – ",
  comma: ", ",
  none: " ",
};

export const FONT_WEIGHT_MAP: Record<FontWeight, number> = {
  light: 300,
  regular: 400,
  medium: 500,
  bold: 700,
  black: 900,
};

export const SECTION_HEADING_SIZE_PT: Record<string, number> = { S: 8, M: 9, L: 10 };
export type PaperSize = "a4" | "letter";

export interface ResumeDesignSettings {
  template: TemplateName;
  font: FontFamily;
  accentColor: AccentColor | string;
  lineSpacing: number;
  headerAlignment: HeaderAlignment;
  dateFormat: DateFormat;
  bodySize: BodySize | number;
  nameSize: NameSize | number;
  bulletStyle: BulletStyle;
  paperSize: PaperSize;
  sectionOrder: string[];
  sectionSpacing: number;
  marginX: number;
  marginY: number;
  pageBreaks: string[];
  nameWeight: FontWeight;
  sectionHeadingSize: "S" | "M" | "L" | number;
  sectionHeadingWeight: FontWeight;
  sectionHeadingCase: TextCase;
  contactSeparator: ContactSeparator;
}

export const FONT_STACKS: Record<FontFamily, string> = {
  classic: "Georgia, 'Times New Roman', serif",
  clean: "Inter, Helvetica, Arial, sans-serif",
  elegant: "Garamond, Palatino, 'Book Antiqua', serif",
  strong: "Roboto, system-ui, sans-serif",
};

export const ACCENT_COLORS: Record<AccentColor, string> = {
  slate: "#334155",
  teal: "#0D9488",
  navy: "#1E3A5F",
  rust: "#C2410C",
  plum: "#6B21A8",
  deepRed: "#9B2C2C",
  darkGold: "#B7791F",
  forestGreen: "#276749",
  steelBlue: "#2C5282",
  softPurple: "#805AD5",
  lavender: "#9F7AEA",
  warmOrange: "#DD6B20",
  slateGray: "#4A5568",
};

export const BODY_SIZE_PT: Record<string, number> = { S: 9, M: 10, L: 11 };
export const NAME_SIZE_PT: Record<string, number> = { S: 20, M: 24, L: 28 };

export const BULLET_CHARS: Record<BulletStyle, string> = {
  dot: "•",
  dash: "–",
  arrow: "→",
  none: "",
};

export const PAPER_DIMENSIONS: Record<PaperSize, { width: string; height: string }> = {
  a4: { width: "210mm", height: "297mm" },
  letter: { width: "216mm", height: "279mm" },
};

// --- Content types ---

export interface ContactSection {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
}

export interface TargetTitleSection {
  title: string;
}

export interface SummarySection {
  content: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  bullets: string[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface SkillCategory {
  name: string;
  skills: string[];
}

export interface CertificationItem {
  name: string;
  issuer: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface AwardItem {
  title: string;
  issuer: string;
  date: string;
  description: string;
}

export interface ProjectItem {
  name: string;
  url: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface VolunteeringItem {
  role: string;
  organization: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface PublicationItem {
  title: string;
  publisher: string;
  date: string;
  url: string;
}

export interface SectionVisibility {
  contact: boolean;
  targetTitle: boolean;
  summary: boolean;
  experience: boolean;
  education: boolean;
  skills: boolean;
  certifications: boolean;
  awards: boolean;
  projects: boolean;
  volunteering: boolean;
  publications: boolean;
}

export interface ResumeContent {
  sections: SectionVisibility;
  contact: ContactSection;
  targetTitle: TargetTitleSection;
  summary: SummarySection;
  experience: { items: ExperienceItem[] };
  education: { items: EducationItem[] };
  skills: { categories: SkillCategory[] };
  certifications: { items: CertificationItem[] };
  awards: { items: AwardItem[] };
  projects: { items: ProjectItem[] };
  volunteering: { items: VolunteeringItem[] };
  publications: { items: PublicationItem[] };
}

export type SectionKey = keyof Omit<ResumeContent, "sections">;
