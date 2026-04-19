import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns a unique CV title for a user.
 * If "My CV" already exists, returns "My CV (2)", then "My CV (3)", etc.
 */
export async function uniqueCvTitle(
  admin: SupabaseClient,
  userId: string,
  baseTitle: string
): Promise<string> {
  const { data: existing } = await admin
    .from("cvs")
    .select("title")
    .eq("user_id", userId)
    .like("title", `${baseTitle}%`);

  if (!existing || existing.length === 0) return baseTitle;

  const titles = new Set(existing.map((r: { title: string }) => r.title));

  if (!titles.has(baseTitle)) return baseTitle;

  let n = 2;
  while (titles.has(`${baseTitle} (${n})`)) n++;
  return `${baseTitle} (${n})`;
}
