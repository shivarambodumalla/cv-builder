import type { Metadata } from "next";
import { AnonPageTracker } from "@/components/shared/anon-page-tracker";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to CVEdge with Google or LinkedIn. See your ATS score and top issues, build your resume and download it as a PDF.",
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnonPageTracker />
      {children}
    </>
  );
}
