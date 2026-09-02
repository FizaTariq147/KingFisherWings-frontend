export const PAYMENT_PROOF_API = {
  acknowledge: (id: string) => `/payment-proofs/${encodeURIComponent(id)}/acknowledge`,
  reject: (id: string) => `/payment-proofs/${encodeURIComponent(id)}/reject`,
  staffInvoiceProofs: (invoiceId: string) =>
    `/invoices/${encodeURIComponent(invoiceId)}/payment-proofs`,
} as const;
