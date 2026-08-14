import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/shared/structured-data";

export const metadata: Metadata = {
  title: "Contact CVEdge",
  description:
    "How to reach CVEdge — support, billing, privacy and data requests, and press. We reply to every email, usually within one business day.",
  alternates: { canonical: "https://www.thecvedge.com/contact" },
  openGraph: {
    title: "Contact CVEdge",
    description: "How to reach CVEdge — support, billing, privacy requests and press.",
    url: "https://www.thecvedge.com/contact",
  },
};

const EMAIL = "hello@thecvedge.com";

const REASONS = [
  {
    title: "Product support",
    body: "Something not working, a CV that will not parse, or an export that failed. Include the CV name and roughly when it happened — that is usually enough for us to find it.",
  },
  {
    title: "Billing and subscriptions",
    body: "Upgrades, downgrades, refunds and invoices. Payments are handled by Lemon Squeezy, so include the email address you paid with and we can trace the transaction.",
  },
  {
    title: "Privacy and data requests",
    body: "Access, correction or deletion of your data. You can delete your CVs from the dashboard at any time; email us if you want your whole account and its data removed. See the privacy policy for what we hold and why.",
  },
  {
    title: "The 80+ score guarantee",
    body: "If you are on Pro, have run a full ATS analysis and Fix All, and are still under 80, email us and we will look at your CV directly.",
  },
  {
    title: "Feedback, bugs and press",
    body: "Feature requests, things that are wrong, corrections to anything we have published, or press and partnership enquiries. All to the same address.",
  },
];

export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "Contact", url: "https://www.thecvedge.com/contact" },
        ]}
      />

      <div className="container mx-auto max-w-3xl px-4 py-16 md:py-20">
        <p className="text-[10px] tracking-widest text-muted-foreground uppercase">Contact</p>
        <h1 className="text-3xl font-bold tracking-tight mt-2 mb-5">Contact CVEdge</h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          We run on email rather than a ticket system — one address, read by the people who build the product. We
          reply to every message, usually within one business day.
        </p>

        {/* The address */}
        <div className="rounded-2xl border bg-card p-6 sm:p-8 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Email us</p>
          <a
            href={`mailto:${EMAIL}`}
            className="text-xl sm:text-2xl font-bold tracking-tight text-primary underline underline-offset-4 break-all"
          >
            {EMAIL}
          </a>
          <p className="text-xs text-muted-foreground mt-3">
            Typical reply time: within one business day
          </p>
        </div>

        {/* What to include */}
        <h2 className="text-2xl font-bold tracking-tight mt-14 mb-2">What to write to us about</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Everything goes to the same address — this is just what helps us answer quickly.
        </p>
        <div className="space-y-4">
          {REASONS.map((r) => (
            <div key={r.title} className="rounded-xl border bg-card p-5">
              <p className="text-sm font-semibold">{r.title}</p>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>

        {/* Before you email */}
        <h2 className="text-2xl font-bold tracking-tight mt-14 mb-3">Before you email</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          A few things are faster to check yourself:
        </p>
        <ul className="space-y-2.5 mb-4">
          <li className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2.5">
            <span className="shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
            <span>
              If your CV will not upload, check that the PDF contains selectable text. A CV exported as an image has
              no text layer, and neither our parser nor a real applicant tracking system can read it.
            </span>
          </li>
          <li className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2.5">
            <span className="shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
            <span>
              If your ATS score seems low, the category breakdown on the report names the specific issues — that is
              usually a faster answer than we can give by email.
            </span>
          </li>
          <li className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2.5">
            <span className="shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
            <span>
              Plan limits, pricing and what is included are set out on the{" "}
              <Link href="/pricing" className="text-primary underline underline-offset-4">
                pricing page
              </Link>
              .
            </span>
          </li>
        </ul>

        <p className="text-muted-foreground leading-relaxed">
          More about who we are and what we build is on the{" "}
          <Link href="/about" className="text-primary underline underline-offset-4">
            about page
          </Link>
          . Our{" "}
          <Link href="/privacy" className="text-primary underline underline-offset-4">
            privacy policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="text-primary underline underline-offset-4">
            terms of service
          </Link>{" "}
          cover data handling and account terms.
        </p>
      </div>
    </>
  );
}
