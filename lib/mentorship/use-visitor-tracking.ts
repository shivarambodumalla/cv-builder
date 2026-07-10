"use client";

import { useEffect, useRef } from "react";

interface UseVisitorTrackingOptions {
  path: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  onVisitorIdReady?: (visitorId: string) => void;
}

const VISITOR_ID_KEY = "mentorship_visitor_id";

export function useVisitorTracking({
  path,
  utmSource,
  utmMedium,
  utmCampaign,
  utmContent,
  utmTerm,
  onVisitorIdReady,
}: UseVisitorTrackingOptions) {
  const visitorIdRef = useRef<string | null>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;

    const getOrCreateVisitorId = (): string => {
      if (typeof window === "undefined") return "";
      let id = localStorage.getItem(VISITOR_ID_KEY);
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(VISITOR_ID_KEY, id);
      }
      return id;
    };

    const visitorId = getOrCreateVisitorId();
    visitorIdRef.current = visitorId;

    if (onVisitorIdReady) {
      onVisitorIdReady(visitorId);
    }

    // Log page view with UTM params
    fetch("/api/telemetry/mentorship-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path,
        visitor_id: visitorId,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_content: utmContent,
        utm_term: utmTerm,
      }),
    }).catch(() => {
      // silent
    });
  }, [path, utmSource, utmMedium, utmCampaign, utmContent, utmTerm, onVisitorIdReady]);

  return visitorIdRef.current;
}

/** Track specific events on the page (pricing view, FAQ click, etc.) */
export function trackMentorshipEvent(
  event: string,
  visitorId: string,
  metadata?: Record<string, string | number | boolean>
) {
  fetch("/api/telemetry/mentorship-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, visitor_id: visitorId, metadata }),
  }).catch(() => {
    // silent
  });
}
