import type { TemplateProps } from "./classic";
import { SkillsItems } from "./skills-renderer";

// Canopy — "header ATS". A white single-column page opened by a rounded,
// accent-tinted band that bleeds almost to the paper edges, with oversized
// light accent headings and a dedicated Achievements section.
export function Canopy({
  content,
  design,
  formatDate,
  bulletChar,
  visibleSections,
  sectionSpacing = 16,
  marginX = 0.75,
  marginY = 0.5,
  pageBreaks = [],
  contactSeparator = " • ",
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
  const pageBg = "#ffffff";
  const bandBg = `color-mix(in srgb, ${accent} 38%, white)`;
  const ink = "#1f2937";
  const bodyText = "#222222";
  const mutedText = "#666666";
  const headerAlign = design.headerAlignment ?? "left";
  const paperHeight = design.paperSize === "letter" ? "11in" : "297mm";

  // The band sits 10px inside the paper edge and 10px below the paper top,
  // whatever the margins are set to.
  const BAND_INSET = 10;
  const bandBleedX = `calc(-${marginX}in + ${BAND_INSET}px)`;
  const bandBleedY = `calc(-${marginY}in + ${BAND_INSET}px)`;

  // Sized against the Design-tab variables so the sliders still scale everything
  // (defaults: name 24pt, body 10pt, heading 9pt).
  const nameSize = "calc(var(--resume-name-size) + 2pt)"; // 26pt
  const contactSize = "calc(var(--resume-body-size) - 0.5pt)"; // 9.5pt
  const titleSize = "calc(var(--resume-body-size) + 3pt)"; // 13pt
  const entrySize = "calc(var(--resume-body-size) + 0.5pt)"; // 10.5pt
  const headingSize = "calc(var(--resume-heading-size) + 15pt)"; // 24pt
  const bodySize = "var(--resume-body-size)";
  const leading = "var(--resume-line-spacing)";

  const sep = contactSeparator.trim() ? contactSeparator : "  ";
  const contactLines = [
    [contact.email, contact.phone].filter(Boolean).join(sep),
    contact.location,
    contact.linkedin,
    contact.website,
  ].filter(Boolean) as string[];

  const renderDateRange = (start: string, end: string, isCurrent?: boolean) => {
    const s = formatDate(start);
    const e = isCurrent ? "Present" : formatDate(end);
    if (!s && !e) return "";
    return s && e ? `${s} – ${e}` : s || e;
  };

  const bodyStyle: React.CSSProperties = {
    fontFamily: "var(--resume-font)",
    fontSize: bodySize,
    lineHeight: leading,
    color: bodyText,
  };

  const sectionHeading = (title: string) => (
    <div
      data-resume-section-title=""
      style={{
        fontFamily: "var(--resume-font)",
        fontSize: headingSize,
        fontWeight: "var(--resume-heading-weight)" as unknown as number,
        textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
        letterSpacing: "-0.01em",
        lineHeight: 1.15,
        color: accent,
        marginBottom: 10,
      }}
    >
      {title}
    </div>
  );

  // Line 1 of an entry: accent-coloured title left, date range right.
  const entryLine = (title: string, dates: string) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 16,
        fontFamily: "var(--resume-font)",
        fontSize: entrySize,
        lineHeight: 1.3,
        color: accent,
      }}
    >
      <div>{title}</div>
      {dates && <div style={{ whiteSpace: "nowrap", textAlign: "right" }}>{dates}</div>}
    </div>
  );

  const subLine = (text: string, color = ink) =>
    text ? <div style={{ ...bodyStyle, color, marginTop: 2 }}>{text}</div> : null;

  const bullet = (node: React.ReactNode, key: number) => (
    <li
      key={key}
      data-resume-bullet=""
      style={{
        marginBottom: 6,
        paddingLeft: bulletChar ? 14 : 0,
        textIndent: bulletChar ? -14 : 0,
      }}
    >
      {bulletChar && (
        <span style={{ display: "inline-block", width: 14, textIndent: 0, color: accent }}>
          {bulletChar}
        </span>
      )}
      {node}
    </li>
  );

  const bulletList = (children: React.ReactNode, marginTop = 6) => (
    <ul style={{ ...bodyStyle, margin: `${marginTop}px 0 0 0`, padding: 0, listStyle: "none" }}>
      {children}
    </ul>
  );

  const renderBullets = (bullets: string[]) => {
    const filtered = bullets.filter(Boolean);
    if (filtered.length === 0) return null;
    return bulletList(filtered.map((b, j) => bullet(b, j)));
  };

  const entryList = <T,>(items: T[], render: (item: T) => React.ReactNode, gap = 18) =>
    items.map((item, i) => (
      <div key={i} data-resume-entry="" style={{ marginBottom: i < items.length - 1 ? gap : 0 }}>
        {render(item)}
      </div>
    ));

  // ─── Header band ───
  const showHeader = visibleSections.includes("contact");
  const showTitle = visibleSections.includes("targetTitle") && !!targetTitle.title;
  const showSummary = visibleSections.includes("summary") && !!summary.content;

  const stacked = headerAlign === "center";
  const mirrored = headerAlign === "right";

  const header = showHeader ? (
    <header
      data-resume-section=""
      style={{
        background: bandBg,
        borderRadius: 14,
        marginLeft: bandBleedX,
        marginRight: bandBleedX,
        marginTop: bandBleedY,
        padding: `28px ${marginX}in`,
        display: "flex",
        flexDirection: stacked ? "column" : mirrored ? "row-reverse" : "row",
        justifyContent: "space-between",
        alignItems: stacked ? "center" : "flex-start",
        gap: stacked ? 10 : 24,
        textAlign: stacked ? "center" : mirrored ? "right" : "left",
      }}
    >
      <div
        style={{
          fontFamily: "var(--resume-font)",
          fontSize: nameSize,
          fontWeight: "var(--resume-name-weight)" as unknown as number,
          lineHeight: 1.15,
          color: ink,
          wordBreak: "break-word",
          flex: stacked ? undefined : "1 1 auto",
          textAlign: stacked ? "center" : mirrored ? "right" : "left",
        }}
      >
        {contact.name}
      </div>
      {contactLines.length > 0 && (
        <div
          style={{
            fontFamily: "var(--resume-font)",
            fontSize: contactSize,
            lineHeight: 1.5,
            color: ink,
            flexShrink: 0,
            textAlign: stacked ? "center" : mirrored ? "left" : "right",
            wordBreak: "break-word",
          }}
        >
          {contactLines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
    </header>
  ) : null;

  // ─── Section renderers ───
  const sectionRenderers: Record<string, () => React.ReactNode> = {
    contact: () => null, // Rendered in the header band
    targetTitle: () => null, // Rendered directly under the band
    summary: () => null, // Rendered directly under the band

    experience: () =>
      experience.items.length > 0 ? (
        <>
          {sectionHeading("Career Experience")}
          {entryList(experience.items, (item) => (
            <>
              {entryLine(
                [[item.role, item.company].filter(Boolean).join(" at "), item.location]
                  .filter(Boolean)
                  .join(", "),
                renderDateRange(item.startDate, item.endDate, item.isCurrent)
              )}
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
              {entryLine(
                [
                  [item.degree, item.field].filter(Boolean).join(" in "),
                  renderDateRange(item.startDate, item.endDate),
                ]
                  .filter(Boolean)
                  .join(", "),
                ""
              )}
              {subLine(item.institution)}
            </>
          ), 12)}
        </>
      ) : null,

    skills: () =>
      skills.categories.length > 0 ? (
        <>
          {sectionHeading("Skills")}
          <SkillsItems
            categories={skills.categories}
            skillsStyle={design.skillsStyle ?? "inline"}
            bulletChar={bulletChar}
            accentColor={design.accentColor as string}
            labelColor={design.accentColor as string}
            textColor={bodyText}
          />
        </>
      ) : null,

    certifications: () =>
      certifications.items.length > 0 ? (
        <>
          {sectionHeading("Certifications")}
          {entryList(certifications.items, (item) => {
            const meta = [item.issuer, renderDateRange(item.startDate, item.endDate, item.isCurrent)]
              .filter(Boolean)
              .join(", ");
            return (
              <div style={bodyStyle}>
                <span style={{ fontWeight: 500, color: ink }}>{item.name}</span>
                {meta && <span style={{ color: mutedText }}> — {meta}</span>}
              </div>
            );
          }, 8)}
        </>
      ) : null,

    awards: () =>
      awards.items.length > 0 ? (
        <>
          {sectionHeading("Achievements")}
          {bulletList(
            awards.items.map((item, i) => {
              const meta = [item.issuer, item.date ? formatDate(item.date) : ""]
                .filter(Boolean)
                .join(", ");
              return bullet(
                <span data-resume-entry="">
                  <span style={{ fontWeight: 500, color: ink }}>{item.title}</span>
                  {meta && <span style={{ color: mutedText }}> — {meta}</span>}
                  {item.description && <div style={{ textIndent: 0 }}>{item.description}</div>}
                </span>,
                i
              );
            }),
            0
          )}
        </>
      ) : null,

    projects: () =>
      projects.items.length > 0 ? (
        <>
          {sectionHeading("Projects")}
          {entryList(projects.items, (item) => (
            <>
              {entryLine(item.name, renderDateRange(item.startDate, item.endDate))}
              {item.url && (
                <div style={{ ...bodyStyle, color: mutedText, marginTop: 2, wordBreak: "break-word" }}>
                  {item.url}
                </div>
              )}
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
              {entryLine(
                [item.role, item.organization].filter(Boolean).join(" at "),
                renderDateRange(item.startDate, item.endDate)
              )}
              {renderBullets(item.bullets)}
            </>
          ))}
        </>
      ) : null,

    publications: () =>
      publications.items.length > 0 ? (
        <>
          {sectionHeading("Publications")}
          {entryList(publications.items, (item) => {
            const meta = [item.publisher, item.date ? formatDate(item.date) : ""]
              .filter(Boolean)
              .join(", ");
            return (
              <div style={bodyStyle}>
                <span style={{ fontWeight: 500, color: ink }}>{item.title}</span>
                {meta && <span style={{ color: mutedText }}> — {meta}</span>}
                {item.url && (
                  <div style={{ color: mutedText, wordBreak: "break-word" }}>{item.url}</div>
                )}
              </div>
            );
          }, 8)}
        </>
      ) : null,
  };

  const sectionNodes = (design.sectionOrder || [])
    .filter((k) => visibleSections.includes(k as (typeof visibleSections)[number]))
    .map((key) => ({ key, node: sectionRenderers[key]?.() }))
    .filter((x): x is { key: string; node: React.ReactNode } => !!x.node);

  return (
    <div
      data-template="canopy"
      style={{
        ...bodyStyle,
        background: pageBg,
        padding: `${marginY}in ${marginX}in`,
        minHeight: paperHeight,
      }}
    >
      {header}

      {(showTitle || showSummary) && (
        <div
          data-resume-section=""
          style={{ marginTop: showHeader ? 22 : 0, textAlign: headerAlign }}
        >
          {showTitle && (
            <div
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: titleSize,
                fontWeight: 400,
                lineHeight: 1.3,
                color: ink,
              }}
            >
              {targetTitle.title}
            </div>
          )}
          {showSummary && (
            <p
              style={{
                ...bodyStyle,
                margin: showTitle ? "8px 0 0 0" : 0,
                whiteSpace: "pre-wrap",
              }}
            >
              {summary.content}
            </p>
          )}
        </div>
      )}

      {sectionNodes.map(({ key, node }, i) => {
        const hasPageBreak = pageBreaks.includes(key);
        const first = i === 0 && !showHeader && !showTitle && !showSummary;
        return (
          <div
            key={key}
            data-resume-section=""
            {...(hasPageBreak ? { "data-page-break-before": "" } : {})}
            style={{
              marginTop: first ? 0 : sectionSpacing + 10,
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

export default Canopy;
