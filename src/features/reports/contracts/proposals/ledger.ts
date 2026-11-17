/**
 * Proposed Ledger bindings from the filtered label inventory.
 * Not wired into the report renderer.
 */
export interface LedgerContractProposal {
  /** total (133). Source: Invoice.total_amount. */
  total: string;
  /** credit (116). Source: VoucherLine.credit_amount. */
  credit: string;
  /** debit (115). Source: VoucherLine.debit_amount. */
  debit: string;
  /** job no (23). Source: Job.job_number. */
  number: string;
  /** account (19). Source: VoucherLine.account_name. */
  accountName: string;
  /** a c name (19). No source in the current data model. */
  a_c_name: string;
  /** gst rcm output a c (19). Source: Invoice.tax_total. */
  tax: string;
  /** asset total (12). No source in the current data model. */
  asset_total: string;
  /** expense total (12). No source in the current data model. */
  expense_total: string;
  /** liability total (12). No source in the current data model. */
  liability_total: string;
  /** income total (9). No source in the current data model. */
  income_total: string;
  /** trial balance (7). No source in the current data model. */
  trial_balance: string;
}
