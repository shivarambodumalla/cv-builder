/* eslint-disable @typescript-eslint/no-require-imports */
const React = require("react");
const { renderToBuffer, Document, Page, Text, View } = require("@react-pdf/renderer");

const BODY_PT = { S: 9, M: 10, L: 11 };
const NAME_PT = { S: 20, M: 24, L: 28 };
const HEADING_PT = { S: 8, M: 9, L: 10 };
const WEIGHT_MAP = { light: 300, regular: 400, medium: 500, bold: 700, black: 900 };
const BULLET_MAP = { dot: "•", dash: "–", arrow: "→", none: "" };
const SEP_MAP = { pipe: " | ", dot: " · ", dash: " – ", comma: ", ", none: "  " };
const FONT_MAP = { classic: "Times-Roman", clean: "Helvetica", elegant: "Times-Roman", strong: "Helvetica" };
const FONT_BOLD_MAP = { classic: "Times-Bold", clean: "Helvetica-Bold", elegant: "Times-Bold", strong: "Helvetica-Bold" };

function resolve(val, map, fallback) {
  if (typeof val === "number") return val;
  return map[val] ?? fallback;
}

const MONTH_MAP = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  january: 0, february: 1, march: 2, april: 3, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};
const MS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const ML = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function fmtDate(d, fmt) {
  if (!d) return "";
  const s = d.trim();
  const lo = s.toLowerCase();
  if (lo === "present" || lo === "current") return "Present";

  // Try YYYY-MM (ISO-like)
  const iso = s.match(/^(\d{4})-(\d{1,2})$/);
  if (iso) {
    const y = iso[1];
    const mi = parseInt(iso[2], 10) - 1;
    if (mi >= 0 && mi <= 11) {
      if (fmt === "short") return `${MS[mi]} ${y}`;
      if (fmt === "long") return `${ML[mi]} ${y}`;
      return `${String(mi + 1).padStart(2, "0")}/${y}`;
    }
    return y;
  }

  // Try "Mon YYYY" or "Month YYYY" (e.g. "Feb 2018", "January 2020")
  const human = s.match(/^([a-zA-Z]+)\s+(\d{4})$/);
  if (human) {
    const mi = MONTH_MAP[human[1].toLowerCase()];
    const y = human[2];
    if (mi !== undefined) {
      if (fmt === "short") return `${MS[mi]} ${y}`;
      if (fmt === "long") return `${ML[mi]} ${y}`;
      return `${String(mi + 1).padStart(2, "0")}/${y}`;
    }
  }

  // Try MM/YYYY
  const slashed = s.match(/^(\d{1,2})\/(\d{4})$/);
  if (slashed) {
    const mi = parseInt(slashed[1], 10) - 1;
    const y = slashed[2];
    if (mi >= 0 && mi <= 11) {
      if (fmt === "short") return `${MS[mi]} ${y}`;
      if (fmt === "long") return `${ML[mi]} ${y}`;
      return `${String(mi + 1).padStart(2, "0")}/${y}`;
    }
  }

  // Try plain year
  if (/^\d{4}$/.test(s)) return s;

  // Return as-is if nothing matched
  return s;
}

function textCase(str, tc) {
  if (tc === "uppercase") return str.toUpperCase();
  if (tc === "capitalize") return str.replace(/\b\w/g, c => c.toUpperCase());
  return str;
}

// --- Shared builders ---

function buildHeader(data, ds, s, e) {
  const { contact, targetTitle } = data;
  const items = [contact.email, contact.phone, contact.location, contact.linkedin, contact.website].filter(Boolean);
  const sep = SEP_MAP[ds.contactSeparator] || " | ";
  const ch = [];
  if (contact.name) {
    ch.push(e(View, { key: "nameWrap", style: { marginBottom: 4 } },
      e(Text, { style: s.name }, contact.name)
    ));
  }
  if (targetTitle?.title && data.sections?.targetTitle !== false) {
    ch.push(e(View, { key: "titleWrap", style: { marginBottom: 4 } },
      e(Text, { style: s.targetTitle }, targetTitle.title)
    ));
  }
  if (items.length) {
    ch.push(e(View, { key: "contactWrap", style: { marginBottom: 2 } },
      e(Text, { style: s.contactInfo }, items.join(sep))
    ));
  }
  return [e(View, { key: "hdr", style: { marginBottom: 8 } }, ...ch)];
}

