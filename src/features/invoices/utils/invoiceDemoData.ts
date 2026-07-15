import type { CreateInvoiceFormValues } from '../types/invoice.types';

/** Swagger `CreateInvoiceDto` — only documented fields. */
export function buildInvoiceDemoValues(refs: {
  partyId: string;
  currencyCode?: string;
  companyId?: string;
  branchId?: string;
  departmentId?: string;
}): CreateInvoiceFormValues {
  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + 30);

  const toDate = (d: Date) => d.toISOString().slice(0, 10);

  return {
    party_id: refs.partyId,
    ...(refs.companyId ? { company_id: refs.companyId } : {}),
    ...(refs.branchId ? { branch_id: refs.branchId } : {}),
    ...(refs.departmentId ? { department_id: refs.departmentId } : {}),
    currency_code: (refs.currencyCode || 'AED').toUpperCase().slice(0, 3),
    exchange_rate: 1,
    vat_rate: 5,
    invoice_date: toDate(today),
    due_date: toDate(due),
    lpo_number: 'LPO-DEMO-001',
    remarks: 'Demo customer invoice — ocean freight charges',
    internal_notes: 'Created via Demo data button',
    lines: [
      {
        description: 'Ocean Freight',
        quantity: 1,
        unit_price: 1500,
        is_taxable: true,
        sort_order: 0,
      },
      {
        description: 'THC / Handling',
        quantity: 1,
        unit_price: 250,
        is_taxable: true,
        sort_order: 1,
      },
    ],
  };
}
