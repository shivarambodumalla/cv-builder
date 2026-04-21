import { Suspense } from "react";
import type { Metadata } from "next";
import { UploadResumeContent } from "./upload-resume-content";
import { BreadcrumbJsonLd } from "@/components/shared/structured-data";

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
          { name: "Upload Resume", url: "https://www.thecvedge.com/upload-resume" },
        ]}
      />
      <UploadResumeContent />
    </Suspense>
  );
}
