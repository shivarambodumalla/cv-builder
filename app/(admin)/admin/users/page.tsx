import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminUsersTable } from "./users-table";

export const metadata: Metadata = {
  title: "Users — CVEdge Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = createAdminClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, full_name, plan, subscription_status, created_at")
    .order("created_at", { ascending: false });

  // Get last activity for each user (latest CV updated_at)
  const userIds = (users ?? []).map((u) => u.id);
  const lastActivityMap: Record<string, string> = {};

  if (userIds.length > 0) {
    const { data: cvs } = await supabase
      .from("cvs")
      .select("user_id, updated_at")
      .in("user_id", userIds)
      .order("updated_at", { ascending: false });

    if (cvs) {
      for (const cv of cvs) {
        if (!lastActivityMap[cv.user_id]) {
          lastActivityMap[cv.user_id] = cv.updated_at;
        }
      }
    }
  }

  const usersWithActivity = (users ?? []).map((u) => ({
    ...u,
    last_active: lastActivityMap[u.id] || null,
  }));

  return <AdminUsersTable users={usersWithActivity} />;
}
