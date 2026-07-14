import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2, XCircle, Video, Users, User, ArrowRight,
  Briefcase, LayoutDashboard, FileText, Bot,
} from "lucide-react";
import { MentorshipCtaBanner } from "@/components/marketing/mentorship-cta-banner";

const PAGE_URL = "https://www.thecvedge.com/product-design-course";

export const metadata: Metadata = {
  title: "Product Design Course: How to Choose One That Gets You Hired",
  description:
    "Not every product design course leads to a job. Here is what a course must cover in the AI era, how the three formats compare, and what you should walk away with.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Product Design Course: How to Choose One That Gets You Hired",
    description:
      "What a product design course must cover in the AI era, how formats compare, and what you should walk away with.",
    url: PAGE_URL,
    siteName: "CVEdge",
    type: "article",
  },
};

const MUST_COVER = [
  {
    icon: Briefcase,
    title: "Product thinking, not just UI",
    desc: "Screens are the last mile. A course that starts with visual design and ends with a Dribbble shot skips the part hiring managers actually test: framing problems, weighing trade-offs, and connecting design decisions to business outcomes.",
  },
  {
    icon: Bot,
    title: "AI workflows as a first-class skill",
    desc: "Product teams now prototype with AI tools daily. A modern course should teach you to design AI-powered features and to use tools like Claude, Cursor and Figma AI in your own process, not treat them as a bonus module.",
  },
  {
    icon: LayoutDashboard,
    title: "A real project you shipped",
    desc: "Portfolios built from fictional briefs all look the same. Look for a course where the final project is a working product you can put in front of an interviewer, with real constraints and real decisions to talk through.",
  },
  {
    icon: FileText,
    title: "Career preparation built in",
    desc: "Getting hired is its own skill. Resume, LinkedIn, case study writing and interview practice should be part of the program, not an upsell after you graduate.",
  },
];

const FORMATS = [
  {
    icon: Video,
    name: "Self-paced video courses",
    pros: ["Cheapest option", "Learn on your own schedule"],
    cons: ["No feedback on your work", "Completion rates are famously low", "Portfolio projects look identical to every other graduate's"],
  },
  {
    icon: Users,
    name: "Cohort bootcamps",
    pros: ["Structure and deadlines", "Peer community"],
    cons: ["Feedback is spread across 20 to 200 students", "Pace is fixed whether you are ahead or behind", "Instructors rarely review your work individually"],
  },
  {
    icon: User,
    name: "1:1 mentorship programs",
    pros: [
      "Every session is about your work and your gaps",
      "Pace adapts to you",
      "Feedback comes from a practitioner, on your actual projects",
    ],
    cons: ["Costs more than video courses", "Quality depends entirely on the mentor, so vet them hard"],
  },
];

const OUTCOMES = [
  "A shipped, working product you designed and built",
  "A portfolio case study that explains your decisions, not just your screens",
  "Fluency in AI-assisted design and prototyping workflows",
  "A resume and LinkedIn profile rebuilt for the role you want",
  "Interview practice before the interviews that count",
];

export default function ProductDesignCoursePage() {
  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="container max-w-4xl mx-auto px-4 pt-16 pb-12 md:pt-24">
        <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">
          Choosing a Course
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
          A product design course is easy to buy. The right one is harder to pick.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Thousands of designers finish a course every month and still cannot get
          interviews. The difference is rarely effort. It is what the course
          covered, how much individual feedback it included, and whether it left
          you with anything an interviewer can react to.
        </p>
      </section>

      {/* What it must cover */}
      <section className="container max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">
          Four things a course must cover in the AI era
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {MUST_COVER.map((item) => (
            <div key={item.title} className="rounded-2xl bg-white dark:bg-card shadow-sm p-6">
              <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#065F46]/[0.07] dark:bg-[#34D399]/10 mb-4">
                <item.icon className="w-5 h-5 text-[#065F46] dark:text-[#34D399]" />
              </span>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Format comparison */}
      <section className="bg-card/60">
        <div className="container max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            The three formats, honestly compared
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            Each format works for someone. The question is which one matches how
            much feedback you need and how fast you want to move.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {FORMATS.map((f) => (
              <div key={f.name} className="rounded-2xl bg-white dark:bg-card shadow-sm p-6 flex flex-col">
                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </span>
                <h3 className="font-semibold mb-4">{f.name}</h3>
                <ul className="space-y-2 mb-4">
                  {f.pros.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-2 mt-auto">
                  {f.cons.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <XCircle className="w-4 h-4 text-error/70 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="container max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
          What you should walk away with
        </h2>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          Whatever format you choose, hold it to this list. If a course cannot
          promise most of these, it is selling content, not a career change.
        </p>
        <ul className="space-y-3 max-w-2xl">
          {OUTCOMES.map((o) => (
            <li key={o} className="flex items-start gap-3 rounded-xl bg-white dark:bg-card shadow-sm px-5 py-4">
              <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <span className="text-sm md:text-base">{o}</span>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-muted-foreground">
          Weighing mentorship against a course? Read{" "}
          <Link href="/ux-mentorship" className="font-medium text-primary underline underline-offset-4">
            how UX mentorship works
          </Link>{" "}
          or start with{" "}
          <Link href="/learn-product-design" className="font-medium text-primary underline underline-offset-4">
            a realistic roadmap for learning product design
          </Link>
          .
        </p>
      </section>

      {/* CTA */}
      <section className="container max-w-4xl mx-auto px-4 pb-20">
        <MentorshipCtaBanner
          title="A course built around your work, not a playlist"
          subtitle="The CVEdge AI Product Design Mentorship is 100 hours of live 1:1 sessions across five phases, ending in a shipped capstone and a portfolio interviewers can react to."
        />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/ai-product-design" className="inline-flex items-center gap-1 font-medium text-primary hover:underline underline-offset-4">
            See the full curriculum and what is included
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </p>
      </section>
    </main>
  );
}
