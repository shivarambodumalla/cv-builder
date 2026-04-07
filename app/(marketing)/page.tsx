import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
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
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Chip } from "@/components/ui/chip";
import { LiveCounter } from "./live-counter";
import { FaqSection } from "./faq-section";

export const metadata: Metadata = {
  title: "CVEdge | AI-Powered CV Builder | Land More Interviews",
  description:
    "Build professional, ATS-friendly resumes in minutes. CVEdge uses AI to score your resume, match you to jobs, and help you land more interviews.",
  openGraph: {
    title: "CVEdge | AI-Powered Resume Builder",
    description: "Build your resume. Beat the ATS. Land interviews.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

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

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5" />
        <div className="container relative mx-auto flex flex-col items-center gap-6 px-4 pb-16 pt-20 text-center md:pb-24 md:pt-32">
          <span className="rounded-full border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground">
            Free to start &middot; No credit card required
          </span>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Your CV, scored by AI.{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Fixed before you apply.
            </span>
          </h1>
          <p className="max-w-[640px] text-lg text-muted-foreground">
            Upload your CV and get an instant ATS score. See exactly what recruiters&apos; software flags: missing keywords, weak bullets, formatting issues. Fix everything with AI in minutes.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-2">
            {["AI-Powered", "Cancel anytime", "Your data never sold"].map((t) => (
              <Chip key={t} variant="trust">
                <Check className="h-3 w-3 text-[#065F46] font-bold" /> {t}
              </Chip>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="/upload-resume">
                Score My CV Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <Link href="/pricing">See Pricing</Link>
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
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">From upload to interview-ready in 3 steps</h2>
            <p className="mt-4 text-muted-foreground">No templates to fill in. No starting from scratch. Just upload what you have.</p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {[
              { n: "1", t: "Upload your CV", d: "Drop your PDF or paste your text. Our AI parses every section including experience, education, skills, and certifications in seconds." },
              { n: "2", t: "Get your ATS score", d: "See a detailed breakdown across 6 categories: contact info, sections, keywords, measurable results, bullet quality, and formatting." },
              { n: "3", t: "Fix and download", d: 'Click "Fix" on any issue to jump to the exact field. Use AI Rewrite to improve bullets instantly. Download a clean PDF.' },
            ].map((s) => (
              <div key={s.n} className="relative rounded-xl border bg-background p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">{s.n}</div>
                <h3 className="text-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ─── ATS ANALYSIS ─── */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">ATS Analysis</span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Know your score before recruiters do</h2>
              <p className="mt-4 text-muted-foreground">75% of resumes are rejected by ATS software before a human sees them. CVEdge scores your CV the same way ATS systems do, then shows you exactly what to fix.</p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" /><span className="text-sm">Score breakdown across 6 categories with per-issue impact points</span></li>
                <li className="flex items-start gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" /><span className="text-sm">Checks against 2,400+ role-specific keywords across 130+ job roles</span></li>
                <li className="flex items-start gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" /><span className="text-sm">Supports 12 domains from Engineering and Design to Finance and Operations</span></li>
                <li className="flex items-start gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" /><span className="text-sm">One-click keyword add: tap a missing keyword and it goes straight into your skills</span></li>
              </ul>
              <Button className="mt-6" asChild><Link href="/upload-resume">Analyse My CV Free <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            </div>
            <div className="rounded-xl border overflow-hidden"><img src="/img/ats-1.png" alt="ATS Score breakdown" className="w-full h-auto" /></div>
          </div>
        </div>
      </section>

      {/* ─── AI REWRITE ─── */}
      <section className="bg-muted/30">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="rounded-xl border overflow-hidden order-2 lg:order-1"><img src="/img/rewrite.png" alt="AI Rewrite drawer" className="w-full h-auto" /></div>
              <div className="order-1 lg:order-2">
                <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">AI Rewrite</span>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Rewrite weak bullets with AI in seconds</h2>
                <p className="mt-4 text-muted-foreground">Every bullet point has a &quot;Rewrite&quot; button. Pick a mode (ATS, Impact, Concise, or Grammar), get a suggestion, refine it with instructions, and insert it with one click.</p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-start gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" /><span className="text-sm">4 rewrite modes: ATS keywords, measurable impact, concise phrasing, grammar fix</span></li>
                  <li className="flex items-start gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" /><span className="text-sm">Refine with natural language: &quot;make it shorter&quot;, &quot;add React&quot;, &quot;more confident&quot;</span></li>
                  <li className="flex items-start gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" /><span className="text-sm">Never fabricates metrics, uses [X] placeholders for numbers you fill in</span></li>
                </ul>
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
            <Button asChild><Link href="/upload-resume">See my score <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>
        </div>
      </section>

      {/* ─── JOB MATCH + COVER LETTER ─── */}
      <section className="bg-muted/30">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">Job Search</span>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Match your CV to any job. Generate a cover letter.</h2>
                <p className="mt-4 text-muted-foreground">Paste a job description and see exactly how well your CV matches. Then generate a tailored cover letter that references your actual experience.</p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-start gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" /><span className="text-sm">Match score with missing vs matched keywords highlighted</span></li>
                  <li className="flex items-start gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" /><span className="text-sm">Fix mode: switch to editor with job match results side-by-side</span></li>
                  <li className="flex items-start gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" /><span className="text-sm">Cover letter in 3 tones: Professional, Conversational, Confident</span></li>
                </ul>
              </div>
              <div className="rounded-xl border overflow-hidden"><img src="/img/jobmatch.png" alt="Job match score" className="w-full h-auto" /></div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section id="features" className="scroll-mt-16">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to land interviews</h2>
            <p className="mt-4 text-muted-foreground">Built by job seekers who were tired of getting ghosted</p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Upload, title: "Upload or Paste", desc: "Drop a PDF or paste your CV text. AI parses every section automatically. No manual entry needed." },
              { icon: BarChart3, title: "ATS Score Checker", desc: "Score your CV across 6 categories. See exactly what ATS software will flag before you apply." },
              { icon: Search, title: "Keyword Detection", desc: "Role-specific keyword lists compare your skills against what recruiters search for." },
              { icon: PenTool, title: "AI Bullet Rewrite", desc: "Rewrite any bullet in 4 modes: ATS, Impact, Concise, Grammar. Refine with natural language." },
              { icon: Target, title: "Job Matching", desc: "Paste a job description, get a match score, see missing keywords, and fix gaps instantly." },
              { icon: Mail, title: "Cover Letters", desc: "Generate tailored cover letters in 3 tones that reference your actual experience and the role." },
              { icon: FileText, title: "5 Pro Templates", desc: "Classic, Sharp, Minimal, Executive, Sidebar. All designed to pass ATS and look professional." },
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
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DCFCE7]">
                    <Shield className="h-4 w-4 text-[#065F46]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">We never fabricate metrics</p>
                    <p className="text-xs text-muted-foreground">AI suggests placeholders like [X%]. You fill in the real numbers.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DCFCE7]">
                    <FileText className="h-4 w-4 text-[#065F46]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Your experience stays yours</p>
                    <p className="text-xs text-muted-foreground">Every rewrite is based on what you&apos;ve actually done. Nothing invented.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DCFCE7]">
                    <Zap className="h-4 w-4 text-[#065F46]" />
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
      <section className="bg-muted/30">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-center mb-12">Common questions</h2>
            <FaqSection />
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section>
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border p-8 sm:p-12 text-center space-y-5">
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to see your ATS score?</h2>
            <p className="text-muted-foreground">Upload your CV and get a detailed analysis in under 60 seconds. Free, no sign-up required.</p>
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="/upload-resume">Analyse My CV Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground pt-2">
              <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Free to start</span>
              <span className="flex items-center gap-1"><Check className="h-3 w-3" /> No credit card required</span>
              <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
