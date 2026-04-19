"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useActivity } from "@/lib/analytics/useActivity";

const PAGE_NAMES: Record<string, string> = {
  "/dashboard": "Opened dashboard",
  "/resume": "Opened CV editor",
  "/pricing": "Opened pricing page",
  "/interview-coach": "Opened interview coach",
  "/stories": "Opened interview coach",
  "/jobs": "Opened jobs page",
  "/my-jobs": "Opened jobs page",
  "/profile": "Opened profile page",
  "/billing": "Opened billing page",
  "/upload-resume": "Opened upload page",
};

export function PageTracker() {
  const pathname = usePathname();
  const { log } = useActivity();

  useEffect(() => {
    if (!pathname) return;
    if (typeof window !== "undefined" && window.location.hostname === "localhost") return;
    const base = "/" + pathname.split("/")[1];
    const eventName = PAGE_NAMES[base];
    if (eventName) log(eventName);
  }, [pathname, log]);

  return null;
}
