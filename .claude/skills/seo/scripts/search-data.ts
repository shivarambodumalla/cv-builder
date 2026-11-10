// Search performance snapshot for thecvedge.com: Google Search Console plus the
// site's own page_views table (server-side, unaffected by cookie consent).
// Read-only.
//
// Run from the repo root:
//   npx tsx .claude/skills/seo/scripts/search-data.ts            # 28d vs previous 28d
//   npx tsx .claude/skills/seo/scripts/search-data.ts --days 14
//   npx tsx .claude/skills/seo/scripts/search-data.ts --page '/blog/'   # one section
//   npx tsx .claude/skills/seo/scripts/search-data.ts --json out.json
//
// GSC data lags 2-3 days, so windows end 3 days ago. page_views windows end today.
import * as dotenv from "dotenv";
import { writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { getGscAccessToken, isGscConfigured } from "../../../../lib/gsc/client";

dotenv.config({ path: ".env.local" });

const DAY = 86_400_000;
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const args = process.argv.slice(2);
const val = (f: string) => (args.includes(f) ? args[args.indexOf(f) + 1] : undefined);
const DAYS = Number(val("--days") ?? 28);
const PAGE_RE = val("--page");
const JSON_OUT = val("--json");

type Row = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };

const n = (x: number) => Math.round(x).toLocaleString("en-US");
const pct = (a: number, b: number) => (b === 0 ? (a === 0 ? "0%" : "new") : `${a >= b ? "+" : ""}${Math.round(((a - b) / b) * 100)}%`);
const pad = (s: string, w: number) => (s.length > w ? s.slice(0, w - 1) + "…" : s.padEnd(w));
const rp = (s: string, w: number) => s.padStart(w);
const short = (url: string) => url.replace(/^https?:\/\/(www\.)?thecvedge\.com/, "") || "/";

async function gsc(token: string, site: string, body: object): Promise<Row[]> {
  const filter = PAGE_RE
    ? { dimensionFilterGroups: [{ filters: [{ dimension: "page", operator: "includingRegex", expression: PAGE_RE }] }] }
    : {};
  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ rowLimit: 1000, ...body, ...filter }),
    }
  );
  const json = await res.json();
  if (json.error) throw new Error(`GSC: ${json.error.message}`);
  return json.rows ?? [];
}

function totals(rows: Row[]) {
  const clicks = rows.reduce((s, r) => s + r.clicks, 0);
  const impressions = rows.reduce((s, r) => s + r.impressions, 0);
  const position = impressions ? rows.reduce((s, r) => s + r.position * r.impressions, 0) / impressions : 0;
  return { clicks, impressions, ctr: impressions ? (clicks / impressions) * 100 : 0, position };
}

