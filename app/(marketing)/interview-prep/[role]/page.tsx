import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Target, CheckCircle } from "lucide-react";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/shared/structured-data";
import { ALL_ROLES } from "@/lib/jobs/role-categories";

export const revalidate = 3600;

const ROLE_MAP = new Map(ALL_ROLES.map((r) => [r.slug, r]));

export function generateStaticParams() {
  return ALL_ROLES.map((r) => ({ role: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ role: string }>;
}): Promise<Metadata> {
  const { role: slug } = await params;
  const role = ROLE_MAP.get(slug);
  if (!role) return {};
  const title = `${role.label} Interview Questions & STAR Story Examples | CVEdge`;
  const description = `Prepare for ${role.label} interviews with structured STAR stories, common behavioral and technical questions, and AI-powered job-matched prep — free.`;
  return {
    title,
    description,
    openGraph: {
      title: `${role.label} Interview Prep | CVEdge`,
      description,
      url: `https://www.thecvedge.com/interview-prep/${role.slug}`,
    },
    alternates: { canonical: `https://www.thecvedge.com/interview-prep/${role.slug}` },
  };
}

function buildFaq(label: string): { question: string; answer: string }[] {
  return [
    {
      question: `What questions are asked in a ${label} interview?`,
      answer: `${label} interviews typically mix behavioral questions ("Tell me about a time you…"), role-specific technical or domain questions, and situational scenarios. Expect 4–6 behavioral prompts (leadership, conflict, failure, impact) plus 3–5 questions specific to the ${label} craft. Hiring managers also probe for ownership, collaboration, and how you handle ambiguity.`,
    },
    {
      question: `How should I structure a ${label} interview answer?`,
      answer: `Use the STAR framework: Situation (the context), Task (your responsibility), Action (what you specifically did), Result (the measurable outcome). For ${label} answers, lean heavily on the Action and quantified Result — interviewers want to hear specific decisions you owned and the impact they had. Aim for 90–120 seconds per answer.`,
    },
    {
      question: `What are the most common behavioral questions for ${label} roles?`,
      answer: `Recurring prompts: "Tell me about your most impactful project as a ${label}.", "Describe a time you disagreed with a teammate or stakeholder.", "Walk me through a failure and what you learned.", "How do you prioritise when everything feels urgent?", "Give an example of leading without authority." Prepare one strong STAR story for each theme — the same story can often answer two prompts.`,
    },
    {
      question: `How do I prepare for a ${label} interview in a week?`,
      answer: `Day 1–2: List 8–10 of your strongest career moments and draft them in STAR format. Day 3–4: Pressure-test each story — does it have a clear result and decision you owned? Day 5: Match stories to the specific job description and company values. Day 6: Practise out loud (record yourself). Day 7: Light review — sleep, hydrate, walk in fresh. CVEdge's Interview Coach automates Days 1–5 from your CV.`,
    },
    {
      question: `What's the difference between behavioral and technical ${label} questions?`,
      answer: `Behavioral questions test how you've worked in the past — collaboration, ownership, judgement. Answer with STAR stories. Technical questions test what you know and can do — system design, problem-solving, domain knowledge specific to ${label}. Behavioral answers should be rehearsed; technical answers benefit from thinking out loud and asking clarifying questions.`,
    },
    {
      question: `How does CVEdge help with ${label} interview prep?`,
      answer: `CVEdge scans your CV, GitHub, and portfolio to extract your strongest experiences, then structures them into STAR stories with AI-powered quality scoring. Paste any ${label} job description and CVEdge surfaces the stories most relevant to that specific role with talking points. Free to start — no credit card.`,
    },
  ];
}

const SAMPLE_THEMES = [
  { icon: CheckCircle, title: "Leadership & ownership", body: "Times you drove a project, made a call without permission, or rallied a team." },
  { icon: Sparkles, title: "Impact with metrics", body: "Outcomes you delivered with numbers — revenue, latency, retention, NPS." },
  { icon: Target, title: "Conflict & collaboration", body: "Tough conversations, cross-functional friction, how you resolved disagreement." },
];

export default async function RoleInterviewPrepPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role: slug } = await params;
  const role = ROLE_MAP.get(slug);
  if (!role) notFound();

  const faqs = buildFaq(role.label);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "Interview Coach", url: "https://www.thecvedge.com/interview-prep" },
          { name: role.label, url: `https://www.thecvedge.com/interview-prep/${role.slug}` },
        ]}
      />
      <FaqJsonLd items={faqs} />

      <div className="container mx-auto px-4 py-16 md:py-20">
        {/* Hero */}
        <div className="mx-auto max-w-2xl text-center mb-14">
          <p className="text-[10px] tracking-widest text-muted-foreground uppercase">Interview Coach</p>
          <h1 className="text-3xl font-bold tracking-tight mt-2">
            {role.label} Interview Questions & STAR Stories
          </h1>
          <p className="text-muted-foreground mt-3">
            Build a personal library of {role.label.toLowerCase()} interview answers. CVEdge structures your experience into STAR stories and matches them to any job description.
          </p>
          <Button className="mt-6" asChild>
            <Link href={`/login?returnUrl=%2Finterview-coach`}>Start prepping free</Link>
          </Button>
        </div>

        {/* Themes */}
        <div className="mx-auto max-w-3xl mb-14">
          <p className="text-sm font-medium text-center text-muted-foreground mb-6">
            What {role.label.toLowerCase()} interviews really test
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SAMPLE_THEMES.map((t) => (
              <div key={t.title} className="rounded-xl border bg-card p-5 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <t.icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold">{t.title}</p>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{t.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ — visible mirror of the JSON-LD */}
        <div className="mx-auto max-w-3xl mb-14">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Common {role.label} interview questions</h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details key={f.question} className="rounded-xl border bg-card p-5 group">
                <summary className="cursor-pointer list-none font-semibold text-sm flex items-start justify-between gap-3">
                  <span>{f.question}</span>
                  <span className="text-muted-foreground shrink-0 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Cross-link to /jobs/[role] */}
        <div className="mx-auto max-w-3xl mb-14">
          <div className="rounded-xl border bg-[rgba(6,95,70,0.05)] border-[rgba(6,95,70,0.10)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Looking for {role.label} jobs?</p>
              <p className="text-xs text-muted-foreground mt-0.5">Match your CV to live {role.label.toLowerCase()} listings and prep for the ones that fit.</p>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/jobs/${role.slug}`}>Browse {role.label} jobs</Link>
            </Button>
          </div>
        </div>

        {/* CTA */}
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold tracking-tight">Stop winging your {role.label.toLowerCase()} interviews</h2>
          <p className="mt-3 text-muted-foreground">Build your story bank in minutes. Free to start, no credit card needed.</p>
          <Button className="mt-6" asChild>
            <Link href={`/login?returnUrl=%2Finterview-coach`}>Start building free</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
