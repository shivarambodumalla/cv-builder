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

/** UK closing block: A4, "CV", layouts UK recruiters and portals read cleanly. */
export const TEMPLATES_UK_MD = `
## CV Templates That Parse Cleanly

**[Classic CV Template](/resume-templates/ats-friendly/classic-cv)**: standard headings, one column, no graphics. Set the paper size to A4 and it is the safest default for UK employers and recruitment agencies.

**[Sterling CV Template](/resume-templates/ats-friendly/sterling-cv)**: a serif body with clear rules under each heading, built for large-employer portals and public-sector applications.

**[Classic Serif CV Template](/resume-templates/freshers/classic-serif-cv)**: a clean one-page layout for students, school leavers and graduates.
`;

export const NEXT_STEP_UK_MD = `
## Next Step

Upload your CV to the free [ATS CV checker](/resume-checker) to see what an employer's system pulls out of it, then fix the gaps before you apply.
`;

export const NEXT_STEP_MD = `
## Next Step

Upload your resume to the free [ATS resume checker](/resume-checker) to see what an employer's system extracts from it, then fix the gaps before you apply.
`;
