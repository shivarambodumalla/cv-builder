"use client";

import { useEffect } from "react";
import { trackPageView } from "./telemetry";

/** Fires one page-view telemetry call per mount with visitor UUID + UTM params. Renders nothing. */
export function PageTracker() {
  useEffect(() => {
    trackPageView();
  }, []);

  return null;
}
