import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import {
  ArrowDown,
  Briefcase,
  FileText,
  Info,
  MessageSquare,
  Minus,
  Plus,
  Search,
  Star,
  type LucideIcon,
} from "lucide-react";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
} from "@/components/shared/structured-data";
import { CareerPathTool } from "@/components/career-path/career-path-tool";
import {
  formatJobCount,
  formatSalaryRange,
} from "@/components/career-path/format";
import {
  CP,
  FIELD_HUE,
  HUE_CLASSES,
  MOVE_HEX,
  type Hue,
} from "@/components/career-path/palette";
import { ROLE_CATEGORIES } from "@/lib/jobs/role-categories";
import {
  careerPathPageSlugs,
  hasCareerPathPage,
  roleLabel,
} from "@/lib/roles/career-moves/pages";
import {
  careerPathDescription,
  careerPathTitle,
} from "@/components/career-path/role-page/role-page-meta";
import {
  moveAnchor,
  plural,
  roleNoun,
  sentenceCase,
  shortAnswer,
  timingShort,
} from "@/components/career-path/role-page/role-page-copy";
import {
  CARD,
  EYEBROW,
  EYEBROW_NAVY,
  HueSwatch,
  LABEL,
  LINK,
  MoveTypeEyebrow,
  SECTION_HEADING,
  SkillChips,
} from "@/components/career-path/role-page/role-page-ui";
import { getRoleMarket } from "@/lib/career-path/market";
import type { RoleMarket } from "@/lib/career-path/types";
import { getCareerPath, type CareerMove } from "@/lib/roles/career-moves";
import { getRoleContent } from "@/lib/roles/role-content";
import { cn } from "@/lib/utils";

// Rendered on demand and cached for a day: no generateStaticParams, so the job
// providers behind getRoleMarket are never called at build time.
export const revalidate = 86400;

const SITE = "https://www.thecvedge.com";

type Params = { params: Promise<{ role: string }> };

function loadRole(slug: string) {
  const label = roleLabel(slug);
  const path = getCareerPath(slug);
  const content = getRoleContent(slug);
  if (!label || !path || !content || !hasCareerPathPage(slug)) return null;
  return { label, path, content };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { role: slug } = await params;
  const role = loadRole(slug);
  if (!role) return {};

  const title = careerPathTitle(role.label);
  const description = careerPathDescription(role.label, role.path);
  const url = `${SITE}/career-path/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    // The layout template is not applied to these, so the brand is spelled out.
    openGraph: {
      title: `${title} | CVEdge`,
      description,
      url,
      images: [
        {
          url: `${SITE}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${role.label} career path on CVEdge`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | CVEdge`,
      description,
      images: [`${SITE}/og-image.png`],
    },
  };
}

/** Market data is a bonus: a provider failure or timeout hides it, never breaks the page. */
async function marketFor(title: string): Promise<RoleMarket | null> {
  try {
    return await getRoleMarket(title, "us");
  } catch (err) {
    console.error(`[career-path/${title}] market lookup failed:`, err);
    return null;
  }
}

function money(n: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(n);
}

function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** The destination's own career path page, or failing that its jobs page. */
function moveLink(move: CareerMove): { href: string; text: string } | null {
  if (!move.toSlug) return null;
  const name = roleNoun(move.toRole);
  if (hasCareerPathPage(move.toSlug))
    return {
      href: `/career-path/${move.toSlug}`,
      text: `See the ${name} career path`,
    };
  if (roleLabel(move.toSlug))
    return { href: `/jobs/${move.toSlug}`, text: `Browse ${name} jobs` };
  return null;
}

// The field each role belongs to, for the coloured dot beside it in the role index.
const FIELD_BY_SLUG = new Map(
  ROLE_CATEGORIES.flatMap((c) => c.roles.map((r) => [r.slug, c.name] as const)),
);

function fieldHue(slug: string): Hue {
  const field = FIELD_BY_SLUG.get(slug);
  return (field && FIELD_HUE[field]) || "navy";
}

