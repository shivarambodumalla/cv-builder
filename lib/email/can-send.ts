import { createAdminClient } from "@/lib/supabase/admin";
import { columnForType, type EmailType } from "@/lib/email/unsubscribe-token";

export interface CanSendResult {
  allowed: boolean;
  reason?: "suppressed" | "opted_out" | "recent_duplicate" | "no_email";
}

// Hours window within which an identical (user, template) send is considered a duplicate
const DUPLICATE_WINDOW_HOURS: Record<string, number> = {
  jobs_weekly: 20,
  jobs_weekly_empty: 144, // 6 days — max one empty-match email per week
  welcome_jobs: 24 * 365, // effectively never re-send welcome
};

export async function canSendTo(params: {
  userId?: string | null;
  email: string;
  type: EmailType;
  templateName: string; // e.g. "jobs_weekly", "jobs_weekly_empty", "welcome_jobs"
}): Promise<CanSendResult> {
  const { userId, email, type, templateName } = params;
  if (!email) return { allowed: false, reason: "no_email" };

  const admin = createAdminClient();
  const emailLower = email.toLowerCase();

  // 1. Hard suppression
  const { data: suppression } = await admin
    .from("email_suppressions")
    .select("id")
    .ilike("email", emailLower)
    .maybeSingle();
  if (suppression) return { allowed: false, reason: "suppressed" };

  // 2. Per-type opt-out (for registered users)
  if (userId) {
    const column = columnForType(type);
    const { data: profile } = await admin
      .from("profiles")
      .select(column)
      .eq("id", userId)
      .maybeSingle();

    const profileRow = profile as Record<string, unknown> | null;
    if (profileRow && profileRow[column] === false) {
      return { allowed: false, reason: "opted_out" };
    }
  }

  // 3. Recent duplicate guard
  const windowHours = DUPLICATE_WINDOW_HOURS[templateName];
  if (userId && windowHours) {
    const since = new Date(Date.now() - windowHours * 3600 * 1000).toISOString();
    const { data: existing } = await admin
      .from("email_logs")
      .select("id")
      .eq("user_id", userId)
      .eq("template_name", templateName)
      .eq("status", "sent")
      .gte("created_at", since)
      .limit(1)
      .maybeSingle();

    if (existing) return { allowed: false, reason: "recent_duplicate" };
  }

  return { allowed: true };
}

export async function recordSentJobs(userId: string, jobIds: string[], templateName: string): Promise<void> {
  if (jobIds.length === 0) return;
  const admin = createAdminClient();
  const rows = jobIds.map((job_id) => ({ user_id: userId, job_id, template_name: templateName }));
  // onConflict: ignore dupes — unique constraint on (user_id, job_id, template_name)
  await admin.from("email_sent_jobs").upsert(rows, { onConflict: "user_id,job_id,template_name", ignoreDuplicates: true });
}

export async function getRecentlySentJobIds(userId: string, templateName: string, daysBack = 14): Promise<Set<string>> {
  const admin = createAdminClient();
  const since = new Date(Date.now() - daysBack * 86400 * 1000).toISOString();
  const { data } = await admin
    .from("email_sent_jobs")
    .select("job_id")
    .eq("user_id", userId)
    .eq("template_name", templateName)
    .gte("sent_at", since);
  return new Set((data ?? []).map((r) => r.job_id as string));
}
