export interface NavLink {
  href: string;
  label: string;
}

export interface NavGroup {
  title: string;
  links: NavLink[];
  /** Rendered small and muted: pages kept reachable while their feature is hidden. */
  muted?: boolean;
}

// Four groups, ordered by how often each is used. Related pages live as tabs
// inside one entry (see each section's layout.tsx), so this stays short.
export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Run",
    links: [
      { href: "/admin", label: "Home" },
      { href: "/admin/users", label: "Users" },
      { href: "/admin/reviews", label: "Expert Reviews" },
      { href: "/admin/course", label: "Course" },
    ],
  },
  {
    title: "Grow",
    links: [
      { href: "/admin/growth", label: "Growth" },
      { href: "/admin/feedback", label: "Feedback" },
    ],
  },
  {
    title: "Content",
    links: [
      { href: "/admin/blog", label: "Blog" },
      { href: "/admin/ai", label: "AI" },
    ],
  },
  {
    title: "Configure",
    links: [
      { href: "/admin/plans", label: "Plans & Pricing" },
      { href: "/admin/email", label: "Email" },
      { href: "/admin/tests", label: "Tests" },
    ],
  },
  {
    // Jobs is hidden from users (see CLAUDE.md "Jobs"); its admin pages stay.
    title: "Hidden features",
    muted: true,
    links: [
      { href: "/admin/jobs-analytics", label: "Jobs analytics" },
      { href: "/admin/job-providers", label: "Job providers" },
    ],
  },
];

/** The nav entry a path belongs to: the longest href that prefixes it. */
export function activeNavHref(pathname: string | null, groups: NavGroup[] = NAV_GROUPS): string | undefined {
  if (!pathname) return undefined;
  return groups
    .flatMap((g) => g.links)
    .filter((l) => pathname === l.href || (l.href !== "/admin" && pathname.startsWith(`${l.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}
