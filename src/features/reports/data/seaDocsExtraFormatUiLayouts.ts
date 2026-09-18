import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';
import { SEA_DOCS_EXTRA_FORMAT_UI_LAYOUTS } from './seaDocsExtraFormatUiLayouts.generated.ts';

export const SEA_DOCS_EXTRA_FORMAT_UI_LAYOUT_LIST: InvoiceFormatUiLayout[] =
  SEA_DOCS_EXTRA_FORMAT_UI_LAYOUTS;

const byCode = new Map(
  SEA_DOCS_EXTRA_FORMAT_UI_LAYOUT_LIST.map((row) => [row.code.toUpperCase(), row]),
);

export function getSeaDocsExtraFormatUiLayout(code: string): InvoiceFormatUiLayout | undefined {
  return byCode.get(code.trim().toUpperCase());
}

export function hasSeaDocsExtraFormatUiLayout(code: string): boolean {
  return Boolean(getSeaDocsExtraFormatUiLayout(code));
}

export function listSeaDocsExtraFormatUiLayouts(): InvoiceFormatUiLayout[] {
  return SEA_DOCS_EXTRA_FORMAT_UI_LAYOUT_LIST;
}
