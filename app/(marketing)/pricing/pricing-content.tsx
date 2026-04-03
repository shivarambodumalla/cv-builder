"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Minus } from "lucide-react";

const plans = [
  {
    name: "Free",
    monthly: 0,
    annual: 0,
    description: "Get started with the basics",
    cta: "Get Started",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Starter",
    monthly: 12,
    annual: 8,
    description: "For active job seekers",
    cta: "Start Free Trial",
    href: "/register",
    highlighted: true,
  },
  {
    name: "Pro",
    monthly: 29,
    annual: 20,
    description: "For power users and career changers",
    cta: "Start Free Trial",
    href: "/register",
    highlighted: false,
  },
];

const comparisonFeatures = [
  { name: "CV versions", free: "1", starter: "5", pro: "Unlimited" },
  { name: "Templates", free: "Basic", starter: "All", pro: "All + Custom" },
  { name: "PDF export", free: true, starter: true, pro: true },
  { name: "ATS score checker", free: true, starter: true, pro: true },
  { name: "AI writing assistant", free: false, starter: true, pro: true },
  { name: "Job description matching", free: false, starter: true, pro: true },
  { name: "Cover letter generator", free: false, starter: true, pro: true },
  { name: "Keyword analysis", free: false, starter: true, pro: true },
  { name: "Gap analysis", free: false, starter: false, pro: true },
  { name: "Advanced AI rewriting", free: false, starter: false, pro: true },
  { name: "Analytics dashboard", free: false, starter: false, pro: true },
  { name: "1-on-1 review session", free: false, starter: false, pro: true },
  { name: "Priority support", free: false, starter: true, pro: true },
];

const faqs = [
  {
    question: "Can I try CVPilot before paying?",
    answer:
      "Yes. The Free plan lets you create one CV with basic templates and ATS scoring — no credit card required. Paid plans also include a 7-day free trial so you can explore every feature before committing.",
  },
  {
    question: "What happens to my CVs if I downgrade?",
    answer:
      "Your existing CVs are never deleted. If you downgrade from Pro to Starter, you keep access to your first 5 CVs. Downgrading to Free keeps your most recent CV. You can upgrade again at any time to regain full access.",
  },
  {
    question: "How does annual billing work?",
    answer:
      "Annual plans are billed once per year at a 30% discount compared to monthly pricing. Starter is $96/year (instead of $144) and Pro is $240/year (instead of $348). You can switch between monthly and annual at any time.",
  },
  {
    question: "Is my data private and secure?",
    answer:
      "Absolutely. Your CVs and personal data are encrypted at rest and in transit. We never share your information with third parties or use your data to train AI models. You can delete your account and all associated data at any time.",
  },
  {
    question: "Can I cancel my subscription at any time?",
    answer:
      "Yes, you can cancel from your account settings at any time. You will continue to have access to paid features until the end of your current billing period. No questions asked, no cancellation fees.",
  },
];

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-sm">{value}</span>;
  }
  return value ? (
    <Check className="mx-auto h-4 w-4" />
  ) : (
    <Minus className="mx-auto h-4 w-4 text-muted-foreground/40" />
  );
}

export function PricingContent() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      <div className="mb-12 flex items-center justify-center gap-3">
        <span
          className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}
        >
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={annual}
          onClick={() => setAnnual(!annual)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${annual ? "bg-primary" : "bg-muted"}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-sm ring-0 transition-transform ${annual ? "translate-x-5" : "translate-x-0"}`}
          />
        </button>
        <span
          className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}
        >
          Annual{" "}
          <span className="text-xs font-normal text-muted-foreground">
            (save 30%)
          </span>
        </span>
      </div>

      <div className="mx-auto mb-24 grid max-w-5xl gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const price = annual ? plan.annual : plan.monthly;
          const period = price === 0 ? "forever" : annual ? "/yr" : "/mo";
          const displayPrice =
            price === 0
              ? "$0"
              : annual
                ? `$${price * 12}`
                : `$${price}`;

          return (
            <Card
              key={plan.name}
              className={plan.highlighted ? "border-primary shadow-md" : ""}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{displayPrice}</span>
                  <span className="text-muted-foreground">{period}</span>
                </div>
              </CardHeader>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  asChild
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="mx-auto max-w-5xl">
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight">
          Compare plans
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-4 pr-4 text-left font-medium text-muted-foreground">
                  Feature
                </th>
                {plans.map((p) => (
                  <th key={p.name} className="pb-4 text-center font-medium">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((row) => (
                <tr key={row.name} className="border-b last:border-0">
                  <td className="py-3 pr-4 text-muted-foreground">
                    {row.name}
                  </td>
                  <td className="py-3 text-center">
                    <CellValue value={row.free} />
                  </td>
                  <td className="py-3 text-center">
                    <CellValue value={row.starter} />
                  </td>
                  <td className="py-3 text-center">
                    <CellValue value={row.pro} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mx-auto mt-24 max-w-2xl">
        <h2 className="mb-10 text-center text-2xl font-bold tracking-tight">
          Frequently asked questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h3 className="font-semibold">{faq.question}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
