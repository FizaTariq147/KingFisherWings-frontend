import applicability from '../../../../reports/invoice-v2-applicability.json';
import totalsProfile from '../../../../reports/invoice-v2-totals.json';
import { isInvoiceFlowCode } from '../flow/invoiceFlowCode';
import { invoiceV2SpecCodes } from './invoiceV2Codes';

/** Codes that participate in arithmetic suitability (v2 specs + flow template). */
function suitabilityTracked(code: string): boolean {
  return invoiceV2SpecCodes.has(code) || isInvoiceFlowCode(code);
}

export type InvoiceV2Applicability = {
  currency: string | null;
  country: string | null;
  taxRegime: string | null;
  taxMode: 'single' | 'split';
};

export type InvoiceTotalsProfile = {
  subtotal: boolean;
  tax: boolean;
  discount: boolean;
  rounding: boolean;
  total: boolean;
  /** A per-line tax column, not an SGST/CGST/IGST split. */
  lineTax?: boolean;
};

export const INVOICE_V2_TAX_NOTE = 'suitable for arithmetic, tax not shown';

export type InvoiceFitLine = {
  quantity?: number | null;
  unit_price?: number | null;
  tax_amount?: number | null;
  line_total?: number | null;
};

/** Currency string, or the invoice amounts the catalogue already loaded. */
export type InvoiceFitInput =
  | string
  | null
  | {
      currency?: string | null;
      currency_code?: string | null;
      subtotal?: number | null;
      tax_total?: number | null;
      tax_amount?: number | string | null;
      total_amount?: number | null;
      discount?: number | null;
      rounding?: number | null;
      lines?: InvoiceFitLine[] | null;
    };

const TABLE = applicability as Record<string, InvoiceV2Applicability>;
const TOTALS = totalsProfile as Record<string, InvoiceTotalsProfile>;
const EMPTY_PROFILE: InvoiceTotalsProfile = {
  subtotal: false,
  tax: false,
  discount: false,
  rounding: false,
  total: false,
};

export function invoiceV2Applicability(code: string): InvoiceV2Applicability | null {
  return TABLE[code] || null;
}

export function invoiceV2TotalsProfile(code: string): InvoiceTotalsProfile {
  return TOTALS[code] || EMPTY_PROFILE;
}

/** A tax row or a single per-line tax column. SGST/CGST/IGST columns do not count. */
export function invoicePrintsTaxFigure(code: string): boolean {
  const profile = invoiceV2TotalsProfile(code);
  return profile.tax || profile.lineTax === true;
}

