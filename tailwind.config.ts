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
      },
      animation: {
        "logo-scroll": "logo-scroll 60s linear infinite",
        "shimmer-sweep": "shimmer-sweep 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
export default config;
