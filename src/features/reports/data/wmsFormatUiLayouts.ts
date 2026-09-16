import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';
import { WMS_FORMAT_UI_LAYOUTS } from './wmsFormatUiLayouts.generated.ts';

/** Permanent JSON UI layouts for WMS Advance Shipping Note formats. */
export const WMS_FORMAT_UI_LAYOUT_LIST: InvoiceFormatUiLayout[] = WMS_FORMAT_UI_LAYOUTS;

const byCode = new Map(
  WMS_FORMAT_UI_LAYOUT_LIST.map((row) => [row.code.toUpperCase(), row]),
);

export function getWmsFormatUiLayout(code: string): InvoiceFormatUiLayout | undefined {
  const needle = code.trim().toUpperCase();
  if (!needle) return undefined;
  return byCode.get(needle);
}

export function hasWmsFormatUiLayout(code: string): boolean {
  return Boolean(getWmsFormatUiLayout(code));
}

export function listWmsFormatUiLayouts(): InvoiceFormatUiLayout[] {
  return WMS_FORMAT_UI_LAYOUT_LIST;
}
