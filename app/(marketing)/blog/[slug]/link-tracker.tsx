"use client";

import { useEffect } from "react";

interface Props {
  postSlug: string;
}

export function LinkTracker({ postSlug }: Props) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hostname === "localhost") return;

    const article = document.querySelector("article");
    if (!article) return;

    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const linkUrl = target.getAttribute("href") ?? "";
      const linkText = target.textContent?.trim() ?? "";

      // Skip anchor links and empty hrefs
      if (!linkUrl || linkUrl.startsWith("#")) return;

      fetch("/api/telemetry/blog-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postSlug, linkUrl, linkText }),
      }).catch(() => {});
    }

    article.addEventListener("click", handleClick);
    return () => article.removeEventListener("click", handleClick);
  }, [postSlug]);

  return null;
}
