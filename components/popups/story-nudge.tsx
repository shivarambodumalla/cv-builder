"use client";

import Link from "next/link";
import { PenLine, ArrowRight } from "lucide-react";

interface StoryNudgeProps {
  storyCount: number;
  hasCvs: boolean;
}

/**
 * First-answer nudge for people who have a resume but no experiences yet.
 * Points at the free manual editor, not the Pro extract flow.
 */
export function StoryNudge({ storyCount, hasCvs }: StoryNudgeProps) {
  if (storyCount > 0 || !hasCvs) return null;

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
          <PenLine className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Turn your achievements into STAR answers</p>
          <p className="text-xs text-muted-foreground mt-0.5">Your resume lists what you did. Write each one as an answer you can give in an interview.</p>
          <Link
            href="/interview-coach/new"
            className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:underline"
          >
            Write your first answer <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
