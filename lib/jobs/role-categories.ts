// Shared role categories for SEO browse sections across /jobs and /jobs/[role] pages

export interface RoleLink {
  label: string;
  slug: string;
}

export interface RoleCategory {
  name: string;
  emoji?: string;
  roles: RoleLink[];
}

/** Top 20 trending / most in-demand roles — shown as highlighted chips */
export const TRENDING_ROLES: RoleLink[] = [
  { label: "Software Engineer", slug: "software-engineer" },
  { label: "Full Stack Developer", slug: "full-stack-developer" },
  { label: "Frontend Developer", slug: "frontend-developer" },
  { label: "Backend Developer", slug: "backend-developer" },
  { label: "Data Scientist", slug: "data-scientist" },
  { label: "Data Engineer", slug: "data-engineer" },
  { label: "Machine Learning Engineer", slug: "machine-learning-engineer" },
  { label: "AI Engineer", slug: "ai-engineer" },
  { label: "DevOps Engineer", slug: "devops-engineer" },
  { label: "Cloud Engineer", slug: "cloud-engineer" },
  { label: "Site Reliability Engineer", slug: "site-reliability-engineer" },
  { label: "Cybersecurity Engineer", slug: "cybersecurity-engineer" },
  { label: "Security Analyst", slug: "security-analyst" },
  { label: "Product Manager", slug: "product-manager" },
  { label: "UX Designer", slug: "ux-designer" },
  { label: "UI Designer", slug: "ui-designer" },
  { label: "Business Analyst", slug: "business-analyst" },
  { label: "Solutions Architect", slug: "solutions-architect" },
  { label: "Mobile App Developer", slug: "mobile-app-developer" },
  { label: "QA Engineer", slug: "qa-engineer" },
];

