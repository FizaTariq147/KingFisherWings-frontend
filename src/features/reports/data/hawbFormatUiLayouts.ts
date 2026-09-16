import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';
import { HAWB_FORMAT_UI_LAYOUTS } from './hawbFormatUiLayouts.generated.ts';

export const HAWB_FORMAT_UI_LAYOUT_LIST: InvoiceFormatUiLayout[] = HAWB_FORMAT_UI_LAYOUTS;

const byCode = new Map(HAWB_FORMAT_UI_LAYOUT_LIST.map((row) => [row.code.toUpperCase(), row]));

const FALLBACK_DRAFT = 'HAWB_DRAFT_REPORT_FORMAT';
const FALLBACK_ORIGINAL = 'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1';

function resolveLayoutCode(code: string): string {
  const needle = code.trim().toUpperCase();
  if (byCode.has(needle)) return needle;
  if (/^HAWB_DRAFT_REPORT_FORMAT_\d+$/.test(needle)) return FALLBACK_DRAFT;
  if (/^HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_\d+$/.test(needle)) return FALLBACK_ORIGINAL;
  return needle;
}

export function getHawbFormatUiLayout(code: string): InvoiceFormatUiLayout | undefined {
  const resolved = resolveLayoutCode(code);
  return byCode.get(resolved);
}

export function hasHawbFormatUiLayout(code: string): boolean {
  return Boolean(getHawbFormatUiLayout(code));
}

export function listHawbFormatUiLayouts(): InvoiceFormatUiLayout[] {
  return HAWB_FORMAT_UI_LAYOUT_LIST;
}
