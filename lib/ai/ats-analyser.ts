import { createAdminClient } from "@/lib/supabase/admin";
import { callAI } from "@/lib/ai/client";
import { resolveRole, getDomainForRole } from "@/lib/resume/roles";
import type { ResumeContent } from "@/lib/resume/types";

export interface FieldRef {
  section: string;
  field: string | null;
  index?: number;
  bulletText?: string;
}

export interface AtsIssue {
  description: string;
  fix: string;
  impact: number;
  field_ref?: FieldRef;
}

export interface AtsCategoryScore {
  score: number;
  weight: number;
  issues: AtsIssue[];
}

export interface AtsReportData {
  score: number;
  confidence: "high" | "medium" | "low";
  category_scores: Record<string, AtsCategoryScore>;
  keywords: {
    found: string[];
    missing: string[];
    stuffed: string[];
  };
  enhancements: string[];
  summary: string;
  is_fallback?: boolean;
  fallback_type?: "domain" | "ai_generated";
}

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function parseYear(dateStr: string): number | null {
  if (!dateStr) return null;
  const match = dateStr.match(/(\d{4})/);
  return match ? parseInt(match[1], 10) : null;
}

function countCapsSequences(text: string): number {
  const words = text.split(/\s+/).filter(Boolean);
  let count = 0;
  let run = 0;
  for (const w of words) {
    if (w.length > 1 && w === w.toUpperCase() && /[A-Z]/.test(w)) {
      run++;
    } else {
      if (run >= 3) count++;
      run = 0;
    }
  }
  if (run >= 3) count++;
  return count;
}

function buildCVMetadata(content: ResumeContent) {
  let totalBullets = 0;
  let totalWords = 0;
  let capsSequences = 0;
  const totalRoles = content.experience?.items?.length ?? 0;

  const summaryText = content.summary?.content ?? "";
  totalWords += countWords(summaryText);
  capsSequences += countCapsSequences(summaryText);

  let earliestYear: number | null = null;
  for (const item of content.experience?.items ?? []) {
    capsSequences += countCapsSequences(item.role ?? "");
    for (const bullet of item.bullets?.filter(Boolean) ?? []) {
      totalBullets++;
      totalWords += countWords(bullet);
      capsSequences += countCapsSequences(bullet);
    }
    const year = parseYear(item.startDate);
    if (year && (earliestYear === null || year < earliestYear)) {
      earliestYear = year;
    }
  }

  const yearsExperience = earliestYear
    ? Math.max(0, new Date().getFullYear() - earliestYear)
    : 0;

  return {
    has_tables: false,
    is_multicolumn: false,
    uses_icons: false,
    built_with_cvedge: true,
    total_bullets: totalBullets,
    total_roles: totalRoles,
    total_words: totalWords,
    years_experience: yearsExperience,
    caps_sequences: capsSequences,
  };
}

function buildPayload(content: ResumeContent): string {
  const stripped: Record<string, unknown> = {};

  if (content.contact?.name || content.contact?.email) {
    stripped.contact = content.contact;
  }
  if (content.targetTitle?.title) {
    stripped.targetTitle = content.targetTitle;
  }
  if (content.summary?.content) {
    stripped.summary = content.summary;
  }
  if (content.experience?.items?.length) {
    stripped.experience = content.experience;
  }
  if (content.skills?.categories?.length) {
    stripped.skills = content.skills;
  }
  if (content.projects?.items?.length) {
    stripped.projects = content.projects;
  }
  if (content.certifications?.items?.length) {
    stripped.certifications = content.certifications;
  }

  stripped._meta = buildCVMetadata(content);
  return JSON.stringify(stripped);
}

