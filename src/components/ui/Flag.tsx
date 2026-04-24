'use client';

import { cn } from '@/lib/utils/cn';

/**
 * Country flag component.
 *
 * Uses SVG images from flagcdn.com (free, no API key) instead of emoji flags,
 * because emoji flag glyphs are not universally supported — Windows, Linux,
 * and headless Chromium environments render them as text fallbacks ("MX", "KR").
 *
 * The `flagCode` is the ISO 3166-1 alpha-2 country code (e.g. "mx", "kr"),
 * with special handling for:
 *   - Scotland → "gb-sct"
 *   - England  → "gb-eng"
 *   - Wales    → "gb-wls"
 *   - Unknown  → renders a neutral placeholder
 */

interface FlagProps {
  flagCode: string;
  /** Alt text — typically the country name */
  alt?: string;
  /** Tailwind classes for sizing and layout */
  className?: string;
  /** Display size in pixels (used for srcset — keep consistent with final rendered size) */
  size?: 16 | 20 | 24 | 32 | 40 | 48 | 64 | 80;
}

export function Flag({ flagCode, alt = '', className, size = 20 }: FlagProps) {
  // Placeholder for unknown / union flags (not real ISO codes)
  if (!flagCode || flagCode === 'eu' || flagCode === 'un') {
    return (
      <span
        className={cn(
          'inline-block rounded-sm bg-white/10 border border-white/20 shrink-0',
          className,
        )}
        style={{ width: size, height: Math.round(size * 0.75) }}
        aria-label={alt}
      />
    );
  }

  const src = `https://flagcdn.com/${flagCode}.svg`;

  return (
    // Plain <img> here is intentional — these are tiny SVGs served by
    // flagcdn.com with aggressive CDN caching, and Next's <Image>
    // optimizer would add a runtime hop + require a `remotePatterns`
    // entry in next.config.ts for essentially zero benefit at this size.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={Math.round(size * 0.75)}
      loading="lazy"
      decoding="async"
      className={cn(
        'inline-block rounded-sm object-cover shrink-0',
        className,
      )}
      style={{ width: size, height: Math.round(size * 0.75) }}
    />
  );
}
