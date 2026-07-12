import { headers } from "next/headers";
import {
  GraduationCap, Target, Bot, BookOpen,
  CheckCircle2, Check, Mic, MonitorPlay, LayoutDashboard, Compass,
  FileText, Award, Library, ClipboardCheck, ArrowRight, Sparkles,
  Users, Clock, Star, User, Network, BrainCircuit,
  Infinity as InfinityIcon,
  CalendarDays, Download, PhoneCall, Briefcase,
} from "lucide-react";
import { MentorshipCtaProvider, CtaButton } from "./cta-provider";
import { PageTracker } from "./page-tracker";
import { CurriculumExplorer } from "./curriculum-explorer";
import {
  ScribbleUnderline, SparkleDoodle, DotGrid,
  CapstoneScene, FigmaLogo,
} from "./illustrations";

export const dynamic = "force-dynamic";

// ── Included with every enrollment ──
const FEATURED_PERK = {
  title: "Lifetime Portfolio Reviews",
  story:
    "Most courses end on the last day. This one does not. Land an interview two years from now and you can still book a portfolio review session. No expiry, no limits.",
  quote: "We are invested in your career, not just your payment.",
  checklist: [
    { title: "Review anytime", sub: "Years from now" },
    { title: "Personal feedback", sub: "From your mentor" },
    { title: "Real career support", sub: "When you need it most" },
  ],
};

const BIG_PERKS = [
  {
    brand: "figma",
    title: "Figma Professional",
    tag: "6 months",
    desc: "The industry-standard design workspace, yours for 6 months through education and partner benefits.",
    note: "Subject to education and partner program availability in your region.",
    outlined: true,
  },
  {
    brand: "cvedge",
    title: "CVEdge Pro",
    tag: "Lifetime",
    desc: "Every current and future Pro feature: resume, ATS, portfolio, cover letters, career tools & more.",
  },
];

