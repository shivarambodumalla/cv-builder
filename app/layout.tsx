import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { UpgradeModalProvider } from "@/context/upgrade-modal-context";
import { UpgradeModal } from "@/components/shared/upgrade-modal";
import { DevReload } from "./dev-reload";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "CVEdge — AI Resume Builder | Get More Interviews",
    template: "%s | CVEdge",
  },
  description: "Build ATS-optimised resumes with AI. Get instant ATS scoring, job matching, AI bullet rewrites, and interview coaching. Land more interviews in minutes.",
  metadataBase: new URL("https://www.thecvedge.com"),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/img/CV-Edge-Logo-square.svg", type: "image/svg+xml" },
    ],
    apple: "/img/CV-Edge-Logo-square.svg",
  },
  openGraph: {
    type: "website",
    siteName: "CVEdge",
    title: "CVEdge — AI Resume Builder | Get More Interviews",
    description: "Build ATS-optimised resumes with AI. Instant ATS scoring, job matching, AI rewrites, and interview coaching.",
    url: "https://www.thecvedge.com",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "CVEdge — AI Resume Builder" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@thecvedge",
    title: "CVEdge — AI Resume Builder",
    description: "Build ATS-optimised resumes with AI. Land more interviews in minutes.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "theme-color": "#1a7a6d",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UpgradeModalProvider>
            <DevReload />
            {children}
            <UpgradeModal />
          </UpgradeModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
