import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';
import { OTHER_REPORTS_FORMAT_UI_LAYOUTS } from './otherReportsFormatUiLayouts.generated.ts';

export const OTHER_REPORTS_FORMAT_UI_LAYOUT_LIST: InvoiceFormatUiLayout[] =
  OTHER_REPORTS_FORMAT_UI_LAYOUTS;

const byCode = new Map(
  OTHER_REPORTS_FORMAT_UI_LAYOUT_LIST.map((row) => [row.code.toUpperCase(), row]),
);

const FALLBACK_BOOKING = 'BOOKING_CONFIRMATION_REPORT_FORMAT_1';
const FALLBACK_DAILY = 'DAILY_STATUS_REPORT_FORMAT_1';
const FALLBACK_MAWB = 'MAWB_DRAFT_REPORT_FORMAT';

function resolveLayoutCode(code: string): string {
  const needle = code.trim().toUpperCase();
  if (byCode.has(needle)) return needle;
  if (/^BOOKING_CONFIRMATION_REPORT_FORMAT_\d+$/.test(needle)) return FALLBACK_BOOKING;
  if (/^DAILY_STATUS_REPORT_FORMAT_\d+$/.test(needle)) return FALLBACK_DAILY;
  if (/^MAWB_DRAFT_REPORT_FORMAT_\d+$/.test(needle)) return FALLBACK_MAWB;
  return needle;
}

export function getOtherReportsFormatUiLayout(code: string): InvoiceFormatUiLayout | undefined {
  const resolved = resolveLayoutCode(code);
  return byCode.get(resolved);
}

export function hasOtherReportsFormatUiLayout(code: string): boolean {
  return Boolean(getOtherReportsFormatUiLayout(code));
}

export function listOtherReportsFormatUiLayouts(): InvoiceFormatUiLayout[] {
  return OTHER_REPORTS_FORMAT_UI_LAYOUT_LIST;
}
