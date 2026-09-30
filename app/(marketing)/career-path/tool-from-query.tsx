"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CareerPathTool } from "@/components/career-path/career-path-tool";

function ToolWithRole({ aside }: { aside: React.ReactNode }) {
  const role = useSearchParams().get("role")?.trim().slice(0, 80) || undefined;
  return <CareerPathTool initialRole={role} hero={{ aside }} />;
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
