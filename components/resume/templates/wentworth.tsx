import type { TemplateProps } from "./classic";

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

function InlineIcon({
  kind,
  color,
}: {
  kind: "globe" | "linkedin" | "pin" | "mail" | "phone";
  color: string;
}) {
  const common = {
    width: 10,
    height: 10,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
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
    case "mail":
      return (
        <svg {...common}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
  }
}

export function Wentworth({
  content,
  design,
  formatDate,
  bulletChar,
  visibleSections,
  sectionSpacing = 16,
  marginX = 0.5,
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
  const nameLight = "#666";
  const nameDark = "#111";
  const titleMuted = "#999";
  const bodyText = "#555";
  const entryTitle = "#1a1a1a";
  const thickBar = `color-mix(in srgb, ${accent} 35%, #bcbcbc)`;
  const headingBorder = `color-mix(in srgb, ${accent} 20%, #e8e8e8)`;
  const headerAlign = design.headerAlignment || "left";

  // Name parsing — first word vs remaining words
  const nameParts = (contact.name || "").trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts.length > 1 ? nameParts[0]! : "";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : nameParts[0] || "";
  const hasSplitName = nameParts.length > 1;

  const contactRow = [
    contact.email && { kind: "mail" as const, value: contact.email },
    contact.phone && { kind: "phone" as const, value: contact.phone },
    contact.location && { kind: "pin" as const, value: contact.location },
    contact.linkedin && { kind: "linkedin" as const, value: contact.linkedin },
    contact.website && { kind: "globe" as const, value: contact.website },
  ].filter(Boolean) as { kind: "globe" | "linkedin" | "pin" | "mail" | "phone"; value: string }[];

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
        fontSize: 12,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.22em",
        color: nameDark,
        marginBottom: 8,
      }}
    >
      {title}
    </div>
  );

  const renderBullets = (bullets: string[]) => {
    const filtered = bullets.filter(Boolean);
    if (filtered.length === 0) return null;
    return (
      <ul
        style={{
          margin: "5px 0 0 0",
          paddingLeft: bulletChar ? 14 : 0,
          listStyle: "none",
          fontFamily: "var(--resume-font)",
          fontSize: 10.5,
          lineHeight: 1.65,
          color: bodyText,
        }}
      >
        {filtered.map((bullet, j) => (
          <li
            key={j}
            style={{
              marginBottom: 2,
              textIndent: bulletChar ? "-12px" : 0,
              paddingLeft: bulletChar ? 12 : 0,
            }}
          >
            {bulletChar && <span style={{ marginRight: 6, color: accent }}>{bulletChar}</span>}
            {bullet}
          </li>
        ))}
      </ul>
    );
  };

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    contact: () => null, // Rendered in dedicated header block
    targetTitle: () => null, // Rendered in dedicated header block

    summary: () =>
      summary.content ? (
        <div key="summary">
          {sectionHeading("Summary")}
          <p
            style={{
              fontFamily: "var(--resume-font)",
              fontSize: "var(--resume-body-size)",
              lineHeight: "var(--resume-line-spacing)",
              color: bodyText,
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
          {experience.items.map((item, i) => {
            const notLast = i < experience.items.length - 1;
            return (
              <div
                key={i}
                data-resume-entry=""
                style={{
                  marginBottom: notLast ? 12 : 0,
                  paddingBottom: notLast ? 12 : 0,
                  borderBottom: notLast ? `1px dashed ${headingBorder}` : undefined,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--resume-font)",
                      fontSize: 12,
                      fontWeight: 700,
                      color: entryTitle,
                    }}
                  >
                    {item.role}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--resume-font)",
                      fontSize: 10,
                      color: titleMuted,
                      whiteSpace: "nowrap",
                      textAlign: "right",
                    }}
                  >
                    {renderDateRange(item.startDate, item.endDate, item.isCurrent)}
                  </div>
                </div>
                {(item.company || item.location) && (
                  <div
                    style={{
                      fontFamily: "var(--resume-font)",
                      fontSize: 10.5,
                      color: titleMuted,
                      marginTop: 2,
                    }}
                  >
                    {[item.company, item.location].filter(Boolean).join(" · ")}
                  </div>
                )}
                {renderBullets(item.bullets)}
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
            const notLast = i < projects.items.length - 1;
            return (
              <div
                key={i}
                data-resume-entry=""
                style={{
                  marginBottom: notLast ? 12 : 0,
                  paddingBottom: notLast ? 12 : 0,
                  borderBottom: notLast ? `1px dashed ${headingBorder}` : undefined,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--resume-font)",
                      fontSize: 12,
                      fontWeight: 700,
                      color: entryTitle,
                    }}
                  >
                    {item.name}
                  </div>
                  {(item.startDate || item.endDate) && (
                    <div
                      style={{
                        fontFamily: "var(--resume-font)",
                        fontSize: 10,
                        color: titleMuted,
                        whiteSpace: "nowrap",
                        textAlign: "right",
                      }}
                    >
                      {renderDateRange(item.startDate, item.endDate)}
                    </div>
                  )}
                </div>
                {item.url && (
                  <div
                    style={{
                      fontFamily: "var(--resume-font)",
                      fontSize: 10.5,
                      color: titleMuted,
                      marginTop: 2,
                    }}
                  >
                    {item.url}
                  </div>
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
            const notLast = i < volunteering.items.length - 1;
            return (
              <div
                key={i}
                data-resume-entry=""
                style={{
                  marginBottom: notLast ? 12 : 0,
                  paddingBottom: notLast ? 12 : 0,
                  borderBottom: notLast ? `1px dashed ${headingBorder}` : undefined,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--resume-font)",
                      fontSize: 12,
                      fontWeight: 700,
                      color: entryTitle,
                    }}
                  >
                    {item.role}
                  </div>
                  {(item.startDate || item.endDate) && (
                    <div
                      style={{
                        fontFamily: "var(--resume-font)",
                        fontSize: 10,
                        color: titleMuted,
                        whiteSpace: "nowrap",
                        textAlign: "right",
                      }}
                    >
                      {renderDateRange(item.startDate, item.endDate)}
                    </div>
                  )}
                </div>
                {item.organization && (
                  <div
                    style={{
                      fontFamily: "var(--resume-font)",
                      fontSize: 10.5,
                      color: titleMuted,
                      marginTop: 2,
                    }}
                  >
                    {item.organization}
                  </div>
                )}
                {renderBullets(item.bullets)}
              </div>
            );
          })}
        </div>
      ) : null,

    awards: () =>
      awards.items.length > 0 ? (
        <div key="awards">
          {sectionHeading("Awards")}
          {awards.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{
                marginBottom: i < awards.items.length - 1 ? 8 : 0,
                fontFamily: "var(--resume-font)",
                fontSize: 10.5,
                lineHeight: 1.5,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "baseline",
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: entryTitle }}>{item.title}</span>
                  {item.issuer && (
                    <span style={{ color: bodyText }}> — {item.issuer}</span>
                  )}
                </div>
                {item.date && (
                  <div style={{ color: titleMuted, whiteSpace: "nowrap", fontSize: 10 }}>
                    {formatDate(item.date)}
                  </div>
                )}
              </div>
              {item.description && (
                <p style={{ margin: "2px 0 0 0", color: bodyText }}>{item.description}</p>
              )}
            </div>
          ))}
        </div>
      ) : null,

    publications: () =>
      publications.items.length > 0 ? (
        <div key="publications">
          {sectionHeading("Publications")}
          {publications.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{
                marginBottom: i < publications.items.length - 1 ? 8 : 0,
                fontFamily: "var(--resume-font)",
                fontSize: 10.5,
                lineHeight: 1.5,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "baseline",
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: entryTitle }}>{item.title}</span>
                  {item.publisher && (
                    <span style={{ color: bodyText }}> — {item.publisher}</span>
                  )}
                </div>
                {item.date && (
                  <div style={{ color: titleMuted, whiteSpace: "nowrap", fontSize: 10 }}>
                    {formatDate(item.date)}
                  </div>
                )}
              </div>
              {item.url && (
                <div style={{ color: titleMuted, fontSize: 10, marginTop: 2 }}>{item.url}</div>
              )}
            </div>
          ))}
        </div>
      ) : null,

    // Bottom-two-col renderers — rendered inside a dedicated grid block
    education: () =>
      education.items.length > 0 ? (
        <div key="education">
          {sectionHeading("Education")}
          {education.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{
                marginBottom: i < education.items.length - 1 ? 8 : 0,
                fontFamily: "var(--resume-font)",
                fontSize: 10.5,
                lineHeight: 1.5,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "baseline",
                }}
              >
                <div style={{ fontWeight: 700, color: entryTitle, flex: 1 }}>
                  {[item.degree, item.field].filter(Boolean).join(" in ")}
                </div>
                {(item.startDate || item.endDate) && (
                  <div
                    style={{
                      color: titleMuted,
                      whiteSpace: "nowrap",
                      fontSize: 10,
                      textAlign: "right",
                    }}
                  >
                    {renderDateRange(item.startDate, item.endDate)}
                  </div>
                )}
              </div>
              {item.institution && (
                <div style={{ color: titleMuted, marginTop: 1 }}>{item.institution}</div>
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
            <div
              key={i}
              data-resume-entry=""
              style={{
                marginBottom: i < certifications.items.length - 1 ? 8 : 0,
                fontFamily: "var(--resume-font)",
                fontSize: 10.5,
                lineHeight: 1.5,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "baseline",
                }}
              >
                <div style={{ fontWeight: 700, color: entryTitle, flex: 1 }}>{item.name}</div>
                {(item.startDate || item.endDate) && (
                  <div
                    style={{
                      color: titleMuted,
                      whiteSpace: "nowrap",
                      fontSize: 10,
                      textAlign: "right",
                    }}
                  >
                    {renderDateRange(item.startDate, item.endDate, item.isCurrent)}
                  </div>
                )}
              </div>
              {item.issuer && (
                <div style={{ color: titleMuted, marginTop: 1 }}>{item.issuer}</div>
              )}
            </div>
          ))}
        </div>
      ) : null,

    skills: () =>
      skills.categories.length > 0 ? (
        <div key="skills">
          {sectionHeading("Skills")}
          {skills.categories.map((cat, i) => (
            <div
              key={i}
              style={{
                marginBottom: i < skills.categories.length - 1 ? 8 : 0,
                fontFamily: "var(--resume-font)",
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: titleMuted,
                  marginBottom: 3,
                }}
              >
                // {cat.name}
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  lineHeight: 1.55,
                  color: bodyText,
                }}
              >
                {cat.skills.join(", ")}
              </div>
            </div>
          ))}
        </div>
      ) : null,
  };

  // Bottom block: education + certifications (left) and skills (right)
  const BOTTOM_LEFT_KEYS = new Set(["education", "certifications"]);
  const BOTTOM_RIGHT_KEYS = new Set(["skills"]);
  const BOTTOM_KEYS = new Set([...BOTTOM_LEFT_KEYS, ...BOTTOM_RIGHT_KEYS]);

  const orderedSections = (design.sectionOrder || [])
    .filter((k) => visibleSections.includes(k as typeof visibleSections[number]))
    .filter((k) => k !== "contact" && k !== "targetTitle");

  const topSections = orderedSections.filter((k) => !BOTTOM_KEYS.has(k));
  const bottomLeftSections = orderedSections.filter((k) => BOTTOM_LEFT_KEYS.has(k));
  const bottomRightSections = orderedSections.filter((k) => BOTTOM_RIGHT_KEYS.has(k));

  const showHeader = visibleSections.includes("contact");
  const showTitle = visibleSections.includes("targetTitle") && !!targetTitle.title;

  const avatarMode = design.avatarMode ?? "initials";
  const avatarShape = design.avatarShape ?? "circle";
  const avatarSize = design.avatarSize ?? 92;
  const avatarInitialsBg = design.avatarInitialsBg ?? "white";
  const avatarPosition = design.avatarPosition ?? "right";
  const resolvedAccent = typeof accent === "string" ? accent : "#1a1a1a";
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

  const justifyForAlign =
    headerAlign === "center" ? "center" : headerAlign === "right" ? "flex-end" : "flex-start";

  // Build bottom block nodes
  const bottomLeftNodes = bottomLeftSections
    .map((key) => ({ key, node: sectionRenderers[key]?.() }))
    .filter((x): x is { key: string; node: React.ReactNode } => !!x.node);
  const bottomRightNodes = bottomRightSections
    .map((key) => ({ key, node: sectionRenderers[key]?.() }))
    .filter((x): x is { key: string; node: React.ReactNode } => !!x.node);
  const hasBottomBlock = bottomLeftNodes.length > 0 || bottomRightNodes.length > 0;

  const topNodes = topSections
    .map((key) => ({ key, node: sectionRenderers[key]?.() }))
    .filter((x): x is { key: string; node: React.ReactNode } => !!x.node);

  const sep = contactSeparator && contactSeparator.trim() ? contactSeparator : " // ";

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
        <div style={{ marginBottom: 18 }}>
          {/* Thick top border — full width */}
          <div
            style={{
              height: 6,
              background: thickBar,
              marginBottom: 16,
              width: "100%",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              justifyContent: "space-between",
            }}
          >
            {showAvatar && avatarPosition === "left" && avatarNode}
            <div style={{ flex: 1, minWidth: 0, textAlign: headerAlign }}>
              {/* Name block */}
              <div style={{ lineHeight: 1 }}>
                {hasSplitName ? (
                  <>
                    <div
                      style={{
                        fontFamily: "var(--resume-font)",
                        fontSize: 42,
                        fontWeight: 300,
                        color: nameLight,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        lineHeight: 1,
                      }}
                    >
                      {firstName}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--resume-font)",
                        fontSize: 42,
                        fontWeight: 700,
                        color: nameDark,
                        textTransform: "uppercase",
                        letterSpacing: "0.02em",
                        lineHeight: 1.1,
                        marginTop: 2,
                      }}
                    >
                      {lastName}
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      fontFamily: "var(--resume-font)",
                      fontSize: 42,
                      fontWeight: 700,
                      color: nameDark,
                      textTransform: "uppercase",
                      letterSpacing: "0.02em",
                      lineHeight: 1.1,
                    }}
                  >
                    {lastName}
                  </div>
                )}
              </div>

              {/* Target title */}
              {showTitle && (
                <div
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: 10.5,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: titleMuted,
                    fontWeight: 500,
                    marginTop: 8,
                  }}
                >
                  {targetTitle.title}
                </div>
              )}
            </div>

            {/* Photo — configurable (default: circular 92px floated right) */}
            {showAvatar && avatarPosition === "right" && avatarNode}
          </div>

          {/* Thick border #2 — full width under name/photo */}
          <div
            style={{
              height: 6,
              background: thickBar,
              marginTop: 14,
              marginBottom: 12,
              width: "100%",
            }}
          />

          {/* Contact bar */}
          {contactRow.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                alignItems: "center",
                justifyContent: justifyForAlign,
                fontFamily: "var(--resume-font)",
                fontSize: 10,
                color: titleMuted,
              }}
            >
              {contactRow.map((f, i) => (
                <span
                  key={i}
                  style={{ display: "inline-flex", alignItems: "center", gap: 10 }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <InlineIcon kind={f.kind} color={titleMuted} />
                    <span>{f.value}</span>
                  </span>
                  {i < contactRow.length - 1 && (
                    <span
                      style={{
                        color: "#bbb",
                        fontFamily: "var(--resume-font)",
                        fontWeight: 400,
                      }}
                    >
                      {sep.trim() || "//"}
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TOP SECTIONS (summary, experience, projects, volunteering, awards, publications) */}
      {topNodes.map(({ key, node }, i) => {
        const hasPageBreak = pageBreaks.includes(key);
        return (
          <div
            key={key}
            data-resume-section=""
            {...(hasPageBreak ? { "data-page-break-before": "" } : {})}
            style={{
              marginTop: i > 0 ? `${sectionSpacing}px` : undefined,
              ...(hasPageBreak ? { pageBreakBefore: "always" as const } : {}),
            }}
          >
            {node}
          </div>
        );
      })}

      {/* BOTTOM TWO-COLUMN BLOCK */}
      {hasBottomBlock && (
        <div
          style={{
            display: "flex",
            gap: 28,
            alignItems: "flex-start",
            marginTop: topNodes.length > 0 ? `${sectionSpacing}px` : 0,
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: `${sectionSpacing}px`,
            }}
          >
            {bottomLeftNodes.map(({ key, node }) => {
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
            {bottomRightNodes.map(({ key, node }) => {
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
        </div>
      )}
    </div>
  );
}

export default Wentworth;
