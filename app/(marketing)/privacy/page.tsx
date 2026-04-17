import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | CVEdge",
  description: "How CVEdge collects, uses, and protects your personal data.",
};

const sections = [
  {
    title: "1. Introduction",
    content: `CVEdge ("we", "us", "our") operates thecvedge.com. This policy explains how we collect, use, store, and protect your personal data when you use our service. We are committed to complying with GDPR, CCPA, and other applicable data protection laws.`,
  },
  {
    title: "2. Data we collect",
    list: [
      "Name, email address, and profile photo from Google OAuth",
      "CV content you upload, paste, or create within our editor (including personal details, work history, education, and skills)",
      "IP address and approximate location (city, region, country) at the time of signup — used for analytics only",
      "Usage data: pages visited, features used, timestamps, and device information",
      "Cookie consent preferences",
      "Subscription and billing data (processed by Lemon Squeezy — we do not store payment card details)",
    ],
  },
  {
    title: "3. How we use your data",
    list: [
      "To provide CV analysis, building, and optimisation tools",
      "To send transactional emails (welcome, usage resets, upgrade prompts) via Resend",
      "To process your CV through AI for ATS scoring, rewriting, job matching, and cover letter generation",
      "To track usage limits and manage your subscription",
      "To improve our product through aggregated, anonymised analytics",
      "We never sell your data to third parties",
      "We never use your CV data for advertising or marketing purposes",
    ],
  },
  {
    title: "4. AI processing",
    content:
      "Your CV text and job descriptions are sent to Google Gemini (our AI provider) for analysis. This data is sent via API and processed in real-time — it is not retained by the AI provider beyond the API call. We process your data only to provide the specific service you requested (ATS analysis, rewriting, job matching, cover letter generation, or interview preparation). AI-generated content is stored in your account for your convenience.",
  },
  {
    title: "5. Third-party services",
    content: "We share your data with the following processors, each under appropriate data processing agreements:",
    list: [
      "Supabase (database, authentication, file storage) — EU/US hosted",
      "Google Gemini (AI processing of CV content) — data not retained by provider",
      "Resend (transactional email delivery) — processes email address and email content",
      "Google Analytics + Google Ads (website analytics and conversion tracking) — loaded only after cookie consent",
      "Vercel (hosting, edge functions, analytics) — US hosted",
      "Lemon Squeezy (payment processing) — PCI-compliant, we do not store card details",
    ],
  },
  {
    title: "6. Cookies and tracking",
    list: [
      "Essential cookies: Supabase authentication session cookies — required for the service to function",
      "Analytics cookies: Google Analytics (GA4) and Google Ads — loaded only after you accept cookies via our consent banner",
      "You can withdraw cookie consent at any time by clearing your browser cookies for thecvedge.com",
      "If you decline analytics cookies, no tracking scripts are loaded",
    ],
  },
  {
    title: "7. Data retention",
    list: [
      "Account data is kept while your account is active",
      "AI usage logs are automatically deleted after 90 days",
      "Upon account deletion, all personal data is removed within 30 days",
      "Anonymised, aggregated analytics data may be retained indefinitely",
      "Billing records are retained as required by tax and financial regulations",
    ],
  },
  {
    title: "8. Your rights (GDPR / CCPA)",
    content: "You have the following rights regarding your personal data:",
    list: [
      "Right of Access — view and export all your data (Billing > Export My Data)",
      "Right to Rectification — edit your data through the CV editor and profile settings",
      "Right to Erasure — permanently delete your account and all associated data (Billing > Delete Account)",
      "Right to Data Portability — download your data as a JSON file",
      "Right to Object — decline analytics cookies via the consent banner",
      "Right to Withdraw Consent — clear cookies or contact us to withdraw consent",
      "To exercise any of these rights, use the in-app controls or email hello@thecvedge.com",
    ],
  },
  {
    title: "9. Data security",
    list: [
      "All data transmitted via HTTPS/TLS encryption",
      "Row-level security (RLS) on all database tables — users can only access their own data",
      "Google OAuth only — we never store passwords",
      "Admin access restricted to authorised email addresses",
      "Security headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy",
    ],
  },
  {
    title: "10. International data transfers",
    content:
      "Your data may be processed in the United States and European Union through our service providers. We ensure appropriate safeguards are in place for international transfers in compliance with GDPR requirements.",
  },
  {
    title: "11. Children",
    content:
      "CVEdge is not intended for users under 16. We do not knowingly collect data from children. If you believe a child has provided us with personal data, please contact us immediately.",
  },
  {
    title: "12. Changes to this policy",
    content:
      "We may update this policy from time to time. We will notify you by email of material changes. Continued use of the service after changes constitutes acceptance of the updated policy.",
  },
  {
    title: "13. Contact",
    content: "For any privacy-related questions, data requests, or complaints, contact us at hello@thecvedge.com. You also have the right to lodge a complaint with your local data protection authority.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 sm:py-24">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: April 2026</p>

      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-lg font-semibold">{s.title}</h2>
            {s.content && <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.content}</p>}
            {s.list && (
              <ul className="mt-2 space-y-1.5">
                {s.list.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-muted-foreground/50">-</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
