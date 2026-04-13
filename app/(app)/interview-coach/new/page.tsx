import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getPlan } from "@/lib/billing/limits";
import { StoryDetailContent } from "../[id]/story-detail-content";

const FREE_STORY_LIMIT = 3;

export default async function NewStoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from("profiles").select("subscription_status, current_period_end").eq("id", user.id).single(),
    supabase.from("stories").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_active", true),
  ]);

  const isPro = getPlan(profile) === "pro";
  if (!isPro && (count ?? 0) >= FREE_STORY_LIMIT) redirect("/interview-coach");

  return (
    <StoryDetailContent
      story={{
        id: "",
        title: "",
        situation: null,
        task: null,
        action: null,
        result: null,
        tags: [],
        quality_score: 0,
        source_type: "manual",
        created_at: new Date().toISOString(),
      }}
      isNew
    />
  );
}
