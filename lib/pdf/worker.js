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
const MONTH_MAP = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11,january:0,february:1,march:2,april:3,june:5,july:6,august:7,september:8,october:9,november:10,december:11 };
const MS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const ML = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function res(v, m, f) { return typeof v === "number" ? v : (m[v] ?? f); }

function fmtDate(d, fmt) {
  if (!d) return "";
  const s = d.trim(), lo = s.toLowerCase();
  if (lo === "present" || lo === "current") return "Present";
  let iso = s.match(/^(\d{4})-(\d{1,2})$/);
  if (iso) { const mi = parseInt(iso[2],10)-1; if (mi>=0&&mi<=11) { if(fmt==="short") return `${MS[mi]} ${iso[1]}`; if(fmt==="long") return `${ML[mi]} ${iso[1]}`; return `${String(mi+1).padStart(2,"0")}/${iso[1]}`; } return iso[1]; }
  let human = s.match(/^([a-zA-Z]+)\s+(\d{4})$/);
  if (human) { const mi = MONTH_MAP[human[1].toLowerCase()]; if (mi!==undefined) { if(fmt==="short") return `${MS[mi]} ${human[2]}`; if(fmt==="long") return `${ML[mi]} ${human[2]}`; return `${String(mi+1).padStart(2,"0")}/${human[2]}`; } }
  let sl = s.match(/^(\d{1,2})\/(\d{4})$/);
  if (sl) { const mi = parseInt(sl[1],10)-1; if (mi>=0&&mi<=11) { if(fmt==="short") return `${MS[mi]} ${sl[2]}`; if(fmt==="long") return `${ML[mi]} ${sl[2]}`; return `${String(mi+1).padStart(2,"0")}/${sl[2]}`; } }
  if (/^\d{4}$/.test(s)) return s;
  return s;
}

function textCase(str, tc) {
  if (tc === "uppercase") return str.toUpperCase();
  if (tc === "capitalize") return str.replace(/\b\w/g, c => c.toUpperCase());
  return str;
}

function dateRange(x, fmt, sep) {
  const s = fmtDate(x.startDate, fmt);
  const end = x.isCurrent ? "Present" : fmtDate(x.endDate, fmt);
  if (s && end) return `${s}${sep}${end}`;
  return s || end || "";
}