/** Full categorized directory — Flipkart-style SEO link grid */
export const ROLE_CATEGORIES: RoleCategory[] = [
  {
    name: "Software Development",
    emoji: "💻",
    roles: [
      { label: "Software Engineer", slug: "software-engineer" },
      { label: "Full Stack Developer", slug: "full-stack-developer" },
      { label: "Frontend Developer", slug: "frontend-developer" },
      { label: "Backend Developer", slug: "backend-developer" },
      { label: "Web Developer", slug: "web-developer" },
      { label: "Mobile App Developer", slug: "mobile-app-developer" },
      { label: "Android Developer", slug: "android-developer" },
      { label: "iOS Developer", slug: "ios-developer" },
      { label: "API Developer", slug: "api-developer" },
      { label: "Application Developer", slug: "application-developer" },
      { label: "Software Architect", slug: "software-architect" },
      { label: "Platform Engineer", slug: "platform-engineer" },
      { label: "Systems Engineer", slug: "systems-engineer" },
    ],
  },
  {
    name: "DevOps, Cloud & Infrastructure",
    emoji: "⚙️",
    roles: [
      { label: "DevOps Engineer", slug: "devops-engineer" },
      { label: "Site Reliability Engineer (SRE)", slug: "site-reliability-engineer" },
      { label: "Cloud Engineer", slug: "cloud-engineer" },
      { label: "Cloud Architect", slug: "cloud-architect" },
      { label: "Infrastructure Engineer", slug: "infrastructure-engineer" },
      { label: "Platform Operations Engineer", slug: "platform-operations-engineer" },
      { label: "Kubernetes Engineer", slug: "kubernetes-engineer" },
      { label: "Docker Engineer", slug: "docker-engineer" },
      { label: "Systems Administrator", slug: "systems-administrator" },
      { label: "Network Engineer", slug: "network-engineer" },
      { label: "Network Administrator", slug: "network-administrator" },
      { label: "IT Administrator", slug: "it-administrator" },
      { label: "Build Engineer", slug: "build-engineer" },
      { label: "Release Engineer", slug: "release-engineer" },
      { label: "Integration Engineer", slug: "integration-engineer" },
    ],
  },
  {
    name: "AI, ML & Data",
    emoji: "🤖",
    roles: [
      { label: "Data Scientist", slug: "data-scientist" },
      { label: "Data Analyst", slug: "data-analyst" },
      { label: "Data Engineer", slug: "data-engineer" },
      { label: "Machine Learning Engineer", slug: "machine-learning-engineer" },
      { label: "AI Engineer", slug: "ai-engineer" },
      { label: "Generative AI Engineer", slug: "generative-ai-engineer" },
      { label: "AI Research Engineer", slug: "ai-research-engineer" },
      { label: "AI Prompt Engineer", slug: "ai-prompt-engineer" },
      { label: "MLOps Engineer", slug: "mlops-engineer" },
      { label: "Analytics Engineer", slug: "analytics-engineer" },
      { label: "Business Intelligence Analyst", slug: "business-intelligence-analyst" },
      { label: "Data Architect", slug: "data-architect" },
      { label: "Big Data Engineer", slug: "big-data-engineer" },
      { label: "ETL Developer", slug: "etl-developer" },
      { label: "Hadoop Engineer", slug: "hadoop-engineer" },
      { label: "Spark Developer", slug: "spark-developer" },
      { label: "NLP Engineer", slug: "nlp-engineer" },
      { label: "Computer Vision Engineer", slug: "computer-vision-engineer" },
      { label: "Deep Learning Engineer", slug: "deep-learning-engineer" },
    ],
  },
  {
    name: "Cybersecurity",
    emoji: "🔐",
    roles: [
      { label: "Cybersecurity Engineer", slug: "cybersecurity-engineer" },
      { label: "Security Analyst", slug: "security-analyst" },
      { label: "Security Architect", slug: "security-architect" },
      { label: "Penetration Tester", slug: "penetration-tester" },
      { label: "Ethical Hacker", slug: "ethical-hacker" },
      { label: "Application Security Engineer", slug: "application-security-engineer" },
      { label: "Cloud Security Engineer", slug: "cloud-security-engineer" },
      { label: "Network Security Engineer", slug: "network-security-engineer" },
      { label: "Information Security Analyst", slug: "information-security-analyst" },
      { label: "IAM Engineer", slug: "iam-engineer" },
      { label: "Security Operations Engineer", slug: "security-operations-engineer" },
    ],
  },
  {
    name: "Product, Business & Management",
    emoji: "📊",
    roles: [
      { label: "Product Manager", slug: "product-manager" },
      { label: "Technical Product Manager", slug: "technical-product-manager" },
      { label: "AI Product Manager", slug: "ai-product-manager" },
      { label: "Program Manager", slug: "program-manager" },
      { label: "Project Manager", slug: "project-manager" },
      { label: "Business Analyst", slug: "business-analyst" },
      { label: "Technical Analyst", slug: "technical-analyst" },
      { label: "Operations Manager", slug: "operations-manager" },
      { label: "Strategy Analyst", slug: "strategy-analyst" },
      { label: "Growth Manager", slug: "growth-manager" },
    ],
  },
  {
    name: "Design & UX",
    emoji: "🎨",
    roles: [
      { label: "UX Designer", slug: "ux-designer" },
      { label: "UI Designer", slug: "ui-designer" },
      { label: "Product Designer", slug: "product-designer" },
      { label: "UX Researcher", slug: "ux-researcher" },
      { label: "Interaction Designer", slug: "interaction-designer" },
      { label: "Visual Designer", slug: "visual-designer" },
      { label: "Motion Designer", slug: "motion-designer" },
      { label: "Graphic Designer", slug: "graphic-designer" },
    ],
  },
  {
    name: "Architecture & Advanced Engineering",
    emoji: "🏗️",
    roles: [
      { label: "Solutions Architect", slug: "solutions-architect" },
      { label: "Enterprise Architect", slug: "enterprise-architect" },
      { label: "Technical Architect", slug: "technical-architect" },
      { label: "Cloud Solutions Architect", slug: "cloud-solutions-architect" },
      { label: "Software Architect", slug: "software-architect" },
      { label: "Data Architect", slug: "data-architect" },
    ],
  },
  {
    name: "Database & Data Systems",
    emoji: "🗄️",
    roles: [
      { label: "Database Administrator (DBA)", slug: "database-administrator" },
      { label: "Database Engineer", slug: "database-engineer" },
      { label: "Data Warehouse Engineer", slug: "data-warehouse-engineer" },
      { label: "Data Platform Engineer", slug: "data-platform-engineer" },
    ],
  },
  {
    name: "QA & Testing",
    emoji: "🧪",
    roles: [
      { label: "QA Engineer", slug: "qa-engineer" },
      { label: "Test Engineer", slug: "test-engineer" },
      { label: "Test Automation Engineer", slug: "test-automation-engineer" },
      { label: "Performance Engineer", slug: "performance-engineer" },
      { label: "QA Analyst", slug: "qa-analyst" },
    ],
  },
  {
    name: "Blockchain & Web3",
    emoji: "🔗",
    roles: [
      { label: "Blockchain Developer", slug: "blockchain-developer" },
      { label: "Web3 Engineer", slug: "web3-engineer" },
      { label: "Smart Contract Developer", slug: "smart-contract-developer" },
      { label: "Crypto Engineer", slug: "crypto-engineer" },
    ],
  },
  {
    name: "AR/VR, Gaming & Emerging Tech",
    emoji: "🕶️",
    roles: [
      { label: "AR Developer", slug: "ar-developer" },
      { label: "VR Developer", slug: "vr-developer" },
      { label: "AR/VR Engineer", slug: "ar-vr-engineer" },
      { label: "Game Developer", slug: "game-developer" },
      { label: "Game Designer", slug: "game-designer" },
      { label: "Metaverse Developer", slug: "metaverse-developer" },
    ],
  },
  {
    name: "Hardware, IoT & Robotics",
    emoji: "🤖",
    roles: [
      { label: "Robotics Engineer", slug: "robotics-engineer" },
      { label: "Embedded Systems Engineer", slug: "embedded-systems-engineer" },
      { label: "Firmware Engineer", slug: "firmware-engineer" },
      { label: "IoT Engineer", slug: "iot-engineer" },
      { label: "Hardware Engineer", slug: "hardware-engineer" },
      { label: "Electronics Engineer", slug: "electronics-engineer" },
    ],
  },
  {
    name: "Support & IT Operations",
    emoji: "🛠️",
    roles: [
      { label: "Support Engineer", slug: "support-engineer" },
      { label: "Technical Support Engineer", slug: "technical-support-engineer" },
      { label: "IT Support Specialist", slug: "it-support-specialist" },
      { label: "Helpdesk Engineer", slug: "helpdesk-engineer" },
      { label: "Systems Support Engineer", slug: "systems-support-engineer" },
    ],
  },
  {
    name: "Marketing & Growth",
    emoji: "📈",
    roles: [
      { label: "Digital Marketing Manager", slug: "digital-marketing-manager" },
      { label: "Performance Marketing Manager", slug: "performance-marketing-manager" },
      { label: "SEO Specialist", slug: "seo-specialist" },
      { label: "Growth Hacker", slug: "growth-hacker" },
      { label: "Marketing Analyst", slug: "marketing-analyst" },
    ],
  },
  {
    name: "Emerging & Misc Roles",
    emoji: "🧠",
    roles: [
      { label: "Prompt Engineer", slug: "prompt-engineer" },
      { label: "Automation Engineer", slug: "automation-engineer" },
      { label: "RPA Developer", slug: "rpa-developer" },
      { label: "Low-Code Developer", slug: "low-code-developer" },
      { label: "No-Code Developer", slug: "no-code-developer" },
    ],
  },
];

/** Flat list of all roles for sitemap + lookup */
export const ALL_ROLES = ROLE_CATEGORIES.flatMap((c) => c.roles);
