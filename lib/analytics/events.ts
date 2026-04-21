// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global { interface Window { gtag?: (...args: any[]) => void; } }

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
}

export function trackATSScan(score: number) {
  gtag("event", "ats_scan", { ats_score: score, event_category: "feature_usage" });
}

export function trackPDFDownload() {
  gtag("event", "pdf_download", { event_category: "feature_usage" });
}

export function trackJobMatch(score: number) {
  gtag("event", "job_match", { match_score: score, event_category: "feature_usage" });
}

export function trackUpgradeIntent(trigger: string) {
  gtag("event", "upgrade_intent", { trigger, event_category: "monetisation" });
}

export function trackUpgrade(value: number = 9) {
  gtag("event", "purchase", { event_category: "monetisation", value, currency: "USD" });
}

export function trackCVCreated() {
  gtag("event", "cv_created", { event_category: "engagement" });
}

export function trackFixAllUsed() {
  gtag("event", "fix_all_used", { event_category: "feature_usage" });
}

export function trackCoverLetter() {
  gtag("event", "cover_letter", { event_category: "feature_usage" });
}

export function trackSignup(method: string = "google") {
  gtag("event", "sign_up", { method, event_category: "conversion" });
}

export function trackLogin(method: string = "google") {
  gtag("event", "login", { method, event_category: "conversion" });
}
