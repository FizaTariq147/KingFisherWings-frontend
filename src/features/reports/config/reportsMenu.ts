import type { MenuTile } from '@/features/customers/types/menu.types';
import {
  AlertTriangle,
  BarChart2,
  Barcode,
  Boxes,
  FileEdit,
  FileStack,
} from 'lucide-react';
import { accountsMenu } from '@/features/chartOfAccounts/config/accountsMenu';
import { customerServiceMenu } from '@/features/customers/config/customerServiceMenu';
import { reportsDocsTile } from '@/features/documents/config/documentationMenu';
import { reportsHrTile } from '@/features/hr/config/hrMenu';
import { financeMenu } from '@/features/invoices/config/financeMenu';
import { managementMenu, reportsMisTile } from '@/features/management/config/managementMenu';
import { mastersMenu } from '@/features/masters/config/mastersMenu';
import { reportsNvoccTile } from '@/features/nvocc/config/nvoccMenu';
import { reportsQuotationTile } from '@/features/quotations/config/quotationsMenu';
import { reportsSalesTile } from '@/features/sales/config/salesMenu';
import { wmsMenu } from '@/features/wms/config/wmsMenu';
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

/** Finance hubs — GL reports + overdue invoices (Accounts deep screens stay under Accounts too). */
const financeHubTileIds = new Set([
  'financial-reports',
  'mis-dashboard',
  'my-reports',
  'pdc-due-report',
  'ar-aging',
  'ap-aging',
]);

const financeHubTiles = accountsMenu.filter((tile) => financeHubTileIds.has(tile.id));

const overdueInvoicesTile = financeMenu.find((tile) => tile.id === 'overdue-invoices');

const wmsStockTile = wmsMenu.find((tile) => tile.id === 'wms-stock');

const customReportsTile = mastersMenu.find((tile) => tile.id === 'custom-reports');

const csPricingDashboard = customerServiceMenu.find((tile) => tile.id === 'pricing-dashboard');

const awbStockReportTile: MenuTile = {
  id: 'awb-stock-low-stock-report',
  title: 'AWB stock (low stock)',
  description: 'Airline AWB batches at or below low-stock threshold.',
  icon: Barcode,
  iconColor: 'bg-sky-500',
  path: '/masters/awb-stock-master',
};

/** Customer Service enquiry / pricing reports hub. */
const reportsCsTile: MenuTile = csPricingDashboard
  ? {
      ...csPricingDashboard,
      id: 'reports-customer-service',
      title: 'Reports - Customer Service',
      description:
        'Open enquiry reports and pricing dashboard statistics for customer service.',
      icon: BarChart2,
    }
  : {
      id: 'reports-customer-service',
      title: 'Reports - Customer Service',
      description: 'Open enquiry reports and pricing dashboard statistics.',
      icon: BarChart2,
      iconColor: 'bg-emerald-500',
      path: '/customer-service/pricing-dashboard',
    };

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
 * Global Reports menu — one entry per module that owns report/analytics screens.
 * Job-level PDFs (HAWB/HBL/stuffing/courier) stay on the job documents panel.
 * Vendor portal has disputes admin only (no dedicated reports hub).
 */
export const reportsMenu: MenuTile[] = dedupeByPath([
  withSection(reportsCatalogTile, 'Catalogue'),
  withSection(reportsQuotationTile, 'Module reports'),
  withSection(reportsSalesTile, 'Module reports'),
  withSection(reportsCsTile, 'Module reports'),
  withSection(reportsHrTile, 'Module reports'),
  withSection(reportsMisTile, 'Module reports'),
  withSection(reportsNvoccTile, 'Module reports'),
  withSection(reportsDocsTile, 'Module reports'),
  ...(managementDashboardReports
    ? [withSection(managementDashboardReports, 'Management')]
    : []),
  ...financeHubTiles.map((tile) => withSection(tile, 'Finance & GL')),
  ...(overdueInvoicesTile
    ? [
        withSection(
          { ...overdueInvoicesTile, icon: AlertTriangle, title: 'Overdue invoices' },
          'Finance & GL',
        ),
      ]
    : []),
  ...(wmsStockTile
    ? [withSection({ ...wmsStockTile, icon: Boxes }, 'WMS & stock')]
    : []),
  withSection(awbStockReportTile, 'WMS & stock'),
  ...(customReportsTile
    ? [withSection({ ...customReportsTile, icon: FileEdit }, 'Masters')]
    : []),
]);
