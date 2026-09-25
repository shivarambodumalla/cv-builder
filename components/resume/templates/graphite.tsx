import type { TemplateProps } from "./classic";
import { SkillsItems } from "./skills-renderer";

// Graphite — "black and white simple". A light grey canvas carrying one white
// rounded card; every section sits under a full-width grey pill heading.
export function Graphite({
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

  const canvasBg = "#ececec";
  const cardBg = "#ffffff";
  const nameColor = "#2d3440";
  const headingText = "#333333";
  const contactText = "#333333";
  const bodyText = "#222222";
  const mutedText = "#666666";
  const pillBg = "color-mix(in srgb, var(--resume-accent) 12%, #d9d9d9)";
  const headerAlign = design.headerAlignment || "left";
  const paperHeight = design.paperSize === "letter" ? "11in" : "297mm";

  // Sized against the Design-tab variables so Name / Body / Heading size scale it.
  const nameSize = "calc(var(--resume-name-size) + 2pt)"; // 26pt at default
  const titleSize = "calc(var(--resume-body-size) + 3pt)"; // 13pt at default
  const pillTextSize = "calc(var(--resume-heading-size) + 2pt)"; // 11pt at default
  const bodySize = "var(--resume-body-size)";
  const leading = "var(--resume-line-spacing)";

  const contactItems = [
    contact.location,
    contact.phone,
    contact.email,
    contact.linkedin,
    contact.website,
  ].filter(Boolean);

  const renderDateRange = (start: string, end: string, isCurrent?: boolean) => {
    const s = formatDate(start);
    const e = isCurrent ? "Present" : formatDate(end);
    if (!s && !e) return "";
    return s && e ? `${s} – ${e}` : s || e;
  };

  const sectionHeading = (title: string) => (
    <div
      data-resume-section-title=""
      style={{
        display: "flex",
        alignItems: "center",
        minHeight: 26,
        padding: "3px 26px",
        boxSizing: "border-box",
        borderRadius: 999,
        background: pillBg,
        fontFamily: "var(--resume-font)",
        fontSize: pillTextSize,
        fontWeight: "var(--resume-heading-weight)" as unknown as number,
        fontStyle: "italic",
        textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
        letterSpacing: "0.02em",
        lineHeight: 1.2,
        color: headingText,
        marginBottom: 10,
      }}
    >
      {title}
    </div>
  );

  // Line 1 of an entry: bold title on the left, bold dates opening the second column.
  const entryLine = (title: string, dates: string) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "48% 1fr",
        columnGap: 8,
        alignItems: "baseline",
        fontFamily: "var(--resume-font)",
        fontSize: bodySize,
        lineHeight: leading,
        fontWeight: 700,
        color: bodyText,
      }}
    >
      <div>{title}</div>
      <div style={{ whiteSpace: "nowrap" }}>{dates}</div>
    </div>
  );

  const mutedLine = (text: string) => (
    <div
      style={{
        fontFamily: "var(--resume-font)",
        fontSize: bodySize,
        lineHeight: leading,
        color: mutedText,
      }}
    >
      {text}
    </div>
  );

  const renderBullets = (bullets: string[]) => {
    const filtered = bullets.filter(Boolean);
    if (filtered.length === 0) return null;
    return (
      <ul
        style={{
          margin: "3px 0 0 0",
          padding: 0,
          listStyle: "none",
          fontFamily: "var(--resume-font)",
          fontSize: bodySize,
          lineHeight: leading,
          color: bodyText,
        }}
      >
        {filtered.map((bullet, j) => (
          <li
            key={j}
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              marginBottom: 1,
            }}
          >
            {bulletChar && (
              <span
                style={{
                  flexShrink: 0,
                  width: 10,
                  textAlign: "center",
                  fontSize: "calc(var(--resume-body-size) - 2pt)",
                  lineHeight: leading,
                  color: bodyText,
                }}
              >
                {bulletChar}
              </span>
            )}
            <span style={{ flex: 1, minWidth: 0 }}>{bullet}</span>
          </li>
        ))}
      </ul>
    );
  };

  // Compact "Name — issuer" lines (certifications, awards, publications).
  const compactLine = (
    key: number,
    name: string,
    detail: string,
    date: string,
    extra?: string
  ) => (
    <div
      key={key}
      data-resume-entry=""
      style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
        fontFamily: "var(--resume-font)",
        fontSize: bodySize,
        lineHeight: leading,
        color: bodyText,
        marginBottom: 3,
      }}
    >
      {bulletChar && (
        <span
          style={{
            flexShrink: 0,
            width: 10,
            textAlign: "center",
            fontSize: "calc(var(--resume-body-size) - 2pt)",
            lineHeight: leading,
          }}
        >
          {bulletChar}
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontWeight: 700 }}>{name}</span>
        {detail && <span> — {detail}</span>}
        {date && <span style={{ color: mutedText }}> · {date}</span>}
        {extra && <div style={{ color: mutedText }}>{extra}</div>}
      </div>
    </div>
  );

  const skillsStyle = design.skillsStyle ?? "inline";
  const hasNamedCategories = skills.categories.some((c) => !!c.name);

  const skillsGrid = (items: string[]) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        columnGap: 12,
        rowGap: 2,
        fontFamily: "var(--resume-font)",
        fontSize: bodySize,
        lineHeight: leading,
        color: bodyText,
      }}
    >
      {items.map((skill, i) => (
        <div key={i}>{skill}</div>
      ))}
    </div>
  );

  const renderSkills = () => {
    if (skillsStyle !== "inline") {
      return (
        <SkillsItems
          categories={skills.categories}
          skillsStyle={skillsStyle}
          bulletChar={bulletChar}
          accentColor={design.accentColor as string}
          labelColor={bodyText}
          textColor={bodyText}
        />
      );
    }
    if (!hasNamedCategories) {
      return skillsGrid(skills.categories.flatMap((c) => c.skills).filter(Boolean));
    }
    return skills.categories.map((cat, i) => (
      <div key={i} style={{ marginBottom: i < skills.categories.length - 1 ? 6 : 0 }}>
        {cat.name && (
          <div
            style={{
              fontFamily: "var(--resume-font)",
              fontSize: bodySize,
              lineHeight: leading,
              fontWeight: 700,
              color: bodyText,
              marginBottom: 1,
            }}
          >
            {cat.name}
          </div>
        )}
        {skillsGrid(cat.skills.filter(Boolean))}
      </div>
    ));
  };

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    contact: () => null, // Rendered in the header block
    targetTitle: () => null, // Rendered in the header block

    summary: () =>
      summary.content ? (
        <div key="summary">
          {sectionHeading("Summary")}
          <p
            style={{
              fontFamily: "var(--resume-font)",
              fontSize: bodySize,
              lineHeight: leading,
              color: bodyText,
              textAlign: "justify",
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
          {sectionHeading("Experience")}
          {experience.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{ marginBottom: i < experience.items.length - 1 ? 14 : 0 }}
            >
              {entryLine(
                [item.role, item.company].filter(Boolean).join(", "),
                renderDateRange(item.startDate, item.endDate, item.isCurrent)
              )}
              {item.location && mutedLine(item.location)}
              {renderBullets(item.bullets)}
            </div>
          ))}
        </div>
      ) : null,

    education: () =>
      education.items.length > 0 ? (
        <div key="education">
          {sectionHeading("Education")}
          {education.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{ marginBottom: i < education.items.length - 1 ? 10 : 0 }}
            >
              {entryLine(
                [item.degree, item.field].filter(Boolean).join(" in "),
                renderDateRange(item.startDate, item.endDate)
              )}
              {item.institution && mutedLine(item.institution)}
            </div>
          ))}
        </div>
      ) : null,

    skills: () =>
      skills.categories.length > 0 ? (
        <div key="skills">
          {sectionHeading("Skills")}
          {renderSkills()}
        </div>
      ) : null,

    certifications: () =>
      certifications.items.length > 0 ? (
        <div key="certifications">
          {sectionHeading("Certifications")}
          {certifications.items.map((item, i) =>
            compactLine(
              i,
              item.name,
              item.issuer,
              renderDateRange(item.startDate, item.endDate, item.isCurrent)
            )
          )}
        </div>
      ) : null,

    awards: () =>
      awards.items.length > 0 ? (
        <div key="awards">
          {sectionHeading("Awards")}
          {awards.items.map((item, i) =>
            compactLine(i, item.title, item.issuer, formatDate(item.date), item.description)
          )}
        </div>
      ) : null,

    projects: () =>
      projects.items.length > 0 ? (
        <div key="projects">
          {sectionHeading("Projects")}
          {projects.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{ marginBottom: i < projects.items.length - 1 ? 14 : 0 }}
            >
              {entryLine(item.name, renderDateRange(item.startDate, item.endDate))}
              {item.url && mutedLine(item.url)}
              {renderBullets(item.bullets ?? [])}
            </div>
          ))}
        </div>
      ) : null,

    volunteering: () =>
      volunteering.items.length > 0 ? (
        <div key="volunteering">
          {sectionHeading("Volunteering")}
          {volunteering.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{ marginBottom: i < volunteering.items.length - 1 ? 14 : 0 }}
            >
              {entryLine(
                [item.role, item.organization].filter(Boolean).join(", "),
                renderDateRange(item.startDate, item.endDate)
              )}
              {renderBullets(item.bullets ?? [])}
            </div>
          ))}
        </div>
      ) : null,

    publications: () =>
      publications.items.length > 0 ? (
        <div key="publications">
          {sectionHeading("Publications")}
          {publications.items.map((item, i) =>
            compactLine(i, item.title, item.publisher, formatDate(item.date), item.url)
          )}
        </div>
      ) : null,
  };

  const showHeader = visibleSections.includes("contact");
  const showTitle = visibleSections.includes("targetTitle") && !!targetTitle.title;

  const sectionNodes = (design.sectionOrder || [])
    .filter((k) => visibleSections.includes(k as (typeof visibleSections)[number]))
    .filter((k) => k !== "contact" && k !== "targetTitle")
    .map((key) => ({ key, node: sectionRenderers[key]?.() }))
    .filter((x): x is { key: string; node: React.ReactNode } => !!x.node);

  return (
    <div
      style={{
        background: canvasBg,
        padding: 14,
        boxSizing: "border-box",
        minHeight: paperHeight,
        fontFamily: "var(--resume-font)",
        fontSize: bodySize,
        lineHeight: leading,
        color: bodyText,
      }}
    >
      <div
        style={{
          background: cardBg,
          borderRadius: 28,
          padding: `${marginY}in ${marginX}in`,
          boxSizing: "border-box",
          minHeight: `calc(${paperHeight} - 28px)`,
        }}
      >
        {showHeader && (
          <div style={{ textAlign: headerAlign, marginBottom: sectionSpacing }}>
            <div
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: nameSize,
                fontWeight: "var(--resume-name-weight)" as unknown as number,
                textTransform: "uppercase",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                color: nameColor,
              }}
            >
              {contact.name}
            </div>
            {showTitle && (
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: titleSize,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.3,
                  color: nameColor,
                  marginTop: 4,
                }}
              >
                {targetTitle.title}
              </div>
            )}
            {contactItems.length > 0 && (
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: bodySize,
                  lineHeight: leading,
                  color: contactText,
                  marginTop: 6,
                }}
              >
                {contactItems.join(contactSeparator)}
              </div>
            )}
          </div>
        )}

        {sectionNodes.map(({ key, node }, i) => {
          const hasPageBreak = pageBreaks.includes(key);
          return (
            <div
              key={key}
              data-resume-section=""
              {...(hasPageBreak ? { "data-page-break-before": "" } : {})}
              style={{
                marginTop: i > 0 ? sectionSpacing : undefined,
                ...(hasPageBreak ? { pageBreakBefore: "always" as const } : {}),
              }}
            >
              {node}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Graphite;