function buildFieldRefs(report: AtsReportData): AtsReportData {
  if (!report.category_scores) return report;
  for (const [category, data] of Object.entries(report.category_scores)) {
    if (!data?.issues) continue;
    for (const issue of data.issues) {
      const desc = (issue.description || "").toLowerCase();

      if (category === "contact") {
        if (desc.includes("phone")) {
          issue.field_ref = { section: "contact", field: "phone" };
        } else if (desc.includes("email")) {
          issue.field_ref = { section: "contact", field: "email" };
        } else if (desc.includes("location")) {
          issue.field_ref = { section: "contact", field: "location" };
        } else if (desc.includes("linkedin")) {
          issue.field_ref = { section: "contact", field: "linkedin" };
        } else {
          issue.field_ref = { section: "contact", field: null };
        }
      } else if (category === "sections") {
        if (desc.includes("summary")) {
          issue.field_ref = { section: "summary", field: null };
        } else if (desc.includes("skill")) {
          issue.field_ref = { section: "skills", field: null };
        } else if (desc.includes("experience") || desc.includes("bullet")) {
          issue.field_ref = { section: "experience", field: "bullets", index: 0 };
        } else {
          issue.field_ref = { section: category, field: null };
        }
      } else if (category === "keywords") {
        issue.field_ref = { section: "skills", field: "skills" };
      } else if (category === "measurable_results" || category === "bullet_quality") {
        const quoted = (issue.description || "").match(/[''\u2018\u2019]([^''\u2018\u2019]{15,}?)[''\u2018\u2019]/);
        issue.field_ref = { section: "experience", field: "bullets", bulletText: quoted?.[1] ?? undefined };
      } else {
        issue.field_ref = { section: category, field: null };
      }
    }
  }

  return report;
}

function inferIndustry(role: string): string {
  const lower = role.toLowerCase();
  if (lower.includes("engineer") || lower.includes("developer") || lower.includes("software")) return "Technology";
  if (lower.includes("design") || lower.includes("ux") || lower.includes("ui")) return "Design/UX";
  if (lower.includes("market") || lower.includes("growth")) return "Marketing";
  if (lower.includes("data") || lower.includes("analyst")) return "Data/Analytics";
  if (lower.includes("product") || lower.includes("pm")) return "Product Management";
  if (lower.includes("finance") || lower.includes("account")) return "Finance";
  if (lower.includes("sales") || lower.includes("business dev")) return "Sales";
  if (lower.includes("hr") || lower.includes("recruit") || lower.includes("people")) return "Human Resources";
  if (lower.includes("manage") || lower.includes("director") || lower.includes("lead")) return "Management";
  return "General";
}

interface KeywordListRow {
  required: string[];
  important: string[];
  nice_to_have: string[];
  synonym_map: Record<string, string[]>;
  is_fallback?: boolean;
  fallback_type?: "domain" | "ai_generated";
}

function inferDomainFromText(role: string): string | null {
  const lower = role.toLowerCase();
  if (lower.includes("design") || lower.includes("ux") || lower.includes("ui")) return "Design";
  if (lower.includes("engineer") || lower.includes("developer") || lower.includes("software")) return "Engineering";
  if (lower.includes("product") && !lower.includes("market")) return "Product";
  if (lower.includes("data") || (lower.includes("analyst") && !lower.includes("business"))) return "Data";
  if (lower.includes("market") || lower.includes("growth") || lower.includes("seo")) return "Marketing";
  if (lower.includes("sales") || lower.includes("account exec")) return "Sales";
  if (lower.includes("project") || lower.includes("operation") || lower.includes("business analyst")) return "Operations";
  if (lower.includes("finance") || lower.includes("financial")) return "Finance";
  if (lower.includes("hr") || lower.includes("recruit") || lower.includes("people")) return "HR & People";
  if (lower.includes("support") || lower.includes("customer success")) return "Customer Support";
  if (lower.includes("writer") || lower.includes("content") || lower.includes("editor")) return "Content & Writing";
  if (lower.includes("legal") || lower.includes("compliance")) return "Legal & Compliance";
  if (lower.includes("research")) return "Research";
  return null;
}

async function generateKeywordList(role: string, domain: string): Promise<KeywordListRow | null> {
  const result = await callAI({
    promptName: "keyword_generate_v1",
    variables: { role, domain },
    feature: "keyword_generate",
  });
  return result as KeywordListRow;
}

