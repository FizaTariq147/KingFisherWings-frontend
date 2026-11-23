/**
 * Configurable options for engine=flow invoice templates.
 *
 * To add a code that only differs by title or columns:
 *   1. Add an entry to FLOW_INVOICE_OPTIONS (keep tools/reports/invoice-flow-options.mjs in sync).
 *   2. Add the code to reports/invoice-v2-applicability.json and reports/invoice-v2-totals.json.
 *   3. Register the catalogue name via listFlowCatalogEntries / resolveAnyFormatUiLayout.
 * No new pdfmake layout file is required when only columns or title change.
 */
import { reportsFlowStagingCatalogAllowed } from '../engine/reportsFlowStaging';

export const FLOW_CHARGE_COLUMN_PRESETS = {
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
  simple: ['charges', 'qty', 'rate', 'currency', 'tax', 'total'],
} as const;

export type FlowChargeColumnPreset = keyof typeof FLOW_CHARGE_COLUMN_PRESETS;

export type FlowInvoiceOptions = {
  engine: 'flow';
  title: string;
  columns: FlowChargeColumnPreset | string[];
  showContainers: boolean;
  showBank: boolean;
  showTerms: boolean;
  /** auto = split when the record has SGST/CGST/IGST; else single Tax column. */
  taxMode: 'auto' | 'single' | 'split' | 'none';
  currency: string | null;
  catalogName: string;
  family?: 'commercial' | 'quotation';
  contexts?: Array<'invoice' | 'quotation'>;
  /**
   * When true, the code stays out of the catalogue unless soft gate AND
   * VITE_REPORTS_FLOW_STAGING are both on. Synthetic-only testing codes.
   */
  stagingOnly?: boolean;
};

export const FLOW_INVOICE_OPTIONS: Record<string, FlowInvoiceOptions> = {
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

export function isFlowInvoiceCode(code: string): boolean {
  const key = String(code || '').trim().toUpperCase();
  return (
    Boolean(FLOW_INVOICE_OPTIONS[key]) ||
    /^(INVOICE|QUOTATION|CREDIT_NOTE|DEBIT_NOTE)_FLOW_/i.test(key)
  );
}

export function flowInvoiceOptions(code: string): FlowInvoiceOptions | null {
  const key = String(code || '').trim().toUpperCase();
  return FLOW_INVOICE_OPTIONS[key] || null;
}

export function resolveChargeColumns(options: FlowInvoiceOptions | null | undefined): string[] {
  const columns = options?.columns;
  if (Array.isArray(columns)) return columns;
  if (typeof columns === 'string' && columns in FLOW_CHARGE_COLUMN_PRESETS) {
    return [...FLOW_CHARGE_COLUMN_PRESETS[columns as FlowChargeColumnPreset]];
  }
  return [...FLOW_CHARGE_COLUMN_PRESETS.format1];
}

export function listFlowCatalogEntries(): Array<{
  code: string;
  name: string;
  family: 'commercial' | 'quotation';
  contexts: Array<'invoice' | 'quotation'>;
  kind: string;
  stagingOnly?: boolean;
}> {
  const stagingAllowed = reportsFlowStagingCatalogAllowed();
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
