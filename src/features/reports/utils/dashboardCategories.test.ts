import { describe, expect, it } from 'vitest';
import {
  DASHBOARD_CATEGORIES,
  dashboardCategoryById,
  familiesForDashboardCategory,
  moduleLabelForFamily,
} from './dashboardCategories';

describe('dashboardCategories', () => {
  it('defines All Reports plus seven groups', () => {
    expect(DASHBOARD_CATEGORIES.map((c) => c.id)).toEqual([
      'all',
      'sea',
      'air',
      'accounts',
      'operations',
      'wms',
      'customs',
      'my_reports',
    ]);
  });

  it('maps customs to sea_docs and air_docs only', () => {
    expect(familiesForDashboardCategory('customs')).toEqual(['sea_docs', 'air_docs']);
  });

  it('links My Reports to saved GL reports', () => {
    const my = dashboardCategoryById('my_reports');
    expect(my.externalHref).toBe('/gl/saved-reports');
    expect(familiesForDashboardCategory('my_reports')).toEqual(['ops_list', 'other']);
  });

  it('maps families to module labels', () => {
    expect(moduleLabelForFamily('sea_docs')).toBe('Documentation');
    expect(moduleLabelForFamily('finance')).toBe('Finance');
    expect(moduleLabelForFamily('ops_list')).toBe('Operations');
  });
});
