import { createAdminClient } from "@/lib/supabase/admin";
import { PricingManager } from "./pricing-manager";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  const supabase = createAdminClient();

  const { data: configs } = await supabase
    .from("pricing_config")
    .select("*")
    .order("plan")
    .order("period");

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold tracking-tight">Pricing Configuration</h2>
      <p className="text-sm text-muted-foreground">
        Edit prices and Lemon Squeezy variant IDs. Changes take effect immediately.
      </p>
      <PricingManager initialConfigs={configs ?? []} />
    </div>
  );
}
