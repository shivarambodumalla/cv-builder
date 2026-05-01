export interface TemplateLeafData {
  leafSlug: string;
  templateSlug: string;
  displayName: string;
  headline: string;
  description: string;
  whoFor: string[];
  features: string[];
  tier: "free" | "pro";
  imgPath: string | null;
  faqs: { q: string; a: string }[];
}

export interface TemplateCategoryData {
  slug: string;
  label: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  templates: TemplateLeafData[];
}

export const TEMPLATE_CATEGORIES: TemplateCategoryData[] = [
  {
    slug: "software-engineer",
    label: "Software Engineer",
    metaTitle: "Software Engineer Resume Templates — ATS-Safe & Free | CVEdge",
    metaDescription:
      "Free resume templates for software engineers. Single-column and two-column layouts that score 90+ on ATS. Works for L1 to staff engineer, FAANG to startup.",
    h1: "Software Engineer Resume Templates",
    intro:
      "Software engineering roles attract hundreds of applicants per position. The first filter isn't human — it's the ATS. These templates are structured specifically for SWE roles: single-column layouts that parse cleanly through Greenhouse, Workday, and Lever; section order that puts experience above the fold; and formatting that lets quantified achievements speak clearly. Pick the template that matches your seniority and apply with confidence.",
    templates: [
      {
        leafSlug: "classic-cv",
        templateSlug: "classic",
        displayName: "Classic Resume for Software Engineers",
        headline: "The safe bet. Scores 95+ on ATS. Works for every company from startup to FAANG.",
        description:
          "The Classic template has been the most downloaded resume on CVEdge because it eliminates every ATS risk. Single column, standard headings, no graphics — it parses cleanly through every major ATS system including Greenhouse, Workday, Lever, and iCIMS.\n\nFor software engineers, this is your default unless you have a reason to deviate. The layout places your Experience section immediately after the header, so hiring managers see your most recent role within the first three seconds. Bullet points align perfectly for metric-led achievements: \"Reduced API latency by 40% across 10M daily requests.\"\n\nClassic works at every career stage. Junior engineers use it to let their projects and education compete on equal footing. Senior engineers use it because a clean, confident layout signals focus rather than decoration. Staff and principal engineers pair it with strong leadership language in the summary.\n\nCVEdge's AI bullet rewriter and Fix All ATS tool are optimised for Classic's structure — run Fix All after uploading and watch your ATS score jump.",
        whoFor: [
          "SWEs applying to FAANG and big tech companies",
          "Engineers updating a resume after 3+ years",
          "Junior engineers with projects and internships",
          "Anyone unsure which template to pick",
        ],
        features: [
          "Passes all ATS filters including Greenhouse, Workday, and Lever",
          "Single-column layout puts Experience above the fold",
          "Standard headings (Experience, Education, Skills) ATS parsers expect",
          "Works perfectly with CVEdge's AI bullet rewriter",
          "Clean PDF export — no formatting surprises",
        ],
        tier: "free",
        imgPath: "/img/templates/classic.jpg",
        faqs: [
          {
            q: "Is the Classic template ATS-friendly for software engineering roles?",
            a: "Yes — single-column layout, standard fonts (Geist Sans), and no graphics make it parse cleanly through all major ATS systems. Scores 95+ on CVEdge's ATS analyser for well-written content.",
          },
          {
            q: "Should a software engineer use Classic or Executive?",
            a: "Classic for L1–L5 / junior to mid-senior. Executive for L5+ / staff, principal, or engineering manager roles where seniority and leadership emphasis matter.",
          },
          {
            q: "Can I add a photo to the Classic template?",
            a: "Classic supports an optional avatar. For US/UK software engineering roles, it's generally recommended to omit the photo — ATS systems and US recruiting norms favour photo-free CVs.",
          },
        ],
      },
      {
        leafSlug: "sharp-cv",
        templateSlug: "sharp",
        displayName: "Sharp Resume for Software Engineers",
        headline: "Bold section dividers, modern look. Passes ATS while standing out from generic formats.",
        description:
          "Sharp adds visual confidence to your software engineering resume without sacrificing ATS safety. Bold section headings with clear horizontal rules create a hierarchy that recruiters scan in under six seconds. The typography is modern but structured — a clear step up from basic formats without the parsing risks of graphic-heavy layouts.\n\nFor software engineers, Sharp works particularly well mid-career (3–8 years) when you have enough experience to fill a well-structured single-column page and want your layout to signal you're current, not using the same template from 2015.\n\nSection order is identical to Classic — Experience leads, followed by Skills and Education — so ATS parsers see exactly what they expect. The visual difference is for human reviewers, not machines.\n\nPair Sharp with CVEdge's ATS analyser to score your content before you apply. The template's strong heading structure means the AI can precisely identify which section each bullet belongs to.",
        whoFor: [
          "Mid-career engineers (3–8 years experience)",
          "Engineers who want a modern look without design risk",
          "SWEs applying at growth-stage startups and scale-ups",
          "Developers who find Classic too plain",
        ],
        features: [
          "Bold section dividers create fast visual scanning",
          "Single column — full ATS compatibility maintained",
          "Modern typography that reads well on screen and print",
          "Configurable accent colour to match your personal brand",
          "Skills section supports both text lists and tagged chips",
        ],
        tier: "free",
        imgPath: "/img/templates/sharp.jpg",
        faqs: [
          {
            q: "Does the Sharp template pass ATS filters?",
            a: "Yes. Despite its bolder visual style, Sharp is single-column with standard heading tags and no graphics — it passes all major ATS filters including Greenhouse and Workday.",
          },
          {
            q: "Is Sharp better than Classic for software engineers?",
            a: "Sharp is better when you want a more modern aesthetic for startups or design-forward companies. Classic is safer for highly automated screening pipelines at large enterprises and FAANG.",
          },
        ],
      },
      {
        leafSlug: "minimal-cv",
        templateSlug: "minimal",
        displayName: "Minimal Resume for Software Engineers",
        headline: "Maximum whitespace. Your code speaks louder than your template.",
        description:
          "Minimal is for engineers who believe the work should speak for itself. Maximum whitespace, restrained typography, no visual decoration — just your experience laid out with perfect clarity.\n\nThis isn't a compromise. Minimal consistently scores highest on readability audits. Hiring managers at Google, Stripe, and Notion have noted that minimal resumes signal confidence: the candidate isn't dressing up their experience, they're presenting it directly.\n\nFor software engineers, Minimal works best when your experience is genuinely strong — 4+ years with measurable impact. If you're early in your career, the whitespace can feel sparse. For senior engineers, staff engineers, and engineers transitioning into technical leadership, Minimal communicates exactly the right thing: focus over flash.\n\nCVEdge's AI rewrites work exceptionally well here because every bullet has room to breathe. The contrast between weak and strong bullets is immediately visible, motivating you to fix each one.",
        whoFor: [
          "Senior engineers (5+ years) with strong impact metrics",
          "Engineers applying to companies that value craft",
          "Developers transitioning into technical leadership",
          "Anyone who finds most templates visually noisy",
        ],
        features: [
          "Maximum whitespace — highest readability scores",
          "Zero decoration — every element earns its place",
          "Single column with perfect ATS compatibility",
          "Works beautifully in both light and dark PDF modes",
          "Section spacing highlights strong bullets",
        ],
        tier: "free",
        imgPath: "/img/templates/minimal.jpg",
        faqs: [
          {
            q: "Will a minimal resume look empty if I have less experience?",
            a: "Minimal works best with 4+ years of solid experience. If you have 1–3 years, consider Classic or Sharp instead — they fill space better with section structure.",
          },
          {
            q: "Is Minimal ATS-safe for software engineering roles?",
            a: "Yes. Minimal is single-column with standard heading names and no images. It parses cleanly through all major ATS systems.",
          },
        ],
      },
      {
        leafSlug: "executive-cv",
        templateSlug: "executive",
        displayName: "Executive Resume for Senior Engineers",
        headline: "Premium layout for staff, principal, and engineering manager roles.",
        description:
          "Executive is designed for engineers where seniority needs to come through in the format itself. Premium spacing, refined typography hierarchy, and a layout that lets a strong summary lead — this template signals leadership before a recruiter reads a single bullet.\n\nFor staff engineers, principal engineers, and engineering managers, Executive provides the visual weight that matches the level of impact you're describing. When you write \"Led architectural migration of monolith to microservices serving 50M users\" it deserves a template that matches the gravitas.\n\nThe layout still passes all ATS filters — single column, standard headings — but the visual presentation is unmistakably senior. Companies recruiting at L6+ and director levels respond well to Executive because it aligns with the confidence they expect at that level.\n\nCombine Executive with CVEdge's Fix All ATS to ensure your bullets have the metric-led structure that senior roles demand. A weak bullet in an executive layout stands out more — fix every one.",
        whoFor: [
          "Staff and principal engineers (L6/L7+)",
          "Engineering managers and directors",
          "Senior engineers transitioning to leadership",
          "Engineers with 8+ years of progressive responsibility",
        ],
        features: [
          "Premium spacing and typography hierarchy for senior roles",
          "Summary section prominently positioned — leadership reads immediately",
          "Single column — full ATS compatibility",
          "Refined section headings that communicate seniority",
          "Supports certifications, publications, and patents cleanly",
        ],
        tier: "free",
        imgPath: "/img/templates/executive.jpg",
        faqs: [
          {
            q: "When should I use Executive vs Classic for engineering roles?",
            a: "Use Executive for L5+ (senior), staff, principal, or engineering manager positions. Classic suits L1–L4. Executive's premium feel matches the seniority level these roles require.",
          },
          {
            q: "Is Executive template ATS-compatible?",
            a: "Yes — despite the premium look, Executive is single-column with standard headings. It scores identically to Classic on ATS parsers.",
          },
        ],
      },
      {
        leafSlug: "two-column-cv",
        templateSlug: "two-column",
        displayName: "Horizon (Two-Column) Resume for Software Engineers",
        headline: "Full-width header, dense two-column body. Pack maximum content into one page.",
        description:
          "Horizon gives software engineers the best of both worlds: a full-width header that carries your name and contact details prominently, then a two-column body that packs experience and skills into one highly readable page.\n\nThis is the go-to format when you have 5+ years of experience and a long skills section — the two-column body lets you show both depth of experience on the left and a structured skills inventory on the right without spilling onto page two.\n\nFor software engineers with broad skill stacks (cloud, languages, frameworks, tools), Horizon's skills column makes your technical breadth immediately visible. Recruiters scanning for specific technologies find them faster than in a buried skills list at the bottom of a single-column resume.\n\nHorizon scores well on ATS — the full-width header and clear column structure parse correctly through major systems. CVEdge's ATS analyser will flag any issues specific to your content.",
        whoFor: [
          "Engineers with 5+ years and broad technical stacks",
          "Full-stack developers with many skills to showcase",
          "SWEs whose experience doesn't fit cleanly on one column",
          "Engineers at growth companies who want density without clutter",
        ],
        features: [
          "Full-width header for prominent personal branding",
          "Two-column body maximises page real estate",
          "Skills column makes technical breadth immediately visible",
          "Configurable right-column sections via CVEdge designer",
          "Scores well on ATS — clean header parsing",
        ],
        tier: "free",
        imgPath: "/img/templates/horizon.jpg",
        faqs: [
          {
            q: "Does Horizon's two-column layout cause ATS parsing issues?",
            a: "The full-width header parses cleanly. Two-column body sections are handled well by modern ATS systems. Run CVEdge's ATS analyser on your specific content to catch any role-specific issues.",
          },
          {
            q: "How many skills can the Horizon template display?",
            a: "The skills column comfortably handles 15–25 skills in grouped categories (Languages, Frameworks, Cloud, Tools). More than that becomes dense — use categories to organise.",
          },
        ],
      },
    ],
  },

  {
    slug: "marketing",
    label: "Marketing",
    metaTitle: "Marketing Resume Templates — Free & Professional | CVEdge",
    metaDescription:
      "Free resume templates for marketing professionals. Balanced visual presence with ATS safety. Ideal for digital marketing, growth, brand, and performance roles.",
    h1: "Marketing Resume Templates",
    intro:
      "Marketing resumes walk a fine line: they need to look polished enough to show you understand brand, but structured enough to pass ATS screening. These templates are chosen for marketing roles specifically — visual presence without sacrificing parsability. Whether you're in performance marketing, brand strategy, content, or growth, there's a template here that matches your audience.",
    templates: [
      {
        leafSlug: "aurora-cv",
        templateSlug: "aurora",
        displayName: "Aurora Resume for Marketing Professionals",
        headline: "Skills chips, avatar, two-column layout. Built for PM, marketing, and growth roles.",
        description:
          "Aurora is the most popular template for marketing, product, and growth professionals on CVEdge. The two-column layout with skill chips gives your resume the visual energy that creative and growth roles expect, while the structured layout maintains the ATS readability that automated screening requires.\n\nThe skills section uses coloured chip tags — perfect for marketing roles where you need to show fluency across channels (SEO, paid social, email, analytics) at a glance. Hiring managers for marketing roles spend 7 seconds on a first scan; Aurora makes those 7 seconds count.\n\nThe avatar option works well for marketing professionals — personal branding is part of the role, and a professional photo adds approachability without looking out of place. For brand and content roles, the visual signal Aurora sends is exactly right: creative but organised.\n\nPair Aurora with CVEdge's Job Match tool — paste the job description and see which of your marketing keywords need to be added.",
        whoFor: [
          "Digital marketing managers and specialists",
          "Growth and performance marketing professionals",
          "Brand managers and content strategists",
          "Marketing analysts with strong channel skills",
        ],
        features: [
          "Skill chips make channel expertise immediately visible",
          "Optional avatar for personal branding",
          "Two-column layout balances experience and skills",
          "Accent colour customisation for brand alignment",
          "ATS-compatible despite visual richness",
        ],
        tier: "free",
        imgPath: "/img/templates/aurora.jpg",
        faqs: [
          {
            q: "Is Aurora template good for marketing roles?",
            a: "Aurora is specifically popular with marketing, growth, and PM professionals. The chip-based skills section showcases channel expertise (SEO, paid, email, analytics) at a glance.",
          },
          {
            q: "Does Aurora work for senior marketing roles?",
            a: "Yes — Aurora scales well from associate to VP level. Senior marketers use it to show strategic breadth alongside channel depth. The layout accommodates 8–10 years of experience without feeling crowded.",
          },
        ],
      },
      {
        leafSlug: "bold-accent-cv",
        templateSlug: "bold-accent",
        displayName: "Bold Accent Resume for Marketers",
        headline: "Energetic and branded. Accent chips and icon sections for growth and brand roles.",
        description:
          "Bold Accent brings energy to your marketing resume without going overboard. The accent chip system tags your core competencies immediately — great for growth marketers who need to signal channel diversity (SEO, PPC, social, analytics, CRO) in the first scan.\n\nIcon-bordered section headers create a structure that human reviewers find easy to navigate. For content marketers, social media managers, and growth hackers, this layout says: organised, creative, results-focused.\n\nBold Accent is ATS-safe — single column, standard heading names, no images in the body. The visual energy comes from typography and spacing choices, not graphics that trip up parsers.\n\nUse CVEdge's keyword tool to identify which channel-specific terms to add to your chips based on the specific role's job description. Marketing roles vary enormously in keyword requirements — match each application.",
        whoFor: [
          "Growth hackers and performance marketers",
          "Content marketers and social media managers",
          "Marketing specialists switching roles or companies",
          "Anyone who wants branded energy without design risk",
        ],
        features: [
          "Accent chips highlight core marketing competencies",
          "Icon-bordered sections create visual navigation",
          "Single column — ATS safe throughout",
          "Strong skills presentation for channel-heavy roles",
          "Clean PDF output with consistent brand feel",
        ],
        tier: "free",
        imgPath: "/img/templates/bold-accent.jpg",
        faqs: [
          {
            q: "Is Bold Accent suitable for senior marketing positions?",
            a: "Bold Accent works for mid-level roles (3–7 years). For VP or director-level marketing positions, consider Aurora or a cleaner format like Classic. Senior hiring panels expect restraint.",
          },
          {
            q: "Can I customise the accent colours in Bold Accent?",
            a: "Yes — CVEdge's designer panel lets you change the accent colour to match any brand palette or personal colour preference.",
          },
        ],
      },
      {
        leafSlug: "coastal-cv",
        templateSlug: "coastal",
        displayName: "Coastal Resume for Marketing & Brand Roles",
        headline: "Teal accent header with photo and objective band. Strong personal branding.",
        description:
          "Coastal is CVEdge's most visually distinctive two-column template. The teal header band with your photo and objective statement creates an immediate personal brand moment — before a recruiter reads your first bullet, they've formed an impression. For brand managers, content creators, and marketers where personal presentation is part of the job signal, this is a powerful opening.\n\nThe objective band below the header is a feature, not a liability. For marketing roles, a sharp one-line positioning statement (\"Performance marketing specialist | $50M+ in managed ad spend | fintech and SaaS\") tells the story before the detail.\n\nCoastal balances visual presence with structured content. The body section is clean two-column — experience on the left, skills and credentials on the right — meaning it reads logically both for human reviewers and ATS systems.\n\nFor UK and Australian marketers where photos on CVs are more common, Coastal's photo placement is natural and professional.",
        whoFor: [
          "Brand managers and brand strategists",
          "Content marketers and creative directors",
          "Marketing professionals in photo-normalised markets (UK/AU)",
          "Marketers where personal brand is part of the role",
        ],
        features: [
          "Teal header band creates instant brand impression",
          "Objective statement band positions your narrative upfront",
          "Photo-friendly professional layout",
          "Two-column body with clear ATS structure",
          "Colour customisation for brand alignment",
        ],
        tier: "free",
        imgPath: "/img/templates/coastal.jpg",
        faqs: [
          {
            q: "Should I include a photo on my marketing resume?",
            a: "In the US, photos on resumes are generally avoided due to bias concerns. In the UK, Australia, and Europe, photos are common and expected. Coastal is designed for markets where photos are standard practice.",
          },
          {
            q: "What should I write in the Coastal objective band?",
            a: "One sharp sentence: your role type, a key metric or specialisation, and your sector. Example: \"SEO lead | 300% YoY organic growth | B2B SaaS.\" Keep it under 15 words.",
          },
        ],
      },
      {
        leafSlug: "clean-sidebar-cv",
        templateSlug: "clean-sidebar",
        displayName: "Clean Sidebar Resume for Marketing Analysts",
        headline: "Warm sidebar with metric bars. Built for analytics-heavy marketing roles.",
        description:
          "Clean Sidebar brings warmth and clarity to the two-column format. The light-toned sidebar runs progress bars for skill proficiency — ideal for marketing analysts and performance marketers who want to show tool depth (GA4, Tableau, HubSpot, Salesforce) visually rather than in a text list.\n\nFor marketing roles that lean analytics — growth analysts, marketing operations, CRM managers, demand gen — the progress bar system communicates depth at a glance. A recruiter scanning for \"Salesforce\" sees not just the keyword but the stated proficiency level.\n\nThe main column leads with a strong summary section before Experience, which works well for marketers who are pivoting (e.g., from content to analytics) or who have a non-linear career that needs context.\n\nClean Sidebar is warm, professional, and unusually readable at low contrast — it works beautifully when printed for face-to-face interview panels.",
        whoFor: [
          "Marketing analysts and marketing operations specialists",
          "Growth analysts and demand generation managers",
          "CRM and marketing automation specialists",
          "Performance marketers who want to show tool depth",
        ],
        features: [
          "Sidebar progress bars for tool and skill proficiency",
          "Warm sidebar palette — professional and distinctive",
          "Summary section prominent for career pivots",
          "Works beautifully printed for in-person interviews",
          "Two-column ATS compatibility via standard structure",
        ],
        tier: "free",
        imgPath: "/img/templates/clean-sidebar.jpg",
        faqs: [
          {
            q: "Do progress bars on CVs look unprofessional?",
            a: "In moderation, no. Clean Sidebar's bars are subtle and precise — they signal confidence in your self-assessment. Avoid rating yourself 100% on anything; 80–90% on core tools reads as honest and strong.",
          },
          {
            q: "Is Clean Sidebar template good for marketing manager roles?",
            a: "Clean Sidebar works best for IC roles (analyst, specialist, associate) and mid-level managers. For VP/Director, it can feel too visual — consider Executive or Classic instead.",
          },
        ],
      },
      {
        leafSlug: "electric-lilac-cv",
        templateSlug: "electric-lilac",
        displayName: "Electric Lilac Resume for Creative Marketing",
        headline: "Bold two-column sidebar for creative, brand, and design-adjacent marketing roles.",
        description:
          "Electric Lilac is CVEdge's most bold template — a vibrant sidebar paired with a clean white main column. For creative directors, brand managers, and content leads where visual confidence is expected and rewarded, Electric Lilac makes you memorable in a stack of grey-and-white PDFs.\n\nThe sidebar carries your photo, contact details, and skills. The main column leads with your strongest experience. The contrast between sidebar richness and body clarity creates a professional look that's hard to achieve without design skills — CVEdge does it for you.\n\nElectric Lilac is a Pro template, reflecting the additional design investment. For creative marketing roles, design-forward agencies, and brand-first companies, the upfront statement it makes is worth the small upgrade.\n\nNote: Electric Lilac is less ATS-safe than single-column formats. Use CVEdge's ATS analyser to verify your content before applying via portal submissions.",
        whoFor: [
          "Creative directors and brand managers",
          "Content strategists and social leads",
          "Marketing professionals at design-forward agencies",
          "Marketers applying directly to a recruiter (not ATS portal)",
        ],
        features: [
          "Vibrant sidebar creates immediate visual memorability",
          "Photo-friendly with professional framing",
          "Clean white main column keeps experience readable",
          "Sidebar skills section shows channel depth visually",
          "PDF export with colour fidelity",
        ],
        tier: "pro",
        imgPath: "/img/templates/electric-lilac.jpg",
        faqs: [
          {
            q: "Is Electric Lilac ATS-friendly?",
            a: "Electric Lilac is less ATS-safe than single-column formats. Apply caution with portal submissions — always run CVEdge's ATS analyser. For direct recruiter outreach or portfolio submissions, it's an excellent choice.",
          },
          {
            q: "When is Electric Lilac the right choice for marketing?",
            a: "Use Electric Lilac when you're applying to creative agencies, in-house brand teams, or design-forward companies where your resume itself is a portfolio signal. Avoid for B2B enterprise or heavily automated hiring pipelines.",
          },
        ],
      },
    ],
  },

  {
    slug: "freshers",
    label: "Freshers & Entry Level",
    metaTitle: "Fresher Resume Templates — Entry Level & Graduate CVs | CVEdge",
    metaDescription:
      "Free resume templates for freshers and recent graduates. Formats that fill well with limited experience. Works for internships, first jobs, and career starters.",
    h1: "Fresher & Entry Level Resume Templates",
    intro:
      "Starting your career with limited experience doesn't mean your resume has to look thin. These templates are chosen because they structure projects, education, and internships in ways that present maximum impact from minimum content. The right format turns three months of internship and a degree project into a compelling first-impression resume.",
    templates: [
      {
        leafSlug: "classic-cv",
        templateSlug: "classic",
        displayName: "Classic Resume for Freshers & Graduates",
        headline: "Clean, structured, and easy to fill. The safest first resume for any industry.",
        description:
          "For your first or second professional resume, Classic is the right starting point. The single-column layout is forgiving: it structures internships, projects, coursework, and education into a coherent narrative even when experience is thin.\n\nFor freshers, the key challenge is making a short work history look substantive. Classic helps because its tight spacing and clean structure make three months of internship and a degree project fill a page naturally — without padding or empty space signalling inexperience.\n\nThe Education section in Classic sits below Experience by default, but CVEdge's section reorder feature lets you move it above Experience — correct for freshers whose education is their primary credential.\n\nClassic is safe for every industry. Finance graduate? Classic. CS grad going into SWE? Classic. Marketing fresher? Classic. You can always upgrade to a more styled template as you accumulate experience. Start here.",
        whoFor: [
          "Recent graduates (bachelor's or master's)",
          "Interns writing their first professional resume",
          "Career changers with limited experience in the new field",
          "Anyone creating a resume for the first time",
        ],
        features: [
          "Section reorder lets Education appear above Experience",
          "Projects section structured for degree and side projects",
          "Single column — passes all ATS filters",
          "Fills naturally with limited experience",
          "No design decisions required — just add your content",
        ],
        tier: "free",
        imgPath: "/img/templates/classic.jpg",
        faqs: [
          {
            q: "Should freshers put Education above Experience on their resume?",
            a: "Yes, if your education is your strongest credential. CVEdge's section reorder feature lets you move Education to the top. As you accumulate 1–2 years of experience, move it back below Experience.",
          },
          {
            q: "How do I fill a resume with limited experience?",
            a: "Include: internships, degree projects (detailed bullet points with outcomes), academic achievements, relevant coursework, hackathons, open-source contributions, and volunteer work. Each project should have 2–3 bullet points with scope and outcome.",
          },
        ],
      },
      {
        leafSlug: "minimal-cv",
        templateSlug: "minimal",
        displayName: "Minimal Resume for Fresh Graduates",
        headline: "Elegant whitespace that makes limited experience look intentional, not sparse.",
        description:
          "Minimal works surprisingly well for fresh graduates when you have strong content to fill it. The generous whitespace isn't empty — it signals confidence. Rather than cramming every detail to fill space, Minimal says: here is my best work, clearly stated.\n\nFor CS graduates with strong GitHub projects, design students with portfolio work, or finance graduates from target schools, Minimal's restrained style positions you as someone who understands quality over quantity.\n\nThe challenge with Minimal for freshers is having enough strong bullets per section. You need at least 2 substantial bullet points per experience/project (not just descriptions — outcomes). Use CVEdge's AI bullet rewriter to turn \"Worked on React frontend\" into \"Built customer-facing checkout flow handling 10K monthly transactions, reducing drop-off by 22%.\" Then Minimal looks great.\n\nAvoid Minimal if you have fewer than 3 substantial experiences or projects to list.",
        whoFor: [
          "CS and engineering graduates with strong GitHub portfolio",
          "Design students with portfolio work",
          "Finance and business graduates from target schools",
          "Graduates who want their work to speak without decoration",
        ],
        features: [
          "Generous whitespace signals content quality over volume",
          "Perfect contrast for strong metric-led bullets",
          "Single column — full ATS compatibility",
          "Elegant typography for target-school graduates",
          "Looks premium even with limited content",
        ],
        tier: "free",
        imgPath: "/img/templates/minimal.jpg",
        faqs: [
          {
            q: "Does Minimal look too empty for fresher resumes?",
            a: "Only if you have fewer than 3 substantial experiences or projects. With 3+ well-written entries, the whitespace reads as confident curation. Use CVEdge's AI rewriter to strengthen each bullet first.",
          },
          {
            q: "Is Minimal better than Classic for graduate applications?",
            a: "Minimal is better if your content is strong and you're targeting companies that value craft (tech, design, consulting). Classic is safer for volume applications across multiple industries.",
          },
        ],
      },
      {
        leafSlug: "bold-accent-cv",
        templateSlug: "bold-accent",
        displayName: "Bold Accent Resume for Freshers",
        headline: "Modern, energetic. Chips and sections hide thin experience beautifully.",
        description:
          "Bold Accent's structured chip system and icon sections help freshers organise limited experience into a resume that looks considered and complete. The section structure — with clearly defined areas for Projects, Skills, Certifications, and Experience — means a resume with 6 months of internship and three degree projects looks as organised as a 5-year career.\n\nThe skill chips feature is particularly valuable for freshers who have technical or tool-based skills but little work experience to demonstrate them. For a CS fresher: Python, React, SQL, AWS — displayed as chips, they show immediately readable competency.\n\nBold Accent is single-column so it passes all ATS filters, which matters for graduate schemes and first-job applications that use automated screening.\n\nNote: Bold Accent works best when you commit to filling all sections. Leave a section empty and the structure looks incomplete. Populate every section with at least some content.",
        whoFor: [
          "Tech freshers with strong skill sets but limited experience",
          "Marketing graduates with tool certifications",
          "Freshers applying for graduate schemes",
          "Entry-level candidates with project-based backgrounds",
        ],
        features: [
          "Skill chips make technical skills immediately visible",
          "Structured sections organise limited experience clearly",
          "Icon-bordered layout creates visual completeness",
          "Single column — ATS safe for graduate portal applications",
          "Supports certifications prominently",
        ],
        tier: "free",
        imgPath: "/img/templates/bold-accent.jpg",
        faqs: [
          {
            q: "Is Bold Accent good for graduate scheme applications?",
            a: "Yes — the chip skills section highlights competencies that graduate schemes screen for. The single-column ATS-safe layout ensures automated portals parse it correctly.",
          },
          {
            q: "What should freshers include in the Bold Accent skills chips?",
            a: "Prioritise: programming languages, tools, platforms, and certifications relevant to the role. For tech roles: languages and frameworks. For marketing roles: tools (GA4, HubSpot, Canva). For finance: Excel, Bloomberg, VBA, Python.",
          },
        ],
      },
      {
        leafSlug: "classic-serif-cv",
        templateSlug: "classic-serif",
        displayName: "Classic Serif Resume for Graduates",
        headline: "Elegant serif typography for finance, law, consulting, and academic applications.",
        description:
          "Classic Serif is the right template for graduates targeting industries where traditional credentials and academic pedigree matter: investment banking, law, management consulting, accountancy, and academic positions.\n\nThe grey section bands and serif typography communicate that you understand professional convention in these fields. A consulting firm that interviews at target schools expects to see a well-formatted, formal resume — Classic Serif delivers exactly that.\n\nFor finance freshers, the layout perfectly frames the credentials that matter most: degree institution, degree classification, A-levels or equivalent, and any investment/consulting relevant projects or societies.\n\nClassic Serif is ATS-safe — single column, standard headings — so it works both for automated online applications and physical CV review at career fairs and on-campus recruiting.\n\nThe template also works well for PhD and research applications where academic credentials and publications come above professional experience.",
        whoFor: [
          "Finance and investment banking freshers",
          "Law graduates and trainee solicitor applicants",
          "Management consulting graduate applicants",
          "MBA graduates from business schools",
        ],
        features: [
          "Serif typography signals professional convention",
          "Grey section bands create formal structure",
          "Academic credentials displayed with appropriate weight",
          "ATS-safe single column for portal applications",
          "Scales well with distinctions, awards, and activities",
        ],
        tier: "free",
        imgPath: "/img/templates/classic-serif.png",
        faqs: [
          {
            q: "Is Classic Serif good for investment banking applications?",
            a: "Yes — IB recruiting at most banks expects formal, traditional formatting. Classic Serif matches that expectation while being ATS-safe for bank portal submissions.",
          },
          {
            q: "Can I use Classic Serif for consulting applications?",
            a: "Yes. McKinsey, BCG, and Bain all see Classic Serif-style resumes regularly. The structured grey bands and serif typography signal you've made deliberate formatting choices.",
          },
        ],
      },
      {
        leafSlug: "sharp-cv",
        templateSlug: "sharp",
        displayName: "Sharp Resume for Tech Freshers",
        headline: "Bold, modern, and ATS-safe. Stand out from the sea of generic first resumes.",
        description:
          "Most freshers submit identical resumes — white page, Times New Roman or Arial, minimal structure. Sharp immediately differentiates you with bold section dividers and modern typography while keeping every ATS requirement intact.\n\nFor CS, engineering, and tech-adjacent freshers, Sharp communicates that you understand design fundamentals without going overboard. It says: I know what good looks like, and I applied that to my own resume.\n\nSharp fills well with limited experience because the bold section headers and dividers create visual structure even when individual sections have only 2–3 bullets. The page feels complete rather than thin.\n\nSharp works particularly well for tech freshers applying to startups and growth companies, which tend to have less automated screening and more recruiter review time — meaning visual differentiation actually matters.",
        whoFor: [
          "CS and engineering freshers",
          "Tech graduates applying to startups and scale-ups",
          "Freshers who want to stand out from generic first resumes",
          "Developers and designers with some side project experience",
        ],
        features: [
          "Bold section dividers differentiate from generic formats",
          "Modern typography for tech-forward companies",
          "Single column — ATS safe",
          "Fills well with limited experience via structured layout",
          "Accent colour customisable for personality",
        ],
        tier: "free",
        imgPath: "/img/templates/sharp.jpg",
        faqs: [
          {
            q: "Is Sharp a good first resume template for CS graduates?",
            a: "Yes — Sharp is popular with CS and engineering freshers. The modern look suits startup and tech company applications while the ATS-safe structure handles automated screening.",
          },
          {
            q: "Does Sharp work for non-tech freshers too?",
            a: "Sharp works for any industry where modern aesthetics are acceptable. For traditional industries (finance, law, consulting), Classic Serif is safer.",
          },
        ],
      },
    ],
  },

  {
    slug: "experienced",
    label: "Experienced Professionals",
    metaTitle: "Resume Templates for Experienced Professionals — Senior & Executive | CVEdge",
    metaDescription:
      "Resume templates for senior professionals with 8+ years of experience. Premium layouts for executive, leadership, and management roles. ATS-safe, highly polished.",
    h1: "Resume Templates for Experienced Professionals",
    intro:
      "Senior professionals need templates that communicate their seniority before a recruiter reads a single bullet. Premium spacing, refined typography hierarchy, and layouts that give your summary and leadership experience the visual weight they deserve. These templates are for professionals with 8+ years building track records that need proper framing.",
    templates: [
      {
        leafSlug: "executive-cv",
        templateSlug: "executive",
        displayName: "Executive Resume Template",
        headline: "Premium feel for senior roles. Refined typography and spacing that commands attention.",
        description:
          "Executive is the flagship template for senior professionals. Premium line spacing, careful typographic hierarchy, and a layout that places your Professional Summary prominently — before experience detail — means your narrative leads rather than your job titles.\n\nFor professionals with 10–25 years of experience, the challenge isn't showing you have experience — it's framing the most relevant 10 years for this specific role. Executive's clean structure helps you curate without cluttering. Older roles compress naturally into brief bullets while recent roles expand into detailed impact statements.\n\nExecutive maintains full ATS compatibility — single column, standard heading names — while presenting at a visual quality level that matches the seniority it's designed for.\n\nUse CVEdge's Job Match tool with Executive to ensure your summary and bullets align precisely to the specific job description. At senior levels, generic resumes don't get interviews — targeted ones do.",
        whoFor: [
          "Senior professionals with 10+ years of experience",
          "C-suite and VP-level executives",
          "Directors and general managers",
          "Senior leaders changing industries",
        ],
        features: [
          "Premium spacing and typographic hierarchy",
          "Summary section positioned prominently for narrative control",
          "Clean ATS-safe single column structure",
          "Handles 20+ years of experience without crowding",
          "Certifications and publications displayed with appropriate weight",
        ],
        tier: "free",
        imgPath: "/img/templates/executive.jpg",
        faqs: [
          {
            q: "How far back should experienced professionals go on their resume?",
            a: "Standard guidance: last 10–15 years in detail, older roles in brief (company, title, dates only). Executive's layout handles this well — early roles in compressed format, recent roles with full detail.",
          },
          {
            q: "Should senior executives include a photo on their resume?",
            a: "In the US, no — even for senior roles. In the UK, EU, and ANZ, a professional photo is acceptable and sometimes expected. CVEdge's avatar feature is optional on Executive.",
          },
        ],
      },
      {
        leafSlug: "executive-pro-cv",
        templateSlug: "executive-pro",
        displayName: "Executive Pro Resume Template",
        headline: "Bold photo header with dark contact bar. Leadership presence from the first line.",
        description:
          "Executive Pro is the premium two-column template for senior executives who want immediate visual authority. The dark contact bar beneath a prominent header photo creates a powerful personal brand statement — before a recruiter reads your summary, you've established presence.\n\nFor C-suite roles, board appointments, and senior leadership searches — where the hiring committee reviews a shortlist rather than scanning hundreds of applications — visual distinction matters. Executive Pro delivers it.\n\nThe two-column body pairs a detailed experience column with a sidebar carrying key credentials, skills, and board memberships. Senior leaders often have diverse credentials — Executive Pro organises them into a hierarchy that reads logically.\n\nExecutive Pro is a Pro template. For senior leadership roles where you're often the deciding factor in a close-call hiring decision, the marginal investment in a polished format is worth it.",
        whoFor: [
          "C-suite executives (CEO, CFO, CTO, COO)",
          "Board-level candidates and NEDs",
          "Senior VPs and division presidents",
          "Executives working with executive search firms",
        ],
        features: [
          "Photo header with dark contact bar for immediate presence",
          "Two-column layout for comprehensive credential display",
          "Board memberships and advisory roles displayed prominently",
          "Premium typography for high-profile applications",
          "PDF export with full colour fidelity for direct submissions",
        ],
        tier: "pro",
        imgPath: "/img/templates/executive-pro.jpg",
        faqs: [
          {
            q: "Is Executive Pro suitable for executive search firm submissions?",
            a: "Yes — executive search firms often review printed or PDF submissions rather than ATS portals. Executive Pro's visual quality matches what search firms expect for senior mandates.",
          },
          {
            q: "Does Executive Pro work for UK executive roles?",
            a: "Executive Pro is well-suited for UK and European executive markets where photos are standard and visual polish in executive materials is expected.",
          },
        ],
      },
      {
        leafSlug: "executive-sidebar-cv",
        templateSlug: "executive-sidebar",
        displayName: "Executive Sidebar Resume Template",
        headline: "Dark sidebar with photo. Corporate and legal feel for senior roles.",
        description:
          "Executive Sidebar pairs a dark left sidebar — carrying your photo, contact details, and key skills — with a clean white main column for your career narrative. The result is a resume that communicates gravitas and organisation simultaneously.\n\nFor senior professionals in corporate law, finance, management consulting, and large enterprise leadership, Executive Sidebar matches the professional aesthetic those environments expect. The dark sidebar signals structure and precision; the white main column provides detailed, scannable experience.\n\nThe sidebar accommodates professional photo, contact details, core competencies, and professional memberships — keeping the main column clean for achievement-led experience bullets without credential clutter.\n\nExecutive Sidebar is a Pro template, appropriate for the seniority level it targets. The additional design quality signals that you take the application seriously — which is exactly the message senior roles require.",
        whoFor: [
          "Senior professionals in corporate law, finance, and consulting",
          "VP and C-suite candidates in regulated industries",
          "Senior management in large enterprises",
          "Professionals from photo-normalised markets (UK/EU)",
        ],
        features: [
          "Dark sidebar creates immediate authority and structure",
          "Photo integration professional and understated",
          "Main column clean for achievement-led experience",
          "Professional memberships and certifications in sidebar",
          "Premium PDF output suitable for board-level submission",
        ],
        tier: "pro",
        imgPath: "/img/templates/executive-sidebar.jpg",
        faqs: [
          {
            q: "Is Executive Sidebar good for C-suite applications in the UK?",
            a: "Yes — Executive Sidebar's photo integration and formal structure suit UK corporate expectations. For US applications, the photo sidebar is less conventional — consider Executive or Executive Pro instead.",
          },
          {
            q: "Can Executive Sidebar accommodate 20+ years of experience?",
            a: "Yes — the main column handles extensive career history well. Keep older roles brief (company, title, 1 bullet) and expand recent 5–7 years in detail.",
          },
        ],
      },
      {
        leafSlug: "ledger-cv",
        templateSlug: "ledger",
        displayName: "Ledger Resume Template",
        headline: "Finance-inspired clean lines. Numbers and metrics command attention.",
        description:
          "Ledger is designed for professionals where numbers are the language — finance, accounting, investment management, strategy, and operations roles where measurable impact is the primary currency of a strong resume.\n\nThe template name reflects its philosophy: every line should carry a number. P&L responsibility, team size, budget managed, cost savings achieved, revenue generated. Ledger's clean, structured layout makes those metrics stand out rather than hiding in dense paragraphs.\n\nFor CFOs, finance directors, controllers, FP&A leads, and investment professionals, Ledger matches the analytical rigour of the roles they're targeting. The layout is structured, precise, and undecorated — the same qualities valued in financial analysis.\n\nLedger is ATS-safe — single column, standard headings — and pairs well with CVEdge's Fix All ATS tool for ensuring your bullets have the quantified structure finance roles require.",
        whoFor: [
          "CFOs, finance directors, and controllers",
          "FP&A managers and investment professionals",
          "Operations and strategy leaders with P&L responsibility",
          "Accountants and audit professionals in senior roles",
        ],
        features: [
          "Clean lines that make metrics and numbers stand out",
          "Structured layout suited to analytical professionals",
          "ATS-safe single column",
          "Precise spacing for dense financial experience",
          "Professional typography for regulated industry applications",
        ],
        tier: "free",
        imgPath: "/img/templates/ledger.jpg",
        faqs: [
          {
            q: "Is Ledger template good for investment banking applications?",
            a: "Yes — Ledger's clean, numbers-first structure suits IB applications. The layout makes P&L metrics and deal experience read clearly. Works at both analyst and director levels.",
          },
          {
            q: "What kind of metrics should experienced finance professionals include?",
            a: "P&L size managed, team size, cost savings (£/$), revenue influence, fund size (for investment roles), audit scope (number of entities/revenue), and percentage improvements in key metrics.",
          },
        ],
      },
      {
        leafSlug: "harvard-cv",
        templateSlug: "harvard",
        displayName: "Harvard Resume Template",
        headline: "Academic and formal structure. MBA graduates, academics, and consulting professionals.",
        description:
          "Harvard's formal, academic-style formatting is well-suited for professionals where credential pedigree matters as much as professional achievement: MBAs, PhDs in industry roles, management consultants, policy professionals, and academics moving into senior roles.\n\nThe layout follows the conventions of academic CVs — sections ordered to lead with your strongest credential (education for MBAs, publications for academics) before professional experience. The formal typography and precise spacing communicate that you understand professional convention in high-credential environments.\n\nFor experienced professionals returning to consulting after industry roles, Harvard signals the academic rigour consulting firms value. For senior professionals with multiple degrees, Harvard handles multi-credential headers cleanly.\n\nHarvard is ATS-safe and particularly effective for roles that are applied to directly or through executive search, where the resume is reviewed by people who appreciate formal presentation.",
        whoFor: [
          "MBA graduates and business school alumni",
          "Management consulting professionals",
          "Academic professionals moving to industry senior roles",
          "Policy professionals and think-tank researchers",
        ],
        features: [
          "Academic-style formal structure",
          "Education section can lead — correct for MBA and PhD applications",
          "Handles publications, research, and academic credentials",
          "Precise typographic hierarchy for credential-rich resumes",
          "ATS-safe single column for portal submissions",
        ],
        tier: "free",
        imgPath: "/img/templates/harward.jpg",
        faqs: [
          {
            q: "Should experienced professionals use Harvard template?",
            a: "Harvard suits experienced professionals in consulting, academia, policy, and finance where credential pedigree is explicit. For general management or tech leadership, Executive or Classic is more versatile.",
          },
          {
            q: "How do I order sections on the Harvard template for an experienced professional?",
            a: "Lead with Education if it's a target institution (HBS, INSEAD, Oxford). Lead with Experience if your career achievements are stronger than your institution. CVEdge's section reorder makes this a two-click change.",
          },
        ],
      },
    ],
  },

  {
    slug: "ats-friendly",
    label: "ATS Friendly",
    metaTitle: "ATS-Friendly Resume Templates — Score 90+ | CVEdge",
    metaDescription:
      "Resume templates verified to score 90+ on ATS systems. Single-column layouts, standard headings, no graphics. Pass Greenhouse, Workday, Lever, and iCIMS automatically.",
    h1: "ATS-Friendly Resume Templates",
    intro:
      "75% of resumes are rejected by ATS before a human sees them. The most common reasons: two-column layouts, non-standard headings, tables, images in the body, and unusual fonts. Every template in this category has been tested against major ATS systems — Greenhouse, Workday, Lever, and iCIMS — and scores 90+ on CVEdge's ATS analyser. Pick any of these and your format won't be the reason you don't hear back.",
    templates: [
      {
        leafSlug: "classic-cv",
        templateSlug: "classic",
        displayName: "Classic ATS Resume Template",
        headline: "Scores 95+ on every major ATS. The most battle-tested format on CVEdge.",
        description:
          "Classic is CVEdge's top-scored template on every ATS system we've tested. Single column, standard heading names (Experience, Education, Skills), Geist Sans font at 10–11pt, no graphics, no tables — the format that every ATS parser was built to read.\n\nWhen you upload a Classic resume to Greenhouse, it parses perfectly: every field populates in the candidate profile exactly as written. No truncation, no garbled bullet points, no missing dates. This matters because ATS data quality affects recruiter review — a garbled parse means your strongest bullet might appear broken in the recruiter's system.\n\nClassic achieves 95–97 ATS scores on CVEdge for well-written content. The ceiling is content quality, not format quality — which is exactly what it should be.\n\nFor applications where ATS safety is the priority — large corporations, regulated industries, government roles, NHS, civil service — Classic is the only template you should consider.",
        whoFor: [
          "Anyone applying via online job portals (Greenhouse, Workday, Lever)",
          "Professionals targeting large corporations and regulated industries",
          "Government, NHS, and civil service applicants",
          "Anyone who wants zero format-related rejections",
        ],
        features: [
          "Verified 95+ ATS score on Greenhouse, Workday, Lever, iCIMS",
          "Single column — no parsing ambiguity",
          "Standard heading names ATS systems expect",
          "No graphics, tables, or non-standard fonts",
          "CVEdge ATS analyser gives real-time score as you edit",
        ],
        tier: "free",
        imgPath: "/img/templates/classic.jpg",
        faqs: [
          {
            q: "Which ATS systems does the Classic template work with?",
            a: "Classic passes all major ATS systems: Greenhouse, Workday, Lever, iCIMS, Taleo, SmartRecruiters, Jobvite, BambooHR, and Recruiterbox. It follows universal ATS parsing conventions.",
          },
          {
            q: "What ATS score does Classic template get on CVEdge?",
            a: "Classic consistently scores 95–97 on CVEdge's ATS analyser for well-formatted content. The remaining 3–5 points come from content quality (metrics, keywords, bullet structure) — not format.",
          },
        ],
      },
      {
        leafSlug: "minimal-cv",
        templateSlug: "minimal",
        displayName: "Minimal ATS Resume Template",
        headline: "Zero parsing errors. Maximum whitespace with full ATS compliance.",
        description:
          "Minimal is the cleanest ATS-safe template CVEdge offers. Zero decoration means zero ATS parsing risk — every element on the page is parsable text. No borders that could confuse column detection, no section dividers that might interrupt content parsing, no font variety that could trip up character recognition.\n\nFor professionals in industries where ATS screening is heavily automated — large tech companies, financial services, global enterprises — Minimal eliminates every format variable. The ATS score reflects your content quality alone.\n\nMinimal's generous whitespace also benefits human reviewers. When your resume does pass ATS and reach a recruiter's screen, the layout is immediately readable. High contrast between text and background, generous line spacing — a recruiter scanning 50 resumes in 90 minutes will appreciate it.\n\nPair Minimal with CVEdge's Fix All ATS for maximum combined score improvement.",
        whoFor: [
          "Professionals in heavily automated hiring pipelines",
          "Large tech company applicants (Google, Meta, Amazon, Microsoft)",
          "Financial services applicants with ATS portals",
          "Anyone wanting the lowest possible format risk",
        ],
        features: [
          "Zero decoration means zero parsing risk",
          "Maximises readability for human reviewers post-ATS",
          "Single column — cleanest possible parse",
          "No borders, dividers, or complex layout elements",
          "CVEdge ATS analyser scores Minimal highest in format compliance",
        ],
        tier: "free",
        imgPath: "/img/templates/minimal.jpg",
        faqs: [
          {
            q: "Is Minimal really better for ATS than Classic?",
            a: "They score identically for format safety. Minimal has slightly fewer elements that could theoretically cause issues in edge-case ATS systems. For practical purposes, both are fully ATS-safe.",
          },
          {
            q: "Does Minimal look too plain for human reviewers?",
            a: "Minimal is a deliberate design choice, not a default. Recruiters who see strong content in a clean layout associate it with confidence. The risk is looking sparse if your content is thin — ensure every bullet has impact.",
          },
        ],
      },
      {
        leafSlug: "sharp-cv",
        templateSlug: "sharp",
        displayName: "Sharp ATS Resume Template",
        headline: "Bold and modern — passes ATS while looking more contemporary than Classic.",
        description:
          "Sharp is the ATS-safe template for professionals who find Classic too plain but won't compromise on ATS safety. The bold section dividers and modern typography are purely visual — they use CSS, not images or tables, so ATS parsers see them identically to a plain-format resume.\n\nFor tech, product, and design professionals applying at startups and growth companies where a recruiter reviews the visual resume rather than relying solely on parsed data, Sharp offers a meaningful visual upgrade over Classic with zero ATS risk trade-off.\n\nSharp scores 93–95 on CVEdge's ATS analyser — fractionally below Minimal due to the additional CSS styling, but fully compliant with all major ATS parsers in practice.\n\nThe modern feel of Sharp also makes it more likely to catch a recruiter's attention when it reaches the reviewed pile — ATS safety and human appeal aren't opposites.",
        whoFor: [
          "Tech and product professionals who want a modern look",
          "Startup and scale-up applicants where visual is reviewed",
          "Professionals wanting ATS safety without a plain aesthetic",
          "Engineers and designers who value design quality",
        ],
        features: [
          "ATS-safe with modern visual style — not a trade-off",
          "Bold section dividers via CSS (not images)",
          "93–95 ATS score on CVEdge analyser",
          "Scores at identical ATS level to Classic in practice",
          "Human-appealing visual for recruiter review post-ATS",
        ],
        tier: "free",
        imgPath: "/img/templates/sharp.jpg",
        faqs: [
          {
            q: "Is Sharp less ATS-safe than Classic or Minimal?",
            a: "In practice, no. Sharp uses CSS styling that doesn't affect ATS parsing. CVEdge's ATS analyser scores Sharp at 93–95 vs 95–97 for Classic, a difference that is irrelevant in real-world screening.",
          },
          {
            q: "When should I choose Sharp over Classic for ATS applications?",
            a: "Choose Sharp when you're applying to companies that visually review resumes (most startups, creative agencies, growth companies). Choose Classic for heavily automated enterprise pipelines where format safety above all else is the priority.",
          },
        ],
      },
      {
        leafSlug: "classic-serif-cv",
        templateSlug: "classic-serif",
        displayName: "Classic Serif ATS Resume Template",
        headline: "Formal and ATS-safe. Grey section bands with elegant serif for traditional industries.",
        description:
          "Classic Serif brings the formality of academic and financial professional formatting to an ATS-safe single-column layout. The grey section bands and serif typography communicate professionalism in industries where traditional credentials matter — banking, law, consulting, academia — while maintaining full ATS parser compliance.\n\nThis template specifically addresses the false choice some professionals feel between looking traditional and passing ATS. Classic Serif achieves both: it reads as formal and credentialed to human reviewers, and it parses cleanly through every major ATS system.\n\nFor finance professionals applying to banks (many of which use Taleo or Workday), Classic Serif handles the credential-heavy header (multiple degrees, certifications, professional memberships) without any layout tricks that could trip up automated parsing.\n\nClassic Serif scores 92–95 on CVEdge's ATS analyser.",
        whoFor: [
          "Finance and investment banking professionals",
          "Legal professionals (solicitors, barristers, in-house counsel)",
          "Management consultants and strategy professionals",
          "Academics applying to industry roles",
        ],
        features: [
          "Grey section bands create formal credential structure",
          "Serif typography for traditional industry aesthetics",
          "Single column — full ATS compliance",
          "Handles multiple degrees, certifications, and memberships",
          "92–95 ATS score on CVEdge analyser",
        ],
        tier: "free",
        imgPath: "/img/templates/classic-serif.png",
        faqs: [
          {
            q: "Does the serif font in Classic Serif cause ATS issues?",
            a: "No — CVEdge embeds the font as standard PDF text. ATS systems read PDF text layer, not font style. Classic Serif parses identically to sans-serif templates in terms of ATS compatibility.",
          },
          {
            q: "Is Classic Serif good for law firm applications?",
            a: "Yes. Law firm portals (often using CV Library or Workday) parse Classic Serif cleanly. The formal aesthetic also matches law firm recruiting expectations for in-person review.",
          },
        ],
      },
      {
        leafSlug: "harvard-cv",
        templateSlug: "harvard",
        displayName: "Harvard ATS Resume Template",
        headline: "Academic structure that scores top marks on ATS. Formal, structured, safe.",
        description:
          "Harvard's academic structure — clean section demarcations, formal typography, logical credential ordering — makes it one of the highest-scoring templates on ATS systems that expect structured, text-heavy resumes.\n\nThe Harvard format is particularly well-matched to ATS systems used in academia, professional services, and finance — environments where credential parsing precision matters. Applications with multiple degrees, professional qualifications, and publications parse correctly in Harvard because every field has a dedicated, clearly structured section.\n\nFor consulting firm applications at MBB (McKinsey, BCG, Bain), Harvard matches the resume format their campus recruiting teams see from target schools — which can be an advantage beyond just ATS safety.\n\nHarvard scores 92–94 on CVEdge's ATS analyser. The structured academic layout gets high marks for section clarity and heading recognition.",
        whoFor: [
          "MBA and MBA-equivalent applicants",
          "Consulting firm applicants at MBB and Tier 2",
          "PhD and academic professionals in industry roles",
          "Finance professionals with multiple qualifications",
        ],
        features: [
          "Academic structure scores 92–94 on CVEdge ATS analyser",
          "Correct section ordering for credential-heavy applications",
          "Publications, research, and board memberships handled",
          "Single column — full ATS compliance",
          "Matches resume conventions at top consulting firms",
        ],
        tier: "free",
        imgPath: "/img/templates/harward.jpg",
        faqs: [
          {
            q: "Is Harvard template actually from Harvard?",
            a: "Harvard is named for its academic formatting style — it follows conventions similar to what top business schools use for resume coaching. It is not affiliated with Harvard University.",
          },
          {
            q: "Does Harvard template work for non-academic applications?",
            a: "Yes — Harvard's structured layout works for any professional role. It's particularly strong for consulting, finance, and professional services where academic credential display matters.",
          },
        ],
      },
      {
        leafSlug: "executive-cv",
        templateSlug: "executive",
        displayName: "Executive ATS Resume Template",
        headline: "Senior-level polish with full ATS compliance. No trade-off at leadership level.",
        description:
          "Senior professionals sometimes worry that using a polished template means sacrificing ATS safety. Executive disproves this: premium spacing, refined hierarchy, and a layout that communicates seniority — all built on a single-column, ATS-safe foundation.\n\nFor director-level and above professionals applying via enterprise portals, Executive gives you the best of both worlds. The visual quality signals seniority to human reviewers. The single-column ATS-safe structure ensures the automated screening doesn't misparse your 20-year career.\n\nExecutive scores 93–96 on CVEdge's ATS analyser. The premium spacing and typography choices don't use any non-parsable elements — they're CSS properties, not images or tables.\n\nFor senior hires, most companies combine ATS screening with human review within the first few days. Executive is optimised for both stages of that process.",
        whoFor: [
          "Senior professionals (10+ years) applying via enterprise portals",
          "VP and director-level applicants who won't compromise on polish",
          "Senior leaders at large corporations and regulated industries",
          "C-suite professionals maintaining ATS compatibility",
        ],
        features: [
          "Premium visual quality with 93–96 ATS compliance score",
          "Single column — no parsing compromises",
          "Summary section positioned for narrative leadership",
          "Refined spacing ensures no dense-text parsing issues",
          "Verified through Greenhouse, Workday, and iCIMS",
        ],
        tier: "free",
        imgPath: "/img/templates/executive.jpg",
        faqs: [
          {
            q: "Do senior executives need to worry about ATS?",
            a: "Yes — even at VP and C-suite level, most large companies route applications through ATS. Executive solves this by delivering premium polish without sacrificing single-column ATS safety.",
          },
          {
            q: "What's the ATS score for the Executive template on CVEdge?",
            a: "Executive scores 93–96 on CVEdge's ATS analyser for well-written content. The slightly lower ceiling versus Classic reflects Executive's additional styling — irrelevant in real-world screening performance.",
          },
        ],
      },
    ],
  },

  {
    slug: "creative",
    label: "Creative Roles",
    metaTitle: "Creative Resume Templates — Design, UX & Creative Professionals | CVEdge",
    metaDescription:
      "Resume templates for creative professionals. Bold, visual, and distinctive. For designers, UX professionals, creative directors, and content strategists.",
    h1: "Creative Resume Templates",
    intro:
      "Creative roles expect your resume to demonstrate visual awareness before a recruiter reads a word. These templates balance visual distinction with the structure needed to pass applicant tracking systems. For designers, UX professionals, art directors, and content strategists — templates that match the standard your work sets.",
    templates: [
      {
        leafSlug: "electric-lilac-cv",
        templateSlug: "electric-lilac",
        displayName: "Electric Lilac Resume for Creative Roles",
        headline: "Vibrant sidebar, bold columns. You get noticed before they read a word.",
        description:
          "Electric Lilac is CVEdge's most distinctive template. A vibrant lilac sidebar paired with a clean white main column creates a resume that stands out in any stack. For creative directors, senior designers, and brand leads, this is the template that says: I know design, and I applied it to myself.\n\nThe sidebar carries your photo, contact details, and a skill overview. The main column leads clean with your experience — the contrast between the bold sidebar and restrained main column demonstrates the same balance principle that makes good design: attention where it matters, restraint everywhere else.\n\nElectric Lilac works best for direct submissions and portfolio-linked applications where your resume is reviewed by a creative team rather than only screened by ATS. For portal submissions, run CVEdge's ATS analyser to check score before applying.\n\nFor senior creative roles at agencies, in-house brand teams, and design-forward companies, Electric Lilac makes you memorable in a way that generalist templates never will.",
        whoFor: [
          "Creative directors and senior designers",
          "Brand managers and visual identity professionals",
          "UX leads applying to design-forward companies",
          "Content strategists at agencies and media companies",
        ],
        features: [
          "Vibrant sidebar creates unmistakable visual identity",
          "Photo-friendly with professional framing",
          "Clean white main column balances bold sidebar",
          "Skill section with visual skill indicators",
          "Colour customisation for personal brand alignment",
        ],
        tier: "pro",
        imgPath: "/img/templates/electric-lilac.jpg",
        faqs: [
          {
            q: "Is Electric Lilac suitable for senior UX designer roles?",
            a: "Yes — for UX leads and creative directors, Electric Lilac signals design literacy. Apply with caution via automated ATS portals; it shines for direct submissions and recruiter outreach.",
          },
          {
            q: "Can I change the lilac colour to match my personal brand?",
            a: "Yes — CVEdge's designer panel lets you adjust the accent colour. Choose any colour that matches your portfolio and personal brand identity.",
          },
        ],
      },
      {
        leafSlug: "aurora-cv",
        templateSlug: "aurora",
        displayName: "Aurora Resume for Creative Professionals",
        headline: "Chips, avatar, two columns. Portfolio-meets-resume energy for creative roles.",
        description:
          "Aurora combines the structure of a professional resume with the visual vocabulary of a creative portfolio. Skill chips display your tools and specialisms at a glance; the avatar integrates personal brand naturally; the two-column layout balances experience depth with visual interest.\n\nFor creative professionals where tool fluency matters — designers who need to show Figma, Sketch, and Adobe CC expertise; UX researchers demonstrating research methods; motion designers showing After Effects and Cinema 4D — Aurora's chip system surfaces that competency immediately.\n\nAurora is more ATS-friendly than other visual templates — the two-column structure uses a standard layout that most modern ATS systems parse correctly. CVEdge's analyser will flag any issues specific to your content.\n\nFor junior to mid-level creative roles at startups, agencies, and in-house teams, Aurora is the most versatile creative template: visual enough to signal design awareness, structured enough to pass most automated screening.",
        whoFor: [
          "UX and product designers (junior to lead)",
          "Graphic designers and visual artists",
          "Motion designers and video producers",
          "Creative strategists and brand designers",
        ],
        features: [
          "Skill chips for tool and method display",
          "Optional avatar for personal brand",
          "Two-column layout balances visual and content depth",
          "More ATS-compatible than most visual templates",
          "Accent colour customisation",
        ],
        tier: "free",
        imgPath: "/img/templates/aurora.jpg",
        faqs: [
          {
            q: "Is Aurora suitable for UX designer job applications?",
            a: "Aurora is one of the most popular templates for UX designers on CVEdge. The chip skills section displays design methods (user research, wireframing, prototyping) and tools (Figma, Maze, UserTesting) clearly.",
          },
          {
            q: "Should I include a portfolio link on Aurora?",
            a: "Yes — always include your portfolio URL in the contact header for creative roles. Aurora's clean header section makes portfolio links prominent without cluttering the layout.",
          },
        ],
      },
      {
        leafSlug: "coastal-cv",
        templateSlug: "coastal",
        displayName: "Coastal Resume for Creative Professionals",
        headline: "Teal header band with photo and objective band. Strong personal branding.",
        description:
          "Coastal's teal header band paired with a personal photo creates an immediate brand impression. For creative roles where first impressions carry professional weight — art directors, creative consultants, and brand designers — Coastal turns your resume's header into a brand statement.\n\nThe objective band below the header is particularly powerful for creative professionals: a one-line positioning statement (\"Senior UX designer | FinTech and Health | Figma + Framer\") tells recruiters exactly who you are before they engage with your experience.\n\nThe two-column body keeps Coastal structured: experience on the left, tools and credentials on the right. For designers whose projects don't all fit neatly in a chronological list, the layout accommodates selected projects and skill groupings alongside traditional work history.\n\nCoastal is strong for UK and Australian creative professionals where photos on CVs are normal and personal presentation is part of the creative brief.",
        whoFor: [
          "Art directors and creative consultants",
          "Designers in the UK, Australia, and EU markets",
          "Brand designers and creative leads",
          "Creative professionals in portfolio-first hiring processes",
        ],
        features: [
          "Teal header band creates immediate brand positioning",
          "Objective statement band for one-line creative positioning",
          "Photo integration professional and distinctive",
          "Two-column body for projects + skills alongside chronology",
          "Colour customisation to match portfolio palette",
        ],
        tier: "free",
        imgPath: "/img/templates/coastal.jpg",
        faqs: [
          {
            q: "Is Coastal template good for art director applications?",
            a: "Yes — Coastal's header brand moment suits art director applications where creative presence is expected. Particularly strong in markets where photos are standard (UK, AU, EU).",
          },
          {
            q: "Can I use Coastal without a photo for US applications?",
            a: "Yes — CVEdge lets you hide the avatar. The header teal band remains as a brand moment even without the photo, which works well for US creative applications.",
          },
        ],
      },
      {
        leafSlug: "portrait-cv",
        templateSlug: "portrait",
        displayName: "Portrait Resume for Creative Designers",
        headline: "Editorial split-weight name, headshot, and plus-marker headings on a grey canvas.",
        description:
          "Portrait is CVEdge's most editorial template. The split-weight name treatment (bold first name, light surname) combined with a circular headshot and grey canvas creates a resume that looks more like a portfolio page than a document — which is precisely the signal for senior creative, editorial, and design direction roles.\n\nThe plus-marker section headings create visual rhythm without decoration. Every element has a purpose: the weight contrast shows typography taste; the grey canvas shows restraint; the photo integration shows confidence in personal brand.\n\nFor graphic designers, editorial directors, type designers, and creative professionals from design-focused backgrounds, Portrait demonstrates the same visual judgment you'd apply to client work — but applied to yourself.\n\nPortrait is a conversation-starter in shortlist reviews: it's distinctive enough that hiring committees remember which candidate had it. For portfolio-stage hiring processes, that's valuable.",
        whoFor: [
          "Graphic designers and type designers",
          "Editorial directors and creative directors",
          "Design graduates from design schools",
          "Creative professionals targeting design agencies",
        ],
        features: [
          "Split-weight name typography demonstrates design literacy",
          "Circular headshot professional and distinctive",
          "Grey canvas creates editorial feel",
          "Plus-marker headings create visual rhythm",
          "Memorable in shortlist review — stands out in stacks",
        ],
        tier: "free",
        imgPath: "/img/templates/portrait.jpg",
        faqs: [
          {
            q: "When should I use Portrait vs Aurora for design roles?",
            a: "Portrait for senior/specialist roles at design agencies and studios where visual distinctiveness matters. Aurora for most mid-level roles and companies that use ATS portal screening.",
          },
          {
            q: "Is Portrait ATS-safe?",
            a: "Portrait has a two-column structure that most modern ATS systems handle. However, it's optimised for direct submission and portfolio-stage processes rather than high-volume automated portals.",
          },
        ],
      },
      {
        leafSlug: "orchid-cv",
        templateSlug: "orchid",
        displayName: "Orchid Resume for Creative Roles",
        headline: "Warm serif headings, editorial sidebar, and navy accent corner. Distinctive without being loud.",
        description:
          "Orchid occupies a unique position in CVEdge's template library: it combines the warmth of serif typography with a structured sidebar layout, creating a resume that feels editorial and considered rather than loud and graphic.\n\nFor creative professionals who want distinction without the visual boldness of Electric Lilac or Portrait — consultants, content strategists, brand writers, creative project managers — Orchid provides a characteristic voice that stands out in a stack of generic templates while remaining readable and formal enough for conservative creative environments.\n\nThe navy corner accent in Orchid adds visual interest without dominating. The warm sidebar carries skills and contact details; the main column leads with a strong summary and experience. The serif headings throughout create consistency and editorial feel.\n\nOrchid is particularly popular with creative writers, content directors, and copywriting leads who want their resume to feel as considered as their best work.",
        whoFor: [
          "Content strategists and creative writers",
          "Brand writers and copywriting directors",
          "Creative project managers",
          "Creative professionals who want distinction without loudness",
        ],
        features: [
          "Warm serif headings create editorial character",
          "Navy corner accent adds visual interest without dominating",
          "Warm sidebar tone is distinctive and professional",
          "Strong summary section for career narrative control",
          "Works well printed for in-person interview rounds",
        ],
        tier: "free",
        imgPath: "/img/templates/orchid.jpg",
        faqs: [
          {
            q: "Is Orchid a good template for content strategists?",
            a: "Yes — Orchid's warm, editorial feel suits content and creative strategy roles well. The serif typography signals writing sensibility, and the structured layout keeps the experience readable.",
          },
          {
            q: "What industries suit the Orchid template?",
            a: "Media, publishing, creative agencies, brand studios, and PR firms. Also works for arts administration and cultural institution roles where a distinctive but formal aesthetic is appropriate.",
          },
        ],
      },
      {
        leafSlug: "bold-accent-creative-cv",
        templateSlug: "bold-accent",
        displayName: "Bold Accent Resume for Creative Roles",
        headline: "Energetic single-column with accent chips. Creative and ATS-safe.",
        description:
          "Bold Accent brings creative energy to the ATS-safe single-column format. The accent chip system and icon-bordered sections create visual rhythm that signals creative sensibility — without any of the layout techniques (columns, images, tables) that trip up ATS parsers.\n\nFor creative professionals applying to roles that use online portals — which is most of them, even at agencies — Bold Accent is the only template in this category that delivers both strong ATS scores and genuine visual distinction.\n\nThe chip system is particularly valuable for creative multi-disciplinarians: a creative technologist listing web, animation, and branding skills; a UX writer showing copywriting, UX research, and content strategy in one place.\n\nBold Accent's energy suits growth-stage companies, creative agencies, and startups where the recruiter reviews the visual resume with the same attention a hiring manager might — they notice how you present yourself.",
        whoFor: [
          "Creative technologists and multi-disciplinary designers",
          "UX writers and content designers",
          "Creative professionals applying via ATS portals",
          "Designers at startups and growth companies",
        ],
        features: [
          "ATS-safe single column — passes all major systems",
          "Accent chips for multi-disciplinary skill display",
          "Icon-bordered sections create visual rhythm",
          "Strongest ATS score among creative templates",
          "Accent colour customisation for brand alignment",
        ],
        tier: "free",
        imgPath: "/img/templates/bold-accent.jpg",
        faqs: [
          {
            q: "Is Bold Accent the most ATS-friendly creative template?",
            a: "Yes — Bold Accent is single-column with no images or tables, making it the most ATS-safe option in the creative category. It scores 90–93 on CVEdge's ATS analyser.",
          },
          {
            q: "When should I choose Bold Accent over Electric Lilac for creative roles?",
            a: "Choose Bold Accent when applying via online portals where ATS scoring matters. Choose Electric Lilac for direct recruiter outreach or portfolio-stage processes where visual impact is the priority.",
          },
        ],
      },
    ],
  },
];

export const CATEGORY_MAP = new Map(TEMPLATE_CATEGORIES.map((c) => [c.slug, c]));

export function getLeafData(
  categorySlug: string,
  leafSlug: string
): TemplateLeafData | undefined {
  const cat = CATEGORY_MAP.get(categorySlug);
  if (!cat) return undefined;
  return cat.templates.find((t) => t.leafSlug === leafSlug);
}

export function getAllLeafParams(): { category: string; template: string }[] {
  return TEMPLATE_CATEGORIES.flatMap((c) =>
    c.templates.map((t) => ({ category: c.slug, template: t.leafSlug }))
  );
}
