/**
 * Client JSON layouts render Fresa-sample look (colors / header / footer) with
 * registered organization name + logo (fallback KF asset) and embedded dummy
 * data — matching https://fresatechnologies.com/sample-report-formats/
 *
 * Disable only when explicitly set:
 *   VITE_REPORTS_CLIENT_LAYOUT_FALLBACK=false
 *
 * Entity-bound Generate still prefers a live backend pack when bound+active.
 */
export function isClientLayoutFallbackEnabled(): boolean {
  const raw = String(import.meta.env.VITE_REPORTS_CLIENT_LAYOUT_FALLBACK ?? '')
    .trim()
    .toLowerCase();
  if (raw === '0' || raw === 'false' || raw === 'no') return false;
  // Default ON — catalogue samples show Fresa dummy data + KF logo.
  return true;
}

/**
 * When to use client layout PDF:
 * - Sample/browse (no entity) → always if enabled (dummy data).
 * - Entity-bound with ready pack → never (use Fresa pack bytes).
 * - Entity-bound without pack → yes if enabled (live overlay on sample chrome).
 */
export function allowClientLayoutGenerate(opts: {
  packReady: boolean;
  templateActive: boolean;
  entityBound?: boolean;
}): boolean {
  if (!isClientLayoutFallbackEnabled()) return false;
  if (opts.entityBound && opts.packReady && opts.templateActive) return false;
  return true;
}
