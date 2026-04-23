"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSignupModal } from "@/components/popups/signup-modal";

type TemplateCategory = "all" | "single" | "two-column" | "minimal" | "professional";

interface Template {
  name: string;
  slug: string;
  img: string | null;
  category: TemplateCategory[];
  type: string;
  desc: string;
  tags: string[];
  atsSafe?: boolean;
}

const TEMPLATES: Template[] = [
  { name: "Classic", slug: "classic", img: "/img/templates/classic.jpg", category: ["all", "single", "professional"], type: "Single column", desc: "Clean and traditional. ATS-safe. Works for any industry.", tags: ["Free", "Popular"] },
  { name: "Orchid", slug: "orchid", img: "/img/templates/orchid.jpg", category: ["all", "two-column", "professional"], type: "Sidebar left", desc: "Editorial serif headings with a warm sidebar and navy accent corner. Photo-friendly.", tags: ["Free", "New"] },
  { name: "Executive Pro", slug: "executive-pro", img: "/img/templates/executive-pro.jpg", category: ["all", "two-column", "professional"], type: "Two column", desc: "Bold photo header with dark contact bar. Two-column layout for senior leadership roles.", tags: ["Pro", "New"] },
  { name: "Aurora", slug: "aurora", img: "/img/templates/aurora.jpg", category: ["all", "two-column", "professional"], type: "Two column", desc: "Modern two-column with avatar and skill chips. Great for PM, design, and growth roles.", tags: ["Free", "New"] },
  { name: "Sharp", slug: "sharp", img: "/img/templates/sharp.jpg", category: ["all", "single", "professional"], type: "Single column", desc: "Bold headings with clear section dividers. Confident and modern.", tags: ["Free"] },
  { name: "Coastal", slug: "coastal", img: "/img/templates/coastal.jpg", category: ["all", "two-column", "professional"], type: "Two column", desc: "Teal accent header with photo and objective band. Creative profile layout.", tags: ["Free", "New"] },
  { name: "Minimal", slug: "minimal", img: "/img/templates/minimal.jpg", category: ["all", "single", "minimal"], type: "Single column", desc: "Maximum whitespace. Lets your content breathe. Elegant simplicity.", tags: ["Free"] },
  { name: "Electric Lilac", slug: "electric-lilac", img: "/img/templates/electric-lilac.jpg", category: ["all", "two-column", "professional"], type: "Two column", desc: "Bold two-column with vibrant accent sidebar. Photo-friendly for creative roles.", tags: ["Pro", "New"] },
  { name: "Classic Serif", slug: "classic-serif", img: "/img/templates/classic-serif.png", category: ["all", "single", "professional"], type: "Single column", desc: "Elegant serif typography with grey section bands. ATS-safe. Traditional and timeless.", tags: ["Free"] },
  { name: "Portrait", slug: "portrait", img: "/img/templates/portrait.jpg", category: ["all", "two-column", "professional"], type: "Two column", desc: "Editorial split-weight name with headshot, plus-marker headings, and light grey canvas.", tags: ["Free", "New"] },
  { name: "Slate", slug: "sidebar", img: "/img/templates/slate.jpg", category: ["all", "two-column"], type: "Sidebar left", desc: "Bold two-column layout. Dark sidebar. Great for design and tech roles.", tags: ["Free"] },
  { name: "Wentworth", slug: "wentworth", img: "/img/templates/wentworth.jpg", category: ["all", "single", "minimal"], type: "Single column", desc: "Minimal editorial with split-weight name, circular photo, and accent line.", tags: ["Pro", "New"] },
  { name: "Bold Accent", slug: "bold-accent", img: "/img/templates/bold-accent.jpg", category: ["all", "single"], type: "Single column", desc: "Energetic single-column with accent chips and icon-bordered sections.", tags: ["Free", "New"] },
  { name: "Blueprint", slug: "blueprint", img: "/img/templates/blueprint.jpg", category: ["all", "two-column"], type: "Two column", desc: "Editorial two-column with accent header block and bordered body.", tags: ["Free", "New"] },
  { name: "Horizon", slug: "two-column", img: "/img/templates/horizon.jpg", category: ["all", "two-column"], type: "Two column", desc: "Header spans full width. Two columns below for dense content.", tags: ["Free"] },
  { name: "Clean Sidebar", slug: "clean-sidebar", img: "/img/templates/clean-sidebar.jpg", category: ["all", "two-column"], type: "Sidebar left", desc: "Warm light sidebar with progress bars and links. Versatile and friendly.", tags: ["Free", "New"] },
  { name: "Executive", slug: "executive", img: "/img/templates/executive.jpg", category: ["all", "single", "professional"], type: "Single column", desc: "Premium feel for senior roles. Refined typography and spacing.", tags: ["Free"] },
  { name: "Onyx", slug: "sidebar-right", img: "/img/templates/onyx.jpg", category: ["all", "two-column"], type: "Sidebar right", desc: "Right sidebar for skills and education. Clean content hierarchy.", tags: ["Free"] },
  { name: "Executive Sidebar", slug: "executive-sidebar", img: "/img/templates/executive-sidebar.jpg", category: ["all", "two-column", "professional"], type: "Sidebar left", desc: "Dark sidebar with photo — corporate and legal feel for senior roles.", tags: ["Pro", "New"] },
  { name: "Divide", slug: "divide", img: "/img/templates/divide.jpg", category: ["all", "two-column"], type: "Two column", desc: "Vertical divider splits content. Balanced left-right layout.", tags: ["Free"] },
  { name: "Folio", slug: "folio", img: "/img/templates/folio.jpg", category: ["all", "two-column"], type: "Two column", desc: "Coloured sidebar with clean white main area. Portfolio-style.", tags: ["Free"] },
  { name: "Harvard", slug: "harvard", img: "/img/templates/harward.jpg", category: ["all", "single", "professional"], type: "Single column", desc: "Academic-style formatting. Formal and structured.", tags: ["Free"] },
  { name: "Ledger", slug: "ledger", img: "/img/templates/ledger.jpg", category: ["all", "single", "professional"], type: "Single column", desc: "Finance-inspired clean lines. Numbers and metrics stand out.", tags: ["Free"] },
];

const FILTERS: { key: TemplateCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "single", label: "Single column" },
  { key: "two-column", label: "Two column" },
  { key: "professional", label: "Professional" },
  { key: "minimal", label: "Minimal" },
];

export function TemplateShowcase() {
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
            onClick={() => showSignupModal({ trigger: "template_click", templateName: t.name, templateSlug: t.slug, templateImg: t.img ?? undefined })}
            className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow text-left"
          >
            <div className="aspect-[1242/1754] bg-muted overflow-hidden relative">
              {t.img ? (
                <>
                  <img
                    src={t.img}
                    alt={`${t.name} CV template`}
                    className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">Coming soon</div>
              )}
            </div>
            <div className="px-3 py-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">{t.name}</h3>
                {t.tags.map((tag) => (
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