async function gscSection(out: Record<string, unknown>) {
  if (!isGscConfigured()) {
    console.log("\nGSC not configured (GSC_SITE_URL + GOOGLE_OAUTH_* in .env.local). Skipping Search Console.");
    return;
  }
  // lib/gsc/client logs the raw Gaxios error on failure, which includes the
  // refresh token. Silence it here; we report the failure ourselves.
  const logError = console.error;
  console.error = () => {};
  const token = await getGscAccessToken().finally(() => { console.error = logError; });
  const site = process.env.GSC_SITE_URL!;
  if (!token)
    throw new Error(
      "token refresh failed (invalid_grant: the refresh token expired or was revoked). " +
        "Re-run `npx tsx scripts/get-gsc-token.ts`, update GOOGLE_OAUTH_REFRESH_TOKEN in .env.local and on Vercel. " +
        "If the Google Cloud OAuth consent screen is in Testing mode, tokens expire every 7 days: publish it to Production."
    );

  const end = Date.now() - 3 * DAY;
  const cur = { startDate: iso(end - (DAYS - 1) * DAY), endDate: iso(end) };
  const prev = { startDate: iso(end - (2 * DAYS - 1) * DAY), endDate: iso(end - DAYS * DAY) };

  const [trend, pagesCur, pagesPrev, queriesCur, queriesPrev, countries, queryPages] = await Promise.all([
    gsc(token, site, { startDate: iso(end - 89 * DAY), endDate: iso(end), dimensions: ["date"] }),
    gsc(token, site, { ...cur, dimensions: ["page"] }),
    gsc(token, site, { ...prev, dimensions: ["page"] }),
    gsc(token, site, { ...cur, dimensions: ["query"] }),
    gsc(token, site, { ...prev, dimensions: ["query"] }),
    gsc(token, site, { ...cur, dimensions: ["country"] }),
    gsc(token, site, { ...cur, dimensions: ["query", "page"], rowLimit: 5000 }),
  ]);

  console.log(`\n=== Google Search Console${PAGE_RE ? ` (pages matching ${PAGE_RE})` : ""} ===`);
  console.log(`Current ${cur.startDate}..${cur.endDate}  vs  previous ${prev.startDate}..${prev.endDate}`);
  const tc = totals(pagesCur), tp = totals(pagesPrev);
  console.log(`  Clicks       ${rp(n(tc.clicks), 8)}  (prev ${n(tp.clicks)}, ${pct(tc.clicks, tp.clicks)})`);
  console.log(`  Impressions  ${rp(n(tc.impressions), 8)}  (prev ${n(tp.impressions)}, ${pct(tc.impressions, tp.impressions)})`);
  console.log(`  CTR          ${rp(tc.ctr.toFixed(2) + "%", 8)}  (prev ${tp.ctr.toFixed(2)}%)`);
  console.log(`  Avg position ${rp(tc.position.toFixed(1), 8)}  (prev ${tp.position.toFixed(1)})`);

  // Weekly buckets of the 90-day trend: daily GSC numbers are too noisy to read.
  console.log("\n90-day trend by week (week starting):");
  const weeks: Record<string, { c: number; i: number; pw: number }> = {};
  for (const r of trend) {
    const d = new Date(r.keys[0] + "T00:00:00Z");
    const wk = iso(d.getTime() - ((d.getUTCDay() + 6) % 7) * DAY);
    const w = (weeks[wk] ??= { c: 0, i: 0, pw: 0 });
    w.c += r.clicks; w.i += r.impressions; w.pw += r.position * r.impressions;
  }
  const maxI = Math.max(1, ...Object.values(weeks).map((w) => w.i));
  console.log(`  ${pad("week", 11)}${rp("clicks", 7)}${rp("impr", 8)}${rp("pos", 6)}`);
  for (const [wk, w] of Object.entries(weeks).sort()) {
    console.log(`  ${pad(wk, 11)}${rp(n(w.c), 7)}${rp(n(w.i), 8)}${rp(w.i ? (w.pw / w.i).toFixed(1) : "-", 6)}  ${"█".repeat(Math.round((w.i / maxI) * 30))}`);
  }

  // Page winners / losers by clicks, then impressions as the tiebreak.
  const prevMap = new Map(pagesPrev.map((r) => [r.keys[0], r]));
  const curMap = new Map(pagesCur.map((r) => [r.keys[0], r]));
  const allPages = new Set([...prevMap.keys(), ...curMap.keys()]);
  const deltas = [...allPages].map((p) => {
    const c = curMap.get(p), q = prevMap.get(p);
    return {
      page: short(p),
      clicks: c?.clicks ?? 0, prevClicks: q?.clicks ?? 0,
      impr: c?.impressions ?? 0, prevImpr: q?.impressions ?? 0,
      pos: c?.position ?? null, prevPos: q?.position ?? null,
    };
  });
  const byLoss = [...deltas].sort((a, b) => (a.clicks - a.prevClicks) - (b.clicks - b.prevClicks) || (a.impr - a.prevImpr) - (b.impr - b.prevImpr));
  const printPages = (title: string, rows: typeof deltas) => {
    console.log(`\n${title}`);
    console.log(`  ${pad("page", 56)}${rp("clicks", 12)}${rp("impr", 14)}${rp("pos", 12)}`);
    for (const r of rows)
      console.log(`  ${pad(r.page, 56)}${rp(`${r.prevClicks}→${r.clicks}`, 12)}${rp(`${r.prevImpr}→${r.impr}`, 14)}${rp(`${r.prevPos?.toFixed(1) ?? "-"}→${r.pos?.toFixed(1) ?? "-"}`, 12)}`);
  };
  printPages("Biggest losers (clicks, then impressions):", byLoss.slice(0, 15));
  printPages("Biggest winners:", byLoss.slice(-10).reverse());

  // Striking distance: page 1-2 rankings with real demand, where a better title
  // or more depth moves the most clicks.
  const striking = queriesCur
    .filter((r) => r.position >= 4 && r.position <= 20 && r.impressions >= 20)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20);
  console.log("\nStriking-distance queries (position 4-20, 20+ impressions):");
  console.log(`  ${pad("query", 52)}${rp("impr", 7)}${rp("clicks", 7)}${rp("pos", 6)}`);
  for (const r of striking) console.log(`  ${pad(r.keys[0], 52)}${rp(n(r.impressions), 7)}${rp(n(r.clicks), 7)}${rp(r.position.toFixed(1), 6)}`);

  // Low CTR at a good position usually means the title/description loses the click.
  const lowCtr = pagesCur
    .filter((r) => r.position <= 8 && r.impressions >= 100 && r.ctr < 0.02)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 10);
  console.log("\nLow-CTR pages (position ≤ 8, 100+ impressions, CTR < 2%):");
  if (!lowCtr.length) console.log("  (none)");
  for (const r of lowCtr) console.log(`  ${pad(short(r.keys[0]), 60)} impr ${n(r.impressions)}  ctr ${(r.ctr * 100).toFixed(1)}%  pos ${r.position.toFixed(1)}`);

  // Cannibalisation: one query split across several of our pages.
  const byQuery = new Map<string, Row[]>();
  for (const r of queryPages) (byQuery.get(r.keys[0]) ?? byQuery.set(r.keys[0], []).get(r.keys[0])!).push(r);
  const cannibal = [...byQuery.entries()]
    .map(([q, rows]) => ({ q, rows: rows.filter((r) => r.impressions >= 10).sort((a, b) => b.impressions - a.impressions) }))
    .filter((x) => x.rows.length >= 2)
    .sort((a, b) => b.rows.reduce((s, r) => s + r.impressions, 0) - a.rows.reduce((s, r) => s + r.impressions, 0))
    .slice(0, 10);
  console.log("\nPossible cannibalisation (one query, 2+ pages with 10+ impressions):");
  if (!cannibal.length) console.log("  (none)");
  for (const c of cannibal) console.log(`  "${c.q}": ${c.rows.slice(0, 4).map((r) => `${short(r.keys[1])} (${r.impressions}i, pos ${r.position.toFixed(1)})`).join(" | ")}`);

  // Market split. The focus market is the US.
  const tot = countries.reduce((s, r) => s + r.impressions, 0) || 1;
  console.log("\nTop countries by impressions:");
  for (const r of countries.sort((a, b) => b.impressions - a.impressions).slice(0, 8))
    console.log(`  ${pad(r.keys[0].toUpperCase(), 6)}${rp(n(r.impressions), 8)} impr ${rp(((r.impressions / tot) * 100).toFixed(1) + "%", 7)}  ${rp(n(r.clicks), 5)} clicks  pos ${r.position.toFixed(1)}`);

  const lostQueries = (() => {
    const curQ = new Map(queriesCur.map((r) => [r.keys[0], r]));
    return queriesPrev
      .map((r) => ({ q: r.keys[0], prev: r, cur: curQ.get(r.keys[0]) }))
      .filter((x) => x.prev.clicks >= 2 && (x.cur?.clicks ?? 0) < x.prev.clicks / 2)
      .sort((a, b) => b.prev.clicks - a.prev.clicks)
      .slice(0, 15);
  })();
  console.log("\nQueries that lost half their clicks or more:");
  if (!lostQueries.length) console.log("  (none)");
  for (const x of lostQueries)
    console.log(`  ${pad(x.q, 52)} clicks ${x.prev.clicks}→${x.cur?.clicks ?? 0}  pos ${x.prev.position.toFixed(1)}→${x.cur?.position.toFixed(1) ?? "gone"}`);

  Object.assign(out, { gsc: { cur, prev, totals: { cur: tc, prev: tp }, trend, deltas, striking, lowCtr, cannibal, countries, lostQueries } });
}

