import { getPaywall } from "@/lib/admin/daily";
import type { ResolvedRange } from "@/lib/admin/date-range";
import { LoadError } from "./block";
import { PaywallTable } from "./paywall-table";

export async function PaywallBlock({ range, detailed = false, limit }: { range: ResolvedRange; detailed?: boolean; limit?: number }) {
  const res = await getPaywall(range);
  if (!res.ok) return <LoadError what="the paywall" error={res.error} />;
  return <PaywallTable summary={res.data} detailed={detailed} limit={limit} />;
}
