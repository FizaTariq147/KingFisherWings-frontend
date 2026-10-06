export const PAYMENT_PROOF_API = {
  acknowledge: (id: string) => `/payment-proofs/${encodeURIComponent(id)}/acknowledge`,
  approve: (id: string) => `/payment-proofs/${encodeURIComponent(id)}/approve`,
  reject: (id: string) => `/payment-proofs/${encodeURIComponent(id)}/reject`,
  staffInvoiceProofs: (invoiceId: string) =>
    `/invoices/${encodeURIComponent(invoiceId)}/payment-proofs`,
} as const;
