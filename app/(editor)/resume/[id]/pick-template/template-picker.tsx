"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Loader2, Sparkles } from "lucide-react";

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
  { name: "Classic", slug: "classic", img: "/img/templates/classic.jpg", category: ["all", "single", "professional"], type: "Single column", desc: "Clean and traditional. ATS-safe. Works for any industry.", tags: ["Popular"] },
  { name: "Orchid", slug: "orchid", img: "/img/templates/orchid.jpg", category: ["all", "two-column", "professional"], type: "Sidebar left", desc: "Editorial serif headings with a warm sidebar and navy accent corner. Photo-friendly.", tags: ["New"] },
  { name: "Executive Pro", slug: "executive-pro", img: "/img/templates/executive-pro.jpg", category: ["all", "two-column", "professional"], type: "Two column", desc: "Bold photo header with dark contact bar. Two-column layout for senior leadership roles.", tags: ["Pro", "New"] },
  { name: "Aurora", slug: "aurora", img: "/img/templates/aurora.jpg", category: ["all", "two-column", "professional"], type: "Two column", desc: "Modern two-column with avatar and skill chips. Great for PM, design, and growth roles.", tags: ["New"] },
  { name: "Sharp", slug: "sharp", img: "/img/templates/sharp.jpg", category: ["all", "single", "professional"], type: "Single column", desc: "Bold headings with clear section dividers. Confident and modern.", tags: [] },
  { name: "Coastal", slug: "coastal", img: "/img/templates/coastal.jpg", category: ["all", "two-column", "professional"], type: "Two column", desc: "Teal accent header with photo and objective band. Creative profile layout.", tags: ["New"] },
  { name: "Minimal", slug: "minimal", img: "/img/templates/minimal.jpg", category: ["all", "single", "minimal"], type: "Single column", desc: "Maximum whitespace. Lets your content breathe. Elegant simplicity.", tags: [] },
  { name: "Electric Lilac", slug: "electric-lilac", img: "/img/templates/electric-lilac.jpg", category: ["all", "two-column", "professional"], type: "Two column", desc: "Bold two-column with vibrant accent sidebar. Photo-friendly for creative roles.", tags: ["Pro", "New"] },
  { name: "Classic Serif", slug: "classic-serif", img: "/img/templates/classic-serif.png", category: ["all", "single", "professional"], type: "Single column", desc: "Elegant serif typography with grey section bands. ATS-safe. Traditional and timeless.", tags: [] },
  { name: "Portrait", slug: "portrait", img: "/img/templates/portrait.jpg", category: ["all", "two-column", "professional"], type: "Two column", desc: "Editorial split-weight name with headshot, plus-marker headings, and light grey canvas.", tags: ["New"] },
  { name: "Slate", slug: "sidebar", img: "/img/templates/slate.jpg", category: ["all", "two-column"], type: "Sidebar left", desc: "Bold two-column layout. Dark sidebar. Great for design and tech roles.", tags: [] },
  { name: "Wentworth", slug: "wentworth", img: "/img/templates/wentworth.jpg", category: ["all", "single", "minimal"], type: "Single column", desc: "Minimal editorial with split-weight name, circular photo, and accent line.", tags: ["Pro", "New"] },
  { name: "Bold Accent", slug: "bold-accent", img: "/img/templates/bold-accent.jpg", category: ["all", "single"], type: "Single column", desc: "Energetic single-column with accent chips and icon-bordered sections.", tags: ["New"] },
  { name: "Blueprint", slug: "blueprint", img: "/img/templates/blueprint.jpg", category: ["all", "two-column"], type: "Two column", desc: "Editorial two-column with accent header block and bordered body.", tags: ["New"] },
  { name: "Horizon", slug: "two-column", img: "/img/templates/horizon.jpg", category: ["all", "two-column"], type: "Two column", desc: "Header spans full width. Two columns below for dense content.", tags: [] },
  { name: "Clean Sidebar", slug: "clean-sidebar", img: "/img/templates/clean-sidebar.jpg", category: ["all", "two-column"], type: "Sidebar left", desc: "Warm light sidebar with progress bars and links. Versatile and friendly.", tags: ["New"] },
  { name: "Executive", slug: "executive", img: "/img/templates/executive.jpg", category: ["all", "single", "professional"], type: "Single column", desc: "Premium feel for senior roles. Refined typography and spacing.", tags: [] },
  { name: "Onyx", slug: "sidebar-right", img: "/img/templates/onyx.jpg", category: ["all", "two-column"], type: "Sidebar right", desc: "Right sidebar for skills and education. Clean content hierarchy.", tags: [] },
  { name: "Executive Sidebar", slug: "executive-sidebar", img: "/img/templates/executive-sidebar.jpg", category: ["all", "two-column", "professional"], type: "Sidebar left", desc: "Dark sidebar with photo — corporate and legal feel for senior roles.", tags: ["Pro", "New"] },
  { name: "Divide", slug: "divide", img: "/img/templates/divide.jpg", category: ["all", "two-column"], type: "Two column", desc: "Vertical divider splits content. Balanced left-right layout.", tags: [] },
  { name: "Folio", slug: "folio", img: "/img/templates/folio.jpg", category: ["all", "two-column"], type: "Two column", desc: "Coloured sidebar with clean white main area. Portfolio-style.", tags: [] },
  { name: "Harvard", slug: "harvard", img: "/img/templates/harward.jpg", category: ["all", "single", "professional"], type: "Single column", desc: "Academic-style formatting. Formal and structured.", tags: [] },
  { name: "Ledger", slug: "ledger", img: "/img/templates/ledger.jpg", category: ["all", "single", "professional"], type: "Single column", desc: "Finance-inspired clean lines. Numbers and metrics stand out.", tags: [] },
];

