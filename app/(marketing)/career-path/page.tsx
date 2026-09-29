import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveTypeBadge, SkillChips } from "@/components/career-path/path-meta";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/shared/structured-data";
import type { MoveType } from "@/lib/career-path/types";
import { ROLE_CATEGORIES } from "@/lib/jobs/role-categories";
import { getCareerPath } from "@/lib/roles/career-moves";
import { careerPathPageSlugs, roleLabel } from "@/lib/roles/career-moves/pages";
import { CareerPathToolFromQuery } from "./tool-from-query";

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

const WEB_APP_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CVEdge Career Path Generator",
  url: PAGE_URL,
  description: DESCRIPTION,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

// A real run from late September 2026, shown as an example of the output.
const EXAMPLE: { title: string; moveType: MoveType; fit: number; jobs: string; pay: string }[] = [
  { title: "Senior QA Engineer", moveType: "step_up", fit: 85, jobs: "195", pay: "$118K-$161K" },
  { title: "QA Automation Engineer", moveType: "lateral", fit: 75, jobs: "373", pay: "$93K-$114K" },
  { title: "QA Lead", moveType: "step_up", fit: 70, jobs: "272", pay: "$103K-$131K" },
];
const EXAMPLE_SKILLS = ["Test Case Design", "Defect Management", "Automated Testing", "Regression Testing"];

const STEPS = [
  {
    title: "We read what you gave us.",
    body: "That's your job title, or your resume if you added one. From a resume we pick up past titles, tools and time in each job. Your years and priorities narrow the field.",
  },
  {
    title: "An AI model suggests 3 to 5 moves.",
    body: "Usually one step up in your own track, one sideways move into a nearby role, and one bigger change. It also estimates fit: how much of the new job your experience already covers. These are AI suggestions, so treat them as a shortlist to check.",
  },
  {
    title: "We count real job ads for each role.",
    body: "For every role we search live job listings in your country by title. We count the open ones and read the pay employers advertise. If fewer than 5 ads list a salary, we leave pay out rather than guess.",
  },
];

const ACCESS_ROWS: { item: string; free: string; signedIn: string }[] = [
  { item: "3 to 5 roles that fit you, and why", free: "Yes", signedIn: "Yes" },
  { item: "A fit estimate for each role", free: "Yes", signedIn: "Yes" },
  { item: "Open jobs and advertised pay", free: "Yes", signedIn: "Yes" },
  { item: "Skills you already have", free: "Yes", signedIn: "Yes" },
  { item: "Skills you still need", free: "How many", signedIn: "Named, in the order to learn them" },
  { item: "A 90-day plan in three phases", free: "No", signedIn: "Yes, with a checklist" },
  { item: "A project that proves you can do the job", free: "No", signedIn: "Yes" },
  { item: "Job titles to search", free: "No", signedIn: "Yes, linked to live listings" },
];

const FAQ = [
  {
    question: "How does the career path generator pick my next roles?",
    answer:
      "It starts from your job title, or your resume if you add one. Your years of experience and priorities narrow it down. An AI model then suggests 3 to 5 moves. Usually that's one step up, one sideways move into a nearby role and one bigger career change, ranked by fit.",
  },
  {
    question: "What does the fit percentage mean?",
    answer:
      "It's an estimate of how much of the new job your experience already covers. A 75% fit means most of the groundwork is there, with a few specific gaps. It isn't your chance of getting hired. That depends on the employer, your resume and your interviews.",
  },
  {
    question: "Where do the job counts and salaries come from?",
    answer:
      "From live job ads on large job boards in your country. We check them when you search and refresh them daily. The pay is what employers advertise in those ads, not what people in the role report earning. We only show pay when at least 5 ads for the role list a salary.",
  },
  {
    question: "Is it free? Do I need an account?",
    answer:
      "You can see your roles, fit scores and job numbers without an account. The full plan for a role needs a free Google sign-in. That plan names the skills to learn, lays out 90 days, suggests a proof project and lists job titles to search. We never ask for a card.",
  },
  {
    question: "What happens to my resume if I upload it?",
    answer:
      "We read it to find your past titles, skills and years in each job, so the roles match your background. If you then sign in, the resume is added to your account. You can edit or delete it there at any time. Our privacy policy has the details.",
  },
  {
    question: "How far should I trust AI career suggestions?",
    answer:
      "Use them as a shortlist, not a decision. Before you commit to a move, read ten real job ads for the role. Talk to two or three people who do the job. Then ask yourself if you'd enjoy the day-to-day work. The plan is built to make those checks quick.",
  },
];

