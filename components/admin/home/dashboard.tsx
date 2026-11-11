import Link from "next/link";
import { cn } from "@/lib/utils";
import { StatTile, changeNote } from "@/components/admin/stat-tile";
import { TimeSeriesChart, FunnelChart, BarList, StackedShare } from "@/components/admin/charts";
import { LoadError } from "@/components/admin/home/block";
import { resolveCountry } from "@/components/admin/users/country-data";
import { channelLabel } from "@/lib/analytics/channel";
import type { Loaded } from "@/lib/admin/query";
import type {
  Breakdown,
  DashboardOverview,
  FunnelStep,
  TopPage,
  TopUser,
  TopUsersOrder,
} from "@/lib/admin/dashboard";

// ── Frame ─────────────────────────────────────────────────────────────────────

export function DashCard({
  title,
  note,
  href,
  linkLabel = "Details",
  className,
  children,
}: {
  title: string;
  note?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("flex min-w-0 flex-col rounded-xl border bg-card p-4 sm:p-5", className)}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{title}</h2>
          {note && <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>}
        </div>
        {href && (
          <Link
            href={href}
            className="flex min-h-[44px] shrink-0 items-center text-xs font-medium text-primary hover:underline sm:min-h-0"
          >
            {linkLabel}
          </Link>
        )}
      </header>
      <div className="min-w-0 flex-1">{children}</div>
    </section>
  );
}

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n < 100 ? 2 : 0 });
const count = (n: number) => n.toLocaleString("en-US");

const BUCKET_WORD = { day: "daily", week: "weekly", month: "monthly" } as const;

// ── KPIs ──────────────────────────────────────────────────────────────────────

export async function KpiGrid({ data, compareLabel }: { data: Promise<Loaded<DashboardOverview>>; compareLabel: string }) {
  const res = await data;
  if (!res.ok) return <LoadError what="headline numbers" error={res.error} />;
  const k = res.data.kpis;
  const tiles = [
    { label: "Page views", kpi: k.pageViews, fmt: count, href: "/admin/growth/traffic" },
    { label: "Unique visitors", kpi: k.visitors, fmt: count, href: "/admin/growth/traffic" },
    { label: "Signups", kpi: k.signups, fmt: count, href: "/admin/users" },
    { label: "New Pro", kpi: k.newPro, fmt: count, href: "/admin/growth/revenue" },
    { label: "Revenue", kpi: k.revenue, fmt: usd, href: "/admin/growth/revenue" },
    { label: "AI spend", kpi: k.aiCost, fmt: usd, href: "/admin/ai/usage", costUp: true },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {tiles.map((t) => {
        const change = changeNote(t.kpi.value, t.kpi.previous, compareLabel);
        // Spend going up is not good news.
        const tone = t.costUp && change.tone === "success" ? "warning" : t.costUp && change.tone === "warning" ? "success" : change.tone;
        return (
          <StatTile
            key={t.label}
            label={t.label}
            value={t.fmt(t.kpi.value)}
            note={change.note}
            tone={tone}
            spark={t.kpi.spark}
            href={t.href}
          />
        );
      })}
    </div>
  );
}

// ── Time series ───────────────────────────────────────────────────────────────

export async function TrafficCard({ data }: { data: Promise<Loaded<DashboardOverview>> }) {
  const res = await data;
  if (!res.ok) return <LoadError what="traffic" error={res.error} />;
  const d = res.data;
  return (
    <DashCard
      title="Traffic"
      note={`Page views and unique visitors, ${BUCKET_WORD[d.bucket]}${d.bucket === "day" ? "" : " (visitors summed by day)"}`}
      href="/admin/growth/traffic"
    >
      <TimeSeriesChart
        buckets={d.buckets}
        height={240}
        series={[
          { name: "Page views", values: d.series.pageViews, tone: "secondary", kind: "area" },
          { name: "Unique visitors", values: d.series.visitors, tone: "primary", kind: "line" },
        ]}
      />
    </DashCard>
  );
}

export async function SignupsCard({ data }: { data: Promise<Loaded<DashboardOverview>> }) {
  const res = await data;
  if (!res.ok) return <LoadError what="signups" error={res.error} />;
  const d = res.data;
  return (
    <DashCard title="Signups and upgrades" note={`New accounts and first Pro payments, ${BUCKET_WORD[d.bucket]}`} href="/admin/users">
      <TimeSeriesChart
        buckets={d.buckets}
        series={[
          { name: "Signups", values: d.series.signups, tone: "primary", kind: "bar" },
          { name: "New Pro", values: d.series.newPro, tone: "accent", kind: "line" },
        ]}
      />
    </DashCard>
  );
}

