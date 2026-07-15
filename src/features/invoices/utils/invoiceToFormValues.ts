import type { CreateInvoiceFormValues } from '../types/invoice.types';
import type { Invoice } from '../types/invoice.types';

export function invoiceToFormValues(inv: Invoice): CreateInvoiceFormValues {
  return {
    party_id: inv.party_id,
    company_id: inv.company_id || undefined,
    job_id: inv.job_id || undefined,
    branch_id: inv.branch_id || undefined,
    department_id: inv.department_id || undefined,
    currency_code: inv.currency_code || 'AED',
    exchange_rate: inv.exchange_rate ?? 1,
    vat_rate: inv.vat_rate ?? 5,
    invoice_date: inv.invoice_date || undefined,
    due_date: inv.due_date || undefined,
    lpo_number: inv.lpo_number || undefined,
    remarks: inv.remarks || undefined,
    internal_notes: inv.internal_notes || undefined,
  };
}

export const INVOICE_FORM_DEFAULTS: CreateInvoiceFormValues = {
  party_id: '',
  currency_code: 'AED',
  exchange_rate: 1,
  vat_rate: 5,
  lines: [],
};
