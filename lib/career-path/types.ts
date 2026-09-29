// Shared contract for the Career Path Finder (/career-path).
//
// The AI returns the full result once; the server stores it and decides what
// each viewer sees. Anonymous viewers get a CareerPathPreview (roles, fit,
// market data, transferable skills, and only a COUNT of skills to build).
// The named skill gaps, 90-day plan and proof project are sent to the browser
// only after Google sign-in, so the lock is enforced server-side, not by blur.

export const MOVE_TYPES = ["step_up", "lateral", "pivot"] as const;
export type MoveType = (typeof MOVE_TYPES)[number];

export const MOVE_TYPE_LABELS: Record<MoveType, string> = {
  step_up: "Step up",
  lateral: "Sideways move",
  pivot: "Career change",
};

export const PREFERENCES = [
  { id: "higher_pay", label: "Higher pay" },
  { id: "leadership", label: "Lead people" },
  { id: "deeper_expertise", label: "Go deeper in my craft" },
  { id: "remote", label: "Remote-friendly" },
  { id: "new_field", label: "Change fields" },
  { id: "work_life", label: "Better work-life balance" },
] as const;
export type PreferenceId = (typeof PREFERENCES)[number]["id"];
export const MAX_PREFERENCES = 3;

/** POST /api/career-path body. currentRole is required unless redirectToken is set. */
export interface CareerPathInput {
  currentRole?: string | null;
  yearsExperience?: number | null;
  preferences?: PreferenceId[];
  /** redirect_token returned by /api/cv/upload-public when the visitor uploaded a resume. */
  redirectToken?: string | null;
}

/** Live market snapshot built from job-provider listings, never from the AI. */
export interface RoleMarket {
  /** ISO-3166 alpha-2, lowercase (e.g. "us"). */
  country: string;
  /** ISO-4217 (e.g. "USD"). */
  currency: string;
  openJobs: number;
  /** Salary fields are null when fewer than MIN_SALARY_SAMPLE listings advertise a salary. */
  salaryLow: number | null;
  salaryMedian: number | null;
  salaryHigh: number | null;
  sampleSize: number;
  fetchedAt: string;
}
export const MIN_SALARY_SAMPLE = 5;

export interface SkillToBuild {
  skill: string;
  why: string;
  /** 1 = learn first. */
  priority: 1 | 2 | 3;
}

export interface PlanPhase {
  /** "Days 1-30", "Days 31-60", "Days 61-90". */
  label: string;
  focus: string;
  actions: string[];
}

export interface CareerPathOption {
  title: string;
  moveType: MoveType;
  /** 0-100. */
  fit: number;
  why: string;
  transferableSkills: string[];
  market: RoleMarket | null;
  // Locked until sign-in:
  skillsToBuild: SkillToBuild[];
  /** Exactly 3 phases. */
  plan90: PlanPhase[];
  proofProject: string;
  searchTitles: string[];
}

export interface CareerPathResult {
  summary: string;
  /** 3-5 options, best fit first. */
  paths: CareerPathOption[];
}

export type CareerPathPreviewOption = Omit<
  CareerPathOption,
  "skillsToBuild" | "plan90" | "proofProject" | "searchTitles"
> & { skillsToBuildCount: number };

export interface CareerPathPreview {
  summary: string;
  paths: CareerPathPreviewOption[];
}

export type CareerPathSource = "role" | "resume";

/** A row of the career_paths table, camel-cased. */
export interface CareerPathRecord {
  id: string;
  userId: string | null;
  cvId: string | null;
  source: CareerPathSource;
  currentRole: string;
  yearsExperience: number | null;
  preferences: PreferenceId[];
  country: string;
  result: CareerPathResult;
  selectedRole: string | null;
  createdAt: string;
  claimedAt: string | null;
}

/** POST /api/career-path response. */
export interface CreateCareerPathResponse {
  id: string;
  source: CareerPathSource;
  preview: CareerPathPreview;
}

/** Outcome of attaching an anonymous career path (and its pending CV) to a signed-in user. */
export interface ClaimResult {
  /** The CV now targeted at the selected role, if one was claimed from this flow. */
  cvId: string | null;
  claimedCv: boolean;
  /** A resume was uploaded but the free CV limit blocked claiming it. */
  cvLimitReached: boolean;
}

/** Client-side funnel events, sent as page views to /popup/career-path/<event>. */
export const CAREER_PATH_EVENTS = [
  "started_role",
  "started_resume",
  "results_shown",
  "unlock_clicked",
  "plan_viewed",
  "tailor_clicked",
] as const;
export type CareerPathEvent = (typeof CAREER_PATH_EVENTS)[number];
