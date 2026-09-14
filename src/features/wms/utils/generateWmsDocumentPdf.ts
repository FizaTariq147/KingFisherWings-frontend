import logoAsset from '@/assets/logo.png';
import {
  generateInvoicePdf,
  type InvoicePdfChargeLine,
  type InvoicePdfModel,
} from '@/features/invoices/utils/generateInvoicePdf';
import type { PdfBrandingOptions } from '@/features/files/utils/pdfBranding';
import { normalizeDocLines } from '../components/WmsDocumentDetail';
import type { WmsDocument } from '../types/wms.types';
import { displayDocNumber } from './normalizeWms';

export type WmsPdfKind = 'grn' | 'gdo';

export type WmsDocumentPdfOptions = {
  kind: WmsPdfKind;
  doc: WmsDocument;
  warehouseLabel?: string;
  partyLabel?: string;
  jobLabel?: string;
  itemLabelById?: Map<string, string>;
  logoUrl?: string;
};

function pick(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = record[key];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return '';
}

function pickNumber(record: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const v = record[key];
    if (v == null || v === '') continue;
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function copyLabelForStatus(status: string): string {
  const s = status.toUpperCase();
  if (s.includes('CANCEL')) return 'CANCELLED';
  if (s.includes('POST') || s.includes('APPROV') || s === 'COMPLETED') return 'ORIGINAL';
  if (s.includes('DRAFT')) return 'DRAFT';
  return s.slice(0, 12) || 'ORIGINAL';
}

function lineItemLabel(
  r: Record<string, unknown>,
  itemLabelById?: Map<string, string>,
): string {
  const itemId = pick(r, 'item_id', 'itemId', 'wms_item_id');
  const nested = (r.item && typeof r.item === 'object' ? r.item : null) as Record<
    string,
    unknown
  > | null;
  const nestedLabel = nested
    ? [pick(nested, 'code'), pick(nested, 'name')].filter(Boolean).join(' - ')
    : '';
  return (
    nestedLabel ||
    pick(r, 'item_code', 'itemCode', 'item_name', 'itemName', 'sku', 'code', 'description') ||
    itemLabelById?.get(itemId) ||
    (itemId ? `Item ${itemId.slice(0, 8)}…` : '—')
  );
}

function buildChargeLines(
  kind: WmsPdfKind,
  doc: WmsDocument,
  itemLabelById?: Map<string, string>,
): { lines: InvoicePdfChargeLine[]; subtotal: number; totalCbm: number } {
  const rows = normalizeDocLines(doc.lines);
  let subtotal = 0;
  let totalCbm = 0;
  const lines: InvoicePdfChargeLine[] = rows.map((r) => {
    const qty = pickNumber(r, 'quantity', 'qty', 'expected_qty', 'received_qty') ?? 0;
    const unitCost =
      kind === 'grn' ? pickNumber(r, 'unit_cost', 'unitCost', 'cost') : undefined;
    const cbm = pickNumber(r, 'cbm', 'volume_cbm');
    if (cbm != null) totalCbm += cbm;
    const amount = unitCost != null ? qty * unitCost : undefined;
    if (amount != null) subtotal += amount;
    const batch = pick(r, 'batch_code', 'batchCode', 'lot_code');
    const remarks = pick(r, 'remarks', 'note', 'notes');
    const detailParts = [
      batch ? `Batch: ${batch}` : '',
      cbm != null ? `CBM: ${cbm}` : '',
      remarks,
    ].filter(Boolean);

    return {
      description: lineItemLabel(r, itemLabelById),
      detail: detailParts.join(' · ') || undefined,
      qty,
      unit: pick(r, 'uom_code', 'uom', 'unit') || 'UNIT',
      rate: unitCost,
      amount,
    };
  });

  if (!lines.length) {
    lines.push({
      description: 'No lines on this document',
      qty: undefined,
      unit: '',
      rate: undefined,
      amount: undefined,
    });
  }

  return { lines, subtotal, totalCbm };
}

function toInvoiceModel(options: WmsDocumentPdfOptions): InvoicePdfModel {
  const { kind, doc, warehouseLabel, partyLabel, jobLabel, itemLabelById } = options;
  const docNo = displayDocNumber(doc);
  const status = String(doc.status ?? 'DRAFT').toUpperCase();
  const { lines, subtotal, totalCbm } = buildChargeLines(kind, doc, itemLabelById);
  const isGrn = kind === 'grn';
  const docDate =
    pick(doc as Record<string, unknown>, 'received_at', 'delivered_at', 'created_at') ||
    doc.created_at;

  const warehouse = warehouseLabel || doc.warehouse_id || '—';
  const party = partyLabel || doc.party_id || '—';
  const job = jobLabel || doc.job_id || '—';
  const asn = doc.asn_id ? String(doc.asn_id) : '—';

  return {
    documentTitle: isGrn ? 'GRN' : 'GDO',
    documentSubtitle: isGrn
      ? 'GOODS RECEIVED NOTE / WAREHOUSE RECEIPT'
      : 'GOODS DISPATCH ORDER / GDN',
    detailsSectionTitle: isGrn ? 'GRN DETAILS' : 'GDO DETAILS',
    numberLabel: isGrn ? 'GRN No.' : 'GDO No.',
    dateLabel: isGrn ? 'Received Date' : 'Dispatch Date',
    invoiceNumber: docNo,
    invoiceDate: docDate,
    dueDate: undefined,
    jobRef: job,
    currencyCode: 'AED',
    vatRate: 0,
    copyLabel: copyLabelForStatus(status),
    billTo: {
      client: party,
      attn: warehouse !== '—' ? `Warehouse: ${warehouse}` : '—',
      phone: '—',
      email: '—',
      addressLines: warehouse !== '—' ? [warehouse] : undefined,
    },
    shipment: {
      blAwb: isGrn ? asn : '—',
      vesselFlight: '—',
      pol: warehouse,
      pod: isGrn ? '—' : warehouse,
      containerNo: '—',
      etdEta: docDate
        ? new Date(docDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '—',
      commodity: isGrn ? 'Inbound stock' : 'Outbound stock',
      grossWtCbm: totalCbm > 0 ? `— / ${totalCbm}` : '—',
    },
    lines,
    subtotal,
    discount: 0,
    taxableAmount: subtotal,
    vatAmount: 0,
    otherCharges: 0,
    grandTotal: subtotal,
    advanceReceived: 0,
    balanceDue: subtotal,
    remarks:
      doc.remarks?.trim() ||
      (isGrn
        ? 'This is a computer-generated Goods Received Note. Please verify quantities and batch details against physical receipt. Quote the GRN number for any warehouse queries.'
        : 'This is a computer-generated Goods Dispatch Order (GDN). Please verify quantities against physical dispatch. Quote the GDO number for any warehouse queries.'),
    company: {
      name: 'KINGFISHER WINGS GROUP',
      tagline: 'FREIGHT - LOGISTICS - GENERAL TRADING',
      phone: '+971 55 5355 286',
      email: 'info@kingfisherwingsgroup.com',
      website: 'www.kingfisherwingsgroup.com',
    },
  };
}

export function wmsDocumentPdfBranding(
  kind: WmsPdfKind,
  documentNumber: string,
  documentDate?: string,
): PdfBrandingOptions {
  const documentType = kind === 'grn' ? 'GOODS RECEIVED NOTE' : 'GOODS DISPATCH ORDER';
  return {
    companyName: 'KingFisher Wings',
    subtitle: 'KingFisher Tech Gold',
    documentType,
    documentNumber,
    title: documentNumber,
    documentDate,
    footerLine: 'KingFisher Wings — KingFisher Tech Gold',
    logoUrl: typeof logoAsset === 'string' ? logoAsset : '/kingfisher-logo.png',
  };
}

/**
 * KingFisher GRN / GDO PDF — same visual layout as the tax invoice
 * (logo left, company right, panels, navy table, notes/totals, footer).
 */
export async function generateWmsDocumentPdf(options: WmsDocumentPdfOptions): Promise<Blob> {
  return generateInvoicePdf(toInvoiceModel(options));
}
