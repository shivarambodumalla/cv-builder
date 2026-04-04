import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BillingContent } from "./billing-content";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, ls_subscription_id")
    .eq("id", user.id)
    .single();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Billing</h1>
      <BillingContent
        currentPlan={profile?.plan ?? "free"}
        subscriptionId={profile?.ls_subscription_id ?? null}
      />
    </div>
  );
}
