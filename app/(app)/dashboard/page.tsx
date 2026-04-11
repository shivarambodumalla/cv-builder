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
    .select("plan, subscription_status")
    .eq("id", user.id)
    .single();

  // Send welcome email on first dashboard visit
  const admin = createAdminClient();
  const { data: welcomeCheck } = await admin
    .from("profiles")
    .select("welcome_email_sent")
    .eq("id", user.id)
    .single();

  if (welcomeCheck && !welcomeCheck.welcome_email_sent && user.email) {
    sendEmail({
      to: user.email,
      templateName: "welcome",
      userId: user.id,
    }).then(() => {
      admin.from("profiles").update({ welcome_email_sent: true }).eq("id", user.id).then(() => {});
    }).catch(() => {});
  }

  // Fetch story stats
  const { data: stories } = await supabase
    .from("stories")
    .select("id, quality_score")
    .eq("user_id", user.id)
    .eq("is_active", true);

  const storyCount = stories?.length ?? 0;
  const readyStories = stories?.filter((s) => (s.quality_score ?? 0) >= 7).length ?? 0;

  return (
    <div className="container mx-auto px-4 py-12">
      <CvList
        cvs={cvs ?? []}
        isPro={profile?.subscription_status === "active"}
        storyCount={storyCount}
        readyStories={readyStories}
        userName={user.user_metadata?.full_name?.split(" ")[0] || user.user_metadata?.name?.split(" ")[0] || ""}
      />
    </div>
  );
}
