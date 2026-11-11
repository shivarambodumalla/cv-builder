import { createAdminClient } from "@/lib/supabase/admin";

// Users excluded from all admin analytics (test accounts, bots, etc.)
// Add user IDs here to exclude them from funnel, interventions, jobs analytics, and AI usage
export const EXCLUDED_USER_IDS = [
  "84b43241-814c-4fce-8afa-0bcd10a0635c", // E2E test user
];

/** ADMIN_EMAIL (comma list), lower-cased. */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

const INTERNAL_TTL_MS = 60_000;
let internalCache: { at: number; ids: Promise<Set<string>> } | null = null;

/**
 * Every account kept out of admin numbers: EXCLUDED_USER_IDS plus the
 * profiles of the ADMIN_EMAIL addresses. Memoised for a minute so a page's
 * blocks share one lookup. If the lookup fails the static list still applies,
 * the failure is logged, and the next call retries.
 */
export function internalUserIds(): Promise<Set<string>> {
  if (internalCache && Date.now() - internalCache.at < INTERNAL_TTL_MS) return internalCache.ids;
  const ids = lookupInternalUserIds();
  internalCache = { at: Date.now(), ids };
  return ids;
}

async function lookupInternalUserIds(): Promise<Set<string>> {
  const ids = new Set(EXCLUDED_USER_IDS);
  const emails = adminEmails();
  if (emails.length === 0) return ids;
  // profiles.email keeps the provider's casing, so match both spellings.
  const raw = (process.env.ADMIN_EMAIL ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  const { data, error } = await createAdminClient()
    .from("profiles")
    .select("id, email")
    .in("email", Array.from(new Set([...emails, ...raw])));
  if (error) {
    console.error("[admin] internal user lookup failed:", error.message);
    internalCache = null;
  }
  for (const p of data ?? []) ids.add(p.id);
  return ids;
}
