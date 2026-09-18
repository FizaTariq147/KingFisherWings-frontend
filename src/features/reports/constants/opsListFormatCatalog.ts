/**
 * Ops List report formats — layouts in opsListFormatUiLayouts.json.
 */
import { catalogRowsMatchSearch } from '../utils/reportCatalogSearch';
import { listOpsListFormatUiLayouts } from '../data/opsListFormatUiLayouts';

export type OpsListFormatSpec = {
  code: string;
  name: string;
  kind: string;
  sortOrder: number;
  family: 'ops_list';
  contexts: Array<'list' | 'job'>;
};

export const OPS_LIST_FORMAT_CATALOG: OpsListFormatSpec[] = listOpsListFormatUiLayouts()
  .map((r, i) => ({
    code: r.code,
    name: r.name,
    kind: `ops_list_${r.formatNumber || i + 1}`,
    sortOrder: r.formatNumber || i + 1,
    family: 'ops_list' as const,
    contexts: ['list', 'job'] as Array<'list' | 'job'>,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const byCode = new Map(OPS_LIST_FORMAT_CATALOG.map((row) => [row.code.toUpperCase(), row]));

export function isOpsListFormatCode(code: string): boolean {
  return byCode.has(code.trim().toUpperCase());
}

export function getOpsListFormatSpec(code: string): OpsListFormatSpec | undefined {
  return byCode.get(code.trim().toUpperCase());
}

export function listOpsListFormats(): OpsListFormatSpec[] {
  return OPS_LIST_FORMAT_CATALOG.slice();
}

export function resolveOpsListFormatDisplayName(code: string, fallbackName: string): string {
  return getOpsListFormatSpec(code)?.name || fallbackName;
}

export function opsListFormatsMatchSearch(searchQuery: string): boolean {
  return catalogRowsMatchSearch(listOpsListFormats(), searchQuery);
}
