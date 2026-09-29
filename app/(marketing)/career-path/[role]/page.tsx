import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/shared/structured-data";
import { CareerPathTool } from "@/components/career-path/career-path-tool";
import { formatJobCount, formatSalaryRange } from "@/components/career-path/format";
import {
  careerPathPageSlugs,
  hasCareerPathPage,
  roleLabel,
} from "@/lib/roles/career-moves/pages";
import { careerPathDescription, careerPathTitle } from "@/components/career-path/role-page/role-page-meta";
import {
  moveAnchor,
  plural,
  roleNoun,
  sentenceCase,
  shortAnswer,
  timingShort,
} from "@/components/career-path/role-page/role-page-copy";
import { getRoleMarket } from "@/lib/career-path/market";
import { MOVE_TYPE_LABELS, type MoveType, type RoleMarket } from "@/lib/career-path/types";
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
      images: [{ url: `${SITE}/og-image.png`, width: 1200, height: 630, alt: `${role.label} career path on CVEdge` }],
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
  if (hasCareerPathPage(move.toSlug)) return { href: `/career-path/${move.toSlug}`, text: `See the ${name} career path` };
  if (roleLabel(move.toSlug)) return { href: `/jobs/${move.toSlug}`, text: `Browse ${name} jobs` };
  return null;
}

/** Up to `count` other career path pages, starting after this one, so every page gets linked evenly. */
function otherPaths(slug: string, count: number): { slug: string; label: string }[] {
  const all = careerPathPageSlugs();
  const start = all.indexOf(slug) + 1;
  return [...all.slice(start), ...all.slice(0, Math.max(0, start - 1))]
    .slice(0, count)
    .map((s) => ({ slug: s, label: roleLabel(s) ?? s }));
}

// Small uppercase mono label used for data headings throughout the report.
const LABEL = "font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground";
const LINK = "font-medium text-primary underline underline-offset-4 transition-colors duration-150 hover:text-foreground";

// Step up is teal, sideways is navy, career change is an outline.
const MARKER: Record<MoveType, string> = {
  step_up: "bg-primary",
  lateral: "bg-[#1E3A5F]",
  pivot: "border border-foreground",
};

function MoveTypeLabel({ moveType }: { moveType: MoveType }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span aria-hidden className={cn("h-2 w-2 shrink-0", MARKER[moveType])} />
      {MOVE_TYPE_LABELS[moveType]}
    </span>
  );
}

