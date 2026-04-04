import { createAdminClient } from "@/lib/supabase/admin";
import { callAI } from "@/lib/ai/client";
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
}

function buildCVMetadata(content: ResumeContent) {
  let totalBullets = 0;
  const totalRoles = content.experience?.items?.length ?? 0;

  for (const item of content.experience?.items ?? []) {
    totalBullets += item.bullets?.filter(Boolean).length ?? 0;
  }

  return {
    has_tables: false,
    is_multicolumn: false,
    uses_icons: false,
    built_with_cvpilot: true,
    total_bullets: totalBullets,
    total_roles: totalRoles,
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
  for (const [category, data] of Object.entries(report.category_scores)) {
    for (const issue of data.issues) {
      const desc = issue.description.toLowerCase();

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
      } else if (category === "measurable_results") {
        issue.field_ref = { section: "experience", field: "bullets", index: 0 };
      } else if (category === "bullet_quality") {
        issue.field_ref = { section: "experience", field: "bullets", bulletText: issue.description };
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

export async function analyseCV(cvId: string): Promise<AtsReportData & { id: string; created_at: string }> {
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
    .select("*")
    .eq("cv_id", cvId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (
    existingReport &&
    cv.updated_at &&
    new Date(cv.updated_at) < new Date(existingReport.created_at)
  ) {
    const cached = existingReport.issues as unknown as AtsReportData;
    return {
      ...cached,
      id: existingReport.id,
      created_at: existingReport.created_at,
    };
  }

  const targetTitle = content.targetTitle?.title || "General";
  const inferredIndustry = inferIndustry(targetTitle);

  const { data: keywordList } = await supabase
    .from("keyword_lists")
    .select("required, important, nice_to_have, synonym_map")
    .eq("role", targetTitle)
    .single();

  if (!keywordList) {
    throw Object.assign(new Error("keyword_list_required"), {
      code: "keyword_list_required",
      role: targetTitle,
    });
  }

  const payload = buildPayload(content);

  const rawReport: AtsReportData = await callAI({
    promptName: "ats_analysis_v1",
    variables: {
      targetTitle,
      inferredIndustry,
      keywordList: JSON.stringify({
        required: keywordList.required,
        important: keywordList.important,
        nice_to_have: keywordList.nice_to_have,
      }),
      synonymMap: JSON.stringify(keywordList.synonym_map),
      _meta: JSON.stringify(buildCVMetadata(content)),
      parsedJson: payload,
    },
    feature: "ats_analysis",
  });

  const report = buildFieldRefs(rawReport);

  const { data: saved, error: saveError } = await supabase
    .from("ats_reports")
    .insert({
      cv_id: cvId,
      score: report.score,
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
