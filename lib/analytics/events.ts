// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global { interface Window { gtag?: (...args: any[]) => void; uetq?: { push: (...args: unknown[]) => void } | unknown[]; } }

import { logActivity } from "./log";

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
}

/** Microsoft UET conversion event. Queues until bat.js loads (components/shared/ms-uet-script.tsx). */
function uet(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.uetq = window.uetq || [];
  (window.uetq as { push: (...args: unknown[]) => void }).push("event", event, params);
}

export function trackATSScan(score: number) {
  gtag("event", "ats_scan", { ats_score: score, event_category: "feature_usage" });
  logActivity("Ran ATS scan", { metadata: { score } });
}

export function trackPDFDownload() {
  gtag("event", "pdf_download", { event_category: "feature_usage" });
  logActivity("Downloaded PDF");
}

export function trackJobMatch(score: number) {
  gtag("event", "job_match", { match_score: score, event_category: "feature_usage" });
  logActivity("Ran job match", { metadata: { score } });
}

export function trackUpgradeIntent(trigger: string) {
  gtag("event", "upgrade_intent", { trigger, event_category: "monetisation" });
  logActivity("Hit upgrade wall", { metadata: { trigger } });
}

/** `value` is the amount charged (firstPaymentUsd), never a guessed default. */
export function trackUpgrade(value: number) {
  gtag("event", "purchase", { event_category: "monetisation", value, currency: "USD" });
  uet("purchase", { revenue_value: value, currency: "USD" });
  logActivity("Upgraded to Pro", { metadata: { value } });
}

export function trackCVCreated() {
  gtag("event", "cv_created", { event_category: "engagement" });
  logActivity("Created CV");
}

export function trackFixAllUsed() {
  gtag("event", "fix_all_used", { event_category: "feature_usage" });
  logActivity("Used Fix All");
}

export function trackCoverLetter() {
  gtag("event", "cover_letter", { event_category: "feature_usage" });
  logActivity("Generated cover letter");
}

// GA4 recommended event — mark as key event in GA4 and import into Google Ads as a conversion
export function trackMentorshipLead(intent: string) {
  gtag("event", "generate_lead", { intent, event_category: "conversion", currency: "USD", value: 599 });
}

export function trackSignup(method: string = "google") {
  gtag("event", "sign_up", { method, event_category: "conversion" });
  uet("sign_up");
}

export function trackLogin(method: string = "google") {
  gtag("event", "login", { method, event_category: "conversion" });
}
