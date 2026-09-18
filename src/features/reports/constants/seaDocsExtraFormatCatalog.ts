/**
 * Remaining sea/air docs — layouts in seaDocsExtraFormatUiLayouts.json.
 */
import { catalogRowsMatchSearch } from '../utils/reportCatalogSearch';
import { listSeaDocsExtraFormatUiLayouts } from '../data/seaDocsExtraFormatUiLayouts';

export type SeaDocsExtraFormatSpec = {
  code: string;
  name: string;
  kind: string;
  sortOrder: number;
  family: 'sea_docs' | 'air_docs';
  contexts: Array<'job'>;
};

export const SEA_DOCS_EXTRA_FORMAT_CATALOG: SeaDocsExtraFormatSpec[] =
  listSeaDocsExtraFormatUiLayouts()
    .map((r, i) => ({
      code: r.code,
      name: r.name,
      kind: `sea_air_${r.formatNumber || i + 1}`,
      sortOrder: r.formatNumber || i + 1,
      family: (/HAWB|MAWB|AIR/i.test(r.code) || /AIR/i.test(r.name)
        ? 'air_docs'
        : 'sea_docs') as 'sea_docs' | 'air_docs',
      contexts: ['job'] as Array<'job'>,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

const byCode = new Map(SEA_DOCS_EXTRA_FORMAT_CATALOG.map((row) => [row.code.toUpperCase(), row]));

export function isSeaDocsExtraFormatCode(code: string): boolean {
  return byCode.has(code.trim().toUpperCase());
}

export function getSeaDocsExtraFormatSpec(code: string): SeaDocsExtraFormatSpec | undefined {
  return byCode.get(code.trim().toUpperCase());
}

export function listSeaDocsExtraFormats(): SeaDocsExtraFormatSpec[] {
  return SEA_DOCS_EXTRA_FORMAT_CATALOG.slice();
}

export function resolveSeaDocsExtraFormatDisplayName(
  code: string,
  fallbackName: string,
): string {
  return getSeaDocsExtraFormatSpec(code)?.name || fallbackName;
}

export function seaDocsExtraFormatsMatchSearch(searchQuery: string): boolean {
  return catalogRowsMatchSearch(listSeaDocsExtraFormats(), searchQuery);
}
