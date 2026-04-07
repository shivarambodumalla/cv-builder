"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Will recruiters know I used AI?",
    a: "No. CVEdge suggests improvements based on your actual experience. You review and approve every change. Your CV stays yours, AI just helps you express it better.",
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
    a: "CVEdge combines role-specific ATS scoring, AI bullet rewrites, job matching, and cover letter generation in one tool, at a fraction of the price. Most tools only do one of these.",
  },
  {
    q: "Do I need to start from scratch?",
    a: "No. Upload your existing CV as a PDF and we parse every section automatically. You improve what you have, no blank templates.",
  },
  {
    q: "What roles and industries do you support?",
    a: "130+ roles across 12 domains including Engineering, Design, Product, Data, Marketing, Sales, Finance, HR, Operations, and more.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-0">
      {FAQS.map((faq, i) => (
        <div key={i} className="border-b">
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between py-4 text-left text-sm font-medium hover:text-primary transition-colors"
          >
            {faq.q}
            <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open === i && "rotate-180")} />
          </button>
          {open === i && (
            <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}
