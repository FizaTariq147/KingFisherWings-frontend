/**
 * Client JSON / official-sample PDF for catalogue Generate.
 *
 * Shared backend packs (one HAWB_FORM / HBL_FORM for many codes) make every
 * format look identical. Official Fresa sample PDFs are distinct per format —
 * prefer those whenever available.
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
 * - Official sample available → yes (even if pack is ready) so formats stay distinct
 * - Pack ready + no official sample → no (pack-only)
 * - Pack not ready + fallback enabled → yes
 */
export function allowClientLayoutGenerate(opts: {
  packReady: boolean;
  templateActive: boolean;
  entityBound?: boolean;
  /** Distinct Fresa sample PDF exists for this catalogue code */
  hasOfficialSample?: boolean;
}): boolean {
  if (!isClientLayoutFallbackEnabled()) return false;
  if (opts.hasOfficialSample) return true;
  if (opts.packReady) return false;
  void opts.templateActive;
  void opts.entityBound;
  return true;
}
