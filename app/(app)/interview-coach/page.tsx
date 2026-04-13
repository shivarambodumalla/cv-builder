import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StoryBankContent } from "./story-bank-content";
import { getPlan } from "@/lib/billing/limits";

export const metadata: Metadata = {
  title: "Interview Coach",
  description: "Build your STAR interview story bank. Extract stories from your CV, practice with AI, and ace every behavioral interview.",
};

export const dynamic = "force-dynamic";

export default async function StoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

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
        .select("subscription_status, current_period_end")
        .eq("id", user.id)
        .single(),
    ]);

  const isPro = getPlan(profile) === "pro";

  // Count stories created this week (7-day window)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const storiesThisWeek = (stories ?? []).filter((s) => new Date(s.created_at) > weekAgo).length;

  return <StoryBankContent stories={stories ?? []} cvs={cvs ?? []} isPro={isPro} storiesThisWeek={storiesThisWeek} />;
}
