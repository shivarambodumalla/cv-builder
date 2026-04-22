import type { ResumeContent } from "@/lib/resume/types";

// Mirror of the family map in lib/jobs/matcher.ts — copied here to avoid coupling
// the email path to the full matcher module (and its provider imports).
const TITLE_FAMILY_MAP: Record<string, string[]> = {
  engineer: ["Software Engineer", "Backend Developer", "Full-stack Developer", "Solutions Architect"],
  developer: ["Developer", "Software Engineer", "Senior Developer", "Application Developer"],
  designer: ["Product Designer", "UX Designer", "UI Designer", "Senior Designer"],
  manager: ["Program Manager", "Engineering Manager", "Operations Manager", "Team Lead"],
  analyst: ["Business Analyst", "Data Analyst", "Strategy Consultant", "Operations Analyst"],
  data: ["Data Scientist", "Data Engineer", "Analytics Engineer", "ML Engineer"],
  product: ["Product Owner", "Program Manager", "Growth Manager", "Product Marketing Manager"],
  devops: ["DevOps Engineer", "Platform Engineer", "SRE", "Infrastructure Engineer"],
  qa: ["QA Engineer", "Test Engineer", "SDET", "Quality Lead"],
  security: ["Security Engineer", "Security Analyst", "Penetration Tester"],
  marketing: ["Growth Manager", "Digital Marketing Manager", "Brand Manager"],
  sales: ["Account Executive", "Business Development", "Sales Manager"],
};

export function getAdjacentRoles(cv: ResumeContent | null): string[] {
  const current = (cv?.targetTitle?.title || cv?.experience?.items?.[0]?.role || "").toLowerCase();
  if (!current) return ["Product Manager", "Business Analyst", "Operations Manager"];

  for (const [key, variants] of Object.entries(TITLE_FAMILY_MAP)) {
    if (current.includes(key)) {
      // Return 3 variants that don't trivially match the current title
      return variants.filter((v) => !current.includes(v.toLowerCase())).slice(0, 3);
    }
  }
  // Fallback — generic adjacent roles
  return ["Senior Specialist", "Team Lead", "Consultant"];
}

// Hand-written tips pool. Rotated per user per week by (user_id + week) hash.
const TIP_POOL: string[] = [
  "Keep your CV updated weekly, not monthly. Recruiters favour CVs modified in the last 7 days.",
  "Quantify one bullet per role. Numbers beat adjectives every time in ATS scoring.",
  "Mirror the exact phrasing from target job descriptions — ATS keyword matching is literal.",
  "Short bullets win. Aim for one line per achievement, two tops.",
  "Lead every bullet with a strong verb. Passive voice reads as low-ownership to recruiters.",
  "Keep one master CV, then tailor one version per application. Two files, not twenty.",
  "Drop skills you haven't used in 5+ years. Relevance beats breadth.",
  "Certifications get you past ATS. Link to the issuing body — not just a logo.",
  "If your summary is longer than 3 sentences, it's a bio. Cut it back to a pitch.",
  "Add the city, even for remote roles. ATS location filters still run.",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function weekNumber(d: Date = new Date()): number {
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const diffDays = Math.floor((d.getTime() - start.getTime()) / 86400000);
  return Math.floor((diffDays + start.getUTCDay()) / 7);
}

export function getRotatingTip(userId: string): string {
  const idx = (hashString(userId) + weekNumber()) % TIP_POOL.length;
  return TIP_POOL[idx];
}

export function getAtsMessage(score: number | null): { label: string; message: string } {
  if (score === null) {
    return {
      label: "Not scored yet",
      message: "Run an ATS check on your CV to see where you stand.",
    };
  }
  if (score >= 90) return { label: "Interview Ready", message: "You're in strong shape — focus on application volume." };
  if (score >= 75) return { label: "Strong Profile", message: "Solid. A couple of tweaks and you'll be interview-ready." };
  if (score >= 60) return { label: "Needs Improvement", message: "Close the gaps in keywords and measurable results." };
  return { label: "At Risk", message: "Your CV is leaking matches. Tighten it before you apply." };
}
