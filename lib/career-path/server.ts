// Server-side data access for the Career Path Finder. All queries use the
// admin client (career_paths has no anon/insert policies by design); every
// function checks ownership itself.

import { createAdminClient } from "@/lib/supabase/admin";
import { checkCvLimit } from "@/lib/billing/limits";
import { uniqueCvTitle } from "@/lib/resume/unique-title";
import { sanitizeDbString } from "@/lib/resume/sanitize";
import { cleanText, toPreview } from "./normalise";
import type {
  CareerPathRecord,
  CareerPathResult,
  CareerPathSource,
  ClaimResult,
  PreferenceId,
} from "./types";

export { toPreview };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

/** Not found, or owned by someone else. Callers map this to 404. */
export class CareerPathNotFoundError extends Error {
  constructor(message = "Career path not found") {
    super(message);
    this.name = "CareerPathNotFoundError";
  }
}

/** Bad input from the caller. Callers map this to 400. */
export class CareerPathInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CareerPathInputError";
  }
}

const RECORD_COLUMNS =
  "id, user_id, cv_id, source, current_role, years_experience, preferences, country, result, selected_role, created_at, claimed_at";

interface CareerPathRow {
  id: string;
  user_id: string | null;
  cv_id: string | null;
  source: CareerPathSource;
  current_role: string;
  years_experience: number | null;
  preferences: string[] | null;
  country: string;
  result: CareerPathResult;
  selected_role: string | null;
  created_at: string;
  claimed_at: string | null;
}

function toRecord(row: CareerPathRow): CareerPathRecord {
  return {
    id: row.id,
    userId: row.user_id,
    cvId: row.cv_id,
    source: row.source,
    currentRole: row.current_role,
    yearsExperience: row.years_experience,
    preferences: (row.preferences ?? []) as PreferenceId[],
    country: row.country,
    result: row.result,
    selectedRole: row.selected_role,
    createdAt: row.created_at,
    claimedAt: row.claimed_at,
  };
}

