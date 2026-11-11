import { createClient } from "@/lib/supabase/server";
import { PricingManager } from "./pricing-manager";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  const supabase = await createClient();

  const { data: configs } = await supabase
    .from("pricing_config")
    .select("*")
    .order("plan")
    .order("period");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pricing Configuration</h1>
      <p className="text-sm text-muted-foreground">
        Edit prices and Lemon Squeezy variant IDs. Changes take effect immediately.
      </p>
      <PricingManager initialConfigs={configs ?? []} />
    </div>
  );
}
