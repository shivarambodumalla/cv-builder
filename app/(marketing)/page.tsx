import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Brain,
  Check,
  Compass,
  DollarSign,
  Search,
  Sparkles,
  Target,
  Upload,
} from "lucide-react";



import { FaqSection } from "./faq-section";
import { homeFaqs } from "./home-faqs";
import { CtaSection } from "@/components/shared/cta-section";
import { FeaturesTabs } from "@/components/marketing/features-tabs";
import { HeroAnimation } from "@/components/marketing/hero-animation";
import { TemplateThumbnailImage } from "@/components/shared/template-thumbnail";
import { LogoCarousel } from "@/components/marketing/logo-carousel";
import { TestimonialsCarousel } from "@/components/marketing/testimonials-carousel";
import { getPublicRatingStats } from "@/lib/feedback/stats";
import { getPlanLimits, getProTemplateSlugs, getTemplateCounts } from "@/lib/billing/plan-config";
import { getPublishedTestimonials } from "@/lib/feedback/testimonials";

export const metadata: Metadata = {
  title: "Free ATS Resume Scanner: Check Your ATS Score",
  description: "Your resume is filtered by ATS before humans see it. CVEdge shows your real ATS score and top issues free. Pro fixes them with AI. 1,200+ resumes scanned.",
  alternates: {
    canonical: "https://www.thecvedge.com",
    languages: {
      "en-US": "https://www.thecvedge.com",
      "en-GB": "https://www.thecvedge.com",
      "en-AU": "https://www.thecvedge.com",
      "en-AE": "https://www.thecvedge.com",
      "en-SA": "https://www.thecvedge.com",
      "en-QA": "https://www.thecvedge.com",
      "en-KW": "https://www.thecvedge.com",
      "x-default": "https://www.thecvedge.com",
    },
  },
};

// Ratings, testimonials, quotas and template counts come from the DB.
// force-static keeps the page static (the admin client's no-store fetch would
// otherwise make it dynamic); it re-reads them hourly.
export const dynamic = "force-static";
export const revalidate = 3600;


const COMPARISON = [
  { feature: "Role-specific keywords", us: "130+ roles", them: "Generic only" },
  { feature: "AI bullet rewrite", us: "4 modes", them: "Not available" },
  { feature: "Real-time score updates", us: "As you type", them: "Not available" },
  { feature: "Job description matching", us: "Yes", them: "Not available" },
  { feature: "Cover letter generation", us: "Yes", them: "Not available" },
  { feature: "Free ATS score", us: "Yes", them: "Paid only" },
  { feature: "Price to start", us: "Free", them: "$20-30/month" },
];

