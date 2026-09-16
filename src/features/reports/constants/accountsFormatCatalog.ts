/**
 * Accounts / other formats from https://fresatechnologies.com/sample-report-formats/
 * Exact catalog names — layouts refined when sample PDF links are shared.
 */
export type AccountsFormatKind =
  | 'journal_voucher'
  | 'payment_voucher'
  | 'payment_voucher_vietnam'
  | 'profit_loss'
  | 'receipt_voucher'
  | 'trial_balance'
  | 'outstanding_letter'
  | 'ap_aging'
  | 'ar_aging'
  | 'ap_outstanding'
  | 'ar_job_not_invoice'
  | 'bank_cash_book'
  | 'purchase_invoice'
  | 'gl_listing'
  | 'gl_report'
  | 'statement_of_accounts';

export type AccountsFormatSpec = {
  code: string;
  name: string;
  kind: AccountsFormatKind;
  sortOrder: number;
};

export const ACCOUNTS_FORMAT_CATALOG: AccountsFormatSpec[] = [
  {
    code: 'JOURNAL_VOUCHER_REPORT_FORMAT_1',
    name: 'Journal Voucher Report Format-1',
    kind: 'journal_voucher',
    sortOrder: 1,
  },
  {
    code: 'JOURNAL_VOUCHER_REPORT_FORMAT_2',
    name: 'Journal Voucher Report Format-2',
    kind: 'journal_voucher',
    sortOrder: 2,
  },
  {
    code: 'PAYMENT_VOUCHER_REPORT_FORMAT_1',
    name: 'Payment Voucher Report Format-1',
    kind: 'payment_voucher',
    sortOrder: 3,
  },
  {
    code: 'PAYMENT_VOUCHER_REPORT_FORMAT_2',
    name: 'Payment Voucher Report Format-2',
    kind: 'payment_voucher',
    sortOrder: 4,
  },
  {
    code: 'PAYMENT_VOUCHER_REPORT_FORMAT_3',
    name: 'Payment Voucher Report Format-3',
    kind: 'payment_voucher',
    sortOrder: 5,
  },
  {
    code: 'PAYMENT_VOUCHER_REPORT_FORMAT_4_VIETNAM',
    name: 'Payment Voucher Report Format-4 Vietnam',
    kind: 'payment_voucher_vietnam',
    sortOrder: 6,
  },
  {
    code: 'PROFIT_AND_LOSS_REPORT_FORMAT_1_LANDSCAPE',
    name: 'Profit and Loss Report Format-1 Landscape',
    kind: 'profit_loss',
    sortOrder: 7,
  },
  {
    code: 'PROFIT_AND_LOSS_REPORT_FORMAT_2_JASPER',
    name: 'Profit and Loss Report Format-2 Jasper',
    kind: 'profit_loss',
    sortOrder: 8,
  },
  {
    code: 'PROFIT_AND_LOSS_REPORT_FORMAT_3_SUMMARY_PERIODWISE',
    name: 'Profit and Loss Report Format-3 Summary Periodwise',
    kind: 'profit_loss',
    sortOrder: 9,
  },
  {
    code: 'RECEIPT_VOUCHER_REPORT_FORMAT_1',
    name: 'Receipt Voucher Report Format-1',
    kind: 'receipt_voucher',
    sortOrder: 10,
  },
  {
    code: 'RECEIPT_VOUCHER_REPORT_FORMAT_2',
    name: 'Receipt Voucher Report Format-2',
    kind: 'receipt_voucher',
    sortOrder: 11,
  },
  {
    code: 'TRIAL_BALANCE_REPORT_FORMAT_1_TRIAL_BALANCE_SUMMARY',
    name: 'Trial Balance Report Format-1 Trial Balance Summary',
    kind: 'trial_balance',
    sortOrder: 12,
  },
  {
    code: 'TRIAL_BALANCE_REPORT_FORMAT_2_TRIAL_BALANCE_SUMMARY',
    name: 'Trial Balance Report Format-2 Trial Balance Summary',
    kind: 'trial_balance',
    sortOrder: 13,
  },
  {
    code: 'TRIAL_BALANCE_REPORT_FORMAT_3_TRIAL_BALANCE_SUMMARY_BRANCHWISE',
    name: 'Trial Balance Report Format-3 Trial Balance Summary BranchWise',
    kind: 'trial_balance',
    sortOrder: 14,
  },
  {
    code: 'TRIAL_BALANCE_REPORT_FORMAT_4_TRIAL_BALANCE_SUMMARY_EXTENDED',
    name: 'Trial Balance Report Format-4 Trial Balance Summary Extended',
    kind: 'trial_balance',
    sortOrder: 15,
  },
  {
    code: 'TRIAL_BALANCE_REPORT_FORMAT_5_TRIAL_BALANCE_SUMMARY_EXTENDED',
    name: 'Trial Balance Report Format-5 Trial Balance Summary Extended',
    kind: 'trial_balance',
    sortOrder: 16,
  },
  {
    code: 'TRIAL_BALANCE_REPORT_FORMAT_6_TRIAL_BALANCE_SUMMARY_EXTENDED_BRANCHWISE',
    name: 'Trial Balance Report Format-6 Trial Balance Summary Extended BranchWise',
    kind: 'trial_balance',
    sortOrder: 17,
  },
  {
    code: 'OUTSTANDING_LETTER_REPORT_FORMAT_1_OUTSTANDING_LETTER',
    name: 'Outstanding Letter Report Format-1 Outstanding Letter',
    kind: 'outstanding_letter',
    sortOrder: 18,
  },
  {
    code: 'OUTSTANDING_LETTER_REPORT_FORMAT_2_OUTSTANDING_LETTER_JASPER',
    name: 'Outstanding Letter Report Format-2 Outstanding Letter Jasper',
    kind: 'outstanding_letter',
    sortOrder: 19,
  },
  {
    code: 'OUTSTANDING_LETTER_REPORT_FORMAT_3_OUTSTANDING_LETTER_WITH_AGING',
    name: 'Outstanding Letter Report Format-3 Outstanding Letter With Aging',
    kind: 'outstanding_letter',
    sortOrder: 20,
  },
  {
    code: 'OUTSTANDING_LETTER_REPORT_FORMAT_4_OUTSTANDING_LETTER_WITH_BL_DETAILS',
    name: 'Outstanding Letter Report Format-4 Outstanding Letter With BL Details',
    kind: 'outstanding_letter',
    sortOrder: 21,
  },
  {
    code: 'OUTSTANDING_LETTER_REPORT_FORMAT_5_OUTSTANDING_LETTER_WITH_INVOICES',
    name: 'Outstanding Letter Report Format-5 Outstanding Letter With Invoices',
    kind: 'outstanding_letter',
    sortOrder: 22,
  },
  {
    code: 'AP_AGING_SUMMARY_REPORT_FORMAT',
    name: 'AP Aging Summary Report Format',
    kind: 'ap_aging',
    sortOrder: 23,
  },
  {
    code: 'AR_AGING_SUMMARY_REPORT_FORMAT',
    name: 'AR Aging Summary Report Format',
    kind: 'ar_aging',
    sortOrder: 24,
  },
  {
    code: 'AP_OUTSTANDING_STATEMENT_REPORT_FORMAT',
    name: 'AP Outstanding Statement Report Format',
    kind: 'ap_outstanding',
    sortOrder: 25,
  },
  {
    code: 'AR_JOB_NOT_INVOICE_REPORT_FORMAT',
    name: 'AR Job Not Invoice Report Format',
    kind: 'ar_job_not_invoice',
    sortOrder: 26,
  },
  {
    code: 'BANK_CASH_BOOK_SUMMARY_LIST_REPORT_FORMAT',
    name: 'Bank Cash Book Summary List Report Format',
    kind: 'bank_cash_book',
    sortOrder: 27,
  },
  {
    code: 'PURCHASE_INVOICE_REPORT_FORMAT_1',
    name: 'Purchase Invoice Report Format-1',
    kind: 'purchase_invoice',
    sortOrder: 28,
  },
  {
    code: 'PURCHASE_INVOICE_REPORT_FORMAT_2',
    name: 'Purchase Invoice Report Format-2',
    kind: 'purchase_invoice',
    sortOrder: 29,
  },
  {
    code: 'GL_LISTING_SORT_BY_CUSTOMER_CODE_VOUCHER_REPORT_FORMAT',
    name: 'GL Listing Sort By Customer Code Voucher Report Format',
    kind: 'gl_listing',
    sortOrder: 30,
  },
  {
    code: 'GL_REPORT_CURRENCY_WISE_VOUCHER_REPORT_FORMAT',
    name: 'GL Report Currency Wise Voucher Report Format',
    kind: 'gl_report',
    sortOrder: 31,
  },
  {
    code: 'GL_REPORT_VOUCHER_REPORT_FORMAT',
    name: 'GL Report Voucher Report Format',
    kind: 'gl_report',
    sortOrder: 32,
  },
  {
    code: 'STATEMENT_OF_ACCOUNTS_REPORT_FORMAT',
    name: 'Statement Of Accounts Report Format',
    kind: 'statement_of_accounts',
    sortOrder: 33,
  },
];

