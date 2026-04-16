import { createAdminClient } from "@/lib/supabase/admin";
import { checkLimit, consumeLimit, checkAndConsumeLimit } from "./limits";

// Re-export for backward compat
export { checkAndConsumeLimit };

// Check-only: does NOT increment counter. Use before AI calls.
export async function checkFeatureAccess(
  userId: string,
  feature: string
) {
  const supabase = createAdminClient();
  return checkLimit(supabase, userId, feature);
}

// Consume: atomic increment AFTER a successful operation.
export async function incrementUsage(userId: string, feature: string): Promise<boolean> {
  const supabase = createAdminClient();
  return consumeLimit(supabase, userId, feature);
}
