/**
 * Client JSON / sample PDF fallback for catalogue Generate.
 *
 * Product print = backend Puppeteer packs. When a pack is ready, FE must not
 * use html2canvas shells (rough / identical layouts).
 *
 * Disable all client fallback:
 *   VITE_REPORTS_CLIENT_LAYOUT_FALLBACK=false
 */
export function isClientLayoutFallbackEnabled(): boolean {
  const raw = String(import.meta.env.VITE_REPORTS_CLIENT_LAYOUT_FALLBACK ?? '')
    .trim()
    .toLowerCase();
  if (raw === '0' || raw === 'false' || raw === 'no') return false;
  return true;
}

/**
 * When to use client layout / official-sample PDF:
 * - Pack ready (bound + active) → never (Fresa-parity pack bytes only).
 * - Pack not ready + fallback enabled → yes (browse sample or classic fallback).
 */
export function allowClientLayoutGenerate(opts: {
  packReady: boolean;
  templateActive: boolean;
  entityBound?: boolean;
}): boolean {
  if (!isClientLayoutFallbackEnabled()) return false;
  // Pack ready ⇒ pack-only. Do not fall back to shells even for sample browse.
  if (opts.packReady) return false;
  void opts.templateActive;
  void opts.entityBound;
  return true;
}
