"use client";

import { useEffect } from "react";

export function DevReload() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    let retryCount = 0;

    function checkServer() {
      fetch("/_next/static/chunks/webpack.js", { cache: "no-store" })
        .then((res) => {
          if (!res.ok && retryCount > 0) {
            window.location.reload();
          }
          retryCount = 0;
        })
        .catch(() => {
          retryCount++;
          if (retryCount >= 3) {
            setTimeout(() => window.location.reload(), 2000);
          } else {
            setTimeout(checkServer, 1000);
          }
        });
    }

    const interval = setInterval(checkServer, 5000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
