import type { RoleCareerPath } from "./types";

// Hand-written career paths, part 1: engineering, data, product, design and
// automation roles. Written per role; see types.ts for the rules.

export const CAREER_PATHS_PART_1: Record<string, RoleCareerPath> = {
  "software-engineer": {
    overview:
      "Software engineering in the US splits into two ladders around senior level: the individual contributor track (senior, staff, principal) and the management track (engineering manager, director). Senior is a level many engineers hold for a whole career, while staff and above are scarce and earned through influence across teams rather than more code. The other common exits run sideways into specializations that reward depth: reliability, machine learning and product.",
    moves: [
      {
        toRole: "Engineering Manager",
        moveType: "step_up",
        typicalTiming:
          "After 1-2 years at senior level, usually once you have led a project informally or onboarded new hires",
        why: "Senior engineers already break work into tickets, run design reviews and unblock teammates. Management makes that coordination the whole job and adds hiring, performance reviews and staffing decisions.",
        skillsToAdd: [
          "Structured 1:1s and written performance feedback",
          "Hiring loop design and interviewer calibration",
          "Quarterly planning and estimation across a team",
          "Incident command and postmortem facilitation",
        ],
        proof:
          "A project you led across several engineers, with the delivery outcome and the people you mentored.",
      },
      {
        toRole: "Staff Software Engineer",
        moveType: "step_up",
        typicalTiming:
          "Usually 3 or more years after reaching senior, once teams outside your own use your designs",
        why: "Staff is the IC path for engineers who already write the design docs other teams reference. The job becomes choosing technical direction and getting it adopted without formal authority.",
        skillsToAdd: [
          "Writing RFCs and design docs that get adopted",
          "Architecture decision records",
          "Planning multi-team migrations",
          "Capacity and cloud cost modeling",
        ],
        proof:
          "A technical change you proposed and drove across more than one team, with adoption and the measured result.",
      },
      {
        toRole: "Site Reliability Engineer",
        toSlug: "site-reliability-engineer",
        moveType: "lateral",
        typicalTiming:
          "Any time after 2-3 years, especially if you already volunteer for on-call and incident work",
        why: "SRE is software engineering pointed at production. Your debugging, code review and automation habits carry over directly; what's new is owning SLOs, capacity and the tooling that removes toil.",
        skillsToAdd: [
          "SLO and error budget design",
          "Prometheus and Grafana",
          "Kubernetes (Certified Kubernetes Administrator)",
          "Terraform",
          "Linux performance tools (perf, strace, eBPF basics)",
        ],
        proof:
          "Incidents you resolved and reliability work you shipped, stated with latency, availability or recovery-time numbers.",
      },
      {
        toRole: "Machine Learning Engineer",
        toSlug: "machine-learning-engineer",
        moveType: "lateral",
        typicalTiming:
          "After 2-4 years, ideally after working on a feature that consumes model output",
        why: "Most ML engineering is production software: data pipelines, serving, testing and monitoring. An engineer who already ships reliable services only has to add the modeling and evaluation layer.",
        skillsToAdd: [
          "PyTorch",
          "scikit-learn and model evaluation metrics",
          "MLflow or Weights & Biases for experiment tracking",
          "Model serving with BentoML, TorchServe or a managed cloud endpoint",
        ],
        proof:
          "A model you trained and deployed behind a real endpoint, even an internal one, with latency and quality numbers.",
      },
      {
        toRole: "Technical Product Manager",
        toSlug: "technical-product-manager",
        moveType: "pivot",
        typicalTiming:
          "After 4-6 years, usually after being the engineering voice in roadmap discussions",
        why: "Engineers who already push back on scope, write specs and talk to API consumers are doing part of a technical PM's job. The move trades ownership of code for ownership of outcomes.",
        skillsToAdd: [
          "Customer discovery interviews",
          "Writing PRDs with success metrics",
          "Product analytics in Amplitude or Mixpanel",
          "Prioritization frameworks such as RICE",
        ],
        proof:
          "A feature where you shaped the scope or the decision to build it, with the user or business metric that moved.",
      },
    ],
    faqs: [
      {
        question: "Can you stay a software engineer for your whole career?",
        answer:
          "Yes. At many companies senior is a terminal level, meaning nobody expects you to move past it, and plenty of engineers stay there for decades. The risk is stagnation rather than the title: a senior engineer who stops changing domains or stacks gets harder to hire each year.",
      },
      {
        question: "Should I become an engineering manager or aim for staff engineer?",
        answer:
          "Choose management if you get energy from other people's progress and can accept writing little code for years. Choose staff if you want to stay technical and are good at persuading teams you don't control. Many companies let managers return to the IC track, so trying management is less of a one-way door than it looks.",
      },
      {
        question: "Which specializations are easiest to move into from general software engineering?",
        answer:
          "The shortest moves are next to work you already touch: backend engineers into platform or SRE, frontend engineers into design systems or mobile, anyone building data-heavy features into data engineering. Security and machine learning take longer because they add a body of knowledge, not just a set of tools.",
      },
      {
        question: "Is it too late to switch programming languages after years in one stack?",
        answer:
          "No. Mid and senior hiring tests design judgment and debugging far more than syntax, and most interviewers accept a new language if you can explain its trade-offs. Ship one real project in the target stack first so your resume has something concrete to point at.",
      },
    ],
  },

  "frontend-developer": {
    overview:
      "Frontend careers branch earlier than most engineering tracks. By mid-level you are usually choosing between going deeper on the web platform, widening into full stack, or moving toward mobile or design. The senior frontend ceiling is real at smaller companies, where there may be no staff-level frontend role, so the strongest frontend engineers often grow by owning something other teams build on.",
    moves: [
      {
        toRole: "Staff Frontend Engineer",
        moveType: "step_up",
        typicalTiming:
          "After 5-7 years, usually after leading a framework migration or a shared component library",
        why: "The staff frontend role owns the decisions every product team inherits: build tooling, rendering strategy, shared components and performance budgets. Senior frontend engineers who already set those standards for one team are doing a smaller version of it.",
        skillsToAdd: [
          "Monorepo tooling (Nx or Turborepo)",
          "Performance budgets enforced in CI with Lighthouse CI",
          "Rendering strategy trade-offs (SSR, streaming, static generation)",
          "Architecture decision records",
        ],
        proof:
          "A frontend standard or shared library adopted by several teams, with the change in build time, bundle size or Core Web Vitals.",
      },
      {
        toRole: "Full Stack Developer",
        toSlug: "full-stack-developer",
        moveType: "lateral",
        typicalTiming:
          "After 2-3 years, once you regularly read and change the API code your UI calls",
        why: "You already own the contract between the UI and the API from one side. Adding schema design and server logic lets you ship a feature without a hand-off, which product teams value highly.",
        skillsToAdd: [
          "Node.js with Express or Fastify",
          "PostgreSQL schema design and query tuning",
          "Authentication flows (OAuth, sessions, JWT)",
          "Next.js server components or route handlers",
          "Docker basics for deployment",
        ],
        proof:
          "A feature you built across UI, API and database, even in a side project, with a live link.",
      },
      {
        toRole: "Mobile App Developer",
        toSlug: "mobile-app-developer",
        moveType: "lateral",
        typicalTiming: "Any time after 2 years of production React work",
        why: "React Native reuses your component model, state management and TypeScript. The real gap is platform behavior: navigation stacks, offline state, push notifications and app store releases.",
        skillsToAdd: [
          "React Native with Expo",
          "iOS and Android build signing and release",
          "Offline storage (SQLite or MMKV)",
          "Mobile end-to-end testing with Detox or Maestro",
        ],
        proof:
          "An app published to TestFlight or Google Play, even a small one, with the source linked.",
      },
      {
        toRole: "Product Designer",
        toSlug: "product-designer",
        moveType: "pivot",
        typicalTiming:
          "After 3-5 years, usually after pairing closely with designers on a component library",
        why: "Frontend developers who care about spacing, states and interaction detail already make many design decisions in code. Product design adds research and the reasoning behind what to build, not only how it looks.",
        skillsToAdd: [
          "Figma, including auto layout, components and variables",
          "Usability testing and interview synthesis",
          "Interaction design for empty, error and loading states",
          "A portfolio of 2-3 written case studies",
        ],
        proof:
          "Shipped UI where you shaped the design, not only the build, written up with the problem, the options you considered and the outcome.",
      },
    ],
    faqs: [
      {
        question: "Is frontend development a dead-end career?",
        answer:
          "No, but the ceiling depends on the company. Companies where the interface is the product have staff and principal frontend roles; smaller ones often don't, and frontend engineers there grow by taking on backend, platform or design system ownership. If you want to stay purely frontend, target companies where UI quality is a competitive advantage.",
      },
      {
        question: "Will AI coding tools replace frontend developers?",
        answer:
          "They are best at the part of frontend work that was already easiest: turning a clear design into markup. The parts that stay hard are performance on slow devices, accessibility, state that survives edge cases, and designing component APIs other engineers can use. Put your learning, and your resume, there.",
      },
      {
        question: "Does a frontend developer need backend skills to get promoted?",
        answer:
          "Enough to read and change the API your UI depends on, yes. You don't need to become a backend engineer, but a senior frontend engineer who can't reason about caching, pagination or auth on the server ends up blocked on hand-offs. That shows in promotion discussions.",
      },
    ],
  },

  "backend-developer": {
    overview:
      "Backend is the most direct route to the senior IC levels in software, because the work (data models, service boundaries, failure handling) is what staff and architect roles are built on. After mid-level, backend developers tend to go deeper into distributed systems and architecture, sideways into infrastructure or data, or into management. The infrastructure and data moves are usually the easiest to make without changing employers.",
    moves: [
      {
        toRole: "Software Architect",
        toSlug: "software-architect",
        moveType: "step_up",
        typicalTiming:
          "After 7 or more years, once you have designed systems that other teams build on",
        why: "Architects make the calls backend seniors already argue about in design reviews: service boundaries, data ownership and consistency trade-offs. The difference is scope, and the writing that makes a decision stick across teams.",
        skillsToAdd: [
          "Domain-driven design (bounded contexts, context mapping)",
          "Event-driven architecture with Apache Kafka",
          "C4 diagrams and architecture decision records",
          "AWS Certified Solutions Architect Professional",
        ],
        proof:
          "A multi-service design you led, with the constraints you worked under and how it held up in production.",
      },
      {
        toRole: "Platform Engineer",
        toSlug: "platform-engineer",
        moveType: "lateral",
        typicalTiming:
          "After 3-5 years, particularly if you already maintain your team's service template or CI setup",
        why: "Backend developers tired of rebuilding deployment, logging and service scaffolding for every project are the natural builders of an internal platform. You already know what application teams need from it because you are one.",
        skillsToAdd: [
          "Kubernetes and Helm",
          "Terraform",
          "Backstage or another internal developer portal",
          "OpenTelemetry",
        ],
        proof:
          "Tooling or infrastructure other engineers adopted, with a lead-time or onboarding-time improvement.",
      },
      {
        toRole: "Data Engineer",
        toSlug: "data-engineer",
        moveType: "lateral",
        typicalTiming:
          "After 2-4 years, especially if you have owned batch jobs, event consumers or reporting tables",
        why: "Backend work already includes schema design, SQL tuning and queue consumers, which is much of what a pipeline is. The new parts are the warehouse, the orchestrator, and thinking in freshness, backfills and late data.",
        skillsToAdd: [
          "Apache Airflow or Dagster",
          "dbt",
          "Snowflake or BigQuery",
          "Dimensional modeling (Kimball)",
        ],
        proof:
          "A job, stream or export that other teams relied on for data, with volume and freshness numbers.",
      },
      {
        toRole: "Engineering Manager",
        moveType: "step_up",
        typicalTiming:
          "After 1-2 years at senior, typically after running an on-call rotation or leading a migration",
        why: "Services have dependencies, so backend leads already coordinate across teams, run incident reviews and sequence migrations. That is the delivery half of management; the people half is what you add.",
        skillsToAdd: [
          "1:1s and written feedback",
          "Hiring and interviewer calibration",
          "Quarterly planning and staffing",
          "Stakeholder updates for product and support leads",
        ],
        proof:
          "A cross-team project you coordinated, naming the engineers you led and the delivery outcome.",
      },
      {
        toRole: "Solutions Architect",
        toSlug: "solutions-architect",
        moveType: "pivot",
        typicalTiming:
          "After 5 or more years, if you enjoy explaining systems to customers as much as building them",
        why: "Customer-facing architects design integrations against APIs all day. A backend developer already understands auth, rate limits, webhooks and data models from the side that built them.",
        skillsToAdd: [
          "AWS Certified Solutions Architect Associate",
          "Technical discovery and requirements gathering",
          "Writing reference architectures and integration guides",
          "Building proofs of concept against customer data",
        ],
        proof:
          "Integration or API work where you dealt directly with partners or customers, and the adoption that followed.",
      },
    ],
    faqs: [
      {
        question: "Is backend development a good long-term career?",
        answer:
          "Yes, and it ages well. Frameworks change, but data modeling, concurrency and failure handling stay relevant, and those are what senior backend interviews test. The main risk is spending so long on one internal system that you can't discuss trade-offs outside it.",
      },
      {
        question: "Should a backend developer learn DevOps?",
        answer:
          "Learn enough to deploy, observe and debug your own services: containers, one cloud, CI, metrics and tracing. That is now part of mid-level backend work. Moving fully into DevOps or platform is a separate decision about whether you want other engineers to be your users.",
      },
      {
        question: "How does a backend developer become an architect?",
        answer:
          "By making design decisions in writing and living with the results. Volunteer for design docs, own a migration, and keep a record of the trade-offs you chose and what happened. The title usually follows years of that; a certification alone rarely gets you there.",
      },
    ],
  },

  "full-stack-developer": {
    overview:
      "Full stack developers progress fastest at startups and small product teams, where one person owning a feature end to end is exactly what's needed. Around senior level the pure generalist profile gets harder to sell to larger companies, so most full stack careers go one of two ways: lean into product and technical leadership, or pick one side and specialize. Both work; drifting without choosing is what stalls.",
    moves: [
      {
        toRole: "Tech Lead",
        moveType: "step_up",
        typicalTiming:
          "After 4-6 years, once you are the person others ask how the whole app fits together",
        why: "Full stack developers see the whole request path, which is the view a tech lead needs to split work, spot integration risk and make build-versus-buy calls.",
        skillsToAdd: [
          "Technical planning and work breakdown",
          "Code review standards and architecture decision records",
          "Error tracking and tracing with Sentry and OpenTelemetry",
          "Mentoring through pairing and design review",
        ],
        proof:
          "A product area you led from design to launch with other engineers contributing, and the outcome.",
      },
      {
        toRole: "Founding Engineer",
        moveType: "lateral",
        typicalTiming:
          "After 3-5 years of shipping product features with little supervision",
        why: "Early-stage companies need one engineer who can choose the stack, ship the whole product and talk to users. Full stack is the profile they hire for, and nobody expects deep specialization yet.",
        skillsToAdd: [
          "Stripe billing and webhooks",
          "Managed auth (Auth0, Clerk or Supabase Auth)",
          "Hosting and deploys on Vercel, Render or AWS",
          "Product analytics with PostHog",
          "Running user interviews",
        ],
        proof:
          "Something you built and shipped largely alone that has real users, even a small number.",
      },
      {
        toRole: "Backend Developer",
        toSlug: "backend-developer",
        moveType: "lateral",
        typicalTiming:
          "After 3-4 years, when you notice the data and API work is what you enjoy most",
        why: "Specializing trades breadth for depth that larger companies test hard in interviews. Your full stack background becomes an asset: you design APIs the frontend can actually use.",
        skillsToAdd: [
          "PostgreSQL indexing, locking and query plans",
          "Message queues (Kafka, RabbitMQ or SQS)",
          "Idempotency, retries and consistency patterns",
          "Go or Java for services",
        ],
        proof:
          "Backend work where you owned performance or correctness, with latency, throughput or error-rate numbers.",
      },
      {
        toRole: "Solutions Engineer",
        moveType: "pivot",
        typicalTiming:
          "After 3-5 years, if you enjoy demos and customer calls more than long build cycles",
        why: "Solutions engineers build demos, proofs of concept and integrations across a customer's whole stack. Full stack breadth is exactly what that job draws on, and the new skill is running a technical sales conversation.",
        skillsToAdd: [
          "Discovery calls and technical qualification",
          "Building proofs of concept against customer systems",
          "REST and GraphQL integration patterns",
          "Presenting to technical and non-technical buyers",
        ],
        proof:
          "Integrations or demos you built for external users, plus evidence you explained technical work to non-engineers.",
      },
    ],
    faqs: [
      {
        question: "Should a full stack developer specialize eventually?",
        answer:
          "Most should pick a deeper side, even if the title stays full stack. Senior interviews go deep on one area, and being equally good at everything reads as shallow. Choose the side you debug for fun and make your resume show depth there.",
      },
      {
        question: "Can a full stack developer become a CTO?",
        answer:
          "At a small company, often yes, because the first technical hire is usually a generalist. What decides it is less stack breadth than hiring, architecture calls under uncertainty, and talking to customers and investors. At larger companies the CTO path runs through engineering management.",
      },
      {
        question: "What is the fastest way to get promoted as a full stack developer?",
        answer:
          "Own outcomes, not layers. Take a feature with a product metric attached from schema to UI to launch, then report on what changed. That is the end-to-end ownership senior full stack roles are built on, and it's easy to describe on a resume.",
      },
    ],
  },

  "devops-engineer": {
    overview:
      "DevOps work in the US increasingly splits into platform engineering (internal tools and paved roads for developers), site reliability (owning uptime and SLOs), and cloud architecture (designing environments and controlling cost). Larger companies often hire under those more specific titles, so progression usually means picking one. Security and management are the main exits beyond that.",
    moves: [
      {
        toRole: "Platform Engineer",
        toSlug: "platform-engineer",
        moveType: "lateral",
        typicalTiming:
          "After 3-4 years, once you are building shared pipelines and templates rather than one-off fixes",
        why: "Platform engineering takes the pipelines, IaC and cluster work you already do and packages it as a product for internal developers, with self-service as the goal and developers as your users.",
        skillsToAdd: [
          "Backstage",
          "Argo CD for GitOps",
          "Terraform modules or Crossplane compositions published for other teams",
          "Measuring developer experience (DORA metrics, onboarding time)",
        ],
        proof:
          "Shared infrastructure or templates other teams adopted, with adoption and lead-time numbers.",
      },
      {
        toRole: "Site Reliability Engineer",
        toSlug: "site-reliability-engineer",
        moveType: "lateral",
        typicalTiming:
          "After 2-4 years, especially if you are already the escalation point during incidents",
        why: "You already run the systems and respond when they break. SRE formalizes that with SLOs and error budgets and expects more software engineering aimed at removing toil.",
        skillsToAdd: [
          "SLO and error budget design",
          "Alert tuning in Prometheus and Grafana",
          "Go or Python for reliability tooling",
          "Chaos testing with LitmusChaos or Gremlin",
          "Blameless postmortem facilitation",
        ],
        proof:
          "Incidents you led and reliability changes you made, with availability or recovery-time movement.",
      },
      {
        toRole: "Cloud Architect",
        toSlug: "cloud-architect",
        moveType: "step_up",
        typicalTiming:
          "After 5-7 years, typically after leading a migration or designing a multi-account setup",
        why: "Cloud architects decide account structure, networking, identity and cost controls before anything is deployed. Senior DevOps engineers already live with the consequences of those decisions, which is the best preparation for making them.",
        skillsToAdd: [
          "AWS Certified Solutions Architect Professional or Google Professional Cloud Architect",
          "Landing zones with AWS Control Tower or Azure landing zones",
          "Network design: VPCs, peering, Transit Gateway",
          "FinOps practices and cost allocation tagging",
        ],
        proof:
          "A cloud environment or migration you designed, with its cost, security or reliability outcome.",
      },
      {
        toRole: "Cloud Security Engineer",
        toSlug: "cloud-security-engineer",
        moveType: "pivot",
        typicalTiming: "After 3-5 years, often after owning IAM, secrets or compliance work",
        why: "Much of cloud security is configuration: IAM scope, public storage, network exposure and secrets handling. DevOps engineers already control those settings, so the move is from configuring them to defending them.",
        skillsToAdd: [
          "AWS Certified Security Specialty",
          "Policy as code with Open Policy Agent or Checkov",
          "Secrets management with HashiCorp Vault",
          "Container image scanning with Trivy",
        ],
        proof:
          "Security controls you built into pipelines or IAM, with what they caught or prevented.",
      },
    ],
    faqs: [
      {
        question: "Is DevOps a good long-term career?",
        answer:
          "The skills are durable even if the title fades. Companies will keep needing people who run cloud infrastructure, automate delivery and handle incidents; they just call it platform engineering or SRE more often. Keep your resume focused on systems and outcomes rather than the label.",
      },
      {
        question: "Can a DevOps engineer move into software development?",
        answer:
          "Yes, and it's easier than people expect if you already write real Go or Python for tooling. Target backend or platform teams first, where infrastructure knowledge is an asset. Make sure your resume shows code you wrote, not only configuration you edited.",
      },
      {
        question: "Which certification helps a DevOps career the most?",
        answer:
          "Certifications help most at two points: associate level to get past early screens, and professional level when moving into architecture. For DevOps work, AWS Certified DevOps Engineer Professional and the Certified Kubernetes Administrator are the ones hiring managers ask about. Pick the cloud your target employers use rather than collecting all three.",
      },
    ],
  },

  "qa-engineer": {
    overview:
      "QA careers split around mid-level into two tracks: SDET and automation work, which is software engineering aimed at quality, and quality leadership, which owns test strategy and release risk across teams. QA is also one of the most common side doors into other engineering roles, because testers learn the whole product and see every release. Which door opens depends mostly on how much real code you write.",
    moves: [
      {
        toRole: "Test Automation Engineer",
        toSlug: "test-automation-engineer",
        moveType: "step_up",
        typicalTiming:
          "After 1-3 years, as soon as writing and fixing automated tests is part of your weekly work",
        why: "You already know what to test and where the product breaks. This move makes the automation itself your main output: framework design, CI integration and keeping the suite trustworthy.",
        skillsToAdd: [
          "Playwright or Cypress with TypeScript",
          "API testing with REST Assured or Postman and Newman",
          "Running suites in CI with GitHub Actions or Jenkins",
          "Fixture and page object design",
          "Test data management",
        ],
        proof:
          "Automation you built that runs in CI on every change, with suite runtime and flake rate.",
      },
      {
        toRole: "QA Manager",
        moveType: "step_up",
        typicalTiming:
          "After 5-7 years, usually after leading release sign-off or coordinating other testers",
        why: "Senior QA engineers already decide what gets tested and when a release is safe to ship. Managing quality turns that judgment into owning the strategy, the team and the risk conversation with engineering leadership.",
        skillsToAdd: [
          "Risk-based test strategy",
          "Quality metrics: escaped defects and change failure rate",
          "Hiring and coaching testers",
          "ISTQB Advanced Level Test Manager",
        ],
        proof:
          "A quality process you introduced across a team, with defect or release metrics before and after.",
      },
      {
        toRole: "Performance Engineer",
        toSlug: "performance-engineer",
        moveType: "lateral",
        typicalTiming: "After 3-4 years, often after running load tests before a major launch",
        why: "Performance work uses the same instincts as functional testing (build a realistic scenario, find where it breaks) but the failures are latency and capacity rather than wrong behavior.",
        skillsToAdd: [
          "k6, JMeter or Gatling",
          "APM tools such as Datadog or New Relic",
          "Profiling and reading flame graphs",
          "Capacity planning",
        ],
        proof:
          "A load or performance test you designed that found a real bottleneck, with numbers before and after the fix.",
      },
      {
        toRole: "Software Engineer",
        toSlug: "software-engineer",
        moveType: "pivot",
        typicalTiming:
          "After 2-4 years of writing automation in a general-purpose language",
        why: "Automation engineers already read product code, write code every day and take part in reviews. The gap is designing and owning features instead of verifying them, and passing coding interviews.",
        skillsToAdd: [
          "Data structures and algorithms for coding interviews",
          "One application framework such as Spring Boot, Django or React",
          "Unit testing and test-driven development in product code",
          "System design basics",
        ],
        proof:
          "Code merged into the product itself, not only the test repository, such as bug fixes or testability hooks.",
      },
      {
        toRole: "DevOps Engineer",
        toSlug: "devops-engineer",
        moveType: "lateral",
        typicalTiming: "After 2-4 years, if you already maintain the pipelines your tests run in",
        why: "QA engineers who own test environments and pipeline stages are already doing part of release engineering. DevOps widens that from the test stage to the whole delivery path.",
        skillsToAdd: [
          "Docker",
          "Terraform",
          "Kubernetes fundamentals",
          "AWS Certified SysOps Administrator Associate",
        ],
        proof:
          "Pipeline or environment work you owned, such as ephemeral test environments or a faster pipeline, with the numbers.",
      },
    ],
    faqs: [
      {
        question: "Can a QA engineer become a software developer?",
        answer:
          "Yes, and it's one of the most common internal moves in engineering. The deciding factor is whether you already write substantial code, so move toward automation first and then contribute fixes to the product codebase. Expect standard developer interviews, which means practicing coding problems you may not have needed in QA.",
      },
      {
        question: "Is QA a dead-end job?",
        answer:
          "Manual-only QA can be, because the work is easy to shrink and rarely leads anywhere on its own. QA with automation, CI and performance skills is not: it leads to SDET, quality leadership, DevOps and development roles. If your current job is all manual execution, the most useful thing you can do is automate part of it.",
      },
      {
        question: "Should I become an SDET or a QA manager?",
        answer:
          "Choose SDET if you want to stay close to code and keep your options open for development roles later. Choose management if you care more about how teams decide what is safe to ship and enjoy coaching. SDET is the easier path to reverse, since management roles in QA are fewer.",
      },
    ],
  },

  "data-scientist": {
    overview:
      "The data scientist title covers three different jobs depending on the company: product analytics, experimentation and causal work, and model building. Knowing which one you actually do determines which moves are short. At senior level the path forks into a staff or principal IC track that sets methodology across teams, or a management track that runs a data science group.",
    moves: [
      {
        toRole: "Staff Data Scientist",
        moveType: "step_up",
        typicalTiming: "After 7 or more years, once teams outside yours adopt your methods",
        why: "Staff data scientists own how the company measures things: experimentation standards, metric definitions and the methods behind major decisions. Seniors who already review other people's analyses are doing a narrower version of this.",
        skillsToAdd: [
          "Causal inference (difference-in-differences, synthetic control)",
          "Variance reduction for experiments, such as CUPED",
          "Bayesian methods for decision-making",
          "Writing methodology standards others follow",
        ],
        proof:
          "A method or standard adopted beyond your team, with how it changed the decisions made with it.",
      },
      {
        toRole: "Data Science Manager",
        moveType: "step_up",
        typicalTiming:
          "After 5-7 years, usually after mentoring junior scientists and running your team's planning",
        why: "Managing data scientists is mostly deciding which questions deserve the team's time and protecting the rigor of the answers. If you already triage requests and review analyses, you have started.",
        skillsToAdd: [
          "Building and prioritizing an analytics roadmap",
          "Hiring and performance reviews",
          "Review standards for analyses and experiments",
          "Presenting to executives",
        ],
        proof:
          "Work where you set direction for other data scientists, and a leadership decision your team influenced.",
      },
      {
        toRole: "Machine Learning Engineer",
        toSlug: "machine-learning-engineer",
        moveType: "lateral",
        typicalTiming:
          "After 2-4 years, if you want your models running in production rather than in notebooks",
        why: "You already train and evaluate models. The move adds the engineering around them: packaging, serving, monitoring and retraining, written as code that passes review.",
        skillsToAdd: [
          "Python packaging, testing and type hints",
          "Serving models with FastAPI or BentoML in Docker",
          "MLflow model registry",
          "Monitoring for data and prediction drift",
        ],
        proof:
          "A model you took past the notebook into a scheduled or served system, with its production metrics.",
      },
      {
        toRole: "AI Engineer",
        toSlug: "ai-engineer",
        moveType: "lateral",
        typicalTiming: "Any time after 2 years, particularly if you have evaluated LLM output",
        why: "Building with large language models is largely an evaluation problem: designing test sets, measuring quality and catching regressions after a prompt or model change. That is how data scientists already think.",
        skillsToAdd: [
          "LLM APIs and structured output",
          "Retrieval pipelines with pgvector or Pinecone",
          "LLM evaluation (Ragas or a custom eval harness)",
          "Backend basics with FastAPI",
        ],
        proof: "An LLM feature or prototype with a written evaluation, not just a demo.",
      },
      {
        toRole: "Product Manager",
        toSlug: "product-manager",
        moveType: "pivot",
        typicalTiming: "After 3-5 years embedded with a product team",
        why: "Product data scientists already frame the question, size the opportunity and tell the team what an experiment means. Product management is making the call instead of informing it.",
        skillsToAdd: [
          "Writing PRDs",
          "Customer discovery interviews",
          "Roadmap prioritization",
          "Working with design on user flows",
        ],
        proof:
          "Cases where your analysis changed what the team built, stated as the decision and its outcome.",
      },
    ],
    faqs: [
      {
        question: "Is data science still a good career?",
        answer:
          "Yes, but the entry-level market is harder than it used to be, and the work has shifted toward experimentation, causal questions and evaluating AI systems. Generalist roles that mostly meant fitting a model to a spreadsheet have thinned out. Data scientists who pair strong statistics with either product sense or production engineering keep moving.",
      },
      {
        question: "Can a data scientist become a data engineer?",
        answer:
          "Yes, and it's a common move for people who enjoy building pipelines more than interpreting results. Expect to learn orchestration, warehouse modeling and software practices like testing and CI. Your advantage is knowing what downstream users actually need from the data.",
      },
      {
        question: "Do I need a PhD to advance as a data scientist?",
        answer:
          "Not for product and analytics roles, where experience and judgment count for more. A PhD helps for research scientist roles and some modeling-heavy teams. Without one, show depth through shipped work and experiments whose design you can defend.",
      },
    ],
  },

  "data-analyst": {
    overview:
      "Data analyst is one of the most flexible starting points in tech, because the core skills (SQL, metrics, explaining numbers to decision makers) carry into several more specialized tracks. The standard ladder runs senior analyst to analytics manager, but many analysts leave the title within a few years for analytics engineering, data science or product analytics. The analysts who stall are the ones who stay on report requests and never own a business question.",
    moves: [
      {
        toRole: "Analytics Engineer",
        toSlug: "analytics-engineer",
        moveType: "lateral",
        typicalTiming:
          "After 1-3 years, especially if you already write the SQL models your dashboards depend on",
        why: "Analytics engineering turns the SQL you write for reports into tested, documented, version-controlled models that everyone else queries. It suits analysts who enjoy fixing the data more than presenting it.",
        skillsToAdd: [
          "dbt (models, tests, documentation)",
          "Git and pull request workflow",
          "Dimensional modeling",
          "Snowflake or BigQuery",
          "dbt Analytics Engineering Certification",
        ],
        proof:
          "Transformations you built and maintained that other analysts or dashboards used, ideally with tests.",
      },
      {
        toRole: "Product Analyst",
        moveType: "lateral",
        typicalTiming: "Any time after 1-2 years",
        why: "Product analytics applies the same SQL and metric work to user behavior: funnels, retention, feature adoption and experiments. It moves you closer to the decisions product teams make every week.",
        skillsToAdd: [
          "Amplitude or Mixpanel",
          "Event tracking plans",
          "Funnel and cohort retention analysis",
          "A/B test readouts",
        ],
        proof: "An analysis of user behavior that led to a product change.",
      },
      {
        toRole: "Data Scientist",
        toSlug: "data-scientist",
        moveType: "step_up",
        typicalTiming:
          "After 2-4 years, once you are running experiment readouts or building forecasts",
        why: "Analysts already write the SQL, define the metrics and explain the results. Data science adds statistical rigor and modeling on top of that base.",
        skillsToAdd: [
          "Python with pandas and scikit-learn",
          "Hypothesis testing and experiment design",
          "Regression and classification models",
          "Causal inference basics",
        ],
        proof:
          "An analysis that went beyond aggregation, such as an experiment readout or a forecast, and the decision it informed.",
      },
      {
        toRole: "Analytics Manager",
        moveType: "step_up",
        typicalTiming:
          "After 4-6 years, usually after mentoring other analysts and owning metric definitions",
        why: "Analytics managers decide which questions get answered and make sure the numbers mean the same thing everywhere. Senior analysts who already push back on low-value requests are halfway there.",
        skillsToAdd: [
          "Prioritizing a request queue against strategic work",
          "A semantic layer such as LookML or the dbt Semantic Layer",
          "Hiring and coaching analysts",
          "Presenting to executives",
        ],
        proof:
          "Metric definitions or self-serve reporting you led, and the other analysts you trained or reviewed.",
      },
      {
        toRole: "Strategy and Operations Manager",
        moveType: "pivot",
        typicalTiming:
          "After 3-5 years, if the business decision interests you more than the data behind it",
        why: "Strategy and operations teams run the analysis and then own the recommendation and the follow-through, often on pricing, planning or go-to-market. Analysts who already present to leadership have the harder half of that job.",
        skillsToAdd: [
          "Financial modeling in Excel or Google Sheets",
          "Unit economics and pricing analysis",
          "Annual planning and OKR processes",
          "Hypothesis-driven problem solving (issue trees)",
        ],
        proof: "Recommendations you made to leadership that were acted on, with the business result.",
      },
    ],
    faqs: [
      {
        question: "Is data analyst a dead-end job?",
        answer:
          "Only if the job stays reactive. An analyst who fills report requests for years has little to show, while one who owns a business area's questions builds a record that leads to senior analyst, analytics engineering, data science or strategy roles. Ask for ownership of a metric, not more tickets.",
      },
      {
        question: "Should I move into analytics engineering or data science?",
        answer:
          "Pick analytics engineering if you like making data reliable and reusable, and you're the person who rewrites the messy query everyone copies. Pick data science if you want to answer harder questions with statistics and experiments. Analytics engineering is usually the faster move because it builds directly on SQL.",
      },
      {
        question: "How long should I stay a data analyst before moving on?",
        answer:
          "Long enough to show one or two decisions your work changed, which usually takes a couple of years in one business area. Moving sooner is fine if you're going to a role with more ownership. Moving because the title feels junior, without that evidence, tends to land you in the same work elsewhere.",
      },
    ],
  },

  "data-engineer": {
    overview:
      "Data engineering has a long IC ladder: senior, staff and principal data engineers own platform architecture, data contracts and warehouse cost, and staying technical doesn't mean standing still. Sideways moves go toward the consumers of the data (machine learning) or toward the infrastructure underneath it (data platform). Management roles exist, but data engineering teams are often small, so there are fewer of them.",
    moves: [
      {
        toRole: "Data Architect",
        toSlug: "data-architect",
        moveType: "step_up",
        typicalTiming:
          "After 6-8 years, usually after leading a warehouse or lakehouse migration",
        why: "Data architects decide how data is modeled, stored, governed and shared across domains. Senior data engineers who have lived through a messy migration know which of those decisions are expensive to reverse.",
        skillsToAdd: [
          "Open table formats (Apache Iceberg or Delta Lake)",
          "Data catalogs and governance (Unity Catalog or DataHub)",
          "Data contracts between producers and consumers",
          "Databricks Certified Data Engineer Professional or Google Professional Data Engineer",
        ],
        proof:
          "A platform or modeling design you led across multiple domains, with the cost, reliability or adoption outcome.",
      },
      {
        toRole: "Machine Learning Engineer",
        toSlug: "machine-learning-engineer",
        moveType: "lateral",
        typicalTiming: "After 3-4 years, especially if you have built feature or training pipelines",
        why: "Much of production ML is data work: feature pipelines, training data freshness and point-in-time correctness. Data engineers already handle the part that most often breaks models.",
        skillsToAdd: [
          "scikit-learn and PyTorch fundamentals",
          "Feature stores such as Feast",
          "Model training and evaluation",
          "MLflow",
        ],
        proof: "Feature or training pipelines you built for a model that runs in production.",
      },
      {
        toRole: "Data Platform Engineer",
        toSlug: "data-platform-engineer",
        moveType: "lateral",
        typicalTiming:
          "After 3-5 years, once you are building shared tooling rather than individual pipelines",
        why: "Platform work turns pipeline-by-pipeline fixes into infrastructure for everyone: orchestration, compute, access control and CI for data. It suits data engineers who enjoy the systems more than the business logic.",
        skillsToAdd: [
          "Kubernetes",
          "Terraform",
          "Data quality testing with Great Expectations or Soda",
          "Warehouse cost monitoring and workload management",
        ],
        proof:
          "Shared data tooling other engineers adopted, with a reliability, cost or onboarding improvement.",
      },
      {
        toRole: "Data Engineering Manager",
        moveType: "step_up",
        typicalTiming:
          "After 5-7 years, typically after leading on-call and prioritizing requests from several teams",
        why: "Data engineering teams serve many internal customers at once, so senior engineers already negotiate priorities and SLAs. Management makes that negotiation and the team's growth your main job.",
        skillsToAdd: [
          "Intake and prioritization across stakeholder teams",
          "Defining data SLAs and on-call practices",
          "Hiring and coaching engineers",
          "Budgeting warehouse and tooling spend",
        ],
        proof:
          "A cross-team data initiative you coordinated, with the engineers involved and the delivery result.",
      },
      {
        toRole: "Technical Product Manager",
        toSlug: "technical-product-manager",
        moveType: "pivot",
        typicalTiming:
          "After 4-6 years, if you have been the one negotiating requirements with data consumers",
        why: "Data platforms and data products need PMs who understand lineage, freshness and schema change. Data engineers already translate between the teams producing data and the teams using it.",
        skillsToAdd: [
          "Writing PRDs for internal platform products",
          "User research with analysts and data scientists",
          "Adoption and usage metrics for internal tools",
          "Roadmap prioritization",
        ],
        proof:
          "A data product or platform capability you scoped with its users, and how many teams adopted it.",
      },
    ],
    faqs: [
      {
        question: "What comes after senior data engineer?",
        answer:
          "Staff or principal data engineer, data architect, or data engineering manager. The IC roles own platform-wide decisions like table formats, contracts and cost; management owns the team and its priorities. Many engineers also move sideways into ML or platform engineering at this point rather than up.",
      },
      {
        question: "Can a data engineer move into machine learning?",
        answer:
          "Yes, and it's one of the smoother moves in data. You already build the pipelines models depend on; what you add is modeling fundamentals, evaluation and serving. Start by owning the feature pipeline for an existing model so the move has a track record behind it.",
      },
      {
        question: "Will managed tools make data engineers less necessary?",
        answer:
          "Managed ingestion and transformation tools removed a lot of boilerplate, like writing connectors and scheduling scripts. The remaining work is harder: modeling, contracts, quality, cost and reliability at scale. Data engineers who only moved data from A to B feel the change; those who own what the data means do not.",
      },
    ],
  },

  "machine-learning-engineer": {
    overview:
      "ML engineering has a strong IC track: senior and staff ML engineers own training and serving infrastructure, and the most senior engineers decide how a company builds and ships models. Since large language models arrived, many ML engineers have also moved into applied AI work, which rewards the same production instincts with different tools. The management path is narrower, because ML teams are often small and sit inside larger engineering orgs.",
    moves: [
      {
        toRole: "Staff Machine Learning Engineer",
        moveType: "step_up",
        typicalTiming:
          "After 7 or more years, once other teams depend on infrastructure you designed",
        why: "Staff ML engineers make platform decisions: how models are trained, versioned, served and rolled back across the company. Seniors who already built one of those components are doing the narrow version.",
        skillsToAdd: [
          "Distributed training with PyTorch FSDP or Ray",
          "GPU capacity planning and cost control",
          "ML platform design (feature store, registry, serving)",
          "Writing technical strategy documents",
        ],
        proof:
          "ML infrastructure multiple teams use, with the effect on training time, serving cost or deployment frequency.",
      },
      {
        toRole: "Generative AI Engineer",
        toSlug: "generative-ai-engineer",
        moveType: "lateral",
        typicalTiming: "Any time after 2-3 years of production ML",
        why: "LLM applications fail in ways ML engineers already know how to handle: evaluation gaps, drift, latency budgets and serving cost. The new parts are retrieval, fine-tuning methods and prompt-level behavior.",
        skillsToAdd: [
          "Fine-tuning with LoRA or QLoRA",
          "Inference serving with vLLM",
          "Retrieval-augmented generation and vector search",
          "LLM evaluation and red-teaming",
        ],
        proof:
          "An LLM system you shipped or prototyped with measured quality, latency and cost.",
      },
      {
        toRole: "MLOps Engineer",
        toSlug: "mlops-engineer",
        moveType: "lateral",
        typicalTiming:
          "After 2-4 years, if you find the pipeline and deployment work more interesting than the models",
        why: "MLOps owns the machinery ML engineers depend on: CI for models, registries, automated retraining and monitoring. You know exactly where that machinery hurts because you use it.",
        skillsToAdd: [
          "Kubeflow Pipelines or Vertex AI Pipelines",
          "Kubernetes and Helm",
          "Model registry and promotion workflows in MLflow",
          "Drift monitoring with Evidently or WhyLabs",
        ],
        proof:
          "Pipeline or deployment automation you built, with the change in time from trained model to production.",
      },
      {
        toRole: "AI Research Engineer",
        toSlug: "ai-research-engineer",
        moveType: "lateral",
        typicalTiming:
          "After 3 or more years, usually with published work or substantial open-source contributions",
        why: "Research engineers turn papers and research ideas into working training runs. ML engineers who already read papers and reproduce results for their own models are closer than they think.",
        skillsToAdd: [
          "Reproducing papers from scratch",
          "PyTorch custom modules and training loops",
          "Experiment design and ablation studies",
          "Writing for workshop or conference submission",
        ],
        proof:
          "A reproduced paper, open-source contribution or published result, with the code public.",
      },
      {
        toRole: "AI Product Manager",
        toSlug: "ai-product-manager",
        moveType: "pivot",
        typicalTiming:
          "After 4-6 years, if you have been shaping which model problems are worth solving",
        why: "AI products need PMs who understand what models can and can't do reliably, what evaluation costs, and when a simpler rule beats a model. ML engineers answer those questions in every planning meeting already.",
        skillsToAdd: [
          "Writing PRDs with model quality targets",
          "Customer discovery interviews",
          "Designing human review and fallback flows",
          "Product analytics and experiment readouts",
        ],
        proof:
          "A model-driven feature where you influenced scope or launch criteria, with the user or business result.",
      },
    ],
    faqs: [
      {
        question: "What comes after senior machine learning engineer?",
        answer:
          "Staff ML engineer, ML platform lead, or engineering manager for an ML team. The staff path is about infrastructure and standards used across the company rather than better individual models. Many seniors also move into applied LLM work, which is currently where a lot of new ML roles sit.",
      },
      {
        question: "Should machine learning engineers move into generative AI?",
        answer:
          "It's worth adding, not necessarily switching. Classical ML (ranking, forecasting, fraud, recommendations) still runs a great deal of production value, and it isn't going away. Engineers who can do both, and know when an LLM is the wrong tool, are the most useful.",
      },
      {
        question: "Can an ML engineer become a research scientist without a PhD?",
        answer:
          "Research engineer, yes; research scientist is harder, since many research teams still screen for a PhD or a publication record. The realistic route is a research engineer role, contributing to published work, and building a record of papers or well-known open-source work over time.",
      },
    ],
  },

  "product-manager": {
    overview:
      "Product management has two ladders that look alike from outside: an IC track (senior and principal PMs on hard product areas) and a people track (group PM, director, VP). The step from PM to senior PM is about owning outcomes without supervision; beyond that it's about strategy and, usually, managing PMs. Because PMs sit between business, design and engineering, sideways moves into growth, AI products, marketing and startup leadership are common and rarely a step back.",
    moves: [
      {
        toRole: "Group Product Manager",
        moveType: "step_up",
        typicalTiming:
          "After 2-3 years as a senior PM, often after informally mentoring newer PMs",
        why: "Group PMs own a portfolio of product areas and the PMs who run them. Senior PMs who already coordinate roadmaps with neighboring teams and coach newer PMs are doing a lighter version of the job.",
        skillsToAdd: [
          "Hiring and coaching PMs",
          "Portfolio prioritization across teams",
          "Writing product strategy documents",
          "Headcount and budget planning",
        ],
        proof:
          "A strategy you set across more than one team, and PMs you mentored or hired.",
      },
      {
        toRole: "Head of Product",
        moveType: "step_up",
        typicalTiming:
          "After 6-8 years, at an early-stage company, usually after taking a product from zero to launch",
        why: "At a startup, the first product leader owns the roadmap, pricing input and often design and research too. PMs who have launched something new, rather than only optimized an existing product, are the ones hired for it.",
        skillsToAdd: [
          "Pricing and packaging",
          "Building a product team and its rituals from scratch",
          "Board and investor updates",
          "Positioning with marketing and sales",
        ],
        proof: "A product or major line you took from idea to launch, with adoption or revenue after launch.",
      },
      {
        toRole: "Growth Manager",
        toSlug: "growth-manager",
        moveType: "lateral",
        typicalTiming:
          "After 2-4 years, especially if you have run onboarding or conversion experiments",
        why: "Growth runs the same discovery and experiment loop PMs use, but against acquisition, activation, retention and monetization instead of a feature area.",
        skillsToAdd: [
          "Experiment design and statistical significance",
          "Lifecycle messaging with Braze or Customer.io",
          "Funnel analysis in Amplitude",
          "SQL for self-serve analysis",
        ],
        proof:
          "Experiments you ran on a funnel metric, including the ones that failed and what you learned.",
      },
      {
        toRole: "AI Product Manager",
        toSlug: "ai-product-manager",
        moveType: "lateral",
        typicalTiming: "Any time after 2-3 years, ideally after shipping one AI-assisted feature",
        why: "AI PM is product management with a probabilistic system in the middle. Your discovery and prioritization skills carry over; what's new is defining quality when outputs vary and deciding when the model is not good enough to ship.",
        skillsToAdd: [
          "LLM capabilities and failure modes (hallucination, latency, cost)",
          "Building evaluation sets with engineers",
          "Designing human review and fallback flows",
          "Model and vendor selection trade-offs",
        ],
        proof:
          "An AI feature you shipped with the quality bar you set and how it performed with users.",
      },
      {
        toRole: "Product Marketing Manager",
        moveType: "pivot",
        typicalTiming: "After 3-5 years, if launches and positioning are the parts you enjoy most",
        why: "Product marketers own positioning, launches and sales enablement for what PMs build. A PM already knows the product, the customer and the competition better than anyone on the marketing side.",
        skillsToAdd: [
          "Positioning and messaging frameworks",
          "Competitive analysis and win/loss interviews",
          "Launch planning",
          "Sales enablement materials",
        ],
        proof: "A launch you shaped, including the messaging, with adoption or pipeline results.",
      },
    ],
    faqs: [
      {
        question: "What comes after senior product manager?",
        answer:
          "Either principal PM, an IC role on the hardest product problems, or group PM, which means managing PMs. Some companies only offer the management route beyond senior. Ask how your company handles it before assuming management is the only way up.",
      },
      {
        question: "Is product management a good long-term career?",
        answer:
          "Yes, if you keep building judgment rather than process habits. The work that holds up is deciding what to build and proving it worked. PMs whose resumes read as backlog management and meeting coordination have a harder time as teams get leaner.",
      },
      {
        question: "Can a product manager become a founder?",
        answer:
          "Many do, and product management is good preparation: it covers customers, prioritization, and working with engineers and designers. The gaps are usually selling, fundraising and hiring. Taking the head of product job at an early startup first is a lower-risk way to find out whether you want that level of ownership.",
      },
    ],
  },

  "ux-designer": {
    overview:
      "UX careers move up a craft ladder (senior, lead, principal designer) or a management ladder (design manager, head of design), and the split usually appears around lead level. At many software companies 'product designer' has become the default title for the same work with broader ownership, so that is often the first move. Research, content design and design systems are the main specialist branches.",
    moves: [
      {
        toRole: "Product Designer",
        toSlug: "product-designer",
        moveType: "lateral",
        typicalTiming:
          "After 2-3 years, once your case studies show business outcomes as well as usability",
        why: "Product design roles expect ownership of the visual and interaction detail plus a real voice in what gets built. UX designers who already run research and design flows end to end have most of it.",
        skillsToAdd: [
          "Figma components, variables and prototyping",
          "Visual design and typography",
          "Product metrics and experiment basics",
          "Working in a design system",
        ],
        proof:
          "A case study connecting a design decision to a product metric after launch.",
      },
      {
        toRole: "Design Manager",
        moveType: "step_up",
        typicalTiming:
          "After 6-8 years, usually after leading critiques and mentoring junior designers",
        why: "Design managers are judged on their team's work: hiring, critique, career growth and getting design a seat in planning. Senior designers who already run critiques and mentor are doing part of it.",
        skillsToAdd: [
          "Running design critique",
          "Hiring and portfolio reviews",
          "Career frameworks for designers",
          "Design operations and capacity planning",
        ],
        proof:
          "Designers you mentored and a team practice you set up, with its effect on the work.",
      },
      {
        toRole: "UX Researcher",
        toSlug: "ux-researcher",
        moveType: "lateral",
        typicalTiming: "After 2-4 years, if the research phase is the part of projects you enjoy most",
        why: "Many UX designers already run interviews and usability tests. Research as a full-time role goes deeper on study design, sampling and synthesis, and on influencing roadmaps with evidence.",
        skillsToAdd: [
          "Research planning and participant screeners",
          "Moderated and unmoderated testing with UserTesting or Maze",
          "Survey design and basic statistics",
          "Synthesis and insight repositories in Dovetail",
        ],
        proof:
          "A study you planned and ran whose findings changed a product decision.",
      },
      {
        toRole: "Product Manager",
        toSlug: "product-manager",
        moveType: "pivot",
        typicalTiming:
          "After 4-6 years, usually after driving scope decisions alongside a PM",
        why: "Designers already do discovery and know the users well. Product management adds business metrics, prioritization under engineering constraints and ownership of the roadmap.",
        skillsToAdd: [
          "Writing PRDs with success metrics",
          "SQL or product analytics for self-serve data",
          "Prioritization frameworks and roadmap planning",
          "Pricing and business model basics",
        ],
        proof:
          "Work where you shaped what got built, not only how, with the outcome that followed.",
      },
    ],
    faqs: [
      {
        question: "What comes after senior UX designer?",
        answer:
          "Staying on the craft track as a lead or principal designer who sets standards and takes the hardest problems, or becoming a design manager who hires, coaches and runs critique. At mature companies neither is ranked above the other. The real choice is whether you want to be judged on your own work or your team's.",
      },
      {
        question: "Is UX design oversaturated?",
        answer:
          "Entry-level UX hiring is crowded, largely because many junior designers came through programs that produce similar portfolios. Mid and senior designers with shipped outcomes are in a different market. Early in your career, one or two case studies with real constraints and results do more than additional practice projects.",
      },
      {
        question: "Can a UX designer become a product manager?",
        answer:
          "Yes, and it's one of the more natural PM backgrounds, since you already do discovery and understand users. The usual gaps are business metrics, trade-offs with engineering, and owning a roadmap. Take on those responsibilities in your current role before applying, so your resume shows them.",
      },
    ],
  },

  "rpa-developer": {
    overview:
      "RPA careers usually start on one platform and grow in two directions: up into solution architecture and Center of Excellence leadership, or outward into broader automation that combines bots with APIs, integration platforms and AI document processing. UI-driven bots are becoming a smaller share of the work, so developers who can choose the right automation method for each process progress fastest.",
    moves: [
      {
        toRole: "RPA Solution Architect",
        moveType: "step_up",
        typicalTiming:
          "After 4-6 years, typically after designing reusable components other developers build on",
        why: "Solution architects design how dozens of automations share queues, credentials, logging and error handling. Senior developers who have maintained a large bot estate know what breaks when that design is missing.",
        skillsToAdd: [
          "UiPath Automation Solution Architect Professional certification",
          "Orchestrator queue and robot capacity design",
          "Credential vault integration such as CyberArk",
          "Reusable frameworks and libraries (REFramework, shared libraries)",
        ],
        proof:
          "An automation framework or architecture you designed, with how many processes run on it and its reliability.",
      },
      {
        toRole: "Automation CoE Lead",
        moveType: "step_up",
        typicalTiming:
          "After 6-8 years, usually after running intake and prioritization for an automation program",
        why: "A Center of Excellence lead owns the pipeline of processes, governance and the value case to leadership. Developers who have assessed processes and declined poor candidates already have the judgment it needs.",
        skillsToAdd: [
          "Opportunity assessment and ROI modeling",
          "Automation governance and change control",
          "Citizen developer programs",
          "Reporting portfolio value to executives",
        ],
        proof:
          "A pipeline or governance process you ran, with the portfolio-level value it delivered.",
      },
      {
        toRole: "Integration Engineer",
        toSlug: "integration-engineer",
        moveType: "lateral",
        typicalTiming: "After 2-4 years, if you already call APIs from inside your bots",
        why: "Many processes a bot automates through the UI have an API underneath. Integration work does the same job at the system level, which is faster and far less brittle, and you already understand the business processes involved.",
        skillsToAdd: [
          "REST APIs and OAuth 2.0",
          "An iPaaS such as MuleSoft, Boomi or Workato",
          "Python or C#",
          "Webhooks and message queues",
        ],
        proof:
          "An automation where you replaced UI steps with API calls, with the reliability or speed gain.",
      },
      {
        toRole: "Intelligent Automation Engineer",
        moveType: "lateral",
        typicalTiming: "Any time after 2 years, especially if you have handled document-heavy processes",
        why: "The processes bots struggled with (invoices, emails, forms with variable layouts) are now handled with document AI and LLMs. RPA developers already understand exception handling and human review, which these systems need even more.",
        skillsToAdd: [
          "UiPath Document Understanding or Azure AI Document Intelligence",
          "LLM APIs for classification and extraction",
          "Human-in-the-loop review design",
          "Python",
        ],
        proof:
          "An automation using document AI or an LLM step, with accuracy and the share of cases needing human review.",
      },
      {
        toRole: "Business Analyst",
        toSlug: "business-analyst",
        moveType: "pivot",
        typicalTiming:
          "After 3-5 years, if process discovery is the part of projects you are best at",
        why: "RPA developers spend much of their time mapping processes, writing process design documents and finding exceptions with operations teams. Business analysis makes that the main job and widens it beyond automation.",
        skillsToAdd: [
          "BPMN process modeling",
          "Requirements and user story writing",
          "Process mining with Celonis",
          "IIBA ECBA or CCBA certification",
        ],
        proof:
          "Process documentation you wrote and a process change you recommended, not only the bot you built.",
      },
    ],
    faqs: [
      {
        question: "Can an RPA developer become a software engineer?",
        answer:
          "Yes, but low-code platform experience alone won't get you through software interviews. Build depth in a general-purpose language, usually C# or Python since both appear in RPA work, and ship something outside the platform. Integration and automation engineering roles are a common stepping stone.",
      },
      {
        question: "Which certifications help an RPA developer move up?",
        answer:
          "Platform certifications matter more in RPA than in most engineering fields because many employers are platform partners. UiPath Automation Developer Professional, Automation Anywhere Certified Advanced RPA Professional and Microsoft Certified: Power Automate RPA Developer Associate are the common ones. Add the architect-level certification on your main platform when you aim for solution architect roles.",
      },
      {
        question: "Should RPA developers learn Python?",
        answer:
          "Yes. Python is how you reach the parts of a process a bot handles badly: APIs, data transformation, document AI and LLM calls. It also makes you hireable outside a single vendor's platform, which matters if that platform falls out of favor at your employer.",
      },
    ],
  },

  "automation-engineer": {
    overview:
      "Because 'automation engineer' covers test, infrastructure and business-process automation, the career path depends on which kind you do, and the best next move usually makes that explicit in the title. Test automation leads toward SDET and quality engineering, infrastructure automation toward DevOps and platform work, and process automation toward integration and AI agents. What carries across all three is the habit of building things other people rely on unattended.",
    moves: [
      {
        toRole: "Automation Architect",
        moveType: "step_up",
        typicalTiming:
          "After 6-8 years, usually after building shared frameworks that other engineers maintain",
        why: "Architects decide how automation is built across an organization: which tools, which patterns, how failures are detected and who owns what. Senior automation engineers who have handed frameworks over to other teams know what makes that work.",
        skillsToAdd: [
          "Workflow orchestration with Temporal or Apache Airflow",
          "Designing for observability and failure recovery",
          "Governance for code review, ownership and secrets",
          "Cost-benefit modeling for automation candidates",
        ],
        proof:
          "A framework or standard multiple teams build automation on, with its adoption and reliability.",
      },
      {
        toRole: "DevOps Engineer",
        toSlug: "devops-engineer",
        moveType: "lateral",
        typicalTiming: "After 2-4 years, if your automation already runs in CI or touches infrastructure",
        why: "DevOps is automation applied to the delivery path: builds, deployments, environments and recovery. Automation engineers already write the scripts; the move adds cloud infrastructure and ownership of production.",
        skillsToAdd: [
          "Terraform",
          "Docker and Kubernetes",
          "CI/CD with GitHub Actions or GitLab CI",
          "AWS Certified SysOps Administrator Associate",
        ],
        proof:
          "Pipeline or infrastructure automation you owned in production, with deployment or recovery metrics.",
      },
      {
        toRole: "AI Engineer",
        toSlug: "ai-engineer",
        moveType: "lateral",
        typicalTiming: "Any time after 2-3 years of automation in Python or TypeScript",
        why: "AI agents are automation with a model making some of the decisions. The hard parts (triggers, permissions, retries, monitoring, and a fallback when the agent is wrong) are what automation engineers already build.",
        skillsToAdd: [
          "LLM APIs with tool calling",
          "Agent frameworks such as LangGraph",
          "Evaluation and regression testing for LLM steps",
          "Guardrails and human approval steps",
        ],
        proof:
          "An automation with an LLM step running on real work, with its accuracy and how failures are caught.",
      },
      {
        toRole: "Software Engineer",
        toSlug: "software-engineer",
        moveType: "lateral",
        typicalTiming: "After 3-5 years, once you are writing substantial code rather than scripts",
        why: "You already write code that runs unattended and must handle failure, which is more than many junior developers can say. The gap is product feature work: larger codebases, design reviews and data modeling.",
        skillsToAdd: [
          "Data structures and algorithms for interviews",
          "One application framework in depth",
          "Relational data modeling",
          "System design basics",
        ],
        proof:
          "A substantial program or service you wrote and maintained, beyond single-purpose scripts.",
      },
      {
        toRole: "Technical Program Manager",
        moveType: "pivot",
        typicalTiming:
          "After 5-7 years, usually after coordinating automation rollouts across several teams",
        why: "Getting automation approved and adopted means coordinating process owners, IT, security and engineering. Technical program managers make that cross-team coordination the job, and your technical depth makes you credible in it.",
        skillsToAdd: [
          "Program planning and dependency tracking",
          "Risk and status reporting to leadership",
          "Jira or Asana at program level",
          "PMP or PMI-ACP certification",
        ],
        proof:
          "A cross-team rollout you coordinated, with the timeline, teams involved and the result.",
      },
    ],
    faqs: [
      {
        question: "Is automation engineering a good career path?",
        answer:
          "Yes, if you pick a lane. Automation skills are in demand across testing, infrastructure and business operations, but a resume that mixes all three without depth is hard to place. Decide which kind of automation you want to be hired for next and make that the headline.",
      },
      {
        question: "Can an automation engineer become a software developer?",
        answer:
          "Often, because you already write code that has to run reliably without supervision. Contribute to the main application where you can, and build one substantial project in a mainstream language. Expect standard developer interviews with coding problems and some system design.",
      },
      {
        question: "Will AI agents replace automation engineers?",
        answer:
          "Agents change what gets automated, not whether someone has to own it. They still need triggers, permissions, monitoring, fallbacks and a person accountable when they act wrongly, which is the reliability work automation engineers already do. Adding LLM tooling to your skill set is the practical response.",
      },
    ],
  },
};
