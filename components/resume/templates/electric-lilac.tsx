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
          border: `2px solid #ffffff`,
          flexShrink: 0,
        }}
      />
    );
  }

  // In Q1 the background IS the accent. Use white bg with accent letters for readability.
  const onAccent = initialsBg === "accent";
  const bg = onAccent ? accent : "#ffffff";
  const fg = onAccent ? "#ffffff" : accent;
  const borderColor = "#ffffff";

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: bg,
        border: `2px solid ${borderColor}`,
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
        <svg
          width={Math.round(size * 0.48)}
          height={Math.round(size * 0.48)}
          viewBox="0 0 24 24"
          fill="none"
          stroke={fg}
          strokeWidth="1.5"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
        </svg>
      )}
    </div>
  );
}

type ContactIconKind = "phone" | "mail" | "pin" | "linkedin" | "globe";

function ContactIconSvg({ kind, color, size = 10 }: { kind: ContactIconKind; color: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
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
    case "pin":
      return (
        <svg {...common}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
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
  }
}

export function ElectricLilac({
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
  const darkText = "#1f2937";
  const bodyText = "#374151";
  const mutedText = "#6b7280";
  const dateColor = "#6b7280";
  const resolvedAccent = accent;

  // Quadrant background tints — track --resume-accent via color-mix.
  const q2Bg = `color-mix(in srgb, ${accent} 14%, white)`;
  const q3Bg = `color-mix(in srgb, ${accent} 10%, white)`;

  const renderDateRange = (start: string, end: string, isCurrent?: boolean) => {
    const s = formatDate(start);
    const e = isCurrent ? "Present" : formatDate(end);
    if (!s && !e) return "";
    return s && e ? `${s} - ${e}` : s || e;
  };

  // --- Name split into two lines (first chunk vs last token, uppercase) ---
  const nameParts = (contact.name || "").trim().split(/\s+/).filter(Boolean);
  const nameLine1 = nameParts.length >= 2 ? nameParts.slice(0, -1).join(" ") : nameParts[0] || "";
  const nameLine2 = nameParts.length >= 2 ? nameParts[nameParts.length - 1]! : "";

  // --- Avatar config ---
  const avatarMode = design.avatarMode ?? "initials";
  const avatarShape = design.avatarShape ?? "circle";
  const avatarSize = design.avatarSize ?? 100;
  const avatarInitialsBg = design.avatarInitialsBg ?? "accent";
  const showAvatar = avatarMode !== "off";
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

  // --- Contact rows (rendered inside Q1 on accent bg — all white) ---
  const contactItems = [
    contact.phone && { kind: "phone" as ContactIconKind, value: contact.phone },
    contact.email && { kind: "mail" as ContactIconKind, value: contact.email },
    contact.location && { kind: "pin" as ContactIconKind, value: contact.location },
    contact.linkedin && { kind: "linkedin" as ContactIconKind, value: contact.linkedin },
    contact.website && { kind: "globe" as ContactIconKind, value: contact.website },
  ].filter(Boolean) as { kind: ContactIconKind; value: string }[];

  const contactIconBullet = (kind: ContactIconKind) => (
    <span
      style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "#ffffff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <ContactIconSvg kind={kind} color={accent} size={12} />
    </span>
  );

  // --- Section heading — bold uppercase accent-colored, NO underline. ---
  const sectionHeading = (title: string, isFirst: boolean = false) => (
    <div
      data-resume-section-title=""
      style={{
        fontFamily: "var(--resume-font)",
        fontSize: "var(--resume-heading-size)",
        fontWeight: "var(--resume-heading-weight)" as unknown as number,
        textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
        letterSpacing: "0.08em",
        color: `color-mix(in srgb, var(--resume-accent) 72%, black)`,
        marginTop: isFirst ? 0 : 16,
        marginBottom: 10,
        width: "100%",
      }}
    >
      {title}
    </div>
  );

  // --- Bullets (manual char) ---
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
          fontSize: "var(--resume-body-size)",
          lineHeight: "var(--resume-line-spacing)",
          color: bodyText,
        }}
      >
        {filtered.map((bullet, j) => (
          <li
            key={j}
            style={{
              marginBottom: 4,
              textIndent: bulletChar ? "-12px" : 0,
              paddingLeft: bulletChar ? 12 : 0,
            }}
          >
            {bulletChar && (
              <span style={{ marginRight: 6, color: accent }}>{bulletChar}</span>
            )}
            {bullet}
          </li>
        ))}
      </ul>
    );
  };

  // --- Experience / Volunteering entry ("Company  -  Role" pattern) ---
  const renderRoleEntry = (
    key: number,
    primary: string,
    role: string,
    location: string,
    startDate: string,
    endDate: string,
    isCurrent: boolean | undefined,
    bullets: string[],
    isLast: boolean,
  ) => (
    <div
      key={key}
      data-resume-entry=""
      style={{ marginBottom: isLast ? 0 : 13, fontFamily: "var(--resume-font)" }}
    >
      {(primary || role) && (
        <div
          style={{
            fontSize: "calc(var(--resume-body-size) + 0.5pt)",
            color: darkText,
            lineHeight: 1.3,
          }}
        >
          {primary && <span style={{ fontWeight: 700 }}>{primary}</span>}
          {primary && role && <span style={{ fontWeight: 400 }}>{"  -  "}</span>}
          {role && <span style={{ fontWeight: 700 }}>{role}</span>}
        </div>
      )}
      {(location || startDate || endDate || isCurrent) && (
        <div
          style={{
            fontSize: "calc(var(--resume-body-size) - 0.5pt)",
            color: mutedText,
            fontStyle: "italic",
            marginTop: 2,
          }}
        >
          {location && <span>{location}</span>}
          {location && (startDate || endDate || isCurrent) && (
            <span>{" \u2022 "}</span>
          )}
          {(startDate || endDate || isCurrent) && (
            <span>{renderDateRange(startDate, endDate, isCurrent)}</span>
          )}
        </div>
      )}
      {renderBullets(bullets)}
    </div>
  );

  // --- Section renderers ---
  const renderExperience = (isFirst: boolean) =>
    experience.items.length > 0 ? (
      <div key="experience">
        {sectionHeading("Experience", isFirst)}
        {experience.items.map((item, i) =>
          renderRoleEntry(
            i,
            item.company,
            item.role,
            item.location,
            item.startDate,
            item.endDate,
            item.isCurrent,
            item.bullets,
            i === experience.items.length - 1,
          ),
        )}
      </div>
    ) : null;

  const renderVolunteering = (isFirst: boolean) =>
    volunteering.items.length > 0 ? (
      <div key="volunteering">
        {sectionHeading("Volunteer Experience", isFirst)}
        {volunteering.items.map((item, i) =>
          renderRoleEntry(
            i,
            item.organization,
            item.role,
            "",
            item.startDate,
            item.endDate,
            undefined,
            item.bullets,
            i === volunteering.items.length - 1,
          ),
        )}
      </div>
    ) : null;

  // Education:
  // L1: Institution (bold)
  // L2: Location • Date  (muted)
  // L3: Degree (bold) : Field (italic)
  const renderEducation = (isFirst: boolean) =>
    education.items.length > 0 ? (
      <div key="education">
        {sectionHeading("Education", isFirst)}
        {education.items.map((item, i) => {
          const datePart =
            item.endDate
              ? formatDate(item.endDate)
              : item.startDate
                ? formatDate(item.startDate)
                : "";
          return (
            <div
              key={i}
              data-resume-entry=""
              style={{
                marginBottom: i < education.items.length - 1 ? 12 : 0,
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-body-size)",
                lineHeight: "var(--resume-line-spacing)",
              }}
            >
              {item.institution && (
                <div style={{ fontWeight: 700, color: darkText }}>
                  {item.institution}
                </div>
              )}
              {datePart && (
                <div
                  style={{
                    color: mutedText,
                    fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                    marginTop: 1,
                  }}
                >
                  {datePart}
                </div>
              )}
              {(item.degree || item.field) && (
                <div style={{ color: bodyText, marginTop: 2 }}>
                  {item.degree && (
                    <span style={{ fontWeight: 700, color: darkText }}>
                      {item.degree}
                    </span>
                  )}
                  {item.degree && item.field && (
                    <span style={{ color: darkText }}> : </span>
                  )}
                  {item.field && (
                    <span style={{ fontStyle: "italic", color: bodyText }}>
                      {item.field}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    ) : null;

  // Skills — plain list, one per line. No chips, no dots.
  const renderSkills = (isFirst: boolean) => {
    const allSkills: string[] = [];
    skills.categories.forEach((cat) => {
      cat.skills.filter(Boolean).forEach((s) => allSkills.push(s));
    });
    if (allSkills.length === 0) return null;
    return (
      <div key="skills">
        {sectionHeading("Skills", isFirst)}
        <ul
          style={{
            margin: 0,
            paddingLeft: bulletChar ? 14 : 0,
            listStyle: "none",
            fontFamily: "var(--resume-font)",
            fontSize: "var(--resume-body-size)",
            lineHeight: "var(--resume-line-spacing)",
            color: darkText,
          }}
        >
          {allSkills.map((skill, i) => (
            <li
              key={i}
              style={{
                marginBottom: 3,
                textIndent: bulletChar ? "-12px" : 0,
                paddingLeft: bulletChar ? 12 : 0,
              }}
            >
              {bulletChar && (
                <span style={{ marginRight: 6, color: accent }}>{bulletChar}</span>
              )}
              {skill}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderCertifications = (isFirst: boolean) =>
    certifications.items.length > 0 ? (
      <div key="certifications">
        {sectionHeading("Certifications", isFirst)}
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
            <div style={{ fontWeight: 700, color: darkText }}>{item.name}</div>
            {item.issuer && (
              <div style={{ color: bodyText, marginTop: 1 }}>{item.issuer}</div>
            )}
            {(item.startDate || item.endDate || item.isCurrent) && (
              <div
                style={{
                  color: dateColor,
                  fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                  marginTop: 1,
                }}
              >
                {renderDateRange(item.startDate, item.endDate, item.isCurrent)}
              </div>
            )}
          </div>
        ))}
      </div>
    ) : null;

  // Accomplishments — bulleted list of award titles.
  const renderAwards = (isFirst: boolean) =>
    awards.items.length > 0 ? (
      <div key="awards">
        {sectionHeading("Accomplishments", isFirst)}
        <ul
          style={{
            margin: 0,
            paddingLeft: bulletChar ? 14 : 0,
            listStyle: "none",
            fontFamily: "var(--resume-font)",
            fontSize: "var(--resume-body-size)",
            lineHeight: "var(--resume-line-spacing)",
            color: bodyText,
          }}
        >
          {awards.items.map((item, i) => (
            <li
              key={i}
              style={{
                marginBottom: 4,
                textIndent: bulletChar ? "-12px" : 0,
                paddingLeft: bulletChar ? 12 : 0,
              }}
            >
              {bulletChar && (
                <span style={{ marginRight: 6, color: accent }}>{bulletChar}</span>
              )}
              <span style={{ color: darkText, fontWeight: 600 }}>{item.title}</span>
              {item.issuer && (
                <span style={{ color: bodyText }}> — {item.issuer}</span>
              )}
              {item.description && (
                <span style={{ color: bodyText }}>: {item.description}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  const renderProjects = (isFirst: boolean) =>
    projects.items.length > 0 ? (
      <div key="projects">
        {sectionHeading("Projects", isFirst)}
        {projects.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{
              marginBottom: i < projects.items.length - 1 ? 12 : 0,
              fontFamily: "var(--resume-font)",
            }}
          >
            <div
              style={{
                fontSize: "calc(var(--resume-body-size) + 0.5pt)",
                fontWeight: 700,
                color: darkText,
              }}
            >
              {item.name}
            </div>
            {(item.startDate || item.endDate) && (
              <div
                style={{
                  color: mutedText,
                  fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                  marginTop: 1,
                }}
              >
                {renderDateRange(item.startDate, item.endDate)}
              </div>
            )}
            {item.url && (
              <div
                style={{
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

  const renderPublications = (isFirst: boolean) =>
    publications.items.length > 0 ? (
      <div key="publications">
        {sectionHeading("Publications", isFirst)}
        {publications.items.map((item, i) => (
          <div
            key={i}
            data-resume-entry=""
            style={{
              marginBottom: i < publications.items.length - 1 ? 8 : 0,
              fontFamily: "var(--resume-font)",
              fontSize: "var(--resume-body-size)",
              lineHeight: "var(--resume-line-spacing)",
            }}
          >
            <div style={{ fontWeight: 700, color: darkText }}>{item.title}</div>
            {item.publisher && (
              <div
                style={{
                  color: mutedText,
                  fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                  marginTop: 1,
                }}
              >
                {item.publisher}
              </div>
            )}
            {item.date && (
              <div
                style={{
                  color: dateColor,
                  fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                  marginTop: 1,
                }}
              >
                {formatDate(item.date)}
              </div>
            )}
            {item.url && (
              <div
                style={{
                  color: accent,
                  fontSize: "calc(var(--resume-body-size) - 1pt)",
                  marginTop: 2,
                }}
              >
                {item.url}
              </div>
            )}
          </div>
        ))}
      </div>
    ) : null;

  const sectionRenderers: Record<string, (isFirst: boolean) => React.ReactNode> = {
    experience: renderExperience,
    education: renderEducation,
    skills: renderSkills,
    certifications: renderCertifications,
    awards: renderAwards,
    projects: renderProjects,
    volunteering: renderVolunteering,
    publications: renderPublications,
  };

  // --- Column routing ---
  const HEADER_KEYS = new Set(["contact", "targetTitle", "summary"]);
  const BODY_KEYS = new Set(Object.keys(sectionRenderers));

  const DEFAULT_LEFT = ["education", "skills"];
  const leftKeysRaw = design.sidebarSections ?? DEFAULT_LEFT;
  const leftKeys = leftKeysRaw.filter((k) => BODY_KEYS.has(k));
  const leftSet = new Set(leftKeys);

  const order = (design.sectionOrder || []).filter((k) => BODY_KEYS.has(k));
  const visibleSet = new Set(visibleSections as readonly string[]);

  const leftOrder = leftKeys
    .filter((k) => visibleSet.has(k))
    .sort((a, b) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      if (ia === -1 && ib === -1) return 0;
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });

  const rightOrder = order.filter(
    (k) => !HEADER_KEYS.has(k) && !leftSet.has(k) && visibleSet.has(k),
  );

  const leftNodes = leftOrder
    .map((key, idx) => ({ key, node: sectionRenderers[key]?.(idx === 0) }))
    .filter((x): x is { key: string; node: React.ReactNode } => !!x.node);
  const rightNodes = rightOrder
    .map((key, idx) => ({ key, node: sectionRenderers[key]?.(idx === 0) }))
    .filter((x): x is { key: string; node: React.ReactNode } => !!x.node);

  // --- Header visibility ---
  const showSummary = visibleSections.includes("summary") && !!summary.content;
  const showTargetTitle = visibleSections.includes("targetTitle") && !!targetTitle.title;

  // No outer page padding — quadrant backgrounds always reach the page edge.
  // Section padding lives inside each quadrant (24px).
  void marginX; void marginY;

  return (
    <div
      style={{
        fontFamily: "var(--resume-font)",
        fontSize: "var(--resume-body-size)",
        lineHeight: "var(--resume-line-spacing)",
        color: bodyText,
        background: "#ffffff",
        padding: 0,
        display: "grid",
        gridTemplateColumns: "38% 62%",
        gridTemplateRows: "auto auto",
      }}
    >
      {/* Q1: top-left — avatar + name + contact on accent bg */}
      <div
        style={{
          gridColumn: "1 / 2",
          gridRow: "1 / 2",
          background: accent,
          color: "#ffffff",
          padding: 24,
          minHeight: 260,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          textAlign: "left",
          gap: 10,
        }}
      >
        {showAvatar && avatarNode}
        {(nameLine1 || nameLine2) && (
          <div
            style={{
              fontFamily: "var(--resume-font)",
              fontSize: "var(--resume-name-size)",
              fontWeight: "var(--resume-name-weight)" as unknown as number,
              textTransform: "uppercase",
              letterSpacing: "0.02em",
              color: "#ffffff",
              lineHeight: 1.15,
              marginTop: 8,
            }}
          >
            <div>{[nameLine1, nameLine2].filter(Boolean).join(" ")}</div>
          </div>
        )}
        {showTargetTitle && (
          <div
            style={{
              fontFamily: "var(--resume-font)",
              fontSize: "var(--resume-body-size)",
              color: "#ffffff",
              opacity: 0.9,
              marginTop: 2,
            }}
          >
            {targetTitle.title}
          </div>
        )}
        {/* Short white horizontal rule */}
        <div
          style={{
            width: 24,
            height: 1.5,
            background: "rgba(255,255,255,0.6)",
            marginTop: 6,
            marginBottom: 4,
          }}
        />
        {contactItems.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            {contactItems.map((c, i) => (
              <div
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                  color: "#ffffff",
                  wordBreak: "break-word",
                }}
              >
                {contactIconBullet(c.kind)}
                <span>{c.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Q2: top-right — Resume Objective on tint bg */}
      <div
        style={{
          gridColumn: "2 / 3",
          gridRow: "1 / 2",
          background: q2Bg,
          padding: 32,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          textAlign: "left",
        }}
      >
        {showSummary && (
          <>
            <div
              data-resume-section-title=""
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-heading-size)",
                fontWeight: "var(--resume-heading-weight)" as unknown as number,
                textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
                letterSpacing: "0.08em",
                color: `color-mix(in srgb, var(--resume-accent) 72%, black)`,
                marginBottom: 14,
              }}
            >
              Resume Objective
            </div>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--resume-font)",
                fontSize: "calc(var(--resume-body-size) + 1.5pt)",
                lineHeight: 1.55,
                color: darkText,
              }}
            >
              {summary.content}
            </p>
          </>
        )}
      </div>

      {/* Q3: bottom-left — Education + Skills on lighter tint */}
      <div
        style={{
          gridColumn: "1 / 2",
          gridRow: "2 / 3",
          background: q3Bg,
          padding: 24,
          minHeight: 200,
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

      {/* Q4: bottom-right — everything else on white */}
      <div
        style={{
          gridColumn: "2 / 3",
          gridRow: "2 / 3",
          background: "#ffffff",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: `${sectionSpacing}px`,
        }}
      >
        {rightNodes.map(({ key, node }) => {
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
  );
}

export default ElectricLilac;
