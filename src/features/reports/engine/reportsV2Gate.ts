/**
 * Minimal v2 catalogue helpers for integration.
 * Live v2 path today = codes listed in reports/invoice-v2-applicability.json.
 * No breadth soft-gate / 92-code list. Nothing here marks a code accepted.
 */
import applicability from '../../../../reports/invoice-v2-applicability.json';
import type { ReportConformanceStatus } from '../utils/reportConformanceStatus';

const LIVE_V2_CODES = new Set(Object.keys(applicability as Record<string, unknown>));

/** True when this code has a live invoice-v2 spec path (applicability table). */
export function isReportsV2Code(code: string): boolean {
  return LIVE_V2_CODES.has(String(code || '').trim());
}

/**
 * Catalogue badge wording. Accepted only when status.json / sign-off says so.
 * Everything else is approximate, not final.
 */
export function reportsV2BadgeText(status: ReportConformanceStatus): string {
  return status === 'accepted' ? 'Accepted' : 'approximate, not final';
}

export const REPORTS_V2_FALLBACK_NOTICE =
  'Showing the classic document. The selected format could not be built.';
export const INVOICE_V2_FALLBACK_NOTICE =
  'Showing the classic invoice. The selected format could not be built.';
