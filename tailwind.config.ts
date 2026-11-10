import type { Config } from "tailwindcss";

/**
 * A theme colour that accepts Tailwind's opacity modifier. Plain `var(--x)`
 * cannot take one: Tailwind 3 skips `bg-success/10` entirely when the colour
 * is a CSS variable it can't parse, so every tint silently rendered nothing.
 * color-mix keeps the variable (dark mode still adapts) and applies the alpha.
 */
function token(name: string): string {
  return `color-mix(in srgb, var(--${name}) calc(<alpha-value> * 100%), transparent)`;
}

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Outfit", "sans-serif"],
        mono: ["var(--font-geist-mono)", "Fira Code", "monospace"],
        // Career path display headings: the theme sans, not a separate face.
        "cp-display": ["var(--font-geist-sans)", "Outfit", "sans-serif"],
      },
      colors: {
        border: token("border"),
        input: token("input"),
        ring: token("ring"),
        background: token("background"),
        foreground: token("foreground"),
        primary: {
          DEFAULT: token("primary"),
          foreground: token("primary-foreground"),
        },
        secondary: {
          DEFAULT: token("secondary"),
          foreground: token("secondary-foreground"),
        },
        destructive: {
          DEFAULT: token("destructive"),
          foreground: token("destructive-foreground"),
        },
        muted: {
          DEFAULT: token("muted"),
          foreground: token("muted-foreground"),
        },
        accent: {
          DEFAULT: token("accent"),
          foreground: token("accent-foreground"),
        },
        popover: {
          DEFAULT: token("popover"),
          foreground: token("popover-foreground"),
        },
        card: {
          DEFAULT: token("card"),
          foreground: token("card-foreground"),
        },
        success: {
          DEFAULT: token("success"),
        },
        warning: {
          DEFAULT: token("warning"),
        },
        error: {
          DEFAULT: token("error"),
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "logo-scroll": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "shimmer-sweep": {
          "0%": { transform: "translateX(-150%)" },
          "60%, 100%": { transform: "translateX(150%)" },
        },
        // ATS scan illustration: a beam sweeps the page, keywords light up as it passes.
        "ats-beam": {
          "0%": { top: "8px", opacity: "0" },
          "8%, 92%": { opacity: "1" },
          "100%": { top: "118px", opacity: "0" },
        },
        "ats-hit": {
          "0%, 30%": { backgroundColor: "#E7E1D6" },
          "45%, 100%": { backgroundColor: "#A7F3D0" },
        },
        "ats-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(30,58,95,0)" },
          "50%": { boxShadow: "0 0 24px 6px rgba(30,58,95,0.18)" },
        },
        // A category score that just moved: green wash fading out over 2s.
        "ats-rise": {
          "0%": { backgroundColor: "#EEF6F1" },
          "100%": { backgroundColor: "transparent" },
        },
      },
      animation: {
        "logo-scroll": "logo-scroll 60s linear infinite",
        "shimmer-sweep": "shimmer-sweep 3s ease-in-out infinite",
        "ats-beam": "ats-beam 2.4s ease-in-out infinite",
        "ats-hit": "ats-hit 2.4s ease-in-out infinite",
        "ats-glow": "ats-glow 2.4s ease-in-out infinite",
        "ats-rise": "ats-rise 2s ease-out 1",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
export default config;
