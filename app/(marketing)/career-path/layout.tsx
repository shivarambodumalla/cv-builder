import { DM_Sans, Instrument_Serif } from "next/font/google";

// The career path section has its own type: Instrument Serif for display
// headings over DM Sans body. Scoped here so the rest of the site stays on
// Geist. Use `font-cp-display` for headings and big figures; body text inherits
// DM Sans from the wrapper.
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-cp-display",
  display: "swap",
});

const body = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cp-body",
  display: "swap",
});

export default function CareerPathLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${display.variable} ${body.variable} font-[family-name:var(--font-cp-body)] text-[#0C1A0E]`}>
      {children}
    </div>
  );
}
