"use client";

import React from "react";
import {
  AlignLeft, AlignCenter, AlignRight,
  GripVertical, ChevronLeft, ChevronRight,
  RotateCcw, ChevronDown, X as XIcon,
  UserCircle2, Palette, Type, Columns2, SlidersHorizontal, ListOrdered,
  type LucideIcon,
} from "lucide-react";
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
} from "@/lib/resume/types";
import { fileToResizedDataUrl } from "@/lib/resume/avatar";
import { TemplateRenderer } from "@/components/resume/template-renderer";
import { PaperPreview } from "@/components/resume/paper-preview";
import { getPreviewContent } from "@/lib/resume/placeholder";
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
  { name: "executive-pro", label: "Executive Pro", desc: "Bold photo header and dark contact bar. Pro (not ATS-safe)." },
  { name: "aurora", label: "Aurora", desc: "Modern two-column with avatar and skill chips." },
  { name: "sharp", label: "Sharp", desc: "Bold headers with strong visual hierarchy." },
  { name: "coastal", label: "Coastal", desc: "Teal accent header with photo and objective band. Creative two-column." },
  { name: "minimal", label: "Minimal", desc: "Maximum whitespace, distraction-free." },
  { name: "electric-lilac", label: "Electric Lilac", desc: "Vibrant sidebar with accent colour and pill chips." },
  { name: "classic-serif", label: "Classic Serif", desc: "Elegant serif typography with grey section bands." },
  { name: "portrait", label: "Portrait", desc: "Editorial split-weight name with headshot, plus-marker headings, and light grey canvas." },
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

