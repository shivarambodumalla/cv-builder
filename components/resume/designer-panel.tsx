"use client";

import React from "react";
import { AlignLeft, AlignCenter, AlignRight, GripVertical, ChevronLeft, ChevronRight } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type {
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
}

const TEMPLATES: { name: TemplateName; label: string; desc: string }[] = [
  { name: "classic", label: "Classic", desc: "Clean single-column layout. Works for any role." },
  { name: "classic-serif", label: "Classic Serif", desc: "Elegant serif typography with grey section bands." },
  { name: "sharp", label: "Sharp", desc: "Bold headers with strong visual hierarchy." },
  { name: "minimal", label: "Minimal", desc: "Maximum whitespace, distraction-free." },
  { name: "executive", label: "Executive", desc: "Refined styling for senior professionals." },
  { name: "sidebar", label: "Slate", desc: "Two-column with left sidebar for skills." },
  { name: "sidebar-right", label: "Onyx", desc: "Two-column with right sidebar layout." },
  { name: "two-column", label: "Horizon", desc: "Full-width header with two-column body." },
  { name: "divide", label: "Divide", desc: "Split layout with a clean vertical divider." },
  { name: "folio", label: "Folio", desc: "Two-column with a tinted left panel." },
  // { name: "metro", label: "Metro", desc: "Modern metro-inspired design." },  // hidden — redesign in progress
  { name: "harvard", label: "Harvard", desc: "Academic style inspired by Ivy League." },
  { name: "ledger", label: "Ledger", desc: "Structured grid layout for detail-heavy roles." },
  { name: "aurora", label: "Aurora", desc: "Modern two-column with avatar and skill chips." },
  { name: "executive-pro", label: "Executive Pro", desc: "Bold photo header and dark contact bar. Pro (not ATS-safe)." },
  { name: "electric-lilac", label: "Electric Lilac", desc: "Vibrant sidebar with accent colour and pill chips." },
  { name: "bold-accent", label: "Bold Accent", desc: "Accent chips and icon-bordered sections." },
  { name: "executive-sidebar", label: "Executive Sidebar", desc: "Dark sidebar with photo for senior roles." },
  { name: "clean-sidebar", label: "Clean Sidebar", desc: "Warm sidebar with skill bars and links." },
  { name: "blueprint", label: "Blueprint", desc: "Editorial header block with two-column body." },
  { name: "wentworth", label: "Wentworth", desc: "Minimal editorial with split-weight name." },
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
  }
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

