import { headers } from "next/headers";
import {
  GraduationCap, Cpu, Palette, Rocket, Target, Bot, BookOpen, Globe,
  CheckCircle2, Sparkles, Mic, MonitorPlay, LayoutDashboard, Compass,
  FileText, Award, RefreshCw, Library, SlidersHorizontal, ClipboardCheck,
  CalendarDays, Download, Eye, PhoneCall, Briefcase, BrainCircuit,
} from "lucide-react";
import { MentorshipCtaProvider, CtaButton } from "./cta-provider";
import { PageTracker } from "./page-tracker";
import { TestimonialsCarousel } from "@/components/marketing/testimonials-carousel";

export const dynamic = "force-dynamic";

// ── Core value: the product itself, not perks ──
const CORE_VALUE = [
  { icon: GraduationCap, text: "100 hours of live 1:1 mentorship" },
  { icon: ClipboardCheck, text: "Daily assignments with personal feedback" },
  { icon: CalendarDays, text: "Weekday or weekend batches" },
  { icon: Target, text: "Industry capstone from session 40" },
];

// ── Included with every enrollment ──
const FEATURED_PERK = {
  icon: Target,
  title: "Lifetime Portfolio Reviews",
  story:
    "Most courses end on the last day. This one does not. Land an interview two years from now and you can still book a portfolio review session. No expiry, no limits.",
  quote: "We are invested in your career, not just your payment.",
};

const PERKS = [
  {
    icon: Rocket,
    title: "CVEdge Pro",
    desc: "Every current and future Pro feature: resume, ATS, portfolio, cover letters, career tools.",
    tag: "Lifetime",
    highlight: true,
  },
  {
    icon: Cpu,
    title: "AI Workspace",
    desc: "Professional AI tooling for your first 3 months, fully set up and onboarded.",
    tag: "3 months",
    note: "Depending on cohort and partner availability, learners receive tools such as Cursor Pro, Claude Code, and other professional AI software used throughout the mentorship.",
  },
  {
    icon: Palette,
    title: "Design Workspace",
    desc: "Figma Professional through education and partner benefits, where available.",
    tag: "3 to 6 months",
  },
  {
    icon: Bot,
    title: "Claude Skills Pack",
    desc: "Custom skills built in-house for design work.",
    tag: "Lifetime",
  },
  {
    icon: SlidersHorizontal,
    title: "Cursor Rules Pack",
    desc: "Production rules for AI-assisted building.",
    tag: "Lifetime",
  },
  {
    icon: Library,
    title: "AI Workflow Library",
    desc: "The workflows used to ship real product.",
    tag: "Lifetime",
  },
  {
    icon: BookOpen,
    title: "Course Recordings",
    desc: "Every session, yours forever.",
    tag: "Lifetime",
  },
  {
    icon: RefreshCw,
    title: "Course Updates",
    desc: "New AI modules as the field evolves.",
    tag: "Lifetime",
  },
  {
    icon: Globe,
    title: "Alumni Community",
    desc: "Private. Referrals, critiques, opportunities.",
    tag: "Lifetime",
  },
  {
    icon: FileText,
    title: "Resume & LinkedIn Review",
    desc: "Career documents rebuilt with your mentor.",
    tag: "During program",
  },
  {
    icon: Mic,
    title: "Mock Interview Prep",
    desc: "Practice the interviews before they happen.",
    tag: "During program",
  },
  {
    icon: Award,
    title: "Completion Certificate",
    desc: "Issued after your capstone presentation.",
    tag: "After graduation",
  },
];

// ── Future lifetime benefits, added automatically ──
const FUTURE_PERKS = [
  { icon: Mic, title: "AI Mock Interviews" },
  { icon: MonitorPlay, title: "Interview Studio" },
  { icon: LayoutDashboard, title: "Portfolio Builder" },
  { icon: Compass, title: "Career Hub" },
  { icon: Briefcase, title: "Job Tracker" },
  { icon: BrainCircuit, title: "AI Career Coach" },
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
    desc: "The mindset layer. Why people behave the way they do, and how great products use it.",
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
    a: "Designers who want to specialise in AI products, career switchers moving into product design, and juniors who want senior-level craft faster. If you want to think, design and ship AI-powered products, this is built for you.",
  },
  {
    q: "Is it really 1:1?",
    a: "Yes. Every learner in the founding cohort gets live 1:1 mentorship for all 100 hours. This is not a webinar with 200 people. Sessions are scheduled around you, weekday or weekend batch.",
  },
  {
    q: "How is the 100 hours structured?",
    a: "Five phases: Think, Understand, Design, Build, Launch. Live sessions with daily assignments and personalised feedback. From session 40 onwards, every session contributes to your industry capstone project.",
  },
  {
    q: "Do I need to buy AI tools like Cursor or Claude?",
    a: "No. A professional AI workspace is included for your first 3 months, with full setup and onboarding. Depending on cohort and partner availability, that includes tools such as Cursor Pro and Claude Code.",
  },
  {
    q: "Do I need coding experience?",
    a: "No. You will learn to build and ship with AI-assisted workflows, the same way modern product teams work. We handle the technical setup together during onboarding.",
  },
  {
    q: "What do I walk away with?",
    a: "A shipped capstone product, a production-ready portfolio, a complete case study, an ATS-optimised resume, a rebuilt LinkedIn profile, plus lifetime CVEdge Pro, lifetime portfolio reviews, and a seat in the alumni community.",
  },
  {
    q: "Why is founding tuition lower than standard?",
    a: "It is founding member pricing, not a discount. Early cohorts help refine the curriculum, and founding members lock in the lowest tuition the program will ever have. Tuition steps up with every stage until it reaches standard.",
  },
  {
    q: "What happens after I graduate?",
    a: "You keep everything: recordings, curriculum updates, future AI modules, portfolio reviews, and the alumni community. As CVEdge evolves, planned features like AI mock interviews and the interview studio roll out to alumni at no extra cost.",
  },
];

