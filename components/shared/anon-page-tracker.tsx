"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "cvx_vid";

function getOrCreateVisitorId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    // crypto.randomUUID is available in all modern browsers
    const id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return "";
  }
}

/** Tracks anonymous page views for marketing pages. No personal data stored server-side. */
export function AnonPageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (typeof window !== "undefined" && window.location.hostname === "localhost") return;

    const visitor_id = getOrCreateVisitorId();

    // Fire-and-forget — never block rendering
    fetch("/api/telemetry/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, visitor_id: visitor_id || undefined }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
