import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { UpgradeModalProvider } from "@/context/upgrade-modal-context";
import { UpgradeModal } from "@/components/shared/upgrade-modal";
import { DevReload } from "./dev-reload";
import { PageSessionTracker } from "@/components/shared/page-session-tracker";
import { PageTracker } from "@/components/shared/page-tracker";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://thecvedge.com"),
  title: {
    default: "CVEdge — Get More Interviews. Fix Your CV in 8 Minutes.",
    template: "%s | CVEdge",
  },
  description: "CVEdge finds exactly why your CV gets rejected and fixes it instantly with AI. Free forever. 80+ ATS score guaranteed or your money back.",
  keywords: ["free ATS checker", "resume builder", "CV optimizer", "ATS resume scanner", "fix my resume", "free CV checker", "ATS score", "resume AI", "job search tools", "interview preparation"],
  authors: [{ name: "CVEdge", url: "https://thecvedge.com" }],
  creator: "CVEdge",
  publisher: "CVEdge",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large" as const, "max-snippet": -1 } },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://thecvedge.com",
    siteName: "CVEdge",
    title: "CVEdge — Get More Interviews. Fix Your CV in 8 Minutes.",
    description: "Free AI-powered CV optimisation. Find why your CV gets rejected and fix it instantly. 80+ ATS score guaranteed.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "CVEdge — AI-powered CV optimisation" }],
  },
  twitter: { card: "summary_large_image", title: "CVEdge — Get More Interviews", description: "Free AI-powered CV optimisation. 80+ ATS score guaranteed.", images: ["/og-image.png"], creator: "@thecvedge", site: "@thecvedge" },
  alternates: { canonical: "https://thecvedge.com" },
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }], apple: "/img/CV-Edge-Logo-square.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        {process.env.NODE_ENV === "production" && (
          <>
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-52LEWSBN7M" />
            <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-52LEWSBN7M');gtag('config','AW-18095722375');` }} />
          </>
        )}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UpgradeModalProvider>
            <DevReload />
            <PageSessionTracker />
            <PageTracker />
            {children}
            <UpgradeModal />
          </UpgradeModalProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
