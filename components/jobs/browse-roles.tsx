import Link from "next/link";
import { ROLE_CATEGORIES, TRENDING_ROLES } from "@/lib/jobs/role-categories";

export function BrowseRoles({ currentSlug }: { currentSlug?: string }) {
  return (
    <>
      {/* Trending roles — top 20 as highlighted chips */}
      <section className="mt-12">
        <h2 className="text-base font-semibold mb-1">Trending job roles</h2>
        <p className="text-xs text-muted-foreground mb-4">Most searched roles this week</p>
        <div className="flex flex-wrap gap-2">
          {TRENDING_ROLES.map((role) => (
            <Link
              key={role.slug}
              href={`/jobs/${role.slug}`}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                role.slug === currentSlug
                  ? "bg-[#065F46] text-white border border-[#065F46]"
                  : "bg-[#065F46]/10 text-[#065F46] border border-[#065F46]/20 hover:bg-[#065F46] hover:text-white hover:border-[#065F46] dark:text-primary dark:border-primary/20 dark:hover:bg-primary dark:hover:text-primary-foreground"
              }`}
            >
              {role.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Full directory — plain paragraph style like Flipkart brand directory */}
      <section className="mt-12">
        <h2 className="text-base font-semibold mb-4">Browse all jobs by category</h2>
        <div className="space-y-3">
          {ROLE_CATEGORIES.map((cat) => (
            <p key={cat.name} className="text-xs leading-relaxed">
              <span className="font-semibold text-foreground uppercase tracking-wide">{cat.name}</span>
              <span className="mx-1.5 text-muted-foreground">:</span>
              {cat.roles.map((role, i) => (
                <span key={role.slug}>
                  <Link
                    href={`/jobs/${role.slug}`}
                    className={`transition-colors ${
                      role.slug === currentSlug
                        ? "font-semibold text-[#065F46] dark:text-primary"
                        : "text-muted-foreground hover:text-foreground hover:underline"
                    }`}
                  >
                    {role.label}
                  </Link>
                  {i < cat.roles.length - 1 && (
                    <span className="mx-1 text-border">|</span>
                  )}
                </span>
              ))}
            </p>
          ))}
        </div>
      </section>
    </>
  );
}
