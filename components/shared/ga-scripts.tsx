"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

/**
 * Loads gtag.js and fires the GA4/Ads config calls.
 * Skipped on /admin routes so internal browsing doesn't pollute analytics.
 * Consent defaults are set in the root layout (always active, GDPR-safe).
 */
export function GAScripts() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-GLVL3MB6NC"
        strategy="afterInteractive"
      />
      <Script id="gtag-config" strategy="afterInteractive">
        {`
          gtag('js', new Date());
          gtag('config', 'G-GLVL3MB6NC');
          gtag('config', 'G-52LEWSBN7M');
          gtag('config', 'AW-18095722375');
        `}
      </Script>
    </>
  );
}
