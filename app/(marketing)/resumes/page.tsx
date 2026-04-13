import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { BarChart3, Sparkles, Layout, Target, Download } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Resume Builder — Free ATS-Friendly Templates",
  description: "12 free ATS-friendly CV templates. Upload your CV, get an instant ATS score, fix everything with AI. No signup required.",
  alternates: { canonical: "https://thecvedge.com/resumes" },
};

const FEATURES = [
  {
    icon: BarChart3,
    title: "Know your score before recruiters see your CV",
    desc: "Upload your CV and get an instant ATS score across 6 categories. See exactly what software flags — and fix each issue one by one.",
  },
  {
    icon: Sparkles,
    title: "Fix weak bullet points with one click",
    desc: "Every bullet has a Rewrite button. Pick a mode, get a better version, and insert it instantly. Your experience, stronger words.",
  },
  {
    icon: Layout,
    title: "12 professional templates, each ATS-optimised",
    desc: "Choose from Classic, Sharp, Minimal, Executive, Sidebar and more. Every template is tested to pass ATS filters and look great on screen.",
  },
  {
    icon: Target,
    title: "See how well you match any job before applying",
    desc: "Paste a job description and get a match score with missing keywords highlighted. Fix gaps before you hit apply.",
  },
  {
    icon: Download,
    title: "Download clean, watermark-free PDFs",
    desc: "Export your finished CV as a polished PDF ready to send. No branding, no watermarks, no surprises.",
  },
];

export default function ResumesPage() {
  return (
    <div className="container mx-auto px-4 py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center mb-12">
        <p className="text-[10px] tracking-widest text-muted-foreground uppercase">Resumes</p>
        <h1 className="text-3xl font-bold tracking-tight mt-2">Everything your CV needs to land interviews</h1>
        <p className="text-muted-foreground mt-3">ATS scoring, AI rewrites, professional templates, and job matching — all in one place.</p>
        <Button className="mt-6" asChild>
          <Link href="/login">Get started free</Link>
        </Button>
      </div>

      {/* Template thumbnails */}
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-medium text-center text-muted-foreground mb-6">Professional templates</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {["Classic", "Sharp", "Minimal", "Executive", "Sidebar"].map((name) => (
            <div key={name} className="rounded-xl border bg-card p-3 text-center">
              <div className="aspect-[3/4] rounded-lg bg-muted mb-2 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Preview</span>
              </div>
              <p className="text-xs font-medium">{name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature sections */}
      <div className="mx-auto max-w-4xl mt-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Everything in one place</h2>
          <p className="mt-3 text-muted-foreground">No switching between tools. Upload your CV and do it all here.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border bg-background p-5 space-y-2">
              <f.icon className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild>
            <Link href="/login">Get started free</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
