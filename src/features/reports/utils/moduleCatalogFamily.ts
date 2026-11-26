import {
  REPORT_CATALOG_ROUTE,
  REPORT_DASHBOARD_ROUTE,
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
  if (
    blob.includes('invoice') ||
    blob.includes('commercial') ||
    blob.includes('finance') ||
    blob.includes('account') ||
    blob.includes('aging') ||
    blob.includes('gl')
  ) {
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

/**
 * Families relevant to a job/shipment mode so entity Reports show all related formats.
 * SEA → sea_docs + ops_list + commercial; AIR → air_docs + ops_list + commercial; etc.
 */
export function catalogFamiliesForJobType(jobType?: string | null): ReportFamily[] {
  const t = String(jobType || '')
    .trim()
    .toUpperCase()
    .replace(/-/g, '_');
  const out: ReportFamily[] = [];
  const add = (family: ReportFamily) => {
    if (!out.includes(family)) out.push(family);
  };

  if (!t) {
    add('ops_list');
    add('commercial');
    return out;
  }

  if (t.includes('AIR') || t.includes('HAWB') || t.includes('AWB')) {
    add('air_docs');
  }
  if (
    t.includes('SEA') ||
    t.includes('FCL') ||
    t.includes('LCL') ||
    t.includes('NVOCC') ||
    t.includes('HBL') ||
    t.includes('MBL')
  ) {
    add('sea_docs');
  }
  if (t.includes('ROAD') || t.includes('LAND') || t.includes('TRUCK') || t.includes('COURIER')) {
    add('commercial');
    add('ops_list');
  }
  if (t.includes('CUSTOM') || t.includes('CLEARANCE') || t.includes('CC_')) {
    add('ops_list');
    add('commercial');
  }

  add('ops_list');
  add('commercial');
  if (!out.includes('air_docs') && !out.includes('sea_docs')) {
    add('sea_docs');
    add('air_docs');
  }
  return out;
}

export function parseCatalogFamiliesParam(raw?: string | null): ReportFamily[] {
  if (!raw?.trim()) return [];
  const out: ReportFamily[] = [];
  for (const part of raw.split(/[,+|]/)) {
    const f = part.trim() as ReportFamily;
    if (FAMILY_SET.has(f) && !out.includes(f)) out.push(f);
  }
  return out;
}

type CatalogHrefOpts = {
  family?: ReportFamily | string | null;
  /** Comma-separated multi-family filter (job/shipment relevant sets). */
  families?: ReportFamily[] | string | null;
  context?: ReportContext | string | null;
  code?: string | null;
  quotation_id?: string | null;
  invoice_id?: string | null;
  job_id?: string | null;
  party_id?: string | null;
  shipment_id?: string | null;
  /** Catalogue browse mode — invoice Formats opens the redesigned strips list. */
  view?: 'strips' | 'fresa' | null;
  /** When `all`, catalogue lists every layout variant (not only distinct shells). */
  layouts?: 'all' | 'distinct' | null;
  /** Optional path to return to (e.g. job detail) from the dashboard back link. */
  return_to?: string | null;
};

function buildReportQueryParams(opts: CatalogHrefOpts): URLSearchParams {
  const params = new URLSearchParams();
  if (opts.family && opts.family !== 'all') params.set('family', String(opts.family));
  if (opts.families) {
    const list = Array.isArray(opts.families)
      ? opts.families
      : parseCatalogFamiliesParam(opts.families);
    if (list.length === 1 && !opts.family) {
      params.set('family', list[0]!);
    } else if (list.length > 1) {
      params.set('families', list.join(','));
    }
  }
  if (opts.context && opts.context !== 'all') params.set('context', String(opts.context));
  if (opts.code?.trim()) params.set('code', opts.code.trim());
  if (opts.quotation_id?.trim()) params.set('quotation_id', opts.quotation_id.trim());
  if (opts.invoice_id?.trim()) params.set('invoice_id', opts.invoice_id.trim());
  if (opts.job_id?.trim()) params.set('job_id', opts.job_id.trim());
  if (opts.party_id?.trim()) params.set('party_id', opts.party_id.trim());
  if (opts.shipment_id?.trim()) params.set('shipment_id', opts.shipment_id.trim());
  if (opts.view === 'strips') params.set('view', 'strips');
  if (opts.layouts === 'all') params.set('layouts', 'all');
  if (opts.return_to?.trim().startsWith('/')) {
    params.set('return_to', opts.return_to.trim());
  }
  return params;
}

export function buildCatalogHref(opts: CatalogHrefOpts): string {
  const q = buildReportQueryParams(opts).toString();
  return q ? `${REPORT_CATALOG_ROUTE}?${q}` : REPORT_CATALOG_ROUTE;
}

/** Invoice Formats / Reports catalog → sample-style dashboard with live record ids. */
export function buildDashboardHref(opts: CatalogHrefOpts): string {
  const q = buildReportQueryParams(opts).toString();
  return q ? `${REPORT_DASHBOARD_ROUTE}?${q}` : REPORT_DASHBOARD_ROUTE;
}

/** Query string for format deep-links (preserve invoice/job/party context). */
export function reportContextQuery(opts: {
  quotation_id?: string | null;
  invoice_id?: string | null;
  job_id?: string | null;
  party_id?: string | null;
  shipment_id?: string | null;
}): string {
  return buildReportQueryParams(opts).toString();
}

/** True when a catalogue row is an invoice / commercial document format. */
export function isInvoiceRelatedReport(input: {
  code?: string;
  family?: string;
  contexts?: string[];
  name?: string;
}): boolean {
  const code = String(input.code || '').toUpperCase();
  const family = String(input.family || '').toLowerCase();
  const contexts = (input.contexts || []).map((c) => String(c).toLowerCase());
  if (contexts.includes('invoice')) return true;
  if (family === 'commercial' || family === 'finance') return true;
  if (
    /^(INVOICE_|PROFORMA_INVOICE_|PURCHASE_INVOICE_|DEBIT_NOTE_|CREDIT_NOTE_|FG_INVOICE)/i.test(
      code,
    )
  ) {
    return true;
  }
  const name = String(input.name || '');
  return /\binvoice\b|\bdebit\s*note\b|\bcredit\s*note\b|\bproforma\b/i.test(name);
}

/**
 * Sea HBL vs Air HAWB family for job Bills of Lading / Airway Bill → Formats.
 * Air job types → air_docs; everything else defaults to sea_docs.
 */
export function transportDocFamilyForJobType(
  jobType?: string | null,
): Extract<ReportFamily, 'air_docs' | 'sea_docs'> {
  const t = String(jobType || '')
    .trim()
    .toUpperCase()
    .replace(/-/g, '_');
  if (t.includes('AIR') || t.includes('HAWB') || t.includes('AWB')) {
    return 'air_docs';
  }
  return 'sea_docs';
}

/** True when a catalogue row belongs to sea_docs / air_docs transport documents. */
export function isTransportDocRelatedReport(
  input: {
    code?: string;
    family?: string;
    contexts?: string[];
    name?: string;
  },
  family: Extract<ReportFamily, 'air_docs' | 'sea_docs'>,
): boolean {
  const fam = String(input.family || '').toLowerCase();
  if (fam === family) return true;
  const code = String(input.code || '').toUpperCase();
  if (family === 'air_docs') {
    return /^(HAWB_|MAWB_|FG_HAWB|AIR_)/i.test(code) || /\bhawb\b|\bmawb\b|\bawb\b/i.test(
      String(input.name || ''),
    );
  }
  return /^(HBL_|MBL_|FG_HBL|SEA_)/i.test(code) || /\bhbl\b|\bmbl\b|\bbill of lading\b/i.test(
    String(input.name || ''),
  );
}

/** Job BL / Airway Bill → report formats dashboard with live job context. */
export function buildJobTransportDocFormatsPath(
  jobId: string,
  jobType?: string | null,
  opts?: {
    party_id?: string | null;
    shipment_id?: string | null;
    return_to?: string | null;
  },
): string {
  const family = transportDocFamilyForJobType(jobType);
  return buildDashboardHref({
    context: 'job',
    family,
    job_id: jobId,
    party_id: opts?.party_id,
    shipment_id: opts?.shipment_id,
    layouts: 'all',
    return_to: opts?.return_to,
  });
}
