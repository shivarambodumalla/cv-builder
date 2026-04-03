import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export interface AtsReport {
  score: number;
  issues: { category: string; description: string; severity: "high" | "medium" | "low" }[];
  suggestions: { original: string; improved: string }[];
  keywords: string[];
  summary: string;
}

export interface JobMatchResult {
  match_score: number;
  missing_keywords: string[];
  matched_keywords: string[];
  suggestions: string[];
}

export async function analyseCv(rawText: string): Promise<AtsReport> {
  const prompt = `You are an expert ATS (Applicant Tracking System) analyser. Analyse the following CV text and return ONLY valid JSON with no markdown formatting, no code fences, no explanation.

Return this exact JSON structure:
{
  "score": <number 0-100>,
  "issues": [{"category": "<string>", "description": "<string>", "severity": "<high|medium|low>"}],
  "suggestions": [{"original": "<exact text from CV>", "improved": "<improved version>"}],
  "keywords": ["<extracted skill/keyword>"],
  "summary": "<2-3 sentence summary of CV strength and weaknesses>"
}

Categories for issues: "formatting", "content", "keywords", "structure", "impact", "brevity".

CV text:
${rawText}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/^```json?\s*/, "").replace(/```\s*$/, "");
  return JSON.parse(cleaned) as AtsReport;
}

export type CoverLetterTone = "professional" | "conversational" | "confident";

export async function generateCoverLetter(
  rawText: string,
  jobTitle: string,
  jobDescription: string,
  tone: CoverLetterTone
): Promise<string> {
  const toneGuide: Record<CoverLetterTone, string> = {
    professional:
      "Formal, polished, and structured. Use traditional business letter conventions.",
    conversational:
      "Warm and approachable while remaining respectful. Write as if speaking to a colleague.",
    confident:
      "Bold and assertive. Lead with accomplishments and strong value propositions.",
  };

  const prompt = `You are an expert cover letter writer. Write a cover letter for the candidate based on their CV and the target job.

Tone: ${tone} — ${toneGuide[tone]}

Rules:
- Return ONLY the cover letter text, no markdown, no code fences, no explanation
- Do not include a date or addresses
- Start with "Dear Hiring Manager," (or similar)
- 3-4 paragraphs
- Reference specific experience from the CV that matches the job
- End with a professional sign-off

CV text:
${rawText}

Job title: ${jobTitle}

Job description:
${jobDescription}`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

export async function matchJob(
  rawText: string,
  jobDescription: string
): Promise<JobMatchResult> {
  const prompt = `You are an expert job-CV matching analyser. Compare the CV against the job description and return ONLY valid JSON with no markdown formatting, no code fences, no explanation.

Return this exact JSON structure:
{
  "match_score": <number 0-100>,
  "missing_keywords": ["<keyword from job description not found in CV>"],
  "matched_keywords": ["<keyword found in both>"],
  "suggestions": ["<actionable suggestion to improve match>"]
}

CV text:
${rawText}

Job description:
${jobDescription}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/^```json?\s*/, "").replace(/```\s*$/, "");
  return JSON.parse(cleaned) as JobMatchResult;
}

export async function structureCvText(rawText: string): Promise<Record<string, unknown>> {
  const prompt = `You are a CV parser. Parse this CV text and return ONLY valid JSON with no markdown formatting, no code fences, no explanation.

Return this exact JSON structure (fill in from the CV, use empty strings/arrays for missing fields):
{
  "contact": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "", "website": "" },
  "targetTitle": { "title": "" },
  "summary": { "content": "" },
  "experience": { "items": [{ "company": "", "role": "", "location": "", "startDate": "", "endDate": "", "isCurrent": false, "bullets": [] }] },
  "education": { "items": [{ "institution": "", "degree": "", "field": "", "startDate": "", "endDate": "" }] },
  "skills": { "categories": [{ "name": "", "skills": [] }] },
  "certifications": { "items": [{ "name": "", "issuer": "", "startDate": "", "endDate": "", "isCurrent": false }] },
  "awards": { "items": [] },
  "projects": { "items": [] },
  "volunteering": { "items": [] },
  "publications": { "items": [] },
  "sections": { "contact": true, "targetTitle": true, "summary": true, "experience": true, "education": true, "skills": true, "certifications": true, "awards": false, "projects": false, "volunteering": false, "publications": false }
}

Rules:
- Extract the person's most recent or primary job title into targetTitle.title
- Write a 2-3 sentence professional summary if one isn't explicitly in the CV
- Group skills into logical categories (e.g. "Programming Languages", "Frameworks", "Tools")
- Use ISO-like date formats: "Jan 2023", "2023", "March 2020", etc.
- Set isCurrent: true if a role has no end date or says "Present"
- Set section visibility to true only if that section has actual content
- Return empty arrays (not omitted keys) for sections with no data

CV text:
${rawText}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/^```json?\s*/, "").replace(/```\s*$/, "");
  return JSON.parse(cleaned);
}
