import type { RoleMarket } from "@/lib/career-path/types";
import { countryName, formatOpenJobs, formatSalary } from "./format";
import { HUE_CLASSES } from "./palette";

/** "1,240 open jobs · $95K-$130K advertised", figures in navy, with where the numbers came from. Renders nothing without data. */
export function MarketLine({ market }: { market: RoleMarket | null }) {
  if (!market) return null;
  const salary = formatSalary(market);
  return (
    <p className="text-[15px]">
      <span className={`font-semibold tabular-nums ${HUE_CLASSES.navy.text}`}>
        {formatOpenJobs(market)}
      </span>
      {salary && (
        <>
          <span className="text-[#78716C]" aria-hidden="true">
            {" "}
            ·{" "}
          </span>
          <span className="sr-only">, </span>
          <span
            className={`font-semibold tabular-nums ${HUE_CLASSES.navy.text}`}
          >
            {salary}
          </span>
        </>
      )}
      <span className="mt-0.5 block text-xs text-[#5F5852]">
        From live job ads in {countryName(market.country)}
      </span>
    </p>
  );
}
