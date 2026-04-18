"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SignInCTA() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  // Don't render while checking auth, or if logged in
  if (isLoggedIn === null || isLoggedIn) return null;

  return (
    <div className="mt-10 rounded-2xl bg-[#065F46] text-white p-8 md:p-10 text-center relative overflow-hidden">
      <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full border-4 border-[#34D399]/20 pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full border-4 border-[#34D399]/15 pointer-events-none" />
      <div className="relative z-10">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#34D399]/20 px-3 py-1 text-xs font-medium text-[#34D399] mb-4">
          <Lock className="h-3 w-3" /> Match scores locked
        </div>
        <h2 className="text-xl md:text-2xl font-bold mb-2">
          Sign in free to see your match score
        </h2>
        <p className="text-white/70 text-sm max-w-md mx-auto mb-6">
          CVEdge analyses your CV against each job description and gives you
          a real ATS compatibility score — so you apply smarter.
        </p>
        <Link href="/login">
          <Button className="bg-white text-[#065F46] hover:bg-white/90 font-semibold gap-2">
            Sign in with Google <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
