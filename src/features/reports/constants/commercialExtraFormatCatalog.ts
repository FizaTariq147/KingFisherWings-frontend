/**
 * Commercial extras (Proforma / Debit Note) — layouts in commercialExtraFormatUiLayouts.json.
 */
import { catalogRowsMatchSearch } from '../utils/reportCatalogSearch';
import { listCommercialExtraFormatUiLayouts } from '../data/commercialExtraFormatUiLayouts';

export type CommercialExtraFormatSpec = {
  code: string;
  name: string;
  kind: string;
  sortOrder: number;
  family: 'commercial';
  contexts: Array<'invoice'>;
};

export const COMMERCIAL_EXTRA_FORMAT_CATALOG: CommercialExtraFormatSpec[] =
  listCommercialExtraFormatUiLayouts()
    .map((r, i) => ({
      code: r.code,
      name: r.name,
      kind: /PROFORMA/i.test(r.code)
        ? `proforma_${r.formatNumber || i + 1}`
        : /DEBIT/i.test(r.code)
          ? `debit_${r.formatNumber || i + 1}`
          : `commercial_${r.formatNumber || i + 1}`,
      sortOrder: r.formatNumber || i + 1,
      family: 'commercial' as const,
      contexts: ['invoice'] as Array<'invoice'>,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

const byCode = new Map(
  COMMERCIAL_EXTRA_FORMAT_CATALOG.map((row) => [row.code.toUpperCase(), row]),
);

export function isCommercialExtraFormatCode(code: string): boolean {
  return byCode.has(code.trim().toUpperCase());
}

export function getCommercialExtraFormatSpec(
  code: string,
): CommercialExtraFormatSpec | undefined {
  return byCode.get(code.trim().toUpperCase());
}

export function listCommercialExtraFormats(): CommercialExtraFormatSpec[] {
  return COMMERCIAL_EXTRA_FORMAT_CATALOG.slice();
}

export function resolveCommercialExtraFormatDisplayName(
  code: string,
  fallbackName: string,
): string {
  return getCommercialExtraFormatSpec(code)?.name || fallbackName;
}

export function commercialExtraFormatsMatchSearch(searchQuery: string): boolean {
  return catalogRowsMatchSearch(listCommercialExtraFormats(), searchQuery);
}
