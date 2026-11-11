import { createAdminClient } from "@/lib/supabase/admin";
import { PAYWALL_FEATURE_LABELS, paywallFeatureLabel } from "@/lib/admin/daily";

/**
 * Everything one user did, newest first, for the Activity tab of
 * /admin/users/[number]. user_activity alone misses things that are never
 * logged as events (CVs created, payments, AI calls, ratings, guarantee
 * claims), so those tables are merged in. Raw event names are turned into
 * plain labels here, on the server.
 */

export type ActivityCategory = "paywall" | "product" | "ai" | "billing" | "popups" | "account" | "pages";

export interface ActivityItem {
  id: string;
  at: string;
  label: string;
  detail: string | null;
  page: string | null;
  category: ActivityCategory;
}

const ACTIVITY_LIMIT = 1000;
const AI_LIMIT = 300;

/** Upgrade-modal trigger → feature key (mirrors TRIGGER_FEATURE in daily.ts). */
const TRIGGER_LABEL: Record<string, string> = {
  ats_limit: PAYWALL_FEATURE_LABELS.ats_scan,
  rewrite_limit: PAYWALL_FEATURE_LABELS.ai_rewrite,
  job_match_limit: PAYWALL_FEATURE_LABELS.job_match,
  cover_letter_limit: PAYWALL_FEATURE_LABELS.cover_letter,
  fix_all_limit: PAYWALL_FEATURE_LABELS.fix_all,
  cv_tailor_limit: PAYWALL_FEATURE_LABELS.cv_tailor,
  offer_eval_limit: PAYWALL_FEATURE_LABELS.offer_eval,
  portfolio_scan_limit: PAYWALL_FEATURE_LABELS.portfolio_scan,
  story_summary_limit: PAYWALL_FEATURE_LABELS.story_summary,
  interview_prep_limit: PAYWALL_FEATURE_LABELS.interview_prep,
  cv_limit: PAYWALL_FEATURE_LABELS.cv_limit,
  template_locked: PAYWALL_FEATURE_LABELS.template,
  download: PAYWALL_FEATURE_LABELS.pdf_download,
  generic: PAYWALL_FEATURE_LABELS.generic,
};

const AI_FEATURE_LABELS: Record<string, string> = {
  ats_analysis: "ATS analysis",
  ats_scan: "ATS analysis",
  job_match: "Job match",
  cover_letter: "Cover letter",
  bullet_rewrite: "AI rewrite",
  ai_rewrite: "AI rewrite",
  fix_all: "Fix All",
  cv_tailor: "Tailor CV",
  cv_parse: "Resume upload parsing",
  jd_red_flag: "JD red flags",
  offer_evaluation: "Offer evaluation",
  offer_eval: "Offer evaluation",
  keyword_generate: "Keyword list",
  career_path: "Career path",
  interview_prep: "Interview prep",
  story_extract: "Story extraction",
  story_match: "Story match",
  story_quality: "Story scoring",
  story_summary: "Story summary",
  portfolio_scan: "Portfolio scan",
  cv_expert_review: "Expert review draft",
};

type Meta = Record<string, unknown> | null;

const words = (s: string) => s.replace(/[_-]/g, " ");
const str = (v: unknown) => (v === undefined || v === null || v === "" ? null : String(v));

function genericDetail(meta: Meta): string | null {
  if (!meta) return null;
  const parts: string[] = [];
  for (const key of ["score", "grade", "template", "title", "tone", "mode", "count", "changes", "plan", "period", "value"]) {
    const v = str(meta[key]);
    if (v) parts.push(`${key}: ${v}`);
  }
  return parts.length ? parts.join(" · ") : null;
}

/** Plain label, detail and category for a user_activity row. */
export function describeActivity(event: string, meta: Meta): Pick<ActivityItem, "label" | "detail" | "category"> {
  if (event === "feature_blocked") {
    const limit = Number(meta?.limit);
    const quota = limit === 0 ? "Pro only" : str(meta?.used) && str(meta?.limit) ? `${meta?.used} of ${meta?.limit} used` : null;
    return { label: `Blocked: ${paywallFeatureLabel(String(meta?.feature ?? "unknown"))}`, detail: quota, category: "paywall" };
  }
  if (event === "Saw upgrade modal" || event === "Dismissed upgrade modal") {
    const trigger = str(meta?.trigger);
    return {
      label: event === "Saw upgrade modal" ? "Saw the upgrade offer" : "Closed the upgrade offer",
      detail: trigger ? `from ${TRIGGER_LABEL[trigger] ?? words(trigger)}` : null,
      category: "paywall",
    };
  }
  if (event === "Clicked pay button") {
    return { label: "Clicked pay", detail: str(meta?.period) ? `${meta?.period} plan` : null, category: "paywall" };
  }
  if (event === "Hit upgrade wall" || /^Hit .+ limit$/i.test(event) || event === "picker_locked_template") {
    return {
      label: event === "picker_locked_template" ? "Tried a locked template" : event,
      detail: genericDetail(meta),
      category: "paywall",
    };
  }
  if (event === "Upgraded to Pro") return { label: event, detail: genericDetail(meta), category: "billing" };
  if (event === "picker_completed") {
    return { label: "Picked a template", detail: str(meta?.template), category: "product" };
  }
  if (event === "picker_abandoned") return { label: "Left the template picker", detail: null, category: "product" };

  const popup = event.match(/^popover_(shown|click|dismiss):(.+)$/);
  if (popup) {
    const verb = { shown: "Popup shown", click: "Popup clicked", dismiss: "Popup dismissed" }[popup[1] as "shown" | "click" | "dismiss"];
    return { label: `${verb}: ${words(popup[2])}`, detail: null, category: "popups" };
  }
  if (event.startsWith("Pre-login: visited ")) {
    return { label: "Visited before signing up", detail: event.slice("Pre-login: visited ".length), category: "pages" };
  }
  if (/^opened /i.test(event) || event === "page_view") return { label: event, detail: null, category: "pages" };
  if (event === "Signed up" || event === "Logged in") return { label: event, detail: null, category: "account" };
  return { label: event, detail: genericDetail(meta), category: "product" };
}

