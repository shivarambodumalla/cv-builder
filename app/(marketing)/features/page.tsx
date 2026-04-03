import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  BarChart3,
  Target,
  PenTool,
  Sparkles,
  Shield,
  Zap,
  LayoutTemplate,
  Languages,
  Download,
  Search,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Features — CVPilot",
  description:
    "Explore CVPilot's full feature set: AI resume builder, ATS scoring, job matching, cover letter generation, and more.",
  openGraph: {
    title: "Features — CVPilot",
    description:
      "AI-powered CV builder with ATS scoring, job matching, and cover letter generation.",
  },
};

const categories = [
  {
    name: "Resume Builder",
    description: "Create polished, professional CVs effortlessly",
    features: [
      {
        icon: Sparkles,
        title: "AI Writing Assistant",
        description:
          "Get contextual suggestions for bullet points, professional summaries, and skill descriptions based on your role and industry.",
      },
      {
        icon: LayoutTemplate,
        title: "Professional Templates",
        description:
          "Choose from a curated library of clean, recruiter-approved templates designed for every industry and seniority level.",
      },
      {
        icon: FileText,
        title: "Multiple CV Versions",
        description:
          "Create and manage different CV versions for different roles. Tailor each one to the specific job you are applying for.",
      },
      {
        icon: Languages,
        title: "Multi-Section Support",
        description:
          "Education, experience, projects, certifications, languages, volunteer work — add any section that strengthens your application.",
      },
    ],
  },
  {
    name: "ATS Optimisation",
    description: "Beat applicant tracking systems with confidence",
    features: [
      {
        icon: BarChart3,
        title: "ATS Score Checker",
        description:
          "Upload your CV and instantly see a score reflecting how well it performs against common ATS parsing algorithms.",
      },
      {
        icon: Search,
        title: "Keyword Analysis",
        description:
          "Identify missing keywords from job descriptions and get suggestions on where to naturally incorporate them.",
      },
      {
        icon: TrendingUp,
        title: "Formatting Validation",
        description:
          "Ensure your CV layout, fonts, and structure won't break when parsed by applicant tracking systems.",
      },
    ],
  },
  {
    name: "Job Matching",
    description: "Find out exactly how well you fit each role",
    features: [
      {
        icon: Target,
        title: "Job Description Matching",
        description:
          "Paste any job listing and get a detailed match score showing where your CV aligns and where it falls short.",
      },
      {
        icon: Zap,
        title: "Gap Analysis",
        description:
          "See which skills, experiences, or qualifications you are missing and get AI-powered suggestions to bridge the gap.",
      },
      {
        icon: TrendingUp,
        title: "Improvement Roadmap",
        description:
          "Receive a prioritised list of changes that will have the biggest impact on your match score for a given role.",
      },
    ],
  },
  {
    name: "Cover Letter",
    description: "Generate tailored cover letters in seconds",
    features: [
      {
        icon: PenTool,
        title: "AI Cover Letter Generator",
        description:
          "Generate a compelling, personalised cover letter based on your CV and the target job description.",
      },
      {
        icon: Shield,
        title: "Tone & Style Control",
        description:
          "Adjust the tone from formal to conversational. CVPilot adapts the writing style to match company culture.",
      },
      {
        icon: Download,
        title: "Matched PDF Export",
        description:
          "Export your cover letter as a PDF that visually matches your CV template for a cohesive application package.",
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="mx-auto mb-20 max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Everything you need to land the job
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          From building your first CV to tailoring applications for specific
          roles — CVPilot has you covered at every step.
        </p>
      </div>

      <div className="space-y-24">
        {categories.map((category) => (
          <section key={category.name}>
            <div className="mb-10">
              <h2 className="text-2xl font-bold tracking-tight">
                {category.name}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {category.description}
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {category.features.map((feature) => (
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
        ))}
      </div>
    </div>
  );
}
