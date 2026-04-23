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
  if (shape === "rounded") return Math.round(size * 0.12);
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
          flexShrink: 0,
          border: "3px solid rgba(255,255,255,0.85)",
        }}
      />
    );
  }

  const onAccent = initialsBg === "accent";
  const bg = onAccent ? accent : "#ffffff";
  const fg = onAccent ? "#ffffff" : accent;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: bg,
        border: "3px solid rgba(255,255,255,0.85)",
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

type ContactIconKind = "phone" | "mail" | "globe" | "map" | "linkedin" | "user" | "cake";

function ContactIcon({ kind, size = 18 }: { kind: ContactIconKind; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#ffffff",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
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
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "map":
      return (
        <svg {...common}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case "linkedin":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#ffffff">
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.6v1.7h.05c.5-.9 1.7-1.9 3.5-1.9 3.75 0 4.45 2.45 4.45 5.65V21H17.7v-5.4c0-1.3 0-3-1.85-3s-2.15 1.45-2.15 2.9V21H10z" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
        </svg>
      );
    case "cake":
      return (
        <svg {...common}>
          <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
          <path d="M4 16h16" />
          <path d="M12 11V7" />
          <path d="M10 7a2 2 0 1 1 4 0c0 1-1 2-2 3-1-1-2-2-2-3z" />
        </svg>
      );
  }
}

function IconChip({ kind, accent }: { kind: ContactIconKind; accent: string }) {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.2)",
        border: "1.5px solid rgba(255,255,255,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: accent,
      }}
    >
      <ContactIcon kind={kind} size={14} />
    </div>
  );
}

