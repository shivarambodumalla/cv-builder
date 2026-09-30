"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

const ADSENSE_SRC =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4740069300198403";

// Paths that carry no ads: the career path tool is a lead engine whose one job
// is "Tailor my resume"; an auto-ad next to it competes with that and adds
// ~650 KB of script before the page settles. Admin is internal.
const NO_ADS_PREFIXES = ["/career-path", "/admin"];

/**
 * Google AdSense (auto ads). Loaded on every public page so Google can verify
 * the site; GDPR is handled by the Consent Mode defaults in the root layout
 * (ad_storage denied until consent).
 */
export function AdSenseScript() {
  const pathname = usePathname();
  if (NO_ADS_PREFIXES.some((p) => pathname?.startsWith(p))) return null;
  return <Script src={ADSENSE_SRC} strategy="afterInteractive" crossOrigin="anonymous" />;
}
