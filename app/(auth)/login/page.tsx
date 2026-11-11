import { Suspense } from "react";
import { getSocialProof, socialProofLine } from "@/lib/marketing/social-proof";
import { LoginContent } from "./login-content";

// Reads usage counts from the DB, so it must be forced static (the admin
// client's no-store fetch would otherwise render it per request); hourly is
// fresh enough for a rounded count.
export const dynamic = "force-static";
export const revalidate = 3600;

export default async function LoginPage() {
  const proofLine = socialProofLine(await getSocialProof());
  return (
    <Suspense fallback={<div />}>
      <LoginContent proofLine={proofLine} />
    </Suspense>
  );
}
