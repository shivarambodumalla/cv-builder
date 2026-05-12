function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
}

/**
 * Triggered when a user views the CV review marketing page
 */
export function trackCvReviewFunnelView() {
  gtag("event", "cv_review_funnel_view", { event_category: "cv_review_funnel" });
}

/**
 * Triggered when a user clicks any "Get started" or CTA button on the marketing page
 */
export function trackCvReviewFunnelClick(ctaName: string) {
  gtag("event", "cv_review_funnel_click", {
    cta_name: ctaName,
    event_category: "cv_review_funnel",
  });
}

/**
 * Generic form interaction events — file upload steps, validation errors, abandonment
 */
export function trackCvReviewFormEvent(action: string, params?: Record<string, string | number>) {
  gtag("event", "cv_review_form_event", {
    action,
    event_category: "cv_review_funnel",
    ...params,
  });
}

/**
 * Triggered when a user views the checkout form
 */
export function trackCvReviewCheckoutView() {
  gtag("event", "cv_review_checkout_view", { event_category: "cv_review_funnel" });
}

/**
 * Triggered when a user initiates the actual checkout (submits the form successfully)
 */
export function trackCvReviewCheckoutStart(tier: string, value: number) {
  gtag("event", "begin_checkout", {
    currency: "USD",
    value,
    items: [
      {
        item_id: `cv_review_${tier}`,
        item_name: `CV Review - ${tier}`,
        price: value,
        quantity: 1,
      },
    ],
    event_category: "cv_review_funnel",
  });
}

/**
 * Triggered after a successful purchase (called from webhook via server-side GA4,
 * or client-side on the post-payment confirmation page if one exists)
 */
export function trackCvReviewPurchase(tier: string, value: number, orderId?: string) {
  gtag("event", "purchase", {
    currency: "USD",
    value,
    transaction_id: orderId || `cv_review_${Date.now()}`,
    items: [
      {
        item_id: `cv_review_${tier}`,
        item_name: `CV Review - ${tier}`,
        price: value,
        quantity: 1,
      },
    ],
    event_category: "cv_review_funnel",
  });
}

/**
 * Triggered when a page section scrolls into view (scroll depth tracking)
 */
export function trackCvReviewSectionView(section: string) {
  gtag("event", "cv_review_section_view", {
    section_name: section,
    event_category: "cv_review_funnel",
  });
}
