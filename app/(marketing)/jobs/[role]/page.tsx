import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobSearchForm } from "../job-search-form";
import { RoleJobResults } from "./role-job-results";
import { BrowseRoles } from "@/components/jobs/browse-roles";
import { ALL_ROLES } from "@/lib/jobs/role-categories";

export const dynamic = "force-dynamic";

interface RoleDef {
  slug: string;
  title: string;
  keywords: string;
  description: string;
}

// Custom keywords/descriptions for roles that need them. Roles not listed auto-generate from label.
const CUSTOM_ROLES: Record<string, Omit<RoleDef, "slug">> = {
  "frontend-developer": { title: "Frontend Developer", keywords: "frontend developer react typescript", description: "Find Frontend Developer jobs with your ATS match score per listing." },
  "backend-developer": { title: "Backend Developer", keywords: "backend developer node python api", description: "Find Backend Developer jobs matched to your CV and skills." },
  "mobile-app-developer": { title: "Mobile App Developer", keywords: "mobile developer ios android react native", description: "Find Mobile App Developer jobs for iOS, Android, and cross-platform." },
  "devops-engineer": { title: "DevOps Engineer", keywords: "devops engineer kubernetes aws", description: "Find DevOps Engineer jobs matched to your CI/CD and cloud skills." },
  "cloud-engineer": { title: "Cloud Engineer", keywords: "cloud engineer aws azure gcp", description: "Find Cloud Engineer jobs across AWS, Azure, and GCP." },
  "machine-learning-engineer": { title: "Machine Learning Engineer", keywords: "machine learning engineer pytorch tensorflow", description: "Find ML Engineer jobs with CV match scoring." },
  "data-scientist": { title: "Data Scientist", keywords: "data scientist machine learning python", description: "Find Data Scientist positions matched to your analytical skills." },
  "data-analyst": { title: "Data Analyst", keywords: "data analyst sql tableau", description: "Find Data Analyst jobs matched to your analytical skills." },
  "data-engineer": { title: "Data Engineer", keywords: "data engineer pipeline spark", description: "Find Data Engineer jobs building data pipelines and infrastructure." },
  "generative-ai-engineer": { title: "Generative AI Engineer", keywords: "generative AI engineer LLM GPT", description: "Find Generative AI Engineer jobs working with LLMs and foundation models." },
  "cybersecurity-engineer": { title: "Cybersecurity Engineer", keywords: "cybersecurity engineer security", description: "Find Cybersecurity Engineer jobs protecting systems and data." },
  "penetration-tester": { title: "Penetration Tester", keywords: "penetration tester ethical hacker", description: "Find Penetration Tester and Ethical Hacker jobs." },
  "blockchain-developer": { title: "Blockchain Developer", keywords: "blockchain developer web3 solidity", description: "Find Blockchain Developer jobs in Web3 and decentralised systems." },
  "qa-engineer": { title: "QA Engineer", keywords: "QA engineer quality assurance testing", description: "Find QA Engineer jobs ensuring software quality." },
  "database-administrator": { title: "Database Administrator", keywords: "DBA database administrator SQL", description: "Find DBA jobs managing and optimising database systems." },
};

// Auto-generate ROLES from ALL_ROLES, using custom overrides where available
const ROLES: RoleDef[] = ALL_ROLES.map((r) => {
  const custom = CUSTOM_ROLES[r.slug];
  if (custom) return { slug: r.slug, ...custom };
  return {
    slug: r.slug,
    title: r.label,
    keywords: r.label.toLowerCase(),
    description: `Find ${r.label} jobs and see your ATS match score before you apply.`,
  };
});

const ROLE_MAP = new Map(ROLES.map((r) => [r.slug, r]));

export function generateStaticParams() {
  return ALL_ROLES.map((r) => ({ role: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ role: string }> }): Promise<Metadata> {
  const { role: slug } = await params;
  const role = ROLE_MAP.get(slug);
  if (!role) return {};
  return {
    title: `${role.title} Jobs — See Your Match Score | CVEdge`,
    description: role.description,
    openGraph: { title: `${role.title} Jobs | CVEdge`, description: role.description, url: `https://www.thecvedge.com/jobs/${role.slug}` },
    alternates: { canonical: `https://www.thecvedge.com/jobs/${role.slug}` },
  };
}

export default async function RoleJobsPage({ params }: { params: Promise<{ role: string }> }) {
  const { role: slug } = await params;
  const role = ROLE_MAP.get(slug);
  if (!role) notFound();

  // Fetch jobs from all enabled providers
  let jobs: unknown[] = [];
  try {
    const { searchAllProviders } = await import("@/lib/jobs/search");
    const response = await searchAllProviders({
      what: role.keywords,
      results_per_page: 20,
      sort_by: "relevance",
    });
    jobs = response.results;
  } catch { /* silent */ }

  // JSON-LD for top 3
  const schemas = jobs.slice(0, 3).map((j: unknown) => {
    const job = j as { title: string; description: string; company: { display_name: string }; location: { display_name: string }; created: string; contract_type: string; redirect_url: string; salary_min: number; salary_max: number };
    return {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: job.title,
      description: (job.description || "").replace(/<[^>]*>/g, "").slice(0, 500),
      hiringOrganization: { "@type": "Organization", name: job.company?.display_name },
      jobLocation: { "@type": "Place", name: job.location?.display_name },
      datePosted: job.created,
      employmentType: job.contract_type || "FULL_TIME",
      url: job.redirect_url,
      ...(job.salary_min ? { baseSalary: { "@type": "MonetaryAmount", currency: "USD", value: { "@type": "QuantitativeValue", minValue: job.salary_min, maxValue: job.salary_max || job.salary_min, unitText: "YEAR" } } } : {}),
    };
  });

  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-5xl px-4 pt-8 pb-16">
          {/* SEO title */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{role.title} Jobs</h1>
            <p className="mt-1 text-sm text-muted-foreground">{role.description}</p>
          </div>

          {/* Search card */}
          <div className="rounded-2xl bg-[#F0EDE6] dark:bg-muted/30 p-5 sm:p-6 space-y-4 mb-8">
            <div>
              <p className="text-sm font-medium text-foreground">Search {role.title.toLowerCase()} jobs</p>
            </div>
            <JobSearchForm defaultQuery={role.keywords} defaultLocation="" />
          </div>

          {/* Job results with sign-in modal on click */}
          <RoleJobResults jobs={jobs} roleTitle={role.title} />

          {/* Browse other roles — SEO internal links */}
          <BrowseRoles currentSlug={role.slug} />
        </div>
      </div>
    </>
  );
}
