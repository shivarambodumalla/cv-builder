import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { MissingRolesTable } from "./missing-roles-table";

export const metadata: Metadata = {
  title: "Missing Roles — CVEdge Admin",
};

export const dynamic = "force-dynamic";

interface MissingRoleRow {
  id: string;
  role_name: string;
  domain: string | null;
  user_id: string;
  created_at: string;
  profiles: { email: string }[] | { email: string } | null;
}

export interface GroupedMissingRole {
  id: string;
  role_name: string;
  domain: string | null;
  count: number;
  first_requested_by: string;
  first_requested_at: string;
}

export default async function MissingRolesPage() {
  const supabase = createAdminClient();

  const { data: rows } = await supabase
    .from("missing_roles")
    .select("id, role_name, domain, user_id, created_at, profiles(email)")
    .order("created_at", { ascending: true });

  const grouped = new Map<string, GroupedMissingRole>();

  for (const row of (rows ?? []) as MissingRoleRow[]) {
    const key = row.role_name.toLowerCase();
    const existing = grouped.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      grouped.set(key, {
        id: row.id,
        role_name: row.role_name,
        domain: row.domain,
        count: 1,
        first_requested_by: (Array.isArray(row.profiles)
          ? row.profiles[0]?.email
          : row.profiles?.email) ?? "Unknown",
        first_requested_at: row.created_at,
      });
    }
  }

  const missingRoles = Array.from(grouped.values()).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return (
      new Date(b.first_requested_at).getTime() -
      new Date(a.first_requested_at).getTime()
    );
  });

  return <MissingRolesTable missingRoles={missingRoles} />;
}
