import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';
import { INVOICE_FORMAT_UI_LAYOUTS } from './invoiceFormatUiLayouts.generated.ts';

/** Permanent JSON UI layouts for invoice formats. */
export const INVOICE_FORMAT_UI_LAYOUT_LIST: InvoiceFormatUiLayout[] = INVOICE_FORMAT_UI_LAYOUTS;

const byCode = new Map(
  INVOICE_FORMAT_UI_LAYOUT_LIST.map((row) => [row.code.toUpperCase(), row]),
);

const byNumber = new Map<number, InvoiceFormatUiLayout>();
for (const row of INVOICE_FORMAT_UI_LAYOUT_LIST) {
  if (!/^INVOICE_REPORT_FORMAT_/i.test(row.code)) continue;
  const existing = byNumber.get(row.formatNumber);
  const isPrimary = /^INVOICE_REPORT_FORMAT_\d+/i.test(row.code);
  if (!existing || isPrimary) byNumber.set(row.formatNumber, row);
}

export function getInvoiceFormatUiLayout(code: string): InvoiceFormatUiLayout | undefined {
  const needle = code.trim().toUpperCase();
  if (!needle) return undefined;
  return byCode.get(needle);
}

export function hasInvoiceFormatUiLayout(code: string): boolean {
  return Boolean(getInvoiceFormatUiLayout(code));
}

export function getInvoiceFormatUiLayoutByNumber(
  formatNumber: number,
): InvoiceFormatUiLayout | undefined {
  return byNumber.get(formatNumber);
}

export function listInvoiceFormatUiLayouts(): InvoiceFormatUiLayout[] {
  return INVOICE_FORMAT_UI_LAYOUT_LIST;
}
