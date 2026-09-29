import type { RoleCareerPath } from "./types";

// Hand-written career paths, part 2. Each entry complements the role's intro
// and seniority ladder in lib/roles/role-content.ts rather than restating them.

export const CAREER_PATHS_PART_2: Record<string, RoleCareerPath> = {
  "network-security-engineer": {
    overview:
      "Most network security engineers come up through network engineering or firewall operations. The first few years go into mastering one vendor's stack. Around senior level you have to pick a direction. Stay technical and grow into security architecture and zero trust design. Or follow segmentation into the cloud, where it lives in VPCs and security groups. Management is open too, but the fastest way to raise your ceiling is proof that you design controls instead of closing other people's change tickets.",
    moves: [
      {
        toRole: "Security Architect",
        toSlug: "security-architect",
        moveType: "step_up",
        typicalTiming:
          "Around year 5 to 7, usually right after you design segmentation for a whole site or business unit yourself",
        why: "Setting trust zones and writing firewall policy standards is already architecture, scoped to the network. Architects make the same calls about identity, applications and data.",
        skillsToAdd: [
          "Threat modeling with STRIDE or attack trees",
          "Zero trust reference architecture (NIST SP 800-207)",
          "ZTNA and SASE design",
          "Architecture decision records",
          "CISSP",
        ],
        proof:
          "A segmentation or zero trust program you designed, with the attack surface it removed, such as flat VLANs retired or exposed services closed.",
      },
      {
        toRole: "Cloud Security Engineer",
        toSlug: "cloud-security-engineer",
        moveType: "lateral",
        typicalTiming:
          "Any time after year 3. It's easiest when your company is mid-migration and needs someone who understands both sides.",
        why: "A security group is a firewall rule with an API. You've reasoned about allow and deny for years, and the cloud version simply lives in Terraform.",
        skillsToAdd: [
          "AWS VPC design, security groups and AWS Network Firewall (or Azure NSGs and Azure Firewall)",
          "Terraform",
          "CSPM tooling such as Wiz or Prisma Cloud",
          "AWS Certified Security Specialty",
        ],
        proof:
          "A hybrid or cloud network you secured, like a site-to-site VPN or transit gateway design, plus Terraform you wrote rather than inherited.",
      },
      {
        toRole: "Detection Engineer",
        moveType: "lateral",
        typicalTiming:
          "Year 3 or 4, if IDS/IPS tuning already eats a real chunk of your week",
        why: "Deciding which IPS signatures to trust after an afternoon in NetFlow and packet captures is detection work. The new part is writing rules as code and covering endpoint, identity and cloud logs too.",
        skillsToAdd: [
          "Sigma rules and detection-as-code workflows",
          "Zeek and Suricata",
          "SIEM query languages (Splunk SPL or KQL)",
          "MITRE ATT&CK mapping",
          "Python for rule testing",
        ],
        proof:
          "A tuning project with false-positive counts before and after, and at least one custom signature you wrote from scratch.",
      },
      {
        toRole: "Penetration Tester",
        toSlug: "penetration-tester",
        moveType: "pivot",
        typicalTiming:
          "Year 3 to 5, and only after several months of lab work on your own time",
        why: "You know how flat networks, stale VPN accounts and forgotten any-any rules fail. That's the map an internal pen tester works from.",
        skillsToAdd: [
          "Nmap, Metasploit and Burp Suite",
          "Active Directory attack paths with BloodHound",
          "Report writing for findings and remediation",
          "OSCP",
        ],
        proof:
          "OSCP or a similar hands-on cert, plus lab write-ups or an authorized internal segmentation test you ran and documented.",
      },
      {
        toRole: "Infrastructure Security Manager",
        moveType: "step_up",
        typicalTiming:
          "Usually 6 to 8 years in, often after you've been quietly running change review or the on-call rotation",
        why: "Every week you referee between uptime and policy. As the manager you do it with a budget, a headcount and the vendor contracts attached.",
        skillsToAdd: [
          "Hiring, one-on-ones and performance reviews",
          "Vendor and license management",
          "Risk registers and policy exception processes",
          "CISM",
        ],
        proof:
          "Bullets that show you led people, such as engineers you mentored, the rotation you ran or a rollout you coordinated across teams.",
      },
    ],
    faqs: [
      {
        question: "Can a network engineer move into network security?",
        answer:
          "Yes, and it's the most common way in. Volunteer for firewall and VPN changes in your current job, then earn a vendor security cert like Palo Alto PCNSE or Cisco CCNP Security. Hiring managers want security changes you've already made in production, not only routing and switching.",
      },
      {
        question: "Do network security engineers need to know how to code?",
        answer:
          "Enough to automate your own work, yes. Python for policy audits and bulk changes, plus Terraform or Ansible, is what gets engineers pulled into cloud and architecture roles. You don't need a software engineer's depth.",
      },
      {
        question: "Should I specialize in one firewall vendor or stay vendor-neutral?",
        answer:
          "Go deep on one vendor first, because that's what gets you hired and trusted with production changes. After a few years the vendor matters less. Architecture interviews test segmentation design, policy hygiene and trust boundaries, and those work on any platform.",
      },
    ],
  },

  "iam-engineer": {
    overview:
      "Most IAM (identity and access management) engineers start in access administration or on the service desk. Next comes automating how accounts get created, changed and removed. After that the path splits into identity architecture, privileged access, or governance and audit. Identity is the main security boundary in cloud and zero trust designs, so senior IAM engineers have a shorter road to architecture than most specialists. People rarely leave identity. They widen out from it.",
    moves: [
      {
        toRole: "Identity Architect",
        moveType: "step_up",
        typicalTiming:
          "After 5 to 7 years, once other teams are building on a federation or lifecycle pattern you designed",
        why: "Designing SSO, provisioning and role models for one platform is identity architecture at small scale. The architect owns it for the whole company, including machine and customer identities.",
        skillsToAdd: [
          "Entitlement modeling (RBAC, ABAC and policy-based access)",
          "Workload identity (cloud IAM roles, SPIFFE)",
          "Customer identity (CIAM) patterns",
          "Zero trust identity design (NIST SP 800-207)",
          "IDPro CIDPro or CISSP",
        ],
        proof:
          "An identity pattern you designed that several apps or teams adopted, with the count and the result, such as fewer orphaned accounts.",
      },
      {
        toRole: "Cloud Security Engineer",
        toSlug: "cloud-security-engineer",
        moveType: "lateral",
        typicalTiming:
          "Year 3 or 4, and easier if you've already set up cloud SSO or role federation",
        why: "Cloud accounts fill up with over-permissioned roles and forgotten service accounts. Cleaning that up takes exactly the least-privilege instincts you use every day.",
        skillsToAdd: [
          "AWS IAM policies, SCPs and permission boundaries",
          "Microsoft Entra ID roles and Privileged Identity Management",
          "CIEM tooling for unused-permission analysis",
          "Terraform",
          "AWS Certified Security Specialty",
        ],
        proof:
          "A least-privilege cleanup in AWS or Azure with numbers, like standing admin roles removed or unused permissions revoked.",
      },
      {
        toRole: "IAM Manager",
        moveType: "step_up",
        typicalTiming:
          "Around 6 to 8 years, typically after leading a platform migration or an access certification campaign",
        why: "Identity work always pulls in HR, app owners and auditors. If you already run those meetings, the manager title mostly adds a roadmap and a budget.",
        skillsToAdd: [
          "Program roadmapping and stakeholder reporting",
          "Hiring and team leadership",
          "Audit and regulator relationship management",
          "CISM",
        ],
        proof:
          "A cross-team program you led, such as a joiner-mover-leaver automation or PAM rollout, with what shipped and how the next audit went.",
      },
      {
        toRole: "GRC Analyst",
        moveType: "pivot",
        typicalTiming:
          "Year 2 to 4. It suits people who found access reviews and audit evidence more interesting than platform work.",
        why: "Access reviews and separation of duties make up a big share of the IT controls auditors test. You know how they work under the hood, which most GRC (governance, risk and compliance) hires learn on the job.",
        skillsToAdd: [
          "SOX ITGC testing",
          "NIST 800-53 and ISO 27001 control frameworks",
          "Risk assessment and control documentation",
          "CISA or CRISC",
        ],
        proof:
          "An audit you supported that closed clean, or an access certification or separation-of-duties process you designed and ran.",
      },
      {
        toRole: "Solutions Architect",
        toSlug: "solutions-architect",
        moveType: "pivot",
        typicalTiming:
          "After 4 to 6 years of hands-on work on one major identity platform",
        why: "Identity vendors and integrators want people who've deployed the product somewhere messy. Most customer discovery calls are questions you've already answered for your own company.",
        skillsToAdd: [
          "Discovery calls and requirements gathering with customers",
          "Demo and proof-of-concept building",
          "Writing statements of work and solution designs",
          "Platform certifications such as Okta Certified Professional or CyberArk Defender",
        ],
        proof:
          "Deep implementation history on one platform, with the number of applications you onboarded and at least one integration you designed.",
      },
    ],
    faqs: [
      {
        question: "Can a help desk or system administrator move into IAM?",
        answer:
          "Yes, and it's one of the most reliable routes. Provisioning accounts, managing groups and working in Active Directory are already IAM basics. Learn how SAML and OIDC work, get hands-on time with one identity platform, and ask to onboard applications in your current job.",
      },
      {
        question: "Does IAM lead to security architecture?",
        answer:
          "Yes, more directly than most security specialties. Zero trust designs treat identity as the main control. Senior IAM engineers who understand federation, workload identity and privileged access are obvious candidates for identity or security architect roles.",
      },
      {
        question: "Should I specialize in privileged access or identity governance?",
        answer:
          "Pick the work you'd rather do every day. Privileged access sits close to infrastructure and incident response, with vaulting, session recording and just-in-time access. Governance sits close to audit, with access certifications, role mining and separation of duties. Larger companies hire for them as separate jobs.",
      },
    ],
  },

  "security-architect": {
    overview:
      "Nobody starts as a security architect. You get here after years of engineering, so growth from here is about scope, not new skills. You go from one business area to the whole company, and from reviewing designs to writing the standards others follow. Past principal, most architects head toward the CISO track, broader enterprise or cloud architecture, or consulting and pre-sales. Smaller companies run out of room early, so many architects change employers to get bigger problems.",
    moves: [
      {
        toRole: "Principal Security Architect",
        moveType: "step_up",
        typicalTiming:
          "Usually 3 to 5 years into the architect title, when teams outside your area start using your standards",
        why: "Same work, bigger blast radius. Your decisions become the defaults every other architect inherits.",
        skillsToAdd: [
          "Enterprise security reference architecture",
          "Security metrics and risk quantification (FAIR)",
          "Writing policy and standards that engineering teams adopt",
          "SABSA Chartered Foundation",
        ],
        proof:
          "Standards or reference designs used by more than one business unit, and what changed after, such as fewer exceptions or faster reviews.",
      },
      {
        toRole: "Chief Information Security Officer (CISO)",
        moveType: "step_up",
        typicalTiming:
          "Well over a decade into security, and almost always by way of a director-level role first",
        why: "You already turn technical risk into business trade-offs. A CISO does it in front of the board and answers for the budget, the team and the breach.",
        skillsToAdd: [
          "Board and executive risk reporting",
          "Security budget and program management",
          "Incident and breach response leadership",
          "Regulatory frameworks (SEC cyber disclosure rules, HIPAA, PCI DSS)",
          "CISM",
        ],
        proof:
          "A team you managed and a security program you owned end to end, including its budget and what you reported to executives.",
      },
      {
        toRole: "Enterprise Architect",
        toSlug: "enterprise-architect",
        moveType: "lateral",
        typicalTiming:
          "3 to 5 years into architecture, especially if you already sit on the architecture review board",
        why: "On the review board you already weigh designs against cost, dependencies and business goals. Enterprise architects do that for every system, not only the security ones.",
        skillsToAdd: [
          "TOGAF",
          "Capability mapping and application portfolio rationalization",
          "Technology roadmapping",
          "ArchiMate or a similar modeling notation",
        ],
        proof:
          "Decisions you made that shaped platform or vendor choices, written so it's clear they went beyond security controls.",
      },
      {
        toRole: "Cloud Architect",
        toSlug: "cloud-architect",
        moveType: "lateral",
        typicalTiming:
          "Any point after you've done real design work on a cloud migration or landing zone",
        why: "Half of a cloud landing zone is account structure, network design, identity and guardrails. If you designed those pieces, owning the rest of the platform is a short reach.",
        skillsToAdd: [
          "Landing zone design (AWS Control Tower or Azure landing zones)",
          "Cost and reliability trade-offs in cloud architecture",
          "Terraform",
          "AWS Certified Solutions Architect Professional or Google Professional Cloud Architect",
        ],
        proof:
          "A cloud environment where you designed the guardrails or the architecture, with the number of accounts or workloads it covered.",
      },
      {
        toRole: "Solutions Architect",
        toSlug: "solutions-architect",
        moveType: "pivot",
        typicalTiming:
          "After 2 to 4 years as an architect, usually when one employer's environment starts to feel small",
        why: "Security vendors need someone who can sit with a customer's security team and design a rollout that survives their review board. You've spent years on the other side of that table.",
        skillsToAdd: [
          "Customer discovery and technical qualification",
          "Proof-of-concept planning",
          "Presenting to mixed technical and executive audiences",
          "Deep product knowledge in one security category (SIEM, SASE, CNAPP)",
        ],
        proof:
          "Architecture reviews you led, and times you presented security decisions to people outside security, like finance, legal or executives.",
      },
    ],
    faqs: [
      {
        question: "How many years does it take to become a security architect?",
        answer:
          "Most people reach the title after 8 to 10 years in security or infrastructure. They usually have hands-on engineering in at least two areas. It's almost never an entry point, because the job depends on having watched real controls fail in production.",
      },
      {
        question: "Is security architect a management role?",
        answer:
          "No. It's a senior individual contributor role with influence but no direct reports. Architects who want to manage people usually move to security engineering manager or director. The road to CISO generally runs through management, not architecture alone.",
      },
      {
        question: "Can a security architect become an enterprise architect?",
        answer:
          "Yes, it's a common sideways move. You already review designs across systems and weigh business constraints. What's usually missing is breadth, meaning application portfolio management, integration patterns and a framework like TOGAF.",
      },
    ],
  },

  "game-designer": {
    overview:
      "The game design ladder runs junior, designer, senior, lead, then design director or creative director. Lead is where the job flips from designing systems to steering other designers. Most people get past mid-level by specializing in systems, economy, levels, combat or narrative, because studios hire for the discipline. Designers who leave games tend to land in product management and UX. Both still pay for knowing how players behave and reading their data.",
    moves: [
      {
        toRole: "Lead Game Designer",
        moveType: "step_up",
        typicalTiming:
          "After 6 to 8 years, with at least one title where you owned a major system through launch",
        why: "If you're already reviewing other designers' specs and settling fights between systems, you're doing half a lead's job without the title.",
        skillsToAdd: [
          "Design review and critique for other designers",
          "Scoping and cutting features against a production schedule",
          "Pitching and defending design direction to directors",
          "Mentoring junior designers",
        ],
        proof:
          "A shipped system you owned end to end, plus specific examples of directing other designers' work on it.",
      },
      {
        toRole: "Economy Designer",
        moveType: "lateral",
        typicalTiming:
          "Year 2 to 4, usually systems designers who secretly enjoy the spreadsheet side of tuning",
        why: "It's systems design where the knobs are currencies, rewards and progression pace. Player data grades your work every week.",
        skillsToAdd: [
          "Sink-and-faucet economy modeling in spreadsheets",
          "SQL for player telemetry",
          "A/B test design and analysis",
          "Monetization and progression pacing for live games",
        ],
        proof:
          "A progression or reward system you tuned from player data, and the change in player behavior that followed.",
      },
      {
        toRole: "Game Producer",
        moveType: "lateral",
        typicalTiming:
          "After 3 to 5 years, often designers who already run a feature team in all but name",
        why: "Producers own scope, schedule and the handoffs between disciplines. Every time you talked a feature down with engineering and art, you were producing.",
        skillsToAdd: [
          "Agile planning in Jira or Hansoft",
          "Milestone and risk tracking",
          "Cross-discipline dependency management",
          "Certified ScrumMaster (CSM)",
        ],
        proof:
          "A feature or milestone you coordinated across design, engineering and art that shipped on the date it was planned for.",
      },
      {
        toRole: "Product Manager",
        toSlug: "product-manager",
        moveType: "pivot",
        typicalTiming:
          "Somewhere in years 3 to 6, and mostly from live-service or free-to-play games",
        why: "Retention loops, onboarding funnels and A/B tests fill a live-game designer's week, and a consumer PM's too. The vocabulary differs. The decisions don't.",
        skillsToAdd: [
          "Product discovery and customer interviews",
          "Product analytics tools (Amplitude or Mixpanel)",
          "Writing product requirements and success metrics",
          "Roadmap prioritization frameworks (RICE)",
        ],
        proof:
          "A feature you shaped with player data, and the retention, conversion or engagement result written out plainly.",
      },
      {
        toRole: "UX Designer",
        toSlug: "ux-designer",
        moveType: "pivot",
        typicalTiming:
          "Year 2 to 4, most naturally for designers who worked on menus, onboarding or the HUD",
        why: "You design for learnability and clear feedback, then watch real players struggle in playtests. UX is that same loop pointed at apps and websites.",
        skillsToAdd: [
          "Figma",
          "Usability testing and interview synthesis",
          "Information architecture and user flows",
          "WCAG accessibility basics",
        ],
        proof:
          "A portfolio case study that treats a game onboarding or interface problem as a UX problem, with playtest findings driving the changes.",
      },
    ],
    faqs: [
      {
        question: "Can a game designer become a product manager?",
        answer:
          "Yes, and designers from live-service games have the easiest time. They already work with retention and monetization data. Rebuild your portfolio around outcomes like retention and conversion instead of mechanics, and get fluent in a product analytics tool such as Amplitude.",
      },
      {
        question: "Should a game designer specialize or stay a generalist?",
        answer:
          "Specialize after a few years. Generalists are valuable on small teams. Mid-size and large studios hire for systems, level, combat, narrative or economy design, and senior postings almost always name the specialty.",
      },
      {
        question: "What comes after lead game designer?",
        answer:
          "Design director or creative director, the people who own the vision for a title or a studio's lineup. Some leads become game directors instead, which adds production responsibility to design authority.",
      },
    ],
  },

  "game-developer": {
    overview:
      "Game programmers usually start on gameplay features and grow toward owning an area such as engine, rendering, networking, tools or platform. Seniority tracks shipped titles closely. Past senior you choose between leading people as lead programmer or technical director, and going deep as a principal in graphics, engine or online systems. The industry runs in boom and bust cycles. When it turns, real-time C++ skills sell well in simulation, AR/VR and general software.",
    moves: [
      {
        toRole: "Lead Programmer",
        moveType: "step_up",
        typicalTiming:
          "After 6 to 8 years and at least two shipped titles, one where a major system was yours",
        why: "Senior programmers who review code, unblock people and push back on impossible scope are most of the way there. What's left is owning the technical calls for the whole team.",
        skillsToAdd: [
          "Technical planning and estimation for milestones",
          "Code review standards and team conventions",
          "Hiring and mentoring programmers",
          "Profiling across CPU, GPU and memory (PIX, RenderDoc, Unreal Insights)",
        ],
        proof:
          "A shipped system you owned, plus signs you led others, like a feature team, code standards you set or new programmers you onboarded.",
      },
      {
        toRole: "Engine Programmer",
        moveType: "lateral",
        typicalTiming:
          "Year 3 to 5, usually gameplay programmers who keep getting handed the performance bugs",
        why: "If you're the one people call about frame spikes and memory blowups, you already work below the gameplay layer. Engine programming makes that the whole job.",
        skillsToAdd: [
          "Modern C++ and data-oriented design",
          "Multithreading and job systems",
          "Memory allocators and platform profiling",
          "Unreal Engine source-level work",
        ],
        proof:
          "An optimization with frame time or memory numbers before and after, on a shipped or finished project.",
      },
      {
        toRole: "AR/VR Engineer",
        toSlug: "ar-vr-engineer",
        moveType: "lateral",
        typicalTiming: "Any time after 2 or 3 years in Unity or Unreal",
        why: "Same engines, tighter frame budget. In a headset a dropped frame doesn't stutter, it makes people feel sick.",
        skillsToAdd: [
          "OpenXR",
          "Unity XR Interaction Toolkit or Unreal's XR framework",
          "Stereo rendering and foveated rendering",
          "Spatial interaction and hand-tracking design",
        ],
        proof:
          "A finished XR prototype or shipped feature that holds frame rate on real headset hardware, with the device named.",
      },
      {
        toRole: "Software Engineer",
        toSlug: "software-engineer",
        moveType: "pivot",
        typicalTiming:
          "Any time. Most people make it after a studio closure or when predictable hours start to matter more.",
        why: "Backend and online services are the softest landing, since many games already run server code. Years of chasing performance bugs on a deadline carry over well.",
        skillsToAdd: [
          "A mainstream backend language such as Go, Java or C#/.NET",
          "REST and gRPC API design",
          "SQL databases",
          "Cloud deployment on AWS, Azure or GCP",
          "Automated testing and CI pipelines",
        ],
        proof:
          "One project built outside an engine, like a web service with tests and a deploy pipeline. It shows you can work without Unity or Unreal.",
      },
      {
        toRole: "Simulation Engineer",
        moveType: "pivot",
        typicalTiming:
          "After 3 to 5 years, especially with physics, rendering or tools work behind you",
        why: "Training simulators, self-driving car simulation and digital twins are built on game engines. Your physics and rendering knowledge goes straight across.",
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
          "Yes, and real-time rendering, C++ performance and engine skills travel well. Simulation, AR/VR, film and virtual production, and automotive all hire for them. General software teams hire game programmers too, but you'll usually need one project built outside an engine.",
      },
      {
        question: "Should a game programmer specialize in graphics, engine or gameplay?",
        answer:
          "Start in gameplay, which has the most openings, then specialize toward whatever you keep drifting into. Graphics and engine programmers are fewer and harder to replace. That makes those jobs steadier once you have real depth.",
      },
      {
        question: "How do game programmers become technical directors?",
        answer:
          "Almost always through lead programmer, after owning architecture decisions on a shipped title. Technical directors are judged on engine and platform choices and on whether the team ships. Leading people counts as much as technical depth.",
      },
    ],
  },

  "ai-product-manager": {
    overview:
      "The AI PM ladder is young. Most people arrive from core product management, ML engineering or data science, and the levels match the usual PM, senior, group and director steps. After senior, decide whether to stay close to the model or broaden into general product leadership. Close to the model means evaluation, model choice and AI platforms. Few people have a long AI PM record yet, so owning evaluation and cost trade-offs says more than the title.",
    moves: [
      {
        toRole: "Group Product Manager",
        moveType: "step_up",
        typicalTiming:
          "Two or three years into senior PM, with an AI product that shipped and kept its users",
        why: "Group PMs set direction across several PMs' areas. Making build-versus-buy and model-cost calls for your own surface is practice for exactly that judgment.",
        skillsToAdd: [
          "Portfolio prioritization across teams",
          "Coaching and hiring product managers",
          "Product and model cost modeling",
          "Executive roadmap communication",
        ],
        proof:
          "An AI product area you owned through launch and iteration, with quality, adoption and cost numbers side by side.",
      },
      {
        toRole: "Technical Product Manager",
        toSlug: "technical-product-manager",
        moveType: "lateral",
        typicalTiming:
          "Year 2 to 4, for AI PMs who find the platform layer more interesting than the features on top",
        why: "Eval tooling, model gateways and retrieval infrastructure all need PMs whose users are engineers. Those engineers mostly care about evaluation and guardrails, which you've been living in.",
        skillsToAdd: [
          "API and developer platform product design",
          "Model gateway, routing and observability concepts",
          "Evaluation frameworks and LLM observability tools",
          "Reading technical design docs critically",
        ],
        proof:
          "An evaluation, cost or reliability decision you made with engineers, and what it did to quality or spend.",
      },
      {
        toRole: "Product Manager",
        toSlug: "product-manager",
        moveType: "lateral",
        typicalTiming: "Any time, especially if you're joining a company where AI is one feature among many",
        why: "Discovery, prioritization and measuring what shipped work the same way. Teams bolting model-backed features onto an existing product are glad to hire someone who has done it.",
        skillsToAdd: [
          "Domain knowledge for the new product area",
          "Growth and retention analytics",
          "Pricing and packaging decisions",
          "Customer discovery at scale",
        ],
        proof:
          "Outcomes in business terms, like adoption, retention or revenue, next to any model quality metrics.",
      },
      {
        toRole: "AI Engineer",
        toSlug: "ai-engineer",
        moveType: "pivot",
        typicalTiming:
          "Year 1 to 3, mostly PMs with an engineering background who already prototype their own features",
        why: "If you write prompts, build eval sets and hack on model APIs, you're doing part of the engineering job already. The pivot means doing it in production code with tests.",
        skillsToAdd: [
          "Python",
          "Retrieval-augmented generation (embeddings, vector databases)",
          "Evaluation harnesses and regression tests for model output",
          "Production API integration and observability",
        ],
        proof:
          "A working prototype or internal tool you built that real people used, with code you can show.",
      },
      {
        toRole: "Responsible AI Program Manager",
        moveType: "pivot",
        typicalTiming:
          "After 3 to 5 years, usually PMs who ended up owning safety reviews or policy calls on their features",
        why: "Someone has to define guardrails, run red-team reviews and weigh risk against the launch date. You've done it for one feature. The program does it for the whole company.",
        skillsToAdd: [
          "NIST AI Risk Management Framework",
          "EU AI Act and emerging US state AI regulations",
          "AI risk assessments and model cards",
          "Cross-functional program governance",
        ],
        proof:
          "A guardrail, safety review or launch-readiness process you designed and ran for an AI feature that shipped.",
      },
    ],
    faqs: [
      {
        question: "Can a regular product manager become an AI product manager?",
        answer:
          "Yes, and most AI PMs did exactly that. Learn how evaluation works, build a small model-backed prototype yourself, and ask to own an AI feature in your current product. One shipped AI feature with quality numbers beats any course.",
      },
      {
        question: "Can a data scientist or ML engineer become an AI PM?",
        answer:
          "Yes, and technical backgrounds count for more here than in most product roles. What you have to prove is product judgment. Show a problem you chose, users you talked to, and a trade-off you made for the product rather than the model.",
      },
      {
        question: "What comes after AI product manager?",
        answer:
          "Usually group PM, then director of product or head of AI product. Some move to AI platform product roles. A growing number go into responsible AI or AI governance leadership.",
      },
    ],
  },

  "mobile-app-developer": {
    overview:
      "Mobile developers usually commit early to iOS, Android or a cross-platform framework. They grow by owning more of the release pipeline and the app's architecture. Past senior, you can take a staff role owning build systems, modularization and performance for every mobile team. You can also move into engineering management, or add backend skills and go full stack. Small companies may only have a handful of mobile engineers, so the mobile-only ladder there is short.",
    moves: [
      {
        toRole: "Staff Mobile Engineer",
        moveType: "step_up",
        typicalTiming:
          "Usually 7 to 9 years in, once your architecture or tooling decisions change how every mobile team works",
        why: "Build times, release trains and performance budgets are nobody's job until a staff engineer owns them. Fixing one of those for your own team is the audition.",
        skillsToAdd: [
          "Build systems at scale (Gradle, Bazel or Tuist)",
          "App modularization and dependency boundaries",
          "Performance monitoring (Firebase Performance, Sentry, Xcode Instruments)",
          "Writing technical design docs for org-wide changes",
        ],
        proof:
          "A cross-team mobile change you led, like a modularization or build-time project, with numbers such as clean build minutes or crash rate before and after.",
      },
      {
        toRole: "Mobile Engineering Manager",
        moveType: "step_up",
        typicalTiming:
          "After 5 to 7 years, typically after a stint as tech lead for a mobile squad",
        why: "You already juggle release coordination, App Store review surprises and iOS-versus-Android trade-offs for the team. Management adds hiring, career conversations and owning delivery.",
        skillsToAdd: [
          "One-on-ones and career development conversations",
          "Hiring loops for iOS and Android engineers",
          "Release planning and incident management",
          "Delivery metrics and stakeholder reporting",
        ],
        proof:
          "Tech lead experience with specifics, such as releases you coordinated, engineers you mentored and a delivery date you were accountable for.",
      },
      {
        toRole: "Full Stack Developer",
        toSlug: "full-stack-developer",
        moveType: "lateral",
        typicalTiming: "Any time after year 3, and easiest on product teams that own their own APIs",
        why: "Calling APIs, handling auth tokens and designing offline sync puts you one short hop from the server side. React Native developers can carry TypeScript and React straight to the web.",
        skillsToAdd: [
          "Node.js or another backend runtime",
          "REST and GraphQL API design",
          "PostgreSQL",
          "React for web (if you come from native)",
        ],
        proof:
          "A feature where you changed the API as well as the app, or a side project with both halves.",
      },
      {
        toRole: "Application Security Engineer",
        toSlug: "application-security-engineer",
        moveType: "pivot",
        typicalTiming: "After 4 to 6 years, usually developers who already own login or payments",
        why: "Your app runs on phones you don't control, so secure storage, certificate pinning and tamper resistance are already your problem. Security teams struggle to find people who know both mobile platforms well.",
        skillsToAdd: [
          "OWASP MASVS and MASTG",
          "Mobile testing tools (Frida, MobSF, objection)",
          "Threat modeling",
          "Static analysis tools (Semgrep, CodeQL)",
        ],
        proof:
          "Security work that's already on your resume, like an auth flow you hardened or a vulnerability you found and fixed.",
      },
      {
        toRole: "Technical Product Manager",
        toSlug: "technical-product-manager",
        moveType: "pivot",
        typicalTiming: "After 4 to 6 years, often developers who keep rewriting the specs they're handed",
        why: "You see the whole user experience, the app store reviews and the crash data. You also know the release constraints PMs tend to underestimate.",
        skillsToAdd: [
          "Product discovery and user interviews",
          "Product analytics (Amplitude, Mixpanel or Firebase Analytics)",
          "Writing requirements and success metrics",
          "Prioritization frameworks",
        ],
        proof:
          "A feature you proposed or reshaped, with the user or business result, not only how you built it.",
      },
    ],
    faqs: [
      {
        question: "Can an iOS developer switch to Android, or the other way around?",
        answer:
          "Yes, and it's easier than it looks. Swift and Kotlin feel alike, SwiftUI and Jetpack Compose share the same declarative model, and release concepts carry over. Build one complete app on the other platform before you apply.",
      },
      {
        question: "Do mobile developers hit a career ceiling?",
        answer:
          "At small companies, often yes, because the mobile team may be too small to need a staff engineer or manager. Larger companies have their own staff and principal levels for mobile. Most developers raise the ceiling by adding backend skills or joining a bigger mobile team.",
      },
      {
        question: "Should native mobile developers learn Flutter or React Native?",
        answer:
          "It's worth it for the extra openings, especially at startups that want one codebase. Native depth is still the stronger signal for senior roles. Cross-platform apps still need native work for performance, platform features and debugging.",
      },
    ],
  },

  "cloud-engineer": {
    overview:
      "Cloud engineering overlaps so much with DevOps and SRE that hiring managers read your platform and scale before your title. From here most people go one of three ways. Architecture means cloud architect, then principal or enterprise. Platform engineering means building internal tools other engineers use. Or you specialize in cloud security or cost. Infrastructure management exists, but most senior cloud engineers who stay hands-on end up with architect in their title.",
    moves: [
      {
        toRole: "Cloud Architect",
        toSlug: "cloud-architect",
        moveType: "step_up",
        typicalTiming:
          "After 5 to 7 years, once you've designed an environment instead of building from someone else's diagram",
        why: "Account structure, networking, identity and cost belong to the architect. If you built a landing zone or led a migration, you've made those calls at a smaller scale.",
        skillsToAdd: [
          "Multi-account and landing zone design",
          "Well-Architected reviews",
          "Hybrid connectivity and DR design",
          "AWS Certified Solutions Architect Professional or Azure Solutions Architect Expert",
        ],
        proof:
          "An environment or migration you designed, with its scale in accounts or workloads and what happened to reliability and cost.",
      },
      {
        toRole: "Platform Engineer",
        toSlug: "platform-engineer",
        moveType: "lateral",
        typicalTiming: "Year 3 or 4, especially if other people already reuse your Terraform modules",
        why: "Your reusable modules and account vending are the start of an internal platform. Platform teams turn that into a self-service product and treat developers as the customers.",
        skillsToAdd: [
          "Kubernetes and CKA",
          "Internal developer portals (Backstage)",
          "GitOps with Argo CD or Flux",
          "Golden-path templates and developer experience metrics",
        ],
        proof:
          "Infrastructure you packaged so other teams could use it without asking you, and how many teams did.",
      },
      {
        toRole: "Cloud Security Engineer",
        toSlug: "cloud-security-engineer",
        moveType: "lateral",
        typicalTiming: "After 3 to 5 years, often after owning IAM or network design across many accounts",
        why: "Most cloud security is configuration. You've been setting IAM, network exposure, encryption and logging for years, and you know which defaults are unsafe.",
        skillsToAdd: [
          "Policy as code (OPA, AWS SCPs, Azure Policy)",
          "CSPM and CNAPP tools such as Wiz or Prisma Cloud",
          "Cloud logging and detection (CloudTrail, GuardDuty, Microsoft Defender for Cloud)",
          "AWS Certified Security Specialty or CCSP",
        ],
        proof:
          "Guardrails or security controls you rolled out across accounts, with findings reduced or coverage gained.",
      },
      {
        toRole: "Site Reliability Engineer",
        toSlug: "site-reliability-engineer",
        moveType: "lateral",
        typicalTiming: "Year 2 to 4, particularly if you already carry the pager for production",
        why: "Site reliability engineering cares less about standing infrastructure up and more about keeping services healthy on it. Knowing failure domains, autoscaling and managed-service quirks is the groundwork.",
        skillsToAdd: [
          "SLOs and error budgets",
          "Observability (Prometheus, Grafana, OpenTelemetry)",
          "Incident command and blameless postmortems",
          "Go or Python for reliability tooling",
        ],
        proof:
          "Incidents you handled and one reliability fix you made, with uptime or latency numbers.",
      },
      {
        toRole: "Solutions Architect",
        toSlug: "solutions-architect",
        moveType: "pivot",
        typicalTiming: "After 4 to 6 years, usually engineers who like explaining a design as much as building it",
        why: "Cloud providers, consultancies and SaaS vendors need architects who've run real workloads. You'll whiteboard more and carry the pager less.",
        skillsToAdd: [
          "Customer discovery and requirements elicitation",
          "Presenting architecture to non-technical buyers",
          "Proof-of-concept delivery",
          "Cost estimation and business case writing",
        ],
        proof:
          "Designs you explained to people outside engineering, and migrations or builds with a clear business outcome attached.",
      },
    ],
    faqs: [
      {
        question: "Can a system administrator become a cloud engineer?",
        answer:
          "Yes, it's one of the most common routes in. Linux, networking and troubleshooting carry over directly. Pick one cloud, earn its associate-level certification, learn Terraform, and rebuild something you run today as code.",
      },
      {
        question: "What comes after cloud engineer?",
        answer:
          "Senior cloud engineer, then cloud architect, is the most common path. Others move into platform engineering, SRE or cloud security. A smaller group goes into solutions architecture or infrastructure management.",
      },
      {
        question: "Is FinOps a real career path for cloud engineers?",
        answer:
          "Yes, at companies with large cloud bills, where FinOps engineers and analysts sit between engineering and finance. The FinOps Certified Practitioner cert is the usual starting point. Cost cuts you can put numbers on are what get you hired.",
      },
    ],
  },

  "ai-engineer": {
    overview:
      "Nobody has finished writing the AI engineer ladder yet. Most AI engineers came from software engineering, so levels usually follow the standard senior, staff and principal track. The real choice is where to go deep. Training and fine-tuning lead toward ML engineering, serving and tooling toward AI infrastructure, and customer work toward product or forward deployed roles. Staff scope usually comes from owning evaluation or retrieval systems several teams depend on.",
    moves: [
      {
        toRole: "Staff AI Engineer",
        moveType: "step_up",
        typicalTiming:
          "About 6 to 8 years into engineering overall, with at least two AI systems running in production",
        why: "If other teams call your eval harness, retrieval service or model gateway, you're already working at staff scope. The title follows once you set those patterns on purpose.",
        skillsToAdd: [
          "Shared evaluation infrastructure and quality gates in CI",
          "Model routing and cost controls across teams",
          "Technical design reviews across organizations",
          "LLM observability (Langfuse, Arize Phoenix or similar)",
        ],
        proof:
          "An AI component other teams adopted, with how many use it and what it did to quality, latency or cost.",
      },
      {
        toRole: "Machine Learning Engineer",
        toSlug: "machine-learning-engineer",
        moveType: "lateral",
        typicalTiming:
          "Year 2 to 4, usually when prompting and retrieval stop being enough and fine-tuning is on the table",
        why: "You already build eval sets and diagnose model failures. The missing piece is training, plus the judgment to know when a small fine-tuned model beats a big prompted one.",
        skillsToAdd: [
          "PyTorch",
          "Fine-tuning methods (LoRA, QLoRA)",
          "Training data pipelines and labeling",
          "Experiment tracking with MLflow or Weights & Biases",
        ],
        proof:
          "A fine-tuned or trained model you tested against a prompted baseline, with the comparison numbers.",
      },
      {
        toRole: "MLOps Engineer",
        toSlug: "mlops-engineer",
        moveType: "lateral",
        typicalTiming: "After 2 to 4 years, often engineers who got stuck owning deployment and monitoring and liked it",
        why: "Serving models, versioning them and watching output quality in production are MLOps problems. If you built that plumbing for your own features, you've done the job.",
        skillsToAdd: [
          "Model serving (vLLM, Triton or KServe)",
          "Kubernetes and GPU scheduling",
          "Model registries and versioning",
          "Production monitoring for drift and output quality",
        ],
        proof:
          "A model deployment you run in production, with latency, throughput or cost figures.",
      },
      {
        toRole: "Forward Deployed Engineer",
        moveType: "lateral",
        typicalTiming: "Year 2 to 5, often engineers who want to be in the room with customers",
        why: "Same retrieval, evaluation and integration work, done inside a customer's environment. The data, the permissions and the deadline all belong to someone else.",
        skillsToAdd: [
          "Enterprise data integration (SSO, data connectors, permissions-aware retrieval)",
          "Scoping and requirements work with customers",
          "Rapid prototyping under deadlines",
          "Security and compliance reviews for deployments",
        ],
        proof:
          "An AI system you built for users outside your own team, with adoption or quality results.",
      },
      {
        toRole: "AI Product Manager",
        toSlug: "ai-product-manager",
        moveType: "pivot",
        typicalTiming: "After 3 to 5 years, usually engineers who already have strong opinions about what gets built",
        why: "Most AI PMs have to learn evaluation, failure modes and model costs from scratch. You'd be learning the other half, which is deciding what to build and for whom.",
        skillsToAdd: [
          "User research and problem framing",
          "Writing product requirements and success metrics",
          "Prioritization and roadmapping",
          "Unit economics of model-backed features",
        ],
        proof:
          "A feature where user feedback led you to change scope or direction, and what happened after.",
      },
    ],
    faqs: [
      {
        question: "Can a software engineer become an AI engineer?",
        answer:
          "Yes, most AI engineers are software engineers who added model skills. Build a retrieval-augmented app with a real evaluation set, measure quality and cost, and put it in front of actual users. That one project covers most of what hiring managers screen for.",
      },
      {
        question: "Is AI engineer a stable career or a hype title?",
        answer:
          "The title may change, but building reliable products on top of models isn't going away. Evaluation, retrieval design and production engineering are the lasting skills. They'll carry over whatever the job is called in a few years.",
      },
      {
        question: "What comes after senior AI engineer?",
        answer:
          "Staff and then principal AI engineer on the individual contributor track, or engineering manager for an AI team. Some go deeper into ML engineering and training. Others move into AI platform or forward deployed roles.",
      },
    ],
  },

  "cybersecurity-engineer": {
    overview:
      "Security engineers usually settle into one area after a few years, such as cloud, application, detection, identity or network. That choice shapes the next decade more than any title. Past senior, the individual contributor road runs to principal engineer or security architect. The management road runs to security engineering manager, then head of security. Engineers who write production-quality code get the most options, because modern security teams build a lot of their own tools.",
    moves: [
      {
        toRole: "Security Architect",
        toSlug: "security-architect",
        moveType: "step_up",
        typicalTiming:
          "After 7 to 9 years, with real depth in at least two security areas",
        why: "Design reviews go better with someone who has deployed, tuned and broken controls in production. Architects decide which controls a system gets and which risks the business accepts.",
        skillsToAdd: [
          "Threat modeling for system designs",
          "Security reference architectures and standards writing",
          "Risk acceptance and exception processes",
          "CISSP or SABSA",
        ],
        proof:
          "A security design you led that other teams adopted, and what it did to risk or review time.",
      },
      {
        toRole: "Security Engineering Manager",
        moveType: "step_up",
        typicalTiming: "Around 6 to 8 years, often right after leading something like an EDR rollout or a SIEM migration",
        why: "The job is balancing incident load against project work while you hire. Coordinating across teams and mentoring juniors is the practice run.",
        skillsToAdd: [
          "Hiring and performance management",
          "Security roadmap planning and budgeting",
          "Metrics reporting to leadership",
          "CISM",
        ],
        proof:
          "A multi-team security program you led with coverage or risk results, plus engineers you mentored and how they grew.",
      },
      {
        toRole: "Application Security Engineer",
        toSlug: "application-security-engineer",
        moveType: "lateral",
        typicalTiming: "Year 3 to 5, easiest if you script daily and read other people's code comfortably",
        why: "AppSec moves your risk thinking into how software gets built and shipped. Your automation habits slot straight into code scanning, dependency checks and pipeline hardening.",
        skillsToAdd: [
          "Secure code review",
          "SAST and SCA tools (Semgrep, CodeQL, Snyk)",
          "OWASP Top 10 and OWASP ASVS",
          "Threat modeling with developers",
        ],
        proof:
          "Security automation you built into a CI pipeline, or vulnerabilities you found in code and helped developers fix.",
      },
      {
        toRole: "Penetration Tester",
        toSlug: "penetration-tester",
        moveType: "lateral",
        typicalTiming: "After 3 to 5 years, following months of steady lab practice",
        why: "Engineers learn where defenses are usually weak by setting them up. Offense means testing those same controls from the attacker's side.",
        skillsToAdd: [
          "Burp Suite and Metasploit",
          "Active Directory and cloud attack techniques",
          "Report writing with clear remediation steps",
          "OSCP or GIAC GPEN",
        ],
        proof:
          "OSCP or equivalent, plus documented lab work or authorized internal testing you did.",
      },
      {
        toRole: "Product Manager",
        toSlug: "product-manager",
        moveType: "pivot",
        typicalTiming: "After 5 to 7 years, mostly into security product companies",
        why: "Security tools are bought and run by people like you. Security vendors hire PMs who know how those tools fail on an ordinary Tuesday.",
        skillsToAdd: [
          "Customer discovery interviews",
          "Writing product requirements and success metrics",
          "Competitive analysis of security tools",
          "Roadmap prioritization",
        ],
        proof:
          "Tool evaluations or vendor selections you led, and internal tooling you designed around what its users needed.",
      },
    ],
    faqs: [
      {
        question: "Can a security analyst become a cybersecurity engineer?",
        answer:
          "Yes, it's the most common route in. Automate your own queue with Python or a SOAR platform, take on detection tuning, and volunteer for tool rollouts. Engineering interviews ask about things you built, not alerts you closed.",
      },
      {
        question: "Which cybersecurity specialization has the most room to grow?",
        answer:
          "Cloud and application security, because that's where companies are building. Detection engineering is growing too as teams manage detections as code. Pick the one closest to your current work, since depth beats breadth for senior roles.",
      },
      {
        question: "Do cybersecurity engineers have to go into management to earn senior pay?",
        answer:
          "Not at companies with a real individual contributor track. There, principal engineers and architects are leveled alongside managers. At smaller companies the senior jobs are more often managerial, which is one reason experienced engineers move to bigger security teams.",
      },
    ],
  },

  "security-analyst": {
    overview:
      "Security analyst is the most common way into security, and hardly anyone works the alert queue for a whole career. The first real choice comes around Tier 2. You can go deeper on investigation through incident response, threat intel or hunting. You can start building as a security or detection engineer. Or you can head toward risk and compliance. The analysts who move up fastest tend to be the ones who automated part of their own queue.",
    moves: [
      {
        toRole: "Incident Responder",
        moveType: "step_up",
        typicalTiming: "Usually 2 to 4 years into a SOC, once you've run an investigation from alert to closure",
        why: "Incident response finishes the cases you escalate, from scoping and containment to forensics and the final report. If you already work cases past triage, you're halfway there.",
        skillsToAdd: [
          "Digital forensics (Velociraptor, KAPE, Volatility)",
          "EDR investigation in tools such as CrowdStrike Falcon or Microsoft Defender for Endpoint",
          "Incident documentation and timeline building",
          "GIAC GCIH or GCFA",
        ],
        proof:
          "Investigations you led beyond triage, each with the scope, the containment steps you took and how it ended.",
      },
      {
        toRole: "Security Operations Engineer",
        toSlug: "security-operations-engineer",
        moveType: "step_up",
        typicalTiming: "After 2 to 4 years, usually once you've started scripting away repetitive triage",
        why: "You know which alerts waste time and which lookups you keep doing by hand. That's the requirements list for the detections and playbooks security operations engineers build.",
        skillsToAdd: [
          "Python for automation",
          "SOAR playbooks (Splunk SOAR, Microsoft Sentinel playbooks or Tines)",
          "Detection-as-code with Sigma",
          "SIEM engineering: log onboarding and parsing",
        ],
        proof:
          "An automation or detection you built, with the analyst hours saved or false positives removed.",
      },
      {
        toRole: "Threat Intelligence Analyst",
        moveType: "lateral",
        typicalTiming: "Year 2 or 3, usually analysts who'd rather research and write than race the queue",
        why: "You see attacker indicators and techniques in alerts every shift. Threat intel asks who's behind them and what they'll do next, and your view of real attacks keeps the research honest.",
        skillsToAdd: [
          "MITRE ATT&CK mapping and adversary profiling",
          "Threat intelligence platforms (MISP, OpenCTI)",
          "Intelligence writing for technical and executive readers",
          "GIAC GCTI",
        ],
        proof:
          "Intelligence you produced that changed something, like a campaign write-up that led to new detection rules.",
      },
      {
        toRole: "GRC Analyst",
        moveType: "pivot",
        typicalTiming: "Year 1 to 3, often analysts who want regular hours and more time on policy",
        why: "Plenty of GRC (governance, risk and compliance) people know the frameworks but have never watched a control fail. You have, and it makes your control testing hard to argue with.",
        skillsToAdd: [
          "NIST CSF, NIST 800-53 and ISO 27001",
          "SOC 2 audit preparation",
          "Risk assessment and vendor risk reviews",
          "CISA or CRISC over time",
        ],
        proof:
          "Control evidence or audit support you contributed, plus documentation or policy you owned.",
      },
      {
        toRole: "Penetration Tester",
        toSlug: "penetration-tester",
        moveType: "pivot",
        typicalTiming: "After 2 to 4 years, plus steady hands-on lab time outside work",
        why: "Every shift shows you what gets caught and what slips through. On offense, that tells you where to push.",
        skillsToAdd: [
          "Nmap, Burp Suite and Metasploit",
          "Active Directory attack techniques",
          "Hack The Box or TryHackMe lab progression",
          "OSCP",
        ],
        proof:
          "OSCP or equivalent, plus lab write-ups or a public profile of rooms and reports.",
      },
    ],
    faqs: [
      {
        question: "Is security analyst an entry-level job?",
        answer:
          "Tier 1 SOC analyst is the closest thing security has to an entry-level job. Most postings still expect some IT background, like help desk, networking or sysadmin work, plus a cert such as CompTIA Security+. Senior analyst titles are not entry level.",
      },
      {
        question: "Should a security analyst move into engineering or incident response?",
        answer:
          "Pick engineering if you like building and automating, and incident response if the investigation itself is the fun part. Both are common next steps. If you can't decide, automate something in your current queue and notice which part you enjoyed.",
      },
      {
        question: "Do I need a degree to move past a Tier 2 analyst role?",
        answer:
          "Usually not. Security hiring leans heavily on proven skills and certifications, and investigations or detections you can walk through in detail count for more. Some government and defense roles do require a degree or a clearance.",
      },
    ],
  },

  "business-analyst": {
    overview:
      "Business analyst careers move from writing down requirements to shaping the solution. The title ladder of BA, senior and lead is shorter than the list of sideways exits. The usual exits are product owner or product manager, where you make the priority calls you used to inform. BI and data analysis are next, where the work gets more quantitative. Solutions architecture suits people who like the technical design, and consulting suits people who like framing the problem.",
    moves: [
      {
        toRole: "Product Owner",
        moveType: "lateral",
        typicalTiming: "After 2 to 4 years, often without leaving your current scrum team",
        why: "The backlog you help refine becomes yours to prioritize. You stop recommending and start choosing.",
        skillsToAdd: [
          "Backlog prioritization (WSJF, MoSCoW)",
          "Writing acceptance criteria and user stories at scale",
          "Stakeholder trade-off conversations",
          "CSPO or PSPO I",
        ],
        proof:
          "A backlog or release you shaped, the scope calls you made, and what they produced.",
      },
      {
        toRole: "Product Manager",
        toSlug: "product-manager",
        moveType: "step_up",
        typicalTiming: "Year 3 to 6, usually by way of product owner or a BA seat on a product team",
        why: "A PM answers for strategy, the market and whether the thing worked. Knowing the users, processes and constraints cold is the half you bring.",
        skillsToAdd: [
          "Product discovery and customer interviews",
          "Product analytics (Amplitude, Mixpanel or Pendo)",
          "Roadmapping and prioritization frameworks",
          "Defining success metrics before build",
        ],
        proof:
          "A problem you reframed and the business result of the solution you argued for. Requirements you wrote don't count on their own.",
      },
      {
        toRole: "Business Intelligence Analyst",
        toSlug: "business-intelligence-analyst",
        moveType: "lateral",
        typicalTiming: "After 1 to 3 years, typically BAs who got tired of waiting for someone else to pull the data",
        why: "You know which business questions matter and where in the process the data comes from. BI gives you the SQL and dashboards to answer them yourself.",
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
        typicalTiming: "After 5 to 8 years, most often on Salesforce, ServiceNow or an ERP platform",
        why: "On configurable platforms, deciding how a requirement maps to platform features is already solution design. Architects own that mapping, plus the integrations and data model around it.",
        skillsToAdd: [
          "Platform architecture certifications (Salesforce Application Architect or ServiceNow CTA path)",
          "Integration patterns and APIs",
          "Data modeling",
          "Solution design documents",
        ],
        proof:
          "A platform solution you designed rather than only specified, with the integrations and scale involved.",
      },
      {
        toRole: "Management Consultant",
        moveType: "pivot",
        typicalTiming: "After 3 to 5 years, often with an MBA or deep knowledge of one industry",
        why: "Mapping processes, getting stakeholders to agree and structuring messy analysis is the consultant's toolkit too. Consulting aims it at bigger problems and puts you in front of executives.",
        skillsToAdd: [
          "Hypothesis-driven problem solving",
          "Executive slide writing",
          "Financial modeling basics",
          "Industry-specific domain depth",
        ],
        proof:
          "A process or operational change you drove, with the dollars or hours it saved.",
      },
    ],
    faqs: [
      {
        question: "Is business analyst a good path to product management?",
        answer:
          "Yes, it's one of the most common routes into product. BAs already learn users, processes and requirements. Get a BA role on a product team, take on backlog ownership, and show outcomes rather than documents.",
      },
      {
        question: "What comes after senior business analyst?",
        answer:
          "Lead BA or analysis practice lead, if you want to stay in the discipline. Most senior BAs move sideways instead. Product owner, product manager, solutions architect, program manager and consulting are the usual landing spots.",
      },
      {
        question: "Should a business analyst learn SQL?",
        answer:
          "Yes. It lets you check requirements against real data and answer your own questions, and it opens the door to BI and data analyst roles. Joins, filters and aggregates are enough to start.",
      },
    ],
  },

  "ui-designer": {
    overview:
      "UI designer is a less common title in the US than it used to be. Many companies now hire product designers to cover both interface and experience work. So most UI designers grow by broadening into product design, or by going deeper into design systems, where visual craft becomes shared infrastructure. Motion is another direction. So is front-end development, for designers who like building what they draw.",
    moves: [
      {
        toRole: "Product Designer",
        toSlug: "product-designer",
        moveType: "step_up",
        typicalTiming: "After 2 to 4 years, once you're regularly in the room before anything is visual",
        why: "Product designers own the problem, not only the pixels. If you already question requirements, sketch flows and sit in on research, you're partway there.",
        skillsToAdd: [
          "User research and usability testing",
          "User flows and information architecture",
          "Framing problems with product and engineering",
          "Measuring design outcomes with product analytics",
        ],
        proof:
          "A case study that opens with a user problem instead of a screen and ends with a measured result.",
      },
      {
        toRole: "Design Systems Designer",
        moveType: "lateral",
        typicalTiming: "Year 3 to 5, usually after you've built or extended a component library",
        why: "Every spacing, type and color decision you've argued over becomes a component other designers reuse. It's UI craft at the scale of a whole company.",
        skillsToAdd: [
          "Figma variables, variants and component architecture",
          "Design tokens and token pipelines (Tokens Studio, Style Dictionary)",
          "Documentation and contribution models",
          "WCAG 2.2 accessibility requirements",
        ],
        proof:
          "A component library or token system you built or extended, and how many teams adopted it.",
      },
      {
        toRole: "Motion Designer",
        toSlug: "motion-designer",
        moveType: "lateral",
        typicalTiming: "Any time, and most often for UI designers who already prototype interactions",
        why: "Good product motion makes hierarchy and state changes easier to follow. Your UI eye decides where motion helps and where it's noise.",
        skillsToAdd: [
          "After Effects",
          "Rive or Lottie for production animation",
          "Principles of easing and timing",
          "Prototyping in ProtoPie or Figma Smart Animate",
        ],
        proof:
          "Motion that shipped in a real product, or a reel of interface animations with a line on what each one clarifies.",
      },
      {
        toRole: "Frontend Developer",
        toSlug: "frontend-developer",
        moveType: "pivot",
        typicalTiming: "After 2 to 4 years, usually designers who already write some CSS",
        why: "Front-end teams value someone who notices when the padding is off by 4px. A designer who can build their own designs ends the handoff fights every team has.",
        skillsToAdd: [
          "HTML, CSS and modern layout (Flexbox, Grid)",
          "JavaScript and TypeScript",
          "React",
          "Tailwind CSS or a CSS-in-JS approach",
        ],
        proof:
          "Real code in a public repository, ideally a site or components built from a design you made.",
      },
      {
        toRole: "Brand Designer",
        moveType: "pivot",
        typicalTiming: "Year 2 to 4, for designers who'd rather work on identity than product flows",
        why: "Type, color and composition are the core of brand work too. You give up interface constraints and get identity systems and campaigns instead.",
        skillsToAdd: [
          "Adobe Illustrator and InDesign",
          "Logo and identity system design",
          "Brand guidelines",
          "Campaign and marketing design",
        ],
        proof:
          "A portfolio with identity or marketing work in it, not only product screens.",
      },
    ],
    faqs: [
      {
        question: "Is UI design a dying job title?",
        answer:
          "The title is less common in US tech, but UI skill isn't declining. Many companies hire product designers instead, and strong visual craft is exactly what those teams struggle to find. Add research and flow work to your portfolio so you qualify for product designer roles.",
      },
      {
        question: "Can a graphic designer become a UI designer?",
        answer:
          "Yes. Typography, color and composition transfer directly. The gaps are interface skills like responsive layout, interaction states, component systems and accessibility. Redesign a real app flow in Figma and show every state, not only the hero screen.",
      },
      {
        question: "What is a design engineer, and can UI designers become one?",
        answer:
          "A design engineer works between design and front-end, building production UI and prototypes with close attention to detail. UI designers who learn React and CSS well are natural candidates. More product-focused companies are hiring for it.",
      },
    ],
  },

  "solutions-architect": {
    overview:
      "One title, two jobs. Delivery architects design systems inside companies and consultancies. Pre-sales architects at vendors design solutions that win deals and then have to work. In both, the individual contributor route leads toward principal or enterprise architect. The leadership route leads to running an architecture practice or a solutions team. Pre-sales has extra exits into product management and customer-facing leadership, because you spend your days hearing what customers actually need.",
    moves: [
      {
        toRole: "Enterprise Architect",
        toSlug: "enterprise-architect",
        moveType: "step_up",
        typicalTiming: "About 8 to 10 years into your career, once your designs span several programs or business units",
        why: "If you already negotiate platform and integration choices across teams, you're working at the edge of enterprise architecture. The step up means setting the standards and roadmap everyone else builds within.",
        skillsToAdd: [
          "TOGAF",
          "Capability mapping and portfolio rationalization",
          "Technology roadmapping and governance",
          "ArchiMate",
        ],
        proof:
          "Architecture decisions that shaped several programs or platform choices, with the business outcome of each.",
      },
      {
        toRole: "Director of Solutions Architecture",
        moveType: "step_up",
        typicalTiming: "After 3 to 5 years as a senior architect, often once you're mentoring newer architects",
        why: "The director hires the architects, decides who covers which accounts and owns the quality of their designs. Reviewing peers' work and coaching juniors is the rehearsal.",
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
        typicalTiming: "Any time, and most natural after a run of cloud-heavy engagements",
        why: "Most solutions you design already run on a cloud. Cloud architecture trades breadth for depth in one platform's landing zones, networking and cost.",
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
        typicalTiming: "After 5 to 8 years, usually delivery-side architects who miss being close to the code",
        why: "Software architects care about the inside of one system more than how systems fit together. With an engineering background, you already think in services, data and interfaces.",
        skillsToAdd: [
          "Domain-driven design",
          "Event-driven architecture (Kafka)",
          "Code-level design reviews",
          "Architecture decision records",
        ],
        proof:
          "Recent hands-on engineering and a system whose internal design was yours.",
      },
      {
        toRole: "Product Manager",
        toSlug: "product-manager",
        moveType: "pivot",
        typicalTiming: "After 3 to 6 years, and far more often from pre-sales than delivery",
        why: "Pre-sales architects hear objections, feature requests and ugly workarounds all week. Product teams hire for that.",
        skillsToAdd: [
          "Product discovery and prioritization",
          "Roadmapping",
          "Writing requirements and success metrics",
          "Competitive and market analysis",
        ],
        proof:
          "Customer feedback you turned into product changes, or deals won because you spotted a gap.",
      },
    ],
    faqs: [
      {
        question: "Can a software engineer become a solutions architect?",
        answer:
          "Yes, most solutions architects started as engineers. The gap is communication and scope, not technical depth. You need to gather requirements, explain trade-offs to non-engineers and design across systems. Start with design docs and customer-facing work in your current role.",
      },
      {
        question: "Is pre-sales solutions architecture a good career move?",
        answer:
          "It is if you like customer conversations and variety more than long build cycles. You trade deep ownership of one system for breadth across many customers. Part of your pay is often tied to sales results.",
      },
      {
        question: "What comes after solutions architect?",
        answer:
          "Principal or enterprise architect on the individual contributor track, or director of solutions architecture on the leadership track. Pre-sales architects also move into product management and field CTO roles.",
      },
    ],
  },
};
