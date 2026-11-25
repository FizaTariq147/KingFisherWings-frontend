import type { ReportDocumentType } from '../registry/reportRegistry.schema';
import type { ReportExportFormat, ReportFamily } from '../types/reportCatalog.types';
import { reportCatalogRowMatchesSearch } from './reportCatalogSearch';
import {
  type DashboardCategoryId,
  familiesForDashboardCategory,
  moduleLabelForFamily,
} from './dashboardCategories';

/** Dashboard-facing report type (subset of enrichment documentType). */
export type DashboardReportType = 'transaction' | 'list' | 'financial';

export type DashboardReportCardModel = {
  code: string;
  name: string;
  description: string;
  family: ReportFamily;
  categoryLabel: string;
  moduleLabel: string;
  reportType: DashboardReportType;
  formats: ReportExportFormat[];
  availability: 'available' | 'partial' | 'unavailable';
  availabilityLabel: string;
  keywords: string;
  is_active: boolean;
};

export type DashboardFilterState = {
  group: DashboardCategoryId;
  q: string;
  module: string; // '' | Documentation | Finance | …
  type: '' | DashboardReportType;
  format: '' | ReportExportFormat;
};

export const EMPTY_DASHBOARD_FILTERS: DashboardFilterState = {
  group: 'all',
  q: '',
  module: '',
  type: '',
  format: '',
};

export function mapDocumentTypeToDashboardType(
  documentType: ReportDocumentType | undefined,
  family: ReportFamily,
): DashboardReportType {
  if (documentType === 'financial') return 'financial';
  if (documentType === 'list' || family === 'ops_list') return 'list';
  if (family === 'finance') return 'financial';
  return 'transaction';
}

export function availabilityFromMeta(input: {
  is_active: boolean;
  gapStatus?: string;
  hasClientLayout?: boolean;
}): { availability: DashboardReportCardModel['availability']; availabilityLabel: string } {
  if (!input.is_active) {
    return { availability: 'unavailable', availabilityLabel: 'Inactive' };
  }
  if (input.gapStatus === 'covered_document_pdf' || input.hasClientLayout) {
    return { availability: 'available', availabilityLabel: 'Available' };
  }
  if (
    input.gapStatus === 'partial_document_pdf' ||
    input.gapStatus === 'partial_analytics' ||
    input.gapStatus === 'net_new'
  ) {
    return { availability: 'partial', availabilityLabel: 'Partial' };
  }
  return { availability: 'available', availabilityLabel: 'Available' };
}

export function filterDashboardCards(
  cards: DashboardReportCardModel[],
  filters: DashboardFilterState,
): DashboardReportCardModel[] {
  const families = familiesForDashboardCategory(filters.group);
  const familySet = families === 'all' ? null : new Set(families);

  return cards.filter((card) => {
    if (familySet && !familySet.has(card.family)) return false;
    if (filters.module && card.moduleLabel !== filters.module) return false;
    if (filters.type && card.reportType !== filters.type) return false;
    if (filters.format && !card.formats.includes(filters.format)) return false;
    if (!filters.q.trim()) return true;
    return reportCatalogRowMatchesSearch(
      {
        name: card.name,
        code: card.code,
        description: `${card.description} ${card.keywords}`.trim(),
        family: card.family,
      },
      filters.q,
    );
  });
}

export function countByDashboardCategory(
  cards: DashboardReportCardModel[],
): Record<DashboardCategoryId, number> {
  const counts = {
    all: cards.length,
    sea: 0,
    air: 0,
    accounts: 0,
    operations: 0,
    wms: 0,
    customs: 0,
    my_reports: 0,
  } satisfies Record<DashboardCategoryId, number>;

  for (const card of cards) {
    if (card.family === 'sea_docs') {
      counts.sea += 1;
      counts.customs += 1;
    }
    if (card.family === 'air_docs') {
      counts.air += 1;
      counts.customs += 1;
    }
    if (card.family === 'commercial' || card.family === 'finance') counts.accounts += 1;
    if (card.family === 'ops_list') {
      counts.operations += 1;
      counts.my_reports += 1;
    }
    if (card.family === 'wms') counts.wms += 1;
    if (card.family === 'other') counts.my_reports += 1;
  }
  return counts;
}

export function uniqueModuleLabels(cards: DashboardReportCardModel[]): string[] {
  return [...new Set(cards.map((c) => c.moduleLabel || moduleLabelForFamily(c.family)))].sort();
}
