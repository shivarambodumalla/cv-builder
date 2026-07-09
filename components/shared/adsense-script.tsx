"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { hasConsent } from "./cookie-consent";

/**
 * Loads Google AdSense script.
 * Skipped on /admin routes so internal browsing doesn't pollute ad metrics.
 * Gated on cookie consent so personalized ads respect user preferences.
 */
export function AdSenseScript() {
  const pathname = usePathname();
  const [hasUserConsent, setHasUserConsent] = useState(false);

  // Check consent on mount and subscribe to consent changes
  useEffect(() => {
    setHasUserConsent(hasConsent());
    const handleConsentGranted = () => setHasUserConsent(true);
    window.addEventListener("cvedge:consent-granted", handleConsentGranted);
    return () => window.removeEventListener("cvedge:consent-granted", handleConsentGranted);
  }, []);

  // Skip on admin routes
  if (pathname?.startsWith("/admin")) return null;

  // Skip if consent not given
  if (!hasUserConsent) return null;

  return (
    <Script
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4740069300198403"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      async
    />
  );
}
