// Relevance filtering for /jobs/[role] pages.
//
// Providers (Adzuna, Jooble, Careerjet) treat multi-word queries as loose OR
// matches, so a search for "product manager" returns every listing containing
// "manager" — "Regional Sales Manager", "Fleet Maintenance Manager", and so on.
// Those listings are irrelevant to the page they land on and make the role
// pages read as scraped filler.
//
// The filter below keeps a listing only when its title plausibly names the role
// the page is about: it must carry the role's head noun (engineer, manager,
// designer…) AND at least one qualifier that distinguishes this role from its
// siblings (product, software, data…).

/** Words that carry no discriminating signal in a job title. */
const STOPWORDS = new Set([
  "a", "an", "and", "the", "of", "for", "to", "in", "at", "on", "with",
  "senior", "junior", "lead", "principal", "staff", "chief", "head",
  "sr", "jr", "i", "ii", "iii", "iv", "associate", "assistant",
  "entry", "level", "mid", "intern", "trainee", "graduate",
]);

/**
 * Head nouns that are interchangeable in practice. A page about a "Backend
 * Developer" should still surface "Backend Engineer" listings.
 */
const HEAD_SYNONYMS: Record<string, string[]> = {
  developer: ["developer", "engineer", "programmer", "coder"],
  engineer: ["engineer", "developer", "programmer"],
  scientist: ["scientist", "researcher"],
  analyst: ["analyst", "analytics"],
  designer: ["designer", "design"],
  administrator: ["administrator", "admin"],
  architect: ["architect"],
  manager: ["manager", "lead", "owner"],
  specialist: ["specialist", "expert"],
  consultant: ["consultant", "advisor"],
  writer: ["writer", "author"],
  recruiter: ["recruiter", "recruitment"],
};

/**
 * Extra qualifier tokens accepted for a role slug, so that genuinely relevant
 * listings phrased differently still pass. Keyed by role slug.
 */
const QUALIFIER_ALIASES: Record<string, string[]> = {
  "software-engineer": ["software", "sde", "swe", "application", "applications", "systems", "platform", "fullstack", "full-stack"],
  "full-stack-developer": ["full", "fullstack", "full-stack", "stack", "software", "web"],
  "frontend-developer": ["frontend", "front-end", "front", "ui", "react", "angular", "vue", "javascript", "web"],
  "backend-developer": ["backend", "back-end", "back", "server", "api", "java", "python", "node", ".net", "golang"],
  "web-developer": ["web", "website", "frontend", "front-end", "wordpress", "php"],
  "mobile-app-developer": ["mobile", "ios", "android", "react native", "flutter", "app"],
  "android-developer": ["android", "kotlin", "mobile"],
  "ios-developer": ["ios", "swift", "iphone", "mobile"],
  "api-developer": ["api", "integration", "backend", "services"],
  "software-architect": ["software", "solution", "solutions", "technical", "enterprise", "application"],
  "platform-engineer": ["platform", "infrastructure", "devops", "internal"],
  "systems-engineer": ["systems", "system", "infrastructure"],
  "devops-engineer": ["devops", "sre", "reliability", "infrastructure", "ci/cd", "kubernetes", "cloud"],
  "cloud-engineer": ["cloud", "aws", "azure", "gcp", "infrastructure"],
  "site-reliability-engineer": ["site", "reliability", "sre", "devops", "production"],
  "data-scientist": ["data", "machine learning", "ml", "ai", "research", "applied"],
  "data-engineer": ["data", "etl", "pipeline", "analytics", "big data", "warehouse"],
  "data-analyst": ["data", "business intelligence", "bi", "reporting", "analytics", "insights"],
  "analytics-engineer": ["analytics", "data", "dbt", "bi"],
  "machine-learning-engineer": ["machine learning", "ml", "ai", "deep learning", "mlops"],
  "ai-engineer": ["ai", "artificial intelligence", "machine learning", "ml", "llm", "genai"],
  "generative-ai-engineer": ["generative", "genai", "ai", "llm", "gpt", "machine learning"],
  "product-manager": ["product", "technical product", "growth", "platform"],
  "project-manager": ["project", "programme", "program", "delivery", "pmo"],
  "program-manager": ["program", "programme", "technical program", "tpm"],
  "business-analyst": ["business", "systems", "functional", "requirements"],
  "ux-designer": ["ux", "user experience", "product", "experience", "interaction"],
  "ui-designer": ["ui", "user interface", "visual", "product", "digital"],
  "product-designer": ["product", "ux", "ui", "digital"],
  "graphic-designer": ["graphic", "visual", "brand", "creative"],
  "qa-engineer": ["qa", "quality", "test", "testing", "automation", "sdet"],
  "cybersecurity-engineer": ["cyber", "cybersecurity", "security", "infosec", "information security"],
  "security-analyst": ["security", "soc", "cyber", "threat", "infosec"],
  "penetration-tester": ["penetration", "pentest", "ethical", "offensive", "red team", "security"],
  "database-administrator": ["database", "dba", "sql", "oracle", "postgres"],
  "blockchain-developer": ["blockchain", "web3", "solidity", "smart contract", "crypto"],
  "solutions-architect": ["solution", "solutions", "technical", "cloud", "enterprise", "presales"],
  "marketing-manager": ["marketing", "brand", "growth", "digital marketing"],
  "sales-manager": ["sales", "account", "business development", "revenue"],
  "hr-manager": ["hr", "human resources", "people", "talent"],
  "financial-analyst": ["financial", "finance", "fp&a", "investment", "treasury"],
  "scrum-master": ["scrum", "agile", "delivery", "iteration"],
};

