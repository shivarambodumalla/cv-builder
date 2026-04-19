import type { TemplateProps } from "./classic";

export function HarvardTemplate({
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

  const renderSectionTitle = (title: string) => (
    <div
      data-resume-section-title=""
      style={{
        textAlign: "center",
        fontFamily: "var(--resume-font)",
        fontSize: "var(--resume-heading-size)",
        fontWeight: "var(--resume-heading-weight)" as unknown as number,
        textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
        color: "#111",
        marginBottom: 6,
      }}
    >
      {title}
    </div>
  );

  const renderDateRange = (
    start: string,
    end: string,
    isCurrent?: boolean
  ) => {
    const s = formatDate(start);
    const e = isCurrent ? "Present" : formatDate(end);
    if (!s && !e) return null;
    return s && e ? `${s} - ${e}` : s || e;
  };

  const renderBullets = (bullets: string[]) => {
    const filtered = bullets.filter(Boolean);
    if (filtered.length === 0) return null;
    return (
      <ul
        style={{
          margin: "4px 0 0 0",
          paddingLeft: 18,
          listStyle: "none",
          fontFamily: "var(--resume-font)",
          fontSize: "var(--resume-body-size)",
          lineHeight: "var(--resume-line-spacing)",
          color: "#111",
          marginBottom: 2,
        }}
      >
        {filtered.map((bullet, j) => (
          <li key={j}>
            {bulletChar && (
              <span style={{ marginRight: "6px" }}>{bulletChar}</span>
            )}
            {bullet}
          </li>
        ))}
      </ul>
    );
  };

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    contact: () => (
      <div
        key="contact"
        style={{
          fontFamily: "var(--resume-font)",
          textAlign: "center",
        }}
      >
        {/* Name row with horizontal lines on each side */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              flex: 1,
              height: 0,
              borderBottom: "1px solid #111",
            }}
          />
          <div
            style={{
              fontSize: "var(--resume-name-size)",
              fontWeight: "var(--resume-name-weight)" as unknown as number,
              color: "#111",
              whiteSpace: "nowrap",
            }}
          >
            {contact.name}
          </div>
          <div
            style={{
              flex: 1,
              height: 0,
              borderBottom: "1px solid #111",
            }}
          />
        </div>

        {/* Contact line */}
        {contactItems.length > 0 && (
          <div
            style={{
              fontSize: "var(--resume-body-size)",
              color: "#333",
              marginTop: 6,
              lineHeight: "var(--resume-line-spacing)",
            }}
          >
            {contactItems.join(" \u2022 ")}
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
            textAlign: "center",
            color: "#111",
            marginTop: 4,
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
              color: "#111",
              margin: 0,
            }}
          >
            {summary.content}
          </p>
        </div>
      ) : null,

    education: () =>
      education.items.length > 0 ? (
        <div key="education">
          {renderSectionTitle("Education")}
          {education.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{
                marginBottom:
                  i < education.items.length - 1 ? 8 : 0,
                fontFamily: "var(--resume-font)",
              }}
            >
              {/* Row 1: institution left, date range right */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div
                  style={{
                    fontSize: "calc(var(--resume-body-size) + 0.5pt)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                    color: "#111",
                  }}
                >
                  {item.institution}
                </div>
              </div>
              {/* Row 2: degree + field italic left, date range right */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div
                  style={{
                    fontSize: "var(--resume-body-size)",
                    fontStyle: "italic",
                    color: "#111",
                  }}
                >
                  {item.degree}
                  {item.field ? `, ${item.field}` : ""}
                </div>
                <div
                  style={{
                    fontSize: "var(--resume-body-size)",
                    color: "#111",
                    whiteSpace: "nowrap",
                    marginLeft: 12,
                  }}
                >
                  {renderDateRange(item.startDate, item.endDate)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null,

    experience: () =>
      experience.items.length > 0 ? (
        <div key="experience">
          {renderSectionTitle("Experience")}
          {experience.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{
                marginBottom:
                  i < experience.items.length - 1 ? 10 : 0,
                fontFamily: "var(--resume-font)",
              }}
            >
              {/* Row 1: company bold uppercase left, location right */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div
                  style={{
                    fontSize: "calc(var(--resume-body-size) + 0.5pt)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                    color: "#111",
                  }}
                >
                  {item.company}
                </div>
                {item.location && (
                  <div
                    style={{
                      fontSize: "var(--resume-body-size)",
                      color: "#111",
                      whiteSpace: "nowrap",
                      marginLeft: 12,
                    }}
                  >
                    {item.location}
                  </div>
                )}
              </div>
              {/* Row 2: role italic left, date range right */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div
                  style={{
                    fontSize: "var(--resume-body-size)",
                    fontStyle: "italic",
                    color: "#111",
                  }}
                >
                  {item.role}
                </div>
                <div
                  style={{
                    fontSize: "var(--resume-body-size)",
                    color: "#111",
                    whiteSpace: "nowrap",
                    marginLeft: 12,
                  }}
                >
                  {renderDateRange(
                    item.startDate,
                    item.endDate,
                    item.isCurrent
                  )}
                </div>
              </div>
              {renderBullets(item.bullets)}
            </div>
          ))}
        </div>
      ) : null,

    skills: () => {
      const hasSkills = skills.categories.length > 0;
      const hasCerts = certifications.items.length > 0;
      const hasProjects = projects.items.length > 0;
      if (!hasSkills && !hasCerts && !hasProjects) return null;

      return (
        <div key="skills">
          {renderSectionTitle("Skills & Interests")}
          {skills.categories.map((cat, i) => (
            <div
              key={i}
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-body-size)",
                lineHeight: 1.7,
                color: "#111",
              }}
            >
              <span style={{ fontWeight: 700 }}>{cat.name}: </span>
              <span>{cat.skills.join(", ")}</span>
            </div>
          ))}
          {hasCerts &&
            certifications.items.map((item, i) => (
              <div
                key={`cert-${i}`}
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "var(--resume-body-size)",
                  lineHeight: 1.7,
                  color: "#111",
                }}
              >
                <span style={{ fontWeight: 700 }}>Certifications: </span>
                <span>
                  {item.name}
                  {item.issuer ? ` (${item.issuer})` : ""}
                  {item.startDate
                    ? `, ${renderDateRange(item.startDate, item.endDate, item.isCurrent)}`
                    : ""}
                </span>
              </div>
            ))}
          {hasProjects &&
            projects.items.map((item, i) => (
              <div
                key={`proj-${i}`}
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "var(--resume-body-size)",
                  lineHeight: 1.7,
                  color: "#111",
                }}
              >
                <span style={{ fontWeight: 700 }}>Projects: </span>
                <span>
                  {item.name}
                  {item.url ? ` (${item.url})` : ""}
                </span>
              </div>
            ))}
        </div>
      );
    },

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
                marginBottom: 2,
                color: "#111",
              }}
            >
              <div>
                <span style={{ fontWeight: 700 }}>{item.name}</span>
                {item.issuer && (
                  <span style={{ color: "#333" }}> - {item.issuer}</span>
                )}
              </div>
              <div
                style={{
                  whiteSpace: "nowrap",
                  marginLeft: 12,
                }}
              >
                {renderDateRange(
                  item.startDate,
                  item.endDate,
                  item.isCurrent
                )}
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
                marginBottom: 4,
                color: "#111",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div>
                  <span
                    style={{
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.3,
                    }}
                  >
                    {item.title}
                  </span>
                  {item.issuer && (
                    <span style={{ color: "#333" }}> - {item.issuer}</span>
                  )}
                </div>
                {item.date && (
                  <div
                    style={{
                      whiteSpace: "nowrap",
                      marginLeft: 12,
                    }}
                  >
                    {formatDate(item.date)}
                  </div>
                )}
              </div>
              {item.description && (
                <p style={{ margin: "2px 0 0 0", color: "#333" }}>
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
            <div
              key={i}
              data-resume-entry=""
              style={{
                marginBottom:
                  i < projects.items.length - 1 ? 10 : 0,
                fontFamily: "var(--resume-font)",
              }}
            >
              {/* Row 1: name bold uppercase left, url right */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div
                  style={{
                    fontSize: "calc(var(--resume-body-size) + 0.5pt)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                    color: "#111",
                  }}
                >
                  {item.name}
                </div>
                {item.url && (
                  <div
                    style={{
                      fontSize: "var(--resume-body-size)",
                      color: "#333",
                      whiteSpace: "nowrap",
                      marginLeft: 12,
                    }}
                  >
                    {item.url}
                  </div>
                )}
              </div>
              {/* Row 2: date range right */}
              {(item.startDate || item.endDate) && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    fontSize: "var(--resume-body-size)",
                    color: "#111",
                  }}
                >
                  {renderDateRange(item.startDate, item.endDate)}
                </div>
              )}
              {renderBullets(item.bullets)}
            </div>
          ))}
        </div>
      ) : null,

    volunteering: () =>
      volunteering.items.length > 0 ? (
        <div key="volunteering">
          {renderSectionTitle("Volunteering")}
          {volunteering.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{
                marginBottom:
                  i < volunteering.items.length - 1 ? 10 : 0,
                fontFamily: "var(--resume-font)",
              }}
            >
              {/* Row 1: organization bold uppercase left */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div
                  style={{
                    fontSize: "calc(var(--resume-body-size) + 0.5pt)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                    color: "#111",
                  }}
                >
                  {item.organization}
                </div>
              </div>
              {/* Row 2: role italic left, date range right */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div
                  style={{
                    fontSize: "var(--resume-body-size)",
                    fontStyle: "italic",
                    color: "#111",
                  }}
                >
                  {item.role}
                </div>
                <div
                  style={{
                    fontSize: "var(--resume-body-size)",
                    color: "#111",
                    whiteSpace: "nowrap",
                    marginLeft: 12,
                  }}
                >
                  {renderDateRange(item.startDate, item.endDate)}
                </div>
              </div>
              {renderBullets(item.bullets)}
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
                marginBottom: 4,
                color: "#111",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div>
                  <span style={{ fontWeight: 700 }}>{item.title}</span>
                  {item.publisher && (
                    <span style={{ color: "#333" }}>
                      {" "}
                      - {item.publisher}
                    </span>
                  )}
                </div>
                {item.date && (
                  <div
                    style={{
                      whiteSpace: "nowrap",
                      marginLeft: 12,
                    }}
                  >
                    {formatDate(item.date)}
                  </div>
                )}
              </div>
              {item.url && (
                <div
                  style={{
                    color: "#333",
                    fontSize: "calc(var(--resume-body-size) - 1pt)",
                  }}
                >
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
        color: "#111",
        padding: `${marginY}in ${marginX}in`,
      }}
    >
      {visibleSections.map((key, i) => {
        const renderer = sectionRenderers[key];
        if (!renderer) return null;
        const node = renderer();
        const SECTION_LABELS: Record<string, string> = { summary: "Summary", experience: "Experience", education: "Education", skills: "Skills", certifications: "Certifications", awards: "Awards", projects: "Projects", volunteering: "Volunteering", publications: "Publications" };
        if (!node && !SECTION_LABELS[key]) return null;
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
            {node || renderSectionTitle(SECTION_LABELS[key])}
          </div>
        );
      })}
    </div>
  );
}
