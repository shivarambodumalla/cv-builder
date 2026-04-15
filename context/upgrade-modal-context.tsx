"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { logActivity } from "@/lib/analytics/log";

export type UpgradeTrigger =
  | "cv_limit"
  | "ats_limit"
  | "rewrite_limit"
  | "job_match_limit"
  | "cover_letter_limit"
  | "fix_all_limit"
  | "cv_tailor_limit"
  | "offer_eval_limit"
  | "portfolio_scan_limit"
  | "story_summary_limit"
  | "interview_prep_limit"
  | "template_locked"
  | "download"
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
    logActivity("Saw upgrade modal", { trigger: t });
  }

  function closeUpgradeModal() {
    setIsOpen(false);
    logActivity("Dismissed upgrade modal", { trigger });
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