const SMALL_PERKS = [
  { icon: Bot, title: "Claude Skills Pack", tag: "Lifetime", desc: "Custom skills built in-house for design work." },
  { icon: Library, title: "AI Workflow Library", tag: "Lifetime", desc: "The workflows used to ship real products." },
  { icon: BookOpen, title: "Course Recordings", tag: "Lifetime", desc: "Every session, yours forever." },
  { icon: FileText, title: "Resume & LinkedIn Review", tag: "During program", desc: "Career documents rebuilt with your mentor." },
  { icon: Mic, title: "Mock Interview Prep", tag: "During program", desc: "Practice the interviews before they happen." },
  { icon: Award, title: "Completion Certificate", tag: "After graduation", desc: "Issued after your capstone presentation." },
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
                who&apos;s built and scaled real products.
              </p>
              <div className="flex items-center gap-3 justify-center lg:justify-start mb-7">
                <span className="flex items-center gap-0.5" aria-label="Rated 4.9 out of 5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </span>
                <span className="font-bold text-amber-500">4.9</span>
                <span className="text-muted-foreground/40">|</span>
                <span className="text-muted-foreground font-medium">100+ Designers Mentored</span>
              </div>

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
              <div className="mt-8 rounded-2xl bg-white dark:bg-card shadow-sm p-6 text-left">
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
                    { logo: <Sparkles className="w-5 h-5 text-[#065F46] dark:text-[#34D399]" />, name: "AI Prompt Library", sub: "Lifetime" },
                    { logo: <LayoutDashboard className="w-5 h-5 text-[#065F46] dark:text-[#34D399]" />, name: "Portfolio Templates", sub: "Included" },
                    { logo: <FileText className="w-5 h-5 text-[#065F46] dark:text-[#34D399]" />, name: "Resume Review", sub: "During program" },
                    { logo: <Users className="w-5 h-5 text-[#065F46] dark:text-[#34D399]" />, name: "Discord Community", sub: "Lifetime" },
                  ].map((item) => (
                    <div key={item.name} className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#065F46]/[0.07] dark:bg-[#34D399]/10 shrink-0">
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

            {/* Right: transparent photo over glow, session-card rail on a dashed connector */}
            <div className="relative">
              {/* Mobile: plain image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/mentorship-hero.png"
                alt="A designer learning in a live mentorship session"
                className="lg:hidden w-full"
              />

              {/* Desktop: photo blends into bg over a glow */}
              <div className="hidden lg:block relative min-h-[560px]">
                {/* glow + dashed halo behind subject's head */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[420px] h-[420px] rounded-full bg-[#34D399]/20 blur-3xl" aria-hidden />
                <div className="absolute left-1/2 -translate-x-1/2 top-8 w-80 h-80 rounded-full border-2 border-dashed border-primary/20" aria-hidden />
                <SparkleDoodle className="absolute left-6 top-[36%] w-8 h-8 text-[#34D399] z-10" aria-hidden />
                <SparkleDoodle className="absolute right-10 top-2 w-7 h-7 text-primary/60 z-10" aria-hidden />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/mentorship-hero.png"
                  alt=""
                  className="absolute bottom-0 inset-x-0 mx-auto w-[94%]"
                />
              </div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="mt-10 rounded-2xl bg-white dark:bg-card shadow-sm px-6 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Clock, big: "100", label: "Hours Live", sub: "Hands-on learning" },
              { icon: User, big: "1:1", label: "Personal Mentorship", sub: "Direct guidance" },
              { icon: Network, big: "5", label: "Phases, One Arc", sub: "Think → Design → Build → Ship" },
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

      {/* ── Core of the program: 2x2 cards left, You↔Mentor journey card right ── */}
      <section className="bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <div>
              <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 bg-[#065F46]/10 dark:bg-[#34D399]/15 rounded-full text-xs font-semibold tracking-widest uppercase text-[#065F46] dark:text-[#34D399]">
                <Users className="w-3.5 h-3.5" />
                The Core of the Program
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                The Product Is the Mentorship
              </h2>
              <p className="text-muted-foreground mb-8">
                Not videos. Not templates. Not a Discord full of strangers. You
                work directly with your mentor for 100 hours: real product
                thinking, design, build and ship with expert guidance.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: GraduationCap,
                    title: "100 Hours of Live 1:1 Mentorship",
                    desc: "Deep work sessions tailored to your goals.",
                  },
                  {
                    icon: ClipboardCheck,
                    title: "Daily Assignments with Personalized Feedback",
                    desc: "Practice every day. Improve faster with expert feedback.",
                  },
                  {
                    icon: CalendarDays,
                    title: "Workshops & Weekend Deep Dives",
                    desc: "Hands-on sessions to master real-world skills.",
                  },
                  {
                    icon: Target,
                    title: "Industry Exposure from a Seasoned AD",
                    desc: "Learn the real-world product mindset.",
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl bg-white dark:bg-background shadow-sm p-6">
                    <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#065F46]/10 dark:bg-[#34D399]/10 text-[#065F46] dark:text-[#34D399] mb-5">
                      <item.icon className="w-6 h-6" />
                    </span>
                    <span className="block font-bold leading-snug mb-2">{item.title}</span>
                    <span className="block text-sm text-muted-foreground">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* You ↔ Mentor + The Journey card */}
            <div className="rounded-3xl bg-white dark:bg-background shadow-sm p-8 md:p-10">
              {/* You / Mentor connection */}
              <div className="flex items-start justify-center gap-16 mb-2">
                <div className="flex flex-col items-center gap-3">
                  <span className="px-4 py-1 rounded-full bg-muted text-sm font-semibold">You</span>
                  <span className="flex items-center justify-center w-16 h-16 rounded-full bg-[#0d9488] text-white ring-8 ring-[#0d9488]/10">
                    <User className="w-7 h-7" />
                  </span>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <span className="px-4 py-1 rounded-full bg-[#34D399]/20 text-[#065F46] dark:text-[#34D399] text-sm font-semibold">Mentor</span>
                  <span className="flex items-center justify-center w-16 h-16 rounded-full bg-[#065F46] text-white ring-8 ring-[#065F46]/10">
                    <User className="w-7 h-7" />
                  </span>
                </div>
              </div>
              {/* dashed arc + sparkle between the two */}
              <svg viewBox="0 0 160 40" className="w-40 mx-auto -mt-16 mb-12 relative z-10" fill="none" aria-hidden>
                <path d="M10 34 C 50 6, 110 6, 150 34" stroke="#34D399" strokeWidth="2.5" strokeDasharray="1 7" strokeLinecap="round" />
                <path d="M80 4 L 82.5 12 L 90 14.5 L 82.5 17 L 80 25 L 77.5 17 L 70 14.5 L 77.5 12 Z" fill="#34D399" />
              </svg>

              {/* The journey divider */}
              <div className="flex items-center gap-4 mb-7 mt-4">
                <span className="flex-1 h-px bg-border" />
                <span className="text-xs font-semibold tracking-[0.25em] uppercase text-muted-foreground">
                  The Journey
                </span>
                <span className="flex-1 h-px bg-border" />
              </div>

              {/* Journey ladder */}
              <ol className="relative max-w-xs mx-auto">
                <span className="absolute left-[15px] top-4 bottom-4 border-l-2 border-dotted border-primary/25" aria-hidden />
                {TRANSFORMATION.map((step, i) => {
                  const isLast = i === TRANSFORMATION.length - 1;
                  const color = isLast ? "#34D399" : PHASE_COLORS[i % PHASE_COLORS.length];
                  return (
                    <li key={step} className="relative flex items-center gap-4 py-2.5">
                      <span
                        className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0"
                        style={{ backgroundColor: color, color: isLast ? "#065F46" : "#fff" }}
                      >
                        {i + 1}
                      </span>
                      <span className={isLast ? "font-bold text-[#065F46] dark:text-[#34D399]" : "font-medium text-foreground/80"}>
                        {step}
                      </span>
                      {isLast && <SparkleDoodle className="w-5 h-5 text-[#34D399]" aria-hidden />}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ── Included with every enrollment: featured banner + perk grid ── */}
      <section id="included" className="relative bg-background overflow-hidden">
        <div className="container max-w-6xl mx-auto px-4 py-16 md:py-20 relative">
          <div className="mb-10 max-w-2xl relative">
            <SparkleDoodle className="absolute -top-8 -left-3 w-9 h-9 text-primary/60" />
            <div className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">The Offer</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Included With Every Enrollment</h2>
            <p className="text-muted-foreground">
              You&apos;re not just buying a course. You&apos;re joining the CVEdge
              ecosystem for life.
            </p>
          </div>

          {/* Featured: lifetime portfolio reviews */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a6b50] to-[#04382b] text-white p-8 md:p-10 mb-8">
            <div className="grid lg:grid-cols-12 gap-8 items-center relative">
              {/* infinity medallion */}
              <div className="hidden lg:flex lg:col-span-3 items-center justify-center relative">
                <span className="absolute w-52 h-52 rounded-full border-2 border-dashed border-white/15" aria-hidden />
                <SparkleDoodle className="absolute top-0 left-4 w-7 h-7 text-[#34D399]" aria-hidden />
                <span className="flex items-center justify-center w-36 h-36 rounded-full bg-[#03291f]">
                  <InfinityIcon className="w-16 h-16 text-[#34D399]" />
                </span>
              </div>
              {/* story */}
              <div className="lg:col-span-6">
                <div className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 bg-white/10 rounded-full text-xs font-semibold tracking-widest uppercase">
                  <SparkleDoodle className="w-3.5 h-3.5 text-[#34D399]" />
                  The perk nobody else offers
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">{FEATURED_PERK.title}</h3>
                <p className="text-white/80 mb-5">{FEATURED_PERK.story}</p>
                <p className="text-[#34D399] font-medium">
                  <span className="text-2xl font-serif leading-none mr-1" aria-hidden>&ldquo;</span>
                  {FEATURED_PERK.quote}
                </p>
              </div>
              {/* checklist */}
              <div className="lg:col-span-3 lg:border-l lg:border-white/15 lg:pl-8">
                <ul className="space-y-5">
                  {FEATURED_PERK.checklist.map((item) => (
                    <li key={item.title} className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#34D399] shrink-0">
                        <Check className="w-4 h-4 text-[#04382b]" strokeWidth={3} />
                      </span>
                      <span>
                        <span className="block font-semibold leading-tight">{item.title}</span>
                        <span className="block text-sm text-white/60">{item.sub}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="text-right mt-6">
                  <p className="font-serif italic text-lg text-[#34D399]">reviews, forever</p>
                  <ScribbleUnderline className="w-28 h-2.5 text-[#34D399] ml-auto -mt-0.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Two wide brand cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {BIG_PERKS.map((perk) => (
              <div
                key={perk.title}
                className={[
                  "rounded-2xl bg-white dark:bg-card shadow-sm p-7 flex items-start gap-5",
                  perk.outlined ? "ring-1 ring-[#065F46]/30" : "",
                ].join(" ")}
              >
                <span className="flex items-center justify-center w-16 h-16 rounded-2xl bg-background dark:bg-background shadow-sm shrink-0 p-3">
                  {perk.brand === "figma" ? (
                    <FigmaLogo className="h-full w-auto" />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src="/img/CV-Edge-Logo-square.svg" alt="" className="w-full h-full" />
                  )}
                </span>
                <span>
                  <span className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold">{perk.title}</span>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${tagClasses(perk.tag)}`}>
                      {perk.tag}
                    </span>
                  </span>
                  <span className="block text-sm text-muted-foreground">{perk.desc}</span>
                  {perk.note && (
                    <span className="block text-xs text-muted-foreground/70 mt-2">{perk.note}</span>
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Six compact perk cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SMALL_PERKS.map((perk) => (
              <div key={perk.title} className="rounded-2xl bg-white dark:bg-card shadow-sm p-5 flex items-start gap-4">
                <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#065F46]/[0.08] dark:bg-[#34D399]/10 text-[#065F46] dark:text-[#34D399] shrink-0">
                  <perk.icon className="w-5.5 h-5.5" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-[15px] leading-snug">{perk.title}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${tagClasses(perk.tag)}`}>
                      {perk.tag}
                    </span>
                  </span>
                  <span className="block text-sm text-muted-foreground">{perk.desc}</span>
                </span>
              </div>
            ))}
          </div>

          {!indiaRestricted && (
            <div className="mt-12 flex items-center justify-center gap-4">
              <SparkleDoodle className="w-6 h-6 text-[#34D399] -scale-x-100" aria-hidden />
              <CtaButton mode="brochure" className="px-8">
                <Download className="w-4 h-4 mr-2" />
                Download the Program Brochure
              </CtaButton>
              <SparkleDoodle className="w-6 h-6 text-[#34D399]" aria-hidden />
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

      {/* ── Curriculum: interactive phase explorer ── */}
      <CurriculumExplorer indiaRestricted={indiaRestricted} />

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
