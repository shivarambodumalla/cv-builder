import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | CVEdge",
  description: "How CVEdge collects, uses, and protects your personal data.",
};

const sections = [
  {
    title: "1. Introduction",
    content: `CVEdge ("we", "us") operates thecvedge.com. This policy explains how we collect and use your data when you use our service.`,
  },
  {
    title: "2. Data we collect",
    list: [
      "Name and email from Google OAuth",
      "CV content you upload or create",
      "Usage data via PostHog analytics",
      "AI processing logs (anonymous)",
    ],
  },
  {
    title: "3. How we use your data",
    list: [
      "To provide CV analysis and building tools",
      "To send transactional emails via Resend",
      "To improve our product",
      "We never sell your data",
    ],
  },
  {
    title: "4. AI processing",
    content:
      "Your CV text is sent to our AI provider for analysis. It is not stored beyond the API call. We process your data only to provide the service you requested.",
  },
  {
    title: "5. Third party services",
    list: [
      "Supabase (database and auth)",
      "AI provider (CV analysis)",
      "Resend (email delivery)",
      "PostHog (analytics)",
      "Lemon Squeezy (payments)",
      "Vercel (hosting)",
    ],
  },
  {
    title: "6. Data retention",
    list: [
      "Account data kept while account is active",
      "Deleted within 30 days of account deletion",
      "Email hello@thecvedge.com to request deletion",
    ],
  },
  {
    title: "7. Your rights",
    list: [
      "Access your data",
      "Export your data",
      "Delete your account",
      "Contact: hello@thecvedge.com",
    ],
  },
  {
    title: "8. Cookies",
    list: [
      "Session cookies for authentication only",
      "Analytics cookies via PostHog (can opt out)",
    ],
  },
  {
    title: "9. Changes",
    content:
      "We may update this policy. We will notify you by email of major changes.",
  },
  {
    title: "10. Contact",
    content: "hello@thecvedge.com",
  },
];

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 sm:py-24">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: April 2025</p>

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
