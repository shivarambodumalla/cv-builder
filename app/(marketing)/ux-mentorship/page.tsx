import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2, ArrowRight, MessageSquare, Eye, Repeat,
  Compass, UserCheck, Briefcase, GraduationCap, Sparkles,
} from "lucide-react";
import { MentorshipCtaBanner } from "@/components/marketing/mentorship-cta-banner";

const PAGE_URL = "https://www.thecvedge.com/ux-mentorship";

export const metadata: Metadata = {
  title: "UX Mentorship: What It Is, How It Works, Who It Is For",
  description:
    "UX mentorship is feedback on your actual work from someone who has done the job. Here is what real mentorship looks like, what it is not, and who gets the most from it.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "UX Mentorship: What It Is, How It Works, Who It Is For",
    description:
      "What real UX mentorship looks like, what it is not, and who gets the most from it.",
    url: PAGE_URL,
    siteName: "CVEdge",
    type: "article",
  },
};

const IS_ISNT = {
  is: [
    "A practitioner reviewing your actual work and telling you what a hiring panel would say",
    "Questions that expose gaps in your reasoning before an interviewer finds them",
    "Direction on what to learn next based on where you are, not a fixed syllabus",
    "Accountability from someone who knows exactly what you committed to last week",
  ],
  isnt: [
    "Watching someone design while you take notes",
    "Generic career advice you could get from a blog post",
    "A community Slack where feedback is whoever replies first",
    "Motivation without correction. A mentor who never pushes back is a cheerleader",
  ],
};

const SESSION_SHAPE = [
  {
    icon: Eye,
    title: "Review",
    desc: "You bring work: a flow, a case study draft, a prototype. The mentor reviews it the way a design lead would in a real critique.",
  },
  {
    icon: MessageSquare,
    title: "Push back",
    desc: "Why this layout? What did you consider and reject? What does the business get from this? The questions matter more than the fixes.",
  },
  {
    icon: Compass,
    title: "Redirect",
    desc: "You leave with specific changes to make and a clear reason for each one, plus what to prepare for the next session.",
  },
  {
    icon: Repeat,
    title: "Repeat",
    desc: "The loop compounds. Ten cycles of review and correction move you further than a hundred hours of passive video.",
  },
];

const WHO_BENEFITS = [
  {
    icon: Briefcase,
    title: "Career switchers",
    desc: "You have transferable skills but no design vocabulary and no portfolio. A mentor shortcuts years of guessing which of your instincts are right.",
  },
  {
    icon: GraduationCap,
    title: "Junior designers",
    desc: "You can produce screens but plateau at execution. Mentorship is how you absorb senior judgment: trade-offs, prioritisation, and defending decisions.",
  },
  {
    icon: Sparkles,
    title: "Designers moving into AI products",
    desc: "AI products have new patterns: uncertainty, streaming interfaces, prompt design, trust. A mentor who has shipped them saves you from learning by public failure.",
  },
  {
    icon: UserCheck,
    title: "Self-taught designers",
    desc: "You learned from articles and copying good products. Mentorship finds the invisible gaps, the things you do not know you do not know.",
  },
];

export default function UxMentorshipPage() {
  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="container max-w-4xl mx-auto px-4 pt-16 pb-12 md:pt-24">
        <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">
          UX Mentorship
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
          Courses teach the material. Mentorship teaches you.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          UX mentorship is a simple idea: someone who has done the job looks at
          your work, tells you what is weak, and shows you how a senior designer
          would think about it. It is the fastest known way to close the gap
          between producing screens and making design decisions.
        </p>
      </section>

      {/* Is / Isn't */}
      <section className="container max-w-4xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-white dark:bg-card shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4 text-[#065F46] dark:text-[#34D399]">
              What mentorship is
            </h2>
            <ul className="space-y-3">
              {IS_ISNT.is.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-white dark:bg-card shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4 text-muted-foreground">
              What it is not
            </h2>
            <ul className="space-y-3">
              {IS_ISNT.isnt.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                  <span className="w-4 h-4 shrink-0 mt-0.5 rounded-full border border-muted-foreground/40 flex items-center justify-center text-[10px]">
                    ✕
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Session shape */}
      <section className="bg-card/60">
        <div className="container max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            What a good session actually looks like
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            If your sessions are mostly the mentor talking, you are watching a
            lecture with extra steps. The work on the table should be yours.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SESSION_SHAPE.map((s, i) => (
              <div key={s.title} className="rounded-2xl bg-white dark:bg-card shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                    <s.icon className="w-5 h-5 text-primary" />
                  </span>
                  <span className="text-xs font-bold text-muted-foreground/60">0{i + 1}</span>
                </div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who benefits */}
      <section className="container max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">
          Who gets the most from mentorship
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {WHO_BENEFITS.map((w) => (
            <div key={w.title} className="rounded-2xl bg-white dark:bg-card shadow-sm p-6">
              <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#065F46]/[0.07] dark:bg-[#34D399]/10 mb-4">
                <w.icon className="w-5 h-5 text-[#065F46] dark:text-[#34D399]" />
              </span>
              <h3 className="font-semibold mb-2">{w.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Still comparing formats? See{" "}
          <Link href="/product-design-course" className="font-medium text-primary underline underline-offset-4">
            how to choose a product design course
          </Link>{" "}
          or learn{" "}
          <Link href="/product-design-mentor" className="font-medium text-primary underline underline-offset-4">
            how to vet a product design mentor
          </Link>
          .
        </p>
      </section>

      {/* CTA */}
      <section className="container max-w-4xl mx-auto px-4 pb-20">
        <MentorshipCtaBanner
          title="Mentorship where every session is 1:1"
          subtitle="The CVEdge AI Product Design Mentorship runs the review, push back, redirect loop across 100 live hours, from product thinking to a shipped capstone."
        />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/ai-product-design" className="inline-flex items-center gap-1 font-medium text-primary hover:underline underline-offset-4">
            View the program and curriculum
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </p>
      </section>
    </main>
  );
}
