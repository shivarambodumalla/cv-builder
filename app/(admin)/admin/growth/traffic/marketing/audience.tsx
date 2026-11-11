import { cn } from "@/lib/utils";
import { classifyIntent, INTENT_STYLES, type Intent } from "./intent";
import type { GeoRow, QueryRow } from "./types";

function inferAgeDistribution(queries: QueryRow[]): { range: string; pct: number; label: string }[] {
  const weights: Record<string, number> = { "18–24": 0, "25–34": 0, "35–44": 0, "45+": 0 };
  for (const { query, clicks } of queries) {
    const q = query.toLowerCase();
    if (/intern|fresher|entry.?level|graduate|student|first.?job|no.?experience/.test(q))
      weights["18–24"] += clicks * 2;
    if (/junior|associate|career.?change|1.?year|2.?year|3.?year/.test(q))
      weights["25–34"] += clicks * 1.5;
    if (/senior|manager|lead|5.?year|7.?year|mid.?level/.test(q)) weights["35–44"] += clicks;
    if (/director|vp|executive|head.?of|10.?year/.test(q)) weights["45+"] += clicks;
    weights["25–34"] += clicks * 0.3;
  }
  const total = Object.values(weights).reduce((s, v) => s + v, 0) || 1;
  const defaults: Record<string, number> = { "18–24": 22, "25–34": 45, "35–44": 24, "45+": 9 };
  const labels: Record<string, string> = {
    "18–24": "Students / Grads",
    "25–34": "Early Career",
    "35–44": "Mid-Senior",
    "45+": "Senior+",
  };
  return Object.entries(weights).map(([range, w]) => {
    const inferred = Math.round((w / total) * 100);
    const pct = Math.max(5, Math.round(inferred * 0.4 + defaults[range] * 0.6));
    return { range, pct, label: labels[range] };
  });
}

function inferInterests(queries: QueryRow[]): { term: string; weight: number }[] {
  const stop = new Set([
    "how", "to", "a", "an", "the", "for", "and", "or", "is", "in", "on", "at", "of",
    "with", "my", "your", "cv", "resume", "free", "best", "good", "make", "write",
    "what", "are", "get", "use", "from", "that", "this", "can", "does",
  ]);
  const freq: Record<string, number> = {};
  for (const { query, clicks } of queries) {
    for (const word of query.toLowerCase().split(/\s+/)) {
      if (word.length > 3 && !stop.has(word)) freq[word] = (freq[word] ?? 0) + clicks;
    }
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([term, weight]) => ({ term, weight }));
}

function inferSegments(queries: QueryRow[]): { name: string; pct: number; desc: string; color: string }[] {
  const text = queries.map((q) => q.query.toLowerCase()).join(" ");
  const candidates = [
    { name: "Active Job Seekers", signal: /apply|job board|hiring|opening|vacancy/.test(text), pct: 38, desc: "Actively applying to roles", color: "bg-blue-500" },
    { name: "Career Changers", signal: /career.?change|switch|transition|pivot|different.?field/.test(text), pct: 18, desc: "Looking to pivot industries", color: "bg-violet-500" },
    { name: "Students / Grads", signal: /intern|fresher|graduate|student|entry.?level|no.?experience/.test(text), pct: 22, desc: "Early career or recent grads", color: "bg-amber-500" },
    { name: "Experienced Pros", signal: /senior|manager|lead|director|years?.experience|promotion/.test(text), pct: 15, desc: "Mid to senior stage", color: "bg-emerald-500" },
    { name: "Interview Preppers", signal: /interview|behavioral|star.?method|prepare|question/.test(text), pct: 7, desc: "Focused on interview readiness", color: "bg-teal-500" },
  ];
  const matched = candidates.filter((c) => c.signal);
  if (matched.length === 0) return candidates.slice(0, 3);
  const totalPct = matched.reduce((s, c) => s + c.pct, 0);
  return matched.map((c) => ({ ...c, pct: Math.round((c.pct / totalPct) * 100) }));
}

function inferPersonas(queries: QueryRow[]): { intent: Intent; pct: number; example: string }[] {
  const counts: Record<string, number> = {};
  for (const r of queries) {
    const i = classifyIntent(r.query);
    counts[i] = (counts[i] ?? 0) + r.clicks;
  }
  const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([intent, clicks]) => ({
      intent: intent as Intent,
      pct: Math.round((clicks / total) * 100),
      example: queries.find((q) => classifyIntent(q.query) === intent)?.query ?? "",
    }));
}

