import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';
import { COMMERCIAL_EXTRA_FORMAT_UI_LAYOUTS } from './commercialExtraFormatUiLayouts.generated.ts';

export const COMMERCIAL_EXTRA_FORMAT_UI_LAYOUT_LIST: InvoiceFormatUiLayout[] =
  COMMERCIAL_EXTRA_FORMAT_UI_LAYOUTS;

const byCode = new Map(
  COMMERCIAL_EXTRA_FORMAT_UI_LAYOUT_LIST.map((row) => [row.code.toUpperCase(), row]),
);

export function getCommercialExtraFormatUiLayout(
  code: string,
): InvoiceFormatUiLayout | undefined {
  return byCode.get(code.trim().toUpperCase());
}

export function hasCommercialExtraFormatUiLayout(code: string): boolean {
  return Boolean(getCommercialExtraFormatUiLayout(code));
}

export function listCommercialExtraFormatUiLayouts(): InvoiceFormatUiLayout[] {
  return COMMERCIAL_EXTRA_FORMAT_UI_LAYOUT_LIST;
}
