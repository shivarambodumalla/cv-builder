// Bing Webmaster summary in the terminal: the same report as the Bing section of
// /admin/marketing-analytics. Read-only (Get* methods only).
//
// Run: set -a; source .env.local; set +a; npx tsx scripts/bing-report.ts
//      ... scripts/bing-report.ts --days 90
//      ... scripts/bing-report.ts --all
//      ... scripts/bing-report.ts --from 2026-06-01 --to 2026-06-30
import { getBingReport, type BingTopRow } from "../lib/bing/client";

const DAY = 86_400_000;
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

function parseArgs() {
  const args = process.argv.slice(2);
  const val = (flag: string) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };
  // Same default window as the dashboard: 28 days ending three days ago.
  const to = val("--to") ?? (args.includes("--all") ? iso(Date.now()) : iso(Date.now() - 3 * DAY));
  if (args.includes("--all")) return { from: "2000-01-01", to, label: "all history" };
  const from = val("--from") ?? iso(Date.parse(to) - (Number(val("--days") ?? 28) - 1) * DAY);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    throw new Error("Dates must be YYYY-MM-DD");
  }
  return { from, to, label: `${from} to ${to}` };
}

const num = (n: number) => n.toLocaleString("en-US");
const pad = (s: string, w: number) => (s.length > w ? s.slice(0, w - 1) + "…" : s.padEnd(w));
const rpad = (s: string, w: number) => s.padStart(w);

function table(title: string, rows: BingTopRow[], labelOf: (k: string) => string) {
  console.log(`\n${title}`);
  if (!rows.length) return console.log("  (none in this range)");
  console.log(`  ${pad("", 58)}${rpad("Clicks", 7)}${rpad("Impr", 8)}${rpad("CTR", 8)}${rpad("Pos", 6)}`);
  for (const r of rows) {
    console.log(
      `  ${pad(labelOf(r.key), 58)}${rpad(num(r.clicks), 7)}${rpad(num(r.impressions), 8)}${rpad(`${r.ctr}%`, 8)}${rpad(String(r.position), 6)}`
    );
  }
}

const pageLabel = (url: string) => {
  const own = url.replace(/^https?:\/\/(www\.)?thecvedge\.com/, "");
  return own === url ? url.replace(/^https?:\/\//, "") : own || "/";
};

async function main() {
  const { from, to, label } = parseArgs();
  const report = await getBingReport(from, to, 15);

  if (report.status === "not_configured") {
    console.error("BING_WEBMASTER_API_KEY is not set. Run with: set -a; source .env.local; set +a; npx tsx scripts/bing-report.ts");
    process.exit(1);
  }
  if (report.status === "error") {
    console.error(`Bing request failed: ${report.message}`);
    process.exit(1);
  }

  const { summary, index } = report;
  console.log(`Bing Webmaster: ${label} (data through ${report.dataThrough ?? "n/a"})`);
  console.log(
    `  Clicks ${num(summary.clicks)} · Impressions ${num(summary.impressions)} · CTR ${summary.ctr}% · Avg position ${summary.position || "n/a"}`
  );

  console.log("\nMonthly (all history)");
  for (const m of report.monthly) {
    const ctr = m.impressions ? Math.round((m.clicks / m.impressions) * 10000) / 100 : 0;
    console.log(`  ${m.month}  ${rpad(num(m.clicks), 5)} clicks  ${rpad(num(m.impressions), 7)} impr  ${rpad(`${ctr}%`, 6)} CTR`);
  }

  table("Top queries", report.topQueries, (k) => k);
  table("Top pages", report.topPages, pageLabel);

  console.log(`\nIndex health (as of ${index.asOf ?? "n/a"})`);
  console.log(`  In index ${num(index.inIndex)} · Inlinks ${num(index.inLinks)} · Blocked by robots.txt ${num(index.blockedByRobotsTxt)}`);
  console.log(`  Latest crawl ${index.latestCrawl ?? "never"}`);
  console.log(
    `  In range: ${num(index.crawledPages)} pages crawled · ${num(index.crawlErrors)} crawl errors · 4xx ${index.code4xx} · 5xx ${index.code5xx}`
  );

  console.log("\nSitemaps");
  for (const s of report.sitemaps) {
    console.log(
      `  ${pad(pageLabel(s.url), 24)} ${pad(s.status, 9)} ${rpad(num(s.urlCount), 5)} URLs  last crawled ${s.lastCrawled?.slice(0, 10) ?? "never"}`
    );
  }
  console.log(`\nURL submission quota: ${report.quota.daily}/day, ${report.quota.monthly}/month`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