function roleGuideGroups() {
  const published = new Set(careerPathPageSlugs());
  return ROLE_CATEGORIES.map((category) => ({
    name: category.name,
    roles: category.roles
      .filter((r) => published.has(r.slug))
      .map((r) => ({
        slug: r.slug,
        label: roleLabel(r.slug) ?? r.label,
        leadsTo: (getCareerPath(r.slug)?.moves ?? []).slice(0, 2).map((m) => m.toRole),
      })),
  })).filter((g) => g.roles.length > 0);
}

const monoLabel = "font-mono text-[11px] uppercase tracking-wider text-muted-foreground";

export default function CareerPathPage() {
  const groups = roleGuideGroups();
  const guideCount = groups.reduce((n, g) => n + g.roles.length, 0);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "Career Path Generator", url: PAGE_URL },
        ]}
      />
      <FaqJsonLd items={FAQ} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEB_APP_JSON_LD) }} />

      <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
        {/* Hero: headline + tool on the left, a real example on the right */}
        <section className="grid grid-cols-1 gap-x-14 pb-16 pt-10 md:pt-14 lg:grid-cols-12" aria-labelledby="cp-title">
          <div className="min-w-0 lg:col-span-7">
            <p className={monoLabel}>Career path generator · Free</p>
            <h1 id="cp-title" className="mt-3 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
              Where your job leads, and what it pays
            </h1>
            <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-muted-foreground">
              Enter your job title or add your resume. You&apos;ll get 3 to 5 roles you could move into. Each one shows
              how close you already are and what employers pay for it right now.
            </p>
            <div id="tool" className="mt-8 scroll-mt-24">
              <CareerPathToolFromQuery />
            </div>
          </div>

          <aside className="hidden lg:col-span-5 lg:block" aria-labelledby="cp-example-title">
            <figure className="mt-9 border-t-2 border-foreground pt-4">
              <figcaption>
                <p className={monoLabel}>Example result</p>
                <p id="cp-example-title" className="mt-1.5 text-lg font-semibold tracking-tight">
                  QA engineer, 5 years, wants higher pay
                </p>
              </figcaption>
              <table className="mt-5 w-full border-collapse text-left text-sm">
                <caption className="sr-only">Three roles suggested for a QA engineer with 5 years of experience</caption>
                <thead>
                  <tr className="border-b">
                    <th scope="col" className={`${monoLabel} pb-2 font-normal`}>
                      Role
                    </th>
                    <th scope="col" className={`${monoLabel} pb-2 pr-3 text-right font-normal`}>
                      Fit
                    </th>
                    <th scope="col" className={`${monoLabel} whitespace-nowrap pb-2 text-right font-normal`}>
                      Open jobs
                    </th>
                    <th scope="col" className={`${monoLabel} pb-2 pl-4 text-right font-normal`}>
                      Pay
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {EXAMPLE.map((r) => (
                    <tr key={r.title} className="border-b align-top">
                      <th scope="row" className="py-3.5 pr-3 font-normal">
                        <span className="block font-semibold">{r.title}</span>
                        <MoveTypeBadge moveType={r.moveType} className="mt-1 text-xs text-muted-foreground" />
                      </th>
                      <td className="py-3.5 pr-3 text-right font-mono tabular-nums">{r.fit}%</td>
                      <td className="py-3.5 text-right font-mono tabular-nums">{r.jobs}</td>
                      <td className="whitespace-nowrap py-3.5 pl-4 text-right font-mono tabular-nums">{r.pay}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-5 text-sm font-medium">Skills that carry over to Senior QA Engineer</p>
              <div className="mt-2">
                <SkillChips skills={EXAMPLE_SKILLS} label="Skills that carry over to Senior QA Engineer" />
              </div>
              <p className={`${monoLabel} mt-6 leading-relaxed`}>
                US job ads, late Sep 2026. Pay is the advertised range.
              </p>
            </figure>
          </aside>
        </section>

        <Section id="cp-how" title="What happens in those 20 seconds">
          <ol className="space-y-7">
            {STEPS.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[2rem_1fr] gap-x-3">
                <span className="font-mono text-sm text-muted-foreground" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="max-w-[65ch] text-base leading-relaxed">
                  <strong className="font-semibold">{s.title}</strong> <span className="text-muted-foreground">{s.body}</span>
                </p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="cp-access" title="You see your roles before we ask for anything">
          <p className="max-w-[65ch] text-base leading-relaxed text-muted-foreground">
            Roles, fit scores and job numbers are free, with no account. The plan for each role needs a free Google
            sign-in, so it&apos;s saved for when you come back. We never ask for a card.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13px] sm:text-sm">
              <caption className="sr-only">What&apos;s free without an account, and what a free sign-in adds</caption>
              <thead>
                <tr className="border-b-2 border-foreground">
                  <th scope="col" className={`${monoLabel} py-2 pr-4 font-normal`}>
                    What you get
                  </th>
                  <th scope="col" className={`${monoLabel} py-2 pr-4 font-normal`}>
                    No account
                  </th>
                  <th scope="col" className={`${monoLabel} py-2 font-normal`}>
                    Free Google sign-in
                  </th>
                </tr>
              </thead>
              <tbody>
                {ACCESS_ROWS.map((r) => (
                  <tr key={r.item} className="border-b">
                    <th scope="row" className="py-3 pr-4 font-medium">
                      {r.item}
                    </th>
                    <td className={`py-3 pr-4 ${r.free === "No" ? "text-muted-foreground" : ""}`}>{r.free}</td>
                    <td className="py-3">{r.signedIn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 max-w-[65ch] text-sm leading-relaxed text-muted-foreground">
            If you added a resume, signing in saves it to your account. You can edit or delete it there.
          </p>
        </Section>

        {groups.length > 0 && (
          <Section id="cp-roles" title={`Where ${guideCount} common jobs usually lead`}>
            <p className="max-w-[65ch] text-base leading-relaxed text-muted-foreground">
              We wrote a guide for each of these roles. It covers the usual next moves, when people make them, and what
              to have on your resume first.
            </p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">Career path guides by field</caption>
                <thead>
                  <tr className="border-b-2 border-foreground">
                    <th scope="col" className={`${monoLabel} w-[44%] py-2 pr-4 font-normal`}>
                      Role
                    </th>
                    <th scope="col" className={`${monoLabel} py-2 font-normal`}>
                      Usually leads to
                    </th>
                  </tr>
                </thead>
                {groups.map((g) => (
                  <tbody key={g.name}>
                    <tr>
                      <th scope="colgroup" colSpan={2} className={`${monoLabel} pb-1 pt-6 font-normal text-foreground`}>
                        {g.name}
                      </th>
                    </tr>
                    {g.roles.map((r) => (
                      <tr key={r.slug} className="border-b">
                        <th scope="row" className="py-0 pr-4 font-normal">
                          <Link
                            href={`/career-path/${r.slug}`}
                            className="flex min-h-11 items-center font-medium text-primary underline-offset-4 transition-colors duration-150 hover:underline sm:min-h-9"
                          >
                            {r.label}
                            <span className="sr-only"> career path</span>
                          </Link>
                        </th>
                        <td className="py-2 text-muted-foreground">{r.leadsTo.join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                ))}
              </table>
            </div>
          </Section>
        )}

        <Section id="cp-faq" title="What to know before you trust it">
          <div className="space-y-8">
            {FAQ.map((f) => (
              <div key={f.question}>
                <h3 className="text-base font-semibold">{f.question}</h3>
                <p className="mt-2 max-w-[65ch] text-base leading-relaxed text-muted-foreground">{f.answer}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            More on how we handle your data in our{" "}
            <Link href="/privacy" className="text-primary underline underline-offset-4">
              privacy policy
            </Link>
            .
          </p>
        </Section>

        <div className="flex flex-col gap-4 border-t py-12 sm:flex-row sm:items-center sm:justify-between lg:py-14">
          <p className="text-lg font-medium tracking-tight">
            All it needs is your job title. It takes about 20 seconds.
          </p>
          <Button asChild size="lg" className="h-11 self-start sm:self-auto">
            <a href="#tool">Enter my job title</a>
          </Button>
        </div>
      </div>
    </>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-1 gap-x-14 gap-y-6 border-t py-12 lg:grid-cols-12 lg:py-16" aria-labelledby={id}>
      <h2 id={id} className="text-2xl font-bold leading-tight tracking-tight lg:col-span-4">
        {title}
      </h2>
      <div className="min-w-0 lg:col-span-8">{children}</div>
    </section>
  );
}