/** Up to `count` other career path pages, starting after this one, so every page gets linked evenly. */
function otherPaths(
  slug: string,
  count: number,
): { slug: string; label: string; hue: Hue }[] {
  const all = careerPathPageSlugs();
  const start = all.indexOf(slug) + 1;
  return [...all.slice(start), ...all.slice(0, Math.max(0, start - 1))]
    .slice(0, count)
    .map((s) => ({ slug: s, label: roleLabel(s) ?? s, hue: fieldHue(s) }));
}

// Text on the navy card. Labels are CP.navy.soft (4.8:1 on #1E3A5F), notes and
// fallbacks CP.navy.tintBorder (7.7:1); figures are white. Literal classes so
// the Tailwind JIT sees them.
const ON_NAVY = {
  label: "text-[#8FA9C9]",
  note: "text-[#CBD6E4]",
  rule: "border-white/15",
};

/** Big serif figures for the role itself, on the page's one navy block. Missing values are said out loud, never shown as zero. */
function KeyNumbers({
  label,
  market,
}: {
  label: string;
  market: RoleMarket | null;
}) {
  const jobs = market && formatJobCount(market);
  const hasPay =
    market !== null && market.salaryLow !== null && market.salaryHigh !== null;
  return (
    <section
      aria-labelledby="numbers-heading"
      className={cn(
        CARD,
        HUE_CLASSES.navy.bg,
        HUE_CLASSES.navy.border,
        "p-6 text-[#F7F5F0] shadow-none sm:p-7",
      )}
    >
      <h2
        id="numbers-heading"
        className={cn(
          "text-xs font-bold uppercase tracking-[0.14em]",
          ON_NAVY.label,
        )}
      >
        {sentenceCase(label)} jobs in the US
      </h2>
      {market && (jobs || hasPay) ? (
        <>
          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5">
            <div className="col-span-2">
              <dd className="font-cp-display tracking-[-0.02em] font-bold text-[40px] leading-none tabular-nums text-white sm:text-[43px]">
                {hasPay ? (
                  `${money(market.salaryLow!, market.currency)}-${money(market.salaryHigh!, market.currency)}`
                ) : (
                  <span className={cn("font-sans text-base", ON_NAVY.note)}>
                    Too few listings state pay
                  </span>
                )}
              </dd>
              <dt className={cn("mt-2 text-[13px]", ON_NAVY.label)}>
                Advertised pay
              </dt>
            </div>
            <div className={cn("border-t pt-4", ON_NAVY.rule)}>
              <dd className="font-cp-display tracking-[-0.02em] font-bold text-[32px] leading-none tabular-nums text-white">
                {jobs ?? (
                  <span className={cn("font-sans text-base", ON_NAVY.note)}>
                    Not counted
                  </span>
                )}
              </dd>
              <dt className={cn("mt-1.5 text-[13px]", ON_NAVY.label)}>
                Open jobs
              </dt>
            </div>
            {hasPay && market.salaryMedian !== null && (
              <div className={cn("border-t pt-4", ON_NAVY.rule)}>
                <dd className="font-cp-display tracking-[-0.02em] font-bold text-[32px] leading-none tabular-nums text-white">
                  {money(market.salaryMedian, market.currency)}
                </dd>
                <dt className={cn("mt-1.5 text-[13px]", ON_NAVY.label)}>
                  Median
                </dt>
              </div>
            )}
          </dl>
          <p className={cn("mt-5 text-[13px] leading-relaxed", ON_NAVY.note)}>
            Jobs are counted by title on US job boards.
            {hasPay && (
              <>
                {" "}
                Pay is the middle half of the{" "}
                {market.sampleSize.toLocaleString("en-US")} listings that state
                a salary.
              </>
            )}
          </p>
        </>
      ) : (
        <p className={cn("mt-4 text-sm leading-relaxed", ON_NAVY.note)}>
          We couldn&apos;t load live job numbers. The listing feed may be busy.
          Check back tomorrow.
        </p>
      )}
    </section>
  );
}

