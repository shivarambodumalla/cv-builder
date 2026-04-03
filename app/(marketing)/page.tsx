import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  BarChart3,
  Download,
  Sparkles,
  Shield,
  Target,
  Zap,
  PenTool,
  Upload,
} from "lucide-react";

export const metadata: Metadata = {
  title: "CVPilot — AI-Powered CV Builder | Land More Interviews",
  description:
    "Build professional, ATS-optimised CVs in minutes. CVPilot uses AI to score your resume, match you to jobs, and help you stand out to recruiters.",
  openGraph: {
    title: "CVPilot — AI-Powered CV Builder",
    description:
      "Build professional, ATS-optimised CVs in minutes with AI assistance.",
    type: "website",
  },
};

const steps = [
  {
    icon: Upload,
    title: "Upload Your CV",
    description:
      "Upload an existing CV or start from scratch using our guided builder.",
  },
  {
    icon: BarChart3,
    title: "Get Your ATS Score",
    description:
      "Our AI analyses your CV against industry standards and ATS requirements.",
  },
  {
    icon: Target,
    title: "Match to Jobs",
    description:
      "Paste a job description and see exactly how well your CV matches.",
  },
  {
    icon: Download,
    title: "Export & Apply",
    description:
      "Download your polished CV as PDF and start landing interviews.",
  },
];

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Writing",
    description:
      "Get intelligent suggestions for bullet points, summaries, and skills tailored to your experience.",
  },
  {
    icon: BarChart3,
    title: "ATS Score Checker",
    description:
      "See how your CV performs against applicant tracking systems before you apply.",
  },
  {
    icon: Target,
    title: "Job Matching",
    description:
      "Paste any job description and get a match score with actionable improvement tips.",
  },
  {
    icon: PenTool,
    title: "Cover Letter Generator",
    description:
      "Generate tailored cover letters that complement your CV for each application.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your data stays yours. We never share your personal information with third parties.",
  },
  {
    icon: Zap,
    title: "Instant PDF Export",
    description:
      "Export clean, professionally formatted PDFs ready to send to recruiters.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with the basics",
    features: ["1 CV", "Basic templates", "PDF export", "ATS score check"],
    cta: "Get Started",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$12",
    period: "/mo",
    description: "For active job seekers",
    features: [
      "5 CVs",
      "All templates",
      "AI writing assistant",
      "Job matching",
      "Cover letters",
      "Priority support",
    ],
    cta: "Start Free Trial",
    href: "/register",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    description: "For power users and career changers",
    features: [
      "Unlimited CVs",
      "Custom templates",
      "Advanced AI rewriting",
      "Unlimited job matching",
      "Unlimited cover letters",
      "Analytics dashboard",
      "1-on-1 review session",
    ],
    cta: "Start Free Trial",
    href: "/register",
    highlighted: false,
  },
];

export default function HomePage() {
  return (
    <>
      <section className="container mx-auto flex flex-col items-center gap-8 px-4 pb-24 pt-20 text-center md:pt-32">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Your CV, optimised by AI.{" "}
          <span className="text-muted-foreground">Land more interviews.</span>
        </h1>
        <p className="max-w-[640px] text-lg text-muted-foreground">
          CVPilot analyses your resume, scores it against ATS systems, matches
          you to jobs, and helps you write a CV that gets you hired.
        </p>
        <div className="flex gap-4">
          <Button size="lg" asChild>
            <Link href="/register">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/features">See Features</Link>
          </Button>
        </div>
      </section>

      <section className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-24">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              How it works
            </h2>
            <p className="mt-4 text-muted-foreground">
              Four simple steps to a job-winning CV
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.title} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <step.icon className="h-6 w-6" />
                </div>
                <span className="mb-2 text-sm font-medium text-muted-foreground">
                  Step {i + 1}
                </span>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Everything you need to stand out
          </h2>
          <p className="mt-4 text-muted-foreground">
            Powerful tools to build, optimise, and tailor your CV for every
            application
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="mb-2 h-6 w-6 text-muted-foreground" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-24">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-muted-foreground">
              Start for free. Upgrade when you need more power.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={
                  plan.highlighted
                    ? "border-primary shadow-md"
                    : ""
                }
              >
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">
                      {plan.period}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
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
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
