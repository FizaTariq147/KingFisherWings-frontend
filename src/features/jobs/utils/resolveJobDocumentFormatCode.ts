/**
 * Default FRESA / catalog template codes for job document layout PDF + format-payload.
 * Codes must exist in *FormatUiLayouts.json (or classic BL path for FG_HBL_HKG).
 */
const FORMAT_CODE_BY_KEY: Record<string, string> = {
  hawb: 'HAWB_DRAFT_REPORT_FORMAT_1',
  /** Catalog layouts use MAWB_DRAFT_REPORT_FORMAT (no `_1` entry). */
  mawb: 'MAWB_DRAFT_REPORT_FORMAT',
  'hawb-draft-gated': 'HAWB_DRAFT_REPORT_FORMAT_1',
  'hawb-final-gated': 'HAWB_DRAFT_REPORT_FORMAT_1',
  'e-awb': 'HAWB_DRAFT_REPORT_FORMAT_1',
  hbl: 'FG_HBL_HKG',
  'hbl-er': 'FG_HBL_HKG',
  'hbl-draft': 'FG_HBL_HKG',
  'bl-draft': 'FG_HBL_HKG',
  'hbl-original': 'FG_HBL_ORIGINAL_FORMAT_87',
  can: 'CARGO_ARRIVAL_NOTICE_REPORT_FORMAT_1',
  'pre-can': 'CARGO_ARRIVAL_NOTICE_REPORT_FORMAT_1',
  'can-gated': 'CARGO_ARRIVAL_NOTICE_REPORT_FORMAT_1',
  'pre-can-gated': 'CARGO_ARRIVAL_NOTICE_REPORT_FORMAT_1',
  'delivery-order': 'DELIVERY_ORDER_REPORT_FORMAT_1',
  'do-gated': 'DELIVERY_ORDER_REPORT_FORMAT_1',
  do: 'DELIVERY_ORDER_REPORT_FORMAT_1',
  /** Layout code has no `_1` suffix. */
  si: 'SHIPPING_INSTRUCTION_REPORT_FORMAT',
  'cargo-mf': 'CARGO_MANIFEST_REPORT_FORMAT',
  /** Closest registered freight-manifest layout. */
  'freight-mf': 'FREIGHT_MANIFEST_LCL_EXPORTS_REPORT_FORMAT',
  'pre-alert': 'PRE_ALERT_REPORT_FORMAT_1',
  /** First plain proforma layout (no `_1` alone; `_3` is first numbered plain). */
  proforma: 'PROFORMA_INVOICE_REPORT_FORMAT_3',
  'job-card': 'JOB_CARD_REPORT_FORMAT',
};

/** Document keys that prefer the classic FG HBL HKG React form over JSON layout. */
export const CLASSIC_BL_DRAFT_DOCUMENT_KEYS = new Set([
  'hbl',
  'hbl-er',
  'hbl-draft',
  'bl-draft',
]);

/** Document keys that merge air booking-form into HAWB/MAWB catalog layouts. */
export const AWB_CATALOG_DOCUMENT_KEYS = new Set([
  'hawb',
  'mawb',
  'hawb-draft-gated',
  'hawb-final-gated',
  'e-awb',
]);

/** Critical job docs that should try catalog/classic layout PDF before BE chrome stamp. */
export const CATALOG_LAYOUT_JOB_DOCUMENT_KEYS = new Set([
  ...CLASSIC_BL_DRAFT_DOCUMENT_KEYS,
  'hbl-original',
  ...AWB_CATALOG_DOCUMENT_KEYS,
  'can',
  'pre-can',
  'can-gated',
  'pre-can-gated',
  'delivery-order',
  'do-gated',
  'do',
  'si',
  'cargo-mf',
  'freight-mf',
  'pre-alert',
  'proforma',
  'job-card',
]);

function normalizeKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s_]+/g, '-');
}

/**
 * Resolve catalog `format` query for GET /jobs/:id/format-payload.
 * Only returns known layout-backed defaults; otherwise a normalized uppercase key
 * (no invented `_REPORT_FORMAT_1` suffixes for unmapped docs).
 */
export function resolveJobDocumentFormatCode(documentKey: string): string {
  const raw = String(documentKey || '').trim();
  if (!raw) return 'JOB_CARD_REPORT_FORMAT';

  const byKey = FORMAT_CODE_BY_KEY[normalizeKey(raw)] ?? FORMAT_CODE_BY_KEY[raw];
  if (byKey) return byKey;

  return raw.toUpperCase().replace(/[\s-]+/g, '_');
}
