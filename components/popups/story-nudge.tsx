"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

interface StoryNudgeProps {
  storyCount: number;
  hasCvs: boolean;
}

export function StoryNudge({ storyCount, hasCvs }: StoryNudgeProps) {
  if (storyCount > 0 || !hasCvs) return null;

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Your CV has achievements worth turning into stories</p>
          <p className="text-xs text-muted-foreground mt-0.5">Extract STAR stories from your CV in seconds.</p>
          <Link
            href="/interview-coach/extract"
            className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:underline"
          >
            Extract stories <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
