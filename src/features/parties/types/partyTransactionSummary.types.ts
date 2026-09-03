export interface PartyTransactionItem {
  id?: string;
  reference?: string;
  status?: string;
  date?: string;
  amount?: number;
}

export interface PartyTransactionBucket {
  count: number;
  amount?: number;
  items: PartyTransactionItem[];
}

export interface PartyTransactionSummary {
  available: boolean;
  party_id?: string;
  party_name?: string;
  currency_code?: string;
  quotes: PartyTransactionBucket;
  jobs: PartyTransactionBucket;
  invoices: PartyTransactionBucket;
  payments: PartyTransactionBucket;
  open_balance?: number;
}

export interface SendPartyTransactionSummaryDto {
  emails?: string[];
  message?: string;
}

export interface SendPartyTransactionSummaryResult {
  sent: boolean;
  message?: string;
}
