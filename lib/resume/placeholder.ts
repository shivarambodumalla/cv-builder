import type { ResumeContent } from "./types";
import { DEFAULT_CONTENT } from "./defaults";

const PLACEHOLDER: ResumeContent = {
  ...DEFAULT_CONTENT,
  sections: {
    ...DEFAULT_CONTENT.sections,
    contact: true,
    targetTitle: true,
    summary: true,
    experience: true,
    education: true,
    skills: true,
  },
  contact: {
    name: "Your Name",
    email: "email@example.com",
    phone: "+1 234 567 890",
    location: "City, Country",
    linkedin: "linkedin.com/in/yourname",
    website: "",
  },
  targetTitle: { title: "Your Target Role" },
  summary: {
    content:
      "Your professional summary will appear here. Write 2–3 sentences highlighting your experience, key skills, and career goals.",
  },
  experience: {
    items: [
      {
        company: "Company Name",
        role: "Job Title",
        location: "City, Country",
        startDate: "2022-01",
        endDate: "Present",
        isCurrent: true,
        bullets: [
          "Led cross-functional projects that improved team productivity by 30%",
          "Developed and shipped features used by 10,000+ users",
        ],
      },
    ],
  },
  education: {
    items: [
      {
        institution: "University Name",
        degree: "Bachelor of Science",
        field: "Computer Science",
        startDate: "2018-09",
        endDate: "2022-06",
      },
    ],
  },
  skills: {
    categories: [
      {
        name: "Technical Skills",
        skills: ["JavaScript", "TypeScript", "React", "Node.js", "SQL"],
      },
    ],
  },
};

function isContentEmpty(content: ResumeContent): boolean {
  const c = content.contact;
  const hasContact = !!(c.name || c.email || c.phone || c.location);
  const hasSummary = !!content.summary.content;
  const hasExperience = content.experience.items.length > 0;
  const hasEducation = content.education.items.length > 0;
  const hasSkills = content.skills.categories.some((cat) => cat.skills.length > 0);

  return !hasContact && !hasSummary && !hasExperience && !hasEducation && !hasSkills;
}

export function getPreviewContent(content: ResumeContent): ResumeContent {
  if (isContentEmpty(content)) return PLACEHOLDER;
  return content;
}
