// IndexNow pings (Bing, Yandex, Naver, Seznam share the endpoint). Bing's index
// feeds Microsoft Copilot and ChatGPT search, so a page that goes live, changes
// or disappears should be pushed here rather than left for a crawler to find.
//
// The key is public by design: IndexNow verifies ownership by fetching
// https://www.thecvedge.com/<key>.txt, which lives in public/.
export const INDEXNOW_HOST = "www.thecvedge.com";
const KEY = "c2f535b3e4bb61f6d584f5be84078482";
const ENDPOINT = "https://api.indexnow.org/indexnow";
const BATCH_SIZE = 500; // the API takes 10,000 per call; stay well under it
const TIMEOUT_MS = 5000;

/** "/blog/foo", "blog/foo" or an absolute URL on our host → absolute www URL. */
function toAbsoluteUrl(pathOrUrl: string): string | null {
  try {
    const url = new URL(pathOrUrl.startsWith("http") ? pathOrUrl : `/${pathOrUrl.replace(/^\/+/, "")}`, `https://${INDEXNOW_HOST}`);
    return url.hostname === INDEXNOW_HOST ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Submit URLs to IndexNow. Sends only on the Vercel production deployment
 * unless `force` is set (the manual script), so previews and local dev never
 * announce URLs. Never throws: a failed ping must not fail the publish that
 * triggered it. Resolves true when every batch got HTTP 200 or 202.
 */
export async function submitToIndexNow(
  pathsOrUrls: string[],
  { force = false }: { force?: boolean } = {}
): Promise<boolean> {
  const urls: string[] = [];
  for (const input of pathsOrUrls) {
    const url = toAbsoluteUrl(input);
    if (!url) console.warn(`[indexnow] skipping URL outside ${INDEXNOW_HOST}: ${input}`);
    else if (!urls.includes(url)) urls.push(url);
  }
  if (!urls.length) return true;

  if (!force && process.env.VERCEL_ENV !== "production") {
    console.log(`[indexnow] not production, would submit ${urls.length} url(s):`, urls);
    return true;
  }

  let ok = true;
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const urlList = urls.slice(i, i + BATCH_SIZE);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ host: INDEXNOW_HOST, key: KEY, keyLocation: `https://${INDEXNOW_HOST}/${KEY}.txt`, urlList }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
        cache: "no-store",
      });
      // 200 = ok, 202 = accepted (key not yet validated); anything else is a real error.
      if (res.status === 200 || res.status === 202) {
        console.log(`[indexnow] submitted ${urlList.length} url(s) → HTTP ${res.status}`);
      } else {
        ok = false;
        console.error(`[indexnow] HTTP ${res.status} for ${urlList.length} url(s):`, await res.text().catch(() => ""));
      }
    } catch (e) {
      ok = false;
      console.error(`[indexnow] request failed for ${urlList.length} url(s):`, e instanceof Error ? e.message : e);
    }
  }
  return ok;
}
