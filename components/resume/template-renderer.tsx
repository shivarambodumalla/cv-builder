import {
  ResumeContent,
  ResumeDesignSettings,
  DateFormat,
  SectionKey,
  FONT_STACKS,
  ACCENT_COLORS,
  BODY_SIZE_PT,
  NAME_SIZE_PT,
  BULLET_CHARS,
  FONT_WEIGHT_MAP,
  SECTION_HEADING_SIZE_PT,
  CONTACT_SEPARATOR_MAP,
  type AccentColor,
  type FontWeight,
  type TextCase,
  type ContactSeparator,
} from "@/lib/resume/types";
import { ClassicTemplate } from "./templates/classic";
import { SharpTemplate } from "./templates/sharp";
import { MinimalTemplate } from "./templates/minimal";
import { ExecutiveTemplate } from "./templates/executive";
import { SidebarTemplate } from "./templates/sidebar";

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTH_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatDate(dateStr: string, format: DateFormat): string {
  if (!dateStr) return "";
  const lower = dateStr.toLowerCase();
  if (lower === "present" || lower === "current") return "Present";

  const parts = dateStr.split("-");
  const year = parts[0];
  const monthIndex = parts.length > 1 ? parseInt(parts[1], 10) - 1 : -1;

  if (monthIndex < 0 || monthIndex > 11) return year ?? dateStr;

  switch (format) {
    case "short":
      return `${MONTH_SHORT[monthIndex]} ${year}`;
    case "long":
      return `${MONTH_LONG[monthIndex]} ${year}`;
    case "numeric":
      return `${String(monthIndex + 1).padStart(2, "0")}/${year}`;
    default:
      return dateStr;
  }
}

const DEFAULT_SECTION_ORDER: SectionKey[] = [
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
];

function resolveBodySize(size: string | number): number {
  if (typeof size === "number") return size;
  return BODY_SIZE_PT[size] ?? 10;
}

function resolveNameSize(size: string | number): number {
  if (typeof size === "number") return size;
  return NAME_SIZE_PT[size] ?? 24;
}

function resolveAccentColor(color: string): string {
  if (color in ACCENT_COLORS) return ACCENT_COLORS[color as AccentColor];
  if (color.startsWith("#")) return color;
  return "#0D9488";
}

function getOrderedSections(sectionOrder: string[]): SectionKey[] {
  const ordered: SectionKey[] = [];
  const seen = new Set<string>();

  for (const key of sectionOrder) {
    if (DEFAULT_SECTION_ORDER.includes(key as SectionKey) && !seen.has(key)) {
      ordered.push(key as SectionKey);
      seen.add(key);
    }
  }

  return ordered;
}

const TEMPLATE_MAP = {
  classic: ClassicTemplate,
  sharp: SharpTemplate,
  minimal: MinimalTemplate,
  executive: ExecutiveTemplate,
  sidebar: SidebarTemplate,
} as const;

interface TemplateRendererProps {
  content: ResumeContent;
  design: ResumeDesignSettings;
}

export function TemplateRenderer({ content, design }: TemplateRendererProps) {
  const fontStack = FONT_STACKS[design.font];
  const accentHex = resolveAccentColor(design.accentColor);
  const bodySizePt = resolveBodySize(design.bodySize);
  const nameSizePt = resolveNameSize(design.nameSize);
  const bulletChar = BULLET_CHARS[design.bulletStyle];
  const orderedSections = getOrderedSections(design.sectionOrder);
  const sectionSpacing = design.sectionSpacing ?? 16;
  const marginX = design.marginX ?? 0.75;
  const marginY = design.marginY ?? 0.5;
  const pageBreaks = design.pageBreaks ?? [];
  const nameWeight = FONT_WEIGHT_MAP[design.nameWeight ?? "bold"];
  const headingSize = typeof design.sectionHeadingSize === "number"
    ? design.sectionHeadingSize
    : (SECTION_HEADING_SIZE_PT[design.sectionHeadingSize] ?? 9);
  const headingWeight = FONT_WEIGHT_MAP[(design.sectionHeadingWeight ?? "bold") as FontWeight];
  const headingCase = (design.sectionHeadingCase ?? "uppercase") as TextCase;
  const contactSep = CONTACT_SEPARATOR_MAP[(design.contactSeparator ?? "pipe") as ContactSeparator];

  const visibleSections = orderedSections.filter(
    (key) => content.sections[key as keyof typeof content.sections]
  );

  const Template = TEMPLATE_MAP[design.template];

  const cssVars: Record<string, string> = {
    "--resume-font": fontStack,
    "--resume-accent": accentHex,
    "--resume-body-size": `${bodySizePt}pt`,
    "--resume-name-size": `${nameSizePt}pt`,
    "--resume-line-spacing": String(design.lineSpacing),
    "--resume-section-spacing": `${sectionSpacing}px`,
    "--resume-margin-x": `${marginX}in`,
    "--resume-margin-y": `${marginY}in`,
    "--resume-name-weight": String(nameWeight),
    "--resume-heading-size": `${headingSize}pt`,
    "--resume-heading-weight": String(headingWeight),
    "--resume-heading-case": headingCase === "as-written" ? "none" : headingCase,
  };

  return (
    <div style={cssVars as React.CSSProperties}>
      <style>{`
        [data-resume-section-title] {
          page-break-after: avoid;
          break-after: avoid;
        }
        [data-resume-entry] {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        [data-resume-bullet] {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        [data-page-break-before] {
          page-break-before: always;
          break-before: page;
        }
        [data-resume-section] {
          orphans: 2;
          widows: 2;
        }
      `}</style>
      <Template
        content={content}
        design={design}
        formatDate={(d: string) => formatDate(d, design.dateFormat)}
        bulletChar={bulletChar}
        visibleSections={visibleSections}
        sectionSpacing={sectionSpacing}
        marginX={marginX}
        marginY={marginY}
        pageBreaks={pageBreaks}
        contactSeparator={contactSep}
      />
    </div>
  );
}
