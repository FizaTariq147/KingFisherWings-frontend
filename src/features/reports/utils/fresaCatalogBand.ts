import type { ReportTemplate } from '../types/reportCatalog.types';
import type { FresaCatalogSectionId } from '../components/ReportCatalog/FresaCatalogSection';
import type { FresaPageColumnId } from '../constants/fresaPageColumns';
import { FRESA_CATALOG_SECTION_TITLE } from '../components/ReportCatalog/FresaCatalogSection';

/** Band order inside each Fresa page column (matches sample-report-formats scanning). */
export const FRESA_COLUMN_BAND_ORDER: Record<FresaPageColumnId, FresaCatalogSectionId[]> = {
  sea: ['hbl', 'arrival', 'delivery', 'sea_extra', 'leftover'],
  air: ['hawb', 'quotation', 'wms', 'other', 'leftover'],
  accounts: ['invoice', 'accounts', 'commercial_extra', 'leftover'],
  my_reports: ['ops_list', 'other', 'leftover'],
};

/**
 * Map a catalogue template to a Fresa subsection band (Invoice / HBL / HAWB / …).
 */
export function fresaCatalogBandForTemplate(t: ReportTemplate): FresaCatalogSectionId {
  const code = (t.code || '').toUpperCase();
  const name = (t.name || '').toUpperCase();
  const family = (t.family || '').toLowerCase();

  if (/^HAWB_|HAWB/.test(code) || /\bHAWB\b/.test(name)) return 'hawb';
  if (/^MAWB_|MAWB/.test(code) || /\bMAWB\b/.test(name)) return 'other';
  if (/^HBL_|FG_HBL_|LEFTOVER_HBL/.test(code) || /\bHBL\b/.test(name)) return 'hbl';
  if (/ARRIVAL_NOTICE|CARGO_ARRIVAL/.test(code) || /ARRIVAL NOTICE/.test(name)) return 'arrival';
  if (/DELIVERY_ORDER|^DO_/.test(code) || /DELIVERY ORDER/.test(name)) return 'delivery';
  if (/ADVANCE_SHIPPING|WMS|ASN/.test(code) || /\bASN\b|ADVANCE SHIPPING/.test(name)) return 'wms';
  if (/INVOICE_REPORT_FORMAT|FG_INVOICE|TAX_INVOICE|DEBIT_NOTE/.test(code) || /INVOICE/.test(name)) {
    if (family === 'finance' && !/INVOICE/.test(code) && !/INVOICE/.test(name)) return 'accounts';
    return 'invoice';
  }
  if (
    /JOURNAL_VOUCHER|PAYMENT_VOUCHER|PROFIT_AND_LOSS|TRIAL_BALANCE|LEDGER|RECEIPT/.test(code) ||
    family === 'finance'
  ) {
    return 'accounts';
  }
  if (family === 'quotation' || /QUOTATION/.test(code) || /QUOTATION/.test(name)) return 'quotation';
  if (family === 'ops_list' || /\.XLSX$/i.test(code) || /LIST REPORT/.test(name)) return 'ops_list';
  if (family === 'commercial') return 'commercial_extra';
  if (family === 'sea_docs') return 'sea_extra';
  if (family === 'air_docs') return 'other';
  if (family === 'wms') return 'wms';
  return 'leftover';
}

export function fresaCatalogBandTitle(id: FresaCatalogSectionId): string {
  return FRESA_CATALOG_SECTION_TITLE[id] || id;
}

export type FresaColumnBand = {
  id: FresaCatalogSectionId;
  title: string;
  items: ReportTemplate[];
};

/** Group + order templates into subsection bands for one Fresa page column. */
export function groupColumnIntoBands(
  columnId: FresaPageColumnId,
  items: ReportTemplate[],
  compare: (a: ReportTemplate, b: ReportTemplate) => number,
): FresaColumnBand[] {
  const buckets = new Map<FresaCatalogSectionId, ReportTemplate[]>();
  for (const t of items) {
    const band = fresaCatalogBandForTemplate(t);
    const list = buckets.get(band) || [];
    list.push(t);
    buckets.set(band, list);
  }
  const order = FRESA_COLUMN_BAND_ORDER[columnId];
  const out: FresaColumnBand[] = [];
  const seen = new Set<FresaCatalogSectionId>();
  for (const id of order) {
    const list = buckets.get(id);
    if (!list?.length) continue;
    seen.add(id);
    out.push({
      id,
      title: fresaCatalogBandTitle(id),
      items: [...list].sort(compare),
    });
  }
  for (const [id, list] of buckets) {
    if (seen.has(id) || !list.length) continue;
    out.push({
      id,
      title: fresaCatalogBandTitle(id),
      items: [...list].sort(compare),
    });
  }
  return out;
}
