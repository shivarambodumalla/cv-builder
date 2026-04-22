/**
 * Smoke test for lib/jobs/matcher scoring.
 * Run: npx tsx scripts/matcher-smoke.ts
 */
import { scoreJobsAgainstCV } from "../lib/jobs/matcher";
import type { GenericJob } from "../lib/jobs/types";
import type { ResumeContent } from "../lib/resume/types";

const cv = {
  targetTitle: { title: "Staff Product Manager" },
  experience: {
    items: [
      { role: "Staff Product Manager", startDate: "2018-01-01", isCurrent: true, endDate: null },
      { role: "Senior Product Manager", startDate: "2014-01-01", endDate: "2017-12-31" },
    ],
  },
  skills: {
    categories: [
      { skills: ["Product Management", "Roadmap", "OKRs", "User Research", "SQL", "Analytics", "Figma", "Agile", "Go-to-Market", "JavaScript"] },
    ],
  },
  contact: { location: "San Francisco, CA" },
} as ResumeContent;

const jobs: GenericJob[] = [
  {
    id: "j1",
    title: "Staff Product Manager, Payments",
    description:
      "We are seeking a Staff Product Manager to own the payments roadmap. You will drive OKRs across GTM and user research, ship experiments with our analytics team, and work closely with engineering (JS + Figma). Continuous integration a plus. 8+ years PM experience required.",
    company: "Stripe",
    location: "Remote · US",
    salary_min: 180000,
    salary_max: 220000,
    salary_is_predicted: false,
    redirect_url: "https://example.com",
    created: new Date(Date.now() - 3 * 86400000).toISOString(),
    contract_type: "permanent",
    category: null,
    provider: "test",
  },
  {
    id: "j2",
    title: "Senior Product Manager, Growth",
    description:
      "Own the growth roadmap. Run experiments, define OKRs, partner with analytics and engineering (React, Node).",
    company: "Linear",
    location: "New York, NY",
    salary_min: 160000,
    salary_max: 190000,
    salary_is_predicted: false,
    redirect_url: "https://example.com",
    created: new Date(Date.now() - 10 * 86400000).toISOString(),
    contract_type: "permanent",
    category: null,
    provider: "test",
  },
  {
    id: "j3",
    title: "Principal Product Manager — Platform",
    description:
      "Drive platform PM strategy, roadmap alignment, OKRs, and user research. Partner with engineering on CI/CD and GCP infrastructure.",
    company: "Notion",
    location: "San Francisco, CA",
    salary_min: 210000,
    salary_max: 250000,
    salary_is_predicted: false,
    redirect_url: "https://example.com",
    created: new Date(Date.now() - 2 * 86400000).toISOString(),
    contract_type: "permanent",
    category: null,
    provider: "test",
  },
  {
    id: "j4",
    title: "Junior Product Manager",
    description: "Entry-level PM role for someone with 0-2 years experience.",
    company: "Unknown",
    location: "Remote",
    salary_min: null,
    salary_max: null,
    salary_is_predicted: false,
    redirect_url: "",
    created: new Date().toISOString(),
    contract_type: null,
    category: null,
    provider: "test",
  },
  {
    id: "j5",
    title: "Backend Engineer",
    description: "Java, Spring Boot, Kubernetes. Not a PM role.",
    company: "Foo",
    location: "Berlin, DE",
    salary_min: null,
    salary_max: null,
    salary_is_predicted: false,
    redirect_url: "",
    created: new Date().toISOString(),
    contract_type: null,
    category: null,
    provider: "test",
  },
];

const scored = scoreJobsAgainstCV(jobs, cv, ["Remote", "San Francisco"], "us");
for (const j of scored) {
  console.log(
    `${j.matchScore.toString().padStart(3)}%  [${j.matchLabelText.padEnd(18)}]  ${j.title} @ ${j.company}`
  );
  console.log(`      breakdown:`, j.scoreBreakdown);
}
