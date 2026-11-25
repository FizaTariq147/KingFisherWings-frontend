/**
 * Configurable options for engine=flow invoice templates.
 *
 * To add a code that only differs by title or columns:
 *   1. Add an entry below (or in src/features/reports/flow/invoiceFlowOptions.ts).
 *   2. Add the same code to reports/invoice-v2-applicability.json and
 *      reports/invoice-v2-totals.json (flow totals profile).
 *   3. Register the catalogue name in resolveAnyFormatUiLayout (or the flow
 *      registry list). No new pdfmake template file is required.
 */

export const FLOW_CHARGE_COLUMN_PRESETS = {
  /** Format-1-like charge grid without forced GST split. */
  format1: [
    'charges',
    'sac',
    'qty',
    'rate',
    'currency',
    'exRate',
    'fcy',
    'taxable',
    'nonTax',
    'tax',
    'total',
  ],
  /** Narrow commercial grid. */
  simple: ['charges', 'qty', 'rate', 'currency', 'tax', 'total'],
};

/**
 * Soft gate + VITE_REPORTS_FLOW_STAGING for staging-only codes.
 * Mirrors src/features/reports/engine/reportsFlowStaging.ts
 */
export function reportsFlowStagingCatalogAllowed(env = process.env) {
  const gate = String(env.VITE_REPORTS_GATE || '').trim().toLowerCase();
  const soft = gate !== 'hard';
  const flag = String(env.VITE_REPORTS_FLOW_STAGING || '').trim();
  const staging = flag === '1' || flag.toLowerCase() === 'true';
  return soft && staging;
}

/** @type {Record<string, object>} */
export const FLOW_INVOICE_OPTIONS = {
  INVOICE_FLOW_TAX_INVOICE_1: {
    engine: 'flow',
    title: 'TAX INVOICE',
    columns: 'format1',
    showContainers: true,
    showBank: true,
    showTerms: true,
    taxMode: 'auto',
    currency: null,
    catalogName: 'Tax Invoice (flow layout)',
    family: 'commercial',
    contexts: ['invoice'],
  },
  QUOTATION_FLOW_1: {
    engine: 'flow',
    title: 'QUOTATION',
    columns: 'simple',
    showContainers: false,
    showBank: true,
    showTerms: true,
    taxMode: 'auto',
    currency: null,
    catalogName: 'Quotation (flow layout)',
    family: 'quotation',
    contexts: ['quotation'],
  },
  CREDIT_NOTE_FLOW_1: {
    engine: 'flow',
    title: 'CREDIT NOTE',
    columns: 'simple',
    showContainers: false,
    showBank: true,
    showTerms: true,
    taxMode: 'auto',
    currency: null,
    catalogName: 'staging only: no real records tested',
    family: 'commercial',
    contexts: ['invoice'],
    stagingOnly: true,
  },
  DEBIT_NOTE_FLOW_1: {
    engine: 'flow',
    title: 'DEBIT NOTE',
    columns: 'simple',
    showContainers: false,
    showBank: true,
    showTerms: true,
    taxMode: 'auto',
    currency: null,
    catalogName: 'staging only: no real records tested',
    family: 'commercial',
    contexts: ['invoice'],
    stagingOnly: true,
  },
};

export function isFlowInvoiceCode(code) {
  const key = String(code || '').trim().toUpperCase();
  return Boolean(FLOW_INVOICE_OPTIONS[key]) || /^(INVOICE|QUOTATION|CREDIT_NOTE|DEBIT_NOTE)_FLOW_/i.test(key);
}

export function flowInvoiceOptions(code) {
  const key = String(code || '').trim().toUpperCase();
  return FLOW_INVOICE_OPTIONS[key] || null;
}

export function resolveChargeColumns(options) {
  const columns = options?.columns;
  if (Array.isArray(columns)) return columns;
  if (typeof columns === 'string' && FLOW_CHARGE_COLUMN_PRESETS[columns]) {
    return FLOW_CHARGE_COLUMN_PRESETS[columns];
  }
  return FLOW_CHARGE_COLUMN_PRESETS.format1;
}

export function listFlowCatalogEntries(env = process.env) {
  const stagingAllowed = reportsFlowStagingCatalogAllowed(env);
  return Object.entries(FLOW_INVOICE_OPTIONS)
    .filter(([, options]) => !options.stagingOnly || stagingAllowed)
    .map(([code, options]) => ({
      code,
      name: options.catalogName,
      family: options.family || 'commercial',
      contexts: options.contexts || ['invoice'],
      kind: `flow_${code}`,
      stagingOnly: Boolean(options.stagingOnly),
    }));
}
