"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { TemplateName } from "@/lib/resume/types";
import { templateThumbnail } from "@/lib/resume/template-thumbnails";
import { TemplateThumbnailImage, THUMBNAIL_ASPECT } from "@/components/shared/template-thumbnail";
import { useSignupModal } from "@/components/popups/signup-modal";

type TemplateCategory = "all" | "single" | "two-column" | "minimal" | "professional";

interface Template {
  name: string;
  slug: TemplateName;
  category: TemplateCategory[];
  type: string;
  desc: string;
  /** Badges beside the name. The Free/Pro badge is added from the catalogue. */
  tags: string[];
  atsSafe?: boolean;
}

const TEMPLATES: Template[] = [
  { name: "Classic", slug: "classic", category: ["all", "single", "professional"], type: "Single column", desc: "Clean and traditional. ATS-safe. Works for any industry.", tags: ["Popular"] },
  { name: "Orchid", slug: "orchid", category: ["all", "two-column", "professional"], type: "Sidebar left", desc: "Editorial serif headings with a warm sidebar and navy accent corner. Photo-friendly.", tags: ["New"] },
  { name: "Executive Pro", slug: "executive-pro", category: ["all", "two-column", "professional"], type: "Two column", desc: "Bold photo header with dark contact bar. Two-column layout for senior leadership roles.", tags: ["New"] },
  { name: "Aurora", slug: "aurora", category: ["all", "two-column", "professional"], type: "Two column", desc: "Modern two-column with avatar and skill chips. Great for PM, design, and growth roles.", tags: ["New"] },
  { name: "Sharp", slug: "sharp", category: ["all", "single", "professional"], type: "Single column", desc: "Bold headings with clear section dividers.", tags: [] },
  { name: "Coastal", slug: "coastal", category: ["all", "two-column", "professional"], type: "Two column", desc: "Teal accent header with photo and objective band. Creative profile layout.", tags: ["New"] },
  { name: "Minimal", slug: "minimal", category: ["all", "single", "minimal"], type: "Single column", desc: "Maximum whitespace, so each section is easy to scan.", tags: [] },
  { name: "Electric Lilac", slug: "electric-lilac", category: ["all", "two-column", "professional"], type: "Two column", desc: "Bold two-column with vibrant accent sidebar. Photo-friendly for creative roles.", tags: ["New"] },
  { name: "Classic Serif", slug: "classic-serif", category: ["all", "single", "professional"], type: "Single column", desc: "Elegant serif typography with grey section bands. ATS-safe.", tags: [] },
  { name: "Portrait", slug: "portrait", category: ["all", "two-column", "professional"], type: "Two column", desc: "Editorial split-weight name with headshot, plus-marker headings, and light grey canvas.", tags: ["New"] },
  { name: "Regent", slug: "regent", category: ["all", "single", "professional"], type: "Single column", desc: "Refined serif single-column with centered header and hairline rules. Law, finance, consulting.", tags: ["New"] },
  { name: "Meridian", slug: "meridian", category: ["all", "two-column"], type: "Sidebar left", desc: "Mint two-column with icon headings and photo. Suits startup roles.", tags: ["New"] },
  { name: "Vantage", slug: "vantage", category: ["all", "two-column", "professional"], type: "Two column", desc: "Two columns with company and school logos beside every entry. Shows career progression.", tags: ["New"] },
  { name: "Linen", slug: "linen", category: ["all", "two-column", "minimal"], type: "Two column", desc: "Minimalist off-white two-column with grey header blocks and diamond rules.", tags: ["New"] },
  { name: "Graphite", slug: "graphite", category: ["all", "single", "minimal"], type: "Single column", desc: "Grey canvas, white rounded card, pill section headings. Simple black and white.", tags: ["New"] },
  { name: "Sterling", slug: "sterling", category: ["all", "single", "professional"], type: "Single column", desc: "Plain ATS-first specialist resume with a skills table. Serif body, sans headings.", tags: ["New"] },
  { name: "Ember", slug: "ember", category: ["all", "two-column", "professional"], type: "Two column", desc: "Plain-text two-column layout every ATS parser reads cleanly. Contact and skills rail.", tags: ["New"] },
  { name: "Canopy", slug: "canopy", category: ["all", "single"], type: "Single column", desc: "Sage header band, oversized light headings, dedicated Achievements section.", tags: ["New"] },
  { name: "Slate", slug: "sidebar", category: ["all", "two-column"], type: "Sidebar left", desc: "Bold two-column layout. Dark sidebar. Great for design and tech roles.", tags: [] },
  { name: "Wentworth", slug: "wentworth", category: ["all", "single", "minimal"], type: "Single column", desc: "Minimal editorial with split-weight name, circular photo, and accent line.", tags: ["New"] },
  { name: "Bold Accent", slug: "bold-accent", category: ["all", "single"], type: "Single column", desc: "Energetic single-column with accent chips and icon-bordered sections.", tags: ["New"] },
  { name: "Blueprint", slug: "blueprint", category: ["all", "two-column"], type: "Two column", desc: "Editorial two-column with accent header block and bordered body.", tags: ["New"] },
  { name: "Horizon", slug: "two-column", category: ["all", "two-column"], type: "Two column", desc: "Header spans full width. Two columns below for dense content.", tags: [] },
  { name: "Clean Sidebar", slug: "clean-sidebar", category: ["all", "two-column"], type: "Sidebar left", desc: "Warm light sidebar with progress bars and links.", tags: ["New"] },
  { name: "Executive", slug: "executive", category: ["all", "single", "professional"], type: "Single column", desc: "Premium feel for senior roles. Refined typography and spacing.", tags: [] },
  { name: "Onyx", slug: "sidebar-right", category: ["all", "two-column"], type: "Sidebar right", desc: "Right sidebar for skills and education. Clean content hierarchy.", tags: [] },
  { name: "Executive Sidebar", slug: "executive-sidebar", category: ["all", "two-column", "professional"], type: "Sidebar left", desc: "Dark sidebar with photo for corporate and legal feel for senior roles.", tags: ["New"] },
  { name: "Divide", slug: "divide", category: ["all", "two-column"], type: "Two column", desc: "Vertical divider splits content. Balanced left-right layout.", tags: [] },
  { name: "Folio", slug: "folio", category: ["all", "two-column"], type: "Two column", desc: "Colored sidebar with clean white main area. Portfolio-style.", tags: [] },
  { name: "Harvard", slug: "harvard", category: ["all", "single", "professional"], type: "Single column", desc: "Academic-style formatting. Formal and structured.", tags: [] },
  { name: "Ledger", slug: "ledger", category: ["all", "single", "professional"], type: "Single column", desc: "Finance-inspired clean lines. Numbers and metrics stand out.", tags: [] },
];

