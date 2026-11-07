import type { ReportFamily } from '../types/reportCatalog.types';

/**
 * Fresa sample-report-formats page columns:
 * https://fresatechnologies.com/sample-report-formats/
 */
export type FresaPageColumnId = 'sea' | 'air' | 'accounts' | 'my_reports';

export const FRESA_PAGE_COLUMNS: Array<{
  id: FresaPageColumnId;
  title: string;
  families: ReportFamily[];
}> = [
  {
    id: 'sea',
    title: 'SEA FREIGHT',
    families: ['sea_docs'],
  },
  {
    id: 'air',
    title: 'AIR FREIGHT',
    families: ['air_docs', 'quotation', 'wms'],
  },
  {
    id: 'accounts',
    title: 'ACCOUNTS',
    families: ['commercial', 'finance'],
  },
  {
    id: 'my_reports',
    title: 'MY REPORTS',
    families: ['ops_list', 'other'],
  },
];

export function fresaColumnForFamily(family: string | undefined | null): FresaPageColumnId {
  const f = (family || 'other') as ReportFamily;
  for (const col of FRESA_PAGE_COLUMNS) {
    if (col.families.includes(f)) return col.id;
  }
  return 'my_reports';
}

export function familiesForFresaColumn(columnId: FresaPageColumnId): ReportFamily[] {
  return FRESA_PAGE_COLUMNS.find((c) => c.id === columnId)?.families ?? ['other'];
}
