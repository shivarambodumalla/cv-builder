"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { hasConsent } from "@/components/shared/cookie-consent";

/** Impact.com Universal Tracking Tag, issued per-account. */
const IMPACT_UTT_SRC =
  "https://utt.impactcdn.com/P-A7679564-eef3-4273-a664-601115aed9ec1.js";

/**
 * Loads the Impact.com Universal Tracking Tag for affiliate attribution.
 *
 * Consent-gated for the same reason Hotjar is: the tag sets attribution
 * cookies, which is exactly what GDPR consent covers. It follows the same
 * pattern — skipped on /admin, on localhost, for automated browsers, and
 * until consent is granted, re-checking on the cvedge:consent-granted event.
 *
 * Note on `transformLinks`: this instructs Impact to rewrite matching outbound
 * links on the page into tracked affiliate links automatically, wherever they
 * appear. It is a site-wide behaviour, not a passive tracker — any link to a
 * partner brand becomes an affiliate link once this is live. Every such link
 * therefore needs rel="sponsored nofollow" and a visible disclosure on the
 * page carrying it, per Google's link-scheme policy and FTC/ASA rules.
 */
export function ImpactScripts() {
  const pathname = usePathname();
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hostname === "localhost") return;
    if (navigator.webdriver) return;

    const tryLoad = () => {
      if (hasConsent()) setShouldLoad(true);
    };

    tryLoad();
    const handler = () => tryLoad();
    window.addEventListener("cvedge:consent-granted", handler);
    return () => window.removeEventListener("cvedge:consent-granted", handler);
  }, []);

  if (pathname?.startsWith("/admin")) return null;
  if (!shouldLoad) return null;

  return (
    <Script id="impact-utt" strategy="afterInteractive">
      {`
        (function(i,m,p,a,c,t){
          c.ire_o=p;
          c[p]=c[p]||function(){(c[p].a=c[p].a||[]).push(arguments)};
          t=a.createElement(m);
          var z=a.getElementsByTagName(m)[0];
          t.async=1;t.src=i;
          z.parentNode.insertBefore(t,z);
        })('${IMPACT_UTT_SRC}','script','impactStat',document,window);
        impactStat('transformLinks');
        impactStat('trackImpression');
      `}
    </Script>
  );
}
