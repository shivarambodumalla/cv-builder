export interface DraftPost {
  slug: string;
  title: string;
  seo_title: string;
  seo_description: string;
  brief: string;
  tags: string[];
  read_time_minutes: number;
  /** Markdown source. Rendered with `marked`, the same pipeline the admin editor uses. */
  content_md: string;
}

/** Shared closing blocks so every draft links to the same template pages. */
export const TEMPLATES_MD = `
## Templates That Parse Cleanly

**[Harvard Resume Template](/resume-templates/ats-friendly/harvard-cv)** — the single-column academic-standard layout and the most downloaded template on CVEdge. Set it to Letter and it is the safest US default.

**[Classic Resume Template](/resume-templates/ats-friendly/classic-cv)** — standard headings, no graphics, parses cleanly in Greenhouse, Workday, Lever and iCIMS.

**[Executive Resume Template](/resume-templates/experienced/executive-cv)** — for senior candidates who need the summary and leadership scope to land before the role history.
`;

export const NEXT_STEP_MD = `
## Next Step

Upload your resume to the free [ATS resume checker](/upload-resume) to see what an employer's system extracts from it, then fix the gaps before you apply.
`;
