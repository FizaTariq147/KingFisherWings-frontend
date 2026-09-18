import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';
import { QUOTATION_FORMAT_UI_LAYOUTS } from './quotationFormatUiLayouts.generated.ts';

export const QUOTATION_FORMAT_UI_LAYOUT_LIST: InvoiceFormatUiLayout[] = QUOTATION_FORMAT_UI_LAYOUTS;

const byCode = new Map(
  QUOTATION_FORMAT_UI_LAYOUT_LIST.map((row) => [row.code.toUpperCase(), row]),
);

export function getQuotationFormatUiLayout(code: string): InvoiceFormatUiLayout | undefined {
  return byCode.get(code.trim().toUpperCase());
}

export function hasQuotationFormatUiLayout(code: string): boolean {
  return Boolean(getQuotationFormatUiLayout(code));
}

export function listQuotationFormatUiLayouts(): InvoiceFormatUiLayout[] {
  return QUOTATION_FORMAT_UI_LAYOUT_LIST;
}
