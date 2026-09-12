/**
 * FRESA exact PDF parity — backend pack priority (handoff for kingfisherwings-backend).
 *
 * Exact sample-report layouts are NOT implemented in this frontend.
 * Backend owns Puppeteer HTML/CSS packs; FE only binds keys from
 * GET /reports/templates/renderers and generates via PdfReadyModal.
 *
 * Registry counts (local taxonomy): ops_list 110, sea_docs 134, air_docs 75,
 * commercial 99, finance 91, wms 58, quotation 18, other 22 (~607 total).
 *
 * Raise ACTIVE_REPORT_ROLLOUT_PHASE in reportRollout.constants.ts as packs ship.
 */
export const FRESA_PDF_PACK_PRIORITY = [
  {
    phase: 1,
    family: 'ops_list',
    label: 'Ops lists',
    suggestedPackPrefix: 'ops.',
    examples: [
      'Daily Status Report',
      'Pending Jobs / Delivered Jobs',
      'Manifest / nomination lists',
    ],
    strategy:
      'Shared list/table pack with column config per template code; reuse one HTML shell.',
  },
  {
    phase: 2,
    family: 'sea_docs',
    label: 'Sea documents',
    suggestedPackPrefix: 'sea.',
    examples: ['HBL Draft/Original variants', 'Arrival Notice SEA', 'Cargo Manifest / FCR'],
    strategy:
      'One HBL shell + variants; one Arrival Notice shell; bind many HBL-* codes to same pack.',
  },
  {
    phase: 3,
    family: 'air_docs',
    label: 'Air documents',
    suggestedPackPrefix: 'ops.', // or air. if BE expands pattern beyond ops|sea
    examples: ['HAWB / MAWB Draft', 'Air Arrival Notice', 'Air Cargo Manifest'],
    strategy: 'HAWB/MAWB family shells; map FRESA air codes onto shared packs.',
  },
  {
    phase: 4,
    family: 'commercial',
    label: 'Commercial / invoices',
    suggestedPackPrefix: 'commercial.',
    examples: [
      'Invoice Report Format-1 Tax Invoice India',
      'Invoice Report Format-N',
      'Proforma',
    ],
    strategy:
      'Shared InvoiceFormatPayload + one Puppeteer pack per FRESA layout. Do not replace POST /invoices/:id/pdf. Start with commercial.invoice_tax_india_1.',
  },
  {
    phase: 5,
    family: 'finance',
    label: 'Finance & GL',
    suggestedPackPrefix: 'ops.',
    examples: ['AR/AP Aging', 'Statement of Accounts', 'Trial Balance', 'Outstanding Letter'],
    strategy: 'Statement/aging table packs; align with existing GL analytics where possible.',
  },
  {
    phase: 6,
    family: 'wms',
    label: 'WMS',
    suggestedPackPrefix: 'ops.',
    examples: ['ASN', 'Warehouse invoice / notes'],
    strategy: 'Warehouse document shells after core freight packs.',
  },
] as const;

/** Mapping rule for imported inactive templates until a real pack exists. */
export const FRESA_PENDING_RENDERER_PATTERN = 'pending.{CODE}' as const;

/**
 * First commercial invoice pack (FRESA Tax Invoice India).
 * Sample: https://fresatechnologies.com/wp-content/uploads/report-formats/invoice-report-format-1-tax-invoice-india.pdf
 * Backend: implement Puppeteer pack, expose on GET /renderers, bind template code.
 */
export const FRESA_INVOICE_FORMAT_1 = {
  code: 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
  name: 'Invoice Report Format-1 Tax Invoice India',
  family: 'commercial',
  context: 'invoice',
  /** Suggested renderer_key for GET /reports/templates/renderers */
  packKey: 'commercial.invoice_tax_india_1',
  samplePdfUrl:
    'https://fresatechnologies.com/wp-content/uploads/report-formats/invoice-report-format-1-tax-invoice-india.pdf',
} as const;

/** Catalog deep-link helpers for invoice detail → FRESA formats. */
export function buildInvoiceFresaCatalogPath(invoiceId: string, opts?: { code?: string }): string {
  const params = new URLSearchParams({
    context: 'invoice',
    invoice_id: invoiceId,
    family: 'commercial',
  });
  const code = opts?.code ?? FRESA_INVOICE_FORMAT_1.code;
  if (code) params.set('code', code);
  return `/reports/catalog?${params.toString()}`;
}
