import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Briefcase,
  Check,
  Download,
  FileText,
  Layout,
  Mail,
  PenTool,
  Search,
  Shield,
  Sparkles,
  Target,
  Upload,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "CVEdge — AI-Powered CV Builder | Land More Interviews",
  description:
    "Build professional, ATS-friendly resumes in minutes. CVEdge uses AI to score your resume, match you to jobs, and help you land more interviews.",
  openGraph: {
    title: "CVEdge — AI-Powered Resume Builder",
    description: "Build your resume. Beat the ATS. Land interviews.",
    type: "website",
  },
};

export default function HomePage() {
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
            Upload your CV and get an instant ATS score. See exactly what recruiters&apos; software flags — missing keywords, weak bullets, formatting issues — and fix everything with AI in minutes.
          </p>
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

          {/* Hero visual */}
          <div className="mt-8 w-full max-w-5xl rounded-xl border bg-muted/30 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-1.5 border-b bg-muted/50 px-4 py-2">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-3 text-xs text-muted-foreground">CVEdge — Resume Editor</span>
            </div>
            <div className="flex items-center justify-center py-32 sm:py-48 text-muted-foreground">
              <div className="text-center">
                <Layout className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                <p className="text-sm font-medium">[Product screenshot]</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              From upload to interview-ready in 3 steps
            </h2>
            <p className="mt-4 text-muted-foreground">
              No templates to fill in. No starting from scratch. Just upload what you have.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <div className="relative rounded-xl border bg-background p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">1</div>
              <h3 className="text-lg font-semibold">Upload your CV</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Drop your PDF or paste your text. Our AI parses every section — experience, education, skills, certifications — in seconds.
              </p>
            </div>
            <div className="relative rounded-xl border bg-background p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">2</div>
              <h3 className="text-lg font-semibold">Get your ATS score</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                See a detailed breakdown across 6 categories: contact info, sections, keywords, measurable results, bullet quality, and formatting.
              </p>
            </div>
            <div className="relative rounded-xl border bg-background p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">3</div>
              <h3 className="text-lg font-semibold">Fix and download</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Click &quot;Fix&quot; on any issue to jump to the exact field. Use AI Rewrite to improve bullets instantly. Download a clean PDF.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ATS ANALYSIS ─── */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
                ATS Analysis
              </span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Know your score before recruiters do
              </h2>
              <p className="mt-4 text-muted-foreground">
                75% of resumes are rejected by ATS software before a human sees them. CVEdge scores your CV the same way ATS systems do — then shows you exactly what to fix.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <span className="text-sm">Score breakdown across 6 categories with per-issue impact points</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <span className="text-sm">Missing keywords detected from role-specific keyword lists</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <span className="text-sm">Real-time estimated score updates as you edit your content</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <span className="text-sm">One-click keyword add: tap a missing keyword and it goes straight into your skills</span>
                </li>
              </ul>
              <Button className="mt-6" asChild>
                <Link href="/upload-resume">Analyse My CV Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="rounded-xl border bg-muted/30 shadow-lg overflow-hidden">
              <div className="flex items-center justify-center py-48">
                <div className="text-center">
                  <BarChart3 className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">[Screenshot: ATS Score Panel]</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── AI REWRITE ─── */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="rounded-xl border bg-background shadow-lg overflow-hidden order-2 lg:order-1">
                <div className="flex items-center justify-center py-48">
                  <div className="text-center">
                    <Sparkles className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-muted-foreground">[Screenshot: AI Rewrite Drawer]</p>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
                  AI Rewrite
                </span>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Rewrite weak bullets with AI in seconds
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Every bullet point has a &quot;Rewrite&quot; button. Pick a mode — ATS, Impact, Concise, or Grammar — get a suggestion, refine it with instructions, and insert it with one click.
                </p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    <span className="text-sm">4 rewrite modes: ATS keywords, measurable impact, concise phrasing, grammar fix</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    <span className="text-sm">Refine with natural language: &quot;make it shorter&quot;, &quot;add React&quot;, &quot;more confident&quot;</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    <span className="text-sm">Never fabricates metrics — uses [X] placeholders for numbers you fill in</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── JOB MATCH + COVER LETTER ─── */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
                Job Search
              </span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Match your CV to any job. Generate a cover letter.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Paste a job description and see exactly how well your CV matches. Then generate a tailored cover letter that references your actual experience.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <span className="text-sm">Match score with missing vs matched keywords highlighted</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <span className="text-sm">Fix mode: switch to editor with job match results side-by-side</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  <span className="text-sm">Cover letter in 3 tones: Professional, Conversational, Confident</span>
                </li>
              </ul>
            </div>
            <div className="rounded-xl border bg-muted/30 shadow-lg overflow-hidden">
              <div className="flex items-center justify-center py-48">
                <div className="text-center">
                  <Briefcase className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">[Screenshot: Job Match & Cover Letter]</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to land interviews
            </h2>
            <p className="mt-4 text-muted-foreground">
              Built by job seekers who were tired of getting ghosted
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Upload, title: "Upload or Paste", desc: "Drop a PDF or paste your CV text. AI parses every section automatically — no manual entry." },
              { icon: BarChart3, title: "ATS Score Checker", desc: "Score your CV across 6 categories. See exactly what ATS software will flag before you apply." },
              { icon: Search, title: "Keyword Detection", desc: "Role-specific keyword lists compare your skills against what recruiters search for." },
              { icon: PenTool, title: "AI Bullet Rewrite", desc: "Rewrite any bullet in 4 modes: ATS, Impact, Concise, Grammar. Refine with natural language." },
              { icon: Target, title: "Job Matching", desc: "Paste a job description, get a match score, see missing keywords, and fix gaps instantly." },
              { icon: Mail, title: "Cover Letters", desc: "Generate tailored cover letters in 3 tones that reference your actual experience and the role." },
              { icon: FileText, title: "5 Pro Templates", desc: "Classic, Sharp, Minimal, Executive, Sidebar — all designed to pass ATS and look professional." },
              { icon: Download, title: "PDF Export", desc: "Download clean, formatted PDFs ready to send. Pro users get watermark-free exports." },
              { icon: Zap, title: "Real-time Scoring", desc: "Your ATS score updates as you type. See estimated impact before you re-analyse." },
              { icon: Brain, title: "Smart Add Keywords", desc: "Tap any missing keyword to add it to your skills section instantly. No copy-paste." },
              { icon: Shield, title: "Your Data, Private", desc: "Your CV data stays in your account. We never share it, sell it, or train AI on it." },
              { icon: Layout, title: "Design Controls", desc: "Font, spacing, accent color, paper size, section order — customize everything visually." },
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

      {/* ─── ABOUT ─── */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built for real people, not robots
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Most CV builders make you start from scratch with a blank template. CVEdge works differently — upload what you already have, and we show you exactly what to improve. No guesswork, no generic advice.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Every suggestion is backed by the same keyword lists that ATS systems use. Every rewrite preserves your real experience — we never fabricate metrics or claims. The result is a CV that passes automated screening AND reads well to humans.
          </p>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="border-t">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border p-8 sm:p-12 text-center space-y-5">
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to see your ATS score?</h2>
            <p className="text-muted-foreground">
              Upload your CV and get a detailed analysis in under 60 seconds. Free, no sign-up required.
            </p>
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="/upload-resume">
                Analyse My CV Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
