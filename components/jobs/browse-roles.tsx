import Link from "next/link";
import { ROLE_CATEGORIES } from "@/lib/jobs/role-categories";

export function BrowseRoles({ currentSlug }: { currentSlug?: string }) {
  return (
    <section className="mt-12">
      <h2 className="text-base font-semibold mb-5">Browse jobs by role</h2>
      <div className="space-y-4">
        {ROLE_CATEGORIES.map((cat) => (
          <div key={cat.name}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{cat.name}</h3>
            <div className="flex flex-wrap gap-1.5">
              {cat.roles.map((role) => (
                <Link
                  key={role.slug}
                  href={`/jobs/${role.slug}`}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    role.slug === currentSlug
                      ? "bg-[#065F46] text-white border-[#065F46]"
                      : "bg-card text-foreground hover:bg-primary/5 hover:border-primary/30"
                  }`}
                >
                  {role.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
