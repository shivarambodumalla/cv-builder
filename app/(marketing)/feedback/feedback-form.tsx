"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RATING_LABELS } from "@/components/popups/feedback-prompt";

interface Props {
  userId?: string;
  token?: string;
  initialRating: number;
}

export function FeedbackForm({ userId, token, initialRating }: Props) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [canPublish, setCanPublish] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error" | "unauthorized">("idle");

  async function submit() {
    if (!rating || state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment, source: "email", can_publish: canPublish, u: userId, t: token }),
      });
      if (res.status === 401) { setState("unauthorized"); return; }
      if (!res.ok) throw new Error("failed");
      try { localStorage.setItem("cvedge_feedback_given", String(Date.now())); } catch { /* ignore */ }
      setState("sent");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <p className="font-semibold">Thanks. That helps more than you would think.</p>
        <p className="mt-1 text-sm text-muted-foreground">Every rating is read by a person, not a dashboard.</p>
        <Button asChild className="mt-5"><Link href="/dashboard">Back to your resumes</Link></Button>
      </div>
    );
  }

  const shown = hover || rating;

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
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
            className="flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          >
            <Star className={`h-7 w-7 ${n <= shown ? "fill-warning text-warning" : "text-muted-foreground/40"}`} />
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between px-1 text-xs text-muted-foreground" style={{ maxWidth: 5 * 44 }}>
        <span>{RATING_LABELS[1]}</span>
        <span className="font-medium text-foreground">{shown ? RATING_LABELS[shown] : ""}</span>
        <span>{RATING_LABELS[5]}</span>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, 1000))}
        placeholder={rating >= 4 ? "What worked for you? (optional)" : "What should we fix? (optional)"}
        rows={4}
        className="mt-4 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
      />

      {comment.trim().length > 0 && (
        <label className="mt-3 flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={canPublish} onChange={(e) => setCanPublish(e.target.checked)} className="mt-0.5" />
          <span>You may quote this on the CVEdge site with my first name.</span>
        </label>
      )}

      {state === "error" && <p className="mt-3 text-sm text-error">Could not send. Please try again.</p>}
      {state === "unauthorized" && (
        <p className="mt-3 text-sm text-error">
          This link has expired. <Link href="/login?returnUrl=%2Ffeedback" className="underline">Sign in</Link> to leave feedback.
        </p>
      )}

      <Button onClick={submit} disabled={!rating || state === "sending"} className="mt-5 w-full sm:w-auto">
        {state === "sending" ? "Sending…" : "Send feedback"}
      </Button>
    </div>
  );
}
