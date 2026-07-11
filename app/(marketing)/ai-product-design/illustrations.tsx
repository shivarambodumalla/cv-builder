/* Hand-drawn SVG accents and scenes for the mentorship page.
   All theme-aware via currentColor / design tokens. Server-safe. */

export function ScribbleUnderline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 14" className={className} fill="none" aria-hidden preserveAspectRatio="none">
      <path
        d="M4 9 C 40 3, 85 2, 122 6 S 185 12, 216 5"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}

export function DoodleArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 60" className={className} fill="none" aria-hidden>
      <path
        d="M6 8 C 30 14, 58 22, 64 46"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="1 8"
      />
      <path
        d="M52 42 L 65 50 L 68 35"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SparkleDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} fill="none" aria-hidden>
      <path d="M30 6 L 33 24 L 51 27 L 33 30 L 30 48 L 27 30 L 9 27 L 27 24 Z" fill="currentColor" opacity="0.9" />
      <path d="M48 8 L 49.5 15 L 56 16.5 L 49.5 18 L 48 25 L 46.5 18 L 40 16.5 L 46.5 15 Z" fill="currentColor" opacity="0.5" />
      <circle cx="12" cy="46" r="3" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

export function DotGrid({ className, id }: { className?: string; id: string }) {
  return (
    <svg className={className} aria-hidden>
      <defs>
        <pattern id={id} x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.6" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Mentor and learner connected over a live session. */
export function MentorshipScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 240" className={className} fill="none" aria-hidden>
      {/* connection */}
      <path
        d="M120 128 C 150 96, 210 96, 240 128"
        stroke="var(--resume-accent, #1a7a6d)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="2 10"
        className="stroke-primary"
      />
      {/* mentor bubble */}
      <circle cx="92" cy="148" r="44" className="fill-primary" opacity="0.12" />
      <circle cx="92" cy="148" r="34" className="fill-primary" />
      <circle cx="92" cy="138" r="10" fill="#F5F0E8" />
      <path d="M74 166 a 18 14 0 0 1 36 0" fill="#F5F0E8" />
      {/* learner bubble */}
      <circle cx="268" cy="148" r="44" fill="#065F46" opacity="0.12" />
      <circle cx="268" cy="148" r="34" fill="#065F46" />
      <circle cx="268" cy="138" r="10" fill="#F5F0E8" />
      <path d="M250 166 a 18 14 0 0 1 36 0" fill="#F5F0E8" />
      {/* chat bubbles */}
      <rect x="52" y="62" width="96" height="30" rx="15" className="fill-card" stroke="#065F46" strokeOpacity="0.25" strokeWidth="2" />
      <circle cx="76" cy="77" r="4" fill="#065F46" opacity="0.5" />
      <circle cx="94" cy="77" r="4" fill="#065F46" opacity="0.35" />
      <circle cx="112" cy="77" r="4" fill="#065F46" opacity="0.2" />
      <rect x="216" y="52" width="104" height="30" rx="15" fill="#34D399" opacity="0.25" />
      <rect x="228" y="63" width="60" height="8" rx="4" fill="#065F46" opacity="0.45" />
      {/* sparkle above connection */}
      <path d="M180 84 L 183 96 L 195 99 L 183 102 L 180 114 L 177 102 L 165 99 L 177 96 Z" fill="#34D399" />
      {/* ground line */}
      <path d="M40 206 C 120 198, 240 198, 320 206" stroke="#065F46" strokeOpacity="0.2" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** A product being assembled in a browser: the capstone. */
export function CapstoneScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 250" className={className} fill="none" aria-hidden>
      {/* browser frame */}
      <rect x="30" y="26" width="300" height="198" rx="14" className="fill-background" stroke="#065F46" strokeOpacity="0.25" strokeWidth="2.5" />
      <line x1="30" y1="58" x2="330" y2="58" stroke="#065F46" strokeOpacity="0.2" strokeWidth="2" />
      <circle cx="52" cy="42" r="5" fill="#DC2626" opacity="0.6" />
      <circle cx="70" cy="42" r="5" fill="#D97706" opacity="0.6" />
      <circle cx="88" cy="42" r="5" fill="#059669" opacity="0.6" />
      {/* sidebar */}
      <rect x="46" y="74" width="70" height="132" rx="8" className="fill-primary" opacity="0.12" />
      <rect x="56" y="86" width="50" height="8" rx="4" className="fill-primary" opacity="0.5" />
      <rect x="56" y="102" width="40" height="8" rx="4" className="fill-primary" opacity="0.35" />
      <rect x="56" y="118" width="46" height="8" rx="4" className="fill-primary" opacity="0.25" />
      {/* hero block */}
      <rect x="130" y="74" width="184" height="56" rx="8" fill="#065F46" opacity="0.9" />
      <rect x="142" y="88" width="90" height="9" rx="4.5" fill="#F5F0E8" opacity="0.9" />
      <rect x="142" y="104" width="60" height="7" rx="3.5" fill="#34D399" />
      {/* cards */}
      <rect x="130" y="142" width="86" height="64" rx="8" className="fill-card" stroke="#065F46" strokeOpacity="0.2" strokeWidth="2" />
      <rect x="228" y="142" width="86" height="64" rx="8" className="fill-card" stroke="#065F46" strokeOpacity="0.2" strokeWidth="2" />
      <rect x="142" y="154" width="40" height="7" rx="3.5" fill="#065F46" opacity="0.4" />
      <rect x="240" y="154" width="40" height="7" rx="3.5" fill="#065F46" opacity="0.4" />
      <rect x="142" y="168" width="60" height="6" rx="3" fill="#065F46" opacity="0.2" />
      <rect x="240" y="168" width="60" height="6" rx="3" fill="#065F46" opacity="0.2" />
      {/* cursor */}
      <path d="M296 178 L 316 198 L 306 199 L 312 212 L 305 215 L 299 202 L 292 208 Z" fill="#065F46" stroke="#F5F0E8" strokeWidth="2" />
      {/* floating shipped chip */}
      <rect x="238" y="8" width="104" height="30" rx="15" fill="#34D399" />
      <path d="M254 23 l 5 5 l 9 -10" stroke="#065F46" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="274" y="19" width="52" height="8" rx="4" fill="#065F46" opacity="0.7" />
      {/* confetti */}
      <circle cx="20" cy="90" r="4" fill="#34D399" opacity="0.7" />
      <rect x="12" y="150" width="8" height="8" rx="2" className="fill-primary" opacity="0.5" transform="rotate(20 16 154)" />
      <circle cx="344" cy="120" r="4" fill="#065F46" opacity="0.4" />
      <rect x="336" y="200" width="8" height="8" rx="2" fill="#34D399" opacity="0.6" transform="rotate(-15 340 204)" />
    </svg>
  );
}

/** Abstract mentor portrait medallion. */
export function MentorMedallion({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 140" className={className} aria-hidden fill="none">
      <circle cx="70" cy="70" r="64" className="stroke-primary" strokeWidth="3" strokeDasharray="4 10" strokeLinecap="round" />
      <circle cx="70" cy="70" r="50" fill="#065F46" />
      <circle cx="70" cy="58" r="16" fill="#F5F0E8" />
      <path d="M42 98 a 28 22 0 0 1 56 0" fill="#F5F0E8" />
      <path d="M112 26 L 114.5 36 L 124 38.5 L 114.5 41 L 112 51 L 109.5 41 L 100 38.5 L 109.5 36 Z" fill="#34D399" />
    </svg>
  );
}