function buildSectionView(key, title, content, ds, s, e) {
  if (!content || !content.length) return null;
  const isManualBreak = (ds.pageBreaks || []).includes(key);
  const headingText = textCase(title, ds.sectionHeadingCase || "uppercase");
  const props = { key, style: { marginTop: ds.sectionSpacing || 16 } };
  if (isManualBreak) props.break = true;
  return e(View, props,
    e(Text, { style: s.sectionTitle, minPresenceAhead: 40 }, headingText),
    ...content
  );
}

function dateRange(x, dateFmt) {
  const start = fmtDate(x.startDate, dateFmt);
  const end = x.isCurrent ? "Present" : fmtDate(x.endDate, dateFmt);
  if (start && end) return `${start} – ${end}`;
  return start || end || "";
}

function buildBody(data, ds, s, e) {
  const out = [];
  const order = ds.sectionOrder || ["summary","experience","education","skills","certifications"];
  const vis = data.sections || {};
  const bullet = BULLET_MAP[ds.bulletStyle] || "•";
  const dateFmt = ds.dateFormat || "short";
  const sectionWrap = s.sectionWrap || null;

  function addSection(key, title, content) {
    if (vis[key] === false) return;
    const el = buildSectionView(key, title, content, ds, s, e);
    if (!el) return;
    out.push(sectionWrap ? e(View, { key: key + "_w", style: sectionWrap }, el) : el);
  }

  function bulletList(bullets) {
    return (bullets || []).filter(Boolean).map((b, j) =>
      e(View, { key: `b${j}`, style: { flexDirection: "row", marginLeft: 8, marginBottom: 1.5 } },
        bullet ? e(Text, { style: { width: 10, ...s.body } }, bullet) : null,
        e(Text, { style: { flex: 1, ...s.body, color: "#444" } }, b)
      )
    );
  }

  for (const key of order) {
    if (key === "contact" || key === "targetTitle") continue;

    if (key === "summary" && data.summary?.content) {
      addSection("summary", "Summary", [
        e(Text, { key: "sc", style: s.body }, data.summary.content)
      ]);
    }

    if (key === "experience" && data.experience?.items?.length) {
      addSection("experience", "Experience", data.experience.items.map((x, i) =>
        e(View, { key: `exp${i}`, style: { marginBottom: 8 } },
          e(View, { style: { flexDirection: "row", justifyContent: "space-between", marginBottom: 1 } },
            e(View, { style: { flex: 1, paddingRight: 8 } },
              e(Text, { style: s.bold }, x.role || ""),
              x.company ? e(Text, { style: { ...s.body, color: "#555", fontSize: s.body.fontSize - 0.5 } },
                x.company + (x.location ? " | " + x.location : "")
              ) : null
            ),
            e(Text, { style: { ...s.body, fontSize: 8.5, color: "#777", textAlign: "right", minWidth: 90 } }, dateRange(x, dateFmt))
          ),
          ...bulletList(x.bullets)
        )
      ));
    }

    if (key === "education" && data.education?.items?.length) {
      addSection("education", "Education", data.education.items.map((x, i) =>
        e(View, { key: `edu${i}`, style: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 } },
          e(View, { style: { flex: 1, paddingRight: 8 } },
            e(Text, { style: s.bold }, (x.degree || "") + (x.field ? " in " + x.field : "")),
            e(Text, { style: { ...s.body, color: "#555" } }, x.institution || "")
          ),
          e(Text, { style: { ...s.body, fontSize: 8.5, color: "#777", textAlign: "right", minWidth: 90 } }, dateRange(x, dateFmt))
        )
      ));
    }

    if (key === "skills" && data.skills?.categories?.length) {
      addSection("skills", "Skills", data.skills.categories.map((x, i) =>
        e(View, { key: `sk${i}`, style: { marginBottom: 3 } },
          e(Text, null,
            e(Text, { style: s.bold }, (x.name || "") + ": "),
            e(Text, { style: { ...s.body, color: "#444" } }, (x.skills || []).join(", "))
          )
        )
      ));
    }

    if (key === "certifications" && data.certifications?.items?.length) {
      addSection("certifications", "Certifications", data.certifications.items.map((x, i) =>
        e(View, { key: `ct${i}`, style: { marginBottom: 3 } },
          e(Text, { style: s.bold }, x.name || ""),
          x.issuer ? e(Text, { style: { ...s.body, fontSize: 8.5, color: "#555" } }, x.issuer) : null
        )
      ));
    }

    if (key === "awards" && data.awards?.items?.length) {
      addSection("awards", "Awards", data.awards.items.map((x, i) =>
        e(View, { key: `aw${i}`, style: { marginBottom: 3 } },
          e(Text, { style: s.bold }, x.title || ""),
          x.issuer ? e(Text, { style: { ...s.body, color: "#555" } }, x.issuer) : null,
          x.description ? e(Text, { style: s.body }, x.description) : null
        )
      ));
    }

    if (key === "projects" && data.projects?.items?.length) {
      addSection("projects", "Projects", data.projects.items.map((x, i) =>
        e(View, { key: `pr${i}`, style: { marginBottom: 8 } },
          e(View, { style: { flexDirection: "row", justifyContent: "space-between", marginBottom: 1 } },
            e(Text, { style: { ...s.bold, flex: 1 } }, x.name || ""),
            e(Text, { style: { ...s.body, fontSize: 8.5, color: "#777", textAlign: "right" } }, dateRange(x, dateFmt))
          ),
          ...bulletList(x.bullets)
        )
      ));
    }

    if (key === "volunteering" && data.volunteering?.items?.length) {
      addSection("volunteering", "Volunteering", data.volunteering.items.map((x, i) =>
        e(View, { key: `vol${i}`, style: { marginBottom: 8 } },
          e(View, { style: { flexDirection: "row", justifyContent: "space-between", marginBottom: 1 } },
            e(View, { style: { flex: 1, paddingRight: 8 } },
              e(Text, { style: s.bold }, x.role || ""),
              e(Text, { style: { ...s.body, color: "#555" } }, x.organization || "")
            ),
            e(Text, { style: { ...s.body, fontSize: 8.5, color: "#777", textAlign: "right" } }, dateRange(x, dateFmt))
          ),
          ...bulletList(x.bullets)
        )
      ));
    }

    if (key === "publications" && data.publications?.items?.length) {
      addSection("publications", "Publications", data.publications.items.map((x, i) =>
        e(View, { key: `pub${i}`, style: { marginBottom: 3 } },
          e(Text, { style: s.bold }, x.title || ""),
          x.publisher ? e(Text, { style: { ...s.body, color: "#555" } }, x.publisher) : null
        )
      ));
    }
  }

  return out;
}