function MovesTable({
  label,
  moves,
  markets,
  updated,
}: {
  label: string;
  moves: CareerMove[];
  markets: (RoleMarket | null)[];
  updated: string;
}) {
  // Phones get stacked rows: each cell shows its column name from data-label.
  const cell =
    "px-4 py-4 align-middle max-sm:flex max-sm:items-baseline max-sm:justify-between max-sm:gap-4 max-sm:px-0 max-sm:py-1 max-sm:text-right max-sm:before:content-[attr(data-label)] max-sm:before:text-left max-sm:before:text-[11px] max-sm:before:font-bold max-sm:before:uppercase max-sm:before:tracking-[0.1em] max-sm:before:text-[#5F5852] max-sm:before:shrink-0 max-sm:before:whitespace-nowrap";
  const empty = <span className="font-normal text-[#5F5852]">No data</span>;
  return (
    <>
      <div className={cn(CARD, "px-5 sm:px-7")}>
        <table className="w-full border-collapse text-left text-[15px] max-sm:block">
          <caption className="sr-only">
            Next moves from {roleNoun(label)}, with open US jobs and advertised
            pay for each
          </caption>
          <thead className="max-sm:sr-only">
            <tr className="border-b border-[#E0D8CC]">
              {[
                "Move to",
                "Type",
                "Usually when",
                "Open US jobs",
                "Advertised pay",
              ].map((h, i) => (
                <th
                  key={h}
                  scope="col"
                  className={cn(
                    LABEL,
                    HUE_CLASSES.navy.text,
                    "whitespace-nowrap px-4 pb-3 pt-5 first:pl-0 last:pr-0",
                    i >= 3 && "text-right",
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="max-sm:block">
            {moves.map((move, i) => {
              const market = markets[i];
              const page =
                move.toSlug && hasCareerPathPage(move.toSlug)
                  ? `/career-path/${move.toSlug}`
                  : null;
              return (
                <tr
                  key={move.toRole}
                  className="border-b border-[#EDE8DF] last:border-b-0 max-sm:block max-sm:py-4"
                >
                  <th
                    scope="row"
                    className="py-4 pr-4 align-middle font-semibold max-sm:block max-sm:pb-1"
                  >
                    <a
                      href={`#${moveAnchor(move)}`}
                      className="text-[16px] underline-offset-4 transition-colors duration-150 hover:text-[#065F46] hover:underline"
                    >
                      {sentenceCase(move.toRole)}
                    </a>
                    {page && (
                      <Link
                        href={page}
                        className={cn(
                          LINK,
                          "mt-0.5 flex w-fit items-center text-xs max-sm:mt-0 max-sm:min-h-11",
                        )}
                      >
                        Its career path
                        <span className="sr-only">
                          : {roleNoun(move.toRole)}
                        </span>
                      </Link>
                    )}
                  </th>
                  <td data-label="Type" className={cell}>
                    <MoveTypeEyebrow moveType={move.moveType} />
                  </td>
                  <td
                    data-label="Usually when"
                    className={cn(cell, "text-[#4A443E] sm:min-w-[11rem]")}
                  >
                    {timingShort(move)}
                  </td>
                  <td
                    data-label="Open US jobs"
                    className={cn(
                      cell,
                      HUE_CLASSES.navy.text,
                      "font-semibold tabular-nums sm:text-right",
                    )}
                  >
                    {(market && formatJobCount(market)) ?? empty}
                  </td>
                  <td
                    data-label="Advertised pay"
                    className={cn(
                      cell,
                      HUE_CLASSES.navy.text,
                      "whitespace-nowrap font-semibold tabular-nums sm:pr-0 sm:text-right",
                    )}
                  >
                    {(market && formatSalaryRange(market)) ?? empty}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 flex items-start gap-2 text-[13px] leading-relaxed text-[#5F5852]">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        Job counts and pay from US listings, {updated}. Pay shows only where at
        least five listings state it.
      </p>
    </>
  );
}

function MoveSection({
  move,
  market,
}: {
  move: CareerMove;
  market: RoleMarket | null;
}) {
  const link = moveLink(move);
  const jobs = market && formatJobCount(market);
  const pay = market && formatSalaryRange(market);
  return (
    <article
      id={moveAnchor(move)}
      className={cn(
        CARD,
        "flex scroll-mt-24 flex-col gap-6 border-t-[3px] p-6 sm:p-8",
      )}
      style={{ borderTopColor: MOVE_HEX[move.moveType].fill }}
    >
      <div className="flex flex-col gap-1.5">
        <MoveTypeEyebrow moveType={move.moveType} />
        <h3 className="text-[22px] font-semibold leading-tight tracking-[-0.01em] sm:text-2xl">
          {sentenceCase(move.toRole)}
        </h3>
      </div>
      <p className="max-w-[65ch] text-[15px] leading-[1.6] text-[#4A443E]">
        {move.why}
      </p>
      <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-[10rem_1fr] sm:gap-y-5">
        <dt className={cn(LABEL, "sm:pt-1")}>Usually when</dt>
        <dd className="text-[15px] leading-relaxed">{move.typicalTiming}</dd>
        <dt className={cn(LABEL, "max-sm:mt-3 sm:pt-1.5")}>Skills to add</dt>
        <dd>
          <SkillChips
            skills={move.skillsToAdd}
            label={`Skills to add for ${roleNoun(move.toRole)}`}
          />
        </dd>
        <dt className={cn(LABEL, "max-sm:mt-3 sm:pt-4")}>
          Have this on your resume first
        </dt>
        <dd
          className={cn(
            "rounded-[14px] border px-4 py-3 text-[15px] leading-relaxed text-[#0C1A0E]",
            HUE_CLASSES.amber.tint,
            HUE_CLASSES.amber.tintBorder,
          )}
        >
          {move.proof}
        </dd>
      </dl>
      {(jobs || pay || link) && (
        <div className="flex flex-col gap-4 border-t border-[#EDE8DF] pt-5 sm:flex-row sm:items-end sm:justify-between">
          {(jobs || pay) && (
            <dl className="grid grid-cols-2 gap-x-8 gap-y-2">
              {jobs && (
                <div>
                  <dd
                    className={cn(
                      "text-[22px] font-semibold tabular-nums",
                      HUE_CLASSES.navy.text,
                    )}
                  >
                    {jobs}
                  </dd>
                  <dt className="text-xs text-[#5F5852]">open US jobs</dt>
                </div>
              )}
              {pay && (
                <div>
                  <dd
                    className={cn(
                      "whitespace-nowrap text-[22px] font-semibold tabular-nums",
                      HUE_CLASSES.navy.text,
                    )}
                  >
                    {pay}
                  </dd>
                  <dt className="text-xs text-[#5F5852]">advertised</dt>
                </div>
              )}
            </dl>
          )}
          {link && (
            <Link
              href={link.href}
              className={cn(
                LINK,
                "inline-flex min-h-11 items-center gap-1.5 text-sm",
              )}
            >
              {link.text}
            </Link>
          )}
        </div>
      )}
    </article>
  );
}

// What the embedded tool gives back. Roles and fit are AI; jobs and pay are live listings.
const TOOL_STEPS = [
  {
    title: "3 to 5 next roles",
    text: "Each with a fit score, from your job title or your resume.",
  },
  {
    title: "Live jobs and pay",
    text: "Open jobs and advertised pay, taken from current job listings.",
  },
  {
    title: "Tailor your resume for the role",
    text: "Sign in with Google and we set the role as your resume's target: an ATS score, missing keywords and rewrites. A 90-day plan comes with it.",
  },
];

function TrustNote({
  icon: Icon,
  hue,
  title,
  children,
}: {
  icon: LucideIcon;
  hue: Hue;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-[#E0D8CC] bg-white p-5 sm:gap-[18px] sm:p-6">
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]",
          HUE_CLASSES[hue].tint,
        )}
      >
        <Icon className={cn("h-5 w-5", HUE_CLASSES[hue].text)} aria-hidden />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold">{title}</p>
        <p className="text-sm leading-relaxed text-[#5F5852]">{children}</p>
      </div>
    </div>
  );
}

export default async function CareerPathRolePage({ params }: Params) {
  const { role: slug } = await params;
  const role = loadRole(slug);
  if (!role) notFound();
  const { label, path, content } = role;

  const [market, ...moveMarkets] = await Promise.all([
    marketFor(label),
    ...path.moves.map((m) => marketFor(m.toRole)),
  ]);

  const pageUrl = `${SITE}/career-path/${slug}`;
  const updatedIso = market?.fetchedAt ?? new Date().toISOString();
  const updated = longDate(updatedIso);
  const answer = shortAnswer(label, path);
  const others = otherPaths(slug, 12);
  const guideCount = careerPathPageSlugs().length;
  const name = roleNoun(label);
  const people = plural(label);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Next career moves for ${people}`,
    itemListOrder: "https://schema.org/ItemListUnordered",
    numberOfItems: path.moves.length,
    itemListElement: path.moves.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: m.toRole,
      url:
        m.toSlug && hasCareerPathPage(m.toSlug)
          ? `${SITE}/career-path/${m.toSlug}`
          : `${pageUrl}#${moveAnchor(m)}`,
    })),
  };

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE },
          { name: "Career Path", url: `${SITE}/career-path` },
          { name: label, url: pageUrl },
        ]}
      />
      <FaqJsonLd
        items={path.faqs.map((f) => ({
          question: f.question,
          answer: f.answer,
        }))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />

      <article className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-8 sm:px-8 md:pt-14">
        {/* Masthead: title, standfirst and the role's own numbers, then the short answer */}
        <header>
          <div className="grid gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
            <div>
              <nav
                aria-label="Breadcrumb"
                className="text-[13px] text-[#5F5852]"
              >
                <ol className="flex flex-wrap items-center gap-2">
                  <li>
                    <Link
                      href="/career-path"
                      className="inline-flex min-h-11 items-center transition-colors duration-150 hover:text-[#065F46] sm:min-h-0"
                    >
                      Career paths
                    </Link>
                  </li>
                  <li aria-hidden>/</li>
                  <li aria-current="page" className="text-[#0C1A0E]">
                    {sentenceCase(label)}
                  </li>
                </ol>
              </nav>
              <p className={cn(EYEBROW, "mt-4 sm:mt-6")}>Career path guide</p>
              <h1 className="mt-3 font-cp-display text-[40px] font-bold leading-[1.04] tracking-[-0.02em] sm:text-[54px]">
                <em className="not-italic text-[#065F46]">
                  {sentenceCase(label)}
                </em>{" "}
                career path
              </h1>
              <p className="mt-5 max-w-[62ch] text-[17px] leading-[1.6] text-[#4A443E] sm:text-lg">
                {path.overview}
              </p>
              <p className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-[#5F5852]">
                <span>
                  Updated{" "}
                  <time dateTime={updatedIso.slice(0, 10)}>{updated}</time>
                </span>
                <span aria-hidden>·</span>
                <span>Pay and job counts from live US job listings</span>
              </p>
            </div>
            <KeyNumbers label={label} market={market} />
          </div>

          {answer.length > 0 && (
            <section
              aria-labelledby="short-answer"
              className={cn(
                "mt-10 flex gap-4 rounded-2xl border px-5 py-5 sm:gap-5 sm:px-[26px] sm:py-[22px]",
                HUE_CLASSES.amber.tint,
                HUE_CLASSES.amber.tintBorder,
              )}
            >
              <Star
                className={cn(
                  "mt-0.5 h-[22px] w-[22px] shrink-0",
                  HUE_CLASSES.amber.text,
                )}
                aria-hidden
              />
              <div className="text-[#0C1A0E]">
                <h2
                  id="short-answer"
                  className="text-base font-semibold sm:text-[17px]"
                >
                  What comes after {name}?
                </h2>
                <p className="mt-1.5 max-w-[80ch] text-base leading-[1.55]">
                  {answer.join(" ")}
                </p>
                <a
                  href="#find-your-path"
                  className={cn(
                    LINK,
                    "mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm",
                  )}
                >
                  Check your own resume
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                </a>
              </div>
            </section>
          )}
        </header>

        {/* The moves at a glance */}
        <section aria-labelledby="moves-heading" className="mt-20 sm:mt-24">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <div>
              <p className={EYEBROW_NAVY}>Next moves</p>
              <h2 id="moves-heading" className={cn(SECTION_HEADING, "mt-2.5")}>
                Where {people} go next
              </h2>
            </div>
            <p className="max-w-[56ch] text-[15px] leading-relaxed text-[#5F5852]">
              {path.moves.length} moves people make from this role. The job
              counts and pay are for each destination role, so you can see what
              the market wants right now.
            </p>
          </div>
          <div className="mt-8">
            <MovesTable
              label={label}
              moves={path.moves}
              markets={moveMarkets}
              updated={updated}
            />
          </div>
        </section>

        {/* Move-by-move detail, with the in-role ladder alongside */}
        <div className="mt-20 grid gap-x-12 gap-y-12 sm:mt-24 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section aria-labelledby="detail-heading">
            <p className={EYEBROW_NAVY}>Move by move</p>
            <h2 id="detail-heading" className={cn(SECTION_HEADING, "mt-2.5")}>
              What each move takes
            </h2>
            <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-[#5F5852]">
              Why each move fits, the skills hiring managers look for, and the
              proof to have on your resume before you apply.
            </p>
            <div className="mt-8 flex flex-col gap-5">
              {path.moves.map((move, i) => (
                <MoveSection
                  key={move.toRole}
                  move={move}
                  market={moveMarkets[i]}
                />
              ))}
            </div>
          </section>

          <aside aria-labelledby="ladder-heading">
            <div className={cn(CARD, "p-6 sm:p-7 lg:sticky lg:top-24")}>
              <p className={EYEBROW_NAVY}>Within the role</p>
              <h2
                id="ladder-heading"
                className="mt-2.5 font-cp-display tracking-[-0.02em] text-[28px] font-bold leading-[1.1]"
              >
                The {name} ladder
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#5F5852]">
                What each level is expected to own. Many people climb this
                before they change roles.
              </p>
              <ol className="mt-5">
                {content.seniority.map((step, i) => (
                  <li
                    key={step.level}
                    className="grid grid-cols-[2.5rem_1fr] gap-x-2 border-t border-[#EDE8DF] py-4 last:pb-0"
                  >
                    <span
                      className={cn(
                        "font-cp-display text-[26px] font-bold tracking-[-0.02em] leading-none tabular-nums",
                        HUE_CLASSES.navy.text,
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-semibold">{step.level}</p>
                      <p className="mt-1 text-sm leading-relaxed text-[#5F5852]">
                        {step.expectation}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>

        {/* The tool, pre-filled with this role, on the green band */}
        <section
          id="find-your-path"
          aria-labelledby="tool-heading"
          className="mt-20 grid scroll-mt-24 gap-x-14 gap-y-8 rounded-[20px] bg-[#065F46] p-5 text-[#F7F5F0] sm:mt-24 sm:rounded-[28px] sm:p-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:p-16"
        >
          <div className="flex flex-col gap-4 px-1 pt-3 sm:px-0 sm:pt-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#A7E0C6]">
              Your own path
            </p>
            <h2
              id="tool-heading"
              className="font-cp-display tracking-[-0.02em] text-[34px] font-bold leading-[1.08] sm:text-[40px]"
            >
              Now check your own resume
            </h2>
            <p className="max-w-[46ch] text-base leading-[1.6] text-[#CFE5D9]">
              Your own resume will give you a sharper answer than this page.
              Your years, tools and wins change which move fits.
            </p>
            <ol className="mt-4 hidden flex-col gap-3 lg:flex">
              {TOOL_STEPS.map((step, i) => (
                <li
                  key={step.title}
                  className="grid grid-cols-[2.5rem_1fr] gap-x-2 rounded-2xl border border-[#2F7A63] bg-[#0A684E] px-4 py-4 sm:px-5"
                >
                  <span
                    className="font-cp-display tracking-[-0.02em] font-bold text-[26px] leading-none"
                    style={{ color: CP.amber.soft }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold">{step.title}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-[#CFE5D9]">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="min-w-0 self-start rounded-[20px] bg-[#F7F5F0] p-5 text-[#0C1A0E] sm:p-7 lg:self-center">
            <Suspense fallback={null}>
              <CareerPathTool initialRole={label} handOffTo="/career-path" />
            </Suspense>
          </div>
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-2 md:gap-6">
          <TrustNote
            icon={Search}
            hue="navy"
            title="Job counts and pay come from live listings"
          >
            Counted by title on US job boards and checked daily. Pay is the
            range employers advertise, shown only where enough listings state
            it.
          </TrustNote>
          <TrustNote
            icon={Star}
            hue="amber"
            title="Suggested roles and fit scores come from AI"
          >
            The tool builds them from what you share. Treat them as a starting
            point to check against real postings and your own judgment.
          </TrustNote>
        </div>

        {/* FAQ, the visible mirror of the JSON-LD */}
        <section
          aria-labelledby="faq-heading"
          className="mt-20 grid gap-x-16 gap-y-6 sm:mt-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]"
        >
          <div>
            <p className={EYEBROW_NAVY}>Questions</p>
            <h2 id="faq-heading" className={cn(SECTION_HEADING, "mt-2.5")}>
              Questions {people} ask
            </h2>
          </div>
          <div>
            {path.faqs.map((f, i) => (
              <details
                key={f.question}
                open={i === 0}
                className="group border-t border-[#E0D8CC] last:border-b"
              >
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-[18px] [&::-webkit-details-marker]:hidden">
                  <h3 className="text-base font-semibold leading-snug">
                    {f.question}
                  </h3>
                  <Plus
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 group-open:hidden",
                      HUE_CLASSES.navy.text,
                    )}
                    aria-hidden
                  />
                  <Minus
                    className={cn(
                      "hidden h-[18px] w-[18px] shrink-0 group-open:block",
                      HUE_CLASSES.navy.text,
                    )}
                    aria-hidden
                  />
                </summary>
                <p className="-mt-1.5 max-w-[62ch] pb-5 text-[15px] leading-[1.6] text-[#4A443E]">
                  {f.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Related pages. Every career path page has role content, so its resume
            example and interview prep pages are indexable too. Other career paths:
            internal links between real pages only. */}
        <nav
          aria-label="Related pages"
          className="mt-20 flex flex-col gap-16 sm:mt-24"
        >
          <div>
            <h2 className={SECTION_HEADING}>More for {people}</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
              {[
                {
                  href: `/resume-examples/${slug}`,
                  text: `${sentenceCase(label)} resume examples`,
                  icon: FileText,
                  hue: "green" as Hue,
                },
                {
                  href: `/interview-prep/${slug}`,
                  text: `${sentenceCase(label)} interview questions`,
                  icon: MessageSquare,
                  hue: "navy" as Hue,
                },
                {
                  href: `/jobs/${slug}`,
                  text: `Open ${name} jobs`,
                  icon: Briefcase,
                  hue: "amber" as Hue,
                },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="group flex min-h-14 items-center gap-3 rounded-2xl border border-[#E0D8CC] bg-white px-5 py-4 text-[15px] font-semibold transition-colors duration-150 hover:border-[#065F46] hover:text-[#065F46]"
                  >
                    <l.icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0",
                        HUE_CLASSES[l.hue].text,
                      )}
                      aria-hidden
                    />
                    {l.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {others.length > 0 && (
            <div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
                <div>
                  <h2 className={SECTION_HEADING}>Other career paths</h2>
                  <p className="mt-2 text-[15px] text-[#5F5852]">
                    Where each role usually leads next, what the move pays, and
                    what to have on your resume first.
                  </p>
                </div>
                <Link
                  href="/career-path"
                  className={cn(
                    LINK,
                    "inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm",
                  )}
                >
                  All {guideCount} career paths
                </Link>
              </div>
              <ul className="mt-6 grid grid-cols-1 gap-x-8 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {others.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/career-path/${r.slug}`}
                      className="flex min-h-11 items-center gap-2.5 border-b border-[#E0D8CC] py-2.5 text-[15px] transition-colors duration-150 hover:text-[#065F46]"
                    >
                      <HueSwatch hue={r.hue} className="rounded-full" />
                      {sentenceCase(r.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>
      </article>
    </>
  );
}
