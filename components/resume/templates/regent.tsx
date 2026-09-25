import type { TemplateProps } from "./classic";
import { SkillsItems } from "./skills-renderer";

// Fixed serif stack for the name, the italic summary and the section headings.
// These carry the template's editorial identity whichever body font is chosen.
const SERIF = '"EB Garamond", Georgia, "Times New Roman", serif';

export function Regent({
  content,
  design,
  formatDate,
  bulletChar,
  visibleSections,
  sectionSpacing = 16,
  marginX = 0.75,
  marginY = 0.5,
  pageBreaks = [],
  contactSeparator,
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

  const accent = "var(--resume-accent)";
  const pageBg = "#f9f6f0";
  const ink = "#1f1d1a";
  const bodyText = "#2e2b27";
  const muted = `color-mix(in srgb, ${accent} 22%, #8a8378)`;
  const hairline = `color-mix(in srgb, ${accent} 16%, #d8d1c4)`;
  const marker = `color-mix(in srgb, ${accent} 30%, #9a9388)`;

  const headerAlign = design.headerAlignment ?? "center";
  const paperHeight = design.paperSize === "letter" ? "11in" : "297mm";

  // Size offsets keep the designed look at defaults (name M = 24pt, body M = 10pt,
  // heading M = 9pt) while the Design tab sliders still scale everything.
  const nameSize = "calc(var(--resume-name-size) + 8pt)";
  const titleSize = "calc(var(--resume-body-size) - 1.5pt)";
  const summarySize = "calc(var(--resume-body-size) + 1pt)";
  const entrySize = "calc(var(--resume-body-size) + 2pt)";
  const bodySize = "var(--resume-body-size)";
  const headingSize = "calc(var(--resume-heading-size) - 0.5pt)";

  // The em dash is this template's marker; the generic dot default maps onto it.
  // Dash, arrow and none from the bullet-style picker are honoured as given.
  const bulletMarker = bulletChar === "•" ? "—" : bulletChar;

  const sep = design.contactSeparator === "none" ? null : (contactSeparator ?? " · ").trim();

  const contactItems = [
    contact.phone,
    contact.email,
    contact.linkedin,
    contact.website,
    contact.location,
  ].filter(Boolean) as string[];

  const justify =
    headerAlign === "left" ? "flex-start" : headerAlign === "right" ? "flex-end" : "center";

  const renderDateRange = (start: string, end: string, isCurrent?: boolean) => {
    const s = formatDate(start);
    const e = isCurrent ? "Present" : formatDate(end);
    if (!s && !e) return "";
    return s && e ? `${s} – ${e}` : s || e;
  };

  const rule = (spacing: number) => (
    <div style={{ height: 1, background: hairline, margin: `${spacing}px 0` }} />
  );

  const sectionHeading = (title: string) => (
    <div
      data-resume-section-title=""
      style={{
        fontFamily: SERIF,
        fontSize: headingSize,
        fontWeight: "var(--resume-heading-weight)" as unknown as number,
        textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
        letterSpacing: "0.28em",
        color: ink,
        marginBottom: 12,
      }}
    >
      {title}
    </div>
  );

  const entryHead = (title: string, right: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
      <div style={{ fontFamily: "var(--resume-font)", fontSize: entrySize, color: ink, lineHeight: 1.25 }}>
        {title}
      </div>
      {right && (
        <div
          style={{
            fontFamily: "var(--resume-font)",
            fontSize: bodySize,
            color: ink,
            whiteSpace: "nowrap",
            textAlign: "right",
          }}
        >
          {right}
        </div>
      )}
    </div>
  );

  const entrySub = (parts: (string | undefined)[]) => {
    const text = parts.filter(Boolean).join(" — ");
    return text ? (
      <div style={{ fontFamily: "var(--resume-font)", fontSize: bodySize, color: muted, marginTop: 3 }}>
        {text}
      </div>
    ) : null;
  };

  const renderBullets = (bullets: string[]) => {
    const filtered = bullets.filter(Boolean);
    if (filtered.length === 0) return null;
    return (
      <ul
        style={{
          margin: "8px 0 0 0",
          padding: 0,
          listStyle: "none",
          fontFamily: "var(--resume-font)",
          fontSize: bodySize,
          lineHeight: "var(--resume-line-spacing)",
          color: bodyText,
        }}
      >
        {filtered.map((bullet, j) => (
          <li
            key={j}
            data-resume-bullet=""
            style={{ display: "flex", gap: 10, marginBottom: 4, paddingLeft: bulletMarker ? 4 : 0 }}
          >
            {bulletMarker && <span style={{ color: marker, flexShrink: 0 }}>{bulletMarker}</span>}
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

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    contact: () => null, // Rendered in the header block
    targetTitle: () => null, // Rendered in the header block

    summary: () =>
      summary.content ? (
        <p
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: summarySize,
            lineHeight: "calc(var(--resume-line-spacing) + 0.15)",
            color: bodyText,
            textAlign: headerAlign,
            margin: headerAlign === "center" ? "0 auto" : 0,
            maxWidth: "92%",
          }}
        >
          {summary.content}
        </p>
      ) : null,

    experience: () =>
      experience.items.length > 0 ? (
        <>
          {sectionHeading("Selected Experience")}
          {entryList(experience.items, (item) => (
            <>
              {entryHead(item.role, renderDateRange(item.startDate, item.endDate, item.isCurrent))}
              {entrySub([item.company, item.location])}
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
              {entryHead(
                [item.degree, item.field].filter(Boolean).join(", "),
                renderDateRange(item.startDate, item.endDate)
              )}
              {entrySub([item.institution])}
            </>
          ), 12)}
        </>
      ) : null,

    skills: () =>
      skills.categories.length > 0 ? (
        <>
          {sectionHeading("Skills")}
          {(design.skillsStyle ?? "inline") === "inline" ? (
            <div
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: bodySize,
                lineHeight: "calc(var(--resume-line-spacing) + 0.3)",
                color: bodyText,
              }}
            >
              {skills.categories.map((cat, i) => (
                <div key={i}>
                  {cat.name && <span style={{ color: muted }}>{cat.name}: </span>}
                  {cat.skills.map((skill, j) => (
                    <span key={j}>
                      {skill}
                      {j < cat.skills.length - 1 && (
                        <span style={{ color: marker, margin: "0 7px" }}>·</span>
                      )}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <SkillsItems
              categories={skills.categories}
              skillsStyle={design.skillsStyle ?? "inline"}
              bulletChar={bulletMarker}
              accentColor={design.accentColor as string}
              labelColor={ink}
              textColor={bodyText}
            />
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
              {entrySub([item.issuer])}
            </>
          ), 10)}
        </>
      ) : null,

    awards: () =>
      awards.items.length > 0 ? (
        <>
          {sectionHeading("Awards")}
          {entryList(awards.items, (item) => (
            <>
              {entryHead(item.title, item.date ? formatDate(item.date) : "")}
              {entrySub([item.issuer])}
              {item.description && (
                <p
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: bodySize,
                    lineHeight: "var(--resume-line-spacing)",
                    color: bodyText,
                    margin: "4px 0 0 0",
                  }}
                >
                  {item.description}
                </p>
              )}
            </>
          ), 10)}
        </>
      ) : null,

    projects: () =>
      projects.items.length > 0 ? (
        <>
          {sectionHeading("Projects")}
          {entryList(projects.items, (item) => (
            <>
              {entryHead(item.name, renderDateRange(item.startDate, item.endDate))}
              {entrySub([item.url])}
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
              {entryHead(item.role, renderDateRange(item.startDate, item.endDate))}
              {entrySub([item.organization])}
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
              {entrySub([item.publisher, item.url])}
            </>
          ), 10)}
        </>
      ) : null,
  };

  const sectionNodes = (design.sectionOrder || [])
    .filter((k) => visibleSections.includes(k as (typeof visibleSections)[number]))
    .filter((k) => k !== "contact" && k !== "targetTitle")
    .map((key) => ({ key, node: sectionRenderers[key]?.() }))
    .filter((x): x is { key: string; node: React.ReactNode } => !!x.node);

  const showHeader = visibleSections.includes("contact");
  const showTitle = visibleSections.includes("targetTitle") && !!targetTitle.title;

  return (
    <div
      data-template="regent"
      style={{
        background: pageBg,
        fontFamily: "var(--resume-font)",
        fontSize: bodySize,
        lineHeight: "var(--resume-line-spacing)",
        color: bodyText,
        padding: `${marginY}in ${marginX}in`,
        minHeight: paperHeight,
      }}
    >
      {showHeader && (
        <div style={{ textAlign: headerAlign, marginBottom: 6 }}>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: nameSize,
              fontWeight: "var(--resume-name-weight)" as unknown as number,
              color: ink,
              lineHeight: 1.1,
              letterSpacing: "0.01em",
              marginTop: 8,
            }}
          >
            {contact.name}
          </div>

          {showTitle && (
            <div
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: titleSize,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                color: muted,
                marginTop: 10,
              }}
            >
              {targetTitle.title}
            </div>
          )}

          {contactItems.length > 0 && (
            <>
              {rule(14)}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: justify,
                  columnGap: sep ? 0 : 18,
                  rowGap: 2,
                  fontFamily: "var(--resume-font)",
                  fontSize: bodySize,
                  color: ink,
                }}
              >
                {contactItems.map((item, i) => (
                  <span key={i}>
                    {item}
                    {sep && i < contactItems.length - 1 && (
                      <span style={{ color: marker, margin: "0 12px" }}>{sep}</span>
                    )}
                  </span>
                ))}
              </div>
              {rule(14)}
            </>
          )}
        </div>
      )}

      {sectionNodes.map(({ key, node }, i) => {
        const hasPageBreak = pageBreaks.includes(key);
        const ruled = i > 0 || !showHeader;
        return (
          <div
            key={key}
            data-resume-section=""
            {...(hasPageBreak ? { "data-page-break-before": "" } : {})}
            style={{
              marginTop: i > 0 ? sectionSpacing * 1.25 : sectionSpacing,
              paddingTop: ruled ? sectionSpacing : 0,
              borderTop: ruled ? `1px solid ${hairline}` : undefined,
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

export default Regent;
