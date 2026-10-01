export interface PublicPaySummary {
  token: string;
  invoiceId?: string;
  invoiceNumber?: string;
  status?: string;
  currencyCode?: string;
  totalAmount?: number;
  paidAmount?: number;
  outstandingAmount?: number;
  dueDate?: string;
  companyName?: string;
  allowPartialPayments?: boolean;
  raw: Record<string, unknown>;
}

export interface PublicPayCheckoutDto {
  amount?: number;
}

export interface PublicPayCheckoutResult {
  checkoutUrl: string;
  raw: Record<string, unknown>;
}
