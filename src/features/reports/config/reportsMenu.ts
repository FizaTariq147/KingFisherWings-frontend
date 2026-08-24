import type { MenuTile } from '@/features/customers/types/menu.types';
import { accountsMenu } from '@/features/chartOfAccounts/config/accountsMenu';
import { reportsDocsTile } from '@/features/documents/config/documentationMenu';
import { reportsHrTile } from '@/features/hr/config/hrMenu';
import { managementMenu, reportsMisTile } from '@/features/management/config/managementMenu';
import { reportsNvoccTile } from '@/features/nvocc/config/nvoccMenu';
import { reportsQuotationTile } from '@/features/quotations/config/quotationsMenu';
import { reportsSalesTile, salesMenu } from '@/features/sales/config/salesMenu';

function withSection(tile: MenuTile, section: string): MenuTile {
  return { ...tile, section };
}

const managementDashboardReports = managementMenu.find((tile) => tile.id === 'management-dashboard-reports');

const glReportTileIds = new Set([
  'pdc-due-report',
  'financial-reports',
  'mis-dashboard',
  'my-reports',
  'trial-balance',
]);

const glReportTiles = accountsMenu.filter((tile) => glReportTileIds.has(tile.id));

const salesReportTiles = salesMenu.filter((tile) =>
  ['sales-dashboard', 'visiting-card-list-report'].includes(tile.id),
);

/** All module report entry points shown on the global Reports menu. */
export const reportsMenu: MenuTile[] = [
  withSection(reportsQuotationTile, 'Module reports'),
  withSection(reportsSalesTile, 'Module reports'),
  withSection(reportsHrTile, 'Module reports'),
  withSection(reportsMisTile, 'Module reports'),
  withSection(reportsNvoccTile, 'Module reports'),
  withSection(reportsDocsTile, 'Module reports'),
  ...(managementDashboardReports
    ? [withSection(managementDashboardReports, 'Management')]
    : []),
  ...salesReportTiles.map((tile) => withSection(tile, 'Sales')),
  ...glReportTiles.map((tile) => withSection(tile, 'Finance & GL')),
];
