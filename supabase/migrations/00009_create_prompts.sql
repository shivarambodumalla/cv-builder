create table public.prompts (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  content text not null,
  version int default 1,
  updated_at timestamptz default now()
);

alter table public.prompts enable row level security;

create policy "Authenticated users can read prompts"
  on public.prompts for select
  using (auth.role() = 'authenticated');

create policy "Admin can insert prompts"
  on public.prompts for insert
  with check (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

create policy "Admin can update prompts"
  on public.prompts for update
  using (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

create policy "Admin can delete prompts"
  on public.prompts for delete
  using (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

insert into public.prompts (name, content) values (
  'ats_analysis_v1',
  E'You are an expert ATS (Applicant Tracking System) analyser.\n\nTarget Role: {{targetTitle}}\nInferred Industry: {{inferredIndustry}}\n\nKeyword Requirements:\n{{keywordList}}\n\nSynonym Map (treat as equivalent):\n{{synonymMap}}\n\nCV Metadata:\n{{_meta}}\n\nAnalyse the following structured CV and return ONLY valid JSON (no markdown, no code fences).\n\nReturn this exact structure:\n{\n  "score": <number 0-100>,\n  "confidence": "high" | "medium" | "low",\n  "category_scores": {\n    "contact": { "score": <0-100>, "weight": 5, "issues": [] },\n    "sections": { "score": <0-100>, "weight": 10, "issues": [] },\n    "keywords": { "score": <0-100>, "weight": 25, "issues": [] },\n    "measurable_results": { "score": <0-100>, "weight": 20, "issues": [] },\n    "bullet_quality": { "score": <0-100>, "weight": 25, "issues": [] },\n    "formatting": { "score": <0-100>, "weight": 15, "issues": [] }\n  },\n  "keywords": {\n    "found": ["keyword"],\n    "missing": ["keyword"],\n    "stuffed": ["keyword"]\n  },\n  "enhancements": ["suggestion string"],\n  "summary": "2-3 sentence summary"\n}\n\nEach issue object: { "description": "", "fix": "", "impact": <number 1-10> }\n\nScoring rules:\n- contact: check email, phone, location, linkedin present\n- sections: check summary, skills, experience with bullets exist\n- keywords: match against required/important/nice_to_have lists, use synonym_map\n- measurable_results: check for numbers/percentages/metrics in bullets\n- bullet_quality: check bullets start with action verbs, are specific, not generic\n- formatting: check consistent date formats, no gaps, proper structure\n- overall score = weighted average of category scores\n- confidence: high if all categories have 3+ data points, medium if some thin, low if major sections missing\n\nCV Data:\n{{parsedJson}}'
);
