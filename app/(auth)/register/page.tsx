"use client";
import { ThemeLogo } from "@/components/shared/theme-logo";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { GoogleButton } from "@/components/shared/google-button";
import { LinkedInButton } from "@/components/shared/linkedin-button";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div />}>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  const redirectTo = () =>
    `${window.location.origin}/auth/callback${ref ? "?ref=" + ref : ""}`;

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
  }

  async function handleLinkedInLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "linkedin_oidc",
      options: { redirectTo: redirectTo() },
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center space-y-1 pb-2">
        <Link href="/" className="flex justify-center mb-4">
          <ThemeLogo className="h-8" />
        </Link>
        <h1 className="text-xl font-semibold">Create your CVEdge account</h1>
        <p className="text-sm text-muted-foreground">Get started in seconds</p>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <GoogleButton onClick={handleGoogleLogin} />
        <LinkedInButton onClick={handleLinkedInLogin} />
      </CardContent>
      <CardFooter className="pt-2">
        <p className="text-[11px] text-muted-foreground/60 text-center w-full">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
}