export function Coastal({
  content,
  design,
  formatDate,
  bulletChar,
  visibleSections,
  sectionSpacing = 14,
  marginX = 0,
  marginY = 0,
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
  const darkText = "#1a1a1a";
  const bodyText = "#333";
  const mutedText = "#666";
  const resolvedAccent =
    typeof design.accentColor === "string" && design.accentColor.startsWith("#")
      ? design.accentColor
      : "#1a7a6d";

  const avatarMode = design.avatarMode ?? "photo";
  const avatarShape = design.avatarShape ?? "rounded";
  const avatarSize = design.avatarSize ?? 140;
  const avatarInitialsBg = design.avatarInitialsBg ?? "white";
  const showAvatar = avatarMode !== "off";

  const horizontalPad = `${Math.max(marginX, 0.5)}in`;
  const verticalPadBody = `${Math.max(marginY, 0.4)}in`;

  const renderDateRange = (start: string, end: string, isCurrent?: boolean) => {
    const s = formatDate(start);
    const e = isCurrent ? "Present" : formatDate(end);
    if (!s && !e) return "";
    return s && e ? `${s} - ${e}` : s || e;
  };

  const sectionTitle = (title: string) => (
    <div
      data-resume-section-title=""
      style={{
        fontFamily: "var(--resume-font)",
        fontSize: "calc(var(--resume-heading-size) + 1pt)",
        fontWeight: "var(--resume-heading-weight)" as unknown as number,
        textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
        letterSpacing: 1.2,
        color: darkText,
        borderBottom: "1.5px solid #1a1a1a",
        paddingBottom: 4,
        marginBottom: 8,
      }}
    >
      {title}
    </div>
  );

  const triangle = (
    <span style={{ color: darkText, marginRight: 6, fontSize: "0.7em", lineHeight: 1 }}>▶</span>
  );

  const renderBullets = (bullets: string[]) => {
    const filtered = bullets.filter(Boolean);
    if (filtered.length === 0) return null;
    return (
      <ul
        style={{
          margin: "4px 0 0 0",
          padding: 0,
          listStyle: "none",
          fontFamily: "var(--resume-font)",
          fontSize: "var(--resume-body-size)",
          lineHeight: "var(--resume-line-spacing)",
          color: bodyText,
        }}
      >
        {filtered.map((b, j) => (
          <li
            key={j}
            style={{
              marginBottom: 2,
              textIndent: bulletChar ? -10 : 0,
              paddingLeft: bulletChar ? 10 : 0,
            }}
          >
            {bulletChar && <span style={{ marginRight: 4, color: bodyText }}>{bulletChar || "-"}</span>}
            {b}
          </li>
        ))}
      </ul>
    );
  };

  // Entry heading row (triangle marker + title on left, date on right)
  const entryHeading = (title: string, subtitle: string | null, date: string) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 12,
        fontFamily: "var(--resume-font)",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 2, minWidth: 0 }}>
        {triangle}
        <div>
          <div style={{ fontWeight: 700, color: darkText, fontSize: "calc(var(--resume-body-size) + 0.5pt)" }}>
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontStyle: "italic",
                color: mutedText,
                fontSize: "var(--resume-body-size)",
                marginTop: 1,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {date && (
        <div
          style={{
            color: darkText,
            fontSize: "var(--resume-body-size)",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {date}
        </div>
      )}
    </div>
  );

  // Section renderers
  const experienceBlock =
    experience.items.length > 0 ? (
      <div key="experience">
        {sectionTitle("Work Experience")}
        {experience.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{ marginBottom: i < experience.items.length - 1 ? 10 : 0 }}
          >
            {entryHeading(
              item.company || item.role,
              item.role && item.company ? item.role : null,
              renderDateRange(item.startDate, item.endDate, item.isCurrent),
            )}
            {renderBullets(item.bullets)}
          </div>
        ))}
      </div>
    ) : null;

  const educationBlock =
    education.items.length > 0 ? (
      <div key="education">
        {sectionTitle("Education")}
        {education.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{
              marginBottom: i < education.items.length - 1 ? 8 : 0,
              fontFamily: "var(--resume-font)",
              fontSize: "var(--resume-body-size)",
              lineHeight: "var(--resume-line-spacing)",
            }}
          >
            {entryHeading(
              item.institution,
              [item.degree, item.field].filter(Boolean).join(" ") || null,
              renderDateRange(item.startDate, item.endDate),
            )}
          </div>
        ))}
      </div>
    ) : null;

  const skillsBlock =
    skills.categories.length > 0 ? (
      <div key="skills">
        {sectionTitle("Skills")}
        {skills.categories.map((cat, i) => {
          const filtered = cat.skills.filter(Boolean);
          if (filtered.length === 0) return null;
          return (
            <div key={i} style={{ marginBottom: i < skills.categories.length - 1 ? 8 : 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 4,
                  fontFamily: "var(--resume-font)",
                  fontWeight: 700,
                  color: darkText,
                  fontSize: "calc(var(--resume-body-size) + 0.5pt)",
                }}
              >
                {triangle}
                <span>{cat.name || "Skills"}</span>
              </div>
              <div
                style={{
                  marginTop: 2,
                  marginLeft: 14,
                  fontFamily: "var(--resume-font)",
                  fontSize: "var(--resume-body-size)",
                  lineHeight: "var(--resume-line-spacing)",
                  color: bodyText,
                }}
              >
                - {filtered.join(", ")}
              </div>
            </div>
          );
        })}
      </div>
    ) : null;

  const certificationsBlock =
    certifications.items.length > 0 ? (
      <div key="certifications">
        {sectionTitle("Certifications")}
        {certifications.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{
              marginBottom: i < certifications.items.length - 1 ? 8 : 0,
              fontFamily: "var(--resume-font)",
              fontSize: "var(--resume-body-size)",
              lineHeight: "var(--resume-line-spacing)",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              {triangle}
              <div style={{ fontWeight: 700, color: darkText }}>
                {formatDate(item.endDate) || formatDate(item.startDate) || item.name}
              </div>
            </div>
            {(item.name || item.issuer) && (
              <div style={{ marginLeft: 14, marginTop: 2, color: bodyText }}>
                {[item.name, item.issuer].filter(Boolean).join(" — ")}
              </div>
            )}
          </div>
        ))}
      </div>
    ) : null;

  const awardsBlock =
    awards.items.length > 0 ? (
      <div key="awards">
        {sectionTitle("Honors & Awards")}
        {awards.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{
              marginBottom: i < awards.items.length - 1 ? 8 : 0,
              fontFamily: "var(--resume-font)",
              fontSize: "var(--resume-body-size)",
              lineHeight: "var(--resume-line-spacing)",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              {triangle}
              <div style={{ fontWeight: 700, color: darkText }}>
                {item.date ? formatDate(item.date) : item.title}
              </div>
            </div>
            <div style={{ marginLeft: 14, marginTop: 2, color: bodyText }}>
              {[item.title, item.issuer, item.description].filter(Boolean).join(" — ")}
            </div>
          </div>
        ))}
      </div>
    ) : null;

  const projectsBlock =
    projects.items.length > 0 ? (
      <div key="projects">
        {sectionTitle("Projects")}
        {projects.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{ marginBottom: i < projects.items.length - 1 ? 10 : 0 }}
          >
            {entryHeading(
              item.name,
              item.url || null,
              renderDateRange(item.startDate, item.endDate),
            )}
            {renderBullets(item.bullets)}
          </div>
        ))}
      </div>
    ) : null;

  const volunteerBlock =
    volunteering.items.length > 0 ? (
      <div key="volunteering">
        {sectionTitle("Activities")}
        {volunteering.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{ marginBottom: i < volunteering.items.length - 1 ? 10 : 0 }}
          >
            {entryHeading(
              item.organization || item.role,
              item.role && item.organization ? item.role : null,
              renderDateRange(item.startDate, item.endDate),
            )}
            {renderBullets(item.bullets)}
          </div>
        ))}
      </div>
    ) : null;

  const publicationsBlock =
    publications.items.length > 0 ? (
      <div key="publications">
        {sectionTitle("Publications")}
        {publications.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{
              marginBottom: i < publications.items.length - 1 ? 6 : 0,
              fontFamily: "var(--resume-font)",
              fontSize: "var(--resume-body-size)",
              lineHeight: "var(--resume-line-spacing)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, minWidth: 0 }}>
                {triangle}
                <div>
                  <span style={{ fontWeight: 700, color: darkText }}>{item.title}</span>
                  {item.publisher && <span style={{ color: bodyText }}> — {item.publisher}</span>}
                </div>
              </div>
              {item.date && (
                <div style={{ color: darkText, fontWeight: 500, whiteSpace: "nowrap" }}>
                  {formatDate(item.date)}
                </div>
              )}
            </div>
            {item.url && (
              <div style={{ marginLeft: 14, color: accent, fontSize: "calc(var(--resume-body-size) - 0.5pt)" }}>
                {item.url}
              </div>
            )}
          </div>
        ))}
      </div>
    ) : null;

  const sectionMap: Record<string, React.ReactNode> = {
    summary: null, // summary rendered in header block
    experience: experienceBlock,
    education: educationBlock,
    skills: skillsBlock,
    certifications: certificationsBlock,
    awards: awardsBlock,
    projects: projectsBlock,
    volunteering: volunteerBlock,
    publications: publicationsBlock,
    contact: null,
    targetTitle: null,
  };

  // Default right-column sections (skills-heavy: skills, awards, certifications)
  const COASTAL_RIGHT_DEFAULT = ["skills", "awards", "certifications"];
  const rightKeys = new Set(design.sidebarSections ?? COASTAL_RIGHT_DEFAULT);
  const order = design.sectionOrder || [];

  const leftContent: { key: string; node: React.ReactNode }[] = [];
  const rightContent: { key: string; node: React.ReactNode }[] = [];

  for (const key of order) {
    if (key === "contact" || key === "targetTitle" || key === "summary") continue;
    if (!visibleSections.includes(key as typeof visibleSections[number])) continue;
    const node = sectionMap[key];
    if (!node) continue;
    if (rightKeys.has(key)) rightContent.push({ key, node });
    else leftContent.push({ key, node });
  }

  const showHeader = visibleSections.includes("contact");
  const showTargetTitle = visibleSections.includes("targetTitle") && targetTitle.title;
  const showSummary = visibleSections.includes("summary") && !!summary.content;

  const contactRow: { kind: ContactIconKind; value: string }[] = [];
  if (contact.phone) contactRow.push({ kind: "phone", value: contact.phone });
  if (contact.email) contactRow.push({ kind: "mail", value: contact.email });
  if (contact.website) contactRow.push({ kind: "globe", value: contact.website });
  if (contact.linkedin) contactRow.push({ kind: "linkedin", value: contact.linkedin });
  if (contact.location) contactRow.push({ kind: "map", value: contact.location });

  return (
    <div
      data-template="coastal"
      style={{
        fontFamily: "var(--resume-font)",
        fontSize: "var(--resume-body-size)",
        lineHeight: "var(--resume-line-spacing)",
        color: bodyText,
        background: "#ffffff",
      }}
    >
      {showHeader && (
        <div style={{ position: "relative" }}>
          {/* Top pale strip with name + title */}
          <div
            style={{
              background: "#f5f5f3",
              padding: `24px ${horizontalPad} 18px`,
              paddingRight: showAvatar
                ? `calc(${horizontalPad} + ${avatarSize + 12}px)`
                : horizontalPad,
              position: "relative",
              minHeight: showAvatar ? Math.round(avatarSize * 0.6) : 0,
            }}
          >
            {/* Decorative accent block behind the photo (peeks from the top-right) */}
            {showAvatar && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: `calc(${horizontalPad} + ${Math.round(avatarSize * 0.45)}px)`,
                  width: Math.round(avatarSize * 0.45),
                  height: Math.round(avatarSize * 0.45),
                  background: resolvedAccent,
                  opacity: 0.95,
                  zIndex: 0,
                }}
              />
            )}

            <div style={{ position: "relative", zIndex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-name-size) + 2pt)",
                  fontWeight: "var(--resume-name-weight)" as unknown as number,
                  color: resolvedAccent,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  lineHeight: 1.05,
                }}
              >
                {contact.name}
              </div>
              {showTargetTitle && (
                <div
                  style={{
                    marginTop: 6,
                    fontFamily: "var(--resume-font)",
                    fontSize: "calc(var(--resume-body-size) + 3pt)",
                    color: resolvedAccent,
                    textTransform: "uppercase",
                    letterSpacing: 1.5,
                    fontWeight: 500,
                  }}
                >
                  {targetTitle.title}
                </div>
              )}
            </div>
          </div>

          {/* Accent band with objective + contact icons */}
          <div
            style={{
              background: resolvedAccent,
              padding: `18px ${horizontalPad} 20px`,
              paddingRight: showAvatar
                ? `calc(${horizontalPad} + ${avatarSize + 12}px)`
                : horizontalPad,
              color: "#ffffff",
              position: "relative",
              minHeight: showAvatar ? Math.round(avatarSize * 0.55) : 0,
            }}
          >
            {showSummary && (
              <>
                <div
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: "calc(var(--resume-heading-size) + 2pt)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1.5,
                    marginBottom: 6,
                  }}
                >
                  Objective
                </div>
                <div
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: "var(--resume-body-size)",
                    lineHeight: "var(--resume-line-spacing)",
                    color: "#ffffff",
                  }}
                >
                  {summary.content}
                </div>
              </>
            )}

            {contactRow.length > 0 && (
              <div
                style={{
                  marginTop: showSummary ? 14 : 0,
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  columnGap: 20,
                  rowGap: 8,
                }}
              >
                {contactRow.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      minWidth: 0,
                      fontFamily: "var(--resume-font)",
                      fontSize: "var(--resume-body-size)",
                      color: "#ffffff",
                    }}
                  >
                    <IconChip kind={c.kind} accent={resolvedAccent} />
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      {c.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Avatar — absolutely positioned so it straddles the pale strip + teal band */}
          {showAvatar && (
            <div
              style={{
                position: "absolute",
                top: 24,
                right: horizontalPad,
                zIndex: 2,
              }}
            >
              <Avatar
                name={contact.name}
                photoUrl={contact.photoUrl}
                accent={resolvedAccent}
                mode={avatarMode}
                shape={avatarShape}
                size={avatarSize}
                initialsBg={avatarInitialsBg}
              />
            </div>
          )}
        </div>
      )}

      {/* BODY — two columns */}
      <div
        style={{
          display: "flex",
          gap: 24,
          padding: `${verticalPadBody} ${horizontalPad}`,
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            flex: "1 1 60%",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: `${sectionSpacing}px`,
          }}
        >
          {leftContent.map(({ key, node }) => {
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
            flex: "1 1 40%",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: `${sectionSpacing}px`,
          }}
        >
          {rightContent.map(({ key, node }) => {
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
    </div>
  );
}

export default Coastal;
