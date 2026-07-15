"use client";

const VISITOR_ID_KEY = "mentorship_visitor_id";

export function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

export function trackPageView() {
  const params = new URLSearchParams(window.location.search);
  fetch("/api/telemetry/mentorship-view", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "view",
      path: window.location.pathname,
      visitor_id: getVisitorId(),
      utm_source: params.get("utm_source") || undefined,
      utm_medium: params.get("utm_medium") || undefined,
      utm_campaign: params.get("utm_campaign") || undefined,
      utm_content: params.get("utm_content") || undefined,
      utm_term: params.get("utm_term") || undefined,
    }),
  }).catch(() => {});
}

export function trackCtaClick(cta: string) {
  fetch("/api/telemetry/mentorship-view", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "click",
      cta,
      path: window.location.pathname,
      visitor_id: getVisitorId(),
    }),
  }).catch(() => {});
}
