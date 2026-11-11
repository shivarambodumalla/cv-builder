import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { DeletedAccountsTable } from "./deleted-accounts-table";

export const metadata: Metadata = {
  title: "Deleted Accounts | CVEdge Admin",
};

export const dynamic = "force-dynamic";

export interface DeletedAccount {
  user_id: string;
  user_number: number | null;
  email: string | null;
  signed_up_at: string | null;
  deleted_at: string;
  deleted_by: string;
  plan: string | null;
  subscription_status: string | null;
  subscription_id: string | null;
  subscription_period: string | null;
  current_period_end: string | null;
  subscription_cancelled: boolean;
  cancel_error: string | null;
}

export default async function DeletedAccountsPage() {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("account_deletions")
    .select("*")
    .order("deleted_at", { ascending: false });

  return <DeletedAccountsTable accounts={(data ?? []) as DeletedAccount[]} />;
}