export async function PaywallCard({ data }: { data: Promise<Loaded<DashboardOverview>> }) {
  const res = await data;
  if (!res.ok) return <LoadError what="paywall" error={res.error} />;
  const d = res.data;
  return (
    <DashCard title="Paywall" note={`People blocked by a free limit, clicking pay, and paying, ${BUCKET_WORD[d.bucket]}`} href="/admin/growth/paywall">
      <TimeSeriesChart
        buckets={d.buckets}
        series={[
          { name: "Blocked by a limit", values: d.series.paywallBlocked, tone: "accent", kind: "bar" },
          { name: "Clicked pay", values: d.series.clickedPay, tone: "secondary", kind: "line" },
          { name: "Paid", values: d.series.newPro, tone: "primary", kind: "line" },
        ]}
      />
    </DashCard>
  );
}

export async function RevenueCard({ data }: { data: Promise<Loaded<DashboardOverview>> }) {
  const res = await data;
  if (!res.ok) return <LoadError what="revenue" error={res.error} />;
  const d = res.data;
  return (
    <DashCard title="Revenue" note={`First payments and renewals, USD before tax, ${BUCKET_WORD[d.bucket]}`} href="/admin/growth/revenue">
      <TimeSeriesChart
        buckets={d.buckets}
        format="usd"
        series={[
          { name: "First payments", values: d.series.newRevenue, tone: "primary", kind: "bar" },
          { name: "Renewals", values: d.series.renewalRevenue, tone: "secondary", kind: "bar" },
        ]}
      />
    </DashCard>
  );
}

export async function AiCostCard({ data }: { data: Promise<Loaded<DashboardOverview>> }) {
  const res = await data;
  if (!res.ok) return <LoadError what="AI spend" error={res.error} />;
  const d = res.data;
  return (
    <DashCard title="AI spend" note={`Gemini cost in USD, ${BUCKET_WORD[d.bucket]}`} href="/admin/ai/usage">
      <TimeSeriesChart
        buckets={d.buckets}
        format="usd"
        series={[{ name: "AI spend", values: d.series.aiCost, tone: "accent", kind: "area" }]}
      />
    </DashCard>
  );
}

// ── Funnel ────────────────────────────────────────────────────────────────────

export async function FunnelCard({ data }: { data: Promise<Loaded<FunnelStep[]>> }) {
  const res = await data;
  if (!res.ok) return <LoadError what="the funnel" error={res.error} />;
  return (
    <DashCard title="Funnel" note="Distinct people at each step in this range" href="/admin/growth/funnel">
      <FunnelChart steps={res.data.map((s) => ({ label: s.label, value: s.value, href: s.href, hint: s.hint }))} />
    </DashCard>
  );
}

// ── Lists ─────────────────────────────────────────────────────────────────────

export async function TopPagesCard({ data }: { data: Promise<Loaded<TopPage[]>> }) {
  const res = await data;
  if (!res.ok) return <LoadError what="top pages" error={res.error} />;
  return (
    <DashCard title="Most visited pages" note="Page views on marketing pages" href="/admin/growth/traffic">
      <BarList
        items={res.data.map((p) => ({
          label: p.path,
          value: p.pageViews,
          secondary: `${count(p.visitors)} visitors`,
          href: p.path,
        }))}
        emptyText="No page views in this range"
      />
    </DashCard>
  );
}

