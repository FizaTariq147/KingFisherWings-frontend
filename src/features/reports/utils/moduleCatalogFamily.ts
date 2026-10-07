import {
  REPORT_CATALOG_ROUTE,
  REPORT_TEMPLATE_FAMILY_ENUM,
} from '../api/reportCatalog.api';
import type { ReportContext, ReportFamily } from '../types/reportCatalog.types';

const FAMILY_SET = new Set<string>(REPORT_TEMPLATE_FAMILY_ENUM);

/**
 * Map a Reports menu tile / hub path to catalogue family filters from the OpenAPI
 * family enum — no hardcoded format codes. Returns empty when the tile is the
 * unscoped catalogue itself or has no matching family.
 */
export function catalogFamiliesForReportsTile(tile: {
  id?: string;
  path?: string;
  title?: string;
  section?: string;
}): ReportFamily[] {
  const blob = [tile.id, tile.path, tile.title, tile.section]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (blob.includes('/reports/catalog') || blob.includes('fresa-report-catalog')) {
    return [];
  }

  const out: ReportFamily[] = [];
  const add = (family: ReportFamily) => {
    if (FAMILY_SET.has(family) && !out.includes(family)) out.push(family);
  };

  if (blob.includes('quotation')) add('quotation');
  if (blob.includes('sales') || blob.includes('crm')) {
    add('quotation');
    add('commercial');
  }
  if (blob.includes('invoice') || blob.includes('commercial') || blob.includes('finance') || blob.includes('account') || blob.includes('aging') || blob.includes('gl')) {
    add('commercial');
    add('finance');
  }
  if (blob.includes('wms') || blob.includes('warehouse') || blob.includes('stock')) add('wms');
  if (blob.includes('nvocc') || blob.includes('sea') || blob.includes('hbl')) {
    add('sea_docs');
    add('ops_list');
  }
  if (blob.includes('air') || blob.includes('hawb') || blob.includes('awb')) {
    add('air_docs');
  }
  if (blob.includes('documentation') || blob.includes('docs')) {
    add('sea_docs');
    add('air_docs');
    add('ops_list');
  }
  if (blob.includes('ops') || blob.includes('operations') || blob.includes('job')) {
    add('ops_list');
  }
  if (blob.includes('hr') || blob.includes('mis') || blob.includes('management') || blob.includes('custom')) {
    add('other');
  }

  return out;
}

/** Prefer family (+ context) query for catalogue deep-links from entity screens. */
export function catalogFamilyForContext(context: ReportContext): ReportFamily | undefined {
  switch (context) {
    case 'quotation':
      return 'quotation';
    case 'invoice':
      return 'commercial';
    case 'wms':
      return 'wms';
    case 'gl':
      return 'finance';
    case 'job':
      return undefined;
    case 'list':
      return 'ops_list';
    case 'party':
      return undefined;
    default:
      return undefined;
  }
}

export function buildCatalogHref(opts: {
  family?: ReportFamily | string | null;
  context?: ReportContext | string | null;
  code?: string | null;
  quotation_id?: string | null;
  invoice_id?: string | null;
  job_id?: string | null;
  party_id?: string | null;
}): string {
  const params = new URLSearchParams();
  if (opts.family && opts.family !== 'all') params.set('family', String(opts.family));
  if (opts.context && opts.context !== 'all') params.set('context', String(opts.context));
  if (opts.code?.trim()) params.set('code', opts.code.trim());
  if (opts.quotation_id?.trim()) params.set('quotation_id', opts.quotation_id.trim());
  if (opts.invoice_id?.trim()) params.set('invoice_id', opts.invoice_id.trim());
  if (opts.job_id?.trim()) params.set('job_id', opts.job_id.trim());
  if (opts.party_id?.trim()) params.set('party_id', opts.party_id.trim());
  const q = params.toString();
  return q ? `${REPORT_CATALOG_ROUTE}?${q}` : REPORT_CATALOG_ROUTE;
}
