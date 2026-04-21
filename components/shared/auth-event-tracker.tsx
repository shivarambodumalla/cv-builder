"use client";

import { useEffect } from "react";
import { trackSignup, trackLogin } from "@/lib/analytics/events";

export function AuthEventTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const event = params.get("auth_event");
    if (event !== "signup" && event !== "login") return;

    if (event === "signup") trackSignup("google");
    else trackLogin("google");

    params.delete("auth_event");
    const qs = params.toString();
    const newUrl = window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash;
    window.history.replaceState(null, "", newUrl);
  }, []);

  return null;
}
