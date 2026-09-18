/**
 * Leftover Fresa sample-page formats — layouts in leftoverFormatUiLayouts.json.
 */
import { catalogRowsMatchSearch } from '../utils/reportCatalogSearch';
import { listLeftoverFormatUiLayouts } from '../data/leftoverFormatUiLayouts';

export type LeftoverFormatSpec = {
  code: string;
  name: string;
  kind: string;
  sortOrder: number;
  family: 'commercial' | 'sea_docs' | 'other';
  contexts: Array<'invoice' | 'job'>;
};

export const LEFTOVER_FORMAT_SPECS: LeftoverFormatSpec[] = listLeftoverFormatUiLayouts()
  .map((r, i) => {
    const family = (/^HBL/i.test(r.name) || /HBL/i.test(r.code)
      ? 'sea_docs'
      : 'commercial') as 'commercial' | 'sea_docs' | 'other';
    return {
      code: r.code,
      name: r.name,
      kind: `leftover_${r.formatNumber || i + 1}`,
      sortOrder: r.formatNumber || i + 1,
      family,
      contexts: (family === 'sea_docs' ? ['job'] : ['invoice']) as Array<'invoice' | 'job'>,
    };
  })
  .sort((a, b) => a.sortOrder - b.sortOrder);

const byCode = new Map(LEFTOVER_FORMAT_SPECS.map((row) => [row.code.toUpperCase(), row]));

export function isLeftoverFormatCode(code: string): boolean {
  return byCode.has(code.trim().toUpperCase());
}

export function getLeftoverFormatSpec(code: string): LeftoverFormatSpec | undefined {
  return byCode.get(code.trim().toUpperCase());
}

export function listLeftoverFormats(): LeftoverFormatSpec[] {
  return LEFTOVER_FORMAT_SPECS.slice();
}

export function leftoverFormatsMatchSearch(searchQuery: string): boolean {
  return catalogRowsMatchSearch(listLeftoverFormats(), searchQuery);
}
