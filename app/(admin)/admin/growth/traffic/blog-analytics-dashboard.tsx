"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminRange } from "@/components/admin/date-range-picker";
import { StatTile } from "@/components/admin/stat-tile";

interface TopPost  { path: string; slug: string; views: number }
interface DayPoint { date: string; views: number }
interface TopLink  { postSlug: string; linkUrl: string; linkText: string; clicks: number }

interface Data {
  totalViews: number;
  indexViews: number;
  postViews: number;
  topPosts: TopPost[];
  dailyTrend: DayPoint[];
  topLinks: TopLink[];
}

function fmt(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Blog views and link clicks for the page's ?range (the picker sits in the page header). */
export function BlogAnalyticsDashboard() {
  const { from, to } = useAdminRange();
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"posts" | "links">("posts");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch(`/api/admin/blog-analytics?from=${from}&to=${to}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: Data = await res.json();
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        console.error("[blog-analytics] load failed:", err);
        if (!cancelled) setError("Failed to load analytics");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  const maxViews = Math.max(...(data?.dailyTrend.map((d) => d.views) ?? [1]), 1);
  const maxPostViews = Math.max(...(data?.topPosts.map((p) => p.views) ?? [1]), 1);
  const maxClicks = Math.max(...(data?.topLinks.map((l) => l.clicks) ?? [1]), 1);

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {data && !loading && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile label="Total blog views" value={fmt(data.totalViews)} />
            <StatTile label="Post views" value={fmt(data.postViews)} note="Individual articles" />
            <StatTile label="Blog index views" value={fmt(data.indexViews)} note="/blog listing page" />
            <StatTile label="Link clicks" value={fmt(data.topLinks.reduce((s, l) => s + l.clicks, 0))} note="Across all posts" />
          </div>

          {/* Daily trend */}
          {data.dailyTrend.length > 0 && (
            <div className="rounded-xl border bg-card p-5">
              <h3 className="text-sm font-semibold mb-4">Daily views</h3>
              <div className="flex items-end gap-1 h-28">
                {data.dailyTrend.map((d) => (
                  <div key={d.date} className="group relative flex-1 flex flex-col items-center justify-end h-full">
                    <div
                      className="w-full rounded-t bg-primary/70 hover:bg-primary transition-colors min-h-[2px]"
                      style={{ height: `${Math.max(2, (d.views / maxViews) * 100)}%` }}
                    />
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-popover border rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap z-10 shadow-sm">
                      {fmtDate(d.date)}: {d.views}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                <span>{fmtDate(data.dailyTrend[0]?.date ?? "")}</span>
                <span>{fmtDate(data.dailyTrend[data.dailyTrend.length - 1]?.date ?? "")}</span>
              </div>
            </div>
          )}

          {/* Tab: Posts / Links */}
          <div>
            <div className="flex gap-1 rounded-lg bg-muted p-0.5 w-fit mb-4">
              {(["posts", "links"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={cn(
                    "min-h-[44px] rounded-md px-3 py-1.5 text-xs capitalize transition-colors sm:min-h-0",
                    activeTab === t ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t === "posts" ? "Top posts" : "Top link clicks"}
                </button>
              ))}
            </div>

            {/* Top posts */}
            {activeTab === "posts" && (
              <div className="rounded-xl border bg-card overflow-x-auto">
                {data.topPosts.length === 0 ? (
                  <p className="p-6 text-sm text-muted-foreground">No post views recorded yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Post</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-24">Views</th>
                        <th className="px-4 py-2.5 w-32" />
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.topPosts.map((post) => (
                        <tr key={post.path} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <a
                              href={`https://www.thecvedge.com${post.path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="min-h-[44px] text-sm hover:text-primary transition-colors flex items-center gap-1 group sm:min-h-0"
                            >
                              <span className="line-clamp-1">{post.slug.replace(/-/g, " ")}</span>
                              <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          </td>
                          <td className="px-4 py-3 text-right font-medium tabular-nums">{post.views.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary/60"
                                style={{ width: `${(post.views / maxPostViews) * 100}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Top link clicks */}
            {activeTab === "links" && (
              <div className="rounded-xl border bg-card overflow-x-auto">
                {data.topLinks.length === 0 ? (
                  <p className="p-6 text-sm text-muted-foreground">No link clicks recorded yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Link</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Post</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-20">Clicks</th>
                        <th className="px-4 py-2.5 w-28" />
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.topLinks.map((link, i) => (
                        <tr key={i} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <a
                                href={link.linkUrl.startsWith("/") ? `https://www.thecvedge.com${link.linkUrl}` : link.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1 group"
                              >
                                <span className="line-clamp-1">{link.linkUrl}</span>
                                <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100" />
                              </a>
                              {link.linkText && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">&ldquo;{link.linkText}&rdquo;</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            <span className="line-clamp-1">{link.postSlug.replace(/-/g, " ")}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium tabular-nums">{link.clicks}</td>
                          <td className="px-4 py-3">
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-success/60"
                                style={{ width: `${(link.clicks / maxClicks) * 100}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
