import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BillingPageContent } from "./billing-page-content";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, subscription_status, subscription_period, subscription_id, current_period_end, ats_scans_this_month, job_matches_this_month, cover_letters_this_month, ai_rewrites_this_month, pdf_downloads_this_week, usage_reset_date")
    .eq("id", user.id)
    .single();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Billing</h1>
      <BillingPageContent profile={profile ?? {}} />
    </div>
  );
}
