/**
 * Converts any Google Maps URL to one that can be embedded in an iframe.
 *
 * Handles:
 *  - Already-embedded URLs  (contains /maps/embed)
 *  - Full iframe HTML        (extracts src)
 *  - Coordinate-based URLs  (extracts @lat,lng and builds embed)
 *  - maps.google.com/maps?q= style URLs (appends &output=embed)
 *  - google.com/maps with query params
 *
 * Returns null when the URL is a short link (maps.app.goo.gl) or
 * cannot be reliably converted — caller should show guidance.
 */
export function convertToEmbedUrl(raw: string): string | null {
  if (!raw.trim()) return null;
  const trimmed = raw.trim();

  // 1. Extract src from full iframe HTML
  const srcMatch = trimmed.match(/src=["']([^"']+)["']/);
  const url = srcMatch ? srcMatch[1] : trimmed;

  // 2. Already an embed URL
  if (url.includes('/maps/embed')) return url;

  // 3. Has coordinate pair @lat,lng — works for any google.com/maps URL
  const coordMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (coordMatch) {
    const [, lat, lng] = coordMatch;
    return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  }

  // 4. google.com/maps or maps.google.com with a ?q= or other parseable query
  if (url.includes('google.com/maps') || url.includes('maps.google.com')) {
    try {
      const u = new URL(url);
      u.searchParams.set('output', 'embed');
      // Strip tracking params that can interfere
      ['uact', 'ved', 'sa', 'ei'].forEach((p) => u.searchParams.delete(p));
      return u.toString();
    } catch {
      // URL constructor failed — fall through
    }
  }

  // 5. Short link or unrecognised — cannot convert
  return null;
}

/** Returns true when the raw string looks like an unresolvable short link */
export function isShortLink(raw: string): boolean {
  return raw.includes('maps.app.goo.gl') || raw.includes('goo.gl/maps');
}
