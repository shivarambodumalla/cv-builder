import type { ResumeContent } from "./types";

export const SAMPLE_CV: ResumeContent = {
  sections: {
    contact: true, targetTitle: true, summary: true, experience: true,
    education: true, skills: true, certifications: true,
    awards: false, projects: false, volunteering: false, publications: false,
  },
  contact: {
    name: "Arjun Mehta",
    email: "arjun@email.com",
    phone: "+91 98400 12345",
    location: "Bengaluru, India",
    linkedin: "linkedin.com/in/arjunmehta",
    website: "",
  },
  targetTitle: { title: "Senior ML Engineer" },
  summary: {
    content: "Senior AI/ML Engineer with 7 years of experience building and deploying large-scale machine learning systems at Google DeepMind and Flipkart. Specialised in NLP, LLM fine-tuning, and MLOps infrastructure.",
  },
  experience: {
    items: [
      {
        company: "Google DeepMind",
        role: "Senior ML Engineer",
        location: "Bengaluru, India",
        startDate: "Jan 2021",
        endDate: "",
        isCurrent: true,
        bullets: [
          "Led development of transformer-based ranking model improving CTR by 14%",
          "Built real-time feature pipeline processing 4.2B events/day using Apache Beam",
          "Fine-tuned LLMs for enterprise document summarisation reducing reading time by 73%",
        ],
      },
      {
        company: "Flipkart",
        role: "ML Engineer",
        location: "Bengaluru, India",
        startDate: "Jul 2018",
        endDate: "Dec 2020",
        isCurrent: false,
        bullets: [
          "Designed two-tower recommendation model increasing GMV by ₹380Cr across 120M users",
          "Reduced model training time by 58% by migrating to GCP with custom Kubernetes autoscaling",
        ],
      },
    ],
  },
  education: {
    items: [
      {
        institution: "IIT Bombay",
        degree: "B.Tech",
        field: "Computer Science",
        startDate: "2012",
        endDate: "2016",
      },
    ],
  },
  skills: {
    categories: [
      { name: "ML & AI", skills: ["Python", "PyTorch", "TensorFlow", "LLMs", "NLP"] },
      { name: "Infrastructure", skills: ["Kubernetes", "Docker", "AWS", "Vertex AI", "MLOps"] },
    ],
  },
  certifications: {
    items: [
      { name: "Google Professional ML Engineer", issuer: "Google Cloud", startDate: "2023", endDate: "", isCurrent: false },
    ],
  },
  awards: { items: [] },
  projects: { items: [] },
  volunteering: { items: [] },
  publications: { items: [] },
};
