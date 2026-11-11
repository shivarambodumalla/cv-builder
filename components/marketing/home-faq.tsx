"use client";

import { useState } from "react";
import { Mail, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/marketing/section-header";
import { FAQ_TOPICS, type FaqTopic, type HomeFaq } from "@/app/(marketing)/home-faqs";

/**
 * Homepage FAQ grouped by topic. Every answer stays in the HTML (other topics
 * are `hidden`, closed answers sit inside <details>), so the visible text
 * matches the FAQPage JSON-LD built from the same list.
 */
export function HomeFaqSection({ faqs }: { faqs: HomeFaq[] }) {
  const [topic, setTopic] = useState<FaqTopic>(FAQ_TOPICS[0].id);
  const groups = FAQ_TOPICS.map((t) => ({ ...t, items: faqs.filter((f) => f.topic === t.id) })).filter((g) => g.items.length > 0);

  // ARIA tabs keyboard pattern; the list is a row on phones and a column on desktop, so both arrow axes work.
  function onTopicKey(e: React.KeyboardEvent) {
    const i = groups.findIndex((g) => g.id === topic);
    const fwd = e.key === "ArrowRight" || e.key === "ArrowDown";
    const back = e.key === "ArrowLeft" || e.key === "ArrowUp";
    const next = fwd ? (i + 1) % groups.length : back ? (i - 1 + groups.length) % groups.length : e.key === "Home" ? 0 : e.key === "End" ? groups.length - 1 : -1;
    if (next < 0) return;
    e.preventDefault();
    setTopic(groups[next].id);
    document.getElementById(`faq-tab-${groups[next].id}`)?.focus();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-14 lg:items-start">
      <div className="flex flex-col gap-4 min-w-0">
        <SectionHeader eyebrow="FAQ" title="Common questions" sub="Quick answers on pricing, scoring and your data." className="mb-2 md:mb-4" />

        {/* Topics: a sideways row of chips on phones, a vertical list on desktop */}
        <div
          role="tablist"
          aria-label="FAQ topics"
          onKeyDown={onTopicKey}
          className="-mx-4 px-4 lg:mx-0 lg:px-0 flex lg:flex-col gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {groups.map((g) => {
            const selected = g.id === topic;
            return (
              <button
                key={g.id}
                type="button"
                role="tab"
                id={`faq-tab-${g.id}`}
                aria-selected={selected}
                aria-controls={`faq-panel-${g.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setTopic(g.id)}
                className={cn(
                  "flex min-h-11 shrink-0 items-center justify-between gap-3 rounded-full lg:rounded-xl border px-4 text-sm lg:text-[15px] transition-colors",
                  selected
                    ? "border-primary bg-primary/10 font-semibold text-[#145f55]"
                    : "border-border bg-card font-medium text-foreground hover:border-primary/40"
                )}
              >
                {g.label}
                <span
                  className={cn(
                    "inline-flex h-5 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-bold",
                    selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  {g.items.length}
                </span>
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex flex-col gap-2 rounded-2xl bg-[#1E3A5F] p-6 text-white mt-2">
          <p className="font-semibold">Still have a question?</p>
          <p className="text-sm text-white/80">Email us and a person will reply.</p>
          <a href="mailto:hello@thecvedge.com" className="mt-2 inline-flex min-h-11 w-fit items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-[#1E3A5F] hover:bg-white/90">
            <Mail className="h-4 w-4" aria-hidden />
            hello@thecvedge.com
          </a>
        </div>
      </div>

      <div className="min-w-0">
        {groups.map((g) => (
          <div key={g.id} role="tabpanel" id={`faq-panel-${g.id}`} aria-labelledby={`faq-tab-${g.id}`} hidden={g.id !== topic} className={cn("flex-col gap-3", g.id === topic ? "flex" : "hidden")}>
            {g.items.map((f, i) => (
              <details key={f.q} open={i === 0} className="group rounded-2xl border border-border bg-card shadow-[0_1px_4px_rgba(35,48,42,0.04)]">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 sm:px-5 text-[15px] sm:text-base font-semibold [&::-webkit-details-marker]:hidden">
                  <span>{f.q}</span>
                  <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Plus className="h-4 w-4 group-open:hidden" />
                    <Minus className="hidden h-4 w-4 group-open:block" />
                  </span>
                </summary>
                <p className="px-4 pb-4 sm:px-5 sm:pb-5 text-[15px] leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        ))}

        <div className="lg:hidden mt-4 flex flex-col gap-2 rounded-2xl bg-[#1E3A5F] p-5 text-white">
          <p className="font-semibold">Still have a question?</p>
          <p className="text-sm text-white/80">Email us and a person will reply.</p>
          <a href="mailto:hello@thecvedge.com" className="mt-2 inline-flex min-h-11 w-fit items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-[#1E3A5F]">
            <Mail className="h-4 w-4" aria-hidden />
            hello@thecvedge.com
          </a>
        </div>
      </div>
    </div>
  );
}
