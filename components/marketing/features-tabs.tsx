"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Briefcase,
  Check,
  FileText,
  Mail,

  MessageSquare,
  PenTool,
  Search,
  Shield,
  Sparkles,
  Target,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AtsAnalysisVisual from "./ats-analysis-visual";
import AiRewriteVisual from "./ai-rewrite-visual";
import JobMatchVisual from "./job-match-visual";

const SCORE_CATEGORIES = [
  { name: "Contact info", desc: "Name, email, phone, location", weight: 10 },
  { name: "Required sections", desc: "Summary, experience, skills, education", weight: 20 },
  { name: "Keyword match", desc: "Role-specific terms recruiters search for", weight: 25 },
  { name: "Measurable results", desc: "Numbers, percentages, impact metrics", weight: 20 },
  { name: "Bullet quality", desc: "Strong action verbs, clear outcomes", weight: 15 },
  { name: "Formatting", desc: "Parseable structure, no tables or columns", weight: 10 },
];

const TABS = [
  {
    id: "ats",
    icon: Search,
    label: "ATS Analysis",
    heading: "Find out why your CV gets rejected",
    desc: "CVEdge runs the same filters recruiters use — across 6 categories and 2,400+ role-specific keywords — so you fix problems before they cost you the interview.",
    points: [
      "Score breakdown across 6 categories with per-issue impact points",
      "2,400+ role-specific keywords across 130+ job roles",
      "Real-time estimated score updates as you edit",
      "One-click keyword add: tap a missing keyword to add it to your skills",
      "Fix All with AI: bulk-rewrite your entire CV in one pass",
      "80+ score guarantee for Pro users — or your money back",
    ],
    cta: "Get started free",
    ctaLink: "/upload-resume",
  },
  {
    id: "rewrite",
    icon: PenTool,
    label: "AI Rewrite",
    heading: "Make every line of your CV count",
    desc: "Every bullet point has a Rewrite button. Pick a mode, refine with plain English, and insert the result with one click. AI never fabricates metrics.",
    points: [
      "4 rewrite modes: ATS keywords, measurable impact, concise phrasing, grammar fix",
      "Refine with natural language: \"make it shorter\", \"add React\", \"more confident\"",
      "Uses [X] placeholders for numbers you fill in — never fabricates",
      "Fix All: rewrites summary + every bullet in one pass to maximise your ATS score",
      "CV Tailor: rewrite your entire CV specifically for a job description",
    ],
    cta: "Get started free",
    ctaLink: "/upload-resume",
  },
  {
    id: "scoring",
    icon: BarChart3,
    label: "Scoring",
    heading: "How we calculate your score",
    desc: "No black box. No guesswork. Every point is explainable, fixable, and transparent. Six weighted categories, each with specific rules you can address one by one.",
    points: [],
    cta: "Get started free",
    ctaLink: "/upload-resume",
    isScoring: true,
  },
  {
    id: "match",
    icon: Target,
    label: "Job Match",
    heading: "See how well you match before you apply",
    desc: "Paste a job description to see a match score, missing keywords, and exactly what to fix. Then tailor your CV or generate a cover letter — all from one screen.",
    points: [
      "Match score with missing vs matched keywords highlighted",
      "CV Tailor: AI rewrites your CV specifically for the job description",
      "Cover letter generation in 3 tones: Professional, Conversational, Confident",
      "JD Red Flag Detector: AI flags unreasonable demands and vague responsibilities",
      "Offer Evaluation: grade job offers across seniority fit, growth, and work-life balance",
      "Salary Insights: market benchmarks for supported roles",
    ],
    cta: "Get started free",
    ctaLink: "/upload-resume",
  },
  {
    id: "export",
    icon: FileText,
    label: "Export & Design",
    heading: "Beautiful PDFs, total design control",
    desc: "12 ATS-optimised templates with full design controls. Export clean PDFs ready to send — or customise every detail from fonts to section order.",
    points: [
      "12 professional templates: Classic, Sharp, Minimal, Executive, Slate, and more",
      "Customise font, accent colour, spacing, margins, bullet style, and section order",
      "Two-column templates with configurable sidebar sections",
      "PDF export: clean, formatted, ATS-friendly — no watermark, ever",
      "Cover letter export: PDF, TXT, or copy to clipboard",
      "Paper size: A4 and US Letter supported",
    ],
    cta: "Browse Templates",
    ctaLink: "/resumes",
  },
];

export function FeaturesTabs() {
  const [active, setActive] = useState("ats");
  const tab = TABS.find((t) => t.id === active)!;

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          {/* Section header */}
          <div className="mb-10 md:mb-14">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider mb-3">
              Features
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Everything you need to go from application to offer letter
            </h2>
          </div>

          {/* Tab triggers */}
          <div className="flex flex-wrap gap-2 mb-10 md:mb-14">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                  active === t.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="grid gap-10 lg:gap-14 lg:grid-cols-2 lg:items-start">
            {/* Left — text */}
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                {tab.heading}
              </h3>
              <p className="mt-4 text-muted-foreground leading-relaxed">
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
                    <li key={p} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>
              )}

              <Button className="mt-6" asChild>
                <Link href={tab.ctaLink}>{tab.cta}</Link>
              </Button>
            </div>

            {/* Right — visual */}
            <div className="hidden lg:block" style={{ filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.06))" }}>
              {active === "ats" && <AtsAnalysisVisual />}
              {active === "rewrite" && (
                <div style={{ borderRadius: 16, overflow: "hidden" }}>
                  <AiRewriteVisual />
                </div>
              )}
              {active === "scoring" && (
                <div className="rounded-2xl border bg-[#f5f0e8] dark:bg-card p-8 flex flex-col items-center justify-center gap-6">
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="10" />
                      <circle cx="60" cy="60" r="52" fill="none" stroke="url(#scoreGrad)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${0.82 * 2 * Math.PI * 52} ${2 * Math.PI * 52}`} />
                      <defs><linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(var(--primary))" /><stop offset="100%" stopColor="#065F46" /></linearGradient></defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold">82</span>
                      <span className="text-xs text-muted-foreground">out of 100</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">Every category has specific, fixable rules. Fix one issue at a time and watch your score rise.</p>
                </div>
              )}
              {active === "match" && (
                <div style={{ borderRadius: 16, overflow: "hidden" }}>
                  <JobMatchVisual />
                </div>
              )}
              {active === "export" && (
                <div className="rounded-2xl bg-[#F7F5F0] dark:bg-card border p-5">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: "Classic", img: "/img/templates/classic.jpg" },
                      { name: "Sharp", img: "/img/templates/sharp.jpg" },
                      { name: "Executive", img: "/img/templates/Executive.jpg" },
                      { name: "Slate", img: "/img/templates/slate.jpg" },
                      { name: "Folio", img: "/img/templates/folio.jpg" },
                      { name: "Divide", img: "/img/templates/divide.jpg" },
                    ].map((t) => (
                      <div key={t.name} className="rounded-xl bg-white dark:bg-background border overflow-hidden group">
                        <div className="aspect-[3/4] overflow-hidden">
                          <img src={t.img} alt={t.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                        </div>
                        <p className="text-[10px] font-medium text-center py-1.5">{t.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
