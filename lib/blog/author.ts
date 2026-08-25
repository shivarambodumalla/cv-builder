// Single source of truth for the site's author identity.
//
// Every post previously carried an Organization byline ("CVEdge") and no
// human author. For careers and employment advice — content people act on when
// their income is at stake — an anonymous publisher is a genuine credibility
// gap, and Google's quality guidance weighs demonstrable author expertise
// heavily. The byline, the Person entity in each post's JSON-LD, and the bio
// block under each article all read from here so they can never drift apart.

export const AUTHOR = {
  name: "Bodumalla Sivarami Reddy",
  /** Shown under the byline and on /about. Must stay factually defensible. */
  role: "Product designer, founder of CVEdge",
  url: "https://www.thecvedge.com/about",
  /**
   * Two to three sentences, rendered at the foot of every post. Claims only
   * what building the product actually establishes — no hiring-industry
   * experience is asserted, because none is being claimed.
   */
  bio: "Bodumalla Sivarami Reddy is a product designer and the founder of CVEdge. He built the ATS parser, scoring model and resume tooling behind this site, which meant reading how applicant tracking systems actually ingest a CV rather than repeating what the internet says they do. He writes here about what that work has shown about resume screening.",
} as const;

/** JSON-LD Person entity, reused by every article. */
export const AUTHOR_JSON_LD = {
  "@type": "Person",
  name: AUTHOR.name,
  jobTitle: AUTHOR.role,
  url: AUTHOR.url,
  worksFor: {
    "@type": "Organization",
    name: "CVEdge",
    url: "https://www.thecvedge.com",
  },
} as const;
