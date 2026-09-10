import type { MenuTile } from '@/features/customers/types/menu.types';
import { FileStack } from 'lucide-react';
import { accountsMenu } from '@/features/chartOfAccounts/config/accountsMenu';
import { reportsDocsTile } from '@/features/documents/config/documentationMenu';
import { reportsHrTile } from '@/features/hr/config/hrMenu';
import { managementMenu, reportsMisTile } from '@/features/management/config/managementMenu';
import { reportsNvoccTile } from '@/features/nvocc/config/nvoccMenu';
import { reportsQuotationTile } from '@/features/quotations/config/quotationsMenu';
import { reportsSalesTile } from '@/features/sales/config/salesMenu';
import { REPORT_CATALOG_ROUTE } from '../api/reportCatalog.api';

function withSection(tile: MenuTile, section: string): MenuTile {
  return { ...tile, section };
}

/** Keep first tile per path so the Reports menu never shows duplicates. */
function dedupeByPath(tiles: MenuTile[]): MenuTile[] {
  const seen = new Set<string>();
  const out: MenuTile[] = [];
  for (const tile of tiles) {
    const key = tile.path.replace(/\?.*$/, '');
    if (seen.has(key) || seen.has(tile.id)) continue;
    seen.add(key);
    seen.add(tile.id);
    out.push(tile);
  }
  return out;
}

const managementDashboardReports = managementMenu.find(
  (tile) => tile.id === 'management-dashboard-reports',
);

const glReportTileIds = new Set([
  'ar-aging',
  'ap-aging',
  'ar-open-items',
  'ap-open-items',
  'pdc-due-report',
  'financial-reports',
  'mis-dashboard',
  'my-reports',
  'trial-balance',
]);

const glReportTiles = accountsMenu.filter((tile) => glReportTileIds.has(tile.id));

/** Additive FRESA sample-format catalog (does not replace module analytics tiles). */
export const reportsCatalogTile: MenuTile = {
  id: 'fresa-report-catalog',
  title: 'Sample report formats',
  description:
    'FRESA-aligned report catalog (HBL, arrival notices, invoices, ops lists, GL, WMS). Generate via backend templates.',
  icon: FileStack,
  iconColor: 'bg-orange-500',
  path: REPORT_CATALOG_ROUTE,
};

/**
 * Global Reports menu — one hub tile per module, plus unique Management / Finance entries.
 * Sales report screens live under Reports - Sales (`/sales/reports`), not repeated here.
 */
export const reportsMenu: MenuTile[] = dedupeByPath([
  withSection(reportsCatalogTile, 'Catalog'),
  withSection(reportsQuotationTile, 'Module reports'),
  withSection(reportsSalesTile, 'Module reports'),
  withSection(reportsHrTile, 'Module reports'),
  withSection(reportsMisTile, 'Module reports'),
  withSection(reportsNvoccTile, 'Module reports'),
  withSection(reportsDocsTile, 'Module reports'),
  ...(managementDashboardReports
    ? [withSection(managementDashboardReports, 'Management')]
    : []),
  ...glReportTiles.map((tile) => withSection(tile, 'Finance & GL')),
]);
