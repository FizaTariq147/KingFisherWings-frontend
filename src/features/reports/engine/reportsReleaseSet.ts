/**
 * Phase-1 flow release set. Nothing here marks a code accepted.
 * Acceptance comes only from reports/status.json (built from signoff.csv).
 */
export const FLOW_RELEASE_CODES = [
  'INVOICE_FLOW_TAX_INVOICE_1',
  'QUOTATION_FLOW_1',
] as const;

export type FlowReleaseCode = (typeof FLOW_RELEASE_CODES)[number];

export function isFlowReleaseCode(code: string): boolean {
  return (FLOW_RELEASE_CODES as readonly string[]).includes(String(code || '').trim().toUpperCase());
}
