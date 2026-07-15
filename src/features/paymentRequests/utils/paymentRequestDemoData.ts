import type { CreatePaymentRequestFormValues } from '../types/paymentRequest.types';

/** Swagger `CreatePaymentRequestDto` — only documented fields. */
export function buildPaymentRequestDemoValues(refs: {
  partyId: string;
  currencyCode?: string;
  invoiceId?: string;
  jobId?: string;
}): CreatePaymentRequestFormValues {
  const due = new Date();
  due.setDate(due.getDate() + 14);
  return {
    party_id: refs.partyId,
    amount: 5000,
    currency_code: (refs.currencyCode || 'AED').toUpperCase().slice(0, 3),
    ...(refs.invoiceId ? { invoice_id: refs.invoiceId } : {}),
    ...(refs.jobId ? { job_id: refs.jobId } : {}),
    due_date: due.toISOString().slice(0, 10),
    remarks: 'Demo payment request for freight settlement',
  };
}
