import type { RoleCareerPath } from "./types";

// Hand-written career paths, part 1: engineering, data, product, design and
// automation roles. Written per role; see types.ts for the rules.

export const CAREER_PATHS_PART_1: Record<string, RoleCareerPath> = {
  "software-engineer": {
    overview:
      "Around senior level, software engineering splits into two ladders. One stays hands-on (senior, staff, principal) and the other manages people (engineering manager, director). Plenty of engineers stay senior for a whole career and do fine. Staff titles are scarce, and you earn them by getting other teams to build your way, not by writing more code.",
    moves: [
      {
        toRole: "Engineering Manager",
        moveType: "step_up",
        typicalTiming:
          "A year or two into a senior role, usually after you've run a project informally or onboarded a few new hires",
        why: "You already split work into tickets, run design reviews and unblock people. Management makes that the whole job, then adds hiring, performance reviews and staffing calls.",
        skillsToAdd: [
          "Structured 1:1s and written performance feedback",
          "Hiring loop design and interviewer calibration",
          "Quarterly planning and estimation across a team",
          "Incident command and postmortem facilitation",
        ],
        proof:
          "One project you led with several engineers on it, what shipped, and who you mentored along the way.",
      },
      {
        toRole: "Staff Software Engineer",
        moveType: "step_up",
        typicalTiming:
          "Three or more years after senior, once teams you don't sit with are building on your designs",
        why: "If other teams already cite your design docs, you're doing staff work without the title. The rest is picking a technical direction and getting people you don't manage to follow it.",
        skillsToAdd: [
          "Writing RFCs and design docs that get adopted",
          "Architecture decision records",
          "Planning multi-team migrations",
          "Capacity and cloud cost modeling",
        ],
        proof:
          "A technical change you proposed and pushed through more than one team, with how far it spread and what it fixed, in numbers.",
      },
      {
        toRole: "Site Reliability Engineer",
        toSlug: "site-reliability-engineer",
        moveType: "lateral",
        typicalTiming:
          "Any point after 2-3 years, and sooner if you're the one who volunteers for on-call",
        why: "SRE is software engineering aimed at production. Your debugging and automation habits carry straight over, and SLOs (uptime targets), capacity and toil-killing tools are the new parts.",
        skillsToAdd: [
          "SLO and error budget design",
          "Prometheus and Grafana",
          "Kubernetes (Certified Kubernetes Administrator)",
          "Terraform",
          "Linux performance tools (perf, strace, eBPF basics)",
        ],
        proof:
          "Incidents you resolved and reliability work you shipped, each with a latency, availability or recovery-time number.",
      },
      {
        toRole: "Machine Learning Engineer",
        toSlug: "machine-learning-engineer",
        moveType: "lateral",
        typicalTiming:
          "2-4 years in, ideally after you've built a feature that uses a model's output",
        why: "Most ML engineering is plain production software, meaning pipelines, serving, tests and monitoring. If you already ship reliable services, you mainly need the modeling and evaluation layer.",
        skillsToAdd: [
          "PyTorch",
          "scikit-learn and model evaluation metrics",
          "MLflow or Weights & Biases for experiment tracking",
          "Model serving with BentoML, TorchServe or a managed cloud endpoint",
        ],
        proof:
          "A model you trained and deployed behind a real endpoint (an internal one counts), with latency and quality numbers.",
      },
      {
        toRole: "Technical Product Manager",
        toSlug: "technical-product-manager",
        moveType: "pivot",
        typicalTiming:
          "4-6 years in, usually after you've become the engineer who argues about scope in roadmap meetings",
        why: "Pushing back on scope, writing specs and talking to the people who call your API is already part of a technical PM's week. The trade is that you stop owning code and start owning whether the thing worked.",
        skillsToAdd: [
          "Customer discovery interviews",
          "Writing PRDs with success metrics",
          "Product analytics in Amplitude or Mixpanel",
          "Prioritization frameworks such as RICE",
        ],
        proof:
          "A feature where you shaped the scope or the decision to build it, and the user or business metric that moved afterward.",
      },
    ],
    faqs: [
      {
        question: "Can you stay a software engineer your whole career?",
        answer:
          "Yes, and plenty of engineers do. At many companies senior is a terminal level, meaning nobody expects you to go further. The real risk is going stale. An engineer who hasn't changed domain or stack in ten years gets harder to hire every year.",
      },
      {
        question: "Should I become an engineering manager or a staff engineer?",
        answer:
          "Go into management if other people's growth gives you energy and you can accept writing little code for years. Pick staff if you want to stay technical and can persuade teams you don't control. Many companies let managers return to hands-on work, so trying management is less permanent than it feels.",
      },
      {
        question: "What's the easiest specialty to move into from general software engineering?",
        answer:
          "The one next to work you already touch. Backend engineers move most easily into platform or SRE, and frontend engineers into design systems or mobile. If you build data-heavy features, data engineering is close. Security and machine learning take longer, because there's a body of knowledge to learn on top of the tools.",
      },
      {
        question: "Is it too late to switch programming languages after years in one stack?",
        answer:
          "No. Mid and senior interviews test design judgment and debugging far more than syntax. Most interviewers will accept a new language if you can talk through its trade-offs. Ship one real project in the new stack first so your resume has something to point at.",
      },
    ],
  },

  "frontend-developer": {
    overview:
      "Frontend careers fork earlier than most of engineering. By mid-level you're usually choosing between going deeper on the web platform, widening into full stack, or drifting toward mobile or design. At smaller companies the ceiling is real, since there may be no staff frontend role at all. The frontend engineers who keep growing tend to own something other teams build on, like the component library or the build setup.",
    moves: [
      {
        toRole: "Staff Frontend Engineer",
        moveType: "step_up",
        typicalTiming:
          "5-7 years in, typically after leading a framework migration or owning a shared component library",
        why: "Every product team inherits decisions about build tooling, rendering and performance budgets, and a staff frontend engineer makes them. If you set those standards for your own team today, you're doing the small version.",
        skillsToAdd: [
          "Monorepo tooling (Nx or Turborepo)",
          "Performance budgets enforced in CI with Lighthouse CI",
          "Rendering strategy trade-offs (SSR, streaming, static generation)",
          "Architecture decision records",
        ],
        proof:
          "A frontend standard or shared library that several teams adopted, plus what happened to build time, bundle size or Core Web Vitals.",
      },
      {
        toRole: "Full Stack Developer",
        toSlug: "full-stack-developer",
        moveType: "lateral",
        typicalTiming:
          "2-3 years in, once you're regularly reading and changing the API code behind your UI",
        why: "You already own one side of the contract between the UI and the API. Learn the other side and you can ship a feature with no hand-off, which product teams notice fast.",
        skillsToAdd: [
          "Node.js with Express or Fastify",
          "PostgreSQL schema design and query tuning",
          "Authentication flows (OAuth, sessions, JWT)",
          "Next.js server components or route handlers",
          "Docker basics for deployment",
        ],
        proof:
          "A feature you built through the UI, API and database, side projects included, with a live link.",
      },
      {
        toRole: "Mobile App Developer",
        toSlug: "mobile-app-developer",
        moveType: "lateral",
        typicalTiming: "Any time after two years of production React",
        why: "React Native keeps your components, state management and TypeScript. What you'll have to learn is how phones behave, from navigation stacks and offline state to push notifications and app store releases.",
        skillsToAdd: [
          "React Native with Expo",
          "iOS and Android build signing and release",
          "Offline storage (SQLite or MMKV)",
          "Mobile end-to-end testing with Detox or Maestro",
        ],
        proof:
          "An app live on TestFlight or Google Play, however small, with the source code linked.",
      },
      {
        toRole: "Product Designer",
        toSlug: "product-designer",
        moveType: "pivot",
        typicalTiming:
          "3-5 years in, usually after working side by side with designers on a component library",
        why: "If you're the developer who fights about spacing and loading states, you're already making design decisions in code. Product design moves you upstream, into research and deciding what gets built.",
        skillsToAdd: [
          "Figma, including auto layout, components and variables",
          "Usability testing and interview synthesis",
          "Interaction design for empty, error and loading states",
          "A portfolio of 2-3 written case studies",
        ],
        proof:
          "Shipped UI where you shaped the design as well as the build, written up with the problem, the options you weighed and the outcome.",
      },
    ],
    faqs: [
      {
        question: "Is frontend development a dead-end career?",
        answer:
          "No, but how far you can go depends on the company. Where the interface is the product, there are staff and principal frontend roles. Smaller companies often have none, so frontend engineers there grow by owning backend, platform or design system work. To stay purely frontend, apply where UI quality is how the company wins.",
      },
      {
        question: "Will AI coding tools replace frontend developers?",
        answer:
          "No, but they're taking over the easiest part of the job, which is turning a clear design into markup. Performance on slow phones, accessibility and state that survives edge cases are still hard. So is designing components other engineers can use. Put your learning there, and make sure your resume shows it.",
      },
      {
        question: "Do frontend developers need backend skills to get promoted?",
        answer:
          "You need enough to read and change the API your UI depends on. Nobody expects you to become a backend engineer. But a senior frontend engineer who can't reason about caching, pagination or auth keeps getting stuck waiting on hand-offs. That comes up in promotion discussions.",
      },
    ],
  },

  "backend-developer": {
    overview:
      "Backend is the most direct road to the senior hands-on levels. Data models, service boundaries and failure handling are what staff and architect work is made of. Past mid-level, backend developers usually go deeper into distributed systems, move sideways into infrastructure or data, or start managing. The infrastructure and data moves are the ones you can most often make without changing employers.",
    moves: [
      {
        toRole: "Software Architect",
        toSlug: "software-architect",
        moveType: "step_up",
        typicalTiming:
          "Seven or more years in, once other teams are building on systems you designed",
        why: "Architects settle the arguments you've been having in design reviews for years, about service boundaries, data ownership and consistency. The scope is bigger, and there's far more writing, because a decision nobody reads doesn't stick.",
        skillsToAdd: [
          "Domain-driven design (bounded contexts, context mapping)",
          "Event-driven architecture with Apache Kafka",
          "C4 diagrams and architecture decision records",
          "AWS Certified Solutions Architect Professional",
        ],
        proof:
          "A multi-service design you led, the constraints you worked under, and how it held up once it was in production.",
      },
      {
        toRole: "Platform Engineer",
        toSlug: "platform-engineer",
        moveType: "lateral",
        typicalTiming:
          "3-5 years in, especially if you already maintain your team's service template or CI config",
        why: "If you're tired of rebuilding deploys, logging and service setup for every new project, platform teams want you. You know what app developers need because you are one.",
        skillsToAdd: [
          "Kubernetes and Helm",
          "Terraform",
          "Backstage or another internal developer portal",
          "OpenTelemetry",
        ],
        proof:
          "Tooling or infrastructure other engineers chose to adopt, with the improvement in lead time or onboarding time.",
      },
      {
        toRole: "Data Engineer",
        toSlug: "data-engineer",
        moveType: "lateral",
        typicalTiming:
          "2-4 years in, particularly if you've owned batch jobs, event consumers or reporting tables",
        why: "Schema design, SQL tuning and queue consumers already make up much of a data pipeline. You'd add the warehouse and a scheduler, and learn to think about freshness, backfills and late-arriving data.",
        skillsToAdd: [
          "Apache Airflow or Dagster",
          "dbt",
          "Snowflake or BigQuery",
          "Dimensional modeling (Kimball)",
        ],
        proof:
          "A job, stream or export that other teams depended on for their data, with volume and freshness numbers.",
      },
      {
        toRole: "Engineering Manager",
        moveType: "step_up",
        typicalTiming:
          "A year or two at the senior level, often after running an on-call rotation or a migration",
        why: "Services depend on each other, so backend leads end up coordinating across teams and running incident reviews anyway. That covers the delivery side of management. The people side is what you'd be learning.",
        skillsToAdd: [
          "1:1s and written feedback",
          "Hiring and interviewer calibration",
          "Quarterly planning and staffing",
          "Stakeholder updates for product and support leads",
        ],
        proof:
          "A cross-team project you coordinated, naming the engineers you led and what got delivered.",
      },
      {
        toRole: "Solutions Architect",
        toSlug: "solutions-architect",
        moveType: "pivot",
        typicalTiming:
          "Five or more years in, if explaining a system to customers satisfies you as much as building one",
        why: "Customer-facing architects spend their days designing integrations against APIs. You know auth, rate limits, webhooks and data models from the side that built them.",
        skillsToAdd: [
          "AWS Certified Solutions Architect Associate",
          "Technical discovery and requirements gathering",
          "Writing reference architectures and integration guides",
          "Building proofs of concept against customer data",
        ],
        proof:
          "Integration or API work where you dealt directly with partners or customers, and the adoption that came after.",
      },
    ],
    faqs: [
      {
        question: "Is backend development a good long-term career?",
        answer:
          "Yes, and it ages better than most engineering specialties. Frameworks come and go, but data modeling, concurrency and failure handling stay relevant, and senior interviews test them. The main risk is spending so long on one internal system that you can't discuss trade-offs outside it.",
      },
      {
        question: "Should a backend developer learn DevOps?",
        answer:
          "Learn enough to deploy, monitor and debug your own services. That means containers, one cloud, CI, metrics and tracing, which is now normal mid-level backend work. Going fully into DevOps or platform is a separate decision about whether you want other engineers as your users.",
      },
      {
        question: "How does a backend developer become a software architect?",
        answer:
          "By making design decisions in writing and living with the results. Volunteer for design docs, own a migration, and keep a record of the trade-offs you chose and how they played out. The title usually follows years of that. A certification on its own rarely gets you there.",
      },
    ],
  },

  "full-stack-developer": {
    overview:
      "Full stack developers move fastest at startups and small product teams, where one person owning a feature from database to button is the whole point. Around senior level, big companies start interviewing for depth, and the pure generalist gets harder to sell. So most full stack careers split. You lean into technical leadership, or you pick a side and specialize. Drifting for years without choosing is what stalls people.",
    moves: [
      {
        toRole: "Tech Lead",
        moveType: "step_up",
        typicalTiming:
          "4-6 years in, once people come to you to ask how the whole app fits together",
        why: "You see the whole request path, which is the view a tech lead needs to split up work, spot integration risk and make build-versus-buy calls.",
        skillsToAdd: [
          "Technical planning and work breakdown",
          "Code review standards and architecture decision records",
          "Error tracking and tracing with Sentry and OpenTelemetry",
          "Mentoring through pairing and design review",
        ],
        proof:
          "A product area you led from design to launch with other engineers contributing, and what happened after it shipped.",
      },
      {
        toRole: "Founding Engineer",
        moveType: "lateral",
        typicalTiming:
          "After 3-5 years of shipping product features without much supervision",
        why: "Early-stage companies want one engineer who can pick the stack, ship the whole product and get on a call with users. That's you, and nobody at a seed-stage company expects deep specialization.",
        skillsToAdd: [
          "Stripe billing and webhooks",
          "Managed auth (Auth0, Clerk or Supabase Auth)",
          "Hosting and deploys on Vercel, Render or AWS",
          "Product analytics with PostHog",
          "Running user interviews",
        ],
        proof:
          "Something you built and shipped mostly alone that real people use, even if it's only a handful.",
      },
      {
        toRole: "Backend Developer",
        toSlug: "backend-developer",
        moveType: "lateral",
        typicalTiming:
          "3-4 years in, when you notice the data and API work is what you actually enjoy",
        why: "Specializing trades breadth for the depth larger companies grill you on in interviews. Your frontend years still pay off, because you'll design APIs the frontend can use without workarounds.",
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
          "3-5 years in, if demos and customer calls hold your attention better than long build cycles",
        why: "Most of the job is demos, proofs of concept and integrations that cross a customer's whole stack, which is exactly your breadth. Running a technical sales conversation is the part you'd have to learn.",
        skillsToAdd: [
          "Discovery calls and technical qualification",
          "Building proofs of concept against customer systems",
          "REST and GraphQL integration patterns",
          "Presenting to technical and non-technical buyers",
        ],
        proof:
          "Integrations or demos you built for outside users, and some sign that you can explain technical work to people who don't code.",
      },
    ],
    faqs: [
      {
        question: "Should a full stack developer specialize?",
        answer:
          "Most should go deep on one side, even if the title stays full stack. Senior interviews dig hard into one area, and being equally good at everything reads as shallow. Choose the side you'd debug for fun and make your resume show depth there.",
      },
      {
        question: "Can a full stack developer become a CTO?",
        answer:
          "At a small company, often yes, since the first technical hire is usually a generalist. Stack breadth matters less than hiring, making architecture calls with little information, and talking to customers and investors. At larger companies the road to CTO runs through engineering management.",
      },
      {
        question: "What's the fastest way to get promoted as a full stack developer?",
        answer:
          "Own an outcome instead of a layer. Take a feature with a product metric attached, carry it from schema to launch, and report what changed. Senior full stack roles are built on that kind of end-to-end ownership, and it reads well on a resume.",
      },
    ],
  },

  "devops-engineer": {
    overview:
      "DevOps work keeps splitting into more specific jobs. Platform engineering builds internal tools for developers, SRE owns uptime, and cloud architecture designs the environment and watches the bill. Bigger companies increasingly hire under those titles, so moving up usually means choosing one. Security and management are the other main exits.",
    moves: [
      {
        toRole: "Platform Engineer",
        toSlug: "platform-engineer",
        moveType: "lateral",
        typicalTiming:
          "3-4 years in, once you're building shared pipelines and templates instead of one-off fixes",
        why: "Platform engineering takes the pipelines, infrastructure code and cluster work you already do and turns it into a product. Developers become your users, and self-service is how you're measured.",
        skillsToAdd: [
          "Backstage",
          "Argo CD for GitOps",
          "Terraform modules or Crossplane compositions published for other teams",
          "Measuring developer experience (DORA metrics, onboarding time)",
        ],
        proof:
          "Shared infrastructure or templates other teams adopted, with how many teams use them and the lead-time change.",
      },
      {
        toRole: "Site Reliability Engineer",
        toSlug: "site-reliability-engineer",
        moveType: "lateral",
        typicalTiming:
          "2-4 years in, especially if you're already the person people escalate to during incidents",
        why: "You already keep the systems running and get paged when they break. SRE puts uptime targets and error budgets around that, and expects you to write real software to kill repetitive work.",
        skillsToAdd: [
          "SLO and error budget design",
          "Alert tuning in Prometheus and Grafana",
          "Go or Python for reliability tooling",
          "Chaos testing with LitmusChaos or Gremlin",
          "Blameless postmortem facilitation",
        ],
        proof:
          "Incidents you led and reliability changes you made, with how availability or recovery time moved.",
      },
      {
        toRole: "Cloud Architect",
        toSlug: "cloud-architect",
        moveType: "step_up",
        typicalTiming:
          "5-7 years in, typically after leading a migration or designing a multi-account setup",
        why: "Senior DevOps engineers spend years living with other people's account, network and access decisions. There's no better preparation for making those decisions yourself, before anything gets deployed.",
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
        typicalTiming: "3-5 years in, often after owning access control, secrets or compliance work",
        why: "A lot of cloud security comes down to settings you already control, like access rules, public storage buckets and secrets handling. The move is from setting them to defending them.",
        skillsToAdd: [
          "AWS Certified Security Specialty",
          "Policy as code with Open Policy Agent or Checkov",
          "Secrets management with HashiCorp Vault",
          "Container image scanning with Trivy",
        ],
        proof:
          "Security checks you built into pipelines or access control, and what they caught or prevented.",
      },
    ],
    faqs: [
      {
        question: "Is DevOps a good long-term career?",
        answer:
          "Yes, the skills will last even if the title fades. Companies will keep needing people who run cloud infrastructure, automate releases and handle incidents. More of them will call it platform engineering or SRE. Keep your resume focused on the systems you ran and the results.",
      },
      {
        question: "Can a DevOps engineer move into software development?",
        answer:
          "Yes, and it's easier than most people expect if you already write real Go or Python for tooling. Aim at backend or platform teams first, where infrastructure knowledge counts in your favor. Make sure your resume shows code you wrote. Config files you edited don't count.",
      },
      {
        question: "Which certification helps a DevOps career the most?",
        answer:
          "Hiring managers ask most about AWS Certified DevOps Engineer Professional and the Certified Kubernetes Administrator. Associate-level certs help you get past early screens, and professional-level ones matter when you move toward architecture. Pick the cloud your target employers use instead of collecting certs for every cloud.",
      },
    ],
  },

  "qa-engineer": {
    overview:
      "Around mid-level, QA careers split in two. One track is SDET and automation work, which is software engineering aimed at quality. The other is quality leadership, owning test strategy and release risk across teams. QA is also a common side door into other engineering jobs, since testers learn the whole product. How much real code you write decides which doors open.",
    moves: [
      {
        toRole: "Test Automation Engineer",
        toSlug: "test-automation-engineer",
        moveType: "step_up",
        typicalTiming:
          "1-3 years in, as soon as writing and fixing automated tests is part of your normal week",
        why: "You already know what to test and where the product breaks. Now the automation itself is your output, and you own the framework, the CI setup and a suite people actually trust.",
        skillsToAdd: [
          "Playwright or Cypress with TypeScript",
          "API testing with REST Assured or Postman and Newman",
          "Running suites in CI with GitHub Actions or Jenkins",
          "Fixture and page object design",
          "Test data management",
        ],
        proof:
          "Automation you built that runs in CI on every change, with the suite's runtime and flake rate.",
      },
      {
        toRole: "QA Manager",
        moveType: "step_up",
        typicalTiming:
          "5-7 years in, usually after leading release sign-off or coordinating other testers",
        why: "Deciding whether a release is safe to ship is a manager's judgment call, and senior QA engineers make it every sprint. Management adds the team, the test strategy and the risk talk with engineering leaders.",
        skillsToAdd: [
          "Risk-based test strategy",
          "Quality metrics: escaped defects and change failure rate",
          "Hiring and coaching testers",
          "ISTQB Advanced Level Test Manager",
        ],
        proof:
          "A quality process you introduced across a team, with defect or release numbers from before and after.",
      },
      {
        toRole: "Performance Engineer",
        toSlug: "performance-engineer",
        moveType: "lateral",
        typicalTiming: "3-4 years in, often after running load tests ahead of a big launch",
        why: "It's the same instinct as functional testing, aimed at a different failure. You still build a realistic scenario and push until something breaks, but what breaks is speed and capacity.",
        skillsToAdd: [
          "k6, JMeter or Gatling",
          "APM tools such as Datadog or New Relic",
          "Profiling and reading flame graphs",
          "Capacity planning",
        ],
        proof:
          "A load test you designed that found a real bottleneck, with numbers from before and after the fix.",
      },
      {
        toRole: "Software Engineer",
        toSlug: "software-engineer",
        moveType: "pivot",
        typicalTiming:
          "After 2-4 years writing automation in a general-purpose language like Java, Python or TypeScript",
        why: "Automation engineers already write code daily, read product code and join code reviews. What's missing is designing and owning features, plus getting through coding interviews.",
        skillsToAdd: [
          "Data structures and algorithms for coding interviews",
          "One application framework such as Spring Boot, Django or React",
          "Unit testing and test-driven development in product code",
          "System design basics",
        ],
        proof:
          "Code merged into the product itself, such as bug fixes or testability hooks, and not only into the test repo.",
      },
      {
        toRole: "DevOps Engineer",
        toSlug: "devops-engineer",
        moveType: "lateral",
        typicalTiming: "2-4 years in, if you already maintain the pipelines your tests run in",
        why: "Own the test environments and a pipeline stage or two, and you're already doing release engineering. DevOps widens that from the test stage to the whole path to production.",
        skillsToAdd: [
          "Docker",
          "Terraform",
          "Kubernetes fundamentals",
          "AWS Certified SysOps Administrator Associate",
        ],
        proof:
          "Pipeline or environment work you owned, like throwaway test environments or a faster pipeline, with the numbers.",
      },
    ],
    faqs: [
      {
        question: "Can a QA engineer become a software developer?",
        answer:
          "Yes, and it's one of the most common internal moves in engineering. What decides it is how much real code you write. Get into automation first, then start contributing fixes to the product codebase. Expect standard developer interviews, so practice the coding problems QA never asked of you.",
      },
      {
        question: "Is QA a dead-end job?",
        answer:
          "Manual-only QA can be, because that work is easy to cut and rarely leads anywhere on its own. QA with automation, CI and performance skills leads to SDET, quality leadership, DevOps and development roles. If your job is all manual testing right now, automate part of it first.",
      },
      {
        question: "Should I become an SDET or a QA manager?",
        answer:
          "Pick SDET if you want to stay close to code and keep a path open to development roles. Pick management if you care more about how teams decide what's safe to ship, and you like coaching. SDET is easier to back out of, because QA management jobs are scarcer.",
      },
    ],
  },

  "data-scientist": {
    overview:
      "Depending on the company, 'data scientist' can mean product analytics, experiments and cause-and-effect questions, or building models. Those are different jobs. Figure out which one you actually do, because that decides which moves are short. At senior level the path forks into staff work that sets methods across teams, or managing a data science group.",
    moves: [
      {
        toRole: "Staff Data Scientist",
        moveType: "step_up",
        typicalTiming: "Seven or more years in, once teams outside yours start using your methods",
        why: "At staff level you own how the company measures things, from experiment standards to metric definitions. If you already review other people's analyses, you're doing a narrow version of it.",
        skillsToAdd: [
          "Causal inference (difference-in-differences, synthetic control)",
          "Variance reduction for experiments, such as CUPED",
          "Bayesian methods for decision-making",
          "Writing methodology standards others follow",
        ],
        proof:
          "A method or standard adopted beyond your team, and how it changed the decisions made with it.",
      },
      {
        toRole: "Data Science Manager",
        moveType: "step_up",
        typicalTiming:
          "5-7 years in, usually after mentoring junior scientists and running your team's planning",
        why: "Most of the job is deciding which questions deserve the team's time, then protecting the rigor of the answers. If you already triage requests and review analyses, you've started.",
        skillsToAdd: [
          "Building and prioritizing an analytics roadmap",
          "Hiring and performance reviews",
          "Review standards for analyses and experiments",
          "Presenting to executives",
        ],
        proof:
          "Work where you set direction for other data scientists, and a leadership decision your team changed.",
      },
      {
        toRole: "Machine Learning Engineer",
        toSlug: "machine-learning-engineer",
        moveType: "lateral",
        typicalTiming:
          "2-4 years in, if you want your models running in production instead of sitting in notebooks",
        why: "You already train and evaluate models. This move is about everything around them, including packaging, serving, monitoring and retraining, written as code that survives review.",
        skillsToAdd: [
          "Python packaging, testing and type hints",
          "Serving models with FastAPI or BentoML in Docker",
          "MLflow model registry",
          "Monitoring for data and prediction drift",
        ],
        proof:
          "A model you took out of the notebook and into a scheduled or served system, with its production metrics.",
      },
      {
        toRole: "AI Engineer",
        toSlug: "ai-engineer",
        moveType: "lateral",
        typicalTiming: "Any time after two years, particularly if you've already graded LLM output",
        why: "Building with large language models is mostly a testing problem. Someone has to build the test sets, measure quality and catch regressions when the prompt or model changes, and that's how you already think.",
        skillsToAdd: [
          "LLM APIs and structured output",
          "Retrieval pipelines with pgvector or Pinecone",
          "LLM evaluation (Ragas or a custom eval harness)",
          "Backend basics with FastAPI",
        ],
        proof: "An LLM feature or prototype with a written evaluation attached. A demo alone won't carry it.",
      },
      {
        toRole: "Product Manager",
        toSlug: "product-manager",
        moveType: "pivot",
        typicalTiming: "3-5 years in, after working inside one product team",
        why: "Product data scientists frame the question, size the opportunity and explain what the experiment means. The PM makes the call you've been informing.",
        skillsToAdd: [
          "Writing PRDs",
          "Customer discovery interviews",
          "Roadmap prioritization",
          "Working with design on user flows",
        ],
        proof:
          "Times your analysis changed what the team built, written as the decision and its outcome.",
      },
    ],
    faqs: [
      {
        question: "Is data science still a good career?",
        answer:
          "Yes, though entry-level hiring is tougher than it was. The work has shifted toward experiments, cause-and-effect questions and testing AI systems. Generalist jobs that mostly meant fitting a model to a spreadsheet have thinned out. Data scientists with strong statistics plus product sense or engineering skill keep moving.",
      },
      {
        question: "Can a data scientist become a data engineer?",
        answer:
          "Yes, and people who enjoy building the pipeline more than reading the result make this move often. You'll need scheduling tools, warehouse modeling and software habits like testing and CI. Your edge is knowing what the people downstream actually need from the data.",
      },
      {
        question: "Do you need a PhD to advance as a data scientist?",
        answer:
          "Not for product and analytics roles, where experience and judgment count for more. A PhD helps for research scientist jobs and some modeling-heavy teams. Without one, show depth through shipped work and experiments whose design you can defend line by line.",
      },
    ],
  },

  "data-analyst": {
    overview:
      "Data analyst is one of the most flexible starting points in tech. SQL, metrics and explaining numbers to decision makers carry into several more specialized jobs. The standard ladder runs from senior analyst to analytics manager. But plenty of analysts leave the title within a few years for analytics engineering, data science or product analytics. The ones who stall stay on report requests and never own a business question.",
    moves: [
      {
        toRole: "Analytics Engineer",
        toSlug: "analytics-engineer",
        moveType: "lateral",
        typicalTiming:
          "1-3 years in, especially if you already write the SQL models behind your dashboards",
        why: "Analytics engineering turns the SQL you write for reports into tested, documented tables that everyone else queries. It's usually built in dbt, a tool for managing SQL like code. Pick it if you'd rather fix the data than present it.",
        skillsToAdd: [
          "dbt (models, tests, documentation)",
          "Git and pull request workflow",
          "Dimensional modeling",
          "Snowflake or BigQuery",
          "dbt Analytics Engineering Certification",
        ],
        proof:
          "Transformations you built and maintained that other analysts or dashboards depended on, ideally with tests.",
      },
      {
        toRole: "Product Analyst",
        moveType: "lateral",
        typicalTiming: "Any time after a year or two",
        why: "Same SQL and metric work, pointed at how people use the product. Funnels, retention and experiments put you much closer to the calls product teams make every week.",
        skillsToAdd: [
          "Amplitude or Mixpanel",
          "Event tracking plans",
          "Funnel and cohort retention analysis",
          "A/B test readouts",
        ],
        proof: "An analysis of user behavior that led to a product change, and what the change was.",
      },
      {
        toRole: "Data Scientist",
        toSlug: "data-scientist",
        moveType: "step_up",
        typicalTiming:
          "2-4 years in, once you're reading out experiment results or building forecasts",
        why: "You already write the SQL, define the metrics and explain the results. Data science puts statistics and modeling on top of that.",
        skillsToAdd: [
          "Python with pandas and scikit-learn",
          "Hypothesis testing and experiment design",
          "Regression and classification models",
          "Causal inference basics",
        ],
        proof:
          "An analysis that went past totals and averages, like an experiment readout or a forecast, and the decision it informed.",
      },
      {
        toRole: "Analytics Manager",
        moveType: "step_up",
        typicalTiming:
          "4-6 years in, usually after mentoring other analysts and owning metric definitions",
        why: "Analytics managers decide which questions get answered and make sure a metric means the same thing in every meeting. If you already push back on low-value requests, you're halfway there.",
        skillsToAdd: [
          "Prioritizing a request queue against strategic work",
          "A semantic layer such as LookML or the dbt Semantic Layer",
          "Hiring and coaching analysts",
          "Presenting to executives",
        ],
        proof:
          "Metric definitions or self-serve reporting you led, and the analysts you trained or reviewed.",
      },
      {
        toRole: "Strategy and Operations Manager",
        moveType: "pivot",
        typicalTiming:
          "3-5 years in, if the business decision interests you more than the data behind it",
        why: "Strategy and ops teams do the analysis, then own the recommendation and see it through, often on pricing or planning. Presenting to leadership is the harder half, and you may already do it.",
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
          "Only if the job stays reactive. Years of filling report requests leave you little to show. Owning a business area's questions builds a record that leads to analytics engineering, data science or strategy roles. Ask to own a metric instead of taking more tickets.",
      },
      {
        question: "Should I move into analytics engineering or data science?",
        answer:
          "Choose analytics engineering if you like making data reliable and reusable, and you're the one who rewrites the messy query everyone copies. Choose data science if you want to answer harder questions with statistics and experiments. Analytics engineering is usually the faster move, because it builds straight on SQL.",
      },
      {
        question: "How long should you stay a data analyst before moving on?",
        answer:
          "Stay until you can point to one or two decisions your work changed. That usually takes a couple of years in one business area. Leaving sooner is fine if the next role gives you more ownership. Leaving only because the title feels junior tends to land you in the same work somewhere else.",
      },
    ],
  },

  "data-engineer": {
    overview:
      "Data engineering has a long hands-on ladder. Senior, staff and principal data engineers own platform design, data contracts and warehouse cost, so staying technical doesn't mean standing still. Sideways moves go toward the people using the data (machine learning) or down into the infrastructure under it (data platform). Management jobs exist, but data teams tend to be small, so there aren't many.",
    moves: [
      {
        toRole: "Data Architect",
        toSlug: "data-architect",
        moveType: "step_up",
        typicalTiming:
          "6-8 years in, usually after leading a warehouse or lakehouse migration",
        why: "Anyone who has lived through a messy migration knows which storage and governance decisions are expensive to undo. Data architects make those decisions up front, across every part of the business.",
        skillsToAdd: [
          "Open table formats (Apache Iceberg or Delta Lake)",
          "Data catalogs and governance (Unity Catalog or DataHub)",
          "Data contracts between producers and consumers",
          "Databricks Certified Data Engineer Professional or Google Professional Data Engineer",
        ],
        proof:
          "A platform or modeling design you led across several business areas, with the cost, reliability or adoption outcome.",
      },
      {
        toRole: "Machine Learning Engineer",
        toSlug: "machine-learning-engineer",
        moveType: "lateral",
        typicalTiming: "3-4 years in, especially if you've built feature or training pipelines",
        why: "Models break most often because of the data, through stale features, bad training sets or leaked future values. You already own that part.",
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
          "3-5 years in, once you're building shared tooling rather than one pipeline at a time",
        why: "Platform work turns one-off pipeline fixes into infrastructure everybody uses, like scheduling, compute, access control and CI for data. Pick it if the systems interest you more than the business logic.",
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
          "5-7 years in, typically after leading on-call and juggling requests from several teams",
        why: "Data teams serve many internal customers at once, so senior engineers already negotiate priorities and service levels. As a manager, that negotiation and growing the team is the job.",
        skillsToAdd: [
          "Intake and prioritization across stakeholder teams",
          "Defining data SLAs and on-call practices",
          "Hiring and coaching engineers",
          "Budgeting warehouse and tooling spend",
        ],
        proof:
          "A cross-team data project you coordinated, with the engineers involved and what got delivered.",
      },
      {
        toRole: "Technical Product Manager",
        toSlug: "technical-product-manager",
        moveType: "pivot",
        typicalTiming:
          "4-6 years in, if you've been the one negotiating requirements with the people who use the data",
        why: "Data platforms need PMs who understand where data comes from, how fresh it is and what a schema change breaks downstream. You've been translating between the teams that produce data and the teams that use it for years.",
        skillsToAdd: [
          "Writing PRDs for internal platform products",
          "User research with analysts and data scientists",
          "Adoption and usage metrics for internal tools",
          "Roadmap prioritization",
        ],
        proof:
          "A data product or platform feature you scoped with its users, and how many teams adopted it.",
      },
    ],
    faqs: [
      {
        question: "What comes after senior data engineer?",
        answer:
          "Usually staff or principal data engineer, data architect, or data engineering manager. The hands-on roles own platform-wide decisions like table formats, contracts and cost. Management owns the team and its priorities. Plenty of engineers move sideways at this point too, into ML or platform engineering.",
      },
      {
        question: "Can a data engineer move into machine learning?",
        answer:
          "Yes, and it's one of the smoother moves in data. You already build the pipelines models depend on, so you'd add modeling basics, evaluation and serving. Start by owning the feature pipeline for a model that already exists, so the move has a track record behind it.",
      },
      {
        question: "Will managed tools make data engineers less necessary?",
        answer:
          "They've replaced the routine part, mainly writing connectors and scheduling scripts. What's left is the harder work of modeling, contracts, quality, cost and reliability at scale. Engineers who only moved data from A to B feel the squeeze. The ones who own what the data means don't.",
      },
    ],
  },

  "machine-learning-engineer": {
    overview:
      "ML engineering has a strong hands-on track. Senior and staff ML engineers own training and serving infrastructure, and the most senior ones decide how the company builds and ships models. Since large language models arrived, many ML engineers have also moved into applied AI work, where the same production instincts apply. Management paths are narrower, because ML teams are usually small.",
    moves: [
      {
        toRole: "Staff Machine Learning Engineer",
        moveType: "step_up",
        typicalTiming:
          "Seven or more years in, once other teams depend on infrastructure you designed",
        why: "The staff-level calls are about how every model at the company gets trained, versioned, served and rolled back. Build one of those pieces well and you're already doing the narrow version.",
        skillsToAdd: [
          "Distributed training with PyTorch FSDP or Ray",
          "GPU capacity planning and cost control",
          "ML platform design (feature store, registry, serving)",
          "Writing technical strategy documents",
        ],
        proof:
          "ML infrastructure several teams use, and what it did to training time, serving cost or deploy frequency.",
      },
      {
        toRole: "Generative AI Engineer",
        toSlug: "generative-ai-engineer",
        moveType: "lateral",
        typicalTiming: "Any time after 2-3 years of production ML",
        why: "LLM apps fail in ways you already know how to handle, like weak evaluation, drift, slow responses and serving cost. Retrieval, fine-tuning methods and prompt behavior are the new material.",
        skillsToAdd: [
          "Fine-tuning with LoRA or QLoRA",
          "Inference serving with vLLM",
          "Retrieval-augmented generation and vector search",
          "LLM evaluation and red-teaming",
        ],
        proof:
          "An LLM system you shipped or prototyped, with measured quality, latency and cost.",
      },
      {
        toRole: "MLOps Engineer",
        toSlug: "mlops-engineer",
        moveType: "lateral",
        typicalTiming:
          "2-4 years in, if the pipeline and deployment work interests you more than the models",
        why: "You use the model CI, registries, retraining jobs and monitoring every day, so you know exactly where they hurt. MLOps makes fixing them your job.",
        skillsToAdd: [
          "Kubeflow Pipelines or Vertex AI Pipelines",
          "Kubernetes and Helm",
          "Model registry and promotion workflows in MLflow",
          "Drift monitoring with Evidently or WhyLabs",
        ],
        proof:
          "Pipeline or deployment automation you built, and how much it cut the time from trained model to production.",
      },
      {
        toRole: "AI Research Engineer",
        toSlug: "ai-research-engineer",
        moveType: "lateral",
        typicalTiming:
          "Three or more years in, usually with published work or serious open-source contributions behind you",
        why: "Research engineers turn papers into working training runs. If you already read papers and reproduce results for your own models, you're closer than you think.",
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
          "4-6 years in, if you've been shaping which model problems are worth solving",
        why: "AI products need PMs who know what a model can do reliably, what testing it costs and when a simple rule beats a model. You already answer those questions in planning meetings.",
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
          "Staff ML engineer, ML platform lead, or manager of an ML team. The staff path is about infrastructure and standards the whole company uses, more than better individual models. Many seniors also move into applied LLM work, which is where a lot of new ML jobs are right now.",
      },
      {
        question: "Should machine learning engineers move into generative AI?",
        answer:
          "Add it, but don't drop classical ML to do it. Ranking, forecasting, fraud and recommendation models still drive a huge amount of production value. The most useful engineers can do both and can tell when an LLM is the wrong tool.",
      },
      {
        question: "Can an ML engineer become a research scientist without a PhD?",
        answer:
          "Research engineer, yes. Research scientist is harder, because many research teams still screen for a PhD or published papers. The realistic route is a research engineer job first, then contributing to published work and building a public record over time.",
      },
    ],
  },

  "product-manager": {
    overview:
      "Product management has two ladders that look alike from outside. One stays hands-on as a senior or principal PM on hard product areas. The other manages people, through group PM, director and VP. Getting from PM to senior PM is about owning outcomes without supervision. After that it's strategy, and usually managing PMs. Sideways moves into growth, AI products or product marketing are common and rarely a step back.",
    moves: [
      {
        toRole: "Group Product Manager",
        moveType: "step_up",
        typicalTiming:
          "2-3 years as a senior PM, often after you've been informally mentoring newer PMs",
        why: "Group PMs own a set of product areas and the PMs running them. Many seniors already coordinate roadmaps with neighboring teams and coach new PMs, which is the lighter version.",
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
          "6-8 years in, at an early-stage company, usually after taking a product from zero to launch",
        why: "The first product leader at a startup owns the roadmap, has a say in pricing and often runs design and research too. Startups hire PMs who have launched something new. Tuning an existing product usually isn't enough.",
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
          "2-4 years in, especially if you've run onboarding or conversion experiments",
        why: "It's the discovery and experiment loop you already run, aimed at signups, activation, retention and revenue instead of a feature area.",
        skillsToAdd: [
          "Experiment design and statistical significance",
          "Lifecycle messaging with Braze or Customer.io",
          "Funnel analysis in Amplitude",
          "SQL for self-serve analysis",
        ],
        proof:
          "Experiments you ran on a funnel metric, including the ones that failed and what they taught you.",
      },
      {
        toRole: "AI Product Manager",
        toSlug: "ai-product-manager",
        moveType: "lateral",
        typicalTiming: "Any time after 2-3 years, ideally once you've shipped one AI-assisted feature",
        why: "AI PM is product management with an unpredictable system in the middle. Discovery and prioritization carry over. Defining quality when answers vary, and knowing when the model isn't ready to ship, are new.",
        skillsToAdd: [
          "LLM capabilities and failure modes (hallucination, latency, cost)",
          "Building evaluation sets with engineers",
          "Designing human review and fallback flows",
          "Model and vendor selection trade-offs",
        ],
        proof:
          "An AI feature you shipped, the quality bar you set for it, and how it performed with users.",
      },
      {
        toRole: "Product Marketing Manager",
        moveType: "pivot",
        typicalTiming: "3-5 years in, if launches and positioning are what you enjoy most",
        why: "Nobody in marketing knows the product, the customer and the competition as well as the PM who built it. Product marketing puts that knowledge to work on positioning, launches and sales support.",
        skillsToAdd: [
          "Positioning and messaging frameworks",
          "Competitive analysis and win/loss interviews",
          "Launch planning",
          "Sales enablement materials",
        ],
        proof: "A launch you shaped, messaging included, with the adoption or sales pipeline that followed.",
      },
    ],
    faqs: [
      {
        question: "What comes after senior product manager?",
        answer:
          "Either principal PM, a hands-on role on the hardest product problems, or group PM, which means managing PMs. Some companies only offer the management route past senior. Ask how yours handles it before assuming management is the only way up.",
      },
      {
        question: "Is product management a good long-term career?",
        answer:
          "Yes, as long as you're building judgment rather than process habits. The work that holds up is deciding what to build and proving it worked. PMs whose resumes read as backlog grooming and meeting coordination struggle more as teams get leaner.",
      },
      {
        question: "Can a product manager become a founder?",
        answer:
          "Many do, and PM work is decent preparation because it covers customers, priorities and working with engineers and designers. The usual gaps are selling, fundraising and hiring. Running product at an early startup first is a cheaper way to learn whether you want that much ownership.",
      },
    ],
  },

  "ux-designer": {
    overview:
      "UX careers go up a craft ladder (senior, lead, principal designer) or a management ladder (design manager, head of design). The split usually shows up around lead level. At many software companies, 'product designer' is now the default title for the same work with broader ownership, so that's often the first move. Research, content design and design systems are the main specialist branches.",
    moves: [
      {
        toRole: "Product Designer",
        toSlug: "product-designer",
        moveType: "lateral",
        typicalTiming:
          "2-3 years in, once your case studies show business results as well as usability wins",
        why: "Product designers own the visual and interaction detail and get a real say in what gets built. If you already run research and design flows end to end, you have most of it.",
        skillsToAdd: [
          "Figma components, variables and prototyping",
          "Visual design and typography",
          "Product metrics and experiment basics",
          "Working in a design system",
        ],
        proof:
          "A case study that ties a design decision to a product metric after launch.",
      },
      {
        toRole: "Design Manager",
        moveType: "step_up",
        typicalTiming:
          "6-8 years in, usually after leading critiques and mentoring junior designers",
        why: "Design managers are judged on their team's work. That means hiring, critique, career growth and getting design into planning, and running critique is where most seniors start.",
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
        typicalTiming: "2-4 years in, if research is the phase of a project you like best",
        why: "You probably run interviews and usability tests already. Full-time research goes deeper on study design and making sense of findings, and on changing roadmaps with evidence.",
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
          "4-6 years in, usually after you've been making scope calls alongside a PM",
        why: "Designers do discovery and know the users better than almost anyone. PM adds business metrics, trade-offs with engineering and owning the roadmap.",
        skillsToAdd: [
          "Writing PRDs with success metrics",
          "SQL or product analytics for self-serve data",
          "Prioritization frameworks and roadmap planning",
          "Pricing and business model basics",
        ],
        proof:
          "Work where you shaped what got built as well as how it looked, with the outcome that followed.",
      },
    ],
    faqs: [
      {
        question: "What comes after senior UX designer?",
        answer:
          "Either lead or principal designer, or design manager. Leads and principals set standards and take the hardest problems, while managers hire, coach and run critique. At mature companies neither ranks above the other. The real choice is whether you want to be judged on your own work or your team's.",
      },
      {
        question: "Is UX design oversaturated?",
        answer:
          "The entry level is crowded, largely because many junior designers came through programs that produce similar portfolios. Mid and senior designers with shipped results are in a different market. Early on, one or two case studies with real constraints and results will do more than another practice project.",
      },
      {
        question: "Can a UX designer become a product manager?",
        answer:
          "Yes, and it's one of the more natural PM backgrounds, since you already do discovery and understand users. The usual gaps are business metrics, trade-offs with engineering and owning a roadmap. Take on some of that in your current job before applying, so your resume can show it.",
      },
    ],
  },

  "rpa-developer": {
    overview:
      "Most RPA (robotic process automation) careers start on one platform and then grow up or out. Up leads to solution architecture and running an automation Center of Excellence. Out leads to broader automation that mixes bots with APIs, integration tools and AI that reads documents. Screen-clicking bots are a shrinking share of the work, so developers who pick the right method for each process move fastest.",
    moves: [
      {
        toRole: "RPA Solution Architect",
        moveType: "step_up",
        typicalTiming:
          "4-6 years in, typically after building reusable components other developers depend on",
        why: "If you've maintained a big set of bots, you've seen what happens when dozens of them share queues, logins and error handling with no plan. Architects are the ones who prevent that.",
        skillsToAdd: [
          "UiPath Automation Solution Architect Professional certification",
          "Orchestrator queue and robot capacity design",
          "Credential vault integration such as CyberArk",
          "Reusable frameworks and libraries (REFramework, shared libraries)",
        ],
        proof:
          "An automation framework or architecture you designed, how many processes run on it, and how reliably.",
      },
      {
        toRole: "Automation CoE Lead",
        moveType: "step_up",
        typicalTiming:
          "6-8 years in, usually after running intake and prioritization for an automation program",
        why: "A Center of Excellence lead decides which processes get automated, sets the rules and makes the value case to leadership. Turning down a poor candidate process takes the same judgment, and experienced developers do that all the time.",
        skillsToAdd: [
          "Opportunity assessment and ROI modeling",
          "Automation governance and change control",
          "Citizen developer programs",
          "Reporting portfolio value to executives",
        ],
        proof:
          "An intake or governance process you ran, with the value it delivered across all the automations.",
      },
      {
        toRole: "Integration Engineer",
        toSlug: "integration-engineer",
        moveType: "lateral",
        typicalTiming: "2-4 years in, if you already call APIs from inside your bots",
        why: "Plenty of the processes you automate through the screen have an API underneath. Working at that level is faster and far less fragile, and you already understand the business processes involved.",
        skillsToAdd: [
          "REST APIs and OAuth 2.0",
          "An iPaaS such as MuleSoft, Boomi or Workato",
          "Python or C#",
          "Webhooks and message queues",
        ],
        proof:
          "An automation where you replaced screen steps with API calls, with the reliability or speed gain.",
      },
      {
        toRole: "Intelligent Automation Engineer",
        moveType: "lateral",
        typicalTiming: "Any time after two years, especially if you've worked on document-heavy processes",
        why: "Invoices, emails and forms with changing layouts were always where bots struggled. Document AI and LLMs handle them now, and they need exception handling and human review even more than bots do.",
        skillsToAdd: [
          "UiPath Document Understanding or Azure AI Document Intelligence",
          "LLM APIs for classification and extraction",
          "Human-in-the-loop review design",
          "Python",
        ],
        proof:
          "An automation with a document AI or LLM step, its accuracy, and the share of cases that still need a person to check.",
      },
      {
        toRole: "Business Analyst",
        toSlug: "business-analyst",
        moveType: "pivot",
        typicalTiming:
          "3-5 years in, if mapping out how a process really works is what you're best at",
        why: "Much of an RPA developer's week goes to mapping processes, writing design documents and chasing exceptions with operations teams. Business analysis makes that the main job, beyond automation.",
        skillsToAdd: [
          "BPMN process modeling",
          "Requirements and user story writing",
          "Process mining with Celonis",
          "IIBA ECBA or CCBA certification",
        ],
        proof:
          "Process documentation you wrote and a process change you recommended, alongside the bots you built.",
      },
    ],
    faqs: [
      {
        question: "Can an RPA developer become a software engineer?",
        answer:
          "Yes, but low-code platform experience alone won't get you through software interviews. Build depth in C# or Python, since both show up in RPA work. Then ship something outside the platform. Integration and automation engineering roles are a common stepping stone.",
      },
      {
        question: "Which certifications help an RPA developer move up?",
        answer:
          "Platform certifications, which count for more in RPA than in most engineering fields because many employers are platform partners. The common ones are UiPath Automation Developer Professional, Automation Anywhere Certified Advanced RPA Professional and Microsoft Certified: Power Automate RPA Developer Associate. Add your platform's architect-level certification when you aim for solution architect roles.",
      },
      {
        question: "Should RPA developers learn Python?",
        answer:
          "Yes. Python handles the parts of a process a bot does badly, like APIs, data cleanup, document AI and LLM calls. It also makes you hireable outside one vendor's platform, which matters if your employer ever drops that platform.",
      },
    ],
  },

  "automation-engineer": {
    overview:
      "'Automation engineer' can mean test, infrastructure or business-process automation, and your path depends on which one you do. The best next move usually puts that in the title. Test automation leads toward SDET and quality engineering. Infrastructure automation leads to DevOps and platform work, and process automation to integration and AI agents. All three build things people trust to run with nobody watching.",
    moves: [
      {
        toRole: "Automation Architect",
        moveType: "step_up",
        typicalTiming:
          "6-8 years in, usually after building shared frameworks other engineers now maintain",
        why: "Architects decide how automation gets built across a company, including the tools, how failures surface and who owns what. If you've handed a framework to another team and watched it survive, you know what that takes.",
        skillsToAdd: [
          "Workflow orchestration with Temporal or Apache Airflow",
          "Designing for observability and failure recovery",
          "Governance for code review, ownership and secrets",
          "Cost-benefit modeling for automation candidates",
        ],
        proof:
          "A framework or standard several teams build automation on, with its adoption and reliability.",
      },
      {
        toRole: "DevOps Engineer",
        toSlug: "devops-engineer",
        moveType: "lateral",
        typicalTiming: "2-4 years in, if your automation already runs in CI or touches infrastructure",
        why: "DevOps is automation applied to builds, deploys, environments and recovery. You already write the scripts. The move adds cloud infrastructure and responsibility for production.",
        skillsToAdd: [
          "Terraform",
          "Docker and Kubernetes",
          "CI/CD with GitHub Actions or GitLab CI",
          "AWS Certified SysOps Administrator Associate",
        ],
        proof:
          "Pipeline or infrastructure automation you owned in production, with deployment or recovery numbers.",
      },
      {
        toRole: "AI Engineer",
        toSlug: "ai-engineer",
        moveType: "lateral",
        typicalTiming: "Any time after 2-3 years of automation work in Python or TypeScript",
        why: "An AI agent is automation where a model makes some of the decisions. The hard parts are triggers, permissions, retries, monitoring and a fallback for when the agent gets it wrong, and you build those already.",
        skillsToAdd: [
          "LLM APIs with tool calling",
          "Agent frameworks such as LangGraph",
          "Evaluation and regression testing for LLM steps",
          "Guardrails and human approval steps",
        ],
        proof:
          "An automation with an LLM step running on real work, its accuracy, and how failures get caught.",
      },
      {
        toRole: "Software Engineer",
        toSlug: "software-engineer",
        moveType: "lateral",
        typicalTiming: "3-5 years in, once your code has grown well past one-off scripts",
        why: "Code that runs unattended and has to recover from failure is harder than a lot of what junior developers write. What you'd add is feature work in larger codebases, with design reviews and data modeling.",
        skillsToAdd: [
          "Data structures and algorithms for interviews",
          "One application framework in depth",
          "Relational data modeling",
          "System design basics",
        ],
        proof:
          "A substantial program or service you wrote and maintained, bigger than a single-purpose script.",
      },
      {
        toRole: "Technical Program Manager",
        moveType: "pivot",
        typicalTiming:
          "5-7 years in, usually after coordinating automation rollouts across several teams",
        why: "Getting automation approved and adopted means herding process owners, IT, security and engineering. Technical program managers do that full time, and your technical depth makes people take you seriously.",
        skillsToAdd: [
          "Program planning and dependency tracking",
          "Risk and status reporting to leadership",
          "Jira or Asana at program level",
          "PMP or PMI-ACP certification",
        ],
        proof:
          "A cross-team rollout you coordinated, with the timeline, the teams involved and the result.",
      },
    ],
    faqs: [
      {
        question: "Is automation engineering a good career path?",
        answer:
          "Yes, once you pick a lane. Testing, infrastructure and business operations all want automation skills. But a resume that mixes all three without depth is hard to place. Decide which kind of automation you want to be hired for next and make it the headline.",
      },
      {
        question: "Can an automation engineer become a software developer?",
        answer:
          "Often, yes, because you already write code that has to run reliably with nobody watching. Contribute to the main application where you can, and build one substantial project in a mainstream language. Expect standard developer interviews with coding problems and some system design.",
      },
      {
        question: "Will AI agents replace automation engineers?",
        answer:
          "No. Agents change what gets automated, but someone still has to own it. Agents need triggers, permissions, monitoring, fallbacks and a person accountable when they act wrongly. That's the reliability work automation engineers already do, so adding LLM tools to your skills is the practical response.",
      },
    ],
  },
};
