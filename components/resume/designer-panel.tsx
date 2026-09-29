"use client";

import { defaultSidebarSections, templateDesignDefaults } from "@/lib/resume/defaults";
import React from "react";
import {
  AlignLeft, AlignCenter, AlignRight,
  GripVertical, ChevronLeft, ChevronRight,
  RotateCcw, ChevronDown, X as XIcon,
  UserCircle2, Palette, Type, Columns2, SlidersHorizontal, ListOrdered,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { useUpgradeModal } from "@/context/upgrade-modal-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  ResumeContent,
  ResumeDesignSettings,
  TemplateName,
  FontFamily,
  AccentColor,
  FontWeight,
  TextCase,
  ContactSeparator,
  HeaderAlignment,
  PaperSize,
  BulletStyle,
  DateFormat,
  AvatarMode,
  AvatarShape,
  AvatarPosition,
  AvatarInitialsBg,
  SectionVisibility,
  SkillsStyle,
} from "@/lib/resume/types";
import { fileToResizedDataUrl } from "@/lib/resume/avatar";
import { TemplateRenderer } from "@/components/resume/template-renderer";
import { PaperPreview } from "@/components/resume/paper-preview";
import { getPreviewContent } from "@/lib/resume/placeholder";
import { PHOTO_TEMPLATES, THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH, templateThumbnail } from "@/lib/resume/template-thumbnails";
import {
  FONT_STACKS,
  ACCENT_COLORS,
  SECTION_HEADING_SIZE_PT,
  BODY_SIZE_PT,
  NAME_SIZE_PT,
} from "@/lib/resume/types";

interface DesignerPanelProps {
  design: ResumeDesignSettings;
  onChange: (design: ResumeDesignSettings) => void;
  photoUrl?: string;
  contactName?: string;
  onPhotoChange?: (url: string | undefined) => void;
  sectionVisibility?: SectionVisibility;
  userAvatarUrl?: string | null;
  content?: ResumeContent;
}

const TEMPLATES: { name: TemplateName; label: string; desc: string }[] = [
  { name: "classic", label: "Classic", desc: "Clean single-column layout. Works for any role." },
  { name: "orchid", label: "Orchid", desc: "Editorial serif headings with a warm sidebar and navy accent corner." },
  { name: "executive-pro", label: "Executive Pro", desc: "Bold photo header and dark contact bar. Not ATS-safe." },
  { name: "aurora", label: "Aurora", desc: "Modern two-column with avatar and skill chips." },
  { name: "portrait", label: "Portrait", desc: "Editorial split-weight name with headshot, plus-marker headings, and light grey canvas." },
  { name: "regent", label: "Regent", desc: "Refined serif single-column with centred header and hairline rules." },
  { name: "meridian", label: "Meridian", desc: "Mint two-column with icon headings for startup and momentum roles." },
  { name: "vantage", label: "Vantage", desc: "Two columns with company and school logos beside every entry." },
  { name: "linen", label: "Linen", desc: "Minimalist off-white two-column with grey header blocks and diamond rules." },
  { name: "graphite", label: "Graphite", desc: "Grey canvas, white rounded card, pill section headings." },
  { name: "sterling", label: "Sterling", desc: "Plain ATS-first specialist resume with a skills table." },
  { name: "ember", label: "Ember", desc: "Plain-text two-column layout every ATS parser reads cleanly." },
  { name: "canopy", label: "Canopy", desc: "Sage header band, oversized light headings, dedicated Achievements section." },
  { name: "coastal", label: "Coastal", desc: "Teal accent header with photo and objective band. Creative two-column." },
  { name: "minimal", label: "Minimal", desc: "Maximum whitespace, distraction-free." },
  { name: "electric-lilac", label: "Electric Lilac", desc: "Vibrant sidebar with accent colour and pill chips." },
  { name: "classic-serif", label: "Classic Serif", desc: "Elegant serif typography with grey section bands." },
  { name: "sharp", label: "Sharp", desc: "Bold headers with strong visual hierarchy." },
  { name: "sidebar", label: "Slate", desc: "Two-column with left sidebar for skills." },
  { name: "wentworth", label: "Wentworth", desc: "Minimal editorial with split-weight name." },
  { name: "bold-accent", label: "Bold Accent", desc: "Accent chips and icon-bordered sections." },
  { name: "blueprint", label: "Blueprint", desc: "Editorial header block with two-column body." },
  { name: "two-column", label: "Horizon", desc: "Full-width header with two-column body." },
  { name: "clean-sidebar", label: "Clean Sidebar", desc: "Warm sidebar with skill bars and links." },
  { name: "executive", label: "Executive", desc: "Refined styling for senior professionals." },
  { name: "sidebar-right", label: "Onyx", desc: "Two-column with right sidebar layout." },
  { name: "executive-sidebar", label: "Executive Sidebar", desc: "Dark sidebar with photo for senior roles." },
  { name: "divide", label: "Divide", desc: "Split layout with a clean vertical divider." },
  { name: "folio", label: "Folio", desc: "Two-column with a tinted left panel." },
  { name: "harvard", label: "Harvard", desc: "Academic style inspired by Ivy League." },
  { name: "ledger", label: "Ledger", desc: "Structured grid layout for detail-heavy roles." },
  // { name: "metro", label: "Metro", desc: "Modern metro-inspired design." },  // hidden — redesign in progress
];

