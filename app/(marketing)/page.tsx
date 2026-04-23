import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Briefcase,
  Brain,
  Check,
  DollarSign,
  Search,
  Sparkles,
  Target,
  Upload,
} from "lucide-react";



import { FaqSection } from "./faq-section";
import { CtaSection } from "@/components/shared/cta-section";
import { FeaturesTabs } from "@/components/marketing/features-tabs";
import { LogoCarousel } from "@/components/marketing/logo-carousel";
import { TestimonialsCarousel } from "@/components/marketing/testimonials-carousel";
import { TRENDING_ROLES } from "@/lib/jobs/role-categories";

export const metadata: Metadata = {
  title: "Free ATS Resume Scanner — Check Your ATS Score in 60 Seconds | CVEdge",
  description: "Your resume is getting filtered out by ATS software. CVEdge scans your resume, shows your real ATS score, and fixes critical issues with AI. Free to start. Used by 2,400+ job seekers.",
  alternates: { canonical: "https://www.thecvedge.com" },
};

// Revalidate every hour — homepage stats don't need to be real-time
export const revalidate = 3600;


const COMPARISON = [
  { feature: "Role-specific keywords", us: "130+ roles", them: "Generic only" },
  { feature: "AI bullet rewrite", us: "4 modes", them: "Not available" },
  { feature: "Real-time score updates", us: "As you type", them: "Not available" },
  { feature: "Job description matching", us: "Yes", them: "Not available" },
  { feature: "AI job search with match scores", us: "Free", them: "Not available" },
  { feature: "Cover letter generation", us: "Yes", them: "Not available" },
  { feature: "Watermark-free PDFs", us: "Free plan", them: "Paid only" },
  { feature: "Price to start", us: "Free", them: "$20-30/month" },
];

