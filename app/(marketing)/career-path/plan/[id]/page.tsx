import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { alertAdmin } from "@/lib/email/alert";
import { CareerPathNotFoundError, claimCareerPath, getCareerPathRecord } from "@/lib/career-path/server";
import type { CareerPathOption, ClaimResult } from "@/lib/career-path/types";
import { planPath } from "@/components/career-path/format";
import { MarketLine } from "@/components/career-path/market-line";
import { FitMeter, MoveTypeBadge, SkillChips } from "@/components/career-path/path-meta";
import { CareerPathEventOnMount } from "@/components/career-path/track";
import { RolePlan } from "./role-plan";
import { TailorCta, type TailorCvOption } from "./tailor-cta";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Career Plan",
  robots: { index: false, follow: false },
};

function findPath(paths: CareerPathOption[], title: string | null | undefined): CareerPathOption | undefined {
  const wanted = title?.trim().toLowerCase();
  if (!wanted) return undefined;
  return paths.find((p) => p.title.toLowerCase() === wanted);
}

export default async function CareerPlanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ role?: string | string[] }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const roleParam = (Array.isArray(query.role) ? query.role[0] : query.role)?.trim() || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const here = roleParam ? planPath(id, roleParam) : `/career-path/plan/${id}`;
    redirect(`/login?returnUrl=${encodeURIComponent(here)}`);
  }

  const record = await getCareerPathRecord(id);
  if (!record || (record.userId && record.userId !== user.id)) notFound();

  const paths = record.result.paths;
  const selected = findPath(paths, roleParam) ?? findPath(paths, record.selectedRole) ?? paths[0];
  if (!selected) notFound();

  let claim: ClaimResult | null = null;
  if (!record.userId || record.selectedRole !== selected.title) {
    try {
      claim = await claimCareerPath(id, user.id, selected.title);
    } catch (err) {
      // Claimed by someone else between our read and the claim.
      if (err instanceof CareerPathNotFoundError) notFound();
      console.error("[career-path/plan] claim failed:", err);
      alertAdmin("Career path claim", (err as Error).message, { careerPathId: id, userId: user.id });
    }
  }

  const { data: cvRows, error: cvError } = await supabase
    .from("cvs")
    .select("id, title, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });
  if (cvError) console.error("[career-path/plan] cvs lookup failed:", cvError.message);

  const cvs: TailorCvOption[] = (cvRows ?? []).map((cv) => ({
    id: cv.id as string,
    title: (cv.title as string | null) ?? null,
    updatedAt: (cv.updated_at as string | null) ?? null,
  }));

  // Without a fresh claim, the flow's resume counts only if it is now in the user's account.
  const flowCvOwned = !!record.cvId && cvs.some((cv) => cv.id === record.cvId);
  const cvId = claim?.cvId ?? (flowCvOwned ? record.cvId : null);
  const cvLimitReached = claim?.cvLimitReached ?? (record.source === "resume" && !!record.cvId && !flowCvOwned);

  const others = paths.filter((p) => p !== selected);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 md:py-14">
      <CareerPathEventOnMount event="plan_viewed" />

      <Link
        href="/career-path"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground sm:min-h-0"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Career path generator
      </Link>

      {/* Selected role */}
      <header className="mt-6 rounded-2xl border bg-card p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Your 90-day plan</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{selected.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">From {record.currentRole}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <MoveTypeBadge moveType={selected.moveType} />
          <FitMeter fit={selected.fit} />
        </div>
        <p className="mt-4 text-sm leading-relaxed">{selected.why}</p>
        {selected.transferableSkills.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Skills you already have</p>
            <SkillChips skills={selected.transferableSkills} label="Skills you already have" />
          </div>
        )}
        {selected.market && (
          <div className="mt-4">
            <MarketLine market={selected.market} />
          </div>
        )}
      </header>

      <div className="mt-10">
        <RolePlan planId={id} path={selected} heading="h2" />
      </div>

      <div className="mt-12">
        <TailorCta
          key={selected.title}
          careerPathId={id}
          role={selected.title}
          cvId={cvId}
          cvs={cvs}
          cvLimitReached={cvLimitReached}
        />
      </div>

      {others.length > 0 && (
        <section className="mt-14" aria-labelledby="cp-other-roles">
          <h2 id="cp-other-roles" className="text-xl font-bold tracking-tight">
            Your other options
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Open a role to see its plan, or make it your target instead.
          </p>
          <div className="mt-5 space-y-3">
            {others.map((path) => (
              <details key={path.title} className="group rounded-2xl border bg-card">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 p-5 [&::-webkit-details-marker]:hidden">
                  <div className="min-w-0 space-y-2">
                    <h3 className="text-base font-semibold leading-snug">{path.title}</h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <MoveTypeBadge moveType={path.moveType} />
                      <FitMeter fit={path.fit} />
                    </div>
                  </div>
                  <ChevronDown
                    className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <div className="space-y-6 border-t px-5 pt-5 pb-6">
                  <p className="text-sm leading-relaxed">{path.why}</p>
                  {path.transferableSkills.length > 0 && (
                    <SkillChips skills={path.transferableSkills} label={`Skills you already have for ${path.title}`} />
                  )}
                  <MarketLine market={path.market} />
                  <RolePlan planId={id} path={path} heading="h4" />
                  <Link
                    href={planPath(id, path.title)}
                    className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Make {path.title} my target role
                  </Link>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      <p className="mt-12 text-center text-xs leading-relaxed text-muted-foreground">
        Role suggestions and plans are AI-generated from what you shared. Job counts and salaries come from live listings
        and change daily. Check them against real postings and your own judgment.
      </p>
    </div>
  );
}
