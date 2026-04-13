import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getPlan } from "@/lib/billing/limits";
import { ExtractContent } from "./extract-content";

export default async function ExtractPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, current_period_end")
    .eq("id", user.id)
    .single();

  // Extract is Pro only
  if (getPlan(profile) !== "pro") redirect("/interview-coach");

  const { data: cvs } = await supabase
    .from("cvs")
    .select("id, title, target_role")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return <ExtractContent cvs={cvs ?? []} />;
}
