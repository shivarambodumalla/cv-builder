import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BreadcrumbJsonLd } from "@/components/shared/structured-data";
import { AUTHOR, AUTHOR_JSON_LD } from "@/lib/blog/author";

export const metadata: Metadata = {
  title: "About CVEdge — Who We Are and What We Build",
  description:
    "CVEdge builds ATS analysis, AI resume rewriting and interview preparation tools for job seekers. What we make, how it works, and the principles behind it.",
  alternates: { canonical: "https://www.thecvedge.com/about" },
  openGraph: {
    title: "About CVEdge",
    description:
      "CVEdge builds ATS analysis, AI resume rewriting and interview preparation tools for job seekers.",
    url: "https://www.thecvedge.com/about",
  },
};

const WHAT_WE_BUILD = [
  {
    title: "ATS analysis",
    body: "We parse your CV the way an applicant tracking system does, then score it across six categories — contact details, sections, keywords, measurable results, bullet quality and formatting. The output is not a number on its own; it is the specific list of what is costing you points and why.",
    href: "/upload-resume",
    linkLabel: "Check your CV free",
  },
  {
    title: "AI rewriting that will not invent",
    body: "Our rewriter restructures the bullets you already wrote into result-led ones. Where a metric is missing it inserts an [X] placeholder for you to fill rather than fabricating a figure, because a number you cannot defend is worse in an interview than no number at all.",
    href: "/upload-resume",
    linkLabel: "Try the rewriter",
  },
  {
    title: "Job matching",
    body: "Paste a job description and we identify which keywords are missing, which are already covered, and which would move your match score most — so tailoring is driven by evidence rather than guesswork.",
    href: "/jobs",
    linkLabel: "Browse jobs",
  },
  {
    title: "Interview preparation",
    body: "We turn your experience into STAR-structured answers and match them to the role you are interviewing for, so you walk in with prepared stories rather than improvising under pressure.",
    href: "/interview-prep",
    linkLabel: "Interview guides",
  },
  {
    title: "Templates that actually parse",
    body: "Every template is built to survive parsing: single-column flows, standard headings, contact details in the body rather than a document header, and real text rather than images. A beautiful CV that a parser cannot read has failed at the only job that matters first.",
    href: "/resume-templates",
    linkLabel: "See templates",
  },
];

