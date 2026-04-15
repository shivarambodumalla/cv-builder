"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function PageSessionTracker() {
  const pathname = usePathname();
  const startRef = useRef<number>(Date.now());
  const pathRef = useRef<string>(pathname);

  useEffect(() => {
    const flush = (path: string, enteredAt: number) => {
      const durationMs = Date.now() - enteredAt;
      if (durationMs < 1000) return;
      const body = JSON.stringify({ path, durationMs, enteredAt: new Date(enteredAt).toISOString() });
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon("/api/telemetry/page-session", blob);
      } else {
        fetch("/api/telemetry/page-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    };

    if (pathRef.current !== pathname) {
      flush(pathRef.current, startRef.current);
      pathRef.current = pathname;
      startRef.current = Date.now();
    }

    const handleUnload = () => flush(pathRef.current, startRef.current);
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") flush(pathRef.current, startRef.current);
    };

    window.addEventListener("beforeunload", handleUnload);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [pathname]);

  return null;
}
