import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';
import { OPS_LIST_FORMAT_UI_LAYOUTS } from './opsListFormatUiLayouts.generated.ts';

export const OPS_LIST_FORMAT_UI_LAYOUT_LIST: InvoiceFormatUiLayout[] = OPS_LIST_FORMAT_UI_LAYOUTS;

const byCode = new Map(
  OPS_LIST_FORMAT_UI_LAYOUT_LIST.map((row) => [row.code.toUpperCase(), row]),
);

export function getOpsListFormatUiLayout(code: string): InvoiceFormatUiLayout | undefined {
  return byCode.get(code.trim().toUpperCase());
}

export function hasOpsListFormatUiLayout(code: string): boolean {
  return Boolean(getOpsListFormatUiLayout(code));
}

export function listOpsListFormatUiLayouts(): InvoiceFormatUiLayout[] {
  return OPS_LIST_FORMAT_UI_LAYOUT_LIST;
}
