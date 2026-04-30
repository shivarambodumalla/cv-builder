import type { Metadata, Viewport } from "next";
import Script from "next/script";
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
import { AuthEventTracker } from "@/components/shared/auth-event-tracker";
import { GAScripts } from "@/components/shared/ga-scripts";
import { HotjarScripts } from "@/components/shared/hotjar-scripts";
import { CookieConsent } from "@/components/shared/cookie-consent";
import { JobsDiscovery } from "@/components/popups/jobs-discovery";
import { SignupModalProvider, SignupTimedTrigger, SignupExitIntent } from "@/components/popups/signup-modal";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.thecvedge.com"),
  title: {
    default: "CVEdge — Get More Interviews. Fix Your CV in 8 Minutes.",
    template: "%s | CVEdge",
  },
  description: "CVEdge finds exactly why your CV gets rejected and fixes it instantly with AI. Free forever. 80+ ATS score guaranteed or your money back.",
  authors: [{ name: "CVEdge", url: "https://www.thecvedge.com" }],
  creator: "CVEdge",
  publisher: "CVEdge",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large" as const, "max-snippet": -1 } },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.thecvedge.com",
    siteName: "CVEdge",
    title: "CVEdge — Get More Interviews. Fix Your CV in 8 Minutes.",
    description: "Free AI-powered CV optimisation. Find why your CV gets rejected and fix it instantly. 80+ ATS score guaranteed.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "CVEdge — AI-powered CV optimisation" }],
  },
  twitter: { card: "summary_large_image", title: "CVEdge — Get More Interviews", description: "Free AI-powered CV optimisation. 80+ ATS score guaranteed.", images: ["/og-image.png"], creator: "@thecvedge", site: "@thecvedge" },
  alternates: { canonical: "https://www.thecvedge.com" },
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }], apple: "/img/CV-Edge-Logo-square.svg" },
};

const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "CVEdge",
  url: "https://www.thecvedge.com",
  logo: {
    "@type": "ImageObject",
    url: "https://www.thecvedge.com/img/CV-Edge-Logo-square.svg",
  },
  description: "CVEdge is an AI-powered resume builder and ATS checker that analyses CV compatibility with applicant tracking systems, rewrites bullet points with AI, matches resumes to job descriptions, and helps job seekers get more interviews.",
  slogan: "Get more interviews. Fix your CV in 8 minutes.",
  foundingDate: "2024",
  areaServed: "Worldwide",
  knowsAbout: [
    "ATS resume optimization",
    "applicant tracking systems",
    "resume writing",
    "CV analysis",
    "job search",
    "AI resume tools",
    "cover letter writing",
    "interview preparation",
    "keyword optimization",
    "job description matching",
  ],
  sameAs: [
    "https://twitter.com/thecvedge",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "support@thecvedge.com",
    availableLanguage: ["English"],
  },
};

const WEBSITE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "CVEdge",
  url: "https://www.thecvedge.com",
  description: "Free AI-powered ATS resume checker and CV builder. Check your ATS score, fix issues with AI, and match your CV to job descriptions.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.thecvedge.com/jobs?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSONLD) }}
        />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        {/* GA4 + Ads — loaded in HTML so GA4 tag verifier can detect it.
            Consent defaults to denied; CookieConsent upgrades to granted on accept. */}
        <Script id="gtag-consent-defaults" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('consent', 'default', {
              analytics_storage: 'denied',
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
            });
          `}
        </Script>
        <GAScripts />
        <HotjarScripts />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SignupModalProvider>
          <UpgradeModalProvider>
            <DevReload />
            <PageSessionTracker />
            <PageTracker />
            <AuthEventTracker />
            <SignupTimedTrigger />
            <SignupExitIntent />
            {children}
            <UpgradeModal />
            <JobsDiscovery />
            <CookieConsent />
          </UpgradeModalProvider>
          </SignupModalProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