const FONTS: { name: FontFamily; label: string }[] = [
  { name: "classic", label: "Classic" },
  { name: "clean", label: "Clean" },
  { name: "elegant", label: "Elegant" },
  { name: "strong", label: "Strong" },
];

const ACCENT_PRESETS: { key: AccentColor; hex: string }[] = Object.entries(ACCENT_COLORS).map(
  ([key, hex]) => ({ key: key as AccentColor, hex })
);

const DATE_FORMAT_LABELS: { value: DateFormat; label: string }[] = [
  { value: "short", label: "Jan 2024" },
  { value: "long", label: "January 2024" },
  { value: "numeric", label: "01/2024" },
];

const BULLET_OPTIONS: { value: BulletStyle; label: string }[] = [
  { value: "dot", label: "•" },
  { value: "dash", label: "–" },
  { value: "arrow", label: "→" },
  { value: "none", label: "none" },
];

const SECTION_LABELS: Record<string, string> = {
  contact: "Contact",
  targetTitle: "Target Title",
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  certifications: "Certifications",
  awards: "Awards",
  projects: "Projects",
  volunteering: "Volunteering",
  publications: "Publications",
};

function resolveAccentHex(color: string): string {
  if (color in ACCENT_COLORS) return ACCENT_COLORS[color as AccentColor];
  if (color.startsWith("#")) return color;
  return "#0D9488";
}

function SectionGroup({
  title,
  hint,
  icon: Icon,
  children,
  bare,
}: {
  title: string;
  hint?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  bare?: boolean;
}) {
  // `bare` lets the caller render its own container (e.g. the Selected-template
  // hero uses its own styled card and doesn't want to nest inside ours).
  if (bare) {
    return <section>{children}</section>;
  }
  return (
    <section className="rounded-xl border border-border/60 bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex items-center gap-2.5">
        {Icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
            <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] font-semibold leading-tight tracking-tight text-foreground">
            {title}
          </h3>
          {hint && (
            <p className="mt-1 text-[11px] leading-tight text-muted-foreground">{hint}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-foreground/80">{label}</span>
      {children}
    </div>
  );
}

function StackedRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1.5 block text-xs text-foreground/80">{label}</span>
      {children}
    </div>
  );
}

function SizeInput({
  value,
  min,
  max,
  step,
  defaultValue,
  unit,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  const isDefault = Math.abs(value - defaultValue) < 1e-6;
  return (
    <div className="flex items-center gap-1">
      <div className="relative">
        <Input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          className="h-8 w-[84px] pr-7 text-right tabular-nums"
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!Number.isNaN(v) && v >= min && v <= max) onChange(v);
          }}
        />
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
          {unit}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onChange(defaultValue)}
        disabled={isDefault}
        aria-label="Reset to default"
        title={`Reset to ${defaultValue}${unit}`}
        className="rounded p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function SliderRow({
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={cn(
          "h-1 flex-1 cursor-pointer appearance-none rounded-full bg-foreground/15 accent-primary",
          "[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary",
          "[&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary"
        )}
      />
      <span className="w-14 text-right text-xs font-medium tabular-nums text-muted-foreground">
        {suffix}
      </span>
    </div>
  );
}

