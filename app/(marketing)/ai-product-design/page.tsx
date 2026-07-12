import { headers } from "next/headers";
import {
  GraduationCap, Palette, Rocket, Target, Bot, BookOpen,
  CheckCircle2, Mic, MonitorPlay, LayoutDashboard, Compass,
  FileText, Award, Library, ClipboardCheck, ArrowRight, Sparkles,
  Users, Clock, TrendingUp, Infinity as InfinityIcon,
  CalendarDays, Download, PhoneCall, Briefcase, BrainCircuit,
} from "lucide-react";
import { MentorshipCtaProvider, CtaButton } from "./cta-provider";
import { PageTracker } from "./page-tracker";
import {
  ScribbleUnderline, DoodleArrow, SparkleDoodle, DotGrid,
  MentorshipScene, CapstoneScene,
  FigmaLogo, ClaudeLogo, CursorLogo,
} from "./illustrations";

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
    icon: Palette,
    brands: ["figma"],
    title: "Figma Professional",
    desc: "The industry-standard design workspace, yours for 6 months through education and partner benefits.",
    tag: "6 months",
    highlight: true,
    note: "Subject to education and partner program availability in your region.",
  },
  {
    icon: Rocket,
    brands: ["cvedge"],
    title: "CVEdge Pro",
    desc: "Every current and future Pro feature: resume, ATS, portfolio, cover letters, career tools.",
    tag: "Lifetime",
    highlight: true,
  },
  {
    icon: Bot,
    title: "Claude Skills Pack",
    desc: "Custom skills built in-house for design work.",
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

// Brand palette rotation for the five phase markers (teal, brand green, navy, mid navy, mint)
const PHASE_COLORS = ["#1a7a6d", "#065F46", "#1E3A5F", "#2A4F7A", "#0d9488"];

// Duration tags colored by type: lifetime green, timed teal, program-scoped navy
function tagClasses(tag: string): string {
  if (tag === "Lifetime")
    return "bg-[#065F46]/10 text-[#065F46] dark:bg-[#34D399]/15 dark:text-[#34D399]";
  if (tag.includes("month")) return "bg-primary/10 text-primary";
  return "bg-[#1E3A5F]/10 text-[#1E3A5F] dark:bg-[#9DB8D9]/15 dark:text-[#9DB8D9]";
}

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

/* Real quotes only. Fill with mentees Shiva has actually mentored
   (LinkedIn recommendations count); swap in founding-cohort student
   quotes after cohort 1. Section stays hidden while this is empty. */
const COURSE_TESTIMONIALS: { quote: string; name: string; role: string; highlight?: string }[] = [];

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
    q: "What tools will I need?",
    a: "You will learn with Claude, Cursor and Figma. Figma Professional is included for 6 months. For AI tools, we set everything up together during onboarding and free tiers are enough to start; a paid plan is recommended as you move into the Build phase.",
  },
  {
    q: "Do I need coding experience?",
    a: "No. You will learn to build and ship with AI-assisted workflows, the same way modern product teams work. We handle the technical setup together during onboarding.",
  },
  {
    q: "What do I walk away with?",
    a: "A shipped capstone product, a production-ready portfolio, a complete case study, an ATS-optimised resume, a rebuilt LinkedIn profile, plus lifetime CVEdge Pro and lifetime portfolio reviews.",
  },
  {
    q: "Why is founding tuition lower than standard?",
    a: "It is founding member pricing, not a discount. Early cohorts help refine the curriculum, and founding members lock in the lowest tuition the program will ever have. Tuition steps up with every stage until it reaches standard.",
  },
  {
    q: "What happens after I graduate?",
    a: "You keep everything: session recordings, lifetime portfolio reviews, and lifetime CVEdge Pro. As CVEdge evolves, planned features like AI mock interviews and the interview studio roll out to alumni at no extra cost.",
  },
];

