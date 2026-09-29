"use client";

import { useEffect, useRef } from "react";
import type { CareerPathEvent } from "@/lib/career-path/types";

/** Fire-and-forget funnel event. Never blocks or throws. */
export function trackCareerPathEvent(event: CareerPathEvent) {
  try {
    fetch("/api/telemetry/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: `/popup/career-path/${event}` }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Tracking must never affect the page.
  }
}

/** Sends one event when mounted (once per mount, safe under Strict Mode). */
export function CareerPathEventOnMount({ event }: { event: CareerPathEvent }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackCareerPathEvent(event);
  }, [event]);
  return null;
}
