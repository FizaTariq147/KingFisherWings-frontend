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

/** Finance hubs only — detailed AR/AP screens stay under Accounts. */
const financeHubTileIds = new Set([
  'financial-reports',
  'mis-dashboard',
  'my-reports',
  'pdc-due-report',
]);

const financeHubTiles = accountsMenu.filter((tile) => financeHubTileIds.has(tile.id));

/** FRESA / KingFisher format catalogue (layout PDF previews + generate). */
export const reportsCatalogTile: MenuTile = {
  id: 'fresa-report-catalog',
  title: 'Report formats catalogue',
  description: 'Browse layout PDFs by section and generate live reports when a pack is bound.',
  icon: FileStack,
  iconColor: 'bg-orange-500',
  path: REPORT_CATALOG_ROUTE,
};

/**
 * Global Reports menu — catalogue + one hub tile per module + finance report hubs.
 * Deep GL screens (aging, open items, trial balance) live under Accounts, not here.
 */
export const reportsMenu: MenuTile[] = dedupeByPath([
  withSection(reportsCatalogTile, 'Catalogue'),
  withSection(reportsQuotationTile, 'Module reports'),
  withSection(reportsSalesTile, 'Module reports'),
  withSection(reportsHrTile, 'Module reports'),
  withSection(reportsMisTile, 'Module reports'),
  withSection(reportsNvoccTile, 'Module reports'),
  withSection(reportsDocsTile, 'Module reports'),
  ...(managementDashboardReports
    ? [withSection(managementDashboardReports, 'Management')]
    : []),
  ...financeHubTiles.map((tile) => withSection(tile, 'Finance & GL')),
]);
