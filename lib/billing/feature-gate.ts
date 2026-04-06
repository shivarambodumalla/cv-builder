// Re-export from limits for backwards compatibility
export { checkAndConsumeLimit } from "./limits";

import { createAdminClient } from "@/lib/supabase/admin";
import { checkAndConsumeLimit } from "./limits";

export async function checkFeatureAccess(
  userId: string,
  feature: string
) {
  const supabase = createAdminClient();
  return checkAndConsumeLimit(supabase, userId, feature);
}

export async function incrementUsage(
  _userId: string,
  _feature: string
) {
  // No-op — checkAndConsumeLimit now handles both check + increment
}
