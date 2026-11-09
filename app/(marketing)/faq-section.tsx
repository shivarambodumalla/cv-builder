"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HomeFaq } from "./home-faqs";

/** The list comes from home-faqs.ts, which also feeds the page's FAQPage JSON-LD. */
export function FaqSection({ faqs }: { faqs: HomeFaq[] }) {
  const [openSet, setOpenSet] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }

  return (
    <div>
      {faqs.map((faq, i) => (
        <div key={i} className="border-b border-[#E0D8CC] dark:border-border">
          <button
            type="button"
            onClick={() => toggle(i)}
            className={cn(
              "flex w-full items-center justify-between py-5 text-left text-base font-medium transition-colors",
              openSet.has(i) ? "text-[#065F46]" : "text-[#0C1A0E] dark:text-foreground hover:text-[#065F46]"
            )}
          >
            {faq.q}
            <ChevronDown className={cn("h-4 w-4 shrink-0 text-[#065F46] transition-transform duration-200", openSet.has(i) && "rotate-180")} />
          </button>
          {openSet.has(i) && (
            <p className="pb-5 text-[15px] text-[#78716C] dark:text-muted-foreground leading-[1.8]">{faq.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}
