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
import { ClassicSerifTemplate } from "./templates/classic-serif";
import { SharpTemplate } from "./templates/sharp";
import { MinimalTemplate } from "./templates/minimal";
import { ExecutiveTemplate } from "./templates/executive";
import { ExecutiveProTemplate } from "./templates/executive-pro";
import { SidebarTemplate, SidebarRightTemplate } from "./templates/sidebar";
import { TwoColumnTemplate } from "./templates/two-column";
import { DivideTemplate } from "./templates/divide";
import { FolioTemplate } from "./templates/folio";
import { MetroTemplate } from "./templates/metro";
import { HarvardTemplate } from "./templates/harvard";
import { LedgerTemplate } from "./templates/ledger";
import { AuroraTemplate } from "./templates/aurora";
import { ElectricLilac } from "./templates/electric-lilac";
import { BoldAccent } from "./templates/bold-accent";
import { ExecutiveSidebar } from "./templates/executive-sidebar";
import { CleanSidebar } from "./templates/clean-sidebar";
import { Blueprint } from "./templates/blueprint";
import { Wentworth } from "./templates/wentworth";
import { OrchidTemplate } from "./templates/orchid";
import { Coastal } from "./templates/coastal";
import { PortraitTemplate } from "./templates/portrait";

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTH_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_MAP: Record<string, number> = {
  jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11,
  january:0,february:1,march:2,april:3,june:5,july:6,august:7,september:8,october:9,november:10,december:11,
};

function formatWithMonth(mi: number, year: string, format: DateFormat): string {
  if (format === "short") return `${MONTH_SHORT[mi]} ${year}`;
  if (format === "long") return `${MONTH_LONG[mi]} ${year}`;
  return `${String(mi + 1).padStart(2, "0")}/${year}`;
}

export function formatDate(dateStr: string, format: DateFormat): string {
  if (!dateStr) return "";
  const s = dateStr.trim();
  const lower = s.toLowerCase();
  if (lower === "present" || lower === "current") return "Present";

  // YYYY-MM
  const iso = s.match(/^(\d{4})-(\d{1,2})$/);
  if (iso) {
    const mi = parseInt(iso[2], 10) - 1;
    if (mi >= 0 && mi <= 11) return formatWithMonth(mi, iso[1], format);
    return iso[1];
  }

  // "Mon YYYY" or "Month YYYY" (e.g. "Feb 2018", "January 2020")
  const human = s.match(/^([a-zA-Z]+)\s+(\d{4})$/);
  if (human) {
    const mi = MONTH_MAP[human[1].toLowerCase()];
    if (mi !== undefined) return formatWithMonth(mi, human[2], format);
  }

  // MM/YYYY
  const slashed = s.match(/^(\d{1,2})\/(\d{4})$/);
  if (slashed) {
    const mi = parseInt(slashed[1], 10) - 1;
    if (mi >= 0 && mi <= 11) return formatWithMonth(mi, slashed[2], format);
  }

  // Plain year
  if (/^\d{4}$/.test(s)) return s;

  return s;
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

function getOrderedSections(sectionOrder: string[] | undefined): SectionKey[] {
  const ordered: SectionKey[] = [];
  const seen = new Set<string>();

  if (Array.isArray(sectionOrder)) {
    for (const key of sectionOrder) {
      if (DEFAULT_SECTION_ORDER.includes(key as SectionKey) && !seen.has(key)) {
        ordered.push(key as SectionKey);
        seen.add(key);
      }
    }
  }

  // Append any canonical sections missing from sectionOrder so newly enabled
  // sections always render even if the persisted order predates them.
  for (const key of DEFAULT_SECTION_ORDER) {
    if (!seen.has(key)) {
      ordered.push(key);
      seen.add(key);
    }
  }

  return ordered;
}

const TEMPLATE_MAP = {
  classic: ClassicTemplate,
  "classic-serif": ClassicSerifTemplate,
  sharp: SharpTemplate,
  minimal: MinimalTemplate,
  executive: ExecutiveTemplate,
  "executive-pro": ExecutiveProTemplate,
  sidebar: SidebarTemplate,
  "sidebar-right": SidebarRightTemplate,
  "two-column": TwoColumnTemplate,
  divide: DivideTemplate,
  folio: FolioTemplate,
  metro: MetroTemplate,
  harvard: HarvardTemplate,
  ledger: LedgerTemplate,
  aurora: AuroraTemplate,
  "electric-lilac": ElectricLilac,
  "bold-accent": BoldAccent,
  "executive-sidebar": ExecutiveSidebar,
  "clean-sidebar": CleanSidebar,
  blueprint: Blueprint,
  wentworth: Wentworth,
  orchid: OrchidTemplate,
  coastal: Coastal,
  portrait: PortraitTemplate,
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

  const Template = TEMPLATE_MAP[design.template] ?? ClassicTemplate;

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