async function pageViewsSection(out: Record<string, unknown>) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log("\nSupabase env missing. Skipping page_views.");
    return;
  }
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const since = iso(Date.now() - (2 * DAYS - 1) * DAY);
  const rows: { path: string; view_date: string; count: number }[] = [];
  for (let f = 0; ; f += 1000) {
    const { data, error } = await s.from("page_views").select("path,view_date,count").gte("view_date", since).range(f, f + 999);
    if (error) throw new Error(`page_views: ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  const re = PAGE_RE ? new RegExp(PAGE_RE) : null;
  const real = rows.filter((r) => !r.path.startsWith("/popup") && (!re || re.test(r.path)));
  const split = iso(Date.now() - (DAYS - 1) * DAY);
  const sum = (from: string, to: string) => {
    const m: Record<string, number> = {};
    for (const r of real) if (r.view_date >= from && r.view_date <= to) m[r.path] = (m[r.path] ?? 0) + r.count;
    return m;
  };
  const cur = sum(split, "9999"), prev = sum(since, iso(Date.parse(split) - DAY));
  const t = (m: Record<string, number>) => Object.values(m).reduce((a, b) => a + b, 0);
  console.log(`\n=== Site page_views (server-side, all sources, consent-independent) ===`);
  console.log(`  Views: ${n(t(cur))} last ${DAYS}d vs ${n(t(prev))} previous (${pct(t(cur), t(prev))})`);

  const daily: Record<string, number> = {};
  for (const r of real) daily[r.view_date] = (daily[r.view_date] ?? 0) + r.count;
  console.log("  Daily (last 14):", Object.entries(daily).sort().slice(-14).map(([d, v]) => `${d.slice(5)}:${v}`).join(" "));

  const paths = [...new Set([...Object.keys(cur), ...Object.keys(prev)])]
    .map((p) => ({ p, c: cur[p] ?? 0, q: prev[p] ?? 0 }))
    .sort((a, b) => (a.c - a.q) - (b.c - b.q));
  console.log("\n  Paths losing the most views:");
  for (const x of paths.slice(0, 12)) console.log(`    ${pad(x.p, 60)} ${x.q}→${x.c}`);
  console.log("  Paths gaining the most views:");
  for (const x of paths.slice(-8).reverse()) console.log(`    ${pad(x.p, 60)} ${x.q}→${x.c}`);
  Object.assign(out, { pageViews: { daily, paths } });
}

(async () => {
  const out: Record<string, unknown> = {};
  try { await gscSection(out); } catch (e) { console.log(`\nGSC failed: ${(e as Error).message}`); }
  try { await pageViewsSection(out); } catch (e) { console.log(`\npage_views failed: ${(e as Error).message}`); }
  console.log("\nBing: npx tsx scripts/bing-report.ts (Bing Webmaster, same window logic)");
  if (JSON_OUT) { writeFileSync(JSON_OUT, JSON.stringify(out, null, 2)); console.log(`JSON written to ${JSON_OUT}`); }
})();
