import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ChevronDown, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { alertAdmin } from "@/lib/email/alert";
import { CareerPathNotFoundError, claimCareerPath, getCareerPathRecord } from "@/lib/career-path/server";
import type { CareerPathOption, ClaimResult } from "@/lib/career-path/types";
import { planPath } from "@/components/career-path/format";
import { MarketLine } from "@/components/career-path/market-line";
import {
  CP_BUTTON,
  CP_CARD,
  CP_EYEBROW,
  FitBar,
  FitNumber,
  MarketStats,
  MoveTypeEyebrow,
  SkillChips,
} from "@/components/career-path/path-meta";
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
    <div className="container mx-auto max-w-4xl px-4 py-10 md:py-14">
      <CareerPathEventOnMount event="plan_viewed" />

      <Link
        href="/career-path"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-[#5F5852] transition-colors duration-150 hover:text-[#065F46] sm:min-h-0"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to the career path generator
      </Link>

      {/* Selected role */}
      <header className="mt-8 flex flex-col gap-3">
        <p className={CP_EYEBROW}>Your 90-day plan · From {record.currentRole}</p>
        <h1 className="font-cp-display text-[40px] font-normal leading-[1.05] tracking-[-0.01em] sm:text-[52px]">
          {selected.title}
        </h1>
      </header>

      <section aria-label={`About ${selected.title}`} className={`${CP_CARD} mt-6 flex flex-col gap-[18px] p-5 md:p-7`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <MoveTypeEyebrow moveType={selected.moveType} />
            <p className="max-w-prose text-[15px] leading-[1.55] text-[#4A443E]">{selected.why}</p>
          </div>
          <FitNumber fit={selected.fit} />
        </div>
        <FitBar fit={selected.fit} />
        {selected.transferableSkills.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#5F5852]">You already have</p>
            <SkillChips skills={selected.transferableSkills} label="Skills you already have" />
          </div>
        )}
        {selected.market && <MarketStats market={selected.market} />}
      </section>

      <div className="mt-12">
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
          <h2 id="cp-other-roles" className="font-cp-display text-[30px] font-normal leading-[1.1] sm:text-4xl">
            Your other roles
          </h2>
          <p className="mt-1.5 text-[15px] text-[#5F5852]">Open one to see its plan, or make it your target.</p>
          <div className="mt-5 flex flex-col gap-3.5">
            {others.map((path) => (
              <details key={path.title} className={`group ${CP_CARD}`}>
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 p-5 md:px-7 [&::-webkit-details-marker]:hidden">
                  <div className="flex min-w-0 flex-col gap-1">
                    <MoveTypeEyebrow moveType={path.moveType} />
                    <h3 className="text-[21px] font-semibold leading-[1.2] tracking-[-0.01em]">{path.title}</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <FitNumber fit={path.fit} size="md" />
                    <ChevronDown
                      className="h-5 w-5 shrink-0 text-[#5F5852] transition-transform duration-150 group-open:rotate-180 motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </div>
                </summary>
                <div className="flex flex-col gap-8 border-t border-[#EDE8DF] px-5 pb-7 pt-5 md:px-7">
                  <p className="max-w-prose text-[15px] leading-[1.55] text-[#4A443E]">{path.why}</p>
                  {path.transferableSkills.length > 0 && (
                    <SkillChips skills={path.transferableSkills} label={`Skills you already have for ${path.title}`} />
                  )}
                  <MarketLine market={path.market} />
                  <RolePlan planId={id} path={path} heading="h4" />
                  <Link
                    href={planPath(id, path.title)}
                    aria-label={`Make ${path.title} my target role`}
                    className={`${CP_BUTTON.dark} self-start`}
                  >
                    Make this my target
                  </Link>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      <p className="mt-12 flex max-w-prose items-start gap-2 text-[13px] leading-relaxed text-[#78716C]">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Roles and plans are AI suggestions based on what you shared. Job counts and pay come from live job ads and change
        daily. Check them against real postings before you commit.
      </p>
    </div>
  );
}
