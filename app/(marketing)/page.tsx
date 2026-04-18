import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Briefcase,
  Brain,
  Check,
  Download,
  FileText,
  Layout,
  Mail,
  PenTool,
  Search,
  Shield,
  Target,
  Upload,
  Zap,
  Sparkles,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Chip } from "@/components/ui/chip";
import { LiveCounter } from "./live-counter";
import { FaqSection } from "./faq-section";
import { CtaSection } from "@/components/shared/cta-section";
import AtsAnalysisVisual from "@/components/marketing/ats-analysis-visual";
import AiRewriteVisual from "@/components/marketing/ai-rewrite-visual";
import JobMatchVisual from "@/components/marketing/job-match-visual";

export const metadata: Metadata = {
  title: "Free ATS Resume Checker & AI Job Search — Fix Your CV in 8 Minutes",
  description: "CVEdge finds exactly why your CV gets rejected by ATS software and fixes it with AI. Free job search with match scores for every role. Used by job seekers in 40+ countries.",
  alternates: { canonical: "https://www.thecvedge.com" },
};

// Revalidate every hour — homepage stats don't need to be real-time
export const revalidate = 3600;

const SCORE_CATEGORIES = [
  { name: "Contact info", desc: "Name, email, phone, location", weight: 10 },
  { name: "Required sections", desc: "Summary, experience, skills, education", weight: 20 },
  { name: "Keyword match", desc: "Role-specific terms recruiters search for", weight: 25 },
  { name: "Measurable results", desc: "Numbers, percentages, impact metrics", weight: 20 },
  { name: "Bullet quality", desc: "Strong action verbs, clear outcomes", weight: 15 },
  { name: "Formatting", desc: "Parseable structure, no tables or columns", weight: 10 },
];

const COMPARISON = [
  { feature: "Role-specific keywords", us: "130+ roles", them: "Generic only" },
  { feature: "AI bullet rewrite", us: "4 modes", them: "Not available" },
  { feature: "Real-time score updates", us: "As you type", them: "Not available" },
  { feature: "Job description matching", us: "Yes", them: "Not available" },
  { feature: "AI job search with match scores", us: "Free", them: "Not available" },
  { feature: "Cover letter generation", us: "Yes", them: "Not available" },
  { feature: "Price to start", us: "Free", them: "$20-30/month" },
];

