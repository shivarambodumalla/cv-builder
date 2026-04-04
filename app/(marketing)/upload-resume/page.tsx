import type { Metadata } from "next";
import { UploadResumeContent } from "./upload-resume-content";

export const metadata: Metadata = {
  title: "Free ATS Resume Checker — Upload Your CV",
  description:
    "Upload your resume and get an instant ATS score. Find out why you're not getting callbacks and fix it in minutes.",
};

export default function UploadResumePage() {
  return <UploadResumeContent />;
}
