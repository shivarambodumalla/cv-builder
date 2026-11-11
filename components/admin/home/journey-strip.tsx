import Link from "next/link";
import { getJourney, type JourneyCounts } from "@/lib/admin/daily";
import { comparisonLabel, rangeQuery, type ResolvedRange } from "@/lib/admin/date-range";
import { int, pct } from "@/lib/admin/format";
import { LoadError } from "./block";

interface Step {
  key: keyof JourneyCounts;
  label: string;
  href: string;
  /** The line under the number: a conversion rate or extra context. */
  rate?: (c: JourneyCounts) => string;
}

export async function JourneyStrip({ range, compare }: { range: ResolvedRange; compare: ResolvedRange }) {
  const res = await getJourney(range, compare);
  if (!res.ok) return <LoadError what="the journey" error={res.error} />;
  const { current, previous } = res.data;
  const q = rangeQuery(range);
  const vs = comparisonLabel(range, "week").replace(/^vs /, "");

  const steps: Step[] = [
    { key: "visitors", label: "Visitors", href: `/admin/growth/traffic?${q}` },
    {
      key: "signups",
      label: "Signups",
      href: "/admin/users",
      rate: (c) => `${pct(c.signups, c.visitors)} · US ${int(c.usSignups)}`,
    },
    { key: "ranAts", label: "Ran ATS scan", href: `/admin/growth/funnel?${q}`, rate: (c) => `${pct(c.ranAts, c.signups)} of signups` },
    { key: "hitPaywall", label: "Hit paywall", href: `/admin/growth/paywall?${q}`, rate: (c) => `${pct(c.hitPaywall, c.ranAts)} of scanners` },
    { key: "clickedPay", label: "Clicked pay", href: `/admin/growth/paywall?${q}`, rate: (c) => `${pct(c.clickedPay, c.hitPaywall)} of hits` },
    { key: "paid", label: "Paid", href: `/admin/growth/revenue?${q}`, rate: (c) => `${pct(c.paid, c.clickedPay)} of clicks` },
  ];

  return (
    <ol className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3 lg:grid-cols-6">
      {steps.map((s, i) => (
        <li key={s.key} className="bg-card">
          <Link
            href={s.href}
            className="flex h-full min-h-[44px] flex-col gap-0.5 p-3 transition-colors hover:bg-muted/40 sm:p-4"
          >
            <span className="text-xs font-medium text-muted-foreground">
              {i > 0 && <span aria-hidden className="mr-1 text-muted-foreground/60">→</span>}
              {s.label}
            </span>
            <span className="text-xl font-bold tracking-tight tabular-nums sm:text-2xl">{int(current[s.key])}</span>
            {s.rate && <span className="text-xs tabular-nums text-foreground/80">{s.rate(current)}</span>}
            <span className="text-xs tabular-nums text-muted-foreground">
              {vs} {int(previous[s.key])}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
