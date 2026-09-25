import { ResumeFonts } from "@/components/resume/resume-fonts";

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ResumeFonts />
      {children}
    </>
  );
}
