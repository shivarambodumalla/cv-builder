"use client";

import React from "react";
import { AlignLeft, AlignCenter, AlignRight, GripVertical } from "lucide-react";
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
} from "@/lib/resume/types";
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
}

const TEMPLATES: { name: TemplateName; label: string }[] = [
  { name: "classic", label: "Classic" },
  { name: "sharp", label: "Sharp" },
  { name: "minimal", label: "Minimal" },
  { name: "executive", label: "Executive" },
  { name: "sidebar", label: "Sidebar" },
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
        <div className="flex h-full gap-1 p-1">
          <div className="w-1/3 rounded-sm bg-slate-600" />
          <div className="flex flex-1 flex-col gap-0.5 py-0.5">
            <div className="h-1.5 w-3/4 rounded-sm bg-slate-400" />
            <div className="h-1 w-full rounded-sm bg-slate-200" />
            <div className="h-1 w-5/6 rounded-sm bg-slate-200" />
            <div className="h-1 w-full rounded-sm bg-slate-200" />
          </div>
        </div>
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

export function DesignerPanel({ design, onChange }: DesignerPanelProps) {
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

  return (
    <div className="space-y-6">

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


      {/* Layout */}
      <section>
        <Label className="mb-3 block text-sm font-semibold">Layout</Label>
        <div className="space-y-3">
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
        </div>
      </section>

      {/* Section Order */}
      <section>
        <Label className="mb-3 block text-sm font-semibold">Section Order</Label>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={design.sectionOrder}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-1.5">
              {design.sectionOrder.map((id) => (
                <SortableItem key={id} id={id} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      {/* Template */}
      <section className="pb-4">
        <Label className="mb-3 block text-sm font-semibold">Template</Label>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((t) => {
            const selected = design.template === t.name;
            return (
              <button
                key={t.name}
                type="button"
                className={cn(
                  "relative rounded-lg border p-1 text-left transition-all",
                  selected && "ring-2 ring-primary"
                )}
                onClick={() => update("template", t.name)}
              >
                <div className="h-20 rounded bg-muted">
                  <TemplatePreview template={t.name} />
                </div>
                <p className="mt-1 text-center text-xs font-medium">{t.label}</p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