const FILTERS: { key: TemplateCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "single", label: "Single column" },
  { key: "two-column", label: "Two column" },
  { key: "professional", label: "Professional" },
  { key: "minimal", label: "Minimal" },
];

/** `proSlugs` comes from the template catalogue, so the badges follow /admin/plans. */
export function TemplateShowcase({ proSlugs }: { proSlugs: string[] }) {
  const [filter, setFilter] = useState<TemplateCategory>("all");
  const { showSignupModal } = useSignupModal();

  const filtered = TEMPLATES.filter((t) => t.category.includes(filter));

  return (
    <div className="mx-auto max-w-5xl">
      {/* Filter tabs */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex gap-1 rounded-xl bg-muted p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                filter === f.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Uniform template grid — 3 per row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((t) => (
          <button
            key={t.slug}
            type="button"
            onClick={() => showSignupModal({ trigger: "template_click", templateName: t.name, templateSlug: t.slug, templateImg: templateThumbnail(t.slug).src })}
            className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow text-left"
          >
            <div className={`${THUMBNAIL_ASPECT} bg-muted overflow-hidden relative`}>
              <TemplateThumbnailImage
                template={t.slug}
                className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent" />
            </div>
            <div className="px-3 py-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">{t.name}</h3>
                {[proSlugs.includes(t.slug) ? "Pro" : "Free", ...t.tags].map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                      tag === "Popular" ? "bg-[#065F46] text-white" :
                      tag === "Free" ? "bg-[#D1FAE5] text-[#065F46]" :
                      tag === "Pro" ? "bg-[#1E3A5F] text-white" :
                      "bg-muted text-muted-foreground"
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{t.desc}</p>
              <span className="mt-2 inline-flex items-center justify-center rounded-lg bg-[#065F46] px-5 py-2.5 text-sm font-semibold text-white group-hover:bg-[#065F46]/90 transition-colors">
                Use this template
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
