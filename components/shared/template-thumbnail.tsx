import Image from "next/image";
import { templateThumbnail } from "@/lib/resume/template-thumbnails";
import type { TemplateName } from "@/lib/resume/types";

/** Frame for a thumbnail card. Lives here (not lib/) so Tailwind's scanner sees it. */
export const THUMBNAIL_ASPECT = "aspect-[1275/1650]";

/**
 * Default `sizes`: the three-across grid inside a max-w-5xl (1024px) container,
 * two across from 640px, one below. A px cap keeps wide screens from asking the
 * optimizer for a width the card never reaches.
 */
const GRID_SIZES = "(min-width: 1024px) 330px, (min-width: 640px) 50vw, 100vw";

interface Props {
  template: TemplateName;
  className?: string;
  /** Rendered width hint for next/image; ignored when `canonical`. */
  sizes?: string;
  priority?: boolean;
  /**
   * Serve the original /img/templates URL instead of an optimised variant.
   * Used for a template page's main preview so the image Google indexes is the
   * same URL the page lists in og:image, JSON-LD and the image sitemap.
   */
  canonical?: boolean;
}

/** A template preview image with its path, alt text and dimensions from one registry. */
export function TemplateThumbnailImage({ template, className, sizes, priority, canonical }: Props) {
  const thumb = templateThumbnail(template);
  if (canonical) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={thumb.src}
        alt={thumb.alt}
        title={thumb.title}
        width={thumb.width}
        height={thumb.height}
        className={className}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }
  return (
    <Image
      src={thumb.src}
      alt={thumb.alt}
      title={thumb.title}
      width={thumb.width}
      height={thumb.height}
      sizes={sizes ?? GRID_SIZES}
      className={className}
      priority={priority}
    />
  );
}
