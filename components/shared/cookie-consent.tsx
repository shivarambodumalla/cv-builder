"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CONSENT_KEY = "cvedge_cookie_consent";

// EU/EEA + UK country codes — GDPR consent required
const GDPR_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE", // EU
  "GB", // UK
  "IS", "LI", "NO", // EEA
]);

/** Returns true if user has accepted cookies */
export function hasConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CONSENT_KEY) === "accepted";
}

/** Grant consent — called for non-GDPR users on mount, or when a GDPR user accepts */
function grantConsent() {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
  });
}

/** Detect if user is in a GDPR region via timezone heuristic */
function isGDPRRegion(): boolean {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    // European timezones start with Europe/, Atlantic/Reykjavik (Iceland)
    if (tz.startsWith("Europe/") || tz === "Atlantic/Reykjavik") return true;
    // Also check locale-based country if available
    const locale = navigator.language || "";
    const country = locale.split("-")[1]?.toUpperCase();
    if (country && GDPR_COUNTRIES.has(country)) return true;
    return false;
  } catch {
    return false; // If detection fails, assume non-GDPR (load GA freely)
  }
}

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    const gdpr = isGDPRRegion();

    // Non-GDPR region (India, US, AU, etc.) — grant consent immediately, no banner
    if (!gdpr) {
      localStorage.setItem(CONSENT_KEY, "accepted");
      grantConsent();
      return;
    }

    // GDPR region — check stored consent
    if (stored === "accepted") {
      grantConsent();
      return;
    }

    if (stored === "declined") {
      // Consent stays denied — gtag.js still counts visits cookielessly
      return;
    }

    // No stored consent — show banner (consent defaults to denied in layout.tsx)
    const t = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(t);
  }, []);

  function handleAccept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setShow(false);
    grantConsent();

    // Record consent server-side (fire-and-forget)
    fetch("/api/gdpr/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "cookie_consent" }),
    }).catch(() => {});
  }

  function handleDecline() {
    localStorage.setItem(CONSENT_KEY, "declined");
    setShow(false);
    // Consent stays denied — gtag.js still counts visits cookielessly
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] p-4 sm:p-6 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-lg rounded-xl border bg-background shadow-lg p-5">
        <p className="text-sm text-foreground mb-1 font-medium">We value your privacy</p>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          We use cookies for analytics and to improve your experience. Your CV data is never shared with advertisers.{" "}
          <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            className="flex-1 rounded-lg bg-[#065F46] px-4 py-2 text-sm font-semibold text-white hover:bg-[#065F46]/90 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={handleDecline}
            className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
