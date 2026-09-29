"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CareerPathTool } from "@/components/career-path/career-path-tool";

function ToolWithRole() {
  const role = useSearchParams().get("role")?.trim().slice(0, 80) || undefined;
  return <CareerPathTool initialRole={role} />;
}

/**
 * Reads ?role= on the client so /career-path itself renders statically.
 * The fallback is the same tool with an empty title field.
 */
export function CareerPathToolFromQuery() {
  return (
    <Suspense fallback={<CareerPathTool />}>
      <ToolWithRole />
    </Suspense>
  );
}