const byCode = new Map(
  ACCOUNTS_FORMAT_CATALOG.map((row) => [row.code.toUpperCase(), row]),
);

export function isAccountsFormatCode(code: string): boolean {
  return byCode.has(code.trim().toUpperCase());
}

export function getAccountsFormatSpec(code: string): AccountsFormatSpec | undefined {
  return byCode.get(code.trim().toUpperCase());
}

export function listAccountsFormats(): AccountsFormatSpec[] {
  return ACCOUNTS_FORMAT_CATALOG.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}

export function resolveAccountsFormatDisplayName(code: string, fallbackName: string): string {
  return getAccountsFormatSpec(code)?.name || fallbackName;
}

export function accountsFormatsMatchSearch(searchQuery: string): boolean {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return false;
  const tokens = q.split(/\s+/).filter(Boolean);
  const catalogHit = listAccountsFormats().some((row) => {
    const hay = `${row.name} ${row.code} ${row.kind} accounts voucher ledger gl`.toLowerCase();
    return tokens.every((token) => hay.includes(token));
  });
  if (catalogHit) return true;
  const genericHay = 'accounts voucher journal payment receipt trial balance aging ledger gl soa';
  return tokens.every(
    (token) =>
      genericHay.includes(token) ||
      token.includes('account') ||
      token.includes('voucher') ||
      token.includes('gl'),
  );
}
