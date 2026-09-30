import Link from "next/link";
import type { CareerPathOption } from "@/lib/career-path/types";
import { ALL_ROLES } from "@/lib/jobs/role-categories";
import { cn } from "@/lib/utils";
import {
  CP_CARD,
  CP_TOP_EDGE,
  topEdgeStyle,
} from "@/components/career-path/path-meta";
import { HUE_CLASSES, type Hue } from "@/components/career-path/palette";
import { PlanChecklist } from "./plan-checklist";

const PRIORITY_LABELS: Record<1 | 2 | 3, string> = {
  1: "Learn first",
  2: "Next",
  3: "After that",
};

const ROLE_SLUG_BY_LABEL = new Map(
  ALL_ROLES.map((r) => [r.label.toLowerCase(), r.slug]),
);

/** The role's own jobs page when we have one, otherwise a keyword search. */
function jobsHref(title: string): string {
  const slug = ROLE_SLUG_BY_LABEL.get(title.trim().toLowerCase());
  return slug ? `/jobs/${slug}` : `/jobs?q=${encodeURIComponent(title)}`;
}

const LABEL =
  "text-[11px] font-bold uppercase tracking-[0.12em] text-[#065F46]";
/** The three phases take the palette's three hues in order. */
const PHASE_HUES: Hue[] = ["green", "navy", "amber"];

/**
 * The signed-in half of a career path: skills to build, the 90-day plan, the
 * proof project and job titles. `heading` sets the section heading level so the
 * same block sits under the page's h1 or inside a collapsed h3 role.
 */
export function RolePlan({
  planId,
  path,
  heading: H,
}: {
  planId: string;
  path: CareerPathOption;
  heading: "h2" | "h4";
}) {
  const skills = [...path.skillsToBuild].sort(
    (a, b) => a.priority - b.priority,
  );
  const top = H === "h2";
  const headingClass = top
    ? "font-cp-display text-[30px] font-normal leading-[1.1] sm:text-4xl"
    : "text-base font-semibold";
  const card = cn(CP_CARD, top ? "p-5 md:p-7" : "p-4 md:p-5");

  return (
    <div className={top ? "flex flex-col gap-12" : "flex flex-col gap-8"}>
      {skills.length > 0 && (
        <section>
          <H className={headingClass}>Skills to learn, in order</H>
          <ol className={cn(card, "mt-4 py-0 md:py-0")}>
            {skills.map((s, i) => (
              <li
                key={s.skill}
                className="grid grid-cols-[2.25rem_1fr] gap-x-3 border-b border-[#EDE8DF] py-4 last:border-b-0 md:py-5"
              >
                <span
                  className="font-cp-display tracking-[-0.02em] font-bold text-[26px] leading-none text-[#1E3A5F]"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-semibold">{s.skill}</span>
                    <span className={LABEL}>
                      {PRIORITY_LABELS[s.priority] ?? ""}
                    </span>
                  </p>
                  <p className="mt-1 max-w-prose text-sm leading-[1.55] text-[#4A443E]">
                    {s.why}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {path.plan90.length > 0 && (
        <section>
          <H className={headingClass}>Your 90-day plan</H>
          <p className="mt-1.5 text-sm text-[#5F5852]">
            Tick things off as you go. We save your progress in this browser.
          </p>
          <ol
            className={cn(
              "mt-4 grid gap-3.5",
              top && "md:grid-cols-3 md:gap-4",
            )}
          >
            {path.plan90.map((phase, i) => {
              const hue = PHASE_HUES[i % PHASE_HUES.length];
              return (
                <li
                  key={phase.label}
                  className={cn(card, CP_TOP_EDGE, "flex flex-col gap-3")}
                  style={topEdgeStyle(hue)}
                >
                  {/* Reserve two lines for the focus so the dividers and
                      checklists line up across the three cards. */}
                  <div className={top ? "md:min-h-[4.75rem]" : undefined}>
                    <p className={cn(LABEL, HUE_CLASSES[hue].text)}>
                      {phase.label}
                    </p>
                    <p className="mt-1.5 font-semibold leading-snug">
                      {phase.focus}
                    </p>
                  </div>
                  <div className="border-t border-[#EDE8DF] pt-3">
                    <PlanChecklist
                      storageKey={`cp-plan-${planId}-${path.title}-${i}`}
                      actions={phase.actions}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {path.proofProject && (
        <section>
          <H className={headingClass}>A project that proves you can do it</H>
          <p className="mt-4 max-w-prose rounded-2xl border border-[#EBD4A6] bg-[#FBF0DC] px-5 py-4 text-[15px] leading-[1.55] text-[#0C1A0E] md:px-[26px] md:py-[22px] md:text-base">
            {path.proofProject}
          </p>
        </section>
      )}

      {path.searchTitles.length > 0 && (
        <section>
          <H className={headingClass}>Job titles to search</H>
          <p className="mt-1.5 text-sm text-[#5F5852]">
            Employers use different names for the same job. Search them all.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {path.searchTitles.map((t) => (
              <li key={t}>
                <Link
                  href={jobsHref(t)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#E0D8CC] bg-white px-4 text-sm font-semibold text-[#065F46] transition-colors duration-150 hover:border-[#065F46] hover:text-[#044536]"
                >
                  <span>
                    {t}
                    <span className="sr-only"> jobs</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