function num(value: unknown): number {
  if (value == null || value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function close(left: number, right: number): boolean {
  return Math.abs(Math.round(left * 100) - Math.round(right * 100)) <= 1;
}

function asFit(input?: InvoiceFitInput) {
  if (typeof input === 'string' || input == null) {
    return { currency: input ?? null, amounts: false as const };
  }
  return { currency: input.currency_code || input.currency || null, amounts: true as const, invoice: input };
}

function lineAmount(line: InvoiceFitLine): number {
  if (line.line_total != null && Number.isFinite(Number(line.line_total))) return Number(line.line_total);
  return num(line.quantity) * num(line.unit_price) + num(line.tax_amount);
}

function recordHasTax(invoice: Exclude<InvoiceFitInput, string | null>, lines: InvoiceFitLine[]): boolean {
  if (invoice.tax_total != null && Math.abs(num(invoice.tax_total)) > 0.009) return true;
  if (invoice.tax_amount != null && invoice.tax_amount !== '' && Math.abs(num(invoice.tax_amount)) > 0.009) return true;
  return lines.some((line) => Math.abs(num(line.tax_amount)) > 0.009);
}

function taxOwed(invoice: Exclude<InvoiceFitInput, string | null>, lines: InvoiceFitLine[]): number {
  if (invoice.tax_total != null) return num(invoice.tax_total);
  if (invoice.tax_amount != null && invoice.tax_amount !== '') return num(invoice.tax_amount);
  return lines.reduce((sum, line) => sum + num(line.tax_amount), 0);
}

export type InvoiceSuitability = { suitable: boolean; reason: string | null };

/**
 * A layout is suitable when the rows it prints add up.
 * Printed lines, plus a tax row when the spec has one, minus a discount row
 * when the spec has one, must equal the printed total. A printed subtotal
 * has to reach that total the same way. No row is added to a layout.
 */
export function invoiceV2Suitability(code: string, input?: InvoiceFitInput): InvoiceSuitability {
  if (!suitabilityTracked(code)) return { suitable: true, reason: null };
  const fit = asFit(input);
  if (!fit.amounts) return { suitable: true, reason: null };
  const profile = invoiceV2TotalsProfile(code);
  if (!profile.total) return { suitable: false, reason: 'this layout does not print a total' };
  const invoice = fit.invoice;
  if (invoice.total_amount == null) return { suitable: false, reason: 'the total is not on the invoice' };

  const lines = invoice.lines || [];
  const lineSum = lines.reduce((sum, line) => sum + lineAmount(line), 0);
  const tax = taxOwed(invoice, lines);
  const discount = num(invoice.discount);
  const rounding = num(invoice.rounding);
  const total = num(invoice.total_amount);
  const taxShown = profile.tax ? (invoice.tax_total == null ? 0 : num(invoice.tax_total)) : 0;
  const discountShown = profile.discount ? discount : 0;
  const roundingShown = profile.rounding ? rounding : 0;
  const subtotal = invoice.subtotal == null ? lineSum : num(invoice.subtotal);
  const base = profile.subtotal ? subtotal : lineSum;
  const printed = base + taxShown - discountShown + roundingShown;
  const linesPrinted = lineSum + taxShown - discountShown + roundingShown;
  if (close(printed, total) && close(linesPrinted, total)) return { suitable: true, reason: null };

  if (!profile.tax && Math.abs(tax) > 0.009 && close(base + tax - discountShown + roundingShown, total)) {
    return { suitable: false, reason: 'the tax is not printed' };
  }
  if (!profile.discount && Math.abs(discount) > 0.009 && close(base + taxShown - discount + roundingShown, total)) {
    return { suitable: false, reason: 'the discount is not printed' };
  }
  if (!profile.rounding && Math.abs(rounding) > 0.009 && close(base + taxShown - discountShown + rounding, total)) {
    return { suitable: false, reason: 'the rounding is not printed' };
  }
  if (profile.subtotal) return { suitable: false, reason: 'the subtotal does not add up to the total' };
  return { suitable: false, reason: 'the lines do not add up to the total' };
}

/** A code with no currency applies to every invoice. No currency on the invoice means nothing is marked off. */
export function invoiceV2Applies(code: string, input?: InvoiceFitInput): boolean {
  if (!suitabilityTracked(code)) return true;
  const expected = TABLE[code]?.currency;
  const currency = asFit(input).currency;
  if (!expected || !currency) return true;
  return expected.toUpperCase() === currency.toUpperCase();
}

/**
 * Shown when the printed rows already add up, the invoice has tax, and this
 * layout prints no tax figure. The code stays suitable and stays openable.
 */
export function invoiceV2TaxVisibilityNote(code: string, input?: InvoiceFitInput): string | null {
  if (!suitabilityTracked(code)) return null;
  const fit = asFit(input);
  if (!fit.amounts) return null;
  if (!invoiceV2Suitability(code, input).suitable) return null;
  if (!recordHasTax(fit.invoice, fit.invoice.lines || [])) return null;
  if (invoicePrintsTaxFigure(code)) return null;
  return INVOICE_V2_TAX_NOTE;
}

export function invoiceV2ApplicabilityHint(code: string, input?: InvoiceFitInput): string | null {
  if (!suitabilityTracked(code)) return null;
  const suitability = invoiceV2Suitability(code, input);
  if (!suitability.suitable && suitability.reason) return `not suitable for this invoice: ${suitability.reason}`;
  if (!invoiceV2Applies(code, input)) return 'not applicable to this invoice';
  return invoiceV2TaxVisibilityNote(code, input);
}

export function invoiceV2ListRank(code: string, input?: InvoiceFitInput): number {
  if (isInvoiceFlowCode(code)) {
    const suitability = invoiceV2Suitability(code, input);
    return invoiceV2Applies(code, input) && suitability.suitable ? -1 : 1;
  }
  if (!invoiceV2SpecCodes.has(code)) return 2;
  const suitability = invoiceV2Suitability(code, input);
  return invoiceV2Applies(code, input) && suitability.suitable ? 0 : 1;
}
