import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';
import { HBL_FORMAT_UI_LAYOUTS } from './hblFormatUiLayouts.generated.ts';

export const HBL_FORMAT_UI_LAYOUT_LIST: InvoiceFormatUiLayout[] = HBL_FORMAT_UI_LAYOUTS;

const byCode = new Map(HBL_FORMAT_UI_LAYOUT_LIST.map((row) => [row.code.toUpperCase(), row]));

const FALLBACK = 'HBL_DRAFT_REPORT_FORMAT_20';

function resolveLayoutCode(code: string): string {
  const needle = code.trim().toUpperCase();
  if (byCode.has(needle)) return needle;
  if (/^HBL_DRAFT_REPORT_FORMAT(_\d+|_JASPER)?$/.test(needle)) return FALLBACK;
  if (needle.startsWith('FG_HBL_')) {
    if (needle.includes('HKG')) return 'FG_HBL_HKG';
    if (needle.includes('MAGIC')) return 'FG_HBL_MAGICLOGISYS';
    return 'FG_HBL_FORMAT_1';
  }
  return needle;
}

export function getHblFormatUiLayout(code: string): InvoiceFormatUiLayout | undefined {
  return byCode.get(resolveLayoutCode(code));
}

export function hasHblFormatUiLayout(code: string): boolean {
  return Boolean(getHblFormatUiLayout(code));
}

export function listHblFormatUiLayouts(): InvoiceFormatUiLayout[] {
  return HBL_FORMAT_UI_LAYOUT_LIST;
}
