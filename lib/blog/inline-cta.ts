import type { BlogPost } from "@/lib/blog/posts";

/**
 * Mid-article call to action. Readers land on one post and leave (under 1%
 * open a second), so the end-of-post CTA is rarely reached; this one sits
 * about 40% of the way in and speaks to why the reader came.
 */
export interface InlineCta {
  kind: "resume-check" | "mentorship";
  eyebrow: string;
  heading: string;
  body: string;
  buttonText: string;
  href: string;
}

// Slug fragment → market, checked in order. `doc` follows the market's own
// word so a US reader is never told to "check my CV".
const MARKETS: { match: string; place: string; doc: "CV" | "resume" }[] = [
  { match: "saudi", place: "Saudi Arabia", doc: "CV" },
  { match: "uae", place: "the UAE", doc: "CV" },
  { match: "dubai", place: "Dubai", doc: "CV" },
  { match: "qatar", place: "Qatar", doc: "CV" },
  { match: "gulf", place: "the Gulf", doc: "CV" },
  { match: "kuwait", place: "the Gulf", doc: "CV" },
  { match: "netherlands", place: "the Netherlands", doc: "CV" },
  { match: "ireland", place: "Ireland", doc: "CV" },
  { match: "switzerland", place: "Switzerland", doc: "CV" },
  { match: "german", place: "Germany", doc: "CV" },
  { match: "uk-cv", place: "the UK", doc: "CV" },
  { match: "singapore", place: "Singapore", doc: "CV" },
  { match: "new-zealand", place: "New Zealand", doc: "CV" },
  { match: "australian", place: "Australia", doc: "resume" },
  { match: "canadian", place: "Canada", doc: "resume" },
  { match: "federal-resume", place: "US federal jobs", doc: "resume" },
  { match: "us-resume", place: "the US", doc: "resume" },
  { match: "convert-cv-to-us", place: "the US", doc: "resume" },
];

const hasTag = (post: BlogPost, name: string) => post.tags.some((t) => t.name === name);

export function getInlineCta(post: BlogPost): InlineCta {
  const role = post.title.match(/^(.+?) Resume Guide\b/)?.[1];
  if (role) {
    return {
      kind: "resume-check",
      eyebrow: "Free ATS check",
      heading: `How would your ${role} resume score?`,
      body: `Upload it and see which keywords ${role} job descriptions ask for that your resume is missing.`,
      buttonText: "Check my resume",
      href: "/upload-resume",
    };
  }

  if (hasTag(post, "Product Design")) {
    return {
      kind: "mentorship",
      eyebrow: "AI Product Design Mentorship",
      heading: "Want a working designer to review your portfolio?",
      body: "100 hours of live 1:1 sessions with a mentor, plus lifetime portfolio reviews after you graduate.",
      buttonText: "See the mentorship",
      href: "/ai-product-design",
    };
  }

  const market = MARKETS.find((m) => post.slug.includes(m.match));
  if (market) {
    return {
      kind: "resume-check",
      eyebrow: "Free ATS check",
      heading: `Applying in ${market.place}? Check your ${market.doc} first.`,
      body: `Get a free ATS score and fix formatting and keyword gaps before your ${market.doc} reaches a recruiter.`,
      buttonText: `Check my ${market.doc}`,
      href: "/upload-resume",
    };
  }

  if (hasTag(post, "Tool Comparison")) {
    return {
      kind: "resume-check",
      eyebrow: "Try it yourself",
      heading: "See your own ATS score in under 60 seconds",
      body: "Upload your resume for a free score with specific fixes. No sign-up needed to see it.",
      buttonText: "Check my resume",
      href: "/upload-resume",
    };
  }

  return {
    kind: "resume-check",
    eyebrow: "Free ATS check",
    heading: "Put this into practice on your own resume",
    body: "Upload it for a free ATS score and a prioritised list of fixes in under 60 seconds.",
    buttonText: "Check my resume",
    href: "/upload-resume",
  };
}

// Block containers a split must never fall inside, or one half ships an
// unclosed tag.
const CONTAINER = "blockquote|ul|ol|table|div|figure|details|section|pre|aside";
// Alternatives, in order: container open/close, h2 (text captured), a
// sub-heading (h3, or a bold-only paragraph that older posts use as one), and
// a plain paragraph end.
const TOKEN = new RegExp(
  `<(/?)(${CONTAINER})\\b[^>]*>` +
    `|<h2\\b[^>]*>([\\s\\S]*?)</h2>` +
    `|<h3\\b[^>]*>[\\s\\S]*?</h3>|<p>\\s*<strong>[^<]{1,120}</strong>\\s*</p>` +
    `|</p>`,
  "gi"
);
const FAQ_HEADING = /\bFAQs?\b|frequently asked/i;
// A paragraph followed by one of these usually introduces it ("Include:").
const INTRODUCES_BLOCK = /^\s*<(ul|ol|table|blockquote|pre|figure)\b/i;

const MIN_WORDS = 400;
const TARGET = 0.4;
const WINDOW: [number, number] = [0.2, 0.7];

/**
 * Split post HTML where the inline CTA goes: the top-level section break
 * nearest 40% of the way in. Prefers an h2, then a sub-heading, then a plain
 * paragraph end, and never lands directly under a heading, inside a
 * container, or between the FAQ's question and answer pairs (extractFaq reads
 * that block as one run up to the next h2). Returns null for posts too short
 * to carry a second CTA.
 */
export function splitForInlineCta(html: string): [string, string] | null {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  if (words < MIN_WORDS) return null;

  const sections: number[] = [];
  const subsections: number[] = [];
  const paragraphEnds: number[] = [];
  let depth = 0;
  let inFaq = false;
  // End of the last heading; a break is only valid once content follows it.
  let headingEnd = -1;
  const afterContent = (at: number) => html.slice(headingEnd, at).trim() !== "";

  for (const m of html.matchAll(TOKEN)) {
    const at = m.index!;
    const token = m[0];
    if (m[2]) {
      depth = Math.max(0, depth + (m[1] ? -1 : 1));
      continue;
    }
    if (depth > 0) continue;

    if (token.startsWith("<h2")) {
      if (afterContent(at)) sections.push(at);
      inFaq = FAQ_HEADING.test(m[3] ?? "");
      headingEnd = at + token.length;
    } else if (token !== "</p>") {
      if (!inFaq && afterContent(at)) subsections.push(at);
      headingEnd = at + token.length;
    } else if (!inFaq && afterContent(at) && !INTRODUCES_BLOCK.test(html.slice(at + token.length, at + 60))) {
      paragraphEnds.push(at + token.length);
    }
  }

  const len = html.length;
  const nearest = (points: number[]) =>
    points
      .filter((p) => p >= len * WINDOW[0] && p <= len * WINDOW[1])
      .sort((a, b) => Math.abs(a - len * TARGET) - Math.abs(b - len * TARGET))[0];

  const at = nearest(sections) ?? nearest(subsections) ?? nearest(paragraphEnds);
  return at === undefined ? null : [html.slice(0, at), html.slice(at)];
}
