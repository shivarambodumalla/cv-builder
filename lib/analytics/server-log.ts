/* eslint-disable @typescript-eslint/no-explicit-any */
// Server-side activity log. Same shape as lib/analytics/log.ts but for API
// routes — used to record events the client never sees, like 403s from
// limit checks. Fire-and-forget: never block the response, never throw.

export function logServerActivity(
  supabase: any,
  userId: string,
  event: string,
  metadata: Record<string, unknown> = {},
  page: string | null = null
): void {
  if (!userId || !event) return;
  supabase
    .from("user_activity")
    .insert({
      user_id: userId,
      event: event.slice(0, 200),
      page: page ? page.slice(0, 512) : null,
      metadata,
    })
    .then(() => undefined, () => undefined);
}
