import { Resend } from "resend";
import { render } from "@react-email/render";
import { createAdminClient } from "@/lib/supabase/admin";
import { matchJobsForCV, getMatchLabel, type ScoredJob, type MatchDiagnostics } from "@/lib/jobs/matcher";
import { WeeklyJobsEmail, type WeeklyJobItem, type ProviderCount } from "@/components/emails/weekly-jobs-email";
import { WeeklyJobsEmptyEmail } from "@/components/emails/weekly-jobs-empty-email";
import { canSendTo, recordSentJobs, getRecentlySentJobIds } from "@/lib/email/can-send";
import { makeUnsubscribeToken } from "@/lib/email/unsubscribe-token";
import { getAdjacentRoles, getRotatingTip, getAtsMessage } from "@/lib/email/jobs-email-helpers";
import { resolveJobsCopy } from "@/lib/email/jobs-copy";
import type { ResumeContent } from "@/lib/resume/types";

let _resend: Resend | null = null;
function resendClient(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.thecvedge.com";
const FROM_EMAIL = "hello@thecvedge.com";
const SUPPORT_EMAIL = "hello@thecvedge.com";

// Template-name constants — also used as dedup keys in email_logs + email_sent_jobs
export const TEMPLATE_JOBS_WEEKLY = "jobs_weekly";
export const TEMPLATE_JOBS_WEEKLY_EMPTY = "jobs_weekly_empty";
export const TEMPLATE_WELCOME_JOBS = "welcome_jobs";

type TemplateName = typeof TEMPLATE_JOBS_WEEKLY | typeof TEMPLATE_JOBS_WEEKLY_EMPTY | typeof TEMPLATE_WELCOME_JOBS;

function postedAgo(iso: string): string {
  if (!iso) return "recently";
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (isNaN(diffDays) || diffDays < 0) return "recently";
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  const weeks = Math.floor(diffDays / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`);
  if (min && max && min !== max) return `${fmt(min)}–${fmt(max)}`;
  return fmt(min || max || 0);
}

function trackClickUrl(jobId: string, redirect: string, provider: string): string {
  const params = new URLSearchParams({ job_id: jobId, src: "email_weekly", redirect });
  if (provider) params.set("provider", provider);
  return `${APP_URL}/api/jobs/track-click?${params.toString()}`;
}

// Counts per provider, sorted by descending count then provider name.
// Used in the email's "Sourced from …" line so users see we shopped multiple
// boards (and analytics can attribute opens/clicks back to the source).
function buildProviderBreakdown(jobs: ScoredJob[]): ProviderCount[] {
  const counts = new Map<string, number>();
  for (const j of jobs) {
    if (!j.provider) continue;
    counts.set(j.provider, (counts.get(j.provider) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

// Fire-and-forget observability. Each run of the matcher gets one row so we
// can query: "Is Adzuna returning anything? Are we filtering too hard? How
// many users fell through to the empty path and why?"
function recordMatchRun(params: {
  admin: ReturnType<typeof createAdminClient>;
  userId: string;
  template: string;
  diagnostics: MatchDiagnostics | null;
  freshCount: number;
  outcome: string;
  error?: string;
}): void {
  const { admin, userId, template, diagnostics, freshCount, outcome, error } = params;
  admin.from("job_match_runs").insert({
    user_id: userId,
    template,
    search_country: diagnostics?.searchCountry ?? null,
    preferred_locations: diagnostics?.preferredLocations ?? null,
    provider_jobs: diagnostics?.providerJobs ?? 0,
    location_filtered: diagnostics?.locationFiltered ?? 0,
    best_count: diagnostics?.bestCount ?? 0,
    more_count: diagnostics?.moreCount ?? 0,
    median_score: diagnostics?.medianScore ?? 0,
    max_score: diagnostics?.maxScore ?? 0,
    fresh_count: freshCount,
    outcome,
    error: error ?? null,
  }).then(() => {}, () => {});
}

function toItem(job: ScoredJob): WeeklyJobItem {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location || "Remote",
    salary: formatSalary(job.salary_min, job.salary_max),
    postedAgo: postedAgo(job.created),
    matchScore: job.matchScore,
    matchLabelText: job.matchLabelText,
    matchLabelColor: job.matchLabelColor,
    matchLabelBg: job.matchLabelBg,
    matchShowScore: job.matchShowScore,
    applyUrl: trackClickUrl(job.id, job.redirect_url, job.provider),
    provider: job.provider,
  };
}

function buildSampleItems(): { top: WeeklyJobItem; others: WeeklyJobItem[] } {
  const makeBadge = (score: number) => {
    const l = getMatchLabel(score);
    return { matchScore: score, matchLabelText: l.text, matchLabelColor: l.color, matchLabelBg: l.bg, matchShowScore: l.showScore };
  };
  const top: WeeklyJobItem = {
    id: "sample-1",
    title: "Senior Product Manager",
    company: "Stripe",
    location: "Remote · US",
    salary: "$180k–$220k",
    postedAgo: "2 days ago",
    applyUrl: `${APP_URL}/jobs`,
    provider: "careerjet",
    ...makeBadge(92),
  };
  const others: WeeklyJobItem[] = [
    { id: "sample-2", title: "Product Manager, Growth", company: "Linear", location: "New York, NY", salary: "$160k–$190k", postedAgo: "1 day ago", applyUrl: `${APP_URL}/jobs`, provider: "careerjet", ...makeBadge(87) },
    { id: "sample-3", title: "Principal PM — Platform", company: "Notion", location: "San Francisco, CA", salary: "$210k–$250k", postedAgo: "3 days ago", applyUrl: `${APP_URL}/jobs`, provider: "adzuna", ...makeBadge(78) },
    { id: "sample-4", title: "Senior PM, Payments", company: "Square", location: "Remote", salary: null, postedAgo: "4 days ago", applyUrl: `${APP_URL}/jobs`, provider: "adzuna", ...makeBadge(71) },
    { id: "sample-5", title: "Lead Product Manager", company: "Figma", location: "San Francisco, CA", salary: "$200k–$240k", postedAgo: "5 days ago", applyUrl: `${APP_URL}/jobs`, provider: "jooble", ...makeBadge(64) },
  ];
  return { top, others };
}

export type WeeklyJobsOutcome =
  | { outcome: "sent"; template: TemplateName; to: string; jobCount: number; messageId?: string }
  | { outcome: "sent_empty"; template: TemplateName; to: string; messageId?: string }
  | { outcome: "skipped"; reason: string };

export interface SendOptions {
  /** Force the sample email (test script use only) */
  forceSample?: boolean;
  /** Override recipient (test only) */
  overrideTo?: string;
  /** Which template to send. Default: jobs_weekly. welcome_jobs is a variant sent by the welcome cron. */
  template?: TemplateName;
}

export async function sendWeeklyJobsEmail(
  userId: string,
  options: SendOptions = {}
): Promise<WeeklyJobsOutcome> {
  const admin = createAdminClient();
  const template = options.template ?? TEMPLATE_JOBS_WEEKLY;

  const { data: profile } = await admin
    .from("profiles")
    .select("id, email, full_name, signup_city, signup_country")
    .eq("id", userId)
    .single();

  if (!profile?.email) return { outcome: "skipped", reason: "no_profile_or_email" };

  // Fetch welcome flag separately — tolerant of missing column pre-migration.
  let welcomeAlreadySent = false;
  const { data: flagsRow } = await admin
    .from("profiles")
    .select("welcome_jobs_email_sent")
    .eq("id", userId)
    .maybeSingle();
  if (flagsRow && (flagsRow as { welcome_jobs_email_sent?: boolean }).welcome_jobs_email_sent === true) {
    welcomeAlreadySent = true;
  }

  const to = options.overrideTo || profile.email;

  // --- Pre-send gate: suppression + per-type opt-out + duplicate window
  // Test path (forceSample or overrideTo) bypasses the duplicate window so dev testing is frictionless.
  const isTest = options.forceSample || !!options.overrideTo;
  if (!isTest) {
    const gate = await canSendTo({ userId, email: to, type: "jobs_weekly", templateName: template });
    if (!gate.allowed) return { outcome: "skipped", reason: gate.reason || "gated" };

    // For welcome_jobs, the per-user flag is the idempotency source — check it explicitly.
    if (template === TEMPLATE_WELCOME_JOBS && welcomeAlreadySent) {
      return { outcome: "skipped", reason: "welcome_already_sent" };
    }

    // Empty-match guard: max one per week. If user already got jobs_weekly OR jobs_weekly_empty
    // in last 6 days, we should not also send the empty variant today.
    if (template === TEMPLATE_JOBS_WEEKLY_EMPTY) {
      const since = new Date(Date.now() - 6 * 86400 * 1000).toISOString();
      const { data: recent } = await admin
        .from("email_logs")
        .select("id")
        .eq("user_id", userId)
        .in("template_name", [TEMPLATE_JOBS_WEEKLY, TEMPLATE_JOBS_WEEKLY_EMPTY])
        .eq("status", "sent")
        .gte("created_at", since)
        .limit(1)
        .maybeSingle();
      if (recent) return { outcome: "skipped", reason: "empty_already_sent_this_week" };
    }
  }

  const firstName = (profile.full_name || profile.email.split("@")[0] || "there").split(" ")[0];

  const { data: cv } = await admin
    .from("cvs")
    .select("id, parsed_json")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const cvData = (cv?.parsed_json as ResumeContent | null) ?? null;

  // Collect preferred locations
  const { data: locRows } = await admin
    .from("preferred_locations")
    .select("location")
    .eq("user_id", userId)
    .order("priority");
  const preferredLocations = (locRows?.map((l) => l.location) ?? []).filter(Boolean);
  if (preferredLocations.length === 0 && cvData?.contact?.location) {
    preferredLocations.push(cvData.contact.location);
  }
  if (preferredLocations.length === 0 && profile.signup_city) {
    preferredLocations.push(profile.signup_city);
  }
  const targetTitle = cvData?.targetTitle?.title || cvData?.experience?.items?.[0]?.role || "";
  const location = preferredLocations[0] || "";

  // --- Latest ATS score (shared by both templates)
  const { data: latestReport } = await admin
    .from("ats_reports")
    .select("overall_score, score")
    .eq("cv_id", cv?.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const atsScore: number | null = latestReport?.overall_score ?? latestReport?.score ?? null;

  // --- Unsubscribe URL
  const token = makeUnsubscribeToken(userId, "jobs_weekly");
  const unsubscribeUrl = `${APP_URL}/api/email/unsubscribe?type=jobs_weekly&uid=${userId}&t=${token}`;
  const preferencesUrl = `${APP_URL}/settings?tab=preferences`;

  // ============================================================
  // PATH A — force sample (test only, no DB writes of sent-jobs)
  // ============================================================
  if (options.forceSample) {
    const sample = buildSampleItems();
    const sampleBreakdown: ProviderCount[] = [
      { name: "careerjet", count: 2 },
      { name: "adzuna", count: 2 },
      { name: "jooble", count: 1 },
    ];
    return await sendWithMatches({
      admin, to, template, firstName, targetTitle: "Product Manager", location: "Remote · US",
      topItem: sample.top, otherItems: sample.others, atsScore, cvId: null,
      userId, unsubscribeUrl, preferencesUrl, skipRecordJobs: true,
      providerBreakdown: sampleBreakdown,
    });
  }

  // ============================================================
  // PATH B — real matches with dedup
  //   Skipped if caller explicitly asked for the empty variant.
  // ============================================================
  const forceEmpty = template === TEMPLATE_JOBS_WEEKLY_EMPTY;
  if (!forceEmpty && cvData) {
    try {
      const result = await matchJobsForCV(cvData, preferredLocations, profile.signup_country || "us");

      // Dedup strategy — three tiers, so a user never gets an empty fallback
      // just because last week's five still sit inside the 14-day window.
      //   1. Prefer best matches that are fresh (not sent in last 14d)
      //   2. Top up from `moreJobs` (time-sorted feed) if still < 5
      //   3. If still empty, relax dedup window to 7d (weekly cadence)
      //   4. If still empty, send the top of bestMatches anyway — repeats
      //      are better than no email at all
      const recent14 = await getRecentlySentJobIds(userId, TEMPLATE_JOBS_WEEKLY, 14);
      let picks: ScoredJob[] = result.bestMatches.filter((j) => !recent14.has(j.id));

      if (picks.length < 5 && result.moreJobs.length > 0) {
        const pickedIds = new Set(picks.map((j) => j.id));
        const extras = result.moreJobs.filter(
          (j) => !recent14.has(j.id) && !pickedIds.has(j.id)
        );
        picks = picks.concat(extras).slice(0, 5);
      }

      if (picks.length === 0) {
        const recent7 = await getRecentlySentJobIds(userId, TEMPLATE_JOBS_WEEKLY, 7);
        picks = [...result.bestMatches, ...result.moreJobs]
          .filter((j) => !recent7.has(j.id))
          .slice(0, 5);
      }

      if (picks.length === 0 && result.bestMatches.length > 0) {
        picks = result.bestMatches.slice(0, 5);
      }

      const fresh = picks.slice(0, 5);

      // Observability — one row per match attempt, queryable from admin.
      recordMatchRun({
        admin,
        userId,
        template,
        diagnostics: result.diagnostics,
        freshCount: fresh.length,
        outcome: fresh.length > 0 ? "sent" : "will_fall_through_empty",
      });

      if (fresh.length > 0) {
        // Welcome cron reuses the matches path — tag the log row with the originating template.
        const logTemplate = template === TEMPLATE_WELCOME_JOBS ? TEMPLATE_WELCOME_JOBS : TEMPLATE_JOBS_WEEKLY;
        return await sendWithMatches({
          admin, to, template: logTemplate, firstName, targetTitle, location,
          topItem: toItem(fresh[0]),
          otherItems: fresh.slice(1).map(toItem),
          atsScore, cvId: cv?.id ?? null,
          userId, unsubscribeUrl, preferencesUrl,
          jobIdsToRecord: fresh.map((j) => j.id),
          providerBreakdown: buildProviderBreakdown(fresh),
        });
      }
    } catch (err) {
      console.warn("[weekly-jobs] match failed:", (err as Error).message);
      recordMatchRun({
        admin: createAdminClient(),
        userId,
        template,
        diagnostics: null,
        freshCount: 0,
        outcome: "match_error",
        error: (err as Error).message,
      });
      // fall through to empty-match path
    }
  }

  // ============================================================
  // PATH C — empty match → retention email
  // ============================================================
  // If we were explicitly asked to send the "jobs_weekly" template and there are no matches,
  // switch to the empty variant. Welcome template also falls back to empty for users without matches.
  const emptyTemplate = TEMPLATE_JOBS_WEEKLY_EMPTY;

  // Guard: if user already got an empty-match email in the last 6 days, skip silently
  if (!isTest) {
    const since = new Date(Date.now() - 6 * 86400 * 1000).toISOString();
    const { data: recent } = await admin
      .from("email_logs")
      .select("id")
      .eq("user_id", userId)
      .in("template_name", [TEMPLATE_JOBS_WEEKLY, TEMPLATE_JOBS_WEEKLY_EMPTY])
      .eq("status", "sent")
      .gte("created_at", since)
      .limit(1)
      .maybeSingle();
    if (recent) return { outcome: "skipped", reason: "empty_dedup_window" };
  }

  return await sendEmptyEmail({
    admin, to, template: emptyTemplate, firstName, targetTitle,
    atsScore, userId, cvId: cv?.id ?? null, cvData,
    unsubscribeUrl, preferencesUrl,
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Internal: send matches email
// ────────────────────────────────────────────────────────────────────────────

async function sendWithMatches(params: {
  admin: ReturnType<typeof createAdminClient>;
  to: string;
  template: TemplateName;
  firstName: string;
  targetTitle: string;
  location: string;
  topItem: WeeklyJobItem;
  otherItems: WeeklyJobItem[];
  atsScore: number | null;
  cvId: string | null;
  userId: string;
  unsubscribeUrl: string;
  preferencesUrl: string;
  jobIdsToRecord?: string[];
  skipRecordJobs?: boolean;
  providerBreakdown?: ProviderCount[];
}): Promise<WeeklyJobsOutcome> {
  const {
    admin, to, template, firstName, targetTitle, location,
    topItem, otherItems, atsScore, cvId, userId,
    unsubscribeUrl, preferencesUrl, jobIdsToRecord, skipRecordJobs,
    providerBreakdown,
  } = params;

  const jobCount = 1 + otherItems.length;
  const copy = await resolveJobsCopy(
    template === TEMPLATE_WELCOME_JOBS ? "welcome_jobs" : "jobs_weekly",
    { firstName, jobCount, targetTitle, location, atsScore, logoText: "CVEdge" }
  );

  const html = await render(
    WeeklyJobsEmail({
      firstName,
      jobCount,
      targetTitle,
      location,
      topJob: topItem,
      otherJobs: otherItems,
      atsScore,
      cvId,
      appUrl: APP_URL,
      supportEmail: SUPPORT_EMAIL,
      logoText: "CVEdge",
      unsubscribeUrl,
      preferencesUrl,
      heroHeadingOverride: copy.heroHeading,
      heroSubOverride: copy.heroSub,
      footerNoteOverride: copy.footerNote,
      providerBreakdown,
    })
  );

  // Subject template still appends location for scannability when provided.
  const subject = location ? `${copy.subject} · ${location}` : copy.subject;

  const { data, error } = await resendClient().emails.send({
    from: `CVEdge <${FROM_EMAIL}>`,
    to,
    subject,
    html,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });

  if (error) throw new Error(error.message);

  await admin.from("email_logs").insert({
    user_id: userId,
    template_name: template,
    to_email: to,
    subject,
    status: "sent",
  });

  if (!skipRecordJobs && jobIdsToRecord && jobIdsToRecord.length > 0) {
    await recordSentJobs(userId, jobIdsToRecord, TEMPLATE_JOBS_WEEKLY);
  }

  // If this was the welcome email, flip the flag
  if (template === TEMPLATE_WELCOME_JOBS) {
    await admin.from("profiles").update({ welcome_jobs_email_sent: true }).eq("id", userId);
  }

  return { outcome: "sent", template, to, jobCount: 1 + otherItems.length, messageId: data?.id };
}

// ────────────────────────────────────────────────────────────────────────────
// Internal: send empty-match retention email
// ────────────────────────────────────────────────────────────────────────────

async function sendEmptyEmail(params: {
  admin: ReturnType<typeof createAdminClient>;
  to: string;
  template: TemplateName;
  firstName: string;
  targetTitle: string;
  atsScore: number | null;
  userId: string;
  cvId: string | null;
  cvData: ResumeContent | null;
  unsubscribeUrl: string;
  preferencesUrl: string;
}): Promise<WeeklyJobsOutcome> {
  const { admin, to, template, firstName, targetTitle, atsScore, userId, cvId, cvData, unsubscribeUrl, preferencesUrl } = params;

  const ats = getAtsMessage(atsScore);
  const tip = getRotatingTip(userId);
  const adj = getAdjacentRoles(cvData);
  const adjacentRoles: [string, string, string] = [
    adj[0] || "Senior Specialist",
    adj[1] || "Team Lead",
    adj[2] || "Consultant",
  ];

  const improveScoreUrl = cvId ? `${APP_URL}/resume/${cvId}?tab=ats` : `${APP_URL}/dashboard`;
  const browseAdjacentUrl = `${APP_URL}/jobs?q=${encodeURIComponent(adjacentRoles.join(" OR "))}`;
  const updatePreferencesUrl = `${APP_URL}/settings?tab=locations`;
  const viewMatchesUrl = cvId ? `${APP_URL}/jobs?cvId=${cvId}` : `${APP_URL}/jobs`;

  const copy = await resolveJobsCopy("jobs_weekly_empty", {
    firstName, jobCount: 0, targetTitle, location: "", atsScore, logoText: "CVEdge",
  });

  const html = await render(
    WeeklyJobsEmptyEmail({
      firstName,
      targetTitle,
      atsScore,
      atsLabel: ats.label,
      atsMessage: ats.message,
      rotatingTip: tip,
      adjacentRoles,
      improveScoreUrl,
      browseAdjacentUrl,
      updatePreferencesUrl,
      viewMatchesUrl,
      unsubscribeUrl,
      preferencesUrl,
      appUrl: APP_URL,
      supportEmail: SUPPORT_EMAIL,
      logoText: "CVEdge",
      heroHeadingOverride: copy.heroHeading,
      heroSubOverride: copy.heroSub,
      footerNoteOverride: copy.footerNote,
    })
  );

  const subject = copy.subject;

  const { data, error } = await resendClient().emails.send({
    from: `CVEdge <${FROM_EMAIL}>`,
    to,
    subject,
    html,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });

  if (error) throw new Error(error.message);

  await admin.from("email_logs").insert({
    user_id: userId,
    template_name: template,
    to_email: to,
    subject,
    status: "sent",
  });

  return { outcome: "sent_empty", template, to, messageId: data?.id };
}
