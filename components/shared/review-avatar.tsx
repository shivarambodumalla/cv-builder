"use client";

import { useState } from "react";
import { avatarColors, initials } from "@/lib/feedback/avatar";
import { cn } from "@/lib/utils";

/**
 * A review author's avatar: their profile photo when there is one and it
 * loads, otherwise initials on colours derived from the name. Plain <img> on
 * purpose: Google/LinkedIn photos would each cost a Vercel image
 * transformation through next/image.
 */
export function ReviewAvatar({
  name,
  avatarUrl,
  className = "h-10 w-10 text-xs",
}: {
  name: string;
  avatarUrl: string | null;
  /** Size and initials font size. */
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const colors = avatarColors(name);
  const showPhoto = !!avatarUrl && !broken;

  return (
    <span className={cn("flex shrink-0 rounded-full p-[2px]", className)} style={{ backgroundImage: colors.ring }} aria-hidden="true">
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
          className="h-full w-full rounded-full bg-background object-cover"
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center rounded-full font-bold"
          style={{ backgroundColor: colors.fill, color: colors.text }}
        >
          {initials(name)}
        </span>
      )}
    </span>
  );
}
