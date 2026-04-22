import type { TemplateProps } from "./classic";

type SkillEntry = { name: string; highlight: boolean };

const HIGHLIGHTED_PER_CATEGORY = 2;

function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

type AvatarProps = {
  name: string;
  photoUrl?: string;
  accent: string;
  mode: "photo" | "initials" | "off";
  shape: "circle" | "rounded" | "square";
  size: number;
  initialsBg: "accent" | "white";
};

function shapeRadius(shape: "circle" | "rounded" | "square", size: number): string | number {
  if (shape === "circle") return "50%";
  if (shape === "rounded") return Math.round(size * 0.18);
  return 2;
}

function Avatar({ name, photoUrl, accent, mode, shape, size, initialsBg }: AvatarProps) {
  if (mode === "off") return null;
  const radius = shapeRadius(shape, size);

  if (mode === "photo" && photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          objectFit: "cover",
          border: `2px solid ${accent}22`,
          flexShrink: 0,
        }}
      />
    );
  }

  const onAccent = initialsBg === "accent";
  const bg = onAccent ? accent : "#ffffff";
  const fg = onAccent ? "#ffffff" : accent;
  const borderColor = onAccent ? `${accent}` : `${accent}66`;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: bg,
        border: `1.5px solid ${borderColor}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: fg,
        fontWeight: 600,
        fontSize: Math.round(size * 0.32),
        letterSpacing: 0.5,
        fontFamily: "var(--resume-font)",
      }}
    >
      {getInitials(name) || (
        <svg width={Math.round(size * 0.48)} height={Math.round(size * 0.48)} viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="1.5">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
        </svg>
      )}
    </div>
  );
}

function InlineIcon({ kind, color }: { kind: "globe" | "linkedin" | "pin" | "calendar" | "mail" | "phone"; color: string }) {
  const common = { width: 11, height: 11, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "globe":
      return (
        <svg {...common}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
      );
    case "linkedin":
      return (
        <svg {...common} fill={color} stroke="none"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.6v1.7h.05c.5-.9 1.7-1.9 3.5-1.9 3.75 0 4.45 2.45 4.45 5.65V21H17.7v-5.4c0-1.3 0-3-1.85-3s-2.15 1.45-2.15 2.9V21H10z" /></svg>
      );
    case "pin":
      return (
        <svg {...common}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
      );
    case "calendar":
      return (
        <svg {...common}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
      );
    case "mail":
      return (
        <svg {...common}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
      );
    case "phone":
      return (
        <svg {...common}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
      );
  }
}

export function AuroraTemplate({
  content,
  design,
  formatDate,
  bulletChar,
  visibleSections,
  sectionSpacing = 16,
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
  const mutedText = "#6b7280";
  const darkText = "#111827";
  const bodyText = "#374151";

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
        fontSize: "var(--resume-heading-size)",
        fontWeight: "var(--resume-heading-weight)" as unknown as number,
        textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
        letterSpacing: 1.2,
        color: darkText,
        paddingBottom: 5,
        marginBottom: 10,
        borderBottom: `1px solid ${darkText}22`,
      }}
    >
      {title}
    </div>
  );

  const titleTags = (targetTitle.title || "")
    .split(/\s*[·•|,]\s*/)
    .map((t) => t.trim())
    .filter(Boolean);

  const contactRow = [
    contact.website && { kind: "globe" as const, value: contact.website },
    contact.linkedin && { kind: "linkedin" as const, value: contact.linkedin },
    contact.email && { kind: "mail" as const, value: contact.email },
    contact.phone && { kind: "phone" as const, value: contact.phone },
    contact.location && { kind: "pin" as const, value: contact.location },
  ].filter(Boolean) as { kind: "globe" | "linkedin" | "pin" | "mail" | "phone"; value: string }[];

  const renderBullets = (bullets: string[]) => {
    const filtered = bullets.filter(Boolean);
    if (filtered.length === 0) return null;
    return (
      <ul
        style={{
          margin: "6px 0 0 0",
          paddingLeft: bulletChar ? 16 : 0,
          listStyle: "none",
          fontFamily: "var(--resume-font)",
          fontSize: "var(--resume-body-size)",
          lineHeight: "var(--resume-line-spacing)",
          color: bodyText,
        }}
      >
        {filtered.map((bullet, j) => (
          <li key={j} style={{ marginBottom: 3, textIndent: bulletChar ? "-12px" : 0, paddingLeft: bulletChar ? 12 : 0 }}>
            {bulletChar && <span style={{ marginRight: 6, color: accent }}>{bulletChar}</span>}
            {bullet}
          </li>
        ))}
      </ul>
    );
  };

  const renderChip = (label: string, filled: boolean, key: React.Key) => (
    <span
      key={key}
      style={{
        display: "inline-block",
        fontFamily: "var(--resume-font)",
        fontSize: "calc(var(--resume-body-size) - 0.5pt)",
        padding: "3px 9px",
        borderRadius: 999,
        whiteSpace: "nowrap",
        background: filled ? accent : "transparent",
        color: filled ? "#fff" : darkText,
        border: filled ? `1px solid ${accent}` : `1px solid ${darkText}33`,
        lineHeight: 1.3,
      }}
    >
      {label}
    </span>
  );

  const renderSkillCategory = (category: { name: string; skills: string[] }, idx: number) => {
    const entries: SkillEntry[] = category.skills.map((skill, i) => ({
      name: skill,
      highlight: i < HIGHLIGHTED_PER_CATEGORY,
    }));
    return (
      <div key={idx} style={{ marginBottom: 10 }}>
        <div
          style={{
            fontFamily: "var(--resume-font)",
            fontSize: "calc(var(--resume-body-size) - 1.5pt)",
            fontWeight: 700,
            color: mutedText,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 6,
          }}
        >
          {category.name}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {entries.map((e, i) => renderChip(e.name, e.highlight, i))}
        </div>
      </div>
    );
  };

  const leftRenderers: Record<string, () => React.ReactNode> = {
    summary: () =>
      summary.content ? (
        <div key="summary">
          {sectionHeading("Summary")}
          <p style={{ fontFamily: "var(--resume-font)", fontSize: "var(--resume-body-size)", lineHeight: "var(--resume-line-spacing)", color: bodyText, margin: 0 }}>
            {summary.content}
          </p>
        </div>
      ) : null,
    experience: () =>
      experience.items.length > 0 ? (
        <div key="experience">
          {sectionHeading("Experience")}
          {experience.items.map((item, i) => (
            <div key={i} data-resume-entry="" style={{ marginBottom: i < experience.items.length - 1 ? 14 : 0 }}>
              <div style={{ fontFamily: "var(--resume-font)", fontSize: "calc(var(--resume-body-size) + 1.5pt)", fontWeight: 700, color: darkText }}>
                {item.role}
              </div>
              {item.company && (
                <div style={{ fontFamily: "var(--resume-font)", fontSize: "var(--resume-body-size)", fontWeight: 600, color: accent, marginTop: 1 }}>
                  {item.company}
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 3, fontFamily: "var(--resume-font)", fontSize: "calc(var(--resume-body-size) - 0.5pt)", color: mutedText }}>
                {(item.startDate || item.endDate || item.isCurrent) && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <InlineIcon kind="calendar" color={mutedText} />
                    {renderDateRange(item.startDate, item.endDate, item.isCurrent)}
                  </span>
                )}
                {item.location && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <InlineIcon kind="pin" color={mutedText} />
                    {item.location}
                  </span>
                )}
              </div>
              {renderBullets(item.bullets)}
            </div>
          ))}
        </div>
      ) : null,
    projects: () =>
      projects.items.length > 0 ? (
        <div key="projects">
          {sectionHeading("Projects")}
          {projects.items.map((item, i) => (
            <div key={i} data-resume-entry="" style={{ marginBottom: i < projects.items.length - 1 ? 12 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontFamily: "var(--resume-font)" }}>
                <div style={{ fontWeight: 700, color: darkText, fontSize: "calc(var(--resume-body-size) + 1pt)" }}>{item.name}</div>
                {(item.startDate || item.endDate) && (
                  <div style={{ color: mutedText, fontSize: "var(--resume-body-size)", whiteSpace: "nowrap" }}>
                    {renderDateRange(item.startDate, item.endDate)}
                  </div>
                )}
              </div>
              {item.url && (
                <div style={{ fontFamily: "var(--resume-font)", fontSize: "calc(var(--resume-body-size) - 1pt)", color: accent, marginTop: 2 }}>{item.url}</div>
              )}
              {renderBullets(item.bullets)}
            </div>
          ))}
        </div>
      ) : null,
    volunteering: () =>
      volunteering.items.length > 0 ? (
        <div key="volunteering">
          {sectionHeading("Volunteering")}
          {volunteering.items.map((item, i) => (
            <div key={i} data-resume-entry="" style={{ marginBottom: i < volunteering.items.length - 1 ? 12 : 0 }}>
              <div style={{ fontFamily: "var(--resume-font)", fontWeight: 700, color: darkText, fontSize: "calc(var(--resume-body-size) + 1pt)" }}>
                {item.role}
              </div>
              {item.organization && (
                <div style={{ fontFamily: "var(--resume-font)", fontSize: "var(--resume-body-size)", color: accent, fontWeight: 600 }}>{item.organization}</div>
              )}
              {(item.startDate || item.endDate) && (
                <div style={{ fontFamily: "var(--resume-font)", fontSize: "calc(var(--resume-body-size) - 0.5pt)", color: mutedText, marginTop: 2 }}>
                  {renderDateRange(item.startDate, item.endDate)}
                </div>
              )}
              {renderBullets(item.bullets)}
            </div>
          ))}
        </div>
      ) : null,
    awards: () =>
      awards.items.length > 0 ? (
        <div key="awards">
          {sectionHeading("Awards")}
          {awards.items.map((item, i) => (
            <div key={i} data-resume-entry="" style={{ marginBottom: i < awards.items.length - 1 ? 10 : 0, fontFamily: "var(--resume-font)", fontSize: "var(--resume-body-size)", lineHeight: "var(--resume-line-spacing)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <span style={{ fontWeight: 700, color: darkText }}>{item.title}</span>
                  {item.issuer && <span style={{ color: bodyText }}> — {item.issuer}</span>}
                </div>
                {item.date && <div style={{ color: mutedText, whiteSpace: "nowrap" }}>{formatDate(item.date)}</div>}
              </div>
              {item.description && <p style={{ margin: "2px 0 0 0", color: bodyText }}>{item.description}</p>}
            </div>
          ))}
        </div>
      ) : null,
    publications: () =>
      publications.items.length > 0 ? (
        <div key="publications">
          {sectionHeading("Publications")}
          {publications.items.map((item, i) => (
            <div key={i} data-resume-entry="" style={{ marginBottom: i < publications.items.length - 1 ? 10 : 0, fontFamily: "var(--resume-font)", fontSize: "var(--resume-body-size)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <span style={{ fontWeight: 700, color: darkText }}>{item.title}</span>
                  {item.publisher && <span style={{ color: bodyText }}> — {item.publisher}</span>}
                </div>
                {item.date && <div style={{ color: mutedText, whiteSpace: "nowrap" }}>{formatDate(item.date)}</div>}
              </div>
              {item.url && <div style={{ fontSize: "calc(var(--resume-body-size) - 1pt)", color: accent, marginTop: 2 }}>{item.url}</div>}
            </div>
          ))}
        </div>
      ) : null,
  };

  const rightRenderers: Record<string, () => React.ReactNode> = {
    skills: () =>
      skills.categories.length > 0 ? (
        <div key="skills">
          {sectionHeading("Skills")}
          {skills.categories.map((cat, i) => renderSkillCategory(cat, i))}
        </div>
      ) : null,
    education: () =>
      education.items.length > 0 ? (
        <div key="education">
          {sectionHeading("Education")}
          {education.items.map((item, i) => (
            <div key={i} data-resume-entry="" style={{ marginBottom: i < education.items.length - 1 ? 10 : 0, fontFamily: "var(--resume-font)" }}>
              <div style={{ fontSize: "var(--resume-body-size)", fontWeight: 700, color: darkText }}>
                {[item.degree, item.field].filter(Boolean).join(" ")}
              </div>
              {item.institution && (
                <div style={{ fontSize: "var(--resume-body-size)", color: bodyText, marginTop: 1 }}>{item.institution}</div>
              )}
              {(item.startDate || item.endDate) && (
                <div style={{ fontSize: "calc(var(--resume-body-size) - 0.5pt)", color: mutedText, marginTop: 1 }}>
                  {renderDateRange(item.startDate, item.endDate)}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,
    certifications: () =>
      certifications.items.length > 0 ? (
        <div key="certifications">
          {sectionHeading("Certifications")}
          {certifications.items.map((item, i) => (
            <div key={i} data-resume-entry="" style={{ marginBottom: i < certifications.items.length - 1 ? 10 : 0, fontFamily: "var(--resume-font)" }}>
              <div style={{ fontSize: "var(--resume-body-size)", fontWeight: 700, color: darkText }}>{item.name}</div>
              {(item.issuer || item.startDate || item.endDate) && (
                <div style={{ fontSize: "calc(var(--resume-body-size) - 0.5pt)", color: mutedText, marginTop: 1 }}>
                  {[item.issuer, renderDateRange(item.startDate, item.endDate, item.isCurrent)].filter(Boolean).join(" · ")}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,
  };

  const DEFAULT_RIGHT = ["skills", "education", "certifications"];
  const rightKeys: string[] = design.sidebarSections ?? DEFAULT_RIGHT;
  const rightSet = new Set(rightKeys);
  const headerKeys = new Set(["contact", "targetTitle"]);

  const leftOrder = (design.sectionOrder || [])
    .filter((k) => visibleSections.includes(k as typeof visibleSections[number]) && !rightSet.has(k) && !headerKeys.has(k));
  const rightOrder = rightKeys.filter((k) => visibleSections.includes(k as typeof visibleSections[number]));

  // Render to nodes first, then filter out nulls. Prevents the per-child marginTop
  // index trick from giving the first VISIBLE section an unwanted top margin when
  // an earlier section rendered empty.
  const leftNodes = leftOrder
    .map((key) => ({ key, node: leftRenderers[key]?.() }))
    .filter((x): x is { key: string; node: React.ReactNode } => !!x.node);
  const rightNodes = rightOrder
    .map((key) => ({ key, node: rightRenderers[key]?.() }))
    .filter((x): x is { key: string; node: React.ReactNode } => !!x.node);

  const showHeader = visibleSections.includes("contact");

  const avatarMode = design.avatarMode ?? "initials";
  const avatarShape = design.avatarShape ?? "circle";
  const avatarSize = design.avatarSize ?? 84;
  const avatarPosition = design.avatarPosition ?? "right";
  const avatarInitialsBg = design.avatarInitialsBg ?? "accent";
  const resolvedAccent = typeof accent === "string" ? accent : "#2C5282";
  const avatarNode = (
    <Avatar
      name={contact.name}
      photoUrl={contact.photoUrl}
      accent={resolvedAccent}
      mode={avatarMode}
      shape={avatarShape}
      size={avatarSize}
      initialsBg={avatarInitialsBg}
    />
  );
  const showAvatar = avatarMode !== "off";

  return (
    <div
      style={{
        fontFamily: "var(--resume-font)",
        fontSize: "var(--resume-body-size)",
        lineHeight: "var(--resume-line-spacing)",
        color: bodyText,
        padding: `${marginY}in ${marginX}in`,
      }}
    >
      {/* HEADER */}
      {showHeader && (
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 18 }}>
          {showAvatar && avatarPosition === "left" && avatarNode}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-name-size)",
                fontWeight: "var(--resume-name-weight)" as unknown as number,
                color: darkText,
                lineHeight: 1.1,
                letterSpacing: -0.5,
              }}
            >
              {contact.name}
            </div>
            {titleTags.length > 0 && visibleSections.includes("targetTitle") && (
              <div style={{ marginTop: 7, display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center", fontFamily: "var(--resume-font)", fontSize: "calc(var(--resume-body-size) + 0.5pt)", color: accent, fontWeight: 600 }}>
                {titleTags.map((t, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
                    {t}
                    {i < titleTags.length - 1 && <span style={{ margin: "0 6px", color: `${darkText}66`, fontWeight: 400 }}>·</span>}
                  </span>
                ))}
              </div>
            )}
            {contactRow.length > 0 && (
              <div style={{ marginTop: 9, display: "flex", flexWrap: "wrap", gap: 14, fontFamily: "var(--resume-font)", fontSize: "calc(var(--resume-body-size) - 0.5pt)", color: mutedText }}>
                {contactRow.map((f, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <InlineIcon kind={f.kind} color={mutedText} />
                    <span>{f.value}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          {showAvatar && avatarPosition === "right" && avatarNode}
        </div>
      )}

      {/* BODY: two columns — flex-direction column + gap keeps both columns'
          first section aligned on the same top baseline. */}
      <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
        <div
          style={{
            width: "62%",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: `${sectionSpacing}px`,
          }}
        >
          {leftNodes.map(({ key, node }) => {
            const hasPageBreak = pageBreaks.includes(key);
            return (
              <div
                key={key}
                data-resume-section=""
                {...(hasPageBreak ? { "data-page-break-before": "" } : {})}
                style={hasPageBreak ? { pageBreakBefore: "always" as const } : undefined}
              >
                {node}
              </div>
            );
          })}
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: `${sectionSpacing}px`,
          }}
        >
          {rightNodes.map(({ key, node }) => (
            <div key={key} data-resume-section="">
              {node}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