// --- Templates ---

function renderClassic(data, ds, s, e) {
  const align = ds.headerAlignment || "left";
  const hdr = buildHeader(data, ds, {
    ...s,
    name: { ...s.name, textAlign: align },
    targetTitle: { ...s.targetTitle, textAlign: align },
    contactInfo: { ...s.contactInfo, textAlign: align },
  }, e);
  return [...hdr, ...buildBody(data, ds, s, e)];
}

function renderSharp(data, ds, s, e) {
  const accent = ds.accentColor || "#0D9488";
  const hdrChildren = buildHeader(data, ds, s, e);
  const header = e(View, {
    key: "sharpHeader",
    style: { borderLeftWidth: 4, borderLeftColor: accent, paddingLeft: 12, marginBottom: 8 },
  }, ...hdrChildren);
  const body = buildBody(data, ds, {
    ...s,
    sectionTitle: { ...s.sectionTitle, color: accent, borderBottomWidth: 0 },
  }, e);
  return [header, ...body];
}

function renderMinimal(data, ds, s, e) {
  const accent = ds.accentColor || "#0D9488";
  const hdr = buildHeader(data, ds, {
    ...s,
    name: { ...s.name, color: accent },
  }, e);
  const body = buildBody(data, ds, {
    ...s,
    sectionTitle: { ...s.sectionTitle, borderBottomWidth: 0, color: "#666" },
  }, e);
  return [...hdr, ...body];
}

