import { PURCHASE_INVOICE_API } from '@/features/purchaseInvoices/api/purchaseInvoice.api';

export const PAYMENT_PROOF_API = {
  acknowledge: (id: string) => `/payment-proofs/${encodeURIComponent(id)}/acknowledge`,
  approve: (id: string) => `/payment-proofs/${encodeURIComponent(id)}/approve`,
  reject: (id: string) => `/payment-proofs/${encodeURIComponent(id)}/reject`,
  staffInvoiceProofs: (invoiceId: string) =>
    `/invoices/${encodeURIComponent(invoiceId)}/payment-proofs`,
  /** Admin AP remittance proofs — GET/POST /purchase-invoices/{id}/payment-proofs */
  staffPurchaseInvoiceProofs: (invoiceId: string) =>
    PURCHASE_INVOICE_API.paymentProofs(invoiceId),
} as const;
