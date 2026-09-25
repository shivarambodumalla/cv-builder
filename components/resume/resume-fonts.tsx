import { RESUME_FONTS_URL } from "@/lib/resume/fonts";

/**
 * Loads the resume font families wherever a template is rendered on screen,
 * so the preview wraps text exactly as the PDF export does.
 */
export function ResumeFonts() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={RESUME_FONTS_URL} />
    </>
  );
}
