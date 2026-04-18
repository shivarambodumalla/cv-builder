import type { Metadata } from "next";
import { AnonPageTracker } from "@/components/shared/anon-page-tracker";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your CVEdge account to build and optimise your resume.",
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
