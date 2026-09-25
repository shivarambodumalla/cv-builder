// Submit URLs to IndexNow (Bing, Yandex, Naver, Seznam share the endpoint).
// Bing's index feeds Microsoft Copilot and ChatGPT search, so a fresh or
// updated page should be pushed here as well as left for Googlebot to find.
//
// The key is public by design: IndexNow verifies ownership by fetching
// https://www.thecvedge.com/<key>.txt, which lives in public/.
//
// Run: npx tsx scripts/indexnow-submit.ts                 # every URL in the live sitemap
//      npx tsx scripts/indexnow-submit.ts /blog/foo /bar  # specific paths or absolute URLs
const HOST = "www.thecvedge.com";
const KEY = "c2f535b3e4bb61f6d584f5be84078482";
const ENDPOINT = "https://api.indexnow.org/indexnow";

async function sitemapUrls(): Promise<string[]> {
  const res = await fetch(`https://${HOST}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap fetch failed: ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function main() {
  const args = process.argv.slice(2);
  const urls = args.length
    ? args.map((a) => (a.startsWith("http") ? a : `https://${HOST}${a.startsWith("/") ? a : "/" + a}`))
    : await sitemapUrls();
  if (!urls.length) throw new Error("nothing to submit");

  // IndexNow accepts up to 10,000 URLs per call; batch defensively.
  for (let i = 0; i < urls.length; i += 500) {
    const urlList = urls.slice(i, i + 500);
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
    });
    // 200 = ok, 202 = accepted (key not yet validated); anything else is a real error.
    console.log(`batch ${i / 500 + 1}: ${urlList.length} urls → HTTP ${res.status}`);
    if (res.status >= 400) console.log(await res.text());
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
