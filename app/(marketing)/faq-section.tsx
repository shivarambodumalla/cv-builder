"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Is this really free?",
    a: "Yes. You can scan your resume and see your ATS score for free. The free plan includes 3 resumes, 10 ATS scans, 25 AI rewrites, and 5 job matches every 7 days. No credit card required.",
  },
  {
    q: "How accurate is the ATS score?",
    a: "It is based on real hiring system patterns, role-specific keyword analysis across 130+ roles, and the same filtering rules that ATS software uses. 75% of resumes are rejected by ATS before a human sees them.",
  },
  {
    q: "Will this work for freshers?",
    a: "Yes. CVEdge helps both freshers and experienced professionals. The AI adapts suggestions to your experience level and uses [X] placeholders when you need to add specific numbers.",
  },
  {
    q: "Is my data safe?",
    a: "Your data is encrypted and stored securely. We never sell it, share it, or use it to train AI models. You can delete your account and all data at any time.",
  },
  {
    q: "Do I need to start from scratch?",
    a: "No. Upload your existing resume as a PDF and we parse everything automatically. Improve what you have — no blank templates, no manual entry.",
  },
  {
    q: "How is this different from other resume tools?",
    a: "CVEdge combines ATS scoring, AI bullet rewrites, job matching, cover letter generation, and interview prep in one tool — at a fraction of the price. Most tools only do one of these.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes — cancel with one click from your billing page. No emails, no forms. Your access continues until the end of your billing period.",
  },
  {
    q: "What roles do you support?",
    a: "130+ roles across 12 domains — Engineering, Design, Product, Data, Marketing, Sales, Finance, HR, Operations, Content, Mechanical, and Digital Economy.",
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
