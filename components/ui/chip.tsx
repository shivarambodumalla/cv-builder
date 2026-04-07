import { cn } from "@/lib/utils";

// A = Active/Selected — user has chosen this
// B = Available/Default — can be selected
// C = Trust/Confirmed — positive signal
// Red outline = Warning/Missing/Error
// Amber = Urgency/Discount/Promotion
// Never use green fill for warnings
// Never use red for positive states
// Minimum font size: 11px
// Minimum tap target: 44px height on mobile

type ChipVariant = "active" | "outline" | "trust" | "red" | "amber";

interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  children: React.ReactNode;
}

const variantStyles: Record<ChipVariant, string> = {
  active: "bg-[#065F46] text-white border-transparent",
  outline: "bg-transparent text-[#065F46] border-[#065F46] dark:text-primary dark:border-primary",
  trust: "bg-white text-[#0C1A0E] border-[#E0D8CC] dark:bg-card dark:text-foreground dark:border-border",
  red: "bg-transparent text-red-700 border-red-300 dark:text-red-400 dark:border-red-800",
  amber: "bg-[#FEF3C7] text-[#B45309] border-transparent dark:bg-amber-950/30 dark:text-amber-400",
};

export function Chip({ variant = "outline", className, children, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-1.5 text-xs font-medium whitespace-nowrap",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
