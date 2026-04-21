/**
 * Server-side GA4 event tracking via Measurement Protocol.
 * Ad-blocker-proof — requests originate from our server, not the user's browser.
 */

const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID || "G-GLVL3MB6NC";
const GA4_API_SECRET = process.env.GA4_API_SECRET;

/** Extract the GA client_id from a `_ga` cookie, or fall back to the provided id. */
function getClientId(cookieHeader: string | null, fallbackId: string): string {
  if (cookieHeader) {
    const match = cookieHeader.match(/_ga=GA1\.\d\.([0-9.]+)/);
    if (match) return match[1];
  }
  return fallbackId;
}

interface GA4Event {
  name: string;
  params?: Record<string, string | number | boolean>;
}

/**
 * Fire a GA4 event server-side. Fire-and-forget — never throws.
 * Requires GA4_API_SECRET env var. Silently no-ops if missing.
 */
export async function sendGA4Event(opts: {
  events: GA4Event[];
  userId: string;
  cookieHeader?: string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
}): Promise<void> {
  if (!GA4_API_SECRET) return;

  try {
    const client_id = getClientId(opts.cookieHeader ?? null, opts.userId);
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`;

    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(opts.userAgent ? { "User-Agent": opts.userAgent } : {}),
      },
      body: JSON.stringify({
        client_id,
        user_id: opts.userId,
        events: opts.events,
      }),
    });
  } catch {
    // ignore
  }
}
