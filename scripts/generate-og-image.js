const fs = require("fs");
const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#065F46"/>
  <text x="100" y="200" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white">CVEdge</text>
  <text x="100" y="300" font-family="Arial, sans-serif" font-size="36" fill="#34D399">Get more interviews.</text>
  <text x="100" y="360" font-family="Arial, sans-serif" font-size="36" fill="#34D399">Fix your CV in 8 minutes.</text>
  <text x="100" y="460" font-family="Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.6)">Free forever · 90+ ATS guaranteed</text>
  <text x="100" y="560" font-family="Arial, sans-serif" font-size="20" fill="rgba(255,255,255,0.4)">thecvedge.com</text>
</svg>`;
fs.writeFileSync("public/og-image.svg", svg);
console.log("✓ OG image SVG created at public/og-image.svg");
// Note: For PNG conversion, use an online SVG-to-PNG converter or sharp library
