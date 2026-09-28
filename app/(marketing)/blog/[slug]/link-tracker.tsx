"use client";

import { useEffect } from "react";

interface Props {
  postSlug: string;
}

export function LinkTracker({ postSlug }: Props) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hostname === "localhost") return;

    // Covers the article body plus the inline CTA, related posts and end CTA.
    const root = document.querySelector("[data-link-track-root]");
    if (!root) return;

    function handleClick(e: Event) {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const linkUrl = target.getAttribute("href") ?? "";
      const linkText = target.textContent?.trim() ?? "";
      // Inline CTA, related posts and end CTA mark their block so their clicks
      // are counted apart from body links pointing at the same page.
      const placement = target.closest<HTMLElement>("[data-track-placement]")?.dataset.trackPlacement;

      // Skip anchor links and empty hrefs
      if (!linkUrl || linkUrl.startsWith("#")) return;

      fetch("/api/telemetry/blog-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postSlug, linkUrl, linkText, placement }),
      }).catch(() => {});
    }

    root.addEventListener("click", handleClick);
    return () => root.removeEventListener("click", handleClick);
  }, [postSlug]);

  return null;
}
