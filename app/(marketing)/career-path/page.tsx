import type { Metadata } from "next";
import Link from "next/link";
import { Minus, Plus, Search, Sparkle } from "lucide-react";
import { CareerPathPlanCta } from "@/components/career-path/career-path-tool";
import { CP_BUTTON, FitBar, FitNumber, MoveTypeEyebrow, SkillChips } from "@/components/career-path/path-meta";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/shared/structured-data";
import { careerPathPageSlugs, roleLabel } from "@/lib/roles/career-moves/pages";
import { cn } from "@/lib/utils";
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

// A real run from September 30, 2026 (data analyst, 4 years, wants to go deeper), shown as an example.
const EXAMPLE = {
  title: "Data Scientist",
  moveType: "lateral" as const,
  fit: 70,
  jobs: "6,224",
  pay: "$125K-$131K",
  skills: ["Data cleaning", "Exploratory data analysis", "Data visualization", "Business understanding"],
};

const PLAN_ITEMS = [
  {
    title: "The skills to build",
    body: "The skills you still need for the role, in the order to learn them.",
  },
  {
    title: "A three-phase timeline",
    body: "90 days in three phases, so you know what to do this month, with a checklist to tick off.",
  },
  {
    title: "A proof project",
    body: "One project idea that shows you can do the new role. Build it and add it to your resume.",
  },
  {
    title: "Job titles to search",
    body: "Other titles employers use for the role, linked to live listings. Your plan stays saved.",
  },
];

const TRUST_NOTES = [
  {
    icon: Search,
    title: "Job counts and pay come from live listings",
    body: "Large job boards in your country, checked when you search and refreshed daily. Pay is the range employers advertise, shown only when at least 5 ads list a salary.",
  },
  {
    icon: Sparkle,
    title: "Role suggestions and fit scores are AI-generated",
    body: "Built from what you share. Treat them as a starting point to check against real postings, people in the role, and your own judgment.",
  },
];

// Same container as the site header, so the page lines up with the logo.
const CONTAINER = "container mx-auto px-4";
const SECTION_H2 = "font-cp-display text-[30px] font-normal leading-[1.1] sm:text-4xl";

