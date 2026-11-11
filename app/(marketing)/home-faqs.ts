import { summarizeAllowance, type PlanQuotas } from "@/lib/billing/format-limits";

/** Topics the homepage FAQ groups questions under, in display order. */
export const FAQ_TOPICS = [
  { id: "pricing", label: "Pricing and plans" },
  { id: "score", label: "Your ATS score" },
  { id: "using", label: "Using CVEdge" },
  { id: "data", label: "Data and regions" },
] as const;

export type FaqTopic = (typeof FAQ_TOPICS)[number]["id"];

export interface HomeFaq {
  q: string;
  a: string;
  topic: FaqTopic;
}

/**
 * The homepage FAQ. One list feeds both the visible accordion (components/marketing/home-faq.tsx)
 * and the FAQPage JSON-LD on the page, so what Google reads is what visitors see.
 * The first answer is built from the live free-plan quotas, which are
 * admin-editable, so no quota number is typed here.
 */
export function homeFaqs(free: PlanQuotas): HomeFaq[] {
  return [
    {
      q: "Is this really free?",
      topic: "pricing",
      a: `Yes. You can scan your resume and see your ATS score and top issues for free. The free plan includes ${summarizeAllowance(free, ["ats_scans", "ai_rewrites", "job_matches", "pdf_downloads"])}, and every template. PDF downloads carry a small CVEdge footer; Pro removes it. No credit card required.`,
    },
    {
      q: "What is an ATS score?",
      topic: "score",
      a: "An ATS score measures how well your resume passes the applicant tracking software employers use to filter applications. CVEdge scores six categories: contact details, sections, keywords, measurable results, bullet quality and formatting. 90 and above is Interview Ready. Pro comes with an 80+ score guarantee.",
    },
    {
      q: "How accurate is the ATS score?",
      topic: "score",
      a: "It is based on real hiring system patterns, role-specific keyword analysis across 130+ roles, and the same filtering rules that ATS software uses. 75% of resumes are rejected by ATS before a human sees them.",
    },
    {
      q: "What causes resumes to fail ATS screening?",
      topic: "score",
      a: "The most common failures are missing role-specific keywords, non-standard section headings, complex formatting (tables, columns, graphics) that parsers cannot read, bullets with no measurable results, and missing contact details. The free scan shows the top issues on your resume. Pro shows every issue and the missing keywords.",
    },
    {
      q: "How do I improve my ATS score?",
      topic: "score",
      a: "Add role-specific keywords from the job description, use standard section headings (Experience, Education, Skills), remove tables and graphics, put numbers in your bullets, and complete your contact details. You can make every change yourself in the editor and watch the estimated score move. With Pro, Fix All rewrites your summary and bullets for you.",
    },
    {
      q: "How do I tailor my resume to a job description?",
      topic: "using",
      a: "With Pro, paste the job description into the Job Match tab. CVEdge compares keyword overlap, experience fit and missing skills, then shows what to add or change. Tailor CV rewrites your resume for that specific role.",
    },
    {
      q: "Will this work for freshers?",
      topic: "using",
      a: "Yes. CVEdge helps both freshers and experienced professionals. The score and issues adapt to your experience level, and the AI tools in Pro use [X] placeholders when you need to add specific numbers.",
    },
    {
      q: "Do I need to start from scratch?",
      topic: "using",
      a: "No. Upload your existing resume as a PDF and we parse everything automatically, so you improve what you have. You can also start from a blank template in the builder, or download a blank Word template and fill it in offline.",
    },
    {
      q: "How is this different from other resume tools?",
      topic: "using",
      a: "CVEdge puts the ATS score, the resume builder, AI bullet rewrites, Job Match, cover letters and Interview Coach in one tool. The score, the builder and every template are free. The AI tools are in Pro, which costs less than most single-purpose tools.",
    },
    {
      q: "What is the 80+ ATS score guarantee?",
      topic: "pricing",
      a: "It is for Pro users. If your score stays under 80 after running Fix All, claim within 14 days of signing up. We review your resume ourselves, and if we still cannot reach 80, we refund you in full.",
    },
    {
      q: "Can I cancel anytime?",
      topic: "pricing",
      a: "Yes. Cancel with one click from your billing page. No emails, no forms. Your access continues until the end of your billing period.",
    },
    {
      q: "Is my data safe?",
      topic: "data",
      a: "Your data is encrypted and stored securely. We never sell it, share it, or use it to train AI models. You can delete your account and all data at any time.",
    },
    {
      q: "What roles do you support?",
      topic: "using",
      a: "130+ roles across 12 domains: Engineering, Design, Product, Data, Marketing, Sales, Finance, HR, Operations, Content, Mechanical, and Digital Economy.",
    },
    {
      q: "Does CVEdge work for jobs in the UAE, Saudi Arabia, and the Middle East?",
      topic: "data",
      a: "Yes. CVEdge is used by job seekers across the UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, and Oman. ATS screening is standard among large GCC employers and multinationals in the region. CVEdge scores your CV against the same criteria, and Pro matches it to local job descriptions and writes cover letters for GCC applications. The cv-review service also includes a Middle East specialist.",
    },
    {
      q: "Does CVEdge work for UK and European job applications?",
      topic: "data",
      a: "Yes. CVEdge works for CV optimization in the UK, Ireland, Germany, France, the Netherlands, and across Europe. The tool uses 'CV' alongside 'resume', supports standard European CV formats, and scores against ATS criteria used by UK and European employers. Role-specific keyword sets cover common UK and European job titles.",
    },
  ];
}
