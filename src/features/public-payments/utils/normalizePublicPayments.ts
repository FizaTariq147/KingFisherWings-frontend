import {
  asRecord,
  pickBoolean,
  pickNumber,
  pickString,
  unwrapData,
} from '@/features/portal-shared/normalize';
import { extractCheckoutUrl } from '@/features/platform-billing/utils/billingApiHelpers';
import type { PublicPayCheckoutResult, PublicPaySummary } from '../types/publicPayments.types';

function withRaw<T extends object>(
  fields: T,
  raw: Record<string, unknown>,
): T & { raw: Record<string, unknown> } {
  return { ...fields, raw };
}

export function normalizePublicPaySummary(raw: unknown, token: string): PublicPaySummary {
  const root = asRecord(raw) ?? {};
  const r = asRecord(unwrapData(raw)) ?? root;
  const invoice = asRecord(r.invoice) ?? asRecord(r.platform_invoice) ?? {};

  return withRaw(
    {
      token,
      invoiceId:
        pickString(r.invoice_id, r.invoiceId, invoice.id, r.id) || undefined,
      invoiceNumber:
        pickString(
          r.invoice_number,
          r.invoiceNumber,
          r.number,
          invoice.number,
          invoice.invoice_number,
        ) || undefined,
      status: pickString(r.status, invoice.status, r.payment_status) || undefined,
      currencyCode:
        pickString(
          r.currency_code,
          r.currencyCode,
          invoice.currency_code,
          invoice.currencyCode,
        ) || undefined,
      totalAmount: pickNumber(
        r.total_amount,
        r.totalAmount,
        r.amount,
        invoice.total_amount,
        invoice.totalAmount,
      ),
      paidAmount: pickNumber(r.paid_amount, r.paidAmount, invoice.paid_amount),
      outstandingAmount: pickNumber(
        r.outstanding_amount,
        r.outstandingAmount,
        r.balance_due,
        r.balanceDue,
        r.amount_due,
        invoice.outstanding_amount,
      ),
      dueDate: pickString(r.due_date, r.dueDate, invoice.due_date) || undefined,
      companyName:
        pickString(
          r.company_name,
          r.companyName,
          r.tenant_name,
          r.tenantName,
          r.business_name,
        ) || undefined,
      allowPartialPayments: pickBoolean(
        r.allow_partial_payments ?? r.allowPartialPayments ?? r.partial_payments_allowed,
      ),
    },
    r,
  );
}

export function normalizePublicPayCheckout(raw: unknown): PublicPayCheckoutResult {
  const record = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  return {
    raw: record,
    checkoutUrl: extractCheckoutUrl(raw),
  };
}
