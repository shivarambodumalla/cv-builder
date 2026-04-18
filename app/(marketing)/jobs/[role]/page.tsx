import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobSearchForm } from "../job-search-form";
import { RoleJobResults } from "./role-job-results";
import { BrowseRoles } from "@/components/jobs/browse-roles";

export const dynamic = "force-dynamic";

interface RoleDef {
  slug: string;
  title: string;
  keywords: string;
  description: string;
}

const ROLES: RoleDef[] = [
  // Software Development
  { slug: "software-engineer", title: "Software Engineer", keywords: "software engineer", description: "Browse Software Engineer jobs and see your ATS match score before you apply." },
  { slug: "full-stack-developer", title: "Full Stack Developer", keywords: "full stack developer", description: "Find Full Stack Developer jobs matched to your frontend and backend skills." },
  { slug: "frontend-developer", title: "Frontend Developer", keywords: "frontend developer react typescript", description: "Find Frontend Developer jobs with your ATS match score per listing." },
  { slug: "backend-developer", title: "Backend Developer", keywords: "backend developer node python api", description: "Find Backend Developer jobs matched to your CV and skills." },
  { slug: "mobile-app-developer", title: "Mobile App Developer", keywords: "mobile developer ios android react native", description: "Find Mobile App Developer jobs for iOS, Android, and cross-platform." },
  { slug: "web-developer", title: "Web Developer", keywords: "web developer html css javascript", description: "Find Web Developer jobs building modern websites and web apps." },
  { slug: "platform-engineer", title: "Platform Engineer", keywords: "platform engineer infrastructure", description: "Find Platform Engineer jobs matched to your infrastructure expertise." },
  { slug: "software-architect", title: "Software Architect", keywords: "software architect system design", description: "Find Software Architect roles for experienced system designers." },
  // DevOps, Cloud & Infrastructure
  { slug: "devops-engineer", title: "DevOps Engineer", keywords: "devops engineer kubernetes aws", description: "Find DevOps Engineer jobs matched to your CI/CD and cloud skills." },
  { slug: "site-reliability-engineer", title: "Site Reliability Engineer", keywords: "SRE site reliability engineer", description: "Find SRE jobs matched to your observability and infrastructure skills." },
  { slug: "cloud-engineer", title: "Cloud Engineer", keywords: "cloud engineer aws azure gcp", description: "Find Cloud Engineer jobs across AWS, Azure, and GCP." },
  { slug: "cloud-architect", title: "Cloud Architect", keywords: "cloud architect solutions aws", description: "Find Cloud Architect roles for experienced cloud professionals." },
  { slug: "infrastructure-engineer", title: "Infrastructure Engineer", keywords: "infrastructure engineer terraform", description: "Find Infrastructure Engineer jobs matched to your skills." },
  { slug: "systems-engineer", title: "Systems Engineer", keywords: "systems engineer linux", description: "Find Systems Engineer jobs managing and scaling infrastructure." },
  { slug: "network-engineer", title: "Network Engineer", keywords: "network engineer cisco routing", description: "Find Network Engineer jobs in networking and telecommunications." },
  { slug: "kubernetes-engineer", title: "Kubernetes Engineer", keywords: "kubernetes engineer k8s containers", description: "Find Kubernetes Engineer jobs for container orchestration experts." },
  { slug: "release-engineer", title: "Release Engineer", keywords: "release engineer CI CD pipeline", description: "Find Release Engineer jobs managing build and deployment pipelines." },
  { slug: "build-engineer", title: "Build Engineer", keywords: "build engineer automation CI", description: "Find Build Engineer jobs automating software build processes." },
  { slug: "integration-engineer", title: "Integration Engineer", keywords: "integration engineer API systems", description: "Find Integration Engineer jobs connecting systems and APIs." },
  // AI, ML & Data
  { slug: "machine-learning-engineer", title: "Machine Learning Engineer", keywords: "machine learning engineer pytorch tensorflow", description: "Find ML Engineer jobs with CV match scoring." },
  { slug: "ai-engineer", title: "AI Engineer", keywords: "AI engineer artificial intelligence", description: "Find AI Engineer jobs building intelligent systems and models." },
  { slug: "generative-ai-engineer", title: "Generative AI Engineer", keywords: "generative AI engineer LLM GPT", description: "Find Generative AI Engineer jobs working with LLMs and foundation models." },
  { slug: "data-scientist", title: "Data Scientist", keywords: "data scientist machine learning python", description: "Find Data Scientist positions matched to your analytical skills." },
  { slug: "data-analyst", title: "Data Analyst", keywords: "data analyst sql tableau", description: "Find Data Analyst jobs matched to your analytical skills." },
  { slug: "data-engineer", title: "Data Engineer", keywords: "data engineer pipeline spark", description: "Find Data Engineer jobs building data pipelines and infrastructure." },
  { slug: "analytics-engineer", title: "Analytics Engineer", keywords: "analytics engineer dbt sql", description: "Find Analytics Engineer jobs bridging data engineering and analytics." },
  { slug: "mlops-engineer", title: "MLOps Engineer", keywords: "MLOps engineer model deployment", description: "Find MLOps Engineer jobs bridging ML and production systems." },
  { slug: "ai-research-engineer", title: "AI Research Engineer", keywords: "AI research engineer deep learning", description: "Find AI Research Engineer positions at top research labs." },
  { slug: "ai-prompt-engineer", title: "AI Prompt Engineer", keywords: "prompt engineer LLM AI", description: "Find Prompt Engineer jobs working with large language models." },
  { slug: "business-intelligence-analyst", title: "Business Intelligence Analyst", keywords: "BI analyst business intelligence", description: "Find BI Analyst jobs turning data into business insights." },
  { slug: "data-architect", title: "Data Architect", keywords: "data architect database design", description: "Find Data Architect jobs designing enterprise data systems." },
  { slug: "etl-developer", title: "ETL Developer", keywords: "ETL developer data integration", description: "Find ETL Developer jobs building data extraction and transformation pipelines." },
  { slug: "big-data-engineer", title: "Big Data Engineer", keywords: "big data engineer hadoop spark", description: "Find Big Data Engineer jobs processing large-scale datasets." },
  { slug: "hadoop-engineer", title: "Hadoop Engineer", keywords: "hadoop engineer MapReduce HDFS", description: "Find Hadoop Engineer jobs in distributed data processing." },
  { slug: "spark-developer", title: "Spark Developer", keywords: "spark developer apache PySpark", description: "Find Spark Developer jobs for large-scale data processing." },
  // Cybersecurity
  { slug: "cybersecurity-engineer", title: "Cybersecurity Engineer", keywords: "cybersecurity engineer security", description: "Find Cybersecurity Engineer jobs protecting systems and data." },
  { slug: "security-analyst", title: "Security Analyst", keywords: "security analyst SOC threat", description: "Find Security Analyst jobs in threat detection and response." },
  { slug: "security-architect", title: "Security Architect", keywords: "security architect enterprise", description: "Find Security Architect roles designing secure systems." },
  { slug: "penetration-tester", title: "Penetration Tester", keywords: "penetration tester ethical hacker", description: "Find Penetration Tester and Ethical Hacker jobs." },
  { slug: "application-security-engineer", title: "Application Security Engineer", keywords: "application security engineer AppSec", description: "Find AppSec Engineer jobs securing software applications." },
  { slug: "cloud-security-engineer", title: "Cloud Security Engineer", keywords: "cloud security engineer AWS Azure", description: "Find Cloud Security Engineer jobs securing cloud infrastructure." },
  { slug: "iam-engineer", title: "IAM Engineer", keywords: "identity access management IAM engineer", description: "Find IAM Engineer jobs managing identity and access controls." },
  // Product, Business & Management
  { slug: "product-manager", title: "Product Manager", keywords: "product manager", description: "Find Product Manager roles that fit your experience." },
  { slug: "technical-product-manager", title: "Technical Product Manager", keywords: "technical product manager engineering", description: "Find Technical Product Manager jobs bridging product and engineering." },
  { slug: "ai-product-manager", title: "AI Product Manager", keywords: "AI product manager machine learning", description: "Find AI Product Manager jobs at the intersection of product and ML." },
  { slug: "program-manager", title: "Program Manager", keywords: "program manager coordination", description: "Find Program Manager jobs coordinating cross-functional initiatives." },
  { slug: "project-manager", title: "Project Manager", keywords: "project manager agile scrum", description: "Find Project Manager jobs leading teams and delivering projects." },
  { slug: "business-analyst", title: "Business Analyst", keywords: "business analyst requirements", description: "Find Business Analyst jobs analysing business needs and processes." },
  { slug: "technical-analyst", title: "Technical Analyst", keywords: "technical analyst systems", description: "Find Technical Analyst jobs bridging business and technology." },
  // Design & UX
  { slug: "ux-designer", title: "UX Designer", keywords: "UX designer user experience", description: "Explore UX Designer opportunities matched to your design skills." },
  { slug: "ui-designer", title: "UI Designer", keywords: "UI designer visual design figma", description: "Find UI Designer jobs for visual and interface design experts." },
  { slug: "product-designer", title: "Product Designer", keywords: "product designer UX UI", description: "Find Product Designer jobs combining UX research and visual design." },
  { slug: "ux-researcher", title: "UX Researcher", keywords: "UX researcher user research", description: "Find UX Researcher jobs conducting user studies and usability testing." },
  { slug: "interaction-designer", title: "Interaction Designer", keywords: "interaction designer motion prototyping", description: "Find Interaction Designer jobs crafting engaging user interactions." },
  { slug: "visual-designer", title: "Visual Designer", keywords: "visual designer graphic branding", description: "Find Visual Designer jobs creating compelling visual experiences." },
  // Architecture
  { slug: "solutions-architect", title: "Solutions Architect", keywords: "solutions architect enterprise", description: "Find Solutions Architect roles for experienced system designers." },
  { slug: "enterprise-architect", title: "Enterprise Architect", keywords: "enterprise architect strategy", description: "Find Enterprise Architect jobs shaping technology strategy." },
  { slug: "technical-architect", title: "Technical Architect", keywords: "technical architect system design", description: "Find Technical Architect jobs designing complex technical systems." },
  // Database & Systems
  { slug: "database-administrator", title: "Database Administrator", keywords: "DBA database administrator SQL", description: "Find DBA jobs managing and optimising database systems." },
  { slug: "systems-administrator", title: "Systems Administrator", keywords: "systems administrator sysadmin", description: "Find Systems Administrator jobs managing IT infrastructure." },
  { slug: "network-administrator", title: "Network Administrator", keywords: "network administrator", description: "Find Network Administrator jobs managing network infrastructure." },
  { slug: "it-administrator", title: "IT Administrator", keywords: "IT administrator support", description: "Find IT Administrator jobs maintaining enterprise IT systems." },
  // QA & Testing
  { slug: "qa-engineer", title: "QA Engineer", keywords: "QA engineer quality assurance testing", description: "Find QA Engineer jobs ensuring software quality." },
  { slug: "test-automation-engineer", title: "Test Automation Engineer", keywords: "test automation engineer selenium", description: "Find Test Automation Engineer jobs building automated test suites." },
  { slug: "performance-engineer", title: "Performance Engineer", keywords: "performance engineer load testing", description: "Find Performance Engineer jobs optimising system performance." },
  // Blockchain & Web3
  { slug: "blockchain-developer", title: "Blockchain Developer", keywords: "blockchain developer web3 solidity", description: "Find Blockchain Developer jobs in Web3 and decentralised systems." },
  { slug: "web3-engineer", title: "Web3 Engineer", keywords: "web3 engineer decentralised", description: "Find Web3 Engineer jobs building decentralised applications." },
  { slug: "smart-contract-developer", title: "Smart Contract Developer", keywords: "smart contract developer solidity ethereum", description: "Find Smart Contract Developer jobs on Ethereum and other chains." },
  // AR/VR & Gaming
  { slug: "ar-developer", title: "AR Developer", keywords: "AR developer augmented reality", description: "Find AR Developer jobs building augmented reality experiences." },
  { slug: "vr-developer", title: "VR Developer", keywords: "VR developer virtual reality", description: "Find VR Developer jobs creating virtual reality applications." },
  { slug: "ar-vr-engineer", title: "AR/VR Engineer", keywords: "AR VR engineer mixed reality", description: "Find AR/VR Engineer jobs building immersive experiences." },
  { slug: "game-developer", title: "Game Developer", keywords: "game developer unity unreal", description: "Find Game Developer jobs using Unity, Unreal, and other engines." },
  { slug: "game-designer", title: "Game Designer", keywords: "game designer mechanics narrative", description: "Find Game Designer jobs creating game mechanics and experiences." },
  // Hardware, IoT & Robotics
  { slug: "robotics-engineer", title: "Robotics Engineer", keywords: "robotics engineer automation", description: "Find Robotics Engineer jobs in automation and intelligent machines." },
  { slug: "embedded-systems-engineer", title: "Embedded Systems Engineer", keywords: "embedded systems engineer firmware", description: "Find Embedded Systems Engineer jobs programming hardware devices." },
  { slug: "firmware-engineer", title: "Firmware Engineer", keywords: "firmware engineer embedded C", description: "Find Firmware Engineer jobs developing low-level software." },
  { slug: "iot-engineer", title: "IoT Engineer", keywords: "IoT engineer internet of things", description: "Find IoT Engineer jobs connecting devices and building smart systems." },
  { slug: "hardware-engineer", title: "Hardware Engineer", keywords: "hardware engineer electronics", description: "Find Hardware Engineer jobs designing electronic systems." },
  // Support & Operations
  { slug: "support-engineer", title: "Support Engineer", keywords: "support engineer technical support", description: "Find Support Engineer jobs providing technical assistance." },
];

const ROLE_MAP = new Map(ROLES.map((r) => [r.slug, r]));

export function generateStaticParams() {
  return ROLES.map((r) => ({ role: r.slug }));
}

export async function generateMetadata({ params }: { params: { role: string } }): Promise<Metadata> {
  const role = ROLE_MAP.get(params.role);
  if (!role) return {};
  return {
    title: `${role.title} Jobs — See Your Match Score | CVEdge`,
    description: role.description,
    openGraph: { title: `${role.title} Jobs | CVEdge`, description: role.description, url: `https://thecvedge.com/jobs/${role.slug}` },
  };
}

export default async function RoleJobsPage({ params }: { params: { role: string } }) {
  const role = ROLE_MAP.get(params.role);
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
