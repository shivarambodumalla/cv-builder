/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TemplateProps } from "./classic";

const DARK_TEXT = "#1f2937";
const BODY_TEXT = "#374151";
const MUTED_TEXT = "#6b7280";
const DECOR_NAVY = "#1E3A5F";

const SERIF_STACK =
  "'Playfair Display', 'Libre Caslon Text', Georgia, 'Times New Roman', serif";

const DEFAULT_LEFT_SECTIONS = [
  "contact",
  "targetTitle",
  "skills",
  "summary",
];

function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
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
          border: `2px solid ${accent}33`,
          flexShrink: 0,
        }}
      />
    );
  }

  const onAccent = initialsBg === "accent";
  const bg = onAccent ? accent : "#ffffff";
  const fg = onAccent ? "#ffffff" : accent;
  const borderColor = onAccent ? accent : `${accent}55`;

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
        fontFamily: SERIF_STACK,
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

export function OrchidTemplate({
  content,
  design,
  formatDate,
  bulletChar,
  visibleSections,
  sectionSpacing = 14,
  marginX = 0.4,
  marginY = 0.45,
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
  // Unified mellow canvas — cream tinted with a hint of the selected accent so the
  // bg shifts with the user's colour choice while staying soft/editorial.
  const PAGE_BG = `color-mix(in srgb, ${accent} 7%, #F5F0E6)`;
  const UNDERLINE = `color-mix(in srgb, ${accent} 55%, white)`;
  // Faint vertical rule between the two columns. Subtle — reads as structure, not a block.
  const COLUMN_DIVIDER = "rgba(31, 41, 55, 0.10)";
  // Pin the page bg to paper size so export/print is never white in empty regions.
  const paperHeight = design.paperSize === "letter" ? "11in" : "297mm";
  // Honor user margins with a sensible floor; inner edges near the divider stay tight.
  const padOuterX = `${Math.max(marginX, 0.3)}in`;
  const padInnerX = "0.22in";
  const padY = `${Math.max(marginY, 0.35)}in`;
  const padBottomRight = `calc(${padY} + 28px)`;

  const avatarMode = design.avatarMode ?? "photo";
  const avatarShape = design.avatarShape ?? "circle";
  const avatarSize = design.avatarSize ?? 108;
  const avatarInitialsBg = design.avatarInitialsBg ?? "accent";

  const renderDateRange = (start: string, end: string, isCurrent?: boolean) => {
    const s = formatDate(start);
    const e = isCurrent ? "Present" : formatDate(end);
    if (!s && !e) return "";
    return s && e ? `${s}–${e}` : s || e;
  };

  // Serif accent section heading with a thin full-width accent underline.
  const sectionHeading = (text: string, marginTop: number = 0) => (
    <div
      data-resume-section-title=""
      style={{ marginTop, marginBottom: 10 }}
    >
      <div
        style={{
          fontFamily: SERIF_STACK,
          fontSize: "calc(var(--resume-heading-size) + 6pt)",
          fontWeight: 400,
          color: accent,
          letterSpacing: "0.01em",
          lineHeight: 1.1,
        }}
      >
        {text}
      </div>
      <div
        style={{
          marginTop: 4,
          height: 1,
          background: UNDERLINE,
          width: "100%",
        }}
      />
    </div>
  );

  const renderBullets = (bullets: string[], color: string = BODY_TEXT) => {
    const filtered = bullets.filter(Boolean);
    if (filtered.length === 0) return null;
    return (
      <ul
        style={{
          margin: "6px 0 0 0",
          padding: 0,
          listStyle: "none",
          fontFamily: "var(--resume-font)",
          fontSize: "var(--resume-body-size)",
          lineHeight: "var(--resume-line-spacing)",
          color,
        }}
      >
        {filtered.map((bullet, j) => (
          <li
            key={j}
            data-resume-bullet=""
            style={{
              marginBottom: 4,
              paddingLeft: bulletChar ? 14 : 0,
              textIndent: bulletChar ? -12 : 0,
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

  // ─── LEFT: identity + moved-in sections ───
  const contactLines: string[] = [
    contact.phone,
    contact.email,
    contact.location,
    contact.linkedin,
    contact.website,
  ].filter(Boolean) as string[];

  const identityBlock = (
    <div
      key="__identity"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        marginBottom: 18,
      }}
    >
      {avatarMode !== "off" && (
        <div style={{ marginBottom: 14 }}>
          <Avatar
            name={contact.name}
            photoUrl={contact.photoUrl}
            accent={accent}
            mode={avatarMode}
            shape={avatarShape}
            size={avatarSize}
            initialsBg={avatarInitialsBg}
          />
        </div>
      )}
      {contact.name && (
        <div
          style={{
            fontFamily: SERIF_STACK,
            fontSize: "calc(var(--resume-name-size) - 2pt)",
            fontWeight: "var(--resume-name-weight)" as unknown as number,
            color: DARK_TEXT,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
          }}
        >
          {contact.name}
        </div>
      )}
      {visibleSections.includes("targetTitle") && targetTitle.title && (
        <div
          style={{
            fontFamily: SERIF_STACK,
            fontSize: "calc(var(--resume-body-size) + 3pt)",
            color: accent,
            marginTop: 6,
            fontWeight: 400,
          }}
        >
          {targetTitle.title}
        </div>
      )}
      {contactLines.length > 0 && (
        <div
          style={{
            marginTop: 10,
            fontFamily: "var(--resume-font)",
            fontSize: "calc(var(--resume-body-size) - 0.5pt)",
            color: BODY_TEXT,
            lineHeight: 1.5,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            wordBreak: "break-word",
          }}
        >
          {contactLines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── Section renderers (shared between left and right columns) ───
  const skillName = (s: any): string => {
    if (typeof s === "string") return s;
    if (s && typeof s === "object") return String(s.name || "");
    return "";
  };

  const sectionRenderers: Record<string, (isFirst: boolean) => React.ReactNode> = {
    summary: (isFirst) =>
      summary.content ? (
        <div key="summary">
          {sectionHeading("Summary", isFirst ? 0 : 8)}
          <p
            style={{
              margin: 0,
              fontFamily: "var(--resume-font)",
              fontSize: "var(--resume-body-size)",
              lineHeight: "var(--resume-line-spacing)",
              color: BODY_TEXT,
              whiteSpace: "pre-wrap",
            }}
          >
            {summary.content}
          </p>
        </div>
      ) : null,

    skills: (isFirst) => {
      const categoriesWithSkills = skills.categories
        .map((cat) => ({
          name: String((cat as any).name || "").trim(),
          items: cat.skills.map(skillName).filter(Boolean),
        }))
        .filter((c) => c.items.length > 0);
      if (categoriesWithSkills.length === 0) return null;
      const hasCategoryNames = categoriesWithSkills.some((c) => c.name);
      const flatList = categoriesWithSkills.flatMap((c) => c.items);
      return (
        <div key="skills">
          {sectionHeading("Skills", isFirst ? 0 : 8)}
          {hasCategoryNames ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {categoriesWithSkills.map((cat, ci) => (
                <div
                  key={ci}
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: "var(--resume-body-size)",
                    lineHeight: "var(--resume-line-spacing)",
                    color: BODY_TEXT,
                  }}
                >
                  {cat.name && (
                    <span style={{ fontWeight: 600, color: DARK_TEXT }}>
                      {cat.name}:{" "}
                    </span>
                  )}
                  {cat.items.join(", ")}
                </div>
              ))}
            </div>
          ) : (
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                fontFamily: "var(--resume-font)",
                fontSize: "var(--resume-body-size)",
                lineHeight: "var(--resume-line-spacing)",
                color: BODY_TEXT,
              }}
            >
              {flatList.map((s, i) => (
                <li
                  key={i}
                  style={{
                    marginBottom: 3,
                    paddingLeft: bulletChar ? 14 : 0,
                    textIndent: bulletChar ? -12 : 0,
                  }}
                >
                  {bulletChar && (
                    <span style={{ marginRight: 6, color: accent }}>
                      {bulletChar}
                    </span>
                  )}
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    },

    experience: (isFirst) =>
      experience.items.length > 0 ? (
        <div key="experience">
          {sectionHeading("Work Experience", isFirst ? 0 : 8)}
          {experience.items.map((item, i) => {
            const heading = [item.role, item.company].filter(Boolean).join(" – ");
            const dates = renderDateRange(item.startDate, item.endDate, item.isCurrent);
            return (
              <div
                key={i}
                data-resume-entry=""
                style={{ marginBottom: i < experience.items.length - 1 ? 12 : 0 }}
              >
                <div
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: "calc(var(--resume-body-size) + 1pt)",
                    fontWeight: 700,
                    color: DARK_TEXT,
                    lineHeight: 1.3,
                  }}
                >
                  {dates ? `${heading} (${dates})` : heading}
                </div>
                {item.location && (
                  <div
                    style={{
                      fontFamily: "var(--resume-font)",
                      fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                      color: MUTED_TEXT,
                      marginTop: 2,
                    }}
                  >
                    {item.location}
                  </div>
                )}
                {renderBullets(item.bullets)}
              </div>
            );
          })}
        </div>
      ) : null,

    education: (isFirst) =>
      education.items.length > 0 ? (
        <div key="education">
          {sectionHeading("Education", isFirst ? 0 : 8)}
          {education.items.map((item, i) => {
            const degreeField = [item.degree, item.field].filter(Boolean).join(" in ");
            const line = [degreeField, item.institution].filter(Boolean).join(" — ");
            const dates = renderDateRange(item.startDate, item.endDate);
            return (
              <div
                key={i}
                data-resume-entry=""
                style={{
                  marginBottom: i < education.items.length - 1 ? 8 : 0,
                  fontFamily: "var(--resume-font)",
                  fontSize: "var(--resume-body-size)",
                  lineHeight: "var(--resume-line-spacing)",
                  color: BODY_TEXT,
                }}
              >
                <div style={{ color: BODY_TEXT }}>{line}</div>
                {dates && (
                  <div
                    style={{
                      fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                      color: MUTED_TEXT,
                      marginTop: 1,
                    }}
                  >
                    {dates}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null,

    certifications: (isFirst) =>
      certifications.items.length > 0 ? (
        <div key="certifications">
          {sectionHeading("Certifications", isFirst ? 0 : 8)}
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
              <div style={{ fontWeight: 700, color: DARK_TEXT }}>{item.name}</div>
              {(item.issuer || item.startDate || item.endDate) && (
                <div
                  style={{
                    fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                    color: MUTED_TEXT,
                    marginTop: 1,
                  }}
                >
                  {[
                    item.issuer,
                    renderDateRange(item.startDate, item.endDate, item.isCurrent),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,

    awards: (isFirst) =>
      awards.items.length > 0 ? (
        <div key="awards">
          {sectionHeading("Awards", isFirst ? 0 : 8)}
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
              <div>
                <span style={{ fontWeight: 700, color: DARK_TEXT }}>
                  {item.title}
                </span>
                {item.issuer && (
                  <span style={{ color: BODY_TEXT }}> — {item.issuer}</span>
                )}
                {item.date && (
                  <span style={{ color: MUTED_TEXT }}>
                    {" "}
                    · {formatDate(item.date)}
                  </span>
                )}
              </div>
              {item.description && (
                <p style={{ margin: "2px 0 0 0", color: BODY_TEXT }}>
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : null,

    projects: (isFirst) =>
      projects.items.length > 0 ? (
        <div key="projects">
          {sectionHeading("Projects", isFirst ? 0 : 8)}
          {projects.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{ marginBottom: i < projects.items.length - 1 ? 10 : 0 }}
            >
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) + 1pt)",
                  fontWeight: 700,
                  color: DARK_TEXT,
                }}
              >
                {item.name}
              </div>
              {(item.startDate || item.endDate) && (
                <div
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                    color: MUTED_TEXT,
                    marginTop: 1,
                  }}
                >
                  {renderDateRange(item.startDate, item.endDate)}
                </div>
              )}
              {item.url && (
                <div
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: "calc(var(--resume-body-size) - 1pt)",
                    color: accent,
                    marginTop: 2,
                  }}
                >
                  {item.url}
                </div>
              )}
              {renderBullets(item.bullets)}
            </div>
          ))}
        </div>
      ) : null,

    volunteering: (isFirst) =>
      volunteering.items.length > 0 ? (
        <div key="volunteering">
          {sectionHeading("Volunteering", isFirst ? 0 : 8)}
          {volunteering.items.map((item, i) => (
            <div
              key={i}
              data-resume-entry=""
              style={{ marginBottom: i < volunteering.items.length - 1 ? 10 : 0 }}
            >
              <div
                style={{
                  fontFamily: "var(--resume-font)",
                  fontSize: "calc(var(--resume-body-size) + 1pt)",
                  fontWeight: 700,
                  color: DARK_TEXT,
                }}
              >
                {[item.role, item.organization].filter(Boolean).join(" – ")}
              </div>
              {(item.startDate || item.endDate) && (
                <div
                  style={{
                    fontFamily: "var(--resume-font)",
                    fontSize: "calc(var(--resume-body-size) - 0.5pt)",
                    color: MUTED_TEXT,
                    marginTop: 1,
                  }}
                >
                  {renderDateRange(item.startDate, item.endDate)}
                </div>
              )}
              {renderBullets(item.bullets)}
            </div>
          ))}
        </div>
      ) : null,

    publications: (isFirst) =>
      publications.items.length > 0 ? (
        <div key="publications">
          {sectionHeading("Publications", isFirst ? 0 : 8)}
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
              <div>
                <span style={{ fontWeight: 700, color: DARK_TEXT }}>
                  {item.title}
                </span>
                {item.publisher && (
                  <span style={{ color: BODY_TEXT }}> — {item.publisher}</span>
                )}
                {item.date && (
                  <span style={{ color: MUTED_TEXT }}>
                    {" "}
                    · {formatDate(item.date)}
                  </span>
                )}
              </div>
              {item.url && (
                <div
                  style={{
                    fontSize: "calc(var(--resume-body-size) - 1pt)",
                    color: accent,
                    marginTop: 2,
                  }}
                >
                  {item.url}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null,
  };

  // ─── Column routing ───
  const HEADER_KEYS = new Set(["contact", "targetTitle"]);
  const BODY_KEYS = new Set(Object.keys(sectionRenderers));

  const leftKeysRaw = design.sidebarSections ?? DEFAULT_LEFT_SECTIONS;
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
    (k) =>
      !HEADER_KEYS.has(k) &&
      !leftSet.has(k) &&
      visibleSet.has(k),
  );

  const leftNodes = leftOrder
    .map((key, idx) => ({ key, node: sectionRenderers[key]?.(idx === 0) }))
    .filter((x): x is { key: string; node: React.ReactNode } => !!x.node);
  const rightNodes = rightOrder
    .map((key, idx) => ({ key, node: sectionRenderers[key]?.(idx === 0) }))
    .filter((x): x is { key: string; node: React.ReactNode } => !!x.node);

  return (
    <div
      style={{
        position: "relative",
        fontFamily: "var(--resume-font)",
        fontSize: "var(--resume-body-size)",
        lineHeight: "var(--resume-line-spacing)",
        color: BODY_TEXT,
        background: PAGE_BG,
        display: "grid",
        gridTemplateColumns: "36% 64%",
        minHeight: paperHeight,
        padding: 0,
      }}
    >
      {/* LEFT */}
      <aside
        style={{
          background: "transparent",
          borderRight: `1px solid ${COLUMN_DIVIDER}`,
          padding: `${padY} ${padInnerX} ${padY} ${padOuterX}`,
          color: DARK_TEXT,
          display: "flex",
          flexDirection: "column",
          gap: `${sectionSpacing}px`,
        }}
      >
        {identityBlock}
        {leftNodes.map(({ key, node }) => {
          const hasPageBreak = pageBreaks.includes(key);
          return (
            <div
              key={key}
              data-resume-section=""
              {...(hasPageBreak ? { "data-page-break-before": "" } : {})}
              style={hasPageBreak ? { pageBreakBefore: "always" as const } : undefined}
            >
              {node as React.ReactNode}
            </div>
          );
        })}
      </aside>

      {/* RIGHT */}
      <main
        style={{
          position: "relative",
          minWidth: 0,
          background: "transparent",
          padding: `${padY} ${padOuterX} ${padBottomRight} ${padInnerX}`,
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
              {node as React.ReactNode}
            </div>
          );
        })}

        {/* Decorative navy wedge anchored to bottom-right */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: 120,
            height: 82,
            background: DECOR_NAVY,
            borderTopLeftRadius: "100%",
            pointerEvents: "none",
          }}
        />
      </main>
    </div>
  );
}

export default OrchidTemplate;
