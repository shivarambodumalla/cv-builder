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
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage testimonials displayed on the homepage carousel. Changes take effect immediately.
        </p>
      </div>
      <TestimonialsManager initialData={testimonials ?? []} />
    </div>
  );
}
