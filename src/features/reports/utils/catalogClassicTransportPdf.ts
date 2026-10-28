import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';
import type { InvoiceFormatPdfData } from './invoiceFormatToInvoicePdfModel';
import { generateAwbDraftPdf } from '@/features/shared/awb-draft/generateAwbDraftPdf';
import { generateBlDraftPdf } from '@/features/shared/bl-draft/generateBlDraftPdf';

/** Official Fresa-page HAWB codes + extras that must use classic IATA face, not JsonInvoice. */
export function isClassicHawbCatalogCode(code: string): boolean {
  const c = code.trim().toUpperCase();
  return /^HAWB_(DRAFT|ORIGINAL)_/i.test(c) || c === 'MAWB_DRAFT_REPORT_FORMAT';
}

/** HBL codes that have a classic form renderer (Jasper / FG HKG / numbered drafts). */
export function isClassicHblCatalogCode(code: string): boolean {
  const c = code.trim().toUpperCase();
  if (c === 'HBL_DRAFT_REPORT_FORMAT_JASPER' || c.startsWith('FG_HBL_')) return true;
  return /^HBL_DRAFT_REPORT_FORMAT_(\d+)$/.test(c);
}

function fieldMap(layout: InvoiceFormatUiLayout): Record<string, string> {
  const out: Record<string, string> = {};
  for (const row of layout.demo?.fieldGrid || []) {
    const k = String(row.k || '')
      .trim()
      .toLowerCase();
    if (k) out[k] = String(row.v ?? '').trim();
  }
  return out;
}

function findField(map: Record<string, string>, ...needles: string[]): string {
  for (const needle of needles) {
    const n = needle.toLowerCase();
    for (const [k, v] of Object.entries(map)) {
      if (k.includes(n) && v) return v;
    }
  }
  return '';
}

/** Map catalogue layout demo (+ optional live data) into AWB classic preview shape. */
export function layoutDemoToAwbPreview(
  layout: InvoiceFormatUiLayout,
  data: InvoiceFormatPdfData = {},
): Record<string, unknown> {
  const demo = layout.demo || {};
  const map = fieldMap(layout);
  const shipper = demo.partyLeft?.lines || [];
  const consignee = demo.partyMid?.lines || [];
  const agent = demo.partyNotify?.lines || [];
  const charge = (demo.chargeRows || [])[0] as
    | { desc?: string; qty?: string; rate?: string; amount?: string }
    | undefined;

  return {
    hawb_number: data.hawbNumber || findField(map, 'hawb no', 'hawb') || demo.invoiceNo || '',
    mawb_number: data.mawbNumber || findField(map, 'mawb no', 'mawb') || '',
    shipper_lines: data.shipperLines || shipper,
    consignee_lines: data.consigneeLines || consignee,
    notify_lines: agent,
    agent_at_origin: agent[0] || data.companyName || 'KingFisher Wings',
    origin_airport_code: data.originAirport || findField(map, 'airport of departure', 'origin') || '',
    dest_airport_code: data.destAirport || findField(map, 'airport of destination', 'dest') || '',
    flight_number: findField(map, 'flight') || '',
    flight_date: data.etd || demo.invoiceDate || '',
    freight_type: findField(map, 'accounting', 'freight') || 'PREPAID',
    pieces: data.pieces || charge?.qty || findField(map, 'pieces') || '',
    gross_weight: data.grossWeight || findField(map, 'gross') || '',
    chargeable_weight: data.chargeableWeight || findField(map, 'chargeable') || '',
    commodity: data.commodity || charge?.desc || findField(map, 'nature', 'goods') || '',
    currency_code: data.currencyCode || findField(map, 'currency') || 'USD',
    delivery_address: findField(map, 'handling') || '',
  };
}

/** Map catalogue layout demo into BL classic preview shape. */
export function layoutDemoToBlPreview(
  layout: InvoiceFormatUiLayout,
  data: InvoiceFormatPdfData = {},
): Record<string, unknown> {
  const demo = layout.demo || {};
  const map = fieldMap(layout);
  return {
    hbl_number:
      findField(map, 'hbl', 'bl no') || data.shipmentNumber || demo.invoiceNo || '',
    shipper_lines: data.shipperLines || demo.partyLeft?.lines || [],
    consignee_lines: data.consigneeLines || demo.partyMid?.lines || [],
    notify_lines: demo.partyNotify?.lines || [],
    pol: data.pol || findField(map, 'port of loading', 'pol') || '',
    pod: data.pod || findField(map, 'port of discharge', 'pod') || '',
    vessel: findField(map, 'vessel') || '',
    voyage: findField(map, 'voyage') || '',
    packages: data.pieces || findField(map, 'packages', 'pieces') || '',
    gross_weight: data.grossWeight || findField(map, 'gross') || '',
    measurement: data.volumeCbm || findField(map, 'measurement', 'cbm') || '',
    description: data.commodity || findField(map, 'description', 'goods') || '',
    freight_terms: findField(map, 'freight') || '',
  };
}

export async function generateClassicTransportCatalogPdf(
  code: string,
  layout: InvoiceFormatUiLayout,
  data: InvoiceFormatPdfData = {},
): Promise<Blob | null> {
  if (isClassicHawbCatalogCode(code)) {
    const kind = /^MAWB_/i.test(code) ? 'mawb' : 'hawb';
    const { blob } = await generateAwbDraftPdf({
      documentKind: kind,
      preview: layoutDemoToAwbPreview(layout, data),
      fileNameHint: layout.name || code,
    });
    return blob;
  }
  if (isClassicHblCatalogCode(code)) {
    const { blob } = await generateBlDraftPdf({
      preview: layoutDemoToBlPreview(layout, data),
      fileNameHint: layout.name || code,
    });
    return blob;
  }
  return null;
}
