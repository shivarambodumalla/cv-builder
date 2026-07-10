import { headers } from "next/headers";
import {
  GraduationCap, Cpu, Palette, Rocket, Target, Bot, BookOpen, Globe,
  CheckCircle2, ArrowDown, Sparkles, Users, CalendarDays, Infinity as InfinityIcon,
} from "lucide-react";
import { MentorshipCtaProvider, CtaButton } from "./cta-provider";
import { PageTracker } from "./page-tracker";
import { TestimonialsCarousel } from "@/components/marketing/testimonials-carousel";

export const dynamic = "force-dynamic";

const OFFER_STACK = [
  {
    icon: GraduationCap,
    title: "100 Hours Live 1:1 Mentorship",
    desc: "Not recordings. Every session is live, personal, and paced to you — weekday or weekend batches.",
    tag: "Core",
  },
  {
    icon: Cpu,
    title: "Professional AI Workspace",
    desc: "Included for your first 3 months — full setup and onboarding. You won't buy AI tools separately during the mentorship.",
    note: "Depending on cohort and partner availability, learners receive access to tools such as Cursor Pro, Claude Code, and other professional AI software used throughout the mentorship.",
    tag: "3 months",
  },
  {
    icon: Palette,
    title: "Professional Design Workspace",
    desc: "Figma Professional through education and partner benefits, where available.",
    tag: "Included",
  },
  {
    icon: Rocket,
    title: "CVEdge Pro — Lifetime",
    desc: "Not just the resume builder. Every current and future CVEdge Pro feature — resume, ATS, portfolio, cover letters, career tools. Forever.",
    tag: "Lifetime",
    highlight: true,
  },
  {
    icon: Target,
    title: "Lifetime Portfolio Reviews",
    desc: "Book a portfolio review session any time after graduation. No expiry, no limits. Your work keeps getting sharper for years.",
    tag: "Lifetime",
    highlight: true,
  },
  {
    icon: Bot,
    title: "AI Toolkit — Built In-House",
    desc: "Claude Skills, Cursor Rules, AI product design workflows, MCP setup, and AI playbooks. Exclusive to students.",
    tag: "Exclusive",
  },
  {
    icon: BookOpen,
    title: "Lifetime Learning",
    desc: "Lifetime access to recordings, every curriculum update, and future AI modules as the field evolves.",
    tag: "Lifetime",
  },
  {
    icon: Globe,
    title: "Private Alumni Community",
    desc: "A lifetime seat in a private community of designers shipping AI products — referrals, critiques, and opportunities.",
    tag: "Lifetime",
  },
];

const TRANSFORMATION = [
  "Think like a Product Designer",
  "Design like a Senior Designer",
  "Build with AI",
  "Ship Real Products",
  "Create a Portfolio",
  "Get Hired",
];

const PHASES = [
  {
    n: "01",
    name: "Think",
    desc: "The mindset layer. Why people behave the way they do — and how great products use it.",
    topics: ["Psychology & human factors", "Design thinking", "Mental models", "Perception, cognition & emotional design"],
  },
  {
    n: "02",
    name: "Understand",
    desc: "From user behaviour to business reality. Learn to ask the questions PMs ask.",
    topics: ["Behavioral psychology & decision making", "Research & motivation", "Business thinking", "Product requirements & persuasive design"],
  },
  {
    n: "03",
    name: "Design",
    desc: "The craft. Structure, interaction and visual skill built through daily assignments.",
    topics: ["Information architecture & user research", "Interaction & visual design", "Design systems & Gestalt", "Wireframing & prototyping"],
  },
  {
    n: "04",
    name: "Build",
    desc: "Where AI changes everything. Ship with engineers, metrics, and modern AI workflows.",
    topics: ["Accessibility, usability & design QA", "Product metrics & developer handoff", "AI product design & prompt engineering", "Claude, Cursor & human-in-the-loop"],
  },
  {
    n: "05",
    name: "Launch",
    desc: "Turn the work into a career. Everything points at getting you hired.",
    topics: ["Portfolio & case study", "Resume & LinkedIn", "Interview preparation & career planning", "Capstone final presentation"],
  },
];

const PRICE_ROADMAP = [
  { label: "Founding", price: "$599", current: true },
  { label: "Early Cohorts", price: "$799" },
  { label: "Growth", price: "$999" },
  { label: "Standard", price: "$1,499" },
];

