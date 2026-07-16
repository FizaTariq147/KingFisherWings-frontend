import type { CreatePurchaseInvoiceFormValues } from '../types/purchaseInvoice.types';

/** Swagger `CreatePurchaseInvoiceDto` — only documented fields. */
export function buildPurchaseInvoiceDemoValues(refs: {
  partyId: string;
  currencyCode?: string;
  companyId?: string;
  branchId?: string;
  departmentId?: string;
}): CreatePurchaseInvoiceFormValues {
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
    lpo_number: 'LPO-PI-DEMO-001',
    remarks: 'Demo purchase invoice — vendor freight charges',
    internal_notes: 'Created via Demo data button',
    lines: [
      {
        description: 'Vendor Ocean Freight',
        quantity: 1,
        unit_price: 1200,
        is_taxable: true,
        sort_order: 0,
      },
      {
        description: 'Terminal Handling',
        quantity: 1,
        unit_price: 180,
        is_taxable: true,
        sort_order: 1,
      },
    ],
  };
}
