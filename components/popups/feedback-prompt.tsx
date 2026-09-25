"use client";

import { useEffect, useState } from "react";
import { Star, X } from "lucide-react";

const GIVEN_KEY = "cvedge_feedback_given";
const DISMISS_KEY = "cvedge_popover_feedback_prompt_dismissed";
const SKIP_COOLDOWN_HOURS = 24;

/** 4 and 5 are "good": we stop asking. 3 and below: ask again on every download. */
export const GOOD_RATING = 4;

export const RATING_LABELS: Record<number, string> = {
  1: "Not useful",
  2: "Poor",
  3: "Okay",
  4: "Good",
  5: "Excellent",
};

interface FeedbackPromptProps {
  /** Flip to true right after a successful download. */
  open: boolean;
  cvId?: string;
  onClose: () => void;
  /** Called with the submitted rating so the editor stops asking after a good one. */
  onSubmitted?: (rating: number) => void;
}

function logEvent(event: string) {
  fetch("/api/activity/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, page: window.location.pathname }),
  }).catch(() => {});
}

/**
 * Ask after a download unless the user already gave a good rating (server
 * value first, browser flag as fallback) or skipped within the last day.
 * A bad rating keeps the question coming back until it turns good.
 */
export function shouldAskForFeedback(lastServerRating: number | null): boolean {
  if (lastServerRating != null && lastServerRating >= GOOD_RATING) return false;
  try {
    if (lastServerRating == null && localStorage.getItem(GIVEN_KEY)) return false;
    const skipped = localStorage.getItem(DISMISS_KEY);
    if (skipped && Date.now() - parseInt(skipped, 10) < SKIP_COOLDOWN_HOURS * 3600000) return false;
    return true;
  } catch {
    return false;
  }
}

export function FeedbackPrompt({ open, cvId, onClose, onSubmitted }: FeedbackPromptProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [canPublish, setCanPublish] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    if (open) logEvent("popover_shown:feedback_prompt");
  }, [open]);

  if (!open) return null;

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* ignore */ }
    logEvent("popover_dismiss:feedback_prompt");
    onClose();
  }

  async function submit() {
    if (!rating || state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment, cv_id: cvId, source: "popup", can_publish: canPublish }),
      });
      if (!res.ok) throw new Error("failed");
      try {
        if (rating >= GOOD_RATING) localStorage.setItem(GIVEN_KEY, String(Date.now()));
        else localStorage.removeItem(GIVEN_KEY);
      } catch { /* ignore */ }
      logEvent(`popover_click:feedback_prompt`);
      onSubmitted?.(rating);
      setState("sent");
      setTimeout(onClose, 2500);
    } catch {
      setState("error");
    }
  }

  const shown = hover || rating;

  return (
    <div className="fixed bottom-6 right-6 z-[80] w-[340px] max-w-[calc(100vw-32px)] animate-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-2xl shadow-2xl overflow-hidden border">
        <div className="bg-[#1E3A5F] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
              <Star className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-white text-xs font-bold">CV<span className="text-[#34D399]">Edge</span></span>
          </div>
          <button onClick={dismiss} aria-label="Close" className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/20 text-white/70 hover:bg-black/30 hover:text-white transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="bg-[#F5F0E8] dark:bg-card px-4 py-4">
          {state === "sent" ? (
            <p className="text-sm font-semibold py-2">
              {rating >= GOOD_RATING ? "Thanks, that helps a lot." : "Thanks. We read every one of these and will do better."}
            </p>
          ) : (
            <>
              <h3 className="text-sm font-semibold mb-0.5">How did CVEdge do?</h3>
              <p className="text-xs text-muted-foreground mb-3">Your resume is downloading. One tap tells us if it was worth it.</p>

              <div className="flex gap-1 mb-1" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(n)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <Star className={`h-6 w-6 ${n <= shown ? "fill-warning text-warning" : "text-muted-foreground/40"}`} />
                  </button>
                ))}
              </div>
              <div className="flex justify-between px-1 mb-3 text-[10px] text-muted-foreground">
                <span>{RATING_LABELS[1]}</span>
                <span className="font-medium text-foreground">{shown ? RATING_LABELS[shown] : ""}</span>
                <span>{RATING_LABELS[5]}</span>
              </div>

              {rating > 0 && (
                <>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, 1000))}
                    placeholder={rating >= 4 ? "What worked for you? (optional)" : "What should we fix? (optional)"}
                    rows={3}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none mb-2"
                  />
                  {comment.trim().length > 0 && (
                    <label className="flex items-start gap-2 text-[11px] text-muted-foreground mb-3 cursor-pointer">
                      <input type="checkbox" checked={canPublish} onChange={(e) => setCanPublish(e.target.checked)} className="mt-0.5" />
                      <span>You may quote this on the CVEdge site with my first name.</span>
                    </label>
                  )}
                </>
              )}

              {state === "error" && <p className="text-xs text-error mb-2">Could not send. Try again.</p>}

              <button
                onClick={submit}
                disabled={!rating || state === "sending"}
                className="w-full rounded-lg bg-[#065F46] py-2 text-xs font-semibold text-white hover:bg-[#065F46]/90 transition-colors disabled:opacity-50"
              >
                {state === "sending" ? "Sending…" : "Send feedback"}
              </button>
              <button onClick={dismiss} className="block w-full text-center text-[11px] text-muted-foreground mt-2 hover:text-foreground transition-colors">
                Skip
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
