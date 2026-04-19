"use client";

import { Button } from "@/components/ui/button";
import { useSignupModal } from "@/components/popups/signup-modal";

export function ResumesGetStarted() {
  const { showSignupModal } = useSignupModal();

  return (
    <Button onClick={() => showSignupModal({ trigger: "resumes_cta" })}>
      Get started free
    </Button>
  );
}
