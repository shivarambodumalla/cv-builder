import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/shared/structured-data";
import { ALL_ROLES } from "@/lib/jobs/role-categories";
import { getRoleContent, rolesWithContent } from "@/lib/roles/role-content";

export const revalidate = 3600;

const ROLE_MAP = new Map(ALL_ROLES.map((r) => [r.slug, r]));

export function generateStaticParams() {
  return ALL_ROLES.map((r) => ({ role: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ role: string }>;
}): Promise<Metadata> {
  const { role: slug } = await params;
  const role = ROLE_MAP.get(slug);
  if (!role) return {};

  const content = getRoleContent(slug);
  // The root layout applies `template: "%s | CVEdge"` — a hardcoded suffix here
  // renders it twice. Only openGraph.title needs the brand spelled out.
  const title = `${role.label} Interview Questions & How to Answer Them`;
  const description = content
    ? `${content.technicalQuestions.length + content.behaviouralQuestions.length} real ${role.label} interview questions, what each round is scored on, and how to structure your answers.`
    : `Prepare for ${role.label} interviews with structured STAR stories and job-matched practice.`;

  return {
    title,
    description,
    openGraph: {
      title: `${role.label} Interview Prep | CVEdge`,
      description,
      url: `https://www.thecvedge.com/interview-prep/${role.slug}`,
    },
    alternates: { canonical: `https://www.thecvedge.com/interview-prep/${role.slug}` },
    // Roles without hand-written content would render a templated page. Those
    // stay out of the index until real content exists for them.
    ...(content ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function RoleInterviewPrepPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role: slug } = await params;
  const role = ROLE_MAP.get(slug);
  if (!role) notFound();

  const content = getRoleContent(slug);
  const lower = role.label.toLowerCase();

  // Roles awaiting real content get a deliberately short page that points at the
  // product rather than padding out generic advice.
  if (!content) {
    return (
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[10px] tracking-widest text-muted-foreground uppercase">Interview Coach</p>
          <h1 className="text-3xl font-bold tracking-tight mt-2">{role.label} Interview Prep</h1>
          <p className="text-muted-foreground mt-3">
            We haven&apos;t published our {lower} interview guide yet. In the meantime, CVEdge&apos;s Interview Coach
            builds a STAR story bank from your own CV and matches it to any {lower} job description.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/login?returnUrl=%2Finterview-coach">Start prepping free</Link>
          </Button>
          <p className="mt-8 text-sm text-muted-foreground">
            <Link href="/interview-prep" className="underline underline-offset-4">
              Browse published interview guides
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const otherGuides = rolesWithContent()
    .filter((s) => s !== slug)
    .map((s) => ROLE_MAP.get(s))
    .filter((r): r is { label: string; slug: string } => Boolean(r))
    .slice(0, 8);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "Interview Coach", url: "https://www.thecvedge.com/interview-prep" },
          { name: role.label, url: `https://www.thecvedge.com/interview-prep/${role.slug}` },
        ]}
      />
      <FaqJsonLd items={content.faq} />

      <div className="container mx-auto px-4 py-16 md:py-20">
        {/* Hero */}
        <div className="mx-auto max-w-3xl mb-14">
          <p className="text-[10px] tracking-widest text-muted-foreground uppercase">Interview Coach</p>
          <h1 className="text-3xl font-bold tracking-tight mt-2">{role.label} Interview Questions</h1>
          <p className="text-muted-foreground mt-4 leading-relaxed">{content.intro}</p>
          <Button className="mt-6" asChild>
            <Link href="/login?returnUrl=%2Finterview-coach">Build your story bank free</Link>
          </Button>
        </div>

        {/* What the loop tests */}
        <section className="mx-auto max-w-3xl mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-6">What {lower} interviews are scored on</h2>
          <div className="space-y-4">
            {content.interviewFocus.map((f) => (
              <div key={f.area} className="rounded-xl border bg-card p-5">
                <p className="text-sm font-semibold">{f.area}</p>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{f.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Technical questions */}
        <section className="mx-auto max-w-3xl mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Technical {lower} interview questions
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Questions of this shape recur across {lower} loops. Practise them aloud — interviewers score how you
            reason, not only where you land.
          </p>
          <ul className="space-y-3">
            {content.technicalQuestions.map((q) => (
              <li key={q} className="rounded-lg border bg-card px-4 py-3 text-sm leading-relaxed">
                {q}
              </li>
            ))}
          </ul>
        </section>

        {/* Behavioural questions */}
        <section className="mx-auto max-w-3xl mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Behavioural questions for {lower} roles
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Prepare one STAR story per theme. A single strong story usually answers two or three of these prompts.
          </p>
          <ul className="space-y-3">
            {content.behaviouralQuestions.map((q) => (
              <li key={q} className="rounded-lg border bg-card px-4 py-3 text-sm leading-relaxed">
                {q}
              </li>
            ))}
          </ul>
        </section>

        {/* Metrics that make answers land */}
        <section className="mx-auto max-w-3xl mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Numbers that make {lower} answers credible</h2>
          <p className="text-sm text-muted-foreground mb-6">
            A STAR answer without a result is a story. These are the measures that carry weight in this role.
          </p>
          <div className="flex flex-wrap gap-2">
            {content.metrics.map((m) => (
              <span key={m} className="rounded-full border bg-card px-3 py-1.5 text-xs">
                {m}
              </span>
            ))}
          </div>
        </section>

        {/* Questions to ask */}
        <section className="mx-auto max-w-3xl mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Questions worth asking your interviewer</h2>
          <ul className="space-y-3">
            {content.questionsToAsk.map((q) => (
              <li key={q} className="rounded-lg border bg-card px-4 py-3 text-sm leading-relaxed">
                {q}
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ — visible mirror of the JSON-LD */}
        <section className="mx-auto max-w-3xl mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-6">{role.label} interview FAQs</h2>
          <div className="space-y-4">
            {content.faq.map((f) => (
              <details key={f.question} className="rounded-xl border bg-card p-5 group">
                <summary className="cursor-pointer list-none font-semibold text-sm flex items-start justify-between gap-3">
                  <span>{f.question}</span>
                  <span className="text-muted-foreground shrink-0 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Cross-link to resume examples */}
        <section className="mx-auto max-w-3xl mb-14">
          <div className="rounded-xl border bg-[rgba(6,95,70,0.05)] border-[rgba(6,95,70,0.10)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Need the CV before the interview?</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                See {lower} CV examples, before/after bullets, and the metrics reviewers look for.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/resume-examples/${role.slug}`}>{role.label} CV examples</Link>
            </Button>
          </div>
        </section>

        {/* Other published guides — internal linking between real pages only */}
        {otherGuides.length > 0 && (
          <section className="mx-auto max-w-3xl mb-14">
            <h2 className="text-sm font-semibold mb-3">Other interview guides</h2>
            <div className="flex flex-wrap gap-2">
              {otherGuides.map((r) => (
                <Link
                  key={r.slug}
                  href={`/interview-prep/${r.slug}`}
                  className="rounded-full border bg-card px-3 py-1.5 text-xs hover:bg-accent transition-colors"
                >
                  {r.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold tracking-tight">Turn your experience into answers</h2>
          <p className="mt-3 text-muted-foreground">
            CVEdge reads your CV, drafts STAR stories from what you actually did, and matches them to the {lower} job
            you&apos;re interviewing for.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/login?returnUrl=%2Finterview-coach">Start building free</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
