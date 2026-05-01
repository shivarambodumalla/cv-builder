export interface RoleExampleData {
  keywords: string[];
  sampleBullets: string[];
  commonMistakes: string[];
  advice: string;
  bestTemplates: { name: string; categorySlug: string; leafSlug: string }[];
}

const ROLE_EXAMPLES: Record<string, RoleExampleData> = {
  "software-engineer": {
    keywords: [
      "REST API",
      "microservices",
      "CI/CD",
      "unit testing",
      "code review",
      "system design",
      "Agile",
      "cloud infrastructure",
      "performance optimisation",
      "distributed systems",
    ],
    sampleBullets: [
      "Redesigned authentication service handling 8M daily active users, reducing p99 latency from 340ms to 47ms through connection pooling and caching layer",
      "Led migration of monolithic billing module to event-driven microservices, reducing deployment cycle from 2 weeks to 4 hours and eliminating 3 critical production incidents per quarter",
      "Built internal CI/CD pipeline handling 200+ daily deployments with zero-downtime rollouts, cutting engineer build-wait time by 65%",
    ],
    commonMistakes: [
      "Listing technologies without context — \"Used React, Python, AWS\" says nothing; show what you built with them",
      "Weak bullet openings — \"Responsible for\" or \"Worked on\" instead of strong action verbs (Built, Redesigned, Led, Reduced)",
      "Missing scale — always include user counts, request volume, team size, or business impact where possible",
    ],
    advice:
      "Software engineering resumes succeed or fail on specificity. Every bullet needs: an action verb, what you built/changed, and a measurable result. \"Improved performance\" tells nothing. \"Reduced API latency from 340ms to 47ms for 8M daily users\" tells everything. Use CVEdge's AI rewriter to force metric-led structure on every bullet.",
    bestTemplates: [
      { name: "Classic", categorySlug: "software-engineer", leafSlug: "classic-cv" },
      { name: "Sharp", categorySlug: "software-engineer", leafSlug: "sharp-cv" },
      { name: "Executive", categorySlug: "software-engineer", leafSlug: "executive-cv" },
    ],
  },
  "full-stack-developer": {
    keywords: [
      "React",
      "Node.js",
      "PostgreSQL",
      "REST API",
      "TypeScript",
      "Docker",
      "CI/CD",
      "GraphQL",
      "Redis",
      "cloud deployment",
    ],
    sampleBullets: [
      "Architected and shipped full-stack SaaS product from zero to 15,000 monthly active users in 8 months using Next.js, Node.js, and PostgreSQL on AWS",
      "Reduced page load time by 60% by implementing server-side rendering, image optimisation, and React lazy-loading across e-commerce platform serving 2M monthly visitors",
      "Built real-time collaboration feature using WebSockets and Redis Pub/Sub, enabling 500 concurrent users to edit documents simultaneously with sub-100ms sync latency",
    ],
    commonMistakes: [
      "Listing every framework you've touched — prioritise the 6–8 most relevant to the specific role's stack",
      "Omitting frontend–backend split — show what percentage of your work is each and which you prefer",
      "No deployment story — include cloud platforms and infrastructure experience explicitly",
    ],
    advice:
      "Full-stack roles span a wide range: some want T-shaped engineers who lead in one area, others want genuine 50/50 split. Read the JD carefully and weight your bullets to match. Lead with your strongest side, then show breadth.",
    bestTemplates: [
      { name: "Classic", categorySlug: "software-engineer", leafSlug: "classic-cv" },
      { name: "Horizon", categorySlug: "software-engineer", leafSlug: "two-column-cv" },
      { name: "Sharp", categorySlug: "software-engineer", leafSlug: "sharp-cv" },
    ],
  },
  "data-scientist": {
    keywords: [
      "Python",
      "machine learning",
      "statistical modelling",
      "A/B testing",
      "SQL",
      "scikit-learn",
      "pandas",
      "model deployment",
      "feature engineering",
      "experiment design",
    ],
    sampleBullets: [
      "Built churn prediction model using gradient boosting achieving 87% precision at 15% recall threshold, reducing monthly churn spend by $420K through targeted retention campaigns",
      "Designed A/B testing framework handling 50+ concurrent experiments across 12M user base, cutting experiment cycle from 3 weeks to 9 days while maintaining 95% statistical power",
      "Developed real-time fraud scoring pipeline processing 4M transactions/day with <50ms inference latency, reducing false positives by 34% vs rule-based predecessor",
    ],
    commonMistakes: [
      "Showing models without business impact — every ML project should end with \"which resulted in [business outcome]\"",
      "Listing tools without depth (\"familiar with TensorFlow\") — show specific problem types you solved",
      "Omitting model performance metrics — AUC, precision, recall, or business KPI improvement must appear",
    ],
    advice:
      "Data scientists are hired to solve business problems, not to demonstrate Python fluency. Frame every project as: problem → approach → model performance → business impact. The business impact number is the one that gets you to interview.",
    bestTemplates: [
      { name: "Classic", categorySlug: "software-engineer", leafSlug: "classic-cv" },
      { name: "Horizon", categorySlug: "software-engineer", leafSlug: "two-column-cv" },
      { name: "Executive", categorySlug: "experienced", leafSlug: "executive-cv" },
    ],
  },
  "product-manager": {
    keywords: [
      "product roadmap",
      "stakeholder management",
      "user research",
      "A/B testing",
      "OKRs",
      "cross-functional leadership",
      "prioritisation",
      "go-to-market",
      "product strategy",
      "metrics-driven",
    ],
    sampleBullets: [
      "Led 0→1 launch of enterprise analytics dashboard, coordinating 3 engineering squads and 2 design teams across 18 months; product reached $4.2M ARR within 6 months of GA",
      "Owned mobile app checkout redesign through discovery, definition, delivery, and measurement — drove conversion rate from 2.1% to 3.8% ($6.7M annualised revenue increase)",
      "Introduced continuous discovery programme with weekly user research cadence; insight-driven prioritisation increased sprint delivery confidence from 62% to 89% across 4 teams",
    ],
    commonMistakes: [
      "Writing feature lists instead of outcomes — nobody cares what you shipped; they care about the impact",
      "Vague ownership language — \"involved in\" or \"contributed to\" instead of \"owned\", \"led\", \"decided\"",
      "No quantification of scale — always include number of users, team size, revenue, or metric improvement",
    ],
    advice:
      "Product management resumes are about decision ownership and measurable outcomes. Every bullet needs a clear decision you made and a result you drove. \"Worked with engineering to ship feature X\" is weak. \"Prioritised X over Y based on user research; feature drove 18% increase in day-7 retention\" is strong.",
    bestTemplates: [
      { name: "Aurora", categorySlug: "marketing", leafSlug: "aurora-cv" },
      { name: "Classic", categorySlug: "software-engineer", leafSlug: "classic-cv" },
      { name: "Executive", categorySlug: "experienced", leafSlug: "executive-cv" },
    ],
  },
  "ux-designer": {
    keywords: [
      "user research",
      "wireframing",
      "prototyping",
      "Figma",
      "usability testing",
      "design system",
      "information architecture",
      "interaction design",
      "accessibility",
      "design thinking",
    ],
    sampleBullets: [
      "Led end-to-end redesign of onboarding flow based on 24 user interviews and 6 usability test rounds; reduced time-to-value from 14 days to 4 days and lifted 30-day retention by 22%",
      "Designed and documented design system covering 180+ components used across 6 product squads, reducing design-to-handoff time by 40% and cutting UI inconsistency bug rate by 60%",
      "Ran discovery sprint for B2B dashboard feature involving 12 enterprise customer interviews; research directly prevented shipping a $200K development investment based on incorrect assumption",
    ],
    commonMistakes: [
      "Showing outputs not outcomes — \"Designed 20 screens\" is irrelevant; \"Reduced task completion time by 35%\" is what hiring managers want",
      "Missing process — include how you worked (research methods, testing approach) not just what you designed",
      "Not including portfolio link — every UX designer application needs a portfolio URL in the header",
    ],
    advice:
      "UX resumes need to show both craft (what you made) and method (how you worked). Include a portfolio link in your header — no portfolio, no interview at most product companies. Make sure every bullet mentions both the design decision AND the measurable outcome.",
    bestTemplates: [
      { name: "Aurora", categorySlug: "creative", leafSlug: "aurora-cv" },
      { name: "Coastal", categorySlug: "creative", leafSlug: "coastal-cv" },
      { name: "Portrait", categorySlug: "creative", leafSlug: "portrait-cv" },
    ],
  },
  "data-analyst": {
    keywords: [
      "SQL",
      "Python",
      "Tableau",
      "Power BI",
      "data visualisation",
      "A/B testing",
      "Excel",
      "statistical analysis",
      "dashboards",
      "data storytelling",
    ],
    sampleBullets: [
      "Built executive revenue dashboard in Tableau consolidating 8 data sources; reduced weekly reporting cycle from 3 days to 4 hours and became primary board reporting tool within 2 months",
      "Analysed user funnel data across 2.3M sessions to identify checkout abandonment patterns; recommendations implemented by product team drove 12% conversion improvement ($1.8M annual revenue)",
      "Automated monthly reconciliation process using Python, replacing 40-hour manual process with 2-hour automated pipeline while reducing error rate from 4% to 0.1%",
    ],
    commonMistakes: [
      "Tool-first framing — lead with the business problem, not the technology (\"To solve X, I used SQL\" not \"Used SQL to...\")",
      "No audience context — specify who used your analysis (leadership, product team, operations) and what decision it enabled",
      "Missing impact — every analysis must end with what changed as a result",
    ],
    advice:
      "Data analysts are hired to drive decisions, not generate reports. Show that your analysis changed something: a product decision, a business process, a strategy. The best bullet formula: problem → analysis approach → insight → decision it enabled → business outcome.",
    bestTemplates: [
      { name: "Classic", categorySlug: "software-engineer", leafSlug: "classic-cv" },
      { name: "Clean Sidebar", categorySlug: "marketing", leafSlug: "clean-sidebar-cv" },
      { name: "Ledger", categorySlug: "experienced", leafSlug: "ledger-cv" },
    ],
  },
  "devops-engineer": {
    keywords: [
      "Kubernetes",
      "Docker",
      "CI/CD",
      "Terraform",
      "AWS",
      "GCP",
      "infrastructure as code",
      "monitoring",
      "incident management",
      "automation",
    ],
    sampleBullets: [
      "Migrated 40+ microservices from EC2 to Kubernetes (EKS), reducing infrastructure cost by $380K/year and cutting deployment time from 45 minutes to 8 minutes",
      "Built GitOps deployment pipeline using Argo CD and Terraform for 120-engineer org; reduced configuration drift incidents by 90% and achieved SOC 2 infrastructure compliance in 6 months",
      "Designed on-call alerting system with PagerDuty integration and runbook automation; reduced mean time to resolution from 47 minutes to 11 minutes and cut P1 incidents by 60%",
    ],
    commonMistakes: [
      "Listing tools without scale — always include team size, service count, or infrastructure scope",
      "No reliability metrics — include uptime, MTTR, incident reduction, or deployment frequency improvements",
      "Missing security/compliance — regulated industry DevOps roles require explicit security posture evidence",
    ],
    advice:
      "DevOps resumes are about reliability and speed. Show how you improved deployment frequency, reduced downtime, or automated toil. Include cost savings where you have them — cloud cost optimisation is a universal win that hiring managers remember.",
    bestTemplates: [
      { name: "Classic", categorySlug: "software-engineer", leafSlug: "classic-cv" },
      { name: "Horizon", categorySlug: "software-engineer", leafSlug: "two-column-cv" },
      { name: "Sharp", categorySlug: "software-engineer", leafSlug: "sharp-cv" },
    ],
  },
  "machine-learning-engineer": {
    keywords: [
      "PyTorch",
      "TensorFlow",
      "model training",
      "MLOps",
      "feature store",
      "model serving",
      "distributed training",
      "CUDA",
      "LLMs",
      "inference optimisation",
    ],
    sampleBullets: [
      "Built and deployed recommendation system using collaborative filtering and transformer-based embeddings, improving click-through rate by 31% and increasing session depth by 2.4 pages on average",
      "Reduced LLM inference latency by 4× through quantisation (FP16), dynamic batching, and ONNX runtime optimisation, enabling real-time use case at $0.003/request cost",
      "Designed feature store architecture for 200+ real-time features serving 15 ML models in production; reduced feature engineering duplication by 70% across 8 teams",
    ],
    commonMistakes: [
      "Research-mode bullets in an engineering context — focus on production deployment and scale, not just model accuracy",
      "Missing MLOps evidence — show how you train, version, monitor, and retrain models in production",
      "No latency/throughput numbers — ML engineering roles care as much about serving performance as model quality",
    ],
    advice:
      "ML engineering roles differ from data science roles in one key way: production. Every bullet should reference deployed systems, serving infrastructure, or production performance. If your work never shipped to production, frame it in terms of what production readiness work you did.",
    bestTemplates: [
      { name: "Classic", categorySlug: "software-engineer", leafSlug: "classic-cv" },
      { name: "Executive", categorySlug: "software-engineer", leafSlug: "executive-cv" },
      { name: "Horizon", categorySlug: "software-engineer", leafSlug: "two-column-cv" },
    ],
  },
  "frontend-developer": {
    keywords: [
      "React",
      "TypeScript",
      "CSS",
      "Web performance",
      "accessibility",
      "design system",
      "Next.js",
      "testing",
      "responsive design",
      "Core Web Vitals",
    ],
    sampleBullets: [
      "Led performance overhaul of React e-commerce platform: improved LCP from 4.2s to 1.1s and CLS from 0.31 to 0.02 through code splitting, image optimisation, and skeleton screens — conversion rate increased 18%",
      "Built accessible component library (WCAG 2.1 AA) covering 80 components used by 5 product teams, reducing UI inconsistency bugs by 55% and cutting design-to-production time by 30%",
      "Implemented micro-frontend architecture enabling 4 independent teams to deploy independently; reduced inter-team blocking from 8 hours/sprint to under 30 minutes",
    ],
    commonMistakes: [
      "Framework name-dropping without context — \"Know React\" vs \"Built checkout flow in React handling 500K monthly transactions\"",
      "No performance metrics — frontend roles increasingly require Core Web Vitals awareness",
      "Missing accessibility — most modern frontend roles require explicit accessibility evidence",
    ],
    advice:
      "Frontend roles increasingly blend engineering rigour with product sensibility. Show performance numbers (LCP, FCP, bundle size), accessibility work (WCAG compliance), and user-facing impact (conversion, engagement). The best frontend engineers can articulate why their technical decisions improved user outcomes.",
    bestTemplates: [
      { name: "Classic", categorySlug: "software-engineer", leafSlug: "classic-cv" },
      { name: "Sharp", categorySlug: "software-engineer", leafSlug: "sharp-cv" },
      { name: "Aurora", categorySlug: "creative", leafSlug: "aurora-cv" },
    ],
  },
  "backend-developer": {
    keywords: [
      "API design",
      "microservices",
      "PostgreSQL",
      "Redis",
      "message queues",
      "authentication",
      "performance tuning",
      "scalability",
      "cloud",
      "security",
    ],
    sampleBullets: [
      "Designed payment processing API handling $40M daily transaction volume with 99.99% uptime over 18 months, including idempotency, retry logic, and PCI-DSS compliant architecture",
      "Optimised critical query paths in PostgreSQL serving 5M requests/day: added composite indexes and query result caching, reducing average response time from 820ms to 65ms",
      "Built async job processing system using Redis queues handling 2M background jobs daily with zero data loss and automatic retry on transient failures",
    ],
    commonMistakes: [
      "No scale context — \"Built API\" tells nothing; \"Built API handling 40M daily transactions\" tells everything",
      "Missing reliability story — uptime, error rates, and resilience patterns are backend credibility markers",
      "Avoiding security/compliance — especially for fintech, healthcare, or regulated industry roles",
    ],
    advice:
      "Backend roles care about correctness, reliability, and scale above all else. Every major achievement should include request volume or data size, uptime/SLA context if relevant, and the business impact. Use action verbs that imply technical depth: Designed, Architected, Optimised, Hardened.",
    bestTemplates: [
      { name: "Classic", categorySlug: "software-engineer", leafSlug: "classic-cv" },
      { name: "Executive", categorySlug: "software-engineer", leafSlug: "executive-cv" },
      { name: "Minimal", categorySlug: "software-engineer", leafSlug: "minimal-cv" },
    ],
  },
  "cloud-engineer": {
    keywords: [
      "AWS",
      "GCP",
      "Azure",
      "Terraform",
      "infrastructure as code",
      "Kubernetes",
      "cost optimisation",
      "security",
      "networking",
      "FinOps",
    ],
    sampleBullets: [
      "Architected multi-region AWS infrastructure for fintech platform serving 3M users: 99.995% uptime over 24 months with automated failover under 45 seconds RTO",
      "Implemented FinOps programme using AWS Cost Explorer and custom Terraform tagging; identified and eliminated $580K/year in unused resources across 3 business units",
      "Built zero-trust network architecture with VPC segmentation, IAM policies, and WAF rules across 8 AWS accounts; achieved SOC 2 Type II certification within 9 months",
    ],
    commonMistakes: [
      "Generic cloud tool lists — show which cloud, which services, and at what scale",
      "Missing cost awareness — cloud engineers are expected to understand FinOps; include cost saving examples",
      "No security posture evidence — compliance certifications and security architecture show you take it seriously",
    ],
    advice:
      "Cloud engineering resumes need three dimensions: scale (how many users, services, or data volume), reliability (uptime, RTO, failover), and cost (savings achieved or infrastructure efficiency). Show all three and you'll stand out from candidates who only show technical breadth.",
    bestTemplates: [
      { name: "Classic", categorySlug: "software-engineer", leafSlug: "classic-cv" },
      { name: "Horizon", categorySlug: "software-engineer", leafSlug: "two-column-cv" },
      { name: "Sharp", categorySlug: "software-engineer", leafSlug: "sharp-cv" },
    ],
  },
  "cybersecurity-engineer": {
    keywords: [
      "penetration testing",
      "SIEM",
      "threat detection",
      "incident response",
      "SOC 2",
      "ISO 27001",
      "vulnerability management",
      "zero trust",
      "MITRE ATT&CK",
      "cloud security",
    ],
    sampleBullets: [
      "Led ISO 27001 certification programme across 400-person company: identified and remediated 47 critical controls over 6 months, achieving first-time audit pass with zero major findings",
      "Built SIEM detection rules in Splunk covering MITRE ATT&CK T1055–T1190 attack vectors; reduced mean time to detect from 6.2 hours to 22 minutes across 1,200 monitored endpoints",
      "Conducted red team exercise against critical financial infrastructure: discovered 3 critical RCE vulnerabilities in external-facing services; all remediated before external report delivery",
    ],
    commonMistakes: [
      "Generic security language — \"security experience\" without specifics on attack surface, frameworks, or tooling",
      "Missing compliance context — for enterprise roles, specify which standards (SOC 2, ISO 27001, HIPAA, PCI-DSS) you've worked against",
      "No metrics — security improvements need quantification: detection time, false positive rates, vulnerabilities found",
    ],
    advice:
      "Cybersecurity resumes succeed with specificity and evidence. Hiring managers want to know: what attack surface did you defend, what was your detection/response capability improvement, and what compliance frameworks did you satisfy? Vague security experience is a red flag, not a green one.",
    bestTemplates: [
      { name: "Classic", categorySlug: "software-engineer", leafSlug: "classic-cv" },
      { name: "Executive", categorySlug: "experienced", leafSlug: "executive-cv" },
      { name: "Harvard", categorySlug: "ats-friendly", leafSlug: "harvard-cv" },
    ],
  },
  "ui-designer": {
    keywords: [
      "Figma",
      "design systems",
      "visual design",
      "typography",
      "colour theory",
      "component libraries",
      "responsive design",
      "brand guidelines",
      "prototyping",
      "UI patterns",
    ],
    sampleBullets: [
      "Redesigned mobile app UI from scratch using atomic design principles; new design reduced visual inconsistency bugs by 70% and cut designer-to-engineer handoff time from 3 days to 4 hours",
      "Built and maintained design system covering 120 components, 8 colour palettes, and 4 typography scales; adopted by 3 product teams within 2 months of launch",
      "Led rebrand of SaaS product covering 200+ screens: designed component-first in Figma, documented brand system, and delivered to engineering team with zero design debt",
    ],
    commonMistakes: [
      "Portfolio not linked — UI designers without a portfolio link in the header rarely progress",
      "Outputs without impact — \"Redesigned 50 screens\" vs \"Redesigned 50 screens; reduced bounce rate by 28%\"",
      "No process mentioned — include your design process briefly (exploration, iteration, review, handoff)",
    ],
    advice:
      "UI designers are judged on portfolio first, resume second. Make sure your portfolio link is in the header of your resume, and that every major resume bullet can be found and validated in your portfolio. The best UI design resumes are evidence of visual thinking applied to self-presentation.",
    bestTemplates: [
      { name: "Aurora", categorySlug: "creative", leafSlug: "aurora-cv" },
      { name: "Portrait", categorySlug: "creative", leafSlug: "portrait-cv" },
      { name: "Electric Lilac", categorySlug: "creative", leafSlug: "electric-lilac-cv" },
    ],
  },
  "business-analyst": {
    keywords: [
      "requirements gathering",
      "stakeholder management",
      "process mapping",
      "SQL",
      "Agile",
      "BRD",
      "user stories",
      "data analysis",
      "change management",
      "business case",
    ],
    sampleBullets: [
      "Led requirements definition for £2.4M ERP migration: facilitated 30+ stakeholder workshops, documented 180 user stories, and reduced scope creep by 45% versus comparable previous project",
      "Analysed customer journey data across 4 touchpoints to identify £600K annual cost in manual rework; recommended and shepherded 3 process automations that eliminated the rework within 6 months",
      "Developed business case for real-time inventory system: modelled 3 scenarios, stress-tested assumptions with finance team, secured board approval for £800K investment",
    ],
    commonMistakes: [
      "Process-only bullets — \"Ran workshops\" or \"Wrote requirements\" without the business impact",
      "Missing stakeholder context — specify seniority (\"C-suite stakeholders\", \"technical teams and business sponsors\")",
      "No value evidence — always state the financial or operational outcome your analysis enabled",
    ],
    advice:
      "Business analyst resumes prove two things: you can elicit and translate complex requirements, and your analysis drives real decisions. Show the size of the projects you influenced (budget, team, scope), the quality of your analysis (fewer change requests, on-time delivery), and the business outcomes your recommendations enabled.",
    bestTemplates: [
      { name: "Classic", categorySlug: "software-engineer", leafSlug: "classic-cv" },
      { name: "Executive", categorySlug: "experienced", leafSlug: "executive-cv" },
      { name: "Harvard", categorySlug: "experienced", leafSlug: "harvard-cv" },
    ],
  },
  "solutions-architect": {
    keywords: [
      "system architecture",
      "cloud-native",
      "AWS",
      "enterprise integration",
      "scalability",
      "security architecture",
      "microservices",
      "API gateway",
      "pre-sales",
      "technical roadmap",
    ],
    sampleBullets: [
      "Designed cloud-native architecture for healthcare platform migrating from legacy on-premises system to AWS: achieved HIPAA compliance, 99.95% uptime, and $2.1M annual infrastructure cost reduction",
      "Led technical pre-sales for $4.8M enterprise integration deal: designed proof-of-concept architecture, presented to CTO and VP Engineering, winning deal over 3 competing vendors",
      "Developed enterprise API strategy for 12 business units, defining standards for security, versioning, and governance; adoption reduced integration project costs by 35% across the portfolio",
    ],
    commonMistakes: [
      "Generic architecture language — \"designed systems\" without the scale, constraints, and tradeoffs you navigated",
      "Missing business impact — architecture decisions have commercial consequences; show what your design choices enabled or saved",
      "No pre-sales evidence — for consulting/vendor SA roles, deal sizes and win rates are critical resume elements",
    ],
    advice:
      "Solutions architect resumes bridge technical depth and business value. For every architecture decision you list, include why you made it (trade-off navigated) and what it achieved (cost, reliability, speed, or business outcome). This is what separates architects from senior engineers on paper.",
    bestTemplates: [
      { name: "Executive", categorySlug: "experienced", leafSlug: "executive-cv" },
      { name: "Classic", categorySlug: "software-engineer", leafSlug: "classic-cv" },
      { name: "Horizon", categorySlug: "software-engineer", leafSlug: "two-column-cv" },
    ],
  },
  "mobile-app-developer": {
    keywords: [
      "iOS",
      "Android",
      "Swift",
      "Kotlin",
      "React Native",
      "Flutter",
      "App Store",
      "push notifications",
      "offline-first",
      "performance optimisation",
    ],
    sampleBullets: [
      "Shipped iOS app from 0 to 200,000 downloads in 4 months: built in Swift with offline-first architecture, achieving 4.7 App Store rating and featured in App Store editorial selection",
      "Optimised React Native app cold start time from 4.2s to 0.9s through lazy loading, Hermes engine migration, and JavaScript bundle splitting; DAU increased 23% following update",
      "Built cross-platform notification system serving 3.5M users across iOS and Android: personalised, timezone-aware delivery logic with 94% delivery rate and 31% open rate",
    ],
    commonMistakes: [
      "No download/user counts — app metrics (downloads, DAU, ratings) are the clearest way to show mobile impact",
      "Platform ambiguity — specify whether iOS, Android, or cross-platform, and the frameworks for each",
      "Missing App Store/Play Store context — include ratings, store rankings, or editorial picks where relevant",
    ],
    advice:
      "Mobile developer resumes live or die by app metrics. Downloads, DAU, App Store rating, crash-free rate — these are your proof of impact. If you can't share specific numbers due to NDAs, use percentages or ranges. \"50K+ downloads, 4.6-star rating\" is always better than nothing.",
    bestTemplates: [
      { name: "Classic", categorySlug: "software-engineer", leafSlug: "classic-cv" },
      { name: "Sharp", categorySlug: "software-engineer", leafSlug: "sharp-cv" },
      { name: "Horizon", categorySlug: "software-engineer", leafSlug: "two-column-cv" },
    ],
  },
  "qa-engineer": {
    keywords: [
      "test automation",
      "Selenium",
      "Cypress",
      "Playwright",
      "CI/CD",
      "test strategy",
      "regression testing",
      "performance testing",
      "API testing",
      "bug tracking",
    ],
    sampleBullets: [
      "Built Playwright E2E test suite covering 340 user flows across 6 product areas: reduced release cycle from bi-weekly to daily and cut production bug escape rate from 12% to 2%",
      "Designed API contract testing framework using Pact; caught 23 integration breaking changes in staging before they reached production over 12 months, saving estimated 160 engineering hours in hotfixes",
      "Led performance testing programme for Black Friday traffic simulation: tested against 5× normal load, identified 3 bottlenecks in payment service, all resolved before 48M-user peak event",
    ],
    commonMistakes: [
      "Manual-only testing experience at a company that needs automation — be explicit about your automation capability",
      "No bug prevention metrics — quantify how your testing reduced production incidents, not just how many tests you wrote",
      "Missing coverage and tooling specifics — \"wrote tests\" vs \"built Playwright suite with 95% critical path coverage\"",
    ],
    advice:
      "QA engineering resumes should show two things: test coverage you built (what paths, tools, and coverage percentage) and production quality improvement (bugs caught, incidents prevented, release confidence gained). Quality is measured by what didn't break, not by what was tested.",
    bestTemplates: [
      { name: "Classic", categorySlug: "software-engineer", leafSlug: "classic-cv" },
      { name: "Sharp", categorySlug: "software-engineer", leafSlug: "sharp-cv" },
      { name: "Minimal", categorySlug: "ats-friendly", leafSlug: "minimal-cv" },
    ],
  },
  "security-analyst": {
    keywords: [
      "threat intelligence",
      "SIEM",
      "SOC",
      "incident response",
      "vulnerability scanning",
      "log analysis",
      "MITRE ATT&CK",
      "endpoint detection",
      "phishing analysis",
      "compliance",
    ],
    sampleBullets: [
      "Triaged and responded to 1,200+ security incidents over 18 months as L2 SOC analyst: reduced average investigation time from 45 minutes to 11 minutes through automation and custom SIEM playbooks",
      "Identified and reported critical supply chain vulnerability in third-party auth library affecting 200,000 users; coordinated emergency patch deployment within 6 hours of discovery",
      "Ran phishing simulation programme across 3,000 employees quarterly: improved click-through rate from 24% to 6% over 12 months, reducing successful phishing incidents by 70%",
    ],
    commonMistakes: [
      "Tool lists without threat context — \"used Splunk\" vs \"wrote Splunk queries detecting lateral movement in 1,200 endpoints\"",
      "No incident volume — quantify your caseload: incidents triaged, vulnerabilities managed, or investigations led",
      "Missing outcome — every security action must end with what was prevented, remediated, or improved",
    ],
    advice:
      "Security analyst resumes prove vigilance and speed. Show your detection and response metrics, the tools you've mastered, and specific incidents or vulnerabilities you caught. The hiring manager wants to know: how fast are you, how thorough, and have you found real threats? Answer those three questions and you'll get interviews.",
    bestTemplates: [
      { name: "Classic", categorySlug: "software-engineer", leafSlug: "classic-cv" },
      { name: "Classic Serif", categorySlug: "ats-friendly", leafSlug: "classic-serif-cv" },
      { name: "Executive", categorySlug: "experienced", leafSlug: "executive-cv" },
    ],
  },
  "ai-engineer": {
    keywords: [
      "LLMs",
      "prompt engineering",
      "RAG",
      "fine-tuning",
      "LangChain",
      "vector databases",
      "model evaluation",
      "inference",
      "OpenAI API",
      "Hugging Face",
    ],
    sampleBullets: [
      "Built RAG pipeline over 50GB technical documentation corpus using LangChain, Pinecone, and GPT-4: achieved 89% answer accuracy on internal QA benchmark, reducing support ticket volume by 38%",
      "Fine-tuned Llama-3 7B on proprietary customer data for classification task: outperformed GPT-4 at 4% of inference cost, processing 2M classification requests/day at $0.0008 per request",
      "Designed LLM evaluation framework with 400+ test cases across accuracy, safety, and hallucination dimensions; framework adopted across 3 teams and caught 14 regression failures pre-deployment",
    ],
    commonMistakes: [
      "Buzzword stacking — listing every LLM framework without showing a real production use case",
      "No evaluation evidence — how did you know your model worked? Show benchmarks, evals, or A/B results",
      "Missing cost/latency — production AI engineering requires explicit cost-per-request and latency numbers",
    ],
    advice:
      "AI engineering is still a young field and many resumes consist of hype without substance. Stand out by showing production deployments with real metrics: accuracy on a defined eval set, cost per request, latency at load, and the business problem you actually solved. Evaluation rigour separates engineers from experimenters.",
    bestTemplates: [
      { name: "Classic", categorySlug: "software-engineer", leafSlug: "classic-cv" },
      { name: "Sharp", categorySlug: "software-engineer", leafSlug: "sharp-cv" },
      { name: "Executive", categorySlug: "software-engineer", leafSlug: "executive-cv" },
    ],
  },
};

