import type { TemplateProps } from "./classic";

export function LedgerTemplate({
  content,
  formatDate,
  bulletChar,
  visibleSections,
  sectionSpacing = 16,
  marginX = 0.75,
  marginY = 0.5,
  pageBreaks = [],
}: TemplateProps) {
  const {
    contact,
    targetTitle,
    summary,
    experience,
    education,
    skills,
    certifications,
    awards,
    projects,
    volunteering,
    publications,
  } = content;

  const contactItems = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.website,
  ].filter(Boolean);

  const renderDateRange = (start: string, end: string, isCurrent?: boolean) => {
    const s = formatDate(start);
    const e = isCurrent ? "Present" : formatDate(end);
    if (!s && !e) return null;
    return s && e ? `${s} – ${e}` : s || e;
  };

  const LABEL_W = 120;

  /* ── Section row: full-width top rule, label left + content right ── */
  const renderSectionRow = (label: string, children: React.ReactNode) => (
    <div style={{ marginBottom: `${sectionSpacing}px` }}>
      {/* Full-width rule */}
      <div style={{ borderTop: "1px solid #E2E8F0", marginBottom: 8 }} />
      {/* Label + Content */}
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ width: LABEL_W, flexShrink: 0 }}>
          <span
            data-resume-section-title=""
            style={{
              fontSize: "calc(var(--resume-body-size) + 1pt)",
              fontWeight: 700,
              color: "var(--resume-accent)",
              fontFamily: "var(--resume-font)",
              textTransform: "uppercase" as const,
              letterSpacing: 0.5,
              whiteSpace: "nowrap" as const,
            }}
          >
            {label}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    contact: () => (
      <div
        key="contact"
        style={{
          textAlign: "center",
          fontFamily: "var(--resume-font)",
          marginBottom: `${sectionSpacing}px`,
        }}
      >
        <div
          style={{
            fontSize: "var(--resume-name-size)",
            fontWeight: "var(--resume-name-weight)" as unknown as number,
            color: "#111",
            lineHeight: 1.2,
          }}
        >
          {contact.name}
          {targetTitle.title && visibleSections.includes("targetTitle") ? `, ${targetTitle.title}` : ""}
        </div>
        {contactItems.length > 0 && (
          <div
            style={{
              fontSize: "var(--resume-body-size)",
              color: "#6B7280",
              marginTop: 5,
              lineHeight: "var(--resume-line-spacing)",
            }}
          >
            {contactItems.join(" \u00B7 ")}
          </div>
        )}
      </div>
    ),

    targetTitle: () => null,

    summary: () =>
      summary.content ? (
        <div key="summary">
          {renderSectionRow("Profile", (
            <p
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-body-size)",
                color: "#374151",
                lineHeight: "var(--resume-line-spacing)",
                margin: 0,
              }}
            >
              {summary.content}
            </p>
          ))}
        </div>
      ) : null,

    education: () =>
      education.items.length > 0 ? (
        <div key="education">
          {renderSectionRow("Education", (
            <>
              {education.items.map((item, i) => (
                <div
                  key={i}
                  data-resume-entry=""
                  style={{
                    marginBottom: i < education.items.length - 1 ? 10 : 0,
                    fontFamily: "var(--resume-font)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "calc(var(--resume-body-size) + 1pt)",
                      fontWeight: 700,
                      color: "#111",
                    }}
                  >
                    {item.institution}
                  </div>
                  <div style={{ fontSize: "var(--resume-body-size)", color: "#555" }}>
                    {item.degree}{item.field ? ` in ${item.field}` : ""}
                  </div>
                  <div style={{ fontSize: "var(--resume-body-size)", color: "#9CA3AF" }}>
                    {renderDateRange(item.startDate, item.endDate)}
                  </div>
                </div>
              ))}
            </>
          ))}
        </div>
      ) : null,

    experience: () =>
      experience.items.length > 0 ? (
        <div key="experience">
          {renderSectionRow("Employment", (
            <>
              {experience.items.map((item, i) => (
                <div
                  key={i}
                  data-resume-entry=""
                  style={{
                    marginBottom: i < experience.items.length - 1 ? 12 : 0,
                    fontFamily: "var(--resume-font)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div
                      style={{
                        fontSize: "calc(var(--resume-body-size) + 1pt)",
                        fontWeight: 700,
                        color: "#111",
                      }}
                    >
                      {item.role}{item.company ? ` at ${item.company}` : ""}
                    </div>
                    <div style={{ fontSize: "var(--resume-body-size)", color: "#9CA3AF", whiteSpace: "nowrap", marginLeft: 12 }}>
                      {renderDateRange(item.startDate, item.endDate, item.isCurrent)}
                    </div>
                  </div>
                  {item.location && (
                    <div style={{ fontSize: "var(--resume-body-size)", color: "#9CA3AF" }}>
                      {item.location}
                    </div>
                  )}
                  {item.bullets.filter(Boolean).length > 0 && (
                    <ul
                      style={{
                        margin: "4px 0 0 0",
                        paddingLeft: bulletChar ? "16px" : "0",
                        listStyle: "none",
                        fontSize: "var(--resume-body-size)",
                        lineHeight: "var(--resume-line-spacing)",
                        color: "#374151",
                      }}
                    >
                      {item.bullets.filter(Boolean).map((bullet, j) => (
                        <li key={j} data-resume-bullet="" style={{ marginBottom: 2 }}>
                          {bulletChar && <span style={{ marginRight: "6px" }}>{bulletChar}</span>}
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </>
          ))}
        </div>
      ) : null,

    skills: () =>
      skills.categories.length > 0 ? (
        <div key="skills">
          {renderSectionRow("Skills", (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
              {skills.categories.flatMap((cat) =>
                cat.skills.map((skill, si) => (
                  <div
                    key={`${cat.name}-${si}`}
                    style={{
                      width: "50%",
                      borderBottom: "0.5px solid #F1F5F9",
                      paddingTop: 2,
                      paddingBottom: 2,
                      fontFamily: "var(--resume-font)",
                    }}
                  >
                    <span style={{ fontSize: "var(--resume-body-size)", fontWeight: 600, color: "#111" }}>
                      {skill}
                    </span>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      ) : null,

    certifications: () =>
      certifications.items.length > 0 ? (
        <div key="certifications">
          {renderSectionRow("Certifications", (
            <>
              {certifications.items.map((item, i) => (
                <div
                  key={i}
                  data-resume-entry=""
                  style={{
                    marginBottom: i < certifications.items.length - 1 ? 10 : 0,
                    fontFamily: "var(--resume-font)",
                  }}
                >
                  <div style={{ fontSize: "calc(var(--resume-body-size) + 1pt)", fontWeight: 700, color: "#111" }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: "var(--resume-body-size)", color: "#555" }}>
                    {item.issuer}{item.startDate ? ` · ${formatDate(item.startDate)}` : ""}
                  </div>
                </div>
              ))}
            </>
          ))}
        </div>
      ) : null,

    awards: () =>
      awards.items.length > 0 ? (
        <div key="awards">
          {renderSectionRow("Awards", (
            <>
              {awards.items.map((item, i) => (
                <div
                  key={i}
                  data-resume-entry=""
                  style={{
                    marginBottom: i < awards.items.length - 1 ? 8 : 0,
                    fontFamily: "var(--resume-font)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div>
                      <span style={{ fontSize: "calc(var(--resume-body-size) + 1pt)", fontWeight: 700, color: "#111" }}>{item.title}</span>
                      {item.issuer && <span style={{ fontSize: "var(--resume-body-size)", color: "#555" }}> – {item.issuer}</span>}
                    </div>
                    {item.date && <span style={{ fontSize: "var(--resume-body-size)", color: "#9CA3AF", whiteSpace: "nowrap", marginLeft: 12 }}>{formatDate(item.date)}</span>}
                  </div>
                  {item.description && <p style={{ margin: "2px 0 0 0", fontSize: "var(--resume-body-size)", color: "#374151", lineHeight: "var(--resume-line-spacing)" }}>{item.description}</p>}
                </div>
              ))}
            </>
          ))}
        </div>
      ) : null,

    projects: () =>
      projects.items.length > 0 ? (
        <div key="projects">
          {renderSectionRow("Projects", (
            <>
              {projects.items.map((item, i) => (
                <div
                  key={i}
                  data-resume-entry=""
                  style={{
                    marginBottom: i < projects.items.length - 1 ? 12 : 0,
                    fontFamily: "var(--resume-font)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div>
                      <span style={{ fontSize: "calc(var(--resume-body-size) + 1pt)", fontWeight: 700, color: "#111" }}>{item.name}</span>
                      {item.url && <span style={{ fontSize: "var(--resume-body-size)", color: "#9CA3AF", marginLeft: 8 }}>{item.url}</span>}
                    </div>
                    <span style={{ fontSize: "var(--resume-body-size)", color: "#9CA3AF", whiteSpace: "nowrap", marginLeft: 12 }}>{renderDateRange(item.startDate, item.endDate)}</span>
                  </div>
                  {item.bullets.filter(Boolean).length > 0 && (
                    <ul style={{ margin: "4px 0 0 0", paddingLeft: bulletChar ? "16px" : "0", listStyle: "none", fontSize: "var(--resume-body-size)", lineHeight: "var(--resume-line-spacing)", color: "#374151" }}>
                      {item.bullets.filter(Boolean).map((bullet, j) => (
                        <li key={j} data-resume-bullet="" style={{ marginBottom: 2 }}>
                          {bulletChar && <span style={{ marginRight: "6px" }}>{bulletChar}</span>}
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </>
          ))}
        </div>
      ) : null,

    volunteering: () =>
      volunteering.items.length > 0 ? (
        <div key="volunteering">
          {renderSectionRow("Volunteering", (
            <>
              {volunteering.items.map((item, i) => (
                <div
                  key={i}
                  data-resume-entry=""
                  style={{
                    marginBottom: i < volunteering.items.length - 1 ? 12 : 0,
                    fontFamily: "var(--resume-font)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div style={{ fontSize: "calc(var(--resume-body-size) + 1pt)", fontWeight: 700, color: "#111" }}>
                      {item.role}{item.organization ? ` at ${item.organization}` : ""}
                    </div>
                    <span style={{ fontSize: "var(--resume-body-size)", color: "#9CA3AF", whiteSpace: "nowrap", marginLeft: 12 }}>{renderDateRange(item.startDate, item.endDate)}</span>
                  </div>
                  {item.bullets.filter(Boolean).length > 0 && (
                    <ul style={{ margin: "4px 0 0 0", paddingLeft: bulletChar ? "16px" : "0", listStyle: "none", fontSize: "var(--resume-body-size)", lineHeight: "var(--resume-line-spacing)", color: "#374151" }}>
                      {item.bullets.filter(Boolean).map((bullet, j) => (
                        <li key={j} data-resume-bullet="" style={{ marginBottom: 2 }}>
                          {bulletChar && <span style={{ marginRight: "6px" }}>{bulletChar}</span>}
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </>
          ))}
        </div>
      ) : null,

    publications: () =>
      publications.items.length > 0 ? (
        <div key="publications">
          {renderSectionRow("Publications", (
            <>
              {publications.items.map((item, i) => (
                <div
                  key={i}
                  data-resume-entry=""
                  style={{
                    marginBottom: i < publications.items.length - 1 ? 8 : 0,
                    fontFamily: "var(--resume-font)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div>
                      <span style={{ fontSize: "calc(var(--resume-body-size) + 1pt)", fontWeight: 700, color: "#111" }}>{item.title}</span>
                      {item.publisher && <span style={{ fontSize: "var(--resume-body-size)", color: "#555" }}> – {item.publisher}</span>}
                    </div>
                    {item.date && <span style={{ fontSize: "var(--resume-body-size)", color: "#9CA3AF", whiteSpace: "nowrap", marginLeft: 12 }}>{formatDate(item.date)}</span>}
                  </div>
                  {item.url && <div style={{ fontSize: "calc(var(--resume-body-size) - 1pt)", color: "#9CA3AF" }}>{item.url}</div>}
                </div>
              ))}
            </>
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
        color: "#374151",
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
