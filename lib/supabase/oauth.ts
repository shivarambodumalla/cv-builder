import { createClient } from "@/lib/supabase/client";

export type OAuthProvider = "google" | "linkedin_oidc";

/**
 * Starts OAuth sign-in. Google gets `prompt=select_account`: without it a
 * browser still signed in to Google is sent straight back into the same
 * account after logging out of CVEdge, with no chance to pick another one.
 */
export async function signInWithProvider(provider: OAuthProvider, redirectTo: string) {
  const supabase = createClient();
  await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      ...(provider === "google" && { queryParams: { prompt: "select_account" } }),
    },
  });
}
