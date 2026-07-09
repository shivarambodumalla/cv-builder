import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CvList } from "@/components/shared/cv-list";
import { ReturnVisitNudge } from "@/components/popups/return-visit-nudge";
import { UploadCvNudge } from "@/components/popups/upload-cv-nudge";
import { sendEmail } from "@/lib/email/sender";
import { CvReviewDashboardBanner } from "@/components/cv-review/dashboard-banner";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your resumes, track ATS scores, and prepare for interviews.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?returnUrl=%2Fdashboard");
  }

  const { data: cvs } = await supabase
    .from("cvs")
    .select("id, title, created_at, parsed_json, design_settings, target_role, ats_reports(score, overall_score, created_at), job_matches(match_score, created_at), cover_letters(id)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .order("created_at", { referencedTable: "ats_reports", ascending: false })
    .order("created_at", { referencedTable: "job_matches", ascending: false });

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, subscription_status, onboarding_shown, ats_scans_this_window, job_matches_this_window, cover_letters_this_window, ai_rewrites_this_window, pdf_downloads_this_window")
    .eq("id", user.id)
    .single();

  // Send welcome email on first dashboard visit (atomic flag-first to prevent duplicates)
  const admin = createAdminClient();
  const { data: claimed, error: claimError } = await admin
    .from("profiles")
    .update({ welcome_email_sent: true })
    .eq("id", user.id)
    .eq("welcome_email_sent", false)
    .select("id")
    .maybeSingle();

  if (claimed && !claimError && user.email) {
    try {
      const firstName = user.user_metadata?.full_name?.split(" ")[0] || user.user_metadata?.name?.split(" ")[0] || "";
      await sendEmail({
        to: user.email,
        templateName: "welcome",
        userId: user.id,
        variables: { name: firstName || "there" },
      });
    } catch {
      // Email failed — rollback flag so next visit retries
      await admin
        .from("profiles")
        .update({ welcome_email_sent: false })
        .eq("id", user.id);
    }
  }

  const { data: activeReviews } = await supabase
    .from("cv_reviews")
    .select("id, status, target_role, tier, edit_rounds_used, edit_rounds_limit, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  // Fetch story stats
  const { data: stories } = await supabase
    .from("stories")
    .select("id, quality_score")
    .eq("user_id", user.id)
    .eq("is_active", true);

  const storyCount = stories?.length ?? 0;
  const readyStories = stories?.filter((s) => (s.quality_score ?? 0) >= 7).length ?? 0;

  const userName = user.user_metadata?.full_name?.split(" ")[0] || user.user_metadata?.name?.split(" ")[0] || "";
  const isPro = profile?.subscription_status === "active";

  // Check if any free limit is reached
  const anyLimitReached = !isPro && (
    (profile?.ats_scans_this_window ?? 0) >= 10 ||
    (profile?.job_matches_this_window ?? 0) >= 5 ||
    (profile?.cover_letters_this_window ?? 0) >= 5 ||
    (profile?.ai_rewrites_this_window ?? 0) >= 25 ||
    (cvs ?? []).length >= 3
  );

  // Return visit nudge data
  const lastCv = (cvs ?? [])[0] ?? null;
  const lastScore = lastCv?.ats_reports?.[0]?.overall_score ?? lastCv?.ats_reports?.[0]?.score ?? null;
  const lastSignInAt = user.last_sign_in_at ?? null;

  return (
    <div className="container mx-auto px-4 py-12">
      <CvReviewDashboardBanner reviews={(activeReviews ?? []).filter((r) => r.status === "pending" || r.status === "in_progress")} />
      <ReturnVisitNudge
        userName={userName}
        lastScore={lastScore}
        lastCvTitle={lastCv?.title ?? null}
        lastCvId={lastCv?.id ?? null}
        lastSignInAt={lastSignInAt}
      />
      {!isPro && (
        <div className="mb-6 flex justify-center">
          <div className="w-full max-w-2xl bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center justify-center py-8 text-sm text-muted-foreground">
            Advertisement
          </div>
        </div>
      )}
      <CvList
        cvs={cvs ?? []}
        isPro={isPro}
        storyCount={storyCount}
        readyStories={readyStories}
        userName={userName}
        limitReached={anyLimitReached}
      />
      <UploadCvNudge />
      {(activeReviews ?? []).length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Review by Experts</h2>
            <Link href="/cv-review/history" className="text-sm text-muted-foreground hover:text-foreground">View all →</Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {(activeReviews ?? []).slice(0, 3).map((review) => {
              const statusMap: Record<string, { label: string; color: string }> = {
                pending: { label: "Awaiting review", color: "#92400E" },
                in_progress: { label: "In progress", color: "#1D4ED8" },
                completed: { label: "Complete", color: "#065F46" },
                cancelled: { label: "Cancelled", color: "#991B1B" },
              };
              const st = statusMap[review.status] ?? statusMap.pending;
              const remaining = review.edit_rounds_limit === 999 ? "Unlimited rounds" : `${Math.max(0, review.edit_rounds_limit - review.edit_rounds_used)} rounds left`;
              return (
                <a key={review.id} href={`/cv-review/${review.id}`} className="rounded-xl border p-4 block hover:bg-muted/30 transition-colors">
                  <span className="text-xs font-semibold" style={{ color: st.color }}>{st.label}</span>
                  <p className="font-medium text-sm mt-1 capitalize">{review.tier} Review</p>
                  {review.target_role && <p className="text-xs text-muted-foreground">{review.target_role}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{remaining}</p>
                  <p className="text-xs font-semibold mt-2" style={{ color: "#065F46" }}>View →</p>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
