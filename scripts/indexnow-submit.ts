// Submit URLs to IndexNow by hand. Blog publishes, edits and deletes already
// ping automatically (lib/seo/indexnow.ts); use this for everything else, such
// as a new marketing page or a site-wide change.
//
// Run: npx tsx scripts/indexnow-submit.ts                 # every URL in the live sitemap
//      npx tsx scripts/indexnow-submit.ts /blog/foo /bar  # specific paths or absolute URLs
import { INDEXNOW_HOST, submitToIndexNow } from "../lib/seo/indexnow";

async function sitemapUrls(): Promise<string[]> {
  const res = await fetch(`https://${INDEXNOW_HOST}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap fetch failed: ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function main() {
  const args = process.argv.slice(2);
  const urls = args.length ? args : await sitemapUrls();
  if (!urls.length) throw new Error("nothing to submit");

  // force: this runs from a local machine, outside the production-only guard.
  if (!(await submitToIndexNow(urls, { force: true }))) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
