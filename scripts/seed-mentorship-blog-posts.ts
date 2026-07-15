// Seed: long-tail blog posts feeding the mentorship funnel
// Run: npx tsx scripts/seed-mentorship-blog-posts.ts
import { createAdminClient } from "../lib/supabase/admin";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const PROGRAM_LINK = `<a href="/ai-product-design">AI Product Design Mentorship</a>`;

const POSTS = [
  {
    slug: "how-much-does-a-product-design-mentor-cost",
    title: "How Much Does a Product Design Mentor Cost in 2026?",
    brief:
      "From free community mentors to structured 1:1 programs: what each tier of design mentorship costs, what you actually get, and how to decide what is worth paying for.",
    seo_title: "Product Design Mentor Cost in 2026: Full Price Breakdown | CVEdge",
    seo_description:
      "What does a product design mentor cost? Compare free mentorship, hourly rates, subscriptions and structured 1:1 programs, and learn what each tier really delivers.",
    tags: ["product-design", "mentorship", "career-switch", "ux"],
    read_time_minutes: 6,
    content_html: `<p>Design mentorship pricing is confusing on purpose. The same word covers a free 30 minute community chat and a months-long structured program, so prices range from zero to five figures. Here is what each tier actually costs in 2026, what you get at each level, and how to decide what is worth paying for.</p>

<h2>The four tiers of design mentorship</h2>

<h3>1. Free community mentorship</h3>
<p>Platforms like ADPList and design community Slacks connect you with volunteer mentors for free sessions, usually 20 to 45 minutes.</p>
<p><strong>What it is good for:</strong> one-off questions, a quick portfolio gut-check, hearing how someone got their role.</p>
<p><strong>The catch:</strong> sessions are short, availability is scarce, and there is no continuity. A mentor who saw your work once cannot track your growth or hold you accountable. Free mentorship is a great supplement and a poor primary plan.</p>

<h3>2. Hourly mentors</h3>
<p>Independent mentors and consultants typically charge anywhere from around $50 to $300+ per hour depending on seniority and market. A design lead at a well-known product company sits at the top of that range.</p>
<p><strong>What it is good for:</strong> targeted help, such as preparing for a specific interview or reviewing one case study.</p>
<p><strong>The catch:</strong> costs stack up fast if you need sustained guidance, and the burden of structuring the learning falls on you. Ten unstructured hours rarely add up to a curriculum.</p>

<h3>3. Subscription mentorship platforms</h3>
<p>Marketplace platforms commonly charge somewhere between $100 and $500 per month for a set number of sessions plus chat access.</p>
<p><strong>What it is good for:</strong> ongoing accountability at a predictable price.</p>
<p><strong>The catch:</strong> quality varies enormously between mentors on the same platform, and most subscriptions are advice-only: nobody is building a curriculum, reviewing homework, or driving you toward a shipped outcome. Before paying anyone, read our guide on <a href="/product-design-mentor">how to vet a product design mentor</a>.</p>

<h3>4. Structured 1:1 mentorship programs</h3>
<p>Programs that combine a real curriculum with dedicated 1:1 mentorship typically run from around $500 into the low thousands, with bootcamp-style cohort programs reaching $5,000 to $15,000+. The price reflects scope: a defined arc, session-by-session structure, project work, feedback on everything you produce, and career preparation.</p>
<p><strong>What it is good for:</strong> career switchers and juniors who need the whole journey, not spot advice: skills, portfolio, and job readiness.</p>
<p><strong>The catch:</strong> this tier has the widest quality range of all, from genuinely career-changing programs to expensive video libraries with a mentorship sticker. The comparison framework in <a href="/product-design-course">how to choose a product design course</a> applies directly here.</p>

<h2>The real question: cost per outcome, not cost per hour</h2>
<p>A $50 hourly mentor looks cheaper than a structured program until you count the hours. Sixty hours at $50 is $3,000, with no curriculum, no accountability and no capstone at the end. Meanwhile one salary negotiation handled well, or landing a role one month sooner, covers the cost of most structured programs entirely.</p>
<p>So evaluate any paid mentorship on outcomes, not hours:</p>
<ul>
<li>Do you finish with shipped work an interviewer can react to?</li>
<li>Does the price include career assets: portfolio, resume, interview practice?</li>
<li>What support survives after the program ends?</li>
<li>Can you verify the mentor's own work? (Our checklist: <a href="/product-design-mentor">five questions to ask before you pay anyone</a>.)</li>
</ul>

<h2>Red flags at any price</h2>
<ul>
<li>Guaranteed job or salary claims. No honest mentor controls the market.</li>
<li>Pressure tactics: countdown timers, spots that are always almost gone.</li>
<li>No way to talk to the mentor before paying.</li>
<li>A single fixed price page with no clarity on what sessions actually contain.</li>
</ul>

<h2>Where CVEdge fits</h2>
<p>Our ${PROGRAM_LINK} sits in the structured 1:1 tier: 100 hours of live 1:1 sessions across five phases, ending in a shipped capstone product, with lifetime portfolio reviews after you graduate. The full curriculum is free to download on the program page, and the discovery call costs nothing, so you can apply every test in this article to us before spending anything.</p>`,
  },
  {
    slug: "ai-product-designer-salary-guide",
    title: "AI Product Designer Salary Guide 2026: What the Role Pays and Why",
    brief:
      "AI product designers are commanding a premium over generalist design roles. Typical salary ranges by market, what drives the premium, and how to position yourself for it.",
    seo_title: "AI Product Designer Salary 2026: Ranges by Market | CVEdge",
    seo_description:
      "What does an AI product designer earn in 2026? Typical salary ranges for the US, UK, Europe, Gulf, Singapore and India, plus the skills that command the premium.",
    tags: ["ai-product-design", "salary", "careers", "ux"],
    read_time_minutes: 6,
    content_html: `<p>AI product designer is the job title that barely existed three years ago and now appears in postings at almost every product company. Because the role is new, salary data is noisy: titles vary, scopes vary, and surveys lag reality. This guide gives you honest ranges based on commonly advertised figures in 2026, with the usual caveat that your specific offer depends on company stage, scope and your leverage.</p>

<h2>What is an AI product designer, exactly?</h2>
<p>Broadly, someone who designs products where AI is the core interaction, not a bolt-on: assistants, copilots, agentic workflows, generative interfaces. The craft adds new problems on top of classic product design: designing for uncertainty and error, streaming and progressive responses, prompt and context design, and building user trust in systems that are sometimes wrong.</p>
<p>Designers who can also <em>build</em> with AI tools like Claude and Cursor, shipping working prototypes rather than mockups, sit in the strongest position of all. That combination is what our <a href="/learn-product-design">product design learning roadmap</a> is structured around.</p>

<h2>Typical ranges by market in 2026</h2>
<p>Ranges below reflect commonly advertised full-time salaries for mid-level to senior product designers with AI product experience. Entry-level roles sit below these bands; staff and principal roles above them.</p>
<ul>
<li><strong>United States:</strong> roughly $110,000 to $200,000+, with major tech hubs and AI-first companies at the top of the band. Total compensation with equity can go meaningfully higher.</li>
<li><strong>United Kingdom:</strong> roughly £55,000 to £110,000, with London AI companies at the upper end.</li>
<li><strong>Germany and Netherlands:</strong> roughly €60,000 to €100,000.</li>
<li><strong>UAE and Saudi Arabia:</strong> commonly AED 20,000 to 40,000 per month in the Emirates and comparable SAR bands in KSA, tax-free, with the Gulf investing heavily in AI initiatives.</li>
<li><strong>Singapore:</strong> roughly SGD 70,000 to 140,000.</li>
<li><strong>India:</strong> roughly ₹12L to ₹45L+ for product design roles at product companies, with AI-focused roles and global remote positions pushing past that.</li>
</ul>
<p>Treat all of these as orientation, not gospel. Before any negotiation, check live postings and current crowdsourced data for your specific market and level; ranges move quickly in AI hiring.</p>

<h2>Why the premium exists</h2>
<p>Companies are not paying extra for the words on your title. The premium attaches to demonstrated ability in problems most designers have not solved yet:</p>
<ul>
<li><strong>Designing for non-deterministic systems.</strong> Loading states are easy; confidence states are not.</li>
<li><strong>Prompt and context design</strong> as part of the user experience, not an engineering afterthought.</li>
<li><strong>Trust and error recovery.</strong> The difference between a delightful AI product and an uninstalled one.</li>
<li><strong>AI-assisted building.</strong> Designers who ship working software compress team iteration loops, and companies pay for compressed loops.</li>
</ul>

<h2>How to actually command it</h2>
<p>A certificate that says AI on it will not move an offer. What moves offers is proof:</p>
<ul>
<li>A shipped AI product in your portfolio, with honest metrics and decisions you can defend.</li>
<li>A case study showing how you handled uncertainty, failure states and trust.</li>
<li>Fluency with the modern toolchain in the interview itself.</li>
</ul>
<p>That proof is buildable in months, not years, with the right structure. It is exactly what the capstone in our ${PROGRAM_LINK} produces: a real AI product you designed, built and shipped, plus the portfolio and interview preparation to convert it into offers. If you are earlier in the journey, start with <a href="/ux-mentorship">how mentorship accelerates the craft</a>.</p>`,
  },
  {
    slug: "product-design-portfolio-review-checklist",
    title: "Product Design Portfolio Review Checklist: 27 Points Before You Apply",
    brief:
      "The checklist a design lead actually runs through your portfolio: structure, case studies, craft, AI-era signals, and the mistakes that get otherwise good portfolios rejected.",
    seo_title: "Product Design Portfolio Review Checklist (27 Points) | CVEdge",
    seo_description:
      "Review your design portfolio like a hiring manager: a 27-point checklist covering structure, case studies, visual craft and the AI-era signals companies now look for.",
    tags: ["portfolio", "product-design", "job-search", "ux"],
    read_time_minutes: 7,
    content_html: `<p>Most portfolios are not rejected for weak visual craft. They are rejected in under two minutes for structural problems the designer could have fixed in an afternoon. This is the checklist to run before you send yours anywhere, organised the way a reviewer actually reads.</p>

<h2>First impression (the first 30 seconds)</h2>
<ol>
<li>Your name, role and what you are looking for are readable without scrolling.</li>
<li>The strongest project is first. Reviewers rarely reach the fourth.</li>
<li>Three to five projects maximum. Ten projects signal you cannot prioritise.</li>
<li>The page loads fast and works on a laptop screen, not just your 27-inch monitor.</li>
<li>A one-line summary under each project tile says what it is and what you did.</li>
</ol>

<h2>Case study structure</h2>
<ol start="6">
<li>Each case study opens with context: the product, the users, the business problem.</li>
<li>Your specific role is explicit. "We" throughout a case study hides you.</li>
<li>The problem is framed before any interface appears.</li>
<li>You show options you considered and rejected, with reasons. Judgment is the product.</li>
<li>Constraints are named: timeline, technical limits, stakeholder pressure.</li>
<li>The outcome is stated honestly, with metrics where you have them and honesty where you do not.</li>
<li>A reflection closes it: what you would do differently. Seniority signal, cheap to add.</li>
</ol>

<h2>Craft and detail</h2>
<ol start="13">
<li>Typography is consistent across the portfolio itself. Your portfolio is a design artifact.</li>
<li>Screens are legible at the size shown, not thumbnails of entire flows.</li>
<li>Real content in mockups, not lorem ipsum.</li>
<li>Interaction states appear somewhere: empty, loading, error, edge cases.</li>
<li>Accessibility gets at least one honest mention backed by evidence in the work.</li>
</ol>

<h2>AI-era signals (what changed since 2023)</h2>
<ol start="18">
<li>At least one project involves AI, ideally as the core interaction rather than a chatbot bolted onto a corner.</li>
<li>You address designing for uncertainty: what happens when the model is wrong.</li>
<li>Your process mentions modern tooling honestly. Teams now assume fluency; showing it beats claiming it.</li>
<li>Something in the portfolio actually shipped. A live link beats any mockup. If nothing has shipped yet, that is the single highest-leverage gap to close; it is why our <a href="/ai-product-design">mentorship program</a> is built around a shipped capstone rather than fictional briefs.</li>
</ol>

<h2>The rejection triggers</h2>
<ol start="22">
<li>No unsolicited redesigns of famous apps as your lead project. Reviewers have seen a thousand Spotify redesigns with no real constraints.</li>
<li>No process theater: walls of sticky-note photos that never connect to a decision.</li>
<li>No agency-style image dumps with zero narrative.</li>
<li>No broken links, placeholder pages or "case study coming soon."</li>
<li>No unexplained gaps between what the title claims and what the work shows.</li>
<li>Nothing confidential shown without care. Sanitise or get permission; reviewers notice.</li>
</ol>

<h2>How to use this list</h2>
<p>Run it yourself first, fixing everything in the first two sections before touching visuals. Then get a second pair of experienced eyes on it: self-review catches structure, but only feedback catches blind spots. That is what mentors are for, and <a href="/ux-mentorship">a good mentorship loop</a> is the fastest way to close the gaps you cannot see.</p>
<p>Learners in our ${PROGRAM_LINK} get portfolio reviews for life, including years after graduating, precisely because the portfolio is never really finished: it evolves with every role you chase.</p>`,
  },
];

async function main() {
  const supabase = createAdminClient();
  let inserted = 0;
  let updated = 0;

  for (const post of POSTS) {
    const row = {
      ...post,
      author_name: "CVEdge",
      is_published: true,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { data: existing } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("slug", post.slug)
      .maybeSingle();

    if (existing) {
      // Keep original published_at on updates
      const { published_at: _published_at, ...update } = row;
      const { error } = await supabase.from("blog_posts").update(update).eq("slug", post.slug);
      if (error) { console.error(`Failed to update ${post.slug}:`, error.message); continue; }
      updated++;
    } else {
      const { error } = await supabase.from("blog_posts").insert(row);
      if (error) { console.error(`Failed to insert ${post.slug}:`, error.message); continue; }
      inserted++;
    }
  }

  console.log(`Mentorship blog posts: ${inserted} inserted, ${updated} updated.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
