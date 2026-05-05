import type { Metadata } from "next";
import { UsersClient } from "@/components/admin/users/users-client";

export const metadata: Metadata = {
  title: "Users | CVEdge Admin",
};

export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  return <UsersClient />;
}
