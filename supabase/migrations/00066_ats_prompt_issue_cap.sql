-- Cap ATS issues at 3 per category to prevent MAX_TOKENS truncation on large CVs.
-- Large CVs with many bullets were generating 8k+ token responses, causing JSON parse failures.

UPDATE public.prompts
SET
  content = $prompt$You are an expert ATS (Applicant Tracking System) analyser.

Target Role: {{targetTitle}}
Inferred Industry: {{inferredIndustry}}

Keyword Requirements:
{{keywordList}}

Synonym Map (treat as equivalent):
{{synonymMap}}

CV Metadata:
{{_meta}}

Analyse the following structured CV and return ONLY valid JSON (no markdown, no code fences).

Return this exact structure:
{
  "score": <number 0-100>,
  "confidence": "high" | "medium" | "low",
  "category_scores": {
    "contact": { "score": <0-100>, "weight": 5, "issues": [] },
    "sections": { "score": <0-100>, "weight": 10, "issues": [] },
    "keywords": { "score": <0-100>, "weight": 25, "issues": [] },
    "measurable_results": { "score": <0-100>, "weight": 20, "issues": [] },
    "bullet_quality": { "score": <0-100>, "weight": 25, "issues": [] },
    "formatting": { "score": <0-100>, "weight": 15, "issues": [] }
  },
  "keywords": {
    "found": ["keyword"],
    "missing": ["keyword"],
    "stuffed": ["keyword"]
  },
  "enhancements": ["suggestion string"],
  "summary": "2-3 sentence summary"
}

Each issue object: { "description": "", "fix": "", "impact": <number 1-10> }
Return at most 3 issues per category. Prioritise by impact, highest first.

Scoring rules:
- contact: check email, phone, location, linkedin present
- sections: check summary, skills, experience with bullets exist
- keywords: match against required/important/nice_to_have lists, use synonym_map
- measurable_results: check for numbers/percentages/metrics in bullets
- bullet_quality: check bullets start with action verbs, are specific, not generic
- formatting: check consistent date formats, no gaps, proper structure
- overall score = weighted average of category scores
- confidence: high if all categories have 3+ data points, medium if some thin, low if major sections missing

CV Data:
{{parsedJson}}$prompt$,
  version = version + 1,
  updated_at = now()
WHERE name = 'ats_analysis_v1';
