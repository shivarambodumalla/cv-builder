import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Product Design Mentorship",
  description:
    "100 hours of live 1:1 mentorship. Think, design, and ship AI-powered products — with a portfolio, capstone, and career support included. Founding cohort now enrolling.",
};

export default function AIProductDesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
