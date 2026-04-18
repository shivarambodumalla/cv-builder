"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Tracks anonymous page views for marketing pages. No personal data. */
export function AnonPageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // Fire-and-forget — never block rendering
    fetch("/api/telemetry/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
