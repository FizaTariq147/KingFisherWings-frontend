/** Flow-engine invoice. Not one of the 399 verified absolute specs. */
import {
  FLOW_INVOICE_OPTIONS,
  isFlowInvoiceCode,
  listFlowCatalogEntries,
} from './invoiceFlowOptions';

export const INVOICE_FLOW_TAX_INVOICE_1 = 'INVOICE_FLOW_TAX_INVOICE_1';

export const INVOICE_FLOW_ENGINE = 'flow' as const;

export const INVOICE_FLOW_CATALOG_NAME =
  FLOW_INVOICE_OPTIONS[INVOICE_FLOW_TAX_INVOICE_1]?.catalogName || 'Tax Invoice (flow layout)';

export function isInvoiceFlowCode(code: string): boolean {
  return isFlowInvoiceCode(code);
}

export { listFlowCatalogEntries, FLOW_INVOICE_OPTIONS, isFlowInvoiceCode };
