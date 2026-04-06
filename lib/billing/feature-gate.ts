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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function incrementUsage(_userId: string, _feature: string) {
  // No-op — checkAndConsumeLimit now handles both check + increment
}
