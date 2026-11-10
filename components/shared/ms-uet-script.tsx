"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

/**
 * Microsoft Advertising UET tag (conversion tracking for Bing ads), the
 * snippet Microsoft issues for tag 343285143. Consent defaults to denied in
 * the root layout and CookieConsent grants it, same as gtag.
 * enableAutoSpaTracking records client-side navigations as page loads.
 * Conversions: lib/analytics/events.ts pushes `sign_up` and `purchase`.
 */
export function MsUetScript() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <Script id="ms-uet" strategy="afterInteractive">
      {`(function(w,d,t,u,o){w[u]=w[u]||[],o.ts=(new Date).getTime();var n=d.createElement(t);n.src="https://bat.bing.net/bat.js?ti="+o.ti+("uetq"!=u?"&q="+u:""),n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&"loaded"!==s&&"complete"!==s||(o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad"),n.onload=n.onreadystatechange=null)};var i=d.getElementsByTagName(t)[0];i.parentNode.insertBefore(n,i)})(window,document,"script","uetq",{ti:"343285143",enableAutoSpaTracking:true});`}
    </Script>
  );
}
