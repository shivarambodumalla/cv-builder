import { createAdminClient } from "@/lib/supabase/admin";

export async function getCheckoutUrl(
  period: "weekly" | "monthly" | "yearly",
  userEmail: string,
  userId: string
): Promise<string> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("pricing_config")
    .select("lemon_squeezy_variant_id")
    .eq("plan", "pro")
    .eq("period", period)
    .eq("enabled", true)
    .single();

  if (!data?.lemon_squeezy_variant_id) {
    return "/pricing";
  }

  const variantId = data.lemon_squeezy_variant_id;
  const email = encodeURIComponent(userEmail);

  return `https://checkout.lemonsqueezy.com/buy/${variantId}?checkout[email]=${email}&checkout[custom][user_id]=${userId}`;
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
