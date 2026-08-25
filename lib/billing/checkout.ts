import { createAdminClient } from "@/lib/supabase/admin";
import { createCheckout } from "@/lib/lemonsqueezy";

export async function getCheckoutUrl(
  period: "weekly" | "monthly" | "yearly",
  userEmail: string,
  userId: string
): Promise<{ url: string; variantId: string | null }> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("pricing_config")
    .select("lemon_squeezy_variant_id")
    .eq("plan", "pro")
    .eq("period", period)
    .eq("enabled", true)
    .single();

  if (!data?.lemon_squeezy_variant_id) {
    return { url: "/pricing", variantId: null };
  }

  const url = await createCheckout(userId, userEmail, data.lemon_squeezy_variant_id, period);
  return { url, variantId: data.lemon_squeezy_variant_id };
}

export async function getPricingConfig() {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("pricing_config")
    .select("plan, period, original_price, sale_price, lemon_squeezy_variant_id, enabled")
    .eq("enabled", true)
    .order("plan")
    .order("period");

  return data ?? [];
}