export default async function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CVEdge",
    url: "https://www.thecvedge.com",
    description: "Free ATS resume scanner. Check your ATS score, fix critical issues with AI, and start getting interview calls. Used by 2,400+ job seekers.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free forever for job seekers" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "124" },
    featureList: ["ATS Score Analysis", "AI CV Rewriting", "Job Match Scoring", "Free AI Job Search", "Cover Letter Generation", "Interview Coach", "12 Professional Templates"],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "What is ATS software?", acceptedAnswer: { "@type": "Answer", text: "ATS (Applicant Tracking System) software automatically filters CVs before a human recruiter reads them. 75% of CVs are rejected by ATS before anyone sees them." } },
      { "@type": "Question", name: "Is CVEdge really free?", acceptedAnswer: { "@type": "Answer", text: "Yes. CVEdge is free forever for job seekers. All core features including ATS scoring, AI rewrites, and templates are free." } },
      { "@type": "Question", name: "What is the ATS score guarantee?", acceptedAnswer: { "@type": "Answer", text: "CVEdge guarantees an 80+ ATS score after using Fix All with AI. If you do not reach 80+, contact us within 14 days for a full refund." } },
      { "@type": "Question", name: "Does CVEdge have a job search?", acceptedAnswer: { "@type": "Answer", text: "Yes. CVEdge includes a free AI job search that matches jobs to your CV. Every listing shows a match score so you apply to the right roles." } },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-[#f5f0e8] dark:bg-background">
        {/* Decorative gradient blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-primary/[0.07] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[480px] w-[480px] rounded-full bg-[#1E3A5F]/[0.06] blur-3xl" />

        <div className="relative mx-auto max-w-[1200px] px-6 pt-10 pb-10 sm:pt-14 sm:pb-12 md:pt-16 md:pb-14">
          {/* Centered copy */}
          <div className="mx-auto flex flex-col items-center text-center gap-4 max-w-3xl">
            <h1 className="text-[2.25rem] sm:text-[3rem] md:text-[3.5rem] font-bold tracking-[-0.025em] leading-[1.12]">
              Your resume isn&apos;t getting rejected.{" "}
              <span className="bg-gradient-to-r from-primary to-[#1E3A5F] bg-clip-text text-transparent">It&apos;s getting filtered out.</span>
            </h1>
            <p className="max-w-[580px] text-base sm:text-lg text-muted-foreground leading-relaxed">
              Get a real ATS score, fix critical issues, and start getting interview calls — in under 10 minutes.
            </p>
            <Button size="lg" className="h-12 px-8 text-[0.9375rem] font-medium mt-1 shadow-md shadow-primary/20" asChild>
              <Link href="/upload-resume">Scan my resume free</Link>
            </Button>

            {/* Trust line */}
            <p className="text-sm text-muted-foreground mt-1">
              Trusted by 2,400+ job seekers &middot; Avg score improvement +18 points
            </p>
          </div>

          {/* Product screenshot */}
          <div className="relative mt-8 sm:mt-10 md:mt-12 mx-auto max-w-[1100px]">
            <div className="rounded-xl border-2 border-primary/15 shadow-2xl overflow-hidden ring-1 ring-primary/5">
              <Image
                src="/img/cover.webp"
                alt="CVEdge ATS resume scanner showing score breakdown and keyword analysis"
                width={2200}
                height={1167}
                priority
                sizes="(max-width: 1100px) 100vw, 1100px"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── LOGO CAROUSEL ─── */}
      <LogoCarousel />

      {/* ─── FEATURES (tabbed) ─── */}
      <FeaturesTabs />

      {/* ─── TEMPLATES + JOB SEARCH + INTERVIEW COACH ─── */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-[1200px] space-y-6">
            {/* Row 1 — Templates (full width) */}
            <div className="rounded-[2rem] bg-[#1E3A5F] dark:bg-[#0f2340] border border-[#2A4F7A]/40 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="flex flex-col items-start justify-center gap-5 px-8 sm:px-12 lg:px-14 py-14 lg:py-16">
                  <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/80 uppercase tracking-wider">Templates</span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.025em] leading-[1.1] text-white">
                    Professional<br />Templates
                  </h2>
                  <p className="max-w-[380px] text-base sm:text-lg text-white/70 leading-relaxed">
                    12 ATS-optimised templates, all free. Every design passes automated filters and looks great on screen.
                  </p>
                  <Button size="lg" className="h-12 px-8 text-[0.9375rem] font-medium bg-white text-[#1E3A5F] hover:bg-white/90" asChild>
                    <Link href="/resumes">Browse templates</Link>
                  </Button>
                </div>
                <div className="overflow-hidden p-6 lg:p-8">
                  <div className="flex gap-3 items-start">
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-white">
                        <img src="/img/templates/aurora.jpg" alt="Aurora template" className="w-full h-auto" loading="lazy" />
                      </div>
                      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-white">
                        <img src="/img/templates/electric-lilac.jpg" alt="Electric Lilac template" className="w-full h-auto" loading="lazy" />
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-3 mt-10">
                      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-white">
                        <img src="/img/templates/wentworth.jpg" alt="Wentworth template" className="w-full h-auto" loading="lazy" />
                      </div>
                      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-white">
                        <img src="/img/templates/clean-sidebar.jpg" alt="Clean Sidebar template" className="w-full h-auto" loading="lazy" />
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-3 mt-4">
                      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-white">
                        <img src="/img/templates/blueprint.jpg" alt="Blueprint template" className="w-full h-auto" loading="lazy" />
                      </div>
                      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-white">
                        <img src="/img/templates/bold-accent.jpg" alt="Bold Accent template" className="w-full h-auto" loading="lazy" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2 — Job Search + Interview Coach (side by side) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Job Search */}
              <div className="rounded-[2rem] bg-[#065F46] border border-[#065F46]/20 p-8 sm:p-10 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Free AI Job Search</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                  Find jobs that match your CV
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Stop scrolling irrelevant listings. CVEdge matches jobs to your CV and shows a match score for every role.
                </p>
                <ul className="space-y-2 mt-1">
                  {[
                    "AI match score for every listing",
                    "Filter by location, type, salary, remote",
                    "Save jobs and track applications",
                    "Up to 5 preferred locations",
                  ].map((p) => (
                    <li key={p} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#34D399]" />
                      <span className="text-sm text-white/90 leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-3">
                  <Button className="h-11 px-7 text-sm font-medium bg-white text-[#065F46] hover:bg-white/90" asChild>
                    <Link href="/jobs">Search jobs free</Link>
                  </Button>
                </div>
              </div>

              {/* Interview Coach */}
              <div className="rounded-[2rem] bg-[#1E3A5F] dark:bg-[#0f2340] border border-[#2A4F7A]/40 p-8 sm:p-10 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Interview Coach</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                  Walk into every interview prepared
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Build a library of STAR stories from your career. Before any interview, get a ranked shortlist matched to the job.
                </p>
                <ul className="space-y-2 mt-1">
                  {[
                    "AI extracts stories from CV, portfolio, GitHub",
                    "STAR framework pre-filled by AI",
                    "Quality scoring (0–10) per story",
                    "Job-matched prep with talking points",
                  ].map((p) => (
                    <li key={p} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#34D399]" />
                      <span className="text-sm text-white/90 leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-3">
                  <Button className="h-11 px-7 text-sm font-medium bg-white text-[#1E3A5F] hover:bg-white/90" asChild>
                    <Link href="/interview-prep">Start interview prep</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Row 3 — USP Stats */}
            <div className="rounded-[2rem] overflow-hidden">
              {/* CTA banner */}
              <div className="bg-[#065F46] px-6 py-8 sm:py-10 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Land your next role faster</h2>
                <p className="mt-1.5 text-white/70 text-sm">AI-powered resume builder and ATS scorer</p>
                <Button size="default" className="mt-4 h-10 px-7 text-sm font-medium bg-[#34D399] hover:bg-[#2fc48d] text-[#065F46] shadow-md" asChild>
                  <Link href="/upload-resume">Check my ATS score free</Link>
                </Button>
              </div>
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5 bg-card dark:bg-muted/30">
                {[
                  { icon: Search, stat: "130+", title: "Role keyword sets", desc: "Not generic lists" },
                  { icon: Sparkles, stat: "4 modes", title: "AI bullet rewrite", desc: "Rewrite, expand, shorten, quantify" },
                  { icon: Activity, stat: "Live", title: "Score updates", desc: "As you type, not after saving" },
                  { icon: DollarSign, stat: "$0", title: "To start", desc: "Others charge $20\u201330/mo" },
                ].map((s) => (
                  <div key={s.title} className="rounded-xl bg-background border border-border/50 p-4 sm:p-5 space-y-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#065F46] text-white">
                      <s.icon size={16} />
                    </div>
                    <p className="text-lg sm:text-xl font-bold tracking-tight">{s.stat}</p>
                    <div>
                      <p className="text-sm font-semibold">{s.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="bg-muted/30 scroll-mt-16">
        <div className="container mx-auto px-4 py-20 md:py-28">
          {/* Header */}
          <div className="max-w-5xl mx-auto mb-14 md:mb-16">
            <p className="text-xs sm:text-sm font-semibold tracking-widest text-primary uppercase">How it works</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-3">From rejected to interview-ready in 3 steps</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-4 leading-relaxed max-w-xl">Upload your resume, see exactly what&apos;s wrong, and fix everything — before the recruiter ever sees it.</p>
          </div>

          {/* Step cards */}
          <div className="mx-auto max-w-5xl relative mb-8 md:mb-10">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-[28px] left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-px bg-primary/15 z-0" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              {[
                {
                  step: "01",
                  icon: Upload,
                  title: "Upload your resume",
                  body: "Drop your PDF or paste text. AI parses every section in seconds — no manual entry needed.",
                  proofLabel: "Parsed in seconds",
                  proof: <span className="inline-block bg-[#D1FAE5] text-[#065F46] rounded-md px-2.5 py-1 text-xs font-medium">14 experiences found</span>,
                },
                {
                  step: "02",
                  icon: Sparkles,
                  title: "Get your ATS analysis",
                  body: "See your score, missing keywords, formatting errors, and exactly what to fix — ranked by impact.",
                  proofLabel: "Answer quality score",
                  proof: (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-primary/10"><div className="h-2 rounded-full bg-primary" style={{ width: "80%" }} /></div>
                      <span className="text-sm font-semibold text-primary">8/10</span>
                    </div>
                  ),
                },
                {
                  step: "03",
                  icon: Target,
                  title: "Fix and optimise",
                  body: "Apply AI suggestions with one click. Rewrite bullets, add keywords, and watch your score climb.",
                  proofLabel: "Top match for this role",
                  proof: <p className="text-xs text-[#065F46] font-semibold truncate">#1 Improving Engagement Metrics — 94%</p>,
                },
              ].map((s) => (
                <div key={s.title} className="bg-background border border-border/60 rounded-2xl p-6 sm:p-7 flex flex-col items-start gap-3 relative z-10 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shrink-0">
                    <s.icon size={20} className="text-primary-foreground" />
                  </div>
                  <p className="text-sm font-bold text-foreground">{s.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                  <div className="bg-muted/50 border border-border/40 rounded-xl p-3.5 w-full mt-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-2">{s.proofLabel}</p>
                    {s.proof}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pain quote row */}
          <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { quote: "\u201cI know I did good work but I can never remember specifics in the moment.\u201d", resolve: "Every achievement, structured and saved" },
              { quote: "\u201cI prep for hours then get asked something different and freeze.\u201d", resolve: "8 themes covered, always ready" },
              { quote: "\u201cI give the same stories for every role even when they\u2019re not the best fit.\u201d", resolve: "Role-matched story shortlist" },
            ].map((p) => (
              <div key={p.resolve} className="bg-primary/[0.04] border border-primary/10 rounded-xl p-5">
                <p className="text-sm text-muted-foreground italic leading-relaxed mb-3">{p.quote}</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                  <p className="text-sm font-medium text-primary">{p.resolve}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY CVEDGE ─── */}
      <section className="bg-muted/30 py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-10 md:mb-14 max-w-[1100px] mx-auto">
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">Why CVEdge</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mt-3">Built for real people, not robots</h2>
          </div>

          {/* Card container */}
          <div className="mx-auto max-w-[1100px] rounded-[2rem] bg-[#f5f0e8] dark:bg-card border border-border/40 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr]">
              {/* Left — Comparison table on dark green */}
              <div className="bg-[#065F46] p-8 sm:p-10">
                <p className="text-xs font-semibold text-white/60 uppercase tracking-[0.2em] mb-6">How we compare</p>
                {/* Table header */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-x-6 mb-2 pb-3 border-b border-white/15">
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Feature</p>
                  <p className="text-xs font-bold text-white uppercase tracking-wider text-center w-24">CVEdge</p>
                  <p className="text-xs font-medium text-white/40 uppercase tracking-wider text-center w-20">Others</p>
                </div>
                {/* Table rows */}
                {COMPARISON.map((row, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-x-6 py-3.5 border-b border-white/10 last:border-b-0">
                    <p className="text-sm font-medium text-white">{row.feature}</p>
                    <p className="text-sm font-semibold text-[#34D399] text-center w-24">{row.us.includes("Yes") ? `\u2713 ${row.us}` : row.us}</p>
                    <p className="text-sm text-white/30 text-center w-20 line-through">{row.them}</p>
                  </div>
                ))}
              </div>

              {/* Right — Before/After + trust */}
              <div className="p-8 sm:p-10 flex flex-col gap-6">
                <h3 className="text-xl font-bold tracking-tight">What changes in 8 minutes</h3>

                {/* Before / After cards */}
                <div className="flex items-center gap-4">
                  {/* Before */}
                  <div className="flex-1 rounded-xl border border-border/60 bg-background p-4 space-y-3">
                    <p className="text-[10px] uppercase tracking-[1.5px] text-muted-foreground font-medium">Before</p>
                    <div className="space-y-1.5">
                      <div className="h-2 rounded bg-[#D1D5DB] w-[55%]" />
                      <div className="h-1.5 rounded bg-[#E5E7EB] w-[80%]" />
                      <div className="h-1.5 rounded bg-[#E5E7EB] w-[65%]" />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <svg width="32" height="32" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="19" stroke="#FECACA" strokeWidth="3"/><circle cx="22" cy="22" r="19" stroke="#DC2626" strokeWidth="3" strokeDasharray="72 120" strokeLinecap="round" transform="rotate(-90 22 22)"/><text x="22" y="25" textAnchor="middle" fill="#DC2626" fontWeight="800" fontSize="13" fontFamily="system-ui">61</text></svg>
                      <p className="text-xs font-semibold text-[#DC2626]">Rejected</p>
                    </div>
                  </div>

                  {/* Arrow + label */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <p className="text-[10px] text-muted-foreground font-medium">8 min</p>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-foreground" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>

                  {/* After */}
                  <div className="flex-1 rounded-xl border border-[#6EE7B7] bg-background p-4 space-y-3">
                    <p className="text-[10px] uppercase tracking-[1.5px] text-[#065F46] font-medium">After</p>
                    <div className="space-y-1.5">
                      <div className="h-2 rounded bg-[#065F46] w-[55%]" />
                      <div className="h-1.5 rounded bg-[#34D399] w-[80%]" />
                      <div className="h-1.5 rounded bg-[#6EE7B7] w-[65%]" />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <svg width="32" height="32" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="19" stroke="#6EE7B7" strokeWidth="3"/><circle cx="22" cy="22" r="19" stroke="#065F46" strokeWidth="3" strokeDasharray="112 120" strokeLinecap="round" transform="rotate(-90 22 22)"/><text x="22" y="25" textAnchor="middle" fill="#065F46" fontWeight="800" fontSize="13" fontFamily="system-ui">94</text></svg>
                      <p className="text-xs font-semibold text-[#065F46]">Ready</p>
                    </div>
                  </div>
                </div>

                {/* Trust points */}
                <div className="space-y-3 pt-2">
                  {[
                    { title: "Never fabricates", desc: "Uses [X] placeholders — your words, not ours" },
                    { title: "Your experience only", desc: "Nothing invented — every point explained" },
                    { title: "Fully transparent scoring", desc: "See exactly why your score changed" },
                  ].map((t) => (
                    <div key={t.title} className="flex items-start gap-3 rounded-xl bg-background/60 dark:bg-muted/30 border border-border/40 px-4 py-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#065F46] mt-0.5">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{t.title}</p>
                        <p className="text-xs text-muted-foreground">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <TestimonialsCarousel />

      {/* ─── POPULAR ROLES (SEO internal linking) ─── */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Browse jobs by role</h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Explore open roles with match scores tailored to your CV. New listings daily.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {TRENDING_ROLES.map((r) => (
                <Link
                  key={r.slug}
                  href={`/jobs/${r.slug}`}
                  className="rounded-full border border-border/60 bg-background px-4 py-1.5 text-sm font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
                >
                  {r.label}
                </Link>
              ))}
            </div>
            <Link
              href="/jobs"
              className="mt-8 inline-block text-sm font-medium text-primary hover:underline"
            >
              See all 130+ roles →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-[720px]">
            <div className="mb-10">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Common questions</h2>
              <p className="mt-3 text-base text-muted-foreground">Everything you need to know before getting started.</p>
            </div>
            <FaqSection />
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section>
        <div className="container mx-auto px-4 py-16 md:py-24">
          <CtaSection
            label="Don't wait"
            heading="Your resume might be getting filtered out right now"
            subtext="Every day you wait is a missed opportunity. Scan your resume in 60 seconds."
            buttonText="Check my resume score"
          />
        </div>
      </section>
    </>
  );
}
