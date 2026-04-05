"use client";

import { cn } from "@/lib/utils";

export interface ScoreMilestone {
  tier: string;
  label: string;
  color: string;
  textColor: string;
  message: string;
}

export function getScoreMilestone(score: number): ScoreMilestone {
  if (score >= 80) return { tier: "interview-ready", label: "Interview Ready", color: "text-green-500", textColor: "text-green-600 dark:text-green-400", message: "Your resume is ready for most ATS systems" };
  if (score >= 70) return { tier: "good-match", label: "Good Match", color: "text-blue-500", textColor: "text-blue-600 dark:text-blue-400", message: "A few tweaks could push you over the top" };
  if (score >= 50) return { tier: "needs-work", label: "Needs Work", color: "text-amber-500", textColor: "text-amber-600 dark:text-amber-400", message: "Fix the issues below to improve your chances" };
  return { tier: "needs-attention", label: "Needs Attention", color: "text-red-500", textColor: "text-red-600 dark:text-red-400", message: "Focus on the high-impact fixes first" };
}

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  subtitle?: string;
  subtitleColor?: string;
}

export function ScoreRing({ score: rawScore, size = 120, strokeWidth = 10, label, subtitle, subtitleColor }: ScoreRingProps) {
  const score = Number(rawScore) || 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const milestone = getScoreMilestone(score);
  const ringColor = milestone.color;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(ringColor, "transition-all duration-700")}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold">{score}</span>
        {subtitle && (
          <span className={cn("text-[9px] font-semibold leading-tight", subtitleColor || milestone.textColor)}>
            {subtitle}
          </span>
        )}
        {!subtitle && (
          <span className={cn("text-[9px] font-semibold leading-tight", milestone.textColor)}>
            {milestone.label}
          </span>
        )}
        <span className="text-[9px] text-muted-foreground">{label ?? "ATS Score"}</span>
      </div>
    </div>
  );
}
