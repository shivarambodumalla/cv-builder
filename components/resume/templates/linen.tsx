import type { TemplateProps } from "./classic";
import { SkillsItems } from "./skills-renderer";

const PAGE_BG = "#f7f5f2";
const FLANK_BG = "#d9d5d0";
const DARK_TEXT = "#222222";
const BODY_TEXT = "#333333";
const MUTED_TEXT = "#555555";

// Body grid, in percent of the content width: left column, gutter (the
// divider sits in its centre), right column. Each column owns half the gutter
// as padding and paints the divider as its inner border; the two borders
// overlap, so the line continues on every page for as long as either column
// has content (an empty spacer cell would stop short once page breaks push
// entries down).
const LEFT_COL = 38;
const GUTTER = 8;
const RIGHT_COL = 100 - LEFT_COL - GUTTER;
const HALF_GUTTER = GUTTER / 2;
// Percentage padding on a grid item resolves against its own grid area, so
// each column's half-gutter is expressed relative to that column's width.
const LEFT_PAD = `${(HALF_GUTTER / (LEFT_COL + HALF_GUTTER)) * 100}%`;
const RIGHT_PAD = `${(HALF_GUTTER / (RIGHT_COL + HALF_GUTTER)) * 100}%`;
// Left-column rules run from the content edge to the divider, i.e. the left
// column plus half the gutter, expressed relative to the left column itself.
const RULE_WIDTH = `${((LEFT_COL + HALF_GUTTER) / LEFT_COL) * 100}%`;
const RULE_THICKNESS = 1.5;
const DIAMOND = 14;
const FLANK_HEIGHT = 80;
// Each grey flank covers 24% of the paper width, bleeding past the margins.
const FLANK_RATIO = 0.24;

const DEFAULT_LEFT_SECTIONS = ["contact", "education", "skills", "certifications", "awards"];

