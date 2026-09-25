import type { TemplateProps } from "./classic";
import { SkillsItems } from "./skills-renderer";

// Fixed sans stack for the name, target title and section headings. The
// reference pairs a sans header with a Times-like serif body, whichever body
// font the Design tab picks.
const SANS = "Inter, Helvetica, Arial, sans-serif";

export function Sterling({
  content,
  design,
  formatDate,
  bulletChar,
  visibleSections,
  sectionSpacing = 18,
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

  const ink = "#111111";
  const rule = "color-mix(in srgb, var(--resume-accent) 60%, #111)";

  const headerAlign = design.headerAlignment ?? "left";
  const paperHeight = design.paperSize === "letter" ? "11in" : "297mm";

  // Size offsets keep the designed look at defaults (name M = 24pt, body M = 10pt,
  // heading M = 9pt) while the Design tab sliders still scale everything.
  const nameSize = "calc(var(--resume-name-size) - 2pt)";
  const titleSize = "calc(var(--resume-body-size) + 3pt)";
  const headingSize = "calc(var(--resume-heading-size) + 5pt)";
  const bodySize = "calc(var(--resume-body-size) + 0.5pt)";

  // The diamond is this template's marker; the generic dot default maps onto it.
  // Dash, arrow and none from the bullet-style picker are honoured as given.
  const bulletMarker = bulletChar === "•" ? "♦" : bulletChar;

  // The small square stands in for the default pipe; other separators pass through.
  const noSep = design.contactSeparator === "none";
  const sep = contactSeparator === " | " ? "▪" : contactSeparator.trim();

  const contactLines = [
    [contact.location, contact.phone],
    [contact.email, contact.linkedin, contact.website],
  ]
    .map((line) => line.filter(Boolean) as string[])
    .filter((line) => line.length > 0);

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
        fontFamily: SANS,
        fontSize: headingSize,
        fontWeight: "var(--resume-heading-weight)" as unknown as number,
        textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
        color: ink,
        lineHeight: 1.2,
        paddingBottom: 3,
        borderBottom: `1.5px solid ${rule}`,
        marginBottom: 14,
      }}
    >
      {title}
    </div>
  );

  const entryHead = (title: string, right: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
      <div style={{ fontWeight: 700, color: ink }}>{title}</div>
      {right && <div style={{ color: ink, whiteSpace: "nowrap", textAlign: "right" }}>{right}</div>}
    </div>
  );

  const entrySub = (text: string, bold = false) =>
    text ? <div style={{ fontWeight: bold ? 700 : 400, color: ink, marginTop: 2 }}>{text}</div> : null;

  const renderBullets = (bullets: string[]) => {
    const filtered = bullets.filter(Boolean);
    if (filtered.length === 0) return null;
    return (
      <ul style={{ margin: "5px 0 0 0", padding: 0, listStyle: "none" }}>
        {filtered.map((bullet, j) => (
          <li
            key={j}
            data-resume-bullet=""
            style={{ display: "flex", gap: 8, marginBottom: 3, paddingLeft: bulletMarker ? 6 : 0 }}
          >
            {bulletMarker && (
              <span style={{ flexShrink: 0, fontSize: bulletMarker === "♦" ? "0.8em" : undefined }}>
                {bulletMarker}
              </span>
            )}
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    );
  };

  const entryList = <T,>(items: T[], render: (item: T) => React.ReactNode, gap = 16) =>
    items.map((item, i) => (
      <div key={i} data-resume-entry="" style={{ marginBottom: i < items.length - 1 ? gap : 0 }}>
        {render(item)}
      </div>
    ));

  const skillsTable = () => (
    <div>
      {skills.categories.map((cat, i) => (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: i < skills.categories.length - 1 ? 3 : 0 }}>
          {cat.name && (
            <div style={{ flex: "0 0 18%", fontWeight: 700, color: ink }}>{cat.name}:</div>
          )}
          <div style={{ flex: 1 }}>{cat.skills.join(", ")}</div>
        </div>
      ))}
    </div>
  );

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    contact: () => null, // Rendered in the header block
    targetTitle: () => null, // Rendered in the header block
    summary: () => null, // Rendered directly beneath the header

    experience: () =>
      experience.items.length > 0 ? (
        <>
          {sectionHeading("Professional Experience")}
          {entryList(experience.items, (item) => (
            <>
              {entryHead(
                [item.company, item.location].filter(Boolean).join(", "),
                renderDateRange(item.startDate, item.endDate, item.isCurrent)
              )}
              {entrySub(item.role, true)}
              {renderBullets(item.bullets)}
            </>
          ))}
        </>
      ) : null,

    education: () =>
      education.items.length > 0 ? (
        <>
          {sectionHeading("Education")}
          {entryList(education.items, (item) => (
            <>
              {entryHead(item.institution, renderDateRange(item.startDate, item.endDate))}
              {entrySub([item.degree, item.field].filter(Boolean).join(" in "))}
            </>
          ), 10)}
        </>
      ) : null,

    skills: () =>
      skills.categories.length > 0 ? (
        <>
          {sectionHeading("Technical Proficiencies")}
          {design.skillsStyle === "chips" || design.skillsStyle === "bullets" ? (
            <SkillsItems
              categories={skills.categories}
              skillsStyle={design.skillsStyle}
              bulletChar={bulletMarker}
              accentColor={design.accentColor as string}
              labelColor={ink}
              textColor={ink}
            />
          ) : (
            skillsTable()
          )}
        </>
      ) : null,

    certifications: () =>
      certifications.items.length > 0 ? (
        <>
          {sectionHeading("Certifications")}
          {entryList(certifications.items, (item) => (
            <>
              {entryHead(item.name, renderDateRange(item.startDate, item.endDate, item.isCurrent))}
              {entrySub(item.issuer)}
            </>
          ), 8)}
        </>
      ) : null,

    awards: () =>
      awards.items.length > 0 ? (
        <>
          {sectionHeading("Awards")}
          {entryList(awards.items, (item) => (
            <>
              {entryHead(item.title, item.date ? formatDate(item.date) : "")}
              {entrySub(item.issuer)}
              {item.description && <p style={{ margin: "3px 0 0 0" }}>{item.description}</p>}
            </>
          ), 8)}
        </>
      ) : null,

    projects: () =>
      projects.items.length > 0 ? (
        <>
          {sectionHeading("Projects")}
          {entryList(projects.items, (item) => (
            <>
              {entryHead(item.name, renderDateRange(item.startDate, item.endDate))}
              {entrySub(item.url)}
              {renderBullets(item.bullets)}
            </>
          ))}
        </>
      ) : null,

    volunteering: () =>
      volunteering.items.length > 0 ? (
        <>
          {sectionHeading("Volunteering")}
          {entryList(volunteering.items, (item) => (
            <>
              {entryHead(item.organization, renderDateRange(item.startDate, item.endDate))}
              {entrySub(item.role, true)}
              {renderBullets(item.bullets)}
            </>
          ))}
        </>
      ) : null,

    publications: () =>
      publications.items.length > 0 ? (
        <>
          {sectionHeading("Publications")}
          {entryList(publications.items, (item) => (
            <>
              {entryHead(item.title, item.date ? formatDate(item.date) : "")}
              {entrySub([item.publisher, item.url].filter(Boolean).join(" — "))}
            </>
          ), 8)}
        </>
      ) : null,
  };

  const sectionNodes = (design.sectionOrder || [])
    .filter((k) => visibleSections.includes(k as (typeof visibleSections)[number]))
    .map((key) => ({ key, node: sectionRenderers[key]?.() }))
    .filter((x): x is { key: string; node: React.ReactNode } => !!x.node);

  const showHeader = visibleSections.includes("contact");
  const showTitle = visibleSections.includes("targetTitle") && !!targetTitle.title;
  const showSummary = visibleSections.includes("summary") && !!summary.content;

  const stacked = headerAlign === "center";
  const mirrored = headerAlign === "right";

  const contactBlock = contactLines.length > 0 && (
    <div
      style={{
        textAlign: stacked ? "center" : mirrored ? "left" : "right",
        color: ink,
        lineHeight: 1.45,
        paddingTop: stacked ? 6 : 4,
        flexShrink: 0,
      }}
    >
      {contactLines.map((line, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: stacked ? "center" : mirrored ? "flex-start" : "flex-end",
            flexWrap: "wrap",
            columnGap: noSep ? 14 : 0,
          }}
        >
          {line.map((item, j) => (
            <span key={j}>
              {item}
              {!noSep && j < line.length - 1 && (
                <span style={{ margin: "0 7px", fontSize: sep === "▪" ? "0.7em" : undefined }}>{sep}</span>
              )}
            </span>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div
      data-template="sterling"
      style={{
        background: "#ffffff",
        fontFamily: "var(--resume-font)",
        fontSize: bodySize,
        lineHeight: "var(--resume-line-spacing)",
        color: ink,
        padding: `${marginY}in ${marginX}in`,
        minHeight: paperHeight,
      }}
    >
      {showHeader && (
        <div
          data-resume-section=""
          style={{
            display: "flex",
            flexDirection: stacked ? "column" : mirrored ? "row-reverse" : "row",
            justifyContent: "space-between",
            alignItems: stacked ? "center" : "flex-start",
            gap: stacked ? 4 : 24,
          }}
        >
          <div style={{ textAlign: headerAlign, minWidth: 0 }}>
            <div
              style={{
                fontFamily: SANS,
                fontSize: nameSize,
                fontWeight: "var(--resume-name-weight)" as unknown as number,
                color: ink,
                lineHeight: 1.15,
              }}
            >
              {contact.name}
            </div>
            {showTitle && (
              <div style={{ fontFamily: SANS, fontSize: titleSize, color: ink, lineHeight: 1.3, marginTop: 4 }}>
                {targetTitle.title}
              </div>
            )}
          </div>
          {contactBlock}
        </div>
      )}

      {showSummary && (
        <div data-resume-section="" style={{ marginTop: showHeader ? 14 : 0 }}>
          <p style={{ margin: 0, textAlign: "justify", color: ink }}>{summary.content}</p>
        </div>
      )}

      {sectionNodes.map(({ key, node }, i) => {
        const hasPageBreak = pageBreaks.includes(key);
        const first = i === 0 && !showHeader && !showSummary;
        return (
          <div
            key={key}
            data-resume-section=""
            {...(hasPageBreak ? { "data-page-break-before": "" } : {})}
            style={{
              marginTop: first ? 0 : sectionSpacing,
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

export default Sterling;
