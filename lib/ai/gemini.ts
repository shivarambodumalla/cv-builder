import { callAI } from "@/lib/ai/client";

export interface JobMatchResult {
  match_score: number;
  missing_keywords: string[];
  matched_keywords: string[];
  suggestions: string[];
}

export type CoverLetterTone = "professional" | "conversational" | "confident";

interface AICaller {
  userId?: string | null;
  ip?: string;
}

const toneGuide: Record<CoverLetterTone, string> = {
  professional:
    "Formal, polished, and structured. Use traditional business letter conventions.",
  conversational:
    "Warm and approachable while remaining respectful. Write as if speaking to a colleague.",
  confident:
    "Bold and assertive. Lead with accomplishments and strong value propositions.",
};

export async function generateCoverLetter(
  rawText: string,
  jobTitle: string,
  jobDescription: string,
  tone: CoverLetterTone,
  caller?: AICaller
): Promise<string> {
  const result = await callAI({
    promptName: "cover_letter_v1",
    variables: { rawText, jobTitle, jobDescription, tone, toneGuide: toneGuide[tone] },
    feature: "cover_letter",
    parseJson: false,
    userId: caller?.userId,
    ip: caller?.ip,
  });
  return result as string;
}

export async function matchJob(
  rawText: string,
  jobDescription: string,
  caller?: AICaller
): Promise<JobMatchResult> {
  const result = await callAI({
    promptName: "job_match_v1",
    variables: { rawText, jobDescription },
    feature: "job_match",
    userId: caller?.userId,
    ip: caller?.ip,
  });
  return result as JobMatchResult;
}

/**
 * The parse prompt returns `sections` visibility flags and sometimes switches
 * off a section it has just filled (seen 2026-11-09: summary and experience
 * false with 4 roles extracted), which makes the editor look empty and drags
 * the live score down. Any section the model gave content gets switched on;
 * sections it left empty keep whatever it said.
 */
function enableSectionsWithContent(parsed: Record<string, unknown>) {
  const sections = (parsed.sections && typeof parsed.sections === "object" ? parsed.sections : {}) as Record<string, boolean>;
  const listSections = ["experience", "education", "skills", "certifications", "awards", "projects", "volunteering", "publications"];
  for (const key of listSections) {
    const value = parsed[key] as { items?: unknown[]; categories?: unknown[] } | undefined;
    const items = value?.items ?? value?.categories;
    if (Array.isArray(items) && items.length > 0) sections[key] = true;
  }
  const summary = (parsed.summary as { content?: string } | undefined)?.content;
  if (typeof summary === "string" && summary.trim()) sections.summary = true;
  const title = (parsed.targetTitle as { title?: string } | undefined)?.title;
  if (typeof title === "string" && title.trim()) sections.targetTitle = true;
  sections.contact = true;
  parsed.sections = sections;
}

export async function structureCvText(
  rawText: string,
  caller?: AICaller
): Promise<Record<string, unknown>> {
  const result = await callAI({
    promptName: "cv_parse_v1",
    variables: { rawText },
    feature: "cv_parse",
    userId: caller?.userId,
    ip: caller?.ip,
  });
  const parsed = result as Record<string, unknown>;
  enableSectionsWithContent(parsed);
  // The parse prompt's contact shape predates the github field, so a GitHub
  // profile often lands in website. Move it so templates show it as GitHub.
  const contact = parsed.contact as Record<string, unknown> | undefined;
  if (contact && typeof contact.website === "string" && !contact.github && /github\.com/i.test(contact.website)) {
    contact.github = contact.website;
    contact.website = "";
  }
  return parsed;
}
