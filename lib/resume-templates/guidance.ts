// Per-leaf-page guidance for /resume-templates/[category]/[template].
//
// The templates cluster is the site's strongest performer (~17% of traffic, and
// ats-friendly/harvard-cv alone is ~8%), but the leaf pages average only ~140
// words of description and 2 FAQs. This adds the substance.
//
// Keyed by `${category}/${leafSlug}` rather than by template, deliberately:
// 17 underlying templates render 32 leaf pages, so Classic appears under
// software-engineer, freshers AND ats-friendly. Keying on the template would
// serve identical copy on three URLs and rebuild the duplication problem the
// role pages just had. Everything below is written for the audience, not the
// layout — the section order a fresher needs from Classic is not the one a
// senior engineer needs from it.

export interface SectionAdvice {
  section: string;
  advice: string;
}

export interface LeafGuidance {
  /** Why this template suits this specific audience. */
  bestFor: string;
  /** Recommended section order for this audience, with the reasoning. */
  sectionOrder: { order: string[]; why: string };
  /** What belongs where, given this layout and this audience. */
  sectionAdvice: SectionAdvice[];
  /** Mistakes this audience makes with this template specifically. */
  mistakes: string[];
  /** Who should pick something else, and what instead. */
  notFor: { who: string; instead: string; insteadHref: string };
  /** Additional FAQs beyond the ones already on the leaf. */
  faqs: { q: string; a: string }[];
}

