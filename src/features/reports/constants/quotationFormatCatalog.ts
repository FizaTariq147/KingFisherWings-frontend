/**
 * Quotation report formats — layouts in quotationFormatUiLayouts (JSON).
 */
import { catalogRowsMatchSearch } from '../utils/reportCatalogSearch';
import { listQuotationFormatUiLayouts } from '../data/quotationFormatUiLayouts';

export type QuotationFormatSpec = {
  code: string;
  name: string;
  kind: string;
  sortOrder: number;
  family: 'quotation';
  contexts: Array<'quotation'>;
};

export const QUOTATION_FORMAT_CATALOG: QuotationFormatSpec[] = listQuotationFormatUiLayouts()
  .map((r, i) => ({
    code: r.code,
    name: r.name,
    kind: `quotation_${r.formatNumber || i + 1}`,
    sortOrder: r.formatNumber || i + 1,
    family: 'quotation' as const,
    contexts: ['quotation'] as Array<'quotation'>,
  }))
  .sort((a, b) => a.sortOrder - b.sortOrder);

const byCode = new Map(QUOTATION_FORMAT_CATALOG.map((row) => [row.code.toUpperCase(), row]));

export function isQuotationFormatCode(code: string): boolean {
  return byCode.has(code.trim().toUpperCase());
}

export function getQuotationFormatSpec(code: string): QuotationFormatSpec | undefined {
  return byCode.get(code.trim().toUpperCase());
}

export function listQuotationFormats(): QuotationFormatSpec[] {
  return QUOTATION_FORMAT_CATALOG.slice();
}

export function resolveQuotationFormatDisplayName(code: string, fallbackName: string): string {
  return getQuotationFormatSpec(code)?.name || fallbackName;
}

export function quotationFormatsMatchSearch(searchQuery: string): boolean {
  return catalogRowsMatchSearch(listQuotationFormats(), searchQuery);
}
