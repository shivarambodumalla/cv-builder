"use client";

import { useEffect, useState } from "react";

/**
 * True for visitors who are very likely in India, judged in the browser from
 * the time zone and language list. No request and no geo lookup; it starts
 * false so the server and client render the same first frame.
 */
export function useIsIndia(): boolean {
  const [isIndia, setIsIndia] = useState(false);
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
      setIsIndia(tz === "Asia/Kolkata" || tz === "Asia/Calcutta" || langs.some((l) => /-IN$/i.test(l)));
    } catch {
      // Leave false: the USD price is always shown.
    }
  }, []);
  return isIndia;
}
