import type { RoleCareerPath } from "./types";

// Hand-written career paths, part 2. Each entry complements the role's intro
// and seniority ladder in lib/roles/role-content.ts rather than restating them.

export const CAREER_PATHS_PART_2: Record<string, RoleCareerPath> = {
  "network-security-engineer": {
    overview:
      "Most network security engineers arrive from network engineering or firewall operations and spend their first years getting fluent in one vendor stack. Past senior level the path forks: stay technical and move toward security architecture and zero trust design, or follow the same segmentation problems into cloud, where they now live in VPCs and security groups. A management track exists, but what raises the ceiling fastest is proof that you design controls rather than implement other people's change tickets.",
    moves: [
      {
        toRole: "Security Architect",
        toSlug: "security-architect",
        moveType: "step_up",
        typicalTiming:
          "After 5-7 years, once you have designed segmentation for a site or business unit instead of implementing someone else's design",
        why: "Trust zones, firewall policy standards and segmentation decisions are already architecture work at the network layer. The step up widens that same reasoning to identity, applications and data.",
        skillsToAdd: [
          "Threat modeling with STRIDE or attack trees",
          "Zero trust reference architecture (NIST SP 800-207)",
          "ZTNA and SASE design",
          "Architecture decision records",
          "CISSP",
        ],
        proof:
          "A segmentation or zero trust program you designed, with the attack-surface reduction it produced.",
      },
      {
        toRole: "Cloud Security Engineer",
        toSlug: "cloud-security-engineer",
        moveType: "lateral",
        typicalTiming:
          "Any time after about 3 years, and easiest while your employer is already moving workloads to cloud",
        why: "Security groups, network ACLs, private endpoints and cloud firewalls are the same allow-and-deny reasoning you apply on physical firewalls, just expressed in code and API calls.",
        skillsToAdd: [
          "AWS VPC design, security groups and AWS Network Firewall (or Azure NSGs and Azure Firewall)",
          "Terraform",
          "CSPM tooling such as Wiz or Prisma Cloud",
          "AWS Certified Security Specialty",
        ],
        proof:
          "At least one cloud or hybrid network you secured, such as a site-to-site VPN or transit design, plus infrastructure code you wrote yourself.",
      },
      {
        toRole: "Detection Engineer",
        moveType: "lateral",
        typicalTiming:
          "After 3-4 years, especially if IDS/IPS tuning already takes a real share of your week",
        why: "Tuning IPS signatures and reading NetFlow and packet captures is detection work. Detection engineering formalizes it into version-controlled rules across endpoint, identity and cloud telemetry, not only the network.",
        skillsToAdd: [
          "Sigma rules and detection-as-code workflows",
          "Zeek and Suricata",
          "SIEM query languages (Splunk SPL or KQL)",
          "MITRE ATT&CK mapping",
          "Python for rule testing",
        ],
        proof:
          "IPS or IDS tuning work with before-and-after false-positive numbers, and at least one custom signature you wrote.",
      },
      {
        toRole: "Penetration Tester",
        toSlug: "penetration-tester",
        moveType: "pivot",
        typicalTiming:
          "After 3-5 years, usually following several months of lab work in your own time",
        why: "You know exactly how VPNs, flat networks and forgotten firewall rules fail, which is the map an attacker needs for internal network testing.",
        skillsToAdd: [
          "Nmap, Metasploit and Burp Suite",
          "Active Directory attack paths with BloodHound",
          "Report writing for findings and remediation",
          "OSCP",
        ],
        proof:
          "OSCP or an equivalent hands-on certification, plus lab write-ups or an internal segmentation test you ran and documented.",
      },
      {
        toRole: "Infrastructure Security Manager",
        moveType: "step_up",
        typicalTiming:
          "After 6-8 years, often after informally running change reviews or an on-call rotation",
        why: "You already arbitrate between network uptime and security policy every week. Managing the team turns that into prioritization, vendor decisions and budget ownership.",
        skillsToAdd: [
          "Hiring, one-on-ones and performance reviews",
          "Vendor and license management",
          "Risk registers and policy exception processes",
          "CISM",
        ],
        proof:
          "Evidence you have led people or a program: engineers you mentored, a rotation you ran, or a multi-team rollout you coordinated.",
      },
    ],
    faqs: [
      {
        question: "Can a network engineer move into network security?",
        answer:
          "Yes, and it is the most common way in. Start by taking on firewall and VPN changes in your current job, then add a vendor security certification such as Palo Alto PCNSE or Cisco CCNP Security. Hiring managers want to see that you already handle security changes, not only routing and switching.",
      },
      {
        question: "Should a network security engineer learn to code?",
        answer:
          "Enough to automate your own work, yes. Python for policy audits and bulk changes, plus Terraform or Ansible for configuration, separates engineers who move into cloud and architecture roles from those who stay on change tickets. You do not need software engineering depth.",
      },
      {
        question: "Is it better to specialize in one firewall vendor or stay vendor-neutral?",
        answer:
          "Go deep on one vendor early, because that is what gets you hired and trusted with production changes. After a few years, the vendor matters less than the concepts: segmentation design, policy hygiene and trust boundaries are what architecture interviews test.",
      },
    ],
  },

  "iam-engineer": {
    overview:
      "IAM careers usually start in access administration or the service desk, move into lifecycle automation, and then split three ways: identity architecture, privileged access, or identity governance and audit. Because identity has become the main control boundary in cloud and zero trust designs, experienced IAM engineers have unusually direct access to architecture roles. Few people leave identity entirely; they tend to widen from it.",
    moves: [
      {
        toRole: "Identity Architect",
        moveType: "step_up",
        typicalTiming:
          "After 5-7 years, once other teams build on a federation or lifecycle pattern you designed",
        why: "Designing SSO federation, provisioning flows and role models for one platform is architecture on a smaller canvas. The architect role extends it to workload identity, customer identity and the enterprise-wide access model.",
        skillsToAdd: [
          "Entitlement modeling (RBAC, ABAC and policy-based access)",
          "Workload identity (cloud IAM roles, SPIFFE)",
          "Customer identity (CIAM) patterns",
          "Zero trust identity design (NIST SP 800-207)",
          "IDPro CIDPro or CISSP",
        ],
        proof:
          "An identity pattern you designed that multiple applications or teams adopted, with coverage or risk numbers.",
      },
      {
        toRole: "Cloud Security Engineer",
        toSlug: "cloud-security-engineer",
        moveType: "lateral",
        typicalTiming:
          "After 3-4 years, especially if you have already worked on cloud SSO or role federation",
        why: "Over-permissioned identities are behind a large share of cloud incidents. Your least-privilege habits and access-review instincts apply directly to AWS IAM policies, Azure role assignments and service accounts.",
        skillsToAdd: [
          "AWS IAM policies, SCPs and permission boundaries",
          "Microsoft Entra ID roles and Privileged Identity Management",
          "CIEM tooling for unused-permission analysis",
          "Terraform",
          "AWS Certified Security Specialty",
        ],
        proof:
          "A cloud access cleanup or least-privilege project with numbers, such as standing admin roles removed.",
      },
      {
        toRole: "IAM Manager",
        moveType: "step_up",
        typicalTiming:
          "After 6-8 years, usually after leading a platform migration or an access-certification program",
        why: "Identity programs are cross-functional by nature (HR, IT, application owners, auditors). If you already run those conversations, managing the IAM team formalizes it with a roadmap and budget.",
        skillsToAdd: [
          "Program roadmapping and stakeholder reporting",
          "Hiring and team leadership",
          "Audit and regulator relationship management",
          "CISM",
        ],
        proof:
          "A program you led across teams, such as a JML automation rollout or PAM deployment, with delivery and audit outcomes.",
      },
      {
        toRole: "GRC Analyst",
        moveType: "pivot",
        typicalTiming:
          "After 2-4 years, often by people who found access reviews and audit evidence more interesting than platform work",
        why: "Access reviews, segregation of duties and audit evidence are a large share of IT general controls. You already know how those controls work technically, which most GRC hires have to learn.",
        skillsToAdd: [
          "SOX ITGC testing",
          "NIST 800-53 and ISO 27001 control frameworks",
          "Risk assessment and control documentation",
          "CISA or CRISC",
        ],
        proof:
          "An audit you supported with clean findings, or a segregation-of-duties or access-certification process you designed.",
      },
      {
        toRole: "Solutions Architect",
        toSlug: "solutions-architect",
        moveType: "pivot",
        typicalTiming:
          "After 4-6 years of hands-on implementation on a major identity platform",
        why: "Identity vendors and integrators need people who have deployed their platform in a messy real environment. Customer discovery calls are mostly the integration questions you have already answered internally.",
        skillsToAdd: [
          "Discovery calls and requirements gathering with customers",
          "Demo and proof-of-concept building",
          "Writing statements of work and solution designs",
          "Platform certifications such as Okta Certified Professional or CyberArk Defender",
        ],
        proof:
          "Deep implementation experience on one identity platform, with application counts and at least one integration you designed.",
      },
    ],
    faqs: [
      {
        question: "Can a help desk or system administrator move into IAM?",
        answer:
          "Yes, and it is one of the most reliable routes. Account provisioning, group management and Active Directory work are IAM fundamentals. Add SAML and OIDC knowledge and hands-on time with one identity platform, then ask to take on application onboarding in your current job.",
      },
      {
        question: "Does IAM lead to security architecture?",
        answer:
          "More directly than most security specialties. Zero trust designs treat identity as the primary control, so senior IAM engineers who understand federation, workload identity and privileged access are natural candidates for identity or security architect roles.",
      },
      {
        question: "Should I specialize in privileged access or identity governance?",
        answer:
          "Pick based on the work you prefer. Privileged access is closer to infrastructure and incident response, with vaulting, session control and just-in-time access. Governance is closer to audit and process, with certifications, role mining and segregation of duties. Both are hired separately at larger organizations.",
      },
    ],
  },

  "security-architect": {
    overview:
      "Security Architect is already a senior role reached after years of engineering, so progression is about scope rather than new skills: from one business area to the enterprise, and from reviewing designs to setting the standards others follow. Beyond principal architect the choices are the CISO track (management, budget and board reporting), broader enterprise or cloud architecture, or moving outward into consulting and pre-sales. At smaller organizations the IC ceiling arrives quickly, which is why many architects change employers to grow scope.",
    moves: [
      {
        toRole: "Principal Security Architect",
        moveType: "step_up",
        typicalTiming:
          "After 3-5 years as an architect, once your standards are used beyond the area you were hired for",
        why: "The principal role is the same design and risk-acceptance work applied across the whole organization, where your decisions set the defaults other architects inherit.",
        skillsToAdd: [
          "Enterprise security reference architecture",
          "Security metrics and risk quantification (FAIR)",
          "Writing policy and standards that engineering teams adopt",
          "SABSA Chartered Foundation",
        ],
        proof:
          "Standards or reference designs adopted across multiple business units, with a measurable change in risk or review time.",
      },
      {
        toRole: "Chief Information Security Officer (CISO)",
        moveType: "step_up",
        typicalTiming:
          "Usually after a director-level security role, well over a decade into a security career",
        why: "Architects already translate technical risk into business trade-offs. The CISO does that for the board and owns the budget, team and incident accountability behind it.",
        skillsToAdd: [
          "Board and executive risk reporting",
          "Security budget and program management",
          "Incident and breach response leadership",
          "Regulatory frameworks (SEC cyber disclosure rules, HIPAA, PCI DSS)",
          "CISM",
        ],
        proof:
          "People leadership plus a security program you owned end to end, including a budget and results reported to executives.",
      },
      {
        toRole: "Enterprise Architect",
        toSlug: "enterprise-architect",
        moveType: "lateral",
        typicalTiming:
          "After 3-5 years as an architect, especially if you already sit on an architecture review board",
        why: "You already evaluate designs against business constraints and cross-system dependencies. Enterprise architecture widens the lens from security to the whole technology portfolio.",
        skillsToAdd: [
          "TOGAF",
          "Capability mapping and application portfolio rationalization",
          "Technology roadmapping",
          "ArchiMate or a similar modeling notation",
        ],
        proof:
          "Architecture decisions you made that shaped platforms or vendor choices, not only security controls.",
      },
      {
        toRole: "Cloud Architect",
        toSlug: "cloud-architect",
        moveType: "lateral",
        typicalTiming:
          "Any time after hands-on design work on a cloud migration or landing zone",
        why: "Account structure, network design, identity and guardrails are half of a cloud landing zone. Security architects who designed those often move across to own the whole platform design.",
        skillsToAdd: [
          "Landing zone design (AWS Control Tower or Azure landing zones)",
          "Cost and reliability trade-offs in cloud architecture",
          "Terraform",
          "AWS Certified Solutions Architect Professional or Google Professional Cloud Architect",
        ],
        proof:
          "A cloud environment you designed guardrails or architecture for, with the scale of accounts or workloads involved.",
      },
      {
        toRole: "Solutions Architect",
        toSlug: "solutions-architect",
        moveType: "pivot",
        typicalTiming:
          "After 2-4 years as an architect, often when you want broader industry exposure than one employer gives",
        why: "Security vendors need architects who can sit with a customer's security team, understand their environment and design a deployment that survives their review board, which is the job you already do from the other side of the table.",
        skillsToAdd: [
          "Customer discovery and technical qualification",
          "Proof-of-concept planning",
          "Presenting to mixed technical and executive audiences",
          "Deep product knowledge in one security category (SIEM, SASE, CNAPP)",
        ],
        proof:
          "Architecture reviews you led and a track record of presenting security decisions to non-security stakeholders.",
      },
    ],
    faqs: [
      {
        question: "How many years does it take to become a security architect?",
        answer:
          "Most people get there after 8-10 years in security or infrastructure, with hands-on engineering in at least two domains. The title is rarely an entry point, because the job depends on having seen real controls fail in production.",
      },
      {
        question: "Is security architect a management role?",
        answer:
          "No. It is a senior individual contributor role with influence rather than direct reports. Architects who want people management usually move to a security engineering manager or director role, and the CISO track typically runs through management, not architecture alone.",
      },
      {
        question: "Can a security architect move into general enterprise architecture?",
        answer:
          "Yes, and it is a common lateral. Security architects already review designs across systems and weigh business constraints. The gap is usually breadth: application portfolio management, integration patterns and a framework such as TOGAF.",
      },
    ],
  },

  "game-designer": {
    overview:
      "Game design ladders usually run from junior to designer, senior, lead, then design director or creative director, and the lead step is where the job changes from designing systems to steering other designers. Specializing (systems, economy, level, combat, narrative) is how most designers get past mid-level, because studios hire for the discipline, not the general title. Designers who leave the industry tend to go where player-behavior thinking and telemetry literacy transfer: product management and UX.",
    moves: [
      {
        toRole: "Lead Game Designer",
        moveType: "step_up",
        typicalTiming:
          "After 6-8 years and at least one title where you owned a major system through launch",
        why: "Leads keep the design coherent across systems and people. If you already review other designers' specs and resolve conflicts between systems, you are doing part of the job.",
        skillsToAdd: [
          "Design review and critique for other designers",
          "Scoping and cutting features against a production schedule",
          "Pitching and defending design direction to directors",
          "Mentoring junior designers",
        ],
        proof:
          "A shipped system you owned end to end, plus evidence you guided other designers' work on it.",
      },
      {
        toRole: "Economy Designer",
        moveType: "lateral",
        typicalTiming:
          "After 2-4 years, often by systems designers who enjoy the spreadsheet side of tuning",
        why: "Economy design is systems design where the variables are currencies, rewards and progression pacing, and it is measured directly in player data. Your balancing work is the foundation.",
        skillsToAdd: [
          "Sink-and-faucet economy modeling in spreadsheets",
          "SQL for player telemetry",
          "A/B test design and analysis",
          "Monetization and progression pacing for live games",
        ],
        proof:
          "A progression or reward system you tuned using player data, with the behavior change it produced.",
      },
      {
        toRole: "Game Producer",
        moveType: "lateral",
        typicalTiming:
          "After 3-5 years, usually by designers who already run feature teams informally",
        why: "Producers own scope, schedule and cross-discipline coordination. Designers already negotiate feature scope with engineering and art, which is the core producer skill.",
        skillsToAdd: [
          "Agile planning in Jira or Hansoft",
          "Milestone and risk tracking",
          "Cross-discipline dependency management",
          "Certified ScrumMaster (CSM)",
        ],
        proof:
          "A feature or milestone you coordinated across design, engineering and art that shipped on schedule.",
      },
      {
        toRole: "Product Manager",
        toSlug: "product-manager",
        moveType: "pivot",
        typicalTiming:
          "After 3-6 years, most often from live-service or free-to-play games",
        why: "Retention loops, onboarding funnels and feature experiments are product management problems. Live-game designers already make decisions from cohort data and A/B tests.",
        skillsToAdd: [
          "Product discovery and customer interviews",
          "Product analytics tools (Amplitude or Mixpanel)",
          "Writing product requirements and success metrics",
          "Roadmap prioritization frameworks (RICE)",
        ],
        proof:
          "A feature you shaped using player data, with a retention, conversion or engagement result stated plainly.",
      },
      {
        toRole: "UX Designer",
        toSlug: "ux-designer",
        moveType: "pivot",
        typicalTiming:
          "After 2-4 years, typically by designers who worked on menus, onboarding or HUD",
        why: "Game designers already design for learnability, feedback and flow, and they test with real players constantly. UX design applies the same thinking to apps and services.",
        skillsToAdd: [
          "Figma",
          "Usability testing and interview synthesis",
          "Information architecture and user flows",
          "WCAG accessibility basics",
        ],
        proof:
          "A portfolio case study that reframes a game onboarding or interface problem as a UX problem, with playtest evidence.",
      },
    ],
    faqs: [
      {
        question: "Can a game designer move into product management?",
        answer:
          "Yes, and designers from live-service games make the move most easily because they already work with retention and monetization data. Reframe your portfolio around outcomes (retention, conversion, engagement) rather than mechanics, and learn a product analytics tool.",
      },
      {
        question: "Is it better to specialize or stay a generalist game designer?",
        answer:
          "Specialize after a few years. Generalist designers are useful on small teams, but mid-size and large studios hire for systems, level, combat, narrative or economy design, and senior openings almost always name the specialty.",
      },
      {
        question: "What does a game designer do after becoming a lead?",
        answer:
          "The next steps are design director or creative director, which own the vision of a title or a studio's portfolio. Some leads move to game director roles that combine design authority with production responsibility.",
      },
    ],
  },

  "game-developer": {
    overview:
      "Game programmers progress from gameplay features toward ownership of an area such as engine, rendering, networking, tools or platform, and seniority is tied closely to shipped titles. Past senior, the fork is lead programmer or technical director on the leadership side, or a principal specialist role in graphics, engine or online systems. The industry is cyclical, so a well-traveled exit exists: the same real-time and C++ skills are valued in simulation, AR/VR and general software engineering.",
    moves: [
      {
        toRole: "Lead Programmer",
        moveType: "step_up",
        typicalTiming:
          "After 6-8 years and at least two shipped titles, one with you owning a major system",
        why: "Leads own technical decisions and code quality for a team. Senior programmers who already review code, unblock others and push back on unrealistic scope are doing much of it.",
        skillsToAdd: [
          "Technical planning and estimation for milestones",
          "Code review standards and team conventions",
          "Hiring and mentoring programmers",
          "Profiling across CPU, GPU and memory (PIX, RenderDoc, Unreal Insights)",
        ],
        proof:
          "A shipped system you owned plus evidence of leading others, such as a feature team, code standards or new-hire onboarding.",
      },
      {
        toRole: "Engine Programmer",
        moveType: "lateral",
        typicalTiming:
          "After 3-5 years, usually by gameplay programmers who keep ending up in performance work",
        why: "Gameplay programmers who fix frame spikes and memory problems are already working below the gameplay layer. Engine programming makes that the whole job.",
        skillsToAdd: [
          "Modern C++ and data-oriented design",
          "Multithreading and job systems",
          "Memory allocators and platform profiling",
          "Unreal Engine source-level work",
        ],
        proof:
          "An optimization with before-and-after frame time or memory numbers on a shipped or complete project.",
      },
      {
        toRole: "AR/VR Engineer",
        toSlug: "ar-vr-engineer",
        moveType: "lateral",
        typicalTiming: "Any time after 2-3 years of Unity or Unreal experience",
        why: "XR runs on the same engines and demands even stricter frame budgets, because a dropped frame causes motion sickness rather than just stutter.",
        skillsToAdd: [
          "OpenXR",
          "Unity XR Interaction Toolkit or Unreal's XR framework",
          "Stereo rendering and foveated rendering",
          "Spatial interaction and hand-tracking design",
        ],
        proof:
          "A finished XR prototype or shipped feature that holds frame rate on real headset hardware.",
      },
      {
        toRole: "Software Engineer",
        toSlug: "software-engineer",
        moveType: "pivot",
        typicalTiming:
          "Any time, most often after a studio closure or when steadier hours become the priority",
        why: "Game programmers are strong at performance, debugging and data structures under pressure. Online services and backend work are the smoothest landing because networking and server code are already part of many games.",
        skillsToAdd: [
          "A mainstream backend language such as Go, Java or C#/.NET",
          "REST and gRPC API design",
          "SQL databases",
          "Cloud deployment on AWS, Azure or GCP",
          "Automated testing and CI pipelines",
        ],
        proof:
          "One non-game project, such as a web service with tests and deployment, to show you can work outside an engine.",
      },
      {
        toRole: "Simulation Engineer",
        moveType: "pivot",
        typicalTiming:
          "After 3-5 years, particularly with physics, rendering or tools experience",
        why: "Training simulators, autonomous-vehicle simulation and digital twins are built with game engines and real-time rendering. Your engine and physics knowledge transfers directly.",
        skillsToAdd: [
          "Physics simulation and numerical integration",
          "Sensor simulation basics (camera, lidar)",
          "Python for scenario scripting",
          "ROS 2 or Unreal/Unity simulation frameworks",
        ],
        proof:
          "Physics, rendering or tools work on a shipped title, plus a small simulation project outside games.",
      },
    ],
    faqs: [
      {
        question: "Can game developers get jobs outside the games industry?",
        answer:
          "Yes. Real-time rendering, C++ performance and engine skills are wanted in simulation, AR/VR, film and virtual production, and automotive. General software roles hire game programmers too, though you will usually need to show one project built outside an engine.",
      },
      {
        question: "Should a game programmer specialize in graphics, engine or gameplay?",
        answer:
          "Gameplay is the most common entry point and has the most openings. Graphics and engine specialists are fewer and harder to replace, which makes those roles more stable once you have the depth. Choose by what you already gravitate toward in your current work.",
      },
      {
        question: "How do game developers become technical directors?",
        answer:
          "Usually through lead programmer, after owning architecture decisions on a shipped title. Technical directors are judged on engine and platform choices and on the team's ability to ship, so leadership experience matters as much as technical depth.",
      },
    ],
  },

  "ai-product-manager": {
    overview:
      "AI PM is a young ladder: most people arrive from core product management, ML engineering or data science, and levels usually map to the same PM, senior, group and director steps as other product roles. After senior, the fork is whether you stay on model-facing products (evaluation, model choice, AI platforms) or broaden into general product leadership where AI is one tool among several. Because the specialty is new, owning evaluation and cost trade-offs counts for more than the title on your resume.",
    moves: [
      {
        toRole: "Group Product Manager",
        moveType: "step_up",
        typicalTiming:
          "After 2-3 years as a senior PM with an AI product surface that shipped and stuck",
        why: "Group PMs set direction across several PMs' areas. AI PMs who already made build-versus-buy and model-cost calls for their surface have the portfolio judgment the role needs.",
        skillsToAdd: [
          "Portfolio prioritization across teams",
          "Coaching and hiring product managers",
          "Product and model cost modeling",
          "Executive roadmap communication",
        ],
        proof:
          "An AI product area you owned through launch and iteration, with quality, adoption and cost numbers.",
      },
      {
        toRole: "Technical Product Manager",
        toSlug: "technical-product-manager",
        moveType: "lateral",
        typicalTiming:
          "After 2-4 years, often by AI PMs who find the platform layer more interesting than the feature layer",
        why: "Internal AI platforms (evaluation tooling, model gateways, retrieval infrastructure) need PMs whose users are engineers. Your evaluation and guardrail experience is exactly what those customers care about.",
        skillsToAdd: [
          "API and developer platform product design",
          "Model gateway, routing and observability concepts",
          "Evaluation frameworks and LLM observability tools",
          "Reading technical design docs critically",
        ],
        proof:
          "An evaluation, cost or reliability decision you made with engineers, stated with its effect on quality or spend.",
      },
      {
        toRole: "Product Manager",
        toSlug: "product-manager",
        moveType: "lateral",
        typicalTiming: "Any time, especially when moving to a company where AI is one feature among many",
        why: "The core of product work (discovery, prioritization, shipping and measuring) is the same. AI experience is an advantage on general product teams that are adding model-backed features.",
        skillsToAdd: [
          "Domain knowledge for the new product area",
          "Growth and retention analytics",
          "Pricing and packaging decisions",
          "Customer discovery at scale",
        ],
        proof:
          "Product outcomes described in business terms (adoption, retention, revenue impact), not only model quality.",
      },
      {
        toRole: "AI Engineer",
        toSlug: "ai-engineer",
        moveType: "pivot",
        typicalTiming:
          "After 1-3 years, usually by PMs with an engineering background who already prototype their own features",
        why: "AI PMs who write prompts, build eval sets and prototype with model APIs are already doing part of the engineering work. The pivot formalizes it into production code.",
        skillsToAdd: [
          "Python",
          "Retrieval-augmented generation (embeddings, vector databases)",
          "Evaluation harnesses and regression tests for model output",
          "Production API integration and observability",
        ],
        proof:
          "A working prototype or internal tool you built, ideally used by real people, with code you can show.",
      },
      {
        toRole: "Responsible AI Program Manager",
        moveType: "pivot",
        typicalTiming:
          "After 3-5 years, often by PMs who owned safety reviews or policy decisions on their features",
        why: "AI PMs already define guardrails, run red-team reviews and balance risk against launch dates. Responsible AI programs make that the whole job across the organization.",
        skillsToAdd: [
          "NIST AI Risk Management Framework",
          "EU AI Act and emerging US state AI regulations",
          "AI risk assessments and model cards",
          "Cross-functional program governance",
        ],
        proof:
          "A guardrail, safety review or launch-readiness process you designed and ran for a shipped AI feature.",
      },
    ],
    faqs: [
      {
        question: "Can a regular product manager become an AI product manager?",
        answer:
          "Yes, and most AI PMs did exactly that. The gap is practical: learn how evaluation works, build a small model-backed prototype yourself, and ask to own an AI feature in your current product. One shipped AI feature with quality numbers outweighs any course.",
      },
      {
        question: "Can a data scientist or ML engineer become an AI PM?",
        answer:
          "Yes, and technical backgrounds are valued here more than in general product roles. What you have to prove is product judgment: a problem you chose, users you talked to, and a trade-off you made for the product rather than the model.",
      },
      {
        question: "What comes after AI product manager?",
        answer:
          "The usual next steps are group PM, director of product or head of AI product. Some move into AI platform product roles, and a growing number move into responsible AI or AI governance leadership.",
      },
    ],
  },

  "mobile-app-developer": {
    overview:
      "Mobile developers usually commit to iOS, Android or a cross-platform framework early, then grow by owning more of the release pipeline and the app's architecture. After senior, the options are a staff role owning the mobile platform (build systems, modularization, performance), engineering management, or broadening into full stack because product teams value engineers who can ship the API and the screen. The mobile-only ladder is short at small companies, which may employ only a handful of mobile engineers.",
    moves: [
      {
        toRole: "Staff Mobile Engineer",
        moveType: "step_up",
        typicalTiming:
          "After 7-9 years, once your architecture or tooling decisions shape how every mobile team works",
        why: "Staff mobile engineers own cross-team concerns such as modularization, build times, release trains and performance budgets. Seniors who already fixed one of those for their own team are working at the edges of the role.",
        skillsToAdd: [
          "Build systems at scale (Gradle, Bazel or Tuist)",
          "App modularization and dependency boundaries",
          "Performance monitoring (Firebase Performance, Sentry, Xcode Instruments)",
          "Writing technical design docs for org-wide changes",
        ],
        proof:
          "A cross-team mobile change you led, such as a modularization or build-time project, with before-and-after numbers.",
      },
      {
        toRole: "Mobile Engineering Manager",
        moveType: "step_up",
        typicalTiming:
          "After 5-7 years, often after acting as tech lead for a mobile squad",
        why: "Release coordination, app store review cycles and platform trade-offs are already team-level concerns you handle. Management adds hiring, growth and delivery accountability on top.",
        skillsToAdd: [
          "One-on-ones and career development conversations",
          "Hiring loops for iOS and Android engineers",
          "Release planning and incident management",
          "Delivery metrics and stakeholder reporting",
        ],
        proof:
          "Tech lead experience: releases you coordinated, engineers you mentored and a delivery outcome you owned.",
      },
      {
        toRole: "Full Stack Developer",
        toSlug: "full-stack-developer",
        moveType: "lateral",
        typicalTiming: "Any time after 3 years, easiest on product teams that already own their own APIs",
        why: "Mobile developers already consume APIs, handle auth tokens and design offline sync. Building the other side is a short step, and React Native developers bring TypeScript and React skills straight to the web.",
        skillsToAdd: [
          "Node.js or another backend runtime",
          "REST and GraphQL API design",
          "PostgreSQL",
          "React for web (if you come from native)",
        ],
        proof:
          "A feature where you built or changed the API as well as the app, or a side project with both.",
      },
      {
        toRole: "Application Security Engineer",
        toSlug: "application-security-engineer",
        moveType: "pivot",
        typicalTiming: "After 4-6 years, usually by developers who already own auth or payments features",
        why: "Mobile apps ship to devices you do not control, so secure storage, certificate pinning and reverse-engineering resistance are daily concerns. Mobile security specialists are scarce because few engineers understand both platforms deeply.",
        skillsToAdd: [
          "OWASP MASVS and MASTG",
          "Mobile testing tools (Frida, MobSF, objection)",
          "Threat modeling",
          "Static analysis tools (Semgrep, CodeQL)",
        ],
        proof:
          "Security work already on your resume, such as an auth flow you hardened or a vulnerability you found and fixed.",
      },
      {
        toRole: "Technical Product Manager",
        toSlug: "technical-product-manager",
        moveType: "pivot",
        typicalTiming: "After 4-6 years, often by developers who already shape feature specs",
        why: "Mobile developers see the whole user experience, app store feedback and crash data, and they understand the release constraints PMs often underestimate.",
        skillsToAdd: [
          "Product discovery and user interviews",
          "Product analytics (Amplitude, Mixpanel or Firebase Analytics)",
          "Writing requirements and success metrics",
          "Prioritization frameworks",
        ],
        proof:
          "A feature you proposed or shaped, with a user or business result, not only the implementation.",
      },
    ],
    faqs: [
      {
        question: "Can an iOS developer switch to Android, or the other way around?",
        answer:
          "Yes, and it is easier than it looks. Swift and Kotlin are close in style, SwiftUI and Jetpack Compose share the declarative model, and the lifecycle and release concepts transfer. Build one complete app on the other platform before applying.",
      },
      {
        question: "Do mobile developers hit a career ceiling?",
        answer:
          "At small companies, often yes, because the mobile team may be too small to need a staff engineer or manager. At larger companies mobile has its own staff and principal levels. Many developers raise their ceiling by adding backend skills or moving to a larger mobile organization.",
      },
      {
        question: "Is it worth learning Flutter or React Native if I already know native?",
        answer:
          "It widens the jobs you can apply for, especially at startups that want one codebase. Native depth remains the stronger long-term signal for senior roles, because cross-platform apps still need native work for performance, platform features and debugging.",
      },
    ],
  },

  "cloud-engineer": {
    overview:
      "Cloud engineering overlaps DevOps and SRE so much that the platform and scale on your resume often matter more than the title. Progression runs toward architecture (cloud architect, then principal or enterprise), toward platform engineering (building internal tooling for other engineers), or into a specialty such as cloud security or cost. Infrastructure management exists, but most senior cloud engineers who stay technical move into architect titles.",
    moves: [
      {
        toRole: "Cloud Architect",
        toSlug: "cloud-architect",
        moveType: "step_up",
        typicalTiming:
          "After 5-7 years, once you have designed an environment rather than only building to someone else's design",
        why: "Account structure, networking, identity and cost decisions are what cloud architects own. Engineers who already built landing zones or led a migration have made those decisions at a smaller scale.",
        skillsToAdd: [
          "Multi-account and landing zone design",
          "Well-Architected reviews",
          "Hybrid connectivity and DR design",
          "AWS Certified Solutions Architect Professional or Azure Solutions Architect Expert",
        ],
        proof:
          "An environment or migration you designed, with the scale, reliability and cost outcomes.",
      },
      {
        toRole: "Platform Engineer",
        toSlug: "platform-engineer",
        moveType: "lateral",
        typicalTiming: "After 3-4 years, particularly if you already write reusable Terraform modules",
        why: "Platform teams turn infrastructure into a self-service product for developers. Your IaC modules and account vending are the raw material of an internal platform.",
        skillsToAdd: [
          "Kubernetes and CKA",
          "Internal developer portals (Backstage)",
          "GitOps with Argo CD or Flux",
          "Golden-path templates and developer experience metrics",
        ],
        proof:
          "Infrastructure you packaged for other teams to use without your help, with adoption numbers.",
      },
      {
        toRole: "Cloud Security Engineer",
        toSlug: "cloud-security-engineer",
        moveType: "lateral",
        typicalTiming: "After 3-5 years, often after owning IAM or network design for an account estate",
        why: "Most cloud security work is configuration: IAM, network exposure, encryption and logging. Cloud engineers already build those and know where the defaults are unsafe.",
        skillsToAdd: [
          "Policy as code (OPA, AWS SCPs, Azure Policy)",
          "CSPM and CNAPP tools such as Wiz or Prisma Cloud",
          "Cloud logging and detection (CloudTrail, GuardDuty, Microsoft Defender for Cloud)",
          "AWS Certified Security Specialty or CCSP",
        ],
        proof:
          "Guardrails or security controls you implemented across accounts, with findings reduced or coverage gained.",
      },
      {
        toRole: "Site Reliability Engineer",
        toSlug: "site-reliability-engineer",
        moveType: "lateral",
        typicalTiming: "After 2-4 years, especially if you already carry the pager for production",
        why: "SRE shifts the focus from provisioning infrastructure to keeping services reliable on it. Your understanding of failure domains, autoscaling and managed services is the foundation.",
        skillsToAdd: [
          "SLOs and error budgets",
          "Observability (Prometheus, Grafana, OpenTelemetry)",
          "Incident command and blameless postmortems",
          "Go or Python for reliability tooling",
        ],
        proof:
          "Production incidents you handled and a reliability improvement you made, with uptime or latency numbers.",
      },
      {
        toRole: "Solutions Architect",
        toSlug: "solutions-architect",
        moveType: "pivot",
        typicalTiming: "After 4-6 years, typically by engineers who enjoy explaining designs as much as building them",
        why: "Cloud providers, consultancies and SaaS vendors need architects who have run real workloads. Customer design conversations draw on the same architecture and cost knowledge, with more whiteboarding and less on-call.",
        skillsToAdd: [
          "Customer discovery and requirements elicitation",
          "Presenting architecture to non-technical buyers",
          "Proof-of-concept delivery",
          "Cost estimation and business case writing",
        ],
        proof:
          "Designs you explained to stakeholders outside engineering, plus migrations or builds with clear business outcomes.",
      },
    ],
    faqs: [
      {
        question: "Can a system administrator become a cloud engineer?",
        answer:
          "Yes, and it is one of the most common routes. Your Linux, networking and troubleshooting skills carry over. Add one cloud platform to an associate-level certification, learn Terraform, and rebuild something you administer today as code.",
      },
      {
        question: "What comes after cloud engineer?",
        answer:
          "Most commonly senior cloud engineer, then cloud architect. Others move into platform engineering, SRE or cloud security, and a smaller group moves into customer-facing solutions architecture or infrastructure management.",
      },
      {
        question: "Is FinOps a real career path for cloud engineers?",
        answer:
          "It is a growing specialty at organizations with large cloud bills, often as a FinOps engineer or analyst who works between engineering and finance. The FinOps Certified Practitioner certification is the common starting point, and cost-reduction work on your resume is the main evidence.",
      },
    ],
  },

  "ai-engineer": {
    overview:
      "AI engineering is new enough that ladders are still being written, and most AI engineers came from software engineering, so their levels usually map to the standard senior, staff and principal ladder. The fork is depth: toward model training and fine-tuning (ML engineering), toward AI infrastructure and platform, or toward the customer and product side. Staff scope usually comes from owning evaluation or retrieval infrastructure that several teams depend on.",
    moves: [
      {
        toRole: "Staff AI Engineer",
        moveType: "step_up",
        typicalTiming:
          "After 6-8 years of engineering overall, with at least two AI systems in production",
        why: "Staff engineers set the patterns other teams follow. AI engineers who built a shared eval harness, a retrieval service or a model gateway are already working at staff scope.",
        skillsToAdd: [
          "Shared evaluation infrastructure and quality gates in CI",
          "Model routing and cost controls across teams",
          "Technical design reviews across organizations",
          "LLM observability (Langfuse, Arize Phoenix or similar)",
        ],
        proof:
          "An AI component other teams adopted, with the number of consumers and its effect on quality, latency or cost.",
      },
      {
        toRole: "Machine Learning Engineer",
        toSlug: "machine-learning-engineer",
        moveType: "lateral",
        typicalTiming:
          "After 2-4 years, usually when prompting and retrieval stop being enough and fine-tuning becomes necessary",
        why: "You already build eval sets and diagnose model failures. ML engineering adds training: fine-tuning, data pipelines and deciding when a smaller trained model beats a large prompted one.",
        skillsToAdd: [
          "PyTorch",
          "Fine-tuning methods (LoRA, QLoRA)",
          "Training data pipelines and labeling",
          "Experiment tracking with MLflow or Weights & Biases",
        ],
        proof:
          "A fine-tuned or trained model you evaluated against a prompted baseline, with the comparison numbers.",
      },
      {
        toRole: "MLOps Engineer",
        toSlug: "mlops-engineer",
        moveType: "lateral",
        typicalTiming: "After 2-4 years, often by engineers who ended up owning deployment and monitoring",
        why: "Serving models, tracking versions and monitoring output quality in production are MLOps problems, and AI engineers who built that plumbing for their own features have done the work.",
        skillsToAdd: [
          "Model serving (vLLM, Triton or KServe)",
          "Kubernetes and GPU scheduling",
          "Model registries and versioning",
          "Production monitoring for drift and output quality",
        ],
        proof:
          "A model deployment you own in production, with latency, throughput or cost figures.",
      },
      {
        toRole: "Forward Deployed Engineer",
        moveType: "lateral",
        typicalTiming: "After 2-5 years, often by engineers who want more customer contact",
        why: "Forward deployed engineers build AI systems inside customer environments. It is the same retrieval, evaluation and integration work, done against someone else's data and constraints.",
        skillsToAdd: [
          "Enterprise data integration (SSO, data connectors, permissions-aware retrieval)",
          "Scoping and requirements work with customers",
          "Rapid prototyping under deadlines",
          "Security and compliance reviews for deployments",
        ],
        proof:
          "An AI system you built for real users outside your own team, with adoption or quality results.",
      },
      {
        toRole: "AI Product Manager",
        toSlug: "ai-product-manager",
        moveType: "pivot",
        typicalTiming: "After 3-5 years, typically by engineers who already shape what gets built",
        why: "AI PMs need to understand evaluation, failure modes and cost trade-offs deeply, which engineers already do. The pivot is toward deciding what to build and for whom.",
        skillsToAdd: [
          "User research and problem framing",
          "Writing product requirements and success metrics",
          "Prioritization and roadmapping",
          "Unit economics of model-backed features",
        ],
        proof:
          "A feature where you influenced scope or direction based on user feedback, not only implemented it.",
      },
    ],
    faqs: [
      {
        question: "Can a software engineer become an AI engineer?",
        answer:
          "Yes, most AI engineers are software engineers who added model skills. Build a retrieval-augmented application with a real evaluation set, measure its quality and cost, and ship it to some users. That single project covers most of what hiring managers screen for.",
      },
      {
        question: "Is AI engineering a stable career path or a hype title?",
        answer:
          "The title may evolve, but the work (building reliable products on top of models) is not going away. The durable skills are evaluation, retrieval design and production engineering, which carry over whatever the role is called in a few years.",
      },
      {
        question: "What comes after senior AI engineer?",
        answer:
          "Staff and principal AI engineer on the IC track, or engineering manager for an AI team. Some move deeper into ML engineering and training, and others move into AI platform or forward deployed roles.",
      },
    ],
  },

  "cybersecurity-engineer": {
    overview:
      "Security engineers usually pick a domain after a few years (cloud, application, detection, identity or network), and that specialty shapes the next decade more than the title does. Past senior, the IC route leads to principal engineer or security architect, and the management route to security engineering manager and eventually head of security. Engineers who write production-quality code have the widest range of options, because modern security teams build more of their own tooling.",
    moves: [
      {
        toRole: "Security Architect",
        toSlug: "security-architect",
        moveType: "step_up",
        typicalTiming:
          "After 7-9 years with hands-on depth in at least two security domains",
        why: "Architects decide which controls a system needs and which risks to accept. Engineers who have deployed, tuned and broken controls in production bring the realism that design reviews need.",
        skillsToAdd: [
          "Threat modeling for system designs",
          "Security reference architectures and standards writing",
          "Risk acceptance and exception processes",
          "CISSP or SABSA",
        ],
        proof:
          "A security design you led that other teams adopted, with the risk reduced or reviews shortened.",
      },
      {
        toRole: "Security Engineering Manager",
        moveType: "step_up",
        typicalTiming: "After 6-8 years, often after leading a program such as an EDR rollout or SIEM migration",
        why: "Security engineering managers balance incident load, project work and hiring. If you already coordinate across teams and mentor juniors, you are practicing the job.",
        skillsToAdd: [
          "Hiring and performance management",
          "Security roadmap planning and budgeting",
          "Metrics reporting to leadership",
          "CISM",
        ],
        proof:
          "A multi-team security program you led, with coverage or risk results and evidence you mentored others.",
      },
      {
        toRole: "Application Security Engineer",
        toSlug: "application-security-engineer",
        moveType: "lateral",
        typicalTiming: "After 3-5 years, easiest for engineers who already script and read code comfortably",
        why: "AppSec moves the same risk thinking into the software development lifecycle. Your automation skills fit directly into SAST, dependency scanning and secure pipeline work.",
        skillsToAdd: [
          "Secure code review",
          "SAST and SCA tools (Semgrep, CodeQL, Snyk)",
          "OWASP Top 10 and OWASP ASVS",
          "Threat modeling with developers",
        ],
        proof:
          "Security automation you built into a CI pipeline, or vulnerabilities you found in code and helped fix.",
      },
      {
        toRole: "Penetration Tester",
        toSlug: "penetration-tester",
        moveType: "lateral",
        typicalTiming: "After 3-5 years, usually after sustained lab practice",
        why: "Engineers know how defenses are configured and where they are usually weak. Offensive work tests those same controls from the attacker's side.",
        skillsToAdd: [
          "Burp Suite and Metasploit",
          "Active Directory and cloud attack techniques",
          "Report writing with clear remediation steps",
          "OSCP or GIAC GPEN",
        ],
        proof:
          "OSCP or equivalent, plus documented lab work or internal testing you performed with permission.",
      },
      {
        toRole: "Product Manager",
        toSlug: "product-manager",
        moveType: "pivot",
        typicalTiming: "After 5-7 years, most often into roles at security product companies",
        why: "Security products are bought and run by people like you. Engineers who know how tools actually fail in daily operations bring the customer insight that security PM teams hire for.",
        skillsToAdd: [
          "Customer discovery interviews",
          "Writing product requirements and success metrics",
          "Competitive analysis of security tools",
          "Roadmap prioritization",
        ],
        proof:
          "Tool evaluations or vendor selections you led, and internal tooling you designed around user needs.",
      },
    ],
    faqs: [
      {
        question: "Can a security analyst become a cybersecurity engineer?",
        answer:
          "Yes, and it is the most common route in. Start automating your own queue with Python and a SOAR platform, take on detection tuning, and volunteer for tool deployments. Engineering interviews look for things you built, not alerts you closed.",
      },
      {
        question: "Which cybersecurity specialization has the most room to grow?",
        answer:
          "Cloud and application security are where most new engineering work is, because that is where companies are building. Detection engineering is also growing as teams treat detections as code. Choose the one closest to what you already do, since depth beats breadth for senior roles.",
      },
      {
        question: "Do cybersecurity engineers need management experience to reach senior pay levels?",
        answer:
          "Not at organizations with a real IC track, where principal engineers and architects sit at the same level as managers. At smaller organizations the senior roles are more often managerial, which is one reason experienced engineers move to larger security teams.",
      },
    ],
  },

  "security-analyst": {
    overview:
      "Security analyst is the most common way into security, and few people make a whole career of queue work: it is a launch point. The first real fork arrives around Tier 2, when you choose between going deeper on investigation (incident response, threat intelligence, hunting), moving into building (security or detection engineering), or moving toward risk and compliance. The analysts who move fastest are usually the ones who automated parts of their own queue.",
    moves: [
      {
        toRole: "Incident Responder",
        moveType: "step_up",
        typicalTiming: "After 2-4 years in a SOC, once you have run investigations end to end",
        why: "Incident response takes the investigations you escalate and finishes them: scoping, containment, forensics and the report. Analysts who already work cases past triage are halfway there.",
        skillsToAdd: [
          "Digital forensics (Velociraptor, KAPE, Volatility)",
          "EDR investigation in tools such as CrowdStrike Falcon or Microsoft Defender for Endpoint",
          "Incident documentation and timeline building",
          "GIAC GCIH or GCFA",
        ],
        proof:
          "Investigations you led beyond triage, with scope, containment actions and outcome described.",
      },
      {
        toRole: "Security Operations Engineer",
        toSlug: "security-operations-engineer",
        moveType: "step_up",
        typicalTiming: "After 2-4 years, usually after you started scripting away repetitive triage",
        why: "Security operations engineers build the detections, integrations and playbooks analysts work from. You know which alerts waste time and which enrichment would have helped, which is the requirements list.",
        skillsToAdd: [
          "Python for automation",
          "SOAR playbooks (Splunk SOAR, Microsoft Sentinel playbooks or Tines)",
          "Detection-as-code with Sigma",
          "SIEM engineering: log onboarding and parsing",
        ],
        proof:
          "An automation or detection you built, with the analyst time saved or false positives removed.",
      },
      {
        toRole: "Threat Intelligence Analyst",
        moveType: "lateral",
        typicalTiming: "After 2-3 years, often by analysts who enjoy research and writing more than triage speed",
        why: "Threat intelligence starts from the indicators and TTPs you already see in alerts and asks who is behind them and what comes next. Your working knowledge of real attacks grounds the research.",
        skillsToAdd: [
          "MITRE ATT&CK mapping and adversary profiling",
          "Threat intelligence platforms (MISP, OpenCTI)",
          "Intelligence writing for technical and executive readers",
          "GIAC GCTI",
        ],
        proof:
          "Intelligence you produced that changed a detection or decision, such as a campaign write-up that led to new rules.",
      },
      {
        toRole: "GRC Analyst",
        moveType: "pivot",
        typicalTiming: "After 1-3 years, typically by analysts who want regular hours and more policy work",
        why: "GRC teams need people who understand how controls behave in practice. SOC experience makes your control testing and risk assessments more credible than those written purely from frameworks.",
        skillsToAdd: [
          "NIST CSF, NIST 800-53 and ISO 27001",
          "SOC 2 audit preparation",
          "Risk assessment and vendor risk reviews",
          "CISA or CRISC over time",
        ],
        proof:
          "Control evidence or audit support you contributed to, plus documentation or policy writing you owned.",
      },
      {
        toRole: "Penetration Tester",
        toSlug: "penetration-tester",
        moveType: "pivot",
        typicalTiming: "After 2-4 years plus sustained hands-on lab practice",
        why: "Analysts see attacker behavior every day from the defender's side. Moving to offense uses that knowledge of what gets caught and what slips through.",
        skillsToAdd: [
          "Nmap, Burp Suite and Metasploit",
          "Active Directory attack techniques",
          "Hack The Box or TryHackMe lab progression",
          "OSCP",
        ],
        proof:
          "OSCP or equivalent, plus lab write-ups or a public portfolio of rooms and reports.",
      },
    ],
    faqs: [
      {
        question: "Is security analyst an entry-level job?",
        answer:
          "Tier 1 SOC analyst roles are the closest thing security has to an entry-level job, but most still expect some IT background such as help desk, networking or system administration, plus a certification like CompTIA Security+. Senior analyst titles are not entry-level.",
      },
      {
        question: "Should a security analyst move into engineering or incident response?",
        answer:
          "Choose engineering if you like building and automating, and incident response if you like the investigation itself. Both are common next steps. If you are unsure, automate something in your current queue: whether you enjoyed the building or the result tells you a lot.",
      },
      {
        question: "Do I need a degree to move beyond a Tier 2 analyst role?",
        answer:
          "Usually not. Security hiring weighs demonstrated skills and certifications heavily, and investigations or detections you can describe in detail count for more. Some government and defense roles do have degree or clearance requirements.",
      },
    ],
  },

  "business-analyst": {
    overview:
      "Business analyst careers move from documenting requirements to shaping solutions, and the title ladder (BA, senior, lead) is shorter than the list of sideways options. The most common exits are product owner or product manager, where you own the priority decisions you used to inform, and data or BI analysis, where the analysis becomes more quantitative. Solutions architecture and consulting are the other routes, depending on whether you prefer the technical design or the problem framing.",
    moves: [
      {
        toRole: "Product Owner",
        moveType: "lateral",
        typicalTiming: "After 2-4 years, often inside the same agile team",
        why: "Product owners write and prioritize the backlog that BAs already help refine. The difference is decision rights: you stop recommending and start choosing.",
        skillsToAdd: [
          "Backlog prioritization (WSJF, MoSCoW)",
          "Writing acceptance criteria and user stories at scale",
          "Stakeholder trade-off conversations",
          "CSPO or PSPO I",
        ],
        proof:
          "A backlog or release you shaped, with scope decisions you made and the result they produced.",
      },
      {
        toRole: "Product Manager",
        toSlug: "product-manager",
        moveType: "step_up",
        typicalTiming: "After 3-6 years, usually via product owner or a BA role on a product team",
        why: "PMs decide what to build and why. BAs already understand the users, processes and constraints; the step up adds strategy, market thinking and accountability for outcomes.",
        skillsToAdd: [
          "Product discovery and customer interviews",
          "Product analytics (Amplitude, Mixpanel or Pendo)",
          "Roadmapping and prioritization frameworks",
          "Defining success metrics before build",
        ],
        proof:
          "A problem you reframed and the business result of the solution you pushed for, not only the requirements you wrote.",
      },
      {
        toRole: "Business Intelligence Analyst",
        toSlug: "business-intelligence-analyst",
        moveType: "lateral",
        typicalTiming: "After 1-3 years, typically by BAs who already pull their own data",
        why: "BI analysts answer business questions with data, and BAs already know which questions matter and where the data lives in the process.",
        skillsToAdd: [
          "SQL",
          "Power BI or Tableau",
          "Data modeling basics (star schemas)",
          "Microsoft PL-300 (Power BI Data Analyst)",
        ],
        proof:
          "A report or analysis you built yourself that changed a decision, with the data work described.",
      },
      {
        toRole: "Solutions Architect",
        toSlug: "solutions-architect",
        moveType: "step_up",
        typicalTiming: "After 5-8 years, most often on enterprise platforms such as Salesforce, ServiceNow or ERP systems",
        why: "On configurable enterprise platforms, the line between analysis and design is thin. BAs who already decide how requirements map onto platform features are doing early solution design.",
        skillsToAdd: [
          "Platform architecture certifications (Salesforce Application Architect or ServiceNow CTA path)",
          "Integration patterns and APIs",
          "Data modeling",
          "Solution design documents",
        ],
        proof:
          "A platform solution you designed, not just specified, with the integrations and scale involved.",
      },
      {
        toRole: "Management Consultant",
        moveType: "pivot",
        typicalTiming: "After 3-5 years, often with an MBA or strong industry domain knowledge",
        why: "Consultants frame business problems and drive change across stakeholders. Process mapping, stakeholder alignment and structured analysis are the same toolkit used at a more strategic level.",
        skillsToAdd: [
          "Hypothesis-driven problem solving",
          "Executive slide writing",
          "Financial modeling basics",
          "Industry-specific domain depth",
        ],
        proof:
          "A process or operational change you drove with measured financial or efficiency impact.",
      },
    ],
    faqs: [
      {
        question: "Is business analyst a good first step toward product management?",
        answer:
          "Yes, it is one of the most common routes. BAs learn users, processes and requirements, which are core product skills. To make the move, look for a BA role on a product team, take on backlog ownership, and show outcomes rather than documents.",
      },
      {
        question: "What comes after senior business analyst?",
        answer:
          "Lead BA or analysis practice lead if you want to stay in the discipline. Most senior BAs move sideways instead: product owner, product manager, solutions architect, program manager or consulting.",
      },
      {
        question: "Should a business analyst learn SQL?",
        answer:
          "Yes. It lets you validate requirements against real data, answer your own questions, and opens the route to BI and data analyst roles. You do not need data engineering depth, just enough to query, join and aggregate confidently.",
      },
    ],
  },

  "ui-designer": {
    overview:
      "UI design as a standalone title is narrower in the US than it used to be, because many companies hire product designers who cover both interface and experience work. So the most common progression is to broaden into product design, or to go deeper into design systems, where visual craft becomes shared infrastructure. Other directions are motion, and front-end development for designers who enjoy building what they draw.",
    moves: [
      {
        toRole: "Product Designer",
        toSlug: "product-designer",
        moveType: "step_up",
        typicalTiming: "After 2-4 years, once you are regularly involved before the visual stage",
        why: "Product designers own the problem as well as the interface. UI designers who already shape flows, question requirements and join research sessions are doing part of the job.",
        skillsToAdd: [
          "User research and usability testing",
          "User flows and information architecture",
          "Framing problems with product and engineering",
          "Measuring design outcomes with product analytics",
        ],
        proof:
          "A portfolio case study that starts from a user problem, not a screen, and ends with a measured result.",
      },
      {
        toRole: "Design Systems Designer",
        moveType: "lateral",
        typicalTiming: "After 3-5 years, usually after building or extending a component library",
        why: "Design systems turn consistency, spacing, typography and color decisions into reusable components. That is UI craft applied at the scale of a whole organization.",
        skillsToAdd: [
          "Figma variables, variants and component architecture",
          "Design tokens and token pipelines (Tokens Studio, Style Dictionary)",
          "Documentation and contribution models",
          "WCAG 2.2 accessibility requirements",
        ],
        proof:
          "A component library or token system you built or extended, with adoption across teams.",
      },
      {
        toRole: "Motion Designer",
        toSlug: "motion-designer",
        moveType: "lateral",
        typicalTiming: "Any time, most often by UI designers who already prototype interactions",
        why: "Product motion (transitions, feedback, onboarding animation) is an extension of interface hierarchy and timing. Your UI eye decides what motion should clarify.",
        skillsToAdd: [
          "After Effects",
          "Rive or Lottie for production animation",
          "Principles of easing and timing",
          "Prototyping in ProtoPie or Figma Smart Animate",
        ],
        proof:
          "Motion work shipped in a real product, or a portfolio reel showing interface animations with their purpose explained.",
      },
      {
        toRole: "Frontend Developer",
        toSlug: "frontend-developer",
        moveType: "pivot",
        typicalTiming: "After 2-4 years, typically by designers who already write some CSS",
        why: "Front-end teams value people who care about pixel accuracy, spacing and interaction details. Designers who can build their own designs cut the handoff problems every team struggles with.",
        skillsToAdd: [
          "HTML, CSS and modern layout (Flexbox, Grid)",
          "JavaScript and TypeScript",
          "React",
          "Tailwind CSS or a CSS-in-JS approach",
        ],
        proof:
          "Real code: a site or components you built, in a public repository, ideally matching a design you made.",
      },
      {
        toRole: "Brand Designer",
        moveType: "pivot",
        typicalTiming: "After 2-4 years, usually by designers who prefer visual identity over product flows",
        why: "Typography, color and composition are the core of brand work too. The pivot trades interface constraints for identity systems, campaigns and marketing surfaces.",
        skillsToAdd: [
          "Adobe Illustrator and InDesign",
          "Logo and identity system design",
          "Brand guidelines",
          "Campaign and marketing design",
        ],
        proof:
          "A portfolio with identity or marketing work, not only product screens.",
      },
    ],
    faqs: [
      {
        question: "Is UI design a dying job title?",
        answer:
          "The standalone title is less common in US tech because many companies hire product designers instead, but UI skills are not declining. Strong visual craft is exactly what product design teams struggle to hire for. The practical move is to add research and flow work so you qualify for product designer roles.",
      },
      {
        question: "Can a graphic designer move into UI design?",
        answer:
          "Yes. Typography, color and composition transfer directly. The gaps are interface-specific: responsive layout, interaction states, component systems and accessibility. Redesign a real app flow in Figma and show the states, not only the hero screen.",
      },
      {
        question: "What is a design engineer, and can UI designers become one?",
        answer:
          "A design engineer works between design and front-end, building production UI and prototypes with close attention to detail. UI designers who learn React and CSS well are natural candidates, and the role is growing at product-focused companies.",
      },
    ],
  },

  "solutions-architect": {
    overview:
      "Solutions architect covers two different jobs with one title: delivery architects inside companies and consultancies, and pre-sales architects at vendors who design solutions to win and land deals. In both, the IC route leads toward principal or enterprise architect, and the leadership route toward running an architecture practice or a solutions team. The pre-sales version has extra exits into product management and customer-facing leadership, because you spend your days learning what customers actually need.",
    moves: [
      {
        toRole: "Enterprise Architect",
        toSlug: "enterprise-architect",
        moveType: "step_up",
        typicalTiming: "After 8-10 years overall, once your designs span several programs or business units",
        why: "Enterprise architects set the standards and roadmap that individual solutions fit into. Solutions architects who already negotiate integration and platform choices across teams are working at that boundary.",
        skillsToAdd: [
          "TOGAF",
          "Capability mapping and portfolio rationalization",
          "Technology roadmapping and governance",
          "ArchiMate",
        ],
        proof:
          "Architecture decisions that shaped multiple programs or platform choices, with business outcomes.",
      },
      {
        toRole: "Director of Solutions Architecture",
        moveType: "step_up",
        typicalTiming: "After 3-5 years as a senior architect, often after mentoring newer architects",
        why: "The director builds and runs the architect team: hiring, coverage and quality of designs. Senior architects who already review peers' designs and coach juniors are practicing the role.",
        skillsToAdd: [
          "Hiring and developing architects",
          "Team coverage and capacity planning",
          "Architecture review processes",
          "Executive stakeholder management",
        ],
        proof:
          "Architects you mentored, a review process you ran, and results across multiple engagements.",
      },
      {
        toRole: "Cloud Architect",
        toSlug: "cloud-architect",
        moveType: "lateral",
        typicalTiming: "Any time, most natural after several cloud-heavy engagements",
        why: "Cloud architecture narrows the scope to one platform but goes deeper into landing zones, networking and cost. Most modern solutions already run on cloud, so the design experience carries over.",
        skillsToAdd: [
          "AWS Certified Solutions Architect Professional or Google Professional Cloud Architect",
          "Landing zone and multi-account design",
          "Terraform",
          "FinOps practices",
        ],
        proof:
          "Cloud designs you owned, with scale, reliability and cost details.",
      },
      {
        toRole: "Software Architect",
        toSlug: "software-architect",
        moveType: "lateral",
        typicalTiming: "After 5-8 years, usually by delivery-side architects who want more code-level involvement",
        why: "Software architects own the internal structure of systems rather than the fit between them. Solutions architects with an engineering background already reason about services, data and interfaces.",
        skillsToAdd: [
          "Domain-driven design",
          "Event-driven architecture (Kafka)",
          "Code-level design reviews",
          "Architecture decision records",
        ],
        proof:
          "Recent hands-on engineering and a system whose internal design you owned.",
      },
      {
        toRole: "Product Manager",
        toSlug: "product-manager",
        moveType: "pivot",
        typicalTiming: "After 3-6 years, most often from pre-sales roles",
        why: "Pre-sales architects hear customer needs, objections and workarounds constantly. That customer insight is what product teams hire for.",
        skillsToAdd: [
          "Product discovery and prioritization",
          "Roadmapping",
          "Writing requirements and success metrics",
          "Competitive and market analysis",
        ],
        proof:
          "Customer feedback you turned into product changes, or deals won because of a gap you identified.",
      },
    ],
    faqs: [
      {
        question: "Can a software engineer become a solutions architect?",
        answer:
          "Yes, most do. The gap is not technical depth but communication and scope: gathering requirements, explaining trade-offs to non-engineers, and designing across systems rather than inside one. Take on design docs and customer-facing work in your current role first.",
      },
      {
        question: "Is pre-sales solutions architecture a good career move?",
        answer:
          "It suits people who enjoy customer conversations and variety over long build cycles. You trade deep ownership of one system for breadth across many customers, and often part of your pay is tied to sales results.",
      },
      {
        question: "What comes after solutions architect?",
        answer:
          "Principal or enterprise architect on the IC track, or director of solutions architecture on the leadership track. Pre-sales architects also move into product management and field CTO roles.",
      },
    ],
  },
};
