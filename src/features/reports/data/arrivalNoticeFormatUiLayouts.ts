import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';
import { ARRIVAL_NOTICE_FORMAT_UI_LAYOUTS } from './arrivalNoticeFormatUiLayouts.generated.ts';

/** Permanent JSON UI layouts for Arrival Notice formats. */
export const ARRIVAL_NOTICE_FORMAT_UI_LAYOUT_LIST: InvoiceFormatUiLayout[] =
  ARRIVAL_NOTICE_FORMAT_UI_LAYOUTS;

const byCode = new Map(
  ARRIVAL_NOTICE_FORMAT_UI_LAYOUT_LIST.map((row) => [row.code.toUpperCase(), row]),
);

export function getArrivalNoticeFormatUiLayout(code: string): InvoiceFormatUiLayout | undefined {
  const needle = code.trim().toUpperCase();
  if (!needle) return undefined;
  return byCode.get(needle);
}

export function hasArrivalNoticeFormatUiLayout(code: string): boolean {
  return Boolean(getArrivalNoticeFormatUiLayout(code));
}

export function listArrivalNoticeFormatUiLayouts(): InvoiceFormatUiLayout[] {
  return ARRIVAL_NOTICE_FORMAT_UI_LAYOUT_LIST;
}
