import type { TemplateProps } from "./classic";

function contactIcon(label: string) {
  switch (label.toLowerCase()) {
    case "email": return <><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></>;
    case "phone": return <><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z"/></>;
    case "location": return <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>;
    case "linkedin": return <><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></>;
    case "website": return <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></>;
    default: return <circle cx="12" cy="12" r="4"/>;
  }
}

export function MetroTemplate({
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
    contact.email && { label: "email", value: contact.email },
    contact.phone && { label: "phone", value: contact.phone },
    contact.location && { label: "location", value: contact.location },
    contact.linkedin && { label: "linkedin", value: contact.linkedin },
    contact.website && { label: "website", value: contact.website },
  ].filter(Boolean) as { label: string; value: string }[];

  const renderSectionHeading = (title: string) => (
    <div
      data-resume-section-title=""
      style={{
        fontFamily: "var(--resume-font)",
        fontSize: "var(--resume-heading-size)",
        fontWeight: "var(--resume-heading-weight)" as unknown as number,
        textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
        color: "#111",
        marginBottom: "8px",
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

  const extractYear = (dateStr: string) => {
    if (!dateStr) return "";
    const m = dateStr.match(/(\d{4})/);
    return m ? m[1] : formatDate(dateStr);
  };

  const renderRule = () => (
    <div
      style={{
        height: "0.5px",
        backgroundColor: "#E2E8F0",
        marginTop: "12px",
        marginBottom: "12px",
      }}
    />
  );

  /* ── Date + Content row (used by education, experience, and other sections) ── */
  const renderDateRow = (
    dateLabel: string,
    primaryNode: React.ReactNode,
    secondaryNode?: React.ReactNode,
    key?: number,
  ) => (
    <div
      key={key}
      data-resume-entry=""
      style={{
        display: "flex",
        gap: "14px",
        marginBottom: "6px",
        fontFamily: "var(--resume-font)",
      }}
    >
      <span
        style={{
          fontSize: "var(--resume-body-size)",
          color: "var(--resume-accent)",
          width: "72px",
          flexShrink: 0,
        }}
      >
        {dateLabel}
      </span>
      <div style={{ flex: 1 }}>
        {primaryNode}
        {secondaryNode}
      </div>
    </div>
  );

  /* ══════════════════════════════════════
     Section renderers
     ══════════════════════════════════════ */

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    contact: () => (
      <div key="contact" style={{ fontFamily: "var(--resume-font)" }}>
        {/* Target title above name */}
        {visibleSections.includes("targetTitle") && targetTitle.title && (
          <div
            style={{
              fontSize: "calc(var(--resume-body-size) + 3pt)",
              fontWeight: 600,
              color: "var(--resume-accent)",
              marginBottom: "4px",
            }}
          >
            {targetTitle.title}
          </div>
        )}

        {/* Name */}
        <div
          style={{
            fontSize: "var(--resume-name-size)",
            fontWeight: "var(--resume-name-weight)" as unknown as number,
            color: "#0F172A",
            letterSpacing: "-0.5px",
            lineHeight: 1,
            marginBottom: "12px",
          }}
        >
          {contact.name}
        </div>

        {/* Contact items vertically listed with icon dots */}
        {contactItems.length > 0 && (
          <div>
            {contactItems.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "5px",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--resume-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  {contactIcon(item.label)}
                </svg>
                <span
                  style={{
                    fontSize: "var(--resume-body-size)",
                    color: "#374151",
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    ),

    /* targetTitle is rendered inline inside contact; skip standalone */
    targetTitle: () => null,

    summary: () => {
      if (!summary.content) return null;
      const allSkills = skills.categories.flatMap((cat) => cat.skills);
      const fewSkills = allSkills.length > 0 && allSkills.length <= 12 && visibleSections.includes("skills");

      if (fewSkills) {
        // Two-column: summary left, skills right
        return (
          <div key="summary">
            {renderRule()}
            <div style={{ display: "flex", gap: "24px" }}>
              {/* Summary — left */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {renderSectionHeading("Profile")}
                <p
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: "var(--resume-body-size)",
                    color: "#374151",
                    lineHeight: "var(--resume-line-spacing)",
                    margin: 0,
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {summary.content}
                </p>
              </div>
              {/* Skills — right */}
              <div style={{ width: "38%", flexShrink: 0 }}>
                {renderSectionHeading("Skills")}
                <div style={{ fontFamily: "var(--resume-font)" }}>
                  {allSkills.map((skill, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        marginBottom: "5px",
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "4px",
                          border: "1.5px solid var(--resume-accent)",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: "var(--resume-body-size)",
                          color: "#374151",
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                        }}
                      >
                        {skill}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div key="summary">
          {renderRule()}
          <p
            style={{
              fontFamily: "var(--resume-font)",
              fontSize: "var(--resume-body-size)",
              color: "#374151",
              lineHeight: "var(--resume-line-spacing)",
              margin: 0,
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            {summary.content}
          </p>
        </div>
      );
    },

    skills: () => {
      if (skills.categories.length === 0) return null;
      const allSkills = skills.categories.flatMap((cat) => cat.skills);

      // If few skills + summary exists, skills are rendered inside summary section
      if (allSkills.length <= 12 && summary.content && visibleSections.includes("summary")) {
        return null;
      }

      return (
        <div key="skills">
          {renderRule()}
          {renderSectionHeading("Skills")}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0 24px", fontFamily: "var(--resume-font)" }}>
            {allSkills.map((skill, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginBottom: "5px",
                  width: "calc(50% - 12px)",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "4px",
                    border: "1.5px solid var(--resume-accent)",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "var(--resume-body-size)",
                    color: "#374151",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {skill}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    },

    education: () => {
      if (education.items.length === 0) return null;
      return (
        <div key="education">
          {renderRule()}
          {renderSectionHeading("Education")}
          {education.items.map((item, i) => {
            const startYear = extractYear(item.startDate);
            const endYear = extractYear(item.endDate);
            const dateLabel =
              startYear && endYear
                ? `${startYear} \u2014 ${endYear}`
                : startYear || endYear || "";

            return renderDateRow(
              dateLabel,
              <div
                style={{
                  fontSize: "calc(var(--resume-body-size) + 1pt)",
                  fontWeight: 700,
                  color: "#111",
                }}
              >
                {item.institution}
              </div>,
              (item.degree || item.field) && (
                <div
                  style={{
                    fontSize: "var(--resume-body-size)",
                    color: "#555",
                  }}
                >
                  {item.degree}
                  {item.field ? ` in ${item.field}` : ""}
                </div>
              ),
              i,
            );
          })}
        </div>
      );
    },

    experience: () => {
      if (experience.items.length === 0) return null;
      return (
        <div key="experience">
          {renderRule()}
          {renderSectionHeading("Employment")}
          {experience.items.map((item, i) => {
            const dateStr = renderDateRange(
              item.startDate,
              item.endDate,
              item.isCurrent,
            );

            return (
              <div
                key={i}
                data-resume-entry=""
                style={{
                  marginBottom:
                    i < experience.items.length - 1
                      ? `${sectionSpacing * 0.7}px`
                      : 0,
                  fontFamily: "var(--resume-font)",
                }}
              >
                {/* Top row: dates + role + company */}
                <div style={{ display: "flex", gap: "14px" }}>
                  <span
                    style={{
                      fontSize: "var(--resume-body-size)",
                      color: "var(--resume-accent)",
                      width: "72px",
                      flexShrink: 0,
                    }}
                  >
                    {dateStr}
                  </span>
                  <div>
                    <span
                      style={{
                        fontSize: "calc(var(--resume-body-size) + 1pt)",
                        fontWeight: 700,
                        color: "#111",
                      }}
                    >
                      {item.role}
                    </span>
                    {item.company && (
                      <span
                        style={{
                          fontSize: "var(--resume-body-size)",
                          color: "#555",
                          marginLeft: "6px",
                        }}
                      >
                        {item.company}
                      </span>
                    )}
                    {item.location && (
                      <span
                        style={{
                          fontSize: "var(--resume-body-size)",
                          color: "#777",
                          marginLeft: "6px",
                        }}
                      >
                        {item.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bullets */}
                {item.bullets.filter(Boolean).length > 0 && (
                  <ul
                    style={{
                      margin: "4px 0 0 86px",
                      paddingLeft: bulletChar ? "14px" : "0",
                      listStyle: "none",
                      fontSize: "var(--resume-body-size)",
                      lineHeight: "var(--resume-line-spacing)",
                      color: "#374151",
                      fontFamily: "var(--resume-font)",
                    }}
                  >
                    {item.bullets.filter(Boolean).map((bullet, j) => (
                      <li key={j} data-resume-bullet="" style={{ marginBottom: "2px" }}>
                        {bulletChar && <span style={{ marginRight: "6px" }}>{bulletChar}</span>}
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      );
    },

    projects: () => {
      if (projects.items.length === 0) return null;
      return (
        <div key="projects">
          {renderRule()}
          {renderSectionHeading("Projects")}
          {projects.items.map((item, i) => {
            const dateStr = renderDateRange(item.startDate, item.endDate);
            return (
              <div
                key={i}
                data-resume-entry=""
                style={{
                  marginBottom:
                    i < projects.items.length - 1
                      ? `${sectionSpacing * 0.7}px`
                      : 0,
                  fontFamily: "var(--resume-font)",
                }}
              >
                <div style={{ display: "flex", gap: "14px" }}>
                  <span
                    style={{
                      fontSize: "var(--resume-body-size)",
                      color: "var(--resume-accent)",
                      width: "72px",
                      flexShrink: 0,
                    }}
                  >
                    {dateStr}
                  </span>
                  <div>
                    <span
                      style={{
                        fontSize: "calc(var(--resume-body-size) + 1pt)",
                        fontWeight: 700,
                        color: "#111",
                      }}
                    >
                      {item.name}
                    </span>
                    {item.url && (
                      <span
                        style={{
                          fontSize: "var(--resume-body-size)",
                          color: "#777",
                          marginLeft: "6px",
                        }}
                      >
                        {item.url}
                      </span>
                    )}
                  </div>
                </div>
                {item.bullets.filter(Boolean).length > 0 && (
                  <ul
                    style={{
                      margin: "4px 0 0 86px",
                      paddingLeft: bulletChar ? "14px" : "0",
                      listStyle: "none",
                      fontSize: "var(--resume-body-size)",
                      lineHeight: "var(--resume-line-spacing)",
                      color: "#374151",
                      fontFamily: "var(--resume-font)",
                    }}
                  >
                    {item.bullets.filter(Boolean).map((bullet, j) => (
                      <li key={j} data-resume-bullet="" style={{ marginBottom: "2px" }}>
                        {bulletChar && <span style={{ marginRight: "6px" }}>{bulletChar}</span>}
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      );
    },

    volunteering: () => {
      if (volunteering.items.length === 0) return null;
      return (
        <div key="volunteering">
          {renderRule()}
          {renderSectionHeading("Volunteering")}
          {volunteering.items.map((item, i) => {
            const dateStr = renderDateRange(item.startDate, item.endDate);
            return (
              <div
                key={i}
                data-resume-entry=""
                style={{
                  marginBottom:
                    i < volunteering.items.length - 1
                      ? `${sectionSpacing * 0.7}px`
                      : 0,
                  fontFamily: "var(--resume-font)",
                }}
              >
                <div style={{ display: "flex", gap: "14px" }}>
                  <span
                    style={{
                      fontSize: "var(--resume-body-size)",
                      color: "var(--resume-accent)",
                      width: "72px",
                      flexShrink: 0,
                    }}
                  >
                    {dateStr}
                  </span>
                  <div>
                    <span
                      style={{
                        fontSize: "calc(var(--resume-body-size) + 1pt)",
                        fontWeight: 700,
                        color: "#111",
                      }}
                    >
                      {item.role}
                    </span>
                    {item.organization && (
                      <span
                        style={{
                          fontSize: "var(--resume-body-size)",
                          color: "#555",
                          marginLeft: "6px",
                        }}
                      >
                        {item.organization}
                      </span>
                    )}
                  </div>
                </div>
                {item.bullets.filter(Boolean).length > 0 && (
                  <ul
                    style={{
                      margin: "4px 0 0 86px",
                      paddingLeft: bulletChar ? "14px" : "0",
                      listStyle: "none",
                      fontSize: "var(--resume-body-size)",
                      lineHeight: "var(--resume-line-spacing)",
                      color: "#374151",
                      fontFamily: "var(--resume-font)",
                    }}
                  >
                    {item.bullets.filter(Boolean).map((bullet, j) => (
                      <li key={j} data-resume-bullet="" style={{ marginBottom: "2px" }}>
                        {bulletChar && <span style={{ marginRight: "6px" }}>{bulletChar}</span>}
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      );
    },

    certifications: () => {
      if (certifications.items.length === 0) return null;
      return (
        <div key="certifications">
          {renderRule()}
          {renderSectionHeading("Certifications")}
          {certifications.items.map((item, i) => {
            const dateStr = renderDateRange(
              item.startDate,
              item.endDate,
              item.isCurrent,
            );
            return renderDateRow(
              dateStr || "",
              <div
                style={{
                  fontSize: "calc(var(--resume-body-size) + 1pt)",
                  fontWeight: 700,
                  color: "#111",
                }}
              >
                {item.name}
              </div>,
              item.issuer ? (
                <div
                  style={{
                    fontSize: "var(--resume-body-size)",
                    color: "#555",
                  }}
                >
                  {item.issuer}
                </div>
              ) : undefined,
              i,
            );
          })}
        </div>
      );
    },

    awards: () => {
      if (awards.items.length === 0) return null;
      return (
        <div key="awards">
          {renderRule()}
          {renderSectionHeading("Awards")}
          {awards.items.map((item, i) => {
            const dateStr = item.date ? formatDate(item.date) : "";
            return renderDateRow(
              dateStr,
              <div>
                <div
                  style={{
                    fontSize: "calc(var(--resume-body-size) + 1pt)",
                    fontWeight: 700,
                    color: "#111",
                  }}
                >
                  {item.title}
                </div>
                {item.issuer && (
                  <div
                    style={{
                      fontSize: "var(--resume-body-size)",
                      color: "#555",
                    }}
                  >
                    {item.issuer}
                  </div>
                )}
              </div>,
              item.description ? (
                <div
                  style={{
                    fontSize: "var(--resume-body-size)",
                    color: "#374151",
                    lineHeight: "var(--resume-line-spacing)",
                    marginTop: "2px",
                  }}
                >
                  {item.description}
                </div>
              ) : undefined,
              i,
            );
          })}
        </div>
      );
    },

    publications: () => {
      if (publications.items.length === 0) return null;
      return (
        <div key="publications">
          {renderRule()}
          {renderSectionHeading("Publications")}
          {publications.items.map((item, i) => {
            const dateStr = item.date ? formatDate(item.date) : "";
            return renderDateRow(
              dateStr,
              <div>
                <div
                  style={{
                    fontSize: "calc(var(--resume-body-size) + 1pt)",
                    fontWeight: 700,
                    color: "#111",
                  }}
                >
                  {item.title}
                </div>
                {item.publisher && (
                  <div
                    style={{
                      fontSize: "var(--resume-body-size)",
                      color: "#555",
                    }}
                  >
                    {item.publisher}
                  </div>
                )}
              </div>,
              item.url ? (
                <div
                  style={{
                    fontSize: "calc(var(--resume-body-size) - 1pt)",
                    color: "#777",
                    marginTop: "2px",
                  }}
                >
                  {item.url}
                </div>
              ) : undefined,
              i,
            );
          })}
        </div>
      );
    },
  };

  /* ── Render ── */
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
              marginTop:
                i > 0 && key !== "targetTitle"
                  ? `${sectionSpacing}px`
                  : undefined,
              ...(hasPageBreak
                ? { pageBreakBefore: "always" as const }
                : {}),
            }}
          >
            {node}
          </div>
        );
      })}
    </div>
  );
}
