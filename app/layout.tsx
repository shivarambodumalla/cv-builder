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
import { UpgradeEventTracker } from "@/components/shared/upgrade-event-tracker";
import { GAScripts } from "@/components/shared/ga-scripts";
import { HotjarScripts } from "@/components/shared/hotjar-scripts";
import { AdSenseScript } from "@/components/shared/adsense-script";
import { CookieConsent } from "@/components/shared/cookie-consent";
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
    default: "CVEdge: Get More Interviews. Fix Your CV in 8 Minutes.",
    template: "%s | CVEdge",
  },
  description: "CVEdge shows exactly why your CV gets filtered out. Free ATS score, resume builder and templates. Pro fixes it with AI, with an 80+ ATS score guarantee.",
  authors: [{ name: "CVEdge", url: "https://www.thecvedge.com" }],
  creator: "CVEdge",
  publisher: "CVEdge",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large" as const, "max-snippet": -1 } },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["en_GB", "en_AE", "en_SA", "en_QA"],
    url: "https://www.thecvedge.com",
    siteName: "CVEdge",
    title: "CVEdge: Get More Interviews. Fix Your CV in 8 Minutes.",
    description: "Free ATS resume checker and builder. See why your resume gets filtered out. Pro fixes it with AI and guarantees an 80+ ATS score.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "CVEdge: AI-powered resume and CV optimization" }],
  },
  twitter: { card: "summary_large_image", title: "CVEdge: Get More Interviews", description: "Free ATS resume checker and builder. Pro fixes it with AI, 80+ ATS score guaranteed.", images: ["/og-image.png"], creator: "@thecvedge", site: "@thecvedge" },
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }], apple: "/img/CV-Edge-Logo-square.svg" },
  // Pinterest website claim — keeps pins attributed to thecvedge.com.
  other: { "p:domain_verify": "20e129163b0f32eba76c007ea3c95db7" },
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
  areaServed: [
    { "@type": "Country", "name": "United States" },
    { "@type": "Country", "name": "United Kingdom" },
    { "@type": "Country", "name": "Ireland" },
    { "@type": "Country", "name": "Canada" },
    { "@type": "Country", "name": "Australia" },
    { "@type": "Country", "name": "Germany" },
    { "@type": "Country", "name": "France" },
    { "@type": "Country", "name": "Netherlands" },
    { "@type": "Country", "name": "United Arab Emirates" },
    { "@type": "Country", "name": "Saudi Arabia" },
    { "@type": "Country", "name": "Qatar" },
    { "@type": "Country", "name": "Kuwait" },
    { "@type": "Country", "name": "Bahrain" },
    { "@type": "Country", "name": "Oman" },
  ],
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
    "CV builder UAE",
    "resume builder Dubai",
    "CV review Saudi Arabia",
    "ATS CV checker UK",
    "resume builder UK",
    "CV optimisation Europe",
  ],
  sameAs: [
    "https://x.com/thecvedge",
    "https://www.linkedin.com/company/cv-edge",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "hello@thecvedge.com",
    availableLanguage: ["English"],
  },
};

const WEBSITE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "CVEdge",
  url: "https://www.thecvedge.com",
  description: "Free ATS resume checker and CV builder. Check your ATS score and see your top issues free. Pro fixes them with AI and matches your CV to job descriptions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Impact.com site verification. Written here rather than via the
            Metadata API because Impact issues the tag with a `value` attribute
            instead of the standard `content`, and `metadata.other` always
            renders `content`. */}
        {/* React's meta typings have no `value`, so it is spread in as an
            untyped attribute — React passes unknown attributes through to the
            DOM unchanged, which is what Impact's crawler needs to see. */}
        <meta
          name="impact-site-verification"
          {...({ value: "443b32c6-61c0-4202-a928-b54af4c07bdd" } as Record<string, string>)}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSONLD) }}
        />
        {/* Microsoft Advertising UET tag 343285143, Microsoft's own snippet, in the
            raw <head> so Microsoft's tag check finds it in the HTML. Ad storage
            starts denied; CookieConsent grants it. Conversions come from
            lib/analytics/events.ts (sign_up, purchase). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.uetq=window.uetq||[];window.uetq.push('consent','default',{'ad_storage':'denied'});(function(w,d,t,u,o){w[u]=w[u]||[],o.ts=(new Date).getTime();var n=d.createElement(t);n.src=\"https://bat.bing.net/bat.js?ti=\"+o.ti+(\"uetq\"!=u?\"&q=\"+u:\"\"),n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&\"loaded\"!==s&&\"complete\"!==s||(o.q=w[u],w[u]=new UET(o),w[u].push(\"pageLoad\"),n.onload=n.onreadystatechange=null)};var i=d.getElementsByTagName(t)[0];i.parentNode.insertBefore(n,i)})(window,document,\"script\",\"uetq\",{ti:\"343285143\",enableAutoSpaTracking:true});",
          }}
        />
        {/* Impact.com Universal Tracking Tag. Must sit in the raw <head>: Impact
            verifies a site by fetching the HTML and string-matching this tag, so
            a consent-gated client-side injection is invisible to them and the
            check fails. Same posture as the AdSense tag below. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(i,m,p,a,c,t){c.ire_o=p;c[p]=c[p]||function(){(c[p].a=c[p].a||[]).push(arguments)};t=a.createElement(m);var z=a.getElementsByTagName(m)[0];t.async=1;t.src=i;z.parentNode.insertBefore(t,z)})('https://utt.impactcdn.com/P-A7679564-eef3-4273-a664-601115aed9ec1.js','script','impactStat',document,window);impactStat('transformLinks');impactStat('trackImpression');",
          }}
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
        {/* AdSense auto ads; skipped on /career-path and /admin (see the component). */}
        <AdSenseScript />
        {/* Light only. Dark styles stay in the CSS; drop forcedTheme to bring them back. */}
        <ThemeProvider
          attribute="class"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SignupModalProvider>
          <UpgradeModalProvider>
            <DevReload />
            <PageSessionTracker />
            <PageTracker />
            <AuthEventTracker />
            <UpgradeEventTracker />
            <SignupTimedTrigger />
            <SignupExitIntent />
            {children}
            <UpgradeModal />
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
