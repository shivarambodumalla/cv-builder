"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type UpgradeTrigger =
  | "download"
  | "ats_limit"
  | "job_match_limit"
  | "cover_letter_limit"
  | "ai_rewrite_limit"
  | "template_locked"
  | "cv_limit"
  | "generic";

interface UpgradeModalContextType {
  isOpen: boolean;
  trigger: UpgradeTrigger;
  daysUntilReset: number | null;
  openUpgradeModal: (trigger: UpgradeTrigger, daysUntilReset?: number) => void;
  closeUpgradeModal: () => void;
}

const UpgradeModalContext = createContext<UpgradeModalContextType>({
  isOpen: false,
  trigger: "generic",
  daysUntilReset: null,
  openUpgradeModal: () => {},
  closeUpgradeModal: () => {},
});

export function UpgradeModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [trigger, setTrigger] = useState<UpgradeTrigger>("generic");
  const [daysUntilReset, setDaysUntilReset] = useState<number | null>(null);

  function openUpgradeModal(t: UpgradeTrigger, days?: number) {
    setTrigger(t);
    setDaysUntilReset(days ?? null);
    setIsOpen(true);
  }

  function closeUpgradeModal() {
    setIsOpen(false);
  }

  return (
    <UpgradeModalContext.Provider value={{ isOpen, trigger, daysUntilReset, openUpgradeModal, closeUpgradeModal }}>
      {children}
    </UpgradeModalContext.Provider>
  );
}

export function useUpgradeModal() {
  return useContext(UpgradeModalContext);
}
