import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CareerPathOption } from "@/lib/career-path/types";
import { ALL_ROLES } from "@/lib/jobs/role-categories";
import { PlanChecklist } from "./plan-checklist";

const PRIORITY_LABELS: Record<1 | 2 | 3, string> = {
  1: "Learn first",
  2: "Next",
  3: "After that",
};

const ROLE_SLUG_BY_LABEL = new Map(ALL_ROLES.map((r) => [r.label.toLowerCase(), r.slug]));

/** The role's own jobs page when we have one, otherwise a keyword search. */
function jobsHref(title: string): string {
  const slug = ROLE_SLUG_BY_LABEL.get(title.trim().toLowerCase());
  return slug ? `/jobs/${slug}` : `/jobs?q=${encodeURIComponent(title)}`;
}

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
  const skills = [...path.skillsToBuild].sort((a, b) => a.priority - b.priority);
  const headingClass = H === "h2" ? "text-2xl font-bold tracking-tight" : "text-base font-semibold";
  const label = "font-mono text-[11px] uppercase tracking-wider text-muted-foreground";

  return (
    <div className="space-y-12">
      {skills.length > 0 && (
        <section>
          <H className={headingClass}>Skills to learn, in order</H>
          <ol className="mt-4 border-t">
            {skills.map((s, i) => (
              <li key={s.skill} className="grid grid-cols-[2rem_1fr] gap-x-3 border-b py-4">
                <span className="pt-0.5 font-mono text-sm text-muted-foreground" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-semibold">{s.skill}</span>
                    <span className={label}>{PRIORITY_LABELS[s.priority] ?? ""}</span>
                  </p>
                  <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">{s.why}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {path.plan90.length > 0 && (
        <section>
          <H className={headingClass}>Your 90-day plan</H>
          <p className="mt-1 text-sm text-muted-foreground">
            Tick things off as you go. We save your progress in this browser.
          </p>
          <ol className="mt-5 border-t">
            {path.plan90.map((phase, i) => (
              <li key={phase.label} className="grid gap-x-6 gap-y-2 border-b py-5 sm:grid-cols-[9rem_1fr]">
                <div>
                  <p className={label}>{phase.label}</p>
                  <p className="mt-1 font-semibold leading-snug">{phase.focus}</p>
                </div>
                <PlanChecklist storageKey={`cp-plan-${planId}-${path.title}-${i}`} actions={phase.actions} />
              </li>
            ))}
          </ol>
        </section>
      )}

      {path.proofProject && (
        <section>
          <H className={headingClass}>A project that proves you can do it</H>
          <p className="mt-4 max-w-prose border-l-2 border-primary pl-4 text-base leading-relaxed">
            {path.proofProject}
          </p>
        </section>
      )}

      {path.searchTitles.length > 0 && (
        <section>
          <H className={headingClass}>Job titles to search</H>
          <p className="mt-1 text-sm text-muted-foreground">
            Employers use different names for the same job. Search them all.
          </p>
          <ul className="mt-4 grid gap-x-6 border-t sm:grid-cols-2">
            {path.searchTitles.map((t) => (
              <li key={t} className="border-b">
                <Link
                  href={jobsHref(t)}
                  className="flex min-h-11 items-center justify-between gap-3 py-2 text-sm font-medium text-primary transition-colors duration-150 hover:text-foreground"
                >
                  <span>
                    {t}
                    <span className="sr-only"> jobs</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