function normalise(raw: string): string {
  return (raw || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#/.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenise(raw: string): string[] {
  return normalise(raw)
    .split(" ")
    .filter((t) => t && !STOPWORDS.has(t));
}

/** The discriminating parts of a role label: its head noun and its qualifiers. */
export function roleTerms(slug: string, label: string): { heads: string[]; qualifiers: string[] } {
  const tokens = tokenise(label);
  const headToken = tokens[tokens.length - 1] ?? "";
  const heads = HEAD_SYNONYMS[headToken] ?? (headToken ? [headToken] : []);

  const labelQualifiers = tokens.slice(0, -1);
  const aliases = QUALIFIER_ALIASES[slug] ?? [];
  const qualifiers = Array.from(new Set([...labelQualifiers, ...aliases])).filter(Boolean);

  return { heads, qualifiers };
}

/**
 * True when a job title plausibly names this role.
 *
 * Requires the head noun (or a synonym) AND at least one qualifier, so
 * "Senior Product Manager" passes for product-manager while "Regional Sales
 * Manager" does not. Single-word roles (e.g. "Recruiter") only need the head.
 */
export function isRelevantTitle(jobTitle: string, slug: string, label: string): boolean {
  const title = normalise(jobTitle);
  if (!title) return false;

  const { heads, qualifiers } = roleTerms(slug, label);
  if (heads.length === 0) return true;

  const titleTokens = new Set(tokenise(jobTitle));
  const hasHead = heads.some((h) => titleTokens.has(h) || title.includes(h));
  if (!hasHead) return false;

  // Single-word role labels carry no qualifier to check against.
  if (qualifiers.length === 0) return true;

  // Multi-word aliases ("machine learning") need substring matching.
  return qualifiers.some((q) => (q.includes(" ") || q.includes("-") ? title.includes(q) : titleTokens.has(q)));
}

/**
 * Filter provider results down to listings that actually match the role page.
 *
 * Falls back to the unfiltered list when filtering would leave too few results
 * to render a useful page — an empty page is a worse outcome than a loose one,
 * and the caller surfaces the distinction to the reader.
 */
export function filterJobsByRole<T extends { title: string }>(
  jobs: T[],
  slug: string,
  label: string,
  minResults = 3
): { jobs: T[]; filtered: boolean } {
  const relevant = jobs.filter((j) => isRelevantTitle(j.title, slug, label));
  if (relevant.length >= minResults) return { jobs: relevant, filtered: true };
  return { jobs, filtered: false };
}
