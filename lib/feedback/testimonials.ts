import { createAdminClient } from "@/lib/supabase/admin";

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  gradient: string;
  avatar_bg: string;
}

/**
 * Testimonials an admin has published (from a consented feedback comment or
 * entered by hand). Marketing pages show only these, never placeholder
 * quotes: invented testimonials are deceptive advertising (FTC 16 CFR 465 in
 * the US) and Google treats them as spam. An empty list hides the section.
 */
export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  try {
    const { data, error } = await createAdminClient()
      .from("testimonials")
      .select("id, quote, name, role, company, gradient, avatar_bg")
      .eq("enabled", true)
      .order("sort_order");
    if (error) {
      console.error("[testimonials] load failed:", error.message);
      return [];
    }
    return (data ?? []) as Testimonial[];
  } catch (err) {
    console.error("[testimonials] load failed:", err);
    return [];
  }
}
