import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function nullOrString(v: string | null): string | null {
  return v && v !== "all" && v !== "" ? v : null;
}
function nullOrArr(v: string | null): string[] | null {
  if (!v || v === "") return null;
  const arr = v.split(",").map((s) => s.trim()).filter(Boolean);
  return arr.length > 0 ? arr : null;
}
function nullOrInt(v: string | null): number | null {
  if (!v || v === "") return null;
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
}
function nullOrNum(v: string | null): number | null {
  if (!v || v === "") return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}
function nullOrBool(v: string | null): boolean | null {
  if (v === "true") return true;
  if (v === "false") return false;
  return null;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const p = request.nextUrl.searchParams;
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc("admin_search_users", {
    p_plan:               nullOrString(p.get("plan")),
    p_subscription_status: nullOrString(p.get("subscription_status")),
    p_joined_from:        nullOrString(p.get("joined_from")),
    p_joined_to:          nullOrString(p.get("joined_to")),
    p_last_active_days:   nullOrInt(p.get("last_active_days")),
    p_country_code:       nullOrString(p.get("country_code")),
    p_city:               nullOrString(p.get("city")),
    p_role:               nullOrString(p.get("role")),
    p_industries:         nullOrArr(p.get("industries")),
    p_experience_levels:  nullOrArr(p.get("experience_levels")),
    p_years_exp_min:      nullOrNum(p.get("years_exp_min")),
    p_years_exp_max:      nullOrNum(p.get("years_exp_max")),
    p_employment_status:  nullOrString(p.get("employment_status")),
    p_primary_goal:       nullOrString(p.get("primary_goal")),
    p_skills:             nullOrArr(p.get("skills")),
    p_skills_match:       p.get("skills_match") ?? "any",
    p_certification:      nullOrString(p.get("certification")),
    p_degree:             nullOrString(p.get("degree")),
    p_field_of_study:     nullOrString(p.get("field_of_study")),
    p_institution:        nullOrString(p.get("institution")),
    p_ats_min:            nullOrInt(p.get("ats_min")),
    p_ats_max:            nullOrInt(p.get("ats_max")),
    p_has_downloads:      nullOrBool(p.get("has_downloads")),
    p_has_stories:        nullOrBool(p.get("has_stories")),
    p_has_job_clicks:     nullOrBool(p.get("has_job_clicks")),
    p_min_cvs:            nullOrInt(p.get("min_cvs")),
    p_has_linkedin:       nullOrBool(p.get("has_linkedin")),
    p_has_github:         nullOrBool(p.get("has_github")),
    p_has_portfolio:      nullOrBool(p.get("has_portfolio")),
    p_has_phone:          nullOrBool(p.get("has_phone")),
    p_search:             nullOrString(p.get("search")),
    p_sort_by:            p.get("sort_by")  ?? "joined_at",
    p_sort_dir:           p.get("sort_dir") ?? "desc",
    p_page:               nullOrInt(p.get("page")) ?? 1,
    p_page_size:          nullOrInt(p.get("page_size")) ?? 50,
  });

  if (error) {
    console.error("[admin/users/search]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const total = rows[0]?.total_count ?? 0;

  return NextResponse.json({ users: rows, total: Number(total) });
}
