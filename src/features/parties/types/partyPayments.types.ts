/** GET /parties/:id/payments — RECEIPT (AR) or PAYMENT (AP) for the party. */
export type PartyPaymentDirection = 'RECEIPT' | 'PAYMENT' | string;

export interface PartyPaymentRow {
  id: string;
  direction?: PartyPaymentDirection;
  amount?: number;
  currency_code?: string;
  payment_date?: string;
  reference?: string;
  invoice_id?: string;
  invoice_number?: string;
  proof_id?: string;
  proof_url?: string;
  notes?: string;
  raw?: Record<string, unknown>;
}
