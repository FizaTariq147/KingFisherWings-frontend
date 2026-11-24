import type { ReportFamily } from '../types/reportCatalog.types';

/** Sidebar groups for the Reporting Dashboard (UI only — maps onto existing families). */
export type DashboardCategoryId =
  | 'all'
  | 'sea'
  | 'air'
  | 'accounts'
  | 'operations'
  | 'wms'
  | 'customs'
  | 'my_reports';

export type DashboardCategoryDef = {
  id: DashboardCategoryId;
  label: string;
  /** OpenAPI families included in this group. Empty = all. */
  families: ReportFamily[] | 'all';
  /** External product link (not catalogue history). */
  externalHref?: string;
  externalLabel?: string;
};

export const DASHBOARD_CATEGORIES: readonly DashboardCategoryDef[] = [
  { id: 'all', label: 'All Reports', families: 'all' },
  { id: 'sea', label: 'Sea Freight', families: ['sea_docs'] },
  { id: 'air', label: 'Air Freight', families: ['air_docs'] },
  {
    id: 'accounts',
    label: 'Accounts & Finance',
    families: ['commercial', 'finance'],
  },
  { id: 'operations', label: 'Operations', families: ['ops_list'] },
  { id: 'wms', label: 'Warehouse Management (WMS)', families: ['wms'] },
  {
    id: 'customs',
    label: 'Customs & Documentation',
    // No customs API family — documentation module uses sea/air docs.
    families: ['sea_docs', 'air_docs'],
  },
  {
    id: 'my_reports',
    label: 'My Reports',
    families: ['ops_list', 'other'],
    externalHref: '/gl/saved-reports',
    externalLabel: 'Saved GL reports',
  },
] as const;

export function dashboardCategoryById(id: string): DashboardCategoryDef {
  const found = DASHBOARD_CATEGORIES.find((c) => c.id === id);
  return found ?? DASHBOARD_CATEGORIES[0];
}

export function familiesForDashboardCategory(id: DashboardCategoryId): ReportFamily[] | 'all' {
  return dashboardCategoryById(id).families;
}

/** Human module label for a catalogue family (Super Admin enabled_modules mapping). */
export function moduleLabelForFamily(family: ReportFamily): string {
  switch (family) {
    case 'sea_docs':
    case 'air_docs':
      return 'Documentation';
    case 'commercial':
    case 'finance':
      return 'Finance';
    case 'ops_list':
      return 'Operations';
    case 'wms':
      return 'WMS';
    case 'quotation':
      return 'Sales';
    case 'other':
    default:
      return 'General';
  }
}
