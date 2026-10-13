import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsContent } from "./settings-content";

export const metadata: Metadata = {
  title: "Preferences",
  description: "Manage your profile, email preferences, and account settings.",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?returnUrl=%2Fsettings");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, subscription_status, subscription_period, signup_city, signup_country, created_at, email_product_updates, email_tips")
    .eq("id", user.id)
    .single();

  return (
    <SettingsContent
      email={user.email ?? ""}
      fullName={user.user_metadata?.full_name ?? profile?.full_name ?? ""}
      avatarUrl={user.user_metadata?.avatar_url ?? null}
      isPro={profile?.subscription_status === "active"}
      period={profile?.subscription_period ?? null}
      signupCity={profile?.signup_city ?? null}
      signupCountry={profile?.signup_country ?? null}
      memberSince={profile?.created_at ?? user.created_at}
      emailPreferences={{
        product_updates: profile?.email_product_updates ?? true,
        tips: profile?.email_tips ?? true,
      }}
    />
  );
}
