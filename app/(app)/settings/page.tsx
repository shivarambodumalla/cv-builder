import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SettingsContent } from "./settings-content";

export const metadata: Metadata = {
  title: "Preferences",
  description: "Manage your profile, location preferences, and account settings.",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?returnUrl=%2Fsettings");

  const admin = createAdminClient();

  const [{ data: profile }, { data: prefLocs }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, subscription_status, subscription_period, open_to_remote, signup_city, signup_country, created_at")
      .eq("id", user.id)
      .single(),
    admin
      .from("preferred_locations")
      .select("id, location, location_type, priority")
      .eq("user_id", user.id)
      .order("priority", { ascending: false }),
  ]);

  return (
    <SettingsContent
      email={user.email ?? ""}
      fullName={user.user_metadata?.full_name ?? profile?.full_name ?? ""}
      avatarUrl={user.user_metadata?.avatar_url ?? null}
      isPro={profile?.subscription_status === "active"}
      period={profile?.subscription_period ?? null}
      openToRemote={profile?.open_to_remote ?? false}
      locations={(prefLocs ?? []).map((l) => ({ id: l.id, location: l.location, type: l.location_type }))}
      signupCity={profile?.signup_city ?? null}
      signupCountry={profile?.signup_country ?? null}
      memberSince={profile?.created_at ?? user.created_at}
    />
  );
}
