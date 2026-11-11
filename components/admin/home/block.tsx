import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Small uppercase label above a Home block, with an optional link on the right. */
export function BlockHeading({
  title,
  note,
  href,
  linkLabel,
}: {
  title: string;
  note?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
        {note && <span className="ml-2 font-normal normal-case tracking-normal">{note}</span>}
      </h2>
      {href && (
        <Link
          href={href}
          className="flex min-h-[44px] items-center text-xs font-medium text-primary hover:underline sm:min-h-0"
        >
          {linkLabel ?? "Details"}
        </Link>
      )}
    </div>
  );
}

/** A block whose query failed: says so instead of showing zeros. */
export function LoadError({ what, error }: { what: string; error: string }) {
  return (
    <div role="alert" className="rounded-lg border border-error/40 bg-error/5 p-4 text-sm">
      <p className="font-medium text-error">Couldn&apos;t load {what}</p>
      <p className="mt-1 break-words text-xs text-muted-foreground">{error}</p>
    </div>
  );
}

/** Placeholder tiles while a block's queries run. */
export function TilesSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 lg:grid-cols-4", className)} aria-busy>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-[92px] rounded-lg" />
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2 rounded-lg border bg-card p-3" aria-busy>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-9" />
      ))}
    </div>
  );
}
