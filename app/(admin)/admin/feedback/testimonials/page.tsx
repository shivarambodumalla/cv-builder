import { createAdminClient } from "@/lib/supabase/admin";
import { TestimonialsManager } from "./testimonials-manager";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const supabase = createAdminClient();

  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("*")
    .order("sort_order");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Testimonials</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage testimonials displayed on the homepage carousel. Changes take effect immediately.
        </p>
      </div>
      <TestimonialsManager initialData={testimonials ?? []} />
    </div>
  );
}
