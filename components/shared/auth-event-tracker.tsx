"use client";

import { useEffect } from "react";
import { trackSignup, trackLogin } from "@/lib/analytics/events";
import { logActivity } from "@/lib/analytics/log";
import { readFirstTouch } from "@/lib/analytics/first-touch";

const STORAGE_KEY = "cvx_vid";

function getVisitorId(): string | null {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

export function AuthEventTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const event = params.get("auth_event");
    if (event !== "signup" && event !== "login") return;

    if (event === "signup") {
      trackSignup("google");
      logActivity("Signed up", { page: window.location.pathname });
    } else {
      trackLogin("google");
      logActivity("Logged in", { page: window.location.pathname });
    }

    // Attribute pre-login page views and, on signup, the first-touch source
    // to this user (fire-and-forget). The stored first touch rides along as a
    // fallback in case the server never saw it.
    const visitor_id = getVisitorId();
    if (visitor_id || event === "signup") {
      fetch("/api/telemetry/attribute-visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitor_id: visitor_id ?? undefined,
          first_touch: event === "signup" ? readFirstTouch() ?? undefined : undefined,
        }),
        keepalive: true,
      }).catch(() => {});
    }

    params.delete("auth_event");
    const qs = params.toString();
    const newUrl = window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash;
    window.history.replaceState(null, "", newUrl);
  }, []);

  return null;
}
