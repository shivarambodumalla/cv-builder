import type { Metadata } from "next";
import { BarChart3, Sparkles, Layout, Target, Download } from "lucide-react";
import { TemplateShowcase } from "./template-showcase";
import { ResumesGetStarted } from "./resumes-get-started";
import { BreadcrumbJsonLd } from "@/components/shared/structured-data";
import { getProTemplateSlugs, getTemplateCounts, type TemplateCounts } from "@/lib/billing/plan-config";

// Template counts come from the catalogue. force-static keeps the page static
// (the admin client's no-store fetch would otherwise make it dynamic); it
// re-reads the counts hourly.
export const dynamic = "force-static";
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { free } = await getTemplateCounts();
  return {
    title: "AI Resume Builder: Free ATS-Friendly Templates",
    description: `${free} free ATS-friendly resume templates. Upload your resume, get an instant ATS score, and fix everything with AI. Free account, no credit card.`,
    alternates: { canonical: "https://www.thecvedge.com/resumes" },
    openGraph: {
      title: "Free ATS-Friendly Resume Templates | CVEdge",
      description: `${free} free ATS-friendly resume templates with AI rewriting, score tracking, and one-click PDF export.`,
      url: "https://www.thecvedge.com/resumes",
    },
  };
}

const features = ({ total }: TemplateCounts) => [
  { icon: BarChart3, title: "Know your score before recruiters see your resume", desc: "Upload your resume and get an instant ATS score across 6 categories. See exactly what software flags, and fix each issue one by one." },
  { icon: Sparkles, title: "Fix weak bullet points with one click", desc: "Every bullet has a Rewrite button. Pick a mode, get a better version, and insert it instantly. Your experience, stronger words." },
  { icon: Layout, title: `${total} professional templates, each ATS-optimized`, desc: "Choose from Classic, Sharp, Minimal, Executive, Sidebar and more. Every template is tested to pass ATS filters and look great on screen." },
  { icon: Target, title: "See how well you match any job before applying", desc: "Paste a job description and get a match score with missing keywords highlighted. Fix gaps before you hit apply." },
  { icon: Download, title: "Download clean PDFs", desc: "Export your finished resume as a polished PDF ready to send. No branding, no surprises." },
];

export default async function ResumesPage() {
  const FEATURES = features(await getTemplateCounts());
  const proSlugs = await getProTemplateSlugs();
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "Resume Templates", url: "https://www.thecvedge.com/resumes" },
        ]}
      />
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center mb-14">
        <p className="text-[10px] tracking-widest text-muted-foreground uppercase mb-2">Templates</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Free ATS-Friendly Resume Templates</h1>
        <p className="text-muted-foreground mt-3">Pick your style. Every template passes ATS filters. All free to try.</p>
      </div>

      {/* Template showcase — client component for filter tabs */}
      <TemplateShowcase proSlugs={proSlugs} />

      {/* Features */}
      <div className="mx-auto max-w-4xl mt-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Everything in one place</h2>
          <p className="mt-3 text-muted-foreground">No switching between tools. Upload your resume and do it all here.</p>
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
          <ResumesGetStarted />
        </div>
      </div>
    </div>
  );
}
