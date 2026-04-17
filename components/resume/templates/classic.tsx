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

export function ClassicTemplate({
  content,
  design,
  formatDate,
  bulletChar,
  visibleSections,
  sectionSpacing = 12,
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
        letterSpacing: "1.5px",
        color: "var(--resume-accent)",
        borderBottom: "1.5px solid var(--resume-accent)",
        paddingBottom: "3px",
        marginBottom: "6px",
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
          textAlign: design.headerAlignment,
          fontFamily: "var(--resume-font)",
        }}
      >
        <div
          style={{
            fontSize: "var(--resume-name-size)",
            fontWeight: "var(--resume-name-weight)" as unknown as number,
            lineHeight: 1.2,
            color: "var(--resume-accent)",
          }}
        >
          {contact.name}
        </div>
        {contactItems.length > 0 && (
          <div
            style={{
              fontSize: "9pt",
              color: "#555",
              marginTop: "6px",
              lineHeight: "var(--resume-line-spacing)",
            }}
          >
            {contactItems.join(contactSeparator)}
          </div>
        )}
      </div>
    ),

    targetTitle: () =>
      targetTitle.title ? (
        <div
          key="targetTitle"
          style={{
            fontFamily: "var(--resume-font)",
            fontSize: "calc(var(--resume-body-size) + 2pt)",
            fontWeight: 600,
            textAlign: design.headerAlignment,
            color: "#333",
            marginTop: "4px",
          }}
        >
          {targetTitle.title}
        </div>
      ) : null,

    summary: () =>
      summary.content ? (
        <div key="summary">
          <p
            style={{
              fontFamily: "var(--resume-font)",
              fontSize: "var(--resume-body-size)",
              lineHeight: "var(--resume-line-spacing)",
              color: "#1a1a1a",
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
          {renderSectionTitle("Experience")}
          {experience.items.map((item, i) => (
            <div key={i} data-resume-entry="" style={{ marginBottom: i < experience.items.length - 1 ? "10px" : 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  fontFamily: "var(--resume-font)",
                  fontSize: "var(--resume-body-size)",
                  marginBottom: "1px",
                }}
              >
                <div style={{ flex: 1, paddingRight: "8px" }}>
                  <div style={{ fontWeight: 700, color: "#1a1a1a" }}>{item.role}</div>
                  {(item.company || item.location) && (
                    <div style={{ color: "#555", fontSize: "calc(var(--resume-body-size) - 0.5pt)" }}>
                      {[item.company, item.location].filter(Boolean).join(" | ")}
                    </div>
                  )}
                </div>
                <div style={{ color: "#777", whiteSpace: "nowrap", fontSize: "8.5pt", textAlign: "right", minWidth: "90px" }}>
                  {renderDateRange(item.startDate, item.endDate, item.isCurrent)}
                </div>
              </div>
              {item.bullets.filter(Boolean).length > 0 && (
                <ul
                  style={{
                    margin: "4px 0 0 0",
                    paddingLeft: bulletChar ? "16px" : "0",
                    listStyle: "none",
                    fontFamily: "var(--resume-font)",
                    fontSize: "var(--resume-body-size)",
                    lineHeight: "var(--resume-line-spacing)",
                    color: "#444",
                  }}
                >
                  {item.bullets.filter(Boolean).map((bullet, j) => (
                    <li key={j} style={{ marginBottom: "1.5px" }}>
                      {bulletChar && <span style={{ marginRight: "6px" }}>{bulletChar}</span>}
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
            <div key={i} data-resume-entry="" style={{ marginBottom: i < education.items.length - 1 ? "4px" : 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  fontFamily: "var(--resume-font)",
                  fontSize: "var(--resume-body-size)",
                }}
              >
                <div style={{ flex: 1, paddingRight: "8px" }}>
                  <div>
                    <span style={{ fontWeight: 700, color: "#1a1a1a" }}>{item.degree}</span>
                    {item.field && <span style={{ color: "#555" }}> in {item.field}</span>}
                  </div>
                  {item.institution && (
                    <div style={{ color: "#555" }}>{item.institution}</div>
                  )}
                </div>
                <div style={{ color: "#777", whiteSpace: "nowrap", fontSize: "8.5pt", textAlign: "right", minWidth: "90px" }}>
                  {renderDateRange(item.startDate, item.endDate)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null,

    skills: () =>
      skills.categories.length > 0 ? (
        <div key="skills">
          {renderSectionTitle("Skills")}
          {skills.categories.map((cat, i) => (
            <div
              key={i}
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-body-size)",
                lineHeight: "var(--resume-line-spacing)",
                marginBottom: "2px",
              }}
            >
              <span style={{ fontWeight: 700, color: "#1a1a1a" }}>{cat.name}: </span>
              <span style={{ color: "#333" }}>{cat.skills.join(", ")}</span>
            </div>
          ))}
        </div>
      ) : null,

    certifications: () =>
      certifications.items.length > 0 ? (
        <div key="certifications">
          {renderSectionTitle("Certifications")}
          {certifications.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
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
                <span style={{ fontWeight: 700, color: "#1a1a1a" }}>{item.name}</span>
                {item.issuer && <span style={{ color: "#555" }}> - {item.issuer}</span>}
              </div>
              <div style={{ color: "#555", whiteSpace: "nowrap", marginLeft: "12px" }}>
                {renderDateRange(item.startDate, item.endDate, item.isCurrent)}
              </div>
            </div>
          ))}
        </div>
      ) : null,

    awards: () =>
      awards.items.length > 0 ? (
        <div key="awards">
          {renderSectionTitle("Awards")}
          {awards.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-body-size)",
                lineHeight: "var(--resume-line-spacing)",
                marginBottom: "4px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <span style={{ fontWeight: 700, color: "#1a1a1a" }}>{item.title}</span>
                  {item.issuer && <span style={{ color: "#555" }}> - {item.issuer}</span>}
                </div>
                {item.date && (
                  <div style={{ color: "#555", whiteSpace: "nowrap", marginLeft: "12px" }}>
                    {formatDate(item.date)}
                  </div>
                )}
              </div>
              {item.description && (
                <p style={{ margin: "2px 0 0 0", color: "#555" }}>{item.description}</p>
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
            <div key={i} data-resume-entry="" style={{ marginBottom: i < projects.items.length - 1 ? "10px" : 0 }}>
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
                  <span style={{ fontWeight: 700, color: "#1a1a1a" }}>{item.name}</span>
                  {item.url && (
                    <span style={{ color: "#777", marginLeft: "6px" }}>{item.url}</span>
                  )}
                </div>
                <div style={{ color: "#555", whiteSpace: "nowrap", marginLeft: "12px" }}>
                  {renderDateRange(item.startDate, item.endDate)}
                </div>
              </div>
              {item.bullets.filter(Boolean).length > 0 && (
                <ul
                  style={{
                    margin: "4px 0 0 0",
                    paddingLeft: bulletChar ? "16px" : "0",
                    listStyle: "none",
                    fontFamily: "var(--resume-font)",
                    fontSize: "var(--resume-body-size)",
                    lineHeight: "var(--resume-line-spacing)",
                    color: "#333",
                  }}
                >
                  {item.bullets.filter(Boolean).map((bullet, j) => (
                    <li key={j}>
                      {bulletChar && <span style={{ marginRight: "6px" }}>{bulletChar}</span>}
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
            <div key={i} data-resume-entry="" style={{ marginBottom: i < volunteering.items.length - 1 ? "10px" : 0 }}>
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
                  <span style={{ fontWeight: 700, color: "#1a1a1a" }}>{item.role}</span>
                  {item.organization && (
                    <span style={{ color: "#555" }}> | {item.organization}</span>
                  )}
                </div>
                <div style={{ color: "#555", whiteSpace: "nowrap", marginLeft: "12px" }}>
                  {renderDateRange(item.startDate, item.endDate)}
                </div>
              </div>
              {item.bullets.filter(Boolean).length > 0 && (
                <ul
                  style={{
                    margin: "4px 0 0 0",
                    paddingLeft: bulletChar ? "16px" : "0",
                    listStyle: "none",
                    fontFamily: "var(--resume-font)",
                    fontSize: "var(--resume-body-size)",
                    lineHeight: "var(--resume-line-spacing)",
                    color: "#333",
                  }}
                >
                  {item.bullets.filter(Boolean).map((bullet, j) => (
                    <li key={j}>
                      {bulletChar && <span style={{ marginRight: "6px" }}>{bulletChar}</span>}
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
              data-resume-entry=""
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-body-size)",
                lineHeight: "var(--resume-line-spacing)",
                marginBottom: "4px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <span style={{ fontWeight: 700, color: "#1a1a1a" }}>{item.title}</span>
                  {item.publisher && <span style={{ color: "#555" }}> - {item.publisher}</span>}
                </div>
                {item.date && (
                  <div style={{ color: "#555", whiteSpace: "nowrap", marginLeft: "12px" }}>
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
        color: "#1a1a1a",
        padding: `${marginY}in ${marginX}in`,
      }}
    >
      {visibleSections.map((key, i) => {
        const renderer = sectionRenderers[key];
        if (!renderer) return null;
        const node = renderer();
        if (!node) return null;
        const hasPageBreak = pageBreaks.includes(key);
        return (
          <div
            key={key}
            data-resume-section=""
            {...(hasPageBreak ? { "data-page-break-before": "" } : {})}
            style={{
              marginTop: i > 0 && key !== "targetTitle" ? `${sectionSpacing}px` : undefined,
              ...(hasPageBreak ? { pageBreakBefore: "always" as const } : {}),
            }}
          >
            {node}
          </div>
        );
      })}
    </div>
  );
}
