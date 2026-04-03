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

export function SharpTemplate({
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
        color: "var(--resume-accent)",
        marginBottom: "8px",
        marginTop: "16px",
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
          borderLeft: "4px solid var(--resume-accent)",
          paddingLeft: "16px",
          textAlign: design.headerAlignment,
          fontFamily: "var(--resume-font)",
        }}
      >
        <div
          style={{
            fontSize: "var(--resume-name-size)",
            fontWeight: "var(--resume-name-weight)" as unknown as number,
            lineHeight: 1.15,
            color: "#111",
          }}
        >
          {contact.name}
        </div>
        {targetTitle?.title && visibleSections.includes("targetTitle") && (
          <div
            style={{
              fontSize: "calc(var(--resume-body-size) + 1pt)",
              color: "var(--resume-accent)",
              marginTop: "4px",
              fontFamily: "var(--resume-font)",
            }}
          >
            {targetTitle.title}
          </div>
        )}
        {contactItems.length > 0 && (
          <div
            style={{
              fontSize: "var(--resume-body-size)",
              color: "#555",
              marginTop: "6px",
              lineHeight: "var(--resume-line-spacing)",
              display: "flex",
              flexWrap: "wrap" as const,
              gap: "6px 14px",
              justifyContent:
                design.headerAlignment === "center"
                  ? "center"
                  : design.headerAlignment === "right"
                  ? "flex-end"
                  : "flex-start",
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
            color: "var(--resume-accent)",
            marginTop: "6px",
            paddingLeft: "20px",
          }}
        >
          {targetTitle.title}
        </div>
      ) : null,

    summary: () =>
      summary.content ? (
        <div key="summary">
          {renderSectionTitle("Summary")}
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
          {renderSectionTitle("Experience")}
          {experience.items.map((item, i) => (
            <div key={i} style={{ marginBottom: i < experience.items.length - 1 ? "12px" : 0 }}>
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "var(--resume-body-size)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: "calc(var(--resume-body-size) + 0.5pt)", color: "#111" }}>
                      {item.role}
                    </span>
                  </div>
                  <div style={{ color: "#666", whiteSpace: "nowrap", marginLeft: "12px", fontSize: "calc(var(--resume-body-size) - 0.5pt)" }}>
                    {renderDateRange(item.startDate, item.endDate, item.isCurrent)}
                  </div>
                </div>
                <div style={{ color: "#555", marginTop: "1px" }}>
                  {[item.company, item.location].filter(Boolean).join(", ")}
                </div>
              </div>
              {item.bullets.filter(Boolean).length > 0 && (
                <ul
                  style={{
                    margin: "5px 0 0 0",
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
                      {bulletChar && (
                        <span style={{ color: "var(--resume-accent)", marginRight: "6px" }}>
                          {bulletChar}
                        </span>
                      )}
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
            <div key={i} style={{ marginBottom: i < education.items.length - 1 ? "8px" : 0 }}>
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
                  <span style={{ fontWeight: 700, color: "#111" }}>{item.degree}</span>
                  {item.field && <span style={{ color: "#444" }}> in {item.field}</span>}
                </div>
                <div style={{ color: "#666", whiteSpace: "nowrap", marginLeft: "12px", fontSize: "calc(var(--resume-body-size) - 0.5pt)" }}>
                  {renderDateRange(item.startDate, item.endDate)}
                </div>
              </div>
              {item.institution && (
                <div
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: "var(--resume-body-size)",
                    color: "#555",
                    marginTop: "1px",
                  }}
                >
                  {item.institution}
                </div>
              )}
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
                marginBottom: "3px",
              }}
            >
              <span style={{ fontWeight: 700, color: "var(--resume-accent)" }}>{cat.name}: </span>
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
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-body-size)",
                lineHeight: "var(--resume-line-spacing)",
                marginBottom: "3px",
              }}
            >
              <div>
                <span style={{ fontWeight: 700, color: "#111" }}>{item.name}</span>
                {item.issuer && <span style={{ color: "#555" }}> - {item.issuer}</span>}
              </div>
              <div style={{ color: "#666", whiteSpace: "nowrap", marginLeft: "12px" }}>
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
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-body-size)",
                lineHeight: "var(--resume-line-spacing)",
                marginBottom: "5px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <span style={{ fontWeight: 700, color: "#111" }}>{item.title}</span>
                  {item.issuer && <span style={{ color: "#555" }}> - {item.issuer}</span>}
                </div>
                {item.date && (
                  <div style={{ color: "#666", whiteSpace: "nowrap", marginLeft: "12px" }}>
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
            <div key={i} style={{ marginBottom: i < projects.items.length - 1 ? "12px" : 0 }}>
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
                    <span style={{ color: "#888", marginLeft: "8px", fontSize: "calc(var(--resume-body-size) - 1pt)" }}>
                      {item.url}
                    </span>
                  )}
                </div>
                <div style={{ color: "#666", whiteSpace: "nowrap", marginLeft: "12px" }}>
                  {renderDateRange(item.startDate, item.endDate)}
                </div>
              </div>
              {item.bullets.filter(Boolean).length > 0 && (
                <ul
                  style={{
                    margin: "5px 0 0 0",
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
                      {bulletChar && (
                        <span style={{ color: "var(--resume-accent)", marginRight: "6px" }}>
                          {bulletChar}
                        </span>
                      )}
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
            <div key={i} style={{ marginBottom: i < volunteering.items.length - 1 ? "12px" : 0 }}>
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
                  {item.organization && (
                    <span style={{ color: "#555" }}>, {item.organization}</span>
                  )}
                </div>
                <div style={{ color: "#666", whiteSpace: "nowrap", marginLeft: "12px" }}>
                  {renderDateRange(item.startDate, item.endDate)}
                </div>
              </div>
              {item.bullets.filter(Boolean).length > 0 && (
                <ul
                  style={{
                    margin: "5px 0 0 0",
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
                      {bulletChar && (
                        <span style={{ color: "var(--resume-accent)", marginRight: "6px" }}>
                          {bulletChar}
                        </span>
                      )}
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
                marginBottom: "4px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <span style={{ fontWeight: 700, color: "#111" }}>{item.title}</span>
                  {item.publisher && <span style={{ color: "#555" }}> - {item.publisher}</span>}
                </div>
                {item.date && (
                  <div style={{ color: "#666", whiteSpace: "nowrap", marginLeft: "12px" }}>
                    {formatDate(item.date)}
                  </div>
                )}
              </div>
              {item.url && (
                <div style={{ color: "#888", fontSize: "calc(var(--resume-body-size) - 1pt)" }}>
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