export default async function AIProductDesignPage() {
  const headerList = await headers();
  const countryCode = headerList.get("x-vercel-ip-country");
  const indiaRestricted = countryCode === "IN";

  return (
    <MentorshipCtaProvider>
      <PageTracker />

      {/* ── Hero: mockup layout — text + includes left, photo + floating cards right ── */}
      <section className="relative bg-background overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(55% 60% at 68% 35%, rgba(52,211,153,0.12) 0%, transparent 70%)" }}
          aria-hidden
        />
        <div className="container max-w-7xl mx-auto px-4 pt-12 pb-8 md:pt-16 md:pb-12 relative">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-6 items-start">
            {/* Left */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-primary/10 rounded-full text-xs font-semibold tracking-widest uppercase text-primary">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Live 1:1 Mentorship Program
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight leading-[1.05]">
                Become an
                <br />
                <span className="relative inline-block text-primary">
                  AI Product Designer
                  <ScribbleUnderline className="absolute -bottom-3 left-0 w-full h-4 text-[#34D399]" />
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-5 max-w-xl mx-auto lg:mx-0">
                Master product thinking, AI workflows, and design end-to-end
                products with 1:1 mentorship from a{" "}
                <a href="#mentor" className="font-medium text-foreground underline underline-offset-4 decoration-primary">
                  designer-founder
                </a>{" "}
                who has built and scaled real products.
              </p>
              <p className="text-sm font-medium text-muted-foreground mb-7">
                100+ designers mentored over 10 years
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
                    Start Building Today
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </CtaButton>
                  <CtaButton mode="curriculum" variant="outline" className="px-8">
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Curriculum
                  </CtaButton>
                </div>
              )}

              {/* Enrollment includes panel */}
              <div className="mt-8 rounded-2xl bg-card shadow-sm p-6 text-left">
                <div className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">
                  Enrollment Includes
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-5">
                  {[
                    { logo: <FigmaLogo className="h-5 w-auto" />, name: "Figma Professional", sub: "6 months" },
                    {
                      logo: (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src="/img/CV-Edge-Logo-square.svg" alt="" className="w-5 h-5" />
                      ),
                      name: "CVEdge Pro",
                      sub: "Lifetime access",
                    },
                    { logo: <Sparkles className="w-5 h-5 text-primary" />, name: "AI Prompt Library", sub: "Lifetime" },
                    { logo: <LayoutDashboard className="w-5 h-5 text-[#1E3A5F] dark:text-[#9DB8D9]" />, name: "Portfolio Templates", sub: "Included" },
                    { logo: <FileText className="w-5 h-5 text-[#065F46] dark:text-[#34D399]" />, name: "Resume Review", sub: "During program" },
                    { logo: <Users className="w-5 h-5 text-[#0d9488]" />, name: "Discord Community", sub: "Lifetime" },
                  ].map((item) => (
                    <div key={item.name} className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-background shadow-sm shrink-0">
                        {item.logo}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold leading-tight">{item.name}</span>
                        <span className="block text-xs text-muted-foreground mt-0.5">{item.sub}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: photo + floating session cards */}
            <div className="relative lg:pl-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/mentorship-hero.jpg"
                alt="A designer learning in a live mentorship session"
                className="rounded-3xl w-full max-w-xl mx-auto"
              />
              <div className="hidden md:block" aria-hidden>
                <div className="absolute top-4 -right-1 lg:right-0 w-60 rounded-2xl bg-card/95 shadow-lg p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#065F46] text-white shrink-0">
                      <Rocket className="w-5 h-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold">Portfolio Shipped</span>
                      <span className="block text-xs text-muted-foreground">Build. Validate. Launch.</span>
                    </span>
                    <CheckCircle2 className="w-5 h-5 text-success ml-auto shrink-0" />
                  </div>
                </div>
                <div className="absolute top-1/3 -right-1 lg:right-0 w-60 rounded-2xl bg-card/95 shadow-lg p-4">
                  <div className="flex items-center gap-3 mb-2.5">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#065F46] text-white shrink-0">
                      <TrendingUp className="w-5 h-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold">Session Progress</span>
                      <span className="block text-xs text-muted-foreground">74 of 100 sessions</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary">
                    <div className="h-1.5 w-3/4 rounded-full bg-primary" />
                  </div>
                </div>
                <div className="absolute top-[62%] -right-1 lg:right-0 w-60 rounded-2xl bg-card/95 shadow-lg p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#065F46] text-white shrink-0">
                      <CalendarDays className="w-5 h-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold">Next Live Review</span>
                      <span className="block text-xs text-muted-foreground">
                        Today, 7:00 PM{" "}
                        <span className="px-1.5 py-0.5 rounded-full bg-secondary text-[10px] font-medium">Google Meet</span>
                      </span>
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-6 right-2 lg:right-6 text-right">
                  <p className="font-serif italic text-sm leading-snug text-foreground/80">
                    Real projects.<br />Real feedback.<br />Real growth.
                  </p>
                  <ScribbleUnderline className="w-24 h-2.5 text-[#34D399] ml-auto mt-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="mt-10 rounded-2xl bg-card shadow-sm px-6 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Clock, big: "100", label: "Hours Live", sub: "Hands-on learning" },
              { icon: GraduationCap, big: "1:1", label: "Personal Mentorship", sub: "Direct guidance" },
              { icon: Compass, big: "5", label: "Phases, One Arc", sub: "Think → Design → Build → Ship" },
              { icon: InfinityIcon, big: "Lifetime", label: "Access", sub: "Learn. Build. Grow." },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-4">
                <span className="flex items-center justify-center w-11 h-11 rounded-full border border-border text-primary shrink-0">
                  <s.icon className="w-5 h-5" />
                </span>
                <span>
                  <span className="block text-xl font-bold leading-tight">
                    {s.big} <span className="text-sm font-semibold">{s.label}</span>
                  </span>
                  <span className="block text-xs text-muted-foreground">{s.sub}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core value: what you are actually paying for ── */}
      <section className="bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                The Product Is the Mentorship
              </h2>
              <p className="text-muted-foreground mb-10">
                Not videos, not templates, not a Discord full of strangers.
                You work directly with your mentor for 100 hours until you can
                think, design, build and ship on your own.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {CORE_VALUE.map((item, i) => (
                  <div key={item.text} className="rounded-2xl bg-background shadow-sm p-5">
                    <span
                      className="flex items-center justify-center w-10 h-10 rounded-xl mb-3"
                      style={{
                        color: PHASE_COLORS[i % PHASE_COLORS.length],
                        backgroundColor: `${PHASE_COLORS[i % PHASE_COLORS.length]}1a`,
                      }}
                    >
                      <item.icon className="w-5 h-5" />
                    </span>
                    <span className="font-medium text-sm leading-snug block">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* The journey: illustration + colored ladder in one card */}
            <div className="rounded-3xl bg-background shadow-sm p-8 md:p-10">
              <MentorshipScene className="w-full max-w-[260px] mx-auto mb-6" />
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-5 text-center">
                The Journey
              </div>
              <ol className="space-y-3.5 max-w-xs mx-auto">
                {TRANSFORMATION.map((step, i) => {
                  const isLast = i === TRANSFORMATION.length - 1;
                  const color = isLast ? "#34D399" : PHASE_COLORS[i % PHASE_COLORS.length];
                  return (
                    <li key={step} className="flex items-center gap-3.5">
                      <span
                        className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0"
                        style={{
                          backgroundColor: color,
                          color: isLast ? "#065F46" : "#fff",
                        }}
                      >
                        {i + 1}
                      </span>
                      <span className={isLast ? "font-bold" : "font-medium text-muted-foreground text-sm"}>
                        {step}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ── Included with every enrollment: featured perk + bento ── */}
      <section id="included" className="relative bg-background overflow-hidden">
        <DotGrid id="perks-dots" className="pointer-events-none absolute top-12 right-0 w-56 h-56 text-primary/15" />
        <div className="container max-w-6xl mx-auto px-4 py-16 md:py-20 relative">
          <div className="mb-14 max-w-2xl relative">
            <SparkleDoodle className="absolute -top-8 -left-3 w-9 h-9 text-primary/60" />
            <div className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">The Offer</div>
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
                  i < 2 ? "md:col-span-3 p-7" : "md:col-span-2 p-5",
                  perk.highlight ? "bg-primary/5 ring-2 ring-primary/30" : "bg-card",
                  "rounded-2xl shadow-sm",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  {"brands" in perk && perk.brands ? (
                    <span className="flex items-center gap-2">
                      {perk.brands.map((brand) => (
                        <span key={brand} className="flex items-center justify-center w-10 h-10 rounded-lg bg-background shadow-sm p-2">
                          {brand === "claude" && <ClaudeLogo className="w-full h-full" />}
                          {brand === "cursor" && <CursorLogo className="w-full h-full" />}
                          {brand === "figma" && <FigmaLogo className="h-full w-auto" />}
                          {brand === "cvedge" && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src="/img/CV-Edge-Logo-square.svg" alt="CVEdge" className="w-full h-full" />
                          )}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span
                      className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                      style={{
                        color: PHASE_COLORS[i % PHASE_COLORS.length],
                        backgroundColor: `${PHASE_COLORS[i % PHASE_COLORS.length]}1a`,
                      }}
                    >
                      <perk.icon className="w-4.5 h-4.5" />
                    </span>
                  )}
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${tagClasses(perk.tag)}`}>
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
        <div className="container max-w-4xl mx-auto px-4 py-16 md:py-20">
          <div className="text-center mb-16 relative">
            <DoodleArrow className="hidden md:block absolute right-8 top-2 w-16 h-12 text-primary/50" />
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
                  <span
                    className="absolute left-6 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full text-white font-bold shadow-md z-10"
                    style={{ backgroundColor: PHASE_COLORS[i] }}
                  >
                    {phase.n}
                  </span>
                  <div
                    className={[
                      "ml-16 md:ml-0 rounded-2xl bg-card shadow-sm p-6 md:p-7 border-t-4",
                      i % 2 === 0 ? "md:col-start-1 md:mr-10" : "md:col-start-2 md:ml-10",
                    ].join(" ")}
                    style={{ borderTopColor: PHASE_COLORS[i] }}
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
                <BookOpen className="w-4 h-4 mr-2" />
                Get the Full Curriculum
              </CtaButton>
            </div>
          )}
        </div>
      </section>

      {/* ── Capstone: split with giant numeral ── */}
      <section className="bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-16 md:py-20">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5">
              <div className="flex items-end gap-4 justify-center lg:justify-start">
                <div className="text-[7rem] md:text-[9rem] font-black leading-none text-primary">40</div>
                <div className="text-sm text-muted-foreground pb-5 max-w-[10rem]">
                  From session 40, exercises end.
                </div>
              </div>
              <CapstoneScene className="w-full max-w-md mx-auto lg:mx-0 mt-2" />
            </div>
            <div className="lg:col-span-7">
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
        <div className="container max-w-5xl mx-auto px-4 py-16 md:py-20">
          <div className="grid md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-4">
              <div className="relative max-w-[300px] mx-auto">
                <DotGrid id="mentor-dots" className="absolute -top-5 -left-5 w-28 h-28 text-primary/30" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/mentor-shiva.jpg"
                  alt="B Sivarami Reddy, Principal Product Designer and mentor"
                  className="relative rounded-3xl shadow-lg w-full"
                />
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-[#065F46] text-white shadow-md px-5 py-2 text-sm font-medium whitespace-nowrap">
                  10+ years · AI Product Design
                </div>
              </div>
              <div className="text-center mt-8">
                <div className="text-xl font-bold">B Sivarami Reddy</div>
                <div className="text-sm text-muted-foreground">
                  Principal Product Designer · Founder, CVEdge
                </div>
              </div>
            </div>
            <div className="md:col-span-8">
              <div className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
                Your Mentor
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Learn From a Builder, Not a Lecturer
              </h2>
              <p className="text-muted-foreground mb-6">
                Every AI workflow in this curriculum is one Shiva uses daily to
                design, build and ship real product. The proof is not a slide
                deck. It is the platform you are reading this on.
              </p>
              <ul className="space-y-2.5 mb-6">
                {[
                  "10+ years designing AI-powered SaaS products; Principal Product Designer at a global edtech company",
                  "Shipped AI products end to end: AI grading, QC automation, resume tooling, cutting manual effort by 70% and driving $6M+ in annual business impact",
                  "Founder of CVEdge, designed and built solo with Claude Code, Cursor, React and Next.js, the exact stack you will learn",
                  "Certified User Experience Analyst (CXA), Human Factors International",
                ].map((fact) => (
                  <li key={fact} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    {fact}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-6">
                <a
                  href="https://linkedin.com/in/uxsiva"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary underline underline-offset-4"
                >
                  LinkedIn
                </a>
                <a
                  href="https://uxsiva.onrender.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary underline underline-offset-4"
                >
                  Portfolio
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Course testimonials: renders only when real quotes exist ── */}
      {COURSE_TESTIMONIALS.length > 0 && (
        <section className="bg-card">
          <div className="container max-w-6xl mx-auto px-4 py-16 md:py-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              What Mentees Say
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {COURSE_TESTIMONIALS.map((t, i) => (
                <figure key={t.name} className="rounded-2xl bg-background shadow-sm p-7 flex flex-col">
                  <span
                    className="text-4xl font-serif leading-none mb-3"
                    style={{ color: PHASE_COLORS[i % PHASE_COLORS.length] }}
                    aria-hidden
                  >
                    &ldquo;
                  </span>
                  <blockquote className="text-sm text-muted-foreground flex-1">{t.quote}</blockquote>
                  <figcaption className="mt-5 pt-4 border-t border-border/50">
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <section id="faq" className="bg-background">
        <div className="container max-w-3xl mx-auto px-4 py-16 md:py-20">
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

      {/* ── Closer: highest intent, one focused ask ── */}
      <section className="relative overflow-hidden bg-[#065F46] text-white">
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full border-[24px] border-[#34D399]/15" aria-hidden />
        <div className="pointer-events-none absolute -top-20 -left-20 w-60 h-60 rounded-full border-[18px] border-[#34D399]/10" aria-hidden />
        <div className="container max-w-2xl mx-auto px-4 py-16 md:py-20 relative text-center">
          <PhoneCall className="w-8 h-8 text-[#34D399] mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Still Deciding? Talk It Through.</h2>
          <p className="text-white/70 mb-10 max-w-lg mx-auto">
            A free 30 minute career consultation with your mentor. No pitch,
            no pressure. WhatsApp or Google Meet, your pick.
          </p>
          {indiaRestricted ? (
            <p className="font-medium">Coming Soon in India</p>
          ) : (
            <CtaButton mode="call" variant="secondary" className="px-12">
              Book a Free Discovery Call
            </CtaButton>
          )}
        </div>
      </section>
    </MentorshipCtaProvider>
  );
}
