"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  Check,
  FileText,
  PenTool,
  Search,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/marketing/section-header";
import AiRewriteVisual from "./ai-rewrite-visual";
import JobMatchVisual from "./job-match-visual";
import { TemplateThumbnailImage } from "@/components/shared/template-thumbnail";
import { TEMPLATE_LABELS } from "@/lib/resume/template-labels";

const SCORE_CATEGORIES = [
  { name: "Contact info", desc: "Name, email, phone, location", weight: 10 },
  { name: "Required sections", desc: "Summary, experience, skills, education", weight: 20 },
  { name: "Keyword match", desc: "Role-specific terms recruiters search for", weight: 25 },
  { name: "Measurable results", desc: "Numbers, percentages, impact metrics", weight: 20 },
  { name: "Bullet quality", desc: "Strong action verbs, clear outcomes", weight: 15 },
  { name: "Formatting", desc: "Parseable structure, no tables or columns", weight: 10 },
];

/** A feature line; `pro` marks what the free plan does not include. */
type Point = { text: string; pro?: boolean };

const TABS: {
  id: string;
  icon: typeof Search;
  label: string;
  heading: string;
  desc: string;
  points: Point[];
  cta: string;
  ctaLink: string;
  isScoring?: boolean;
  /** Two short labels pinned to the visual: what it shows at a glance. */
  chips: [string, string];
}[] = [
  {
    id: "ats",
    chips: ["6 categories scored", "2,400+ role keywords"],
    icon: Search,
    label: "ATS Analysis",
    heading: "Find out why your resume gets rejected",
    desc: "CVEdge runs the same filters recruiters use, across 6 categories and 2,400+ role-specific keywords, so you fix problems before they cost you the interview.",
    points: [
      { text: "Your ATS score and top issues, free" },
      { text: "Full report: every issue with impact points, plus missing keywords", pro: true },
      { text: "2,400+ role-specific keywords across 130+ job roles" },
      { text: "Real-time estimated score updates as you edit" },
      { text: "One-click keyword add: tap a missing keyword to add it to your skills", pro: true },
      { text: "Fix All with AI: bulk-rewrite your entire resume in one pass", pro: true },
      { text: "80+ score guarantee for Pro users, or your money back" },
    ],
    cta: "Get started free",
    ctaLink: "/resume-checker",
  },
  {
    id: "rewrite",
    chips: ["4 rewrite modes", "Never invents numbers"],
    icon: PenTool,
    label: "AI Rewrite",
    heading: "Make every line of your resume count",
    desc: "Every bullet point has a Rewrite button. Pick a mode, refine with plain English, and insert the result with one click. AI never fabricates metrics. Included in Pro.",
    points: [
      { text: "4 rewrite modes: ATS keywords, measurable impact, concise phrasing, grammar fix", pro: true },
      { text: "Refine with natural language: \"make it shorter\", \"add React\", \"more confident\"", pro: true },
      { text: "Uses [X] placeholders for numbers you fill in and never fabricates" },
      { text: "Fix All: rewrites summary + every bullet in one pass to maximize your ATS score", pro: true },
      { text: "Tailor CV: rewrite your entire CV specifically for a job description", pro: true },
    ],
    cta: "See Pro plans",
    ctaLink: "/pricing",
  },
  {
    id: "scoring",
    chips: ["6 weighted categories", "See every point"],
    icon: BarChart3,
    label: "Scoring",
    heading: "How we calculate your score",
    desc: "Six weighted categories, each with specific rules. You can see where every point comes from and fix issues one by one.",
    points: [],
    cta: "Get started free",
    ctaLink: "/resume-checker",
    isScoring: true,
  },
  {
    id: "match",
    chips: ["Missing keywords found", "Tailor CV for the job"],
    icon: Target,
    label: "Job Match",
    heading: "See how well you match before you apply",
    desc: "Paste a job description to see a match score, missing keywords, and exactly what to fix. Then tailor your resume or generate a cover letter, all from one screen. Included in Pro.",
    points: [
      { text: "Job Match: score with missing vs matched keywords highlighted", pro: true },
      { text: "Tailor CV: AI rewrites your CV specifically for the job description", pro: true },
      { text: "Cover letters in 3 tones: Professional, Conversational, Confident", pro: true },
      { text: "JD Red Flag Detector: AI flags unreasonable demands and vague responsibilities" },
      { text: "Offer Evaluation: grade job offers across seniority fit, growth, and work-life balance", pro: true },
      { text: "Salary Insights: market benchmarks for supported roles", pro: true },
    ],
    cta: "See Pro plans",
    ctaLink: "/pricing",
  },
  {
    id: "export",
    chips: ["Fonts, colors, spacing", "A4 and US Letter"],
    icon: FileText,
    label: "Export & Design",
    heading: "Beautiful PDFs, total design control",
    desc: "ATS-optimized templates with full design controls. Export PDFs any time; Pro removes the CVEdge footer. Customize every detail from fonts to section order.",
    points: [
      { text: "Professional templates: Classic, Sharp, Minimal, Executive, Slate, and more. All free" },
      { text: "Customize font, accent color, spacing, margins, bullet style, and section order" },
      { text: "Two-column templates with configurable sidebar sections" },
      { text: "PDF export: clean, formatted and ATS-friendly. Free PDFs carry a small CVEdge footer line" },
      { text: "Clean PDFs with no footer", pro: true },
      { text: "Cover letter export: PDF, TXT, or copy to clipboard", pro: true },
      { text: "Paper size: A4 and US Letter supported" },
    ],
    cta: "Browse templates",
    ctaLink: "/resumes",
  },
];

