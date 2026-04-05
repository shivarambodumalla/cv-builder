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
  openUpgradeModal: (trigger: UpgradeTrigger) => void;
  closeUpgradeModal: () => void;
}

const UpgradeModalContext = createContext<UpgradeModalContextType>({
  isOpen: false,
  trigger: "generic",
  openUpgradeModal: () => {},
  closeUpgradeModal: () => {},
});

export function UpgradeModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [trigger, setTrigger] = useState<UpgradeTrigger>("generic");

  function openUpgradeModal(t: UpgradeTrigger) {
    setTrigger(t);
    setIsOpen(true);
  }

  function closeUpgradeModal() {
    setIsOpen(false);
  }

  return (
    <UpgradeModalContext.Provider value={{ isOpen, trigger, openUpgradeModal, closeUpgradeModal }}>
      {children}
    </UpgradeModalContext.Provider>
  );
}

export function useUpgradeModal() {
  return useContext(UpgradeModalContext);
}
