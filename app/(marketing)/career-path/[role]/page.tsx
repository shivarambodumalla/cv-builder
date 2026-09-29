import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Briefcase, Clock, FileCheck, MessageSquare, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/shared/structured-data";
import { CareerPathTool } from "@/components/career-path/career-path-tool";
import { formatOpenJobs, formatSalary } from "@/components/career-path/format";
import {
  careerPathPageSlugs,
  hasCareerPathPage,
  roleLabel,
} from "@/lib/roles/career-moves/pages";
import { careerPathDescription, careerPathTitle } from "@/components/career-path/role-page/role-page-meta";
import { getRoleMarket } from "@/lib/career-path/market";
import { MOVE_TYPE_LABELS, type MoveType, type RoleMarket } from "@/lib/career-path/types";
import { getCareerPath, type CareerMove } from "@/lib/roles/career-moves";
import { getRoleContent } from "@/lib/roles/role-content";

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

function hasSalary(m: RoleMarket): m is RoleMarket & { salaryLow: number; salaryHigh: number } {
  return m.salaryLow !== null && m.salaryHigh !== null;
}

function moveHref(move: CareerMove): string | null {
  if (!move.toSlug) return null;
  if (hasCareerPathPage(move.toSlug)) return `/career-path/${move.toSlug}`;
  if (roleLabel(move.toSlug)) return `/jobs/${move.toSlug}`;
  return null;
}

const MOVE_BADGE: Record<MoveType, "default" | "secondary" | "outline"> = {
  step_up: "default",
  lateral: "secondary",
  pivot: "outline",
};

/** Up to `count` other career path pages, starting after this one, so every page gets linked evenly. */
function otherPaths(slug: string, count: number): { slug: string; label: string }[] {
  const all = careerPathPageSlugs();
  const start = all.indexOf(slug) + 1;
  return [...all.slice(start), ...all.slice(0, Math.max(0, start - 1))]
    .slice(0, count)
    .map((s) => ({ slug: s, label: roleLabel(s) ?? s }));
}

function MarketStrip({ label, market }: { label: string; market: RoleMarket }) {
  const updated = new Date(market.fetchedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label} hiring right now
      </p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-2xl font-bold tabular-nums">{market.openJobs.toLocaleString("en-US")}</p>
          <p className="text-sm text-muted-foreground">open US jobs</p>
        </div>
        <div>
          {hasSalary(market) ? (
            <>
              <p className="text-2xl font-bold tabular-nums">
                {money(market.salaryLow, market.currency)} to {money(market.salaryHigh, market.currency)}
              </p>
              <p className="text-sm text-muted-foreground">
                advertised salary
                {market.salaryMedian !== null && <>, median {money(market.salaryMedian, market.currency)}</>}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Too few current listings state a salary to show a reliable range.
            </p>
          )}
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Live listing data from US job boards, refreshed daily (last updated {updated}).
        {hasSalary(market) && <> Salary range from {market.sampleSize.toLocaleString("en-US")} listings that state pay.</>}
      </p>
    </div>
  );
}

