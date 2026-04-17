"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Will recruiters know I used AI?",
    a: "No. CVEdge suggests improvements based on your actual experience. You review and approve every change. Your CV stays yours — AI just helps you express it better.",
  },
  {
    q: "Is my CV data safe?",
    a: "Yes. Your CV is stored securely in your account. We never sell it, share it, or use it to train AI models. You can delete your account and all data at any time.",
  },
  {
    q: "Does ATS optimisation actually work?",
    a: "Yes. Studies show 75% of CVs are rejected by ATS software before a human sees them. Matching the right keywords for your role is the single highest-leverage fix you can make.",
  },
  {
    q: "How is this different from Resumeworded or Jobscan?",
    a: "CVEdge combines ATS scoring, AI bullet rewrites, job matching, and cover letter generation in one tool — at a fraction of the price. Most tools only do one of these.",
  },
  {
    q: "Do I need to start from scratch?",
    a: "No. Upload your existing CV as a PDF and we parse everything automatically. Improve what you have — no blank templates, no manual copy-pasting.",
  },
  {
    q: "What roles and industries do you support?",
    a: "130+ roles across 12 domains — Engineering, Design, Product, Data, Marketing, Sales, Finance, HR, Operations, Content, Mechanical, and New Age / Digital Economy.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes — cancel with one click from your billing page. No emails to send, no forms to fill. Your access continues until the end of your billing period.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. The free plan includes 3 CVs, 10 ATS scans, 25 AI rewrites, 5 job matches, and 5 cover letters every 7 days. All 12 templates and unlimited watermarked PDF downloads. No credit card required to get started.",
  },
];

export function FaqSection() {
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
      {FAQS.map((faq, i) => (
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
