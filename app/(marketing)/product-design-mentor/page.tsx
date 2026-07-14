import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle, ArrowRight, ShieldCheck,
  MessageSquare, Layers, TrendingUp,
} from "lucide-react";
import { MentorshipCtaBanner } from "@/components/marketing/mentorship-cta-banner";

const PAGE_URL = "https://www.thecvedge.com/product-design-mentor";

export const metadata: Metadata = {
  title: "How to Find a Product Design Mentor Worth Paying For",
  description:
    "The questions to ask a prospective product design mentor, the red flags that predict a bad engagement, and what a serious mentorship should include.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "How to Find a Product Design Mentor Worth Paying For",
    description:
      "Questions to ask a prospective mentor, red flags to watch for, and what serious mentorship includes.",
    url: PAGE_URL,
    siteName: "CVEdge",
    type: "article",
  },
};

const QUESTIONS = [
  {
    q: "What have you shipped, and what was your role in it?",
    why: "Titles are cheap. You want someone who owned outcomes: made the calls, lived with the consequences, and can show the product. Vague answers here predict vague feedback later.",
  },
  {
    q: "Can I see work from people you have mentored?",
    why: "A real mentor can point to before-and-after: portfolios that improved, mentees who got hired. If everything is testimonial screenshots and nothing is inspectable, be careful.",
  },
  {
    q: "How much of each session is my work versus your material?",
    why: "The right answer is most of it. Mentors who mainly present slides are running a course with a higher price tag.",
  },
  {
    q: "What happens when I disagree with your feedback?",
    why: "Good mentors want you to push back and can explain their reasoning from principles. If disagreement is treated as not listening, you will learn obedience, not judgment.",
  },
  {
    q: "What does support look like after the program ends?",
    why: "The job search often starts after the last session. Ask what happens when you land an interview three months later and need a portfolio review that week.",
  },
];

const RED_FLAGS = [
  "Their own portfolio is thin, private, or entirely made of course promo material",
  "Guarantees a job or a salary figure. No honest mentor can promise what a market will do",
  "One fixed curriculum for every mentee regardless of background",
  "Feedback is only async comments, never a live conversation about your reasoning",
  "Cannot name the AI tools in their daily workflow. In 2026 that is a real gap",
  "Pressure tactics: fake countdown timers, spots that are always almost gone",
];

const SHOULD_INCLUDE = [
  { icon: MessageSquare, text: "Live 1:1 sessions where your work is on screen, not a webinar seat" },
  { icon: Layers, text: "A structured arc from product thinking to shipped work, adapted to your level" },
  { icon: TrendingUp, text: "Career assets built alongside the craft: portfolio, resume, interview practice" },
  { icon: ShieldCheck, text: "A clear scope in writing: hours, deliverables, and what support survives graduation" },
];

export default function ProductDesignMentorPage() {
  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="container max-w-4xl mx-auto px-4 pt-16 pb-12 md:pt-24">
        <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-4">
          Finding a Mentor
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
          A product design mentor is the highest-leverage hire of your career.
          Vet them like one.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          The mentorship market is crowded with people whose main shipped product
          is their mentorship. The five questions below separate practitioners
          from content creators in a single discovery call.
        </p>
      </section>

      {/* Questions */}
      <section className="container max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">
          Five questions to ask before you pay anyone
        </h2>
        <div className="space-y-4">
          {QUESTIONS.map((item, i) => (
            <div key={item.q} className="rounded-2xl bg-white dark:bg-card shadow-sm p-6">
              <div className="flex items-start gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold mb-2">&ldquo;{item.q}&rdquo;</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.why}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Red flags */}
      <section className="bg-card/60">
        <div className="container max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Red flags that predict a bad engagement
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            Any one of these alone is a caution. Two or more and you should walk.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {RED_FLAGS.map((flag) => (
              <div key={flag} className="flex items-start gap-3 rounded-xl bg-white dark:bg-card shadow-sm px-5 py-4">
                <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed">{flag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What it should include */}
      <section className="container max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">
          What a serious mentorship includes
        </h2>
        <div className="grid sm:grid-cols-2 gap-5 mb-12">
          {SHOULD_INCLUDE.map((s) => (
            <div key={s.text} className="flex items-start gap-4 rounded-2xl bg-white dark:bg-card shadow-sm p-6">
              <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#065F46]/[0.07] dark:bg-[#34D399]/10 shrink-0">
                <s.icon className="w-5 h-5 text-[#065F46] dark:text-[#34D399]" />
              </span>
              <p className="text-sm leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>

        {/* About the CVEdge mentor: hold us to the same standard */}
        <div className="rounded-2xl bg-white dark:bg-card shadow-sm p-6 md:p-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
            Hold us to the same standard
          </p>
          <p className="text-sm md:text-base leading-relaxed mb-4">
            The CVEdge mentorship is led by B Sivarami Reddy, a designer-founder
            with 10+ years in AI product design who built and runs CVEdge itself,
            the product you are reading right now. His work and background are
            public, so you can apply every question on this page before booking
            a call.
          </p>
          <div className="flex flex-wrap gap-6 text-sm">
            <a
              href="https://linkedin.com/in/uxsiva"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-4"
            >
              LinkedIn
            </a>
            <a
              href="https://uxsiva.onrender.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-4"
            >
              Portfolio
            </a>
          </div>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          New to the field? Start with{" "}
          <Link href="/learn-product-design" className="font-medium text-primary underline underline-offset-4">
            how to learn product design
          </Link>{" "}
          or read{" "}
          <Link href="/ux-mentorship" className="font-medium text-primary underline underline-offset-4">
            what UX mentorship actually involves
          </Link>
          .
        </p>
      </section>

      {/* CTA */}
      <section className="container max-w-4xl mx-auto px-4 pb-20">
        <MentorshipCtaBanner
          title="Vet the mentor on a free discovery call"
          subtitle="Bring the five questions above. The AI Product Design Mentorship is 100 hours of live 1:1 sessions with lifetime portfolio reviews after you graduate."
          cta="See the Mentorship Program"
        />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/ai-product-design" className="inline-flex items-center gap-1 font-medium text-primary hover:underline underline-offset-4">
            View curriculum, perks and mentor profile
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </p>
      </section>
    </main>
  );
}
