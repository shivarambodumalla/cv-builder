import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | CVEdge",
  description: "Terms and conditions for using the CVEdge platform.",
  alternates: { canonical: "https://www.thecvedge.com/terms" },
};

const sections = [
  {
    title: "1. Acceptance",
    content: "By using CVEdge you agree to these terms. If you do not agree, please do not use the service.",
  },
  {
    title: "2. Service description",
    content:
      "CVEdge provides AI-powered CV building, ATS analysis, job matching, and cover letter generation tools.",
  },
  {
    title: "3. Account",
    list: [
      "You must be 18+ to use CVEdge",
      "You are responsible for your account",
      "One account per person",
      "We may suspend accounts that violate terms",
    ],
  },
  {
    title: "4. Payments",
    list: [
      "Processed securely via Lemon Squeezy",
      "Prices in USD",
      "7-day money back guarantee",
      "Subscriptions auto-renew until cancelled",
    ],
  },
  {
    title: "5. Acceptable use",
    content: "You may not:",
    list: [
      "Upload content you don't own",
      "Use CVEdge for illegal purposes",
      "Attempt to reverse engineer the service",
      "Abuse the AI features",
    ],
  },
  {
    title: "6. AI disclaimer",
    content:
      "CVEdge uses AI to analyse and suggest improvements. AI suggestions are not guaranteed to result in job offers. Always review AI suggestions before use.",
  },
  {
    title: "7. Intellectual property",
    content:
      "Your CV content belongs to you. CVEdge platform and AI models belong to us.",
  },
  {
    title: "8. Limitation of liability",
    content:
      'CVEdge is provided "as is". We are not liable for job application outcomes.',
  },
  {
    title: "9. Termination",
    content:
      "You can delete your account anytime. We may terminate accounts that violate terms.",
  },
  {
    title: "10. Contact",
    content: "hello@thecvedge.com",
  },
];

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 sm:py-24">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h1>
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
