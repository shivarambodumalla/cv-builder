import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StoryBankContent } from "./story-bank-content";

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
        .select("subscription_status")
        .eq("id", user.id)
        .single(),
    ]);

  const isPro = profile?.subscription_status === "active";

  return <StoryBankContent stories={stories ?? []} cvs={cvs ?? []} isPro={isPro} />;
}
