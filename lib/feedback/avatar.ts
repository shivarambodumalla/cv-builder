/**
 * Fallback avatar for a review author without a profile photo: initials on
 * colours derived from the name, so the same person always gets the same
 * colours and no colour has to be stored.
 */

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => Array.from(part)[0] ?? "")
    .join("")
    .toUpperCase();
}

/** djb2 string hash → hue 0-359. */
function hueFor(name: string): number {
  let h = 5381;
  for (const ch of name.trim().toLowerCase()) h = ((h << 5) + h + ch.codePointAt(0)!) | 0;
  return Math.abs(h) % 360;
}

export interface AvatarColors {
  /** Ring behind the circle: a two-stop gradient starting at the name's hue. */
  ring: string;
  /** Circle fill behind the initials. */
  fill: string;
  /** Initials colour, dark enough for contrast on the fill. */
  text: string;
}

export function avatarColors(name: string): AvatarColors {
  const h = hueFor(name);
  const h2 = (h + 45) % 360;
  return {
    ring: `linear-gradient(135deg, hsl(${h} 70% 55%), hsl(${h2} 75% 60%))`,
    fill: `hsl(${h} 70% 93%)`,
    text: `hsl(${h} 50% 25%)`,
  };
}