function WordCloud({ items }: { items: { term: string; weight: number }[] }) {
  const maxW = Math.max(...items.map((i) => i.weight), 1);
  return (
    <div className="flex flex-wrap gap-1.5 py-1">
      {items.map(({ term, weight }) => {
        const ratio = weight / maxW;
        const cls =
          ratio > 0.7 ? "text-sm font-semibold" : ratio > 0.4 ? "text-xs font-medium" : "text-[11px]";
        return (
          <span
            key={term}
            className={cn("px-1.5 py-0.5 rounded bg-primary/10 text-primary", cls)}
            style={{ opacity: 0.5 + ratio * 0.5 }}
          >
            {term}
          </span>
        );
      })}
    </div>
  );
}

export function AudienceProfileCard({ queries }: { queries: QueryRow[] }) {
  const ages = inferAgeDistribution(queries);
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Audience Profile</h3>
        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">Inferred</span>
      </div>

      <div className="space-y-1.5">
        <p className="text-[11px] font-medium text-muted-foreground">Age</p>
        <div className="space-y-2">
          {ages.map(({ range, pct, label }) => (
            <div key={range}>
              <div className="flex items-center justify-between text-[11px] mb-0.5">
                <span className="text-muted-foreground">
                  {range} <span className="text-foreground font-medium">· {label}</span>
                </span>
                <span className="font-semibold tabular-nums">{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary opacity-70" style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-[11px] font-medium text-muted-foreground">Gender</p>
        <div className="flex rounded-md overflow-hidden h-2">
          <div className="h-full bg-pink-400 opacity-80" style={{ width: "58%" }} />
          <div className="h-full bg-blue-400 opacity-80" style={{ width: "42%" }} />
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          {[{ label: "Female", pct: 58, color: "bg-pink-400" }, { label: "Male", pct: 42, color: "bg-blue-400" }].map(
            ({ label, pct, color }) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className={cn("w-2 h-2 rounded-full opacity-80", color)} />
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold">{pct}%</span>
              </span>
            )
          )}
        </div>
        <p className="text-[10px] text-muted-foreground italic">Industry benchmark for career/resume tools</p>
      </div>
    </div>
  );
}

export function AudienceSegmentsCard({ queries }: { queries: QueryRow[] }) {
  const segments = inferSegments(queries);
  const personas = inferPersonas(queries);
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold">Segments & Intent</h3>

      <div className="space-y-1.5">
        <p className="text-[11px] font-medium text-muted-foreground">User Segments</p>
        <div className="space-y-2">
          {segments.map((s) => (
            <div key={s.name}>
              <div className="flex items-center gap-2 text-[11px] mb-0.5">
                <span className={cn("w-2 h-2 rounded-full shrink-0", s.color)} />
                <span className="font-medium flex-1 truncate">{s.name}</span>
                <span className="tabular-nums text-muted-foreground shrink-0">{s.pct}%</span>
              </div>
              <div className="h-1 rounded-full bg-muted overflow-hidden ml-3.5">
                <div className={cn("h-full rounded-full opacity-70", s.color)} style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-[11px] font-medium text-muted-foreground">Search Intent</p>
        <div className="space-y-1.5">
          {personas.slice(0, 5).map(({ intent, pct }) => (
            <div key={intent} className="flex items-center gap-2">
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded font-medium capitalize shrink-0 w-[88px] text-center",
                  INTENT_STYLES[intent]
                )}
              >
                {intent}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary opacity-60" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[11px] tabular-nums text-muted-foreground w-7 text-right shrink-0">{pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function InterestSignalsCard({ queries, geo }: { queries: QueryRow[]; geo: GeoRow[] }) {
  const interests = inferInterests(queries);
  const locationItems = geo.slice(0, 24).map((g) => ({ term: g.country, weight: g.sessions }));
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold mb-4">Interest & Location Signals</h3>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground">
            Interests <span className="font-normal">· from search queries</span>
          </p>
          {interests.length > 0 ? <WordCloud items={interests} /> : (
            <p className="text-[11px] text-muted-foreground">No query data.</p>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground">
            Location <span className="font-normal">· by session volume</span>
          </p>
          {locationItems.length > 0 ? <WordCloud items={locationItems} /> : (
            <p className="text-[11px] text-muted-foreground">No geographic data.</p>
          )}
        </div>
      </div>
    </div>
  );
}
