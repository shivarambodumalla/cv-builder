import { Briefcase } from "lucide-react";
import type { RoleMarket } from "@/lib/career-path/types";
import { countryName, formatOpenJobs, formatSalary } from "./format";

/** "1,240 open jobs · $95K-$130K advertised", with where the numbers came from. Renders nothing without data. */
export function MarketLine({ market }: { market: RoleMarket | null }) {
  if (!market) return null;
  const salary = formatSalary(market);
  return (
    <div className="flex items-start gap-2 text-sm">
      <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <p>
        <span className="font-medium">{formatOpenJobs(market)}</span>
        {salary && (
          <>
            <span className="text-muted-foreground" aria-hidden="true"> · </span>
            <span className="sr-only">, </span>
            <span className="font-medium">{salary}</span>
          </>
        )}
        <span className="block text-xs text-muted-foreground">
          From live listings in {countryName(market.country)}
        </span>
      </p>
    </div>
  );
}
