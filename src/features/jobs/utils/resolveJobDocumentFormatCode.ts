/** Default FRESA / catalog template codes for job document format-payload lookups. */
const FORMAT_CODE_BY_KEY: Record<string, string> = {
  hawb: 'HAWB_DRAFT_REPORT_FORMAT_1',
  mawb: 'MAWB_DRAFT_REPORT_FORMAT_1',
  'hawb-draft-gated': 'HAWB_DRAFT_REPORT_FORMAT_1',
  'hawb-final-gated': 'HAWB_DRAFT_REPORT_FORMAT_1',
  hbl: 'HBL_DRAFT_REPORT_FORMAT_1',
  'hbl-er': 'HBL_DRAFT_REPORT_FORMAT_1',
  'hbl-draft': 'HBL_DRAFT_REPORT_FORMAT_1',
  'hbl-original': 'HBL_ORIGINAL_REPORT_FORMAT_1',
  mbl: 'MBL_DRAFT_REPORT_FORMAT_1',
  can: 'CARGO_ARRIVAL_NOTICE_REPORT_FORMAT_1',
  'pre-can': 'CARGO_ARRIVAL_NOTICE_REPORT_FORMAT_1',
  'can-gated': 'CARGO_ARRIVAL_NOTICE_REPORT_FORMAT_1',
  'pre-can-gated': 'CARGO_ARRIVAL_NOTICE_REPORT_FORMAT_1',
  'delivery-order': 'DELIVERY_ORDER_REPORT_FORMAT_1',
  'do-gated': 'DELIVERY_ORDER_REPORT_FORMAT_1',
  si: 'SHIPPING_INSTRUCTION_REPORT_FORMAT_1',
  'cargo-mf': 'CARGO_MANIFEST_REPORT_FORMAT_1',
  'freight-mf': 'FREIGHT_MANIFEST_REPORT_FORMAT_1',
  'pre-alert': 'PRE_ALERT_REPORT_FORMAT_1',
  'cc-entry-pack': 'CUSTOMS_ENTRY_PACK_REPORT_FORMAT_1',
  proforma: 'PROFORMA_INVOICE_REPORT_FORMAT_1',
  'job-card': 'JOB_CARD_REPORT_FORMAT_1',
  'job-pnl': 'JOB_PNL_REPORT_FORMAT_1',
};

function normalizeKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s_]+/g, '-');
}

/**
 * Resolve catalog `format` query for GET /jobs/:id/format-payload.
 * Falls back to uppercase document_type when no catalog default exists.
 */
export function resolveJobDocumentFormatCode(documentKey: string): string {
  const raw = String(documentKey || '').trim();
  if (!raw) return 'JOB_DOCUMENT_REPORT_FORMAT_1';

  const byKey = FORMAT_CODE_BY_KEY[normalizeKey(raw)] ?? FORMAT_CODE_BY_KEY[raw];
  if (byKey) return byKey;

  const upper = raw.toUpperCase().replace(/[\s-]+/g, '_');
  if (/^HAWB|^MAWB|^HBL|^MBL|^CAN|^DO_|DELIVERY|^CARGO|^FREIGHT|^JOB_/i.test(upper)) {
    return upper.includes('_REPORT_') ? upper : `${upper}_REPORT_FORMAT_1`;
  }

  return upper.includes('_REPORT_') ? upper : `${upper}_REPORT_FORMAT_1`;
}
