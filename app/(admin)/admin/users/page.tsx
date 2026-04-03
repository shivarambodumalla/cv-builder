import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminUsersTable } from "./users-table";

export const metadata: Metadata = {
  title: "Users — CVPilot Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = createAdminClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, full_name, plan, created_at")
    .order("created_at", { ascending: false });

  return <AdminUsersTable users={users ?? []} />;
}