const money = (n: number) => `$${Math.abs(n).toFixed(2)}`;

export async function loadUserActivity(userId: string): Promise<{ items: ActivityItem[]; failed: string[] }> {
  const db = createAdminClient();
  const [activity, history, feedback, cvs, ai, claims] = await Promise.all([
    db.from("user_activity").select("id, event, page, metadata, created_at").eq("user_id", userId)
      .order("created_at", { ascending: false }).limit(ACTIVITY_LIMIT),
    db.from("subscription_history").select("id, plan, period, amount, status, started_at").eq("user_id", userId)
      .order("started_at", { ascending: false }),
    db.from("feedback").select("id, rating, comment, source, created_at").eq("user_id", userId),
    db.from("cvs").select("id, title, created_at").eq("user_id", userId),
    db.from("ai_usage_logs").select("id, feature, status, cost_usd, created_at").eq("user_id", userId)
      .order("created_at", { ascending: false }).limit(AI_LIMIT),
    db.from("guarantee_claims").select("id, current_score, status, created_at").eq("user_id", userId),
  ]);

  const failed: string[] = [];
  const rows = <T,>(name: string, res: { data: T[] | null; error: { message: string } | null }): T[] => {
    if (res.error) {
      console.error(`[admin] user activity: ${name} failed:`, res.error.message);
      failed.push(name);
    }
    return res.data ?? [];
  };

  const items: ActivityItem[] = [];

  for (const r of rows("activity", activity)) {
    items.push({ id: `a:${r.id}`, at: r.created_at, page: r.page, ...describeActivity(r.event, (r.metadata as Meta) ?? null) });
  }

  for (const h of rows("payments", history)) {
    const amount = Number(h.amount ?? 0);
    const label =
      h.status === "active" ? (amount > 0 ? "Paid for Pro" : "Pro activated")
      : h.status === "renewal" ? "Pro renewed"
      : h.status === "refunded" ? "Refunded"
      : h.status === "cancelled" ? "Cancelled Pro"
      : h.status === "suspended" ? "Suspended by admin"
      : h.status === "mock" ? "Test upgrade (no payment)"
      : `Subscription ${h.status}`;
    const period = h.period && !["cancelled", "suspended", "refunded"].includes(h.period) ? h.period : null;
    items.push({
      id: `s:${h.id}`,
      at: h.started_at,
      label,
      detail: [amount !== 0 ? money(amount) : null, period].filter(Boolean).join(" · ") || null,
      page: null,
      category: "billing",
    });
  }

  for (const f of rows("ratings", feedback)) {
    items.push({
      id: `f:${f.id}`,
      at: f.created_at,
      label: `Rated CVEdge ${f.rating}/5`,
      detail: [f.source === "email" ? "from the email" : "in the app", f.comment ? `"${String(f.comment).slice(0, 140)}"` : null].filter(Boolean).join(" · "),
      page: null,
      category: "product",
    });
  }

  for (const c of rows("resumes", cvs)) {
    items.push({ id: `c:${c.id}`, at: c.created_at, label: "Created a resume", detail: c.title || null, page: null, category: "product" });
  }

  for (const l of rows("AI calls", ai)) {
    const ok = l.status === "success";
    items.push({
      id: `ai:${l.id}`,
      at: l.created_at,
      label: `AI: ${AI_FEATURE_LABELS[l.feature] ?? words(l.feature)}${ok ? "" : " (failed)"}`,
      detail: Number(l.cost_usd ?? 0) > 0 ? `$${Number(l.cost_usd).toFixed(4)}` : null,
      page: null,
      category: "ai",
    });
  }

  for (const g of rows("guarantee claims", claims)) {
    items.push({
      id: `g:${g.id}`,
      at: g.created_at,
      label: "Claimed the 80+ score guarantee",
      detail: [g.current_score != null ? `score ${g.current_score}` : null, g.status].filter(Boolean).join(" · "),
      page: null,
      category: "billing",
    });
  }

  items.sort((a, b) => b.at.localeCompare(a.at));
  return { items, failed };
}
