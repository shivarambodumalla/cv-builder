import { createAdminClient } from "@/lib/supabase/admin";

export interface SocialProof {
  /** Signed-up accounts, excluding admin and test accounts. */
  jobSeekers: number;
  /** ATS scans run on those accounts' resumes. */
  resumeScans: number;
}

/** Below this a count reads as weak rather than reassuring, so it is hidden. */
const MIN_SHOWN = 100;

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Real usage counts for trust lines on marketing pages. Every number shown must
 * come from here, never typed into copy: a hardcoded "+18 points" claim once
 * sat on the homepage while the real average gain was under 5. Callers render
 * on a static page with revalidate, so this runs about once an hour. Returns
 * null on any failure, and the caller hides the line.
 */
export async function getSocialProof(): Promise<SocialProof | null> {
  try {
    const admin = createAdminClient();

    const internalFilter = [
      "email.ilike.%@example.com",
      "email.ilike.%test%",
      ...adminEmails().map((e) => `email.eq.${e}`),
    ].join(",");
    const { data: internalUsers, error: internalErr } = await admin
      .from("profiles")
      .select("id")
      .or(internalFilter);
    if (internalErr) throw internalErr;
    const internalIds = (internalUsers ?? []).map((u) => u.id as string);

    const { data: internalCvs, error: cvErr } = internalIds.length
      ? await admin.from("cvs").select("id").in("user_id", internalIds)
      : { data: [], error: null };
    if (cvErr) throw cvErr;
    const internalCvIds = (internalCvs ?? []).map((c) => c.id as string);

    const [users, scans] = await Promise.all([
      admin.from("profiles").select("id", { count: "exact", head: true }),
      internalCvIds.length
        ? admin
            .from("ats_reports")
            .select("id", { count: "exact", head: true })
            .not("cv_id", "in", `(${internalCvIds.join(",")})`)
        : admin.from("ats_reports").select("id", { count: "exact", head: true }),
    ]);
    if (users.error) throw users.error;
    if (scans.error) throw scans.error;

    return {
      jobSeekers: (users.count ?? 0) - internalIds.length,
      resumeScans: scans.count ?? 0,
    };
  } catch (err) {
    console.error("[social-proof] count failed:", err);
    return null;
  }
}

/** 1,444 → "1,400+". Null below MIN_SHOWN, so small numbers are not displayed. */
export function formatProofCount(n: number): string | null {
  if (n < MIN_SHOWN) return null;
  return `${(Math.floor(n / 100) * 100).toLocaleString("en-US")}+`;
}

/** "800+ job seekers · 1,400+ resume scans", or null when nothing is big enough to show. */
export function socialProofLine(proof: SocialProof | null): string | null {
  if (!proof) return null;
  const parts = [
    formatProofCount(proof.jobSeekers) && `${formatProofCount(proof.jobSeekers)} job seekers`,
    formatProofCount(proof.resumeScans) && `${formatProofCount(proof.resumeScans)} resume scans`,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}
