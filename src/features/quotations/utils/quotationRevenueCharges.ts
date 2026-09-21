import { isUuid } from '@/lib/isUuid';
import type { CreateJobChargeDto } from '@/features/jobs/types/job.types';
import type { CreateInvoiceLineDto } from '@/features/invoices/types/invoice.types';
import type { QuotationLine } from '../types/quotation.types';

/** Revenue (sell) lines from a quotation — exclude cost lines. */
export function revenueQuotationLines(lines: QuotationLine[] | undefined): QuotationLine[] {
  if (!Array.isArray(lines) || lines.length === 0) return [];
  return lines.filter((line) => line.is_cost !== true);
}

export function quotationLinesToJobChargeDtos(
  lines: QuotationLine[] | undefined,
): CreateJobChargeDto[] {
  return revenueQuotationLines(lines)
    .filter((line) => line.charge_code_id && isUuid(line.charge_code_id))
    .map((line, index) => {
      const description = (
        line.description ||
        line.charge_code ||
        `Quotation charge ${index + 1}`
      ).slice(0, 300);
      const currency = (line.currency_code || 'AED').trim().toUpperCase().slice(0, 3) || 'AED';
      const quantity = Number(line.quantity);
      const unitPrice = Number(line.unit_price);
      return {
        charge_code_id: line.charge_code_id,
        description,
        unit_price: Number.isFinite(unitPrice) ? unitPrice : 0,
        currency_code: currency,
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
        ...(line.exchange_rate != null && Number.isFinite(Number(line.exchange_rate))
          ? { exchange_rate: Number(line.exchange_rate) }
          : {}),
        ...(line.tax_rate_id && isUuid(line.tax_rate_id) ? { tax_rate_id: line.tax_rate_id } : {}),
        is_cost: false,
        is_billable: true,
      };
    });
}

export function quotationLinesToInvoiceLineDtos(
  lines: QuotationLine[] | undefined,
): CreateInvoiceLineDto[] {
  return revenueQuotationLines(lines).map((line, index) => {
    const quantity = Number(line.quantity);
    const unitPrice = Number(line.unit_price);
    return {
      description: (
        line.description ||
        line.charge_code ||
        `Quotation charge ${index + 1}`
      ).slice(0, 300),
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      unit_price: Number.isFinite(unitPrice) ? unitPrice : 0,
      ...(line.charge_code_id && isUuid(line.charge_code_id)
        ? { charge_code_id: line.charge_code_id }
        : {}),
      ...(line.tax_rate_id && isUuid(line.tax_rate_id) ? { tax_rate_id: line.tax_rate_id } : {}),
      sort_order: line.sort_order ?? index,
    };
  });
}

/** True when invoice only has empty/placeholder lines (no real quotation amounts). */
export function invoiceNeedsQuotationCharges(lines: Array<{ description?: string; unit_price?: number; quantity?: number }> | undefined): boolean {
  if (!Array.isArray(lines) || lines.length === 0) return true;
  const meaningful = lines.filter((line) => {
    const price = Number(line.unit_price);
    const qty = Number(line.quantity);
    const desc = String(line.description ?? '').trim().toLowerCase();
    if (Number.isFinite(price) && price > 0) return true;
    if (Number.isFinite(qty) && qty > 0 && Number.isFinite(price) && price !== 0) return true;
    if (desc && !/^(air freight|freight|placeholder|charge|tbd)/i.test(desc)) return true;
    return false;
  });
  return meaningful.length === 0;
}