const FILTERS: { key: TemplateCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "single", label: "Single column" },
  { key: "two-column", label: "Two column" },
  { key: "professional", label: "Professional" },
  { key: "minimal", label: "Minimal" },
];

export function TemplatePicker({ cvId, title }: { cvId: string; title: string | null }) {
  const router = useRouter();
  const [filter, setFilter] = useState<TemplateCategory>("all");
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState<Record<string, boolean>>({});

  const filtered = TEMPLATES.filter((t) => t.category.includes(filter));

  async function handleSelect(slug: string) {
    if (selecting) return;
    setSelecting(slug);
    setError(null);

    const res = await fetch(`/api/cv/${cvId}/set-template`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template: slug }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not save template. Please try again.");
      setSelecting(null);
      return;
    }

    router.push(`/resume/${cvId}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-10 md:mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-wider mb-3 sm:mb-4">
            <Sparkles className="h-3 w-3" />
            Your resume is ready
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Pick a template to get started
          </h1>
          <p className="mt-2.5 sm:mt-3 text-sm sm:text-base text-muted-foreground px-2">
            {title
              ? `We parsed "${title}" — now choose a look. You can change it any time.`
              : "Every template is ATS-optimised and free. You can change it any time."}
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-auto max-w-5xl mb-6 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Filter tabs — horizontally scrollable on mobile */}
        <div className="mb-8 md:mb-10 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex sm:justify-center">
          <div className="inline-flex gap-1 rounded-xl bg-muted p-1 overflow-x-auto scrollbar-none max-w-full">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap",
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

        {/* Template grid */}
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {filtered.map((t) => {
              const isSelecting = selecting === t.slug;
              const isDisabled = selecting !== null && !isSelecting;
              return (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => handleSelect(t.slug)}
                  disabled={isDisabled}
                  className={cn(
                    "group rounded-xl border bg-card overflow-hidden transition-all text-left",
                    isDisabled
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:shadow-md hover:border-primary/40 active:scale-[0.98]"
                  )}
                >
                  <div className="aspect-[1242/1754] bg-muted overflow-hidden relative">
                    {t.img && !imgFailed[t.slug] ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={t.img}
                          alt={`${t.name} CV template`}
                          className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
                          loading="lazy"
                          onError={() => setImgFailed((prev) => ({ ...prev, [t.slug]: true }))}
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-xs text-muted-foreground px-3 text-center">
                        <div className="font-semibold text-foreground">{t.name}</div>
                        <div className="text-[10px]">Preview unavailable</div>
                      </div>
                    )}
                    {isSelecting && (
                      <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="px-2.5 py-2 sm:px-3 sm:py-2.5">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <h3 className="text-xs sm:text-sm font-semibold">{t.name}</h3>
                      {t.tags.map((tag) => (
                        <span
                          key={tag}
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                            tag === "Popular"
                              ? "bg-[#065F46] text-white"
                              : tag === "Pro"
                              ? "bg-[#1E3A5F] text-white"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="ml-auto text-[10px] text-muted-foreground hidden sm:inline">
                        {t.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 hidden sm:block">
                      {t.desc}
                    </p>
                    <span
                      className={cn(
                        "mt-2 inline-flex w-full items-center justify-center rounded-lg px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-colors",
                        isSelecting
                          ? "bg-primary/60 text-primary-foreground"
                          : "bg-[#065F46] text-white group-hover:bg-[#065F46]/90"
                      )}
                    >
                      {isSelecting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin mr-1.5 sm:mr-2" />
                          <span className="hidden sm:inline">Loading editor…</span>
                          <span className="sm:hidden">Loading…</span>
                        </>
                      ) : (
                        <>
                          <span className="hidden sm:inline">Use this template</span>
                          <span className="sm:hidden">Select</span>
                        </>
                      )}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
