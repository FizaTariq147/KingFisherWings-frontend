/**
 * Default FRESA / catalog template codes for job document layout PDF + format-payload.
 * Codes must exist in *FormatUiLayouts.json (or classic BL path for FG_HBL_HKG).
 */
const FORMAT_CODE_BY_KEY: Record<string, string> = {
  hawb: 'HAWB_DRAFT_REPORT_FORMAT_1',
  mawb: 'MAWB_DRAFT_REPORT_FORMAT_1',
  'hawb-draft-gated': 'HAWB_DRAFT_REPORT_FORMAT_1',
  'hawb-final-gated': 'HAWB_DRAFT_REPORT_FORMAT_1',
  hbl: 'FG_HBL_HKG',
  'hbl-er': 'FG_HBL_HKG',
  'hbl-draft': 'FG_HBL_HKG',
  'bl-draft': 'FG_HBL_HKG',
  'hbl-original': 'FG_HBL_ORIGINAL_FORMAT_87',
  mbl: 'MBL_DRAFT_REPORT_FORMAT_1',
  can: 'CARGO_ARRIVAL_NOTICE_REPORT_FORMAT_1',
  'pre-can': 'CARGO_ARRIVAL_NOTICE_REPORT_FORMAT_1',
  'can-gated': 'CARGO_ARRIVAL_NOTICE_REPORT_FORMAT_1',
  'pre-can-gated': 'CARGO_ARRIVAL_NOTICE_REPORT_FORMAT_1',
  'delivery-order': 'DELIVERY_ORDER_REPORT_FORMAT_1',
  'do-gated': 'DELIVERY_ORDER_REPORT_FORMAT_1',
  do: 'DELIVERY_ORDER_REPORT_FORMAT_1',
  si: 'SHIPPING_INSTRUCTION_REPORT_FORMAT_1',
  'cargo-mf': 'CARGO_MANIFEST_REPORT_FORMAT_1',
  'freight-mf': 'FREIGHT_MANIFEST_REPORT_FORMAT_1',
  'pre-alert': 'PRE_ALERT_REPORT_FORMAT_1',
  'cc-entry-pack': 'CUSTOMS_ENTRY_PACK_REPORT_FORMAT_1',
  proforma: 'PROFORMA_INVOICE_REPORT_FORMAT_1',
  'job-card': 'JOB_CARD_REPORT_FORMAT_1',
  'job-pnl': 'JOB_PNL_REPORT_FORMAT_1',
};

/** Document keys that prefer the classic FG HBL HKG React form over JSON layout. */
export const CLASSIC_BL_DRAFT_DOCUMENT_KEYS = new Set([
  'hbl',
  'hbl-er',
  'hbl-draft',
  'bl-draft',
]);

/** Critical job docs that should try catalog/classic layout PDF before BE chrome stamp. */
export const CATALOG_LAYOUT_JOB_DOCUMENT_KEYS = new Set([
  ...CLASSIC_BL_DRAFT_DOCUMENT_KEYS,
  'hbl-original',
  'hawb',
  'hawb-draft-gated',
  'hawb-final-gated',
  'can',
  'pre-can',
  'can-gated',
  'pre-can-gated',
  'delivery-order',
  'do-gated',
  'do',
]);

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
