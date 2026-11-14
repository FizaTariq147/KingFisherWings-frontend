/**
 * Non-destructive official-format governance helpers.
 * Does not delete or rename report codes — used for audit + future catalogue filtering
 * after explicit approval.
 */

/** Official Fresa HAWB-specific catalogue entries (CDN has 5 distinct PDFs). */
export const OFFICIAL_HAWB_FORMAT_CODES = [
  'HAWB_DRAFT_REPORT_FORMAT',
  'HAWB_DRAFT_REPORT_FORMAT_1',
  'HAWB_DRAFT_REPORT_FORMAT_2',
  'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1',
  'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2',
] as const;

export type OfficialFormatStatus =
  | 'official_verified'
  | 'official_reference_unavailable'
  | 'ambiguous'
  | 'unverified'
  | 'duplicate'
  | 'unsupported';

export function isOfficialHawbFormatCode(code: string): boolean {
  const needle = code.trim().toUpperCase();
  return (OFFICIAL_HAWB_FORMAT_CODES as readonly string[]).includes(needle);
}

/**
 * Classify a HAWB code against the official Fresa HAWB set.
 * Extra Format-3…N codes remain in the registry but are `unverified` (shared sample fallback).
 */
export function classifyHawbFormatStatus(code: string): OfficialFormatStatus {
  if (isOfficialHawbFormatCode(code)) return 'official_verified';
  if (/^HAWB_/i.test(code)) return 'unverified';
  return 'unsupported';
}

/** User-facing catalogue / strip — only the five official Fresa HAWB entries. */
export function shouldExposeHawbInPrimaryCatalogue(code: string): boolean {
  return classifyHawbFormatStatus(code) === 'official_verified';
}
