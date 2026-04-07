import { ThemeLogo } from "@/components/shared/theme-logo";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "404 | Page Not Found | CVEdge" };

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center bg-[#F7F5F0] dark:bg-background">
      {/* Logo */}
      <Link href="/" className="mb-12">
        <ThemeLogo className="h-8" />
      </Link>

      {/* Illustration */}
      <div className="animate-float mb-8">
        <svg width="280" height="160" viewBox="0 0 280 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Left "4" as document */}
          <rect x="10" y="20" width="60" height="80" rx="4" fill="#DCFCE7" stroke="#065F46" strokeWidth="1.5"/>
          <rect x="20" y="32" width="30" height="3" rx="1.5" fill="#065F46" opacity="0.6"/>
          <rect x="20" y="40" width="40" height="2.5" rx="1.25" fill="#065F46" opacity="0.3"/>
          <rect x="20" y="47" width="35" height="2.5" rx="1.25" fill="#065F46" opacity="0.3"/>
          <rect x="20" y="54" width="38" height="2.5" rx="1.25" fill="#065F46" opacity="0.3"/>
          <rect x="20" y="61" width="25" height="2.5" rx="1.25" fill="#065F46" opacity="0.2"/>
          <text x="40" y="88" fontFamily="system-ui" fontWeight="800" fontSize="20" fill="#065F46" textAnchor="middle">4</text>

          {/* Center "0" with ATS ring */}
          <circle cx="140" cy="60" r="42" fill="#DCFCE7"/>
          <circle cx="140" cy="60" r="36" fill="none" stroke="#e5e7eb" strokeWidth="6"/>
          <circle cx="140" cy="60" r="36" fill="none" stroke="#34D399" strokeWidth="6" strokeDasharray="180 226" strokeLinecap="round" transform="rotate(-90 140 60)"/>
          <text x="140" y="58" fontFamily="system-ui" fontWeight="800" fontSize="22" fill="#065F46" textAnchor="middle">?</text>
          <text x="140" y="72" fontFamily="system-ui" fontWeight="500" fontSize="8" fill="#065F46" textAnchor="middle" opacity="0.6">ATS Score</text>

          {/* Right "4" as document */}
          <rect x="210" y="20" width="60" height="80" rx="4" fill="#DCFCE7" stroke="#065F46" strokeWidth="1.5"/>
          <rect x="220" y="32" width="30" height="3" rx="1.5" fill="#065F46" opacity="0.6"/>
          <rect x="220" y="40" width="40" height="2.5" rx="1.25" fill="#065F46" opacity="0.3"/>
          <rect x="220" y="47" width="35" height="2.5" rx="1.25" fill="#065F46" opacity="0.3"/>
          <rect x="220" y="54" width="38" height="2.5" rx="1.25" fill="#065F46" opacity="0.3"/>
          <rect x="220" y="61" width="25" height="2.5" rx="1.25" fill="#065F46" opacity="0.2"/>
          <text x="240" y="88" fontFamily="system-ui" fontWeight="800" fontSize="20" fill="#065F46" textAnchor="middle">4</text>
        </svg>
      </div>

      {/* Copy */}
      <h1 className="text-2xl sm:text-3xl font-bold text-[#0C1A0E] dark:text-foreground">
        This page doesn&apos;t exist.
      </h1>
      <p className="mt-3 text-base text-[#78716C] dark:text-muted-foreground max-w-sm">
        But your next job might. Let&apos;s get your CV ready instead.
      </p>

      {/* CTAs */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Button size="lg" className="h-12 px-6 bg-[#065F46] hover:bg-[#064E3B]" asChild>
          <Link href="/upload-resume">
            Analyse my CV <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button size="lg" variant="ghost" className="h-12 px-6" asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>

      {/* Footer */}
      <p className="mt-16 text-xs text-[#78716C]/60 dark:text-muted-foreground/40">
        Error 404 &middot; Page not found
      </p>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