export function FeaturesTabs() {
  const [active, setActive] = useState("ats");
  const tab = TABS.find((t) => t.id === active)!;

  // ARIA tabs keyboard pattern: arrows move between tabs, Home/End jump to the ends.
  function onTabKey(e: React.KeyboardEvent) {
    const i = TABS.findIndex((t) => t.id === active);
    const next =
      e.key === "ArrowRight" ? (i + 1) % TABS.length
      : e.key === "ArrowLeft" ? (i - 1 + TABS.length) % TABS.length
      : e.key === "Home" ? 0
      : e.key === "End" ? TABS.length - 1
      : -1;
    if (next < 0) return;
    e.preventDefault();
    setActive(TABS[next].id);
    document.getElementById(`feature-tab-${TABS[next].id}`)?.focus();
  }

  return (
    <section className="py-16 md:py-28">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <SectionHeader
          eyebrow="Features"
          title="From first application to offer letter"
          sub="Score your resume, fix it, match it to a job and export it, all in one place."
        />

        {/* Segmented control: one track, the active tab lifts out in white. Scrolls sideways on narrow phones. */}
        <div
          role="tablist"
          aria-label="Features"
          onKeyDown={onTabKey}
          className="mb-8 md:mb-10 flex w-full sm:w-auto sm:inline-flex gap-1 overflow-x-auto rounded-2xl bg-[#ebe3d5] dark:bg-muted p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`feature-tab-${t.id}`}
              aria-selected={active === t.id}
              aria-controls="feature-panel"
              tabIndex={active === t.id ? 0 : -1}
              onClick={() => setActive(t.id)}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-medium transition-all ${
                active === t.id
                  ? "bg-background text-primary font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" aria-hidden />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div
          role="tabpanel"
          id="feature-panel"
          aria-labelledby={`feature-tab-${tab.id}`}
          className="grid gap-8 lg:gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,600px)] lg:items-start"
        >
          {/* Text */}
          <div className="min-w-0">
            <h3 className="text-[1.375rem] sm:text-3xl font-bold tracking-tight leading-tight">
              {tab.heading}
            </h3>
            <p className="mt-3 md:mt-4 text-[15px] md:text-base text-muted-foreground leading-relaxed">
              {tab.desc}
            </p>

            {tab.isScoring ? (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SCORE_CATEGORIES.map((cat) => (
                  <div key={cat.name} className="rounded-xl border bg-background p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{cat.name}</p>
                      <span className="text-base font-bold text-primary">{cat.weight}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${cat.weight * 4}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground">{cat.desc}</p>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="mt-6 space-y-3">
                {tab.points.map((p) => (
                  <li key={p.text} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                    <span className="text-sm leading-relaxed">
                      {p.text}
                      {p.pro && (
                        <span className="ml-2 inline-block whitespace-nowrap rounded-full bg-primary/10 px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wider text-[#145f55]">
                          Pro
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <Button className="mt-6 h-11 px-6" asChild>
              <Link href={tab.ctaLink}>{tab.cta}</Link>
            </Button>
          </div>

          {/* Visual stage: tinted panel, the product view as a lifted card, two labels that call out what it shows.
              Shown at every width (it used to be hidden below 1024px). */}
          <div className="relative min-w-0 rounded-[20px] md:rounded-[28px] border border-[#cfe3da] bg-[#e3efe9] dark:border-border dark:bg-muted/40 px-3 pt-9 pb-10 sm:px-8 sm:py-10">
            <div className="overflow-hidden rounded-xl md:rounded-2xl shadow-[0_18px_40px_rgba(20,60,50,0.16),0_2px_6px_rgba(20,60,50,0.08)]">
              <FeatureVisual id={tab.id} />
            </div>
            <span className="absolute left-3 top-2.5 sm:left-4 sm:top-4 inline-flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-xs sm:text-[13px] font-semibold shadow-[0_6px_18px_rgba(20,60,50,0.14)]">
              <span aria-hidden className="h-2 w-2 rounded-full bg-primary" />
              {tab.chips[0]}
            </span>
            <span className="absolute bottom-2.5 right-3 sm:bottom-4 sm:right-4 inline-flex items-center gap-2 rounded-full bg-[#1E3A5F] px-3 py-1.5 text-xs sm:text-[13px] font-semibold text-white shadow-[0_6px_18px_rgba(20,40,70,0.25)]">
              <span aria-hidden className="h-2 w-2 rounded-full bg-[#34D399]" />
              {tab.chips[1]}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The product view for a tab. Kept separate so real editor screenshots can replace these one by one. */
function FeatureVisual({ id }: { id: string }) {
  if (id === "ats") {
    // The real editor ATS panel (ScoreCard + FixList) rendered with Rachel's sample data, not an illustration.
    return (
      <Image
        src="/img/home/feature-ats.jpg"
        width={1120}
        height={1946}
        alt="The ATS panel in the editor: a score of 61 out of 100, a score per category, and the first fix with a Rewrite with AI button"
        sizes="(min-width: 1024px) 540px, 400px"
        className="aspect-[4/5] w-full object-cover object-top"
      />
    );
  }
  if (id === "rewrite") return <AiRewriteVisual />;
  if (id === "match") return <JobMatchVisual />;
  if (id === "scoring") {
    return (
      <div className="bg-[#f5f0e8] dark:bg-card p-8 flex flex-col items-center justify-center gap-6">
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90" aria-hidden>
            <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="10" />
            <circle cx="60" cy="60" r="52" fill="none" stroke="url(#scoreGrad)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${0.82 * 2 * Math.PI * 52} ${2 * Math.PI * 52}`} />
            {/* Theme variables are hex, so var(--primary) directly: hsl(var(--primary)) is invalid and rendered half the ring black. */}
            <defs><linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--primary)" /><stop offset="100%" stopColor="#065F46" /></linearGradient></defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold">82</span>
            <span className="text-xs text-muted-foreground">out of 100</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center max-w-xs">Every category has specific, fixable rules. Fix one issue at a time and watch your score rise.</p>
      </div>
    );
  }
  return (
    <div className="bg-[#F7F5F0] dark:bg-card p-4 sm:p-5">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* People here don't appear in the templates showcase or the hero, so no face repeats on the homepage. */}
        {(["harvard", "canopy", "ember", "electric-lilac", "vantage", "sterling"] as const).map((slug) => (
          <div key={slug} className="rounded-xl bg-white dark:bg-background border overflow-hidden">
            <div className="aspect-[3/4] overflow-hidden">
              <TemplateThumbnailImage template={slug} sizes="(min-width: 1024px) 180px, 30vw" className="w-full h-full object-cover object-top" />
            </div>
            <p className="text-[10px] font-medium text-center py-1.5">{TEMPLATE_LABELS[slug]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
