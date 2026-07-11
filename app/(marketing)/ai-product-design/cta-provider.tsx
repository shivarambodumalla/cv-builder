"use client";

import { createContext, useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { CurriculumModal, type CtaMode } from "./curriculum-modal";

const CtaContext = createContext<{ open: (mode: CtaMode) => void }>({ open: () => {} });

/** Client island: holds the single lead-capture modal; server sections render CtaButton inside it. */
export function MentorshipCtaProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<CtaMode | null>(null);
  return (
    <CtaContext.Provider value={{ open: setMode }}>
      {children}
      <CurriculumModal mode={mode} onClose={() => setMode(null)} />
    </CtaContext.Provider>
  );
}

export function CtaButton({
  children,
  mode,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  mode: CtaMode;
  variant?: "default" | "outline" | "secondary";
  className?: string;
}) {
  const { open } = useContext(CtaContext);
  return (
    <Button size="lg" variant={variant} className={className} onClick={() => open(mode)}>
      {children}
    </Button>
  );
}
