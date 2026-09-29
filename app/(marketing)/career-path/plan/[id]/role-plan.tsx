import Link from "next/link";
import { FlaskConical, Search } from "lucide-react";
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
  const headingClass = H === "h2" ? "text-xl font-bold tracking-tight" : "text-base font-semibold";

  return (
    <div className="space-y-10">
      {skills.length > 0 && (
        <section>
          <H className={headingClass}>Skills to build</H>
          <p className="mt-1 text-sm text-muted-foreground">In the order to learn them.</p>
          <ol className="mt-4 space-y-3">
            {skills.map((s, i) => (
              <li key={s.skill} className="flex gap-4 rounded-xl border bg-card p-4">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-baseline gap-x-2 text-sm font-semibold">
                    {s.skill}
                    <span className="text-xs font-medium text-muted-foreground">{PRIORITY_LABELS[s.priority] ?? ""}</span>
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.why}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {path.plan90.length > 0 && (
        <section>
          <H className={headingClass}>Your 90-day plan</H>
          <p className="mt-1 text-sm text-muted-foreground">Tick things off as you go. Progress is saved in this browser.</p>
          <ol className="mt-5 space-y-0">
            {path.plan90.map((phase, i) => (
              <li key={phase.label} className="relative pb-8 pl-8 last:pb-0">
                {i < path.plan90.length - 1 && (
                  <span className="absolute left-[11px] top-7 bottom-0 w-0.5 bg-border" aria-hidden="true" />
                )}
                <span
                  className="absolute left-0 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-background text-[11px] font-bold text-primary"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{phase.label}</p>
                <p className="mt-1 text-sm font-semibold">{phase.focus}</p>
                <div className="mt-2 rounded-xl border bg-card p-2">
                  <PlanChecklist
                    storageKey={`cp-plan-${planId}-${path.title}-${i}`}
                    actions={phase.actions}
                  />
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {path.proofProject && (
        <section>
          <H className={headingClass}>Proof project</H>
          <div className="mt-4 flex gap-4 rounded-xl border bg-card p-4">
            <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-sm leading-relaxed">{path.proofProject}</p>
          </div>
        </section>
      )}

      {path.searchTitles.length > 0 && (
        <section>
          <H className={headingClass}>Job titles to search</H>
          <p className="mt-1 text-sm text-muted-foreground">
            The same role goes by different names. Search all of them.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {path.searchTitles.map((t) => (
              <li key={t}>
                <Link
                  href={jobsHref(t)}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full border bg-card px-4 text-sm font-medium transition-colors hover:bg-accent sm:min-h-9"
                >
                  <Search className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  {t}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
