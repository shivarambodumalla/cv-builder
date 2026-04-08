import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { cn } from "@/lib/utils";

type ConfidenceLevel = "high" | "medium" | "low";
type ChipSize = "sm" | "md";

const CONFIG: Record<ConfidenceLevel, { label: string; bg: string; icon: typeof ShieldCheck }> = {
  high: { label: "High Confidence", bg: "bg-success", icon: ShieldCheck },
  medium: { label: "Medium Confidence", bg: "bg-warning", icon: ShieldAlert },
  low: { label: "Low Confidence", bg: "bg-error", icon: ShieldX },
};

const SIZE: Record<ChipSize, string> = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
};

export function ConfidenceChip({ level, size = "md" }: { level: ConfidenceLevel; size?: ChipSize }) {
  const { label, bg, icon: Icon } = CONFIG[level] ?? CONFIG.medium;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full font-medium text-white", bg, SIZE[size])}>
      <Icon size={14} strokeWidth={2.5} />
      {label}
    </span>
  );
}
