"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
export interface LoaderStep {
  label: string;
  sub: string;
  icon: React.ElementType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface StepLoaderProps {
  steps: LoaderStep[];
  currentStep: number;
  centerIcon: React.ElementType;
  progress?: number;
  footerText?: string;
  fullScreen?: boolean;
}

function StepRow({ step, state }: { step: LoaderStep; state: "done" | "active" | "pending" }) {
  return (
    <div className={cn(
      "flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-500",
      state === "active" && "bg-success/10 shadow-sm",
      state === "pending" && "opacity-30",
    )}>
      <div className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all",
        state === "done" && "bg-success",
        state === "active" && "bg-success/15",
        state === "pending" && "bg-muted",
      )}>
        {state === "done" && <CheckCircle2 className="h-5 w-5 text-white" />}
        {state === "active" && <Loader2 className="h-5 w-5 animate-spin text-success" />}
        {state === "pending" && <CheckCircle2 className="h-5 w-5 text-muted-foreground/30" />}
      </div>
      <div className="min-w-0">
        <p className={cn(
          "text-sm font-semibold",
          state === "done" && "text-success",
          state === "active" && "text-foreground",
          state === "pending" && "text-muted-foreground",
        )}>{step.label}</p>
        <p className={cn(
          "text-[11px] truncate",
          state === "done" ? "text-success/60" : "text-muted-foreground",
        )}>{step.sub}</p>
      </div>
    </div>
  );
}

function LoaderContent({ steps, currentStep, centerIcon: CenterIcon, progress, footerText }: StepLoaderProps) {
  const computedProgress = progress ?? Math.min(100, ((currentStep + 0.5) / steps.length) * 100);

  return (
    <div className="flex flex-col items-center gap-8 py-10 w-full max-w-md mx-auto px-6">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-muted border-t-success" style={{ animationDuration: "1.5s" }} />
        <div className="absolute inset-3 animate-spin rounded-full border-2 border-muted border-b-success/50" style={{ animationDuration: "2.5s", animationDirection: "reverse" }} />
        <CenterIcon className="h-9 w-9 text-success" />
      </div>
      <div className="w-full max-w-sm">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-success transition-all duration-1000 ease-out" style={{ width: `${computedProgress}%` }} />
        </div>
      </div>
      <div className="w-full space-y-2">
        {steps.map((step, i) => (
          <StepRow
            key={i}
            step={step}
            state={i < currentStep ? "done" : i === currentStep ? "active" : "pending"}
          />
        ))}
      </div>
      {footerText && <p className="text-xs text-muted-foreground">{footerText}</p>}
    </div>
  );
}

export function StepLoader(props: StepLoaderProps) {
  if (props.fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <LoaderContent {...props} />
      </div>
    );
  }
  return <LoaderContent {...props} />;
}
