/**
 * Sync Accounts format catalog names into FRESA registry + add missing Receipt Vouchers.
 * Usage: node scripts/sync-accounts-format-catalog.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const CATALOG = [
  ['JOURNAL_VOUCHER_REPORT_FORMAT_1', 'Journal Voucher Report Format-1'],
  ['JOURNAL_VOUCHER_REPORT_FORMAT_2', 'Journal Voucher Report Format-2'],
  ['PAYMENT_VOUCHER_REPORT_FORMAT_1', 'Payment Voucher Report Format-1'],
  ['PAYMENT_VOUCHER_REPORT_FORMAT_2', 'Payment Voucher Report Format-2'],
  ['PAYMENT_VOUCHER_REPORT_FORMAT_3', 'Payment Voucher Report Format-3'],
  ['PAYMENT_VOUCHER_REPORT_FORMAT_4_VIETNAM', 'Payment Voucher Report Format-4 Vietnam'],
  ['PROFIT_AND_LOSS_REPORT_FORMAT_1_LANDSCAPE', 'Profit and Loss Report Format-1 Landscape'],
  ['PROFIT_AND_LOSS_REPORT_FORMAT_2_JASPER', 'Profit and Loss Report Format-2 Jasper'],
  ['PROFIT_AND_LOSS_REPORT_FORMAT_3_SUMMARY_PERIODWISE', 'Profit and Loss Report Format-3 Summary Periodwise'],
  ['RECEIPT_VOUCHER_REPORT_FORMAT_1', 'Receipt Voucher Report Format-1'],
  ['RECEIPT_VOUCHER_REPORT_FORMAT_2', 'Receipt Voucher Report Format-2'],
  ['TRIAL_BALANCE_REPORT_FORMAT_1_TRIAL_BALANCE_SUMMARY', 'Trial Balance Report Format-1 Trial Balance Summary'],
  ['TRIAL_BALANCE_REPORT_FORMAT_2_TRIAL_BALANCE_SUMMARY', 'Trial Balance Report Format-2 Trial Balance Summary'],
  ['TRIAL_BALANCE_REPORT_FORMAT_3_TRIAL_BALANCE_SUMMARY_BRANCHWISE', 'Trial Balance Report Format-3 Trial Balance Summary BranchWise'],
  ['TRIAL_BALANCE_REPORT_FORMAT_4_TRIAL_BALANCE_SUMMARY_EXTENDED', 'Trial Balance Report Format-4 Trial Balance Summary Extended'],
  ['TRIAL_BALANCE_REPORT_FORMAT_5_TRIAL_BALANCE_SUMMARY_EXTENDED', 'Trial Balance Report Format-5 Trial Balance Summary Extended'],
  ['TRIAL_BALANCE_REPORT_FORMAT_6_TRIAL_BALANCE_SUMMARY_EXTENDED_BRANCHWISE', 'Trial Balance Report Format-6 Trial Balance Summary Extended BranchWise'],
  ['OUTSTANDING_LETTER_REPORT_FORMAT_1_OUTSTANDING_LETTER', 'Outstanding Letter Report Format-1 Outstanding Letter'],
  ['OUTSTANDING_LETTER_REPORT_FORMAT_2_OUTSTANDING_LETTER_JASPER', 'Outstanding Letter Report Format-2 Outstanding Letter Jasper'],
  ['OUTSTANDING_LETTER_REPORT_FORMAT_3_OUTSTANDING_LETTER_WITH_AGING', 'Outstanding Letter Report Format-3 Outstanding Letter With Aging'],
  ['OUTSTANDING_LETTER_REPORT_FORMAT_4_OUTSTANDING_LETTER_WITH_BL_DETAILS', 'Outstanding Letter Report Format-4 Outstanding Letter With BL Details'],
  ['AP_AGING_SUMMARY_REPORT_FORMAT', 'AP Aging Summary Report Format'],
  ['AP_OUTSTANDING_STATEMENT_REPORT_FORMAT', 'AP Outstanding Statement Report Format'],
  ['GL_LISTING_SORT_BY_CUSTOMER_CODE_VOUCHER_REPORT_FORMAT', 'GL Listing Sort By Customer Code Voucher Report Format'],
  ['GL_REPORT_CURRENCY_WISE_VOUCHER_REPORT_FORMAT', 'GL Report Currency Wise Voucher Report Format'],
  ['GL_REPORT_VOUCHER_REPORT_FORMAT', 'GL Report Voucher Report Format'],
  ['STATEMENT_OF_ACCOUNTS_REPORT_FORMAT', 'Statement Of Accounts Report Format'],
];

const DEFAULT_PARAMS = [
  { name: 'from_date', label: 'From date', type: 'date', required: false },
  { name: 'to_date', label: 'To date', type: 'date', required: false },
  { name: 'branch_id', label: 'Branch', type: 'uuid', required: false },
];

const regPath = path.join(root, 'src/features/reports/data/fresaReportRegistry.json');
const registry = JSON.parse(fs.readFileSync(regPath, 'utf8'));
const byCode = new Map(registry.map((r) => [r.code, r]));

let updated = 0;
let added = 0;

for (const [code, name] of CATALOG) {
  const existing = byCode.get(code);
  if (existing) {
    if (existing.name !== name) {
      existing.name = name;
      existing.description = `${name} — Accounts format from Fresa sample-report-formats`;
      updated += 1;
    }
  } else {
    const row = {
      code,
      name,
      family: 'finance',
      contexts: ['gl', 'list'],
      formats: ['PDF', 'XLSX'],
      rolloutPhase: 5,
      gapStatus: 'partial_document_pdf',
      description: `${name} — Accounts format from Fresa sample-report-formats`,
      defaultParams: DEFAULT_PARAMS,
    };
    registry.push(row);
    byCode.set(code, row);
    added += 1;
  }
}

fs.writeFileSync(regPath, JSON.stringify(registry, null, 2) + '\n', 'utf8');
fs.writeFileSync(
  path.join(root, 'src/features/reports/data/fresaReportRegistry.generated.ts'),
  `import type { ReportTemplateMeta } from '../types/reportCatalog.types';\n\n` +
    `/** Auto-synced — includes Accounts formats from sample-report-formats */\n` +
    `export const FRESA_REPORT_REGISTRY: ReportTemplateMeta[] = ${JSON.stringify(registry, null, 2)} as ReportTemplateMeta[];\n`,
  'utf8',
);

console.log(`Accounts catalog: updated ${updated} names, added ${added} rows`);