/** Compact line under a destination role, formatted like the tool's results. */
function DestinationMarket({ market }: { market: RoleMarket }) {
  const salary = formatSalary(market);
  return (
    <p className="text-xs text-muted-foreground">
      {formatOpenJobs(market)} in the US{salary && <> · {salary}</>}
    </p>
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

  const others = otherPaths(slug, 12);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE },
          { name: "Career Path", url: `${SITE}/career-path` },
          { name: label, url: `${SITE}/career-path/${slug}` },
        ]}
      />
      <FaqJsonLd items={path.faqs.map((f) => ({ question: f.question, answer: f.answer }))} />

      <div className="container mx-auto px-4 py-16 md:py-20">
        {/* Hero */}
        <div className="mx-auto max-w-3xl mb-10">
          <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
            <Link href="/career-path" className="hover:text-foreground">
              Career Path
            </Link>
          </p>
          <h1 className="text-3xl font-bold tracking-tight mt-2 sm:text-4xl">{label} Career Path</h1>
          <p className="text-muted-foreground mt-4 leading-relaxed">{path.overview}</p>
          <Button className="mt-6 h-11" asChild>
            <a href="#find-your-path">Find my next move</a>
          </Button>
        </div>

        {/* Live market for this role */}
        {market && (
          <section className="mx-auto max-w-3xl mb-14">
            <MarketStrip label={label} market={market} />
          </section>
        )}

        {/* Seniority ladder */}
        <section className="mx-auto max-w-3xl mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-2">How {label}s progress</h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            What each level is expected to own. Most people move up this ladder before, or instead of, changing roles.
          </p>
          <ol>
            {content.seniority.map((step, i) => {
              const last = i === content.seniority.length - 1;
              return (
                <li key={step.level} className="relative flex gap-4 pb-6 last:pb-0">
                  {!last && <span aria-hidden className="absolute left-4 top-9 bottom-0 w-px bg-border" />}
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div className="flex-1 rounded-xl border bg-card p-4">
                    <p className="text-sm font-semibold">{step.level}</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{step.expectation}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Next moves */}
        <section className="mx-auto max-w-3xl mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Where {label}s go next</h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            The moves people most often make from this role, what each one asks of you, and what to have on your
            resume before you apply.
          </p>
          <div className="space-y-4">
            {path.moves.map((move, i) => {
              const href = moveHref(move);
              const moveMarket = moveMarkets[i];
              return (
                <article key={move.toRole} className="rounded-xl border bg-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-base font-semibold">
                      {href ? (
                        <Link href={href} className="underline-offset-4 hover:underline">
                          {move.toRole}
                        </Link>
                      ) : (
                        move.toRole
                      )}
                    </h3>
                    <Badge variant={MOVE_BADGE[move.moveType]}>{MOVE_TYPE_LABELS[move.moveType]}</Badge>
                  </div>
                  {moveMarket && (
                    <div className="mt-1">
                      <DestinationMarket market={moveMarket} />
                    </div>
                  )}
                  <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                    <span>{move.typicalTiming}</span>
                  </p>
                  <p className="mt-3 text-sm leading-relaxed">{move.why}</p>
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Skills to add</p>
                    <div className="flex flex-wrap gap-1.5">
                      {move.skillsToAdd.map((s) => (
                        <span key={s} className="rounded-full border bg-background px-2.5 py-1 text-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="mt-4 flex items-start gap-2 rounded-lg bg-muted p-3 text-sm leading-relaxed">
                    <FileCheck className="h-4 w-4 shrink-0 mt-0.5 text-primary" aria-hidden />
                    <span>
                      <span className="font-semibold">Proof to show: </span>
                      {move.proof}
                    </span>
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* The tool, pre-filled with this role */}
        <section id="find-your-path" className="mx-auto max-w-3xl mb-14 scroll-mt-24">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Find your own next move</h2>
          <p className="text-sm text-muted-foreground mb-6">Get moves based on your own resume.</p>
          <Suspense fallback={null}>
            <CareerPathTool initialRole={label} />
          </Suspense>
        </section>

        {/* Related pages. Every career path page has role content, so its resume
            example and interview prep pages are indexable too. */}
        <section className="mx-auto max-w-3xl mb-14">
          <h2 className="text-lg font-bold tracking-tight mb-4">More for {label}s</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { href: `/resume-examples/${slug}`, icon: FileText, text: `${label} resume examples` },
              { href: `/interview-prep/${slug}`, icon: MessageSquare, text: `${label} interview questions` },
              { href: `/jobs/${slug}`, icon: Briefcase, text: `${label} jobs` },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex min-h-11 items-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm font-medium hover:bg-accent transition-colors"
              >
                <l.icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                {l.text}
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ, the visible mirror of the JSON-LD */}
        <section className="mx-auto max-w-3xl mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-6">{label} career questions</h2>
          <div className="space-y-4">
            {path.faqs.map((f) => (
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

        {/* Other career paths: internal links between real pages only */}
        {others.length > 0 && (
          <section className="mx-auto max-w-3xl">
            <h2 className="text-sm font-semibold mb-3">Other career paths</h2>
            <div className="flex flex-wrap gap-2">
              {others.map((r) => (
                <Link
                  key={r.slug}
                  href={`/career-path/${r.slug}`}
                  className="inline-flex min-h-11 items-center rounded-full border bg-card px-3 py-1.5 text-xs hover:bg-accent transition-colors sm:min-h-0"
                >
                  {r.label}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