export function DesignerPanel({ design, onChange, photoUrl, contactName, onPhotoChange, sectionVisibility }: DesignerPanelProps) {
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
  const isColumnBased = design.template === "two-column" || design.template === "divide" || design.template === "folio" || design.template === "aurora" || design.template === "executive-pro" || design.template === "electric-lilac" || design.template === "executive-sidebar" || design.template === "clean-sidebar" || design.template === "blueprint";
  const isTwoCol = isSidebar || isColumnBased;
  const supportsAvatar = design.template === "aurora" || design.template === "executive-pro" || design.template === "electric-lilac" || design.template === "bold-accent" || design.template === "executive-sidebar" || design.template === "clean-sidebar" || design.template === "blueprint" || design.template === "wentworth";
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

  const COLUMN_LEFT_DEFAULT = ["contact", "targetTitle", "skills", "education", "certifications"];

  // Per-template fixed-header keys + right-column defaults. Must mirror the
  // corresponding template component so the designer panel never hides a
  // section the template is actually willing to render.
  const HEADER_KEYS_BY_TEMPLATE: Record<string, string[]> = {
    "two-column": ["contact", "targetTitle", "summary"],
    aurora: ["contact", "targetTitle"],
    "executive-pro": ["contact", "targetTitle", "summary"],
    blueprint: ["contact", "targetTitle"],
  };
  const RIGHT_DEFAULT_BY_TEMPLATE: Record<string, string[]> = {
    "two-column": ["education", "certifications", "skills"],
    aurora: ["skills", "education", "certifications"],
    "executive-pro": ["skills", "education", "certifications"],
    blueprint: ["summary", "skills", "experience", "projects", "awards", "publications"],
  };

  const headerOnTopLayout = design.template === "two-column" || design.template === "aurora" || design.template === "executive-pro" || design.template === "blueprint";
  const headerKeysArr = HEADER_KEYS_BY_TEMPLATE[design.template] ?? ["contact", "targetTitle"];
  const headerSet = new Set(headerKeysArr);
  const secondarySections = design.sidebarSections ?? (
    headerOnTopLayout ? (RIGHT_DEFAULT_BY_TEMPLATE[design.template] ?? ["education", "certifications", "skills"]) : COLUMN_LEFT_DEFAULT
  );
  const secondarySet = new Set(secondarySections);

  let displayLeft: string[] = [], displayRight: string[] = [];
  let labelLeft = "", labelRight = "";

  if (isSidebar || design.template === "divide" || design.template === "folio" || design.template === "electric-lilac" || design.template === "executive-sidebar" || design.template === "clean-sidebar") {
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
  const leftIsSecondary = isSidebar || design.template === "divide" || design.template === "folio" || design.template === "electric-lilac" || design.template === "executive-sidebar" || design.template === "clean-sidebar";

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

  return (
    <div className="space-y-6">

      {/* Template */}
      <section>
        <Label className="mb-3 block text-sm font-semibold">Template</Label>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((t) => {
            const selected = design.template === t.name;
            const imgMap: Record<string, string> = {
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
            };
            const imgSrc = imgMap[t.name];
            return (
              <button
                key={t.name}
                type="button"
                className={cn(
                  "relative rounded-lg border p-1 text-left transition-all overflow-hidden",
                  selected && "ring-2 ring-primary"
                )}
                onClick={() => update("template", t.name)}
              >
                {imgSrc ? (
                  <img
                    src={`/img/templates/${imgSrc}`}
                    alt={t.label}
                    className="w-full rounded"
                    style={{ aspectRatio: "210/240", objectFit: "cover", objectPosition: "top" }}
                  />
                ) : (
                  <div className="h-28 rounded bg-muted">
                    <TemplatePreview template={t.name} />
                  </div>
                )}
                <div className="mt-2 px-1 pb-1">
                  <p className="text-sm font-semibold">{t.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{t.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Font */}
      <section>
        <Label className="mb-3 block text-sm font-semibold">Font</Label>
        <div className="grid grid-cols-2 gap-3">
          {FONTS.map((f) => {
            const selected = design.font === f.name;
            return (
              <button
                key={f.name}
                type="button"
                className={cn(
                  "relative rounded-lg border px-3 py-3 text-center transition-all",
                  selected && "ring-2 ring-primary"
                )}
                onClick={() => update("font", f.name)}
              >
                <span
                  className="block text-xl"
                  style={{ fontFamily: FONT_STACKS[f.name] }}
                >
                  Aa
                </span>
                <span className="mt-1 block text-xs font-medium">{f.label}</span>
              </button>
            );
          })}
        </div>
      </section>


      {/* Accent Color */}
      <section>
        <Label className="mb-3 block text-sm font-semibold">Accent Color</Label>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {ACCENT_PRESETS.map(({ key, hex }) => {
              const selected = currentHex === hex;
              return (
                <button
                  key={key}
                  type="button"
                  className={cn(
                    "h-6 w-6 rounded-full transition-all shrink-0",
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
              className="h-9 w-9 cursor-pointer rounded border border-input bg-transparent p-0.5"
            />
            <Input
              value={currentHex}
              onChange={(e) => {
                const v = e.target.value;
                if (/^#[0-9a-fA-F]{0,6}$/.test(v)) {
                  update("accentColor", v);
                }
              }}
              className="h-9 w-28 font-mono text-xs"
              placeholder="#000000"
            />
          </div>
        </div>
      </section>


      {/* Typography */}
      <section>
        <Label className="mb-3 block text-sm font-semibold">Typography</Label>
        <div className="space-y-3">
          <div>
            <span className="mb-1.5 block text-xs text-muted-foreground">Body size</span>
            <div className="flex items-center gap-2">
              {(["S", "M", "L"] as const).map((size) => (
                <Button
                  key={size}
                  variant={design.bodySize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => update("bodySize", size)}
                >
                  {size}
                </Button>
              ))}
              <Input
                type="number"
                min={8}
                max={12}
                value={activeBodyPt}
                className="h-9 w-16 text-center"
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (v >= 8 && v <= 12) {
                    const matchedSize = Object.entries(BODY_SIZE_PT).find(
                      ([, pt]) => pt === v
                    );
                    update("bodySize", matchedSize ? (matchedSize[0] as "S" | "M" | "L") : v);
                  }
                }}
              />
              <span className="text-xs text-muted-foreground">pt</span>
            </div>
          </div>
          <div>
            <span className="mb-1.5 block text-xs text-muted-foreground">Name size</span>
            <div className="flex items-center gap-2">
              {(["S", "M", "L"] as const).map((size) => (
                <Button
                  key={size}
                  variant={design.nameSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => update("nameSize", size)}
                >
                  {size}
                </Button>
              ))}
              <Input
                type="number"
                min={18}
                max={32}
                value={activeNamePt}
                className="h-9 w-16 text-center"
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (v >= 18 && v <= 32) {
                    const matchedSize = Object.entries(NAME_SIZE_PT).find(
                      ([, pt]) => pt === v
                    );
                    update("nameSize", matchedSize ? (matchedSize[0] as "S" | "M" | "L") : v);
                  }
                }}
              />
              <span className="text-xs text-muted-foreground">pt</span>
            </div>
          </div>
          <div>
            <span className="mb-1.5 block text-xs text-muted-foreground">Name weight</span>
            <div className="flex gap-1">
              {(["light", "regular", "medium", "bold", "black"] as FontWeight[]).map((w) => (
                <Button
                  key={w}
                  variant={(design.nameWeight ?? "bold") === w ? "default" : "outline"}
                  size="sm"
                  className="flex-1 text-xs capitalize"
                  onClick={() => update("nameWeight", w)}
                >
                  {w}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <span className="mb-2 block text-xs font-medium text-foreground">Section Headings</span>
            <div className="space-y-3">
              <div>
                <span className="mb-1.5 block text-xs text-muted-foreground">Size</span>
                <div className="flex items-center gap-2">
                {(["S", "M", "L"] as const).map((size) => (
                  <Button
                    key={size}
                    variant={(design.sectionHeadingSize ?? "M") === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => update("sectionHeadingSize", size)}
                  >
                    {size}
                  </Button>
                ))}
                <Input
                  type="number"
                  min={7}
                  max={13}
                  value={typeof design.sectionHeadingSize === "number" ? design.sectionHeadingSize : (SECTION_HEADING_SIZE_PT[design.sectionHeadingSize ?? "M"] ?? 9)}
                  className="h-9 w-16 text-center"
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (v >= 7 && v <= 13) {
                      const matched = Object.entries(SECTION_HEADING_SIZE_PT).find(([, pt]) => pt === v);
                      update("sectionHeadingSize", matched ? (matched[0] as "S" | "M" | "L") : v);
                    }
                  }}
                />
                <span className="text-xs text-muted-foreground">pt</span>
                </div>
              </div>
              <div>
                <span className="mb-1.5 block text-xs text-muted-foreground">Weight</span>
                <div className="flex gap-1">
                  {(["light", "regular", "medium", "bold", "black"] as FontWeight[]).map((w) => (
                    <Button
                      key={w}
                      variant={(design.sectionHeadingWeight ?? "bold") === w ? "default" : "outline"}
                      size="sm"
                      className="flex-1 text-xs capitalize"
                      onClick={() => update("sectionHeadingWeight", w)}
                    >
                      {w}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <span className="mb-1.5 block text-xs text-muted-foreground">Text case</span>
                <div className="flex gap-1">
                  {([
                    { value: "as-written" as TextCase, label: "As written" },
                    { value: "uppercase" as TextCase, label: "Uppercase" },
                    { value: "capitalize" as TextCase, label: "Capitalize" },
                  ]).map(({ value, label }) => (
                    <Button
                      key={value}
                      variant={(design.sectionHeadingCase ?? "uppercase") === value ? "default" : "outline"}
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => update("sectionHeadingCase", value)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div>
            <span className="mb-1.5 block text-xs text-muted-foreground">Line spacing</span>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1.0}
                max={2.0}
                step={0.1}
                value={design.lineSpacing}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
                onChange={(e) => update("lineSpacing", parseFloat(e.target.value))}
              />
              <span className="w-8 text-right text-xs font-medium tabular-nums">
                {design.lineSpacing.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Avatar — only for templates that render one (Aurora) */}
      {supportsAvatar && (
        <section>
          <Label className="mb-3 block text-sm font-semibold">Avatar</Label>
          <div className="space-y-3">
            {/* Mode */}
            <div>
              <span className="mb-1.5 block text-xs text-muted-foreground">Mode</span>
              <div className="flex gap-1">
                {([
                  { value: "photo" as AvatarMode, label: "Photo" },
                  { value: "initials" as AvatarMode, label: "Initials" },
                  { value: "off" as AvatarMode, label: "Off" },
                ]).map(({ value, label }) => (
                  <Button
                    key={value}
                    variant={avatarMode === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => update("avatarMode", value)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Upload (only when mode=photo) */}
            {avatarMode === "photo" && (
              <div>
                <span className="mb-1.5 block text-xs text-muted-foreground">Photo</span>
                <div className="flex items-center gap-3">
                  <div
                    className="flex shrink-0 items-center justify-center overflow-hidden border bg-muted text-xs text-muted-foreground"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius:
                        avatarShape === "circle" ? "50%" : avatarShape === "rounded" ? 10 : 2,
                    }}
                  >
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoUrl} alt="Avatar preview" className="h-full w-full object-cover" />
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted">
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
                    {photoUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => onPhotoChange?.(undefined)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
                {avatarError && <p className="mt-1.5 text-xs text-destructive">{avatarError}</p>}
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Resized to 256px max. Stored inline with the CV.
                </p>
              </div>
            )}

            {avatarMode === "initials" && (
              <p className="text-[11px] text-muted-foreground">
                Uses initials from your name{contactName ? ` (“${(contactName.match(/\S+/g) ?? []).map((p) => p[0]).slice(0, 2).join("").toUpperCase()}”)` : ""}.
              </p>
            )}

            {avatarMode !== "off" && (
              <>
                {/* Shape */}
                <div>
                  <span className="mb-1.5 block text-xs text-muted-foreground">Shape</span>
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
                        onClick={() => update("avatarShape", value)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Initials background — only relevant when rendering initials */}
                {avatarMode === "initials" && (
                  <div>
                    <span className="mb-1.5 block text-xs text-muted-foreground">Initials background</span>
                    <div className="flex gap-1">
                      {([
                        { value: "accent" as AvatarInitialsBg, label: "Accent" },
                        { value: "white" as AvatarInitialsBg, label: "White" },
                      ]).map(({ value, label }) => (
                        <Button
                          key={value}
                          variant={avatarInitialsBg === value ? "default" : "outline"}
                          size="sm"
                          onClick={() => update("avatarInitialsBg", value)}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size */}
                <div>
                  <span className="mb-1.5 block text-xs text-muted-foreground">Size</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={56}
                      max={130}
                      step={2}
                      value={avatarSize}
                      className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
                      onChange={(e) => update("avatarSize", parseInt(e.target.value, 10))}
                    />
                    <span className="w-10 text-right text-xs font-medium tabular-nums">
                      {avatarSize}px
                    </span>
                  </div>
                </div>

                {/* Position */}
                <div>
                  <span className="mb-1.5 block text-xs text-muted-foreground">Position</span>
                  <div className="flex gap-1">
                    {([
                      { value: "left" as AvatarPosition, label: "Left" },
                      { value: "right" as AvatarPosition, label: "Right" },
                    ]).map(({ value, label }) => (
                      <Button
                        key={value}
                        variant={avatarPosition === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => update("avatarPosition", value)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Layout */}
      <section>
        <Label className="mb-3 block text-sm font-semibold">Layout</Label>
        <div className="space-y-3">
          {(!isTwoCol || design.template === "blueprint") && (
          <div>
            <span className="mb-1.5 block text-xs text-muted-foreground">Header alignment</span>
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
                  onClick={() => update("headerAlignment", value)}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>
          )}
          <div>
            <span className="mb-1.5 block text-xs text-muted-foreground">Paper size</span>
            <div className="flex gap-1">
              {([
                { value: "a4" as PaperSize, label: "A4" },
                { value: "letter" as PaperSize, label: "Letter" },
              ]).map(({ value, label }) => (
                <Button
                  key={value}
                  variant={design.paperSize === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => update("paperSize", value)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Spacing */}
      <section>
        <Label className="mb-3 block text-sm font-semibold">Spacing</Label>
        <div className="space-y-4">
          <div>
            <span className="mb-1.5 block text-xs text-muted-foreground">
              Space between sections
            </span>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={8}
                max={32}
                step={1}
                value={design.sectionSpacing ?? 16}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
                onChange={(e) => update("sectionSpacing", parseInt(e.target.value, 10))}
              />
              <span className="w-10 text-right text-xs font-medium tabular-nums">
                {design.sectionSpacing ?? 16}px
              </span>
            </div>
          </div>
          {!isSidebar && design.template !== "clean-sidebar" && (
          <>
          <div>
            <span className="mb-1.5 block text-xs text-muted-foreground">
              Left & Right margins
            </span>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0.3}
                max={1.0}
                step={0.05}
                value={design.marginX ?? 0.75}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
                onChange={(e) => update("marginX", parseFloat(e.target.value))}
              />
              <span className="w-10 text-right text-xs font-medium tabular-nums">
                {(design.marginX ?? 0.75).toFixed(2)}in
              </span>
            </div>
          </div>
          <div>
            <span className="mb-1.5 block text-xs text-muted-foreground">
              Top & Bottom margins
            </span>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0.3}
                max={1.0}
                step={0.05}
                value={design.marginY ?? 0.5}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
                onChange={(e) => update("marginY", parseFloat(e.target.value))}
              />
              <span className="w-10 text-right text-xs font-medium tabular-nums">
                {(design.marginY ?? 0.5).toFixed(2)}in
              </span>
            </div>
          </div>
          </>
          )}
        </div>
      </section>


      {/* Details */}
      <section>
        <Label className="mb-3 block text-sm font-semibold">Details</Label>
        <div className="space-y-3">
          <div>
            <span className="mb-1.5 block text-xs text-muted-foreground">Bullet style</span>
            <div className="flex gap-1">
              {BULLET_OPTIONS.map(({ value, label }) => (
                <Button
                  key={value}
                  variant={design.bulletStyle === value ? "default" : "outline"}
                  size="sm"
                  className="min-w-9"
                  onClick={() => update("bulletStyle", value)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <span className="mb-1.5 block text-xs text-muted-foreground">Date format</span>
            <div className="flex gap-1">
              {DATE_FORMAT_LABELS.map(({ value, label }) => (
                <Button
                  key={value}
                  variant={design.dateFormat === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => update("dateFormat", value)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
          {!isTwoCol && (
          <div>
            <span className="mb-1.5 block text-xs text-muted-foreground">Contact separator</span>
            <div className="flex gap-1">
              {([
                { value: "pipe" as ContactSeparator, label: "|" },
                { value: "dot" as ContactSeparator, label: "·" },
                { value: "dash" as ContactSeparator, label: "–" },
                { value: "comma" as ContactSeparator, label: "," },
                { value: "none" as ContactSeparator, label: "none" },
              ]).map(({ value, label }) => (
                <Button
                  key={value}
                  variant={(design.contactSeparator ?? "pipe") === value ? "default" : "outline"}
                  size="sm"
                  className="min-w-9"
                  onClick={() => update("contactSeparator", value)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
          )}
        </div>
      </section>

      {/* Section Order */}
      <section>
        <Label className="mb-3 block text-sm font-semibold">Section Order</Label>
        {isTwoCol ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="mb-2 block text-xs font-medium text-muted-foreground">{labelLeft}</span>
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
              <span className="mb-2 block text-xs font-medium text-muted-foreground">{labelRight}</span>
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
      </section>

    </div>
  );
}