function SelectField<T extends string>({
  value,
  options,
  onChange,
  width = "w-[116px]",
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  width?: string;
}) {
  return (
    <div className={cn("relative", width)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-8 w-full appearance-none rounded-md border border-input bg-background pl-2.5 pr-7 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function SortableItem({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm"
    >
      <GripVertical
        className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground"
        {...attributes}
        {...listeners}
      />
      <span>{SECTION_LABELS[id] ?? id}</span>
    </div>
  );
}

function ColumnItem({ id, direction, onMove }: { id: string; direction: "toMain" | "toSidebar"; onMove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition };
  const Arrow = direction === "toMain" ? ChevronRight : ChevronLeft;

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1 rounded-md border bg-background px-2 py-1.5 text-xs">
      <GripVertical className="h-3 w-3 shrink-0 cursor-grab text-muted-foreground" {...attributes} {...listeners} />
      <span className="flex-1 truncate">{SECTION_LABELS[id] ?? id}</span>
      <button type="button" onClick={(e) => { e.stopPropagation(); onMove(); }} className="shrink-0 rounded p-0.5 hover:bg-muted" title={direction === "toMain" ? "Move to main" : "Move to sidebar"}>
        <Arrow className="h-3 w-3 text-muted-foreground" />
      </button>
    </div>
  );
}

export function DesignerPanel({ design, onChange, photoUrl, contactName, onPhotoChange, sectionVisibility, userAvatarUrl, content }: DesignerPanelProps) {
  const isEnabled = (key: string) =>
    sectionVisibility ? sectionVisibility[key as keyof SectionVisibility] !== false : true;
  function update<K extends keyof ResumeDesignSettings>(
    key: K,
    value: ResumeDesignSettings[K]
  ) {
    onChange({ ...design, [key]: value });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = design.sectionOrder.indexOf(active.id as string);
      const newIndex = design.sectionOrder.indexOf(over.id as string);
      update("sectionOrder", arrayMove(design.sectionOrder, oldIndex, newIndex));
    }
  }

  const activeBodyPt =
    typeof design.bodySize === "string" ? BODY_SIZE_PT[design.bodySize] : design.bodySize;
  const activeNamePt =
    typeof design.nameSize === "string" ? NAME_SIZE_PT[design.nameSize] : design.nameSize;

  const currentHex = resolveAccentHex(design.accentColor);

  const isSidebar = design.template === "sidebar" || design.template === "sidebar-right";
  const isColumnBased = design.template === "two-column" || design.template === "divide" || design.template === "folio" || design.template === "aurora" || design.template === "executive-pro" || design.template === "electric-lilac" || design.template === "executive-sidebar" || design.template === "clean-sidebar" || design.template === "blueprint" || design.template === "coastal" || design.template === "orchid" || design.template === "portrait" || design.template === "meridian" || design.template === "vantage" || design.template === "linen" || design.template === "ember";
  const isTwoCol = isSidebar || isColumnBased;
  const supportsAvatar = PHOTO_TEMPLATES.has(design.template);

  // Per-template capability gates — only show a control when the template
  // actually honors the setting. Keeps the UI "honest" so users don't tweak
  // options that have no visual effect.
  const CONTACT_SEPARATOR_TEMPLATES = new Set<string>([
    "classic", "classic-serif", "sharp", "minimal", "executive",
    "sidebar", "sidebar-right", "blueprint", "wentworth", "orchid", "regent", "graphite", "sterling", "canopy",
  ]);
  const HEADER_ALIGNMENT_TEMPLATES = new Set<string>([
    "classic", "classic-serif", "sharp", "minimal", "executive",
    "executive-pro", "blueprint", "wentworth", "orchid", "regent", "graphite", "vantage", "linen", "sterling", "ember", "canopy",
  ]);
  // Templates that read design.avatarPosition. Sidebar layouts stack the
  // avatar above the name, so left/right has no meaning there.
  const AVATAR_POSITION_TEMPLATES = new Set<string>([
    "aurora", "blueprint", "bold-accent", "coastal", "executive-pro", "wentworth",
  ]);
  const supportsContactSeparator = CONTACT_SEPARATOR_TEMPLATES.has(design.template);
  const supportsAvatarPosition = AVATAR_POSITION_TEMPLATES.has(design.template);
  const supportsHeaderAlignment = HEADER_ALIGNMENT_TEMPLATES.has(design.template);
  const [avatarError, setAvatarError] = React.useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = React.useState(false);

  // Template tiers are admin-configurable (/admin/plans). The CV's current
  // template is never locked, so a grandfathered design stays re-selectable.
  const { openUpgradeModal } = useUpgradeModal();
  const [lockedSlugs, setLockedSlugs] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/templates/catalog")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setLockedSlugs(
          new Set(
            (data.templates as { slug: string; locked: boolean }[])
              .filter((t) => t.locked)
              .map((t) => t.slug)
          )
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const isTemplateLocked = React.useCallback(
    (slug: string) => slug !== design.template && lockedSlugs.has(slug),
    [lockedSlugs, design.template]
  );
  const avatarMode: AvatarMode = design.avatarMode ?? "initials";
  const avatarShape: AvatarShape = design.avatarShape ?? "circle";
  const avatarSize = design.avatarSize ?? 84;
  const avatarPosition: AvatarPosition = design.avatarPosition ?? "right";
  const avatarInitialsBg: AvatarInitialsBg = design.avatarInitialsBg ?? "accent";

  async function handleAvatarFile(file: File) {
    setAvatarError(null);
    setAvatarBusy(true);
    try {
      const result = await fileToResizedDataUrl(file);
      if (!result.ok) {
        setAvatarError(result.error);
        return;
      }
      onPhotoChange?.(result.dataUrl);
      if ((design.avatarMode ?? "initials") !== "photo") {
        onChange({ ...design, avatarMode: "photo" });
      }
    } catch {
      setAvatarError("Could not process image.");
    } finally {
      setAvatarBusy(false);
    }
  }

  function handleAvatarModeChange(newMode: AvatarMode) {
    // When switching to Photo with no uploaded photo, seed from the user's
    // account avatar so the template immediately renders something sensible.
    // The user can still Replace or Remove.
    if (newMode === "photo" && !photoUrl && userAvatarUrl) {
      onPhotoChange?.(userAvatarUrl);
    }
    update("avatarMode", newMode);
  }


  // Per-template fixed-header keys + right-column defaults. Must mirror the
  // corresponding template component so the designer panel never hides a
  // section the template is actually willing to render.
  const HEADER_KEYS_BY_TEMPLATE: Record<string, string[]> = {
    "two-column": ["contact", "targetTitle", "summary"],
    aurora: ["contact", "targetTitle"],
    "electric-lilac": ["contact", "targetTitle", "summary"],
    "executive-pro": ["contact", "targetTitle", "summary"],
    blueprint: ["contact", "targetTitle"],
    coastal: ["contact", "targetTitle", "summary"],
    portrait: ["contact", "targetTitle", "summary"],
    meridian: ["contact", "targetTitle"],
    vantage: ["contact", "targetTitle"],
    linen: ["contact", "targetTitle"],
    ember: ["contact", "targetTitle"],
  };

  const PINNED_IDENTITY_TEMPLATES = new Set<string>(["electric-lilac", "executive-sidebar", "clean-sidebar", "orchid", "meridian", "linen"]);
  const headerOnTopLayout = design.template === "two-column" || design.template === "aurora" || design.template === "executive-pro" || design.template === "blueprint" || design.template === "coastal" || design.template === "portrait" || design.template === "vantage" || design.template === "ember";
  const headerKeysArr = HEADER_KEYS_BY_TEMPLATE[design.template] ?? ["contact", "targetTitle"];
  const headerSet = new Set(headerKeysArr);
  const secondarySections = design.sidebarSections ?? defaultSidebarSections(design.template);
  const secondarySet = new Set(secondarySections);

  let displayLeft: string[] = [], displayRight: string[] = [];
  let labelLeft = "", labelRight = "";

  if (isSidebar || design.template === "divide" || design.template === "folio" || design.template === "electric-lilac" || design.template === "executive-sidebar" || design.template === "clean-sidebar" || design.template === "orchid" || design.template === "meridian" || design.template === "linen") {
    // sidebarSections = left column sections. Templates that pin the identity
    // block (name, title, contact) to the sidebar never render those keys in
    // the other column, so they are not offered as movable.
    const pinnedIdentity = PINNED_IDENTITY_TEMPLATES.has(design.template);
    displayLeft = secondarySections.filter((k) => isEnabled(k) && !(pinnedIdentity && headerSet.has(k)));
    displayRight = design.sectionOrder.filter((k) => !secondarySet.has(k) && isEnabled(k) && !(pinnedIdentity && headerSet.has(k)));
    labelLeft = isSidebar ? "Sidebar" : "Left";
    labelRight = isSidebar ? "Main" : "Right";
  } else if (headerOnTopLayout) {
    // sidebarSections = right column sections; contact/targetTitle (+summary for
    // templates that pin it to the header) stay in the fixed header.
    displayLeft = design.sectionOrder.filter((k) => !secondarySet.has(k) && !headerSet.has(k) && isEnabled(k));
    displayRight = secondarySections.filter((k) => !headerSet.has(k) && isEnabled(k));
    labelLeft = "Left";
    labelRight = "Right";
  }

  // For sidebar/divide/folio: sidebarSections IS the left column, so "left→right" = remove from it
  // For horizon: sidebarSections IS the right column, so "left→right" = add to it
  const leftIsSecondary = isSidebar || design.template === "divide" || design.template === "folio" || design.template === "electric-lilac" || design.template === "executive-sidebar" || design.template === "clean-sidebar" || design.template === "orchid";

  function moveLeftToRight(id: string) {
    if (leftIsSecondary) {
      onChange({ ...design, sidebarSections: secondarySections.filter((k) => k !== id) });
    } else {
      onChange({ ...design, sidebarSections: [...secondarySections, id] });
    }
  }

  function moveRightToLeft(id: string) {
    if (leftIsSecondary) {
      onChange({ ...design, sidebarSections: [...secondarySections, id] });
    } else {
      onChange({ ...design, sidebarSections: secondarySections.filter((k) => k !== id) });
    }
  }

  function handleLeftColDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      if (leftIsSecondary) {
        const oldIdx = secondarySections.indexOf(active.id as string);
        const newIdx = secondarySections.indexOf(over.id as string);
        onChange({ ...design, sidebarSections: arrayMove(secondarySections, oldIdx, newIdx) });
      } else {
        const oldIdx = design.sectionOrder.indexOf(active.id as string);
        const newIdx = design.sectionOrder.indexOf(over.id as string);
        update("sectionOrder", arrayMove(design.sectionOrder, oldIdx, newIdx));
      }
    }
  }

  function handleRightColDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      if (leftIsSecondary) {
        const oldIdx = design.sectionOrder.indexOf(active.id as string);
        const newIdx = design.sectionOrder.indexOf(over.id as string);
        update("sectionOrder", arrayMove(design.sectionOrder, oldIdx, newIdx));
      } else {
        const oldIdx = secondarySections.indexOf(active.id as string);
        const newIdx = secondarySections.indexOf(over.id as string);
        onChange({ ...design, sidebarSections: arrayMove(secondarySections, oldIdx, newIdx) });
      }
    }
  }

  const currentBodyPt = activeBodyPt;
  const currentNamePt = activeNamePt;
  const currentHeadingPt =
    typeof design.sectionHeadingSize === "number"
      ? design.sectionHeadingSize
      : SECTION_HEADING_SIZE_PT[design.sectionHeadingSize ?? "M"] ?? 9;

  const currentTemplate = TEMPLATES.find((t) => t.name === design.template) ?? TEMPLATES[0];
  const [templateDialogOpen, setTemplateDialogOpen] = React.useState(false);
  const [stagedTemplate, setStagedTemplate] = React.useState<TemplateName | null>(null);
  const [mobileModalView, setMobileModalView] = React.useState<"browse" | "preview">("browse");

  React.useEffect(() => {
    if (templateDialogOpen) {
      setStagedTemplate(null);
      setMobileModalView("browse");
    }
  }, [templateDialogOpen, design.template]);

  const stagedTemplateMeta = TEMPLATES.find((t) => t.name === (stagedTemplate ?? design.template)) ?? TEMPLATES[0];

  function renderTemplateThumb(name: TemplateName, className?: string) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={templateThumbnail(name).src}
        alt=""
        className={cn("h-full w-full", className)}
        style={{ objectFit: "cover", objectPosition: "top" }}
      />
    );
  }

  return (
    <div className="space-y-6">

      {/* Selected template — 2-col hero: top-80% image on the left, bold name + description + change CTA on the right */}
      <SectionGroup title="Selected template" bare>
        <div className="rounded-xl border border-border/60 bg-card p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex gap-3.5">
            {/* Left: top 80% of the template image (aspect 210 × 238 out of 297) */}
            <div
              className="shrink-0 overflow-hidden rounded-md bg-background ring-1 ring-border/60 shadow-[0_4px_12px_-6px_rgba(15,23,42,0.18)]"
              style={{ width: 120, aspectRatio: "210/238" }}
            >
              {renderTemplateThumb(currentTemplate.name)}
            </div>

            {/* Right: active pill, name, description, change CTA */}
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
                  Active
                </p>
              </div>
              <h4 className="mt-1 text-lg font-bold leading-tight tracking-tight">
                {currentTemplate.label}
              </h4>
              <p className="mt-1 line-clamp-3 text-[11px] leading-snug text-muted-foreground">
                {currentTemplate.desc}
              </p>
              <button
                type="button"
                onClick={() => setTemplateDialogOpen(true)}
                className="mt-auto inline-flex w-fit items-center gap-1 self-start text-[11px] font-medium text-primary underline-offset-4 hover:underline"
              >
                Change template
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
          <DialogContent className="flex h-screen max-h-screen w-screen max-w-none flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:rounded-none">
            <DialogHeader className="shrink-0 border-b px-4 py-3 sm:px-6 sm:py-4">
              <DialogTitle className="text-base">Pick a template</DialogTitle>
              <DialogDescription className="sr-only">
                Browse and preview resume templates, then apply your selection.
              </DialogDescription>
            </DialogHeader>

            {/* Mobile tab toggle (hidden ≥ lg where we show side-by-side) */}
            <div className="flex shrink-0 border-b lg:hidden">
              {([
                { id: "browse" as const, label: "Browse" },
                { id: "preview" as const, label: "Preview" },
              ]).map((tab) => {
                const active = mobileModalView === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setMobileModalView(tab.id)}
                    className={cn(
                      "flex-1 border-b-2 px-3 py-2.5 text-[13px] font-medium transition-colors",
                      active
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.label}
                    {tab.id === "preview" && stagedTemplate !== null && stagedTemplate !== design.template && (
                      <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
              {/* Left 40%: browsable grid (or full-width on mobile Browse tab) */}
              <div
                className={cn(
                  "min-h-0 w-full overflow-y-auto overscroll-contain p-4 sm:p-5",
                  "lg:w-2/5 lg:border-r lg:block",
                  mobileModalView === "browse" ? "block flex-1" : "hidden lg:block"
                )}
              >
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {TEMPLATES.map((t) => {
                    const staged = stagedTemplate !== null && stagedTemplate === t.name;
                    const applied = design.template === t.name;
                    return (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => setStagedTemplate(t.name)}
                        className={cn(
                          "group relative overflow-hidden rounded-md border bg-background text-left transition-all active:scale-[0.98] lg:hover:border-foreground/30",
                          staged && "border-primary ring-2 ring-primary"
                        )}
                      >
                        <div style={{ aspectRatio: "210/240" }}>
                          {renderTemplateThumb(t.name)}
                        </div>
                        {!applied && isTemplateLocked(t.name) && (
                          <span className="absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-[#1E3A5F] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">
                            <Lock className="h-2 w-2" />
                            Pro
                          </span>
                        )}
                        {applied && (
                          <span className="absolute right-1.5 top-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary-foreground">
                            Current
                          </span>
                        )}
                        <p className="truncate px-2 py-1.5 text-[11px] font-medium">{t.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right 60%: live CV preview (or full-width on mobile Preview tab) */}
              <div
                className={cn(
                  "min-h-0 w-full flex-col bg-muted/40 lg:flex lg:w-3/5",
                  mobileModalView === "preview" ? "flex flex-1" : "hidden lg:flex"
                )}
              >
                <div className="shrink-0 border-b bg-background/70 px-4 py-2.5 backdrop-blur sm:px-5">
                  <h4 className="text-sm font-semibold">{stagedTemplateMeta.label}</h4>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground sm:line-clamp-1">
                    {stagedTemplateMeta.desc}
                  </p>
                </div>
                <div className="min-h-0 flex-1 overflow-auto overscroll-contain p-4 sm:p-5">
                  {content ? (
                    <PaperPreview
                      paperSize={design.paperSize}
                      manualBreaks={[]}
                      onRemoveManualBreak={() => {}}
                    >
                      <TemplateRenderer
                        content={getPreviewContent(content)}
                        design={{ ...design, template: stagedTemplate ?? design.template }}
                      />
                    </PaperPreview>
                  ) : (
                    <div className="mx-auto flex h-full max-w-[360px] items-center justify-center">
                      <div
                        className="w-full overflow-hidden rounded-md border bg-background shadow-sm"
                        style={{ aspectRatio: `${THUMBNAIL_WIDTH}/${THUMBNAIL_HEIGHT}` }}
                      >
                        {renderTemplateThumb(stagedTemplate ?? design.template)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2 border-t bg-background px-4 py-3 sm:px-6">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-4"
                onClick={() => setTemplateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-9 px-4"
                disabled={stagedTemplate === null || stagedTemplate === design.template}
                onClick={() => {
                  if (stagedTemplate && isTemplateLocked(stagedTemplate)) {
                    setTemplateDialogOpen(false);
                    openUpgradeModal("template_locked");
                    return;
                  }
                  // A new template brings its own column split.
                  onChange({
                    ...design,
                    template: stagedTemplate!,
                    sidebarSections: defaultSidebarSections(stagedTemplate!),
                    ...templateDesignDefaults(stagedTemplate!),
                  });
                  setTemplateDialogOpen(false);
                }}
              >
                {stagedTemplate && isTemplateLocked(stagedTemplate) ? (
                  <>
                    <Lock className="mr-1.5 h-3.5 w-3.5" />
                    Unlock with Pro
                  </>
                ) : (
                  "Apply template"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </SectionGroup>

      {/* Avatar — compact single-row upload, dropdowns for mode/shape/position */}
      {supportsAvatar && (
        <SectionGroup title="Avatar" hint="Photo or initials next to your name" icon={UserCircle2}>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden border bg-muted text-xs text-muted-foreground"
                style={{
                  borderRadius:
                    avatarShape === "circle" ? "50%" : avatarShape === "rounded" ? 10 : 2,
                }}
              >
                {avatarMode === "photo" && photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt="Avatar preview" className="h-full w-full object-cover" />
                ) : avatarMode === "initials" && contactName ? (
                  <span className="text-sm font-semibold text-foreground">
                    {(contactName.match(/\S+/g) ?? []).map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                ) : (
                  <span>–</span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <SelectField<AvatarMode>
                  value={avatarMode}
                  width="w-full"
                  options={[
                    { value: "photo", label: "Show photo" },
                    { value: "initials", label: "Show initials" },
                    { value: "off", label: "Hide avatar" },
                  ]}
                  onChange={handleAvatarModeChange}
                />
                {avatarMode === "photo" && (
                  <div className="flex items-center gap-1">
                    <label className="inline-flex h-7 cursor-pointer items-center justify-center rounded-md border bg-background px-2.5 text-[11px] font-medium hover:bg-muted">
                      {avatarBusy ? "Processing…" : photoUrl ? "Replace" : "Upload"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={avatarBusy}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAvatarFile(file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {userAvatarUrl && photoUrl !== userAvatarUrl && (
                      <button
                        type="button"
                        onClick={() => onPhotoChange?.(userAvatarUrl)}
                        className="text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                      >
                        Use profile
                      </button>
                    )}
                    {photoUrl && (
                      <button
                        type="button"
                        onClick={() => onPhotoChange?.(undefined)}
                        aria-label="Remove photo"
                        className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"
                      >
                        <XIcon className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            {avatarMode === "photo" && avatarError && (
              <p className="text-xs text-destructive">{avatarError}</p>
            )}

            {avatarMode !== "off" && (
              <div className="space-y-2.5">
                <FieldRow label="Shape">
                  <div className="flex gap-1">
                    {([
                      { value: "circle" as AvatarShape, label: "Circle" },
                      { value: "rounded" as AvatarShape, label: "Rounded" },
                      { value: "square" as AvatarShape, label: "Square" },
                    ]).map(({ value, label }) => (
                      <Button
                        key={value}
                        variant={avatarShape === value ? "default" : "outline"}
                        size="sm"
                        className="h-8 px-2.5 text-[11px]"
                        onClick={() => update("avatarShape", value)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </FieldRow>

                {avatarMode === "initials" && (
                  <FieldRow label="Initials bg">
                    <SelectField<AvatarInitialsBg>
                      value={avatarInitialsBg}
                      options={[
                        { value: "accent", label: "Accent" },
                        { value: "white", label: "White" },
                      ]}
                      onChange={(v) => update("avatarInitialsBg", v)}
                    />
                  </FieldRow>
                )}

                <StackedRow label="Size">
                  <SliderRow
                    value={avatarSize}
                    min={56}
                    max={200}
                    step={2}
                    suffix={`${avatarSize}px`}
                    onChange={(v) => update("avatarSize", Math.round(v))}
                  />
                </StackedRow>

                {supportsAvatarPosition && (
                  <FieldRow label="Position">
                    <div className="flex gap-1">
                      {([
                        { value: "left" as AvatarPosition, label: "Left" },
                        { value: "right" as AvatarPosition, label: "Right" },
                      ]).map(({ value, label }) => (
                        <Button
                          key={value}
                          variant={avatarPosition === value ? "default" : "outline"}
                          size="sm"
                          className="h-8 px-3 text-[11px]"
                          onClick={() => update("avatarPosition", value)}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </FieldRow>
                )}
              </div>
            )}
          </div>
        </SectionGroup>
      )}

      {/* Accent Colour */}
      <SectionGroup title="Accent colour" hint="Used on headings, bullets, and highlights" icon={Palette}>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {ACCENT_PRESETS.map(({ key, hex }) => {
              const selected = currentHex === hex;
              return (
                <button
                  key={key}
                  type="button"
                  className={cn(
                    "h-7 w-7 shrink-0 rounded-full transition-all",
                    selected && "ring-2 ring-primary ring-offset-1"
                  )}
                  style={{ backgroundColor: hex }}
                  title={key}
                  onClick={() => update("accentColor", hex)}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={currentHex}
              onChange={(e) => update("accentColor", e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border border-input bg-transparent p-0.5"
              aria-label="Custom accent colour"
            />
            <Input
              value={currentHex}
              onChange={(e) => {
                const v = e.target.value;
                if (/^#[0-9a-fA-F]{0,6}$/.test(v)) {
                  update("accentColor", v);
                }
              }}
              className="h-8 w-28 font-mono text-xs"
              placeholder="#000000"
            />
          </div>
        </div>
      </SectionGroup>

      {/* Typography — font, sizes, weights, case, line spacing as a single compact group */}
      <SectionGroup title="Typography" hint="Font family, sizes, and weights" icon={Type}>
        <div className="space-y-3">
          <StackedRow label="Font">
            <div className="grid grid-cols-4 gap-1.5">
              {FONTS.map((f) => {
                const selected = design.font === f.name;
                return (
                  <button
                    key={f.name}
                    type="button"
                    className={cn(
                      "relative rounded-md border py-2 text-center transition-all hover:border-foreground/30",
                      selected && "border-primary ring-2 ring-primary"
                    )}
                    onClick={() => update("font", f.name)}
                  >
                    <span className="block text-base leading-none" style={{ fontFamily: FONT_STACKS[f.name] }}>
                      Aa
                    </span>
                    <span className="mt-1 block text-[10px] font-medium">{f.label}</span>
                  </button>
                );
              })}
            </div>
          </StackedRow>

          <FieldRow label="Body size">
            <SizeInput
              value={currentBodyPt}
              min={8}
              max={14}
              step={0.5}
              defaultValue={10}
              unit="pt"
              onChange={(v) => {
                const matched = Object.entries(BODY_SIZE_PT).find(([, pt]) => pt === v);
                update("bodySize", matched ? (matched[0] as "S" | "M" | "L") : v);
              }}
            />
          </FieldRow>

          <FieldRow label="Name size">
            <SizeInput
              value={currentNamePt}
              min={16}
              max={36}
              step={0.5}
              defaultValue={24}
              unit="pt"
              onChange={(v) => {
                const matched = Object.entries(NAME_SIZE_PT).find(([, pt]) => pt === v);
                update("nameSize", matched ? (matched[0] as "S" | "M" | "L") : v);
              }}
            />
          </FieldRow>

          <FieldRow label="Name weight">
            <SelectField<FontWeight>
              value={design.nameWeight ?? "bold"}
              options={[
                { value: "light", label: "Light" },
                { value: "regular", label: "Regular" },
                { value: "medium", label: "Medium" },
                { value: "bold", label: "Bold" },
                { value: "black", label: "Black" },
              ]}
              onChange={(v) => update("nameWeight", v)}
            />
          </FieldRow>

          <FieldRow label="Heading size">
            <SizeInput
              value={currentHeadingPt}
              min={7}
              max={14}
              step={0.5}
              defaultValue={9}
              unit="pt"
              onChange={(v) => {
                const matched = Object.entries(SECTION_HEADING_SIZE_PT).find(([, pt]) => pt === v);
                update("sectionHeadingSize", matched ? (matched[0] as "S" | "M" | "L") : v);
              }}
            />
          </FieldRow>

          <FieldRow label="Heading weight">
            <SelectField<FontWeight>
              value={design.sectionHeadingWeight ?? "bold"}
              options={[
                { value: "light", label: "Light" },
                { value: "regular", label: "Regular" },
                { value: "medium", label: "Medium" },
                { value: "bold", label: "Bold" },
                { value: "black", label: "Black" },
              ]}
              onChange={(v) => update("sectionHeadingWeight", v)}
            />
          </FieldRow>

          <FieldRow label="Heading case">
            <SelectField<TextCase>
              value={design.sectionHeadingCase ?? "uppercase"}
              options={[
                { value: "as-written", label: "As written" },
                { value: "uppercase", label: "UPPERCASE" },
                { value: "capitalize", label: "Title Case" },
              ]}
              onChange={(v) => update("sectionHeadingCase", v)}
            />
          </FieldRow>

          <StackedRow label="Line spacing">
            <SliderRow
              value={design.lineSpacing}
              min={1.0}
              max={2.0}
              step={0.1}
              suffix={design.lineSpacing.toFixed(1)}
              onChange={(v) => update("lineSpacing", v)}
            />
          </StackedRow>
        </div>
      </SectionGroup>

      {/* Layout */}
      <SectionGroup title="Layout" hint="Paper, spacing, and margins" icon={Columns2}>
        <div className="space-y-3">
          {supportsHeaderAlignment && (
            <FieldRow label="Header">
              <div className="flex gap-1">
                {([
                  { value: "left" as HeaderAlignment, icon: AlignLeft },
                  { value: "center" as HeaderAlignment, icon: AlignCenter },
                  { value: "right" as HeaderAlignment, icon: AlignRight },
                ]).map(({ value, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={design.headerAlignment === value ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 px-0"
                    onClick={() => update("headerAlignment", value)}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </Button>
                ))}
              </div>
            </FieldRow>
          )}

          <FieldRow label="Paper">
            <div className="flex gap-1">
              {([
                { value: "a4" as PaperSize, label: "A4" },
                { value: "letter" as PaperSize, label: "Letter" },
              ]).map(({ value, label }) => (
                <Button
                  key={value}
                  variant={design.paperSize === value ? "default" : "outline"}
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() => update("paperSize", value)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </FieldRow>

          <StackedRow label="Section spacing">
            <SliderRow
              value={design.sectionSpacing ?? 16}
              min={8}
              max={32}
              step={1}
              suffix={`${design.sectionSpacing ?? 16}px`}
              onChange={(v) => update("sectionSpacing", Math.round(v))}
            />
          </StackedRow>

          {!isSidebar && design.template !== "clean-sidebar" && design.template !== "electric-lilac" && (
            <>
              <StackedRow label="Horizontal margin">
                <SliderRow
                  value={design.marginX ?? 0.75}
                  min={0.3}
                  max={1.0}
                  step={0.05}
                  suffix={`${(design.marginX ?? 0.75).toFixed(2)}in`}
                  onChange={(v) => update("marginX", v)}
                />
              </StackedRow>
              <StackedRow label="Vertical margin">
                <SliderRow
                  value={design.marginY ?? 0.5}
                  min={0.3}
                  max={1.0}
                  step={0.05}
                  suffix={`${(design.marginY ?? 0.5).toFixed(2)}in`}
                  onChange={(v) => update("marginY", v)}
                />
              </StackedRow>
            </>
          )}
        </div>
      </SectionGroup>

      {/* Details */}
      <SectionGroup title="Details" hint="Bullets, dates, and separators" icon={SlidersHorizontal}>
        <div className="space-y-3">
          <FieldRow label="Bullet">
            <div className="flex gap-1">
              {BULLET_OPTIONS.map(({ value, label }) => (
                <Button
                  key={value}
                  variant={design.bulletStyle === value ? "default" : "outline"}
                  size="sm"
                  className="h-8 min-w-8 px-2 text-xs"
                  onClick={() => update("bulletStyle", value)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </FieldRow>

          <FieldRow label="Skills style">
            <div className="flex gap-1 flex-wrap">
              {([ ["inline", "List"], ["chips", "Chips"], ["bullets", "Bullets"], ["grouped", "Grouped"] ] as [SkillsStyle, string][]).map(([value, label]) => (
                <Button
                  key={value}
                  variant={(design.skillsStyle ?? "inline") === value ? "default" : "outline"}
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => update("skillsStyle", value)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </FieldRow>

          <FieldRow label="Date format">
            <SelectField<DateFormat>
              value={design.dateFormat}
              options={DATE_FORMAT_LABELS}
              onChange={(v) => update("dateFormat", v)}
            />
          </FieldRow>

          {supportsContactSeparator && (
            <FieldRow label="Separator">
              <SelectField<ContactSeparator>
                value={design.contactSeparator ?? "pipe"}
                options={[
                  { value: "pipe", label: "Pipe  |" },
                  { value: "dot", label: "Dot  ·" },
                  { value: "dash", label: "Dash  –" },
                  { value: "comma", label: "Comma  ," },
                  { value: "none", label: "None" },
                ]}
                onChange={(v) => update("contactSeparator", v)}
              />
            </FieldRow>
          )}
        </div>
      </SectionGroup>

      {/* Section Order */}
      <SectionGroup title="Section order" hint="Drag to reorder sections on the resume" icon={ListOrdered}>
        {isTwoCol ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{labelLeft}</span>
              <DndContext id="left-col-reorder" collisionDetection={closestCenter} onDragEnd={handleLeftColDragEnd}>
                <SortableContext items={displayLeft} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-1">
                    {displayLeft.map((id) => (
                      <ColumnItem key={id} id={id} direction="toMain" onMove={() => moveLeftToRight(id)} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
            <div>
              <span className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{labelRight}</span>
              <DndContext id="right-col-reorder" collisionDetection={closestCenter} onDragEnd={handleRightColDragEnd}>
                <SortableContext items={displayRight} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-1">
                    {displayRight.map((id) => (
                      <ColumnItem key={id} id={id} direction="toSidebar" onMove={() => moveRightToLeft(id)} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={design.sectionOrder.filter((id) => isEnabled(id))}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-1.5">
                {design.sectionOrder.filter((id) => isEnabled(id)).map((id) => (
                  <SortableItem key={id} id={id} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </SectionGroup>

    </div>
  );
}
