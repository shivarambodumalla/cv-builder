// Live crawl of thecvedge.com's sitemap for indexing and markup problems.
// Read-only, polite (default 4 concurrent requests). No dependencies beyond Node.
//
// Run from the repo root:
//   npx tsx .claude/skills/seo/scripts/crawl.ts
//   npx tsx .claude/skills/seo/scripts/crawl.ts --match '/blog/' --limit 50
//   npx tsx .claude/skills/seo/scripts/crawl.ts --base http://localhost:3000 --json /tmp/crawl.json
import { writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const val = (f: string) => (args.includes(f) ? args[args.indexOf(f) + 1] : undefined);
const BASE = (val("--base") ?? "https://www.thecvedge.com").replace(/\/$/, "");
const MATCH = val("--match") ? new RegExp(val("--match")!) : null;
const LIMIT = Number(val("--limit") ?? Infinity);
const CONC = Number(val("--concurrency") ?? 4);
const JSON_OUT = val("--json");
const UA = "Mozilla/5.0 (compatible; CVEdgeSEOAudit/1.0)";
const SLOW_MS = 1500;

type Page = {
  url: string; status: number; location?: string; ms: number; cache?: string; xRobots?: string;
  title?: string; description?: string; canonical?: string; robots?: string;
  h1: string[]; ogImage?: string; jsonLdTypes: string[]; jsonLdErrors: number;
  hreflang: { lang: string; href: string }[]; links: string[]; words: number; imgNoAlt: number;
};

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
const attr = (tag: string, name: string) => tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"))?.slice(1).find((x) => x !== undefined);
const metaContent = (html: string, key: string, by = "name") => {
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) if (attr(m[0], by)?.toLowerCase() === key) return decode(attr(m[0], "content") ?? "");
  return undefined;
};
const norm = (u: string) => {
  try { const x = new URL(u, BASE); x.hash = ""; return x.origin + (x.pathname.replace(/\/$/, "") || "/") + x.search; } catch { return u; }
};
const path = (u: string) => u.replace(BASE, "") || "/";

async function get(url: string, redirect: RequestRedirect = "manual") {
  const t = Date.now();
  const res = await fetch(url, { redirect, headers: { "User-Agent": UA, Accept: "text/html,application/xml" }, signal: AbortSignal.timeout(20000) });
  const body = res.status === 200 ? await res.text() : "";
  return { res, body, ms: Date.now() - t };
}

async function sitemapUrls(): Promise<string[]> {
  const robots = (await get(`${BASE}/robots.txt`, "follow")).body;
  const maps = [...robots.matchAll(/^sitemap:\s*(\S+)/gim)].map((m) => m[1]);
  if (!maps.length) maps.push(`${BASE}/sitemap.xml`);
  const out = new Set<string>();
  const seen = new Set<string>();
  const queue = [...maps];
  while (queue.length) {
    const m = queue.shift()!;
    if (seen.has(m)) continue;
    seen.add(m);
    const xml = (await get(m.replace(/^https?:\/\/(www\.)?thecvedge\.com/, BASE), "follow")).body;
    const locs = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((x) => decode(x[1]));
    if (/<sitemapindex/i.test(xml)) queue.push(...locs);
    // image sitemaps list page URLs in <loc> and images in <image:loc>; only take page locs
    else for (const l of [...xml.matchAll(/<url>\s*<loc>\s*([^<]+?)\s*<\/loc>/g)].map((x) => decode(x[1]))) out.add(l);
  }
  console.log(`robots.txt sitemaps: ${maps.join(", ")}`);
  return [...out].map((u) => u.replace(/^https?:\/\/(www\.)?thecvedge\.com/, BASE));
}

function parse(url: string, html: string): Omit<Page, "url" | "status" | "ms"> {
  const head = html.slice(0, html.search(/<\/head>/i) + 1 || 200000);
  const title = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  let canonical: string | undefined, ogImage: string | undefined;
  const hreflang: Page["hreflang"] = [];
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const rel = attr(m[0], "rel")?.toLowerCase();
    if (rel === "canonical") canonical = attr(m[0], "href");
    if (rel === "alternate" && attr(m[0], "hreflang")) hreflang.push({ lang: attr(m[0], "hreflang")!, href: attr(m[0], "href") ?? "" });
  }
  ogImage = metaContent(html, "og:image", "property");
  const jsonLdTypes: string[] = [];
  let jsonLdErrors = 0;
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const j = JSON.parse(m[1]);
      const walk = (x: any) => {
        if (Array.isArray(x)) return x.forEach(walk);
        if (x && typeof x === "object") { if (x["@type"]) jsonLdTypes.push(...[].concat(x["@type"])); if (x["@graph"]) walk(x["@graph"]); }
      };
      walk(j);
    } catch { jsonLdErrors++; }
  }
  const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => decode(m[1].replace(/<[^>]+>/g, " ")));
  const links = new Set<string>();
  for (const m of html.matchAll(/<a\b[^>]*>/gi)) {
    const href = attr(m[0], "href");
    if (!href || /^(mailto:|tel:|javascript:|#)/.test(href)) continue;
    const abs = norm(href);
    if (abs.startsWith(BASE) && !/\/(api|admin|auth)\//.test(abs)) links.add(abs);
  }
  const main = html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ?? html;
  const text = main.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
  const imgNoAlt = [...main.matchAll(/<img\b[^>]*>/gi)].filter((m) => attr(m[0], "alt") === undefined).length;
  return {
    title: title !== undefined ? decode(title) : undefined,
    description: metaContent(html, "description"),
    canonical, robots: metaContent(html, "robots"), h1, ogImage, jsonLdTypes, jsonLdErrors, hreflang,
    links: [...links], words: decode(text).split(" ").filter(Boolean).length, imgNoAlt,
  };
}

async function pool<T, R>(items: T[], n: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]); } }));
  return out;
}

