"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Brain, Search, PenTool, Rocket, Target, User, Lightbulb, Eye,
  Briefcase, FileText, Network, LayoutGrid, Accessibility, BarChart3,
  Bot, Cpu, Mic, Award, Check, ArrowRight, ArrowLeft, BookOpen,
  Sparkles, ChevronRight, Download,
} from "lucide-react";
import { CtaButton } from "./cta-provider";

interface Topic {
  icon: React.ElementType;
  title: string;
  desc: string;
}

interface Phase {
  n: string;
  name: string;
  icon: React.ElementType;
  tagline: string;
  headline: string;
  intro: string;
  topics: Topic[];
  outcome: { title: string; desc: string };
}

const PHASES: Phase[] = [
  {
    n: "01",
    name: "Think",
    icon: Brain,
    tagline: "Build the right mindset and mental models.",
    headline: "Build the right mindset and think like a Product Designer.",
    intro: "Before designing solutions, you need to understand people, behavior and how great products are built.",
    topics: [
      { icon: User, title: "Psychology & Human Factors", desc: "How people think, feel and make decisions." },
      { icon: Lightbulb, title: "Design Thinking", desc: "A human-centered approach to solving the right problems." },
      { icon: Brain, title: "Mental Models", desc: "Powerful models to simplify complex problems." },
      { icon: Eye, title: "Perception, Cognition & Emotional Design", desc: "How people perceive, understand and connect with products." },
    ],
    outcome: { title: "Think like a Product Designer", desc: "Build the foundation to design meaningful and impactful products." },
  },
  {
    n: "02",
    name: "Understand",
    icon: Search,
    tagline: "Understand users, problems and business deeply.",
    headline: "See the product through users' eyes and the business's.",
    intro: "From user behaviour to business reality. Learn to ask the questions PMs ask.",
    topics: [
      { icon: Brain, title: "Behavioral Psychology & Decisions", desc: "Why users choose, hesitate and commit." },
      { icon: Search, title: "Research & Motivation", desc: "Uncover real needs with the right research methods." },
      { icon: Briefcase, title: "Business Thinking", desc: "Understand goals, metrics and constraints." },
      { icon: FileText, title: "PRDs & Persuasive Design", desc: "Turn requirements into designs that move people." },
    ],
    outcome: { title: "Understand Users & Business", desc: "Design with evidence, not assumptions." },
  },
  {
    n: "03",
    name: "Design",
    icon: PenTool,
    tagline: "Craft experiences that are usable, intuitive and delightful.",
    headline: "Master the craft of structure, interaction and visual design.",
    intro: "Daily assignments build real skill, from information architecture to polished interfaces.",
    topics: [
      { icon: Network, title: "Information Architecture", desc: "Structure products people can navigate." },
      { icon: User, title: "User Research in Practice", desc: "Personas, journeys and scenarios that guide design." },
      { icon: PenTool, title: "Interaction & Visual Design", desc: "From wireframes to refined interfaces." },
      { icon: LayoutGrid, title: "Design Systems & Gestalt", desc: "Consistent, scalable UI foundations." },
    ],
    outcome: { title: "Design like a Senior Designer", desc: "Craft usable, intuitive and delightful experiences." },
  },
  {
    n: "04",
    name: "Build",
    icon: Rocket,
    tagline: "Ship real products with AI, engineers and modern workflows.",
    headline: "Where AI changes everything.",
    intro: "Ship with engineers, metrics and modern AI workflows: Claude, Cursor, MCP and human-in-the-loop.",
    topics: [
      { icon: Accessibility, title: "Accessibility & Design QA", desc: "Production-ready, inclusive interfaces." },
      { icon: BarChart3, title: "Metrics & Developer Handoff", desc: "Speak engineering and measure what matters." },
      { icon: Bot, title: "AI Product Design & Prompting", desc: "Design AI-native features that earn trust." },
      { icon: Cpu, title: "Claude, Cursor & MCP", desc: "The modern AI-first toolchain, hands-on." },
    ],
    outcome: { title: "Ship Real Products", desc: "Build with AI the way modern product teams do." },
  },
  {
    n: "05",
    name: "Launch",
    icon: Target,
    tagline: "Go from portfolio to offers. Land your dream role.",
    headline: "Turn the work into a career.",
    intro: "The capstone stretch. Every session points at getting you hired.",
    topics: [
      { icon: LayoutGrid, title: "Portfolio & Case Study", desc: "Ship the proof: product, portfolio, story." },
      { icon: FileText, title: "Resume & LinkedIn", desc: "Career documents rebuilt with your mentor." },
      { icon: Mic, title: "Interview Preparation", desc: "Mock interviews until you are confident." },
      { icon: Award, title: "Demo Day", desc: "Present your shipped capstone and graduate." },
    ],
    outcome: { title: "Get Hired", desc: "Graduate with proof, not certificates alone." },
  },
];

const STRIP = [
  { icon: Brain, title: "5 Phases", sub: "A clear learning arc" },
  { icon: Target, title: "Real World", sub: "Built for impact" },
  { icon: Sparkles, title: "Practical & Applied", sub: "Not just theory" },
  { icon: Briefcase, title: "Outcome Driven", sub: "From learning to hired" },
];