/** Big numbers for the role itself. Missing values are said out loud, never shown as zero. */
function KeyNumbers({ label, market }: { label: string; market: RoleMarket | null }) {
  const jobs = market && formatJobCount(market);
  const hasPay = market !== null && market.salaryLow !== null && market.salaryHigh !== null;
  return (
    <section aria-labelledby="numbers-heading" className="border-t-2 border-foreground pt-4">
      <h2 id="numbers-heading" className={LABEL}>
        {sentenceCase(label)} jobs in the US
      </h2>
      {market && (jobs || hasPay) ? (
        <>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5">
            <div className="col-span-2">
              <dt className={LABEL}>Advertised pay</dt>
              <dd className="mt-1 text-4xl font-bold tabular-nums tracking-tight">
                {hasPay ? (
                  `${money(market.salaryLow!, market.currency)}-${money(market.salaryHigh!, market.currency)}`
                ) : (
                  <span className="text-base font-normal text-muted-foreground">Too few listings state pay</span>
                )}
              </dd>
            </div>
            <div>
              <dt className={LABEL}>Open jobs</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">
                {jobs ?? <span className="text-base font-normal text-muted-foreground">Not counted</span>}
              </dd>
            </div>
            {hasPay && market.salaryMedian !== null && (
              <div>
                <dt className={LABEL}>Median</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums">{money(market.salaryMedian, market.currency)}</dd>
              </div>
            )}
          </dl>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Jobs are counted by title on US job boards.
            {hasPay && (
              <>
                {" "}
                Pay is the middle half of the {market.sampleSize.toLocaleString("en-US")} listings that state a
                salary.
              </>
            )}
          </p>
        </>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          We couldn&apos;t load live job numbers. The listing feed may be busy. Check back tomorrow.
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
    "px-3 py-3 align-top sm:first:pl-0 max-sm:flex max-sm:justify-between max-sm:gap-4 max-sm:px-0 max-sm:py-1 max-sm:text-right max-sm:before:content-[attr(data-label)] max-sm:before:text-left max-sm:before:font-mono max-sm:before:text-[11px] max-sm:before:uppercase max-sm:before:tracking-[0.08em] max-sm:before:text-muted-foreground";
  const empty = <span className="text-muted-foreground">No data</span>;
  return (
    <>
      <table className="w-full border-collapse text-left text-[15px] max-sm:block">
        <caption className="sr-only">
          Next moves from {roleNoun(label)}, with open US jobs and advertised pay for each
        </caption>
        <thead className="max-sm:sr-only">
          <tr className="border-b-2 border-foreground">
            {["Move to", "Type", "Usually when", "Open US jobs", "Advertised pay"].map((h, i) => (
              <th
                key={h}
                scope="col"
                className={cn(LABEL, "whitespace-nowrap px-3 pb-2 font-medium first:pl-0", i >= 3 && "text-right")}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="max-sm:block">
          {moves.map((move, i) => {
            const market = markets[i];
            const page = move.toSlug && hasCareerPathPage(move.toSlug) ? `/career-path/${move.toSlug}` : null;
            return (
              <tr key={move.toRole} className="border-b max-sm:block max-sm:py-3">
                <th scope="row" className="py-3 pr-3 align-top font-semibold max-sm:block max-sm:pb-1">
                  <a href={`#${moveAnchor(move)}`} className="underline-offset-4 transition-colors duration-150 hover:text-primary hover:underline">
                    {sentenceCase(move.toRole)}
                  </a>
                  {page && (
                    <Link href={page} className={cn(LINK, "mt-1 flex w-fit items-center text-xs font-normal max-sm:min-h-11 max-sm:mt-0")}>
                      Its career path
                      <span className="sr-only">: {roleNoun(move.toRole)}</span>
                    </Link>
                  )}
                </th>
                <td data-label="Type" className={cell}>
                  <MoveTypeLabel moveType={move.moveType} />
                </td>
                <td data-label="Usually when" className={cn(cell, "text-muted-foreground sm:min-w-[11rem]")}>
                  {timingShort(move)}
                </td>
                <td data-label="Open US jobs" className={cn(cell, "font-mono tabular-nums sm:text-right")}>
                  {(market && formatJobCount(market)) ?? empty}
                </td>
                <td data-label="Advertised pay" className={cn(cell, "whitespace-nowrap font-mono tabular-nums sm:text-right sm:pr-0")}>
                  {(market && formatSalaryRange(market)) ?? empty}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
        Job counts and pay from US listings, {updated}. Pay shows only where at least five listings state it.
      </p>
    </>
  );
}

function MoveSection({ move, market }: { move: CareerMove; market: RoleMarket | null }) {
  const link = moveLink(move);
  const jobs = market && formatJobCount(market);
  const pay = market && formatSalaryRange(market);
  return (
    <article id={moveAnchor(move)} className="scroll-mt-24 border-t py-10 first:border-t-0 first:pt-2">
      <h3 className="text-2xl font-bold tracking-tight">{sentenceCase(move.toRole)}</h3>
      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
        <MoveTypeLabel moveType={move.moveType} />
        {jobs && <span>{jobs} open US jobs</span>}
        {pay && <span>{pay} advertised</span>}
      </p>
      <p className="mt-5 max-w-[65ch] text-base leading-relaxed">{move.why}</p>
      <dl className="mt-6 grid max-w-[65ch] gap-x-6 gap-y-5 sm:grid-cols-[9.5rem_1fr]">
        <dt className={cn(LABEL, "sm:pt-1")}>Usually when</dt>
        <dd className="text-[15px] leading-relaxed">{move.typicalTiming}</dd>
        <dt className={cn(LABEL, "sm:pt-1")}>Skills to add</dt>
        <dd>
          <ul className="list-disc space-y-1 pl-5 text-[15px] leading-relaxed marker:text-muted-foreground">
            {move.skillsToAdd.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </dd>
        <dt className={cn(LABEL, "sm:pt-1")}>Have this on your resume first</dt>
        <dd className="text-[15px] leading-relaxed">{move.proof}</dd>
      </dl>
      {link && (
        <p className="mt-6 text-sm">
          <Link href={link.href} className={cn(LINK, "inline-flex min-h-11 items-center gap-1 sm:min-h-0")}>
            {link.text}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </p>
      )}
    </article>
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
      <FaqJsonLd items={path.faqs.map((f) => ({ question: f.question, answer: f.answer }))} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />

      <article className="mx-auto w-full max-w-[1120px] px-4 pb-20 pt-10 sm:px-6 md:pt-14">
        {/* Masthead: the report's title, standfirst and short answer, with the role's numbers alongside */}
        <header className="grid gap-x-16 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <nav aria-label="Breadcrumb" className="font-mono text-xs text-muted-foreground">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/career-path" className="transition-colors duration-150 hover:text-primary">
                    Career paths
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li aria-current="page" className="text-foreground">
                  {sentenceCase(label)}
                </li>
              </ol>
            </nav>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">{sentenceCase(label)} career path</h1>
            <p className="mt-6 max-w-[65ch] text-lg leading-relaxed">{path.overview}</p>
            <p className="mt-6 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
              <span>
                Updated <time dateTime={updatedIso.slice(0, 10)}>{updated}</time>
              </span>
              <span aria-hidden>·</span>
              <span>Pay and job counts from live US job listings</span>
            </p>

            {answer.length > 0 && (
              <section aria-labelledby="short-answer" className="mt-12">
                <h2 id="short-answer" className="text-xl font-bold tracking-tight">
                  What comes after {name}?
                </h2>
                <p className="mt-3 max-w-[65ch] border-l-2 border-primary pl-5 text-base leading-relaxed">
                  {answer.join(" ")}
                </p>
              </section>
            )}
            <p className="mt-8">
              <a href="#find-your-path" className={cn(LINK, "inline-flex min-h-11 items-center gap-1.5 text-sm sm:min-h-0")}>
                Check your own resume
                <ArrowDown className="h-3.5 w-3.5" aria-hidden />
              </a>
            </p>
          </div>
          <div className="lg:col-span-4 lg:pt-[4.5rem]">
            <KeyNumbers label={label} market={market} />
          </div>
        </header>

        {/* The moves at a glance */}
        <section aria-labelledby="moves-heading" className="mt-16 border-t pt-10">
          <div className="grid gap-x-16 gap-y-3 lg:grid-cols-12">
            <h2 id="moves-heading" className="text-3xl font-bold tracking-tight lg:col-span-4">
              Where {people} go next
            </h2>
            <p className="max-w-[65ch] leading-relaxed text-muted-foreground lg:col-span-8">
              {path.moves.length} moves people make from this role. The job counts and pay are for each destination
              role, so you can see what the market wants right now.
            </p>
          </div>
          <div className="mt-8">
            <MovesTable label={label} moves={path.moves} markets={moveMarkets} updated={updated} />
          </div>
        </section>

        {/* Move-by-move detail, with the in-role ladder alongside */}
        <div className="mt-16 grid gap-x-16 gap-y-12 border-t pt-10 lg:grid-cols-12">
          <aside aria-labelledby="ladder-heading" className="lg:order-last lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <h2 id="ladder-heading" className="text-xl font-bold tracking-tight">
                The {name} ladder
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                What each level is expected to own. Many people climb this before they change roles.
              </p>
              <ol className="mt-5 border-t-2 border-foreground">
                {content.seniority.map((step, i) => (
                  <li key={step.level} className="grid grid-cols-[2rem_1fr] gap-x-2 border-b py-4">
                    <span className="font-mono text-xs tabular-nums text-muted-foreground pt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-semibold">{step.level}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.expectation}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <section aria-labelledby="detail-heading" className="lg:col-span-8">
            <h2 id="detail-heading" className="text-3xl font-bold tracking-tight">
              What each move takes
            </h2>
            <p className="mt-3 max-w-[65ch] leading-relaxed text-muted-foreground">
              Why each move fits, the skills hiring managers look for, and the proof to have on your resume before you
              apply.
            </p>
            <div className="mt-8">
              {path.moves.map((move, i) => (
                <MoveSection key={move.toRole} move={move} market={moveMarkets[i]} />
              ))}
            </div>
          </section>
        </div>

        {/* The tool, pre-filled with this role */}
        <section
          id="find-your-path"
          aria-labelledby="tool-heading"
          className="mt-6 grid scroll-mt-24 gap-x-16 gap-y-6 border-t pt-10 lg:grid-cols-12"
        >
          <div className="lg:col-span-4">
            <h2 id="tool-heading" className="text-3xl font-bold tracking-tight">
              Now check your own resume
            </h2>
            <p className="mt-3 leading-relaxed">
              Your own resume will give you a sharper answer than this page. Your years, tools and wins change which
              move fits.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The suggested roles and fit scores come from AI. The job counts and pay come from live listings.
            </p>
          </div>
          <div className="lg:col-span-8">
            <Suspense fallback={null}>
              <CareerPathTool initialRole={label} />
            </Suspense>
          </div>
        </section>

        {/* FAQ, the visible mirror of the JSON-LD */}
        <section aria-labelledby="faq-heading" className="mt-16 grid gap-x-16 gap-y-6 border-t pt-10 lg:grid-cols-12">
          <h2 id="faq-heading" className="text-3xl font-bold tracking-tight lg:col-span-4">
            Questions {people} ask
          </h2>
          <div className="lg:col-span-8">
            {path.faqs.map((f) => (
              <div key={f.question} className="border-b py-6 first:pt-0">
                <h3 className="text-lg font-semibold tracking-tight">{f.question}</h3>
                <p className="mt-2 max-w-[65ch] leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related pages. Every career path page has role content, so its resume
            example and interview prep pages are indexable too. Other career paths:
            internal links between real pages only. */}
        <nav aria-label="Related pages" className="mt-16 grid gap-x-16 gap-y-10 border-t pt-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className={LABEL}>More for {people}</h2>
            <ul className="mt-3 space-y-1">
              {[
                { href: `/resume-examples/${slug}`, text: `${sentenceCase(label)} resume examples` },
                { href: `/interview-prep/${slug}`, text: `${sentenceCase(label)} interview questions` },
                { href: `/jobs/${slug}`, text: `Open ${name} jobs` },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={cn(LINK, "inline-flex min-h-11 items-center sm:min-h-8")}>
                    {l.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {others.length > 0 && (
            <div className="lg:col-span-8">
              <h2 className={LABEL}>Other career paths</h2>
              <ul className="mt-3 columns-2 gap-x-8 sm:columns-3">
                {others.map((r) => (
                  <li key={r.slug} className="break-inside-avoid">
                    <Link
                      href={`/career-path/${r.slug}`}
                      className="inline-flex min-h-11 items-center text-[15px] underline-offset-4 transition-colors duration-150 hover:text-primary hover:underline sm:min-h-8"
                    >
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
