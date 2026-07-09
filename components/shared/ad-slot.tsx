"use client";

import { useEffect } from "react";

export interface AdSlotProps {
  slot: "editor" | "dashboard" | "blog-article" | "blog-end" | "blog-listing" | "jobs-listing" | "homepage";
  format?: "horizontal" | "vertical" | "square";
  plan?: "free" | "starter" | "pro";
}

/**
 * Renders a Google AdSense ad slot.
 * Returns null if user is on a Pro plan (ad-free for subscribers).
 * Reserves min-height to prevent layout shift when ad loads.
 */
export function AdSlot({ slot, format = "horizontal", plan = "free" }: AdSlotProps) {
  // Hide ads for Pro users
  if (plan === "pro") return null;

  // Determine slot ID and dimensions based on slot name
  const slotConfig: Record<string, { slotId: string; minHeight: string }> = {
    editor: { slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_EDITOR || "editor", minHeight: "90px" },
    dashboard: { slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_DASHBOARD || "dashboard", minHeight: "90px" },
    "blog-article": { slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_ARTICLE || "blog-article", minHeight: "250px" },
    "blog-end": { slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_END || "blog-end", minHeight: "250px" },
    "blog-listing": { slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG_LISTING || "blog-listing", minHeight: "250px" },
    "jobs-listing": { slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_JOBS || "jobs-listing", minHeight: "280px" },
    homepage: { slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOMEPAGE || "homepage", minHeight: "280px" },
  };

  const config = slotConfig[slot];
  if (!config) return null;

  useEffect(() => {
    // Push ad unit to AdSense queue if adsbygoogle exists
    if (typeof window !== "undefined" && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        // AdSense script may not be loaded yet or ad blocker may be active
        console.debug("AdSense push failed:", e);
      }
    }
  }, [slot]);

  return (
    <div className="my-4 flex justify-center" style={{ minHeight: config.minHeight }}>
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          minHeight: config.minHeight,
        }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-xxxxxxxxxxxxxxxx"}
        data-ad-slot={config.slotId}
        data-ad-format={format === "horizontal" ? "horizontal" : format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

// Global type augmentation for adsbygoogle
declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}
