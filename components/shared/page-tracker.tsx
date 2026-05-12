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
  "/cv-review": "Opened CV review page",
  "/resumes": "Opened resumes page",
  "/blog": "Opened blog",
  "/interview-prep": "Opened interview prep page",
  "/resume-templates": "Opened resume templates page",
  "/resume-examples": "Opened resume examples page",
  "/resume-examples": "Opened resume examples page",
  "/ats-friendly-resume": "Opened ATS guide page",
  "/cv-templates": "Opened CV templates page",
  "/free-resume-builder": "Opened free resume builder page",
  "/login": "Opened login page",
  "/register": "Opened register page",
  "/privacy": "Opened privacy page",
  "/terms": "Opened terms page",
  "/settings": "Opened settings page",
  "/unsubscribe": "Opened unsubscribe page",
};

// Paths that should not be tracked (admin, API, internals)
const SKIP_PREFIXES = ["/admin", "/api", "/_next", "/popup"];

export function PageTracker() {
  const pathname = usePathname();
  const { log } = useActivity();

  useEffect(() => {
    if (!pathname) return;
    if (typeof window !== "undefined" && window.location.hostname === "localhost") return;
    if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) return;

    const base = "/" + pathname.split("/")[1];
    // Use human-readable name if known, otherwise log the path itself
    const eventName = PAGE_NAMES[base] ?? `Visited ${base}`;
    log(eventName);
  }, [pathname, log]);

  return null;
}
