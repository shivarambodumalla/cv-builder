"use client";

import { useEffect } from "react";

const VISITOR_ID_KEY = "mentorship_visitor_id";

/** Fires one page-view telemetry call per mount with visitor UUID + UTM params. Renders nothing. */
export function PageTracker() {
  useEffect(() => {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_ID_KEY, id);
    }

    const params = new URLSearchParams(window.location.search);
    fetch("/api/telemetry/mentorship-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: window.location.pathname,
        visitor_id: id,
        utm_source: params.get("utm_source") || undefined,
        utm_medium: params.get("utm_medium") || undefined,
        utm_campaign: params.get("utm_campaign") || undefined,
        utm_content: params.get("utm_content") || undefined,
        utm_term: params.get("utm_term") || undefined,
      }),
    }).catch(() => {});
  }, []);

  return null;
}
