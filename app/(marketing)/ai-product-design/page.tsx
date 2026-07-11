import { headers } from "next/headers";
import {
  GraduationCap, Cpu, Palette, Rocket, Target, Bot, BookOpen, Globe,
  CheckCircle2, ArrowRight, Sparkles, Mic, MonitorPlay, LayoutDashboard, Compass,
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

const FUTURE_PERKS = [
  { icon: Mic, title: "AI Mock Interviews", desc: "Practice with AI interviewers trained on real design interviews." },
  { icon: MonitorPlay, title: "Interview Studio", desc: "Record, review and refine your interview presence." },
  { icon: LayoutDashboard, title: "Portfolio Builder", desc: "Build and host your portfolio inside CVEdge." },
  { icon: Compass, title: "Career Hub", desc: "Jobs, referrals and career resources in one place." },
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
    q: "Why is founding tuition so much lower than standard?",
    a: "It's founding member pricing, not a discount. Early cohorts help refine the curriculum, and founding members lock in the lowest tuition the program will ever have. Tuition steps up with every stage until it reaches standard.",
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

      {/* ── Hero — no price here; the pricing section owns it ── */}
      <section className="bg-background">
        <div className="container max-w-5xl mx-auto px-4 pt-20 pb-24 md:pt-28 md:pb-32 text-center">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Founding Cohort — Now Enrolling
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-[1.05]">
            AI Product Design
            <br />
            <span className="text-primary">Mentorship</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Learn to think, design, build and ship AI-powered products —
            and leave with the portfolio to prove it.
          </p>

          {/* Stat anchors */}
          <div className="grid grid-cols-3 max-w-2xl mx-auto mb-12">
            {[
              { big: "100", small: "hours live" },
              { big: "1:1", small: "mentorship" },
              { big: "5", small: "phases, one arc" },
            ].map((s) => (
              <div key={s.small}>
                <div className="text-4xl md:text-5xl font-bold text-primary">{s.big}</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">{s.small}</div>
              </div>
            ))}
          </div>

          {indiaRestricted ? (
            <div className="inline-block bg-warning/10 px-6 py-4 rounded-2xl">
              <p className="font-semibold text-warning">Coming Soon in India</p>
              <p className="text-sm text-muted-foreground mt-1">
                We&apos;re preparing the program for the Indian market. Check back soon.
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <CtaButton className="px-10">Apply Now</CtaButton>
              <CtaButton variant="outline" className="px-10">View Curriculum</CtaButton>
            </div>
          )}
        </div>
      </section>

      {/* ── Transformation — brand-green canvas ── */}
      <section className="relative overflow-hidden bg-[#065F46] text-white">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full border-[24px] border-[#34D399]/15" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 w-80 h-80 rounded-full border-[28px] border-[#34D399]/10" />
        <div className="container max-w-5xl mx-auto px-4 py-20 md:py-28 relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-center">
            You&apos;re not buying 100 hours.
          </h2>
          <p className="text-white/70 mb-14 text-center">
            You&apos;re buying the transformation those hours produce.
          </p>
          <div className="flex flex-col md:flex-row md:flex-wrap items-center justify-center gap-3">
            {TRANSFORMATION.map((step, i) => (
              <div key={step} className="flex flex-col md:flex-row items-center gap-3">
                <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/10">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#34D399] text-[#065F46] text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="font-medium text-sm md:text-base whitespace-nowrap">{step}</span>
                </div>
                {i < TRANSFORMATION.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-[#34D399] rotate-90 md:rotate-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Everything Included ── */}
      <section id="included" className="bg-background">
        <div className="container max-w-6xl mx-auto px-4 py-20 md:py-28">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Everything Included</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              One tuition. Every tool, every review, every update — most of it for life.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {OFFER_STACK.map((item) => (
              <div
                key={item.title}
                className={
                  item.highlight
                    ? "rounded-2xl p-7 bg-primary/5 ring-2 ring-primary/30 shadow-sm"
                    : "rounded-2xl p-7 bg-card shadow-sm"
                }
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary shrink-0">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                    {item.tag}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
                {item.note && (
                  <p className="text-xs text-muted-foreground/80 mt-4">{item.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Future perks — free as CVEdge evolves ── */}
      <section className="bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-20 md:py-28">
          <div className="text-center mb-14">
            <div className="inline-block mb-4 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
              Free for alumni — forever
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              The Program Keeps Growing. You Never Pay Again.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              As CVEdge evolves, planned features roll out to every alumnus automatically —
              at no extra cost.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FUTURE_PERKS.map((perk) => (
              <div key={perk.title} className="rounded-2xl p-6 bg-background shadow-sm text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto mb-4">
                  <perk.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-1.5">{perk.title}</h3>
                <p className="text-sm text-muted-foreground">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Curriculum — numbered phase anchors ── */}
      <section id="curriculum" className="bg-background">
        <div className="container max-w-5xl mx-auto px-4 py-20 md:py-28">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">The Curriculum</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built around how products are actually built — not isolated UX topics.
              Five phases, one arc.
            </p>
          </div>
          <div className="space-y-6">
            {PHASES.map((phase) => (
              <div key={phase.n} className="relative rounded-2xl bg-card shadow-sm p-7 md:p-9 overflow-hidden">
                <span
                  aria-hidden
                  className="absolute -top-6 right-2 text-[7rem] md:text-[9rem] font-black leading-none text-primary/[0.07] select-none"
                >
                  {phase.n}
                </span>
                <div className="relative md:flex md:gap-10">
                  <div className="md:w-44 shrink-0 mb-4 md:mb-0">
                    <div className="text-xs text-primary font-semibold tracking-widest uppercase mb-1">
                      Phase {phase.n}
                    </div>
                    <h3 className="text-2xl font-bold">{phase.name}</h3>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">{phase.desc}</p>
                    <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                      {phase.topics.map((t) => (
                        <li key={t} className="text-sm flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {!indiaRestricted && (
            <div className="text-center mt-12">
              <p className="text-sm text-muted-foreground mb-4">
                The full session-by-session curriculum isn&apos;t public.
              </p>
              <CtaButton variant="secondary" className="px-10">Get the Full Curriculum</CtaButton>
            </div>
          )}
        </div>
      </section>

      {/* ── Capstone — brand-green canvas ── */}
      <section className="relative overflow-hidden bg-[#065F46] text-white">
        <div className="pointer-events-none absolute -top-20 -left-20 w-64 h-64 rounded-full border-[20px] border-[#34D399]/15" />
        <div className="container max-w-4xl mx-auto px-4 py-20 md:py-28 text-center relative">
          <div className="inline-block mb-5 px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium">
            Session 40 onwards
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">The Industry Capstone</h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-12">
            You stop doing exercises. Every remaining session contributes to shipping
            one complete, real product — yours.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {["Shipped Product", "Portfolio", "Case Study", "Resume & LinkedIn", "Final Presentation"].map((item) => (
              <div key={item} className="rounded-xl bg-white/10 px-3 py-5 text-sm font-medium">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mentor ── */}
      <section id="mentor" className="bg-card">
        <div className="container max-w-3xl mx-auto px-4 py-20 md:py-28">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            Learn From a Builder, Not a Lecturer
          </h2>
          <div className="rounded-2xl bg-background shadow-sm p-8 md:p-10">
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
        </div>
      </section>

      {/* ── Testimonials (CVEdge platform — swap for student quotes after cohort 1) ── */}
      <TestimonialsCarousel title="What learners say about CVEdge" />

      {/* ── FAQ ── */}
      <section id="faq" className="bg-background">
        <div className="container max-w-3xl mx-auto px-4 py-20 md:py-28">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Questions, Answered</h2>
          <div className="space-y-4">
            {FAQS.map((item) => (
              <details key={item.q} className="rounded-xl bg-card shadow-sm p-5 group">
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

      {/* ── Final CTA — brand-green canvas, no numbers ── */}
      <section className="relative overflow-hidden bg-[#065F46] text-white">
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full border-[24px] border-[#34D399]/15" />
        <div className="container max-w-2xl mx-auto px-4 py-20 md:py-28 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            The Founding Cohort Won&apos;t Reopen
          </h2>
          <p className="text-white/70 mb-10">
            When this cohort fills, founding tuition is gone for good.
          </p>
          {indiaRestricted ? (
            <p className="font-medium">Coming Soon in India</p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <CtaButton variant="secondary" className="px-10">Apply Now</CtaButton>
              <CtaButton variant="outline" className="px-10 border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
                Get the Full Curriculum
              </CtaButton>
            </div>
          )}
        </div>
      </section>
    </MentorshipCtaProvider>
  );
}
