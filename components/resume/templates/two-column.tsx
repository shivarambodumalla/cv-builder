import type { TemplateProps } from "./classic";

export function TwoColumnTemplate({
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

  const renderDateRange = (start: string, end: string, isCurrent?: boolean) => {
    const s = formatDate(start);
    const e = isCurrent ? "Present" : formatDate(end);
    if (!s && !e) return null;
    return s && e ? `${s} – ${e}` : s || e;
  };

  const contactFields = [
    { label: "Email", value: contact.email },
    { label: "LinkedIn", value: contact.linkedin },
    { label: "Phone", value: contact.phone },
    { label: "Location", value: contact.location },
    { label: "Website", value: contact.website },
  ].filter((f) => f.value);

  const sectionHeading = (title: string, style?: React.CSSProperties) => (
    <div
      data-resume-section-title=""
      style={{
        fontSize: "var(--resume-heading-size)",
        fontWeight: "var(--resume-heading-weight)" as unknown as number,
        textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
        color: "var(--resume-accent)",
        marginBottom: 10,
        fontFamily: "var(--resume-font)",
        ...style,
      }}
    >
      {title}
    </div>
  );

  const allSkills = skills.categories.flatMap((cat) => cat.skills);

  type LeftSectionKey = "experience" | "projects" | "volunteering" | "awards" | "publications";

  const renderExperience = () =>
    visibleSections.includes("experience") && experience.items.length > 0 ? (
      <div style={{ marginBottom: `${sectionSpacing}px` }}>
        {sectionHeading("Work Experience")}
        {experience.items.map((item, i) => (
          <div key={i} data-resume-entry="" style={{ marginBottom: i < experience.items.length - 1 ? `${sectionSpacing * 0.7}px` : 0 }}>
            <div style={{ fontSize: "calc(var(--resume-body-size) + 1pt)", fontWeight: 700, color: "#1a1a1a", fontFamily: "var(--resume-font)" }}>
              {item.role}
            </div>
            <div style={{ fontSize: "var(--resume-body-size)", color: "#888888", marginBottom: 4, fontFamily: "var(--resume-font)" }}>
              {item.company}{item.location ? `, ${item.location}` : ""}{item.startDate || item.endDate ? ` · ${renderDateRange(item.startDate, item.endDate, item.isCurrent)}` : ""}
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
                    {bulletChar && <span style={{ color: "var(--resume-accent)", marginRight: "6px" }}>{bulletChar}</span>}
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    ) : null;

  const renderProjects = () =>
    visibleSections.includes("projects") && projects.items.length > 0 ? (
      <div style={{ marginBottom: `${sectionSpacing}px` }}>
        {sectionHeading("Projects")}
        {projects.items.map((item, i) => (
          <div key={i} data-resume-entry="" style={{ marginBottom: i < projects.items.length - 1 ? `${sectionSpacing * 0.7}px` : 0 }}>
            <div style={{ fontSize: "calc(var(--resume-body-size) + 1pt)", fontWeight: 700, color: "#1a1a1a", fontFamily: "var(--resume-font)" }}>
              {item.name}
            </div>
            <div style={{ fontSize: "var(--resume-body-size)", color: "#888888", marginBottom: 4, fontFamily: "var(--resume-font)" }}>
              {renderDateRange(item.startDate, item.endDate)}
              {item.url ? ` · ${item.url}` : ""}
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
                    {bulletChar && <span style={{ color: "var(--resume-accent)", marginRight: "6px" }}>{bulletChar}</span>}
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    ) : null;

  const renderVolunteering = () =>
    visibleSections.includes("volunteering") && volunteering.items.length > 0 ? (
      <div style={{ marginBottom: `${sectionSpacing}px` }}>
        {sectionHeading("Volunteering")}
        {volunteering.items.map((item, i) => (
          <div key={i} data-resume-entry="" style={{ marginBottom: i < volunteering.items.length - 1 ? `${sectionSpacing * 0.7}px` : 0 }}>
            <div style={{ fontSize: "calc(var(--resume-body-size) + 1pt)", fontWeight: 700, color: "#1a1a1a", fontFamily: "var(--resume-font)" }}>
              {item.role}
            </div>
            <div style={{ fontSize: "var(--resume-body-size)", color: "#888888", marginBottom: 4, fontFamily: "var(--resume-font)" }}>
              {item.organization}{item.startDate || item.endDate ? ` · ${renderDateRange(item.startDate, item.endDate)}` : ""}
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
                    {bulletChar && <span style={{ color: "var(--resume-accent)", marginRight: "6px" }}>{bulletChar}</span>}
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    ) : null;

  const renderAwards = () =>
    visibleSections.includes("awards") && awards.items.length > 0 ? (
      <div style={{ marginBottom: `${sectionSpacing}px` }}>
        {sectionHeading("Awards")}
        {awards.items.map((item, i) => (
          <div key={i} data-resume-entry="" style={{ marginBottom: i < awards.items.length - 1 ? "8px" : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: "var(--resume-font)" }}>
              <div>
                <span style={{ fontSize: "calc(var(--resume-body-size) + 1pt)", fontWeight: 700, color: "#1a1a1a" }}>{item.title}</span>
                {item.issuer && <span style={{ fontSize: "var(--resume-body-size)", color: "#555" }}> - {item.issuer}</span>}
              </div>
              {item.date && (
                <div style={{ fontSize: "var(--resume-body-size)", color: "#555", whiteSpace: "nowrap", marginLeft: "12px" }}>
                  {formatDate(item.date)}
                </div>
              )}
            </div>
            {item.description && (
              <p style={{ margin: "2px 0 0 0", fontSize: "var(--resume-body-size)", color: "#555", lineHeight: "var(--resume-line-spacing)", fontFamily: "var(--resume-font)" }}>{item.description}</p>
            )}
          </div>
        ))}
      </div>
    ) : null;

  const renderPublications = () =>
    visibleSections.includes("publications") && publications.items.length > 0 ? (
      <div style={{ marginBottom: `${sectionSpacing}px` }}>
        {sectionHeading("Publications")}
        {publications.items.map((item, i) => (
          <div key={i} data-resume-entry="" style={{ marginBottom: i < publications.items.length - 1 ? "8px" : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: "var(--resume-font)" }}>
              <div>
                <span style={{ fontSize: "calc(var(--resume-body-size) + 1pt)", fontWeight: 700, color: "#1a1a1a" }}>{item.title}</span>
                {item.publisher && <span style={{ fontSize: "var(--resume-body-size)", color: "#555" }}> - {item.publisher}</span>}
              </div>
              {item.date && (
                <div style={{ fontSize: "var(--resume-body-size)", color: "#555", whiteSpace: "nowrap", marginLeft: "12px" }}>
                  {formatDate(item.date)}
                </div>
              )}
            </div>
            {item.url && (
              <div style={{ fontSize: "calc(var(--resume-body-size) - 1pt)", color: "#777", fontFamily: "var(--resume-font)" }}>{item.url}</div>
            )}
          </div>
        ))}
      </div>
    ) : null;

  const renderEducation = () =>
    visibleSections.includes("education") && education.items.length > 0 ? (
      <div style={{ marginBottom: `${sectionSpacing}px` }}>
        {sectionHeading("Education & Learning")}
        {education.items.map((item, i) => (
          <div key={i} data-resume-entry="" style={{ marginBottom: 9 }}>
            <div style={{ fontSize: "var(--resume-body-size)", fontWeight: 700, color: "#1a1a1a", lineHeight: 1.3, fontFamily: "var(--resume-font)" }}>
              {item.degree}{item.field ? ` in ${item.field}` : ""}
            </div>
            <div style={{ fontSize: "calc(var(--resume-body-size) - 1pt)", color: "#777777", lineHeight: "var(--resume-line-spacing)", fontFamily: "var(--resume-font)" }}>
              {item.institution}
            </div>
            <div style={{ fontSize: "calc(var(--resume-body-size) - 1pt)", color: "#999999", fontFamily: "var(--resume-font)" }}>
              {renderDateRange(item.startDate, item.endDate)}
            </div>
          </div>
        ))}
      </div>
    ) : null;

  const renderCertifications = () =>
    visibleSections.includes("certifications") && certifications.items.length > 0 ? (
      <div style={{ marginBottom: `${sectionSpacing}px` }}>
        {sectionHeading("Certifications")}
        {certifications.items.map((item, i) => (
          <div key={i} data-resume-entry="" style={{ marginBottom: 9 }}>
            <div style={{ fontSize: "var(--resume-body-size)", fontWeight: 700, color: "#1a1a1a", lineHeight: 1.3, fontFamily: "var(--resume-font)" }}>
              {item.name}
            </div>
            <div style={{ fontSize: "calc(var(--resume-body-size) - 1pt)", color: "#777777", fontFamily: "var(--resume-font)" }}>
              {item.issuer}{item.startDate ? `, ${formatDate(item.startDate)}` : ""}
            </div>
          </div>
        ))}
      </div>
    ) : null;

  const renderSkills = () =>
    visibleSections.includes("skills") && allSkills.length > 0 ? (
      <div style={{ marginBottom: `${sectionSpacing}px` }}>
        {sectionHeading("Skills")}
        <div style={{ fontSize: "var(--resume-body-size)", color: "#444444", lineHeight: "var(--resume-line-spacing)", fontFamily: "var(--resume-font)" }}>
          {allSkills.join(" · ")}
        </div>
      </div>
    ) : null;

  const allRenderers: Record<string, () => React.ReactNode> = {
    experience: renderExperience,
    projects: renderProjects,
    volunteering: renderVolunteering,
    awards: renderAwards,
    publications: renderPublications,
    education: renderEducation,
    certifications: renderCertifications,
    skills: renderSkills,
  };

  const DEFAULT_RIGHT = ["education", "certifications", "skills"];
  const rightSectionKeys: string[] = design.sidebarSections ?? DEFAULT_RIGHT;
  const rightSet = new Set(rightSectionKeys);
  const headerKeys = new Set(["contact", "targetTitle", "summary"]);

  const leftOrder = (design.sectionOrder || [])
    .filter((k) => visibleSections.includes(k as typeof visibleSections[number]) && !rightSet.has(k) && !headerKeys.has(k));
  const rightOrder = rightSectionKeys
    .filter((k) => visibleSections.includes(k as typeof visibleSections[number]));

  return (
    <div
      style={{
        fontFamily: "var(--resume-font)",
        fontSize: "var(--resume-body-size)",
        lineHeight: "var(--resume-line-spacing)",
        color: "#333",
      }}
    >
      {/* ── HEADER ── */}
      {visibleSections.includes("contact") && (
        <div
          style={{
            position: "relative",
            padding: `${marginY * 0.6}in ${marginX}in`,
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* Accent background with opacity */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "var(--resume-accent)",
              opacity: 0.1,
            }}
          />

          {/* Left: Name + Title + Summary */}
          <div style={{ flex: 1, position: "relative" }}>
            <div
              style={{
                fontSize: "var(--resume-name-size)",
                fontWeight: "var(--resume-name-weight)" as unknown as number,
                color: "#1a1a1a",
                letterSpacing: -0.5,
                lineHeight: 1.1,
                marginBottom: 4,
                fontFamily: "var(--resume-font)",
              }}
            >
              {contact.name}
            </div>

            {visibleSections.includes("targetTitle") && targetTitle.title && (
              <div
                style={{
                  fontSize: "calc(var(--resume-body-size) + 2pt)",
                  color: "var(--resume-accent)",
                  fontWeight: 600,
                  marginBottom: 8,
                  fontFamily: "var(--resume-font)",
                }}
              >
                {targetTitle.title}
              </div>
            )}

            {visibleSections.includes("summary") && summary.content && (
              <div
                style={{
                  fontSize: "var(--resume-body-size)",
                  color: "#555555",
                  lineHeight: "var(--resume-line-spacing)",
                  fontFamily: "var(--resume-font)",
                }}
              >
                {summary.content}
              </div>
            )}
          </div>

          {/* Right: Contact blocks */}
          {contactFields.length > 0 && (
            <div style={{ width: "25%", flexShrink: 0, position: "relative" }}>
              {contactFields.map((field, i) => (
                <div key={i} style={{ marginBottom: 7 }}>
                  <div
                    style={{
                      fontSize: "calc(var(--resume-body-size) - 2pt)",
                      fontWeight: 700,
                      color: "#888888",
                      textTransform: "uppercase" as const,
                      letterSpacing: 0.8,
                      marginBottom: 1,
                      fontFamily: "var(--resume-font)",
                    }}
                  >
                    {field.label}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--resume-body-size)",
                      color: "var(--resume-accent)",
                      fontWeight: 600,
                      fontFamily: "var(--resume-font)",
                    }}
                  >
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── DIVIDER ── */}
      <hr
        style={{
          border: "none",
          borderTop: "2px solid var(--resume-accent)",
          margin: `0 ${marginX}in`,
        }}
      />

      {/* ── BODY: TWO COLUMNS ── */}
      <div
        style={{
          display: "flex",
          padding: `${marginY * 0.5}in ${marginX}in ${marginY}in`,
          gap: `${marginX * 0.4}in`,
        }}
      >
        {/* LEFT COLUMN — 65% */}
        <div style={{ width: "65%", flexShrink: 0 }}>
          {leftOrder.map((key) => {
            const renderer = allRenderers[key];
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
                style={hasPageBreak ? { pageBreakBefore: "always" as const } : undefined}
              >
                {node || sectionHeading(SECTION_LABELS[key])}
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ flex: 1 }}>
          {rightOrder.map((key) => {
            const renderer = allRenderers[key];
            if (!renderer) return null;
            const node = renderer();
            const SECTION_LABELS: Record<string, string> = { summary: "Summary", experience: "Experience", education: "Education", skills: "Skills", certifications: "Certifications", awards: "Awards", projects: "Projects", volunteering: "Volunteering", publications: "Publications" };
            if (!node && !SECTION_LABELS[key]) return null;
            return <div key={key} data-resume-section="">{node || sectionHeading(SECTION_LABELS[key])}</div>;
          })}
        </div>
      </div>
    </div>
  );
}