export default async function HomePage() {
  // Fetch live stats
  const supabase = createAdminClient();
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const [{ count: todayCount }, { data: lastReport }] = await Promise.all([
    supabase.from("ats_reports").select("id", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
    supabase.from("ats_reports").select("created_at").order("created_at", { ascending: false }).limit(1).single(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CVEdge",
    url: "https://www.thecvedge.com",
    description: "Free AI-powered CV optimisation platform. Fix your CV in 8 minutes. 80+ ATS score guaranteed.",
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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5" />
        <div className="container relative mx-auto flex flex-col items-center gap-6 px-4 pb-16 pt-20 text-center md:pb-24 md:pt-32">
          <span className="rounded-full border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground">
            Free to start &middot; No credit card required
          </span>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Get more interviews.{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Fix your CV in 8 minutes.
            </span>
          </h1>
          <p className="max-w-[640px] text-lg text-muted-foreground">
            Most CVs never reach a human. CVEdge shows you exactly why yours gets skipped — and fixes it instantly.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-2">
            {["No credit card required", "Used by 2,400+ job seekers", "80+ score guaranteed"].map((t) => (
              <Chip key={t} variant="trust">
                <Check className="h-3 w-3 text-[#065F46] font-bold" /> {t}
              </Chip>
            ))}
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">🔒 Your data is never sold</span>
            <span className="flex items-center gap-1">⭐ 4.8/5 average rating</span>
            <span className="flex items-center gap-1">🌍 Used in 40+ countries</span>
            <span className="flex items-center gap-1">💳 Cancel anytime</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="/upload-resume">
                Score My CV Free
              </Link>
            </Button>
          </div>

          {/* Live counter */}
          <LiveCounter initialCount={todayCount ?? 0} lastReportAt={lastReport?.created_at ?? null} />

          {/* Hero visual */}
          <div className="mt-4 w-full max-w-5xl rounded-xl border overflow-hidden">
            <img src="/img/cover.png" alt="CVEdge Resume Editor showing ATS score with score breakdown" className="w-full h-auto" loading="eager" />
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="bg-muted/30 scroll-mt-16">
        <div className="container mx-auto px-4 py-20 md:py-28">
          {/* Header */}
          <div className="mx-auto max-w-xl mb-10">
            <p className="text-[10px] tracking-widest text-[#78716C] uppercase text-center">How it works</p>
            <h2 className="text-lg font-medium text-[#0C1A0E] dark:text-foreground text-center mt-1">Walk into every interview prepared</h2>
            <p className="text-xs text-[#78716C] text-center mt-1">Build a personal library of your best career stories. Before any interview, CVEdge tells you exactly which stories to tell — and how to tell them.</p>
          </div>

          {/* Step cards */}
          <div className="mx-auto max-w-3xl relative mb-3">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-[18px] left-[calc(16.67%+10px)] right-[calc(16.67%+10px)] h-px bg-[rgba(6,95,70,0.15)] z-0" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {[
                {
                  icon: Upload,
                  title: "Scan your sources",
                  body: "Drop your CV, portfolio link, or GitHub. AI parses every section and finds your best achievements.",
                  proofLabel: "Parsed in seconds",
                  proof: <span className="inline-block bg-[#D1FAE5] text-[#065F46] rounded px-1.5 text-[10px] font-medium py-0.5">14 experiences found</span>,
                },
                {
                  icon: Sparkles,
                  title: "Build your stories",
                  body: "AI pre-fills each story in STAR format. You review, fill gaps, and save the ones that represent you best.",
                  proofLabel: "Answer quality score",
                  proof: (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-[rgba(6,95,70,0.1)]"><div className="h-1 rounded-full bg-[#059669]" style={{ width: "80%" }} /></div>
                      <span className="text-[10px] font-medium text-[#059669]">8/10</span>
                    </div>
                  ),
                },
                {
                  icon: Target,
                  title: "Ace your interviews",
                  body: "Paste a job description before any interview. Get your most relevant stories with suggested talking points.",
                  proofLabel: "Top match for this role",
                  proof: <p className="text-[10px] text-[#065F46] font-medium truncate">#1 Improving Engagement Metrics — 94%</p>,
                },
              ].map((s) => (
                <div key={s.title} className="bg-[#F7F5F0] border border-[rgba(6,95,70,0.15)] rounded-xl p-3.5 flex flex-col items-center gap-2 relative z-10">
                  <div className="w-9 h-9 bg-[#065F46] rounded-full flex items-center justify-center shrink-0">
                    <s.icon size={15} className="text-white" />
                  </div>
                  <p className="text-xs font-medium text-[#0C1A0E] text-center">{s.title}</p>
                  <p className="text-[11px] text-[#78716C] text-center leading-relaxed">{s.body}</p>
                  <div className="bg-white border border-[rgba(6,95,70,0.12)] rounded-lg p-2 w-full mt-1">
                    <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wide mb-1">{s.proofLabel}</p>
                    {s.proof}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pain quote row */}
          <div className="mx-auto max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {[
              { quote: "\u201cI know I did good work but I can never remember specifics in the moment.\u201d", resolve: "Every achievement, structured and saved" },
              { quote: "\u201cI prep for hours then get asked something different and freeze.\u201d", resolve: "8 themes covered, always ready" },
              { quote: "\u201cI give the same stories for every role even when they\u2019re not the best fit.\u201d", resolve: "Role-matched story shortlist" },
            ].map((p) => (
              <div key={p.resolve} className="bg-[rgba(6,95,70,0.05)] border border-[rgba(6,95,70,0.10)] rounded-xl p-3">
                <p className="text-[10px] text-[#78716C] italic leading-relaxed mb-2">{p.quote}</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-[#065F46] rounded-full shrink-0" />
                  <p className="text-[10px] font-medium text-[#065F46]">{p.resolve}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ─── ATS ANALYSIS ─── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:gap-16 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">ATS Analysis</span>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Find out why your CV gets rejected</h2>
                <p className="mt-4 text-muted-foreground">Recruiters use software to filter CVs before reading them. CVEdge runs the same check — so you can fix problems before they cost you the interview.</p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-start gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" /><span className="text-sm">Score breakdown across 6 categories with per-issue impact points</span></li>
                  <li className="flex items-start gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" /><span className="text-sm">Checks against 2,400+ role-specific keywords across 130+ job roles</span></li>
                  <li className="flex items-start gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" /><span className="text-sm">Real-time estimated score updates as you edit your content</span></li>
                  <li className="flex items-start gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" /><span className="text-sm">One-click keyword add: tap a missing keyword and it goes into your skills</span></li>
                </ul>
                <Button className="mt-6" asChild><Link href="/upload-resume">Analyse My CV Free</Link></Button>
              </div>
              <div className="hidden lg:block" style={{ filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.06))" }}>
                <AtsAnalysisVisual />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── AI REWRITE ─── */}
      <section className="bg-muted/30 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:gap-16 lg:grid-cols-2 lg:items-center">
              {/* Visual — left on desktop, first on mobile */}
              <div className="hidden lg:block order-2 lg:order-1" style={{ filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.12))", borderRadius: 16, overflow: "hidden" }}>
                <AiRewriteVisual />
              </div>
              {/* Text — right on desktop */}
              <div className="order-1 lg:order-2">
                <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">AI Rewrite</span>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl leading-tight">Make every line of your CV count</h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">Every bullet point has a Rewrite button. Pick a mode, get a suggestion, refine it with plain instructions, and insert it with one click.</p>
                <ul className="mt-6 space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#065F46] mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 5l2 2L7.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span className="text-sm leading-relaxed">4 rewrite modes: ATS keywords, measurable impact, concise phrasing, grammar fix</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#065F46] mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 5l2 2L7.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span className="text-sm leading-relaxed">Refine with natural language: &quot;make it shorter&quot;, &quot;add React&quot;, &quot;more confident&quot;</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#065F46] mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 5l2 2L7.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span className="text-sm leading-relaxed">Never fabricates metrics, uses [X] placeholders for numbers you fill in</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#065F46] mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 5l2 2L7.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span className="text-sm leading-relaxed">One click to accept and insert directly into your CV</span>
                  </li>
                </ul>
                <Button className="mt-6" asChild><Link href="/upload-resume">Try AI Rewrite free</Link></Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SCORE METHODOLOGY ─── */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">Transparent Scoring</span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How we calculate your score</h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">No black box. No guesswork. Every point is explainable and fixable.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SCORE_CATEGORIES.map((cat) => (
              <div key={cat.name} className="rounded-xl border bg-background p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{cat.name}</p>
                  <span className="text-lg font-bold text-primary">{cat.weight}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${cat.weight * 4}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">{cat.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-sm text-muted-foreground">Every category has specific, fixable rules. Fix one issue at a time and watch your score rise.</p>
          <div className="mt-5 text-center">
            <Button asChild><Link href="/upload-resume">See my score</Link></Button>
          </div>
        </div>
      </section>

      {/* ─── JOB MATCH + COVER LETTER ─── */}
      <section className="bg-muted/30 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:gap-16 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">Job Search</span>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl leading-tight">See how well you match before you apply</h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">Paste a job description and see exactly how well your CV matches. Then generate a tailored cover letter that references your actual experience.</p>
                <ul className="mt-6 space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#065F46] mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 5l2 2L7.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span className="text-sm leading-relaxed">Match score with missing vs matched keywords highlighted</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#065F46] mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 5l2 2L7.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span className="text-sm leading-relaxed">Fix mode: switch to editor with job match results side-by-side</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#065F46] mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 5l2 2L7.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span className="text-sm leading-relaxed">Cover letter in 3 tones: Professional, Conversational, Confident</span>
                  </li>
                </ul>
                <Button className="mt-6" asChild><Link href="/upload-resume">Try job matching free</Link></Button>
              </div>
              <div className="hidden lg:block" style={{ filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.06))", borderRadius: 16, overflow: "hidden" }}>
                <JobMatchVisual />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── AI JOB SEARCH ─── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:gap-16 lg:grid-cols-2 lg:items-center">
              {/* Visual — left */}
              <div className="order-2 lg:order-1">
                <div className="rounded-2xl bg-[#F7F5F0] dark:bg-card border p-5 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-[#0C1A0E] dark:text-foreground">Jobs matching your profile</p>
                    <span className="text-[10px] text-muted-foreground">20 results</span>
                  </div>
                  {[
                    { title: "Senior Frontend Engineer", company: "Google", location: "Remote, US", score: 94, color: "#DCFCE7", textColor: "#065F46" },
                    { title: "Full Stack Developer", company: "Stripe", location: "San Francisco, CA", score: 87, color: "#D1FAE5", textColor: "#065F46" },
                    { title: "React Engineer", company: "Vercel", location: "Remote", score: 72, color: "#D1FAE5", textColor: "#065F46" },
                  ].map((job) => (
                    <div key={job.title} className="flex items-center gap-3 rounded-xl bg-white dark:bg-background border p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#065F46] text-[10px] font-bold text-white">
                        {job.company.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{job.title}</p>
                        <p className="text-[10px] text-muted-foreground">{job.company} &middot; {job.location}</p>
                      </div>
                      <span className="shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold" style={{ backgroundColor: job.color, color: job.textColor }}>
                        {job.score}% match
                      </span>
                    </div>
                  ))}
                  <p className="text-center text-[10px] text-muted-foreground pt-1">Personalised to your CV, skills, and location preferences</p>
                </div>
              </div>
              {/* Text — right */}
              <div className="order-1 lg:order-2">
                <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">Free AI Job Search</span>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl leading-tight">Find jobs that match your CV — for free</h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">Stop scrolling through hundreds of irrelevant listings. CVEdge matches jobs to your CV and shows a match score for every role — so you only apply where you have the best chance.</p>
                <ul className="mt-6 space-y-4">
                  {[
                    "AI match score for every listing based on your CV skills and experience",
                    "Filter by location, job type, salary, and remote/on-site",
                    "Save jobs and track applications. Apply with one click",
                    "Personalised to your preferred locations and career level",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#065F46] mt-0.5">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 5l2 2L7.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <span className="text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-6" asChild><Link href="/jobs">Search jobs free</Link></Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section id="features" className="scroll-mt-16">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to go from application to offer letter</h2>
            <p className="mt-4 text-muted-foreground">All the tools in one place. Upload your CV and get started in 60 seconds.</p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Upload, title: "Upload or Paste", desc: "Drop a PDF or paste your CV text. AI parses every section automatically. No manual entry needed." },
              { icon: BarChart3, title: "ATS Score Checker", desc: "Score your CV across 6 categories. See exactly what ATS software will flag before you apply." },
              { icon: Search, title: "Keyword Detection", desc: "Role-specific keyword lists compare your skills against what recruiters search for." },
              { icon: PenTool, title: "AI Bullet Rewrite", desc: "Rewrite any bullet in 4 modes: ATS, Impact, Concise, Grammar. Refine with natural language." },
              { icon: Target, title: "Job Matching", desc: "Paste a job description, get a match score, see missing keywords, and fix gaps instantly." },
              { icon: Mail, title: "Cover Letters", desc: "Generate tailored cover letters in 3 tones that reference your actual experience and the role." },
              { icon: Briefcase, title: "Free AI Job Search", desc: "Search thousands of jobs matched to your CV. See a match score for every listing before you apply." },
              { icon: FileText, title: "12 Templates", desc: "Classic, Sharp, Minimal, Executive, and 8 more. All designed to pass ATS and look professional." },
              { icon: Download, title: "PDF Export", desc: "Download clean, formatted PDFs ready to send. Pro users get watermark-free exports." },
              { icon: Zap, title: "Real-time Scoring", desc: "Your ATS score updates as you type. See estimated impact before you re-analyse." },
              { icon: Brain, title: "Smart Add Keywords", desc: "Tap any missing keyword to add it to your skills section instantly. No copy-paste." },
              { icon: Shield, title: "Your Data, Private", desc: "Your CV data stays in your account. We never share it, sell it, or train AI on it." },
              { icon: Layout, title: "Design Controls", desc: "Font, spacing, accent color, paper size, section order. Customize everything visually." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border bg-background p-5 space-y-2">
                <f.icon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPARISON TABLE ─── */}
      <section className="bg-muted/30">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">Compare</span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How CVEdge compares</h2>
            </div>
            <div className="rounded-2xl border bg-background overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr_1fr]">
                {/* Header */}
                <div className="p-4 border-b" />
                <div className="p-4 border-b bg-[#065F46] text-center">
                  <p className="text-sm font-bold text-white">CVEdge</p>
                </div>
                <div className="p-4 border-b text-center">
                  <p className="text-sm font-medium text-muted-foreground">Others</p>
                </div>
                {/* Rows */}
                {COMPARISON.map((row, i) => (
                  <>
                    <div key={`f-${i}`} className="px-4 py-3.5 border-b flex items-center">
                      <p className="text-sm font-medium">{row.feature}</p>
                    </div>
                    <div key={`u-${i}`} className="px-4 py-3.5 border-b bg-[#065F46]/5 flex items-center justify-center">
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#065F46]">
                        <Check className="h-4 w-4" /> {row.us}
                      </span>
                    </div>
                    <div key={`t-${i}`} className="px-4 py-3.5 border-b flex items-center justify-center">
                      <span className="text-sm text-muted-foreground/50 line-through">{row.them}</span>
                    </div>
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ABOUT + BEFORE/AFTER ─── */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Visual — first on mobile */}
            <div className="order-1 lg:order-2">
              <div className="rounded-2xl bg-[#F7F5F0] dark:bg-card p-5 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_48px_1fr] items-stretch gap-3">
                  {/* Before */}
                  <div className="rounded-xl bg-white dark:bg-background border border-[#E0D8CC] dark:border-border p-4 space-y-3">
                    <p className="text-[10px] uppercase tracking-[1px] text-[#9CA3AF] font-medium">Raw CV &middot; No score</p>
                    <div className="space-y-1.5">
                      <div className="h-2.5 rounded bg-[#E5E7EB] w-[60%]" />
                      <div className="h-[7px] rounded bg-[#F3F4F6] w-[40%]" />
                      <div className="h-[7px] rounded bg-[#F3F4F6] w-[80%]" />
                    </div>
                    <div className="space-y-1.5 pt-1">
                      <div className="h-2 rounded bg-[#E5E7EB] w-[35%]" />
                      <div className="h-[7px] rounded bg-[#F3F4F6] w-[90%]" />
                      <div className="h-[7px] rounded bg-[#F3F4F6] w-[75%]" />
                      <div className="h-[7px] rounded bg-[#F3F4F6] w-[85%]" />
                      <div className="h-[7px] rounded bg-[#F3F4F6] w-[60%]" />
                    </div>
                    <div className="rounded-lg bg-[#FEF2F2] border border-[#FECACA] p-2.5 space-y-1">
                      <p className="text-[9px] font-bold text-[#991B1B]">12 issues detected</p>
                      {["Missing 8 keywords", "No measurable results", "Weak bullet structure", "Missing location"].map((t) => (
                        <div key={t} className="flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-red-400 shrink-0" />
                          <span className="text-[9px] text-[#7F1D1D]">{t}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2.5 pt-1">
                      <svg width="44" height="44" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="19" stroke="#FECACA" strokeWidth="3"/><circle cx="22" cy="22" r="19" stroke="#DC2626" strokeWidth="3" strokeDasharray="72 120" strokeLinecap="round" transform="rotate(-90 22 22)"/><text x="22" y="24" textAnchor="middle" fill="#DC2626" fontWeight="800" fontSize="12" fontFamily="system-ui">61</text></svg>
                      <div>
                        <p className="text-[9px] font-bold text-[#991B1B]">ATS Score</p>
                        <p className="text-[8px] text-[#9CA3AF]">Likely rejected</p>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="hidden sm:flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#065F46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                  <div className="sm:hidden flex justify-center py-1">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#065F46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m5 12 7 7 7-7"/></svg>
                  </div>

                  {/* After */}
                  <div className="rounded-xl bg-white dark:bg-background border border-[#6EE7B7] p-4 space-y-3">
                    <p className="text-[10px] uppercase tracking-[1px] text-[#065F46] font-medium">Optimised CV &middot; 8 min</p>
                    <div className="space-y-1.5">
                      <div className="h-2.5 rounded bg-[#0C1A0E] w-[60%]" />
                      <div className="h-[7px] rounded bg-[#D1FAE5] w-[40%]" />
                      <div className="h-[7px] rounded bg-[#E5E7EB] w-[80%]" />
                    </div>
                    <div className="space-y-1.5 pt-1">
                      <div className="h-2 rounded bg-[#065F46] w-[35%]" />
                      <div className="h-[7px] rounded bg-[#D1FAE5] w-[90%]" />
                      <div className="h-[7px] rounded bg-[#E5E7EB] w-[75%]" />
                      <div className="h-[7px] rounded bg-[#D1FAE5] w-[85%]" />
                      <div className="h-[7px] rounded bg-[#E5E7EB] w-[60%]" />
                    </div>
                    <div className="rounded-lg bg-[#F0FDF4] border border-[#6EE7B7] p-2.5 space-y-1">
                      <p className="text-[9px] font-bold text-[#065F46]">2 minor suggestions left</p>
                      {["8 keywords added", "Bullets rewritten with metrics", "Location added"].map((t) => (
                        <div key={t} className="flex items-center gap-1.5">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="5" fill="#065F46"/><path d="M3 5l1.5 1.5L7 4" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          <span className="text-[9px] text-[#065F46]">{t}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2.5 pt-1">
                      <svg width="44" height="44" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="19" stroke="#6EE7B7" strokeWidth="3"/><circle cx="22" cy="22" r="19" stroke="#065F46" strokeWidth="3" strokeDasharray="112 120" strokeLinecap="round" transform="rotate(-90 22 22)"/><text x="22" y="24" textAnchor="middle" fill="#065F46" fontWeight="800" fontSize="12" fontFamily="system-ui">94</text></svg>
                      <div>
                        <p className="text-[9px] font-bold text-[#065F46]">ATS Score</p>
                        <p className="text-[8px] text-[#6B7280]">Interview-ready</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {["PyTorch", "MLOps", "LLMs", "Kubernetes", "RAG"].map((kw) => (
                        <span key={kw} className="rounded-full bg-[#D1FAE5] px-1.5 py-0.5 text-[8px] font-medium text-[#065F46]">{kw}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-center text-[11px] text-[#78716C]">Senior ML Engineer &middot; Score improved from 61% to 94% in 8 minutes</p>
              </div>
            </div>

            {/* Text — second on mobile */}
            <div className="order-2 lg:order-1 space-y-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for real people, not robots</h2>
              <p className="text-muted-foreground leading-relaxed">Most CV builders make you start from scratch with a blank template. CVEdge works differently: upload what you already have, and we show you exactly what to improve. No guesswork, no generic advice.</p>
              <p className="text-muted-foreground leading-relaxed">Every suggestion is backed by the same keyword lists that ATS systems use. Every rewrite preserves your real experience. We never fabricate metrics or claims. The result is a CV that passes automated screening AND reads well to humans.</p>

              <div className="space-y-4 pt-2">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#065F46]">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">We never fabricate metrics</p>
                    <p className="text-xs text-muted-foreground">AI suggests placeholders like [X%]. You fill in the real numbers.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#065F46]">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Your experience stays yours</p>
                    <p className="text-xs text-muted-foreground">Every rewrite is based on what you&apos;ve actually done. Nothing invented.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#065F46]">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Full transparency</p>
                    <p className="text-xs text-muted-foreground">See exactly why your score changed after every edit.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-[720px]">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Common questions</h2>
              <p className="mt-3 text-base text-[#78716C]">Everything you need to know before getting started.</p>
            </div>
            <FaqSection />
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section>
        <div className="container mx-auto px-4 py-16 md:py-24">
          <CtaSection />
        </div>
      </section>
    </>
  );
}
