"use client";
import { ThemeLogo } from "@/components/shared/theme-logo";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    console.error("[error-page]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center bg-[#F7F5F0] dark:bg-background">
      {/* Logo */}
      <Link href="/" className="mb-12">
        <ThemeLogo className="h-8" />
      </Link>

      {/* Illustration */}
      <div className="mb-8">
        <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Document */}
          <rect x="50" y="10" width="100" height="130" rx="6" fill="#DCFCE7" stroke="#065F46" strokeWidth="1.5"/>
          <rect x="65" y="26" width="50" height="4" rx="2" fill="#065F46" opacity="0.5"/>
          <rect x="65" y="36" width="70" height="3" rx="1.5" fill="#065F46" opacity="0.25"/>
          <rect x="65" y="44" width="60" height="3" rx="1.5" fill="#065F46" opacity="0.25"/>
          <rect x="65" y="52" width="65" height="3" rx="1.5" fill="#065F46" opacity="0.25"/>
          <rect x="65" y="60" width="40" height="3" rx="1.5" fill="#065F46" opacity="0.15"/>

          {/* Broken ATS ring */}
          <g className="animate-shake">
            <circle cx="130" cy="30" r="22" fill="white" stroke="#e5e7eb" strokeWidth="4"/>
            <circle cx="130" cy="30" r="22" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="40 30 20 48" strokeLinecap="round" transform="rotate(-90 130 30)"/>
            <text x="130" y="35" fontFamily="system-ui" fontWeight="800" fontSize="14" fill="#ef4444" textAnchor="middle">!!</text>
          </g>

          {/* Glitch lines */}
          <rect x="60" y="78" width="80" height="2" rx="1" fill="#ef4444" opacity="0.15"/>
          <rect x="70" y="86" width="50" height="2" rx="1" fill="#ef4444" opacity="0.1"/>
          <rect x="65" y="94" width="60" height="2" rx="1" fill="#ef4444" opacity="0.08"/>
        </svg>
      </div>

      {/* Copy */}
      <h1 className="text-2xl sm:text-3xl font-bold text-[#0C1A0E] dark:text-foreground">
        Something broke on our end.
      </h1>
      <p className="mt-3 text-base text-[#78716C] dark:text-muted-foreground max-w-md">
        Our AI is having a moment. This happens less often than a bad CV gets rejected, which is saying something.
      </p>

      {/* CTAs */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Button size="lg" className="h-12 px-6 bg-[#065F46] hover:bg-[#064E3B]" onClick={reset}>
          Try again
        </Button>
        <Button size="lg" variant="ghost" className="h-12 px-6" asChild>
          <Link href="/">Go home</Link>
        </Button>
      </div>

      {/* Dev error details */}
      {isDev && error.message && (
        <div className="mt-8 w-full max-w-lg">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 mx-auto text-xs text-[#78716C]/60 hover:text-[#78716C]"
          >
            Error details <ChevronDown className={`h-3 w-3 transition-transform ${showDetails ? "rotate-180" : ""}`} />
          </button>
          {showDetails && (
            <pre className="mt-2 rounded-lg bg-black/5 dark:bg-white/5 p-4 text-left text-[11px] text-[#78716C] overflow-auto max-h-40 font-mono">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
              {error.digest && `\n\nDigest: ${error.digest}`}
            </pre>
          )}
        </div>
      )}

      {/* Footer */}
      <p className="mt-16 text-xs text-[#78716C]/60 dark:text-muted-foreground/40">
        Error 500 &middot; Something went wrong
      </p>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          20% { transform: translate(-1px, 0) rotate(-1deg); }
          40% { transform: translate(1px, 0) rotate(1deg); }
          60% { transform: translate(-1px, 0) rotate(0deg); }
          80% { transform: translate(1px, 0) rotate(-1deg); }
        }
        .animate-shake { animation: shake 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
