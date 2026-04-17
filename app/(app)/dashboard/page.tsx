import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CvList } from "@/components/shared/cv-list";
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
    redirect("/login");
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
    .select("plan, subscription_status, onboarding_shown")
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
  const hasCvs = (cvs ?? []).length > 0;
  const showOnboarding = !hasCvs && !profile?.onboarding_shown;

  return (
    <div className="container mx-auto px-4 py-12">
      {showOnboarding && (
        <div className="rounded-xl border bg-[#F0FDF4] dark:bg-[#065F46]/10 border-[#34D399]/40 p-5 mb-8 flex items-center gap-5">
          <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#065F46]/10">
            <svg className="h-6 w-6 text-[#065F46]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-[#065F46] dark:text-[#34D399]">
              {"Welcome"}{userName ? `, ${userName}` : ""}
            </h2>
            <p className="text-sm text-[#065F46]/70 dark:text-[#34D399]/70 mt-0.5">
              Upload your CV to get started — takes 30 seconds
            </p>
          </div>
          <a
            href="/upload-resume"
            className="shrink-0 inline-flex items-center justify-center rounded-md bg-[#065F46] px-5 py-2 text-sm font-semibold text-white hover:bg-[#065F46]/90 transition-colors"
          >
            Upload CV
          </a>
        </div>
      )}
      <CvList
        cvs={cvs ?? []}
        isPro={profile?.subscription_status === "active"}
        storyCount={storyCount}
        readyStories={readyStories}
        userName={userName}
      />
    </div>
  );
}
