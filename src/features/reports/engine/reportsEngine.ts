/**
 * The spec renderer runs only when this is `v2`.
 * There is no stored reports.engine field. The env value defaults to legacy,
 * which leaves Generate PDF on the classic generator.
 */
export type ReportsEngine = 'legacy' | 'v2';

export function reportsEngine(): ReportsEngine {
  const raw = String(import.meta.env?.VITE_REPORTS_ENGINE ?? '').trim().toLowerCase();
  return raw === 'v2' ? 'v2' : 'legacy';
}

/**
 * Organization and company records in this frontend have no defaultPdfStyle.
 * A missing value is classic. This reads the property only when a payload
 * already carries it. It does not create a stored field.
 */
export function readDefaultPdfStyle(source: unknown): string {
  if (!source || typeof source !== 'object') return 'classic';
  const value = (source as { defaultPdfStyle?: unknown }).defaultPdfStyle;
  if (typeof value !== 'string') return 'classic';
  const text = value.trim();
  return text || 'classic';
}
