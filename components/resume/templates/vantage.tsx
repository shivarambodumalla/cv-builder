import type { TemplateProps } from "./classic";
import { SkillsItems } from "./skills-renderer";

type IconKind = "phone" | "mail" | "linkedin" | "pin" | "globe" | "calendar" | "briefcase" | "graduation" | "star";

function InlineIcon({ kind, color, size = 10 }: { kind: IconKind; color: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style: { flexShrink: 0 } as React.CSSProperties,
  };
  switch (kind) {
    case "phone":
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common} fill={color} stroke="none">
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.6v1.7h.05c.5-.9 1.7-1.9 3.5-1.9 3.75 0 4.45 2.45 4.45 5.65V21H17.7v-5.4c0-1.3 0-3-1.85-3s-2.15 1.45-2.15 2.9V21H10z" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case "briefcase":
      return (
        <svg {...common} strokeWidth={1.7}>
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case "graduation":
      return (
        <svg {...common} strokeWidth={1.7}>
          <path d="M22 10 12 5 2 10l10 5 10-5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      );
    case "star":
      return (
        <svg {...common} strokeWidth={1.7}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
  }
}

const LOGO_SIZE = 32;

function LogoTile({ src, alt, fallback }: { src?: string; alt: string; fallback: "briefcase" | "graduation" }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        style={{
          width: LOGO_SIZE,
          height: LOGO_SIZE,
          objectFit: "contain",
          borderRadius: 3,
          border: "1px solid #e3e3e3",
          background: "#ffffff",
          flexShrink: 0,
          display: "block",
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: LOGO_SIZE,
        height: LOGO_SIZE,
        borderRadius: 3,
        background: "color-mix(in srgb, var(--resume-accent) 12%, white)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <InlineIcon kind={fallback} color="var(--resume-accent)" size={16} />
    </div>
  );
}

export function Vantage({
  content,
  design,
  formatDate,
  bulletChar,
  visibleSections,
  sectionSpacing = 14,
  marginX = 0.6,
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
  const headingDark = "color-mix(in srgb, var(--resume-accent) 60%, #1f2a44)";
  const bodyText = "#222222";
  const mutedText = "#555555";
  const dottedRule = "1px dotted #c9c9c9";

  const resolvedAccent =
    typeof design.accentColor === "string" && design.accentColor.startsWith("#")
      ? design.accentColor
      : "#1E3A5F";

  const headerAlignment = design.headerAlignment ?? "left";
  const headerJustify =
    headerAlignment === "center" ? "center" : headerAlignment === "right" ? "flex-end" : "flex-start";
  const paperHeight = design.paperSize === "letter" ? "11in" : "297mm";

  const baseText: React.CSSProperties = {
    fontFamily: "var(--resume-font)",
    fontSize: "var(--resume-body-size)",
    lineHeight: "var(--resume-line-spacing)",
    color: bodyText,
  };
  const metaText: React.CSSProperties = {
    fontFamily: "var(--resume-font)",
    fontSize: "calc(var(--resume-body-size) - 0.5pt)",
    lineHeight: 1.4,
    color: mutedText,
  };
  const entryTitle: React.CSSProperties = {
    fontFamily: "var(--resume-font)",
    fontSize: "calc(var(--resume-body-size) + 1.5pt)",
    fontWeight: 700,
    color: headingDark,
    lineHeight: 1.25,
  };
  const entrySubtitle: React.CSSProperties = {
    fontFamily: "var(--resume-font)",
    fontSize: "calc(var(--resume-body-size) + 0.5pt)",
    fontWeight: 700,
    color: accent,
    lineHeight: 1.3,
  };

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
        fontFamily: "var(--resume-font)",
        fontSize: "calc(var(--resume-heading-size) + 1pt)",
        fontWeight: "var(--resume-heading-weight)" as unknown as number,
        textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
        letterSpacing: 1.2,
        color: headingDark,
        borderBottom: `2px solid ${accent}`,
        paddingBottom: 3,
        marginBottom: 8,
      }}
    >
      {title}
    </div>
  );

  const metaRow = (items: { kind: IconKind; value: string }[]) => {
    const filled = items.filter((m) => m.value);
    if (filled.length === 0) return null;
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 12px", marginTop: 2 }}>
        {filled.map((m, i) => (
          <span key={i} style={{ ...metaText, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <InlineIcon kind={m.kind} color={mutedText} size={9} />
            {m.value}
          </span>
        ))}
      </div>
    );
  };

  const renderBullets = (bullets: string[]) => {
    const filtered = bullets.filter(Boolean);
    if (filtered.length === 0) return null;
    return (
      <ul style={{ ...baseText, margin: "5px 0 0 0", padding: 0, listStyle: "none" }}>
        {filtered.map((b, j) => (
          <li
            key={j}
            data-resume-bullet=""
            style={{
              marginBottom: 3,
              paddingLeft: bulletChar ? 11 : 0,
              textIndent: bulletChar ? -11 : 0,
            }}
          >
            {bulletChar && <span style={{ display: "inline-block", width: 11, textIndent: 0, color: accent }}>{bulletChar}</span>}
            {b}
          </li>
        ))}
      </ul>
    );
  };

  // Entry wrapper: dotted separator between entries, none after the last.
  const entryStyle = (i: number, count: number): React.CSSProperties => ({
    paddingBottom: i < count - 1 ? 9 : 0,
    marginBottom: i < count - 1 ? 9 : 0,
    borderBottom: i < count - 1 ? dottedRule : "none",
  });

  const summaryBlock = summary.content ? (
    <div key="summary" data-resume-section="summary">
      {sectionHeading("Summary")}
      <p style={{ ...baseText, margin: 0 }}>{summary.content}</p>
    </div>
  ) : null;

  const experienceBlock =
    experience.items.length > 0 ? (
      <div key="experience" data-resume-section="experience">
        {sectionHeading("Experience")}
        {experience.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{ display: "flex", gap: 10, alignItems: "flex-start", ...entryStyle(i, experience.items.length) }}
          >
            <LogoTile src={item.logoUrl} alt={item.company} fallback="briefcase" />
            <div style={{ minWidth: 0, flex: 1 }}>
              {item.role && <div style={entryTitle}>{item.role}</div>}
              {item.company && <div style={entrySubtitle}>{item.company}</div>}
              {metaRow([
                { kind: "calendar", value: renderDateRange(item.startDate, item.endDate, item.isCurrent) },
                { kind: "pin", value: item.location },
              ])}
              {renderBullets(item.bullets)}
            </div>
          </div>
        ))}
      </div>
    ) : null;

  const educationBlock =
    education.items.length > 0 ? (
      <div key="education" data-resume-section="education">
        {sectionHeading("Education")}
        {education.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{ display: "flex", gap: 10, alignItems: "flex-start", ...entryStyle(i, education.items.length) }}
          >
            <LogoTile src={item.logoUrl} alt={item.institution} fallback="graduation" />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={entryTitle}>{[item.degree, item.field].filter(Boolean).join(" in ")}</div>
              {item.institution && <div style={entrySubtitle}>{item.institution}</div>}
              {metaRow([{ kind: "calendar", value: renderDateRange(item.startDate, item.endDate) }])}
            </div>
          </div>
        ))}
      </div>
    ) : null;

  const skillsBlock =
    skills.categories.length > 0 ? (
      <div key="skills" data-resume-section="skills">
        {sectionHeading("Skills")}
        {(design.skillsStyle ?? "chips") === "chips" ? (
          skills.categories.map((cat, i) => (
            <div key={i} style={{ marginBottom: i < skills.categories.length - 1 ? 8 : 0 }}>
              {cat.name && (
                <div style={{ ...baseText, fontWeight: 700, color: headingDark, marginBottom: 4 }}>{cat.name}</div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px" }}>
                {cat.skills.map((skill, j) => (
                  <span
                    key={j}
                    style={{
                      ...baseText,
                      lineHeight: 1.35,
                      padding: "1px 1px 2px",
                      borderBottom: "1.5px solid #d6d6d6",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <SkillsItems
            categories={skills.categories}
            skillsStyle={design.skillsStyle ?? "chips"}
            bulletChar={bulletChar}
            accentColor={resolvedAccent}
            labelColor={headingDark}
            textColor={bodyText}
          />
        )}
      </div>
    ) : null;

  const certificationsBlock =
    certifications.items.length > 0 ? (
      <div key="certifications" data-resume-section="certifications">
        {sectionHeading("Certifications")}
        {certifications.items.map((item, i) => (
          <div key={i} data-resume-entry="" style={entryStyle(i, certifications.items.length)}>
            <div style={{ ...entryTitle, fontSize: "calc(var(--resume-body-size) + 0.5pt)" }}>{item.name}</div>
            {item.issuer && <div style={{ ...baseText, color: accent, fontWeight: 700 }}>{item.issuer}</div>}
            {metaRow([{ kind: "calendar", value: renderDateRange(item.startDate, item.endDate, item.isCurrent) }])}
          </div>
        ))}
      </div>
    ) : null;

  const awardsBlock =
    awards.items.length > 0 ? (
      <div key="awards" data-resume-section="awards">
        {sectionHeading("Strengths")}
        {awards.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{ display: "flex", gap: 8, alignItems: "flex-start", ...entryStyle(i, awards.items.length) }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 3,
                background: "color-mix(in srgb, var(--resume-accent) 12%, white)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              <InlineIcon kind="star" color={accent} size={12} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={entrySubtitle}>
                {item.title}
                {item.date && <span style={{ ...metaText, fontWeight: 400, marginLeft: 6 }}>{formatDate(item.date)}</span>}
              </div>
              {item.issuer && <div style={metaText}>{item.issuer}</div>}
              {item.description && <p style={{ ...baseText, margin: "2px 0 0 0" }}>{item.description}</p>}
            </div>
          </div>
        ))}
      </div>
    ) : null;

  const projectsBlock =
    projects.items.length > 0 ? (
      <div key="projects" data-resume-section="projects">
        {sectionHeading("Projects")}
        {projects.items.map((item, i) => (
          <div key={i} data-resume-entry="" style={entryStyle(i, projects.items.length)}>
            <div style={entryTitle}>{item.name}</div>
            {metaRow([
              { kind: "calendar", value: renderDateRange(item.startDate, item.endDate) },
              { kind: "globe", value: item.url },
            ])}
            {renderBullets(item.bullets)}
          </div>
        ))}
      </div>
    ) : null;

  const volunteeringBlock =
    volunteering.items.length > 0 ? (
      <div key="volunteering" data-resume-section="volunteering">
        {sectionHeading("Volunteering")}
        {volunteering.items.map((item, i) => (
          <div key={i} data-resume-entry="" style={entryStyle(i, volunteering.items.length)}>
            {item.role && <div style={entryTitle}>{item.role}</div>}
            {item.organization && <div style={entrySubtitle}>{item.organization}</div>}
            {metaRow([{ kind: "calendar", value: renderDateRange(item.startDate, item.endDate) }])}
            {renderBullets(item.bullets)}
          </div>
        ))}
      </div>
    ) : null;

  const publicationsBlock =
    publications.items.length > 0 ? (
      <div key="publications" data-resume-section="publications">
        {sectionHeading("Publications")}
        {publications.items.map((item, i) => (
          <div key={i} data-resume-entry="" style={entryStyle(i, publications.items.length)}>
            <div style={{ ...entryTitle, fontSize: "calc(var(--resume-body-size) + 0.5pt)" }}>{item.title}</div>
            {item.publisher && <div style={{ ...baseText, color: accent, fontWeight: 700 }}>{item.publisher}</div>}
            {metaRow([
              { kind: "calendar", value: item.date ? formatDate(item.date) : "" },
              { kind: "globe", value: item.url },
            ])}
          </div>
        ))}
      </div>
    ) : null;

  const sectionMap: Record<string, React.ReactNode> = {
    contact: null,
    targetTitle: null,
    summary: summaryBlock,
    experience: experienceBlock,
    education: educationBlock,
    skills: skillsBlock,
    certifications: certificationsBlock,
    awards: awardsBlock,
    projects: projectsBlock,
    volunteering: volunteeringBlock,
    publications: publicationsBlock,
  };

  // Header keys (contact, targetTitle) are pinned to the top. The right column
  // follows `sidebarSections`; the left column follows `sectionOrder` minus
  // whatever sits on the right.
  const DEFAULT_RIGHT = ["awards", "skills", "education", "certifications"];
  const headerKeys = new Set(["contact", "targetTitle"]);
  const rightKeys: string[] = design.sidebarSections ?? DEFAULT_RIGHT;
  const rightSet = new Set(rightKeys);
  const isVisible = (key: string) => visibleSections.includes(key as (typeof visibleSections)[number]);
  const toEntry = (key: string) => ({ key, node: sectionMap[key] });
  const hasNode = (x: { key: string; node: React.ReactNode }) => !!x.node;

  const leftContent = (design.sectionOrder || [])
    .filter((key) => !headerKeys.has(key) && !rightSet.has(key) && isVisible(key))
    .map(toEntry)
    .filter(hasNode);
  const rightContent = rightKeys
    .filter((key) => !headerKeys.has(key) && isVisible(key))
    .map(toEntry)
    .filter(hasNode);

  const renderColumn = (entries: { key: string; node: React.ReactNode }[]) =>
    entries.map(({ key, node }, idx) => {
      const hasPageBreak = pageBreaks.includes(key);
      return (
        <div
          key={key}
          {...(hasPageBreak ? { "data-page-break-before": "" } : {})}
          style={{
            marginTop: idx === 0 ? 0 : sectionSpacing,
            ...(hasPageBreak ? { pageBreakBefore: "always" as const } : {}),
          }}
        >
          {node}
        </div>
      );
    });

  const showHeader = visibleSections.includes("contact");
  const showTitle = visibleSections.includes("targetTitle") && !!targetTitle.title;

  const contactRow: { kind: IconKind; value: string }[] = [];
  if (contact.phone) contactRow.push({ kind: "phone", value: contact.phone });
  if (contact.email) contactRow.push({ kind: "mail", value: contact.email });
  if (contact.linkedin) contactRow.push({ kind: "linkedin", value: contact.linkedin });
  if (contact.location) contactRow.push({ kind: "pin", value: contact.location });
  if (contact.website) contactRow.push({ kind: "globe", value: contact.website });

  return (
    <div
      data-template="vantage"
      style={{
        background: "#ffffff",
        fontFamily: "var(--resume-font)",
        fontSize: "var(--resume-body-size)",
        lineHeight: "var(--resume-line-spacing)",
        color: bodyText,
        padding: `${marginY}in ${marginX}in`,
        minHeight: paperHeight,
      }}
    >
      {(showHeader || showTitle) && (
        <div
          data-resume-section="contact"
          style={{ textAlign: headerAlignment, marginBottom: sectionSpacing + 4 }}
        >
          {showHeader && contact.name && (
            <div
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "calc(var(--resume-name-size) + 4pt)",
                fontWeight: "var(--resume-name-weight)" as unknown as number,
                textTransform: "uppercase",
                letterSpacing: 1,
                lineHeight: 1.05,
                color: accent,
                wordBreak: "break-word",
              }}
            >
              {contact.name}
            </div>
          )}
          {showTitle && (
            <div
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "calc(var(--resume-body-size) + 1pt)",
                fontWeight: 700,
                color: accent,
                marginTop: 4,
              }}
            >
              {targetTitle.title}
            </div>
          )}
          {showHeader && contactRow.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: headerJustify,
                gap: "3px 14px",
                marginTop: 6,
              }}
            >
              {contactRow.map((c, i) => (
                <span
                  key={i}
                  style={{
                    ...baseText,
                    lineHeight: 1.4,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    minWidth: 0,
                    wordBreak: "break-word",
                  }}
                >
                  <InlineIcon kind={c.kind} color={accent} size={10} />
                  {c.value}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Independent two-column flow: each column stacks its own sections. */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 57fr) minmax(0, 40fr)",
          columnGap: 24,
          alignItems: "start",
        }}
      >
        <div style={{ minWidth: 0 }}>{renderColumn(leftContent)}</div>
        <div style={{ minWidth: 0 }}>{renderColumn(rightContent)}</div>
      </div>
    </div>
  );
}

export default Vantage;
