/**
 * First touch: how a visitor first reached CVEdge (landing page, referrer
 * host, campaign tags, ad click id). Captured once per browser in
 * localStorage, saved server-side against the anonymous visitor id
 * (visitor_first_touch), and copied onto the profile at signup so the admin
 * can split signups by channel.
 *
 * The capture helpers touch window/localStorage only when called, so the
 * sanitiser can be imported by API routes.
 */

import { classifyChannel, referrerHostOf, type AcquisitionChannel, type ClickId } from "./channel";

export interface FirstTouch {
  landing_path: string;
  referrer_host: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  click_id: ClickId | null;
}

export interface ClassifiedFirstTouch extends FirstTouch {
  channel: AcquisitionChannel;
  source: string | null;
}

const STORAGE_KEY = "cvx_ft";
const CLICK_IDS: ClickId[] = ["gclid", "msclkid", "fbclid"];
// Hosts that show up as a referrer without being where the visitor came from.
const IGNORED_REFERRERS = /(^|\.)(thecvedge\.com|accounts\.google\.com|lemonsqueezy\.com)$/;

// ── Browser ───────────────────────────────────────────────────────────────────

function fromLocation(): FirstTouch {
  const params = new URLSearchParams(window.location.search);
  const ownHost = window.location.hostname.replace(/^www\./, "");
  const host = referrerHostOf(document.referrer);
  const referrer_host = host && host !== ownHost && !IGNORED_REFERRERS.test(host) ? host : null;
  return {
    landing_path: window.location.pathname,
    referrer_host,
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_term: params.get("utm_term"),
    utm_content: params.get("utm_content"),
    click_id: CLICK_IDS.find((id) => params.has(id)) ?? null,
  };
}

/** The stored first touch, or null if none was captured (or storage is blocked). */
export function readFirstTouch(): FirstTouch | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FirstTouch) : null;
  } catch {
    return null;
  }
}

/**
 * Records the first touch on a browser's first visit. Returns it only when it
 * was just captured, so the caller sends it to the server once.
 */
export function captureFirstTouch(): FirstTouch | null {
  try {
    if (localStorage.getItem(STORAGE_KEY)) return null;
    const touch = fromLocation();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(touch));
    return touch;
  } catch {
    return null;
  }
}

// ── Server ────────────────────────────────────────────────────────────────────

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

/**
 * Validates a first touch sent by the browser and classifies its channel on
 * the server (the client's own classification is never trusted). Returns null
 * for anything malformed.
 */
export function sanitizeFirstTouch(raw: unknown): ClassifiedFirstTouch | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const landing = text(r.landing_path, 300);
  if (!landing || !landing.startsWith("/")) return null;

  const host = text(r.referrer_host, 253)?.toLowerCase().replace(/^www\./, "") ?? null;
  const referrer_host = host && /^[a-z0-9.-]+$/.test(host) ? host : null;
  const click_id = CLICK_IDS.includes(r.click_id as ClickId) ? (r.click_id as ClickId) : null;

  const touch: FirstTouch = {
    landing_path: landing.split("?")[0],
    referrer_host,
    utm_source: text(r.utm_source, 100),
    utm_medium: text(r.utm_medium, 100),
    utm_campaign: text(r.utm_campaign, 150),
    utm_term: text(r.utm_term, 150),
    utm_content: text(r.utm_content, 150),
    click_id,
  };
  const { channel, source } = classifyChannel({
    referrerHost: touch.referrer_host,
    utmSource: touch.utm_source,
    utmMedium: touch.utm_medium,
    clickId: touch.click_id,
  });
  return { ...touch, channel, source };
}
