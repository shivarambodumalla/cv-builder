/**
 * Post-deploy check for the keyword_generate truncation fix.
 *
 * keyword_generate ran at max_tokens=512 while a normal response needs ~500
 * tokens, so most calls truncated, failed to parse, were discarded, and the CV
 * was scored against generic filler keywords instead of its own vocabulary.
 * The fix cannot be verified locally because the Gemini key in .env.local is
 * not valid, so this reads the evidence back out of production instead.
 *
 *   npx tsx scripts/verify-ats-keywords.ts           # last 24h
 *   npx tsx scripts/verify-ats-keywords.ts --hours 72
 *
 * Exits non-zero if the evidence says the bug is still live.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const hoursArg = process.argv.indexOf("--hours");
const HOURS = hoursArg > -1 ? Number(process.argv[hoursArg + 1]) : 24;

async function main() {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const failures: string[] = [];

  // 1. The cap itself must still be raised. Re-seeding used to reset it.
  const { data: setting } = await db
    .from("ai_settings")
    .select("max_tokens, updated_at")
    .eq("feature", "keyword_generate")
    .single();
  const cap = setting?.max_tokens ?? 0;
  console.log(`1. keyword_generate max_tokens = ${cap}`);
  if (cap < 2048) {
    console.log("\nFAIL\n  - max_tokens is back below 2048; the cap was reverted.");
    process.exit(1);
  }

  // Only calls made after the cap was raised say anything about the fix. Older
  // ones ran under 512 and will always look truncated.
  const capChangedAt = setting?.updated_at as string;
  const windowStart = new Date(Date.now() - HOURS * 3600 * 1000).toISOString();
  const since = capChangedAt > windowStart ? capChangedAt : windowStart;
  console.log(`   cap raised at ${capChangedAt}`);
  console.log(`   judging calls since ${since} (last ${HOURS}h, floored at the cap change)`);

  // 2. Responses must finish well clear of the cap. Landing on it means the
  //    JSON was cut mid-object and thrown away.
  const { data: calls } = await db
    .from("ai_usage_logs")
    .select("output_tokens, status, created_at")
    .eq("feature", "keyword_generate")
    .gte("created_at", since);

  const tokens = (calls ?? []).map((c: { output_tokens: number }) => c.output_tokens).filter(Boolean);
  console.log(`\n2. keyword_generate calls since the fix: ${tokens.length}`);
  if (tokens.length === 0) {
    console.log(`\n${"=".repeat(60)}`);
    console.log("INCONCLUSIVE — no generations have run under the new cap yet.");
    console.log("Deploy, let a CV with an uncurated target role be analysed, then re-run.");
    return;
  }
  {
    const nearCap = tokens.filter((t) => t >= cap * 0.95).length;
    const max = Math.max(...tokens);
    const avg = Math.round(tokens.reduce((a, b) => a + b, 0) / tokens.length);
    console.log(`   avg=${avg}  max=${max}  at/near cap=${nearCap}/${tokens.length}`);
    if (nearCap > 0) failures.push(`${nearCap} call(s) finished within 5% of the ${cap} cap — still truncating`);
  }

  // 3. A successful generation is cached, so generations should roughly match
  //    newly cached roles. Many generations and few new rows means the cache
  //    write is failing and every analysis pays to regenerate.
  const { data: freshRoles } = await db
    .from("keyword_lists")
    .select("role, updated_at")
    .gte("updated_at", since);
  console.log(`\n3. roles cached in window: ${freshRoles?.length ?? 0}`);
  freshRoles?.forEach((r: { role: string }) => console.log(`   ${r.role}`));
  if (tokens.length > 0 && (freshRoles?.length ?? 0) === 0) {
    failures.push(`${tokens.length} generation(s) produced zero cached roles — results are being discarded`);
  }

  // 4. The tracker that shows which roles need curation.
  const { count: missingCount } = await db
    .from("missing_roles")
    .select("*", { count: "exact", head: true });
  const { data: recentMissing } = await db
    .from("missing_roles")
    .select("role_name, domain, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(15);
  console.log(`\n4. missing_roles: ${missingCount ?? 0} total, ${recentMissing?.length ?? 0} in window`);
  recentMissing?.forEach((r: { role_name: string; domain: string | null }) =>
    console.log(`   "${r.role_name}"  domain=${r.domain ?? "-"}`)
  );
  if (tokens.length > 0 && (recentMissing?.length ?? 0) === 0) {
    failures.push("generations happened but no missing_roles rows were written — the tracker is still blind");
  }

  console.log(`\n${"=".repeat(60)}`);
  if (failures.length === 0) {
    console.log("PASS — keyword generation is completing, caching, and being tracked.");
    return;
  }
  console.log("FAIL");
  failures.forEach((f) => console.log(`  - ${f}`));
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
