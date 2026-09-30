import type { Metadata } from "next";
import Link from "next/link";
import { Minus, Plus, Search, Sparkle } from "lucide-react";
import { CareerPathPlanCta } from "@/components/career-path/career-path-tool";
import {
  CP_BUTTON,
  CP_TOP_EDGE,
  FitBar,
  FitNumber,
  MoveTypeEyebrow,
  SkillChips,
  moveTopEdgeStyle,
} from "@/components/career-path/path-meta";
import {
  FIELD_HUE,
  HUE_CLASSES,
  type Hue,
} from "@/components/career-path/palette";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
} from "@/components/shared/structured-data";
import { ROLE_CATEGORIES } from "@/lib/jobs/role-categories";
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
    images: [{ url: "https://www.thecvedge.com/og-image.png", width: 1200, height: 630, alt: "CVEdge career path generator" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | CVEdge`,
    description: DESCRIPTION,
    images: ["https://www.thecvedge.com/og-image.png"],
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
      "You can see your roles, fit scores and job numbers without an account. Tailoring your resume for a role needs a free Google sign-in: we set the role as your resume's target and score it against that job, show the keywords you're missing and rewrite weak bullets. Each role also gets a 90-day plan. We never ask for a card.",
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
  skills: [
    "Data cleaning",
    "Exploratory data analysis",
    "Data visualization",
    "Business understanding",
  ],
};

// What tailoring the resume for a role gives you, in the editor. All of it exists today.
const PLAN_ITEMS = [
  {
    title: "An ATS score for the role",
    body: "Your resume checked against what employers ask for in that role, not a generic scan.",
  },
  {
    title: "The keywords you're missing",
    body: "The skills and terms hiring managers look for that your resume doesn't show yet. Add them in one click.",
  },
  {
    title: "AI rewrites for weak bullets",
    body: "Each bullet rewritten for the target role. Your facts stay yours; nothing is invented.",
  },
  {
    title: "A resume ready to send",
    body: "Export a clean PDF. Your 90-day plan for the role stays saved in your account too.",
  },
];

// Navy for the data note, amber for the AI caveat: the hues' jobs in ./palette.
const TRUST_NOTES: {
  icon: typeof Search;
  hue: Hue;
  title: string;
  body: string;
}[] = [
  {
    icon: Search,
    hue: "navy",
    title: "Job counts and pay come from live listings",
    body: "Large job boards in your country, checked when you search and refreshed daily. Pay is the range employers advertise, shown only when at least 5 ads list a salary.",
  },
  {
    icon: Sparkle,
    hue: "amber",
    title: "Role suggestions and fit scores are AI-generated",
    body: "Built from what you share. Treat them as a starting point to check against real postings, people in the role, and your own judgment.",
  },
];

// Same container as the site header, so the page lines up with the logo.
const CONTAINER = "container mx-auto px-4";
const SECTION_H2 =
  "font-cp-display text-[30px] font-normal leading-[1.1] sm:text-4xl";

// Each role's field, so the index rows carry a small dot in the field's hue.
const FIELD_BY_SLUG = new Map(
  ROLE_CATEGORIES.flatMap((c) => c.roles.map((r) => [r.slug, c.name] as const)),
);

function fieldHue(slug: string): Hue {
  const field = FIELD_BY_SLUG.get(slug);
  return (field && FIELD_HUE[field]) || "navy";
}

function roleGuides() {
  return careerPathPageSlugs()
    .map((slug) => ({
      slug,
      label: roleLabel(slug) ?? slug,
      hue: fieldHue(slug),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** The hero's example card: a real result, with two tilted cards behind it. */
function ExampleCard() {
  return (
    <figure className="relative flex h-[560px] flex-col items-center justify-center">
      <div
        className={cn(
          "absolute h-[300px] w-[400px] -translate-x-10 translate-y-10 -rotate-[4deg] rounded-[20px] border opacity-70",
          HUE_CLASSES.navy.tint,
          HUE_CLASSES.navy.tintBorder,
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          "absolute h-[300px] w-[400px] translate-x-9 translate-y-6 rotate-[3deg] rounded-[20px] border opacity-[0.85]",
          HUE_CLASSES.amber.tint,
          HUE_CLASSES.amber.tintBorder,
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          CP_TOP_EDGE,
          "relative flex w-[440px] flex-col gap-[18px] rounded-[20px] border border-[#E0D8CC] bg-white p-7 shadow-[0_24px_48px_-24px_rgba(12,26,14,0.25)]",
        )}
        style={moveTopEdgeStyle(EXAMPLE.moveType)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <MoveTypeEyebrow moveType={EXAMPLE.moveType} />
            <p className="text-2xl font-semibold leading-[1.2] tracking-[-0.01em]">
              {EXAMPLE.title}
            </p>
          </div>
          <FitNumber fit={EXAMPLE.fit} moveType={EXAMPLE.moveType} />
        </div>
        <FitBar fit={EXAMPLE.fit} moveType={EXAMPLE.moveType} />
        <SkillChips
          skills={EXAMPLE.skills}
          label={`Skills that carry over to ${EXAMPLE.title}`}
        />
        <dl className="grid grid-cols-2 gap-3 border-t border-[#EDE8DF] pt-4">
          <div className="flex flex-col-reverse gap-0.5">
            <dt className="text-xs text-[#5F5852]">open jobs, US</dt>
            <dd
              className={cn(
                "text-xl font-semibold tabular-nums",
                HUE_CLASSES.navy.text,
              )}
            >
              {EXAMPLE.jobs}
            </dd>
          </div>
          <div className="flex flex-col-reverse gap-0.5">
            <dt className="text-xs text-[#5F5852]">advertised pay</dt>
            <dd
              className={cn(
                "text-xl font-semibold tabular-nums",
                HUE_CLASSES.navy.text,
              )}
            >
              {EXAMPLE.pay}
            </dd>
          </div>
        </dl>
        <a href="#tool" className={CP_BUTTON.green}>
          Tailor my resume for this role
        </a>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <Link
            href="/jobs/data-scientist"
            className="font-semibold text-[#1E3A5F] underline-offset-4 hover:underline"
          >
            View {EXAMPLE.jobs} jobs
          </Link>
          <a
            href="#tool"
            className="text-[#5F5852] underline-offset-4 hover:text-[#0C1A0E] hover:underline"
          >
            See the 90-day plan
          </a>
        </p>
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEB_APP_JSON_LD) }}
      />

      {/* Hero, replaced by the results once a search finishes */}
      <div
        id="tool"
        className={cn(
          CONTAINER,
          "scroll-mt-24 pb-14 pt-8 sm:pt-12 lg:pb-16 lg:pt-20",
        )}
      >
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
              Tailor your resume
            </span>
            <h2
              id="cp-plan-title"
              className="font-cp-display tracking-[-0.02em] text-[28px] font-bold leading-[1.1] sm:text-[40px] sm:leading-[1.08]"
            >
              <span className="sm:hidden">
                The roles are free. Tailoring your resume for one is a sign-in
                away.
              </span>
              <span className="hidden sm:inline">
                The roles are free. Tailoring your resume for one is a Google
                sign-in away.
              </span>
            </h2>
            <p className="max-w-[480px] text-sm leading-[1.55] text-[#CFE5D9] sm:text-base">
              <span className="sm:hidden">
                Pick a role, sign in with Google, and we set it as your
                resume&apos;s target: an ATS score, missing keywords and AI
                rewrites for that job.
              </span>
              <span className="hidden sm:inline">
                Your roles, fit scores and job numbers stay free with no
                account. Pick a role and sign in with Google, and we set it as
                your resume&apos;s target: an ATS score for that job, the
                keywords you&apos;re missing and AI rewrites of weak bullets.
                The 90-day plan comes with it.
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
                <span
                  className="font-cp-display tracking-[-0.02em] font-bold text-[26px] leading-none text-[#E3B76A]"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[15px] font-semibold">{item.title}</span>
                <span className="text-[13px] leading-normal text-[#CFE5D9]">
                  {item.body}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* Where the numbers come from */}
      <div
        className={cn(
          CONTAINER,
          "grid gap-4 py-12 md:grid-cols-2 md:gap-6 lg:py-16",
        )}
      >
        {TRUST_NOTES.map(({ icon: Icon, hue, title, body }) => (
          <div
            key={title}
            className="flex items-start gap-[18px] rounded-2xl border border-[#E0D8CC] bg-white p-5 sm:p-6"
          >
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]",
                HUE_CLASSES[hue].tint,
              )}
              aria-hidden="true"
            >
              <Icon className={cn("h-5 w-5", HUE_CLASSES[hue].text)} />
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
        <section
          aria-labelledby="cp-roles"
          className={cn(CONTAINER, "flex flex-col gap-6 pb-12 lg:pb-16")}
        >
          <div className="flex flex-col gap-1.5">
            <h2 id="cp-roles" className={SECTION_H2}>
              Browse career paths by role
            </h2>
            <p className="text-[15px] text-[#5F5852]">
              {guides.length} guides to where each role usually leads next, when
              people make the move, and what to have on your resume first.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-x-5 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4">
            {guides.map((g) => (
              <li key={g.slug} className="flex">
                <Link
                  href={`/career-path/${g.slug}`}
                  className="flex min-h-11 w-full items-center gap-2.5 border-b border-[#E0D8CC] py-2 text-sm text-[#0C1A0E] transition-colors duration-150 hover:text-[#065F46]"
                >
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      HUE_CLASSES[g.hue].bg,
                    )}
                    aria-hidden="true"
                  />
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
        className={cn(
          CONTAINER,
          "grid gap-6 pb-16 lg:grid-cols-[1fr_1.6fr] lg:gap-16 lg:pb-20",
        )}
      >
        <div className="flex flex-col gap-2.5">
          <h2 id="cp-faq" className={SECTION_H2}>
            Questions
          </h2>
          <p className="text-[15px] text-[#5F5852]">
            About how the generator works and what happens to your resume.
          </p>
        </div>
        <div>
          <div className="border-b border-[#E0D8CC]">
            {FAQ.map((f, i) => (
              <details
                key={f.question}
                open={i === 0}
                className="group border-t border-[#E0D8CC]"
              >
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-[18px] text-base font-semibold [&::-webkit-details-marker]:hidden">
                  <h3>{f.question}</h3>
                  <Plus
                    className="h-[18px] w-[18px] shrink-0 text-[#1E3A5F] group-open:hidden"
                    aria-hidden="true"
                  />
                  <Minus
                    className="hidden h-[18px] w-[18px] shrink-0 text-[#1E3A5F] group-open:block"
                    aria-hidden="true"
                  />
                </summary>
                <p className="max-w-[620px] pb-[18px] text-[15px] leading-[1.55] text-[#4A443E]">
                  {f.answer}
                </p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-sm text-[#5F5852]">
            More on how we handle your data in our{" "}
            <Link
              href="/privacy"
              className="font-semibold text-[#065F46] underline underline-offset-4 hover:text-[#044536]"
            >
              privacy policy
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
