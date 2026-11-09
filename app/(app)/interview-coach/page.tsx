import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StoryBankContent } from "./story-bank-content";
import { getPlan } from "@/lib/billing/limits";

export const metadata: Metadata = {
  title: "Interview Coach",
  description: "Interview Coach: STAR answers for your interviews.",
};

export const dynamic = "force-dynamic";

export default async function StoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?returnUrl=%2Finterview-coach");

  const [{ data: stories }, { data: cvs }, { data: profile }] =
    await Promise.all([
      supabase
        .from("stories")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("quality_score", { ascending: false }),
      supabase
        .from("cvs")
        .select("id, title, target_role, parsed_json")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("plan, subscription_status, current_period_end")
        .eq("id", user.id)
        .single(),
    ]);

  return <StoryBankContent stories={stories ?? []} cvs={cvs ?? []} isPro={getPlan(profile) === "pro"} />;
}