export function CurriculumExplorer({ indiaRestricted }: { indiaRestricted: boolean }) {
  const [active, setActive] = useState(0);
  const phase = PHASES[active];

  return (
    <section id="curriculum" className="bg-card scroll-mt-16">
      <div className="container max-w-6xl mx-auto px-4 py-16 md:py-20">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4 text-xs font-semibold tracking-widest uppercase text-[#065F46] dark:text-[#34D399]">
            <BookOpen className="w-4 h-4" />
            The Curriculum
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            A structured journey from
            <br className="hidden md:block" /> curiosity to{" "}
            <span className="text-[#065F46] dark:text-[#34D399]">career.</span>
          </h2>
          <p className="text-muted-foreground">
            Five phases. One arc. Built for real-world impact.
          </p>
          {!indiaRestricted && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <CtaButton
                mode="curriculum"
                variant="outline"
                className="border-[#065F46]/30 text-[#065F46] hover:bg-[#065F46]/5 hover:text-[#065F46] dark:border-[#34D399]/30 dark:text-[#34D399] dark:hover:bg-[#34D399]/10 dark:hover:text-[#34D399]"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Full Curriculum
              </CtaButton>
              <span className="text-xs text-muted-foreground">Free · All 50 sessions · PDF to your inbox</span>
            </div>
          )}
        </div>

        {/* Mobile stepper */}
        <div className="lg:hidden rounded-2xl bg-white dark:bg-background shadow-sm px-4 py-5 mb-6 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[420px]">
            {PHASES.map((p, i) => (
              <button
                key={p.n}
                onClick={() => setActive(i)}
                className="flex flex-col items-center gap-1.5 shrink-0"
              >
                <span
                  className={[
                    "flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-colors",
                    i === active
                      ? "bg-[#065F46] text-white"
                      : "bg-muted text-muted-foreground",
                  ].join(" ")}
                >
                  {p.n}
                </span>
                <span className={i === active ? "text-sm font-bold" : "text-sm text-muted-foreground"}>
                  {p.name}
                </span>
                {i === active && <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Desktop phase list */}
          <div className="hidden lg:block lg:col-span-4 space-y-3 relative">
            <span className="absolute left-5 top-16 bottom-16 border-l border-dashed border-primary/20" aria-hidden />
            {PHASES.map((p, i) => (
              <button
                key={p.n}
                onClick={() => setActive(i)}
                className={[
                  "relative w-full text-left rounded-2xl p-4 flex items-center gap-4 transition-all",
                  i === active
                    ? "bg-white dark:bg-background shadow-md ring-2 ring-[#065F46]/50"
                    : "hover:bg-white/60 dark:hover:bg-background/60",
                ].join(" ")}
              >
                <span className={`text-sm font-bold ${i === active ? "text-[#065F46] dark:text-[#34D399]" : "text-muted-foreground"}`}>
                  {p.n}
                </span>
                <span className="flex items-center justify-center w-14 h-14 rounded-full bg-white dark:bg-card shadow-sm text-[#065F46] dark:text-[#34D399] shrink-0">
                  <p.icon className="w-6 h-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{p.name}</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">{p.tagline}</span>
                </span>
                <ChevronRight className={`w-4 h-4 shrink-0 ${i === active ? "text-[#065F46] dark:text-[#34D399]" : "text-muted-foreground/40"}`} />
              </button>
            ))}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-background shadow-sm p-6 md:p-9">
            <div className="flex items-start justify-between gap-6 mb-2">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#065F46]/10 dark:bg-[#34D399]/15 text-[#065F46] dark:text-[#34D399] text-xs font-bold tracking-widest uppercase mb-4">
                  Phase {phase.n}
                </span>
                <h3 className="text-3xl md:text-4xl font-bold mb-3">{phase.name}</h3>
                <p className="font-semibold text-[#065F46] dark:text-[#34D399] mb-2">{phase.headline}</p>
                <p className="text-sm text-muted-foreground max-w-md">{phase.intro}</p>
              </div>
              <span className="hidden sm:flex items-center justify-center w-20 h-20 rounded-2xl bg-[#065F46]/[0.07] dark:bg-[#34D399]/10 text-[#065F46] dark:text-[#34D399] shrink-0">
                <phase.icon className="w-9 h-9" />
              </span>
            </div>

            <div className="text-xs font-bold tracking-widest uppercase text-[#065F46] dark:text-[#34D399] mt-6 mb-4">
              What you&apos;ll learn
            </div>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
              {phase.topics.map((t) => (
                <div key={t.title} className="flex items-start gap-4">
                  <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#065F46]/[0.07] dark:bg-[#34D399]/10 text-[#065F46] dark:text-[#34D399] shrink-0">
                    <t.icon className="w-5.5 h-5.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[15px] leading-snug">{t.title}</span>
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#065F46] shrink-0">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </span>
                    </span>
                    <span className="block text-sm text-muted-foreground mt-1">{t.desc}</span>
                  </span>
                </div>
              ))}
            </div>

            {/* Outcome */}
            <div className="mt-7 rounded-2xl bg-[#065F46]/[0.06] dark:bg-[#34D399]/10 p-5 flex items-center gap-5">
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-white dark:bg-card shadow-sm text-[#065F46] dark:text-[#34D399] shrink-0">
                <Award className="w-6 h-6" />
              </span>
              <span>
                <span className="block text-xs font-bold tracking-widest uppercase text-[#065F46] dark:text-[#34D399] mb-1">
                  Outcome
                </span>
                <span className="block font-bold text-[#065F46] dark:text-[#34D399]">{phase.outcome.title}</span>
                <span className="block text-sm text-muted-foreground mt-0.5">{phase.outcome.desc}</span>
              </span>
            </div>

            {/* Controls */}
            <div className="mt-7 flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="sm"
                disabled={active === 0}
                onClick={() => setActive((a) => Math.max(0, a - 1))}
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <span className="flex items-center gap-2">
                {PHASES.map((p, i) => (
                  <button
                    key={p.n}
                    aria-label={`Go to phase ${p.n}`}
                    onClick={() => setActive(i)}
                    className={`rounded-full transition-all ${i === active ? "w-2.5 h-2.5 bg-[#065F46] dark:bg-[#34D399]" : "w-2 h-2 bg-muted-foreground/40 hover:bg-muted-foreground/60"}`}
                  />
                ))}
              </span>
              <Button
                size="sm"
                disabled={active === PHASES.length - 1}
                onClick={() => setActive((a) => Math.min(PHASES.length - 1, a + 1))}
              >
                Next Phase
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Feature strip */}
        <div className="mt-8 rounded-2xl bg-white dark:bg-background shadow-sm px-6 py-5 grid grid-cols-2 lg:grid-cols-4 gap-5">
          {STRIP.map((s) => (
            <div key={s.title} className="flex items-center gap-3.5">
              <span className="flex items-center justify-center w-11 h-11 rounded-full bg-[#065F46]/[0.07] dark:bg-[#34D399]/10 text-[#065F46] dark:text-[#34D399] shrink-0">
                <s.icon className="w-5 h-5" />
              </span>
              <span>
                <span className="block font-bold text-sm">{s.title}</span>
                <span className="block text-xs text-muted-foreground">{s.sub}</span>
              </span>
            </div>
          ))}
        </div>

        {/* Gated curriculum bar */}
        {!indiaRestricted && (
          <div className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a6b50] to-[#04382b] text-white p-7 md:p-10">
            <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full border-[20px] border-[#34D399]/10" aria-hidden />
            <div className="grid lg:grid-cols-12 gap-8 items-center relative">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 bg-[#34D399]/15 text-[#34D399] rounded-full text-xs font-bold tracking-widest uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  The Lead Curriculum · Free PDF
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">
                  Get the complete 50-session curriculum
                </h3>
                <p className="text-white/70 text-sm mb-6 max-w-lg">
                  The version on this page is the outline. The full document maps
                  every single session before you spend a dollar.
                </p>
                <ul className="space-y-3">
                  {[
                    "All 50 sessions mapped: UX topic, UI craft, AI tooling and daily assignment",
                    "The anatomy of a session: exactly how every 2-hour block is spent",
                    "The capstone brief, from session 40 kickoff to Demo Day",
                    "Instant access, straight to your email",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-3 text-sm">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#34D399] shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-[#04382b]" strokeWidth={3} />
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>

              {/* PDF preview + CTA */}
              <div className="lg:col-span-5 flex flex-col items-center gap-6">
                <div className="relative" aria-hidden>
                  <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-xl bg-white/10 rotate-3" />
                  <div className="relative w-48 rounded-xl bg-[#F5F0E8] text-[#065F46] shadow-2xl p-5 -rotate-2">
                    <div className="flex items-center gap-1.5 mb-5">
                      <span className="w-5 h-5 rounded-md bg-[#065F46]" />
                      <span className="text-xs font-bold text-[#1f2a28]">CVEdge</span>
                    </div>
                    <div className="text-[9px] font-bold tracking-widest uppercase mb-1.5">AI Product Design</div>
                    <div className="text-xl font-black leading-tight text-[#1f2a28]">
                      The Full <span className="text-[#065F46]">Curriculum</span>
                    </div>
                    <div className="h-1.5 w-12 rounded-full bg-[#34D399] mt-2 mb-4" />
                    <div className="grid grid-cols-2 gap-1.5">
                      {[["100", "hours"], ["1:1", "live"], ["50", "sessions"], ["5", "phases"]].map(([big, small]) => (
                        <div key={small} className="rounded-md bg-white px-2 py-1.5">
                          <div className="text-sm font-bold text-[#065F46] leading-none">{big}</div>
                          <div className="text-[8px] text-[#6b7570] mt-0.5">{small}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="w-full text-center">
                  <CtaButton
                    mode="curriculum"
                    className="w-full sm:w-auto px-10 bg-white text-[#065F46] hover:bg-white/90 text-base h-12"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    Get the Full Curriculum
                  </CtaButton>
                  <p className="text-xs text-white/50 mt-3">Free · Instant access · 9-page PDF</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