const PRINCIPLES = [
  {
    title: "We do not fabricate your experience",
    body: "Plenty of tools will generate achievements from a job title. Those achievements are fiction, and they become the worst possible interview topic — interviewers probe numbers precisely because they are checkable. Everything our AI produces is a restructuring of something you told us.",
  },
  {
    title: "A score is a floor, not a target",
    body: "An ATS score measures whether your CV is machine-readable and relevant to a role. It cannot measure whether your experience is compelling. A 95% score on vague, unmeasured bullets still loses to a 78% CV that clearly shows someone shipped valuable work. We say so in the product, even though a higher number would be easier to sell.",
  },
  {
    title: "Free should be genuinely useful",
    body: "You can check your ATS score, see the full category breakdown and the specific issues found without an account or a card. The free plan includes real usage of the AI features every week. We would rather you find the tool useful and upgrade than hit a wall on the first click.",
  },
  {
    title: "Your CV is yours",
    body: "We process your CV to produce the analysis, and store it only so you can come back and edit it. You can delete it at any time. We do not sell your data. The full detail is in our privacy policy.",
  },
];

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: "https://www.thecvedge.com/about",
    mainEntity: {
      "@type": "Organization",
      name: "CVEdge",
      url: "https://www.thecvedge.com",
      logo: "https://www.thecvedge.com/img/CV-Edge-Logo-square.svg",
      email: "hello@thecvedge.com",
      founder: { ...AUTHOR_JSON_LD, description: AUTHOR.bio },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "About", url: "https://www.thecvedge.com/about" },
        ]}
      />

      <div className="container mx-auto max-w-3xl px-4 py-16 md:py-20">
        {/* Intro */}
        <p className="text-[10px] tracking-widest text-muted-foreground uppercase">About</p>
        <h1 className="text-3xl font-bold tracking-tight mt-2 mb-5">About CVEdge</h1>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            CVEdge is a resume and interview toolkit for people applying for jobs. We build the things that sit
            between writing a CV and getting an interview: applicant tracking system analysis, AI rewriting that works
            from what you actually did, job-description matching, and structured interview preparation.
          </p>
          <p>
            The problem we started from is a specific one. Most applications are rejected before a person reads them,
            and candidates almost never find out why. A CV can be well written and still fail because its contact
            details sit in a document header the parser never reads, or because it describes the same experience in
            different vocabulary than the posting uses. Those failures are invisible from the applicant&apos;s side and
            entirely fixable once you can see them.
          </p>
          <p>
            So the product is built around showing you what the machine sees, then helping you fix it without
            pretending to be something you are not.
          </p>
        </div>

        {/* What we build */}
        <h2 className="text-2xl font-bold tracking-tight mt-14 mb-6">What we build</h2>
        <div className="space-y-4">
          {WHAT_WE_BUILD.map((w) => (
            <div key={w.title} className="rounded-xl border bg-card p-5">
              <p className="text-sm font-semibold">{w.title}</p>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{w.body}</p>
              <Link
                href={w.href}
                className="text-sm text-primary underline underline-offset-4 mt-2.5 inline-block"
              >
                {w.linkLabel}
              </Link>
            </div>
          ))}
        </div>

        {/* Principles */}
        <h2 className="text-2xl font-bold tracking-tight mt-14 mb-2">How we think about it</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          A few positions we have taken that shape what the product does and does not do.
        </p>
        <div className="space-y-4">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="rounded-xl border bg-card p-5">
              <p className="text-sm font-semibold">{p.title}</p>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>

        {/* Who writes this */}
        <h2 className="text-2xl font-bold tracking-tight mt-14 mb-3">Who writes this</h2>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm font-semibold">{AUTHOR.name}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{AUTHOR.role}</p>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{AUTHOR.bio}</p>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Everything published on this site carries that byline. Where an article states a figure from outside
            research it says where the figure comes from, and where the honest answer is &ldquo;nobody actually knows,
            and the widely quoted number is vendor marketing&rdquo; it says that instead of repeating it.
          </p>
        </div>

        {/* Writing */}
        <h2 className="text-2xl font-bold tracking-tight mt-14 mb-3">What we publish</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Alongside the product we write guides on how applicant tracking systems actually work, what recruiters do
          in the first pass over a CV, and what a strong resume looks like for specific roles. It is written to be
          useful whether or not you use the tool — including the parts where the honest answer is that a tool will
          not help you.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/blog" className="rounded-full border bg-card px-3 py-1.5 text-xs hover:bg-accent transition-colors">
            Blog
          </Link>
          <Link href="/resume-examples/software-engineer" className="rounded-full border bg-card px-3 py-1.5 text-xs hover:bg-accent transition-colors">
            CV examples by role
          </Link>
          <Link href="/interview-prep" className="rounded-full border bg-card px-3 py-1.5 text-xs hover:bg-accent transition-colors">
            Interview guides
          </Link>
          <Link href="/resume-templates" className="rounded-full border bg-card px-3 py-1.5 text-xs hover:bg-accent transition-colors">
            Templates
          </Link>
        </div>

        {/* Contact */}
        <h2 className="text-2xl font-bold tracking-tight mt-14 mb-3">Get in touch</h2>
        <p className="text-muted-foreground leading-relaxed">
          Questions, problems, or feedback on the product go to{" "}
          <a href="mailto:hello@thecvedge.com" className="text-primary underline underline-offset-4">
            hello@thecvedge.com
          </a>
          . More detail on the{" "}
          <Link href="/contact" className="text-primary underline underline-offset-4">
            contact page
          </Link>
          .
        </p>

        <div className="mt-12 rounded-xl border bg-[rgba(6,95,70,0.05)] border-[rgba(6,95,70,0.10)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">See where your CV stands</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Free ATS score and the specific issues found. No account needed.
            </p>
          </div>
          <Button asChild className="shrink-0">
            <Link href="/upload-resume">Check my CV free</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
