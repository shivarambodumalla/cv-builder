"use client";
import { useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export function HelloBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      className="relative flex items-center justify-center px-10 py-3 text-sm font-medium text-white"
      style={{ background: "hsl(var(--secondary))" }}
    >
      <div className="flex items-center gap-2.5 text-center">
        <Sparkles className="shrink-0 text-accent" size={16} />
        <p className="leading-snug">
          Review by Experts — human feedback on your CV in 24 hours.{" "}
          <Link
            href="/cv-review"
            className="inline-flex items-center gap-1 font-semibold text-accent hover:opacity-80 transition-opacity"
          >
            Explore now
            <span aria-hidden>→</span>
          </Link>
        </p>
      </div>
      <button
        onClick={() => setVisible(false)}
        aria-label="Dismiss announcement"
        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors text-xl leading-none"
      >
        ×
      </button>
    </div>
  );
}