export function Linen({
  content,
  design,
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

  const accent = "var(--resume-accent)";
  // Rules, divider and diamonds: near-black by default, shifted by the accent picker.
  const line = `color-mix(in srgb, ${accent} 70%, #111)`;
  const paperHeight = design.paperSize === "letter" ? "11in" : "297mm";

  const headerAlign = design.headerAlignment ?? "center";
  const textAlign = headerAlign as "left" | "center" | "right";

  // Paper width = content width + 2 * marginX, so a flank of 24% paper width is
  // 24% of the content width plus 24% of both margins.
  const flankWidth = `calc(${FLANK_RATIO * 100}% + ${(2 * FLANK_RATIO * marginX).toFixed(3)}in)`;
  // Inner edge of a flank measured from the content edge, plus breathing room.
  const nameInset = `calc(${FLANK_RATIO * 100}% - ${((1 - 2 * FLANK_RATIO) * marginX).toFixed(3)}in + 14px)`;

  const renderDateRange = (start: string, end: string, isCurrent?: boolean) => {
    const s = formatDate(start);
    const e = isCurrent ? "Present" : formatDate(end);
    if (!s && !e) return "";
    return s && e ? `${s} – ${e}` : s || e;
  };

  const parenDates = (start: string, end: string, isCurrent?: boolean) => {
    const range = renderDateRange(start, end, isCurrent);
    return range ? `( ${range} )` : "";
  };

  const sectionHeading = (text: string) => (
    <div
      data-resume-section-title=""
      style={{
        fontFamily: "var(--resume-font)",
        fontSize: "calc(var(--resume-heading-size) + 5pt)",
        fontWeight: "var(--resume-heading-weight)" as unknown as number,
        textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
        letterSpacing: "0.04em",
        color: DARK_TEXT,
        lineHeight: 1.2,
        marginBottom: 14,
      }}
    >
      {text}
    </div>
  );

  const bodyStyle: React.CSSProperties = {
    fontFamily: "var(--resume-font)",
    fontSize: "var(--resume-body-size)",
    lineHeight: "var(--resume-line-spacing)",
    color: BODY_TEXT,
  };

  const entryTitleStyle: React.CSSProperties = {
    ...bodyStyle,
    fontWeight: 700,
    color: DARK_TEXT,
  };

  const entryMetaStyle: React.CSSProperties = {
    ...bodyStyle,
    color: MUTED_TEXT,
    marginTop: 1,
  };

  const renderBullets = (bullets: string[]) => {
    const filtered = bullets.filter(Boolean);
    if (filtered.length === 0) return null;
    return (
      <ul style={{ ...bodyStyle, margin: "6px 0 0 0", padding: 0, listStyle: "none" }}>
        {filtered.map((bullet, j) => (
          <li
            key={j}
            data-resume-bullet=""
            style={{
              marginBottom: bulletChar ? 4 : 8,
              paddingLeft: bulletChar ? 14 : 0,
              textIndent: bulletChar ? -14 : 0,
            }}
          >
            {bulletChar && (
              <span style={{ display: "inline-block", width: 14, textIndent: 0 }}>{bulletChar}</span>
            )}
            {bullet}
          </li>
        ))}
      </ul>
    );
  };

  // ─── Header ───
  const contactFields: { label: string; value: string }[] = [
    { label: "Phone", value: contact.phone },
    { label: "Email", value: contact.email },
    { label: "Website", value: contact.website },
    { label: "Location", value: contact.location },
    { label: "LinkedIn", value: contact.linkedin },
  ].filter((f) => Boolean(f.value));

  const showTitle = visibleSections.includes("targetTitle") && !!targetTitle.title;

  const flankStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: flankWidth,
    height: FLANK_HEIGHT,
    background: FLANK_BG,
    pointerEvents: "none",
  };

  const header = (
    <header data-resume-section="" style={{ textAlign, marginBottom: 34 }}>
      <div style={{ position: "relative", minHeight: FLANK_HEIGHT }}>
        <div aria-hidden="true" style={{ ...flankStyle, left: `-${marginX}in` }} />
        <div aria-hidden="true" style={{ ...flankStyle, right: `-${marginX}in` }} />
        <div
          style={{
            position: "relative",
            minHeight: FLANK_HEIGHT,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: nameInset,
            paddingRight: nameInset,
          }}
        >
          <div
            style={{
              fontFamily: "var(--resume-font)",
              fontSize: "calc(var(--resume-name-size) + 6pt)",
              fontWeight: "var(--resume-name-weight)" as unknown as number,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: DARK_TEXT,
              lineHeight: 1.15,
              wordBreak: "break-word",
            }}
          >
            {contact.name}
          </div>
        </div>
      </div>
      {showTitle && (
        <div
          style={{
            fontFamily: "var(--resume-font)",
            fontSize: "calc(var(--resume-body-size) + 2pt)",
            fontWeight: 400,
            letterSpacing: "0.04em",
            color: DARK_TEXT,
            marginTop: 10,
            paddingLeft: nameInset,
            paddingRight: nameInset,
          }}
        >
          {targetTitle.title}
        </div>
      )}
    </header>
  );

  // ─── Section renderers ───
  const sectionRenderers: Record<string, () => React.ReactNode> = {
    contact: () =>
      contactFields.length > 0 ? (
        <div key="contact">
          {sectionHeading("Contact")}
          {contactFields.map((f, i) => (
            <div
              key={f.label}
              style={{ marginBottom: i < contactFields.length - 1 ? 8 : 0 }}
            >
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) - 2.5pt)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: DARK_TEXT,
                  lineHeight: 1.3,
                }}
              >
                {f.label}
              </div>
              <div style={{ ...bodyStyle, wordBreak: "break-word", overflowWrap: "anywhere" }}>
                {f.value}
              </div>
            </div>
          ))}
        </div>
      ) : null,

    summary: () =>
      summary.content ? (
        <div key="summary">
          {sectionHeading("Personal Statement")}
          <p style={{ ...bodyStyle, margin: 0, whiteSpace: "pre-wrap" }}>{summary.content}</p>
        </div>
      ) : null,

    experience: () =>
      experience.items.length > 0 ? (
        <div key="experience">
          {sectionHeading("Work Experience")}
          {experience.items.map((item, i) => {
            const dates = parenDates(item.startDate, item.endDate, item.isCurrent);
            const meta = [
              [item.company, dates].filter(Boolean).join(" "),
              item.location,
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <div
                key={i}
                data-resume-entry=""
                style={{ marginBottom: i < experience.items.length - 1 ? 14 : 0 }}
              >
                <div style={entryTitleStyle}>{item.role}</div>
                {meta && <div style={entryMetaStyle}>{meta}</div>}
                {renderBullets(item.bullets)}
              </div>
            );
          })}
        </div>
      ) : null,

    education: () =>
      education.items.length > 0 ? (
        <div key="education">
          {sectionHeading("Education")}
          {education.items.map((item, i) => {
            const degreeField = [item.degree, item.field].filter(Boolean).join(", ");
            const dates = parenDates(item.startDate, item.endDate);
            return (
              <div
                key={i}
                data-resume-entry=""
                style={{ marginBottom: i < education.items.length - 1 ? 10 : 0 }}
              >
                <div style={entryTitleStyle}>{item.institution}</div>
                {degreeField && <div style={bodyStyle}>{degreeField}</div>}
                {dates && <div style={entryMetaStyle}>{dates}</div>}
              </div>
            );
          })}
        </div>
      ) : null,

    skills: () =>
      skills.categories.length > 0 ? (
        <div key="skills">
          {sectionHeading("Skills")}
          <SkillsItems
            categories={skills.categories}
            skillsStyle={design.skillsStyle ?? "bullets"}
            bulletChar={bulletChar}
            accentColor={design.accentColor as string}
            labelColor={DARK_TEXT}
            textColor={BODY_TEXT}
          />
        </div>
      ) : null,

    certifications: () =>
      certifications.items.length > 0 ? (
        <div key="certifications">
          {sectionHeading("Certifications")}
          {certifications.items.map((item, i) => {
            const dates = parenDates(item.startDate, item.endDate, item.isCurrent);
            const meta = [item.issuer, dates].filter(Boolean).join(" ");
            return (
              <div
                key={i}
                data-resume-entry=""
                style={{ marginBottom: i < certifications.items.length - 1 ? 8 : 0 }}
              >
                <div style={entryTitleStyle}>{item.name}</div>
                {meta && <div style={entryMetaStyle}>{meta}</div>}
              </div>
            );
          })}
        </div>
      ) : null,

    awards: () =>
      awards.items.length > 0 ? (
        <div key="awards">
          {sectionHeading("Awards")}
          {awards.items.map((item, i) => {
            const date = item.date ? `( ${formatDate(item.date)} )` : "";
            const meta = [item.issuer, date].filter(Boolean).join(" ");
            return (
              <div
                key={i}
                data-resume-entry=""
                style={{ marginBottom: i < awards.items.length - 1 ? 8 : 0 }}
              >
                <div style={entryTitleStyle}>{item.title}</div>
                {meta && <div style={entryMetaStyle}>{meta}</div>}
                {item.description && (
                  <p style={{ ...bodyStyle, margin: "3px 0 0 0" }}>{item.description}</p>
                )}
              </div>
            );
          })}
        </div>
      ) : null,

    projects: () =>
      projects.items.length > 0 ? (
        <div key="projects">
          {sectionHeading("Projects")}
          {projects.items.map((item, i) => {
            const dates = parenDates(item.startDate, item.endDate);
            const meta = [dates, item.url].filter(Boolean).join(" · ");
            return (
              <div
                key={i}
                data-resume-entry=""
                style={{ marginBottom: i < projects.items.length - 1 ? 14 : 0 }}
              >
                <div style={entryTitleStyle}>{item.name}</div>
                {meta && (
                  <div style={{ ...entryMetaStyle, wordBreak: "break-word" }}>{meta}</div>
                )}
                {renderBullets(item.bullets)}
              </div>
            );
          })}
        </div>
      ) : null,

    volunteering: () =>
      volunteering.items.length > 0 ? (
        <div key="volunteering">
          {sectionHeading("Volunteering")}
          {volunteering.items.map((item, i) => {
            const dates = parenDates(item.startDate, item.endDate);
            const meta = [item.organization, dates].filter(Boolean).join(" ");
            return (
              <div
                key={i}
                data-resume-entry=""
                style={{ marginBottom: i < volunteering.items.length - 1 ? 14 : 0 }}
              >
                <div style={entryTitleStyle}>{item.role}</div>
                {meta && <div style={entryMetaStyle}>{meta}</div>}
                {renderBullets(item.bullets)}
              </div>
            );
          })}
        </div>
      ) : null,

    publications: () =>
      publications.items.length > 0 ? (
        <div key="publications">
          {sectionHeading("Publications")}
          {publications.items.map((item, i) => {
            const date = item.date ? `( ${formatDate(item.date)} )` : "";
            const meta = [item.publisher, date].filter(Boolean).join(" ");
            return (
              <div
                key={i}
                data-resume-entry=""
                style={{ marginBottom: i < publications.items.length - 1 ? 8 : 0 }}
              >
                <div style={entryTitleStyle}>{item.title}</div>
                {meta && <div style={entryMetaStyle}>{meta}</div>}
                {item.url && (
                  <div style={{ ...entryMetaStyle, wordBreak: "break-word" }}>{item.url}</div>
                )}
              </div>
            );
          })}
        </div>
      ) : null,
  };

  // ─── Column routing ───
  // targetTitle lives in the header; contact is pinned to the left column.
  const BODY_KEYS = new Set(Object.keys(sectionRenderers));
  const visibleSet = new Set<string>(visibleSections);

  const leftKeys = (design.sidebarSections ?? DEFAULT_LEFT_SECTIONS).filter(
    (k) => BODY_KEYS.has(k) && visibleSet.has(k),
  );
  const leftSet = new Set(leftKeys);
  const rightKeys = (design.sectionOrder || []).filter(
    (k) => BODY_KEYS.has(k) && k !== "contact" && !leftSet.has(k) && visibleSet.has(k),
  );

  const toNodes = (keys: string[]) =>
    keys
      .map((key) => ({ key, node: sectionRenderers[key]?.() }))
      .filter((x): x is { key: string; node: React.ReactNode } => !!x.node);

  const leftNodes = toNodes(leftKeys);
  const rightNodes = toNodes(rightKeys);

  const sectionWrapStyle = (key: string, idx: number): React.CSSProperties => ({
    marginTop: idx === 0 ? 0 : sectionSpacing,
    ...(pageBreaks.includes(key) ? { pageBreakBefore: "always" as const } : {}),
  });

  const separator = (
    <div
      aria-hidden="true"
      style={{
        position: "relative",
        height: RULE_THICKNESS,
        width: RULE_WIDTH,
        background: line,
        marginTop: sectionSpacing,
      }}
    >
      <div
        style={{
          position: "absolute",
          right: -(DIAMOND + RULE_THICKNESS) / 2,
          top: "50%",
          width: DIAMOND,
          height: DIAMOND,
          background: line,
          transform: "translateY(-50%) rotate(45deg)",
        }}
      />
    </div>
  );

  return (
    <div
      data-template="linen"
      style={{
        ...bodyStyle,
        background: PAGE_BG,
        padding: `${marginY}in ${marginX}in`,
        minHeight: paperHeight,
      }}
    >
      {header}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `${LEFT_COL + HALF_GUTTER}% ${RIGHT_COL + HALF_GUTTER}%`,
          alignItems: "stretch",
        }}
      >
        {/* LEFT column: sections separated by a rule ending in a diamond on the divider */}
        <div
          style={{
            minWidth: 0,
            paddingRight: LEFT_PAD,
            borderRight: `${RULE_THICKNESS}px solid ${line}`,
          }}
        >
          {leftNodes.map(({ key, node }, idx) => (
            <div key={key}>
              {idx > 0 && separator}
              <div
                data-resume-section=""
                {...(pageBreaks.includes(key) ? { "data-page-break-before": "" } : {})}
                style={sectionWrapStyle(key, idx)}
              >
                {node}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT column: its left border overlaps the left column's right border */}
        <div
          style={{
            minWidth: 0,
            paddingLeft: RIGHT_PAD,
            marginLeft: -RULE_THICKNESS,
            borderLeft: `${RULE_THICKNESS}px solid ${line}`,
          }}
        >
          {rightNodes.map(({ key, node }, idx) => (
            <div
              key={key}
              data-resume-section=""
              {...(pageBreaks.includes(key) ? { "data-page-break-before": "" } : {})}
              style={sectionWrapStyle(key, idx)}
            >
              {node}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Linen;