async function render(input) {
  const { data, design: ds, watermark } = input;
  const e = React.createElement;

  const font = FONT_MAP[ds.font] || "Helvetica";
  const fontBold = FONT_BOLD_MAP[ds.font] || "Helvetica-Bold";
  const accent = ds.accentColor || "#0D9488";
  const bodyPt = res(ds.bodySize, BODY_PT, 10);
  const namePt = res(ds.nameSize, NAME_PT, 24);
  const headingPt = res(ds.sectionHeadingSize, HEADING_PT, 9);
  const nameWt = WEIGHT_MAP[ds.nameWeight] || 700;
  const headingWt = WEIGHT_MAP[ds.sectionHeadingWeight] || 700;
  const lineH = ds.lineSpacing || 1.4;
  const mx = (ds.marginX || 0.75) * 72;
  const my = (ds.marginY || 0.5) * 72;
  const align = ds.headerAlignment || "left";
  const paper = ds.paperSize === "letter" ? "LETTER" : "A4";
  const bullet = BULLET_MAP[ds.bulletStyle] || "•";
  const dateFmt = ds.dateFormat || "short";
  const sep = SEP_MAP[ds.contactSeparator] || " | ";
  const secSpacing = ds.sectionSpacing || 14;
  const vis = data.sections || {};
  const order = ds.sectionOrder || [];
  const tpl = ds.template || "classic";
  const pageBreaks = ds.pageBreaks || [];

  // --- Template-specific overrides ---
  let nameColor = "#1a1a1a";
  let titleColor = "#333";
  let titleWeight = 600;
  let headingColor = accent;
  let headingBorderWidth = 1;
  let headingBorderColor = accent;
  let headingLetterSpacing = 1.5;
  let headerBorderLeft = 0;
  let sectionBorderLeft = 0;
  let dateSep = " - ";

  if (tpl === "classic") {
    // accent headings + accent underline (matches HTML classic.tsx)
  } else if (tpl === "sharp") {
    headerBorderLeft = 4;
    headingBorderWidth = 0;
    titleColor = accent;
  } else if (tpl === "minimal") {
    nameColor = accent;
    headingColor = "#666";
    headingBorderWidth = 0;
    headingLetterSpacing = 1;
  } else if (tpl === "executive") {
    headingBorderWidth = 0.5;
    headingBorderColor = "#d4d4d4";
    headingLetterSpacing = 1;
    dateSep = " – ";
  } else if (tpl === "sidebar") {
    nameColor = accent;
    headingBorderWidth = 0;
    sectionBorderLeft = 3;
  }

  // --- Styles (after overrides) ---
  const nameStyle = { fontSize: namePt, fontFamily: nameWt >= 700 ? fontBold : font, lineHeight: 1.2, textAlign: align, color: nameColor };
  const titleStyle = { fontSize: bodyPt + 2, fontFamily: titleWeight >= 600 ? fontBold : font, textAlign: align, color: titleColor };
  const contactStyle = { fontSize: 9, fontFamily: font, color: "#555", textAlign: align };
  const headingStyle = { fontSize: headingPt, fontFamily: headingWt >= 700 ? fontBold : font, letterSpacing: headingLetterSpacing, color: headingColor, borderBottomWidth: headingBorderWidth, borderBottomColor: headingBorderColor, paddingBottom: 3, marginBottom: 6 };
  const bodyStyle = { fontSize: bodyPt, fontFamily: font, lineHeight: lineH, color: "#1a1a1a" };
  const boldStyle = { fontSize: bodyPt, fontFamily: fontBold, lineHeight: lineH, color: "#1a1a1a" };
  const dateStyle = { fontSize: 8.5, fontFamily: font, color: "#777", textAlign: "right", minWidth: 90 };

  // --- Build sections ---
  const children = [];

  // HEADER: contact block
  if (vis.contact !== false) {
    const contactItems = [data.contact.email, data.contact.phone, data.contact.location, data.contact.linkedin, data.contact.website].filter(Boolean);

    if (tpl === "executive") {
      // Executive: name + title same line
      const parts = [];
      if (data.contact.name) parts.push(data.contact.name);
      if (data.targetTitle?.title && vis.targetTitle !== false) parts.push(data.targetTitle.title);
      const hdr = [];
      if (parts.length) hdr.push(e(Text, { key: "nl", style: { ...nameStyle, fontSize: namePt - 4 } }, parts.join("  —  ")));
      if (contactItems.length) hdr.push(e(Text, { key: "ci", style: { ...contactStyle, fontSize: 8, marginTop: 4 } }, contactItems.join(sep)));
      children.push(e(View, { key: "hdr", style: { marginBottom: 10 } }, ...hdr));
    } else {
      // All other templates: name block
      const hdr = [];
      if (data.contact.name) {
        hdr.push(e(Text, { key: "nm", style: nameStyle }, data.contact.name));
      }
      if (contactItems.length) {
        hdr.push(e(Text, { key: "ci", style: { ...contactStyle, marginTop: 6 } }, contactItems.join(sep)));
      }

      const hdrStyle = { marginBottom: 6 };
      if (headerBorderLeft > 0) {
        hdrStyle.borderLeftWidth = headerBorderLeft;
        hdrStyle.borderLeftColor = accent;
        hdrStyle.paddingLeft = 12;
      }
      children.push(e(View, { key: "hdr", style: hdrStyle }, ...hdr));
    }
  }

  // TARGET TITLE: separate from header (matches HTML templates)
  if (tpl !== "executive" && vis.targetTitle !== false && data.targetTitle?.title) {
    const ttStyle = { ...titleStyle, marginTop: 2, marginBottom: 4 };
    if (tpl === "sharp") ttStyle.color = accent;
    if (headerBorderLeft > 0) {
      // For sharp: title sits outside the border block
    }
    children.push(e(View, { key: "tt", style: { marginBottom: 4 } },
      e(Text, { style: ttStyle }, data.targetTitle.title)
    ));
  }

  // BODY SECTIONS
  function makeHeading(title) {
    const txt = textCase(title, ds.sectionHeadingCase || "uppercase");
    return e(Text, { style: headingStyle, minPresenceAhead: 40 }, txt);
  }

  function makeBullets(bullets) {
    return (bullets || []).filter(Boolean).map((b, j) =>
      e(View, { key: `b${j}`, style: { flexDirection: "row", marginLeft: 8, marginBottom: 1.5 } },
        bullet ? e(Text, { style: { width: 10, ...bodyStyle } }, bullet) : null,
        e(Text, { style: { flex: 1, ...bodyStyle, color: "#444" } }, b)
      )
    );
  }

  function addSection(key, title, content) {
    if (!content || !content.length) return;
    const isBreak = pageBreaks.includes(key);
    const sectionProps = { key, style: { marginTop: secSpacing } };
    if (isBreak) sectionProps.break = true;

    const inner = e(View, sectionProps, makeHeading(title), ...content);

    if (sectionBorderLeft > 0) {
      children.push(e(View, { key: key + "_bdr", style: { borderLeftWidth: sectionBorderLeft, borderLeftColor: accent, paddingLeft: 12, marginTop: secSpacing } }, makeHeading(title), ...content));
    } else {
      children.push(inner);
    }
  }

  for (const key of order) {
    if (key === "contact" || key === "targetTitle") continue;
    if (vis[key] === false) continue;

    if (key === "summary" && data.summary?.content) {
      addSection("summary", "Summary", [e(Text, { key: "sc", style: bodyStyle }, data.summary.content)]);
    }

    if (key === "experience" && data.experience?.items?.length) {
      addSection("experience", "Experience", data.experience.items.map((x, i) =>
        e(View, { key: `exp${i}`, style: { marginBottom: 8 } },
          e(View, { style: { flexDirection: "row", justifyContent: "space-between", marginBottom: 1 } },
            e(View, { style: { flex: 1, paddingRight: 8 } },
              e(Text, { style: boldStyle }, x.role || ""),
              x.company ? e(Text, { style: { ...bodyStyle, color: "#555", fontSize: bodyPt - 0.5 } }, x.company + (x.location ? " | " + x.location : "")) : null
            ),
            e(Text, { style: dateStyle }, dateRange(x, dateFmt, dateSep))
          ),
          ...makeBullets(x.bullets)
        )
      ));
    }

    if (key === "education" && data.education?.items?.length) {
      addSection("education", "Education", data.education.items.map((x, i) =>
        e(View, { key: `edu${i}`, style: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 } },
          e(View, { style: { flex: 1, paddingRight: 8 } },
            e(Text, { style: boldStyle }, (x.degree || "") + (x.field ? " in " + x.field : "")),
            e(Text, { style: { ...bodyStyle, color: "#555" } }, x.institution || "")
          ),
          e(Text, { style: dateStyle }, dateRange(x, dateFmt, dateSep))
        )
      ));
    }

    if (key === "skills" && data.skills?.categories?.length) {
      addSection("skills", "Skills", data.skills.categories.map((x, i) =>
        e(View, { key: `sk${i}`, style: { marginBottom: 3 } },
          e(Text, null,
            e(Text, { style: boldStyle }, (x.name || "") + ": "),
            e(Text, { style: { ...bodyStyle, color: "#444" } }, (x.skills || []).join(", "))
          )
        )
      ));
    }

    if (key === "certifications" && data.certifications?.items?.length) {
      addSection("certifications", "Certifications", data.certifications.items.map((x, i) =>
        e(View, { key: `ct${i}`, style: { marginBottom: 3 } },
          e(Text, { style: boldStyle }, x.name || ""),
          x.issuer ? e(Text, { style: { ...bodyStyle, fontSize: 8.5, color: "#555" } }, x.issuer) : null
        )
      ));
    }

    if (key === "awards" && data.awards?.items?.length) {
      addSection("awards", "Awards", data.awards.items.map((x, i) =>
        e(View, { key: `aw${i}`, style: { marginBottom: 3 } },
          e(Text, { style: boldStyle }, x.title || ""),
          x.issuer ? e(Text, { style: { ...bodyStyle, color: "#555" } }, x.issuer) : null,
          x.description ? e(Text, { style: bodyStyle }, x.description) : null
        )
      ));
    }

    if (key === "projects" && data.projects?.items?.length) {
      addSection("projects", "Projects", data.projects.items.map((x, i) =>
        e(View, { key: `pr${i}`, style: { marginBottom: 8 } },
          e(View, { style: { flexDirection: "row", justifyContent: "space-between", marginBottom: 1 } },
            e(Text, { style: { ...boldStyle, flex: 1 } }, x.name || ""),
            e(Text, { style: dateStyle }, dateRange(x, dateFmt, dateSep))
          ),
          ...makeBullets(x.bullets)
        )
      ));
    }

    if (key === "volunteering" && data.volunteering?.items?.length) {
      addSection("volunteering", "Volunteering", data.volunteering.items.map((x, i) =>
        e(View, { key: `vol${i}`, style: { marginBottom: 8 } },
          e(View, { style: { flexDirection: "row", justifyContent: "space-between", marginBottom: 1 } },
            e(View, { style: { flex: 1, paddingRight: 8 } },
              e(Text, { style: boldStyle }, x.role || ""),
              e(Text, { style: { ...bodyStyle, color: "#555" } }, x.organization || "")
            ),
            e(Text, { style: dateStyle }, dateRange(x, dateFmt, dateSep))
          ),
          ...makeBullets(x.bullets)
        )
      ));
    }

    if (key === "publications" && data.publications?.items?.length) {
      addSection("publications", "Publications", data.publications.items.map((x, i) =>
        e(View, { key: `pub${i}`, style: { marginBottom: 3 } },
          e(Text, { style: boldStyle }, x.title || ""),
          x.publisher ? e(Text, { style: { ...bodyStyle, color: "#555" } }, x.publisher) : null
        )
      ));
    }
  }

  if (watermark) {
    children.push(e(Text, { key: "wm", fixed: true, style: { position: "absolute", bottom: 14, left: 0, right: 0, textAlign: "center", fontSize: 7, color: "#bbb" } }, "Built with CVEdge"));
  }

  const doc = e(Document, null,
    e(Page, { size: paper, style: { paddingTop: my, paddingBottom: my + 10, paddingLeft: mx, paddingRight: mx, fontFamily: font, fontSize: bodyPt, lineHeight: lineH, color: "#1a1a1a" } },
      ...children
    )
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
