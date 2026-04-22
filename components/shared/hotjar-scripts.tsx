"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { hasConsent } from "@/components/shared/cookie-consent";

const HOTJAR_ID = 6695911;
const HOTJAR_SV = 6;

/**
 * Loads Hotjar for public users only.
 * Skipped on /admin routes (matches GAScripts), on localhost, for Playwright/automation,
 * and until cookie consent is granted.
 */
export function HotjarScripts() {
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
    <Script id="hotjar-init" strategy="afterInteractive">
      {`
        (function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:${HOTJAR_ID},hjsv:${HOTJAR_SV}};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `}
    </Script>
  );
}
