"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function PageSessionTracker() {
  const pathname = usePathname();
  const startRef = useRef<number>(Date.now());
  const pathRef = useRef<string>(pathname);
  const flushedRef = useRef<boolean>(false);

  useEffect(() => {
    const flush = (path: string, enteredAt: number) => {
      const durationMs = Date.now() - enteredAt;
      if (durationMs < 1000 || flushedRef.current) return;
      flushedRef.current = true;
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

    // Route changed — flush previous page, reset for new one
    if (pathRef.current !== pathname) {
      flush(pathRef.current, startRef.current);
      pathRef.current = pathname;
      startRef.current = Date.now();
      flushedRef.current = false;
    }

    const handleUnload = () => flush(pathRef.current, startRef.current);

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        // Tab hidden → flush current segment, mark flushed
        flush(pathRef.current, startRef.current);
      } else {
        // Tab visible again → start a new segment (don't count hidden time)
        startRef.current = Date.now();
        flushedRef.current = false;
      }
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
