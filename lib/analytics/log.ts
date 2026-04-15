export type ActivityMetadata = Record<string, unknown>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { gtag?: (...args: any[]) => void; dataLayer?: unknown[]; }
}

function toGtagEventName(event: string): string {
  return event
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

export function logActivity(
  event: string,
  opts: { page?: string | null; metadata?: ActivityMetadata } = {}
): void {
  if (!event) return;
  const page = opts.page ?? (typeof window !== "undefined" ? window.location.pathname : null);
  const metadata = opts.metadata ?? {};

  // Fire-and-forget DB insert
  if (typeof fetch !== "undefined") {
    try {
      fetch("/api/activity/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, page, metadata }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // ignore
    }
  }

  // Mirror to GA4 via gtag
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    try {
      window.gtag("event", toGtagEventName(event), {
        event_label: event,
        page_path: page,
        ...metadata,
      });
    } catch {
      // ignore
    }
  }
}
