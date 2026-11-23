/** Flow-engine invoice. Not one of the 399 verified absolute specs. */
export const INVOICE_FLOW_TAX_INVOICE_1 = 'INVOICE_FLOW_TAX_INVOICE_1';

export const INVOICE_FLOW_ENGINE = 'flow' as const;

export const INVOICE_FLOW_CATALOG_NAME = 'Tax Invoice (flow layout)';

export function isInvoiceFlowCode(code: string): boolean {
  return String(code || '').trim().toUpperCase() === INVOICE_FLOW_TAX_INVOICE_1;
}
