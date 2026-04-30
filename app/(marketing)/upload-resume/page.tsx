import { Suspense } from "react";
import type { Metadata } from "next";
import { UploadResumeContent } from "./upload-resume-content";
import { BreadcrumbJsonLd, ServiceJsonLd } from "@/components/shared/structured-data";

export const metadata: Metadata = {
  title: "Free ATS Resume Checker | Upload Your CV",
  description: "Upload your resume and get an instant ATS score. Find out why you're not getting callbacks and fix it in minutes.",
  openGraph: {
    title: "Free ATS Resume Checker | CVEdge",
    description: "Upload your resume and get an instant ATS score. Fix it in minutes.",
    url: "https://www.thecvedge.com/upload-resume",
    images: ["/og-ats-checker.png"],
  },
  alternates: { canonical: "https://www.thecvedge.com/upload-resume" },
};

export default function UploadResumePage() {
  return (
    <Suspense fallback={<div />}>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://www.thecvedge.com" },
          { name: "ATS Resume Checker", url: "https://www.thecvedge.com/upload-resume" },
        ]}
      />
      <ServiceJsonLd
        name="Free ATS Resume Checker"
        description="Upload your CV or paste text to instantly check your ATS score. CVEdge analyses your resume across 6 categories — keywords, formatting, measurable results, bullet quality, sections, and contact info — and shows you exactly what to fix."
        url="https://www.thecvedge.com/upload-resume"
        serviceType="ATS Resume Analysis"
      />
      <UploadResumeContent />
    </Suspense>
  );
}
