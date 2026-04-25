// Code-rendered email templates that don't live in the email_templates DB
// table. They're React Email components in lib/email/weekly-jobs.ts and
// must be sent via sendWeeklyJobsEmail() — sendEmail() can't render them.
// Surfaced in admin lists and the campaigns picker so they're discoverable
// alongside DB-editable templates.

export const JOBS_TEMPLATES = ["jobs_weekly", "jobs_weekly_empty", "welcome_jobs"] as const;

export type JobsTemplate = (typeof JOBS_TEMPLATES)[number];

export const JOBS_TEMPLATE_DESCRIPTIONS: Record<JobsTemplate, string> = {
  jobs_weekly: "Weekly digest with the top 5 matched jobs (Tue/Wed/Thu cron).",
  jobs_weekly_empty: "Retention email shown when no fresh matches were found.",
  welcome_jobs: "First-time job digest sent the day after a user opts in.",
};

export function isJobsTemplate(name: string): name is JobsTemplate {
  return (JOBS_TEMPLATES as readonly string[]).includes(name);
}
