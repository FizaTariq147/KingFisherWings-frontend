/**
 * Catalog display names.
 * Formats 1–21 follow https://fresatechnologies.com/sample-report-formats/
 * Higher numbers are additional sample-PDF variants (kept; not removed).
 */
import { catalogRowsMatchSearch } from '../utils/reportCatalogSearch';

export const INVOICE_FORMAT_CATALOG_NAMES: Record<number, string> = {
  // Official Fresa sample-report-formats page
  1: 'Invoice Report Format-1 Tax Invoice India',
  2: 'Invoice Report Format-2 Tax Invoice India',
  3: 'Invoice Report Format-3 Summary Invoice',
  4: 'Invoice Report Format-4 Standard Tax Invoice',
  5: 'Invoice Report Format-5 Tax Invoice India',
  6: 'Invoice Report Format-6 Simple Invoice (India)',
  7: 'Invoice Report Format-7 Simple Invoice',
  8: 'Invoice Report Format-8 Standard Invoice Arabic',
  9: 'Invoice Report Format-9 Standard Invoice USA',
  10: 'Invoice Report Format-10 Standard Invoice',
  11: 'Invoice Report Format-11 Standard Invoice Land',
  12: 'Invoice Report Format-12 Standard Invoice Preprinted',
  13: 'Invoice Report Format-13 Standard Invoice USA',
  14: 'Invoice Report Format-14 Invoice',
  15: 'Invoice Report Format-15 Invoice FCY',
  16: 'Invoice Report Format-16 Standard Tax Invoice Preprinted',
  17: 'Invoice Report Format-17 Invoice Jasper',
  18: 'Invoice Report Format-18 Land Freight Transportation Invoice',
  19: 'Invoice Report Format-19 Debit Note Vietnam',
  20: 'Invoice Report Format-20 Tax Invoice India',
  21: 'Invoice Report Format-21 Warehouse Invoice',
  // Additional / legacy (sample PDF batches — functionality preserved)
  22: 'Invoice Report Format-22 Standard Tax Invoice Format-22',
  23: 'Invoice Report Format-23 Purchase Invoice',
  24: 'Invoice Report Format-24 Simple Invoice With OS',
  25: 'Invoice Report Format-25 Simple Invoice India With OS',
  26: 'Invoice Report Format-26 FG Simple Invoice',
  27: 'Invoice Report Format-27 Standard Invoice Tanzania',
  28: 'Invoice Report Format Singapore',
  29: 'Invoice Report Format Land Freight Transportation',
  30: 'Invoice Report Format Overseas Debit Note Format-2',
  34: 'Invoice Report Format-34 Standard Invoice Arabic',
  35: 'Invoice Report Format-35 Standard Invoice Arabic Format-1',
  36: 'Invoice Report Format-36 Standard Invoice Arabic Format-1 Alt',
  37: 'Invoice Report Format-37 Standard Invoice Arabic Oman',
  38: 'Invoice Report Format-38 Standard Invoice Arabic Format-2',
  39: 'Invoice Report Format-39 Standard Invoice Arabic Format-3',
  40: 'Invoice Report Format-40 Standard Invoice Arabic Format-4',
  41: 'Invoice Report Format-41 Standard Invoice Arabic Format-5',
  42: 'Invoice Report Format-42 Standard Invoice Arabic Format-7',
  43: 'Invoice Report Format-43 Standard Courier Invoice',
  44: 'Invoice Report Format-44 Standard Invoice FCY',
  45: 'Invoice Report Format-45 Standard Invoice FCY Format-2',
  46: 'Invoice Report Format-46 FG Standard Invoice FCY',
  47: 'Invoice Report Format-47 Standard Invoice Kampala',
  48: 'Invoice Report Format-48 Standard Invoice USA',
  49: 'Invoice Report Format-49 Standard Tax Invoice Format-16 Cum AN',
  50: 'Invoice Report Format-50 Standard Invoice Malaysia',
  51: 'Invoice Report Format-51 Standard Invoice USA Format-2',
  52: 'Invoice Report Format-52 Standard Tax Invoice',
  53: 'Invoice Report Format-53 Summary Invoice',
  54: 'Invoice Report Format-54 Tax Invoice India',
  55: 'Invoice Report Format-55 Tax Invoice India Reimbursement Bill',
  56: 'Invoice Report Format-56 FG Tax Invoice India',
  57: 'Invoice Report Format-57 FG Tax Invoice India Format-1',
  58: 'Invoice Report Format-58 Tax Invoice India Format-1',
  59: 'Invoice Report Format-59 Tax Invoice India Format-2',
  60: 'Invoice Report Format-60 FG Tax Invoice India Format-2',
  61: 'Invoice Report Format-61 FG Tax Invoice India Format-6',
  62: 'Invoice Report Format-62 FG Tax Invoice India Format-7',
  63: 'Invoice Report Format-63 FG Tax Invoice India Format-8',
  64: 'Invoice Report Format-64 FG Tax Invoice India Format-3',
  65: 'Invoice Report Format-65 FG Tax Invoice India Format-4',
  66: 'Invoice Report Format-66 FG Tax Invoice India Format-5',
  67: 'Invoice Report Format-67 FG Tax Invoice Malaysia',
  68: 'Invoice Report Format-68 FG Tax Invoice Singapore',
  69: 'Invoice Report Format-69 Warehouse Invoice',
  70: 'Invoice Report Format-70 Warehouse Invoice India Format',
  71: 'Invoice Report Format-71 Proforma Invoice All Charges',
  // Parked sample-PDF layouts displaced when restoring official 1–21
  72: 'Invoice Report Format-72 Standard Tax Invoice Format-13',
  73: 'Invoice Report Format-73 Standard Tax Invoice Format-14',
  74: 'Invoice Report Format-74 Standard Tax Invoice Format-15',
  75: 'Invoice Report Format-75 Standard Tax Invoice Format-16',
  76: 'Invoice Report Format-76 Standard Tax Invoice Format-17',
  77: 'Invoice Report Format-77 Standard Tax Invoice Format-18',
  78: 'Invoice Report Format-78 Standard Tax Invoice Format-19',
  79: 'Invoice Report Format-79 Standard Tax Invoice Format-20',
  80: 'Invoice Report Format-80 Standard Tax Invoice Format-21',
  81: 'Invoice Report Format-81 Standard Tax Invoice Format-22',
  82: 'Invoice Report Format-82 Standard Tax Invoice Format-5',
  83: 'Invoice Report Format-83 Standard Tax Invoice Format-6',
  84: 'Invoice Report Format-84 Standard Tax Invoice Format-9',
  85: 'Invoice Report Format-85 Standard Invoice Format-2',
};

export function parseInvoiceFormatNumber(code: string): number | undefined {
  const m = code.trim().toUpperCase().match(/^INVOICE_REPORT_FORMAT_(\d+)(?:_|$)/);
  if (!m) return undefined;
  return Number(m[1]);
}

export function getInvoiceFormatCatalogName(
  formatNumber: number,
  fallback?: string,
): string {
  return INVOICE_FORMAT_CATALOG_NAMES[formatNumber] || fallback || `Invoice Report Format-${formatNumber}`;
}

/** Prefer sample-PDF / official catalog name for invoice format codes. */
export function resolveInvoiceFormatDisplayName(code: string, fallbackName: string): string {
  const n = parseInvoiceFormatNumber(code);
  if (n == null) return fallbackName;
  return getInvoiceFormatCatalogName(n, fallbackName);
}

export function invoiceFormatsMatchSearch(searchQuery: string): boolean {
  return catalogRowsMatchSearch(
    Object.entries(INVOICE_FORMAT_CATALOG_NAMES).map(([num, name]) => ({
      name,
      code: `INVOICE_REPORT_FORMAT_${num}`,
      kind: 'invoice',
      formatNumber: Number(num),
    })),
    searchQuery,
  );
}
