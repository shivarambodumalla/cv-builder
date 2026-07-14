import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, AlertTriangle, Lightbulb, Search, PenTool,
  Hammer, Rocket, Bot, Terminal,
} from "lucide-react";
import { MentorshipCtaBanner } from "@/components/marketing/mentorship-cta-banner";
import { FigmaLogo } from "../ai-product-design/illustrations";

const PAGE_URL = "https://www.thecvedge.com/learn-product-design";

export const metadata: Metadata = {
  title: "How to Learn Product Design: A Realistic Roadmap",
  description:
    "A five-phase roadmap for learning product design in the AI era: think, understand, design, build, launch. What to learn at each stage, which tools matter, and the mistakes that cost beginners months.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "How to Learn Product Design: A Realistic Roadmap",
    description:
      "A five-phase roadmap for learning product design in the AI era, with the tools that matter and the mistakes that cost beginners months.",
    url: PAGE_URL,
    siteName: "CVEdge",
    type: "article",
  },
};

const PHASES = [
  {
    icon: Lightbulb,
    name: "Think",
    color: "#1a7a6d",
    focus: "Product thinking before pixels",
    desc: "Learn to frame problems, identify users, and connect design to business outcomes. Most beginners skip this and it shows in every interview. Practice by deconstructing products you use daily: what problem does this screen solve, and for whom?",
  },
  {
    icon: Search,
    name: "Understand",
    color: "#065F46",
    focus: "Research and evidence",
    desc: "User interviews, competitive analysis, and synthesising findings into decisions. The skill is not collecting data. It is knowing which evidence changes your design and which is noise.",
  },
  {
    icon: PenTool,
    name: "Design",
    color: "#1E3A5F",
    focus: "Craft: flows, systems, interfaces",
    desc: "Now the visible work: user flows, wireframes, design systems, and high-fidelity interfaces in Figma. Quality here comes from critique cycles, not from more tutorials. Get your work reviewed relentlessly.",
  },
  {
    icon: Hammer,
    name: "Build",
    color: "#2A4F7A",
    focus: "AI-assisted building",
    desc: "The newest phase of the discipline. With Claude and Cursor, designers now ship working prototypes and real features without an engineering background. Designers who can build are a different hiring category.",
  },
  {
    icon: Rocket,
    name: "Launch",
    color: "#0d9488",
    focus: "Ship, measure, tell the story",
    desc: "Put your product in front of real users, measure what happens, and turn the whole journey into a case study. A shipped product with honest metrics beats ten fictional portfolio projects.",
  },
];

const TOOLS = [
  {
    render: () => <FigmaLogo className="h-5 w-auto" />,
    name: "Figma",
    role: "The industry-standard design workspace. Non-negotiable; every team you interview with uses it.",
  },
  {
    render: () => <Bot className="w-5 h-5 text-primary" />,
    name: "Claude",
    role: "Research synthesis, content design, design critique, and prompt-driven prototyping. The thinking partner in a modern workflow.",
  },
  {
    render: () => <Terminal className="w-5 h-5 text-primary" />,
    name: "Cursor",
    role: "AI-assisted building. This is how designers without an engineering background ship working products.",
  },
];

const MISTAKES = [
  "Starting with visual polish instead of product thinking. Pretty screens with weak reasoning fail interviews",
  "Collecting courses instead of finishing projects. One shipped product outweighs five certificates",
  "Building a portfolio of fictional redesigns. Interviewers have seen a thousand unsolicited Spotify redesigns",
  "Learning alone for too long. Without feedback you practice your mistakes until they feel like style",
  "Ignoring AI tools because they feel like cheating. Hiring teams now assume fluency with them",
];

export default function LearnProductDesignPage() {
  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="container max-w-4xl mx-auto px-4 pt-16 pb-12 md:pt-24">
        <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">
          Learning Roadmap
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
          How to learn product design without wasting a year on the wrong things
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Product design is learnable without a design degree. What costs people
          months is learning things in the wrong order: polishing visuals before
          they can frame a problem, or collecting certificates instead of
          shipping anything. This is the order that works.
        </p>
      </section>

      {/* Five phases */}
      <section className="container max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">
          The five-phase roadmap
        </h2>
        <div className="space-y-4">
          {PHASES.map((p, i) => (
            <div key={p.name} className="rounded-2xl bg-white dark:bg-card shadow-sm p-6 md:p-7">
              <div className="flex items-start gap-4 md:gap-5">
                <span
                  className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
                  style={{ backgroundColor: `${p.color}14`, color: p.color }}
                >
                  <p.icon className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1.5">
                    <h3 className="font-bold text-lg">
                      <span className="text-muted-foreground/50 mr-2">0{i + 1}</span>
                      {p.name}
                    </h3>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: p.color }}>
                      {p.focus}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tools */}
      <section className="bg-card/60">
        <div className="container max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            The three tools that matter in 2026
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            Tool lists get long fast. These three cover the entire roadmap above;
            everything else can wait until a job requires it.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {TOOLS.map((t) => (
              <div key={t.name} className="rounded-2xl bg-white dark:bg-card shadow-sm p-6">
                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-4">
                  {t.render()}
                </span>
                <h3 className="font-semibold mb-2">{t.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mistakes */}
      <section className="container max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">
          The five mistakes that cost beginners months
        </h2>
        <ul className="space-y-3 max-w-2xl">
          {MISTAKES.map((m) => (
            <li key={m} className="flex items-start gap-3 rounded-xl bg-white dark:bg-card shadow-sm px-5 py-4">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <span className="text-sm md:text-base leading-relaxed">{m}</span>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-muted-foreground">
          Ready to go deeper? Compare{" "}
          <Link href="/product-design-course" className="font-medium text-primary underline underline-offset-4">
            course formats and what they deliver
          </Link>
          , or see{" "}
          <Link href="/product-design-mentor" className="font-medium text-primary underline underline-offset-4">
            how to choose a mentor
          </Link>{" "}
          when you are ready for feedback on real work.
        </p>
      </section>

      {/* CTA */}
      <section className="container max-w-4xl mx-auto px-4 pb-20">
        <MentorshipCtaBanner
          title="Walk this exact roadmap with a mentor"
          subtitle="The AI Product Design Mentorship follows these five phases across 100 live 1:1 hours: Think, Understand, Design, Build, Launch, ending in a shipped capstone."
        />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/ai-product-design" className="inline-flex items-center gap-1 font-medium text-primary hover:underline underline-offset-4">
            Explore the full curriculum
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </p>
      </section>
    </main>
  );
}
