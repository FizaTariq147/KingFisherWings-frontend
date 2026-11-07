/**
 * Priority document formats for Fresa visual parity (Phase 2).
 * Surgical fixes only — do not mass-expand JSON layouts.
 * Samples: https://fresatechnologies.com/sample-report-formats/
 */

/** Invoice Report Format-1…21 (Accounts column on Fresa page). */
export const PRIORITY_INVOICE_FORMAT_NUMBERS = Array.from(
  { length: 21 },
  (_, i) => i + 1,
) as readonly number[];

export const PRIORITY_SEA_CODES = [
  'FG_HBL_HKG',
  'HBL_DRAFT_REPORT_FORMAT_1',
  'HBL_DRAFT_REPORT_FORMAT_2',
  'HBL_DRAFT_REPORT_FORMAT_4',
  'CARGO_ARRIVAL_NOTICE_REPORT_FORMAT_1',
  'ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER',
  'DELIVERY_ORDER_REPORT_FORMAT_1',
] as const;

export const PRIORITY_AIR_CODES = [
  'HAWB_DRAFT_REPORT_FORMAT',
  'HAWB_DRAFT_REPORT_FORMAT_1',
  'HAWB_DRAFT_REPORT_FORMAT_2',
  'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1',
  'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2',
  'MAWB_DRAFT_REPORT_FORMAT',
] as const;

export const PRIORITY_QUOTATION_CODES = [
  'AIR_QUOTATION_REPORT_FORMAT',
  'FCL_QUOTATION_REPORT_FORMAT',
] as const;

const PRIORITY_CODE_SET = new Set<string>([
  ...PRIORITY_SEA_CODES,
  ...PRIORITY_AIR_CODES,
  ...PRIORITY_QUOTATION_CODES,
]);

export function isPriorityFresaFormat(code: string, formatNumber?: number): boolean {
  const c = code.trim().toUpperCase();
  if (PRIORITY_CODE_SET.has(c)) return true;
  if (
    formatNumber != null &&
    formatNumber >= 1 &&
    formatNumber <= 21 &&
    /INVOICE_REPORT_FORMAT/i.test(c)
  ) {
    return true;
  }
  return PRIORITY_INVOICE_FORMAT_NUMBERS.some(
    (n) =>
      c === `INVOICE_REPORT_FORMAT_${n}` ||
      c.startsWith(`INVOICE_REPORT_FORMAT_${n}_`),
  );
}
