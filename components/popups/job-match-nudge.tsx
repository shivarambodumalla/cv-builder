"use client";

import { ArrowRight } from "lucide-react";

interface JobMatchNudgeProps {
  hasReport: boolean;
  hasJobMatch: boolean;
}

export function JobMatchNudge({ hasReport, hasJobMatch }: JobMatchNudgeProps) {
  if (!hasReport || hasJobMatch) return null;

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 my-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">Now see how you match real jobs</p>
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent("switch-tab", { detail: "job-match" }));
          }}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline shrink-0"
        >
          Run job match <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
