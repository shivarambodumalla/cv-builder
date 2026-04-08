import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CvList } from "@/components/shared/cv-list";
import { sendEmail } from "@/lib/email/sender";

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
    .select("id, title, created_at, parsed_json, design_settings, target_role, ats_reports(score), job_matches(match_score), cover_letters(id)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

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

  return (
    <div className="container mx-auto px-4 py-12">
      <CvList cvs={cvs ?? []} isPro={profile?.subscription_status === "active"} />
    </div>
  );
}
