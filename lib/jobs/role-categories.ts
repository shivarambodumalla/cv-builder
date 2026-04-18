// Shared role categories for SEO browse sections across /jobs and /jobs/[role] pages

export interface RoleLink {
  label: string;
  slug: string;
}

export interface RoleCategory {
  name: string;
  roles: RoleLink[];
}

export const ROLE_CATEGORIES: RoleCategory[] = [
  {
    name: "Software Development",
    roles: [
      { label: "Software Engineer", slug: "software-engineer" },
      { label: "Full Stack Developer", slug: "full-stack-developer" },
      { label: "Frontend Developer", slug: "frontend-developer" },
      { label: "Backend Developer", slug: "backend-developer" },
      { label: "Mobile App Developer", slug: "mobile-app-developer" },
      { label: "Web Developer", slug: "web-developer" },
      { label: "Platform Engineer", slug: "platform-engineer" },
      { label: "Software Architect", slug: "software-architect" },
    ],
  },
  {
    name: "DevOps, Cloud & Infrastructure",
    roles: [
      { label: "DevOps Engineer", slug: "devops-engineer" },
      { label: "SRE", slug: "site-reliability-engineer" },
      { label: "Cloud Engineer", slug: "cloud-engineer" },
      { label: "Cloud Architect", slug: "cloud-architect" },
      { label: "Infrastructure Engineer", slug: "infrastructure-engineer" },
      { label: "Systems Engineer", slug: "systems-engineer" },
      { label: "Network Engineer", slug: "network-engineer" },
      { label: "Kubernetes Engineer", slug: "kubernetes-engineer" },
      { label: "Release Engineer", slug: "release-engineer" },
      { label: "Build Engineer", slug: "build-engineer" },
      { label: "Integration Engineer", slug: "integration-engineer" },
    ],
  },
  {
    name: "AI, ML & Data",
    roles: [
      { label: "ML Engineer", slug: "machine-learning-engineer" },
      { label: "AI Engineer", slug: "ai-engineer" },
      { label: "Generative AI Engineer", slug: "generative-ai-engineer" },
      { label: "Data Scientist", slug: "data-scientist" },
      { label: "Data Analyst", slug: "data-analyst" },
      { label: "Data Engineer", slug: "data-engineer" },
      { label: "Analytics Engineer", slug: "analytics-engineer" },
      { label: "MLOps Engineer", slug: "mlops-engineer" },
      { label: "AI Research Engineer", slug: "ai-research-engineer" },
      { label: "AI Prompt Engineer", slug: "ai-prompt-engineer" },
      { label: "BI Analyst", slug: "business-intelligence-analyst" },
      { label: "Data Architect", slug: "data-architect" },
      { label: "ETL Developer", slug: "etl-developer" },
      { label: "Big Data Engineer", slug: "big-data-engineer" },
      { label: "Hadoop Engineer", slug: "hadoop-engineer" },
      { label: "Spark Developer", slug: "spark-developer" },
    ],
  },
  {
    name: "Cybersecurity",
    roles: [
      { label: "Cybersecurity Engineer", slug: "cybersecurity-engineer" },
      { label: "Security Analyst", slug: "security-analyst" },
      { label: "Security Architect", slug: "security-architect" },
      { label: "Penetration Tester", slug: "penetration-tester" },
      { label: "AppSec Engineer", slug: "application-security-engineer" },
      { label: "Cloud Security", slug: "cloud-security-engineer" },
      { label: "IAM Engineer", slug: "iam-engineer" },
    ],
  },
  {
    name: "Product, Business & Management",
    roles: [
      { label: "Product Manager", slug: "product-manager" },
      { label: "Technical PM", slug: "technical-product-manager" },
      { label: "AI Product Manager", slug: "ai-product-manager" },
      { label: "Program Manager", slug: "program-manager" },
      { label: "Project Manager", slug: "project-manager" },
      { label: "Business Analyst", slug: "business-analyst" },
      { label: "Technical Analyst", slug: "technical-analyst" },
    ],
  },
  {
    name: "Design & UX",
    roles: [
      { label: "UX Designer", slug: "ux-designer" },
      { label: "UI Designer", slug: "ui-designer" },
      { label: "Product Designer", slug: "product-designer" },
      { label: "UX Researcher", slug: "ux-researcher" },
      { label: "Interaction Designer", slug: "interaction-designer" },
      { label: "Visual Designer", slug: "visual-designer" },
    ],
  },
  {
    name: "Architecture",
    roles: [
      { label: "Solutions Architect", slug: "solutions-architect" },
      { label: "Enterprise Architect", slug: "enterprise-architect" },
      { label: "Technical Architect", slug: "technical-architect" },
    ],
  },
  {
    name: "Database & Systems",
    roles: [
      { label: "DBA", slug: "database-administrator" },
      { label: "Systems Admin", slug: "systems-administrator" },
      { label: "Network Admin", slug: "network-administrator" },
      { label: "IT Admin", slug: "it-administrator" },
    ],
  },
  {
    name: "QA & Testing",
    roles: [
      { label: "QA Engineer", slug: "qa-engineer" },
      { label: "Test Automation", slug: "test-automation-engineer" },
      { label: "Performance Engineer", slug: "performance-engineer" },
    ],
  },
  {
    name: "Blockchain & Web3",
    roles: [
      { label: "Blockchain Developer", slug: "blockchain-developer" },
      { label: "Web3 Engineer", slug: "web3-engineer" },
      { label: "Smart Contract Dev", slug: "smart-contract-developer" },
    ],
  },
  {
    name: "AR/VR & Gaming",
    roles: [
      { label: "AR Developer", slug: "ar-developer" },
      { label: "VR Developer", slug: "vr-developer" },
      { label: "AR/VR Engineer", slug: "ar-vr-engineer" },
      { label: "Game Developer", slug: "game-developer" },
      { label: "Game Designer", slug: "game-designer" },
    ],
  },
  {
    name: "Hardware, IoT & Robotics",
    roles: [
      { label: "Robotics Engineer", slug: "robotics-engineer" },
      { label: "Embedded Systems", slug: "embedded-systems-engineer" },
      { label: "Firmware Engineer", slug: "firmware-engineer" },
      { label: "IoT Engineer", slug: "iot-engineer" },
      { label: "Hardware Engineer", slug: "hardware-engineer" },
    ],
  },
  {
    name: "Support & Operations",
    roles: [
      { label: "Support Engineer", slug: "support-engineer" },
    ],
  },
];

/** Flat list of all roles for quick lookup */
export const ALL_ROLES = ROLE_CATEGORIES.flatMap(c => c.roles);
