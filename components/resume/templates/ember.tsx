import type { TemplateProps } from "./classic";
import { SkillsItems } from "./skills-renderer";

// Ember — plain-text "two column ATS" layout. Full-width name + title, then a
// wide main column and a narrow right rail of label/value blocks. No icons,
// rules or boxes: every element is text so any parser reads it in order.
export function Ember({
  content,
  design,
  formatDate,
  bulletChar,
  visibleSections,
  sectionSpacing = 20,
  marginX = 0.6,
  marginY = 0.55,
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
  const bodyText = "#222222";
  const mutedText = "#555555";
  const railLabel = "color-mix(in srgb, var(--resume-accent) 45%, #334155)";

  const resolvedAccent =
    typeof design.accentColor === "string" && design.accentColor.startsWith("#")
      ? design.accentColor
      : "#DD6B20";

  const headerAlignment = design.headerAlignment ?? "left";
  const paperHeight = design.paperSize === "letter" ? "11in" : "297mm";

  const baseText: React.CSSProperties = {
    fontFamily: "var(--resume-font)",
    fontSize: "var(--resume-body-size)",
    lineHeight: "var(--resume-line-spacing)",
    color: bodyText,
  };
  const dateText: React.CSSProperties = {
    ...baseText,
    fontSize: "calc(var(--resume-body-size) - 0.5pt)",
    lineHeight: 1.4,
    color: mutedText,
  };

  // Rail entries shrink to label/value blocks; main entries carry a 13pt title.
  const entryTitle = (inRail: boolean): React.CSSProperties =>
    inRail
      ? { ...baseText, fontWeight: 500, lineHeight: 1.35, color: railLabel }
      : { ...baseText, fontSize: "calc(var(--resume-body-size) + 3pt)", lineHeight: 1.3 };
  const entrySub = (inRail: boolean): React.CSSProperties =>
    inRail ? { ...baseText, fontSize: "calc(var(--resume-body-size) - 0.5pt)", lineHeight: 1.4 } : baseText;
  const entryGap = (inRail: boolean, i: number, count: number): React.CSSProperties => ({
    marginBottom: i < count - 1 ? (inRail ? 12 : 18) : 0,
  });
  // Title + date stay together across a page break; bullets may still split.
  const entryHead: React.CSSProperties = { breakInside: "avoid" };

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
        fontSize: "calc(var(--resume-heading-size) + 7pt)",
        fontWeight: "var(--resume-heading-weight)" as unknown as number,
        textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
        lineHeight: 1.25,
        color: accent,
        marginBottom: 8,
      }}
    >
      {title}
    </div>
  );

  const railBlock = (label: string, value: string, i: number, count: number) => (
    <div key={i} style={entryGap(true, i, count)}>
      <div style={entryTitle(true)}>{label}</div>
      <div style={{ ...entrySub(true), wordBreak: "break-word" }}>{value}</div>
    </div>
  );

  const renderBullets = (bullets: string[], inRail: boolean) => {
    const filtered = bullets.filter(Boolean);
    if (filtered.length === 0) return null;
    return (
      <ul style={{ ...entrySub(inRail), margin: "4px 0 0 0", padding: 0, listStyle: "none" }}>
        {filtered.map((b, j) => (
          <li
            key={j}
            data-resume-bullet=""
            style={{
              marginBottom: 2,
              paddingLeft: bulletChar ? 12 : 0,
              textIndent: bulletChar ? -12 : 0,
            }}
          >
            {bulletChar && (
              <span style={{ display: "inline-block", width: 12, textIndent: 0, fontSize: "0.8em", verticalAlign: "1px" }}>
                {bulletChar}
              </span>
            )}
            {b}
          </li>
        ))}
      </ul>
    );
  };

  const summaryBlock = (inRail: boolean) =>
    summary.content ? (
      <div key="summary" data-resume-section="summary">
        {sectionHeading("Profile")}
        <p style={{ ...entrySub(inRail), margin: 0 }}>{summary.content}</p>
      </div>
    ) : null;

  const experienceBlock = (inRail: boolean) =>
    experience.items.length > 0 ? (
      <div key="experience" data-resume-section="experience">
        {sectionHeading("Employment History")}
        {experience.items.map((item, i) => (
          <div key={i} data-resume-entry="" style={entryGap(inRail, i, experience.items.length)}>
            <div style={entryHead}>
              <div style={entryTitle(inRail)}>
                {[item.role, item.company].filter(Boolean).join(" at ")}
                {item.location && `, ${item.location}`}
              </div>
              {renderDateRange(item.startDate, item.endDate, item.isCurrent) && (
                <div style={dateText}>{renderDateRange(item.startDate, item.endDate, item.isCurrent)}</div>
              )}
            </div>
            {renderBullets(item.bullets, inRail)}
          </div>
        ))}
      </div>
    ) : null;

  const educationBlock = (inRail: boolean) =>
    education.items.length > 0 ? (
      <div key="education" data-resume-section="education">
        {sectionHeading("Education")}
        {education.items.map((item, i) => {
          const degree = [item.degree, item.field].filter(Boolean).join(" – ");
          return (
            <div key={i} data-resume-entry="" style={entryGap(inRail, i, education.items.length)}>
              {item.institution && <div style={entryTitle(inRail)}>{item.institution}</div>}
              {degree && <div style={entrySub(inRail)}>{degree}</div>}
              {renderDateRange(item.startDate, item.endDate) && (
                <div style={dateText}>{renderDateRange(item.startDate, item.endDate)}</div>
              )}
            </div>
          );
        })}
      </div>
    ) : null;

  const skillsBlock = (inRail: boolean) => {
    if (skills.categories.length === 0) return null;
    const style = design.skillsStyle;
    return (
      <div key="skills" data-resume-section="skills">
        {sectionHeading("Skills")}
        {style === "chips" || style === "inline" ? (
          <SkillsItems
            categories={skills.categories}
            skillsStyle={style}
            bulletChar={bulletChar}
            accentColor={resolvedAccent}
            labelColor={railLabel}
            textColor={bodyText}
          />
        ) : (
          skills.categories.map((cat, i) => (
            <div key={i} style={{ marginBottom: i < skills.categories.length - 1 ? 10 : 0 }}>
              {cat.name && <div style={entryTitle(true)}>{cat.name}</div>}
              {cat.skills.map((skill, j) => (
                <div key={j} style={entrySub(inRail)}>
                  {skill}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    );
  };

  const certificationsBlock = (inRail: boolean) =>
    certifications.items.length > 0 ? (
      <div key="certifications" data-resume-section="certifications">
        {sectionHeading("Certifications")}
        {certifications.items.map((item, i) => (
          <div key={i} data-resume-entry="" style={entryGap(inRail, i, certifications.items.length)}>
            <div style={entryTitle(inRail)}>{item.name}</div>
            {item.issuer && <div style={entrySub(inRail)}>{item.issuer}</div>}
            {renderDateRange(item.startDate, item.endDate, item.isCurrent) && (
              <div style={dateText}>{renderDateRange(item.startDate, item.endDate, item.isCurrent)}</div>
            )}
          </div>
        ))}
      </div>
    ) : null;

  const awardsBlock = (inRail: boolean) =>
    awards.items.length > 0 ? (
      <div key="awards" data-resume-section="awards">
        {sectionHeading("Awards")}
        {awards.items.map((item, i) => (
          <div key={i} data-resume-entry="" style={entryGap(inRail, i, awards.items.length)}>
            <div style={entryTitle(inRail)}>{item.title}</div>
            {item.issuer && <div style={entrySub(inRail)}>{item.issuer}</div>}
            {item.date && <div style={dateText}>{formatDate(item.date)}</div>}
            {item.description && <p style={{ ...entrySub(inRail), margin: "2px 0 0 0" }}>{item.description}</p>}
          </div>
        ))}
      </div>
    ) : null;

  const projectsBlock = (inRail: boolean) =>
    projects.items.length > 0 ? (
      <div key="projects" data-resume-section="projects">
        {sectionHeading("Projects")}
        {projects.items.map((item, i) => (
          <div key={i} data-resume-entry="" style={entryGap(inRail, i, projects.items.length)}>
            <div style={entryHead}>
              <div style={entryTitle(inRail)}>{item.name}</div>
              {item.url && <div style={{ ...entrySub(inRail), color: mutedText, wordBreak: "break-word" }}>{item.url}</div>}
              {renderDateRange(item.startDate, item.endDate) && (
                <div style={dateText}>{renderDateRange(item.startDate, item.endDate)}</div>
              )}
            </div>
            {renderBullets(item.bullets ?? [], inRail)}
          </div>
        ))}
      </div>
    ) : null;

  const volunteeringBlock = (inRail: boolean) =>
    volunteering.items.length > 0 ? (
      <div key="volunteering" data-resume-section="volunteering">
        {sectionHeading("Volunteering")}
        {volunteering.items.map((item, i) => (
          <div key={i} data-resume-entry="" style={entryGap(inRail, i, volunteering.items.length)}>
            <div style={entryHead}>
              <div style={entryTitle(inRail)}>{[item.role, item.organization].filter(Boolean).join(" at ")}</div>
              {renderDateRange(item.startDate, item.endDate) && (
                <div style={dateText}>{renderDateRange(item.startDate, item.endDate)}</div>
              )}
            </div>
            {renderBullets(item.bullets ?? [], inRail)}
          </div>
        ))}
      </div>
    ) : null;

  const publicationsBlock = (inRail: boolean) =>
    publications.items.length > 0 ? (
      <div key="publications" data-resume-section="publications">
        {sectionHeading("Publications")}
        {publications.items.map((item, i) => (
          <div key={i} data-resume-entry="" style={entryGap(inRail, i, publications.items.length)}>
            <div style={entryTitle(inRail)}>{item.title}</div>
            {item.publisher && <div style={entrySub(inRail)}>{item.publisher}</div>}
            {item.date && <div style={dateText}>{formatDate(item.date)}</div>}
            {item.url && <div style={{ ...dateText, wordBreak: "break-word" }}>{item.url}</div>}
          </div>
        ))}
      </div>
    ) : null;

  // Contact lives in the rail as labelled blocks (no separators, no icons).
  const contactBlock = () => {
    const fields = [
      { label: "Address", value: contact.location },
      { label: "Email", value: contact.email },
      { label: "Phone", value: contact.phone },
      { label: "LinkedIn", value: contact.linkedin },
      { label: "Website", value: contact.website },
    ].filter((f) => f.value);
    if (fields.length === 0) return null;
    return (
      <div key="contact" data-resume-section="contact">
        {sectionHeading("Contact")}
        {fields.map((f, i) => railBlock(f.label, f.value, i, fields.length))}
      </div>
    );
  };

  const sectionMap: Record<string, (inRail: boolean) => React.ReactNode> = {
    contact: contactBlock,
    targetTitle: () => null,
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

  // targetTitle is pinned to the header and contact to the top of the rail.
  // The rail follows `sidebarSections`; the main column follows `sectionOrder`
  // minus whatever sits in the rail.
  const DEFAULT_RIGHT = ["contact", "skills", "certifications", "awards"];
  const rightKeys = design.sidebarSections ?? DEFAULT_RIGHT;
  const railKeys = ["contact", ...rightKeys.filter((key) => key !== "contact" && key !== "targetTitle")];
  const railSet = new Set(railKeys);
  const isVisible = (key: string) => visibleSections.includes(key as (typeof visibleSections)[number]);
  const toEntries = (keys: string[], inRail: boolean) =>
    keys
      .filter((key) => key !== "targetTitle" && isVisible(key) && sectionMap[key])
      .map((key) => ({ key, node: sectionMap[key](inRail) }))
      .filter((entry) => !!entry.node);

  const mainContent = toEntries((design.sectionOrder || []).filter((key) => !railSet.has(key)), false);
  const railContent = toEntries(railKeys, true);

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

  const showName = isVisible("contact") && !!contact.name;
  const showTitle = isVisible("targetTitle") && !!targetTitle.title;

  return (
    <div
      data-template="ember"
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
      {(showName || showTitle) && (
        <div data-resume-section="targetTitle" style={{ textAlign: headerAlignment, marginBottom: sectionSpacing + 4 }}>
          {showName && (
            <div
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "calc(var(--resume-name-size) + 2pt)",
                fontWeight: "var(--resume-name-weight)" as unknown as number,
                lineHeight: 1.15,
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
                ...baseText,
                fontSize: "calc(var(--resume-body-size) + 3pt)",
                lineHeight: 1.3,
                marginTop: 4,
              }}
            >
              {targetTitle.title}
            </div>
          )}
        </div>
      )}

      {/* Independent column flow: the rail starts level with the first main heading. */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 66fr) minmax(0, 28fr)",
          columnGap: "6%",
          alignItems: "start",
        }}
      >
        <div style={{ minWidth: 0 }}>{renderColumn(mainContent)}</div>
        <div style={{ minWidth: 0 }}>{renderColumn(railContent)}</div>
      </div>
    </div>
  );
}

export default Ember;
