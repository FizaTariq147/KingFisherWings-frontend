/**
 * Core Fresa-parity pack shells (backend must implement + expose on GET /renderers).
 * One shell → many template codes. FE only binds keys that appear live.
 *
 * Aligned to registry `suggestedPackKey` histogram (852 codes) plus optional
 * original/final shells the BE implements but registry may still stamp as draft.
 *
 * Branding: every pack injects KingFisher / tenant logo (reportBranding.constants.ts).
 * Preserve: do not replace POST /invoices|quotations/:id/pdf or classic BL until sea.hbl_* QA’d.
 */

/** Phase 1 pipeline smoke packs (entity deep-link E2E). */
export const FRESA_PHASE1_PIPELINE_PACKS = [
  {
    key: 'sea.hbl_draft',
    family: 'sea_docs',
    sampleCodes: ['FG_HBL_HKG', 'HBL_DRAFT_REPORT_FORMAT_1'],
    context: 'job',
    fresaSampleHint: 'HBL Draft Report Format*',
  },
  {
    key: 'air.hawb_draft',
    family: 'air_docs',
    sampleCodes: ['HAWB_DRAFT_REPORT_FORMAT_1', 'HAWB_DRAFT_REPORT_FORMAT'],
    context: 'job',
    fresaSampleHint: 'HAWB Draft Report Format*',
  },
  {
    key: 'commercial.invoice_tax_india_1',
    family: 'commercial',
    sampleCodes: ['INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA'],
    context: 'invoice',
    fresaSampleHint: 'Invoice Report Format-1 Tax Invoice India',
    preserveDefaultInvoicePdf: true,
  },
] as const;

/** Sea / air document shells. */
export const FRESA_CORE_DOC_PACKS = [
  { key: 'sea.hbl_draft', family: 'sea_docs' },
  { key: 'sea.hbl_original', family: 'sea_docs' },
  { key: 'sea.arrival_notice', family: 'sea_docs' },
  { key: 'sea.cargo_manifest', family: 'sea_docs' },
  { key: 'sea.delivery_order', family: 'sea_docs' },
  { key: 'sea.booking_confirmation', family: 'sea_docs' },
  { key: 'sea.pre_alert', family: 'sea_docs' },
  { key: 'air.hawb_draft', family: 'air_docs' },
  { key: 'air.hawb_final', family: 'air_docs' },
  { key: 'air.mawb_draft', family: 'air_docs' },
  { key: 'air.arrival_notice', family: 'air_docs' },
  { key: 'air.delivery_order', family: 'air_docs' },
  { key: 'air.cargo_manifest', family: 'air_docs' },
  { key: 'quotation.shell', family: 'quotation' },
] as const;

/** Commercial / finance additive shells — never replace default invoice PDF. */
export const FRESA_COMMERCIAL_FINANCE_PACKS = [
  { key: 'commercial.invoice_tax_india_1', family: 'commercial', additive: true },
  { key: 'commercial.invoice_generic', family: 'commercial', additive: true },
  { key: 'commercial.invoice_shell', family: 'commercial', additive: true },
  { key: 'commercial.proforma', family: 'commercial', additive: true },
  { key: 'commercial.debit_note', family: 'commercial', additive: true },
  { key: 'commercial.credit_note', family: 'commercial', additive: true },
  { key: 'finance.gl_listing', family: 'finance', additive: true },
  { key: 'finance.journal_voucher', family: 'finance', additive: true },
  { key: 'finance.payment_voucher', family: 'finance', additive: true },
  { key: 'finance.receipt_voucher', family: 'finance', additive: true },
  { key: 'finance.outstanding_letter', family: 'finance', additive: true },
] as const;

/** MY REPORTS / ops list shell — XLSX preferred. */
export const FRESA_OPS_LIST_PACK = {
  key: 'ops.list_generic',
  family: 'ops_list',
  preferredFormats: ['XLSX', 'PDF', 'CSV'] as const,
  strategy: 'Shared list/table pack; column config per template code; real filter queries',
} as const;

/** WMS shells. */
export const FRESA_WMS_PACKS = [
  { key: 'wms.asn', family: 'wms', additive: true },
  { key: 'wms.asn_location', family: 'wms', additive: true },
  { key: 'wms.asn_summary', family: 'wms', additive: true },
  { key: 'wms.grn', family: 'wms', additive: true },
  { key: 'wms.gdo', family: 'wms', additive: true },
] as const;

/** All shells FE may bind when exposed on GET /reports/templates/renderers. */
export const FRESA_ALL_PACK_SHELLS = [
  FRESA_OPS_LIST_PACK.key,
  ...FRESA_CORE_DOC_PACKS.map((p) => p.key),
  ...FRESA_COMMERCIAL_FINANCE_PACKS.map((p) => p.key),
  ...FRESA_WMS_PACKS.map((p) => p.key),
] as const;

/** Union of registry-stamped pack keys (must stay in FRESA_ALL_PACK_SHELLS). */
export const FRESA_REGISTRY_PACK_KEYS = [
  'ops.list_generic',
  'wms.asn',
  'air.hawb_draft',
  'quotation.shell',
  'finance.gl_listing',
  'sea.hbl_draft',
  'sea.arrival_notice',
  'sea.booking_confirmation',
  'air.arrival_notice',
  'air.cargo_manifest',
  'sea.cargo_manifest',
  'commercial.credit_note',
  'commercial.debit_note',
  'air.delivery_order',
  'sea.delivery_order',
  'commercial.invoice_tax_india_1',
  'commercial.invoice_generic',
  'finance.journal_voucher',
  'commercial.proforma',
  'air.mawb_draft',
  'finance.outstanding_letter',
  'finance.payment_voucher',
  'sea.pre_alert',
  'finance.receipt_voucher',
  'wms.gdo',
  'wms.grn',
] as const;
