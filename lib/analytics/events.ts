// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global { interface Window { gtag?: (...args: any[]) => void; } }

import { logActivity } from "./log";

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
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

export function trackUpgrade(value: number = 9) {
  gtag("event", "purchase", { event_category: "monetisation", value, currency: "USD" });
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

export function trackSignup(method: string = "google") {
  gtag("event", "sign_up", { method, event_category: "conversion" });
}

export function trackLogin(method: string = "google") {
  gtag("event", "login", { method, event_category: "conversion" });
}
