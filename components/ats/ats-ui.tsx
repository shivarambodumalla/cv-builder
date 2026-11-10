"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/* Small building blocks shared by the ATS panel's states. */

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("block shrink-0 animate-spin rounded-full border-[2.5px] border-current border-r-transparent", className)}
    />
  );
}

export function Card({ children, className, ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("overflow-hidden rounded-2xl bg-white", className)} {...rest}>
      {children}
    </section>
  );
}

const BUTTON = {
  /** Brand green: the one main action on a surface. */
  primary: "bg-[#065F46] text-white hover:brightness-[0.92] disabled:bg-[#E7E1D6] disabled:text-[#8A827A] disabled:hover:brightness-100",
  /** Navy: system actions (sign in, re-scan, submit). */
  navy: "bg-secondary text-secondary-foreground hover:brightness-95 disabled:opacity-60",
  outline: "border border-[#E0D8CC] bg-white text-[#0C1A0E] hover:border-[#C9C0B2] hover:bg-[#F7F5F0] disabled:bg-[#F7F5F0] disabled:text-[#8A827A]",
  ghost: "bg-transparent text-current hover:underline",
} as const;

export function PanelButton({
  variant = "outline",
  size = "md",
  className,
  children,
  ...rest
}: {
  variant?: keyof typeof BUTTON;
  size?: "sm" | "md";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 font-semibold transition disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#065F46]",
        size === "md" ? "h-11 rounded-xl px-4 text-sm" : "h-11 rounded-[10px] px-3 text-[13px] sm:h-9",
        BUTTON[variant],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/** "+9 pts" tile; a tick once the issue is addressed. */
export function PointsTile({ points, addressed, small }: { points: number; addressed?: boolean; small?: boolean }) {
  const box = small ? "h-11 w-11 sm:h-12 sm:w-12" : "h-11 w-11 sm:h-[52px] sm:w-[52px]";
  if (addressed) {
    return (
      <div role="img" aria-label="Addressed" className={cn("flex shrink-0 items-center justify-center rounded-xl bg-[#EEF6F1]", box)}>
        <Check className="h-5 w-5 text-[#065F46]" strokeWidth={2.5} />
      </div>
    );
  }
  return (
    <div role="img" aria-label={`About ${points} points`} className={cn("flex shrink-0 flex-col items-center justify-center rounded-xl bg-[#EEF6F1]", box)}>
      <span className="text-[15px] font-extrabold leading-none text-[#065F46] sm:text-lg">+{points}</span>
      <span className="mt-0.5 text-[10px] font-semibold text-[#065F46] sm:text-[11px]">pts</span>
    </div>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5F5954]", className)}>{children}</span>;
}

/** Pro pill used on gated buttons. */
export function ProPill({ inverted }: { inverted?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-[7px] py-[3px] text-[10px] font-bold uppercase leading-tight tracking-[0.06em]",
        inverted ? "bg-white text-[#065F46]" : "bg-[#065F46] text-white"
      )}
    >
      Pro
    </span>
  );
}
