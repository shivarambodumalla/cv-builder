import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getPlan } from "@/lib/billing/limits";
import { StoryDetailContent } from "./story-detail-content";

export default async function StoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?returnUrl=%2Finterview-coach");

  const [{ data: story }, { data: profile }] = await Promise.all([
    supabase
      .from("stories")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("profiles")
      .select("plan, subscription_status, current_period_end")
      .eq("id", user.id)
      .single(),
  ]);

  if (!story) notFound();

  return <StoryDetailContent story={story} isPro={getPlan(profile) === "pro"} />;
}
