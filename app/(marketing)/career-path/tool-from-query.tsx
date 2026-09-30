"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CareerPathTool } from "@/components/career-path/career-path-tool";

function ToolWithRole({ aside }: { aside: React.ReactNode }) {
  const params = useSearchParams();
  const role = params.get("role")?.trim().slice(0, 80) || undefined;
  // Hand-off from a role page: it collected the answers (and uploaded the
  // resume), so this page starts the search and shows the loader itself.
  const token = params.get("token")?.trim() || undefined;
  const autoRun = params.get("run") === "1" && (!!role || !!token);
  return (
    <CareerPathTool
      initialRole={role}
      initialRedirectToken={token}
      autoRun={autoRun}
      hero={{ aside }}
    />
  );
}

/**
 * Reads ?role= on the client so /career-path itself renders statically.
 * The fallback is the same hero with an empty title field.
 */
export function CareerPathToolFromQuery({ aside }: { aside: React.ReactNode }) {
  return (
    <Suspense fallback={<CareerPathTool hero={{ aside }} />}>
      <ToolWithRole aside={aside} />
    </Suspense>
  );
}