const FAQS = [
  {
    q: "Who is this mentorship for?",
    a: "Designers who want to specialise in AI products, career switchers moving into product design, and juniors who want senior-level craft faster. If you want to think, design and ship AI-powered products — this is built for you.",
  },
  {
    q: "Is it really 1:1?",
    a: "Yes. Every learner in the founding cohort gets live 1:1 mentorship for all 100 hours. This isn't a webinar with 200 people — the sessions are scheduled around you, weekday or weekend batch.",
  },
  {
    q: "How is the 100 hours structured?",
    a: "Five phases — Think, Understand, Design, Build, Launch — delivered through live sessions with daily assignments and personalised feedback. From session 40 onwards, every session contributes to your industry capstone project.",
  },
  {
    q: "Do I need to buy AI tools like Cursor or Claude?",
    a: "No. A professional AI workspace is included for your first 3 months, with full setup and onboarding. Depending on cohort and partner availability, that includes tools such as Cursor Pro and Claude Code.",
  },
  {
    q: "Do I need coding experience?",
    a: "No. You'll learn to build and ship with AI-assisted workflows — the same way modern product teams work. We handle the technical setup together during onboarding.",
  },
  {
    q: "What do I walk away with?",
    a: "A shipped capstone product, a production-ready portfolio, a complete case study, an ATS-optimised resume, a rebuilt LinkedIn profile — plus lifetime CVEdge Pro, lifetime portfolio reviews, and a seat in the alumni community.",
  },
  {
    q: "Why is founding tuition $599 when standard is $1,499?",
    a: "It's founding member pricing, not a discount. Early cohorts help refine the curriculum, and founding members get the lowest price the program will ever have. Tuition steps up with each stage: $599 → $799 → $999 → $1,499.",
  },
  {
    q: "What happens after I graduate?",
    a: "You keep everything — recordings, curriculum updates, future AI modules, portfolio reviews, and the alumni community. As CVEdge evolves, planned features like AI mock interviews and the interview studio roll out to alumni at no extra cost.",
  },
];

