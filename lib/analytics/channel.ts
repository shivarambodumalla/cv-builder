/**
 * Acquisition channel from a visitor's first touch (referrer host, UTM tags,
 * ad click id). Pure, so the page-view route, attribute-visitor and the admin
 * share one definition.
 */

export const ACQUISITION_CHANNELS = [
  "organic_search",
  "paid_search",
  "ai_assistant",
  "social",
  "email",
  "referral",
  "direct",
  "unknown",
] as const;

export type AcquisitionChannel = (typeof ACQUISITION_CHANNELS)[number];

export const CHANNEL_LABELS: Record<AcquisitionChannel, string> = {
  organic_search: "Organic search",
  paid_search: "Paid ads",
  ai_assistant: "AI assistants",
  social: "Social",
  email: "Email",
  referral: "Referral",
  direct: "Direct",
  unknown: "Unknown",
};

export type ClickId = "gclid" | "msclkid" | "fbclid";

export interface FirstTouchInput {
  referrerHost?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  clickId?: ClickId | null;
}

// host suffix → source name
const SEARCH_ENGINES: [string, string][] = [
  ["google.", "google"],
  ["bing.com", "bing"],
  ["duckduckgo.com", "duckduckgo"],
  ["search.yahoo.com", "yahoo"],
  ["yahoo.com", "yahoo"],
  ["ecosia.org", "ecosia"],
  ["yandex.", "yandex"],
  ["search.brave.com", "brave"],
  ["baidu.com", "baidu"],
];

const AI_ASSISTANTS: [string, string][] = [
  ["chatgpt.com", "chatgpt"],
  ["chat.openai.com", "chatgpt"],
  ["perplexity.ai", "perplexity"],
  ["gemini.google.com", "gemini"],
  ["copilot.microsoft.com", "copilot"],
  ["claude.ai", "claude"],
  ["chat.deepseek.com", "deepseek"],
];

const SOCIAL: [string, string][] = [
  ["linkedin.com", "linkedin"],
  ["lnkd.in", "linkedin"],
  ["facebook.com", "facebook"],
  ["fb.com", "facebook"],
  ["instagram.com", "instagram"],
  ["t.co", "x"],
  ["x.com", "x"],
  ["twitter.com", "x"],
  ["reddit.com", "reddit"],
  ["youtube.com", "youtube"],
  ["quora.com", "quora"],
  ["threads.net", "threads"],
  ["tiktok.com", "tiktok"],
];

const PAID_MEDIUMS = /^(cpc|ppc|paid|paid[_-]?search|paid[_-]?social|display|cpm|ads?)$/;

function matchHost(host: string, table: [string, string][]): string | null {
  for (const [suffix, name] of table) {
    // "google." matches google.com and google.co.in; others match the host or a subdomain
    if (suffix.endsWith(".") ? host.includes(suffix) : host === suffix || host.endsWith(`.${suffix}`)) {
      return name;
    }
  }
  return null;
}

/** Host of a referrer URL, lowercased, without "www."; null for none or unparseable. */
export function referrerHostOf(referrer: string | null | undefined): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.toLowerCase().replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}

export function classifyChannel(input: FirstTouchInput): { channel: AcquisitionChannel; source: string | null } {
  const host = input.referrerHost?.toLowerCase().replace(/^www\./, "") || null;
  const utmSource = input.utmSource?.toLowerCase().trim() || null;
  const utmMedium = input.utmMedium?.toLowerCase().trim() || null;

  // Assistants first: gemini.google.com would otherwise read as Google search.
  const assistant = host ? matchHost(host, AI_ASSISTANTS) : null;
  const engine = host ? matchHost(host, SEARCH_ENGINES) : null;

  if (input.clickId === "gclid") return { channel: "paid_search", source: "google" };
  if (input.clickId === "msclkid") return { channel: "paid_search", source: "bing" };
  if (input.clickId === "fbclid" && utmMedium && PAID_MEDIUMS.test(utmMedium)) {
    return { channel: "paid_search", source: "facebook" };
  }
  if (utmMedium && PAID_MEDIUMS.test(utmMedium)) {
    return { channel: "paid_search", source: utmSource ?? engine ?? host };
  }
  if (utmMedium === "email" || utmSource === "newsletter") {
    return { channel: "email", source: utmSource };
  }
  if (assistant) return { channel: "ai_assistant", source: assistant };
  // ChatGPT and Perplexity tag outbound links (utm_source=chatgpt.com) and often send no referrer.
  const assistantByTag = utmSource
    ? matchHost(utmSource, AI_ASSISTANTS) ?? AI_ASSISTANTS.find(([, name]) => name === utmSource)?.[1] ?? null
    : null;
  if (assistantByTag) return { channel: "ai_assistant", source: assistantByTag };
  if (engine) return { channel: "organic_search", source: engine };
  const social = host ? matchHost(host, SOCIAL) : null;
  if (social) return { channel: "social", source: social };
  if (input.clickId === "fbclid") return { channel: "social", source: "facebook" };
  if (utmMedium === "social" || utmMedium === "social-media") {
    return { channel: "social", source: utmSource };
  }
  if (host) return { channel: "referral", source: host };
  if (utmSource) return { channel: "referral", source: utmSource };
  return { channel: "direct", source: null };
}

export function channelLabel(channel: string | null | undefined): string {
  return CHANNEL_LABELS[(channel ?? "unknown") as AcquisitionChannel] ?? channel ?? "Unknown";
}