(async () => {
  let urls = await sitemapUrls();
  const total = urls.length;
  if (MATCH) urls = urls.filter((u) => MATCH.test(path(u)));
  urls = urls.slice(0, LIMIT);
  console.log(`Sitemap URLs: ${total}; crawling ${urls.length} from ${BASE}\n`);

  let done = 0;
  const pages: Page[] = await pool(urls, CONC, async (url) => {
    try {
      const { res, body, ms } = await get(url);
      if (++done % 25 === 0) process.stderr.write(`  ${done}/${urls.length}\n`);
      const base = { url, status: res.status, ms, cache: res.headers.get("x-vercel-cache") ?? undefined, xRobots: res.headers.get("x-robots-tag") ?? undefined, location: res.headers.get("location") ?? undefined };
      return res.status === 200 ? { ...base, ...parse(url, body) } : { ...base, h1: [], jsonLdTypes: [], jsonLdErrors: 0, hreflang: [], links: [], words: 0, imgNoAlt: 0 };
    } catch (e) {
      return { url, status: 0, ms: 0, location: String((e as Error).message), h1: [], jsonLdTypes: [], jsonLdErrors: 0, hreflang: [], links: [], words: 0, imgNoAlt: 0 };
    }
  });

  const ok = pages.filter((p) => p.status === 200);
  const issues: Record<string, string[]> = {};
  const add = (k: string, s: string) => (issues[k] ??= []).push(s);

  for (const p of pages) {
    const u = path(p.url);
    if (p.status !== 200) add(`Sitemap URL not 200`, `${u} → ${p.status}${p.location ? ` ${path(p.location)}` : ""}`);
  }
  for (const p of ok) {
    const u = path(p.url);
    const noindex = /noindex/i.test(p.robots ?? "") || /noindex/i.test(p.xRobots ?? "");
    if (noindex) add("Sitemap URL is noindex", u);
    if (!p.canonical) add("Missing canonical", u);
    else if (norm(p.canonical) !== norm(p.url)) add("Canonical points elsewhere (shouldn't be in sitemap)", `${u} → ${path(norm(p.canonical))}`);
    if (!p.title) add("Missing <title>", u);
    else {
      if (p.title.length > 60) add("Title over 60 chars (truncated in Google)", `${u} (${p.title.length}): ${p.title}`);
      if (p.title.length < 25) add("Title under 25 chars", `${u}: ${p.title}`);
      if ((p.title.match(/CVEdge/g) ?? []).length > 1) add("Brand repeated in title", `${u}: ${p.title}`);
    }
    if (!p.description) add("Missing meta description", u);
    else if (p.description.length > 160) add("Description over 160 chars", `${u} (${p.description.length})`);
    else if (p.description.length < 70) add("Description under 70 chars", `${u} (${p.description.length}): ${p.description}`);
    if (p.h1.length === 0) add("No <h1>", u);
    if (p.h1.length > 1) add("Multiple <h1>", `${u}: ${p.h1.slice(0, 3).join(" | ")}`);
    if (p.jsonLdErrors) add("JSON-LD that doesn't parse", u);
    if (p.jsonLdTypes.includes("AggregateRating")) add("AggregateRating present (verify it comes from getPublicRatingStats)", u);
    if (!p.ogImage) add("Missing og:image", u);
    if (p.ms > SLOW_MS) add(`Slow response (> ${SLOW_MS} ms)`, `${u} ${p.ms} ms (cache ${p.cache ?? "-"})`);
    if (p.imgNoAlt) add("Images without alt", `${u} (${p.imgNoAlt})`);
    if (p.words < 250) add("Under 250 words in <main> (includes chrome; confirm with audit-content-quality.ts)", `${u} (${p.words})`);
    for (const h of p.hreflang) if (!h.href.startsWith("http")) add("Relative hreflang href", `${u} ${h.lang}=${h.href}`);
  }

  // Uncached: the first hit after a deploy is a legitimate MISS for ISR pages, so
  // re-request each MISS once and flag only repeat misses. /career-path/[role]
  // renders per request on purpose (CLAUDE.md, Career Path).
  const DELIBERATELY_DYNAMIC = /^\/career-path\/(?!plan\/|continue\/)[^/]+$/;
  const misses = ok.filter((p) => p.cache && !/HIT|STALE|PRERENDER/i.test(p.cache) && !DELIBERATELY_DYNAMIC.test(path(p.url)));
  const recheck = await pool(misses, CONC, async (p) => {
    try { const r = await fetch(p.url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) }); await r.arrayBuffer(); return { p, cache: r.headers.get("x-vercel-cache") ?? "" }; }
    catch { return { p, cache: "error" }; }
  });
  for (const { p, cache } of recheck)
    if (!/HIT|STALE|PRERENDER/i.test(cache)) add("Served uncached twice in a row (renders per request; Active CPU)", `${path(p.url)} x-vercel-cache=${p.cache}→${cache}`);

  // Duplicates
  const dup = (key: "title" | "description", label: string) => {
    const m = new Map<string, string[]>();
    for (const p of ok) if (p[key]) (m.get(p[key]!) ?? m.set(p[key]!, []).get(p[key]!)!).push(path(p.url));
    for (const [v, us] of m) if (us.length > 1) add(label, `${us.length}× "${v.slice(0, 70)}": ${us.slice(0, 4).join(", ")}`);
  };
  dup("title", "Duplicate titles");
  dup("description", "Duplicate descriptions");

  // hreflang reciprocity
  const byUrl = new Map(ok.map((p) => [norm(p.url), p]));
  for (const p of ok) for (const h of p.hreflang) {
    const target = byUrl.get(norm(h.href.replace(/^https?:\/\/(www\.)?thecvedge\.com/, BASE)));
    if (target && !target.hreflang.some((x) => norm(x.href.replace(/^https?:\/\/(www\.)?thecvedge\.com/, BASE)) === norm(p.url)))
      add("hreflang not reciprocal", `${path(p.url)} → ${h.lang} ${path(h.href)} (no link back)`);
  }

  // Inbound internal links → orphans (only meaningful on a full crawl)
  const inbound = new Map<string, number>();
  for (const p of ok) for (const l of p.links) if (norm(l) !== norm(p.url)) inbound.set(norm(l), (inbound.get(norm(l)) ?? 0) + 1);
  if (!MATCH && LIMIT === Infinity)
    for (const p of ok) if (!inbound.get(norm(p.url))) add("Orphan (no internal links from other sitemap pages)", path(p.url));

  // Internal links not in the sitemap: check they resolve, flag redirects and errors.
  const inSitemap = new Set(pages.map((p) => norm(p.url)));
  const extra = [...inbound.keys()].filter((l) => !inSitemap.has(l)).slice(0, 400);
  const linkResults = await pool(extra, CONC, async (l) => {
    try { const r = await fetch(l, { method: "HEAD", redirect: "manual", headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15000) }); return { l, s: r.status, loc: r.headers.get("location") }; }
    catch { return { l, s: 0, loc: null }; }
  });
  const sources = (l: string) => ok.filter((p) => p.links.some((x) => norm(x) === l)).slice(0, 3).map((p) => path(p.url)).join(", ");
  for (const r of linkResults) {
    if (r.s >= 400 || r.s === 0) add("Broken internal link", `${path(r.l)} → ${r.s} (from ${sources(r.l)})`);
    else if (r.s >= 300) add("Internal link hits a redirect (link the final URL)", `${path(r.l)} → ${r.s} ${path(r.loc ?? "")} (from ${sources(r.l)})`);
  }
  // A 200 link outside the sitemap only matters if it's indexable and canonical
  // to itself (template variants canonicalise to their primary category; auth
  // pages are noindex).
  const missing = await pool(linkResults.filter((r) => r.s === 200 && !/^\/(login|register)\b/.test(path(r.l))), CONC, async (r) => {
    try { const { body } = await get(r.l); return { l: r.l, ...parse(r.l, body) }; } catch { return null; }
  });
  for (const m of missing) {
    if (!m || /noindex/i.test(m.robots ?? "")) continue;
    if (m.canonical && norm(m.canonical) !== norm(m.l)) continue;
    add("Indexable, self-canonical page missing from sitemap", `${path(m.l)} (linked from ${sources(m.l)})`);
  }

  // Report
  const order = Object.entries(issues).sort((a, b) => b[1].length - a[1].length);
  console.log(`Crawled ${pages.length}: ${ok.length} returned 200. Median response ${[...ok].sort((a, b) => a.ms - b.ms)[Math.floor(ok.length / 2)]?.ms ?? "-"} ms.`);
  const cacheCounts: Record<string, number> = {};
  for (const p of ok) cacheCounts[p.cache ?? "none"] = (cacheCounts[p.cache ?? "none"] ?? 0) + 1;
  console.log(`x-vercel-cache: ${Object.entries(cacheCounts).map(([k, v]) => `${k}=${v}`).join(" ")}\n`);
  if (!order.length) console.log("No issues found.");
  for (const [k, list] of order) {
    console.log(`■ ${k}: ${list.length}`);
    for (const s of list.slice(0, 8)) console.log(`    ${s}`);
    if (list.length > 8) console.log(`    … ${list.length - 8} more`);
  }
  if (JSON_OUT) { writeFileSync(JSON_OUT, JSON.stringify({ base: BASE, pages, issues }, null, 2)); console.log(`\nJSON written to ${JSON_OUT}`); }
})();
