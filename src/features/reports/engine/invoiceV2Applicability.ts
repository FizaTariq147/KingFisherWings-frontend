import applicability from '../../../../reports/invoice-v2-applicability.json';
import { invoiceV2SpecCodes } from './invoiceV2Codes';

export type InvoiceV2Applicability = {
  currency: string | null;
  country: string | null;
  taxRegime: string | null;
  taxMode: 'single' | 'split';
};

const TABLE = applicability as Record<string, InvoiceV2Applicability>;

export function invoiceV2Applicability(code: string): InvoiceV2Applicability | null {
  return TABLE[code] || null;
}

/** A code with no currency applies to every invoice. No currency on the invoice means nothing is marked off. */
export function invoiceV2Applies(code: string, currency?: string | null): boolean {
  if (!invoiceV2SpecCodes.has(code)) return true;
  const expected = TABLE[code]?.currency;
  if (!expected || !currency) return true;
  return expected.toUpperCase() === currency.toUpperCase();
}

export function invoiceV2ApplicabilityHint(code: string, currency?: string | null): string | null {
  if (!invoiceV2SpecCodes.has(code) || invoiceV2Applies(code, currency)) return null;
  return 'not applicable to this invoice';
}

export function invoiceV2ListRank(code: string, currency?: string | null): number {
  if (!invoiceV2SpecCodes.has(code)) return 2;
  return invoiceV2Applies(code, currency) ? 0 : 1;
}