export const LEAF_GUIDANCE: Record<string, LeafGuidance> = {
  // ─── ATS Friendly ──────────────────────────────────────────────────────────

  "ats-friendly/harvard-cv": {
    bestFor:
      "The Harvard layout is the most conservative format in common use, and that is precisely why it clears applicant tracking systems without incident. It is a single column of plain text with unambiguous section headings, no tables, no sidebars and no graphics — which means the parser reads it in exactly the order you wrote it. If you are applying through a corporate portal and want to remove formatting as a variable entirely, this is the safest choice available.",
    sectionOrder: {
      order: ["Contact", "Education", "Experience", "Skills", "Certifications"],
      why: "The academic convention places Education above Experience, which is correct for students, recent graduates and academic applications. If you have more than about three years of professional experience, move Experience above Education — the format still works, and recruiters scanning a corporate application want your current role first.",
    },
    sectionAdvice: [
      { section: "Contact", advice: "Keep it on one or two plain lines in the body of the document, never in a header. Name, city, phone, email, LinkedIn. Harvard's austerity works in your favour here — there is no design element tempting you to put contact details somewhere a parser cannot reach." },
      { section: "Education", advice: "Institution, degree, dates, and honours if relevant. Include coursework only while you are a student or within a year of graduating; after that it displaces experience that matters more." },
      { section: "Experience", advice: "Reverse chronological, with bullets that lead on results. The format gives you no visual hierarchy to hide behind, so weak bullets are conspicuous — every line has to earn itself." },
      { section: "Skills", advice: "A compact grouped list near the end. This is where keyword matching does most of its work, so mirror the vocabulary of the postings you are targeting rather than your own internal jargon." },
    ],
    mistakes: [
      "Adding a photo or coloured accent to 'warm it up' — this defeats the entire reason for choosing Harvard and introduces the parsing risk you picked it to avoid.",
      "Keeping Education first at ten years' experience because the template presents it that way. The order is a default, not a rule.",
      "Treating the plainness as permission for dense paragraphs. Harvard has no visual relief, so long unbroken text is harder to scan here than in any other layout.",
      "Listing coursework and academic projects years after graduation, which signals a thin professional record.",
    ],
    notFor: {
      who: "Designers, art directors and anyone whose application is partly judged on visual craft",
      instead: "a creative layout that still parses cleanly",
      insteadHref: "/resume-templates/creative/portrait-cv",
    },
    faqs: [
      {
        q: "Is the Harvard resume template actually from Harvard?",
        a: "The format follows the conventions published in Harvard's own career-services guidance, which is where the name comes from. It is not a proprietary or licensed document — it is a widely adopted convention: single column, plain headings, education-first ordering, no graphics. Its value is that it is the most conservative structure in common use, so it behaves predictably in every applicant tracking system.",
      },
      {
        q: "Does the Harvard template work outside academia?",
        a: "Yes, and it is one of the most reliable choices for corporate portal applications. The one adjustment worth making is moving Experience above Education once you are more than a few years past graduating. Consulting, finance and law all see this format routinely, and it never reads as inappropriate — at worst it reads as plain, which in a portal application is an advantage.",
      },
      {
        q: "Will a plain template make me look less impressive than a designed one?",
        a: "To an applicant tracking system, no — plainness is strictly an advantage. To a human, the format is neutral and your content carries the impression. The risk of a designed template is that it fails to parse and never reaches the human at all; the risk of a plain one is only that it is unmemorable, which strong quantified bullets solve.",
      },
    ],
  },

  "ats-friendly/classic-cv": {
    bestFor:
      "Classic is the general-purpose ATS-safe layout: single column, standard headings, generous spacing, and Experience placed immediately after the header. Where Harvard follows an academic convention, Classic follows a corporate one — it puts your current role first and gives bullets room to breathe. If you want one template that works for almost any professional application, this is it.",
    sectionOrder: {
      order: ["Contact", "Summary", "Experience", "Skills", "Education", "Certifications"],
      why: "Experience-first is correct for anyone with professional history. The summary earns its place only if it states your specialisation, level and strongest result in three or four sentences — a generic ambition statement here wastes the most valuable space on the page.",
    },
    sectionAdvice: [
      { section: "Summary", advice: "Three or four sentences naming what you specialise in, at what level, and the single result you most want read. This block is scanned before anything else, so it should contain your strongest keywords naturally." },
      { section: "Experience", advice: "Three to five bullets for the current role, fewer as you go back. Classic's spacing rewards concise bullets — anything running past two lines loses the scanning advantage the layout gives you." },
      { section: "Skills", advice: "Group by category rather than listing thirty items in a row. Grouped lists are easier for a human to scan and parse identically for the ATS." },
      { section: "Education", advice: "Below Experience once you are a few years in. Degree, institution, year — no coursework, no modules." },
    ],
    mistakes: [
      "Shrinking margins and font size to force a second page onto one. Classic's whitespace is doing scanning work; compressing it makes the page harder to read without adding information.",
      "Writing a summary that describes what you want rather than what you have done.",
      "Using the clean layout as an excuse for unmeasured bullets — a tidy page of duties still reads as a page of duties.",
      "Adding section dividers or icons, which reintroduces parsing risk for no gain.",
    ],
    notFor: {
      who: "Senior leaders who need a board-level presence, or anyone with 15+ years to compress",
      instead: "the Executive layout",
      insteadHref: "/resume-templates/ats-friendly/executive-cv",
    },
    faqs: [
      {
        q: "What makes a template 'ATS-friendly' in practice?",
        a: "Four things: a single-column flow so reading order cannot be scrambled, standard section headings the parser recognises, contact details in the body rather than a document header, and real selectable text rather than images or icons. Classic satisfies all four by construction. Most templates that fail do so on the second or third point — a sidebar built with a table, or a name rendered as a graphic.",
      },
      {
        q: "Should I use the same Classic resume for every application?",
        a: "Use the same layout, but adjust the content. Tailoring means changing the summary's opening line to match the target role, reordering skills so the relevant ones appear first, and rewording two or three bullets toward the posting's emphasis. That takes around ten minutes and captures most of the benefit; rebuilding the document each time captures very little more.",
      },
    ],
  },

  "ats-friendly/minimal-cv": {
    bestFor:
      "Minimal strips the page to type and spacing alone — no rules, no shading, no accent colour. It parses as reliably as Classic while reading as more contemporary, which suits product, design-adjacent and startup applications where an overtly corporate document can feel dated. The trade-off is that it offers no visual scaffolding, so the writing has to carry the structure.",
    sectionOrder: {
      order: ["Contact", "Summary", "Experience", "Skills", "Education"],
      why: "Minimal's restraint means section headings do all the wayfinding. Keep the order conventional so a reader never has to hunt — the layout is already asking them to do more work than a ruled template would.",
    },
    sectionAdvice: [
      { section: "Summary", advice: "Particularly important here. With no visual anchor at the top of the page, the summary is what orients the reader — make it specific in the first line rather than building up to the point." },
      { section: "Experience", advice: "Keep bullets to one or two lines. Minimal's lack of dividers means long bullets run together visually, which undoes the clarity you chose the template for." },
      { section: "Skills", advice: "A short, deliberately curated list. Minimal punishes clutter more than any other layout — twenty comma-separated technologies look worse here than anywhere else." },
      { section: "Education", advice: "Two lines. The aesthetic depends on nothing being longer than it needs to be." },
    ],
    mistakes: [
      "Filling the whitespace. The empty space is the design; adding a skills bar chart or a coloured header defeats it and adds parsing risk.",
      "Long paragraph-style bullets, which lose all structure without dividers to separate them.",
      "Choosing Minimal for a 15-year career — at that length it becomes an undifferentiated wall of text.",
      "Reducing the font below 10pt to fit more in, which makes an already-airy layout look cramped and inconsistent.",
    ],
    notFor: {
      who: "Candidates with long careers or dense credential lists that need structural separation",
      instead: "the Ledger layout",
      insteadHref: "/resume-templates/experienced/ledger-cv",
    },
    faqs: [
      {
        q: "Is a minimal resume too plain for senior roles?",
        a: "Plainness is not the issue at senior level — length is. Minimal works well up to around eight to ten years of experience. Beyond that, a career with many roles and credentials needs more structural separation than the layout provides, and readers start to lose their place. If you are senior and want restraint, a template with clearer section rules serves you better than adding decoration to this one.",
      },
      {
        q: "Does whitespace hurt my ATS score?",
        a: "No. Parsers read text and structure, not visual density, so a spacious layout scores identically to a compressed one with the same content. What does hurt is what people do to eliminate whitespace — multi-column layouts, tables and tiny fonts. Minimal avoids all three by design.",
      },
    ],
  },

  "ats-friendly/sharp-cv": {
    bestFor:
      "Sharp uses tighter leading and firmer heading weights than Classic, which lets you fit noticeably more on a page without resorting to columns or shrinking type. It stays single-column and fully parseable. Choose it when you have more to say than Classic comfortably holds but do not want to move to two pages.",
    sectionOrder: {
      order: ["Contact", "Summary", "Experience", "Skills", "Education", "Certifications"],
      why: "Conventional order, but Sharp's density means you can carry a longer Experience section on page one — which is where you want it, since first-pass scanning rarely reaches page two.",
    },
    sectionAdvice: [
      { section: "Summary", advice: "You can afford four sentences here rather than three. Use the extra room for a second quantified result rather than more adjectives." },
      { section: "Experience", advice: "Sharp's density suits candidates with five or more roles to cover. Keep the most recent two detailed and compress older ones to one or two lines each." },
      { section: "Skills", advice: "The tighter leading lets you group more categories legibly. Still resist listing everything — density is an opportunity for more substance, not more noise." },
      { section: "Certifications", advice: "Sharp has room to list these properly with issuing body and year, which matters in fields where they are used as hard filters." },
    ],
    mistakes: [
      "Treating the extra capacity as licence to include everything. The density should buy you more detail on recent work, not the return of roles from fifteen years ago.",
      "Pushing line spacing tighter still to squeeze more in, at which point legibility collapses.",
      "Mixing bullet lengths inconsistently, which reads as untidy at this density in a way it would not in an airier layout.",
    ],
    notFor: {
      who: "Graduates and early-career candidates with limited content",
      instead: "the Minimal layout",
      insteadHref: "/resume-templates/ats-friendly/minimal-cv",
    },
    faqs: [
      {
        q: "How much more fits on a Sharp resume compared to Classic?",
        a: "Roughly fifteen to twenty percent more content on the same page, depending on how much of your text is bullets versus headings. That is usually the difference between an awkward two-page document with a nearly empty second page and a clean single page. It comes from tighter leading and more efficient heading spacing, not from a smaller body font.",
      },
      {
        q: "Is a denser resume harder for recruiters to scan?",
        a: "Only if the writing is weak. Density hurts when bullets are long and unstructured, because there is less whitespace to separate them. It helps when bullets are short and result-led, because more of the strong material sits above the fold. If your bullets already lead with outcomes, Sharp is an advantage; if they do not, fix the bullets before changing the template.",
      },
    ],
  },

  "ats-friendly/classic-serif-cv": {
    bestFor:
      "Classic Serif is the Classic structure set in a serif face. Structurally identical and equally ATS-safe, it reads as more traditional — which is an advantage in law, academia, publishing, public sector and older professional-services firms, where a sans-serif document can read as informal.",
    sectionOrder: {
      order: ["Contact", "Summary", "Experience", "Education", "Skills", "Certifications"],
      why: "In the traditional fields this template suits, Education tends to carry more weight and conventionally sits above Skills. If you are in a field where credentials are the qualification, that ordering matches the reader's expectation.",
    },
    sectionAdvice: [
      { section: "Summary", advice: "Slightly more formal register than you would use in tech. Full sentences, no fragments, and avoid startup vocabulary that will read as out of place." },
      { section: "Experience", advice: "The serif face carries longer lines more comfortably than a sans, so bullets can run slightly longer without becoming hard to read — useful where the work needs explaining rather than quantifying." },
      { section: "Education", advice: "Give this room. In law, academia and public sector, institution and classification are read carefully rather than skimmed." },
      { section: "Certifications", advice: "Write these out in full with the issuing body. Abbreviations that are obvious inside a profession are often screened on literally." },
    ],
    mistakes: [
      "Mixing the serif body with a sans-serif heading from another template, which looks unconsidered.",
      "Choosing it for a startup or tech application, where it can read as dated against the field.",
      "Setting the body below 10.5pt — serif faces need slightly more size than sans to stay comfortable.",
      "Assuming formality substitutes for evidence; traditional fields still want results, stated plainly.",
    ],
    notFor: {
      who: "Technology, startup and product applications",
      instead: "the Classic sans-serif layout",
      insteadHref: "/resume-templates/ats-friendly/classic-cv",
    },
    faqs: [
      {
        q: "Do serif fonts affect ATS parsing?",
        a: "Not in themselves. Parsers read the text layer, and any standard, properly embedded font extracts identically whether it is serif or sans. Problems arise only with decorative or non-embedded fonts, where characters can extract garbled. A conventional serif face such as the one used here is entirely safe.",
      },
      {
        q: "Which industries prefer a serif resume?",
        a: "Law, academia, government and public sector, publishing, and long-established professional-services and financial firms. The distinction is convention rather than rule — nobody rejects a sans-serif CV in these fields — but a serif document reads as fluent in the field's register, and small signals of fit accumulate.",
      },
    ],
  },

  "ats-friendly/executive-cv": {
    bestFor:
      "Executive gives more weight to the name and section headings and more separation between roles, which helps when you are compressing fifteen or more years into two pages. It remains single-column and parses cleanly. Choose it when your challenge is hierarchy across many roles rather than filling a page.",
    sectionOrder: {
      order: ["Contact", "Executive summary", "Experience", "Board & advisory", "Education", "Certifications"],
      why: "At senior level the summary carries more load — it frames scope (budget, headcount, remit) before the reader reaches any individual role. Board and advisory positions deserve their own section rather than being mixed into Experience, where they read as jobs.",
    },
    sectionAdvice: [
      { section: "Executive summary", advice: "Four or five sentences establishing scope: the size of the organisation, the size of your remit, and the outcome you are known for. This is the only place a reader learns your altitude before the detail." },
      { section: "Experience", advice: "For each senior role, add a one-line scope statement (team size, budget, P&L) before the bullets. Without it, a director's bullets can read like a manager's." },
      { section: "Board & advisory", advice: "Separate section, listed with organisation and dates. Mixing these into employment history confuses the timeline." },
      { section: "Education", advice: "Brief, at the end. At this level nobody is reading your degree classification — the exception is an MBA or a qualification that is genuinely a credential in your field." },
    ],
    mistakes: [
      "Listing every role from a thirty-year career at equal detail. Give the last ten to fifteen years the space; compress earlier roles to a line each under an 'Earlier career' heading.",
      "Omitting scope, which is the single most common weakness in senior CVs — bullets without team size, budget or remit cannot be levelled.",
      "Writing in the abstract language of strategy with no concrete outcome attached.",
      "Going to three pages when two would do — length at senior level reads as an inability to prioritise.",
    ],
    notFor: {
      who: "Candidates with under about eight years of experience",
      instead: "the Classic layout",
      insteadHref: "/resume-templates/ats-friendly/classic-cv",
    },
    faqs: [
      {
        q: "How long should an executive resume be?",
        a: "Two pages for most senior roles, occasionally three where an extensive board, publication or patent record genuinely warrants it. The constraint is not a rule about length but about editorial judgement: a reader assesses whether you can distinguish what matters. Give the last ten to fifteen years real detail and compress everything earlier into a short 'Earlier career' block.",
      },
      {
        q: "Do executives still get screened by ATS?",
        a: "Below C-suite, frequently yes — director and VP applications through corporate portals go through the same parsing and search as any other. At true C-suite level more hiring runs through search firms, where a human reads first. Since most senior candidates apply through both routes, a format that parses cleanly costs nothing and removes a risk.",
      },
    ],
  },
  // ─── Experienced Professionals ─────────────────────────────────────────────

  "experienced/executive-cv": {
    bestFor:
      "Executive is built for the specific problem of a long career: many roles, varying relevance, and a reader who will spend seconds deciding your level. Stronger heading weights and clearer separation between roles let you compress fifteen or more years into two pages while keeping the structure legible.",
    sectionOrder: {
      order: ["Contact", "Executive summary", "Experience", "Earlier career", "Board & advisory", "Education"],
      why: "The 'Earlier career' block is the mechanism that makes a long history fit. Give the last ten to fifteen years full treatment, then compress everything before it to one line per role — title, company, years — under a single heading.",
    },
    sectionAdvice: [
      { section: "Executive summary", advice: "Four or five sentences that establish scope before any individual role: organisation size, remit, and the outcome you are known for. Without this, a reader constructs your level from your most recent bullets, which usually undersells you." },
      { section: "Experience", advice: "Scope line then bullets, for each senior role. Three to five bullets on the current role, tapering to two on older ones." },
      { section: "Earlier career", advice: "One line per role. This preserves the timeline without spending page space on work from twenty years ago." },
      { section: "Board & advisory", advice: "Separate from employment. Mixing non-executive positions into Experience makes the chronology confusing and can read as job-hopping." },
    ],
    mistakes: [
      "No scope anywhere — the defining failure of senior CVs. Bullets without team size, budget or remit cannot be levelled by a reader.",
      "Equal detail across a thirty-year career, which buries the relevant decade.",
      "Strategy language with no outcome: 'drove transformation' means nothing without what changed and by how much.",
      "Three or more pages, which at this level reads as an inability to prioritise rather than as substance.",
    ],
    notFor: {
      who: "Candidates under about eight years' experience, where the weight reads as overreach",
      instead: "the Classic layout",
      insteadHref: "/resume-templates/ats-friendly/classic-cv",
    },
    faqs: [
      {
        q: "How far back should an experienced resume go?",
        a: "Give the last ten to fifteen years real detail, and compress everything earlier into a single 'Earlier career' block of one line per role. This keeps the timeline complete — gaps invite questions — while spending page space where relevance actually is. Roles from more than twenty years ago can usually be dropped entirely unless they carry unusual weight.",
      },
      {
        q: "Should I include a photo on an executive resume?",
        a: "It depends entirely on the market. In the US, UK, Canada and Ireland, no — employers frequently discard applications with photos because of discrimination-liability exposure. In much of continental Europe and across the Gulf, photos are common and sometimes expected. Match the country the role is based in rather than where you are applying from.",
      },
    ],
  },

  "experienced/executive-pro-cv": {
    bestFor:
      "Executive Pro adds a photo panel and a dark header bar to the Executive structure. It suits senior candidates in markets where a photo is conventional — the Gulf, much of continental Europe, parts of Asia — and client-facing roles where personal presence is part of the proposition. The underlying content structure is unchanged.",
    sectionOrder: {
      order: ["Header with photo", "Executive summary", "Experience", "Earlier career", "Education"],
      why: "The header carries name, title and photo together, which means your summary can start on substance immediately rather than re-establishing who you are.",
    },
    sectionAdvice: [
      { section: "Header", advice: "A professional headshot — plain background, business dress, current within a couple of years. A casual or cropped social photo does more damage here than no photo at all." },
      { section: "Executive summary", advice: "The dark bar draws the eye first, so the summary immediately below it is prime space. Lead with scope and your strongest outcome." },
      { section: "Experience", advice: "Same discipline as Executive: scope line then bullets. The added visual weight does not substitute for stating remit in words." },
      { section: "Earlier career", advice: "Compressed to one line per role, as with Executive." },
    ],
    mistakes: [
      "Using it for US, UK, Canadian or Irish applications, where a photo can get the application discarded on compliance grounds.",
      "A low-quality or informal photo, which undercuts every other signal on the page.",
      "Assuming the design carries seniority — scope still has to be stated in the text.",
      "Letting the header consume a third of page one, leaving too little room for experience.",
    ],
    notFor: {
      who: "Applications to the US, UK, Canada or Ireland",
      instead: "the photo-free Executive layout",
      insteadHref: "/resume-templates/experienced/executive-cv",
    },
    faqs: [
      {
        q: "Which countries expect a photo on a CV?",
        a: "Photos are common and often expected across the Gulf (UAE, Saudi Arabia, Qatar), in much of continental Europe including Germany and France, and in parts of Asia. They are actively discouraged in the US, UK, Canada, Ireland and Australia, where employers avoid them for discrimination-liability reasons. When in doubt, follow the convention of the country the role is based in.",
      },
      {
        q: "Does adding a photo hurt ATS parsing?",
        a: "The image itself is simply ignored by the parser — it carries no text. The real risk is what surrounds it: photo panels are often built as tables or text boxes, which can scramble reading order. This template places the photo without disturbing the single-column text flow, so the content still parses in order.",
      },
    ],
  },

  "experienced/executive-sidebar-cv": {
    bestFor:
      "Executive Sidebar moves contact details, skills and certifications into a dark sidebar, freeing the full main column for experience. It suits senior candidates with substantial credential lists — consultants, architects, certified professionals — who would otherwise spend half of page one on supporting detail before reaching any actual work.",
    sectionOrder: {
      order: ["Sidebar: contact, skills, certifications", "Main: summary, experience, education"],
      why: "The split exists to protect the main column. Anything that supports your candidacy without demonstrating it — tools, certifications, languages — belongs in the sidebar so the main column stays entirely about what you have done.",
    },
    sectionAdvice: [
      { section: "Sidebar", advice: "Contact first, then skills grouped by category, then certifications with issuing body. Keep entries to a line each — the sidebar is narrow and wraps badly with long text." },
      { section: "Summary", advice: "Top of the main column. Scope and strongest outcome, as with any senior document." },
      { section: "Experience", advice: "The full width is the point. Use it for scope lines and result-led bullets rather than allowing longer, looser sentences." },
      { section: "Education", advice: "Main column, at the end — or move it to the sidebar if you need more room for experience." },
    ],
    mistakes: [
      "Overloading the sidebar until it becomes a second document competing with the main column.",
      "Putting achievements in the sidebar. It is for supporting facts; accomplishments belong where they get read.",
      "Long certification names that wrap awkwardly in a narrow column — abbreviate with the full form given once.",
      "Choosing a two-column layout for a portal application without checking that it parses; see the FAQ below.",
    ],
    notFor: {
      who: "Applications through strict corporate portals where parsing risk is unacceptable",
      instead: "the single-column Executive layout",
      insteadHref: "/resume-templates/experienced/executive-cv",
    },
    faqs: [
      {
        q: "Are sidebar resumes safe for ATS?",
        a: "It depends how the sidebar is built, and that is not something you can see by looking. Sidebars constructed with tables or text boxes frequently parse in the wrong order, interleaving skills through your job history. This template renders as a flowing layout rather than a table, so the text extracts in a sensible order — but for a high-stakes portal application, a single-column document removes the variable entirely.",
      },
      {
        q: "What should go in the sidebar versus the main column?",
        a: "Supporting facts in the sidebar; evidence in the main column. Contact details, skills, tools, certifications, languages — these establish that you are qualified. Experience, achievements and scope belong in the main column, because that is where a reader's attention goes and where your case is actually made. If you find yourself putting an accomplishment in the sidebar, move it.",
      },
    ],
  },

  "experienced/ledger-cv": {
    bestFor:
      "Ledger uses ruled separators and a structured, almost tabular rhythm to organise a dense career. It suits finance, accounting, operations and project delivery — fields where a CV carries many discrete engagements, clients or certifications and the reader needs clear visual boundaries between them.",
    sectionOrder: {
      order: ["Contact", "Summary", "Experience", "Key projects", "Certifications", "Education"],
      why: "The separate 'Key projects' section is what makes Ledger useful for consultants and delivery professionals — engagements can be listed with client, scale and outcome without cluttering the employment chronology.",
    },
    sectionAdvice: [
      { section: "Summary", advice: "Three or four sentences naming your domain, the scale you operate at, and your strongest quantified result. Finance and operations readers expect numbers early." },
      { section: "Experience", advice: "The rules between roles do the separation, so bullets can be tightly packed without losing legibility. Lead with figures — budget managed, cost saved, cycle time reduced." },
      { section: "Key projects", advice: "Client or programme, scale, your role, outcome. One block each. This is where delivery professionals demonstrate range that the employment list alone would hide." },
      { section: "Certifications", advice: "Ledger's structure suits a proper list with issuing body and year — valuable in fields where these are screened literally." },
    ],
    mistakes: [
      "Duplicating content between Experience and Key projects, which wastes space and reads as padding.",
      "Listing every project rather than the five or six that show range and scale.",
      "Leaning on the structure while leaving bullets unquantified — in finance and operations, an unmeasured bullet is conspicuous.",
      "Adding further dividers or shading on top of the existing rules, which makes the page busy.",
    ],
    notFor: {
      who: "Candidates with a simple linear career and no discrete projects to list",
      instead: "the Executive layout",
      insteadHref: "/resume-templates/experienced/executive-cv",
    },
    faqs: [
      {
        q: "Should consultants list projects separately from employment?",
        a: "Usually yes, and it solves a real problem. A consultant's employment history may show two firms across ten years, which conceals the range of what you actually did. A separate projects section lets you show client type, engagement scale and outcome across many engagements without disturbing the chronology. Keep it to five or six that demonstrate breadth rather than listing everything.",
      },
      {
        q: "Do ruled lines and separators affect ATS parsing?",
        a: "Visual rules drawn as borders or styling are ignored by parsers — they read the text, not the decoration. The distinction that matters is whether the layout uses an actual table to position content, which can scramble reading order. Ruled separators in a single-column flow, as here, are safe.",
      },
    ],
  },

  // ─── Software Engineer ─────────────────────────────────────────────────────

  "software-engineer/classic-cv": {
    bestFor:
      "Classic is the default for engineering applications, and the reason is unglamorous: engineering hiring runs through Greenhouse, Lever and Workday, and a single-column document removes every parsing variable. It also puts Experience immediately after the header, which is where an engineering hiring manager looks first.",
    sectionOrder: {
      order: ["Contact", "Summary", "Experience", "Skills", "Projects", "Education"],
      why: "Skills sits high for engineering specifically — it is where keyword matching does most of its work, and recruiters searching for a language or framework need to find it fast. Projects go above Education once you have professional experience.",
    },
    sectionAdvice: [
      { section: "Summary", advice: "Name your specialisation and stack in the first line — 'backend engineer, 6 years, payments and identity on AWS' does more than three sentences of adjectives." },
      { section: "Experience", advice: "Every bullet should carry scale or a measured result: requests per second, latency percentiles, data volume, deploy frequency. Engineering readers rank on these and their absence is conspicuous." },
      { section: "Skills", advice: "Group as languages, frameworks, infrastructure, tools. Resist listing thirty items — a focused list of twelve substantiated by your bullets reads as depth." },
      { section: "Projects", advice: "Only if they add something your employment does not. Two with links beat six without." },
    ],
    mistakes: [
      "Listing technologies with no evidence of what you built with them — the most common engineering CV weakness.",
      "No scale anywhere, which makes every achievement unrankable and suggests low-traffic systems.",
      "Listing 'Agile', 'Scrum' and 'SDLC' as skills, which are assumed and consume scanning attention.",
      "Describing team work without indicating which parts were yours.",
    ],
    notFor: {
      who: "Engineers with 12+ years who need to compress many roles",
      instead: "the Executive layout for senior engineers",
      insteadHref: "/resume-templates/software-engineer/executive-cv",
    },
    faqs: [
      {
        q: "Should a software engineer resume be one page or two?",
        a: "One page under about five years, two beyond that. The one-page rule is genuinely enforced at some large tech companies for early-career hiring, and it is good discipline regardless — most junior CVs reach two pages through padding rather than substance. Senior engineers with real architecture and migration work to describe should use two rather than compress it out.",
      },
      {
        q: "Do I need a GitHub link on my engineering resume?",
        a: "It helps if the profile is worth visiting, and hurts if it is not. An active profile with substantial projects is genuine evidence; a profile of tutorial forks and empty repositories invites a negative inference. If your professional work is private and your GitHub is thin, leave it off and let the bullets carry the case.",
      },
    ],
  },

  "software-engineer/sharp-cv": {
    bestFor:
      "Sharp fits meaningfully more on a page than Classic without moving to columns, which suits engineers with several roles, a substantial stack and projects to cover. Common for mid-to-senior engineers who find Classic pushes them onto an awkward second page.",
    sectionOrder: {
      order: ["Contact", "Summary", "Experience", "Skills", "Projects", "Education"],
      why: "Same order as Classic — the density buys you a fuller Experience section on page one rather than a different structure.",
    },
    sectionAdvice: [
      { section: "Summary", advice: "Four sentences rather than three. Use the extra line for a second quantified result, not more description." },
      { section: "Experience", advice: "Sharp suits five or more roles. Keep the recent two detailed and taper older ones to one or two lines each." },
      { section: "Skills", advice: "The tighter leading lets you group more categories legibly — languages, frameworks, data stores, infrastructure, observability." },
      { section: "Projects", advice: "Room for three with a line of description each, if they genuinely add to the employment record." },
    ],
    mistakes: [
      "Using the extra room to resurrect roles from a decade ago rather than deepening recent work.",
      "Tightening spacing further to fit still more, at which point the page stops being scannable.",
      "Inconsistent bullet lengths, which look untidy at this density.",
    ],
    notFor: {
      who: "New graduates with limited content to fill the density",
      instead: "the Minimal layout",
      insteadHref: "/resume-templates/software-engineer/minimal-cv",
    },
    faqs: [
      {
        q: "Is it better to use a dense template or go to two pages?",
        a: "If the content genuinely warrants two pages, use two — compressing five years of substantive work into an unreadable single page helps nobody. Density is the right answer when you are marginally over one page, which is the common case at three to seven years. The failure mode to avoid is a two-page CV whose second page is a third full; that reads as poor editing.",
      },
      {
        q: "How many bullets per role for an engineering resume?",
        a: "Three to five for your current role, two to four for the previous one, one or two for anything older than about eight years. Weight detail toward recency, because that is where readers concentrate and where your skills are assumed to be sharpest. A role from ten years ago earning five bullets suggests nothing better has happened since.",
      },
    ],
  },

  "software-engineer/minimal-cv": {
    bestFor:
      "Minimal suits engineers applying to startups and product companies where an overtly corporate document can read as a poor cultural fit. It parses as safely as Classic while looking contemporary. Best at up to about eight years, before a longer history needs more structural separation.",
    sectionOrder: {
      order: ["Contact", "Summary", "Experience", "Skills", "Projects", "Education"],
      why: "Conventional order, because Minimal's lack of visual scaffolding means the reader relies entirely on headings to navigate. Predictability is doing real work here.",
    },
    sectionAdvice: [
      { section: "Summary", advice: "Especially important — with no visual anchor, this is what orients the reader. Be specific in the first line." },
      { section: "Experience", advice: "One or two lines per bullet. Without dividers, longer bullets run together and the clarity you chose the template for disappears." },
      { section: "Skills", advice: "Deliberately short. Minimal punishes clutter more than any other layout." },
      { section: "Projects", advice: "Two at most, each with a link. The aesthetic depends on restraint." },
    ],
    mistakes: [
      "Filling the whitespace with skill bars or a coloured header, which defeats the design and adds parsing risk.",
      "Paragraph-length bullets, which lose all structure here.",
      "Using it at twelve years' experience, where it becomes an undifferentiated block of text.",
    ],
    notFor: {
      who: "Senior engineers with long histories and many roles to organise",
      instead: "the Sharp layout",
      insteadHref: "/resume-templates/software-engineer/sharp-cv",
    },
    faqs: [
      {
        q: "Do startups actually care about resume design?",
        a: "Not as an aesthetic judgement, but format does carry a signal about fit. A heavily formal document with an objective statement and a photo can read as out of step at an early-stage company, in the same way an overtly casual one would in a bank. Minimal is safe in both directions — it reads as considered without reading as corporate.",
      },
      {
        q: "Should I include side projects as a software engineer?",
        a: "Only when they add something your employment does not — a technology you want to be hired for, evidence you ship independently, or genuine scale. Two strong projects with links beat six abandoned repositories. If your professional work already demonstrates the skills you are selling, the space is better spent on it.",
      },
    ],
  },

  "software-engineer/executive-cv": {
    bestFor:
      "For staff, principal and engineering-leadership candidates, the challenge changes from proving you can build to proving you set direction. Executive's stronger hierarchy gives room for a scope line under each role and for architecture and org-level outcomes that a denser layout would flatten.",
    sectionOrder: {
      order: ["Contact", "Summary", "Experience", "Technical leadership", "Skills", "Education"],
      why: "A separate technical-leadership section is where staff-plus candidates show what distinguishes them: standards adopted, platforms others build on, architecture decisions with organisational consequences.",
    },
    sectionAdvice: [
      { section: "Summary", advice: "State altitude explicitly — team size, systems owned, the scope of decisions you make. Staff engineers frequently read as senior engineers because they never say otherwise." },
      { section: "Experience", advice: "Scope line then bullets. For each role: team size, systems owned, traffic or data scale, then outcomes." },
      { section: "Technical leadership", advice: "Standards you set, platforms adopted beyond your team, mentoring, and architecture decisions with measured consequences." },
      { section: "Skills", advice: "Shorter than a mid-level CV. At this level, listing many tools reads as junior — name architectural domains instead." },
    ],
    mistakes: [
      "Bullets that describe implementation rather than direction, which levels you below where you operate.",
      "No organisational impact — staff-plus roles are judged on influence beyond your own output.",
      "Omitting team size and system scale, leaving the reader to guess your altitude.",
      "A long tools list, which at this level actively signals a more junior candidate.",
    ],
    notFor: {
      who: "Engineers below about eight years, where the weight reads as overreach",
      instead: "the Classic layout",
      insteadHref: "/resume-templates/software-engineer/classic-cv",
    },
    faqs: [
      {
        q: "How does a staff engineer resume differ from a senior one?",
        a: "By altitude of impact. A senior engineer's CV shows systems owned and delivered well. A staff engineer's shows influence beyond their own team — a standard adopted across the organisation, a platform other teams build on, a multi-quarter technical strategy, or a migration coordinated across several teams. If your bullets could belong to a strong senior engineer, you will be levelled as one.",
      },
      {
        q: "Should engineering managers use this template?",
        a: "Yes, with the content reweighted. Keep a technical section so you do not read as having left the craft, but lead with team outcomes: headcount grown, attrition, delivery predictability, and the systems your organisation owns. Hiring managers for engineering leadership are reading for whether you can build teams and set direction, with technical credibility as the qualifier rather than the case.",
      },
    ],
  },

  "software-engineer/two-column-cv": {
    bestFor:
      "Horizon places a full-width header across the top with a two-column body beneath, which lets you keep skills and education visible alongside experience rather than pushing them below the fold. It suits engineers with a broad stack who want the technology list readable without spending main-column space on it.",
    sectionOrder: {
      order: ["Header: contact, title, summary", "Left: experience", "Right: skills, education, certifications"],
      why: "The header is fixed and carries your identity and summary at full width, so both columns can start on substance. Experience takes the larger column; supporting detail takes the smaller.",
    },
    sectionAdvice: [
      { section: "Header", advice: "Name, target title, contact and a two-to-three sentence summary. Full width means it reads as a single statement rather than a cramped block." },
      { section: "Experience (left)", advice: "The wider column. Scale and results as always — the layout does not change what makes an engineering bullet work." },
      { section: "Skills (right)", advice: "Grouped by category. The narrow column suits short grouped lists and wraps badly with long entries." },
      { section: "Education & certifications (right)", advice: "Compact entries. Anything needing more than two lines belongs in the main column." },
    ],
    mistakes: [
      "Putting achievements in the right column, where they read as supporting detail rather than evidence.",
      "Long framework names or certification titles that wrap awkwardly in the narrow column.",
      "Using a two-column layout for a strict portal application without considering parsing — see below.",
      "Letting the header grow until it takes a third of page one.",
    ],
    notFor: {
      who: "Applications through strict corporate portals",
      instead: "the single-column Classic layout",
      insteadHref: "/resume-templates/software-engineer/classic-cv",
    },
    faqs: [
      {
        q: "Will a two-column resume fail an ATS?",
        a: "Not automatically, but it introduces a risk single-column layouts do not have. The failure mode is a layout built with tables, where the parser reads across rows and interleaves your skills through your job history. This template flows as text rather than a table, so it extracts in a sensible order — but for an application that really matters, a single-column version removes the question entirely.",
      },
      {
        q: "How do I check whether my resume parses correctly?",
        a: "Open the PDF, select all, copy, and paste into a plain text editor. What appears is approximately what a parser extracts. Check three things: are your contact details present, is the reading order sensible, and did every section survive? If skills appear spliced through your job history, the layout is being read across columns and you should switch to single-column.",
      },
    ],
  },

  // ─── Freshers & Entry Level ────────────────────────────────────────────────

  "freshers/classic-cv": {
    bestFor:
      "Graduates have the opposite problem to experienced candidates: not too much to say, but too little, and a temptation to compensate with design. Classic removes that temptation. Its generous spacing means a genuinely light CV still fills a page honestly, and its single-column structure clears every campus-recruitment portal without incident.",
    sectionOrder: {
      order: ["Contact", "Education", "Projects", "Internships & experience", "Skills", "Activities"],
      why: "Education leads while it is your strongest credential — for the first year or two after graduating. Projects sit high because for a graduate they are the closest thing to evidence of applied work, and often more persuasive than a short internship.",
    },
    sectionAdvice: [
      { section: "Education", advice: "Institution, degree, classification and graduation year. Include relevant coursework only if it maps directly to the role, and drop it entirely within a year of graduating." },
      { section: "Projects", advice: "The most important section on a graduate CV. Two or three, each with what you built, the technology, and — critically — an outcome or scale. 'Built a booking app' is weak; 'built a booking app used by 200 students across three societies' is not." },
      { section: "Internships & experience", advice: "Include non-graduate work. Retail and hospitality demonstrate reliability and customer handling, and an empty experience section is worse than an honest one." },
      { section: "Skills", advice: "Only what you can be questioned on. Listing a language you used once in a tutorial is a trap you set for yourself." },
    ],
    mistakes: [
      "An objective statement — 'seeking a challenging role where I can grow' — which wastes the most valuable block on the page saying nothing.",
      "Padding to two pages. One well-filled page is stronger than two thin ones, and readers notice.",
      "Listing every technology ever touched, which invites questions you cannot answer.",
      "Omitting non-graduate jobs out of embarrassment; part-time work shows reliability and is better than blank space.",
      "Rating skills out of five or with progress bars — these carry no text for a parser and no meaning for a reader.",
    ],
    notFor: {
      who: "Graduates applying to design or creative roles where visual judgement is assessed",
      instead: "a creative layout",
      insteadHref: "/resume-templates/creative/portrait-cv",
    },
    faqs: [
      {
        q: "What goes on a resume when you have no work experience?",
        a: "Education, projects, coursework that maps to the role, internships, part-time work, volunteering and society positions. Projects do the heaviest lifting — they are the closest thing to professional evidence you have, so give them detail: what you built, the technology, and any outcome or usage. Committee roles and part-time jobs demonstrate reliability and teamwork, which employers genuinely screen for at this level.",
      },
      {
        q: "Should a fresher resume be one page?",
        a: "Yes, essentially always. With under two years of experience there is rarely enough substantive material for two pages, and padding is obvious to anyone who reads CVs regularly. A full, well-organised single page reads as focused; a two-page CV with a half-empty second page reads as inexperienced in a way the content itself might not have.",
      },
      {
        q: "Do I include my GPA or classification?",
        a: "Include it when it is strong — a first, a 2:1, or roughly 3.5+ on a 4.0 scale — and omit it otherwise. Some graduate schemes and campus programmes require it, in which case include it regardless. Once you have two or three years of professional experience, drop it entirely; nobody is assessing you on it by then.",
      },
    ],
  },

  "freshers/minimal-cv": {
    bestFor:
      "Minimal suits graduates applying to startups, product companies and modern tech employers, where a formal corporate document can read as a poor fit. Its restraint also flatters a light CV — there is no dense structure sitting half-empty, which is the trap graduates fall into with heavier layouts.",
    sectionOrder: {
      order: ["Contact", "Education", "Projects", "Experience", "Skills"],
      why: "Same graduate logic as Classic, but keep it tighter still. Minimal depends on nothing being longer than it needs to be, so drop the activities section unless a role there genuinely demonstrates something.",
    },
    sectionAdvice: [
      { section: "Education", advice: "Two or three lines. Institution, degree, year, classification if strong." },
      { section: "Projects", advice: "Two, described well, each with a link. Minimal rewards depth over breadth — three sentences on one real project beat one line on four." },
      { section: "Experience", advice: "Internships and part-time work, one or two bullets each with an outcome where you can name one." },
      { section: "Skills", advice: "A single short grouped line. This layout makes a long skills list look particularly padded." },
    ],
    mistakes: [
      "Adding graphics or skill bars to fill the whitespace, which defeats the design and adds parsing risk.",
      "Stretching thin content across a full page with oversized spacing, which is transparent.",
      "Using a casual register because the design is modern — the writing should still be professional.",
    ],
    notFor: {
      who: "Graduate schemes at banks, law firms and traditional professional services",
      instead: "the Classic Serif layout",
      insteadHref: "/resume-templates/freshers/classic-serif-cv",
    },
    faqs: [
      {
        q: "Is a minimal resume too informal for graduate applications?",
        a: "It depends on the employer, not the format. At startups, product companies and most modern tech employers it reads as current and considered. At banks, law firms, consultancies and traditional graduate schemes, a more conventional document matches the register better. The design is neutral either way — what would actually read as informal is casual language, which you control separately.",
      },
      {
        q: "How do I fill a page with limited experience?",
        a: "With substance rather than spacing. Expand projects — what the problem was, what you built, what technology, what happened. Add relevant coursework, a short section on societies or volunteering with actual responsibilities, and any part-time work. If it is still thin, that is a signal to go and build something small rather than to increase the line spacing.",
      },
    ],
  },

  "freshers/sharp-cv": {
    bestFor:
      "Sharp suits technical graduates who genuinely have material — several projects, a hackathon record, internships and a real stack. Its density lets all of that sit on one page without shrinking type, which is the usual failure when a technical graduate outgrows a spacious layout.",
    sectionOrder: {
      order: ["Contact", "Education", "Technical skills", "Projects", "Internships", "Achievements"],
      why: "Technical skills move above Projects here, because for technical graduate roles recruiters search on stack first. Sharp's density means this does not push your projects below the fold.",
    },
    sectionAdvice: [
      { section: "Technical skills", advice: "Grouped as languages, frameworks, tools. Be honest about depth — separate what you have used substantially from what you have only tried." },
      { section: "Projects", advice: "Three, each with technology, what you built, and usage or scale if any. Links to repositories or deployments, which reviewers for technical roles genuinely follow." },
      { section: "Internships", advice: "What you actually contributed, not what the team did. One or two bullets with a result." },
      { section: "Achievements", advice: "Hackathon placements, competitive programming ranking, published work, scholarships. Only where genuinely notable." },
    ],
    mistakes: [
      "Listing twenty technologies from tutorials, which collapses under a single interview question.",
      "Projects with no link and no outcome, which are indistinguishable from coursework.",
      "Using the density to include school-level achievements alongside university ones.",
      "Claiming a framework because you followed a tutorial in it — technical interviewers probe the stack you list.",
    ],
    notFor: {
      who: "Non-technical graduates with fewer projects to list",
      instead: "the Classic layout",
      insteadHref: "/resume-templates/freshers/classic-cv",
    },
    faqs: [
      {
        q: "How many projects should a technical fresher include?",
        a: "Two or three, described properly, with links. More than that and each gets too little detail to be convincing; fewer and you may not have shown enough range. Prioritise projects where you can state usage, scale or a genuine technical challenge you solved — a project nobody used but that solved a hard problem is still worth more than three tutorial builds.",
      },
      {
        q: "Do hackathons and competitive programming count as experience?",
        a: "They count as evidence, which is what matters when you have no employment history. A hackathon win, a strong competitive-programming rating or an open-source contribution all demonstrate applied capability under real constraints. List them under achievements rather than experience, and give the placement or ranking — 'participated' carries far less than 'placed second of 140 teams'.",
      },
    ],
  },

  "freshers/classic-serif-cv": {
    bestFor:
      "Classic Serif is the right register for graduate schemes at banks, law firms, consultancies, the civil service and traditional professional services — fields where applications are read against a conservative convention and a modern sans-serif document can read as slightly off-key.",
    sectionOrder: {
      order: ["Contact", "Education", "Work experience", "Positions of responsibility", "Skills", "Interests"],
      why: "'Positions of responsibility' is conventional in traditional graduate recruitment and worth a section of its own — society committees, course representation and team captaincies are read as leadership evidence at this level.",
    },
    sectionAdvice: [
      { section: "Education", advice: "Full detail: institution, degree, classification, and relevant modules. Traditional graduate recruiters read this section carefully rather than skimming it." },
      { section: "Work experience", advice: "Vacation schemes, internships, insight days and part-time work. Write in full sentences — the register here is more formal than in tech." },
      { section: "Positions of responsibility", advice: "Committee roles, society positions, sports captaincy, course representation. Name what you were responsible for and any outcome — 'grew membership from 40 to 110'." },
      { section: "Interests", advice: "Genuinely conventional in this sector and often used as interview small talk. Two lines, specific rather than generic — 'long-distance running, completed two marathons' beats 'sport'." },
    ],
    mistakes: [
      "Using startup vocabulary, which reads as unfamiliar with the sector's register.",
      "Omitting positions of responsibility, which traditional recruiters explicitly look for.",
      "Generic interests — 'reading, travelling, socialising' — which occupy space and say nothing.",
      "Setting the serif body below 10.5pt, where it becomes uncomfortable to read.",
    ],
    notFor: {
      who: "Technology and startup graduate applications",
      instead: "the Sharp layout",
      insteadHref: "/resume-templates/freshers/sharp-cv",
    },
    faqs: [
      {
        q: "What do banks and law firms look for on a graduate CV?",
        a: "Academic record, evidence of commitment to the sector, and positions of responsibility. Classification and institution carry more weight than in most industries; vacation schemes and insight days demonstrate genuine interest; committee and leadership roles are read as evidence of the soft skills they cannot assess from grades. Presentation is expected to be conventional and error-free — typos are treated as disqualifying more readily than elsewhere.",
      },
      {
        q: "Should I include an interests section?",
        a: "In traditional graduate recruitment, yes — it is conventional and interviewers frequently open with it. Make it specific and true, because you will be asked. Two lines naming genuine pursuits with some substance behind them works; a generic list of 'reading, travelling, music' occupies space without contributing anything and can read as filler.",
      },
    ],
  },

  "freshers/bold-accent-cv": {
    bestFor:
      "Bold Accent adds a single accent colour to headings and chips over an otherwise conventional single-column structure. For graduates it gives a document some personality without the parsing risk of a genuinely designed layout — useful in marketing, media, communications and startup applications.",
    sectionOrder: {
      order: ["Contact", "Education", "Experience & internships", "Projects", "Skills"],
      why: "Standard graduate ordering. The accent handles differentiation, so the structure should stay conventional — a reader should never have to work out where anything is.",
    },
    sectionAdvice: [
      { section: "Education", advice: "Conventional and brief. The accent colour on the heading gives it presence without needing extra content." },
      { section: "Experience & internships", advice: "Include part-time and campus work. Bullets with outcomes, however modest — 'handled 60 covers a shift' is a real number." },
      { section: "Projects", advice: "Campaigns, portfolios, society work, coursework with a real audience. For marketing-adjacent applications these matter more than technical detail." },
      { section: "Skills", advice: "The chip styling suits short grouped terms. Keep them to things you could discuss for two minutes." },
    ],
    mistakes: [
      "Adding a second and third accent colour, which turns a considered document into a busy one.",
      "Choosing an accent with poor contrast against white — it must remain legible printed in greyscale.",
      "Assuming the colour compensates for thin content; it does not.",
      "Using it for conservative graduate schemes where it reads as trying too hard.",
    ],
    notFor: {
      who: "Banking, law and traditional professional-services graduate schemes",
      instead: "the Classic Serif layout",
      insteadHref: "/resume-templates/freshers/classic-serif-cv",
    },
    faqs: [
      {
        q: "Is colour on a resume unprofessional?",
        a: "A single restrained accent on headings is fine in most sectors and unremarkable in marketing, media, design and startups. What reads as unprofessional is several colours, large blocks of saturated background, or colour used to convey meaning that disappears in greyscale printing. One accent, used consistently, is a design decision rather than a risk.",
      },
      {
        q: "Does colour affect ATS parsing?",
        a: "No. Parsers read the text layer and ignore styling entirely, so coloured headings extract exactly as plain ones do. The parsing risks are structural — tables, text boxes, multi-column layouts, and text rendered as images. This template keeps a single-column text flow, so the accent is purely visual and carries no cost.",
      },
    ],
  },

  // ─── Marketing ─────────────────────────────────────────────────────────────

  "marketing/aurora-cv": {
    bestFor:
      "Aurora uses a two-column structure with chip-styled skill groupings, which suits marketing CVs specifically: marketers accumulate long lists of channels, platforms and tools that read badly as prose but scan well as chips. It keeps those visible without spending main-column space on them.",
    sectionOrder: {
      order: ["Header: contact, title, summary", "Main: experience, campaigns", "Side: channels, tools, certifications"],
      why: "Campaign work deserves separation from employment history — a marketer's case is usually made by specific campaigns and their numbers rather than by the sequence of job titles.",
    },
    sectionAdvice: [
      { section: "Summary", advice: "Name your channel specialism and the metric you own. 'Performance marketer, paid social and search, £2M annual budget, 3.1x blended ROAS' establishes everything in one line." },
      { section: "Experience", advice: "Every bullet needs a number — spend managed, CAC, ROAS, conversion rate, pipeline generated. Marketing is one of the most quantifiable disciplines and unmeasured bullets are conspicuous." },
      { section: "Campaigns", advice: "Two or three with objective, budget, channel mix and result. This is where range shows in a way employment history alone cannot." },
      { section: "Channels & tools (side)", advice: "Chips work well here — Meta, Google Ads, HubSpot, GA4, Klaviyo. Group by function rather than listing alphabetically." },
    ],
    mistakes: [
      "Vanity metrics — impressions and reach — where the reader wants efficiency and revenue.",
      "Claiming campaign results from a large team without stating your specific role.",
      "Tool lists as the main qualification; every marketer lists the same platforms.",
      "No budget scale anywhere, which makes the level you operate at impossible to judge.",
    ],
    notFor: {
      who: "Applications through strict corporate portals where two-column parsing is a risk",
      instead: "the single-column Bold Accent layout",
      insteadHref: "/resume-templates/marketing/bold-accent-cv",
    },
    faqs: [
      {
        q: "What metrics should a marketing resume show?",
        a: "Efficiency and revenue rather than volume. Budget managed, customer acquisition cost, return on ad spend, conversion rate, pipeline or revenue attributed, retention and lifecycle metrics. Impressions, reach and follower counts are weak on their own because they do not demonstrate commercial judgement. The strongest marketing bullets pair a result with the spend behind it — a 40% lift on a £2M budget is a different achievement to the same lift on £20k.",
      },
      {
        q: "How do I show campaign results I did not solely own?",
        a: "State your specific contribution alongside the team outcome, and be straightforward about it. 'Owned paid social within a £2M integrated campaign; the channel delivered 3.4x ROAS against a 2.5x target' is credible and verifiable. Claiming an entire campaign's results when you ran one channel is the fastest way to lose credibility in an interview, because the follow-up questions expose it immediately.",
      },
    ],
  },

  "marketing/bold-accent-cv": {
    bestFor:
      "Bold Accent keeps a single-column structure with accent-coloured headings and chips, which makes it the safest choice when a marketing application goes through a corporate portal. You get some visual personality — relevant when applying for a role that involves brand judgement — without the parsing risk of a genuine two-column design.",
    sectionOrder: {
      order: ["Contact", "Summary", "Experience", "Campaign highlights", "Channels & tools", "Education"],
      why: "Campaign highlights sit directly after experience so the reader encounters your strongest specific results immediately after the chronology that contextualises them.",
    },
    sectionAdvice: [
      { section: "Summary", advice: "Channel specialism, budget scale, headline metric. Three sentences maximum." },
      { section: "Experience", advice: "Numbers on every bullet. State the budget you controlled — it is the clearest signal of the level you operate at." },
      { section: "Campaign highlights", advice: "Objective, budget, channels, result. Two or three, chosen to show range rather than repetition." },
      { section: "Channels & tools", advice: "The chip styling suits this. Group by function — paid, lifecycle, analytics, content." },
    ],
    mistakes: [
      "More than one accent colour, which undermines the restraint that makes it work.",
      "An accent that fails contrast or disappears when printed in greyscale.",
      "Listing platforms without the outcomes achieved on them.",
      "Reach and impressions where efficiency metrics belong.",
    ],
    notFor: {
      who: "Brand and creative marketing roles where visual craft is part of the assessment",
      instead: "the Electric Lilac layout",
      insteadHref: "/resume-templates/marketing/electric-lilac-cv",
    },
    faqs: [
      {
        q: "Should a marketing resume look designed?",
        a: "It should look considered, which is not the same thing. For performance, growth and lifecycle roles, a clean document with strong numbers outperforms a designed one — the assessment is analytical. For brand, creative and content-led roles, some visual judgement is genuinely part of the signal. Bold Accent sits deliberately in the middle: enough personality to avoid looking indifferent, conventional enough to parse anywhere.",
      },
      {
        q: "How much does budget size matter on a marketing CV?",
        a: "A great deal, because it is the clearest proxy for level. Managing £50k a year and managing £5M are different jobs requiring different judgement, and a reader cannot infer which you did from percentage improvements alone. State the budget you personally controlled, and if it grew during your tenure, say so — that trajectory is itself evidence.",
      },
    ],
  },

  "marketing/coastal-cv": {
    bestFor:
      "Coastal pairs a teal header band with an objective statement and optional photo, giving a warmer, more personal register than most professional templates. It suits brand, communications and agency-side marketing roles, and markets where a photo is conventional.",
    sectionOrder: {
      order: ["Header: photo, name, title", "Objective band", "Experience", "Campaigns", "Skills", "Education"],
      why: "The objective band is prominent by design, so it has to earn that placement — treat it as a positioning statement about what you do, never as a statement about what you want.",
    },
    sectionAdvice: [
      { section: "Header", advice: "If including a photo, use a professional one. If applying to the US, UK, Canada or Ireland, omit it — the template works without." },
      { section: "Objective band", advice: "Rewrite this as a positioning line: specialism, scale, strongest result. A traditional objective — 'seeking a role where I can grow' — wastes the most prominent block on the page." },
      { section: "Experience", advice: "Quantified as with any marketing CV. The warmer design does not change what makes the content persuasive." },
      { section: "Campaigns", advice: "Particularly valuable for agency candidates, where client range matters as much as tenure." },
    ],
    mistakes: [
      "Leaving the objective band as a literal objective statement, which is the single biggest waste of space available on this layout.",
      "Including a photo for US or UK applications.",
      "Letting the header and band consume half of page one before any experience appears.",
      "Assuming a warmer design means a looser writing register.",
    ],
    notFor: {
      who: "US and UK corporate applications where photos are a liability",
      instead: "the Bold Accent layout",
      insteadHref: "/resume-templates/marketing/bold-accent-cv",
    },
    faqs: [
      {
        q: "Should I use an objective statement on my resume?",
        a: "Not in its traditional form. An objective describing what you want — 'seeking a challenging role that utilises my skills' — tells the reader nothing they can act on and occupies the most valuable space on the page. Replace it with a positioning statement: what you specialise in, at what scale, and your strongest result. Same location, entirely different value.",
      },
      {
        q: "Is a photo appropriate on a marketing resume?",
        a: "It depends on the market rather than the discipline. Photos are conventional across the Gulf, much of continental Europe and parts of Asia. In the US, UK, Canada and Ireland they create discrimination-liability exposure and applications containing them are frequently discarded. Agency and client-facing roles in photo-friendly markets are where they genuinely help.",
      },
    ],
  },

  "marketing/clean-sidebar-cv": {
    bestFor:
      "Clean Sidebar puts skills, tools and metrics in a warm-toned sidebar with proficiency bars, leaving the main column for experience. It suits marketing analysts and performance marketers whose tool stack is long and genuinely relevant — the sidebar keeps it visible without consuming the space where results are described.",
    sectionOrder: {
      order: ["Sidebar: contact, tools, channels, certifications", "Main: summary, experience, campaigns"],
      why: "Analytical marketing roles are screened on tooling as well as outcomes. The sidebar satisfies that scan while the main column carries the case.",
    },
    sectionAdvice: [
      { section: "Sidebar", advice: "Group tools by function — analytics, paid, lifecycle, BI. Keep each entry to a line; the column is narrow and wraps poorly." },
      { section: "Summary", advice: "Lead with the analytical angle: the metrics you own and the scale of spend or audience behind them." },
      { section: "Experience", advice: "The full main column is for results. Attribution methodology, testing programmes and efficiency gains belong here, not in the sidebar." },
      { section: "Campaigns", advice: "Structure each as objective, budget, method, result — analytical readers want the method." },
    ],
    mistakes: [
      "Proficiency bars — they convey no text to a parser and no meaningful information to a reader. Prefer grouped lists.",
      "Overloading the sidebar until it competes with the main column.",
      "Putting achievements in the sidebar, where they read as supporting detail.",
      "Long platform names that wrap awkwardly in the narrow column.",
    ],
    notFor: {
      who: "Applications through strict portals, or candidates with short tool lists",
      instead: "the single-column Bold Accent layout",
      insteadHref: "/resume-templates/marketing/bold-accent-cv",
    },
    faqs: [
      {
        q: "Are skill proficiency bars a good idea?",
        a: "No, and they are worth actively removing. A bar filled to four-fifths carries no text for a parser to read and no shared meaning for a human — your 80% in SQL and someone else's are not comparable. The space is better spent on a grouped list of tools with the outcomes you achieved using them appearing in your experience bullets, which is verifiable.",
      },
      {
        q: "What belongs in a sidebar versus the main column?",
        a: "Supporting facts in the sidebar; evidence in the main column. Contact details, tools, channels, certifications and languages establish that you are qualified. Experience, campaign results and scope demonstrate it. If you find yourself putting an achievement in the sidebar, move it — that is the material a reader most needs to encounter.",
      },
    ],
  },

  "marketing/electric-lilac-cv": {
    bestFor:
      "Electric Lilac uses a saturated sidebar and confident colour throughout. It is deliberately the most visually assertive template in the marketing set, and suits creative marketing, brand and agency applications where visual judgement is part of what is being assessed and the CV itself functions as a small work sample.",
    sectionOrder: {
      order: ["Sidebar: contact, skills, tools", "Main: summary, experience, campaigns, education"],
      why: "The colour draws the eye to the sidebar first, so contact and specialism should sit at the top of it — a reader's first fixation should land on who you are and what you do.",
    },
    sectionAdvice: [
      { section: "Sidebar", advice: "Contact, then a short specialism line, then grouped tools. Keep it disciplined; a saturated column filled with text becomes hard to read." },
      { section: "Summary", advice: "Brand and creative roles want voice as well as substance. This is the one place a distinctive register is an asset rather than a risk — while still naming a concrete result." },
      { section: "Experience", advice: "Numbers still required. Creative roles are not exempt from proving commercial effect, and candidates who assume otherwise are the ones who get filtered." },
      { section: "Campaigns", advice: "Include a link to portfolio work. For creative marketing applications, reviewers genuinely click." },
    ],
    mistakes: [
      "Using it for a conservative corporate application, where it reads as misjudging the audience.",
      "Letting the design substitute for results — assertive visuals with unquantified bullets is the worst combination.",
      "Poor contrast between the saturated background and its text, which fails both accessibility and greyscale printing.",
      "No portfolio link, in a discipline where the work is the evidence.",
    ],
    notFor: {
      who: "Performance, growth and analytical marketing roles, or corporate portal applications",
      instead: "the Aurora layout",
      insteadHref: "/resume-templates/marketing/aurora-cv",
    },
    faqs: [
      {
        q: "Can a bold resume design hurt my application?",
        a: "It can, when the audience is wrong. In brand, creative and agency contexts a confident document signals visual judgement and is read as relevant. In performance marketing, corporate in-house teams and anything routing through a strict portal, it reads as misjudging the room — and carries parsing risk on top. The design is a message about fit; send it deliberately.",
      },
      {
        q: "Do creative marketing roles still need metrics on the CV?",
        a: "Yes, and this is where creative candidates most often lose ground. Brand and creative work has measurable effects — awareness lift, engagement rate, campaign reach against budget, sales impact, pitch win rate. A CV that presents beautiful work with no commercial outcome invites the concern that you do not think about effect, which is the main reservation hiring managers hold about creative candidates.",
      },
    ],
  },

  // ─── Creative Roles ────────────────────────────────────────────────────────

  "creative/portrait-cv": {
    bestFor:
      "Portrait uses a split-weight name treatment, a photo and plus-marker headings on a grey canvas. It is designed for candidates whose CV is read partly as a work sample — product designers, art directors, illustrators — where a purely functional document can read as indifference to craft.",
    sectionOrder: {
      order: ["Header: name, photo, title", "Selected work", "Experience", "Skills & tools", "Education"],
      why: "'Selected work' above employment history is the key inversion for creative roles. Reviewers want to see what you have made before they read where you worked, and a portfolio link belongs above the fold rather than buried in contact details.",
    },
    sectionAdvice: [
      { section: "Header", advice: "Portfolio URL in the header, not the footer. It is the most important link on a creative CV and reviewers look for it immediately." },
      { section: "Selected work", advice: "Three projects with the problem, your specific contribution, and the outcome. On a team project, state precisely what was yours — reviewers assume the least when contribution is unclear." },
      { section: "Experience", advice: "Shorter than on a conventional CV, because the work section carries the case. Two or three bullets per role with outcomes." },
      { section: "Skills & tools", advice: "Tools grouped, plus craft skills. Do not use star ratings — they carry no information." },
    ],
    mistakes: [
      "No portfolio link, which for a creative application is close to disqualifying.",
      "Final visuals with no reasoning — reviewers assess decisions, not decoration.",
      "Ambiguous credit on team projects, which reads as overclaiming.",
      "A CV whose own typography is inconsistent, since the document is itself a work sample.",
    ],
    notFor: {
      who: "Applications through corporate portals, or markets where photos are a liability",
      instead: "a clean single-column layout",
      insteadHref: "/resume-templates/ats-friendly/minimal-cv",
    },
    faqs: [
      {
        q: "Does a creative resume still need to pass an ATS?",
        a: "It depends on the route. Studio and agency applications frequently go direct to a hiring manager or through a portfolio platform, where a designed CV is read by a person. In-house creative roles at larger companies usually route through the same portal as every other application, and there a designed layout carries genuine risk. The practical answer is to keep two versions: a designed one for direct applications, a plain one for portals.",
      },
      {
        q: "What matters more, the CV or the portfolio?",
        a: "The portfolio, decisively — it is what gets you the conversation. The CV's job is to establish level, scope and context quickly, and to get the reviewer to the portfolio. That is why the link belongs in the header rather than the footer, and why 'selected work' sits above employment history. A strong CV rarely rescues a weak portfolio; a strong portfolio frequently survives an ordinary CV.",
      },
    ],
  },

  "creative/orchid-cv": {
    bestFor:
      "Orchid pairs a warm sidebar with serif accent headings and a navy corner detail — more editorial than most creative templates, and less assertive than the colour-led options. It suits content design, editorial, brand strategy and creative roles where restraint reads as sophistication rather than caution.",
    sectionOrder: {
      order: ["Sidebar: contact, skills, tools", "Main: profile, selected work, experience, education"],
      why: "The editorial register suits a written profile rather than a bulleted summary. Two or three sentences with actual voice work better here than a clipped list.",
    },
    sectionAdvice: [
      { section: "Profile", advice: "Written rather than bulleted. Orchid's serif headings set an editorial tone, and a profile with genuine voice matches it — while still naming specialism and a concrete result." },
      { section: "Selected work", advice: "Three pieces with context and outcome. For editorial and content roles, include publication, audience size or engagement where you have it." },
      { section: "Experience", advice: "Concise. The main column is narrower than a single-column layout, so long bullets wrap more — keep them to two lines." },
      { section: "Sidebar", advice: "Contact, tools, and any languages. Short entries only; the warm background makes dense text harder to read." },
    ],
    mistakes: [
      "Mixing additional decorative fonts with the existing serif, which undoes the considered typography.",
      "Long bullets that wrap badly in the narrower main column.",
      "Treating an editorial register as licence to omit results.",
      "Overfilling the sidebar until the warm panel becomes visually heavy.",
    ],
    notFor: {
      who: "Technology and product applications where the editorial register reads as off-key",
      instead: "the Minimal layout",
      insteadHref: "/resume-templates/ats-friendly/minimal-cv",
    },
    faqs: [
      {
        q: "Should a creative CV have personality in the writing as well as the design?",
        a: "In content, editorial, brand and copy roles, yes — the writing is a work sample and a flat corporate register undersells you. In most other creative disciplines, clarity beats voice: a product designer is assessed on reasoning, not prose style. Either way, personality supplements evidence rather than replacing it. A CV with voice and no outcomes reads as style over substance, which is the specific reservation creative hiring managers carry.",
      },
      {
        q: "Do serif fonts work for creative roles?",
        a: "Yes, and they differentiate — most creative CVs default to a sans-serif. A well-set serif reads as editorial and considered, which suits content, brand and publishing contexts particularly. What matters is consistency: one serif family used properly is a design decision, while a serif mixed with two other faces is a signal that you do not have typographic control.",
      },
    ],
  },

  "creative/aurora-cv": {
    bestFor:
      "Aurora's chip-based skill groupings and two-column body suit creative generalists with a broad tool range — designers who work across product, brand and motion, or creatives whose stack spans several disciplines. The chips make a wide range legible without turning into a wall of commas.",
    sectionOrder: {
      order: ["Header: contact, title, summary", "Main: selected work, experience", "Side: tools, disciplines"],
      why: "For creative roles, selected work leads the main column. The side column carries the tool range, which is where generalists otherwise lose main-column space.",
    },
    sectionAdvice: [
      { section: "Summary", advice: "Name your disciplines explicitly — 'product and brand designer' rather than 'creative professional'. Generalists are hard to place, and vagueness makes it harder." },
      { section: "Selected work", advice: "Three projects spanning your disciplines, each with problem, contribution and outcome. Range is your case, so choose for breadth." },
      { section: "Experience", advice: "Two or three bullets per role. Include a portfolio link if different from the header." },
      { section: "Tools & disciplines (side)", advice: "Chips grouped by discipline — design, motion, prototyping, research. Grouping is what makes a broad list read as range rather than as scatter." },
    ],
    mistakes: [
      "Presenting as a generalist without naming disciplines, which makes you hard to shortlist for anything specific.",
      "Chips listing every tool ever opened, which dilutes the ones that matter.",
      "Work samples that all show the same discipline, which undercuts a breadth claim.",
      "No portfolio link.",
    ],
    notFor: {
      who: "Specialists who want depth in one discipline read clearly",
      instead: "the Portrait layout",
      insteadHref: "/resume-templates/creative/portrait-cv",
    },
    faqs: [
      {
        q: "Is being a creative generalist a disadvantage when applying?",
        a: "It is at large companies that hire by discipline, and an advantage at startups and agencies where one person covers several. The way to make it work is to name a primary discipline and present the others as range rather than claiming equal depth in all — 'product designer who also does motion and brand' places you clearly, while 'creative professional' places you nowhere. Ambiguity, not breadth, is what makes generalists hard to hire.",
      },
      {
        q: "How many tools should a creative CV list?",
        a: "Enough to show range, few enough that each is credible — roughly eight to twelve, grouped by discipline. Grouping matters more than count: four tools under 'prototyping' and four under 'motion' reads as structured capability, while twelve in one undifferentiated row reads as a list of things you have opened. And expect to be asked about any of them.",
      },
    ],
  },

  "creative/coastal-cv": {
    bestFor:
      "Coastal's teal header, photo and objective band give a warm, approachable register that suits client-facing creative work — agency roles, freelance positioning, and creative services where personal rapport is part of the proposition.",
    sectionOrder: {
      order: ["Header: photo, name, title", "Positioning band", "Selected work", "Experience", "Skills"],
      why: "The band is the most prominent block on the page, so it must carry positioning rather than an objective. For freelance and agency candidates this is effectively your pitch line.",
    },
    sectionAdvice: [
      { section: "Header", advice: "Photo where the market supports it; omit for US and UK applications. Portfolio URL belongs here." },
      { section: "Positioning band", advice: "What you do, for whom, with what result. 'Brand designer for early-stage consumer startups — 14 identities shipped, 3 through to Series A' rather than a statement of what you are seeking." },
      { section: "Selected work", advice: "Client name where you can share it, the brief, your contribution, the outcome. Client recognition carries real weight in agency hiring." },
      { section: "Experience", advice: "Concise. For freelancers, structure by engagement rather than employment." },
    ],
    mistakes: [
      "Leaving the band as a traditional objective statement, wasting the most prominent space available.",
      "Including a photo for US or UK applications.",
      "Naming clients you cannot discuss, or breaching an NDA to do it.",
      "No outcomes on creative work, which is the most common weakness in agency CVs.",
    ],
    notFor: {
      who: "In-house corporate creative roles applying through portals",
      instead: "the Minimal layout",
      insteadHref: "/resume-templates/ats-friendly/minimal-cv",
    },
    faqs: [
      {
        q: "How should freelancers structure a resume?",
        a: "By engagement rather than employment. List your practice as the constant — 'Independent brand designer, 2021–present' — then present selected client engagements beneath it with brief, contribution and outcome. This avoids the appearance of job-hopping that a list of short client stints creates, and it foregrounds the range of work, which is what a client or agency is actually assessing.",
      },
      {
        q: "Can I name clients on my CV?",
        a: "Where the work is public and no NDA covers it, yes — client recognition carries real weight, particularly in agency hiring. Where the engagement is confidential, describe the client by category and scale instead: 'a FTSE 100 retailer' or 'a Series B fintech'. Never name a client whose work you cannot discuss, because the interview will go there immediately.",
      },
    ],
  },

  "creative/electric-lilac-cv": {
    bestFor:
      "Electric Lilac is the most visually assertive template available, with a saturated sidebar and confident colour throughout. For creative roles it functions as a deliberate statement — appropriate when the application itself is partly a demonstration of visual confidence, as in art direction, brand design and creative-lead positions.",
    sectionOrder: {
      order: ["Sidebar: contact, disciplines, tools", "Main: profile, selected work, experience"],
      why: "The saturated column takes the first fixation, so contact and discipline belong at its top. The main column then has the reader's attention for the work itself.",
    },
    sectionAdvice: [
      { section: "Sidebar", advice: "Disciplined and short. A saturated panel packed with text becomes genuinely hard to read, which undermines the craft claim the template is making." },
      { section: "Profile", advice: "Voice is an asset here, but pair it with a concrete claim — what you make, for whom, and something that happened as a result." },
      { section: "Selected work", advice: "Three pieces, with your contribution stated precisely. Include the portfolio link prominently." },
      { section: "Experience", advice: "Concise, with outcomes. Assertive design plus unmeasured bullets is the weakest possible combination." },
    ],
    mistakes: [
      "Using it for an in-house corporate application, where it misjudges the audience and risks the parse.",
      "Insufficient contrast on the saturated panel, which fails accessibility and greyscale printing alike.",
      "Letting the design carry the application while the content stays vague.",
      "No portfolio link, in a discipline where the work is the evidence.",
    ],
    notFor: {
      who: "Corporate in-house creative teams and portal applications",
      instead: "the Orchid layout",
      insteadHref: "/resume-templates/creative/orchid-cv",
    },
    faqs: [
      {
        q: "Is a bold CV design risky for creative applications?",
        a: "It is a targeted bet rather than a general risk. At studios, agencies and for art-direction roles, visual confidence is read as relevant capability. For in-house creative teams at large companies — where the application goes through the same portal as finance and operations roles — it reads as misjudging the context, and carries parsing risk on top. Match the design to the route the application takes.",
      },
      {
        q: "Should my CV match my portfolio's visual identity?",
        a: "Consistency helps and reads as intentional, particularly for brand and art-direction roles where a coherent personal identity is itself evidence. The constraint is legibility: a portfolio can be experimental because the viewer arrives willing to explore, while a CV is scanned in seconds by someone deciding quickly. Shared palette and typography, conventional structure — that is the combination that works.",
      },
    ],
  },

  "creative/bold-accent-creative-cv": {
    bestFor:
      "Bold Accent in a creative context is the pragmatic choice: single-column and fully parseable, with an accent colour and chips supplying enough personality to avoid looking indifferent. It is the template for creative candidates applying through corporate portals, where a designed layout would be a genuine risk.",
    sectionOrder: {
      order: ["Contact", "Profile", "Selected work", "Experience", "Skills & tools", "Education"],
      why: "Selected work stays above experience because creative assessment starts with what you have made — but the single-column flow keeps the whole document safe for portal submission.",
    },
    sectionAdvice: [
      { section: "Profile", advice: "Discipline, level, and a concrete result. Keep it to three sentences — this template's strength is that it stays out of the way." },
      { section: "Selected work", advice: "Three pieces with problem, contribution and outcome, plus the portfolio link. In a single column these read cleanly without competing with a sidebar." },
      { section: "Experience", advice: "Two or three bullets per role with outcomes attached." },
      { section: "Skills & tools", advice: "The chip styling handles a moderate list well. Group by discipline." },
    ],
    mistakes: [
      "Adding further colours or decorative elements, which reintroduces the risk the template exists to avoid.",
      "Assuming a safe template means the content can be conventional — creative reviewers still want reasoning and outcomes.",
      "Omitting the portfolio link because the layout feels corporate.",
      "An accent that fails greyscale printing.",
    ],
    notFor: {
      who: "Studio and agency applications where visual confidence is assessed directly",
      instead: "the Portrait layout",
      insteadHref: "/resume-templates/creative/portrait-cv",
    },
    faqs: [
      {
        q: "How do creative candidates handle corporate application portals?",
        a: "Keep two versions of the same content. A designed CV for direct applications, referrals and studio submissions where a person reads it; a clean single-column version for portals, where parsing is the first hurdle and a sidebar can scramble your history. The content should be identical — only the layout changes. Leading with the portfolio link matters in both, since that is what actually gets assessed.",
      },
      {
        q: "Will a plain resume make me look less creative?",
        a: "Not if the portfolio link is prominent and the work behind it is strong. Reviewers for creative roles judge the portfolio; the CV establishes level, scope and context. Where a plain CV genuinely costs you is when it is the only artefact — no link, no work section, nothing to look at. Solve that by leading with the work, not by adding decoration that may prevent the document from parsing at all.",
      },
    ],
  },

};

/** Guidance for a leaf page, or null when none has been written yet. */
export function getLeafGuidance(category: string, leafSlug: string): LeafGuidance | null {
  return LEAF_GUIDANCE[`${category}/${leafSlug}`] ?? null;
}

export function hasLeafGuidance(category: string, leafSlug: string): boolean {
  return Object.prototype.hasOwnProperty.call(LEAF_GUIDANCE, `${category}/${leafSlug}`);
}
