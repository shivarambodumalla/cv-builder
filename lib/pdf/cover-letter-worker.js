/* eslint-disable @typescript-eslint/no-require-imports */
const React = require("react");
const { renderToBuffer, Document, Page, Text, View } = require("@react-pdf/renderer");

const e = React.createElement;

function buildDoc({ content, candidateName, company, showWatermark }) {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const paragraphs = content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return e(
    Document,
    null,
    e(
      Page,
      {
        size: "A4",
        style: {
          fontFamily: "Helvetica",
          fontSize: 11,
          paddingTop: 60,
          paddingBottom: 60,
          paddingHorizontal: 60,
          lineHeight: 1.6,
          color: "#1a1a1a",
        },
      },
      // Candidate name
      candidateName
        ? e(
            Text,
            {
              style: {
                fontSize: 16,
                fontFamily: "Helvetica-Bold",
                marginBottom: 4,
              },
            },
            candidateName
          )
        : null,
      // Date
      e(
        Text,
        {
          style: {
            fontSize: 10,
            color: "#666666",
            marginBottom: 4,
          },
        },
        today
      ),
      // Company
      company
        ? e(
            Text,
            {
              style: {
                fontSize: 10,
                color: "#666666",
                marginBottom: 24,
              },
            },
            company
          )
        : e(View, { style: { marginBottom: 20 } }),
      // Body paragraphs
      ...paragraphs.map((p, i) =>
        e(
          Text,
          {
            key: i,
            style: {
              marginBottom: 12,
              fontSize: 11,
              lineHeight: 1.6,
            },
          },
          p
        )
      ),
      // Watermark for free plan
      showWatermark
        ? e(
            Text,
            {
              style: {
                position: "absolute",
                bottom: 30,
                left: 60,
                fontSize: 8,
                color: "#999999",
              },
            },
            "Generated with CVEdge"
          )
        : null
    )
  );
}

async function main() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  const input = JSON.parse(raw);
  const doc = buildDoc(input);
  const buffer = await renderToBuffer(doc);
  process.stdout.write(buffer);
}

main().catch((err) => {
  process.stderr.write(String(err));
  process.exit(1);
});
