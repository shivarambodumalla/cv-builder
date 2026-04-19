"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UseExitIntentOptions {
  /** Unique key for localStorage frequency control */
  id: string;
  /** Minimum seconds before popup can show (default 10) */
  delaySeconds?: number;
  /** Don't show again for this many days after dismiss (default 7) */
  cooldownDays?: number;
  /** Only fire on desktop exit intent? (default false — also fires on time for mobile) */
  desktopOnly?: boolean;
  /** Additional condition that must be true */
  enabled?: boolean;
}

const STORAGE_PREFIX = "cvedge_popup_";

function getLastDismissed(id: string): number {
  if (typeof window === "undefined") return 0;
  const val = localStorage.getItem(`${STORAGE_PREFIX}${id}_dismissed`);
  return val ? parseInt(val, 10) : 0;
}

function setDismissed(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${STORAGE_PREFIX}${id}_dismissed`, String(Date.now()));
}

function isInCooldown(id: string, days: number): boolean {
  const last = getLastDismissed(id);
  if (!last) return false;
  return Date.now() - last < days * 24 * 60 * 60 * 1000;
}

// Session-level: max 1 popup shown per session across all types
let sessionPopupShown = false;

export function useExitIntent({
  id,
  delaySeconds = 10,
  cooldownDays = 7,
  enabled = true,
}: UseExitIntentOptions) {
  const [show, setShow] = useState(false);
  const readyRef = useRef(false);
  const firedRef = useRef(false);

  const dismiss = useCallback(() => {
    setShow(false);
    setDismissed(id);
  }, [id]);

  const trackImpression = useCallback(() => {
    fetch("/api/activity/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: `popup_shown:${id}`, page: window.location.pathname }),
    }).catch(() => {});
  }, [id]);

  const trackAction = useCallback((action: string) => {
    fetch("/api/activity/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: `popup_${action}:${id}`, page: window.location.pathname }),
    }).catch(() => {});
  }, [id]);

  // Track anonymous popup events (for users without auth)
  const trackAnonymous = useCallback((action: string) => {
    fetch("/api/telemetry/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: `/popup/${action}/${id}` }),
    }).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!enabled || firedRef.current || sessionPopupShown) return;
    if (isInCooldown(id, cooldownDays)) return;

    // Delay before enabling
    const timer = setTimeout(() => { readyRef.current = true; }, delaySeconds * 1000);

    // Desktop: mouse leave top of viewport
    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY > 5) return; // only top edge
      if (!readyRef.current || firedRef.current || sessionPopupShown) return;
      firedRef.current = true;
      sessionPopupShown = true;
      setShow(true);
      trackImpression();
    }

    // Mobile/tablet: tab visibility change (switching away)
    function handleVisibility() {
      if (document.visibilityState !== "hidden") return;
      if (!readyRef.current || firedRef.current || sessionPopupShown) return;
      firedRef.current = true;
      sessionPopupShown = true;
      setShow(true);
      trackImpression();
    }

    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [id, enabled, delaySeconds, cooldownDays, trackImpression]);

  return { show, dismiss, trackAction, trackAnonymous };
}
