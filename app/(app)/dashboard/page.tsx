import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CvList } from "@/components/shared/cv-list";
import { ReturnVisitNudge } from "@/components/popups/return-visit-nudge";
import { UploadCvNudge } from "@/components/popups/upload-cv-nudge";
import { sendEmail } from "@/lib/email/sender";

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
      <ReturnVisitNudge
        userName={userName}
        lastScore={lastScore}
        lastCvTitle={lastCv?.title ?? null}
        lastCvId={lastCv?.id ?? null}
        lastSignInAt={lastSignInAt}
      />
      <CvList
        cvs={cvs ?? []}
        isPro={isPro}
        storyCount={storyCount}
        readyStories={readyStories}
        userName={userName}
        limitReached={anyLimitReached}
      />
      <UploadCvNudge />
    </div>
  );
}