function renderExecutive(data, ds, s, e) {
  const { contact, targetTitle } = data;
  const namePt = resolve(ds.nameSize, NAME_PT, 24);
  const ch = [];
  const parts = [];
  if (contact.name) parts.push(contact.name);
  if (targetTitle?.title && data.sections?.targetTitle !== false) parts.push(targetTitle.title);
  if (parts.length) ch.push(e(Text, { key: "nl", style: { ...s.name, fontSize: namePt - 4 } }, parts.join("  —  ")));
  const items = [contact.email, contact.phone, contact.location, contact.linkedin, contact.website].filter(Boolean);
  const sep = SEP_MAP[ds.contactSeparator] || " | ";
  if (items.length) ch.push(e(Text, { key: "ci", style: { ...s.contactInfo, fontSize: 8 } }, items.join(sep)));
  return [...ch, ...buildBody(data, ds, s, e)];
}

function renderSidebar(data, ds, s, e) {
  const accent = ds.accentColor || "#0D9488";
  const hdr = buildHeader(data, ds, s, e);
  const body = buildBody(data, ds, {
    ...s,
    sectionTitle: { ...s.sectionTitle, color: accent, borderBottomWidth: 0 },
    sectionWrap: { borderLeftWidth: 3, borderLeftColor: accent, paddingLeft: 10 },
  }, e);
  return [...hdr, ...body];
}

// --- Main ---

async function render(input) {
  const { data, design: ds, watermark } = input;
  const e = React.createElement;

  const font = FONT_MAP[ds.font] || "Helvetica";
  const fontBold = FONT_BOLD_MAP[ds.font] || "Helvetica-Bold";
  const accent = ds.accentColor || "#0D9488";
  const bodyPt = resolve(ds.bodySize, BODY_PT, 10);
  const namePt = resolve(ds.nameSize, NAME_PT, 24);
  const headingPt = resolve(ds.sectionHeadingSize, HEADING_PT, 9);
  const nameWt = WEIGHT_MAP[ds.nameWeight] || 700;
  const headingWt = WEIGHT_MAP[ds.sectionHeadingWeight] || 700;
  const lineH = ds.lineSpacing || 1.4;
  const mx = (ds.marginX || 0.75) * 72;
  const my = (ds.marginY || 0.5) * 72;
  const align = ds.headerAlignment || "left";
  const paper = ds.paperSize === "letter" ? "LETTER" : "A4";

  const s = {
    name: { fontSize: namePt, fontFamily: nameWt >= 700 ? fontBold : font, textAlign: align, color: "#1a1a1a" },
    targetTitle: { fontSize: bodyPt + 1, fontFamily: font, textAlign: align, color: accent, marginBottom: 4 },
    contactInfo: { fontSize: 9, fontFamily: font, color: "#555", textAlign: align, marginBottom: 6 },
    sectionTitle: {
      fontSize: headingPt, fontFamily: headingWt >= 700 ? fontBold : font, letterSpacing: 1,
      color: "#333", borderBottomWidth: 0.5, borderBottomColor: "#d4d4d4",
      paddingBottom: 3, marginBottom: 6,
    },
    body: { fontSize: bodyPt, fontFamily: font, lineHeight: lineH, color: "#1a1a1a" },
    bold: { fontSize: bodyPt, fontFamily: fontBold, lineHeight: lineH, color: "#1a1a1a" },
  };

  const templateFn = { classic: renderClassic, sharp: renderSharp, minimal: renderMinimal, executive: renderExecutive, sidebar: renderSidebar }[ds.template] || renderClassic;
  const children = templateFn(data, ds, s, e);

  if (watermark) {
    children.push(e(Text, {
      key: "wm", fixed: true,
      style: { position: "absolute", bottom: 14, left: 0, right: 0, textAlign: "center", fontSize: 7, color: "#bbb" },
    }, "Built with CVPilot — cvpilot.com"));
  }

  const doc = e(Document, null,
    e(Page, {
      size: paper,
      style: { paddingTop: my, paddingBottom: my + 10, paddingLeft: mx, paddingRight: mx, fontFamily: font, fontSize: bodyPt, lineHeight: lineH, color: "#1a1a1a" },
    }, ...children)
  );

  return renderToBuffer(doc);
}

process.stdin.setEncoding("utf8");
let input = "";
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  render(JSON.parse(input))
    .then((buf) => { process.stdout.write(buf); process.exit(0); })
    .catch((err) => { process.stderr.write(String(err.stack || err.message)); process.exit(1); });
});
