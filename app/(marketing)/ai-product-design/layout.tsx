import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Product Design Mentorship | CVEdge",
  description: "Master AI product design with 100 hours of live 1:1 mentorship. Limited founding cohort spots available.",
};

export default function AIProductDesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
