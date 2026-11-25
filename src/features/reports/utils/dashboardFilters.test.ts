import { describe, expect, it } from 'vitest';
import {
  availabilityFromMeta,
  countByDashboardCategory,
  EMPTY_DASHBOARD_FILTERS,
  filterDashboardCards,
  mapDocumentTypeToDashboardType,
  type DashboardReportCardModel,
} from './dashboardFilters';

function card(
  partial: Partial<DashboardReportCardModel> & Pick<DashboardReportCardModel, 'code' | 'family'>,
): DashboardReportCardModel {
  return {
    name: partial.name || partial.code,
    description: partial.description || '',
    categoryLabel: partial.categoryLabel || partial.family,
    moduleLabel: partial.moduleLabel || 'Operations',
    reportType: partial.reportType || 'transaction',
    formats: partial.formats || ['PDF'],
    availability: partial.availability || 'available',
    availabilityLabel: partial.availabilityLabel || 'Available',
    keywords: partial.keywords || '',
    is_active: partial.is_active ?? true,
    ...partial,
  };
}

describe('dashboardFilters', () => {
  it('maps enrichment document types to dashboard types', () => {
    expect(mapDocumentTypeToDashboardType('financial', 'finance')).toBe('financial');
    expect(mapDocumentTypeToDashboardType('list', 'ops_list')).toBe('list');
    expect(mapDocumentTypeToDashboardType('shipping', 'sea_docs')).toBe('transaction');
  });

  it('derives availability labels', () => {
    expect(availabilityFromMeta({ is_active: false }).availability).toBe('unavailable');
    expect(
      availabilityFromMeta({ is_active: true, gapStatus: 'covered_document_pdf' }).availability,
    ).toBe('available');
    expect(
      availabilityFromMeta({ is_active: true, gapStatus: 'partial_document_pdf' }).availability,
    ).toBe('partial');
  });

  it('filters by group, search, module, type, and format together', () => {
    const cards = [
      card({
        code: 'HBL_DRAFT_REPORT_FORMAT_JASPER',
        family: 'sea_docs',
        name: 'HBL Draft Jasper',
        moduleLabel: 'Documentation',
        reportType: 'transaction',
        formats: ['PDF'],
        keywords: 'bill lading',
      }),
      card({
        code: 'JOB_LIST_SUMMARY_REPORT_FORMAT',
        family: 'ops_list',
        name: 'Job List Summary',
        moduleLabel: 'Operations',
        reportType: 'list',
        formats: ['PDF', 'XLSX'],
      }),
      card({
        code: 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
        family: 'commercial',
        name: 'Tax Invoice India',
        moduleLabel: 'Finance',
        reportType: 'transaction',
        formats: ['PDF'],
      }),
    ];

    expect(filterDashboardCards(cards, { ...EMPTY_DASHBOARD_FILTERS, group: 'sea' })).toHaveLength(1);
    expect(
      filterDashboardCards(cards, { ...EMPTY_DASHBOARD_FILTERS, q: 'job list' }).map((c) => c.code),
    ).toEqual(['JOB_LIST_SUMMARY_REPORT_FORMAT']);
    expect(
      filterDashboardCards(cards, {
        ...EMPTY_DASHBOARD_FILTERS,
        module: 'Finance',
        type: 'transaction',
        format: 'PDF',
      }),
    ).toHaveLength(1);
    expect(
      filterDashboardCards(cards, { ...EMPTY_DASHBOARD_FILTERS, format: 'XLSX' }).map((c) => c.code),
    ).toEqual(['JOB_LIST_SUMMARY_REPORT_FORMAT']);
  });

  it('counts sidebar groups without double-counting all', () => {
    const cards = [
      card({ code: 'A', family: 'sea_docs' }),
      card({ code: 'B', family: 'air_docs' }),
      card({ code: 'C', family: 'ops_list' }),
    ];
    const counts = countByDashboardCategory(cards);
    expect(counts.all).toBe(3);
    expect(counts.sea).toBe(1);
    expect(counts.air).toBe(1);
    expect(counts.customs).toBe(2);
    expect(counts.operations).toBe(1);
    expect(counts.my_reports).toBe(1);
  });
});
