"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

// Pages with their own conversion goal — the CV-review banner competes with them
const HIDDEN_PATHS = ["/ai-product-design"];

export function HelloBar() {
  const [visible, setVisible] = useState(true);
  const pathname = usePathname();

  if (!visible || HIDDEN_PATHS.some((p) => pathname?.startsWith(p))) return null;

  return (
    <div
      className="relative flex items-center justify-center px-10 py-3 text-sm font-medium text-white"
      style={{ background: "#1E3A5F" }}
    >
      <div className="flex items-center gap-2.5 text-center">
        <Sparkles className="shrink-0 text-[#34D399]" size={16} />
        <p className="leading-snug">
          Review by Experts — human feedback on your CV in 24 hours.{" "}
          <Link
            href="/cv-review"
            className="inline-flex items-center gap-1 font-semibold text-[#34D399] hover:opacity-80 transition-opacity"
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
