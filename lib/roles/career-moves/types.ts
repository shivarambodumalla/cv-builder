import type { FaqItem } from "@/lib/roles/role-content";
import type { MoveType } from "@/lib/career-path/types";

// Hand-written career progression for /career-path/[role]. Same rule as
// role-content.ts: every entry is written for its role, never interpolated.
// No salary figures here; the page shows live listing data instead.

export interface CareerMove {
  /** Display name of the destination role, e.g. "Data Engineer". */
  toRole: string;
  /** Slug in ALL_ROLES (lib/jobs/role-categories.ts) when one exists, for linking. */
  toSlug?: string;
  moveType: MoveType;
  /** When people usually make this move, e.g. "After 2-3 years owning dashboards end to end". */
  typicalTiming: string;
  /** Why this move is natural from this specific role. 1-2 sentences. */
  why: string;
  /** 3-5 concrete skills or tools to add. */
  skillsToAdd: string[];
  /** What should already be on the resume before applying. One sentence. */
  proof: string;
}

export interface RoleCareerPath {
  /** 2-3 sentences on how careers in this role typically progress in the US market. */
  overview: string;
  /** 4-5 moves mixing step_up, lateral and pivot. */
  moves: CareerMove[];
  /** 3-4 career-path questions that don't repeat the role's resume or interview FAQs. */
  faqs: FaqItem[];
}