function duration(ms: number): string {
  const mins = Math.round(ms / 60_000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

const TOP_ORDERS: { key: TopUsersOrder; label: string }[] = [
  { key: "actions", label: "Most active" },
  { key: "time", label: "Most time" },
  { key: "ai_cost", label: "Most AI cost" },
];

export async function TopUsersCard({
  data,
  order,
  hrefFor,
}: {
  data: Promise<Loaded<TopUser[]>>;
  order: TopUsersOrder;
  /** Link for a sort option, keeping the current range. */
  hrefFor: (order: TopUsersOrder) => string;
}) {
  const res = await data;
  return (
    <DashCard title="Top users" note="Actions tracked, time on pages, and AI cost in this range">
      <div role="tablist" aria-label="Rank users by" className="mb-3 flex gap-1 overflow-x-auto">
        {TOP_ORDERS.map((o) => (
          <Link
            key={o.key}
            role="tab"
            aria-selected={o.key === order}
            href={hrefFor(o.key)}
            scroll={false}
            className={cn(
              "flex min-h-[44px] items-center whitespace-nowrap rounded-md px-2.5 text-xs font-medium sm:min-h-[30px]",
              o.key === order ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
            )}
          >
            {o.label}
          </Link>
        ))}
      </div>
      {!res.ok ? (
        <LoadError what="top users" error={res.error} />
      ) : res.data.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No signed-in activity in this range</p>
      ) : (
        <ol className="divide-y">
          {res.data.map((u, i) => {
            const country = resolveCountry(u.countryCode, null);
            return (
              <li key={u.userId}>
                <Link
                  href={`/admin/users/${u.userNumber}`}
                  className="flex min-h-[44px] items-center gap-3 py-2 text-sm hover:bg-muted/40"
                >
                  <span className="w-4 shrink-0 text-xs tabular-nums text-muted-foreground">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{u.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[u.plan === "pro" ? "Pro" : "Free", country?.name].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-xs tabular-nums">
                    <span className={cn("block", order === "actions" && "font-semibold")}>{count(u.actions)} actions</span>
                    <span className={cn("block text-muted-foreground", order === "time" && "font-semibold text-foreground")}>
                      {duration(u.timeMs)}
                      {" · "}
                      <span className={cn(order === "ai_cost" && "font-semibold text-foreground")}>{usd(u.aiCost)} AI</span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </DashCard>
  );
}

function flag(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

export async function CountriesCard({ data }: { data: Promise<Loaded<Breakdown>> }) {
  const res = await data;
  if (!res.ok) return <LoadError what="countries" error={res.error} />;
  const rows = res.data.country;
  const known = rows.filter((r) => r.bucket !== "unknown");
  const unknown = rows.find((r) => r.bucket === "unknown")?.users ?? 0;
  return (
    <DashCard
      title="Signups by country"
      note={unknown > 0 ? `${count(unknown)} without a detected country` : "Where new accounts signed up from"}
      href="/admin/users"
    >
      <BarList
        items={known.slice(0, 8).map((r) => {
          const c = resolveCountry(r.bucket, null);
          return { label: `${flag(r.bucket)} ${c?.name ?? r.bucket}`.trim(), value: r.users };
        })}
        emptyText="No signups in this range"
      />
    </DashCard>
  );
}

const AGE_ORDER = ["18–24", "25–34", "35–44", "45+", "unknown"];
const EXPERIENCE_ORDER = ["0–2 yrs", "2–5 yrs", "5–10 yrs", "10+ yrs", "unknown"];

function ordered(rows: { bucket: string; users: number }[], order: string[]) {
  return [...rows].sort((a, b) => order.indexOf(a.bucket) - order.indexOf(b.bucket));
}

const unknownLabel = (b: string) => (b === "unknown" ? "Not known" : b);

export async function AudienceCard({ data }: { data: Promise<Loaded<Breakdown>> }) {
  const res = await data;
  if (!res.ok) return <LoadError what="audience" error={res.error} />;
  const b = res.data;
  return (
    <DashCard title="Who signs up" note="New accounts in this range. Age is estimated from CV dates.">
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Estimated age</p>
          <StackedShare ordinal items={ordered(b.age, AGE_ORDER).map((r) => ({ label: unknownLabel(r.bucket), value: r.users, tone: r.bucket === "unknown" ? "muted" : undefined }))} />
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Years of experience</p>
          <StackedShare ordinal items={ordered(b.experience, EXPERIENCE_ORDER).map((r) => ({ label: unknownLabel(r.bucket), value: r.users, tone: r.bucket === "unknown" ? "muted" : undefined }))} />
        </div>
      </div>
    </DashCard>
  );
}

export async function SourcesCard({ data }: { data: Promise<Loaded<Breakdown>> }) {
  const res = await data;
  if (!res.ok) return <LoadError what="signup sources" error={res.error} />;
  const b = res.data;
  return (
    <DashCard title="Where signups come from" note="Source tracking started Nov 2026; older signups show as Unknown" href="/admin/growth/traffic">
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Channel</p>
          <StackedShare items={b.channel.map((r) => ({ label: channelLabel(r.bucket), value: r.users, tone: r.bucket === "unknown" ? "muted" : undefined }))} />
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Plan today</p>
          <StackedShare items={b.plan.map((r) => ({ label: r.bucket === "pro" ? "Pro" : "Free", value: r.users, tone: r.bucket === "pro" ? "success" : "muted" }))} />
        </div>
      </div>
    </DashCard>
  );
}