export default async function HomePage() {
  // Real post-download ratings. Null until enough exist to display, and the
  // schema below only carries a rating that is visible on this page.
  const [rating, testimonials, planLimits, templateCounts, proSlugs] = await Promise.all([getPublicRatingStats(), getPublishedTestimonials(), getPlanLimits(), getTemplateCounts(), getProTemplateSlugs()]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CVEdge",
    url: "https://www.thecvedge.com",
    description: "Free ATS resume scanner and builder. Check your ATS score, see your top issues, and fix them in the editor. Pro adds AI fixes. 1,200+ resumes scanned.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free plan; Pro from $5/week" },
    featureList: ["ATS Score Analysis", "AI resume Rewriting", "Job Match Scoring", "Career Path Generator", "Cover Letter Generation", "Interview Coach", `${templateCounts.total} Professional Templates`],
    areaServed: [
      { "@type": "Country", "name": "United States" },
      { "@type": "Country", "name": "United Kingdom" },
      { "@type": "Country", "name": "Canada" },
      { "@type": "Country", "name": "Australia" },
      { "@type": "Country", "name": "Ireland" },
      { "@type": "Country", "name": "Germany" },
      { "@type": "Country", "name": "France" },
      { "@type": "Country", "name": "Netherlands" },
      { "@type": "Country", "name": "United Arab Emirates" },
      { "@type": "Country", "name": "Saudi Arabia" },
      { "@type": "Country", "name": "Qatar" },
      { "@type": "Country", "name": "Kuwait" },
      { "@type": "Country", "name": "Bahrain" },
      { "@type": "Country", "name": "Oman" },
    ],
    ...(rating
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: String(rating.average), ratingCount: String(rating.count), bestRating: "5", worstRating: "1" } }
      : {}),
  };

  // Same list as the visible FAQ below, so the markup matches the page.
  const faqs = homeFaqs(planLimits.free);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
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

        <div className="relative mx-auto max-w-[1200px] px-6 pt-7 pb-6 sm:pt-10 sm:pb-8 md:pt-12 md:pb-10">
          <div className="grid gap-8 md:grid-cols-[1.5fr_1fr] md:gap-10 items-center">
            {/* Copy */}
            <div className="flex flex-col items-center text-center md:items-start md:text-left gap-4 min-w-0 w-full">
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">Free ATS Resume Scanner</span>
              <h1 className="text-[2rem] sm:text-[2.75rem] md:text-[3rem] lg:text-[3.5rem] font-bold tracking-[-0.025em] leading-[1.12] break-words max-w-full">
                Your resume isn&apos;t getting rejected.{" "}
                <span className="bg-gradient-to-r from-primary to-[#1E3A5F] bg-clip-text text-transparent">It&apos;s getting filtered out.</span>
              </h1>
              <p className="max-w-[580px] text-base sm:text-lg text-muted-foreground leading-relaxed">
                Get a real ATS score and your top issues free. Fix them in the editor, or let Pro fix them with AI.
              </p>
              <div className="flex w-full flex-col sm:w-auto sm:flex-row items-stretch sm:items-center gap-3 mt-1">
                <Button size="lg" className="h-12 px-8 text-[0.9375rem] font-medium shadow-md shadow-primary/20" asChild>
                  <Link href="/resume-checker">Scan my resume free</Link>
                </Button>
              </div>

              {/* Trust line */}
              <p className="text-sm text-muted-foreground mt-1 max-w-full">
                1,200+ resumes scanned &middot; Avg score improvement +18 points
              </p>
            </div>

            {/* Right column: animated preview (scales responsively) */}
            <div className="relative w-full mx-auto max-w-[480px] min-w-0 md:ml-auto md:mr-0">
              <HeroAnimation proSlugs={proSlugs} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── LOGO CAROUSEL ─── */}
      <LogoCarousel />

      {/* ─── FEATURES (tabbed) ─── */}
      <FeaturesTabs />

      {/* ─── TEMPLATES + INTERVIEW COACH + CAREER PATH ─── */}
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
                    {templateCounts.free === templateCounts.total
                      ? `${templateCounts.total} ATS-optimized templates, all of them free.`
                      : `${templateCounts.total} ATS-optimized templates, ${templateCounts.free} of them free.`}{" "}
                    Every design passes automated filters and looks great on screen.
                  </p>
                  <Button size="lg" className="h-12 px-8 text-[0.9375rem] font-medium bg-white text-[#1E3A5F] hover:bg-white/90" asChild>
                    <Link href="/resumes">Browse templates</Link>
                  </Button>
                </div>
                <div className="overflow-hidden p-6 lg:p-8">
                  <div className="flex gap-3 items-start">
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-white">
                        <TemplateThumbnailImage template="orchid" sizes="(min-width: 1024px) 15vw, 30vw" className="w-full h-auto" />
                      </div>
                      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-white">
                        <TemplateThumbnailImage template="vantage" sizes="(min-width: 1024px) 15vw, 30vw" className="w-full h-auto" />
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-3 mt-10">
                      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-white">
                        <TemplateThumbnailImage template="portrait" sizes="(min-width: 1024px) 15vw, 30vw" className="w-full h-auto" />
                      </div>
                      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-white">
                        <TemplateThumbnailImage template="meridian" sizes="(min-width: 1024px) 15vw, 30vw" className="w-full h-auto" />
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-3 mt-4">
                      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-white">
                        <TemplateThumbnailImage template="coastal" sizes="(min-width: 1024px) 15vw, 30vw" className="w-full h-auto" />
                      </div>
                      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-white">
                        <TemplateThumbnailImage template="regent" sizes="(min-width: 1024px) 15vw, 30vw" className="w-full h-auto" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Interview Coach + Career Path */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  Write STAR answers from your own experience. With Pro, CVEdge drafts them from your resume and shortlists the best ones for each job.
                </p>
                <ul className="space-y-2 mt-1">
                  {[
                    { text: "Write your own STAR answers free" },
                    { text: "AI extracts experiences from your resume, portfolio and GitHub", pro: true },
                    { text: "Quality score (0–10) per answer", pro: true },
                    { text: "Job-matched prep with talking points", pro: true },
                  ].map((p) => (
                    <li key={p.text} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#34D399]" />
                      <span className="text-sm text-white/90 leading-relaxed">
                        {p.text}
                        {p.pro && <span className="ml-2 inline-block rounded-full bg-white/15 px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wider text-white/80">Pro</span>}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-3">
                  <Button className="h-11 px-7 text-sm font-medium bg-white text-[#1E3A5F] hover:bg-white/90" asChild>
                    <Link href="/interview-prep">Start interview prep</Link>
                  </Button>
                </div>
              </div>

              {/* Career Path */}
              <div className="rounded-[2rem] bg-primary border border-primary p-8 sm:p-10 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <Compass className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Career Path Generator</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                  See where your job leads, and what it pays
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Enter your job title and get 3 to 5 next roles with live job counts and advertised pay. Then tailor your resume for the one you pick.
                </p>
                <ul className="space-y-2 mt-1">
                  {[
                    "Step ups, sideways moves and career changes, ranked by fit",
                    "Open jobs and pay from live US listings",
                    "Free to see your roles, no sign-in",
                    "Guides for 28 common roles",
                  ].map((p) => (
                    <li key={p} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#34D399]" />
                      <span className="text-sm text-white/90 leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-3">
                  <Button className="h-11 px-7 text-sm font-medium bg-white text-primary hover:bg-white/90" asChild>
                    <Link href="/career-path">Find my next role</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Row 3 — USP Stats */}
            <div className="rounded-[2rem] overflow-hidden">
              {/* CTA banner */}
              <div className="bg-[#065F46] px-6 py-8 sm:py-10 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Land your next role faster</h2>
                <p className="mt-1.5 text-white/70 text-sm">Free ATS score and resume builder. AI fixes with Pro.</p>
                <Button size="default" className="mt-4 h-10 px-7 text-sm font-medium bg-[#34D399] hover:bg-[#2fc48d] text-[#065F46] shadow-md" asChild>
                  <Link href="/resume-checker">Get my free ATS score</Link>
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
            <p className="text-sm sm:text-base text-muted-foreground mt-4 leading-relaxed max-w-xl">Upload your resume, see exactly what&apos;s wrong, and fix everything before the recruiter ever sees it.</p>
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
                  body: "Drop your PDF or paste text. AI parses every section in seconds. No manual entry needed.",
                  proofLabel: "Parsed in seconds",
                  proof: <span className="inline-block bg-[#D1FAE5] text-[#065F46] rounded-md px-2.5 py-1 text-xs font-medium">4 roles, 18 bullets found</span>,
                },
                {
                  step: "02",
                  icon: Sparkles,
                  title: "Get your ATS analysis",
                  body: "See your score and your top issues, ranked by impact. Pro shows every issue and the missing keywords.",
                  proofLabel: "ATS score",
                  proof: (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-primary/10"><div className="h-2 rounded-full bg-primary" style={{ width: "61%" }} /></div>
                      <span className="text-sm font-semibold text-primary">61/100</span>
                    </div>
                  ),
                },
                {
                  step: "03",
                  icon: Target,
                  title: "Fix and optimize",
                  body: "Fix issues in the editor and watch your estimated score move. With Pro, AI rewrites bullets and adds keywords for you.",
                  proofLabel: "After fixes",
                  proof: <p className="text-xs text-[#065F46] font-semibold truncate">ATS score 61 → 84 · Missing keywords 6 → 0</p>,
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
              { quote: "\u201cI apply to 30 jobs and hear nothing back.\u201d", resolve: "See the score the software gives you" },
              { quote: "\u201cI don\u2019t know which keywords the job actually wants.\u201d", resolve: "Missing keywords, listed per role" },
              { quote: "\u201cMy bullets just list what I was responsible for.\u201d", resolve: "Weak bullets flagged, with Pro rewrites" },
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mt-3">Your experience, scored honestly</h2>
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
                    { title: "Never fabricates", desc: "Uses [X] placeholders. Your words, not ours" },
                    { title: "Your experience only", desc: "Nothing invented. Every point explained" },
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
      {/* Real testimonials and ratings only; hidden until there are some.
          The rating line must stay visible whenever AggregateRating is emitted. */}
      {(testimonials.length > 0 || rating) && <TestimonialsCarousel testimonials={testimonials} rating={rating} />}

      {/* ─── FAQ ─── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-[720px]">
            <div className="mb-10">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Common questions</h2>
              <p className="mt-3 text-base text-muted-foreground">Quick answers on pricing, scoring, and your data.</p>
            </div>
            <FaqSection faqs={faqs} />
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section>
        <div className="container mx-auto px-4 py-16 md:py-24">
          <CtaSection
            label="Don't wait"
            heading="Your resume might be getting filtered out right now"
            subtext="Scan your resume in 60 seconds and see exactly what to fix."
            buttonText="Check my resume score"
          />
        </div>
      </section>
    </>
  );
}
