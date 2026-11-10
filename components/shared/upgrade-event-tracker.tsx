"use client";

import { useEffect } from "react";
import { trackUpgrade } from "@/lib/analytics/events";
import { BILLING_PERIODS, firstPaymentUsd, type BillingPeriod } from "@/lib/billing/pricing";

/**
 * /api/billing/success redirects a buyer whose subscription just started to
 * /dashboard?upgraded=<period>. Fire the purchase conversion once (GA4, Google
 * Ads, Microsoft UET) at the amount actually charged, then drop the param so a
 * refresh doesn't count it again.
 */
export function UpgradeEventTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const period = params.get("upgraded");
    if (!period) return;

    if ((BILLING_PERIODS as string[]).includes(period)) {
      trackUpgrade(firstPaymentUsd(period as BillingPeriod));
    }

    params.delete("upgraded");
    const qs = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash);
  }, []);

  return null;
}
