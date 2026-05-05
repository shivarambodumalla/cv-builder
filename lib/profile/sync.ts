import { createAdminClient } from "@/lib/supabase/admin";
import { computeYearsOfExperience } from "@/lib/resume/years-of-experience";
import type { ResumeContent } from "@/lib/resume/types";

const INDUSTRY_MAP: Record<string, string> = {
  // Technology
  "software engineer": "Technology", "software developer": "Technology",
  "frontend engineer": "Technology", "backend engineer": "Technology",
  "full stack": "Technology", "fullstack": "Technology",
  "devops": "Technology", "sre": "Technology", "platform engineer": "Technology",
  "data engineer": "Technology", "ml engineer": "Technology",
  "ai engineer": "Technology", "cloud engineer": "Technology",
  "mobile developer": "Technology", "ios developer": "Technology",
  "android developer": "Technology", "web developer": "Technology",
  "qa engineer": "Technology", "test engineer": "Technology",
  "security engineer": "Technology", "embedded engineer": "Technology",
  "systems engineer": "Technology", "solutions architect": "Technology",
  "technical lead": "Technology", "tech lead": "Technology",
  "cto": "Technology", "vp engineering": "Technology",
  // Product
  "product manager": "Product", "product owner": "Product",
  "program manager": "Product", "technical program manager": "Product",
  // Data & Analytics
  "data scientist": "Analytics", "data analyst": "Analytics",
  "business analyst": "Analytics", "business intelligence": "Analytics",
  "analytics engineer": "Analytics", "quantitative analyst": "Analytics",
  // Design
  "designer": "Design", "ux designer": "Design", "ui designer": "Design",
  "product designer": "Design", "graphic designer": "Design",
  "visual designer": "Design", "ux researcher": "Design",
  "design lead": "Design", "creative director": "Design",
  // Marketing
  "marketing": "Marketing", "growth": "Marketing", "seo": "Marketing",
  "content strategist": "Marketing", "brand": "Marketing",
  "digital marketing": "Marketing", "performance marketing": "Marketing",
  // Sales
  "sales": "Sales", "account executive": "Sales", "account manager": "Sales",
  "business development": "Sales", "sales engineer": "Sales",
  // Finance
  "finance": "Finance", "financial analyst": "Finance", "accountant": "Finance",
  "cfo": "Finance", "investment": "Finance", "banking": "Finance",
  "controller": "Finance", "treasurer": "Finance",
  // HR & People
  "hr": "HR", "recruiter": "HR", "talent": "HR", "people ops": "HR",
  "human resources": "HR", "chro": "HR",
  // Operations
  "operations": "Operations", "coo": "Operations", "supply chain": "Operations",
  "logistics": "Operations", "project manager": "Operations",
  // Legal
  "lawyer": "Legal", "attorney": "Legal", "legal": "Legal", "counsel": "Legal",
  // Healthcare
  "nurse": "Healthcare", "doctor": "Healthcare", "physician": "Healthcare",
  "healthcare": "Healthcare", "clinical": "Healthcare",
  // Education
  "teacher": "Education", "professor": "Education", "educator": "Education",
  "curriculum": "Education",
  // Executive
  "ceo": "Executive", "president": "Executive", "chief": "Executive",
  "vp ": "Executive", "vice president": "Executive", "director": "Executive",
};

function inferIndustry(targetRole: string | null | undefined): string | null {
  if (!targetRole) return null;
  const lower = targetRole.toLowerCase();
  for (const [keyword, industry] of Object.entries(INDUSTRY_MAP)) {
    if (lower.includes(keyword)) return industry;
  }
  return null;
}

function inferExperienceLevel(years: number | null): string | null {
  if (years === null) return null;
  if (years < 2) return "early";
  if (years < 5) return "mid";
  if (years < 10) return "senior";
  return "expert";
}

function extractGithubUrl(content: ResumeContent): string | null {
  const website = content.contact?.website;
  if (website?.includes("github.com")) return website;
  for (const proj of content.projects?.items ?? []) {
    if (proj.url?.includes("github.com")) return proj.url;
  }
  return null;
}

function extractPortfolioUrl(content: ResumeContent): string | null {
  const website = content.contact?.website;
  if (!website || website.includes("github.com")) return null;
  return website;
}

export async function syncProfileFromCv(
  userId: string,
  cvId: string,
  content: ResumeContent,
): Promise<void> {
  try {
    const admin = createAdminClient();

    const yearsExp = computeYearsOfExperience(content);
    const targetRole = content.targetTitle?.title?.trim() || null;
    const industry = inferIndustry(targetRole);
    const experienceLevel = inferExperienceLevel(yearsExp);
    const githubUrl = extractGithubUrl(content);
    const portfolioUrl = extractPortfolioUrl(content);

    const skills =
      (content.skills?.categories?.length ?? 0) > 0
        ? content.skills.categories
        : null;
    const certifications =
      (content.certifications?.items?.length ?? 0) > 0
        ? content.certifications.items
        : null;
    const educationItems =
      (content.education?.items?.length ?? 0) > 0
        ? content.education.items
        : null;

    const updates: Record<string, unknown> = {
      latest_cv_parsed_json: content,
      cv_location: content.contact?.location?.trim() || null,
      phone: content.contact?.phone?.trim() || null,
      summary: content.summary?.content?.trim() || null,
      skills,
      certifications,
      education: educationItems,
      years_experience: yearsExp,
      experience_level: experienceLevel,
    };

    // Only overwrite these if the CV provides a value — don't clear user-set data
    if (targetRole) updates.target_role = targetRole;
    if (industry) updates.industry = industry;
    if (content.contact?.linkedin?.trim()) updates.linkedin_url = content.contact.linkedin.trim();
    if (githubUrl) updates.github_url = githubUrl;
    if (portfolioUrl) updates.portfolio_url = portfolioUrl;
    if (content.contact?.phone?.trim()) updates.phone = content.contact.phone.trim();

    await admin.from("profiles").update(updates).eq("id", userId);
  } catch (err) {
    // Fire-and-forget — log but never throw
    console.error("[syncProfileFromCv] failed:", err);
  }
}

export async function syncBestAtsScore(
  userId: string,
  newScore: number,
): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .select("best_ats_score")
      .eq("id", userId)
      .single();
    const current = data?.best_ats_score ?? 0;
    if (newScore > current) {
      await admin.from("profiles").update({ best_ats_score: newScore }).eq("id", userId);
    }
  } catch (err) {
    console.error("[syncBestAtsScore] failed:", err);
  }
}

export async function setPrimaryGoalIfUnset(
  userId: string,
  goal: "ats_score" | "job_match" | "cover_letter" | "download" | "coach",
): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .select("primary_goal")
      .eq("id", userId)
      .single();
    if (!data?.primary_goal) {
      await admin.from("profiles").update({ primary_goal: goal }).eq("id", userId);
    }
  } catch (err) {
    console.error("[setPrimaryGoalIfUnset] failed:", err);
  }
}
