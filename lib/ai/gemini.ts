import { callAI } from "@/lib/ai/client";

export interface JobMatchResult {
  match_score: number;
  missing_keywords: string[];
  matched_keywords: string[];
  suggestions: string[];
}

export type CoverLetterTone = "professional" | "conversational" | "confident";

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
  tone: CoverLetterTone
): Promise<string> {
  const result = await callAI({
    promptName: "cover_letter_v1",
    variables: {
      rawText,
      jobTitle,
      jobDescription,
      tone,
      toneGuide: toneGuide[tone],
    },
    feature: "cover_letter",
    parseJson: false,
  });
  return result as string;
}

export async function matchJob(
  rawText: string,
  jobDescription: string
): Promise<JobMatchResult> {
  const result = await callAI({
    promptName: "job_match_v1",
    variables: { rawText, jobDescription },
    feature: "job_match",
  });
  return result as JobMatchResult;
}

export async function structureCvText(rawText: string): Promise<Record<string, unknown>> {
  const result = await callAI({
    promptName: "cv_parse_v1",
    variables: { rawText },
    feature: "cv_parse",
  });
  return result as Record<string, unknown>;
}
