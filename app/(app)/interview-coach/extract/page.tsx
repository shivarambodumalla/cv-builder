import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getPlan } from "@/lib/billing/limits";
import { ExtractContent } from "./extract-content";

export default async function ExtractPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?returnUrl=%2Finterview-coach%2Fextract");

  const [{ data: profile }, { data: cvs }] = await Promise.all([
    supabase
      .from("profiles")
      .select("plan, subscription_status, current_period_end")
      .eq("id", user.id)
      .single(),
    supabase
      .from("cvs")
      .select("id, title, target_role")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  // Extraction is Pro-only. Free users land on the page and see what Pro
  // does here instead of being bounced back without a word.
  return <ExtractContent cvs={cvs ?? []} isPro={getPlan(profile) === "pro"} />;
}
