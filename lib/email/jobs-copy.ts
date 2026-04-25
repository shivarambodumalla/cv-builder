// Editable copy overrides for the React-rendered jobs emails (jobs_weekly,
// jobs_weekly_empty, welcome_jobs). Loaded from the jobs_email_copy table
// with a 5-minute cache; missing rows or missing keys fall back to defaults.
//
// All fields support {{variable}} substitution. Available variables:
//   {{firstName}}, {{jobCount}}, {{targetTitle}}, {{location}},
//   {{atsScore}}, {{logoText}}

import { createAdminClient } from "@/lib/supabase/admin";
import type { JobsTemplate } from "@/lib/email/system-templates";

export interface JobsEmailCopy {
  subject: string;
  heroHeading: string;
  heroSub: string;
  footerNote: string;
}

export interface JobsCopyVars {
  firstName: string;
  jobCount: number;
  targetTitle: string;
  location: string;
  atsScore: number | null;
  logoText: string;
}

// Defaults mirror the strings currently hardcoded in the React components.
// Override any field via the admin editor; leave blank to keep the default.
const DEFAULTS: Record<JobsTemplate, JobsEmailCopy> = {
  jobs_weekly: {
    subject: "{{jobCount}} new matches for {{targetTitle}}",
    heroHeading: "{{jobCount}} new matches for you this week",
    heroSub: "Roles like {{targetTitle}}",
    footerNote: "You're getting this weekly digest because you have a CV on {{logoText}}.",
  },
  jobs_weekly_empty: {
    subject: "No new matches this week — let's fix that",
    heroHeading: "No fresh matches this week",
    heroSub: "Here's what we'd tweak so next week looks different.",
    footerNote: "You're getting this because you opted into weekly job picks on {{logoText}}.",
  },
  welcome_jobs: {
    subject: "Your first {{logoText}} job picks are here",
    heroHeading: "Your first picks for {{targetTitle}}",
    heroSub: "Roles matched to your CV — sent fresh every Tue, Wed, Thu.",
    footerNote: "You're getting this because you signed up for weekly job picks on {{logoText}}.",
  },
};

let cache: { rows: Map<string, Partial<JobsEmailCopy>>; at: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function loadOverrides(): Promise<Map<string, Partial<JobsEmailCopy>>> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.rows;

  const admin = createAdminClient();
  const { data } = await admin
    .from("jobs_email_copy")
    .select("template_name, copy");

  const rows = new Map<string, Partial<JobsEmailCopy>>();
  for (const row of data ?? []) {
    rows.set(row.template_name, (row.copy ?? {}) as Partial<JobsEmailCopy>);
  }
  cache = { rows, at: Date.now() };
  return rows;
}

/** Force the next call to fetch — used after an admin save. */
export function invalidateJobsCopyCache(): void {
  cache = null;
}

function substitute(text: string, vars: JobsCopyVars): string {
  return text
    .replaceAll("{{firstName}}", vars.firstName)
    .replaceAll("{{jobCount}}", String(vars.jobCount))
    .replaceAll("{{targetTitle}}", vars.targetTitle || "your profile")
    .replaceAll("{{location}}", vars.location)
    .replaceAll("{{atsScore}}", vars.atsScore != null ? String(vars.atsScore) : "")
    .replaceAll("{{logoText}}", vars.logoText);
}

/**
 * Resolve the final copy for a jobs template:
 *   1. start with defaults
 *   2. layer non-empty overrides from the DB
 *   3. substitute {{vars}}
 * Pure function once `vars` are gathered — safe to call inside renderers.
 */
export async function resolveJobsCopy(
  template: JobsTemplate,
  vars: JobsCopyVars
): Promise<JobsEmailCopy> {
  const overrides = await loadOverrides();
  const override = overrides.get(template) ?? {};
  const defaults = DEFAULTS[template];

  const merged: JobsEmailCopy = {
    subject: override.subject?.trim() || defaults.subject,
    heroHeading: override.heroHeading?.trim() || defaults.heroHeading,
    heroSub: override.heroSub?.trim() || defaults.heroSub,
    footerNote: override.footerNote?.trim() || defaults.footerNote,
  };

  return {
    subject: substitute(merged.subject, vars),
    heroHeading: substitute(merged.heroHeading, vars),
    heroSub: substitute(merged.heroSub, vars),
    footerNote: substitute(merged.footerNote, vars),
  };
}

/** Returns the raw, unsubstituted overrides plus defaults — used by the admin editor. */
export async function getJobsCopyForAdmin(): Promise<
  Record<JobsTemplate, { override: Partial<JobsEmailCopy>; defaults: JobsEmailCopy }>
> {
  const overrides = await loadOverrides();
  const result = {} as Record<JobsTemplate, { override: Partial<JobsEmailCopy>; defaults: JobsEmailCopy }>;
  for (const template of Object.keys(DEFAULTS) as JobsTemplate[]) {
    result[template] = {
      override: overrides.get(template) ?? {},
      defaults: DEFAULTS[template],
    };
  }
  return result;
}
