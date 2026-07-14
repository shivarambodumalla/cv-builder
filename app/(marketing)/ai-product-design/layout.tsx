import type { Metadata } from "next";

const PAGE_URL = "https://www.thecvedge.com/ai-product-design";
const OG_IMAGE = "https://www.thecvedge.com/og-mentorship.jpg";
const DESCRIPTION =
  "100 hours of live 1:1 mentorship. Think, design, and ship AI-powered products, with a portfolio, capstone, and career support included. Founding cohort now enrolling.";

export const metadata: Metadata = {
  title: "AI Product Design Mentorship",
  description: DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "AI Product Design Mentorship | CVEdge",
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: "CVEdge",
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "AI Product Design Mentorship by CVEdge, live 1:1 mentorship program",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Product Design Mentorship | CVEdge",
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function AIProductDesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