function roleGuides() {
  return careerPathPageSlugs()
    .map((slug) => ({ slug, label: roleLabel(slug) ?? slug }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** The hero's example card: a real result, with two tilted cards behind it. */
function ExampleCard() {
  return (
    <figure className="relative flex h-[560px] flex-col items-center justify-center">
      <div
        className="absolute h-[300px] w-[400px] -translate-x-10 translate-y-10 -rotate-[4deg] rounded-[20px] border border-[#E0D8CC] bg-white opacity-70"
        aria-hidden="true"
      />
      <div
        className="absolute h-[300px] w-[400px] translate-x-9 translate-y-6 rotate-[3deg] rounded-[20px] border border-[#E0D8CC] bg-white opacity-[0.85]"
        aria-hidden="true"
      />
      <div className="relative flex w-[440px] flex-col gap-[18px] rounded-[20px] border border-[#E0D8CC] bg-white p-7 shadow-[0_24px_48px_-24px_rgba(12,26,14,0.25)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <MoveTypeEyebrow moveType={EXAMPLE.moveType} />
            <p className="text-2xl font-semibold leading-[1.2] tracking-[-0.01em]">{EXAMPLE.title}</p>
          </div>
          <FitNumber fit={EXAMPLE.fit} />
        </div>
        <FitBar fit={EXAMPLE.fit} />
        <SkillChips skills={EXAMPLE.skills} label={`Skills that carry over to ${EXAMPLE.title}`} />
        <dl className="grid grid-cols-2 gap-3 border-t border-[#EDE8DF] pt-4">
          <div className="flex flex-col-reverse gap-0.5">
            <dt className="text-xs text-[#5F5852]">open jobs, US</dt>
            <dd className="text-xl font-semibold tabular-nums">{EXAMPLE.jobs}</dd>
          </div>
          <div className="flex flex-col-reverse gap-0.5">
            <dt className="text-xs text-[#5F5852]">advertised pay</dt>
            <dd className="text-xl font-semibold tabular-nums">{EXAMPLE.pay}</dd>
          </div>
        </dl>
        <a href="#cp-plan" className={CP_BUTTON.dark}>
          See the 90-day plan
        </a>
      </div>
      <figcaption className="absolute bottom-2 text-center text-xs leading-relaxed text-[#78716C]">
        Example result for a data analyst, 4 years, who wants to go deeper.
        <br />
        US job ads, Sep 30, 2026. Pay is the advertised range.
      </figcaption>
    </figure>
  );
}

export default function CareerPathPage() {
  const guides = roleGuides();

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

      {/* Hero, replaced by the results once a search finishes */}
      <div id="tool" className={cn(CONTAINER, "scroll-mt-24 pb-14 pt-8 sm:pt-12 lg:pb-16 lg:pt-20")}>
        <CareerPathToolFromQuery aside={<ExampleCard />} />
      </div>

      {/* What the free sign-in adds */}
      <div className={CONTAINER}>
        <section
          id="cp-plan"
          aria-labelledby="cp-plan-title"
          className="grid scroll-mt-24 gap-8 rounded-[20px] bg-[#065F46] px-[22px] py-7 text-[#F7F5F0] sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:rounded-[28px] lg:p-16"
        >
          <div className="flex flex-col gap-3.5 lg:gap-5">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FD3B5] sm:text-xs">
              The 90-day plan
            </span>
            <h2 id="cp-plan-title" className="font-cp-display text-[28px] font-normal leading-[1.1] sm:text-[44px] sm:leading-[1.08]">
              <span className="sm:hidden">The roles are free. The plan is a sign-in away.</span>
              <span className="hidden sm:inline">The roles are free. The plan to get one is a Google sign-in away.</span>
            </h2>
            <p className="max-w-[480px] text-sm leading-[1.55] text-[#CFE5D9] sm:text-base">
              <span className="sm:hidden">
                The skills to build, a three-phase timeline, a proof project and the job titles to search.
              </span>
              <span className="hidden sm:inline">
                Your roles, fit scores and job numbers stay free with no account. Sign in with Google and each role
                gets a 90-day plan, written by AI from what you shared and saved to your account.
              </span>
            </p>
            <CareerPathPlanCta className="mt-1.5 w-full sm:mt-2 sm:w-auto sm:self-start" />
          </div>
          <ol className="hidden gap-4 sm:grid sm:grid-cols-2">
            {PLAN_ITEMS.map((item, i) => (
              <li
                key={item.title}
                className="flex flex-col gap-2.5 rounded-2xl border border-[rgba(247,245,240,0.16)] bg-[rgba(247,245,240,0.08)] p-[22px]"
              >
                <span className="font-cp-display text-[26px] leading-none text-[#8FD3B5]" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[15px] font-semibold">{item.title}</span>
                <span className="text-[13px] leading-normal text-[#CFE5D9]">{item.body}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* Where the numbers come from */}
      <div className={cn(CONTAINER, "grid gap-4 py-12 md:grid-cols-2 md:gap-6 lg:py-16")}>
        {TRUST_NOTES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex items-start gap-[18px] rounded-2xl border border-[#E0D8CC] bg-white p-5 sm:p-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#E6F2EC]" aria-hidden="true">
              <Icon className="h-5 w-5 text-[#065F46]" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold">{title}</p>
              <p className="text-sm leading-normal text-[#5F5852]">{body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Role guides */}
      {guides.length > 0 && (
        <section aria-labelledby="cp-roles" className={cn(CONTAINER, "flex flex-col gap-6 pb-12 lg:pb-16")}>
          <div className="flex flex-col gap-1.5">
            <h2 id="cp-roles" className={SECTION_H2}>
              Browse career paths by role
            </h2>
            <p className="text-[15px] text-[#5F5852]">
              {guides.length} guides to where each role usually leads next, when people make the move, and what to have
              on your resume first.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-x-5 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4">
            {guides.map((g) => (
              <li key={g.slug} className="flex">
                <Link
                  href={`/career-path/${g.slug}`}
                  className="flex min-h-11 w-full items-center border-b border-[#E0D8CC] py-2 text-sm text-[#0C1A0E] transition-colors duration-150 hover:text-[#065F46]"
                >
                  {g.label}
                  <span className="sr-only"> career path</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FAQ, the visible mirror of the JSON-LD */}
      <section
        aria-labelledby="cp-faq"
        className={cn(CONTAINER, "grid gap-6 pb-16 lg:grid-cols-[1fr_1.6fr] lg:gap-16 lg:pb-20")}
      >
        <div className="flex flex-col gap-2.5">
          <h2 id="cp-faq" className={SECTION_H2}>
            Questions
          </h2>
          <p className="text-[15px] text-[#5F5852]">About how the generator works and what happens to your resume.</p>
        </div>
        <div>
          <div className="border-b border-[#E0D8CC]">
            {FAQ.map((f, i) => (
              <details key={f.question} open={i === 0} className="group border-t border-[#E0D8CC]">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-[18px] text-base font-semibold [&::-webkit-details-marker]:hidden">
                  <h3>{f.question}</h3>
                  <Plus className="h-[18px] w-[18px] shrink-0 text-[#5F5852] group-open:hidden" aria-hidden="true" />
                  <Minus className="hidden h-[18px] w-[18px] shrink-0 text-[#5F5852] group-open:block" aria-hidden="true" />
                </summary>
                <p className="max-w-[620px] pb-[18px] text-[15px] leading-[1.55] text-[#4A443E]">{f.answer}</p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-sm text-[#5F5852]">
            More on how we handle your data in our{" "}
            <Link href="/privacy" className="font-semibold text-[#065F46] underline underline-offset-4 hover:text-[#044536]">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
