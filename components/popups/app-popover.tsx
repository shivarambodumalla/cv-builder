"use client";

import { useEffect, useState, useCallback } from "react";
import { X, FileText } from "lucide-react";

const STORAGE_PREFIX = "cvedge_popover_";

interface AppPopoverProps {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  onAction: () => void;
  dismissText?: string;
  cooldownDays?: number;
  autoHideSeconds?: number;
  enabled?: boolean;
  icon?: React.ReactNode;
}

export function AppPopover({
  id,
  title,
  subtitle,
  ctaText,
  onAction,
  dismissText = "Maybe later",
  cooldownDays = 7,
  autoHideSeconds = 0,
  enabled = true,
  icon,
}: AppPopoverProps) {
  const [visible, setVisible] = useState(false);

  // Check cooldown
  useEffect(() => {
    if (!enabled) return;
    const dismissed = localStorage.getItem(`${STORAGE_PREFIX}${id}_dismissed`);
    if (dismissed && Date.now() - parseInt(dismissed, 10) < cooldownDays * 86400000) return;

    // Small delay so it doesn't flash on mount
    const t = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(t);
  }, [id, cooldownDays, enabled]);

  // Auto-hide
  useEffect(() => {
    if (!visible || !autoHideSeconds) return;
    const t = setTimeout(() => setVisible(false), autoHideSeconds * 1000);
    return () => clearTimeout(t);
  }, [visible, autoHideSeconds]);

  // Track
  useEffect(() => {
    if (!visible) return;
    fetch("/api/activity/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: `popover_shown:${id}`, page: window.location.pathname }),
    }).catch(() => {});
  }, [visible, id]);

  const dismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(`${STORAGE_PREFIX}${id}_dismissed`, String(Date.now()));
    fetch("/api/activity/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: `popover_dismiss:${id}`, page: window.location.pathname }),
    }).catch(() => {});
  }, [id]);

  const handleAction = useCallback(() => {
    fetch("/api/activity/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: `popover_click:${id}`, page: window.location.pathname }),
    }).catch(() => {});
    localStorage.setItem(`${STORAGE_PREFIX}${id}_dismissed`, String(Date.now()));
    setVisible(false);
    onAction();
  }, [id, onAction]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[80] w-[340px] animate-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-2xl shadow-2xl overflow-hidden border">
        {/* Green header — compact */}
        <div className="bg-[#1E3A5F] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon || (
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
                <FileText className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            <span className="text-white text-xs font-bold">CV<span className="text-[#34D399]">Edge</span></span>
          </div>
          <button onClick={dismiss} className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/20 text-white/70 hover:bg-black/30 hover:text-white transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Body — beige */}
        <div className="bg-[#F5F0E8] dark:bg-card px-4 py-4">
          <h3 className="text-sm font-semibold mb-1">{title}</h3>
          <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>

          <button
            onClick={handleAction}
            className="w-full rounded-lg bg-[#065F46] py-2 text-xs font-semibold text-white hover:bg-[#065F46]/90 transition-colors"
          >
            {ctaText}
          </button>
          <button onClick={dismiss} className="block w-full text-center text-[11px] text-muted-foreground mt-2 hover:text-foreground transition-colors">
            {dismissText}
          </button>
        </div>
      </div>
    </div>
  );
}
