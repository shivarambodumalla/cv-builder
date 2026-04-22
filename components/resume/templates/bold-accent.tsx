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

type SectionIconKind =
  | "user"
  | "briefcase"
  | "grad"
  | "bolt"
  | "medal"
  | "folder"
  | "heart"
  | "file"
  | "trophy";

const SECTION_META: Record<string, { label: string; icon: SectionIconKind }> = {
  summary: { label: "Resume summary", icon: "user" },
  experience: { label: "Work experience", icon: "briefcase" },
  education: { label: "Education", icon: "grad" },
  skills: { label: "Strengths", icon: "bolt" },
  certifications: { label: "Certificates", icon: "medal" },
  awards: { label: "Awards", icon: "trophy" },
  projects: { label: "Projects", icon: "folder" },
  volunteering: { label: "Volunteering", icon: "heart" },
  publications: { label: "Publications", icon: "file" },
};

function SectionIcon({ kind }: { kind: SectionIconKind }) {
  const common = {
    width: 12,
    height: 12,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#ffffff",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
        </svg>
      );
    case "briefcase":
      return (
        <svg {...common}>
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M2 13h20" />
        </svg>
      );
    case "grad":
      return (
        <svg {...common}>
          <path d="M22 10 12 5 2 10l10 5 10-5z" />
          <path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case "medal":
      return (
        <svg {...common}>
          <path d="M7 3h10l-3 7H10z" />
          <circle cx="12" cy="15" r="6" />
          <path d="M12 12v6" />
        </svg>
      );
    case "trophy":
      return (
        <svg {...common}>
          <path d="M8 3h8v5a4 4 0 0 1-8 0z" />
          <path d="M8 5H4v2a3 3 0 0 0 4 3" />
          <path d="M16 5h4v2a3 3 0 0 1-4 3" />
          <path d="M10 14h4v3h-4z" />
          <path d="M8 21h8" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case "file":
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
  }
}

const CONTACT_LABELS: Record<string, string> = {
  email: "Email address",
  phone: "Phone",
  location: "Address",
  linkedin: "LinkedIn",
  website: "Website",
};

export function BoldAccent({
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
  const darkText = "#111827";
  const bodyText = "#374151";
  const mutedText = "#6b7280";
  const LEFT_COL = 110;

  const renderDateRange = (start: string, end: string, isCurrent?: boolean) => {
    const s = formatDate(start);
    const e = isCurrent ? "present" : formatDate(end);
    if (!s && !e) return "";
    return s && e ? `${s} – ${e}` : s || e;
  };

  const renderBullets = (bullets: string[]) => {
    const filtered = bullets.filter(Boolean);
    if (filtered.length === 0) return null;
    return (
      <ul
        style={{
          margin: "4px 0 0 0",
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
              marginBottom: 3,
              textIndent: bulletChar ? "-12px" : 0,
              paddingLeft: bulletChar ? 12 : 0,
            }}
          >
            {bulletChar && (
              <span style={{ marginRight: 6, color: bodyText }}>{bulletChar}</span>
            )}
            {bullet}
          </li>
        ))}
      </ul>
    );
  };

  const sectionHeading = (key: string, fallbackLabel?: string) => {
    const meta = SECTION_META[key];
    const label = meta?.label ?? fallbackLabel ?? key;
    const iconKind: SectionIconKind = meta?.icon ?? "bolt";
    return (
      <div
        data-resume-section-title=""
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <SectionIcon kind={iconKind} />
        </div>
        <div
          style={{
            fontFamily: "var(--resume-font)",
            fontSize: "var(--resume-heading-size)",
            fontWeight: "var(--resume-heading-weight)" as unknown as number,
            textTransform: "var(--resume-heading-case)" as unknown as "uppercase",
            color: darkText,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
        <div style={{ flex: 1, height: 1, background: darkText, marginLeft: 4 }} />
      </div>
    );
  };

  // Two-column entry row (narrow date/location left, content right)
  const datedRow = (
    leftLines: (string | null | undefined)[],
    right: React.ReactNode,
  ) => {
    const lines = leftLines.filter(Boolean) as string[];
    return (
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div
          style={{
            width: LEFT_COL,
            flexShrink: 0,
            fontFamily: "var(--resume-font)",
            fontSize: "calc(var(--resume-body-size) - 0.5pt)",
            lineHeight: 1.35,
            color: mutedText,
          }}
        >
          {lines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>{right}</div>
      </div>
    );
  };

  // Contact entries for header (filtered to non-empty)
  type ContactKind = "email" | "phone" | "location" | "linkedin" | "website";
  const contactEntries: { kind: ContactKind; value: string }[] = [
    contact.location && { kind: "location" as const, value: contact.location },
    contact.phone && { kind: "phone" as const, value: contact.phone },
    contact.email && { kind: "email" as const, value: contact.email },
    contact.linkedin && { kind: "linkedin" as const, value: contact.linkedin },
    contact.website && { kind: "website" as const, value: contact.website },
  ].filter(Boolean) as { kind: ContactKind; value: string }[];

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    summary: () =>
      summary.content ? (
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
      ) : null,

    experience: () =>
      experience.items.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {experience.items.map((item, i) => (
            <div key={i} data-resume-entry="">
              {datedRow(
                [
                  renderDateRange(item.startDate, item.endDate, item.isCurrent),
                  item.location,
                ],
                <div>
                  <div
                    style={{
                      fontFamily: "var(--resume-font)",
                      fontSize: "var(--resume-body-size)",
                      fontWeight: 700,
                      color: darkText,
                      lineHeight: 1.25,
                    }}
                  >
                    {item.role}
                  </div>
                  {item.company && (
                    <div
                      style={{
                        fontFamily: "var(--resume-font)",
                        fontSize: "var(--resume-body-size)",
                        fontWeight: 700,
                        color: darkText,
                        lineHeight: 1.25,
                      }}
                    >
                      {item.company}
                    </div>
                  )}
                  {renderBullets(item.bullets)}
                </div>,
              )}
            </div>
          ))}
        </div>
      ) : null,

    education: () =>
      education.items.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {education.items.map((item, i) => (
            <div key={i} data-resume-entry="">
              {datedRow(
                [renderDateRange(item.startDate, item.endDate)],
                <div>
                  {(item.degree || item.field) && (
                    <div
                      style={{
                        fontFamily: "var(--resume-font)",
                        fontSize: "var(--resume-body-size)",
                        fontWeight: 700,
                        color: darkText,
                        lineHeight: 1.25,
                      }}
                    >
                      {[item.degree, item.field].filter(Boolean).join(" — ")}
                    </div>
                  )}
                  {item.institution && (
                    <div
                      style={{
                        fontFamily: "var(--resume-font)",
                        fontSize: "var(--resume-body-size)",
                        fontWeight: 700,
                        color: darkText,
                        lineHeight: 1.25,
                      }}
                    >
                      {item.institution}
                    </div>
                  )}
                </div>,
              )}
            </div>
          ))}
        </div>
      ) : null,

    skills: () =>
      skills.categories.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {skills.categories.map((cat, i) => (
            <div key={i}>
              {cat.name && (
                <div
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: "calc(var(--resume-body-size) - 1pt)",
                    fontWeight: 700,
                    color: mutedText,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 5,
                  }}
                >
                  {cat.name}
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {cat.skills.filter(Boolean).map((sk, j) => (
                  <span
                    key={j}
                    style={{
                      display: "inline-block",
                      fontFamily: "var(--resume-font)",
                      fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                      padding: "4px 12px",
                      borderRadius: 999,
                      background: accent,
                      color: "#ffffff",
                      whiteSpace: "nowrap",
                      lineHeight: 1.3,
                      fontWeight: 500,
                    }}
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null,

    certifications: () =>
      certifications.items.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {certifications.items.map((item, i) => (
            <div key={i} data-resume-entry="">
              {datedRow(
                [renderDateRange(item.startDate, item.endDate, item.isCurrent)],
                <div>
                  {item.name && (
                    <div
                      style={{
                        fontFamily: "var(--resume-font)",
                        fontSize: "var(--resume-body-size)",
                        fontWeight: 700,
                        color: darkText,
                        lineHeight: 1.25,
                      }}
                    >
                      {item.name}
                    </div>
                  )}
                  {item.issuer && (
                    <div
                      style={{
                        fontFamily: "var(--resume-font)",
                        fontSize: "var(--resume-body-size)",
                        fontWeight: 700,
                        color: darkText,
                        lineHeight: 1.25,
                      }}
                    >
                      {item.issuer}
                    </div>
                  )}
                </div>,
              )}
            </div>
          ))}
        </div>
      ) : null,

    awards: () =>
      awards.items.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {awards.items.map((item, i) => (
            <div key={i} data-resume-entry="">
              {datedRow(
                [item.date ? formatDate(item.date) : ""],
                <div>
                  {item.title && (
                    <div
                      style={{
                        fontFamily: "var(--resume-font)",
                        fontSize: "var(--resume-body-size)",
                        fontWeight: 700,
                        color: darkText,
                      }}
                    >
                      {item.title}
                      {item.issuer && (
                        <span style={{ fontWeight: 400, color: bodyText }}>
                          {" "}
                          — {item.issuer}
                        </span>
                      )}
                    </div>
                  )}
                  {item.description && (
                    <p
                      style={{
                        margin: "2px 0 0 0",
                        color: bodyText,
                        fontFamily: "var(--resume-font)",
                        fontSize: "var(--resume-body-size)",
                        lineHeight: "var(--resume-line-spacing)",
                      }}
                    >
                      {item.description}
                    </p>
                  )}
                </div>,
              )}
            </div>
          ))}
        </div>
      ) : null,

    projects: () =>
      projects.items.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {projects.items.map((item, i) => (
            <div key={i} data-resume-entry="">
              {datedRow(
                [renderDateRange(item.startDate, item.endDate)],
                <div>
                  {item.name && (
                    <div
                      style={{
                        fontFamily: "var(--resume-font)",
                        fontSize: "var(--resume-body-size)",
                        fontWeight: 700,
                        color: darkText,
                      }}
                    >
                      {item.name}
                    </div>
                  )}
                  {item.url && (
                    <div
                      style={{
                        color: accent,
                        fontSize: "calc(var(--resume-body-size) - 1pt)",
                      }}
                    >
                      {item.url}
                    </div>
                  )}
                  {renderBullets(item.bullets)}
                </div>,
              )}
            </div>
          ))}
        </div>
      ) : null,

    volunteering: () =>
      volunteering.items.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {volunteering.items.map((item, i) => (
            <div key={i} data-resume-entry="">
              {datedRow(
                [renderDateRange(item.startDate, item.endDate)],
                <div>
                  {item.role && (
                    <div
                      style={{
                        fontFamily: "var(--resume-font)",
                        fontSize: "var(--resume-body-size)",
                        fontWeight: 700,
                        color: darkText,
                      }}
                    >
                      {item.role}
                    </div>
                  )}
                  {item.organization && (
                    <div
                      style={{
                        fontFamily: "var(--resume-font)",
                        fontSize: "var(--resume-body-size)",
                        fontWeight: 700,
                        color: darkText,
                      }}
                    >
                      {item.organization}
                    </div>
                  )}
                  {renderBullets(item.bullets)}
                </div>,
              )}
            </div>
          ))}
        </div>
      ) : null,

    publications: () =>
      publications.items.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {publications.items.map((item, i) => (
            <div key={i} data-resume-entry="">
              {datedRow(
                [item.date ? formatDate(item.date) : ""],
                <div>
                  {item.title && (
                    <div
                      style={{
                        fontFamily: "var(--resume-font)",
                        fontSize: "var(--resume-body-size)",
                        fontWeight: 700,
                        color: darkText,
                      }}
                    >
                      {item.title}
                      {item.publisher && (
                        <span style={{ fontWeight: 400, color: bodyText }}>
                          {" "}
                          — {item.publisher}
                        </span>
                      )}
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
                </div>,
              )}
            </div>
          ))}
        </div>
      ) : null,
  };

  const showHeader = visibleSections.includes("contact");
  const showTargetTitle = visibleSections.includes("targetTitle") && !!targetTitle.title;

  const bodyOrder = (design.sectionOrder || []).filter(
    (k) =>
      visibleSections.includes(k as typeof visibleSections[number]) &&
      k !== "contact" &&
      k !== "targetTitle",
  );

  // Assign numbers to rendered sections in order
  const renderedSections: { key: string; node: React.ReactNode }[] = [];
  bodyOrder.forEach((key) => {
    const renderer = sectionRenderers[key];
    if (!renderer) return;
    const node = renderer();
    if (!node) return;
    renderedSections.push({ key, node });
  });

  const avatarMode = design.avatarMode ?? "initials";
  const avatarShape = design.avatarShape ?? "circle";
  const avatarSize = design.avatarSize ?? 72;
  const avatarInitialsBg = design.avatarInitialsBg ?? "accent";
  const avatarPosition = design.avatarPosition ?? "left";
  const resolvedAccent = typeof accent === "string" ? accent : "var(--resume-accent)";
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
      {/* HEADER: avatar + name/title/contact */}
      {showHeader && (
        <div
          style={{
            display: "flex",
            gap: 18,
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          {showAvatar && avatarPosition === "left" && avatarNode}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-name-size)",
                fontWeight: "var(--resume-name-weight)" as unknown as number,
                color: darkText,
                lineHeight: 1.1,
                letterSpacing: -0.3,
              }}
            >
              {contact.name}
            </div>
            {showTargetTitle && (
              <div
                style={{
                  marginTop: 4,
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) + 2pt)",
                  color: accent,
                  fontWeight: 600,
                }}
              >
                {targetTitle.title}
              </div>
            )}
            {contactEntries.length > 0 && (
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  flexWrap: "wrap",
                  columnGap: 20,
                  rowGap: 4,
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                  color: bodyText,
                  lineHeight: 1.5,
                }}
              >
                {contactEntries.map((f, i) => (
                  <span
                    key={i}
                    style={{
                      display: "inline-flex",
                      alignItems: "baseline",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: accent,
                        flexShrink: 0,
                        display: "inline-block",
                        transform: "translateY(-1px)",
                      }}
                    />
                    <span>
                      <span style={{ fontWeight: 700, color: darkText }}>
                        {CONTACT_LABELS[f.kind]}:
                      </span>{" "}
                      <span>{f.value}</span>
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
          {showAvatar && avatarPosition === "right" && avatarNode}
        </div>
      )}

      {/* BODY */}
      <div style={{ display: "flex", flexDirection: "column", gap: `${sectionSpacing}px` }}>
        {renderedSections.map(({ key, node }) => {
          const hasPageBreak = pageBreaks.includes(key);
          return (
            <div
              key={key}
              data-resume-section=""
              {...(hasPageBreak ? { "data-page-break-before": "" } : {})}
              style={hasPageBreak ? { pageBreakBefore: "always" as const } : undefined}
            >
              {sectionHeading(key)}
              {node}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BoldAccent;
