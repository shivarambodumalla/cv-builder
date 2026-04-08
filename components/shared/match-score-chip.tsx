import { CheckCircle2, ThumbsUp, Minus, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type MatchLevel = "strong" | "good" | "average" | "poor";
type ChipSize = "sm" | "md";

const CONFIG: Record<MatchLevel, { label: string; bg: string; icon: typeof CheckCircle2 }> = {
  strong: { label: "Strong Match", bg: "bg-green-500", icon: CheckCircle2 },
  good: { label: "Good Match", bg: "bg-blue-500", icon: ThumbsUp },
  average: { label: "Average Match", bg: "bg-amber-500", icon: Minus },
  poor: { label: "Poor Match", bg: "bg-red-500", icon: XCircle },
};

const SIZE: Record<ChipSize, string> = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
};

function getLevel(score: number): MatchLevel {
  if (score >= 80) return "strong";
  if (score >= 60) return "good";
  if (score >= 40) return "average";
  return "poor";
}

export function MatchScoreChip({ score, size = "md" }: { score: number; size?: ChipSize }) {
  const level = getLevel(score);
  const { label, bg, icon: Icon } = CONFIG[level];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full font-medium text-white", bg, SIZE[size])}>
      <Icon size={14} strokeWidth={2.5} />
      {label}
    </span>
  );
}
