"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { logActivity, type ActivityMetadata } from "./log";

export function useActivity() {
  const pathname = usePathname();

  const log = useCallback(
    (event: string, metadata?: ActivityMetadata) => {
      logActivity(event, { page: pathname, metadata });
    },
    [pathname]
  );

  return { log };
}
