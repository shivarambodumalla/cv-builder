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

function splitName(full: string): { first: string; last: string } {
  const t = (full || "").trim();
  if (!t) return { first: "", last: "" };
  const parts = t.split(/\s+/);
  if (parts.length === 1) return { first: parts[0]!, last: "" };
  const last = parts[parts.length - 1]!;
  const first = parts.slice(0, parts.length - 1).join(" ");
  return { first, last };
}

function SocialIcon({ kind, bg, fg, size = 30 }: { kind: "linkedin" | "globe" | "mail" | "phone" | "github" | "twitter"; bg: string; fg: string; size?: number }) {
  const iconSize = Math.round(size * 0.55);
  const common = {
    width: iconSize,
    height: iconSize,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: fg,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const wrapStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: Math.round(size * 0.22),
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };
  let svg: React.ReactNode = null;
  switch (kind) {
    case "linkedin":
      svg = (
        <svg {...common} fill={fg} stroke="none">
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.6v1.7h.05c.5-.9 1.7-1.9 3.5-1.9 3.75 0 4.45 2.45 4.45 5.65V21H17.7v-5.4c0-1.3 0-3-1.85-3s-2.15 1.45-2.15 2.9V21H10z" />
        </svg>
      );
      break;
    case "globe":
      svg = (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
      break;
    case "mail":
      svg = (
        <svg {...common}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
      break;
    case "phone":
      svg = (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
      break;
    case "github":
      svg = (
        <svg {...common}>
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
      );
      break;
    case "twitter":
      svg = (
        <svg {...common}>
          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
        </svg>
      );
      break;
  }
  return <div style={wrapStyle}>{svg}</div>;
}

export function Blueprint({
  content,
  design,
  formatDate,
  bulletChar,
  visibleSections,
  sectionSpacing = 14,
  marginX = 0,
  marginY = 0,
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

  const accent = "var(--resume-accent)";
  const darkText = "#1a1a1a";
  const bodyText = "#333";
  const mutedText = "#666";
  const borderColor = "#1a1a1a";
  const borderWidth = 2;
  const headerBg = "color-mix(in srgb, var(--resume-accent) 18%, white)";

  const { first, last } = splitName(contact.name || "");

  const renderDateRange = (start: string, end: string, isCurrent?: boolean) => {
    const s = formatDate(start);
    const e = isCurrent ? "Present" : formatDate(end);
    if (!s && !e) return "";
    return s && e ? `${s} – ${e}` : s || e;
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--resume-font)",
    fontSize: "var(--resume-heading-size)",
    fontWeight: "var(--resume-heading-weight)" as unknown as number,
    textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
    color: darkText,
    letterSpacing: 1,
    marginBottom: 6,
  };

  const renderBullets = (bullets: string[], color: string = bodyText) => {
    const filtered = bullets.filter(Boolean);
    if (filtered.length === 0) return null;
    return (
      <ul
        style={{
          margin: "4px 0 0 0",
          paddingLeft: bulletChar ? 16 : 0,
          listStyle: "none",
          fontFamily: "var(--resume-font)",
          fontSize: "var(--resume-body-size)",
          lineHeight: "var(--resume-line-spacing)",
          color,
        }}
      >
        {filtered.map((b, j) => (
          <li
            key={j}
            style={{
              marginBottom: 2,
              textIndent: bulletChar ? -12 : 0,
              paddingLeft: bulletChar ? 12 : 0,
            }}
          >
            {bulletChar && <span style={{ marginRight: 6, color: accent }}>{bulletChar}</span>}
            {b}
          </li>
        ))}
      </ul>
    );
  };

  // Avatar (configurable via design prop)
  const headerAlign: "left" | "center" | "right" = (design.headerAlignment ?? "left") as "left" | "center" | "right";
  const avatarMode = design.avatarMode ?? "initials";
  const avatarShape = design.avatarShape ?? "square";
  const avatarSize = design.avatarSize ?? 140;
  const avatarInitialsBg = design.avatarInitialsBg ?? "accent";
  const avatarPosition = design.avatarPosition ?? "right";
  const resolvedAccent =
    typeof design.accentColor === "string" && design.accentColor.startsWith("#")
      ? design.accentColor
      : "#1a7a6d";
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

  // LEFT COLUMN RENDERERS
  const profileBlock = (
    <div key="profile" style={{ marginBottom: 0 }}>
      <div style={labelStyle}>PROFILE:</div>
      <div
        style={{
          fontFamily: "var(--resume-font)",
          fontSize: "var(--resume-body-size)",
          lineHeight: "var(--resume-line-spacing)",
          color: bodyText,
        }}
      >
        {contact.linkedin && (
          <div style={{ marginBottom: 2, wordBreak: "break-word" }}>{contact.linkedin}</div>
        )}
        {contact.location && <div style={{ marginBottom: 2 }}>{contact.location}</div>}
        {contact.phone && <div style={{ marginBottom: 2 }}>{contact.phone}</div>}
        {contact.email && <div style={{ wordBreak: "break-word" }}>{contact.email}</div>}
      </div>
    </div>
  );

  const contactInfoBlock = (
    <div key="contact-info">
      <div style={labelStyle}>CONTACT INFORMATION:</div>
      <div
        style={{
          fontFamily: "var(--resume-font)",
          fontSize: "var(--resume-body-size)",
          lineHeight: "var(--resume-line-spacing)",
          color: bodyText,
        }}
      >
        {[contact.email, contact.phone, contact.location, contact.linkedin, contact.website]
          .filter(Boolean)
          .join(contactSeparator)}
      </div>
    </div>
  );

  const educationBlock =
    education.items.length > 0 ? (
      <div key="education">
        <div style={labelStyle}>EDUCATION:</div>
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
            <div style={{ fontWeight: 700, color: darkText }}>
              {[item.degree, item.field].filter(Boolean).join(" ")}
            </div>
            {item.institution && <div style={{ color: bodyText }}>{item.institution}</div>}
            {(item.startDate || item.endDate) && (
              <div style={{ color: mutedText, fontSize: "calc(var(--resume-body-size) - 0.5pt)" }}>
                {renderDateRange(item.startDate, item.endDate)}
              </div>
            )}
          </div>
        ))}
      </div>
    ) : null;

  const certificationsBlock =
    certifications.items.length > 0 ? (
      <div key="certifications">
        <div style={labelStyle}>CERTIFICATIONS:</div>
        {certifications.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{
              marginBottom: i < certifications.items.length - 1 ? 6 : 0,
              fontFamily: "var(--resume-font)",
              fontSize: "var(--resume-body-size)",
              lineHeight: "var(--resume-line-spacing)",
            }}
          >
            <div style={{ fontWeight: 700, color: darkText }}>{item.name}</div>
            {(item.issuer || item.startDate || item.endDate) && (
              <div style={{ color: mutedText, fontSize: "calc(var(--resume-body-size) - 0.5pt)" }}>
                {[item.issuer, renderDateRange(item.startDate, item.endDate, item.isCurrent)]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            )}
          </div>
        ))}
      </div>
    ) : null;

  const volunteerBlock =
    volunteering.items.length > 0 ? (
      <div key="volunteering">
        <div style={labelStyle}>VOLUNTEER:</div>
        {volunteering.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{
              marginBottom: i < volunteering.items.length - 1 ? 8 : 0,
              fontFamily: "var(--resume-font)",
              fontSize: "var(--resume-body-size)",
              lineHeight: "var(--resume-line-spacing)",
            }}
          >
            <div style={{ fontWeight: 700, color: darkText }}>{item.role}</div>
            {item.organization && <div style={{ color: bodyText }}>{item.organization}</div>}
            {(item.startDate || item.endDate) && (
              <div style={{ color: mutedText, fontSize: "calc(var(--resume-body-size) - 0.5pt)" }}>
                {renderDateRange(item.startDate, item.endDate)}
              </div>
            )}
            {renderBullets(item.bullets)}
          </div>
        ))}
      </div>
    ) : null;

  const socialRow = (
    <div key="social">
      <div style={labelStyle}>SOCIAL:</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        {contact.linkedin && <SocialIcon kind="linkedin" bg={resolvedAccent} fg="#ffffff" />}
        {contact.website && <SocialIcon kind="globe" bg={resolvedAccent} fg="#ffffff" />}
        {contact.phone && <SocialIcon kind="phone" bg={resolvedAccent} fg="#ffffff" />}
        {contact.email && <SocialIcon kind="mail" bg={resolvedAccent} fg="#ffffff" />}
      </div>
    </div>
  );

  // RIGHT COLUMN RENDERERS
  const summaryBlock = summary.content ? (
    <div key="summary">
      <div style={labelStyle}>PROFESSIONAL SUMMARY:</div>
      <p
        style={{
          fontFamily: "var(--resume-font)",
          fontSize: "var(--resume-body-size)",
          lineHeight: "var(--resume-line-spacing)",
          color: bodyText,
          margin: 0,
          fontStyle: "italic",
        }}
      >
        {summary.content}
      </p>
    </div>
  ) : null;

  const skillsBlock =
    skills.categories.length > 0 ? (
      <div key="skills">
        <div style={labelStyle}>PROFESSIONAL SKILLS:</div>
        {skills.categories.map((cat, i) => {
          const filtered = cat.skills.filter(Boolean);
          if (filtered.length === 0) return null;
          return (
            <div key={i} style={{ marginBottom: 6 }}>
              {cat.name && (
                <div
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                    fontWeight: 700,
                    color: darkText,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    marginBottom: 3,
                  }}
                >
                  {cat.name}
                </div>
              )}
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  columnGap: 12,
                  rowGap: 2,
                  fontFamily: "var(--resume-font)",
                  fontSize: "var(--resume-body-size)",
                  lineHeight: "var(--resume-line-spacing)",
                  color: bodyText,
                }}
              >
                {filtered.map((s, j) => (
                  <li
                    key={j}
                    style={{
                      textIndent: bulletChar ? -12 : 0,
                      paddingLeft: bulletChar ? 12 : 0,
                    }}
                  >
                    {bulletChar && <span style={{ marginRight: 6, color: accent }}>{bulletChar}</span>}
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    ) : null;

  const experienceBlock =
    experience.items.length > 0 ? (
      <div key="experience">
        <div style={labelStyle}>WORK EXPERIENCE:</div>
        {experience.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{ marginBottom: i < experience.items.length - 1 ? 12 : 0 }}
          >
            <div
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "13px",
                fontWeight: 700,
                color: darkText,
              }}
            >
              {item.role}
            </div>
            {(item.company || item.location) && (
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "var(--resume-body-size)",
                  color: accent,
                  fontWeight: 600,
                }}
              >
                {[item.company, item.location].filter(Boolean).join(" · ")}
              </div>
            )}
            {(item.startDate || item.endDate || item.isCurrent) && (
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                  color: mutedText,
                  marginTop: 1,
                }}
              >
                {renderDateRange(item.startDate, item.endDate, item.isCurrent)}
              </div>
            )}
            {renderBullets(item.bullets)}
          </div>
        ))}
      </div>
    ) : null;

  // Additional right-column renderers for projects / awards / publications
  const projectsBlock =
    projects.items.length > 0 ? (
      <div key="projects">
        <div style={labelStyle}>PROJECTS:</div>
        {projects.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{ marginBottom: i < projects.items.length - 1 ? 10 : 0 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                fontFamily: "var(--resume-font)",
              }}
            >
              <div style={{ fontWeight: 700, color: darkText, fontSize: "13px" }}>{item.name}</div>
              {(item.startDate || item.endDate) && (
                <div
                  style={{
                    color: mutedText,
                    fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                    whiteSpace: "nowrap",
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
                  fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                  color: accent,
                  marginTop: 1,
                }}
              >
                {item.url}
              </div>
            )}
            {renderBullets(item.bullets)}
          </div>
        ))}
      </div>
    ) : null;

  const awardsBlock =
    awards.items.length > 0 ? (
      <div key="awards">
        <div style={labelStyle}>AWARDS:</div>
        {awards.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{
              marginBottom: i < awards.items.length - 1 ? 6 : 0,
              fontFamily: "var(--resume-font)",
              fontSize: "var(--resume-body-size)",
              lineHeight: "var(--resume-line-spacing)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <span style={{ fontWeight: 700, color: darkText }}>{item.title}</span>
                {item.issuer && <span style={{ color: bodyText }}> — {item.issuer}</span>}
              </div>
              {item.date && (
                <div style={{ color: mutedText, whiteSpace: "nowrap" }}>{formatDate(item.date)}</div>
              )}
            </div>
            {item.description && <p style={{ margin: "2px 0 0 0", color: bodyText }}>{item.description}</p>}
          </div>
        ))}
      </div>
    ) : null;

  const publicationsBlock =
    publications.items.length > 0 ? (
      <div key="publications">
        <div style={labelStyle}>PUBLICATIONS:</div>
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
              <div>
                <span style={{ fontWeight: 700, color: darkText }}>{item.title}</span>
                {item.publisher && <span style={{ color: bodyText }}> — {item.publisher}</span>}
              </div>
              {item.date && (
                <div style={{ color: mutedText, whiteSpace: "nowrap" }}>{formatDate(item.date)}</div>
              )}
            </div>
            {item.url && (
              <div style={{ color: accent, fontSize: "calc(var(--resume-body-size) - 1pt)" }}>
                {item.url}
              </div>
            )}
          </div>
        ))}
      </div>
    ) : null;

  const sectionMap: Record<string, React.ReactNode> = {
    summary: summaryBlock,
    skills: skillsBlock,
    experience: experienceBlock,
    projects: projectsBlock,
    awards: awardsBlock,
    publications: publicationsBlock,
    education: educationBlock,
    certifications: certificationsBlock,
    volunteering: volunteerBlock,
    contact: null,
    targetTitle: null,
  };

  const BLUEPRINT_RIGHT_DEFAULT = ["summary", "skills", "experience", "projects", "awards", "publications"];
  const rightKeys = new Set(design.sidebarSections ?? BLUEPRINT_RIGHT_DEFAULT);
  const order = design.sectionOrder || [];

  const leftContent: { key: string; node: React.ReactNode }[] = [];
  const rightContent: { key: string; node: React.ReactNode }[] = [];

  for (const key of order) {
    if (!visibleSections.includes(key as typeof visibleSections[number])) continue;
    const node = sectionMap[key];
    if (!node) continue;
    if (rightKeys.has(key)) rightContent.push({ key, node });
    else leftContent.push({ key, node });
  }

  const showHeader = visibleSections.includes("contact");

  // Footer boxes (web/phone)
  const footerBoxes: { label: string; value: string }[] = [];
  if (contact.website) footerBoxes.push({ label: "WEB", value: contact.website });
  if (contact.phone) footerBoxes.push({ label: "PHONE", value: contact.phone });

  return (
    <div
      data-template="blueprint"
      style={{
        fontFamily: "var(--resume-font)",
        fontSize: "var(--resume-body-size)",
        lineHeight: "var(--resume-line-spacing)",
        color: bodyText,
      }}
    >
      {/* HEADER — full width accent block; photo overflows bottom into body */}
      {showHeader && (
        <div
          style={{
            background: headerBg,
            paddingLeft: `${Math.max(marginX, 0.5)}in`,
            paddingRight: `${Math.max(marginX, 0.5)}in`,
            paddingTop: 18,
            paddingBottom: 18,
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: showAvatar ? Math.round(avatarSize * 0.12) : 0,
          }}
        >
          {showAvatar && avatarPosition === "left" && (
            <div
              style={{
                flex: headerAlign === "left" ? "0 0 auto" : "0 0 40%",
                display: "flex",
                justifyContent: headerAlign === "left" ? "flex-start" : "center",
                alignItems: "center",
                marginBottom: -Math.round(avatarSize * 0.15),
              }}
            >
              {avatarNode}
            </div>
          )}
          <div
            style={{
              flex: showAvatar
                ? headerAlign === "left" && avatarPosition === "left"
                  ? "1 1 auto"
                  : headerAlign === "right" && avatarPosition === "right"
                    ? "1 1 auto"
                    : "0 0 60%"
                : "1 1 100%",
              minWidth: 0,
              textAlign: headerAlign,
            }}
          >
            <div
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: 32,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: darkText,
                lineHeight: 1.05,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: headerAlign === "center" ? "center" : headerAlign === "right" ? "flex-end" : "flex-start",
              }}
            >
              {first && (
                <span style={{ fontWeight: 400 }}>{first}</span>
              )}
              {last && <span style={{ fontWeight: 700 }}>{last}</span>}
            </div>
            {targetTitle.title && visibleSections.includes("targetTitle") && (
              <div
                style={{
                  marginTop: 8,
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) + 1pt)",
                  color: accent,
                  fontWeight: 600,
                  letterSpacing: 0.5,
                }}
              >
                {targetTitle.title}
              </div>
            )}
          </div>
          {showAvatar && avatarPosition === "right" && (
            <div
              style={{
                flex: headerAlign === "right" ? "0 0 auto" : "0 0 40%",
                display: "flex",
                justifyContent: headerAlign === "right" ? "flex-end" : "center",
                alignItems: "center",
                marginBottom: -Math.round(avatarSize * 0.15),
              }}
            >
              {avatarNode}
            </div>
          )}
        </div>
      )}

      {/* BODY — two columns */}
      <div
        style={{
          display: "flex",
          gap: 20,
          padding: `${Math.max(marginY, 0.4)}in ${Math.max(marginX, 0.5)}in`,
          alignItems: "flex-start",
        }}
      >
        {/* LEFT COLUMN — 35% */}
        <div
          style={{
            width: "35%",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: `${sectionSpacing}px`,
          }}
        >
          {profileBlock}
          {contactInfoBlock}
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
          {socialRow}
        </div>

        {/* RIGHT COLUMN — 65%, bordered box */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              border: `${borderWidth}px solid ${borderColor}`,
              padding: 14,
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

      {/* FOOTER — two boxes side-by-side */}
      {footerBoxes.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 12,
            padding: `0 ${Math.max(marginX, 0.5)}in ${Math.max(marginY, 0.4)}in`,
          }}
        >
          {footerBoxes.map((box, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                border: `${borderWidth}px solid ${borderColor}`,
                padding: "6px 10px",
                fontFamily: "var(--resume-font)",
                fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                color: bodyText,
                wordBreak: "break-word",
              }}
            >
              <span style={{ fontWeight: 700, color: darkText }}>{box.label}: </span>
              <span>{box.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Blueprint;
