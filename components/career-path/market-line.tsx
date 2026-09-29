import type { RoleMarket } from "@/lib/career-path/types";
import { countryName, formatOpenJobs, formatSalary } from "./format";

/** "1,240 open jobs · $95K-$130K advertised", with where the numbers came from. Renders nothing without data. */
export function MarketLine({ market }: { market: RoleMarket | null }) {
  if (!market) return null;
  const salary = formatSalary(market);
  return (
    <p className="text-sm">
      <span className="font-mono font-medium tabular-nums">{formatOpenJobs(market)}</span>
      {salary && (
        <>
          <span className="text-muted-foreground" aria-hidden="true"> · </span>
          <span className="sr-only">, </span>
          <span className="font-mono font-medium tabular-nums">{salary}</span>
        </>
      )}
      <span className="mt-0.5 block text-xs text-muted-foreground">
        From live job ads in {countryName(market.country)}
      </span>
    </p>
  );
}