export default async function AIProductDesignPage() {
  const headerList = await headers();
  const countryCode = headerList.get("x-vercel-ip-country");
  const indiaRestricted = countryCode === "IN";

  return (
    <MentorshipCtaProvider>
      <PageTracker />

      {/* ── Hero: asymmetric split, text left, session composition right ── */}
      <section className="bg-background overflow-hidden">
        <div className="container max-w-6xl mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Founding Cohort Now Enrolling
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight leading-[1.05]">
                Become an
                <br />
                <span className="text-primary">AI Product Designer</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                100 hours of live 1:1 mentorship. Think, design, build and ship
                AI-powered products, and leave with the portfolio to prove it.
              </p>
              {indiaRestricted ? (
                <div className="inline-block bg-warning/10 px-6 py-4 rounded-2xl">
                  <p className="font-semibold text-warning">Coming Soon in India</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    We are preparing the program for the Indian market. Check back soon.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <CtaButton mode="call" className="px-8">
                    <PhoneCall className="w-4 h-4 mr-2" />
                    Book a Free Discovery Call
                  </CtaButton>
                  <CtaButton mode="curriculum" variant="outline" className="px-8">
                    View Curriculum
                  </CtaButton>
                </div>
              )}
            </div>

            {/* Layered session cards */}
            <div className="lg:col-span-5 hidden lg:block relative h-[420px]" aria-hidden>
              <div className="absolute top-0 right-4 w-72 rounded-2xl bg-card shadow-lg p-5 rotate-2">
                <div className="text-xs text-primary font-semibold tracking-widest uppercase mb-2">Phase 04 · Build</div>
                <div className="font-semibold mb-3">AI Product Design</div>
                <div className="h-2 rounded-full bg-secondary mb-2">
                  <div className="h-2 w-3/4 rounded-full bg-primary" />
                </div>
                <div className="text-xs text-muted-foreground">Session 74 of 100</div>
              </div>
              <div className="absolute top-40 left-0 w-72 rounded-2xl bg-[#065F46] text-white shadow-xl p-5 -rotate-2">
                <div className="flex items-center gap-2 text-[#34D399] text-xs font-semibold tracking-widest uppercase mb-2">
                  <CalendarDays className="w-3.5 h-3.5" /> Today, 7:00 PM
                </div>
                <div className="font-semibold mb-1">Capstone review with your mentor</div>
                <div className="text-sm text-white/60">Live 1:1 · Google Meet</div>
              </div>
              <div className="absolute bottom-4 right-10 rounded-full bg-card shadow-md px-4 py-2 text-sm font-medium rotate-1">
                Claude · Cursor · MCP · Figma
              </div>
              <div className="absolute top-28 left-24 rounded-full bg-success/15 text-success shadow-sm px-4 py-2 text-sm font-medium -rotate-3">
                Portfolio shipped ✓
              </div>
            </div>
          </div>

          {/* Stat strip */}
          <div className="mt-16 grid grid-cols-3 max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
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
        </div>
      </section>

      {/* ── Core value: what you are actually paying for ── */}
      <section className="bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-20 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                The Product Is the Mentorship
              </h2>
              <p className="text-muted-foreground mb-8">
                Not videos, not templates, not a Discord full of strangers.
                You work directly with your mentor for 100 hours until you can
                think, design, build and ship on your own.
              </p>
              <ul className="space-y-4">
                {CORE_VALUE.map((item) => (
                  <li key={item.text} className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
                      <item.icon className="w-5 h-5" />
                    </span>
                    <span className="font-medium">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Transformation ladder as vertical rail */}
            <div className="relative pl-8">
              <div className="absolute left-[13px] top-3 bottom-3 w-0.5 bg-primary/20" aria-hidden />
              <ol className="space-y-5">
                {TRANSFORMATION.map((step, i) => (
                  <li key={step} className="relative flex items-center gap-4">
                    <span className="absolute -left-8 flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className={i === TRANSFORMATION.length - 1 ? "font-bold text-lg" : "font-medium text-muted-foreground"}>
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ── Included with every enrollment: featured perk + bento ── */}
      <section id="included" className="bg-background">
        <div className="container max-w-6xl mx-auto px-4 py-20 md:py-28">
          <div className="mb-14 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Included With Every Enrollment</h2>
            <p className="text-muted-foreground">
              You are not buying a course. You are buying a lifetime membership
              to the CVEdge ecosystem.
            </p>
          </div>

          {/* Featured: lifetime portfolio reviews */}
          <div className="relative overflow-hidden rounded-3xl bg-[#065F46] text-white p-8 md:p-12 mb-6">
            <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full border-[20px] border-[#34D399]/15" aria-hidden />
            <div className="relative md:flex md:items-end md:justify-between gap-10">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold tracking-widest uppercase">
                  <Target className="w-3.5 h-3.5 text-[#34D399]" /> The perk nobody else offers
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">{FEATURED_PERK.title}</h3>
                <p className="text-white/75 mb-4">{FEATURED_PERK.story}</p>
                <p className="text-[#34D399] font-medium">&ldquo;{FEATURED_PERK.quote}&rdquo;</p>
              </div>
              <div className="hidden md:block shrink-0 text-right">
                <div className="text-6xl font-black text-[#34D399]">∞</div>
                <div className="text-sm text-white/60 mt-1">reviews, forever</div>
              </div>
            </div>
          </div>

          {/* Bento: first two large, rest compact */}
          <div className="grid md:grid-cols-6 gap-4">
            {PERKS.map((perk, i) => (
              <div
                key={perk.title}
                className={[
                  i < 3 ? "md:col-span-2 p-6" : "md:col-span-2 p-5",
                  perk.highlight ? "bg-primary/5 ring-2 ring-primary/30" : "bg-card",
                  "rounded-2xl shadow-sm",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
                    <perk.icon className="w-4.5 h-4.5" />
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground whitespace-nowrap">
                    {perk.tag}
                  </span>
                </div>
                <h3 className="font-semibold mb-1">{perk.title}</h3>
                <p className="text-sm text-muted-foreground">{perk.desc}</p>
                {perk.note && (
                  <p className="text-xs text-muted-foreground/70 mt-3">{perk.note}</p>
                )}
              </div>
            ))}
          </div>

          {!indiaRestricted && (
            <div className="mt-10 text-center">
              <CtaButton mode="brochure" variant="secondary" className="px-8">
                <Download className="w-4 h-4 mr-2" />
                Download the Program Brochure
              </CtaButton>
            </div>
          )}
        </div>
      </section>

      {/* ── Future lifetime benefits ── */}
      <section className="bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-16 md:py-20">
          <div className="lg:flex lg:items-center lg:gap-16">
            <div className="lg:w-1/3 mb-10 lg:mb-0">
              <div className="inline-block mb-4 px-3 py-1 bg-success/15 text-success rounded-full text-xs font-semibold tracking-widest uppercase">
                Added automatically
              </div>
              <h2 className="text-3xl font-bold mb-3">The Ecosystem Keeps Growing</h2>
              <p className="text-muted-foreground text-sm">
                As CVEdge ships new premium features, every alumnus gets them
                at no extra cost. Planned and in progress:
              </p>
            </div>
            <div className="lg:w-2/3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FUTURE_PERKS.map((perk) => (
                <div key={perk.title} className="flex items-center gap-3 rounded-xl bg-background shadow-sm px-4 py-3.5">
                  <perk.icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-medium">{perk.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Curriculum: vertical timeline ── */}
      <section id="curriculum" className="bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-20 md:py-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">The Curriculum</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built around how products are actually built, not isolated UX topics.
              Five phases, one arc.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/15 md:-translate-x-px" aria-hidden />
            <div className="space-y-12">
              {PHASES.map((phase, i) => (
                <div key={phase.n} className="relative md:grid md:grid-cols-2 md:gap-12">
                  <span className="absolute left-6 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold shadow-md z-10">
                    {phase.n}
                  </span>
                  <div
                    className={[
                      "ml-16 md:ml-0 rounded-2xl bg-card shadow-sm p-6 md:p-7",
                      i % 2 === 0 ? "md:col-start-1 md:mr-10" : "md:col-start-2 md:ml-10",
                    ].join(" ")}
                  >
                    <h3 className="text-xl font-bold mb-2">{phase.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{phase.desc}</p>
                    <ul className="space-y-1.5">
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
          </div>

          {!indiaRestricted && (
            <div className="text-center mt-14">
              <p className="text-sm text-muted-foreground mb-4">
                The full session-by-session curriculum is not public.
              </p>
              <CtaButton mode="curriculum" variant="secondary" className="px-8">
                <Eye className="w-4 h-4 mr-2" />
                Get the Full Curriculum
              </CtaButton>
            </div>
          )}
        </div>
      </section>

      {/* ── Capstone: split with giant numeral ── */}
      <section className="bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-20 md:py-24">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-4 text-center lg:text-left">
              <div className="text-[8rem] md:text-[11rem] font-black leading-none text-primary">40</div>
              <div className="text-sm text-muted-foreground -mt-2">
                From session 40, exercises end.
              </div>
            </div>
            <div className="lg:col-span-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">The Industry Capstone</h2>
              <p className="text-muted-foreground mb-8 max-w-xl">
                Every remaining session contributes to shipping one complete,
                real product. Yours. You graduate with proof, not certificates alone.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Shipped Product", "Portfolio", "Case Study", "Resume & LinkedIn", "Final Presentation"].map((item) => (
                  <span key={item} className="rounded-full bg-background shadow-sm px-5 py-2.5 text-sm font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mentor ── */}
      <section id="mentor" className="bg-background">
        <div className="container max-w-3xl mx-auto px-4 py-20 md:py-24 text-center">
          <span className="text-6xl text-primary/20 font-serif leading-none" aria-hidden>&ldquo;</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 -mt-4">
            Learn From a Builder, Not a Lecturer
          </h2>
          <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
            This mentorship is taught by Shiva, the designer-founder behind{" "}
            <span className="text-foreground font-medium">CVEdge</span>, the AI-powered
            career platform this program lives on. Every AI workflow in the curriculum
            is one he uses daily to design, build and ship real product.
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            You will not learn theory from slides. You will work the way a modern
            AI-first product team works, because your mentor runs one.
          </p>
        </div>
      </section>

      {/* ── Testimonials (CVEdge platform, swap for student quotes after cohort 1) ── */}
      <TestimonialsCarousel title="What learners say about CVEdge" />

      {/* ── FAQ ── */}
      <section id="faq" className="bg-background">
        <div className="container max-w-3xl mx-auto px-4 py-20 md:py-24">
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

      {/* ── Final: three paths, three intents ── */}
      <section className="relative overflow-hidden bg-[#065F46] text-white">
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full border-[24px] border-[#34D399]/15" aria-hidden />
        <div className="pointer-events-none absolute -top-20 -left-20 w-60 h-60 rounded-full border-[18px] border-[#34D399]/10" aria-hidden />
        <div className="container max-w-5xl mx-auto px-4 py-20 md:py-28 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Start Where You Are</h2>
            <p className="text-white/70">
              Curious, serious, or ready. Pick your path.
            </p>
          </div>
          {indiaRestricted ? (
            <p className="text-center font-medium">Coming Soon in India</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-5">
              <div className="rounded-2xl bg-white/10 p-7 flex flex-col">
                <Eye className="w-6 h-6 text-[#34D399] mb-4" />
                <h3 className="font-semibold text-lg mb-2">Explore the Curriculum</h3>
                <p className="text-sm text-white/60 mb-6 flex-1">
                  See all 5 phases, session by session, before you decide anything.
                </p>
                <CtaButton mode="curriculum" variant="secondary" className="w-full">
                  View Curriculum
                </CtaButton>
              </div>
              <div className="rounded-2xl bg-white/10 p-7 flex flex-col">
                <Download className="w-6 h-6 text-[#34D399] mb-4" />
                <h3 className="font-semibold text-lg mb-2">Take It With You</h3>
                <p className="text-sm text-white/60 mb-6 flex-1">
                  The complete program brochure and curriculum as a PDF.
                </p>
                <CtaButton mode="brochure" variant="secondary" className="w-full">
                  Download Brochure
                </CtaButton>
              </div>
              <div className="rounded-2xl bg-white text-foreground p-7 flex flex-col ring-2 ring-[#34D399]">
                <PhoneCall className="w-6 h-6 text-[#065F46] mb-4" />
                <h3 className="font-semibold text-lg mb-2">Talk It Through</h3>
                <p className="text-sm text-muted-foreground mb-6 flex-1">
                  A free 30 minute career consultation. WhatsApp or Google Meet, your pick.
                </p>
                <CtaButton mode="call" className="w-full">
                  Book a Discovery Call
                </CtaButton>
              </div>
            </div>
          )}
        </div>
      </section>
    </MentorshipCtaProvider>
  );
}
