import type { Metadata } from "next";
import { AnonPageTracker } from "@/components/shared/anon-page-tracker";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your CVEdge account to build and optimise your resume. Free ATS checker, AI rewrites, and job matching.",
  alternates: { canonical: "https://www.thecvedge.com/login" },
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
