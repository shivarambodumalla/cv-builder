// The career path section uses the site's theme fonts (Geist) like every other
// page. `font-cp-display` (tailwind.config.ts) maps to Geist Sans so headings
// share one class; the wrapper sets the section's ink colour.
export default function CareerPathLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="text-[#0C1A0E]">{children}</div>;
}