function TemplatePreview({ template }: { template: TemplateName }) {
  switch (template) {
    case "classic":
      return (
        <div className="flex h-full flex-col gap-1 p-1.5">
          <div className="h-2 w-3/4 rounded-sm bg-slate-400" />
          <div className="h-1 w-1/2 rounded-sm bg-slate-300" />
          <div className="mt-1 h-[1px] w-full bg-slate-300" />
          <div className="flex flex-1 flex-col gap-0.5">
            <div className="h-1 w-full rounded-sm bg-slate-200" />
            <div className="h-1 w-5/6 rounded-sm bg-slate-200" />
            <div className="h-1 w-full rounded-sm bg-slate-200" />
          </div>
        </div>
      );
    case "classic-serif":
      return (
        <div className="flex h-full flex-col gap-1.5 p-2">
          <div className="mx-auto h-2 w-2/3 rounded-sm bg-slate-600" />
          <div className="mx-auto h-1 w-1/2 rounded-sm bg-slate-400" />
          <div className="mx-auto h-[1px] w-3/4 bg-slate-300" />
          <div className="mt-1 h-2 w-full rounded-sm bg-slate-200" />
          <div className="flex flex-col gap-0.5">
            <div className="h-1 w-full rounded-sm bg-slate-300" />
            <div className="h-1 w-5/6 rounded-sm bg-slate-300" />
          </div>
          <div className="h-2 w-full rounded-sm bg-slate-200" />
          <div className="flex flex-col gap-0.5">
            <div className="h-1 w-full rounded-sm bg-slate-300" />
            <div className="h-1 w-4/5 rounded-sm bg-slate-300" />
          </div>
        </div>
      );
    case "sharp":
      return (
        <div className="flex h-full flex-col gap-1 p-1.5">
          <div className="h-3 w-full bg-slate-700" />
          <div className="flex flex-1 flex-col gap-0.5">
            <div className="h-1 w-full rounded-sm bg-slate-200" />
            <div className="h-1 w-4/5 rounded-sm bg-slate-200" />
            <div className="h-1 w-full rounded-sm bg-slate-200" />
            <div className="h-1 w-3/4 rounded-sm bg-slate-200" />
          </div>
        </div>
      );
    case "minimal":
      return (
        <div className="flex h-full flex-col gap-1.5 p-2">
          <div className="h-1.5 w-2/3 rounded-sm bg-slate-300" />
          <div className="flex flex-1 flex-col gap-1">
            <div className="h-0.5 w-full bg-slate-200" />
            <div className="h-0.5 w-full bg-slate-200" />
            <div className="h-0.5 w-3/4 bg-slate-200" />
          </div>
        </div>
      );
    case "executive":
      return (
        <div className="flex h-full flex-col gap-1 p-1.5">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-slate-400" />
            <div className="flex flex-1 flex-col gap-0.5">
              <div className="h-1.5 w-3/4 rounded-sm bg-slate-500" />
              <div className="h-1 w-1/2 rounded-sm bg-slate-300" />
            </div>
          </div>
          <div className="h-[1px] w-full bg-slate-300" />
          <div className="flex flex-1 flex-col gap-0.5">
            <div className="h-1 w-full rounded-sm bg-slate-200" />
            <div className="h-1 w-5/6 rounded-sm bg-slate-200" />
          </div>
        </div>
      );
    case "sidebar":
      return (
        <svg viewBox="0 0 120 170" className="h-full w-full"><rect width="120" height="170" fill="white"/>
          <rect width="40" height="170" fill="#065F46"/>
          <rect x="6" y="10" width="28" height="4" rx="1" fill="white"/><rect x="6" y="16" width="20" height="2" rx="1" fill="white" opacity="0.6"/>
          <rect x="6" y="22" width="28" height="1.5" rx="1" fill="white" opacity="0.4"/><rect x="6" y="25" width="28" height="1.5" rx="1" fill="white" opacity="0.4"/>
          <rect x="6" y="34" width="18" height="2.5" rx="1" fill="white" opacity="0.8"/><rect x="6" y="39" width="28" height="1.5" rx="1" fill="white" opacity="0.3"/><rect x="6" y="42" width="25" height="1.5" rx="1" fill="white" opacity="0.3"/>
          <rect x="6" y="55" width="18" height="2.5" rx="1" fill="white" opacity="0.8"/><rect x="6" y="60" width="28" height="1.5" rx="1" fill="white" opacity="0.3"/><rect x="6" y="63" width="22" height="1.5" rx="1" fill="white" opacity="0.3"/>
          <rect x="48" y="10" width="30" height="3" rx="1" fill="#065F46"/><rect x="48" y="16" width="60" height="2" rx="1" fill="#F3F4F6"/><rect x="48" y="20" width="55" height="2" rx="1" fill="#F3F4F6"/>
          <rect x="48" y="32" width="30" height="3" rx="1" fill="#065F46"/><rect x="48" y="38" width="40" height="2.5" rx="1" fill="#555"/>
          <rect x="50" y="43" width="58" height="2" rx="1" fill="#F3F4F6"/><rect x="50" y="47" width="50" height="2" rx="1" fill="#F3F4F6"/><rect x="50" y="51" width="55" height="2" rx="1" fill="#F3F4F6"/>
          <rect x="48" y="58" width="35" height="2.5" rx="1" fill="#555"/><rect x="50" y="63" width="58" height="2" rx="1" fill="#F3F4F6"/><rect x="50" y="67" width="45" height="2" rx="1" fill="#F3F4F6"/>
          <rect x="48" y="76" width="30" height="3" rx="1" fill="#065F46"/><rect x="48" y="82" width="55" height="2" rx="1" fill="#F3F4F6"/>
        </svg>
      );
    case "sidebar-right":
      return (
        <svg viewBox="0 0 120 170" className="h-full w-full"><rect width="120" height="170" fill="white"/>
          <rect x="80" width="40" height="170" fill="#065F46"/>
          <rect x="10" y="10" width="30" height="3" rx="1" fill="#065F46"/><rect x="10" y="16" width="60" height="2" rx="1" fill="#F3F4F6"/><rect x="10" y="20" width="55" height="2" rx="1" fill="#F3F4F6"/>
          <rect x="10" y="32" width="30" height="3" rx="1" fill="#065F46"/><rect x="10" y="38" width="40" height="2.5" rx="1" fill="#555"/>
          <rect x="12" y="43" width="58" height="2" rx="1" fill="#F3F4F6"/><rect x="12" y="47" width="50" height="2" rx="1" fill="#F3F4F6"/><rect x="12" y="51" width="55" height="2" rx="1" fill="#F3F4F6"/>
          <rect x="10" y="58" width="35" height="2.5" rx="1" fill="#555"/><rect x="12" y="63" width="58" height="2" rx="1" fill="#F3F4F6"/><rect x="12" y="67" width="45" height="2" rx="1" fill="#F3F4F6"/>
          <rect x="10" y="76" width="30" height="3" rx="1" fill="#065F46"/><rect x="10" y="82" width="55" height="2" rx="1" fill="#F3F4F6"/>
          <rect x="86" y="10" width="28" height="4" rx="1" fill="white"/><rect x="86" y="16" width="20" height="2" rx="1" fill="white" opacity="0.6"/>
          <rect x="86" y="22" width="28" height="1.5" rx="1" fill="white" opacity="0.4"/><rect x="86" y="25" width="28" height="1.5" rx="1" fill="white" opacity="0.4"/>
          <rect x="86" y="34" width="18" height="2.5" rx="1" fill="white" opacity="0.8"/><rect x="86" y="39" width="28" height="1.5" rx="1" fill="white" opacity="0.3"/><rect x="86" y="42" width="25" height="1.5" rx="1" fill="white" opacity="0.3"/>
          <rect x="86" y="55" width="18" height="2.5" rx="1" fill="white" opacity="0.8"/><rect x="86" y="60" width="28" height="1.5" rx="1" fill="white" opacity="0.3"/><rect x="86" y="63" width="22" height="1.5" rx="1" fill="white" opacity="0.3"/>
        </svg>
      );
    case "two-column":
      return (
        <svg viewBox="0 0 120 170" className="h-full w-full">
          <rect width="120" height="170" fill="white"/>
          <rect width="120" height="32" fill="#E6F4F3"/>
          <rect x="8" y="6" width="35" height="5" rx="1" fill="#111827"/>
          <rect x="8" y="13" width="22" height="2" rx="1" fill="#0D9488"/>
          <rect x="8" y="18" width="50" height="1.5" rx="1" fill="#999" opacity="0.5"/>
          <rect x="8" y="21" width="45" height="1.5" rx="1" fill="#999" opacity="0.5"/>
          <rect x="8" y="24" width="40" height="1.5" rx="1" fill="#999" opacity="0.5"/>
          <rect x="80" y="7" width="12" height="1.5" rx="1" fill="#888" opacity="0.5"/>
          <rect x="80" y="10" width="30" height="2" rx="1" fill="#0D9488"/>
          <rect x="80" y="15" width="12" height="1.5" rx="1" fill="#888" opacity="0.5"/>
          <rect x="80" y="18" width="28" height="2" rx="1" fill="#0D9488"/>
          <rect x="80" y="23" width="12" height="1.5" rx="1" fill="#888" opacity="0.5"/>
          <rect x="80" y="26" width="25" height="2" rx="1" fill="#0D9488"/>
          <rect x="8" y="40" width="28" height="2.5" rx="1" fill="#0D9488"/>
          <rect x="8" y="46" width="40" height="2" rx="1" fill="#555"/>
          <rect x="8" y="50" width="55" height="1.5" rx="1" fill="#F3F4F6"/>
          <rect x="8" y="53" width="50" height="1.5" rx="1" fill="#F3F4F6"/>
          <rect x="8" y="56" width="52" height="1.5" rx="1" fill="#F3F4F6"/>
          <rect x="8" y="62" width="38" height="2" rx="1" fill="#555"/>
          <rect x="8" y="66" width="55" height="1.5" rx="1" fill="#F3F4F6"/>
          <rect x="8" y="69" width="48" height="1.5" rx="1" fill="#F3F4F6"/>
          <rect x="80" y="40" width="28" height="2.5" rx="1" fill="#0D9488"/>
          <rect x="80" y="46" width="32" height="2" rx="1" fill="#111827"/>
          <rect x="80" y="50" width="28" height="1.5" rx="1" fill="#777"/>
          <rect x="80" y="53" width="22" height="1.5" rx="1" fill="#999"/>
          <rect x="80" y="60" width="32" height="2" rx="1" fill="#111827"/>
          <rect x="80" y="64" width="28" height="1.5" rx="1" fill="#777"/>
          <rect x="80" y="67" width="22" height="1.5" rx="1" fill="#999"/>
          <rect x="80" y="76" width="20" height="2.5" rx="1" fill="#0D9488"/>
          <rect x="80" y="82" width="35" height="1.5" rx="1" fill="#444"/>
          <rect x="80" y="85" width="32" height="1.5" rx="1" fill="#444"/>
        </svg>
      );
    case "divide":
      return (
        <svg viewBox="0 0 120 170" className="h-full w-full">
          <rect width="120" height="170" fill="white"/>
          <rect width="45" height="170" fill="white"/>
          <line x1="45" y1="0" x2="45" y2="170" stroke="#E2E8F0" strokeWidth="0.8"/>
          <rect x="6" y="10" width="28" height="5" rx="1" fill="#0F172A"/>
          <rect x="6" y="16" width="28" height="5" rx="1" fill="#0F172A"/>
          <rect x="6" y="24" width="24" height="2" rx="1" fill="#334155"/>
          <rect x="6" y="34" width="20" height="2" rx="1" fill="#1E3A5F"/>
          <rect x="6" y="38" width="1.5" height="1.5" rx="0.75" fill="#1E3A5F"/><rect x="10" y="38" width="28" height="1.5" rx="1" fill="#475569"/>
          <rect x="6" y="42" width="1.5" height="1.5" rx="0.75" fill="#1E3A5F"/><rect x="10" y="42" width="25" height="1.5" rx="1" fill="#475569"/>
          <rect x="6" y="46" width="1.5" height="1.5" rx="0.75" fill="#1E3A5F"/><rect x="10" y="46" width="22" height="1.5" rx="1" fill="#475569"/>
          <rect x="6" y="56" width="18" height="2" rx="1" fill="#1E3A5F"/>
          <rect x="6" y="60" width="2" height="1.5" rx="1" fill="#1E3A5F"/><rect x="10" y="60" width="24" height="1.5" rx="1" fill="#475569"/>
          <rect x="6" y="64" width="2" height="1.5" rx="1" fill="#1E3A5F"/><rect x="10" y="64" width="20" height="1.5" rx="1" fill="#475569"/>
          <rect x="6" y="68" width="2" height="1.5" rx="1" fill="#1E3A5F"/><rect x="10" y="68" width="26" height="1.5" rx="1" fill="#475569"/>
          <rect x="52" y="10" width="22" height="2" rx="1" fill="#1E3A5F"/>
          <rect x="52" y="15" width="60" height="1.5" rx="1" fill="#F3F4F6"/>
          <rect x="52" y="18" width="55" height="1.5" rx="1" fill="#F3F4F6"/>
          <rect x="52" y="28" width="28" height="2" rx="1" fill="#1E3A5F"/>
          <rect x="52" y="33" width="18" height="1.5" rx="1" fill="#64748B"/>
          <rect x="52" y="37" width="40" height="2" rx="1" fill="#0F172A"/>
          <rect x="52" y="41" width="30" height="1.5" rx="1" fill="#64748B"/>
          <rect x="54" y="45" width="58" height="1.5" rx="1" fill="#F3F4F6"/>
          <rect x="54" y="48" width="50" height="1.5" rx="1" fill="#F3F4F6"/>
          <rect x="54" y="51" width="55" height="1.5" rx="1" fill="#F3F4F6"/>
          <rect x="52" y="57" width="18" height="1.5" rx="1" fill="#64748B"/>
          <rect x="52" y="61" width="38" height="2" rx="1" fill="#0F172A"/>
          <rect x="52" y="65" width="28" height="1.5" rx="1" fill="#64748B"/>
          <rect x="54" y="69" width="58" height="1.5" rx="1" fill="#F3F4F6"/>
          <rect x="54" y="72" width="45" height="1.5" rx="1" fill="#F3F4F6"/>
        </svg>
      );
    case "folio":
      return (
        <svg viewBox="0 0 120 170" className="h-full w-full">
          <rect width="120" height="170" fill="white"/>
          <rect width="45" height="170" fill="#F1F5F9"/>
          <rect x="6" y="10" width="28" height="5" rx="1" fill="#0F172A"/>
          <rect x="6" y="16" width="28" height="5" rx="1" fill="#0F172A"/>
          <rect x="6" y="24" width="24" height="2" rx="1" fill="#334155"/>
          <rect x="6" y="34" width="20" height="2" rx="1" fill="#1E3A5F"/>
          <rect x="6" y="38" width="1.5" height="1.5" rx="0.75" fill="#1E3A5F"/><rect x="10" y="38" width="28" height="1.5" rx="1" fill="#475569"/>
          <rect x="6" y="42" width="1.5" height="1.5" rx="0.75" fill="#1E3A5F"/><rect x="10" y="42" width="25" height="1.5" rx="1" fill="#475569"/>
          <rect x="6" y="46" width="1.5" height="1.5" rx="0.75" fill="#1E3A5F"/><rect x="10" y="46" width="22" height="1.5" rx="1" fill="#475569"/>
          <rect x="6" y="56" width="18" height="2" rx="1" fill="#1E3A5F"/>
          <rect x="6" y="60" width="2" height="1.5" rx="1" fill="#1E3A5F"/><rect x="10" y="60" width="24" height="1.5" rx="1" fill="#475569"/>
          <rect x="6" y="64" width="2" height="1.5" rx="1" fill="#1E3A5F"/><rect x="10" y="64" width="20" height="1.5" rx="1" fill="#475569"/>
          <rect x="6" y="68" width="2" height="1.5" rx="1" fill="#1E3A5F"/><rect x="10" y="68" width="26" height="1.5" rx="1" fill="#475569"/>
          <rect x="52" y="10" width="22" height="2" rx="1" fill="#1E3A5F"/>
          <rect x="52" y="15" width="60" height="1.5" rx="1" fill="#E2E8F0"/>
          <rect x="52" y="18" width="55" height="1.5" rx="1" fill="#E2E8F0"/>
          <rect x="52" y="28" width="28" height="2" rx="1" fill="#1E3A5F"/>
          <rect x="52" y="33" width="18" height="1.5" rx="1" fill="#64748B"/>
          <rect x="52" y="37" width="40" height="2" rx="1" fill="#0F172A"/>
          <rect x="52" y="41" width="30" height="1.5" rx="1" fill="#64748B"/>
          <rect x="54" y="45" width="58" height="1.5" rx="1" fill="#E2E8F0"/>
          <rect x="54" y="48" width="50" height="1.5" rx="1" fill="#E2E8F0"/>
          <rect x="54" y="51" width="55" height="1.5" rx="1" fill="#E2E8F0"/>
          <rect x="52" y="57" width="18" height="1.5" rx="1" fill="#64748B"/>
          <rect x="52" y="61" width="38" height="2" rx="1" fill="#0F172A"/>
          <rect x="52" y="65" width="28" height="1.5" rx="1" fill="#64748B"/>
          <rect x="54" y="69" width="58" height="1.5" rx="1" fill="#E2E8F0"/>
          <rect x="54" y="72" width="45" height="1.5" rx="1" fill="#E2E8F0"/>
        </svg>
      );
    case "metro":
      return (
        <svg viewBox="0 0 120 170" className="h-full w-full">
          <rect width="120" height="170" fill="white"/>
          {/* Target title */}
          <rect x="8" y="8" width="30" height="2" rx="1" fill="#2563EB"/>
          {/* Name */}
          <rect x="8" y="12" width="50" height="6" rx="1" fill="#0F172A"/>
          {/* Contact dots */}
          <circle cx="12" cy="24" r="2" fill="none" stroke="#2563EB" strokeWidth="0.8"/>
          <rect x="16" y="23" width="30" height="1.5" rx="1" fill="#374151"/>
          <circle cx="12" cy="29" r="2" fill="none" stroke="#2563EB" strokeWidth="0.8"/>
          <rect x="16" y="28" width="25" height="1.5" rx="1" fill="#374151"/>
          <circle cx="12" cy="34" r="2" fill="none" stroke="#2563EB" strokeWidth="0.8"/>
          <rect x="16" y="33" width="28" height="1.5" rx="1" fill="#374151"/>
          {/* Rule */}
          <rect x="8" y="40" width="104" height="0.5" fill="#E2E8F0"/>
          {/* Two-column: Profile + Skills */}
          <rect x="8" y="44" width="18" height="2" rx="1" fill="#111"/>
          <rect x="8" y="48" width="55" height="1.5" rx="1" fill="#D1D5DB"/>
          <rect x="8" y="51" width="50" height="1.5" rx="1" fill="#D1D5DB"/>
          <rect x="8" y="54" width="48" height="1.5" rx="1" fill="#D1D5DB"/>
          <rect x="72" y="44" width="14" height="2" rx="1" fill="#111"/>
          <circle cx="74" cy="49" r="1.5" fill="none" stroke="#2563EB" strokeWidth="0.6"/>
          <rect x="78" y="48" width="28" height="1.5" rx="1" fill="#374151"/>
          <circle cx="74" cy="53" r="1.5" fill="none" stroke="#2563EB" strokeWidth="0.6"/>
          <rect x="78" y="52" width="24" height="1.5" rx="1" fill="#374151"/>
          <circle cx="74" cy="57" r="1.5" fill="none" stroke="#2563EB" strokeWidth="0.6"/>
          <rect x="78" y="56" width="26" height="1.5" rx="1" fill="#374151"/>
          {/* Rule */}
          <rect x="8" y="62" width="104" height="0.5" fill="#E2E8F0"/>
          {/* Education */}
          <rect x="8" y="66" width="22" height="2" rx="1" fill="#111"/>
          <rect x="8" y="71" width="16" height="1.5" rx="1" fill="#2563EB"/>
          <rect x="28" y="70" width="35" height="2" rx="1" fill="#111"/>
          <rect x="28" y="74" width="28" height="1.5" rx="1" fill="#555"/>
          {/* Rule */}
          <rect x="8" y="80" width="104" height="0.5" fill="#E2E8F0"/>
          {/* Employment */}
          <rect x="8" y="84" width="26" height="2" rx="1" fill="#111"/>
          <rect x="8" y="89" width="16" height="1.5" rx="1" fill="#2563EB"/>
          <rect x="28" y="88" width="40" height="2" rx="1" fill="#111"/>
          <rect x="28" y="92" width="60" height="1.5" rx="1" fill="#D1D5DB"/>
          <rect x="28" y="95" width="55" height="1.5" rx="1" fill="#D1D5DB"/>
        </svg>
      );
    case "harvard":
      return (
        <svg viewBox="0 0 120 170" className="h-full w-full">
          <rect width="120" height="170" fill="white"/>
          <line x1="8" y1="14" x2="35" y2="14" stroke="#111" strokeWidth="0.8"/>
          <rect x="37" y="10" width="46" height="6" rx="1" fill="#111"/>
          <line x1="85" y1="14" x2="112" y2="14" stroke="#111" strokeWidth="0.8"/>
          <rect x="25" y="20" width="70" height="1.5" rx="1" fill="#333" opacity="0.6"/>
          <rect x="35" y="30" width="50" height="2.5" rx="1" fill="#111"/>
          <rect x="8" y="37" width="50" height="2" rx="1" fill="#111"/>
          <rect x="80" y="37" width="30" height="1.5" rx="1" fill="#111"/>
          <rect x="8" y="41" width="40" height="1.5" rx="1" fill="#666"/>
          <rect x="80" y="41" width="25" height="1.5" rx="1" fill="#666"/>
          <rect x="35" y="50" width="50" height="2.5" rx="1" fill="#111"/>
          <rect x="8" y="57" width="55" height="2" rx="1" fill="#111"/>
          <rect x="80" y="57" width="28" height="1.5" rx="1" fill="#111"/>
          <rect x="8" y="61" width="35" height="1.5" rx="1" fill="#666"/>
          <rect x="80" y="61" width="25" height="1.5" rx="1" fill="#666"/>
          <rect x="12" y="66" width="90" height="1.5" rx="1" fill="#E5E5E5"/>
          <rect x="12" y="69" width="85" height="1.5" rx="1" fill="#E5E5E5"/>
          <rect x="12" y="72" width="88" height="1.5" rx="1" fill="#E5E5E5"/>
          <rect x="35" y="80" width="50" height="2.5" rx="1" fill="#111"/>
          <rect x="8" y="87" width="50" height="1.5" rx="1" fill="#111"/>
          <rect x="60" y="87" width="45" height="1.5" rx="1" fill="#E5E5E5"/>
        </svg>
      );
    case "ledger":
      return (
        <svg viewBox="0 0 120 170" className="h-full w-full">
          <rect width="120" height="170" fill="white"/>
          <rect x="25" y="8" width="70" height="5" rx="1" fill="#111"/>
          <rect x="30" y="16" width="60" height="1.5" rx="1" fill="#6B7280"/>
          <rect x="8" y="28" width="22" height="2" rx="1" fill="#111"/>
          <line x1="34" y1="28" x2="112" y2="28" stroke="#CBD5E1" strokeWidth="0.5"/>
          <rect x="34" y="30" width="70" height="1.5" rx="1" fill="#374151"/>
          <rect x="34" y="33" width="65" height="1.5" rx="1" fill="#374151"/>
          <rect x="8" y="44" width="22" height="2" rx="1" fill="#111"/>
          <line x1="34" y1="44" x2="112" y2="44" stroke="#CBD5E1" strokeWidth="0.5"/>
          <rect x="34" y="46" width="18" height="1.5" rx="1" fill="#9CA3AF"/>
          <rect x="34" y="49" width="50" height="2" rx="1" fill="#111"/>
          <rect x="34" y="53" width="35" height="1.5" rx="1" fill="#555"/>
          <rect x="8" y="64" width="26" height="2" rx="1" fill="#111"/>
          <line x1="34" y1="64" x2="112" y2="64" stroke="#CBD5E1" strokeWidth="0.5"/>
          <rect x="34" y="66" width="16" height="1.5" rx="1" fill="#9CA3AF"/>
          <rect x="34" y="69" width="55" height="2" rx="1" fill="#111"/>
          <rect x="34" y="73" width="70" height="1.5" rx="1" fill="#D1D5DB"/>
          <rect x="34" y="76" width="65" height="1.5" rx="1" fill="#D1D5DB"/>
          <rect x="8" y="87" width="18" height="2" rx="1" fill="#111"/>
          <line x1="34" y1="87" x2="112" y2="87" stroke="#CBD5E1" strokeWidth="0.5"/>
          <rect x="34" y="89" width="35" height="1.5" rx="1" fill="#111"/>
          <rect x="73" y="89" width="30" height="1.5" rx="1" fill="#111"/>
          <rect x="34" y="92" width="32" height="1.5" rx="1" fill="#111"/>
          <rect x="73" y="92" width="28" height="1.5" rx="1" fill="#111"/>
        </svg>
      );
    case "aurora":
      return (
        <svg viewBox="0 0 120 170" className="h-full w-full">
          <rect width="120" height="170" fill="white"/>
          {/* header */}
          <rect x="8" y="10" width="50" height="5" rx="1" fill="#111"/>
          <rect x="8" y="18" width="70" height="2" rx="1" fill="#2C5282"/>
          <rect x="8" y="23" width="55" height="1.5" rx="1" fill="#9CA3AF"/>
          <circle cx="102" cy="17" r="8" fill="#E5E7EB" stroke="#C7D2FE" strokeWidth="1"/>
          <line x1="8" y1="32" x2="112" y2="32" stroke="#E5E7EB" strokeWidth="0.5"/>
          {/* left col */}
          <rect x="8" y="40" width="22" height="2" rx="1" fill="#111"/>
          <rect x="8" y="45" width="65" height="1.5" rx="1" fill="#9CA3AF"/>
          <rect x="8" y="48" width="62" height="1.5" rx="1" fill="#9CA3AF"/>
          <rect x="8" y="58" width="22" height="2" rx="1" fill="#111"/>
          <rect x="8" y="63" width="30" height="2" rx="1" fill="#111"/>
          <rect x="8" y="67" width="25" height="1.5" rx="1" fill="#2C5282"/>
          <rect x="8" y="71" width="55" height="1.5" rx="1" fill="#CBD5E1"/>
          <rect x="8" y="74" width="50" height="1.5" rx="1" fill="#CBD5E1"/>
          <rect x="8" y="82" width="30" height="2" rx="1" fill="#111"/>
          <rect x="8" y="86" width="25" height="1.5" rx="1" fill="#2C5282"/>
          <rect x="8" y="90" width="55" height="1.5" rx="1" fill="#CBD5E1"/>
          {/* right col — chips */}
          <rect x="78" y="40" width="16" height="2" rx="1" fill="#111"/>
          <rect x="78" y="46" width="10" height="3" rx="1.5" fill="#2C5282"/>
          <rect x="90" y="46" width="13" height="3" rx="1.5" fill="#2C5282"/>
          <rect x="78" y="51" width="12" height="3" rx="1.5" fill="white" stroke="#9CA3AF" strokeWidth="0.4"/>
          <rect x="92" y="51" width="10" height="3" rx="1.5" fill="white" stroke="#9CA3AF" strokeWidth="0.4"/>
          <rect x="78" y="60" width="16" height="2" rx="1" fill="#111"/>
          <rect x="78" y="66" width="10" height="3" rx="1.5" fill="#2C5282"/>
          <rect x="90" y="66" width="12" height="3" rx="1.5" fill="white" stroke="#9CA3AF" strokeWidth="0.4"/>
          <rect x="78" y="76" width="18" height="2" rx="1" fill="#111"/>
          <rect x="78" y="81" width="20" height="1.5" rx="1" fill="#111"/>
          <rect x="78" y="84" width="18" height="1.5" rx="1" fill="#6B7280"/>
        </svg>
      );
    case "executive-pro":
      return (
        <svg viewBox="0 0 120 170" className="h-full w-full">
          <rect width="120" height="170" fill="white"/>
          {/* photo */}
          <rect x="8" y="8" width="22" height="22" rx="2" fill="#E5E7EB" stroke="#CBD5E0" strokeWidth="0.5"/>
          <circle cx="19" cy="17" r="4" fill="#CBD5E0"/>
          <path d="M11 27 Q19 22 27 27 L27 30 L11 30 Z" fill="#CBD5E0"/>
          {/* name + title */}
          <rect x="35" y="10" width="40" height="4" rx="1" fill="#1a202c"/>
          <rect x="35" y="17" width="34" height="2" rx="1" fill="#2C5282"/>
          <rect x="35" y="22" width="55" height="1.5" rx="1" fill="#9CA3AF"/>
          <rect x="35" y="25" width="55" height="1.5" rx="1" fill="#9CA3AF"/>
          <rect x="35" y="28" width="50" height="1.5" rx="1" fill="#9CA3AF"/>
          {/* dark contact bar */}
          <rect x="0" y="36" width="120" height="6" fill="#1a3a4a"/>
          <rect x="6" y="38" width="20" height="1.5" rx="0.5" fill="white" opacity="0.9"/>
          <rect x="32" y="38" width="18" height="1.5" rx="0.5" fill="white" opacity="0.9"/>
          <rect x="56" y="38" width="16" height="1.5" rx="0.5" fill="white" opacity="0.9"/>
          <rect x="78" y="38" width="22" height="1.5" rx="0.5" fill="white" opacity="0.9"/>
          {/* left column */}
          <rect x="8" y="50" width="4" height="4" rx="0.8" fill="none" stroke="#CBD5E0" strokeWidth="0.5"/>
          <rect x="14" y="51" width="28" height="2" rx="0.5" fill="#1a202c"/>
          <rect x="8" y="57" width="40" height="2" rx="0.5" fill="#1a202c"/>
          <rect x="8" y="61" width="25" height="1.5" rx="0.5" fill="#2C5282"/>
          <rect x="8" y="65" width="45" height="1.5" rx="0.5" fill="#CBD5E1"/>
          <rect x="8" y="68" width="43" height="1.5" rx="0.5" fill="#CBD5E1"/>
          <rect x="8" y="71" width="40" height="1.5" rx="0.5" fill="#CBD5E1"/>
          <rect x="8" y="80" width="40" height="2" rx="0.5" fill="#1a202c"/>
          <rect x="8" y="84" width="25" height="1.5" rx="0.5" fill="#2C5282"/>
          <rect x="8" y="88" width="45" height="1.5" rx="0.5" fill="#CBD5E1"/>
          <rect x="8" y="91" width="43" height="1.5" rx="0.5" fill="#CBD5E1"/>
          {/* left bottom: education */}
          <rect x="8" y="106" width="4" height="4" rx="0.8" fill="none" stroke="#CBD5E0" strokeWidth="0.5"/>
          <rect x="14" y="107" width="24" height="2" rx="0.5" fill="#1a202c"/>
          <rect x="8" y="114" width="38" height="2" rx="0.5" fill="#1a202c"/>
          <rect x="8" y="118" width="30" height="1.5" rx="0.5" fill="#4a5568"/>
          <rect x="8" y="122" width="45" height="1.5" rx="0.5" fill="#CBD5E1"/>
          {/* right column */}
          <rect x="62" y="50" width="4" height="4" rx="0.8" fill="none" stroke="#CBD5E0" strokeWidth="0.5"/>
          <rect x="68" y="51" width="22" height="2" rx="0.5" fill="#1a202c"/>
          <rect x="62" y="58" width="22" height="1.5" rx="0.5" fill="#4a5568"/>
          <rect x="86" y="58" width="22" height="1.5" rx="0.5" fill="#4a5568"/>
          <rect x="62" y="62" width="22" height="1.5" rx="0.5" fill="#4a5568"/>
          <rect x="86" y="62" width="22" height="1.5" rx="0.5" fill="#4a5568"/>
          <rect x="62" y="66" width="22" height="1.5" rx="0.5" fill="#4a5568"/>
          <rect x="86" y="66" width="22" height="1.5" rx="0.5" fill="#4a5568"/>
          {/* right: awards */}
          <rect x="62" y="76" width="4" height="4" rx="0.8" fill="none" stroke="#CBD5E0" strokeWidth="0.5"/>
          <rect x="68" y="77" width="22" height="2" rx="0.5" fill="#1a202c"/>
          <rect x="62" y="83" width="40" height="1.5" rx="0.5" fill="#1a202c"/>
          <rect x="62" y="86" width="30" height="1.2" rx="0.5" fill="#9CA3AF"/>
          <rect x="62" y="91" width="38" height="1.5" rx="0.5" fill="#1a202c"/>
          <rect x="62" y="94" width="28" height="1.2" rx="0.5" fill="#9CA3AF"/>
          {/* right: conferences */}
          <rect x="62" y="104" width="4" height="4" rx="0.8" fill="none" stroke="#CBD5E0" strokeWidth="0.5"/>
          <rect x="68" y="105" width="30" height="2" rx="0.5" fill="#1a202c"/>
          <rect x="62" y="111" width="44" height="1.5" rx="0.5" fill="#1a202c"/>
          <rect x="62" y="114" width="34" height="1.2" rx="0.5" fill="#9CA3AF"/>
          <rect x="62" y="119" width="42" height="1.5" rx="0.5" fill="#1a202c"/>
        </svg>
      );
    case "electric-lilac":
      return (
        <svg viewBox="0 0 120 170" className="h-full w-full">
          <rect width="120" height="170" fill="white"/>
          <rect x="0" y="0" width="46" height="170" fill="#9F7AEA"/>
          <circle cx="23" cy="20" r="7" fill="white" opacity="0.9"/>
          <rect x="6" y="32" width="34" height="2.5" rx="1" fill="white"/>
          <rect x="6" y="38" width="28" height="1.5" rx="1" fill="white" opacity="0.7"/>
          <rect x="6" y="50" width="30" height="2" rx="1" fill="white" opacity="0.5"/>
          <rect x="6" y="54" width="20" height="2" rx="1" fill="white" opacity="0.3"/>
          <rect x="6" y="58" width="26" height="2" rx="1" fill="white" opacity="0.3"/>
          <rect x="52" y="14" width="24" height="2" rx="1" fill="#1a202c"/>
          <line x1="52" y1="20" x2="112" y2="20" stroke="#E5E7EB" strokeWidth="0.5"/>
          <rect x="52" y="24" width="55" height="1.5" rx="1" fill="#D1D5DB"/>
          <rect x="52" y="28" width="50" height="1.5" rx="1" fill="#D1D5DB"/>
          <rect x="52" y="40" width="22" height="2" rx="1" fill="#1a202c"/>
          <line x1="52" y1="45" x2="112" y2="45" stroke="#E5E7EB" strokeWidth="0.5"/>
          <rect x="52" y="49" width="40" height="1.5" rx="1" fill="#9F7AEA"/>
          <rect x="52" y="53" width="55" height="1.5" rx="1" fill="#D1D5DB"/>
          <rect x="52" y="57" width="50" height="1.5" rx="1" fill="#D1D5DB"/>
        </svg>
      );
    case "bold-accent":
      return (
        <svg viewBox="0 0 120 170" className="h-full w-full">
          <rect width="120" height="170" fill="white"/>
          <rect x="8" y="8" width="18" height="18" rx="2" fill="#E5E7EB"/>
          <rect x="30" y="10" width="45" height="4" rx="1" fill="#1a202c"/>
          <rect x="30" y="17" width="35" height="2" rx="1" fill="#9F7AEA"/>
          <rect x="30" y="22" width="65" height="1.5" rx="1" fill="#9CA3AF"/>
          <rect x="8" y="32" width="104" height="2" fill="#9F7AEA"/>
          <rect x="8" y="42" width="5" height="5" rx="1" fill="none" stroke="#9F7AEA" strokeWidth="0.8"/>
          <rect x="16" y="43" width="22" height="2.5" rx="0.5" fill="#1a202c"/>
          <line x1="8" y1="50" x2="112" y2="50" stroke="#E5E7EB" strokeWidth="0.5"/>
          <rect x="8" y="54" width="55" height="1.5" rx="1" fill="#D1D5DB"/>
          <rect x="8" y="58" width="50" height="1.5" rx="1" fill="#D1D5DB"/>
          <rect x="8" y="70" width="12" height="3" rx="1.5" fill="#9F7AEA"/>
          <rect x="22" y="70" width="14" height="3" rx="1.5" fill="#9F7AEA"/>
          <rect x="38" y="70" width="10" height="3" rx="1.5" fill="#9F7AEA"/>
        </svg>
      );
    case "executive-sidebar":
      return (
        <svg viewBox="0 0 120 170" className="h-full w-full">
          <rect width="120" height="170" fill="white"/>
          <rect x="0" y="0" width="36" height="170" fill="#1a3a4a"/>
          <circle cx="18" cy="18" r="7" fill="white" opacity="0.9"/>
          <rect x="5" y="30" width="26" height="2.5" rx="1" fill="white"/>
          <rect x="5" y="36" width="20" height="1.5" rx="1" fill="white" opacity="0.6"/>
          <rect x="5" y="46" width="26" height="1.5" rx="1" fill="white" opacity="0.7"/>
          <rect x="5" y="50" width="24" height="1.5" rx="1" fill="white" opacity="0.7"/>
          <rect x="5" y="54" width="26" height="1.5" rx="1" fill="white" opacity="0.7"/>
          <rect x="42" y="12" width="32" height="2" rx="1" fill="#111"/>
          <line x1="42" y1="18" x2="112" y2="18" stroke="#E5E7EB" strokeWidth="0.7"/>
          <rect x="42" y="22" width="55" height="1.5" rx="1" fill="#D1D5DB"/>
          <rect x="42" y="26" width="52" height="1.5" rx="1" fill="#D1D5DB"/>
          <rect x="42" y="38" width="30" height="2" rx="1" fill="#111"/>
          <line x1="42" y1="44" x2="112" y2="44" stroke="#E5E7EB" strokeWidth="0.7"/>
          <rect x="42" y="48" width="55" height="1.5" rx="1" fill="#D1D5DB"/>
          <rect x="42" y="52" width="50" height="1.5" rx="1" fill="#D1D5DB"/>
        </svg>
      );
    case "clean-sidebar":
      return (
        <svg viewBox="0 0 120 170" className="h-full w-full">
          <rect width="120" height="170" fill="white"/>
          <rect x="0" y="0" width="38" height="170" fill="#F5F5F3"/>
          <circle cx="19" cy="18" r="7" fill="#E5E7EB"/>
          <rect x="5" y="30" width="28" height="2" rx="1" fill="#1a202c"/>
          <rect x="5" y="35" width="22" height="1.5" rx="1" fill="#9CA3AF"/>
          <line x1="5" y1="45" x2="33" y2="45" stroke="#D1D5DB" strokeWidth="0.5"/>
          <rect x="5" y="50" width="26" height="3" rx="0.5" fill="#E5E7EB"/>
          <rect x="5" y="50" width="16" height="3" rx="0.5" fill="#9F7AEA"/>
          <rect x="5" y="58" width="24" height="3" rx="0.5" fill="#E5E7EB"/>
          <rect x="5" y="58" width="14" height="3" rx="0.5" fill="#9F7AEA"/>
          <rect x="44" y="12" width="30" height="2" rx="1" fill="#111"/>
          <line x1="44" y1="18" x2="112" y2="18" stroke="#111" strokeWidth="0.8"/>
          <rect x="44" y="22" width="55" height="1.5" rx="1" fill="#D1D5DB"/>
          <rect x="44" y="26" width="50" height="1.5" rx="1" fill="#D1D5DB"/>
          <rect x="44" y="38" width="22" height="2" rx="1" fill="#111"/>
          <line x1="44" y1="44" x2="112" y2="44" stroke="#111" strokeWidth="0.8"/>
          <rect x="44" y="50" width="28" height="2" rx="0.5" fill="#1a202c"/>
          <rect x="76" y="50" width="28" height="2" rx="0.5" fill="#1a202c"/>
        </svg>
      );
    case "blueprint":
      return (
        <svg viewBox="0 0 120 170" className="h-full w-full">
          <rect width="120" height="170" fill="white"/>
          <rect x="0" y="0" width="120" height="30" fill="#E9D8FD"/>
          <rect x="8" y="8" width="30" height="3" rx="1" fill="#9F7AEA"/>
          <rect x="8" y="14" width="40" height="4" rx="1" fill="#1a202c"/>
          <rect x="90" y="6" width="22" height="22" rx="1" fill="white" stroke="#9F7AEA" strokeWidth="0.5"/>
          <rect x="8" y="36" width="28" height="2" rx="1" fill="#1a202c"/>
          <rect x="8" y="42" width="32" height="1.5" rx="1" fill="#9CA3AF"/>
          <rect x="8" y="46" width="28" height="1.5" rx="1" fill="#9CA3AF"/>
          <rect x="8" y="50" width="30" height="1.5" rx="1" fill="#9CA3AF"/>
          <rect x="8" y="58" width="28" height="2" rx="1" fill="#1a202c"/>
          <rect x="8" y="64" width="30" height="1.5" rx="1" fill="#9CA3AF"/>
          <rect x="45" y="36" width="65" height="60" rx="1" fill="none" stroke="#E5E7EB" strokeWidth="0.7"/>
          <rect x="49" y="40" width="28" height="2" rx="1" fill="#1a202c"/>
          <rect x="49" y="45" width="55" height="1.5" rx="1" fill="#9CA3AF"/>
          <rect x="49" y="49" width="52" height="1.5" rx="1" fill="#9CA3AF"/>
          <rect x="49" y="56" width="28" height="2" rx="1" fill="#1a202c"/>
          <rect x="49" y="61" width="55" height="1.5" rx="1" fill="#9CA3AF"/>
        </svg>
      );
    case "coastal":
      return (
        <svg viewBox="0 0 120 170" className="h-full w-full">
          <rect width="120" height="170" fill="white"/>
          {/* top pale strip with name + photo */}
          <rect x="0" y="0" width="120" height="30" fill="#F5F5F3"/>
          <rect x="75" y="3" width="14" height="14" fill="#4BA8B0"/>
          <rect x="82" y="6" width="22" height="22" rx="1.5" fill="#D9D9D9" stroke="#fff" strokeWidth="1"/>
          <rect x="6" y="10" width="40" height="3" rx="0.5" fill="#4BA8B0"/>
          <rect x="6" y="16" width="30" height="2" rx="0.5" fill="#4BA8B0"/>
          {/* teal objective band */}
          <rect x="0" y="30" width="120" height="34" fill="#4BA8B0"/>
          <rect x="6" y="34" width="22" height="2" rx="0.5" fill="#fff"/>
          <rect x="6" y="39" width="58" height="1.5" rx="0.5" fill="#E6F5F5"/>
          <rect x="6" y="43" width="52" height="1.5" rx="0.5" fill="#E6F5F5"/>
          <rect x="6" y="47" width="56" height="1.5" rx="0.5" fill="#E6F5F5"/>
          <circle cx="9" cy="56" r="2" fill="none" stroke="#fff" strokeWidth="0.6"/>
          <rect x="14" y="55" width="14" height="1.5" rx="0.5" fill="#E6F5F5"/>
          <circle cx="41" cy="56" r="2" fill="none" stroke="#fff" strokeWidth="0.6"/>
          <rect x="46" y="55" width="14" height="1.5" rx="0.5" fill="#E6F5F5"/>
          <circle cx="74" cy="56" r="2" fill="none" stroke="#fff" strokeWidth="0.6"/>
          <rect x="79" y="55" width="14" height="1.5" rx="0.5" fill="#E6F5F5"/>
          {/* body two-columns */}
          <rect x="6" y="72" width="24" height="2" rx="0.5" fill="#111"/>
          <line x1="6" y1="77" x2="70" y2="77" stroke="#111" strokeWidth="0.6"/>
          <rect x="6" y="82" width="32" height="2" rx="0.5" fill="#111"/>
          <rect x="6" y="87" width="44" height="1.5" rx="0.5" fill="#9CA3AF"/>
          <rect x="6" y="91" width="40" height="1.5" rx="0.5" fill="#9CA3AF"/>
          <rect x="6" y="100" width="32" height="2" rx="0.5" fill="#111"/>
          <rect x="6" y="105" width="44" height="1.5" rx="0.5" fill="#9CA3AF"/>
          <rect x="75" y="72" width="20" height="2" rx="0.5" fill="#111"/>
          <line x1="75" y1="77" x2="114" y2="77" stroke="#111" strokeWidth="0.6"/>
          <rect x="75" y="82" width="30" height="1.5" rx="0.5" fill="#9CA3AF"/>
          <rect x="75" y="86" width="34" height="1.5" rx="0.5" fill="#9CA3AF"/>
          <rect x="75" y="95" width="18" height="2" rx="0.5" fill="#111"/>
          <line x1="75" y1="100" x2="114" y2="100" stroke="#111" strokeWidth="0.6"/>
          <rect x="75" y="105" width="30" height="1.5" rx="0.5" fill="#9CA3AF"/>
          <rect x="75" y="109" width="28" height="1.5" rx="0.5" fill="#9CA3AF"/>
        </svg>
      );
    case "wentworth":
      return (
        <svg viewBox="0 0 120 170" className="h-full w-full">
          <rect width="120" height="170" fill="white"/>
          <rect x="8" y="10" width="40" height="4" rx="0.5" fill="#9CA3AF"/>
          <rect x="8" y="16" width="40" height="4" rx="0.5" fill="#111"/>
          <circle cx="100" cy="17" r="8" fill="#F5F5F3" stroke="#E5E7EB" strokeWidth="0.5"/>
          <rect x="8" y="24" width="104" height="1" fill="#E9D8FD"/>
          <rect x="8" y="28" width="26" height="1.5" rx="0.5" fill="#9CA3AF"/>
          <line x1="8" y1="34" x2="112" y2="34" stroke="#E5E7EB" strokeWidth="0.4"/>
          <rect x="8" y="40" width="18" height="1.5" rx="0.5" fill="#9CA3AF"/>
          <line x1="8" y1="44" x2="112" y2="44" stroke="#E5E7EB" strokeWidth="0.3"/>
          <rect x="8" y="48" width="30" height="2" rx="0.5" fill="#1a202c"/>
          <rect x="85" y="48" width="22" height="1.5" rx="0.5" fill="#9CA3AF"/>
          <rect x="8" y="53" width="40" height="1.5" rx="0.5" fill="#9CA3AF"/>
          <rect x="8" y="58" width="60" height="1.5" rx="0.5" fill="#D1D5DB"/>
          <rect x="8" y="62" width="58" height="1.5" rx="0.5" fill="#D1D5DB"/>
          <rect x="8" y="74" width="18" height="1.5" rx="0.5" fill="#9CA3AF"/>
          <line x1="8" y1="78" x2="112" y2="78" stroke="#E5E7EB" strokeWidth="0.3"/>
          <rect x="8" y="82" width="30" height="1.5" rx="0.5" fill="#1a202c"/>
          <rect x="60" y="82" width="30" height="1.5" rx="0.5" fill="#1a202c"/>
        </svg>
      );
    case "orchid":
      return (
        <svg viewBox="0 0 120 170" className="h-full w-full">
          {/* unified warm cream canvas — same color behind both columns */}
          <rect width="120" height="170" fill="#F5F0E6"/>
          {/* thin vertical column divider */}
          <line x1="44" y1="8" x2="44" y2="162" stroke="#1f2937" strokeOpacity="0.12" strokeWidth="0.5"/>
          {/* avatar */}
          <circle cx="22" cy="24" r="10" fill="#E8D9F0" stroke="#C9A6DC" strokeWidth="0.6"/>
          {/* name + title */}
          <rect x="8" y="40" width="28" height="3" rx="0.5" fill="#1a202c"/>
          <rect x="10" y="46" width="24" height="2" rx="0.5" fill="#B794C7"/>
          {/* contact lines */}
          <rect x="10" y="53" width="24" height="1.2" rx="0.4" fill="#9CA3AF"/>
          <rect x="10" y="56.5" width="20" height="1.2" rx="0.4" fill="#9CA3AF"/>
          {/* sidebar heading Skills */}
          <rect x="8" y="68" width="16" height="2.4" rx="0.4" fill="#B794C7"/>
          <line x1="8" y1="72.5" x2="36" y2="72.5" stroke="#D8BFE4" strokeWidth="0.4"/>
          <rect x="8" y="76" width="20" height="1.3" rx="0.4" fill="#9CA3AF"/>
          <rect x="8" y="79" width="22" height="1.3" rx="0.4" fill="#9CA3AF"/>
          <rect x="8" y="82" width="18" height="1.3" rx="0.4" fill="#9CA3AF"/>
          <rect x="8" y="85" width="21" height="1.3" rx="0.4" fill="#9CA3AF"/>
          {/* sidebar heading Summary */}
          <rect x="8" y="95" width="20" height="2.4" rx="0.4" fill="#B794C7"/>
          <line x1="8" y1="99.5" x2="36" y2="99.5" stroke="#D8BFE4" strokeWidth="0.4"/>
          <rect x="8" y="103" width="28" height="1.2" rx="0.4" fill="#D1D5DB"/>
          <rect x="8" y="106" width="26" height="1.2" rx="0.4" fill="#D1D5DB"/>
          <rect x="8" y="109" width="28" height="1.2" rx="0.4" fill="#D1D5DB"/>
          <rect x="8" y="112" width="22" height="1.2" rx="0.4" fill="#D1D5DB"/>
          {/* right col: Work Experience */}
          <rect x="50" y="12" width="36" height="3" rx="0.4" fill="#B794C7"/>
          <line x1="50" y1="18" x2="112" y2="18" stroke="#D8BFE4" strokeWidth="0.5"/>
          <rect x="50" y="22" width="40" height="2" rx="0.4" fill="#1a202c"/>
          <rect x="50" y="27" width="54" height="1.3" rx="0.4" fill="#9CA3AF"/>
          <rect x="50" y="30" width="58" height="1.3" rx="0.4" fill="#9CA3AF"/>
          <rect x="50" y="33" width="52" height="1.3" rx="0.4" fill="#9CA3AF"/>
          <rect x="50" y="40" width="40" height="2" rx="0.4" fill="#1a202c"/>
          <rect x="50" y="45" width="56" height="1.3" rx="0.4" fill="#9CA3AF"/>
          <rect x="50" y="48" width="52" height="1.3" rx="0.4" fill="#9CA3AF"/>
          <rect x="50" y="51" width="56" height="1.3" rx="0.4" fill="#9CA3AF"/>
          <rect x="50" y="58" width="40" height="2" rx="0.4" fill="#1a202c"/>
          <rect x="50" y="63" width="54" height="1.3" rx="0.4" fill="#9CA3AF"/>
          <rect x="50" y="66" width="50" height="1.3" rx="0.4" fill="#9CA3AF"/>
          {/* right col: Education */}
          <rect x="50" y="85" width="28" height="3" rx="0.4" fill="#B794C7"/>
          <line x1="50" y1="91" x2="112" y2="91" stroke="#D8BFE4" strokeWidth="0.5"/>
          <rect x="50" y="95" width="56" height="1.3" rx="0.4" fill="#9CA3AF"/>
          <rect x="50" y="98" width="60" height="1.3" rx="0.4" fill="#9CA3AF"/>
          <rect x="50" y="101" width="48" height="1.3" rx="0.4" fill="#9CA3AF"/>
          {/* navy corner wedge */}
          <path d="M 120 170 L 120 148 A 22 22 0 0 0 98 170 Z" fill="#1E3A5F"/>
        </svg>
      );
    case "portrait":
      return (
        <svg viewBox="0 0 120 170" className="h-full w-full">
          <rect width="120" height="170" fill="#dedede"/>
          {/* split-weight name — thin first, bold last */}
          <rect x="10" y="12" width="30" height="2" rx="0.3" fill="#1a1a1a" opacity="0.55"/>
          <rect x="10" y="16" width="52" height="6" rx="0.5" fill="#1a1a1a"/>
          {/* contact column right */}
          <circle cx="80" cy="14" r="1.3" fill="#5a5a5a"/>
          <rect x="85" y="13.2" width="26" height="1.4" rx="0.3" fill="#5a5a5a"/>
          <circle cx="80" cy="19" r="1.3" fill="#5a5a5a"/>
          <rect x="85" y="18.2" width="24" height="1.4" rx="0.3" fill="#5a5a5a"/>
          <circle cx="80" cy="24" r="1.3" fill="#5a5a5a"/>
          <rect x="85" y="23.2" width="22" height="1.4" rx="0.3" fill="#5a5a5a"/>
          {/* title + summary left */}
          <rect x="10" y="36" width="34" height="2.2" rx="0.3" fill="#1a1a1a"/>
          <rect x="10" y="42" width="56" height="1.2" rx="0.3" fill="#5a5a5a"/>
          <rect x="10" y="45" width="52" height="1.2" rx="0.3" fill="#5a5a5a"/>
          <rect x="10" y="48" width="54" height="1.2" rx="0.3" fill="#5a5a5a"/>
          {/* photo right */}
          <rect x="82" y="36" width="26" height="32" rx="1" fill="#8a8a8a"/>
          {/* Experience heading + rule */}
          <rect x="10" y="76" width="24" height="2.2" rx="0.3" fill="#1a1a1a"/>
          <g stroke="#8a8a8a" strokeWidth="0.3" strokeLinecap="round"><line x1="66" y1="75" x2="66" y2="81"/><line x1="63" y1="78" x2="69" y2="78"/><line x1="64" y1="76" x2="68" y2="80"/><line x1="68" y1="76" x2="64" y2="80"/></g>
          <line x1="10" y1="82" x2="66" y2="82" stroke="#1a1a1a" strokeWidth="0.4"/>
          <rect x="10" y="85" width="40" height="1.6" rx="0.3" fill="#1a1a1a"/>
          <rect x="10" y="88.5" width="52" height="1.2" rx="0.3" fill="#5a5a5a"/>
          <rect x="12" y="92" width="50" height="1.2" rx="0.3" fill="#5a5a5a"/>
          <rect x="12" y="95" width="48" height="1.2" rx="0.3" fill="#5a5a5a"/>
          <rect x="12" y="98" width="44" height="1.2" rx="0.3" fill="#5a5a5a"/>
          {/* Education heading + rule */}
          <rect x="10" y="110" width="22" height="2.2" rx="0.3" fill="#1a1a1a"/>
          <g stroke="#8a8a8a" strokeWidth="0.3" strokeLinecap="round"><line x1="66" y1="109" x2="66" y2="115"/><line x1="63" y1="112" x2="69" y2="112"/><line x1="64" y1="110" x2="68" y2="114"/><line x1="68" y1="110" x2="64" y2="114"/></g>
          <line x1="10" y1="116" x2="66" y2="116" stroke="#1a1a1a" strokeWidth="0.4"/>
          <rect x="10" y="119" width="44" height="1.6" rx="0.3" fill="#1a1a1a"/>
          <rect x="10" y="122.5" width="50" height="1.2" rx="0.3" fill="#5a5a5a"/>
          {/* Certifications heading + rule */}
          <rect x="10" y="135" width="30" height="2.2" rx="0.3" fill="#1a1a1a"/>
          <g stroke="#8a8a8a" strokeWidth="0.3" strokeLinecap="round"><line x1="66" y1="134" x2="66" y2="140"/><line x1="63" y1="137" x2="69" y2="137"/><line x1="64" y1="135" x2="68" y2="139"/><line x1="68" y1="135" x2="64" y2="139"/></g>
          <line x1="10" y1="141" x2="66" y2="141" stroke="#1a1a1a" strokeWidth="0.4"/>
          <rect x="10" y="144" width="40" height="1.6" rx="0.3" fill="#1a1a1a"/>
          <rect x="10" y="147.5" width="44" height="1.2" rx="0.3" fill="#5a5a5a"/>
          {/* Right column: Skills */}
          <rect x="72" y="76" width="16" height="2.2" rx="0.3" fill="#1a1a1a"/>
          <g stroke="#8a8a8a" strokeWidth="0.3" strokeLinecap="round"><line x1="108" y1="75" x2="108" y2="81"/><line x1="105" y1="78" x2="111" y2="78"/><line x1="106" y1="76" x2="110" y2="80"/><line x1="110" y1="76" x2="106" y2="80"/></g>
          <line x1="72" y1="82" x2="110" y2="82" stroke="#1a1a1a" strokeWidth="0.4"/>
          <rect x="74" y="86" width="30" height="1.2" rx="0.3" fill="#5a5a5a"/>
          <rect x="74" y="89" width="28" height="1.2" rx="0.3" fill="#5a5a5a"/>
          <rect x="74" y="92" width="32" height="1.2" rx="0.3" fill="#5a5a5a"/>
          <rect x="74" y="95" width="26" height="1.2" rx="0.3" fill="#5a5a5a"/>
          <rect x="74" y="98" width="30" height="1.2" rx="0.3" fill="#5a5a5a"/>
          {/* Right column: Portfolio */}
          <rect x="72" y="110" width="24" height="2.2" rx="0.3" fill="#1a1a1a"/>
          <g stroke="#8a8a8a" strokeWidth="0.3" strokeLinecap="round"><line x1="108" y1="109" x2="108" y2="115"/><line x1="105" y1="112" x2="111" y2="112"/><line x1="106" y1="110" x2="110" y2="114"/><line x1="110" y1="110" x2="106" y2="114"/></g>
          <line x1="72" y1="116" x2="110" y2="116" stroke="#1a1a1a" strokeWidth="0.4"/>
          <rect x="72" y="120" width="36" height="1.4" rx="0.3" fill="#1a1a1a"/>
          <rect x="72" y="124" width="34" height="1.2" rx="0.3" fill="#5a5a5a"/>
          <rect x="72" y="127" width="30" height="1.2" rx="0.3" fill="#5a5a5a"/>
        </svg>
      );
  }
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
  const isColumnBased = design.template === "two-column" || design.template === "divide" || design.template === "folio" || design.template === "aurora" || design.template === "executive-pro" || design.template === "electric-lilac" || design.template === "executive-sidebar" || design.template === "clean-sidebar" || design.template === "blueprint" || design.template === "coastal" || design.template === "orchid" || design.template === "portrait";
  const isTwoCol = isSidebar || isColumnBased;
  const supportsAvatar = design.template === "aurora" || design.template === "executive-pro" || design.template === "electric-lilac" || design.template === "bold-accent" || design.template === "executive-sidebar" || design.template === "clean-sidebar" || design.template === "blueprint" || design.template === "wentworth" || design.template === "coastal" || design.template === "orchid" || design.template === "portrait";

  // Per-template capability gates — only show a control when the template
  // actually honors the setting. Keeps the UI "honest" so users don't tweak
  // options that have no visual effect.
  const CONTACT_SEPARATOR_TEMPLATES = new Set<string>([
    "classic", "classic-serif", "sharp", "minimal", "executive",
    "sidebar", "sidebar-right", "two-column", "blueprint", "wentworth",
  ]);
  const HEADER_ALIGNMENT_TEMPLATES = new Set<string>([
    "classic", "classic-serif", "sharp", "minimal", "executive",
    "executive-pro", "blueprint", "wentworth",
  ]);
  const supportsContactSeparator = CONTACT_SEPARATOR_TEMPLATES.has(design.template);
  const supportsHeaderAlignment = HEADER_ALIGNMENT_TEMPLATES.has(design.template);
  const [avatarError, setAvatarError] = React.useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = React.useState(false);
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

  const COLUMN_LEFT_DEFAULT = ["contact", "targetTitle", "skills", "education", "certifications"];

  // Per-template fixed-header keys + right-column defaults. Must mirror the
  // corresponding template component so the designer panel never hides a
  // section the template is actually willing to render.
  const HEADER_KEYS_BY_TEMPLATE: Record<string, string[]> = {
    "two-column": ["contact", "targetTitle", "summary"],
    aurora: ["contact", "targetTitle"],
    "executive-pro": ["contact", "targetTitle", "summary"],
    blueprint: ["contact", "targetTitle"],
    coastal: ["contact", "targetTitle", "summary"],
    portrait: ["contact", "targetTitle", "summary"],
  };
  const RIGHT_DEFAULT_BY_TEMPLATE: Record<string, string[]> = {
    "two-column": ["education", "certifications", "skills"],
    aurora: ["skills", "education", "certifications"],
    "executive-pro": ["skills", "education", "certifications"],
    blueprint: ["summary", "skills", "experience", "projects", "awards", "publications"],
    coastal: ["skills", "awards", "certifications"],
    portrait: ["skills", "certifications", "awards"],
  };

  const headerOnTopLayout = design.template === "two-column" || design.template === "aurora" || design.template === "executive-pro" || design.template === "blueprint" || design.template === "coastal" || design.template === "portrait";
  const headerKeysArr = HEADER_KEYS_BY_TEMPLATE[design.template] ?? ["contact", "targetTitle"];
  const headerSet = new Set(headerKeysArr);
  const secondarySections = design.sidebarSections ?? (
    headerOnTopLayout ? (RIGHT_DEFAULT_BY_TEMPLATE[design.template] ?? ["education", "certifications", "skills"]) : COLUMN_LEFT_DEFAULT
  );
  const secondarySet = new Set(secondarySections);

  let displayLeft: string[] = [], displayRight: string[] = [];
  let labelLeft = "", labelRight = "";

  if (isSidebar || design.template === "divide" || design.template === "folio" || design.template === "electric-lilac" || design.template === "executive-sidebar" || design.template === "clean-sidebar" || design.template === "orchid") {
    // sidebarSections = left column sections
    displayLeft = secondarySections.filter((k) => isEnabled(k));
    displayRight = design.sectionOrder.filter((k) => !secondarySet.has(k) && isEnabled(k));
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

  const TEMPLATE_IMAGES: Record<string, string> = {
    classic: "classic.jpg",
    "classic-serif": "classic-serif.png",
    sharp: "sharp.jpg",
    minimal: "minimal.jpg",
    executive: "executive.jpg",
    sidebar: "slate.jpg",
    "sidebar-right": "onyx.jpg",
    "two-column": "horizon.jpg",
    divide: "divide.jpg",
    folio: "folio.jpg",
    metro: "metro.jpg",
    harvard: "harward.jpg",
    ledger: "ledger.jpg",
    aurora: "aurora.jpg",
    "executive-pro": "executive-pro.jpg",
    "electric-lilac": "electric-lilac.jpg",
    "bold-accent": "bold-accent.jpg",
    "executive-sidebar": "executive-sidebar.jpg",
    "clean-sidebar": "clean-sidebar.jpg",
    blueprint: "blueprint.jpg",
    wentworth: "wentworth.jpg",
    coastal: "coastal.jpg",
    orchid: "orchid.jpg",
    portrait: "portrait.jpg",
  };

  const currentTemplate = TEMPLATES.find((t) => t.name === design.template) ?? TEMPLATES[0];
  const [templateDialogOpen, setTemplateDialogOpen] = React.useState(false);
  const [stagedTemplate, setStagedTemplate] = React.useState<TemplateName>(design.template);
  const [mobileModalView, setMobileModalView] = React.useState<"browse" | "preview">("browse");

  React.useEffect(() => {
    if (templateDialogOpen) {
      setStagedTemplate(design.template);
      setMobileModalView("browse");
    }
  }, [templateDialogOpen, design.template]);

  const stagedTemplateMeta = TEMPLATES.find((t) => t.name === stagedTemplate) ?? TEMPLATES[0];

  function renderTemplateThumb(name: TemplateName, className?: string) {
    const imgSrc = TEMPLATE_IMAGES[name];
    return imgSrc ? (
      <img
        src={`/img/templates/${imgSrc}`}
        alt=""
        className={cn("h-full w-full", className)}
        style={{ objectFit: "cover", objectPosition: "top" }}
      />
    ) : (
      <div className={cn("h-full w-full bg-muted", className)}>
        <TemplatePreview template={name} />
      </div>
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
                    {tab.id === "preview" && stagedTemplate !== design.template && (
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
                    const staged = stagedTemplate === t.name;
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
                        design={{ ...design, template: stagedTemplate }}
                      />
                    </PaperPreview>
                  ) : (
                    <div className="mx-auto flex h-full max-w-[360px] items-center justify-center">
                      <div
                        className="w-full overflow-hidden rounded-md border bg-background shadow-sm"
                        style={{ aspectRatio: "210/297" }}
                      >
                        {renderTemplateThumb(stagedTemplate)}
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
                disabled={stagedTemplate === design.template}
                onClick={() => {
                  update("template", stagedTemplate);
                  setTemplateDialogOpen(false);
                }}
              >
                Apply template
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
                  <span>—</span>
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

                {design.template !== "portrait" && (
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

          {!isSidebar && design.template !== "clean-sidebar" && (
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
