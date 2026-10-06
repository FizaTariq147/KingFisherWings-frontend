import type { ReportFamily } from '../types/reportCatalog.types';
import { isModuleEnabled } from '@/features/tenants/utils/isModuleEnabled';

/**
 * Map report families / menu tiles to Super Admin `enabled_modules` keys.
 * Valid backend keys: operations, sales, finance, masters, admin, hr, wms,
 * transport, nvocc, documentation, support, logistics.
 */
const FAMILY_TO_MODULE: Partial<Record<ReportFamily, string>> = {
  finance: 'finance',
  wms: 'wms',
  quotation: 'sales',
  ops_list: 'operations',
  sea_docs: 'documentation',
  air_docs: 'documentation',
  commercial: 'finance',
};

export function reportFamilyAllowed(
  family: string | undefined,
  enabledModules: readonly string[] | null | undefined,
): boolean {
  if (!family) return true;
  const key = FAMILY_TO_MODULE[family as ReportFamily];
  if (!key) return true;
  return isModuleEnabled(enabledModules, key);
}

/** Tile id / section → enabled module for Reports hub filtering. */
export function reportsTileModuleKey(tile: {
  id: string;
  path: string;
  section?: string;
}): string | null {
  const id = tile.id.toLowerCase();
  const path = tile.path.toLowerCase();
  const section = (tile.section || '').toLowerCase();

  if (id.includes('quotation') || path.includes('/quotations')) return 'sales';
  if (id.includes('sales') || path.includes('/sales')) return 'sales';
  if (id.includes('hr') || path.includes('/hr')) return 'hr';
  if (id.includes('nvocc') || path.includes('/nvocc')) return 'nvocc';
  if (id.includes('doc') || path.includes('/documentation')) return 'documentation';
  if (id.includes('wms') || path.includes('/warehouse') || section.includes('wms')) return 'wms';
  if (
    id.includes('finance') ||
    id.includes('aging') ||
    id.includes('overdue') ||
    id.includes('pdc') ||
    id.includes('mis') ||
    path.includes('/finance') ||
    path.includes('/gl') ||
    path.includes('/accounts') ||
    section.includes('finance')
  ) {
    return 'finance';
  }
  if (id.includes('management') || path.includes('/management')) return 'admin';
  if (id.includes('customer') || path.includes('/customer')) return 'support';
  if (id.includes('transport') || path.includes('/transport')) return 'transport';
  if (id.includes('catalog') || path.includes('/reports/catalog')) return null;
  return null;
}
