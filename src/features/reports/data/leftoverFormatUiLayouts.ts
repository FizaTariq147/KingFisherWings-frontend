import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';
import { LEFTOVER_FORMAT_UI_LAYOUTS } from './leftoverFormatUiLayouts.generated.ts';

/** Permanent JSON UI layouts for leftover Fresa sample-page formats. */
export const LEFTOVER_FORMAT_UI_LAYOUT_LIST: InvoiceFormatUiLayout[] = LEFTOVER_FORMAT_UI_LAYOUTS;

const byCode = new Map(
  LEFTOVER_FORMAT_UI_LAYOUT_LIST.map((row) => [row.code.toUpperCase(), row]),
);

export function getLeftoverFormatUiLayout(code: string): InvoiceFormatUiLayout | undefined {
  return byCode.get(code.trim().toUpperCase());
}

export function hasLeftoverFormatUiLayout(code: string): boolean {
  return Boolean(getLeftoverFormatUiLayout(code));
}

export function listLeftoverFormatUiLayouts(): InvoiceFormatUiLayout[] {
  return LEFTOVER_FORMAT_UI_LAYOUT_LIST;
}
