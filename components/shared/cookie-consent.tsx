"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CONSENT_KEY = "cvedge_cookie_consent";

/** Returns true if user has accepted cookies */
export function hasConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CONSENT_KEY) === "accepted";
}

/** Load GA + Ads scripts dynamically after consent */
function loadAnalytics() {
  if (typeof window === "undefined") return;
  if (document.getElementById("gtag-script")) return;

  const script = document.createElement("script");
  script.id = "gtag-script";
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-52LEWSBN7M";
  document.head.appendChild(script);

  script.onload = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) { window.dataLayer!.push(args); }
    gtag("js", new Date());
    gtag("config", "G-52LEWSBN7M");
    gtag("config", "AW-18095722375");
    window.gtag = gtag as typeof window.gtag;
  };
}

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // If already consented, load analytics silently
    if (hasConsent()) {
      loadAnalytics();
      return;
    }
    // Show banner after short delay to not block first paint
    const t = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(t);
  }, []);

  function handleAccept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setShow(false);
    loadAnalytics();

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
    // No analytics loaded
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