async function fetchKeywordList(
  supabase: ReturnType<typeof createAdminClient>,
  targetRole: string
): Promise<KeywordListRow | null> {
  const { data: exact } = await supabase
    .from("keyword_lists")
    .select("required, important, nice_to_have, synonym_map")
    .ilike("role", targetRole)
    .limit(1)
    .single();
  if (exact) return exact;

  const resolved = resolveRole(targetRole);
  if (resolved && resolved.toLowerCase() !== targetRole.toLowerCase()) {
    const { data: mapped } = await supabase
      .from("keyword_lists")
      .select("required, important, nice_to_have, synonym_map")
      .ilike("role", resolved)
      .limit(1)
      .single();
    if (mapped) return mapped;
  }

  const words = targetRole.toLowerCase().split(/[\s,]+/).filter((w) => w.length > 2);
  for (const word of words) {
    const { data: fuzzy } = await supabase
      .from("keyword_lists")
      .select("required, important, nice_to_have, synonym_map")
      .ilike("role", `%${word}%`)
      .not("role", "like", "domain:%")
      .limit(1)
      .single();
    if (fuzzy) return fuzzy;
  }

  const domain = getDomainForRole(targetRole);
  const domainKey = domain ? `domain:${domain}` : null;
  const inferredDomain = domainKey || inferDomainFromText(targetRole);

  if (inferredDomain) {
    const lookupKey = domainKey || `domain:${inferredDomain}`;
    const { data: domainFallback } = await supabase
      .from("keyword_lists")
      .select("required, important, nice_to_have, synonym_map")
      .eq("role", lookupKey)
      .single();
    if (domainFallback) {
      return { ...domainFallback, is_fallback: true, fallback_type: "domain" };
    }
  }

  try {
    const genDomain = domain || inferredDomain || "General";
    const generated = await generateKeywordList(targetRole, genDomain);
    if (generated) {
      await supabase.from("keyword_lists").upsert({
        role: targetRole,
        required: generated.required,
        important: generated.important,
        nice_to_have: generated.nice_to_have,
        synonym_map: generated.synonym_map,
        updated_at: new Date().toISOString(),
      }, { onConflict: "role" });

      return { ...generated, is_fallback: true, fallback_type: "ai_generated" };
    }
  } catch (err) {
    console.error("[ats] AI keyword generation failed:", err);
  }

  return null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function normaliseReport(raw: any): AtsReportData {
  const categories = raw.categories ?? raw.category_scores ?? {};

  const normCats: Record<string, AtsCategoryScore> = {};
  for (const [key, val] of Object.entries(categories)) {
    const cat = val as any;
    normCats[key] = {
      score: cat.score ?? 0,
      weight: typeof cat.weight === "number" ? (cat.weight <= 1 ? cat.weight * 100 : cat.weight) : 0,
      issues: (cat.issues ?? []).map((issue: any) => ({
        description: issue.description ?? "",
        fix: issue.fix ?? "",
        impact: typeof issue.impact === "number" ? issue.impact : (issue.impact === "high" ? 8 : issue.impact === "medium" ? 5 : 3),
        field_ref: issue.field_ref ?? undefined,
      })),
    };
  }

  const kw = raw.keywords ?? {};
  const catKw = (categories.keywords ?? {}) as any;

  const flattenKw = (arr: any[]): string[] =>
    (arr ?? []).map((item: any) =>
      typeof item === "string" ? item : item?.keyword ?? item?.name ?? JSON.stringify(item)
    );

  return {
    score: raw.overall_score ?? raw.score ?? 0,
    confidence: raw.confidence ?? "medium",
    category_scores: normCats,
    keywords: {
      found: flattenKw(kw.found ?? catKw.keywords_found ?? []),
      missing: flattenKw(kw.missing ?? catKw.keywords_missing ?? []),
      stuffed: flattenKw(kw.stuffed ?? catKw.keywords_stuffed ?? []),
    },
    enhancements: Array.isArray(raw.enhancements)
      ? raw.enhancements.map((e: any) => (typeof e === "string" ? e : e.description ?? e.suggestion ?? JSON.stringify(e)))
      : [],
    summary: raw.summary ?? "",
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function analyseCV(cvId: string, caller?: { userId?: string; ip?: string }): Promise<AtsReportData & { id: string; created_at: string }> {
  const supabase = createAdminClient();

  const { data: cv } = await supabase
    .from("cvs")
    .select("id, parsed_json, updated_at")
    .eq("id", cvId)
    .single();

  if (!cv) throw new Error("CV not found");

  const content = cv.parsed_json as ResumeContent;
  if (!content?.contact) throw new Error("CV has no structured data");

  const { data: existingReport } = await supabase
    .from("ats_reports")
    .select("id, report_data, overall_score, confidence, created_at")
    .eq("cv_id", cvId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (
    existingReport &&
    existingReport.report_data &&
    cv.updated_at &&
    new Date(cv.updated_at) < new Date(existingReport.created_at)
  ) {
    const cached = existingReport.report_data as unknown as AtsReportData;
    return {
      ...cached,
      score: existingReport.overall_score ?? cached.score,
      confidence: existingReport.confidence ?? cached.confidence,
      id: existingReport.id,
      created_at: existingReport.created_at,
    };
  }

  const targetTitle = content.targetTitle?.title || "General";
  const inferredIndustry = inferIndustry(targetTitle);

  let keywordList = await fetchKeywordList(supabase, targetTitle);

  if (!keywordList) {
    keywordList = {
      required: ["Communication", "Problem Solving", "Teamwork", "Leadership", "Data Analysis", "Stakeholder Management", "Project Management", "Adaptability"],
      important: ["Time Management", "Critical Thinking", "Presentation Skills", "Strategic Planning"],
      nice_to_have: ["Technical Skills", "Industry Knowledge"],
      synonym_map: {},
      is_fallback: true,
      fallback_type: "domain",
    };
  }

  const payload = buildPayload(content);

  const rawReport = await callAI({
    promptName: "ats_analysis_v1",
    variables: {
      targetTitle,
      inferredIndustry,
      keywordList: JSON.stringify({
        required: keywordList.required,
        important: keywordList.important,
        nice_to_have: keywordList.nice_to_have,
      }),
      synonymMap: JSON.stringify(keywordList.synonym_map ?? {}),
      _meta: JSON.stringify(buildCVMetadata(content)),
      parsedJson: payload,
    },
    feature: "ats_analysis",
    userId: caller?.userId,
    ip: caller?.ip,
  });

  const reportObj = rawReport as Record<string, unknown>;
  console.log("[ats-analyser] Raw Gemini response (full):", JSON.stringify(reportObj, null, 2).slice(0, 1000));
  console.log("[ats-analyser] Raw Gemini keys:", Object.keys(reportObj));
  console.log("[ats-analyser] overall_score:", reportObj.overall_score, "score:", reportObj.score, "confidence:", reportObj.confidence);

  const normalised = normaliseReport(reportObj);
  const report = buildFieldRefs(normalised);

  const kwl = keywordList as unknown as Record<string, unknown>;
  if (kwl.is_fallback) {
    report.is_fallback = true;
    report.fallback_type = kwl.fallback_type as "domain" | "ai_generated";
  }

  const { data: saved, error: saveError } = await supabase
    .from("ats_reports")
    .insert({
      cv_id: cvId,
      score: report.score,
      overall_score: report.score,
      confidence: report.confidence ?? "medium",
      report_data: report as unknown as Record<string, unknown>,
      issues: report as unknown as Record<string, unknown>,
      suggestions: report.enhancements,
    })
    .select("id, created_at")
    .single();

  if (saveError) {
    console.error("[ats-analyser] Save error:", saveError.message);
  }

  return {
    ...report,
    id: saved?.id ?? "",
    created_at: saved?.created_at ?? new Date().toISOString(),
  };
}
