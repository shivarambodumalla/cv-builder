import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Target, CheckCircle, BarChart3, Brain, Briefcase } from "lucide-react";
import { BreadcrumbJsonLd, HowToJsonLd } from "@/components/shared/structured-data";

export const metadata = {
  title: "Interview Coach — Prepare STAR Stories from Your CV | CVEdge",
  description: "Build a bank of interview stories from your CV, GitHub, and portfolio. Get AI-powered STAR frameworks, quality scoring, and job-specific prep — free.",
  openGraph: {
    title: "Interview Coach | CVEdge",
    description: "Build interview stories from your CV. Get AI-powered STAR frameworks and job-specific prep.",
    url: "https://www.thecvedge.com/interview-prep",
    images: ["/og-interview-coach.png"],
  },
  alternates: { canonical: "https://www.thecvedge.com/interview-prep" },
};

const STEPS = [
  {
    icon: Search,
    title: "Scan your sources",
    body: "Add your CV, portfolio link, or GitHub. CVEdge finds your best experiences and structures them automatically.",
    proofLabel: "Parsed in seconds",
    proofText: "14 experiences found",
  },
  {
    icon: Sparkles,
    title: "Build your stories",
    body: "AI pre-fills each story in STAR format. You review, fill gaps, and save the ones that represent you best.",
    proofLabel: "Answer quality score",
    proofText: "8/10",
  },
  {
    icon: Target,
    title: "Ace your interviews",
    body: "Paste a job description before any interview. CVEdge surfaces your most relevant stories with talking points.",
    proofLabel: "Top match for this role",
    proofText: "94% match",
  },
];

const FEATURES = [
  {
    icon: CheckCircle,
    title: "STAR framework built in",
    desc: "Every story follows Situation, Task, Action, Result. No more rambling answers — just clear, structured responses.",
  },
  {
    icon: Brain,
    title: "AI extraction from your CV",
    desc: "CVEdge reads your experience and suggests stories you might have forgotten. You just confirm and refine.",
  },
  {
    icon: BarChart3,
    title: "Quality scoring for every story",
    desc: "Each story gets a score based on clarity, impact, and detail. See which ones need more work before your interview.",
  },
  {
    icon: Briefcase,
    title: "Job-matched interview prep",
    desc: "Paste any job description and get a shortlist of your best stories for that specific role, with talking points.",
  },
];

const PAIN_POINTS = [
  {
    quote: "\u201cI know I did good work but I can never remember specifics in the moment.\u201d",
    resolve: "Every achievement, structured and saved",
  },
  {
    quote: "\u201cI prep for hours then get asked something different and freeze.\u201d",
    resolve: "8 themes covered, always ready",
  },
  {
    quote: "\u201cI give the same stories for every role even when they\u2019re not the best fit.\u201d",
    resolve: "Role-matched story shortlist",
  },
];

export default function InterviewStoriesPage() {
  return (
    <div className="container mx-auto px-4 py-20 md:py-28">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "Interview Coach", url: "https://www.thecvedge.com/interview-prep" },
        ]}
      />
      <HowToJsonLd
        name="How to prepare for interviews with CVEdge"
        description="Build a library of STAR-format stories from your CV, then get job-matched prep before every interview."
        image="https://www.thecvedge.com/og-interview-coach.png"
        totalTime="PT15M"
        steps={STEPS.map((s) => ({ name: s.title, text: s.body }))}
      />
      {/* Hero */}
      <div className="mx-auto max-w-2xl text-center mb-16">
        <p className="text-[10px] tracking-widest text-muted-foreground uppercase">Interview Coach</p>
        <h1 className="text-3xl font-bold tracking-tight mt-2">Walk into every interview prepared</h1>
        <p className="text-muted-foreground mt-3">Build a personal library of your best career stories. CVEdge tells you which ones to tell — and how.</p>
        <Button className="mt-6" asChild>
          <Link href="/login?returnUrl=%2Finterview-coach">Start building free</Link>
        </Button>
      </div>

      {/* How it works — 3 steps */}
      <div className="mx-auto max-w-3xl mb-16">
        <p className="text-sm font-medium text-center text-muted-foreground mb-6">How it works</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STEPS.map((s) => (
            <div key={s.title} className="rounded-xl border bg-card p-5 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold">{s.title}</p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{s.body}</p>
              <div className="mt-3 rounded-lg bg-muted p-2">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1">{s.proofLabel}</p>
                <span className="inline-block bg-[#D1FAE5] text-[#065F46] rounded px-1.5 text-[10px] font-medium py-0.5">{s.proofText}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mx-auto max-w-4xl mb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Everything you need to nail the interview</h2>
          <p className="mt-3 text-muted-foreground">Structured stories, smart matching, and confidence when it counts.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border bg-background p-5 space-y-2">
              <f.icon className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pain points row */}
      <div className="mx-auto max-w-3xl mb-16">
        <p className="text-sm font-medium text-center text-muted-foreground mb-6">Sound familiar?</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PAIN_POINTS.map((p) => (
            <div key={p.resolve} className="bg-[rgba(6,95,70,0.05)] border border-[rgba(6,95,70,0.10)] rounded-xl p-4">
              <p className="text-xs text-muted-foreground italic leading-relaxed mb-3">{p.quote}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#065F46] rounded-full shrink-0" />
                <p className="text-xs font-medium text-[#065F46]">{p.resolve}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-bold tracking-tight">Ready to stop winging your interviews?</h2>
        <p className="mt-3 text-muted-foreground">Prepare for your interviews in minutes. Free to start, no credit card needed.</p>
        <Button className="mt-6" asChild>
          <Link href="/login?returnUrl=%2Finterview-coach">Start building free</Link>
        </Button>
      </div>
    </div>
  );
}
