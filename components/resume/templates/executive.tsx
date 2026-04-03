import type {
  ResumeContent,
  ResumeDesignSettings,

  SectionKey,
} from "@/lib/resume/types";

export interface TemplateProps {
  content: ResumeContent;
  design: ResumeDesignSettings;
  formatDate: (d: string) => string;
  bulletChar: string;
  visibleSections: SectionKey[];
  sectionSpacing?: number;
  marginX?: number;
  marginY?: number;
  pageBreaks?: string[];
  contactSeparator?: string;
}

export function ExecutiveTemplate({
  content,
  design,
  formatDate,
  bulletChar,
  visibleSections,
  sectionSpacing = 16,
  marginX = 0.75,
  marginY = 0.5,
  pageBreaks = [],
  contactSeparator = " | ",
}: TemplateProps) {
  const { contact, targetTitle, summary, experience, education, skills, certifications, awards, projects, volunteering, publications } = content;

  const contactItems = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.website,
  ].filter(Boolean);

  const renderSectionTitle = (title: string) => (
    <div
      data-resume-section-title=""
      style={{
        fontFamily: "var(--resume-font)",
        fontSize: "var(--resume-heading-size)",
        fontWeight: "var(--resume-heading-weight)" as unknown as number,
        textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
        letterSpacing: "1px",
        color: "#222",
        borderBottom: "1.5px solid #333",
        paddingBottom: "2px",
        marginBottom: "6px",
        marginTop: "10px",
      }}
    >
      {title}
    </div>
  );

  const renderDateRange = (start: string, end: string, isCurrent?: boolean) => {
    const s = formatDate(start);
    const e = isCurrent ? "Present" : formatDate(end);
    if (!s && !e) return null;
    return s && e ? `${s} - ${e}` : s || e;
  };

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    contact: () => (
      <div
        key="contact"
        style={{
          fontFamily: "var(--resume-font)",
          textAlign: design.headerAlignment,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "12px",
            justifyContent:
              design.headerAlignment === "center"
                ? "center"
                : design.headerAlignment === "right"
                ? "flex-end"
                : "flex-start",
            flexWrap: "wrap" as const,
          }}
        >
          <span
            style={{
              fontSize: "var(--resume-name-size)",
              fontWeight: "var(--resume-name-weight)" as unknown as number,
              lineHeight: 1.2,
              color: "#111",
            }}
          >
            {contact.name}
          </span>
          {/* Target title on same line if visible */}
          {visibleSections.includes("targetTitle") && targetTitle.title && (
            <span
              style={{
                fontSize: "calc(var(--resume-body-size) + 1pt)",
                fontWeight: 400,
                color: "#555",
              }}
            >
              {targetTitle.title}
            </span>
          )}
        </div>
        {contactItems.length > 0 && (
          <div
            style={{
              fontSize: "calc(var(--resume-body-size) - 0.5pt)",
              color: "#555",
              marginTop: "3px",
              lineHeight: "var(--resume-line-spacing)",
            }}
          >
            {contactItems.join(contactSeparator)}
          </div>
        )}
      </div>
    ),

    /* targetTitle is rendered inline with contact, so render nothing here */
    targetTitle: () => null,

    summary: () =>
      summary.content ? (
        <div key="summary">
          {renderSectionTitle("Professional Summary")}
          <p
            style={{
              fontFamily: "var(--resume-font)",
              fontSize: "var(--resume-body-size)",
              lineHeight: "var(--resume-line-spacing)",
              color: "#333",
              margin: 0,
            }}
          >
            {summary.content}
          </p>
        </div>
      ) : null,

    experience: () =>
      experience.items.length > 0 ? (
        <div key="experience">
          {renderSectionTitle("Professional Experience")}
          {experience.items.map((item, i) => (
            <div key={i} style={{ marginBottom: i < experience.items.length - 1 ? "8px" : 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  fontFamily: "var(--resume-font)",
                  fontSize: "var(--resume-body-size)",
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: "#111" }}>{item.role}</span>
                  {item.company && <span style={{ color: "#444" }}>, {item.company}</span>}
                  {item.location && <span style={{ color: "#666" }}>, {item.location}</span>}
                </div>
                <div style={{ color: "#555", whiteSpace: "nowrap", marginLeft: "10px", fontSize: "calc(var(--resume-body-size) - 0.5pt)" }}>
                  {renderDateRange(item.startDate, item.endDate, item.isCurrent)}
                </div>
              </div>
              {item.bullets.filter(Boolean).length > 0 && (
                <ul
                  style={{
                    margin: "3px 0 0 0",
                    paddingLeft: bulletChar ? "14px" : "0",
                    listStyle: "none",
                    fontFamily: "var(--resume-font)",
                    fontSize: "var(--resume-body-size)",
                    lineHeight: "var(--resume-line-spacing)",
                    color: "#333",
                  }}
                >
                  {item.bullets.filter(Boolean).map((bullet, j) => (
                    <li key={j}>
                      {bulletChar && <span style={{ marginRight: "5px" }}>{bulletChar}</span>}
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : null,

    education: () =>
      education.items.length > 0 ? (
        <div key="education">
          {renderSectionTitle("Education")}
          {education.items.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-body-size)",
                marginBottom: i < education.items.length - 1 ? "4px" : 0,
              }}
            >
              <div>
                <span style={{ fontWeight: 700, color: "#111" }}>{item.degree}</span>
                {item.field && <span style={{ color: "#444" }}> in {item.field}</span>}
                {item.institution && <span style={{ color: "#555" }}>, {item.institution}</span>}
              </div>
              <div style={{ color: "#555", whiteSpace: "nowrap", marginLeft: "10px", fontSize: "calc(var(--resume-body-size) - 0.5pt)" }}>
                {renderDateRange(item.startDate, item.endDate)}
              </div>
            </div>
          ))}
        </div>
      ) : null,

    skills: () =>
      skills.categories.length > 0 ? (
        <div key="skills">
          {renderSectionTitle("Skills")}
          <div
            style={{
              fontFamily: "var(--resume-font)",
              fontSize: "var(--resume-body-size)",
              lineHeight: "var(--resume-line-spacing)",
            }}
          >
            {skills.categories.map((cat, i) => (
              <span key={i}>
                <span style={{ fontWeight: 700, color: "#111" }}>{cat.name}: </span>
                <span style={{ color: "#333" }}>{cat.skills.join(", ")}</span>
                {i < skills.categories.length - 1 && (
                  <span style={{ color: "#999", margin: "0 8px" }}>|</span>
                )}
              </span>
            ))}
          </div>
        </div>
      ) : null,

    certifications: () =>
      certifications.items.length > 0 ? (
        <div key="certifications">
          {renderSectionTitle("Certifications")}
          {certifications.items.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-body-size)",
                lineHeight: "var(--resume-line-spacing)",
                marginBottom: "2px",
              }}
            >
              <div>
                <span style={{ fontWeight: 700, color: "#111" }}>{item.name}</span>
                {item.issuer && <span style={{ color: "#555" }}>, {item.issuer}</span>}
              </div>
              <div style={{ color: "#555", whiteSpace: "nowrap", marginLeft: "10px" }}>
                {renderDateRange(item.startDate, item.endDate, item.isCurrent)}
              </div>
            </div>
          ))}
        </div>
      ) : null,

    awards: () =>
      awards.items.length > 0 ? (
        <div key="awards">
          {renderSectionTitle("Awards & Honors")}
          {awards.items.map((item, i) => (
            <div
              key={i}
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-body-size)",
                lineHeight: "var(--resume-line-spacing)",
                marginBottom: "3px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <span style={{ fontWeight: 700, color: "#111" }}>{item.title}</span>
                  {item.issuer && <span style={{ color: "#555" }}>, {item.issuer}</span>}
                </div>
                {item.date && (
                  <div style={{ color: "#555", whiteSpace: "nowrap", marginLeft: "10px" }}>
                    {formatDate(item.date)}
                  </div>
                )}
              </div>
              {item.description && (
                <p style={{ margin: "1px 0 0 0", color: "#555", fontSize: "calc(var(--resume-body-size) - 0.5pt)" }}>
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : null,

    projects: () =>
      projects.items.length > 0 ? (
        <div key="projects">
          {renderSectionTitle("Projects")}
          {projects.items.map((item, i) => (
            <div key={i} style={{ marginBottom: i < projects.items.length - 1 ? "8px" : 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  fontFamily: "var(--resume-font)",
                  fontSize: "var(--resume-body-size)",
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: "#111" }}>{item.name}</span>
                  {item.url && (
                    <span style={{ color: "#777", marginLeft: "6px", fontSize: "calc(var(--resume-body-size) - 1pt)" }}>
                      {item.url}
                    </span>
                  )}
                </div>
                <div style={{ color: "#555", whiteSpace: "nowrap", marginLeft: "10px" }}>
                  {renderDateRange(item.startDate, item.endDate)}
                </div>
              </div>
              {item.bullets.filter(Boolean).length > 0 && (
                <ul
                  style={{
                    margin: "3px 0 0 0",
                    paddingLeft: bulletChar ? "14px" : "0",
                    listStyle: "none",
                    fontFamily: "var(--resume-font)",
                    fontSize: "var(--resume-body-size)",
                    lineHeight: "var(--resume-line-spacing)",
                    color: "#333",
                  }}
                >
                  {item.bullets.filter(Boolean).map((bullet, j) => (
                    <li key={j}>
                      {bulletChar && <span style={{ marginRight: "5px" }}>{bulletChar}</span>}
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : null,

    volunteering: () =>
      volunteering.items.length > 0 ? (
        <div key="volunteering">
          {renderSectionTitle("Volunteering")}
          {volunteering.items.map((item, i) => (
            <div key={i} style={{ marginBottom: i < volunteering.items.length - 1 ? "8px" : 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  fontFamily: "var(--resume-font)",
                  fontSize: "var(--resume-body-size)",
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: "#111" }}>{item.role}</span>
                  {item.organization && <span style={{ color: "#555" }}>, {item.organization}</span>}
                </div>
                <div style={{ color: "#555", whiteSpace: "nowrap", marginLeft: "10px" }}>
                  {renderDateRange(item.startDate, item.endDate)}
                </div>
              </div>
              {item.bullets.filter(Boolean).length > 0 && (
                <ul
                  style={{
                    margin: "3px 0 0 0",
                    paddingLeft: bulletChar ? "14px" : "0",
                    listStyle: "none",
                    fontFamily: "var(--resume-font)",
                    fontSize: "var(--resume-body-size)",
                    lineHeight: "var(--resume-line-spacing)",
                    color: "#333",
                  }}
                >
                  {item.bullets.filter(Boolean).map((bullet, j) => (
                    <li key={j}>
                      {bulletChar && <span style={{ marginRight: "5px" }}>{bulletChar}</span>}
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : null,

    publications: () =>
      publications.items.length > 0 ? (
        <div key="publications">
          {renderSectionTitle("Publications")}
          {publications.items.map((item, i) => (
            <div
              key={i}
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-body-size)",
                lineHeight: "var(--resume-line-spacing)",
                marginBottom: "3px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <span style={{ fontWeight: 700, color: "#111" }}>{item.title}</span>
                  {item.publisher && <span style={{ color: "#555" }}>, {item.publisher}</span>}
                </div>
                {item.date && (
                  <div style={{ color: "#555", whiteSpace: "nowrap", marginLeft: "10px" }}>
                    {formatDate(item.date)}
                  </div>
                )}
              </div>
              {item.url && (
                <div style={{ color: "#777", fontSize: "calc(var(--resume-body-size) - 1pt)" }}>
                  {item.url}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,
  };

  return (
    <div
      style={{
        fontFamily: "var(--resume-font)",
        fontSize: "var(--resume-body-size)",
        lineHeight: "var(--resume-line-spacing)",
        color: "#333",
        padding: `${marginY}in ${marginX}in`,
      }}
    >
      {visibleSections.map((key, i) => {
        const renderer = sectionRenderers[key];
        if (!renderer) return null;
        const node = renderer();
        if (!node) return null;
        return <div key={key} data-resume-section="" {...(pageBreaks.includes(key) ? { "data-page-break-before": "" } : {})} style={{ marginTop: i > 0 && key !== "targetTitle" ? `${sectionSpacing}px` : undefined, ...(pageBreaks.includes(key) ? { pageBreakBefore: "always" as const } : {}) }}>{node}</div>;
      })}
    </div>
  );
}
