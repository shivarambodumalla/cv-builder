import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminUsersTable, type AdminUserRow } from "./users-table";

export const metadata: Metadata = {
  title: "Users | CVEdge Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = createAdminClient();

  const { data: enriched } = await supabase
    .from("user_profile_enriched")
    .select(
      "id, email, full_name, avatar_url, plan, subscription_status, joined_at, last_sign_in_at, total_cvs, total_pdf_downloads, signup_city, signup_country, signup_country_code, profile_location, country, cv_location"
    )
    .order("joined_at", { ascending: false });

  // Latest CV updated_at per user as fallback for "last active"
  const userIds = (enriched ?? []).map((u) => u.id);
  const lastActivityMap = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: cvs } = await supabase
      .from("cvs")
      .select("user_id, updated_at")
      .in("user_id", userIds)
      .order("updated_at", { ascending: false });
    for (const cv of cvs ?? []) {
      if (!lastActivityMap.has(cv.user_id)) lastActivityMap.set(cv.user_id, cv.updated_at);
    }
  }

  const rows: AdminUserRow[] = (enriched ?? []).map((u) => {
    const cvLastActive = lastActivityMap.get(u.id) ?? null;
    const lastActive = u.last_sign_in_at && cvLastActive
      ? (new Date(u.last_sign_in_at) > new Date(cvLastActive) ? u.last_sign_in_at : cvLastActive)
      : (u.last_sign_in_at ?? cvLastActive);
    return {
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      avatar_url: u.avatar_url,
      plan: u.plan,
      subscription_status: u.subscription_status,
      joined_at: u.joined_at,
      last_active: lastActive,
      total_cvs: u.total_cvs ?? 0,
      total_pdf_downloads: u.total_pdf_downloads ?? 0,
      signup_city: u.signup_city,
      signup_country: u.signup_country,
      signup_country_code: u.signup_country_code,
      profile_location: u.profile_location,
      country: u.country,
      cv_location: u.cv_location,
    };
  });

  return <AdminUsersTable users={rows} />;
}