/** Null for a malformed id or a missing row. Throws on a database error. */
export async function getCareerPathRecord(id: string): Promise<CareerPathRecord | null> {
  if (!isUuid(id)) return null;
  const admin = createAdminClient();
  const { data, error } = await admin.from("career_paths").select(RECORD_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw new Error(`career_paths read failed: ${error.message}`);
  return data ? toRecord(data as CareerPathRow) : null;
}

/** The result's own title matching `role` (case-insensitive), or null. */
function matchPathTitle(result: CareerPathResult, role: string | null | undefined): string | null {
  const wanted = cleanText(role, 80).toLowerCase();
  if (!wanted) return null;
  return result.paths.find((p) => p.title.toLowerCase() === wanted)?.title ?? null;
}

/**
 * Attach a career path (and the resume uploaded with it) to a signed-in user.
 * Idempotent. `selectedRole` must be one of the result's titles; anything else
 * is ignored rather than stored. Throws CareerPathNotFoundError when the row is
 * missing or belongs to someone else.
 */
export async function claimCareerPath(
  id: string,
  userId: string,
  selectedRole: string | null
): Promise<ClaimResult> {
  if (!isUuid(id)) throw new CareerPathNotFoundError();
  const admin = createAdminClient();

  const { data: row, error: readError } = await admin
    .from("career_paths")
    .select("id, user_id, cv_id, result")
    .eq("id", id)
    .maybeSingle();
  if (readError) throw new Error(`career_paths read failed: ${readError.message}`);
  if (!row || (row.user_id && row.user_id !== userId)) throw new CareerPathNotFoundError();

  const role = matchPathTitle(row.result as CareerPathResult, selectedRole);

  // 1. The career path row.
  if (!row.user_id) {
    const { data: claimed, error } = await admin
      .from("career_paths")
      .update({ user_id: userId, claimed_at: new Date().toISOString(), ...(role ? { selected_role: role } : {}) })
      .eq("id", id)
      .is("user_id", null)
      .select("id");
    if (error) throw new Error(`career_paths claim failed: ${error.message}`);
    if (!claimed || claimed.length === 0) {
      // Lost a race: someone claimed it between the read and the update.
      const { data: now } = await admin.from("career_paths").select("user_id").eq("id", id).maybeSingle();
      if (now?.user_id !== userId) throw new CareerPathNotFoundError();
      if (role) await updateSelectedRole(admin, id, role);
    }
  } else if (role) {
    await updateSelectedRole(admin, id, role);
  }

  // 2. The resume uploaded in this flow, if any.
  if (!row.cv_id) return { cvId: null, claimedCv: false, cvLimitReached: false };

  const { data: cv, error: cvError } = await admin
    .from("cvs")
    .select("id, title, user_id, status")
    .eq("id", row.cv_id)
    .maybeSingle();
  if (cvError) throw new Error(`cvs read failed: ${cvError.message}`);
  if (!cv) return { cvId: null, claimedCv: false, cvLimitReached: false };

  if (cv.user_id === userId) {
    if (role) await setCvTargetRole(admin, cv.id, userId, role);
    return { cvId: cv.id, claimedCv: true, cvLimitReached: false };
  }

  if (cv.user_id !== null || cv.status !== "pending_auth") {
    return { cvId: null, claimedCv: false, cvLimitReached: false };
  }

  // Same steps as /api/cv/claim.
  const cvLimit = await checkCvLimit(admin, userId);
  if (!cvLimit.allowed) return { cvId: null, claimedCv: false, cvLimitReached: true };

  const title = await uniqueCvTitle(admin, userId, cv.title || "Untitled CV");
  const { data: claimedCv, error: claimError } = await admin
    .from("cvs")
    .update({
      user_id: userId,
      title,
      status: "active",
      redirect_token: null,
      ...(role ? { target_role: sanitizeDbString(role) } : {}),
    })
    .eq("id", cv.id)
    .is("user_id", null)
    .eq("status", "pending_auth")
    .select("id");
  if (claimError) throw new Error(`cvs claim failed: ${claimError.message}`);
  if (!claimedCv || claimedCv.length === 0) {
    // Claimed concurrently (e.g. a second tab): report it only if it is ours.
    const { data: now } = await admin.from("cvs").select("user_id").eq("id", cv.id).maybeSingle();
    return now?.user_id === userId
      ? { cvId: cv.id, claimedCv: true, cvLimitReached: false }
      : { cvId: null, claimedCv: false, cvLimitReached: false };
  }

  return { cvId: cv.id, claimedCv: true, cvLimitReached: false };
}

type AdminClient = ReturnType<typeof createAdminClient>;

async function updateSelectedRole(admin: AdminClient, id: string, role: string): Promise<void> {
  const { error } = await admin.from("career_paths").update({ selected_role: role }).eq("id", id);
  if (error) throw new Error(`career_paths selected_role update failed: ${error.message}`);
}

async function setCvTargetRole(admin: AdminClient, cvId: string, userId: string, role: string): Promise<boolean> {
  const { data, error } = await admin
    .from("cvs")
    .update({ target_role: sanitizeDbString(role) })
    .eq("id", cvId)
    .eq("user_id", userId)
    .select("id");
  if (error) throw new Error(`cvs target_role update failed: ${error.message}`);
  return !!data && data.length > 0;
}

/**
 * Point one of the user's resumes at a role (cvs.target_role only; resume
 * content is untouched). Throws CareerPathInputError for bad input and
 * CareerPathNotFoundError when the resume is not theirs.
 */
export async function applyRoleToCv(userId: string, cvId: string, role: string): Promise<void> {
  if (!isUuid(cvId)) throw new CareerPathInputError("Choose a resume to update.");
  const cleanRole = cleanText(role, 80);
  if (cleanRole.length < 2) throw new CareerPathInputError("Choose a role to target.");

  const updated = await setCvTargetRole(createAdminClient(), cvId, userId, cleanRole);
  if (!updated) throw new CareerPathNotFoundError("Resume not found");
}

/** The user's career paths, newest first (dashboard link, plan history). */
export async function listUserCareerPaths(
  userId: string
): Promise<Pick<CareerPathRecord, "id" | "currentRole" | "selectedRole" | "createdAt">[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("career_paths")
    .select("id, current_role, selected_role, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw new Error(`career_paths list failed: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: row.id as string,
    currentRole: row.current_role as string,
    selectedRole: (row.selected_role as string | null) ?? null,
    createdAt: row.created_at as string,
  }));
}