export function getRoleExampleData(slug: string): RoleExampleData | null {
  return ROLE_EXAMPLES[slug] ?? null;
}

export function generateGenericExampleData(label: string): RoleExampleData {
  return {
    keywords: [
      `${label} strategy`,
      "stakeholder management",
      "cross-functional collaboration",
      "process improvement",
      "data-driven decision making",
      "project delivery",
      "team leadership",
      "performance metrics",
    ],
    sampleBullets: [
      `Led ${label.toLowerCase()} initiative from scoping to delivery, coordinating across 3 teams and delivering on time and within budget with measurable business outcome`,
      `Identified process inefficiency in core ${label.toLowerCase()} workflow; designed and implemented solution that saved 20+ hours per week across the team`,
      `Managed cross-functional project involving senior stakeholders; maintained alignment through weekly reviews and delivered key milestones 2 weeks ahead of schedule`,
    ],
    commonMistakes: [
      "Vague responsibility statements — \"responsible for X\" instead of \"led X and achieved Y\"",
      "Missing metrics — every achievement should have a number: size, percentage, time, or money",
      "No business impact context — show how your work connected to company goals or customer value",
    ],
    advice: `For ${label} roles, the most important thing on your resume is demonstrable impact. Every bullet should connect what you did to what changed as a result. Use the format: action verb + what you did + the specific result. Quantify wherever possible — size, percentage improvement, revenue, cost, or time saved.`,
    bestTemplates: [
      { name: "Classic", categorySlug: "software-engineer", leafSlug: "classic-cv" },
      { name: "Executive", categorySlug: "experienced", leafSlug: "executive-cv" },
      { name: "Sharp", categorySlug: "software-engineer", leafSlug: "sharp-cv" },
    ],
  };
}