export default async function AIProductDesignPage() {
  const headerList = await headers();
  const countryCode = headerList.get("x-vercel-ip-country");
  const indiaRestricted = countryCode === "IN";

  return (
    <MentorshipCtaProvider>
      <PageTracker />
      <div className="bg-background">
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="container max-w-5xl mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Founding Cohort — Now Enrolling
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            AI Product Design
            <br />
            Mentorship
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            100 hours of live 1:1 mentorship. Learn to think, design, build and ship
            AI-powered products — and leave with the portfolio to prove it.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground mb-8">
            <span className="inline-flex items-center gap-1.5"><Users className="w-4 h-4" /> Live 1:1 — not recordings</span>
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-4 h-4" /> Weekday &amp; weekend batches</span>
            <span className="inline-flex items-center gap-1.5"><InfinityIcon className="w-4 h-4" /> Lifetime access &amp; updates</span>
          </div>

          {indiaRestricted ? (
            <div className="inline-block bg-warning/10 border border-warning/30 px-6 py-4 rounded-lg">
              <p className="font-semibold text-warning">Coming Soon in India</p>
              <p className="text-sm text-muted-foreground mt-1">
                We&apos;re preparing the program for the Indian market. Check back soon.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="text-5xl font-bold">
                  $599
                  <span className="text-lg font-normal text-muted-foreground ml-2">USD</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Founding tuition — standard tuition is $1,499
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <CtaButton className="px-8">Apply Now</CtaButton>
                <CtaButton variant="outline" className="px-8">View Curriculum</CtaButton>
              </div>
            </>
          )}
        </section>

        {/* ── Transformation ───────────────────────────────── */}
        <section className="border-y border-border bg-card/60 py-16 md:py-20">
          <div className="container max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              You&apos;re not buying 100 hours.
            </h2>
            <p className="text-muted-foreground mb-10">
              You&apos;re buying the transformation those hours produce.
            </p>
            <div className="flex flex-col items-center gap-1">
              {TRANSFORMATION.map((step, i) => (
                <div key={step} className="flex flex-col items-center">
                  <div className="px-6 py-3 rounded-lg border border-border bg-background font-medium">
                    {step}
                  </div>
                  {i < TRANSFORMATION.length - 1 && (
                    <ArrowDown className="w-4 h-4 text-primary my-1.5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Everything Included (offer stack) ────────────── */}
        <section id="included" className="container max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Everything Included</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              One tuition. Every tool, every review, every update — most of it for life.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {OFFER_STACK.map((item) => (
              <div
                key={item.title}
                className={
                  item.highlight
                    ? "border border-primary/40 bg-primary/5 rounded-lg p-6"
                    : "border border-border bg-card rounded-lg p-6"
                }
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                    {item.tag}
                  </span>
                </div>
                <h3 className="font-semibold mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
                {item.note && (
                  <p className="text-xs text-muted-foreground/80 mt-3 border-t border-border pt-3">
                    {item.note}
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8 max-w-2xl mx-auto">
            As CVEdge evolves, planned features — AI mock interviews, interview studio,
            portfolio builder, career hub — roll out to alumni at no extra cost.
          </p>
        </section>

        {/* ── Curriculum ───────────────────────────────────── */}
        <section id="curriculum" className="border-y border-border bg-card/60 py-16 md:py-24">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">The Curriculum</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Built around how products are actually built — not isolated UX topics.
                Five phases, one arc.
              </p>
            </div>
            <div className="space-y-4">
              {PHASES.map((phase) => (
                <div key={phase.n} className="border border-border bg-background rounded-lg p-6 md:flex md:gap-8">
                  <div className="md:w-48 shrink-0 mb-3 md:mb-0">
                    <div className="text-sm text-primary font-mono mb-1">Phase {phase.n}</div>
                    <h3 className="text-xl font-bold">{phase.name}</h3>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">{phase.desc}</p>
                    <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                      {phase.topics.map((t) => (
                        <li key={t} className="text-sm flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            {!indiaRestricted && (
              <div className="text-center mt-10">
                <p className="text-sm text-muted-foreground mb-4">
                  The full session-by-session curriculum isn&apos;t public.
                </p>
                <CtaButton variant="secondary" className="px-8">Get the Full Curriculum</CtaButton>
              </div>
            )}
          </div>
        </section>

        {/* ── Capstone ─────────────────────────────────────── */}
        <section className="container max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
          <h2 className="text-3xl font-bold mb-4">The Industry Capstone</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            From session 40 onwards, you stop doing exercises. Every remaining session
            contributes to shipping one complete, real product — yours.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {["Shipped Product", "Portfolio", "Case Study", "Resume & LinkedIn", "Final Presentation"].map((item) => (
              <div key={item} className="border border-border bg-card rounded-lg px-3 py-4 text-sm font-medium">
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* ── Pricing roadmap ──────────────────────────────── */}
        <section id="pricing" className="border-y border-border bg-card/60 py-16 md:py-24">
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-3">Founding Member Pricing</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-10">
              Not a discount — a roadmap. Founding members get the lowest tuition this
              program will ever have, and every benefit later cohorts pay more for.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {PRICE_ROADMAP.map((tier) => (
                <div
                  key={tier.label}
                  className={
                    tier.current
                      ? "border-2 border-primary bg-primary/5 rounded-lg p-5"
                      : "border border-border bg-background rounded-lg p-5 opacity-70"
                  }
                >
                  <div className="text-xs font-medium text-muted-foreground mb-1">{tier.label}</div>
                  <div className="text-2xl font-bold">{tier.price}</div>
                  {tier.current && (
                    <div className="text-xs text-primary font-medium mt-1">You are here</div>
                  )}
                </div>
              ))}
            </div>
            {!indiaRestricted && <CtaButton className="px-10">Apply for the Founding Cohort</CtaButton>}
          </div>
        </section>

        {/* ── Mentor ───────────────────────────────────────── */}
        <section id="mentor" className="container max-w-3xl mx-auto px-4 py-16 md:py-24">
          <h2 className="text-3xl font-bold mb-6 text-center">Learn From a Builder, Not a Lecturer</h2>
          <div className="border border-border bg-card rounded-lg p-8">
            <p className="text-muted-foreground mb-4">
              This mentorship is taught by Shiva — the designer-founder behind{" "}
              <span className="text-foreground font-medium">CVEdge</span>, the AI-powered
              career platform this program lives on. Every AI workflow in the curriculum
              is one he uses daily to design, build and ship real product.
            </p>
            <p className="text-muted-foreground">
              You won&apos;t learn theory from slides. You&apos;ll work the way a modern
              AI-first product team works — because your mentor runs one.
            </p>
          </div>
        </section>

        {/* ── Testimonials (CVEdge platform — swap for student quotes after cohort 1) ── */}
        <TestimonialsCarousel title="What learners say about CVEdge" />

        {/* ── FAQ ──────────────────────────────────────────── */}
        <section id="faq" className="border-t border-border bg-card/60 py-16 md:py-24">
          <div className="container max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 text-center">Questions, Answered</h2>
            <div className="space-y-4">
              {FAQS.map((item) => (
                <details key={item.q} className="border border-border bg-background rounded-lg p-5 group">
                  <summary className="font-medium cursor-pointer list-none flex justify-between items-center gap-4">
                    {item.q}
                    <span className="text-muted-foreground group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                  </summary>
                  <p className="text-sm text-muted-foreground mt-3">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────── */}
        <section className="border-t border-border py-16 md:py-24">
          <div className="container max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">The Founding Cohort Won&apos;t Reopen</h2>
            <p className="text-muted-foreground mb-8">
              $599 founding tuition exists once. When this cohort fills, the next price is $799.
            </p>
            {indiaRestricted ? (
              <p className="font-medium text-warning">Coming Soon in India</p>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <CtaButton className="px-8">Apply Now</CtaButton>
                <CtaButton variant="outline" className="px-8">Get the Full Curriculum</CtaButton>
              </div>
            )}
          </div>
        </section>
      </div>
    </MentorshipCtaProvider>
  );
}
