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

  // Target role from latest CV per user
  const roleMap = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: cvRoles } = await supabase
      .from("cvs")
      .select("user_id, target_role")
      .in("user_id", userIds)
      .not("target_role", "is", null)
      .order("updated_at", { ascending: false });
    for (const cv of cvRoles ?? []) {
      if (!roleMap.has(cv.user_id) && cv.target_role) roleMap.set(cv.user_id, cv.target_role);
    }
  }

  // Jobs metrics: job clicks per user
  const jobClicksMap = new Map<string, number>();
  const savedJobsMap = new Map<string, number>();
  if (userIds.length > 0) {
    const [{ data: clicks }, { data: saves }] = await Promise.all([
      supabase.from("job_clicks").select("user_id").in("user_id", userIds),
      supabase.from("saved_jobs").select("user_id").in("user_id", userIds),
    ]);
    for (const c of clicks ?? []) jobClicksMap.set(c.user_id, (jobClicksMap.get(c.user_id) ?? 0) + 1);
    for (const s of saves ?? []) savedJobsMap.set(s.user_id, (savedJobsMap.get(s.user_id) ?? 0) + 1);
  }

  // Interview prep metrics: stories per user
  const storiesMap = new Map<string, number>();
  if (userIds.length > 0) {
    const { data: stories } = await supabase
      .from("stories")
      .select("user_id")
      .in("user_id", userIds)
      .eq("is_active", true);
    for (const s of stories ?? []) storiesMap.set(s.user_id, (storiesMap.get(s.user_id) ?? 0) + 1);
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
      target_role: roleMap.get(u.id) ?? null,
      job_clicks: jobClicksMap.get(u.id) ?? 0,
      saved_jobs: savedJobsMap.get(u.id) ?? 0,
      stories: storiesMap.get(u.id) ?? 0,
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
