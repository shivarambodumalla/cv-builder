import Link from "next/link";
import { cn } from "@/lib/utils";
import { article, hasCareerPathPage, roleLabel } from "@/lib/roles/career-moves/pages";

/** One-line link from another role page to /career-path/<slug>. Renders nothing when that page doesn't exist. */
export function CareerPathCrossLink({ slug, className }: { slug: string; className?: string }) {
  const label = roleLabel(slug);
  if (!label || !hasCareerPathPage(slug)) return null;

  const a = article(label);
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      Where can {a} {label} go next?{" "}
      <Link
        href={`/career-path/${slug}`}
        className="font-medium text-primary underline underline-offset-4 hover:text-foreground"
      >
        See the {label} career path
      </Link>
    </p>
  );
}
