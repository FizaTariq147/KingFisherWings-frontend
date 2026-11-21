/**
 * Admin-only flag for "Browse reference" (official third-party sample PDFs).
 * Normal users never see Fresa reference images or Fresa names in the strips catalogue.
 *
 * Enable with VITE_REPORTS_BROWSE_REFERENCE=true (or 1 / yes / on).
 */
export function isCatalogBrowseReferenceEnabled(): boolean {
  const raw = String(import.meta.env?.VITE_REPORTS_BROWSE_REFERENCE ?? '')
    .trim()
    .toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on';
}
