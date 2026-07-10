"use client";

import { createContext, useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { CurriculumModal } from "./curriculum-modal";

const CtaContext = createContext<{ open: () => void }>({ open: () => {} });

/** Client island: holds the single curriculum modal; server sections render CtaButton inside it. */
export function MentorshipCtaProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <CtaContext.Provider value={{ open: () => setIsOpen(true) }}>
      {children}
      <CurriculumModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </CtaContext.Provider>
  );
}

export function CtaButton({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "outline" | "secondary";
  className?: string;
}) {
  const { open } = useContext(CtaContext);
  return (
    <Button size="lg" variant={variant} className={className} onClick={open}>
      {children}
    </Button>
  );
}
