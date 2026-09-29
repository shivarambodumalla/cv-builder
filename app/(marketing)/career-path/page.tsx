import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Compass, Lock, Search, Sparkles, UserRound } from "lucide-react";
import { CareerPathTool } from "@/components/career-path/career-path-tool";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/shared/structured-data";
import { careerPathPageSlugs, roleLabel } from "@/lib/roles/career-moves/pages";

const PAGE_URL = "https://www.thecvedge.com/career-path";
const TITLE = "Free AI Career Path Generator: Find Your Next Role";
const DESCRIPTION =
  "Enter your job title or upload your resume to see 3-5 next roles with fit scores, live open-job counts and advertised salaries. Free.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `${TITLE} | CVEdge`,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | CVEdge`,
    description: DESCRIPTION,
  },
};

const STEPS = [
  {
    icon: UserRound,
    title: "Tell us where you are",
    body: "Type your current job title, or upload your resume so the suggestions reflect your actual experience. Add years of experience and what matters to you if you like.",
  },
  {
    icon: Compass,
    title: "See 3-5 roles that fit",
    body: "A mix of step ups, sideways moves and career changes, ranked by fit, with the skills you already have that carry over.",
  },
  {
    icon: ClipboardList,
    title: "Get the plan for one",
    body: "Sign in to see the skills to build in priority order, a 90-day plan in three phases, a proof project and the job titles to search.",
  },
];

const FREE_ITEMS = [
  "3-5 next roles, each with a fit percentage and why it suits you",
  "The skills you already have that carry over",
  "Open jobs and advertised salary ranges from live listings",
  "How many new skills each move needs",
];

const SIGNED_IN_ITEMS = [
  "The named skills to build, in the order to learn them",
  "A 90-day plan in three 30-day phases",
  "A proof project that shows you can do the new role",
  "The job titles to search, linked to live listings",
];

const FAQ = [
  {
    question: "How does the career path generator pick my next roles?",
    answer:
      "It looks at your current role, or your resume if you upload one, plus your years of experience and the preferences you choose. From that it suggests 3 to 5 moves: usually at least one step up, one sideways move into a related role, and one career change that reuses your strongest skills. Roles are ranked by fit.",
  },
  {
    question: "What does the fit percentage mean?",
    answer:
      "It is an estimate of how much of what the new role asks for your current experience already covers. A 75% fit means most of the groundwork is there and a few specific skills are missing. It is not the chance of getting hired, which depends on the employer, your resume and the interview.",
  },
  {
    question: "Where do the job counts and salaries come from?",
    answer:
      "From live job listings on major job boards in your country, fetched when you run a search and refreshed daily. Salaries are the ranges employers advertise in those listings, not what people in the role report earning. We only show a salary range when at least 5 listings for the role include one.",
  },
  {
    question: "Is it free? Do I need an account?",
    answer:
      "You can see your roles, fit scores and market numbers without an account. The full plan for a role (the named skills, the 90-day plan, the proof project and the job titles to search) needs a free Google sign-in. No card is asked for.",
  },
  {
    question: "What happens to my resume if I upload it?",
    answer:
      "We read it to understand your roles, skills and experience so the suggestions fit you rather than a generic job title. If you then sign in, the resume is added to your account, where you can edit or delete it at any time. Our privacy policy has the full detail.",
  },
  {
    question: "How far should I trust AI career suggestions?",
    answer:
      "Treat them as a well-researched starting point, not a decision. Before you commit to a move, read ten real job postings for the role, talk to two or three people who do it, and check that the day-to-day work is something you want. The plan is built to make those checks quick.",
  },
];

export default async function CareerPathPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawRole = Array.isArray(params.role) ? params.role[0] : params.role;
  const initialRole = rawRole?.trim().slice(0, 80) || undefined;
  // Every published page has an ALL_ROLES label, so roleLabel() is never null here.
  const roleLinks = careerPathPageSlugs()
    .map((slug) => ({ slug, label: roleLabel(slug) ?? slug }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "Career Path Generator", url: PAGE_URL },
        ]}
      />
      <FaqJsonLd items={FAQ} />

      {/* Hero + tool */}
      <section className="container mx-auto max-w-3xl px-4 pt-12 pb-16 md:pt-16">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Career Path Generator</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Find your next role</h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">
            Enter your current role and see where it can take you, with live job counts and advertised salaries for
            each move.
          </p>
        </div>
        <CareerPathTool initialRole={initialRole} />
      </section>

      <div className="container mx-auto max-w-3xl px-4 pb-20">
        {/* How it works */}
        <section className="mb-14" aria-labelledby="cp-how">
          <h2 id="cp-how" className="mb-6 text-2xl font-bold tracking-tight">
            How it works
          </h2>
          <ol className="grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-xl border bg-card p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <s.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">Step {i + 1}</span>
                </div>
                <h3 className="text-sm font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* What you get */}
        <section className="mb-14" aria-labelledby="cp-get">
          <h2 id="cp-get" className="mb-2 text-2xl font-bold tracking-tight">
            What you get
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Sign-in is free with Google and never asks for a card. It is only there so your plan is saved and you can
            come back to it.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border bg-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                <h3 className="text-sm font-semibold">Right away, no account</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {FREE_ITEMS.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" aria-hidden="true" />
                <h3 className="text-sm font-semibold">After a free sign-in</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {SIGNED_IN_ITEMS.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Where the numbers come from */}
        <section className="mb-14" aria-labelledby="cp-data">
          <h2 id="cp-data" className="mb-4 text-2xl font-bold tracking-tight">
            Where the numbers come from
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-4 rounded-xl border bg-card p-4">
              <Search className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">Job counts and salaries</span> come from live listings
                on major job boards in your country, refreshed daily. Salaries are the ranges employers advertise, and
                we leave them out when too few listings include one.
              </p>
            </div>
            <div className="flex items-start gap-4 rounded-xl border bg-card p-4">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">Role suggestions, fit scores and plans</span> are
                generated by AI from what you share. They are a starting point to check against real postings, people
                in the role and your own judgment.
              </p>
            </div>
          </div>
        </section>

        {/* Role pages */}
        {roleLinks.length > 0 && (
          <section className="mb-14" aria-labelledby="cp-roles">
            <h2 id="cp-roles" className="mb-2 text-2xl font-bold tracking-tight">
              Career paths by role
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Where each role usually leads next, when people make the move, and what to have on your resume first.
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {roleLinks.map(({ slug, label }) => (
                <li key={slug}>
                  <Link
                    href={`/career-path/${slug}`}
                    className="flex min-h-11 items-center rounded-lg border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    {label} career path
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* FAQ */}
        <section aria-labelledby="cp-faq">
          <h2 id="cp-faq" className="mb-6 text-2xl font-bold tracking-tight">
            Questions about the career path generator
          </h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details key={f.question} className="group rounded-xl border bg-card p-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-sm font-semibold">
                  <span>{f.question}</span>
                  <span
                    className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
