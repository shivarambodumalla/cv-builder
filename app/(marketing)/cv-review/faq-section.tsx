"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Why is it only $9? Is the quality real?",
    a: "Because it's a launch offer for the first 100 customers. We're running every review with care to earn trust and feedback. After 100 customers, the price goes to $29. The quality doesn't change — but the wait time will, so order during launch pricing.",
  },
  {
    q: "What if I don't like it?",
    a: "You have 7 days from delivery to either request a revision (one round included) or request a full refund. No questions. Email hello@thecvedge.com.",
  },
  {
    q: "Is my CV data private?",
    a: "Yes. We don't share, sell, or train AI on your CV. Your file is permanently deleted 30 days after delivery unless you ask us to keep it on file.",
  },
  {
    q: "How is this different from the free CVEdge ATS scanner?",
    a: "The free tool diagnoses what's wrong. This service fixes it for you — a real human + AI rewrite using your actual experience. Diagnosis vs treatment.",
  },
  {
    q: "Do you cover GCC markets — UAE, Saudi Arabia, Qatar, Kuwait?",
    a: "Yes — GCC is one of our strongest markets. We have a dedicated Middle East hiring specialist with deep expertise across UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, and Oman. If you're targeting roles in Dubai, Abu Dhabi, Riyadh, Jeddah, or Doha, your CV will be reviewed and rewritten by someone who knows exactly what GCC recruiters and local ATS systems look for. We also cover India, UK, and US.",
  },
];

export function CvReviewFaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div>
      {FAQS.map((faq, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={i} className="border-b border-border">
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className={`flex w-full items-center justify-between py-5 text-left font-medium transition-colors text-base ${
                isOpen ? "text-primary" : "text-foreground hover:text-primary"
              }`}
            >
              {faq.q}
              <span
                className={`shrink-0 ml-4 transition-transform duration-200 text-primary ${
                  isOpen ? "rotate-180" : "rotate-0"
                }`}
              >
                ▾
              </span>
            </button>
            {isOpen && (
              <p className="pb-5 text-[15px] text-muted-foreground leading-relaxed">
                {faq.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
