// Genuine per-role content for /interview-prep/[role] and /resume-examples/[role].
//
// These pages previously interpolated a role label into fixed sentences, which
// produced ~120 near-identical URLs. Everything here is written per role: the
// questions a Backend Developer actually gets are not the Frontend questions
// with a word swapped, and the metrics that belong on a Data Analyst CV are not
// the ones that belong on an SRE's.
//
// Roles without an entry render noindex and stay out of the sitemap (see
// hasRoleContent), so the site never ships a templated page to search engines.
// To add a role, write real content for it — do not interpolate.

export interface BulletExample {
  /** A real-world weak bullet of the kind this role's CVs actually contain. */
  weak: string;
  /** The same claim, rewritten the way a strong CV for this role states it. */
  strong: string;
  /** Why the rewrite works — role-specific, not generic advice. */
  why: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SeniorityStep {
  level: string;
  expectation: string;
}

export interface RoleContent {
  /** One-paragraph description of what this role is evaluated on. */
  intro: string;
  /** What interviews for this role actually test, and how each is probed. */
  interviewFocus: { area: string; detail: string }[];
  /** Real technical / craft questions asked in this role's loops. */
  technicalQuestions: string[];
  /** Behavioural prompts that recur specifically for this role. */
  behaviouralQuestions: string[];
  /** Questions worth asking the interviewer — role-specific signal. */
  questionsToAsk: string[];
  /** Long-form FAQ, rendered as FAQPage structured data. */
  faq: FaqItem[];
  /** An example professional summary for this role. */
  summaryExample: string;
  /** Before/after bullets drawn from this role's real failure modes. */
  bulletExamples: BulletExample[];
  /** Skills hiring managers scan for first. */
  coreSkills: string[];
  /** Tools and platforms that belong in this role's skills section. */
  tools: string[];
  /** The metrics that make this role's bullets credible. */
  metrics: string[];
  /** What changes between levels, for CV positioning. */
  seniority: SeniorityStep[];
  /** Role-specific CV mistakes that get candidates screened out. */
  redFlags: string[];
}

export const ROLE_CONTENT: Record<string, RoleContent> = {
  // ─── Software Engineering ──────────────────────────────────────────────────

  "software-engineer": {
    intro:
      "Software Engineer loops are weighted toward problem-solving under observation. Most companies run two coding rounds, one system design round, and one behavioural round; the coding rounds screen for correctness and communication in roughly equal measure, and the design round is where mid-level and senior candidates are separated. Your CV is read for evidence that you have owned something in production, not just shipped features.",
    interviewFocus: [
      { area: "Coding under observation", detail: "Data structures and algorithms applied to a problem you have not seen, narrated aloud. Interviewers score how you clarify ambiguity and test your own solution as much as whether you reach the optimal complexity." },
      { area: "System design", detail: "Designing a service end to end — API surface, data model, caching, failure modes. Expected from mid-level upward; at junior level it is replaced with a code-extension exercise." },
      { area: "Production ownership", detail: "What broke, how you found it, what you changed so it could not recur. This is where on-call experience and postmortem habits show." },
      { area: "Code review and collaboration", detail: "How you give and take review feedback, and how you handle disagreement about technical direction." },
    ],
    technicalQuestions: [
      "Walk me through what happens between typing a URL and the page rendering.",
      "Design a URL shortener. How do you generate keys, and what breaks at 10x traffic?",
      "You have a service whose p99 latency tripled overnight with no deploy. How do you investigate?",
      "Explain the difference between optimistic and pessimistic locking, and when you would pick each.",
      "How would you migrate a heavily-read table to a new schema with zero downtime?",
      "When would you choose a message queue over a synchronous call, and what new failure modes does that introduce?",
      "Given a large log file that does not fit in memory, find the top 10 most frequent entries.",
    ],
    behaviouralQuestions: [
      "Tell me about a production incident you caused. How did you find it and what did you change afterwards?",
      "Describe a time you disagreed with a technical decision your team made. What did you do?",
      "Tell me about code you inherited that you had to significantly change. How did you de-risk it?",
      "Describe a project where you had to cut scope. How did you decide what to drop?",
      "Tell me about a time you were blocked by another team.",
    ],
    questionsToAsk: [
      "What does on-call look like here, and how often does the rotation page?",
      "How long does it take from merged PR to production?",
      "What is the test and review culture — what stops a bad change reaching users?",
      "What is the largest source of technical debt the team is carrying right now?",
    ],
    faq: [
      {
        question: "How many rounds does a Software Engineer interview usually have?",
        answer:
          "Four to six. A recruiter screen, one or two technical phone screens, then an onsite loop of two coding rounds, one system design round (mid-level and above), and a behavioural or hiring-manager round. Larger companies add a values or bar-raiser round. The whole process typically runs two to five weeks, and the system design round carries the most weight in levelling decisions.",
      },
      {
        question: "Do I still need to grind LeetCode for Software Engineer interviews?",
        answer:
          "You need fluency in the common patterns rather than volume. Roughly 150 well-understood problems covering arrays and hashing, two pointers, sliding window, binary search, trees and graphs, and dynamic programming will cover the large majority of what gets asked. Practising aloud matters more than practising more — interviewers score communication, and candidates who solve silently frequently fail rounds they technically passed.",
      },
      {
        question: "What should a Software Engineer CV lead with?",
        answer:
          "Systems you owned and their measurable effect. A line like \"Cut checkout API p99 from 1.2s to 240ms by replacing N+1 queries with a batched loader, supporting 40k RPS at peak\" outperforms a list of languages, because it demonstrates scale, diagnosis, and outcome at once. Keep the languages and frameworks in a compact skills block for the ATS, and spend the bullets on impact.",
      },
      {
        question: "How much system design do I need at junior level?",
        answer:
          "Less than you fear, but not zero. Junior loops rarely include a dedicated design round; instead you are asked to extend the code you just wrote, which tests the same instinct at smaller scale. Being able to explain why you split a class, where you put validation, and what happens when the downstream call fails is enough. Formal design rounds usually start at the two-to-four-year mark.",
      },
    ],
    summaryExample:
      "Backend-leaning software engineer with 6 years building payment and identity services on AWS. Owned the migration of a monolithic billing module to three independently deployable services, cutting deploy time from 40 minutes to 6 and halving change-failure rate. Comfortable on-call for systems handling 40k RPS.",
    bulletExamples: [
      {
        weak: "Responsible for developing new features for the company's main web application.",
        strong: "Shipped 14 features to a React/Node application serving 2M monthly users, including a self-serve refund flow that removed ~600 support tickets per month.",
        why: "\"Responsible for\" describes a job description, not a person. Engineering CVs are scanned for scale (2M users), volume (14 features), and second-order effect (600 tickets) — the refund flow is memorable because it connects code to a business cost.",
      },
      {
        weak: "Improved application performance and fixed various bugs.",
        strong: "Reduced p99 API latency from 1.2s to 240ms by batching N+1 ORM queries and adding a Redis read-through cache, verified with load tests at 3x production traffic.",
        why: "\"Improved performance\" is unfalsifiable. Naming the before and after, the specific cause (N+1), the fix, and the verification method is what convinces an interviewer you diagnosed the problem rather than guessed at it.",
      },
      {
        weak: "Worked with the team using Agile methodology to deliver projects on time.",
        strong: "Led the technical design for a zero-downtime Postgres migration of a 400M-row table, coordinating a four-engineer team across two sprints with no customer-visible errors.",
        why: "Agile ceremony participation is assumed and wastes a line. Replacing it with a specific technically hard thing you coordinated shows both scope (400M rows, 4 engineers) and the outcome that mattered (no downtime).",
      },
    ],
    coreSkills: ["Data structures & algorithms", "System design", "API design", "Relational data modelling", "Concurrency", "Testing & CI", "Debugging in production", "Code review"],
    tools: ["Python", "Java", "Go", "TypeScript", "PostgreSQL", "Redis", "Kafka", "Docker", "Kubernetes", "AWS", "Terraform", "Git", "Datadog"],
    metrics: ["Requests per second served", "p95/p99 latency before and after", "Deploy frequency and lead time", "Change-failure rate", "Incident count or MTTR", "Cost per request or monthly infra spend", "Test coverage on critical paths"],
    seniority: [
      { level: "Junior (0–2 yrs)", expectation: "Ships well-scoped tickets with review. CV should show working software, tests, and a language you can defend in depth." },
      { level: "Mid (2–5 yrs)", expectation: "Owns features end to end including rollout and monitoring. CV should show at least one system you were the primary owner of." },
      { level: "Senior (5–8 yrs)", expectation: "Owns design across services and mentors. CV should show a migration or architecture change with measured before/after." },
      { level: "Staff (8+ yrs)", expectation: "Sets direction beyond one team. CV should show org-level impact — a standard adopted, a platform others build on, or a multi-quarter technical strategy." },
    ],
    redFlags: [
      "A skills section listing 30+ technologies — reviewers read it as unfamiliarity with all of them.",
      "No indication of scale anywhere (users, RPS, data volume), which makes every achievement unrankable.",
      "Bullets that describe the team's work with no signal about which parts were yours.",
      "Listing 'Agile', 'Scrum', and 'SDLC' as skills — these are assumed and consume scanning attention.",
    ],
  },

  "frontend-developer": {
    intro:
      "Frontend interviews have moved away from algorithm puzzles toward building something real in the browser. Expect a live component build, questions about rendering and state, and increasingly a round on accessibility and performance budgets. Hiring managers read frontend CVs for evidence you understand what happens after the component renders — bundle size, Core Web Vitals, and how the UI behaves on a slow device.",
    interviewFocus: [
      { area: "Live component build", detail: "Implementing something like a typeahead, modal, or data table in a sandbox, usually without a component library. Scored on state handling, edge cases (empty, loading, error), and whether you reach for a keyboard-accessible pattern unprompted." },
      { area: "Browser and rendering fundamentals", detail: "The event loop, reflow versus repaint, how the browser paints, and why a given interaction drops frames. This is what separates candidates who use a framework from candidates who understand one." },
      { area: "Accessibility", detail: "Semantic markup, focus management, ARIA used correctly and sparingly. Increasingly a scored round rather than a bonus, especially at companies with legal exposure." },
      { area: "Performance", detail: "Core Web Vitals, bundle splitting, image strategy, and what you would measure first on a slow page." },
    ],
    technicalQuestions: [
      "Build an accessible typeahead with keyboard navigation and a debounced remote search.",
      "Explain the event loop, and predict the output order of a snippet mixing setTimeout, a promise, and synchronous logs.",
      "What causes cumulative layout shift, and how would you fix a page scoring poorly on it?",
      "When does React re-render a component, and how would you diagnose an unnecessary re-render?",
      "What is the difference between a controlled and uncontrolled input, and when does that choice actually matter?",
      "How would you cut a 2MB JavaScript bundle in half without removing features?",
      "How do you manage focus when a modal opens and closes?",
    ],
    behaviouralQuestions: [
      "Tell me about a time you pushed back on a design that would have been bad for accessibility or performance.",
      "Describe a UI bug that only reproduced for some users. How did you track it down?",
      "Tell me about working with a designer whose spec was ambiguous.",
      "Describe a refactor of a component that had grown unmaintainable.",
      "Tell me about a time you shipped something that regressed a key metric.",
    ],
    questionsToAsk: [
      "Do you have a performance budget, and what happens when a PR exceeds it?",
      "How do designers and engineers hand off work here?",
      "What is your browser and device support matrix?",
      "Is accessibility tested in CI, or reviewed manually, or neither?",
    ],
    faq: [
      {
        question: "What does a Frontend Developer interview actually involve in 2026?",
        answer:
          "Most loops now centre on a live build rather than algorithms: you implement a component such as a typeahead, star rating, or nested comment thread in a browser sandbox in 45–60 minutes. Around that you get a fundamentals round (event loop, rendering, CSS layout), often an accessibility or performance round, and a behavioural round. Some companies still include one algorithm screen, but it is increasingly rare for senior frontend roles.",
      },
      {
        question: "How much JavaScript do I need to know beyond React?",
        answer:
          "Enough to explain what React is doing for you. Interviewers commonly ask you to predict output order across setTimeout, promises and microtasks, implement debounce from scratch, or explain closures and prototypal inheritance. Candidates who only know framework idioms tend to fail these. Knowing the platform — the DOM, events, the browser's rendering pipeline — is what differentiates mid from senior in this role.",
      },
      {
        question: "What belongs on a Frontend Developer CV?",
        answer:
          "Measurable interface outcomes. Bundle size reduced, Lighthouse or Core Web Vitals scores moved, conversion or task-completion rates improved, accessibility violations closed. \"Cut LCP from 4.1s to 1.6s on the product page, lifting mobile conversion 8%\" is worth more than any list of frameworks, because it proves you connect frontend work to user behaviour. Include a link to deployed work — frontend is one of the few roles where reviewers actually click.",
      },
      {
        question: "Do I need a portfolio site as a Frontend Developer?",
        answer:
          "A link to something real matters more than a portfolio site as such. Two or three deployed projects with visible source code do the job, and hiring managers will look at your CSS and your accessibility choices. A portfolio site that is itself slow or inaccessible actively hurts you, so if you build one, treat it as a work sample and hold it to the standards you would claim in an interview.",
      },
    ],
    summaryExample:
      "Frontend developer with 5 years in React and TypeScript, focused on performance and accessibility in high-traffic e-commerce. Cut largest-contentful-paint from 4.1s to 1.6s across the checkout funnel, lifting mobile conversion 8%. Led the WCAG 2.2 AA remediation of a 60-screen product surface.",
    bulletExamples: [
      {
        weak: "Built responsive user interfaces using React, Redux, and CSS.",
        strong: "Rebuilt the product listing page in React with virtualised rendering, holding 60fps scroll on 500+ items and cutting time-to-interactive from 6.2s to 2.1s on mid-tier Android.",
        why: "Listing React and Redux tells a reviewer nothing — nearly every applicant lists them. Naming the technique (virtualisation), the constraint (mid-tier Android), and the measured result is what proves the depth the tools alone imply.",
      },
      {
        weak: "Made the website accessible and compliant with standards.",
        strong: "Closed 340 axe-reported WCAG 2.2 AA violations across 60 screens and added automated accessibility checks to CI, preventing regressions on every subsequent PR.",
        why: "\"Made accessible\" is unverifiable and reads as box-ticking. The count, the standard, and — most importantly — the CI gate show you fixed the process rather than doing a one-off cleanup, which is what senior frontend hiring looks for.",
      },
      {
        weak: "Worked closely with designers to implement mockups.",
        strong: "Built and documented a 40-component design system in Storybook adopted by 5 product teams, cutting new-feature UI build time roughly 30%.",
        why: "Implementing mockups is the baseline expectation for the role. Reframing the same collaboration as leverage — a system other teams adopted — moves the bullet from execution to impact.",
      },
    ],
    coreSkills: ["Semantic HTML", "Modern CSS (grid, flexbox, container queries)", "JavaScript fundamentals", "TypeScript", "React", "State management", "Web accessibility (WCAG)", "Core Web Vitals", "Cross-browser debugging"],
    tools: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vite", "Webpack", "Jest", "Playwright", "Storybook", "Figma", "Lighthouse", "axe DevTools"],
    metrics: ["LCP, INP, CLS before and after", "Bundle size in KB", "Time to interactive", "Lighthouse score", "Accessibility violations closed", "Conversion or task-completion rate", "Components shipped and reused"],
    seniority: [
      { level: "Junior (0–2 yrs)", expectation: "Builds components to spec. CV should show deployed work and comfort with a framework plus real CSS." },
      { level: "Mid (2–5 yrs)", expectation: "Owns features and their performance. CV should show at least one measured Core Web Vitals or bundle improvement." },
      { level: "Senior (5–8 yrs)", expectation: "Owns architecture and standards. CV should show a design system, a migration, or accessibility work adopted beyond one team." },
      { level: "Lead (8+ yrs)", expectation: "Sets frontend direction. CV should show framework or tooling decisions and their organisational effect." },
    ],
    redFlags: [
      "No link to anything deployed — unusual and conspicuous for this role.",
      "Framework lists with no evidence of platform fundamentals underneath.",
      "No performance or accessibility numbers anywhere, which reads as pixel-pushing.",
      "Claiming 'pixel-perfect' implementations, which signals a handoff mindset rather than a product one.",
    ],
  },

  "backend-developer": {
    intro:
      "Backend interviews concentrate on data correctness and behaviour under failure. The coding round is usually less about clever algorithms than about modelling a domain cleanly; the design round probes whether you understand consistency, idempotency, and what happens when a downstream dependency stops responding. Backend CVs are read for scale and for evidence you have operated what you built.",
    interviewFocus: [
      { area: "API and data modelling", detail: "Designing endpoints and schemas for a described domain. Interviewers watch for normalisation judgement, index awareness, and whether your API is idempotent where it needs to be." },
      { area: "Distributed systems behaviour", detail: "Retries, timeouts, exactly-once versus at-least-once delivery, and the failure modes each choice creates. The most common senior-level differentiator." },
      { area: "Database depth", detail: "Transactions and isolation levels, query plans, index selection, and how you would migrate a large table safely." },
      { area: "Operational maturity", detail: "How you monitor, what you alert on, and how you have handled an incident in a service you owned." },
    ],
    technicalQuestions: [
      "Design an idempotent payment API. What happens when the client retries after a timeout?",
      "Explain the isolation levels and give a concrete anomaly each one permits.",
      "A query that ran in 20ms is now taking 4 seconds. Walk me through your diagnosis.",
      "How do you implement rate limiting across a fleet of stateless servers?",
      "When would you denormalise, and what do you accept in exchange?",
      "Design the schema and API for a multi-tenant scheduling system.",
      "Explain how you would guarantee a job runs exactly once given an at-least-once queue.",
    ],
    behaviouralQuestions: [
      "Tell me about a data corruption or consistency bug you found. How did you fix it and backfill?",
      "Describe an incident where a dependency you did not own failed. How did you contain it?",
      "Tell me about a schema decision you later regretted.",
      "Describe a time you had to make a service backward compatible during a migration.",
      "Tell me about a performance problem that turned out to have a non-obvious cause.",
    ],
    questionsToAsk: [
      "How do you handle schema migrations against large tables in production?",
      "What is your approach to service boundaries — how did the current split come about?",
      "What does your alerting look like, and what is the current false-positive rate?",
      "How is data consistency handled between services today?",
    ],
    faq: [
      {
        question: "What is the difference between a Backend Developer and a Full Stack Developer interview?",
        answer:
          "Depth versus breadth. Backend loops go deep on one axis — you may spend a full round on database isolation levels or queue semantics, and you are expected to reason precisely about failure. Full stack loops sample more widely and accept less depth in each area, but add a UI build round. If you are targeting backend roles, your CV should show a system you operated at scale rather than a broad list of layers you have touched.",
      },
      {
        question: "How much do backend interviews test SQL?",
        answer:
          "More than candidates expect, and increasingly as a standalone round. Typical asks include writing a query with a window function, explaining a query plan, choosing an index for a given access pattern, and describing how you would migrate a large table without downtime. Knowing an ORM is not a substitute; interviewers routinely ask what SQL your ORM emits and why it is slow.",
      },
      {
        question: "What metrics belong on a Backend Developer CV?",
        answer:
          "Throughput, latency percentiles, data volume, and reliability. Concretely: requests per second, p95 and p99 latency before and after your change, rows or events processed, uptime or error-budget performance, and infrastructure cost. \"Processed 4B events/day\" and \"cut p99 from 800ms to 120ms\" are the two shapes of bullet that make a backend CV rank, because both imply the engineering underneath them.",
      },
      {
        question: "Do I need Kubernetes and cloud experience for backend roles?",
        answer:
          "For most roles you need enough to deploy and debug your own service, not enough to run the platform. Being able to read a pod's logs, understand why it was OOM-killed, reason about resource limits, and write a basic Terraform or Helm change covers the majority of expectations. Deep Kubernetes internals belong to platform and SRE roles; claiming them without depth invites questions you will not enjoy.",
      },
    ],
    summaryExample:
      "Backend engineer with 7 years building high-throughput services in Go and Python. Designed the event pipeline processing 4B events/day at 99.98% availability, and led the sharding of a 12TB Postgres cluster with no customer-visible downtime. Deep in distributed transactions, idempotency, and query optimisation.",
    bulletExamples: [
      {
        weak: "Developed REST APIs and microservices using Node.js and Express.",
        strong: "Designed and operated 6 Go microservices handling 30k RPS at p99 < 150ms, including the idempotency layer that eliminated duplicate charges during client retries.",
        why: "Every backend CV claims REST APIs. Throughput, latency, and a named hard problem (idempotent retries preventing double charges) give the reviewer something to rank you by and an obvious thing to ask about.",
      },
      {
        weak: "Optimised database queries to improve system performance.",
        strong: "Cut the reporting query from 42s to 900ms by replacing a correlated subquery with a lateral join and adding a covering index, unblocking same-day reporting for 300 finance users.",
        why: "Backend interviewers want the mechanism. Naming the actual technique proves you diagnosed a query plan rather than adding indexes at random, and the user count establishes why it mattered.",
      },
      {
        weak: "Migrated legacy systems to a modern cloud architecture.",
        strong: "Migrated a 12TB Postgres monolith to 8 shards using dual-write and backfill, cutting p95 write latency 60% with zero downtime and no data loss across a 6-week cutover.",
        why: "\"Migrated to the cloud\" could mean anything from a lift-and-shift to a rewrite. The data volume, the specific strategy (dual-write and backfill), and the zero-downtime constraint are what make this a senior-level bullet.",
      },
    ],
    coreSkills: ["API design", "Relational data modelling", "SQL and query optimisation", "Distributed systems", "Caching strategies", "Message queues", "Concurrency", "Observability", "Security fundamentals"],
    tools: ["Go", "Python", "Java", "Node.js", "PostgreSQL", "MySQL", "Redis", "Kafka", "RabbitMQ", "gRPC", "Docker", "Kubernetes", "AWS", "Terraform", "Prometheus", "Grafana"],
    metrics: ["Requests per second", "p95/p99 latency before and after", "Events or rows processed per day", "Uptime / error budget", "Database size and shard count", "Infra cost per request", "Incident count and MTTR"],
    seniority: [
      { level: "Junior (0–2 yrs)", expectation: "Implements endpoints against an existing design. CV should show solid SQL and one language in depth." },
      { level: "Mid (2–5 yrs)", expectation: "Owns a service including its on-call. CV should show throughput or latency numbers you are accountable for." },
      { level: "Senior (5–8 yrs)", expectation: "Designs across service boundaries. CV should show a migration, sharding, or consistency problem you led." },
      { level: "Staff (8+ yrs)", expectation: "Owns platform-level architecture. CV should show standards or infrastructure other teams build on." },
    ],
    redFlags: [
      "No numbers for scale — backend work is judged on load, and its absence suggests low-traffic systems.",
      "'Microservices' claimed with no mention of how services communicate or fail.",
      "No operational signal at all: no on-call, no incidents, no monitoring.",
      "ORM-only vocabulary with no evidence of SQL underneath it.",
    ],
  },
  "full-stack-developer": {
    intro:
      "Full stack loops sample breadth deliberately: a UI build, an API and schema design, and a round on how the two meet — auth, caching, and where validation lives. The trap is presenting as a generalist with no depth anywhere. Strong full stack CVs name one end as the deeper one and show a feature owned from schema through interface.",
    interviewFocus: [
      { area: "End-to-end feature design", detail: "Given a feature, design the schema, the API, and the interface, and justify where each piece of logic lives. The signature full stack round." },
      { area: "Auth and session handling", detail: "Sessions versus tokens, refresh strategies, CSRF and XSS defences, and where authorisation is enforced. Asked because it is exactly the seam full stack engineers own." },
      { area: "Frontend competence", detail: "A component build with real state — usually lighter than a dedicated frontend loop but still hands-on." },
      { area: "Backend competence", detail: "Data modelling and a query or caching problem, again lighter than a specialist round but expecting correct instincts." },
    ],
    technicalQuestions: [
      "Design a commenting system with nested replies — schema, API, and rendering strategy.",
      "Where do you validate input: client, API, or database? Defend covering more than one.",
      "Explain how you would implement 'stay signed in' securely, including refresh token rotation.",
      "The page is slow. How do you determine whether the bottleneck is frontend, network, or backend?",
      "How would you add optimistic UI updates without corrupting state when the request fails?",
      "Design file upload for large files, covering both the browser and server sides.",
      "What changes about your caching strategy when the same data is rendered server-side and fetched client-side?",
    ],
    behaviouralQuestions: [
      "Tell me about a feature you built entirely on your own, from schema to interface.",
      "Describe a bug that crossed the frontend/backend boundary and how you isolated it.",
      "How do you decide what to build yourself versus what to pull in a library for?",
      "Tell me about a time you had to work in a part of the stack you were weakest in.",
      "Describe a project where you had to make product decisions as well as technical ones.",
    ],
    questionsToAsk: [
      "How is ownership split — do engineers here own features end to end or by layer?",
      "Where does the team draw the line between frontend and backend responsibility?",
      "What is the deployment story for the frontend and the API — coupled or independent?",
      "How much product input do engineers have on scope?",
    ],
    faq: [
      {
        question: "Is 'full stack' still a credible title in 2026?",
        answer:
          "Yes, and it is strongest at startups and scale-ups where owning a feature end to end is the job. It is weakest when it reads as an absence of specialisation. The way to keep it credible on a CV is to declare a centre of gravity — \"full stack, backend-leaning\" — and then prove that depth with one system you owned properly, while showing the breadth through features delivered across the stack.",
      },
      {
        question: "How do full stack interviews differ from specialist ones?",
        answer:
          "You get sampled on more axes with less depth on each. A typical loop is one component build, one API and schema design, one round on the seam between them (auth, caching, data fetching), and a behavioural round. Specialists get one deep round instead. This means full stack candidates fail most often on the seam questions — where validation belongs, how sessions are refreshed — rather than on either end individually.",
      },
      {
        question: "What should a Full Stack Developer CV emphasise?",
        answer:
          "Features owned from database to interface, with impact stated at the product level. \"Built subscription billing end to end — Stripe integration, Postgres schema, and self-serve upgrade UI — lifting paid conversion 14%\" demonstrates the whole span in one line. Add a note about which end you are deeper in, because hiring managers are staffing a specific gap and a CV that answers that question is easier to route.",
      },
      {
        question: "Do full stack roles pay less than specialist roles?",
        answer:
          "Not inherently — the pay gap tracks company type more than title. Full stack roles cluster at startups and mid-size product companies, where compensation is more variable; the highest specialist bands sit at large tech companies that hire by discipline. A full stack engineer with genuine depth in one area typically interviews successfully for the specialist role too, which is the more reliable route to the higher band.",
      },
    ],
    summaryExample:
      "Full stack engineer (backend-leaning) with 6 years at early-stage SaaS. Owned subscription billing end to end — Stripe integration, Postgres schema, and self-serve upgrade flow — lifting paid conversion 14%. Comfortable from query plans to React state, and the first engineer on-call for a platform serving 500k users.",
    bulletExamples: [
      {
        weak: "Worked on both frontend and backend development using the MERN stack.",
        strong: "Owned the subscription billing feature end to end: Postgres schema, Stripe webhook handling with idempotency, and the self-serve upgrade UI — lifting paid conversion from 3.1% to 3.5%.",
        why: "\"Both frontend and backend\" is the claim every full stack CV makes. Walking one feature through all three layers proves the span concretely, and the idempotency detail signals real depth rather than tutorial familiarity.",
      },
      {
        weak: "Built and maintained web applications for various clients.",
        strong: "Delivered 4 client applications as sole engineer, including a logistics dashboard handling 20k daily events that replaced a manual process costing ~15 hours/week.",
        why: "\"Various clients\" hides the scope. Naming the count, the sole-engineer ownership, and the process the software replaced converts vague agency work into evidence of independent delivery.",
      },
      {
        weak: "Used AWS for deployment and hosting of applications.",
        strong: "Moved deploys from manual EC2 uploads to a Terraform-defined ECS pipeline with GitHub Actions, cutting release time from 2 hours to 9 minutes and enabling daily releases.",
        why: "Naming a cloud provider is not an achievement. The before/after on release time, and the behaviour it unlocked (daily releases), turn infrastructure familiarity into a measurable outcome.",
      },
    ],
    coreSkills: ["API design", "Relational data modelling", "React / component architecture", "Authentication & authorisation", "Caching", "Testing across layers", "Deployment pipelines", "Debugging across the stack"],
    tools: ["TypeScript", "React", "Next.js", "Node.js", "Python", "PostgreSQL", "Redis", "Prisma", "Docker", "AWS", "Vercel", "GitHub Actions", "Stripe"],
    metrics: ["Features shipped end to end", "Conversion or activation lift", "p95 latency", "Users or tenants served", "Release frequency and lead time", "Cost saved or manual hours removed"],
    seniority: [
      { level: "Junior (0–2 yrs)", expectation: "Builds within an existing app across layers. CV should show one deployed full-stack project you can explain completely." },
      { level: "Mid (2–5 yrs)", expectation: "Owns features end to end. CV should show a feature from schema to UI with a product metric attached." },
      { level: "Senior (5–8 yrs)", expectation: "Owns architecture and makes build/buy calls. CV should show a system design decision and its consequences." },
      { level: "Lead (8+ yrs)", expectation: "Sets technical direction and often hires. CV should show team-level and product-level outcomes together." },
    ],
    redFlags: [
      "Equal-weight claims across ten technologies with no stated centre of gravity.",
      "No end-to-end feature described — only layer-specific tasks.",
      "'MERN stack' or similar acronym used as the main qualification.",
      "No product metric anywhere, which is the main advantage full stack CVs have available.",
    ],
  },

  "devops-engineer": {
    intro:
      "DevOps interviews test whether you can make delivery fast and failure survivable. Expect a scenario-based round on debugging a broken pipeline or a degraded cluster, an infrastructure-as-code exercise, and detailed questions about your incident history. Hiring managers read these CVs for DORA-style metrics: how often you deploy, how long changes take, how often they fail, and how fast you recover.",
    interviewFocus: [
      { area: "Live troubleshooting", detail: "A described outage — pods crash-looping, a pipeline failing intermittently, disk filling — where you narrate your diagnostic path. The highest-signal round." },
      { area: "Infrastructure as code", detail: "Writing or reviewing Terraform, covering state management, module structure, and how you avoid drift and destructive plans." },
      { area: "CI/CD design", detail: "Designing a pipeline with sensible gates, rollback strategy, and deployment pattern (blue/green, canary, rolling)." },
      { area: "Reliability practice", detail: "SLOs, error budgets, alert design, and what you have changed after an incident." },
    ],
    technicalQuestions: [
      "A pod is in CrashLoopBackOff. Walk me through your diagnosis from first command to root cause.",
      "Explain how Terraform state works and what happens when two engineers apply simultaneously.",
      "Design a zero-downtime deployment for a stateful service.",
      "How would you structure secrets management across three environments?",
      "Your CI pipeline is intermittently failing 5% of the time. How do you find the cause?",
      "What do you actually alert on, and how do you keep alert fatigue down?",
      "Explain the difference between a liveness and a readiness probe, and what breaks if you configure them wrong.",
    ],
    behaviouralQuestions: [
      "Walk me through the worst production incident you have been part of and what changed afterwards.",
      "Tell me about a time you reduced cloud spend without reducing reliability.",
      "Describe pushing a reliability practice onto developers who resisted it.",
      "Tell me about automation you built that meaningfully changed how your team worked.",
      "Describe a time your change caused the outage.",
    ],
    questionsToAsk: [
      "What are your current DORA metrics, and which one are you trying to move?",
      "How is on-call structured, and do developers share it?",
      "How much of the infrastructure is actually defined in code today?",
      "What does the postmortem process look like — blameless in practice or in name?",
    ],
    faq: [
      {
        question: "What does a DevOps Engineer interview focus on?",
        answer:
          "Scenario troubleshooting above everything else. The defining round describes a failure — crash-looping pods, an intermittent pipeline failure, a disk filling in production — and asks you to narrate your diagnosis command by command. Around that sit an infrastructure-as-code exercise (usually Terraform), a CI/CD design discussion, and a deep dive on an incident from your history. Pure trivia rounds are increasingly rare; interviewers want to watch you think under uncertainty.",
      },
      {
        question: "Which metrics should a DevOps CV show?",
        answer:
          "The four DORA metrics are the shared vocabulary: deployment frequency, lead time for change, change-failure rate, and mean time to recovery. Add cost and reliability alongside them — monthly cloud spend reduced, uptime against SLO, incident volume. \"Raised deploy frequency from weekly to 40x/day while cutting change-failure rate from 18% to 4%\" is the single most effective bullet shape in this discipline because it shows speed and stability moving together.",
      },
      {
        question: "Do I need Kubernetes to get a DevOps job?",
        answer:
          "For most postings, yes in practice — it appears in the large majority of DevOps descriptions, and interviews assume working familiarity. You need to debug a failing pod, read and write manifests, understand services and ingress, and reason about resource limits and probes. You do not need to have written a controller or operated the control plane yourself; that depth belongs to platform engineering roles.",
      },
      {
        question: "Is DevOps Engineer the same as SRE?",
        answer:
          "They overlap heavily but weight differently. DevOps roles centre on delivery — pipelines, infrastructure as code, developer experience — and are measured on how fast and safely teams ship. SRE roles centre on reliability of running systems, formalised through SLOs and error budgets, and typically involve more software engineering and more on-call. Interview loops reflect this: SRE loops include more coding, DevOps loops more tooling and pipeline design.",
      },
    ],
    summaryExample:
      "DevOps engineer with 6 years running Kubernetes platforms for regulated fintech. Took deploy frequency from weekly to 40x/day while cutting change-failure rate from 18% to 4%, and reduced AWS spend 34% ($780k/yr) through rightsizing and spot adoption. Owns SLO definition and the blameless postmortem process.",
    bulletExamples: [
      {
        weak: "Managed CI/CD pipelines and automated deployment processes.",
        strong: "Rebuilt 30 Jenkins pipelines as reusable GitHub Actions workflows, cutting mean pipeline time from 22 to 6 minutes and lifting deploy frequency from weekly to 40x/day.",
        why: "\"Managed pipelines\" is the role's baseline. The migration scope (30 pipelines), the time saved, and the deployment-frequency change tie the work to the metric the discipline is actually judged on.",
      },
      {
        weak: "Responsible for cloud infrastructure and cost optimisation on AWS.",
        strong: "Cut AWS spend 34% ($780k/yr) by rightsizing 200 over-provisioned instances, moving batch workloads to spot, and adding per-team cost alerting — with no SLO regression.",
        why: "Cost bullets are only credible with the reliability caveat attached. Naming the three mechanisms and the absolute saving shows the analysis, and \"no SLO regression\" pre-empts the obvious interview challenge.",
      },
      {
        weak: "Monitored systems and responded to incidents as part of the on-call rotation.",
        strong: "Cut MTTR from 47 to 12 minutes by replacing 140 threshold alerts with 18 SLO-based ones and adding runbook links to every page, reducing after-hours pages ~70%.",
        why: "Being on-call is participation, not achievement. The alert reduction shows judgement about signal versus noise, and MTTR plus after-hours page volume are the two numbers a hiring manager can immediately compare across candidates.",
      },
    ],
    coreSkills: ["Infrastructure as code", "Kubernetes operations", "CI/CD design", "Observability & alerting", "Incident response", "Cloud cost management", "Linux & networking", "Scripting & automation", "Secrets management"],
    tools: ["Terraform", "Kubernetes", "Docker", "AWS", "Azure", "GCP", "GitHub Actions", "Jenkins", "ArgoCD", "Helm", "Prometheus", "Grafana", "Datadog", "Ansible", "Vault", "Bash", "Python"],
    metrics: ["Deployment frequency", "Lead time for change", "Change-failure rate", "MTTR", "Uptime against SLO", "Cloud spend reduced", "Pipeline duration", "Alert volume and page frequency"],
    seniority: [
      { level: "Junior (0–2 yrs)", expectation: "Maintains pipelines and runs scripted changes. CV should show Linux fluency and one cloud platform." },
      { level: "Mid (2–5 yrs)", expectation: "Owns infrastructure for a product area. CV should show IaC ownership and DORA movement." },
      { level: "Senior (5–8 yrs)", expectation: "Designs platform-wide systems. CV should show a migration, an SLO practice, or major cost work." },
      { level: "Lead / Principal (8+ yrs)", expectation: "Sets reliability and delivery strategy. CV should show org-wide standards and their measured effect." },
    ],
    redFlags: [
      "Tool lists with no metrics — DevOps is one of the most quantifiable disciplines, so their absence stands out.",
      "No incident stories, which suggests no production ownership.",
      "'Automated processes' with no before/after timing.",
      "Cost savings quoted with no reliability context, which reads as risk-taking.",
    ],
  },

  "qa-engineer": {
    intro:
      "QA interviews have shifted decisively toward automation and toward judgement about what not to test. Expect to design a test strategy for a described feature, write automation against a real page or API, and answer questions about flakiness — the single most discussed problem in the discipline. QA CVs are read for escaped-defect rates and pipeline reliability, not for counts of test cases written.",
    interviewFocus: [
      { area: "Test strategy design", detail: "Given a feature, decide what to test at unit, integration, and end-to-end level and justify the split. Interviewers look for a pyramid instinct and for explicit decisions about what you would not automate." },
      { area: "Automation implementation", detail: "Writing a Playwright, Cypress, or Selenium test, usually including a selector strategy and a wait strategy. Flaky-by-construction solutions are the common failure." },
      { area: "Bug investigation and reporting", detail: "Reproducing an ambiguous bug, isolating variables, and writing a report a developer can act on without a follow-up conversation." },
      { area: "Quality in the pipeline", detail: "Where tests run, what gates a release, and how you keep the suite fast enough that developers do not route around it." },
    ],
    technicalQuestions: [
      "Design a test strategy for a checkout flow with three payment providers. What do you automate and what do you not?",
      "A test passes locally and fails in CI 20% of the time. Walk me through your investigation.",
      "How do you choose selectors so that tests survive a UI refactor?",
      "What is the difference between a stub, a mock, and a fake, and when does the distinction matter?",
      "How would you test an API that depends on a third party you cannot control?",
      "Your end-to-end suite takes 90 minutes and developers are skipping it. What do you change?",
      "How do you test something non-deterministic, like a recommendation feed?",
    ],
    behaviouralQuestions: [
      "Tell me about a serious bug that reached production. What did you change about the process afterwards?",
      "Describe convincing a team to delay a release for a quality concern.",
      "Tell me about reducing flakiness in a suite that people had stopped trusting.",
      "Describe working with a developer who saw QA as a bottleneck.",
      "Tell me about a time you decided a bug was not worth fixing.",
    ],
    questionsToAsk: [
      "What is the current escaped-defect rate, and how is it tracked?",
      "How flaky is the suite today, and who owns fixing it?",
      "Does QA gate releases, or advise on them?",
      "How early is QA involved — at design, or after code complete?",
    ],
    faq: [
      {
        question: "Is manual QA still hireable, or is everything automation now?",
        answer:
          "Manual-only roles have contracted sharply, but exploratory testing skill remains valued — it is the part automation cannot replicate. The realistic position is hybrid: you are expected to write and maintain automation while bringing the judgement that finds bugs no scripted test would. If your experience is manual-only, the highest-leverage move is shipping a small Playwright or Cypress suite you can discuss in detail, since interviews now almost always include a hands-on round.",
      },
      {
        question: "What metrics should a QA Engineer CV show?",
        answer:
          "Outcomes, not activity. Escaped defects per release, defect detection percentage, suite runtime, flake rate, and regression cycle time are the numbers hiring managers compare. \"Cut escaped defects from 23 to 4 per release while bringing regression testing from 5 days to 6 hours\" tells a complete story. Counts of test cases written or bugs logged measure effort rather than quality and can even read as noise.",
      },
      {
        question: "How do I answer the flaky test question well?",
        answer:
          "Show a systematic process rather than a fix. Strong answers quarantine the flaky test immediately so the suite stays trustworthy, then categorise the cause — timing and implicit waits, test interdependence, shared mutable state, environment differences, genuine race conditions in the product. The point worth making explicitly is that some flakes are real bugs surfacing under timing pressure, and that treating every flake as a test problem is how genuine race conditions reach production.",
      },
      {
        question: "What is the career path from QA Engineer?",
        answer:
          "Three common routes. SDET or automation engineer deepens the coding side and converges with software engineering. QA lead or quality manager moves toward strategy, process, and people. A third route moves sideways into SRE or platform work, since the instincts about failure modes transfer well. The automation route generally has the strongest compensation trajectory, which is why building genuine coding depth early matters.",
      },
    ],
    summaryExample:
      "QA engineer with 5 years owning automation for a payments platform. Cut escaped defects from 23 to 4 per release and brought full regression from 5 days to 6 hours by rebuilding a flaky Selenium suite in Playwright. Reduced flake rate from 12% to under 1%, restoring developer trust in the pipeline.",
    bulletExamples: [
      {
        weak: "Wrote and executed test cases for new features and performed regression testing.",
        strong: "Automated 340 regression cases in Playwright, cutting the full regression cycle from 5 days to 6 hours and enabling release cadence to move from monthly to weekly.",
        why: "Writing test cases is the role definition. The cycle-time reduction and the release-cadence change it unlocked show the business consequence, which is what promotes a QA bullet from activity to impact.",
      },
      {
        weak: "Found and reported bugs to the development team using Jira.",
        strong: "Introduced contract testing between 6 services, catching 40+ breaking API changes pre-merge and cutting integration defects reaching staging by 65%.",
        why: "Reporting bugs after the fact is reactive and unmeasurable. Shifting detection earlier — pre-merge — is the modern quality argument, and the defect reduction quantifies it.",
      },
      {
        weak: "Improved test automation coverage and maintained the test suite.",
        strong: "Cut suite flake rate from 12% to 0.8% by replacing implicit waits with deterministic network interception and isolating shared fixtures, ending the team's practice of re-running failed builds.",
        why: "\"Improved coverage\" invites the question of whether coverage was the right target. Naming flake rate, the two specific causes fixed, and the team behaviour that stopped shows you understood the real problem — trust in the suite.",
      },
    ],
    coreSkills: ["Test strategy & risk analysis", "Test automation", "Exploratory testing", "API testing", "Defect isolation & reporting", "CI integration", "Performance testing basics", "Accessibility testing"],
    tools: ["Playwright", "Cypress", "Selenium", "Jest", "Pytest", "Postman", "REST Assured", "k6", "JMeter", "Jira", "TestRail", "GitHub Actions", "BrowserStack"],
    metrics: ["Escaped defects per release", "Defect detection percentage", "Regression cycle time", "Suite runtime", "Flake rate", "Automation coverage of critical paths", "Release frequency enabled"],
    seniority: [
      { level: "Junior (0–2 yrs)", expectation: "Executes and extends existing tests. CV should show one automation framework used properly." },
      { level: "Mid (2–5 yrs)", expectation: "Owns automation for a product area. CV should show cycle-time or defect-rate movement." },
      { level: "Senior / SDET (5–8 yrs)", expectation: "Designs frameworks and quality strategy. CV should show a framework migration or a shift-left initiative." },
      { level: "Lead (8+ yrs)", expectation: "Owns quality across teams. CV should show organisational quality metrics and the practices behind them." },
    ],
    redFlags: [
      "Counts of test cases written or bugs logged as headline achievements — these measure activity, not quality.",
      "No automation experience at all, which closes most current postings.",
      "No escaped-defect or cycle-time numbers.",
      "Framing QA as a gate rather than as an enabler of release speed.",
    ],
  },

  // ─── Data & AI ─────────────────────────────────────────────────────────────

  "data-scientist": {
    intro:
      "Data Scientist loops test statistical judgement more than modelling technique. The rounds that fail candidates are the case study — where you must translate a vague business question into a measurable one — and the experimentation round, where interviewers probe whether you understand what an A/B test can and cannot tell you. Modelling questions are usually shallower than candidates expect and focus on evaluation choices rather than architectures.",
    interviewFocus: [
      { area: "Business case framing", detail: "Given a vague prompt — \"engagement is down\" — define the metric, form hypotheses, and state what data would distinguish them. The highest-weighted round at most companies." },
      { area: "Statistics and experimentation", detail: "A/B test design, power and sample size, p-values and their misinterpretation, multiple comparisons, and novelty effects. Interviewers commonly ask you to critique a flawed experiment." },
      { area: "SQL and data manipulation", detail: "Window functions, cohort queries, and joins against a realistic schema. Almost always a standalone round." },
      { area: "Modelling judgement", detail: "Choosing and defending an evaluation metric, handling class imbalance, explaining why a model is failing in production." },
    ],
    technicalQuestions: [
      "Daily active users dropped 8% week over week. How do you find out why?",
      "Design an A/B test for a new onboarding flow. How do you size it and when do you stop it?",
      "Your model has 95% accuracy on a dataset where 96% of cases are negative. What do you report instead?",
      "Write a SQL query returning each user's first and third purchase dates and the gap between them.",
      "Explain p-value to a product manager, and then explain what it does not mean.",
      "A model that performed well offline is underperforming in production. What are your hypotheses?",
      "How would you measure the effect of a feature you cannot randomise?",
    ],
    behaviouralQuestions: [
      "Tell me about an analysis whose conclusion the stakeholders did not want to hear.",
      "Describe a time your model or analysis turned out to be wrong.",
      "Tell me about translating an ambiguous business question into something measurable.",
      "Describe a project where the data quality was much worse than expected.",
      "Tell me about a time you chose not to build a model.",
    ],
    questionsToAsk: [
      "How are experiments run here — is there a platform, and who decides what ships?",
      "How often do models make it to production versus staying as analyses?",
      "Who owns the data pipelines the science team depends on?",
      "How is data science success measured on this team?",
    ],
    faq: [
      {
        question: "What is the hardest round in a Data Scientist interview?",
        answer:
          "The business case. You are given something deliberately vague — \"retention dropped, find out why\" — and scored on how you decompose it: segmenting to localise the change, separating seasonality from a real shift, distinguishing a data-collection bug from a product regression, and stating what evidence would confirm each hypothesis. Candidates who jump straight to modelling fail this round. Interviewers are testing whether you would spend three weeks on the right question or the wrong one.",
      },
      {
        question: "How much SQL do Data Scientists need?",
        answer:
          "Deep working fluency, and it is nearly always a separate round. Expect window functions, self-joins, cohort and funnel queries, and date arithmetic against a schema you see for the first time. Many companies screen on SQL before any statistics round, so it is the most common early elimination point. Being able to write a retention cohort query from scratch is a reasonable bar to hold yourself to.",
      },
      {
        question: "Data Scientist versus Machine Learning Engineer — which should I apply for?",
        answer:
          "Data Scientists answer questions; ML Engineers ship systems. If your strength is experimentation, causal reasoning, and communicating findings that change decisions, target Data Scientist. If it is training pipelines, serving infrastructure, latency, and model monitoring in production, target ML Engineer. The interviews differ accordingly — DS loops weight statistics and case studies, MLE loops weight system design and coding. Applying to both with one CV usually reads as unfocused to each.",
      },
      {
        question: "What should a Data Scientist CV show?",
        answer:
          "Decisions changed, not models built. \"Redesigned the pricing experiment framework, cutting time-to-decision from 6 weeks to 9 days and catching a $2M annual revenue leak from an under-powered test\" beats any list of algorithms. Name the business metric you moved, the size of the population affected, and the decision that followed. Keep the technique list compact — hiring managers assume you know regression and gradient boosting.",
      },
    ],
    summaryExample:
      "Data scientist with 5 years in marketplace pricing and growth. Rebuilt the experimentation framework used by 8 product teams, cutting time-to-decision from 6 weeks to 9 days and surfacing a $2M/yr revenue leak caused by under-powered tests. Strong in causal inference, A/B design, and translating ambiguous questions into measurable ones.",
    bulletExamples: [
      {
        weak: "Built machine learning models using Python, scikit-learn, and TensorFlow.",
        strong: "Built a churn model (gradient-boosted trees, 0.81 AUC) whose top-decile scores drove a retention campaign that cut monthly churn from 4.2% to 3.4%, worth ~$1.4M annually.",
        why: "Naming libraries is the weakest possible signal in this field. The chain from model quality (AUC) to the intervention it powered to the business metric and its value is what a hiring manager is actually reading for.",
      },
      {
        weak: "Performed data analysis and created dashboards for stakeholders.",
        strong: "Ran the funnel analysis that identified a mobile verification step causing 31% of signup drop-off; removing it lifted completed signups 22% with no increase in fraud.",
        why: "\"Performed analysis\" gives no evidence the analysis mattered. Naming the specific finding, the resulting change, and the counter-metric (fraud) shows both analytical rigour and awareness that changes have trade-offs.",
      },
      {
        weak: "Used A/B testing to evaluate new product features.",
        strong: "Rebuilt the A/B framework with sequential testing and pre-registered hypotheses, cutting average test duration 40% and reducing false-positive launches — 3 of 11 prior 'wins' failed to replicate.",
        why: "Running A/B tests is table stakes. Improving how an organisation experiments is a senior contribution, and the replication failure is a concrete, memorable detail that proves methodological depth.",
      },
    ],
    coreSkills: ["Experiment design & causal inference", "Statistical modelling", "SQL", "Python (pandas, scikit-learn)", "Feature engineering", "Model evaluation", "Data storytelling", "Stakeholder communication"],
    tools: ["Python", "SQL", "pandas", "scikit-learn", "PyTorch", "dbt", "Snowflake", "BigQuery", "Airflow", "Tableau", "Looker", "Jupyter", "Git"],
    metrics: ["Business metric moved (revenue, churn, conversion)", "Model performance (AUC, precision/recall at k)", "Experiment velocity / time-to-decision", "Population size affected", "Dollar value of the decision", "Forecast error reduction"],
    seniority: [
      { level: "Junior (0–2 yrs)", expectation: "Runs defined analyses. CV should show strong SQL and one project with a clear conclusion." },
      { level: "Mid (2–5 yrs)", expectation: "Owns a product area's measurement. CV should show a decision your analysis changed." },
      { level: "Senior (5–8 yrs)", expectation: "Sets measurement strategy. CV should show experimentation practice improvements, not just experiments run." },
      { level: "Staff / Principal (8+ yrs)", expectation: "Influences company-level strategy. CV should show cross-org methodology and its measured effect." },
    ],
    redFlags: [
      "Kaggle rankings or coursework leading the CV ahead of applied work.",
      "Model accuracy quoted with no business metric attached.",
      "Long algorithm lists — assumed knowledge that displaces evidence of judgement.",
      "No mention of experimentation or causal reasoning anywhere.",
    ],
  },

  "data-analyst": {
    intro:
      "Data Analyst interviews are dominated by SQL and by the ability to turn a number into a recommendation. Nearly every loop includes a live SQL round, a case study where you interpret a metric movement, and a communication round where you present findings to a non-technical stakeholder. The CVs that succeed show decisions influenced, not dashboards delivered.",
    interviewFocus: [
      { area: "Live SQL", detail: "Writing queries against an unfamiliar schema — joins, aggregations, window functions, cohort and funnel logic. The most common elimination round in the discipline." },
      { area: "Metric interpretation", detail: "Given a chart or a metric change, explain plausible causes and what you would check. Interviewers test whether you consider seasonality, mix shift, and instrumentation before product causes." },
      { area: "Stakeholder communication", detail: "Presenting a finding to someone non-technical and defending a recommendation, including what you are uncertain about." },
      { area: "Dashboard and metric design", detail: "Choosing what to display and defining a metric precisely enough that two teams compute it identically." },
    ],
    technicalQuestions: [
      "Write a query returning month-over-month retention by signup cohort.",
      "Revenue is flat but order volume is up 15%. What is happening and how would you confirm it?",
      "Explain the difference between a LEFT JOIN and a FULL OUTER JOIN with a case where the choice changes the answer.",
      "How would you define 'active user' for a product used weekly rather than daily?",
      "Write a query to find the top 3 products per category by revenue.",
      "A dashboard number disagrees with finance's number. How do you reconcile them?",
      "How do you detect whether a metric change is real or an instrumentation artefact?",
    ],
    behaviouralQuestions: [
      "Tell me about a finding that changed what your team decided to do.",
      "Describe presenting bad news to a stakeholder who disagreed with the data.",
      "Tell me about a time you found an error in your own analysis after sharing it.",
      "Describe a request that was framed as a data pull but needed reframing.",
      "Tell me about simplifying a complex analysis for an executive audience.",
    ],
    questionsToAsk: [
      "Who defines metrics here, and is there a single source of truth?",
      "How much of the role is ad-hoc requests versus longer analyses?",
      "What is the state of data quality and documentation?",
      "How do analysts' findings actually reach decisions?",
    ],
    faq: [
      {
        question: "How hard is the SQL round in a Data Analyst interview?",
        answer:
          "Harder than most candidates prepare for, because it is timed and against an unfamiliar schema. The recurring asks are cohort retention, funnel conversion by step, top-N per group using a window function, and running totals or period-over-period comparisons. Interviewers watch whether you clarify the schema before writing and whether you sanity-check your own output. Practising these five query shapes until they are automatic covers the large majority of what is asked.",
      },
      {
        question: "What separates a Data Analyst from a Data Scientist?",
        answer:
          "Analysts describe and diagnose what happened; scientists predict and establish causality. Analyst work centres on SQL, BI tooling, metric definition, and stakeholder communication, with statistics used mostly for significance and sizing. Scientist work adds experimental design, causal inference, and modelling. In practice the boundary varies by company — at smaller organisations one analyst does both — but the interviews differ sharply, so target the loop you can pass.",
      },
      {
        question: "What belongs on a Data Analyst CV?",
        answer:
          "The decision each analysis produced. \"Identified that 31% of signup drop-off came from one verification step; removing it lifted completed signups 22%\" is the shape that works, because it names the finding, the action, and the result. Also state the scale you worked at — rows, users, revenue covered — and the tools, but keep tooling brief. Listing dashboards built without saying what changed is the most common weakness in this discipline's CVs.",
      },
      {
        question: "Do I need Python for Data Analyst roles?",
        answer:
          "It strengthens your position but SQL is the non-negotiable one. Many analyst roles run entirely on SQL plus a BI tool, and interviews reflect that. Python becomes important when you want to move toward analytics engineering or data science, and it is often what distinguishes candidates for senior analyst roles where automation and reproducibility matter. If you have limited preparation time, get SQL to a high standard first.",
      },
    ],
    summaryExample:
      "Data analyst with 4 years in subscription e-commerce, working across a 40M-row order dataset. Identified and removed a verification step causing 31% of signup abandonment, lifting completed signups 22%. Rebuilt the company metric layer in dbt so marketing and finance stopped reporting different revenue figures.",
    bulletExamples: [
      {
        weak: "Created dashboards in Tableau to track key business metrics.",
        strong: "Replaced 23 overlapping Tableau dashboards with 4 role-based views built on a governed dbt metric layer, ending recurring disputes between marketing and finance over revenue figures.",
        why: "Dashboard counts measure output, not value. Consolidation plus a governed metric layer solves the actual organisational problem — disagreement about the numbers — which is the outcome a hiring manager recognises.",
      },
      {
        weak: "Analysed customer data to identify trends and provide insights.",
        strong: "Segmented 2.4M customers by purchase recency and category mix, identifying a 6% cohort generating 38% of margin; the resulting retention programme lifted repeat rate 11 points.",
        why: "\"Insights\" is the least informative word available in this field. The population size, the specific finding, and the programme it justified turn the same work into something rankable.",
      },
      {
        weak: "Wrote SQL queries to extract data for various business teams.",
        strong: "Automated 30+ recurring reporting requests into self-serve Looker explores, removing ~12 analyst-hours per week and cutting stakeholder turnaround from 2 days to immediate.",
        why: "Ad-hoc query work is the role's default. Converting recurring demand into self-serve capacity is the leverage move, and the hours saved make it measurable.",
      },
    ],
    coreSkills: ["SQL", "Metric definition", "Cohort & funnel analysis", "Data visualisation", "Statistical significance testing", "Stakeholder communication", "Data quality investigation", "Spreadsheet modelling"],
    tools: ["SQL", "Tableau", "Looker", "Power BI", "dbt", "BigQuery", "Snowflake", "Excel", "Python (pandas)", "Google Analytics", "Amplitude"],
    metrics: ["Business metric influenced", "Rows / users analysed", "Analyst hours saved through automation", "Reporting turnaround time", "Adoption of dashboards built", "Revenue or cost impact of findings"],
    seniority: [
      { level: "Junior (0–2 yrs)", expectation: "Fulfils defined requests. CV should show solid SQL and one analysis with a conclusion." },
      { level: "Mid (2–4 yrs)", expectation: "Owns a business area's reporting. CV should show a decision your work changed." },
      { level: "Senior (4–7 yrs)", expectation: "Defines metrics and mentors. CV should show metric governance or self-serve enablement." },
      { level: "Lead (7+ yrs)", expectation: "Owns analytics strategy. CV should show org-level measurement changes." },
    ],
    redFlags: [
      "Dashboards built quoted as the headline achievement with no adoption or decision attached.",
      "No SQL depth signalled, which is the discipline's core skill.",
      "'Insights' used repeatedly without a single concrete finding.",
      "No indication of data scale, making the work impossible to rank.",
    ],
  },

  "data-engineer": {
    intro:
      "Data Engineering interviews centre on pipeline design and on what happens when a pipeline fails halfway. Expect a data modelling round, a pipeline architecture round covering batch versus streaming, and detailed SQL. The distinguishing senior signal is how you handle idempotency, backfills, and late-arriving data — the problems that separate people who have operated pipelines from people who have written them.",
    interviewFocus: [
      { area: "Pipeline architecture", detail: "Designing ingestion through to serving for a described source, choosing batch or streaming, and justifying the orchestration and storage layers." },
      { area: "Data modelling", detail: "Star schemas, slowly changing dimensions, normalisation trade-offs, and partitioning strategy for query performance and cost." },
      { area: "Failure semantics", detail: "Idempotent writes, exactly-once processing, backfill strategy, and handling late or out-of-order events. The senior differentiator." },
      { area: "SQL and performance", detail: "Complex transformations plus cost and performance tuning on a warehouse — partition pruning, clustering, and why a query scanned 4TB." },
    ],
    technicalQuestions: [
      "Design a pipeline ingesting 500M events/day into a warehouse with a 15-minute freshness SLA.",
      "How do you make a pipeline idempotent so a re-run does not double-count?",
      "Explain slowly changing dimensions and when you would use type 2 over type 1.",
      "Events arrive 6 hours late. How does that change your aggregation design?",
      "A warehouse query scans 4TB and costs $20 per run. How do you reduce it?",
      "When would you choose streaming over batch, and what operational cost are you accepting?",
      "How would you backfill 2 years of history without disrupting live pipelines?",
    ],
    behaviouralQuestions: [
      "Tell me about a pipeline failure that corrupted downstream data. How did you recover?",
      "Describe a time data quality issues were discovered by stakeholders before you.",
      "Tell me about a migration between warehouses or orchestrators.",
      "Describe a time you significantly reduced data infrastructure cost.",
      "Tell me about negotiating requirements with analysts who wanted everything real-time.",
    ],
    questionsToAsk: [
      "What are the freshness SLAs, and how often are they missed?",
      "How is data quality monitored — tests in the pipeline, or downstream discovery?",
      "What is the current warehouse spend and is it a concern?",
      "Who owns the schema contracts between producers and the platform?",
    ],
    faq: [
      {
        question: "What is the most important skill for a Data Engineer interview?",
        answer:
          "Reasoning about failure. Anyone can draw an ingestion diagram; the rounds are decided by what you say when the interviewer asks what happens if the job dies halfway, if the same file is delivered twice, or if events arrive six hours late. Idempotency, exactly-once semantics, watermarking, and backfill strategy are the concepts that come up repeatedly, and fluency in them is the clearest signal that you have operated pipelines rather than only built them.",
      },
      {
        question: "Do Data Engineers need Spark, or is SQL and dbt enough?",
        answer:
          "It depends on the data volume the company handles. Modern warehouse-centric stacks — Snowflake or BigQuery with dbt and an orchestrator — cover a large share of postings, and there SQL depth plus dbt is genuinely sufficient. Spark remains required where volumes exceed comfortable warehouse processing or where the work is unstructured. Read the posting: if it names Spark, Flink, or Kafka prominently, the loop will test distributed processing properly.",
      },
      {
        question: "What metrics belong on a Data Engineer CV?",
        answer:
          "Volume, freshness, reliability, and cost. Events or rows processed per day, pipeline SLA attainment, freshness lag, warehouse spend reduced, and the number of downstream consumers you serve. \"Rebuilt the events pipeline to process 500M events/day at 8-minute freshness while cutting warehouse spend 45%\" works because it captures scale, service level, and cost in one line — the three things this discipline is managed on.",
      },
      {
        question: "Is Data Engineer a good move from Data Analyst?",
        answer:
          "It is one of the most common and successful transitions, because the SQL foundation transfers directly and analysts already understand what consumers need. The gap to close is software engineering practice: version control, testing, orchestration, and infrastructure. Analytics engineering — dbt-centred modelling work — is the natural intermediate step, and many people find it is the destination rather than a waypoint.",
      },
    ],
    summaryExample:
      "Data engineer with 6 years building batch and streaming platforms on GCP. Rebuilt the core events pipeline to handle 500M events/day at 8-minute freshness, replacing a nightly batch that regularly missed SLA. Cut BigQuery spend 45% ($310k/yr) through partitioning and clustering redesign, serving 40+ downstream analysts.",
    bulletExamples: [
      {
        weak: "Built and maintained ETL pipelines using Airflow and Python.",
        strong: "Rebuilt 60 Airflow DAGs as idempotent, partition-aware tasks processing 500M events/day, cutting SLA misses from 9 per month to zero across two quarters.",
        why: "\"Built ETL pipelines\" describes every data engineer. Idempotency and partition-awareness are the specific properties that make pipelines reliable, and the SLA-miss count is the number an interviewer can compare directly.",
      },
      {
        weak: "Worked with big data technologies to process large datasets.",
        strong: "Migrated 40TB of nightly Spark batch processing to incremental dbt models on BigQuery, cutting pipeline runtime from 6 hours to 35 minutes and warehouse spend 45% ($310k/yr).",
        why: "\"Big data\" and \"large datasets\" are unmeasured. The volume, the architectural change, and the runtime and cost figures make the same project concrete and show judgement about when Spark is unnecessary.",
      },
      {
        weak: "Ensured data quality and reliability across the data platform.",
        strong: "Introduced 200+ dbt tests and freshness monitors across 80 models, moving data-quality detection from stakeholder reports to automated alerts and cutting incident-to-detection from ~2 days to 12 minutes.",
        why: "\"Ensured quality\" is an intention. The test count, the coverage, and above all the shift from stakeholders finding problems to systems finding them is the concrete change in how the platform operates.",
      },
    ],
    coreSkills: ["Pipeline architecture", "Dimensional data modelling", "SQL & query optimisation", "Batch and stream processing", "Orchestration", "Data quality testing", "Warehouse cost management", "Schema evolution"],
    tools: ["Python", "SQL", "Airflow", "dbt", "Spark", "Kafka", "Snowflake", "BigQuery", "Redshift", "Databricks", "Terraform", "AWS", "GCP"],
    metrics: ["Events / rows processed per day", "Data volume under management", "Freshness lag and SLA attainment", "Pipeline runtime", "Warehouse cost reduced", "Downstream consumers served", "Data incidents and time to detection"],
    seniority: [
      { level: "Junior (0–2 yrs)", expectation: "Maintains existing pipelines. CV should show SQL plus Python and one orchestrator." },
      { level: "Mid (2–5 yrs)", expectation: "Owns pipelines end to end including on-call. CV should show volume and freshness numbers." },
      { level: "Senior (5–8 yrs)", expectation: "Designs platform architecture. CV should show a migration or a major cost/reliability change." },
      { level: "Staff (8+ yrs)", expectation: "Sets data platform strategy. CV should show contracts, governance, or standards adopted org-wide." },
    ],
    redFlags: [
      "'Big data' claimed with no volumes attached.",
      "No mention of failure handling, idempotency, or backfills.",
      "Tool lists without an architecture you can describe end to end.",
      "No cost awareness, which is a primary concern in warehouse-centric teams.",
    ],
  },

  "machine-learning-engineer": {
    intro:
      "ML Engineer loops are closer to software engineering interviews than to data science ones. Expect a coding round, an ML system design round covering training and serving infrastructure, and questions about what happens to a model after deployment — drift, retraining, rollback. Candidates who prepare only modelling theory and not systems consistently underperform here.",
    interviewFocus: [
      { area: "ML system design", detail: "Designing an end-to-end system — feature pipeline, training, evaluation, serving, monitoring — for a described product need. The defining round." },
      { area: "Production ML operations", detail: "Detecting drift, deciding retraining cadence, shadow deployment and rollback, and reproducing a training run months later." },
      { area: "Coding", detail: "Standard software engineering problems plus occasionally implementing a component (a metric, a sampler, an attention step) from scratch." },
      { area: "Modelling depth", detail: "Evaluation metric selection, overfitting diagnosis, and trade-offs between model complexity and serving latency." },
    ],
    technicalQuestions: [
      "Design a real-time recommendation system serving 10k requests/second at p99 under 100ms.",
      "How do you detect model drift, and what do you do when you find it?",
      "Explain training-serving skew and how you would prevent it architecturally.",
      "You need to retrain weekly. Design the pipeline including validation gates before promotion.",
      "How would you A/B test a model change safely?",
      "Your model's offline metric improved but the online metric got worse. What happened?",
      "How do you reproduce a training run from six months ago?",
    ],
    behaviouralQuestions: [
      "Tell me about a model you took from prototype to production. What was hardest?",
      "Describe a model that degraded in production and how you found out.",
      "Tell me about a time the right answer was a simpler model or no model at all.",
      "Describe working with data scientists whose research code you had to productionise.",
      "Tell me about a trade-off you made between model quality and serving cost.",
    ],
    questionsToAsk: [
      "How many models are in production, and who owns them after launch?",
      "What does the retraining and promotion process look like?",
      "How is model performance monitored — and who gets paged?",
      "Where is the boundary between the science and engineering teams here?",
    ],
    faq: [
      {
        question: "How is an ML Engineer interview different from a Data Scientist interview?",
        answer:
          "It is a software engineering loop with ML content. You get a standard coding round, an ML system design round about feature pipelines and serving infrastructure, and questions about production concerns — drift, retraining, rollback, reproducibility. Data Science loops instead weight statistics, experimentation, and business case framing. Candidates who prepare modelling theory alone typically fail ML Engineer loops on the systems rounds, which carry the most weight.",
      },
      {
        question: "What is the most common ML system design mistake in interviews?",
        answer:
          "Designing the training path and stopping there. Strong answers spend at least as long on serving and on the feedback loop: how features are computed identically at training and inference time, how predictions are logged for later evaluation, how drift is detected, what triggers retraining, and how you roll back a bad model. Training-serving skew in particular is the failure mode interviewers most want to hear you pre-empt.",
      },
      {
        question: "Do I need deep learning experience for ML Engineer roles?",
        answer:
          "It depends on the domain, and less often than job descriptions imply. Recommendation, ranking, fraud, and forecasting work still runs substantially on gradient-boosted trees, and interviews for those roles focus on pipelines and features. Deep learning depth is genuinely required for computer vision, NLP, and generative AI roles. What is universally required is the systems side — serving, monitoring, and reproducibility — regardless of model family.",
      },
      {
        question: "What should an ML Engineer CV show?",
        answer:
          "Models in production and the systems around them. State the serving scale (requests per second, latency percentile), the business metric moved, and the operational maturity — retraining cadence, monitoring, rollback. \"Deployed a ranking model serving 10k RPS at p99 62ms, lifting click-through 14%, with automated weekly retraining and drift alerting\" covers modelling, systems, and impact together, which is exactly the combination the role is hired for.",
      },
    ],
    summaryExample:
      "ML engineer with 5 years shipping ranking and fraud models to production. Built the feature store and serving stack behind a recommendation model handling 10k RPS at p99 62ms, lifting click-through 14%. Owns retraining automation, drift monitoring, and rollback for 12 production models.",
    bulletExamples: [
      {
        weak: "Developed machine learning models for recommendation and personalisation.",
        strong: "Shipped a two-tower retrieval model serving 10k RPS at p99 62ms, lifting click-through 14% and session length 8% against a collaborative-filtering baseline.",
        why: "Model development without serving numbers reads as prototype work. The architecture, the throughput and latency, the lift, and the named baseline together prove the model reached and survived production.",
      },
      {
        weak: "Deployed models to production and monitored their performance.",
        strong: "Built the retraining pipeline that promotes models only after passing offline gates and a 5% shadow deployment, cutting bad-model incidents from 4 per quarter to zero over three quarters.",
        why: "\"Deployed and monitored\" is a summary of duties. Describing the promotion gate and the shadow stage shows a specific safety mechanism, and the incident reduction proves it worked.",
      },
      {
        weak: "Worked with data scientists to productionise their models.",
        strong: "Built a feature store unifying training and serving computation, eliminating training-serving skew that had been costing 3-5 points of offline-to-online metric degradation per launch.",
        why: "\"Productionise\" hides the actual engineering. Naming training-serving skew and quantifying the degradation it caused demonstrates you understand the field's most common production failure and fixed it structurally.",
      },
    ],
    coreSkills: ["ML system design", "Feature engineering & feature stores", "Model serving & optimisation", "Drift detection & monitoring", "Distributed training", "Software engineering practice", "Experiment design", "MLOps tooling"],
    tools: ["Python", "PyTorch", "TensorFlow", "scikit-learn", "MLflow", "Kubeflow", "Ray", "Feast", "Docker", "Kubernetes", "Airflow", "AWS SageMaker", "Triton", "ONNX"],
    metrics: ["Serving throughput and p99 latency", "Business metric lift from the model", "Model quality vs named baseline", "Retraining cadence and automation", "Models in production owned", "Inference cost per 1k predictions", "Time from prototype to production"],
    seniority: [
      { level: "Junior (0–2 yrs)", expectation: "Trains models against existing pipelines. CV should show one model that reached production." },
      { level: "Mid (2–5 yrs)", expectation: "Owns a model end to end including serving. CV should show latency and business lift." },
      { level: "Senior (5–8 yrs)", expectation: "Designs ML platform components. CV should show a feature store, serving stack, or retraining system." },
      { level: "Staff (8+ yrs)", expectation: "Sets ML infrastructure strategy. CV should show platform work multiple teams depend on." },
    ],
    redFlags: [
      "Only notebook and prototype work, with nothing shown reaching production.",
      "Model metrics with no serving or business numbers.",
      "No monitoring, retraining, or rollback signal — the production half of the job.",
      "Paper reimplementations presented as engineering experience.",
    ],
  },

  // ─── Product & Design ──────────────────────────────────────────────────────

  "product-manager": {
    intro:
      "Product Manager loops test judgement under incomplete information across four repeatable formats: product sense, analytical, execution, and behavioural. The most common failure is jumping to solutions before establishing the user and the goal. PM CVs are read for outcomes owned rather than features shipped — a list of launches without metrics reads as project management.",
    interviewFocus: [
      { area: "Product sense", detail: "\"Design X for Y\" or \"improve product Z\". Scored on whether you segment users, pick a target segment with a reason, generate a range of solutions, and choose using stated criteria." },
      { area: "Analytical / metrics", detail: "Defining success metrics, diagnosing a metric drop, and estimating market size. Interviewers check whether you name a counter-metric unprompted." },
      { area: "Execution", detail: "Prioritisation under constraint, trade-off decisions, launch planning, and what you would cut to hit a date." },
      { area: "Influence without authority", detail: "How you align engineering, design, and leadership when you cannot direct any of them." },
    ],
    technicalQuestions: [
      "How would you improve the onboarding experience of a product you use daily?",
      "Sign-ups are up 20% but weekly active users are flat. What is happening?",
      "You can ship one of three features this quarter. Walk me through choosing.",
      "What metrics would you set for a new in-app messaging feature, and what counter-metric would you watch?",
      "Estimate the annual market for electric toothbrushes in the UK.",
      "A key customer demands a feature that conflicts with your roadmap. What do you do?",
      "Design a product for people who have recently moved to a new city.",
    ],
    behaviouralQuestions: [
      "Tell me about a product decision you got wrong and what you learned.",
      "Describe influencing a team over which you had no authority.",
      "Tell me about killing a feature or project.",
      "Describe a time engineering told you something was impossible in the timeframe.",
      "Tell me about using data to overturn a strongly held opinion — including your own.",
    ],
    questionsToAsk: [
      "How are roadmap decisions actually made, and what role does the PM play?",
      "What does the discovery process look like before something enters the roadmap?",
      "How is PM success measured here — outputs or outcomes?",
      "What is the relationship between product and engineering leadership?",
    ],
    faq: [
      {
        question: "What are the four types of Product Manager interview round?",
        answer:
          "Product sense (design or improve a product), analytical (metrics definition, diagnosing a drop, market sizing), execution (prioritisation, trade-offs, launch planning), and behavioural (influence, conflict, failure). Most loops include all four across four to six rounds. Product sense and analytical are where candidates most often fail — the former because they solution before establishing the user and goal, the latter because they define success metrics without a counter-metric.",
      },
      {
        question: "How do I structure a product sense answer?",
        answer:
          "Clarify the goal, segment the users, pick one segment and say why, articulate that segment's specific pain, generate three or four distinct solutions, choose using stated criteria (impact, effort, strategic fit), then define success and a counter-metric. The structure matters less than the discipline of not skipping the first three steps — interviewers are explicitly checking whether you can resist proposing features before you have established who you are building for.",
      },
      {
        question: "What makes a Product Manager CV stand out?",
        answer:
          "Outcomes with the constraints visible. \"Grew activation 34% by rebuilding onboarding around a single aha-moment, prioritised over 6 competing requests with a data-backed case to leadership\" shows the metric, the insight, and the influence, which is the whole job. Feature launch lists without metrics read as project management. Also include scale — users affected, revenue owned, team size you worked with — so reviewers can level you.",
      },
      {
        question: "How do I move into product management without PM experience?",
        answer:
          "The reliable routes are internal and adjacent. Move into an APM or associate PM programme, or transition inside your current company from engineering, design, analytics, or support — internal moves dominate because the hardest thing to demonstrate externally is judgement in a specific domain. Whatever your current role, start producing PM artefacts: write the spec, run the user interviews, define the metrics. Those become the evidence your CV needs, since the bar is proof you can own outcomes rather than a certificate.",
      },
    ],
    summaryExample:
      "Product manager with 6 years in B2B SaaS, owning activation and retention for a product serving 500k users. Grew activation 34% by rebuilding onboarding around a single aha-moment identified through 40 user interviews and funnel analysis. Ran the pricing migration that lifted ARPU 18% with under 2% churn impact.",
    bulletExamples: [
      {
        weak: "Managed the product roadmap and worked with engineering to deliver features.",
        strong: "Owned the activation roadmap for a 500k-user product, growing week-1 activation from 22% to 34% across four quarters against a flat headcount.",
        why: "Roadmap management is the job title restated. Naming the metric owned, the movement, the timeframe, and the constraint (flat headcount) gives a reviewer everything needed to judge the scale of the contribution.",
      },
      {
        weak: "Gathered requirements from stakeholders and wrote user stories.",
        strong: "Ran 40 customer interviews that reframed a requested 'export feature' as a reporting-trust problem; the resulting scheduled-reports feature reached 60% adoption versus 8% for the original request.",
        why: "Requirements gathering is stenography. This bullet shows the PM changing what got built based on research, and the adoption comparison proves the reframing was correct rather than merely opinionated.",
      },
      {
        weak: "Launched several new features that improved the user experience.",
        strong: "Led the migration from seat-based to usage-based pricing across 3,000 accounts, lifting ARPU 18% while holding churn impact under 2% through a grandfathering plan negotiated with sales and finance.",
        why: "\"Several features\" and \"improved UX\" are unmeasurable. A pricing migration is a high-stakes, cross-functional decision, and stating both the upside and the controlled downside demonstrates the trade-off thinking senior PM roles hire for.",
      },
    ],
    coreSkills: ["Product discovery & user research", "Metric definition", "Prioritisation frameworks", "Roadmap planning", "Stakeholder influence", "Experimentation", "Competitive analysis", "Technical fluency", "Written communication"],
    tools: ["Jira", "Linear", "Figma", "Amplitude", "Mixpanel", "Looker", "SQL", "Productboard", "Notion", "Miro", "Optimizely"],
    metrics: ["Activation, retention, or conversion moved", "Revenue or ARPU impact", "Users or accounts affected", "Adoption rate of features shipped", "Experiment win rate", "Time to market", "NPS or CSAT change"],
    seniority: [
      { level: "APM / Associate (0–2 yrs)", expectation: "Owns a feature area with guidance. CV should show one metric you influenced and research you ran." },
      { level: "PM (2–5 yrs)", expectation: "Owns a product area and its metrics. CV should show an outcome you were accountable for." },
      { level: "Senior PM (5–8 yrs)", expectation: "Owns strategy for a significant surface. CV should show a bet you made and its result, including trade-offs." },
      { level: "Group PM / Director (8+ yrs)", expectation: "Owns a portfolio and often PMs. CV should show org-level strategy, team growth, and revenue scale." },
    ],
    redFlags: [
      "Feature launch lists with no metrics — the most common reason PM CVs are rejected.",
      "No evidence of user research, which suggests a backlog-administrator role.",
      "Ownership stated without scale (users, revenue, team size).",
      "Framework name-dropping (RICE, JTBD) without a decision it produced.",
    ],
  },

  "ux-designer": {
    intro:
      "UX Designer hiring is decided by the portfolio more than the CV, and portfolio reviews are scored on reasoning rather than visual polish. Expect a portfolio presentation, a whiteboard or take-home design exercise, and a critique round. The recurring weakness is case studies that show the final screens but not the decisions, the constraints, or what the design achieved once shipped.",
    interviewFocus: [
      { area: "Portfolio deep dive", detail: "Presenting two or three case studies with your specific contribution, the constraints you worked under, and the outcome. Interviewers probe what you would do differently and what the design got wrong." },
      { area: "Design exercise", detail: "A whiteboard or take-home prompt where you scope the problem, sketch alternatives, and justify a direction. Scored on process visibility more than on the artefact." },
      { area: "Critique", detail: "Evaluating an existing interface. Interviewers test whether you critique against user goals and heuristics rather than personal taste." },
      { area: "Research and measurement", detail: "What research you ran, how you recruited, how you avoided leading questions, and how you measured whether the design worked." },
    ],
    technicalQuestions: [
      "Walk me through a project where research changed your original direction.",
      "Redesign the seat-selection flow for an airline app. Where do you start?",
      "How do you design for a user group you cannot easily access for research?",
      "Critique this checkout flow. What would you test first?",
      "How do you decide between a modal, a new page, and an inline expansion?",
      "How would you make this data-heavy dashboard usable for a first-time user?",
      "How do you handle accessibility requirements that conflict with a visual direction?",
    ],
    behaviouralQuestions: [
      "Tell me about a design that failed after launch and what you learned.",
      "Describe a time you disagreed with a product manager about scope.",
      "Tell me about defending a design decision to an executive with a strong opinion.",
      "Describe working with engineers who said your design was not feasible.",
      "Tell me about designing under a severe time or technical constraint.",
    ],
    questionsToAsk: [
      "How is design involved in deciding what gets built, not just how it looks?",
      "What research capacity does the team have — dedicated researchers or designer-led?",
      "How do you measure whether a design succeeded after launch?",
      "What is the state of the design system?",
    ],
    faq: [
      {
        question: "What do interviewers actually look for in a UX portfolio?",
        answer:
          "Reasoning, not screens. The strongest case studies state the problem and how it was framed, the constraints (technical, timeline, business), the alternatives considered and why they were rejected, your specific contribution on a team, and what happened after launch with numbers. Beautiful final screens with no decision trail is the most common reason strong-looking portfolios fail reviews. Two or three deep case studies beat eight shallow ones.",
      },
      {
        question: "How do I show impact as a UX Designer when I do not own the metrics?",
        answer:
          "Use both usability and business measures, and be honest about attribution. Task success rate, time on task, error rate, and SUS scores from your own testing are directly attributable to your design. Alongside those, cite the product metric that moved after launch — conversion, completion, support ticket volume — while stating that it was a team outcome. Reviewers respond well to \"cut support tickets about billing 40% after redesigning the invoice screen\" because it links design work to a cost the business already tracks.",
      },
      {
        question: "Is UX Designer the same as Product Designer?",
        answer:
          "They increasingly overlap, with Product Designer implying a broader remit: more involvement in product strategy, metrics, and often visual and interaction design end to end. UX Designer can mean a research-heavier role in some organisations and a generalist one in others. Read the responsibilities rather than the title, and mirror the posting's own language on your CV — the same portfolio usually serves both, with the framing adjusted.",
      },
      {
        question: "Do UX Designers need to know how to code?",
        answer:
          "Not to write production code, but familiarity pays. Understanding what is cheap versus expensive to build, what a component library constrains, and how responsive layout actually behaves makes your designs more likely to ship as intended and earns credibility with engineers. Being able to read a component's props or make a small CSS change is genuinely useful; being expected to build features is a different role.",
      },
    ],
    summaryExample:
      "UX designer with 6 years on complex B2B products, working end to end from research through high-fidelity design. Redesigned an invoicing experience that cut billing support tickets 40% and lifted task completion from 61% to 89% in usability testing. Built and maintained a 60-component design system adopted by four product teams.",
    bulletExamples: [
      {
        weak: "Designed user interfaces and created wireframes and prototypes in Figma.",
        strong: "Redesigned the invoice review flow after 12 usability sessions revealed users could not locate line-item disputes, lifting task completion from 61% to 89% and cutting billing support tickets 40%.",
        why: "Producing wireframes is the craft baseline. Naming the research that revealed the problem, the specific misunderstanding, and both a usability and a business metric shows the full designer's loop from evidence to outcome.",
      },
      {
        weak: "Conducted user research to understand customer needs.",
        strong: "Ran 24 contextual interviews with warehouse staff that reframed a requested 'faster search' as a scanning-hardware problem, redirecting a quarter of roadmap effort toward a fix that cut pick errors 27%.",
        why: "\"Conducted research\" gives no evidence the research changed anything. Showing research overturning the stated problem — and the downstream effect — is the strongest form of design impact a CV can claim.",
      },
      {
        weak: "Created and maintained the company design system.",
        strong: "Built a 60-component accessible design system with usage documentation, adopted by 4 product teams and cutting new-screen design time roughly 35% while closing 90+ WCAG contrast violations.",
        why: "Design system work is only impressive with adoption attached. The team count, the time saved, and the accessibility violations closed convert an internal project into measurable organisational leverage.",
      },
    ],
    coreSkills: ["User research (generative & evaluative)", "Information architecture", "Interaction design", "Usability testing", "Accessibility (WCAG)", "Prototyping", "Design systems", "Data-informed design", "Facilitation"],
    tools: ["Figma", "FigJam", "Maze", "UserTesting", "Dovetail", "Miro", "Optimal Workshop", "Hotjar", "Amplitude", "Storybook"],
    metrics: ["Task success rate", "Time on task", "Error rate", "SUS or usability score", "Conversion or completion rate", "Support ticket volume reduced", "Accessibility violations closed", "Design system adoption"],
    seniority: [
      { level: "Junior (0–2 yrs)", expectation: "Executes defined design work. Portfolio should show process, not just outcomes." },
      { level: "Mid (2–5 yrs)", expectation: "Owns features end to end including research. Portfolio should show a design changed by evidence." },
      { level: "Senior (5–8 yrs)", expectation: "Owns product areas and influences strategy. Portfolio should show trade-offs and measured post-launch results." },
      { level: "Lead / Principal (8+ yrs)", expectation: "Sets design direction and mentors. Portfolio should show systems, standards, and team-level impact." },
    ],
    redFlags: [
      "A portfolio of final screens with no problem framing or decision trail.",
      "No measurement of any kind, usability or business.",
      "Unclear contribution on team projects — reviewers assume the least.",
      "Redesign concepts of famous apps with no real constraints, presented as primary work.",
    ],
  },

  // ─── Automation & RPA ──────────────────────────────────────────────────────

  "rpa-developer": {
    intro:
      "RPA interviews test whether you can tell an automatable process from one that should be fixed instead. Expect a process-design round, hands-on questions about a specific platform (usually UiPath, Automation Anywhere or Power Automate), and detailed probing on exception handling — because unattended bots fail silently and the cost of a bad automation is worse than no automation. CVs are read for hours saved and for bots that survived in production.",
    interviewFocus: [
      { area: "Process assessment", detail: "Given a described process, judge whether it is a good automation candidate — rule-based, stable, high volume, structured input — or whether the real answer is fixing the underlying system. Interviewers are checking that you would not automate a broken process." },
      { area: "Platform depth", detail: "Selectors and their fragility, orchestrator scheduling, queues and transactions, reusable components. Usually specific to one vendor, so read the posting." },
      { area: "Exception handling and resilience", detail: "Business versus system exceptions, retry logic, and what happens when a screen changes. The senior differentiator — juniors build happy-path bots." },
      { area: "Governance", detail: "Credential handling, audit logging, version control, and how a bot change gets tested and promoted. Increasingly weighted in regulated sectors." },
    ],
    technicalQuestions: [
      "Walk me through how you decide whether a process is worth automating.",
      "A selector breaks every time the vendor updates the application. How do you make it resilient?",
      "Explain the difference between a business exception and a system exception, and how you handle each.",
      "Design a bot that processes 5,000 invoices overnight. What happens when it fails at item 3,200?",
      "How do you handle credentials in an unattended bot without hardcoding them?",
      "When would you use a queue-based (transactional) architecture over a linear one?",
      "The business says a process takes 4 hours; you observe it takes 40 minutes. How do you handle the ROI case?",
    ],
    behaviouralQuestions: [
      "Tell me about an automation that broke in production. How did you find out and what changed?",
      "Describe a time you recommended against automating something.",
      "Tell me about handing a bot over to a support team.",
      "Describe working with a business owner who could not clearly articulate the process.",
      "Tell me about an automation whose actual savings came in well below the business case.",
    ],
    questionsToAsk: [
      "How many bots are in production, and who supports them when they break?",
      "Is there a CoE, and does it own governance or just delivery?",
      "How is ROI measured after a bot goes live, not just before?",
      "How much of the pipeline is genuine RPA versus API integration work?",
    ],
    faq: [
      {
        question: "What does an RPA Developer interview focus on?",
        answer:
          "Process judgement first, platform skill second. The round that decides most loops describes a business process and asks whether you would automate it — interviewers want to hear you check for rule-based logic, stable inputs, sufficient volume, and whether an API exists that would make the bot unnecessary. After that come platform-specific questions on selectors, orchestrator queues and reusable components, and a deep dive on exception handling, which is where unattended automation actually lives or dies.",
      },
      {
        question: "Which RPA platform should I learn?",
        answer:
          "UiPath has the largest share of job postings and the most transferable ecosystem, so it is the safest single choice. Automation Anywhere and Blue Prism remain common in large enterprises, particularly finance and insurance. Microsoft Power Automate is growing fastest because it arrives bundled with existing Microsoft licensing. The concepts transfer well between them, so depth in one plus familiarity with the vocabulary of the others is a stronger position than shallow exposure to three.",
      },
      {
        question: "What metrics belong on an RPA Developer CV?",
        answer:
          "Hours returned to the business, transactions processed, and bot reliability. \"Automated invoice matching across 3 ERPs, processing 5,000 transactions/night at 99.4% straight-through rate and returning ~2,100 FTE-hours annually\" works because it names volume, quality and value together. Also state how many bots you have in production and whether they are attended or unattended — unattended bots imply a much higher bar for exception handling.",
      },
      {
        question: "Is RPA a dead end now that AI can automate processes?",
        answer:
          "The field is changing rather than disappearing, but the change is real and worth positioning for. Straightforward screen-scraping work is being displaced by API integration and by AI-based document processing that handles unstructured input RPA never could. The developers doing well are the ones moving toward intelligent automation — combining bots with document understanding and decision models — and toward the process-analysis skills that hold value regardless of tooling. A CV that shows only screen automation on legacy applications is the exposed position.",
      },
    ],
    summaryExample:
      "RPA developer with 5 years delivering unattended automation in insurance operations. Built and support 34 production bots processing 5,000 transactions/night at 99.4% straight-through rate, returning ~2,100 FTE-hours annually. UiPath Advanced certified, strongest in queue-based architecture and exception design.",
    bulletExamples: [
      {
        weak: "Developed RPA bots using UiPath to automate business processes.",
        strong: "Built 12 unattended UiPath bots for claims intake, processing 5,000 transactions/night at 99.4% straight-through rate and returning ~2,100 FTE-hours annually.",
        why: "\"Automated business processes\" is the role definition. Volume, straight-through rate and hours returned are the three numbers an RPA hiring manager compares candidates on, and the straight-through rate in particular signals that the bots actually work unsupervised.",
      },
      {
        weak: "Handled exceptions and maintained existing automations.",
        strong: "Re-architected 8 fragile linear bots into a queue-based framework with typed business/system exception handling, cutting failed transactions from 11% to 0.6% and eliminating overnight manual restarts.",
        why: "Maintenance sounds like keeping the lights on. Naming the architectural change and the failure-rate movement shows you fixed the design rather than patching symptoms — and \"eliminating overnight manual restarts\" is the human cost a manager recognises immediately.",
      },
      {
        weak: "Worked with business teams to identify automation opportunities.",
        strong: "Assessed 40 candidate processes against volume, rule stability and input structure; automated 14 and recommended API integration or process redesign for 9, avoiding an estimated £180k of low-value bot build.",
        why: "Identifying opportunities is easy; the senior skill is declining the bad ones. Quantifying what you recommended against — and the spend avoided — is unusual on RPA CVs and reads as genuine judgement.",
      },
    ],
    coreSkills: ["Process assessment & ROI analysis", "Queue-based bot architecture", "Exception handling design", "Selector engineering", "Orchestrator administration", "Process documentation (PDD/SDD)", "Credential & secrets handling", "Reusable component design"],
    tools: ["UiPath", "Automation Anywhere", "Blue Prism", "Power Automate", "UiPath Orchestrator", "Python", "VBA", "SQL", "Document Understanding", "Git", "Jira"],
    metrics: ["Transactions processed per run/day", "FTE-hours returned annually", "Straight-through processing rate", "Failed-transaction rate", "Bots in production supported", "Cost saved or avoided", "Average handling time before/after"],
    seniority: [
      { level: "Junior (0–2 yrs)", expectation: "Builds bots to an existing design. CV should show one platform in depth and bots that reached production." },
      { level: "Mid (2–4 yrs)", expectation: "Owns automations end to end including support. CV should show volume and reliability numbers." },
      { level: "Senior (4–7 yrs)", expectation: "Designs frameworks and assesses pipeline. CV should show reusable architecture and processes you declined." },
      { level: "Lead / Architect (7+ yrs)", expectation: "Owns the automation estate and governance. CV should show CoE standards and portfolio-level value." },
    ],
    redFlags: [
      "Bot counts with no transaction volume or reliability figures.",
      "No mention of exception handling — the half of RPA that determines whether bots survive.",
      "Only attended/desktop automation, which implies a much lower engineering bar.",
      "Claimed savings with no basis stated, which invites scepticism in a field known for inflated business cases.",
    ],
  },

  "automation-engineer": {
    intro:
      "Automation Engineer means different things at different companies — test automation, infrastructure automation, or business-process automation — so the first job of your CV is making clear which one you are. Interviews test whether you build automation that other people trust and maintain, rather than scripts that only work on your machine.",
    interviewFocus: [
      { area: "Scoping what to automate", detail: "Judging where automation pays back and where it creates a maintenance burden worse than the manual task. The question behind most scenario rounds." },
      { area: "Hands-on scripting", detail: "Python, Bash or PowerShell against a realistic problem — parsing output, calling an API, handling partial failure. Usually a live exercise." },
      { area: "Reliability and idempotency", detail: "What happens when your automation runs twice, or dies halfway. The most common gap between junior and senior candidates." },
      { area: "Handover and maintainability", detail: "Logging, documentation, alerting, and whether someone else can debug your automation at 3am." },
    ],
    technicalQuestions: [
      "You have a manual process that takes 30 minutes and runs twice a week. Is it worth automating? Walk me through the maths.",
      "Write a script that reconciles two data sources and reports differences. How do you handle a partial failure?",
      "How do you make an automation idempotent so a re-run does not duplicate work?",
      "Your automation silently stopped running three weeks ago and nobody noticed. What was missing?",
      "How do you handle credentials in scheduled automation?",
      "How would you test automation that touches production systems?",
      "When would you recommend against automating something?",
    ],
    behaviouralQuestions: [
      "Tell me about automation you built that nobody ended up using. Why?",
      "Describe a script that broke in a way that caused real damage.",
      "Tell me about handing automation over to a team that had to maintain it.",
      "Describe convincing a team to stop doing something manually.",
      "Tell me about a time the manual process turned out to be the right answer.",
    ],
    questionsToAsk: [
      "What does 'automation engineer' cover on this team — testing, infrastructure, or business process?",
      "Who maintains automation after the person who wrote it moves on?",
      "How is automation success measured here?",
      "What is the largest manual process still running today?",
    ],
    faq: [
      {
        question: "What does an Automation Engineer actually do?",
        answer:
          "It depends heavily on the company, and this ambiguity is the main thing to resolve before applying. In some organisations it is test automation and sits inside QA; in others it is infrastructure and CI/CD work overlapping with DevOps; in others it is business-process automation close to RPA. Read the tools in the posting — Selenium and Playwright mean testing, Terraform and Ansible mean infrastructure, UiPath or Power Automate mean process. Mirror the corresponding vocabulary on your CV.",
      },
      {
        question: "What separates a senior automation engineer from a junior one?",
        answer:
          "Judgement about what not to automate, and building things that survive handover. Juniors write scripts that work; seniors write automation with logging, alerting on silent failure, idempotent behaviour on re-run, and documentation that lets someone else debug it. The interview question that exposes this is \"your automation stopped running three weeks ago and nobody noticed\" — a senior answer talks about heartbeat monitoring and alerting on absence, not just on errors.",
      },
      {
        question: "What metrics belong on an Automation Engineer CV?",
        answer:
          "Manual hours removed, error rates before and after, and reliability of the automation itself. \"Automated the monthly reconciliation, removing 18 hours of manual work per cycle and eliminating the three recurring transposition errors that had triggered restatements\" carries both the time saved and the quality gain. Also state how much of what you built is still running — automation that outlives your tenure is the strongest possible signal.",
      },
      {
        question: "Do I need to be a strong programmer?",
        answer:
          "You need to be a competent one, and increasingly the bar is rising toward software engineering practice rather than scripting. Version control, tests for your automation, code review, and structuring code so it can be maintained by others are now expected in most postings. You do not need algorithm depth, but automation written as a single 800-line script with no error handling is the pattern that gets flagged in interviews.",
      },
    ],
    summaryExample:
      "Automation engineer with 5 years removing manual operations work in financial services. Automated 30 recurring processes in Python and Ansible, removing ~1,400 hours of manual effort annually and eliminating a recurring reconciliation error that had caused two restatements. Builds with logging, heartbeat alerting and handover documentation as standard.",
    bulletExamples: [
      {
        weak: "Automated manual processes using Python scripts.",
        strong: "Automated 30 recurring operations processes in Python, removing ~1,400 manual hours annually — all with heartbeat alerting, so silent failures page within 15 minutes rather than being discovered weeks later.",
        why: "Script-writing is the baseline. The hours returned quantify value, and the heartbeat detail demonstrates the maturity that distinguishes automation which is trusted from automation which is quietly abandoned.",
      },
      {
        weak: "Maintained and improved existing automation scripts.",
        strong: "Refactored 40 standalone scripts into a shared library with common error handling and structured logging, cutting mean time to debug a failure from ~2 hours to 15 minutes and enabling handover to a 4-person support team.",
        why: "Maintenance work becomes compelling when framed as leverage. The debug-time reduction and the successful handover show you improved how the team operates, not just the code.",
      },
      {
        weak: "Worked with stakeholders to identify processes to automate.",
        strong: "Assessed 25 candidate processes on frequency, duration and error cost; automated 11 and redesigned 6 out of existence entirely, since the underlying reports were no longer used.",
        why: "The strongest automation outcome is often deleting the process. Showing you eliminated work rather than automating it demonstrates exactly the judgement senior automation roles hire for.",
      },
    ],
    coreSkills: ["Process analysis & ROI judgement", "Python / Bash / PowerShell", "Idempotent design", "Error handling & structured logging", "Scheduling & orchestration", "API integration", "Secrets management", "Documentation & handover"],
    tools: ["Python", "Bash", "PowerShell", "Ansible", "Terraform", "Airflow", "Jenkins", "GitHub Actions", "Selenium", "Playwright", "Power Automate", "REST APIs", "Git"],
    metrics: ["Manual hours removed per year", "Processes automated (and retired)", "Error rate before and after", "Automation uptime / silent-failure detection time", "Mean time to debug", "Cost saved"],
    seniority: [
      { level: "Junior (0–2 yrs)", expectation: "Writes scripts to spec. CV should show working automation and one scripting language properly." },
      { level: "Mid (2–5 yrs)", expectation: "Owns automation end to end including its monitoring. CV should show hours saved and reliability." },
      { level: "Senior (5–8 yrs)", expectation: "Builds frameworks others use. CV should show shared tooling and successful handover." },
      { level: "Lead (8+ yrs)", expectation: "Sets automation strategy. CV should show portfolio-level value and governance." },
    ],
    redFlags: [
      "No statement of which automation discipline you work in, forcing the reviewer to guess.",
      "Hours saved claimed with no basis or baseline.",
      "No mention of monitoring or failure handling, implying scripts nobody trusts.",
      "Automation described with no indication anyone else could maintain it.",
    ],
  },

  // ─── Security specialisations ──────────────────────────────────────────────

  "network-security-engineer": {
    intro:
      "Network Security Engineer interviews go deeper on protocol fundamentals than most security roles, because the job is defending the layer where theory meets packet capture. Expect firewall and segmentation design, hands-on troubleshooting, and questions about the trade-off every control creates between security and the network actually working. CVs are read for the scale of the estate you defended and for changes that reduced attack surface measurably.",
    interviewFocus: [
      { area: "Protocol and packet-level fundamentals", detail: "TCP handshakes, TLS negotiation, DNS behaviour, routing and NAT. Interviewers ask you to read a capture or explain why a connection fails — this is where claimed depth is verified quickly." },
      { area: "Firewall and segmentation design", detail: "Rule-base design, zero-trust segmentation, east-west traffic control, and how you avoid the any-any rule that accumulates in every mature estate." },
      { area: "Detection and response at the network layer", detail: "IDS/IPS tuning, egress monitoring, identifying command-and-control traffic and data exfiltration patterns." },
      { area: "Operational trade-offs", detail: "How you deploy a control without breaking production, and how you have handled the change that did break it." },
    ],
    technicalQuestions: [
      "Walk me through what happens on the wire when a TLS connection is established, and where you could inspect it.",
      "Design segmentation for a flat corporate network of 4,000 hosts. Where do you start and what do you break first?",
      "A user reports an application is slow. The firewall shows accepted traffic. How do you diagnose?",
      "How would you detect command-and-control traffic that uses DNS as its channel?",
      "Your firewall rule base has 3,000 rules accumulated over a decade. How do you clean it up safely?",
      "What is the difference between IDS and IPS in practice, and why do so many organisations run IPS in detect-only mode?",
      "How do you secure east-west traffic in a virtualised data centre?",
    ],
    behaviouralQuestions: [
      "Tell me about a change you made that took down production. What did you learn?",
      "Describe an incident where the network told you something the endpoint tooling missed.",
      "Tell me about pushing a segmentation project through an organisation that resisted it.",
      "Describe a time you had to accept a risk rather than remediate it.",
      "Tell me about tuning a noisy detection system.",
    ],
    questionsToAsk: [
      "How segmented is the estate today, honestly?",
      "Is IPS running in prevent mode, and if not, what is blocking that?",
      "Who owns firewall rule hygiene, and when was the base last reviewed?",
      "How much of the network is visible to monitoring — including egress?",
    ],
    faq: [
      {
        question: "How deep do network security interviews go on fundamentals?",
        answer:
          "Deeper than most other security specialisations. It is normal to be asked to walk through a TCP handshake, explain where TLS inspection is possible and what it breaks, or interpret a packet capture live. The reason is practical: this role's daily work involves distinguishing a security control blocking traffic from a routing problem, and that requires genuine protocol knowledge rather than tool familiarity. Candidates who know firewall GUIs but not what is happening on the wire are found out quickly.",
      },
      {
        question: "What metrics belong on a Network Security Engineer CV?",
        answer:
          "Estate size, attack-surface reduction, and detection outcomes. Concretely: hosts and sites protected, firewall rules rationalised, segments created, exposed services removed, IPS signatures tuned and the resulting false-positive reduction, and mean time to detect network-layer incidents. \"Segmented a flat 4,000-host network into 12 zones, cutting reachable attack surface 80% with zero unplanned outages\" is strong because it names the scale, the outcome and the operational discipline together.",
      },
      {
        question: "Is network security still relevant with everything moving to cloud and zero trust?",
        answer:
          "The layer has shifted rather than disappeared, and the shift is where the opportunity is. Perimeter firewalls matter less; identity-aware segmentation, cloud security groups, service mesh policy, and egress control matter more. The skills that transfer are the fundamentals — understanding traffic flow, trust boundaries and failure modes. The engineers at risk are those whose experience is entirely appliance administration on a single vendor; those who have moved into cloud network security and micro-segmentation are in strong demand.",
      },
      {
        question: "Which certifications matter for this role?",
        answer:
          "Vendor certifications carry real weight here because estates are vendor-specific: Palo Alto PCNSE, Cisco CCNP Security, Fortinet NSE. Alongside those, CISSP is common for senior and architecture-track roles, and cloud certifications increasingly matter as segmentation moves into AWS and Azure. List the vendor certification that matches the posting's stack prominently — it is frequently used as a screening filter.",
      },
    ],
    summaryExample:
      "Network security engineer with 7 years defending a 4,000-host multi-site estate in manufacturing. Led the segmentation programme that cut reachable attack surface 80% across 12 zones with zero unplanned outages, and rationalised a decade-old 3,000-rule firewall base down to 640. PCNSE certified; strongest in segmentation design and egress monitoring.",
    bulletExamples: [
      {
        weak: "Managed firewalls and network security infrastructure.",
        strong: "Rationalised a 3,000-rule Palo Alto base to 640 by mapping every rule to an owning application, removing 41 any-any rules and 900 rules with no traffic hits in 12 months — with no service disruption.",
        why: "\"Managed firewalls\" is administration. The rule-count reduction, the method (mapping to owning applications), and the any-any removal show a disciplined project, and \"no service disruption\" pre-empts the obvious risk question.",
      },
      {
        weak: "Implemented network segmentation to improve security posture.",
        strong: "Segmented a flat 4,000-host network into 12 zones over three phases, cutting laterally reachable hosts from ~4,000 to ~300 per zone, with a monitor-first rollout that caught 60 undocumented dependencies before enforcement.",
        why: "\"Improved posture\" is unmeasurable. Lateral reachability is the number segmentation actually changes, and the monitor-first approach demonstrates the operational judgement that separates successful segmentation projects from outages.",
      },
      {
        weak: "Monitored network traffic and responded to security alerts.",
        strong: "Tuned 200+ IPS signatures and built egress baselining that surfaced DNS-tunnelled C2 traffic missed by endpoint tooling, cutting network-alert false positives 71% and enabling a move from detect-only to prevent mode.",
        why: "Monitoring is the job description. The DNS-tunnelling detection is a concrete, memorable win, and moving IPS from detect-only to prevent is a milestone every network security manager understands as hard-won.",
      },
    ],
    coreSkills: ["TCP/IP & protocol analysis", "Firewall rule design", "Network segmentation / zero trust", "IDS/IPS tuning", "VPN & remote access", "Egress monitoring", "Packet capture analysis", "Cloud network security", "Incident response"],
    tools: ["Palo Alto", "Cisco ASA/Firepower", "Fortinet", "Wireshark", "Zeek", "Suricata", "Snort", "Splunk", "AWS Security Groups / NACLs", "Azure NSG", "Terraform", "Python"],
    metrics: ["Hosts and sites protected", "Firewall rules rationalised", "Segments created / lateral reachability reduced", "Exposed services removed", "False-positive reduction after tuning", "Mean time to detect", "Unplanned outages caused (ideally zero)"],
    seniority: [
      { level: "Junior (0–2 yrs)", expectation: "Executes firewall changes and triages alerts. CV should show protocol fundamentals and one vendor stack." },
      { level: "Mid (2–5 yrs)", expectation: "Owns a site or domain. CV should show estate scale and a tuning or hygiene project." },
      { level: "Senior (5–8 yrs)", expectation: "Designs segmentation and standards. CV should show a programme with measured attack-surface reduction." },
      { level: "Principal / Architect (8+ yrs)", expectation: "Sets network security architecture. CV should show multi-site or cloud transformation and its risk outcome." },
    ],
    redFlags: [
      "Vendor GUI familiarity with no evidence of protocol-level understanding.",
      "No estate scale stated, making the environment impossible to gauge.",
      "Segmentation claimed with no mention of dependency discovery or rollout approach.",
      "No operational outcomes — the discipline is judged on changes that did not break production.",
    ],
  },

  "iam-engineer": {
    intro:
      "IAM Engineer interviews centre on protocol precision and on lifecycle design. Expect to be asked to explain OAuth and SAML flows accurately — this is a field where approximate understanding shows immediately — plus questions about joiner-mover-leaver processes, privileged access, and the access reviews that auditors will examine. CVs are read for identities managed, access removed, and audit outcomes.",
    interviewFocus: [
      { area: "Protocol depth", detail: "OAuth 2.0 grant types, OIDC versus SAML, token validation, and the difference between authentication and authorisation. Interviewers ask you to walk a full flow; vague answers end loops." },
      { area: "Lifecycle and provisioning", detail: "Joiner-mover-leaver automation, SCIM provisioning, and the mover case specifically — accumulated entitlements from role changes are the most common real-world IAM failure." },
      { area: "Privileged access", detail: "PAM design, just-in-time elevation, break-glass accounts, and how you have reduced standing privilege." },
      { area: "Governance and audit", detail: "Access certification campaigns, segregation of duties, and evidence production for auditors." },
    ],
    technicalQuestions: [
      "Walk me through the OAuth 2.0 authorization code flow with PKCE, and explain what PKCE prevents.",
      "When would you use SAML over OIDC, and why is that decision usually made for you?",
      "A user changed departments 18 months ago and still has their old access. How do you fix this systemically?",
      "Design joiner-mover-leaver automation for a 5,000-employee organisation with 200 applications.",
      "How do you eliminate standing privileged access without breaking emergency response?",
      "What do you validate when your application receives a JWT?",
      "How would you run an access certification campaign that reviewers do not rubber-stamp?",
    ],
    behaviouralQuestions: [
      "Tell me about an access-related incident and what changed afterwards.",
      "Describe an audit finding you had to remediate.",
      "Tell me about rolling out MFA or SSO against user resistance.",
      "Describe a time you had to deny access to someone senior.",
      "Tell me about untangling entitlements in an application nobody understood.",
    ],
    questionsToAsk: [
      "How much of joiner-mover-leaver is automated today?",
      "What proportion of privileged access is standing versus just-in-time?",
      "How are access certifications run, and what is the actual revocation rate?",
      "Which applications are still outside SSO, and why?",
    ],
    faq: [
      {
        question: "What is the most common IAM interview question?",
        answer:
          "Walking through an OAuth or SAML flow end to end. It comes up in nearly every loop because it separates genuine understanding from vocabulary. Be able to describe the authorization code flow with PKCE, name what each redirect carries, explain what PKCE prevents and why it now applies to confidential clients too, and articulate the difference between an access token and an ID token. Approximate answers here are conspicuous, because the details are exactly what the job requires you to get right.",
      },
      {
        question: "What does an IAM Engineer CV need to show?",
        answer:
          "Scale of identity estate, automation coverage, and risk removed. Concretely: identities and applications managed, percentage of joiner-mover-leaver automated, standing privileged accounts eliminated, orphaned accounts removed, applications onboarded to SSO and MFA, and audit findings closed. \"Automated JML across 200 applications for 5,000 identities, cutting leaver access-removal time from 9 days to under 1 hour\" is the strongest bullet shape because leaver latency is a risk number every security leader tracks.",
      },
      {
        question: "Which is the harder problem, joiners or leavers?",
        answer:
          "Movers, and it is worth saying so in an interview. Joiners are usually well handled because someone is waiting for access, and leavers get attention because the risk is obvious. Movers accumulate entitlements quietly — someone transfers department and keeps their old permissions alongside their new ones, until years later they hold access spanning three roles. This is the mechanism behind most segregation-of-duties findings, and demonstrating that you have designed for it signals real operational experience.",
      },
      {
        question: "Is IAM a good specialisation to move into?",
        answer:
          "It is one of the more durable security specialisations, because identity has become the primary control plane as perimeters dissolved. Demand is steady, the skills transfer across cloud providers, and the work sits close to both engineering and governance, which opens routes in either direction. The common entry paths are from systems administration, service desk with an access-management focus, or general security operations. Protocol depth plus one major platform — Entra ID, Okta or SailPoint — is a strong starting position.",
      },
    ],
    summaryExample:
      "IAM engineer with 6 years running identity for a 5,000-employee regulated business across 200 applications. Automated joiner-mover-leaver end to end, cutting leaver access removal from 9 days to under 1 hour and eliminating 1,400 orphaned accounts. Removed 92% of standing privileged access through just-in-time elevation. Deep in OIDC, SAML and SailPoint governance.",
    bulletExamples: [
      {
        weak: "Managed user accounts and access permissions across enterprise systems.",
        strong: "Automated joiner-mover-leaver across 200 applications for 5,000 identities via SCIM and SailPoint workflows, cutting leaver access-removal time from 9 days to under 1 hour.",
        why: "Account administration is the baseline. Leaver latency is the number auditors and security leaders actually track, and cutting it from days to an hour is an unambiguous risk reduction with the scale stated alongside.",
      },
      {
        weak: "Implemented single sign-on and multi-factor authentication.",
        strong: "Onboarded 140 applications to Entra ID SSO with phishing-resistant MFA, retiring 90 local credential stores and cutting password-reset tickets 64%.",
        why: "SSO and MFA rollouts are common; what differentiates is scope and second-order effect. Retiring local credential stores is the actual security win, and the ticket reduction gives the business case a number.",
      },
      {
        weak: "Performed periodic access reviews for compliance purposes.",
        strong: "Redesigned quarterly access certification around risk-ranked entitlements with manager-level context, lifting revocation rate from 2% to 19% and closing 3 repeat SOX findings.",
        why: "Access reviews are notoriously rubber-stamped, and a 2% revocation rate is the tell. Moving it to 19% proves the campaign became genuine rather than ceremonial, and the closed findings tie it to audit outcomes.",
      },
    ],
    coreSkills: ["OAuth 2.0 / OIDC", "SAML", "Identity lifecycle (JML)", "SCIM provisioning", "Privileged access management", "Access certification & SoD", "Directory services", "Conditional access policy", "Audit evidence production"],
    tools: ["Microsoft Entra ID", "Okta", "SailPoint", "CyberArk", "Active Directory", "Ping Identity", "AWS IAM", "Keycloak", "PowerShell", "Python", "Terraform"],
    metrics: ["Identities and applications managed", "JML automation coverage", "Leaver access-removal time", "Standing privileged accounts eliminated", "Orphaned accounts removed", "Certification revocation rate", "Audit findings closed"],
    seniority: [
      { level: "Junior (0–2 yrs)", expectation: "Handles access requests and basic administration. CV should show directory fundamentals and one IAM platform." },
      { level: "Mid (2–5 yrs)", expectation: "Owns lifecycle automation for an area. CV should show applications onboarded and automation coverage." },
      { level: "Senior (5–8 yrs)", expectation: "Designs identity architecture and governance. CV should show a JML or PAM programme with risk metrics." },
      { level: "Principal / Architect (8+ yrs)", expectation: "Owns identity strategy. CV should show enterprise-wide transformation and audit outcomes." },
    ],
    redFlags: [
      "Protocol names listed without evidence of flow-level understanding.",
      "No identity or application counts, making the estate impossible to size.",
      "Access reviews mentioned with no revocation or finding outcomes.",
      "No mention of the mover case, which suggests joiner/leaver-only experience.",
    ],
  },

  "security-architect": {
    intro:
      "Security Architect interviews test whether you can design controls that a business will actually accept. Expect an architecture review round where you critique a proposed design, threat modelling, and questions about risk acceptance — because the defining skill is choosing which risks to carry, not eliminating all of them. CVs are read for systems designed, risk reduced, and standards other teams adopted.",
    interviewFocus: [
      { area: "Architecture review", detail: "Given a proposed system, identify the trust boundaries, the failure modes, and the controls you would require versus recommend. The core round." },
      { area: "Threat modelling", detail: "STRIDE or attack-tree reasoning over a described system, and prioritising findings by realistic exploitability rather than theoretical severity." },
      { area: "Risk communication", detail: "Explaining a technical risk to an executive in business terms, and defending a decision to accept a risk rather than remediate it." },
      { area: "Breadth across domains", detail: "Identity, network, application, cloud and data security — architects are expected to reason across all of them rather than deeply in one." },
    ],
    technicalQuestions: [
      "Here is a proposed architecture for a customer portal. Walk me through your threat model.",
      "How would you secure a multi-tenant SaaS platform so one tenant cannot reach another's data?",
      "A team wants to ship without addressing a finding you raised. How do you handle it?",
      "Design the security architecture for a migration from on-premise to AWS.",
      "How do you decide which of 40 findings actually get remediated this quarter?",
      "What controls would you require before allowing a third party direct database access?",
      "How do you secure secrets and service-to-service authentication in a microservice estate?",
    ],
    behaviouralQuestions: [
      "Tell me about a risk you accepted rather than remediated, and how you justified it.",
      "Describe an architecture decision you got wrong.",
      "Tell me about persuading engineering leadership to fund security work.",
      "Describe balancing a security requirement against a delivery deadline.",
      "Tell me about a standard you introduced that teams actually adopted.",
    ],
    questionsToAsk: [
      "Is architecture review a gate or an advisory function here?",
      "How is risk acceptance documented, and who signs it off?",
      "How much of the estate has been threat modelled?",
      "What is the relationship between architecture and the engineering teams building?",
    ],
    faq: [
      {
        question: "What separates a Security Architect from a senior Security Engineer?",
        answer:
          "Breadth and influence rather than depth. Engineers own and operate specific controls; architects design across domains — identity, network, application, cloud, data — and are measured on whether teams adopt what they specify. The interview reflects this: architect loops centre on reviewing a design and defending trade-offs, including which risks you would accept, while engineer loops go deeper hands-on in one area. If you cannot yet reason across all the domains, the engineer track is the stronger application.",
      },
      {
        question: "How important is risk acceptance in these interviews?",
        answer:
          "More than candidates expect, and it is a common failure point. Architects who require every finding remediated get routed around by delivery teams, which makes them ineffective regardless of technical correctness. Strong answers show a framework — likelihood, impact, exploitability, compensating controls — and at least one concrete example of a risk you accepted, documented, and revisited. Being able to say \"we accepted it for two quarters with monitoring in place, and here is what would have changed my mind\" signals real seniority.",
      },
      {
        question: "What metrics belong on a Security Architect CV?",
        answer:
          "Adoption and risk reduction, not activity. Systems reviewed or threat modelled, standards published and the number of teams that adopted them, critical findings remediated versus accepted, reduction in a measurable exposure (internet-facing services, standing privilege, unencrypted data stores), and audit or certification outcomes achieved. \"Published a secure-by-default cloud landing zone adopted by 14 teams, cutting misconfiguration findings per deployment by 78%\" is strong because adoption is the architect's real product.",
      },
      {
        question: "Do I need CISSP to be a Security Architect?",
        answer:
          "It is not universally required but it appears in a large share of postings and is frequently used as a screening filter, particularly in regulated industries and for roles with management scope. CCSP or a cloud provider's security specialty certification is increasingly valuable as estates move to cloud, and SABSA or TOGAF appear in more formal architecture functions. Practically: if you are applying to enterprises, CISSP removes a filter; if you are applying to product companies, demonstrated design work matters more.",
      },
    ],
    summaryExample:
      "Security architect with 9 years across financial services and SaaS. Designed the cloud landing zone adopted by 14 engineering teams, cutting misconfiguration findings per deployment 78%, and led the threat-modelling programme covering 40 systems. Comfortable defending risk-acceptance decisions to an audit committee. CISSP, AWS Security Specialty.",
    bulletExamples: [
      {
        weak: "Designed security architecture for enterprise applications.",
        strong: "Designed a secure-by-default AWS landing zone — enforced encryption, private networking and guardrail SCPs — adopted by 14 teams and cutting misconfiguration findings per deployment 78%.",
        why: "Design work only counts if it is used. Naming the controls and, critically, the adoption across 14 teams converts an architecture document into organisational change with a measured effect.",
      },
      {
        weak: "Conducted threat modelling and security reviews.",
        strong: "Ran threat modelling across 40 systems, prioritising by realistic exploitability rather than CVSS alone — 31 criticals remediated, 9 formally risk-accepted with compensating monitoring and quarterly review.",
        why: "Review counts alone say nothing about outcomes. Splitting remediated from accepted shows the judgement the role exists for, and the compensating controls demonstrate that acceptance was deliberate rather than neglect.",
      },
      {
        weak: "Advised engineering teams on security best practices.",
        strong: "Replaced advisory review with a self-serve control library and automated policy checks in CI, cutting mean security-review turnaround from 11 days to same-day and removing architecture as a delivery bottleneck.",
        why: "\"Advised teams\" is unmeasurable and often means being ignored. Turning advice into tooling is the senior move, and removing yourself as a bottleneck is the outcome engineering leadership cares about.",
      },
    ],
    coreSkills: ["Threat modelling", "Security architecture design", "Risk assessment & acceptance", "Cloud security architecture", "Identity architecture", "Data protection & encryption", "Secure SDLC", "Compliance frameworks", "Executive communication"],
    tools: ["AWS", "Azure", "GCP", "Terraform", "STRIDE", "OWASP ASVS", "NIST CSF", "ISO 27001", "CIS Benchmarks", "Wiz / Prisma Cloud", "HashiCorp Vault"],
    metrics: ["Systems threat modelled", "Standards published and teams adopting", "Critical findings remediated vs accepted", "Exposure reduced (internet-facing services, standing privilege)", "Security review turnaround time", "Audit or certification outcomes"],
    seniority: [
      { level: "Associate (3–5 yrs)", expectation: "Reviews designs within a domain. CV should show hands-on depth plus one design you owned." },
      { level: "Architect (5–9 yrs)", expectation: "Owns architecture for a business area. CV should show standards adopted and risk decisions made." },
      { level: "Senior / Principal (9+ yrs)", expectation: "Sets enterprise security architecture. CV should show transformation programmes and board-level risk communication." },
    ],
    redFlags: [
      "Frameworks listed with no design you personally owned.",
      "No adoption evidence — standards written but not taken up.",
      "Every finding presented as remediated, implying no real prioritisation.",
      "No cloud architecture experience, which is now assumed in most postings.",
    ],
  },

  // ─── Games ─────────────────────────────────────────────────────────────────

  "game-designer": {
    intro:
      "Game Designer hiring is decided by a portfolio and a design test, not a CV alone. Studios want evidence you can specify a system precisely enough for engineers to build, iterate it based on playtest data, and cut your own ideas when they do not work. The most common weakness is presenting concepts rather than shipped, tuned systems.",
    interviewFocus: [
      { area: "Portfolio and shipped work", detail: "Systems you designed, your specific contribution, and how the design changed between first version and ship. Studios probe hard on what you personally owned." },
      { area: "Design test", detail: "A take-home or on-site brief — design a mechanic, rebalance an economy, fix a described problem. Scored on constraint awareness and on whether you specify clearly enough to be built." },
      { area: "Systems and balance reasoning", detail: "Economy tuning, progression curves, difficulty pacing, and how you would instrument a system to know whether it works." },
      { area: "Playtesting and iteration", detail: "How you gather feedback, distinguish what players say from what they do, and decide what to change." },
    ],
    technicalQuestions: [
      "Design a progression system for a session-based game. How do you avoid it becoming a grind?",
      "Players report the mid-game is boring. How do you diagnose and fix that?",
      "Your economy is inflating and late-game currency is worthless. Walk me through the fix.",
      "How would you rebalance a character that is dominating competitive play without gutting its identity?",
      "What metrics would you instrument to know whether a new mechanic is working?",
      "Design a tutorial for a complex strategy game without using text walls.",
      "How do you write a design spec an engineer can build from without constant clarification?",
    ],
    behaviouralQuestions: [
      "Tell me about a mechanic you designed that failed playtesting. What did you do?",
      "Describe cutting a feature you had personally championed.",
      "Tell me about a disagreement with an engineer or artist about feasibility.",
      "Describe responding to community backlash after a balance change.",
      "Tell me about designing under a hard technical or platform constraint.",
    ],
    questionsToAsk: [
      "How much of the design is data-driven versus designer intuition here?",
      "What does the playtest cadence look like, and who observes?",
      "How much autonomy do designers have over their systems post-launch?",
      "What is the relationship between design and live-ops on this title?",
    ],
    faq: [
      {
        question: "What does a game design portfolio need to contain?",
        answer:
          "Two or three systems shown in depth, not a catalogue of concepts. For each: the design problem and its constraints, your specific contribution if it was a team project, the first version, what playtesting revealed, and what you changed as a result. Include the actual artefacts — a spec, a balance spreadsheet, a progression curve — because studios want to see whether you can specify precisely enough to be built. Shipped work beats unshipped, and a small shipped game beats an elaborate design document for a game that never existed.",
      },
      {
        question: "Do I need to be able to code or use an engine?",
        answer:
          "You do not need to be an engineer, but designers who can prototype in Unity or Unreal — even roughly, with blueprints or simple scripts — iterate faster and are consistently more employable. Being able to build a grey-box version of your own idea removes a dependency and lets you test a mechanic before asking anyone to build it properly. Scripting and data-driven tuning (spreadsheets, config files) are effectively baseline expectations rather than differentiators.",
      },
      {
        question: "What metrics belong on a game designer's CV?",
        answer:
          "Titles shipped and their scale first — platform, player numbers, review scores where flattering. Then design outcomes: retention or session-length change after a system you tuned, conversion or engagement effects of an economy change, difficulty completion rates you moved. \"Rebalanced the mid-game economy, lifting D30 retention from 8% to 12%\" is strong because retention is the number the whole studio is judged on. Be careful to claim only your contribution — studios verify.",
      },
      {
        question: "How do I break into game design without shipped titles?",
        answer:
          "Ship something small yourself. A finished, tuned game jam entry or a released mod demonstrates more than an unbuilt design document, because it proves you can carry an idea through constraints to completion. Mod communities, jams and small collaborative projects are the conventional routes. Also consider adjacent entry points — QA and live-ops roles inside studios convert to design fairly often, and they give you the playtest and telemetry exposure the discipline runs on.",
      },
    ],
    summaryExample:
      "Game designer with 6 years across two shipped free-to-play titles (12M+ combined installs). Owned the mid-game economy and progression on a live title, lifting D30 retention from 8% to 12% through a reworked reward curve validated across four A/B cohorts. Prototypes in Unity; writes specs engineers can build from without follow-up.",
    bulletExamples: [
      {
        weak: "Designed game mechanics and systems for mobile titles.",
        strong: "Owned the mid-game progression and economy on a live title with 4M MAU, reworking the reward curve to lift D30 retention from 8% to 12% across four A/B-tested iterations.",
        why: "\"Designed mechanics\" gives no scope or result. Naming the system owned, the player scale, the retention movement and the iteration count shows a designer who tunes with data rather than shipping a first draft.",
      },
      {
        weak: "Created design documents and worked with the development team.",
        strong: "Wrote the specs for 14 shipped systems including a crafting rework built by a 5-engineer team, cutting design-clarification requests to under 2 per feature through worked examples and edge-case tables.",
        why: "Documentation is only valuable if it is buildable. Quantifying clarification requests is an unusual, credible way to show your specs are actually precise — which is the practical skill studios hire designers for.",
      },
      {
        weak: "Conducted playtesting and gathered player feedback.",
        strong: "Ran 30+ moderated playtests and paired them with funnel telemetry, identifying that players quit at a difficulty spike they described as 'boring' rather than hard — reframing the fix from tuning to pacing and cutting tutorial drop-off 24%.",
        why: "The distinction between what players say and what the data shows is the core playtesting skill. This bullet demonstrates it concretely and ties it to a measurable outcome.",
      },
    ],
    coreSkills: ["Systems design", "Economy & balance tuning", "Progression design", "Playtesting & iteration", "Spec writing", "Telemetry & metrics literacy", "Prototyping", "Level design fundamentals", "Live-ops design"],
    tools: ["Unity", "Unreal Engine", "Excel / Google Sheets", "Miro", "Confluence", "Jira", "Machinations", "Perforce", "Amplitude", "Blueprint / C#"],
    metrics: ["Titles shipped and player scale", "Retention (D1/D7/D30) moved", "Session length or frequency change", "Conversion or ARPDAU impact", "Completion rates by difficulty", "Playtests run and iterations shipped"],
    seniority: [
      { level: "Junior (0–2 yrs)", expectation: "Designs within an established system. Portfolio should show one shipped or finished project with tuning evidence." },
      { level: "Mid (2–5 yrs)", expectation: "Owns a system end to end. Portfolio should show a design changed by playtest and telemetry." },
      { level: "Senior (5–8 yrs)", expectation: "Owns major systems and mentors. Portfolio should show measurable player-behaviour outcomes." },
      { level: "Lead / Principal (8+ yrs)", expectation: "Sets design direction for a title. Portfolio should show vision, team leadership and commercial results." },
    ],
    redFlags: [
      "Concept documents for unbuilt games presented as primary work.",
      "No shipped or finished project of any size.",
      "Team credits with no statement of what you personally owned.",
      "No engagement with data — design intuition alone is not sufficient in live-service hiring.",
    ],
  },

  "game-developer": {
    intro:
      "Game programming interviews weight performance and mathematics more heavily than general software roles. Expect maths questions (vectors, matrices, interpolation), an engine-specific round, and detailed probing on frame budget — because the constraint that defines the discipline is doing everything within roughly 16 milliseconds. CVs are read for shipped titles, platforms, and evidence you have optimised something real.",
    interviewFocus: [
      { area: "Maths and geometry", detail: "Dot and cross products, quaternions versus Euler angles, interpolation, collision detection. Asked directly and expected to be fluent rather than derived from first principles." },
      { area: "Performance and profiling", detail: "Frame budget, draw calls, cache behaviour, garbage collection spikes, and how you have diagnosed a real frame-rate problem with a profiler." },
      { area: "Engine specifics", detail: "Unity or Unreal internals — the update loop, physics stepping, memory and asset management, and the platform quirks of your target hardware." },
      { area: "Gameplay implementation", detail: "Translating a design spec into systems that are data-driven enough for designers to tune without engineering time." },
    ],
    technicalQuestions: [
      "Explain the dot product geometrically and give two gameplay uses.",
      "Why do we use quaternions for rotation instead of Euler angles?",
      "You are at 22ms per frame and need 16. Walk me through profiling and what you check first.",
      "How would you implement smooth character movement over an unreliable network?",
      "Explain the difference between Update, FixedUpdate and LateUpdate, and what belongs in each.",
      "How do you reduce draw calls in a scene with 2,000 objects?",
      "How would you implement an object pool, and why does it matter on mobile?",
    ],
    behaviouralQuestions: [
      "Tell me about a performance problem you fixed. How did you find it?",
      "Describe cutting scope to hit a certification or launch deadline.",
      "Tell me about implementing a design that turned out to be technically infeasible as specified.",
      "Describe a bug that only reproduced on one platform.",
      "Tell me about a system you built that designers could tune without you.",
    ],
    questionsToAsk: [
      "What is the frame budget and target hardware, and how close are you?",
      "How much of the codebase is engine-standard versus custom systems?",
      "How do designers tune systems — through data, or by asking engineers?",
      "What does the build and certification pipeline look like?",
    ],
    faq: [
      {
        question: "How much maths do game programming interviews actually require?",
        answer:
          "Working fluency in linear algebra and trigonometry, applied rather than proved. The recurring questions are the geometric meaning of dot and cross products with gameplay uses, why quaternions avoid gimbal lock, how to interpolate smoothly, and basic collision and raycast reasoning. You are rarely asked to derive anything, but hesitation on the dot product is a common early elimination because it appears in so much day-to-day gameplay code.",
      },
      {
        question: "What does a game developer CV need beyond shipped titles?",
        answer:
          "Platform and performance detail. State the platforms you shipped on, the target frame rate and hardware, and at least one concrete optimisation with before and after numbers — \"cut frame time from 22ms to 14ms on Switch by batching draw calls and pooling projectiles\" tells a studio more than a list of engines. Also name the systems you personally owned, since team credits are otherwise ambiguous, and include a playable link or repository where you can.",
      },
      {
        question: "Unity or Unreal — which is more employable?",
        answer:
          "Both, in different segments. Unity dominates mobile, indie and much of the mid-size market and uses C#. Unreal dominates AAA, and its C++ requirement raises the technical bar in ways that transfer well to general engineering. Pick based on the studios you want: mobile and indie leans Unity, console and AAA leans Unreal. Deep knowledge of one plus the underlying fundamentals — memory, rendering, maths — matters far more than surface exposure to both.",
      },
      {
        question: "Do I need shipped commercial titles to get hired?",
        answer:
          "It helps substantially but it is not the only route. A finished, polished small game demonstrates more than an unfinished ambitious one, because shipping is itself the skill studios are checking for. Game jams, mods, and a technical demo that solves a genuinely hard problem — a custom renderer feature, a networked prototype, a performance-constrained port — all work. What does not work is a portfolio of tutorial-following projects, which reads as coursework rather than capability.",
      },
    ],
    summaryExample:
      "Gameplay programmer with 6 years across three shipped titles on PC, Switch and mobile. Owned combat and AI systems in Unity/C#, and led the Switch performance pass that cut frame time from 22ms to 14ms through draw-call batching, object pooling and GC-allocation removal. Builds data-driven systems designers tune without engineering time.",
    bulletExamples: [
      {
        weak: "Developed gameplay features using Unity and C#.",
        strong: "Built the combat and enemy AI systems for a shipped Switch/PC title, exposing 40+ tuning parameters as designer-editable data so balance changes shipped without engineering time.",
        why: "\"Developed gameplay features\" is every game programmer's CV. Naming the systems owned and the data-driven design shows you built for the studio's workflow, not just for the feature — which is what distinguishes a senior gameplay engineer.",
      },
      {
        weak: "Optimised game performance for console platforms.",
        strong: "Led the Switch performance pass that cut frame time from 22ms to 14ms — batching 1,800 draw calls into 300, pooling projectile allocations, and eliminating a GC spike that caused a visible hitch every 8 seconds.",
        why: "Optimisation claims need the profiler detail. The before/after frame time, the three specific causes and the observable symptom removed prove genuine diagnosis rather than generic tweaking, and Switch is a recognisably hard target.",
      },
      {
        weak: "Fixed bugs and worked on various systems throughout development.",
        strong: "Owned certification readiness across 3 platforms, closing 140 submission-blocking issues and achieving first-time cert pass on Switch and PlayStation.",
        why: "Bug fixing is undifferentiated. Certification is a concrete, high-stakes milestone studios care about intensely, and a first-time pass is an unambiguous signal of rigour.",
      },
    ],
    coreSkills: ["Gameplay programming", "Linear algebra & geometry", "Performance profiling & optimisation", "Memory management", "Physics & collision", "Data-driven system design", "Multiplayer / netcode basics", "Platform certification", "Debugging"],
    tools: ["Unity", "Unreal Engine", "C#", "C++", "Perforce", "Git", "RenderDoc", "Unity Profiler", "Unreal Insights", "Visual Studio", "Jira", "Blender"],
    metrics: ["Titles shipped and platforms", "Frame time / FPS before and after", "Draw calls or memory reduced", "Build or load time improvements", "Certification pass rate", "Systems owned end to end"],
    seniority: [
      { level: "Junior (0–2 yrs)", expectation: "Implements features to spec. CV should show a finished project and solid engine plus maths fundamentals." },
      { level: "Mid (2–5 yrs)", expectation: "Owns systems end to end. CV should show a shipped title and one real optimisation with numbers." },
      { level: "Senior (5–8 yrs)", expectation: "Owns architecture for a discipline area. CV should show platform work, performance leadership and mentoring." },
      { level: "Lead / Principal (8+ yrs)", expectation: "Sets technical direction for a title. CV should show engine-level decisions and team outcomes." },
    ],
    redFlags: [
      "Engine names with no shipped or finished project behind them.",
      "No performance numbers, in a discipline defined by a frame budget.",
      "Tutorial-derived portfolio projects presented as primary experience.",
      "Team credits with no statement of the systems you personally owned.",
    ],
  },

  "ai-product-manager": {
    intro:
      "AI Product Manager interviews test whether you understand what makes AI products different from software products: non-deterministic output, evaluation instead of acceptance criteria, and a failure mode that is plausible-but-wrong rather than broken. Expect a product sense round framed around an AI feature, questions about evaluation and guardrails, and probing on when not to use a model at all.",
    interviewFocus: [
      { area: "AI product sense", detail: "Designing a feature where the model is a component, not the product. Interviewers check whether you design for the failure case — what the user sees when the model is confidently wrong." },
      { area: "Evaluation and measurement", detail: "How you define quality for a non-deterministic system, build an eval set, and decide whether a model change is a regression. The round that most distinguishes AI PMs from general PMs." },
      { area: "Technical fluency", detail: "Enough understanding of latency, cost per call, context limits, fine-tuning versus prompting versus retrieval to make credible scoping decisions." },
      { area: "Risk and trust", detail: "Hallucination handling, human-in-the-loop design, disclosure, and the regulatory or reputational exposure of getting it wrong." },
    ],
    technicalQuestions: [
      "Design an AI feature for a product you know well. What happens when the model is wrong?",
      "How do you measure quality for a summarisation feature where there is no single correct answer?",
      "Your model is right 85% of the time. Is that shippable? What determines the answer?",
      "When would you choose retrieval over fine-tuning, and what does each cost you?",
      "How do you decide between a faster cheap model and a slower accurate one?",
      "Users trust the output more than they should. How do you design against that?",
      "A prompt change improved your eval set but users complain quality dropped. What happened?",
    ],
    behaviouralQuestions: [
      "Tell me about an AI feature you shipped and what surprised you post-launch.",
      "Describe deciding not to use a model for something.",
      "Tell me about managing expectations with leadership who wanted AI in everything.",
      "Describe working with ML engineers or researchers on scoping.",
      "Tell me about handling a harmful or embarrassing model output in production.",
    ],
    questionsToAsk: [
      "How is model quality evaluated before a change ships?",
      "Who owns the eval set, and how often is it refreshed?",
      "What is the current cost per user for the AI features, and does it constrain the roadmap?",
      "How much of the roadmap is genuine model capability versus AI framing on existing features?",
    ],
    faq: [
      {
        question: "How does AI product management differ from regular product management?",
        answer:
          "Three ways that show up directly in interviews. Output is non-deterministic, so acceptance criteria are replaced by evaluation against a curated set with a quality threshold. Failure is plausible rather than obvious — a wrong answer that looks right is more dangerous than a crash, which changes how you design the interface. And unit economics matter continuously, because every interaction has a marginal cost that scales with usage in a way conventional software does not. A PM who scopes an AI feature without mentioning evals, failure UX or cost per call is the common miss.",
      },
      {
        question: "How technical do I need to be as an AI PM?",
        answer:
          "You do not need to train models, but you need enough fluency to scope credibly: the trade-offs between prompting, retrieval and fine-tuning; what context limits mean for your feature; roughly what latency and cost per call look like; and why a model that performs well on your eval set may still disappoint users. The practical test interviewers apply is whether an ML engineer would find your scoping decisions reasonable. That bar is lower than building, and considerably higher than reading about it.",
      },
      {
        question: "What should an AI Product Manager CV show?",
        answer:
          "AI features actually shipped, with quality and adoption numbers alongside the business outcome. \"Shipped an AI summarisation feature to 200k users, reaching 78% task-success on a 500-case eval set with human review for low-confidence outputs, lifting weekly active use 14%\" demonstrates the whole discipline — evaluation rigour, failure-case design, and product impact. Roadmap ownership without a shipped model-backed feature reads as conventional PM experience with AI vocabulary attached.",
      },
      {
        question: "Is AI PM a real specialisation or just a title trend?",
        answer:
          "It is real where the product's core value depends on model behaviour, because the skills genuinely differ — evaluation design, failure-mode UX, and cost modelling are not part of standard PM practice. It is a title trend where a company has added a chatbot to an existing product and renamed a PM role. Read the posting for whether they discuss evaluation and quality thresholds; the ones that do are hiring for the real specialisation, and their interviews will test it.",
      },
    ],
    summaryExample:
      "AI product manager with 5 years in B2B SaaS, 3 of them shipping model-backed features. Launched an AI summarisation and extraction suite to 200k users, reaching 78% task-success against a 500-case eval set with human review on low-confidence outputs, lifting weekly active use 14% while holding inference cost under $0.02 per active user.",
    bulletExamples: [
      {
        weak: "Managed the roadmap for AI-powered features using LLMs.",
        strong: "Owned an AI extraction feature from scoping to launch for 200k users, defining a 500-case eval set and an 85% precision gate that blocked two model upgrades which regressed on edge cases.",
        why: "Roadmap ownership is generic PM language. The eval set, the explicit quality gate, and the fact that it caught real regressions demonstrate the evaluation discipline that defines the role.",
      },
      {
        weak: "Worked with engineering to integrate AI capabilities into the product.",
        strong: "Redesigned the summarisation UX around confidence — surfacing source citations and routing low-confidence outputs to human review — cutting user-reported inaccuracies 62% without changing the underlying model.",
        why: "Integration is execution. Solving a quality problem through interface design rather than model change is exactly the AI PM's distinctive contribution, and the outcome is measured.",
      },
      {
        weak: "Analysed usage data to improve AI feature adoption.",
        strong: "Cut inference cost 41% ($180k/yr) by routing 70% of requests to a smaller model after eval testing showed no measurable quality difference on the dominant use case — funding two further AI features within the same budget.",
        why: "Unit economics are a first-class AI PM concern that most CVs omit entirely. Grounding the routing decision in eval evidence, and connecting the saving to what it unlocked, shows commercial and technical judgement together.",
      },
    ],
    coreSkills: ["AI product scoping", "Evaluation design & quality gates", "Failure-mode & trust UX", "Prompt / retrieval / fine-tune trade-offs", "Unit economics of inference", "Experimentation", "Stakeholder influence", "Responsible AI & disclosure"],
    tools: ["Amplitude", "Mixpanel", "SQL", "LangSmith", "Weights & Biases", "Figma", "Linear", "Jira", "OpenAI / Anthropic APIs", "Looker"],
    metrics: ["Task success rate against an eval set", "Precision / recall at the shipped threshold", "Adoption and retention of the AI feature", "Inference cost per user or per call", "Latency at p95", "User-reported error rate", "Business metric moved"],
    seniority: [
      { level: "PM (2–5 yrs)", expectation: "Owns an AI feature area. CV should show one shipped model-backed feature with quality numbers." },
      { level: "Senior PM (5–8 yrs)", expectation: "Owns an AI product surface and its economics. CV should show evaluation practice and a cost or quality trade-off you made." },
      { level: "Principal / Group (8+ yrs)", expectation: "Sets AI product strategy. CV should show portfolio decisions, build-versus-buy calls and org-level impact." },
    ],
    redFlags: [
      "AI features listed with no quality or evaluation measure.",
      "No mention of failure cases, which is the defining design problem.",
      "Model and vendor names used as a substitute for product outcomes.",
      "No cost awareness, despite inference economics constraining most AI roadmaps.",
    ],
  },
};

/** Roles with genuine hand-written content. Others render noindex. */
export function hasRoleContent(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(ROLE_CONTENT, slug);
}

export function getRoleContent(slug: string): RoleContent | null {
  return ROLE_CONTENT[slug] ?? null;
}

/** Slugs with content, for sitemap generation and internal linking. */
export function rolesWithContent(): string[] {
  return Object.keys(ROLE_CONTENT);
}
