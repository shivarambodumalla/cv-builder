"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AppPopover } from "./app-popover";

interface ReturnVisitNudgeProps {
  userName: string;
  lastScore: number | null;
  lastCvTitle: string | null;
  lastCvId: string | null;
  lastSignInAt: string | null;
}

export function ReturnVisitNudge({ userName, lastScore, lastCvId, lastSignInAt }: ReturnVisitNudgeProps) {
  const router = useRouter();
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    if (!lastSignInAt) return;
    const daysSince = (Date.now() - new Date(lastSignInAt).getTime()) / 86400000;
    if (daysSince >= 3) setEligible(true);
  }, [lastSignInAt]);

  const greeting = userName ? `Welcome back, ${userName}!` : "Welcome back!";
  const scoreText = lastScore != null ? `Your ATS score was ${lastScore} last time.` : "Pick up where you left off.";
  const ctaHref = lastCvId ? `/resume/${lastCvId}` : "/dashboard";

  return (
    <AppPopover
      id="return_visit"
      title={greeting}
      subtitle={scoreText}
      ctaText="Continue where you left off"
      onAction={() => router.push(ctaHref)}
      cooldownDays={1}
      enabled={eligible}
      icon={
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
          <ArrowRight className="h-3.5 w-3.5 text-white" />
        </div>
      }
    />
  );
}
