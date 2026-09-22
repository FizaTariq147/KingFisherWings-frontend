/**
 * Exact sample-driven layouts for all Accounts catalog formats
 * (JV/PV/P&L/RV/TB/OL/AP/GL/SOA) matched to Fresa sample PDFs.
 * Usage: node scripts/build-accounts-format-ui-layouts.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const BRAND = {
  company: 'KingFisher Logistic',
  address: 'Dubai, United Arab Emirates',
  web: 'www.kingfisherwingsgroup.com',
  phone: '+971 55 5355 286',
  email: 'info@kingfisherwingsgroup.com',
  logo: 'kingfisher',
};

const THEME = {
  primary: '#0A2942',
  accent: '#0A2942',
  fill: '#F3F3F3',
  panel: '#EBF0F4',
  orange: '#F7A21C',
  red: '#DE1F26',
  cyan: '#0A2942',
  ink: '#101010',
  gray: '#656565',
  white: '#FFFFFF',
};

const CATALOG = [
  ['JOURNAL_VOUCHER_REPORT_FORMAT_1', 'Journal Voucher Report Format-1', 'journal_voucher_1', 1],
  ['JOURNAL_VOUCHER_REPORT_FORMAT_2', 'Journal Voucher Report Format-2', 'journal_voucher_2', 2],
  ['PAYMENT_VOUCHER_REPORT_FORMAT_1', 'Payment Voucher Report Format-1', 'payment_voucher_1', 1],
  ['PAYMENT_VOUCHER_REPORT_FORMAT_2', 'Payment Voucher Report Format-2', 'payment_voucher_2', 2],
  ['PAYMENT_VOUCHER_REPORT_FORMAT_3', 'Payment Voucher Report Format-3', 'payment_voucher_3', 3],
  ['PAYMENT_VOUCHER_REPORT_FORMAT_4_VIETNAM', 'Payment Voucher Report Format-4 Vietnam', 'payment_voucher_vietnam', 4],
  ['PROFIT_AND_LOSS_REPORT_FORMAT_1_LANDSCAPE', 'Profit and Loss Report Format-1 Landscape', 'profit_loss_landscape', 1],
  ['PROFIT_AND_LOSS_REPORT_FORMAT_2_JASPER', 'Profit and Loss Report Format-2 Jasper', 'profit_loss_jasper', 2],
  ['PROFIT_AND_LOSS_REPORT_FORMAT_3_SUMMARY_PERIODWISE', 'Profit and Loss Report Format-3 Summary Periodwise', 'profit_loss_periodwise', 3],
  ['RECEIPT_VOUCHER_REPORT_FORMAT_1', 'Receipt Voucher Report Format-1', 'receipt_voucher_1', 1],
  ['RECEIPT_VOUCHER_REPORT_FORMAT_2', 'Receipt Voucher Report Format-2', 'receipt_voucher_2', 2],
  ['TRIAL_BALANCE_REPORT_FORMAT_1_TRIAL_BALANCE_SUMMARY', 'Trial Balance Report Format-1 Trial Balance Summary', 'trial_balance_1', 1],
  ['TRIAL_BALANCE_REPORT_FORMAT_2_TRIAL_BALANCE_SUMMARY', 'Trial Balance Report Format-2 Trial Balance Summary', 'trial_balance_2', 2],
  ['TRIAL_BALANCE_REPORT_FORMAT_3_TRIAL_BALANCE_SUMMARY_BRANCHWISE', 'Trial Balance Report Format-3 Trial Balance Summary BranchWise', 'trial_balance_3_branch', 3],
  ['TRIAL_BALANCE_REPORT_FORMAT_4_TRIAL_BALANCE_SUMMARY_EXTENDED', 'Trial Balance Report Format-4 Trial Balance Summary Extended', 'trial_balance_4_ext', 4],
  ['TRIAL_BALANCE_REPORT_FORMAT_5_TRIAL_BALANCE_SUMMARY_EXTENDED', 'Trial Balance Report Format-5 Trial Balance Summary Extended', 'trial_balance_5_ext', 5],
  ['TRIAL_BALANCE_REPORT_FORMAT_6_TRIAL_BALANCE_SUMMARY_EXTENDED_BRANCHWISE', 'Trial Balance Report Format-6 Trial Balance Summary Extended BranchWise', 'trial_balance_6_ext_branch', 6],
  ['OUTSTANDING_LETTER_REPORT_FORMAT_1_OUTSTANDING_LETTER', 'Outstanding Letter Report Format-1 Outstanding Letter', 'outstanding_1', 1],
  ['OUTSTANDING_LETTER_REPORT_FORMAT_2_OUTSTANDING_LETTER_JASPER', 'Outstanding Letter Report Format-2 Outstanding Letter Jasper', 'outstanding_2_jasper', 2],
  ['OUTSTANDING_LETTER_REPORT_FORMAT_3_OUTSTANDING_LETTER_WITH_AGING', 'Outstanding Letter Report Format-3 Outstanding Letter With Aging', 'outstanding_3_aging', 3],
  ['OUTSTANDING_LETTER_REPORT_FORMAT_4_OUTSTANDING_LETTER_WITH_BL_DETAILS', 'Outstanding Letter Report Format-4 Outstanding Letter With BL Details', 'outstanding_4_bl', 4],
  ['OUTSTANDING_LETTER_REPORT_FORMAT_5_OUTSTANDING_LETTER_WITH_INVOICES', 'Outstanding Letter Report Format-5 Outstanding Letter With Invoices', 'outstanding_5_invoices', 5],
  ['AP_AGING_SUMMARY_REPORT_FORMAT', 'AP Aging Summary Report Format', 'ap_aging', 1],
  ['AR_AGING_SUMMARY_REPORT_FORMAT', 'AR Aging Summary Report Format', 'ar_aging', 1],
  ['AP_OUTSTANDING_STATEMENT_REPORT_FORMAT', 'AP Outstanding Statement Report Format', 'ap_outstanding', 1],
  ['AR_JOB_NOT_INVOICE_REPORT_FORMAT', 'AR Job Not Invoice Report Format', 'ar_job_not_invoice', 1],
  ['BANK_CASH_BOOK_SUMMARY_LIST_REPORT_FORMAT', 'Bank Cash Book Summary List Report Format', 'bank_cash_book', 1],
  ['PURCHASE_INVOICE_REPORT_FORMAT_1', 'Purchase Invoice Report Format-1', 'purchase_invoice_1', 1],
  ['PURCHASE_INVOICE_REPORT_FORMAT_2', 'Purchase Invoice Report Format-2', 'purchase_invoice_2', 2],
  ['GL_LISTING_SORT_BY_CUSTOMER_CODE_VOUCHER_REPORT_FORMAT', 'GL Listing Sort By Customer Code Voucher Report Format', 'gl_listing', 1],
  ['GL_REPORT_CURRENCY_WISE_VOUCHER_REPORT_FORMAT', 'GL Report Currency Wise Voucher Report Format', 'gl_currency', 1],
  ['GL_REPORT_VOUCHER_REPORT_FORMAT', 'GL Report Voucher Report Format', 'gl_report', 1],
  ['STATEMENT_OF_ACCOUNTS_REPORT_FORMAT', 'Statement Of Accounts Report Format', 'soa', 1],
];

const JV_ROWS = [
  [
    'SUNDRYDEBTORS-SUNDRY DEBTORS-4G LOGISTICS INDIA PVT LTD',
    'B/EXP/19/0251 MBL NO. MBLC9878909999 / HBL NO. PLMAAJEA00080 / JOB NO.CEXP190148',
    'INR',
    '1.00000',
    '17,384.00',
    '',
    '17,384.00',
  ],
  ['1040.10.10-SEA FREIGHT FCL REVENUE', 'FREIGHT CHARGE', 'USD', '70.00000', '', '7,000.00', '100.00'],
  ['1040.10.10-SEA FREIGHT FCL REVENUE', 'TERMINAL HANDLING CHARGES 20"GP', 'INR', '1.00000', '', '5,500.00', '5,500.00'],
  ['1040.10.10-SEA FREIGHT FCL REVENUE', 'SEAL FEE', 'INR', '1.00000', '', '300.00', '300.00'],
  ['1040.10.10-SEA FREIGHT FCL REVENUE', 'BILL OF LADING', 'INR', '1.00000', '', '3,000.00', '3,000.00'],
  ['GST0003-SGST SALE A/C', 'SGST 9%', 'INR', '1.00000', '', '792.00', '792.00'],
  ['CGST0003-CGST SALE A/C', 'CGST 9%', 'INR', '1.00000', '', '792.00', '792.00'],
];

const JV_ROWS_F2 = [
  [
    'SUNDRYDEBTORS-SUNDRY DEBTORS-4G LOGISTICS INDIA PVT LTD',
    'B/EXP/19/0251 MBL NO. MBLC9878909999 / HBL NO. PLMAAJEA00080 / JOB NO.CEXP190148',
    'INR',
    '17,384.00',
    '1.00000',
    '17,384.00',
    '',
  ],
  ['1040.10.10-SEA FREIGHT FCL REVENUE', 'FREIGHT CHARGE', 'USD', '100.00', '70.00000', '', '7,000.00'],
  ['1040.10.10-SEA FREIGHT FCL REVENUE', 'TERMINAL HANDLING CHARGES 20"GP', 'INR', '5,500.00', '1.00000', '', '5,500.00'],
  ['1040.10.10-SEA FREIGHT FCL REVENUE', 'SEAL FEE', 'INR', '300.00', '1.00000', '', '300.00'],
  ['1040.10.10-SEA FREIGHT FCL REVENUE', 'BILL OF LADING', 'INR', '3,000.00', '1.00000', '', '3,000.00'],
  ['GST0003-SGST SALE A/C', 'SGST 9%', 'INR', '792.00', '1.00000', '', '792.00'],
  ['CGST0003-CGST SALE A/C', 'CGST 9%', 'INR', '792.00', '1.00000', '', '792.00'],
];

function layout(partial) {
  return {
    paper: partial.paper || 'A4',
    rtl: false,
    theme: THEME,
    branding: BRAND,
    demo: partial.demo,
    blocks: partial.blocks,
  };
}

const TERMS = [
  '1. This is a computer generated document and does not require a signature.',
];
const BANK = [
  'Beneficiary Name: KingFisher Logistic',
  'Bank : HDFC',
  'A/c No : XXXXXXXXXXX',
  'IBAN No : XXXXXXXXXXX',
  'Swift Code : XXXXXX',
  'Address : Dubai, United Arab Emirates',
];

const OL_PARTY = {
  title: 'To',
  lines: [
    '4G LOGISTICS INDIA PVT LTD',
    '10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD NUNGAMBAKKAM',
    'CHENNAI TAMILNADU 600084',
  ],
};

const OL_LETTER =
  'Please find here below the details of your outstanding invoices as of today. (10-Feb-19) Requesting you to settle the same at the earliest, your outstanding past due balance is (INR 2,191.80), as details on the statement of outstanding given below.';

const OL_AGING_HEADERS = ['Total O/S', '< 30', '30 - 60', '60 - 90', '90 - 120', '120 - 150', '150 - 180', '180+'];
const OL_AGING_ROW = ['2,191.80', '37,788.00', '0.00', '1,000.00', '-36,596.20', '', '', ''];

const OL_BANK = [
  'KINDLY ISSUE CHEQUE IN FAVOUR OF KingFisher Logistic OR PLEASE USE OUR FOLLOWING BANK DETAILS TO DO TT OR BANK TRANSFER',
  'BENEFICIARY NAME : KingFisher Logistic',
  'BANK NAME : YOUR BANK NAME',
  'A/C NO : XXXXXXXXXXXXX',
  'IBAN NO : XXXXXXXXXXXXX',
  'SWIFT CODE : XXXXXXXXXXXXX',
  'THANKS & REGARDS',
  'FINANCE - ACCOUNTS RECEIVABLE',
];

const KINDS = {
  /** journal-voucher-report-format-1.pdf */
  journal_voucher_1: () =>
    layout({
      demo: {
        invoiceNo: 'MAAINV1900717',
        currency: 'INR',
        total: '17,384.00',
        words: 'Total balanced',
        totalLabel: 'Total :',
        remarks: '1X20: SHIPMENT TO JEBEL ALI - CMA CGM - PO NO. 9877777 DATE: 17/01/2019',
        metaRows: [
          { k: 'Voucher No', v: 'MAAINV1900717' },
          { k: 'GL Date', v: '28-JAN-19' },
          { k: 'Branch', v: 'CHENNAI' },
          { k: 'Account', v: '4G LOGISTICS INDIA PVT LTD' },
        ],
        fieldGrid: [
          {
            k: 'Narration',
            v: 'B/EXP/19/0251 MBL NO. MBLC9878909999 / HBL NO. PLMAAJEA00080 / JOB NO.CEXP190148',
          },
          { k: 'Remarks', v: '1X20: SHIPMENT TO JEBEL ALI - CMA CGM - PO NO. 9877777 DATE: 17/01/2019' },
        ],
        tableHeaders: ['A/c Name', 'Narration', 'Currency', 'Ex.Rate', 'Dr Amount', 'Cr Amount', 'FCY Amount'],
        tableRows: JV_ROWS,
        signatureLabels: ['Prepared By', 'Checked By', 'Approved By'],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: 'JOURNAL VOUCHER', align: 'center' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'signatureRow' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** journal-voucher-report-format-2.pdf */
  journal_voucher_2: () =>
    layout({
      demo: {
        invoiceNo: 'MAAINV1900717',
        currency: 'INR',
        total: '17,384.00',
        words: 'Total 17,384.00 / 17,384.00',
        totalLabel: 'Total',
        billToLabel: 'Organization',
        billToName: '4G LOGISTICS INDIA PVT LTD',
        billToAddress: '—',
        metaRows: [
          { k: 'Voucher No', v: 'MAAINV1900717 (INVOICE)' },
          { k: 'GL Date', v: '28-JAN-19 (CREATED)' },
        ],
        fieldGrid: [
          {
            k: 'Narration',
            v: 'B/EXP/19/0251 MBL NO. MBLC9878909999 / HBL NO. PLMAAJEA00080 / JOB NO.CEXP190148',
          },
          { k: 'Remarks', v: '1X20: SHIPMENT TO JEBEL ALI - CMA CGM - PO NO. 9877777 DATE: 17/01/2019' },
        ],
        tableHeaders: ['A/C Name', 'Narration', 'Currency', 'FCY Amount', 'Ex.Rate', 'Dr Amount', 'Cr Amount'],
        tableRows: JV_ROWS_F2,
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'JOURNAL VOUCHER - MAAINV1900717', align: 'center' },
        { type: 'twoColumn', showBillTo: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** payment-voucher-report-format-1.pdf — BANK PAYMENT */
  payment_voucher_1: () =>
    layout({
      demo: {
        invoiceNo: 'MAABP1900066',
        currency: 'INR',
        total: '3,480.00',
        words: 'Rupee Three Thousand Four Hundred Eighty Only',
        billToLabel: 'Paid To',
        billToName: 'CMA CGM',
        billToAddress: 'Phone : N/A',
        metaRows: [
          { k: 'Payment No', v: 'MAABP1900066' },
          { k: 'GL Date', v: '28-JAN-19' },
          { k: 'Paid From', v: 'HDFC BANK' },
          { k: 'Type', v: 'CHEQUE' },
          { k: 'Ref', v: '987777 / 29-JAN-19' },
          { k: 'Job No', v: 'CEXP190148' },
        ],
        fieldGrid: [
          { k: 'Client', v: '4G LOGISTICS INDIA PVT LTD' },
          { k: 'Reference No./ Date', v: 'MAABP19000667 / 22-JAN-19' },
          { k: 'Narration', v: 'DUBAI SHIPMENT' },
        ],
        tableHeaders: ['Description', 'Shipment/Job No', 'Amount'],
        tableRows: [
          ['SEA FREIGHT FCL COST AGENCY FEES', 'B/EXP/19/0251 / CEXP190148', '3,000.00'],
          ['IGST COST A/C I/U GST 18%', '—', '540.00'],
          ['TDS PAYABLE TDS PAYABLES 2%', '—', '-60.00'],
        ],
        signatureLabels: ['Accountant', 'Checked by', "Receiver's Signature"],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'BANK PAYMENT - MAABP1900066', align: 'center' },
        { type: 'twoColumn', showBillTo: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'signatureRow' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** payment-voucher-report-format-2.pdf */
  payment_voucher_2: () =>
    layout({
      demo: {
        invoiceNo: 'MAABP1900066',
        currency: 'INR',
        total: '3,540.00',
        words: 'Rupee Three Thousand Five Hundred Forty Only INR',
        billToLabel: 'Paid To',
        billToName: 'CMA CGM',
        billToAddress: '—',
        metaRows: [
          { k: 'Payment No', v: 'MAABP1900066' },
          { k: 'Date', v: '28-JAN-19 (APPROVED)' },
          { k: 'GL Date', v: '28-JAN-19' },
          { k: 'Type', v: 'CHEQUE' },
          { k: 'Ref', v: '987777 / 29-JAN-19' },
          { k: 'Paid From', v: 'HDFC BANK - INR' },
          { k: 'Job No.', v: 'CEXP190148' },
        ],
        fieldGrid: [
          { k: 'Narration', v: 'DUBAI SHIPMENT B/EXP/19/0251' },
          { k: 'Reference No.', v: 'MAABP19000667 / 22-JAN-19' },
          { k: 'Remarks', v: 'MAABP19000667 / 22-JAN-19' },
        ],
        tableHeaders: ['No.', 'A/C Name', 'Job No', 'Shipment No', 'Amount INR'],
        tableRows: [
          ['10', 'SEA FREIGHT FCL COST AGENCY FEES', 'CEXP190148', 'B/EXP/19/0251', '3,000.00'],
          ['20', 'IGST COST A/C I/U GST 18%', '—', '—', '540.00'],
        ],
        signatureLabels: ['Accountant', 'Checked by', "Receiver's Signature"],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: 'PAYMENT VOUCHER', align: 'center' },
        { type: 'twoColumn', showBillTo: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'signatureRow' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** payment-voucher-report-format-3.pdf */
  payment_voucher_3: () =>
    layout({
      demo: {
        invoiceNo: 'MAABP1900066',
        currency: 'INR',
        total: '3,480.00',
        words: 'Rupee Three Thousand Four Hundred Eighty Only',
        billToLabel: 'Paid To',
        billToName: 'CMA CGM',
        billToAddress: 'Phone : N/A',
        metaRows: [
          { k: 'Payment No', v: 'MAABP1900066' },
          { k: 'Date', v: '28-JAN-19 (CREATED)' },
          { k: 'GL Date', v: '28-JAN-19' },
          { k: 'Paid From', v: 'HDFC BANK' },
          { k: 'Type', v: 'CHEQUE' },
          { k: 'Ref', v: '987777 / 29-JAN-19' },
        ],
        fieldGrid: [
          { k: 'Job No', v: 'CEXP190148' },
          { k: 'Client', v: '4G LOGISTICS INDIA PVT LTD' },
          { k: 'Reference No./ Date', v: 'MAABP19000667 / 22-JAN-19' },
          { k: 'Narration', v: 'DUBAI SHIPMENT' },
        ],
        tableHeaders: ['Description', 'Shipment/Job No', 'Local Amount'],
        tableRows: [
          ['SEA FREIGHT FCL COST AGENCY FEES', 'B/EXP/19/0251 / CEXP190148', '3,000.00'],
          ['IGST COST A/C I/U GST 18%', '—', '540.00'],
          ['TDS PAYABLE TDS PAYABLES 2%', '—', '-60.00'],
        ],
        // Against voucher strip (empty in sample — show headers)
        osTableHeaders: ['Against V.No', 'Date', 'EF_NO', 'Description', 'Dr/Cr', 'Curr', 'FCY Amount', 'Amount'],
        osTableRows: [['—', '—', '—', '—', '—', '—', '—', '—']],
        signatureLabels: ['Accountant', 'Checked by', "Receiver's Signature"],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'BANK PAYMENT - MAABP1900066', align: 'center' },
        { type: 'twoColumn', showBillTo: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'outstandingTable' },
        { type: 'signatureRow' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** payment-voucher-report-format-4-vietnam.pdf — PHIẾU CHI */
  payment_voucher_vietnam: () =>
    layout({
      demo: {
        invoiceNo: 'MAABP1900066',
        currency: 'INR',
        total: '3,480.00',
        words: 'RUPEE Ba ngàn không trăm lẻ Bốn trăm lẻ Tám đồng',
        billToLabel: 'Họ và tên người nhận tiền / Receiver',
        billToName: 'CMA CGM',
        billToAddress: 'Address : — · Phone : N/A',
        officeAddressLines: [
          'KingFisher Logistic — Vietnam Branch',
          'Floor 5 demo address, Ho Chi Minh City, Vietnam',
          'Tax code: 0314921971',
          'Form No.: 02-TT (Circular 200/2014/TT-BTC)',
        ],
        metaRows: [
          { k: 'Ngày / Date', v: '28-JAN-2019' },
          { k: 'Liên số / Copy No.', v: '1' },
          { k: 'Quyển sổ / Book No.', v: 'PC01/2018' },
          { k: 'Số phiếu / Voucher No.', v: 'MAABP1900066' },
          { k: 'Nợ / Debit', v: '3540' },
          { k: 'Có / Credit', v: '60' },
        ],
        fieldGrid: [
          { k: 'Lý do chi / Description', v: 'DUBAI SHIPMENT' },
          { k: 'Job No.', v: 'CEXP190148' },
          { k: 'Shipment No.', v: 'B/EXP/19/0251' },
          { k: 'Số tiền / Amount', v: '3,480.00' },
          { k: 'Bằng chữ / In words', v: 'RUPEE Ba ngàn không trăm lẻ Bốn trăm lẻ Tám đồng' },
          { k: 'Kèm theo / Enclose', v: '0 original voucher(s): MAABP19000667 / 22-JAN-19' },
        ],
        tableHeaders: ['Khoản mục / Item', 'Job / Shipment', 'Số tiền / Amount'],
        tableRows: [
          ['SEA FREIGHT FCL COST AGENCY FEES', 'B/EXP/19/0251 / CEXP190148', '3,000.00'],
          ['IGST COST A/C I/U GST 18%', '—', '540.00'],
          ['TDS PAYABLE TDS PAYABLES 2%', '—', '-60.00'],
        ],
        signatureLabels: [
          'GIÁM ĐỐC / DIRECTOR',
          'KẾ TOÁN TRƯỞNG / CHIEF ACCOUNTANT',
          'NGƯỜI NHẬN TIỀN / RECEIVER',
          'NGƯỜI LẬP PHIẾU / PREPARED BY',
          'THỦ QUỸ / CASHIER',
        ],
        termsLines: [
          'Đã nhận đủ số tiền (viết bằng chữ) / Received full (in words): ................................',
        ],
      },
      blocks: [
        { type: 'companyHeader' },
        { type: 'officeAddressBand' },
        { type: 'docTitle', text: 'PHIẾU CHI / PAYMENT', align: 'center' },
        { type: 'twoColumn', showBillTo: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'signatureRow' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** profit-and-loss-report-format-1-landscape.pdf */
  profit_loss_landscape: () =>
    layout({
      paper: 'A4',
      demo: {
        invoiceNo: 'P&L-2018',
        currency: 'INR',
        total: '7,319,162.24',
        words: 'NET AMOUNT : 7,319,162.24',
        totalLabel: 'NET AMOUNT :',
        metaRows: [
          { k: 'Period', v: '01-Jan-18 - 31-Dec-18' },
          { k: 'Report', v: 'PROFIT AND LOSS AS ON' },
        ],
        fieldGrid: [
          { k: 'INCOME TOTAL', v: '10,372,639.74' },
          { k: 'EXPENSE TOTAL', v: '(3,053,477.50)' },
        ],
        tableHeaders: ['Particulars', 'Income Amount', 'Expense Amount'],
        tableRows: [
          ['DIRECT INCOME', '', ''],
          ['AIR EXPORT CLEARANCE', '10,600.00', ''],
          ['AIR FREIGHT CHGS- REVENUE', '2,139,880.00', ''],
          ['AIR IMPORT CLEARANCE', '1,000.00', ''],
          ['SEA FREIGHT FCL REVENUE', '7,260,619.04', ''],
          ['SEA FREIGHT GROUPAGE REVENUE', '960,540.70', ''],
          ['DIRECT INCOME TOTAL', '10,372,639.74', ''],
          ['DIRECT EXPENSES', '', ''],
          ['AIR FREIGHT CHGS COST', '', '(536,353.00)'],
          ['DOCUMENTATION CHGS', '', '10,950.00'],
          ['HANDLING CHARGES', '', '2,500.00'],
          ['SEA FREIGHT FCL COST', '', '(1,565,137.00)'],
          ['SEA FREIGHT GROUPAGE COST', '', '(961,680.00)'],
          ['DIRECT EXPENSES TOTAL', '', '(3,049,720.00)'],
          ['INDIRECT EXPENSES', '', ''],
          ['EXCHANGE GAIN/LOSS', '', '(2,757.50)'],
          ['OFFICE EXPENSE', '', '(1,000.00)'],
          ['INDIRECT EXPENSES TOTAL', '', '(3,757.50)'],
        ],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'PROFIT AND LOSS AS ON ( 01-Jan-18 - 31-Dec-18 )', align: 'center' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'wordsAndTotal' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** profit-and-loss-report-format-2-jasper.pdf */
  profit_loss_jasper: () =>
    layout({
      demo: {
        invoiceNo: 'P&L-SUM-2018',
        currency: 'INR',
        total: '61,64,630.28',
        words: 'PROFIT AND LOSS TOTAL 61,64,630.28',
        totalLabel: 'PROFIT AND LOSS TOTAL',
        metaRows: [
          { k: 'Branch Name', v: 'CHENNAI' },
          { k: 'Currency', v: 'INR' },
          { k: 'Period', v: '01-JAN-18 To 30-Sep-18' },
        ],
        tableHeaders: ['Group Name', 'Previous Amount', 'Current Amount'],
        tableRows: [
          ['PROFIT AND LOSS', '', ''],
          ['DIRECT INCOME', '', ''],
          ['AIR EXPORT CLEARANCE', '', '10,600.00'],
          ['AIR FREIGHT CHGS REVENUE', '', '21,28,800.00'],
          ['SEA FREIGHT FCL REVENUE', '', '68,79,855.58'],
          ['SEA FREIGHT GROUPAGE REVENUE', '', '77,642.20'],
          ['DIRECT INCOME TOTAL', '', '90,96,897.78'],
          ['DIRECT EXPENSES', '', ''],
          ['AIR FREIGHT CHGS COST', '', '(5,36,353.00)'],
          ['DOCUMENTATION CHGS', '', '10,000.00'],
          ['SEA FREIGHT FCL COST', '', '(14,44,777.00)'],
          ['SEA FREIGHT GROUPAGE COST', '', '(9,57,380.00)'],
          ['DIRECT EXPENSES TOTAL', '', '(29,28,510.00)'],
          ['INDIRECT EXPENSES', '', ''],
          ['EXCHANGE GAIN/LOSS', '', '(2,757.50)'],
          ['OFFICE EXPENSE', '', '(1,000.00)'],
          ['INDIRECT EXPENSES TOTAL', '', '(3,757.50)'],
        ],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'Profit and Loss Summary', align: 'center' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** profit-and-loss-report-format-3-summary-periodwise.pdf */
  profit_loss_periodwise: () =>
    layout({
      demo: {
        invoiceNo: 'P&L-PW-2018',
        currency: 'INR',
        total: '6,164,630.28',
        words: 'PROFIT AND LOSS TOTAL 6,164,630.28',
        totalLabel: 'PROFIT AND LOSS TOTAL',
        metaRows: [
          { k: 'Branch Name', v: 'CHENNAI' },
          { k: 'Currency', v: 'INR' },
          { k: 'From Date', v: '01-JAN-18' },
          { k: 'To Date', v: '30-Sep-18' },
        ],
        tableHeaders: [
          'Group Name',
          '201901',
          '201902',
          '201903',
          '201904',
          '201905',
          '201906',
          'Total',
        ],
        tableRows: [
          ['PROFIT AND LOSS', '', '', '', '', '', '', ''],
          ['DIRECT INCOME', '', '', '', '', '', '', ''],
          ['AIR EXPORT CLEARANCE', '', '', '', '', '', '10,600.00', '10,600.00'],
          ['AIR FREIGHT CHGS', '1,300.00', '', '', '', '2,127,000.00', '500.00', '2,128,800.00'],
          ['SEA FREIGHT FCL', '73,500.00', '', '2,936,153.68', '3,699,936.40', '', '170,265.50', '6,879,855.58'],
          ['SEA FREIGHT GROUPAGE', '13,050.00', '', '', '', '64,592.20', '', '77,642.20'],
          ['DIRECT INCOME TOTAL', '13,050.00', '74,800.00', '5,063,153.68', '3,699,936.40', '', '245,957.70', '9,096,897.78'],
          ['DIRECT EXPENSES', '', '', '', '', '', '', ''],
          ['AIR FREIGHT CHGS COST', '', '(6,728.00)', '', '', '(529,500.00)', '(125.00)', '(536,353.00)'],
          ['DOCUMENTATION CHGS', '', '', '', '', '', '10,000.00', '10,000.00'],
          ['SEA FREIGHT FCL COST', '(1,100.00)', '(9,000.00)', '(1,231,850.00)', '', '(202,187.00)', '(640.00)', '(1,444,777.00)'],
          ['SEA FREIGHT GROUPAGE COST', '(700.00)', '', '', '', '(956,680.00)', '', '(957,380.00)'],
          ['DIRECT EXPENSES TOTAL', '(700.00)', '(7,828.00)', '(9,000.00)', '(1,761,350.00)', '(202,187.00)', '(947,445.00)', '(2,928,510.00)'],
          ['INDIRECT EXPENSES', '', '', '', '', '', '', ''],
          ['EXCHANGE GAIN/LOSS', '', '', '', '', '', '(2,757.50)', '(2,757.50)'],
          ['OFFICE EXPENSE', '', '', '', '', '', '(1,000.00)', '(1,000.00)'],
          ['INDIRECT EXPENSES TOTAL', '', '', '', '', '', '(3,757.50)', '(3,757.50)'],
          ['PROFIT AND LOSS TOTAL', '11,350.00', '(7,828.00)', '65,800.00', '3,301,803.68', '3,497,749.40', '(704,244.80)', '6,164,630.28'],
        ],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: 'Profit and Loss Summary Periodwise', align: 'center' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'colorfulFooter' },
      ],
    }),

  // —— Remaining accounts formats (demo until sample links) ——
  /** receipt-voucher-report-format-1.pdf */
  receipt_voucher_1: () =>
    layout({
      demo: {
        invoiceNo: 'MAABR1900093',
        currency: 'INR',
        total: '17,384.00',
        words: 'Rupee Seventeen Thousand Three Hundred Eighty-Four Only',
        billToLabel: 'Received From',
        billToName: '4G LOGISTICS INDIA PVT LTD',
        billToAddress: '—',
        metaRows: [
          { k: 'Receipt No', v: 'MAABR1900093' },
          { k: 'Date', v: '29-JAN-19 ( CREATED )' },
          { k: 'A/C Name', v: 'KOTAK MAHINDRA BANK' },
          { k: 'Type', v: 'CASH' },
          { k: 'Cheque/Ref.No', v: '—' },
        ],
        fieldGrid: [
          { k: 'A/C Name', v: 'KOTAK MAHINDRA BANK' },
          { k: 'Type', v: 'CASH' },
          { k: 'Cheque/Ref.No', v: '' },
        ],
        tableHeaders: ['Description', 'Amount'],
        tableRows: [['4G LOGISTICS INDIA PVT LTD', '17,384.00']],
        signatureLabels: ['Accountant', 'Checked by', "Receiver's Signature"],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'RECEIPT VOUCHER - MAABR1900093', align: 'center' },
        { type: 'twoColumn', showBillTo: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'signatureRow' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** receipt-voucher-report-forat-2.pdf (Fresa typo in filename) */
  receipt_voucher_2: () =>
    layout({
      demo: {
        invoiceNo: 'MAABR1900096',
        currency: 'INR',
        total: '25,658.00',
        words: 'Rupee Twenty-Five Thousand Six Hundred Fifty-Eight Only',
        billToLabel: 'Received From',
        billToName: '4G LOGISTICS INDIA PVT LTD',
        billToAddress: '—',
        metaRows: [
          { k: 'Receipt No', v: 'MAABR1900096' },
          { k: 'Date', v: '05-FEB-19 ( CREATED )' },
          { k: 'A/C Name', v: 'KOTAK MAHINDRA BANK' },
          { k: 'Type', v: 'CASH' },
          { k: 'Cheque/Ref.No', v: '—' },
        ],
        fieldGrid: [
          { k: 'A/C Name', v: 'KOTAK MAHINDRA BANK' },
          { k: 'Type', v: 'CASH' },
          { k: 'Cheque/Ref.No', v: '' },
        ],
        tableHeaders: ['Description', 'Amount'],
        tableRows: [['4G LOGISTICS INDIA PVT LTD', '25,658.00']],
        osTableTitle: 'Against Voucher Details',
        osTableHeaders: ['Against V.No', 'Date', 'Description', 'Amount'],
        osTableRows: [
          [
            'MAAINV1900709',
            '29-JAN-19',
            'CEXP190150 MBL NO. / HBL NO. / JOB NO.CEXP190150 B/EXP/19/0254 CEXP190150',
            '25,658.00',
          ],
        ],
        signatureLabels: ['Accountant', 'Checked by', "Receiver's Signature"],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'RECEIPT VOUCHER - MAABR1900096', align: 'center' },
        { type: 'twoColumn', showBillTo: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'outstandingTable' },
        { type: 'wordsAndTotal' },
        { type: 'signatureRow' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** trial-balance-report-format-1 — Opening / Debit / Credit / Closing */
  trial_balance_1: () =>
    layout({
      demo: {
        invoiceNo: 'TB-SUM-1',
        currency: 'INR',
        total: '0.00',
        words: 'GRAND TOTAL balanced 24,703,911.49 / 24,703,911.49',
        totalLabel: 'GRAND TOTAL :',
        metaRows: [
          { k: 'Branch', v: 'CHENNAI' },
          { k: 'From Date', v: '01-JAN-18' },
          { k: 'To Date', v: '30-SEP-18' },
        ],
        fieldGrid: [
          { k: 'BRANCH', v: 'CHENNAI' },
          { k: 'FROM DATE', v: '01-JAN-18' },
          { k: 'TO DATE', v: '30-SEP-18' },
        ],
        tableHeaders: ['Account', 'Opening Balance', 'Debit', 'Credit', 'Closing Balance'],
        tableRows: [
          ['ASSET', '', '', '', ''],
          ['CASH AT BANK AND IN HAND', '', '', '', ''],
          ['HSBCBANK - HSBC BANK', '0.00', '34,600.00', '(1,500.00)', '33,100.00'],
          ['TOTAL :', '0.00', '34,600.00', '(1,500.00)', '33,100.00'],
          ['CURRENT ASSET', '', '', '', ''],
          ['6110.10.00 - ADCB BANK - AED', '0.00', '534,305.17', '(145,356.00)', '388,949.17'],
          ['6210.00.00 - TRADE DEBTORS CONTROL', '0.00', '2,204,707.23', '(238,541.06)', '1,966,166.17'],
          ['HDFC - HDFC BANK', '0.00', '881,889.54', '(112,284.16)', '769,605.38'],
          ['SUNDRYDEBTORS - SUNDRY DEBTORS', '0.00', '12,184,191.05', '(4,995,506.43)', '7,188,684.62'],
          ['TOTAL :', '0.00', '19,339,620.07', '(6,681,833.15)', '12,657,786.92'],
          ['ASSET TOTAL :', '0.00', '19,390,310.07', '(6,717,766.95)', '12,672,543.12'],
          ['LIABILITY', '', '', '', ''],
          ['12008 - SUNDRY CREDITORS', '0.00', '1,049,168.30', '(3,471,909.90)', '(2,422,741.60)'],
          ['LIABILITY TOTAL :', '0.00', '1,252,103.62', '(4,177,016.84)', '(2,924,913.22)'],
          ['INCOME', '', '', '', ''],
          ['1040.10.10 - SEA FREIGHT FCL REVENUE', '0.00', '364,749.00', '(9,833,745.36)', '(9,468,996.36)'],
          ['INCOME TOTAL :', '0.00', '529,539.00', '(13,778,772.20)', '(13,249,233.20)'],
          ['EXPENSE', '', '', '', ''],
          ['1040.20.10 - SEA FREIGHT FCL COST', '0.00', '1,583,069.80', '(4,500.00)', '1,578,569.80'],
          ['EXPENSE TOTAL :', '0.00', '3,531,958.80', '(30,355.50)', '3,501,603.30'],
          ['GRAND TOTAL :', '0.00', '24,703,911.49', '(24,703,911.49)', '0.00'],
        ],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: 'TRIAL BALANCE', align: 'center' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** trial-balance-report-format-2 — Current Month / Year To Date */
  trial_balance_2: () =>
    layout({
      demo: {
        invoiceNo: 'TB-SUM-2',
        currency: 'INR',
        total: '0.00',
        words: 'TOTAL GROUP 0.00 / 0.00',
        totalLabel: 'TOTAL GROUP',
        metaRows: [
          { k: 'Branch', v: 'CHENNAI' },
          { k: 'To Date', v: '30-SEP-18' },
        ],
        fieldGrid: [
          { k: 'BRANCH', v: 'CHENNAI' },
          { k: 'TO DATE', v: '30-SEP-18' },
        ],
        tableHeaders: ['ACCOUNT', 'CURRENT MONTH', 'YEAR TO DATE'],
        tableRows: [
          ['GROUP', '', ''],
          ['CURRENT ASSET', '', ''],
          ['6110.10.00 - ADCB BANK - AED', '0.00', '397,600.00'],
          ['6210.00.00 - TRADE DEBTORS CONTROL', '(3,000.00)', '1,215,919.00'],
          ['HDFC - HDFC BANK', '131,412.00', '137,548.00'],
          ['KMB - KOTAK MAHINDRA BANK', '17,255.00', '20,146.00'],
          ['SUNDRYDEBTORS - SUNDRY DEBTORS', '108,933.20', '5,333,594.20'],
          ['TOTAL CURRENT ASSET', '254,850.20', '8,638,023.88'],
          ['CURRENT LIABILITIES', '', ''],
          ['TDSPAYABLE - TDS PAYABLE', '(92.00)', '(31,694.50)'],
          ['TOTAL CURRENT LIABILITIES', '(92.00)', '(31,694.50)'],
          ['ACCOUNTS PAYABLE', '', ''],
          ['12008 - SUNDRY CREDITORS', '(977,603.00)', '(2,206,585.50)'],
          ['TOTAL ACCOUNTS PAYABLE', '(977,603.00)', '(2,206,585.50)'],
          ['DIRECT INCOME', '', ''],
          ['1040.10.10 - SEA FREIGHT FCL REVENUE', '(170,265.50)', '(6,879,855.58)'],
          ['TOTAL DIRECT INCOME', '(245,957.70)', '(9,097,147.78)'],
          ['DIRECT EXPENSES', '', ''],
          ['1040.20.10 - SEA FREIGHT FCL COST', '640.00', '1,444,777.00'],
          ['TOTAL DIRECT EXPENSES', '947,445.00', '2,928,510.00'],
          ['INDIRECT EXPENSES', '', ''],
          ['2520.00.00 - EXCHANGE GAIN/LOSS', '2,757.50', '2,757.50'],
          ['TOTAL INDIRECT EXPENSES', '2,757.50', '3,757.50'],
          ['TOTAL GROUP', '0.00', '0.00'],
        ],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: 'TRIAL BALANCE', align: 'center' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'wordsAndTotal' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** trial-balance-report-format-3 — BranchWise */
  trial_balance_3_branch: () =>
    layout({
      demo: {
        invoiceNo: 'TB-BR-3',
        currency: 'INR',
        total: '24,670,381.49',
        words: 'GRAND TOTAL 24,670,381.49 / 24,670,381.49',
        totalLabel: 'GRAND TOTAL :',
        metaRows: [
          { k: 'From Date', v: '01-JAN-18' },
          { k: 'To Date', v: '30-SEP-18' },
        ],
        fieldGrid: [
          { k: 'FROM DATE', v: '01-JAN-18' },
          { k: 'TO DATE', v: '30-SEP-18' },
        ],
        tableHeaders: ['COA Name', 'Opening Balance', 'Debit', 'Credit', 'Closing Balance'],
        tableRows: [
          ['Branch : CHENNAI', '', '', '', ''],
          ['ASSET', '', '', '', ''],
          ['ADCB BANK - AED', '397,600.00', '529,000.00', '131,400.00', '397,600.00'],
          ['HDFC BANK', '137,548.00', '148,548.00', '11,000.00', '137,548.00'],
          ['SUNDRY DEBTORS', '5,333,594.20', '8,659,725.38', '3,326,131.18', '5,333,594.20'],
          ['ASSET TOTAL :', '', '12,796,872.06', '4,190,542.68', '8,606,329.38'],
          ['EXPENSE TOTAL :', '', '2,942,267.50', '10,000.00', '2,932,267.50'],
          ['INCOME TOTAL :', '', '315,175.00', '9,412,322.78', '(9,097,147.78)'],
          ['LIABILITY TOTAL :', '', '927,669.50', '3,369,118.60', '(2,441,449.10)'],
          ['CHENNAI BRANCH TOTAL :', '0.00', '16,981,984.06', '', '16,981,984.06'],
          ['Branch : MUMBAI', '', '', '', ''],
          ['ASSET', '', '', '', ''],
          ['HDFC BANK', '633,407.38', '733,191.54', '99,784.16', '633,407.38'],
          ['SUNDRY DEBTORS', '1,855,090.42', '3,517,413.67', '1,662,323.25', '1,855,090.42'],
          ['ASSET TOTAL :', '', '6,578,639.01', '2,511,669.27', '4,066,969.74'],
          ['EXPENSE TOTAL :', '', '579,463.30', '20,355.50', '559,107.80'],
          ['INCOME TOTAL :', '', '214,364.00', '4,358,797.42', '(4,144,433.42)'],
          ['LIABILITY TOTAL :', '', '315,931.12', '797,575.24', '(481,644.12)'],
          ['MUMBAI BRANCH TOTAL :', '0.00', '7,688,397.43', '', '7,688,397.43'],
          ['GRAND TOTAL :', '0.00', '24,670,381.49', '', '24,670,381.49'],
        ],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: 'TRIAL BALANCE', align: 'center' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** trial-balance-report-format-4 — Extended (same columns as format-1 sample) */
  trial_balance_4_ext: () =>
    layout({
      demo: {
        invoiceNo: 'TB-EXT-4',
        currency: 'INR',
        total: '0.00',
        words: 'GRAND TOTAL balanced 24,703,911.49 / 24,703,911.49',
        totalLabel: 'GRAND TOTAL :',
        metaRows: [
          { k: 'Branch', v: 'CHENNAI' },
          { k: 'From Date', v: '01-JAN-18' },
          { k: 'To Date', v: '30-SEP-18' },
          { k: 'Variant', v: 'Extended' },
        ],
        fieldGrid: [
          { k: 'BRANCH', v: 'CHENNAI' },
          { k: 'FROM DATE', v: '01-JAN-18' },
          { k: 'TO DATE', v: '30-SEP-18' },
        ],
        tableHeaders: ['Account', 'Opening Balance', 'Debit', 'Credit', 'Closing Balance'],
        tableRows: [
          ['ASSET', '', '', '', ''],
          ['CASH AT BANK AND IN HAND', '', '', '', ''],
          ['HSBCBANK - HSBC BANK', '0.00', '34,600.00', '(1,500.00)', '33,100.00'],
          ['CURRENT ASSET', '', '', '', ''],
          ['6110.10.00 - ADCB BANK - AED', '0.00', '534,305.17', '(145,356.00)', '388,949.17'],
          ['6210.00.00 - TRADE DEBTORS CONTROL', '0.00', '2,204,707.23', '(238,541.06)', '1,966,166.17'],
          ['KMB - KOTAK MAHINDRA BANK', '0.00', '22,146.00', '0.00', '22,146.00'],
          ['PNB - PUNJAB NATIONAL BANK', '0.00', '663,366.68', '(8,000.00)', '655,366.68'],
          ['SUNDRYDEBTORS - SUNDRY DEBTORS', '0.00', '12,184,191.05', '(4,995,506.43)', '7,188,684.62'],
          ['ASSET TOTAL :', '0.00', '19,390,310.07', '(6,717,766.95)', '12,672,543.12'],
          ['LIABILITY', '', '', '', ''],
          ['ACCOUNTS PAYABLE', '', '', '', ''],
          ['12008 - SUNDRY CREDITORS', '0.00', '1,049,168.30', '(3,471,909.90)', '(2,422,741.60)'],
          ['IGST0001 - IGST SALE A/C', '0.00', '15,772.50', '(224,844.54)', '(209,072.04)'],
          ['LIABILITY TOTAL :', '0.00', '1,252,103.62', '(4,177,016.84)', '(2,924,913.22)'],
          ['INCOME / DIRECT INCOME', '', '', '', ''],
          ['1010.10.10 - AIR FREIGHT CHGS- REVENUE', '0.00', '41,590.00', '(2,435,096.98)', '(2,393,506.98)'],
          ['1040.10.10 - SEA FREIGHT FCL REVENUE', '0.00', '364,749.00', '(9,833,745.36)', '(9,468,996.36)'],
          ['INCOME TOTAL :', '0.00', '529,539.00', '(13,778,772.20)', '(13,249,233.20)'],
          ['EXPENSE / DIRECT EXPENSES', '', '', '', ''],
          ['1010.20.10 - AIR FREIGHT CHGS COST', '0.00', '842,857.56', '(450.50)', '842,407.06'],
          ['1040.20.10 - SEA FREIGHT FCL COST', '0.00', '1,583,069.80', '(4,500.00)', '1,578,569.80'],
          ['EXPENSE TOTAL :', '0.00', '3,531,958.80', '(30,355.50)', '3,501,603.30'],
          ['GRAND TOTAL :', '0.00', '24,703,911.49', '(24,703,911.49)', '0.00'],
        ],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'TRIAL BALANCE SUMMARY EXTENDED', align: 'center' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'wordsAndTotal' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** trial-balance-report-format-5 — Current Month / YTD extended */
  trial_balance_5_ext: () =>
    layout({
      demo: {
        invoiceNo: 'TB-EXT-5',
        currency: 'INR',
        total: '0.00',
        words: 'TOTAL GROUP 0.00 / 0.00',
        totalLabel: 'TOTAL GROUP',
        metaRows: [
          { k: 'Branch', v: 'CHENNAI' },
          { k: 'To Date', v: '30-SEP-18' },
          { k: 'Variant', v: 'Extended' },
        ],
        fieldGrid: [
          { k: 'BRANCH', v: 'CHENNAI' },
          { k: 'TO DATE', v: '30-SEP-18' },
        ],
        tableHeaders: ['ACCOUNT', 'CURRENT MONTH', 'YEAR TO DATE'],
        tableRows: [
          ['GROUP', '', ''],
          ['CASH AT BANK AND IN HAND', '', ''],
          ['HSBCBANK - HSBC BANK', '0.00', '33,100.00'],
          ['TOTAL CASH AT BANK AND IN HAND', '0.00', '33,100.00'],
          ['CURRENT ASSET', '', ''],
          ['6110.10.00 - ADCB BANK - AED', '0.00', '388,949.17'],
          ['6210.00.00 - TRADE DEBTORS CONTROL', '100,312.20', '1,965,471.17'],
          ['HDFC - HDFC BANK', '123,346.00', '770,955.38'],
          ['SUNDRYDEBTORS - SUNDRY DEBTORS', '322,344.20', '7,188,684.62'],
          ['TOTAL CURRENT ASSET', '564,164.40', '12,658,267.92'],
          ['ACCOUNTS PAYABLE', '', ''],
          ['12008 - SUNDRY CREDITORS', '(1,066,195.90)', '(2,422,741.60)'],
          ['TOTAL ACCOUNTS PAYABLE', '(1,066,195.90)', '(2,422,741.60)'],
          ['DIRECT INCOME', '', ''],
          ['1040.10.10 - SEA FREIGHT FCL REVENUE', '(243,045.50)', '(9,468,996.36)'],
          ['TOTAL DIRECT INCOME', '(555,831.90)', '(13,213,245.20)'],
          ['DIRECT EXPENSES', '', ''],
          ['1040.20.10 - SEA FREIGHT FCL COST', '61,140.00', '1,578,569.80'],
          ['TOTAL DIRECT EXPENSES', '1,089,400.30', '3,436,182.30'],
          ['INDIRECT EXPENSES', '', ''],
          ['2520.00.00 - EXCHANGE GAIN/LOSS', '32,768.00', '32,692.00'],
          ['TOTAL INDIRECT EXPENSES', '32,769.00', '55,193.00'],
          ['TOTAL GROUP', '0.00', '0.00'],
        ],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: 'TRIAL BALANCE SUMMARY EXTENDED', align: 'center' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'wordsAndTotal' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** trial-balance-report-format-6 — Extended BranchWise */
  trial_balance_6_ext_branch: () =>
    layout({
      demo: {
        invoiceNo: 'TB-EXT-BR-6',
        currency: 'INR',
        total: '24,670,381.49',
        words: 'GRAND TOTAL 24,670,381.49 / 24,670,381.49',
        totalLabel: 'GRAND TOTAL :',
        metaRows: [
          { k: 'From Date', v: '01-JAN-18' },
          { k: 'To Date', v: '30-SEP-18' },
          { k: 'Variant', v: 'Extended BranchWise' },
        ],
        fieldGrid: [
          { k: 'FROM DATE', v: '01-JAN-18' },
          { k: 'TO DATE', v: '30-SEP-18' },
        ],
        tableHeaders: ['COA Name', 'Opening Balance', 'Debit', 'Credit', 'Closing Balance'],
        tableRows: [
          ['Branch : CHENNAI', '', '', '', ''],
          ['ASSET', '', '', '', ''],
          ['ADCB BANK - AED', '397,600.00', '529,000.00', '131,400.00', '397,600.00'],
          ['HDFC BANK', '137,548.00', '148,548.00', '11,000.00', '137,548.00'],
          ['SUNDRY DEBTORS', '5,333,594.20', '8,659,725.38', '3,326,131.18', '5,333,594.20'],
          ['ASSET TOTAL :', '', '12,796,872.06', '4,190,542.68', '8,606,329.38'],
          ['EXPENSE TOTAL :', '', '2,942,267.50', '10,000.00', '2,932,267.50'],
          ['INCOME TOTAL :', '', '315,175.00', '9,412,322.78', '(9,097,147.78)'],
          ['LIABILITY TOTAL :', '', '927,669.50', '3,369,118.60', '(2,441,449.10)'],
          ['CHENNAI BRANCH TOTAL :', '0.00', '16,981,984.06', '', '16,981,984.06'],
          ['Branch : MUMBAI', '', '', '', ''],
          ['ASSET', '', '', '', ''],
          ['HDFC BANK', '633,407.38', '733,191.54', '99,784.16', '633,407.38'],
          ['SUNDRY DEBTORS', '1,855,090.42', '3,517,413.67', '1,662,323.25', '1,855,090.42'],
          ['ASSET TOTAL :', '', '6,578,639.01', '2,511,669.27', '4,066,969.74'],
          ['EXPENSE TOTAL :', '', '579,463.30', '20,355.50', '559,107.80'],
          ['INCOME TOTAL :', '', '214,364.00', '4,358,797.42', '(4,144,433.42)'],
          ['LIABILITY TOTAL :', '', '315,931.12', '797,575.24', '(481,644.12)'],
          ['MUMBAI BRANCH TOTAL :', '0.00', '7,688,397.43', '', '7,688,397.43'],
          ['GRAND TOTAL :', '0.00', '24,670,381.49', '', '24,670,381.49'],
        ],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'TRIAL BALANCE SUMMARY EXTENDED — BRANCHWISE', align: 'center' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** outstanding-letter-report-format-1 */
  outstanding_1: () =>
    layout({
      demo: {
        invoiceNo: 'OL-1',
        currency: 'INR',
        total: '2,191.80',
        words: 'Rupee Two Thousand One Hundred Ninety-One and Eighty PAISA Only',
        billToPhone: 'N/A',
        partyLeft: OL_PARTY,
        letterBody: OL_LETTER,
        tableHeaders: [
          'Date',
          'Voucher No',
          'Branch',
          'Narration',
          'Amount',
          'O/S Amount',
          'Running Total',
          'Aging',
        ],
        tableRows: [
          ['15-OCT-18', 'MAABR1800065', 'CHENNAI', 'MAAINV1800626 - SHIPMENT - 4G LOGISTICS', '-36,596.20', '-36,596.20', '-36,596.20', '116'],
          ['01-DEC-18', 'BOMINV1800494', 'MUMBAI', 'B/SJ/18/0016 MBL NO. / HBL NO. / JOB NO.', '2,000.00', '1,000.00', '-35,596.20', '69'],
          ['25-JAN-19', 'MAAINV1900713', 'CHENNAI', 'B/SFI/19/0166 MBLCOPY87666666', '9,440.00', '9,440.00', '-26,156.20', '14'],
          ['31-JAN-19', 'MAAINV1900728', 'CHENNAI', 'B/EXP/19/0255', '2,950.00', '2,950.00', '-23,206.20', '8'],
          ['31-JAN-19', 'MAABR1900095', 'CHENNAI', 'MAAINV1900728 - SHIPMENT', '-2,950.00', '-2,950.00', '-26,156.20', '8'],
          ['05-FEB-19', 'MAAINV1900731', 'CHENNAI', 'B/EXP/19/0256 PLMAAJEA00082', '20,434.00', '20,434.00', '-3,472.20', '3'],
          ['10-FEB-19', 'MAAINV1900736', 'CHENNAI', 'B/SI/19/0039 MAEU9812678888', '5,664.00', '5,664.00', '2,191.80', '-2'],
        ],
        agingHeaders: OL_AGING_HEADERS,
        agingRow: OL_AGING_ROW,
        termsLines: OL_BANK,
        bankLines: BANK,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'OUTSTANDING LETTER', align: 'center' },
        { type: 'letterBody' },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'agingSummary' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** outstanding-letter-report-format-2-jasper */
  outstanding_2_jasper: () =>
    layout({
      demo: {
        invoiceNo: 'OL-2',
        currency: 'INR',
        total: '2,191.80',
        words: 'Rupee Two Thousand One Hundred Ninety-One and Eighty PAISA Only',
        billToPhone: 'N/A',
        partyLeft: OL_PARTY,
        letterBody: OL_LETTER,
        tableHeaders: [
          'Date',
          'Voucher No',
          'Narration',
          'Amount',
          'O/S Amount',
          'Running Total',
          'Aging',
        ],
        tableRows: [
          ['15-OCT-18', 'MAABR1800065', 'MAAINV1800626 - SHIPMENT - 4G LOGISTICS', '0.00', '(36,596.20)', '(36,596.20)', '116'],
          ['01-DEC-18', 'BOMINV1800494', 'B/SJ/18/0016', '2,000.00', '1,000.00', '(35,596.20)', '69'],
          ['25-JAN-19', 'MAAINV1900713', 'B/SFI/19/0166 MBLCOPY87666666', '9,440.00', '9,440.00', '(26,156.20)', '14'],
          ['31-JAN-19', 'MAAINV1900728', 'B/EXP/19/0255', '2,950.00', '2,950.00', '(23,206.20)', '8'],
          ['31-JAN-19', 'MAABR1900095', 'MAAINV1900728 - SHIPMENT', '0.00', '(2,950.00)', '(26,156.20)', '8'],
          ['05-FEB-19', 'MAAINV1900731', 'B/EXP/19/0256 PLMAAJEA00082', '20,434.00', '20,434.00', '(3,472.20)', '3'],
          ['10-FEB-19', 'MAAINV1900736', 'B/SI/19/0039 MAEU9812678888', '5,664.00', '5,664.00', '2,191.80', '-2'],
        ],
        agingHeaders: OL_AGING_HEADERS,
        agingRow: ['2,191.80', '37,788.00', '1,000.00', '(36,596.20)', '', '', '', ''],
        termsLines: OL_BANK,
        bankLines: BANK,
      },
      blocks: [
        { type: 'letterBody' },
        { type: 'docTitle', text: 'OUTSTANDING LETTER', align: 'center' },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'agingSummary' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** outstanding-letter-report-format-3-with-aging */
  outstanding_3_aging: () =>
    layout({
      demo: {
        invoiceNo: 'OL-3',
        currency: 'INR',
        total: '2,191.80',
        words: 'Rupee Two Thousand One Hundred Ninety-One and Eighty PAISA Only',
        billToPhone: 'N/A',
        partyLeft: OL_PARTY,
        letterBody: OL_LETTER.replace('10-Feb-19', '10-FEB-19'),
        tableHeaders: [
          'Date',
          'Voucher No',
          'Narration',
          '0 to 30',
          '30 to 60',
          '60 to 90',
          '90 to 120',
          'O/S Amount',
          'Running Total',
          'Aging',
        ],
        tableRows: [
          ['15-OCT-18', 'MAABR1800065', 'MAAINV1800626 - SHIPMENT', '', '', '', '-36,596.20', '-36,596.20', '-36,596.20', '116'],
          ['01-DEC-18', 'BOMINV1800494', 'B/SJ/18/0016', '', '1,000.00', '', '', '1,000.00', '-35,596.20', '69'],
          ['25-JAN-19', 'MAAINV1900713', 'B/SFI/19/0166', '9,440.00', '', '', '', '9,440.00', '-26,156.20', '14'],
          ['31-JAN-19', 'MAAINV1900728', 'B/EXP/19/0255', '2,950.00', '', '', '', '2,950.00', '-23,906.20', '8'],
          ['05-FEB-19', 'MAAINV1900731', 'B/EXP/19/0256 PLMAAJEA00082', '20,434.00', '', '', '', '20,434.00', '-3,472.20', '3'],
          ['10-FEB-19', 'MAAINV1900736', 'B/SI/19/0039 MAEU9812678888', '5,664.00', '', '', '', '5,664.00', '2,191.80', '-2'],
        ],
        termsLines: OL_BANK,
        bankLines: BANK,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'OUTSTANDING LETTER', align: 'center' },
        { type: 'letterBody' },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** outstanding-letter-report-format-4-with-bl-details */
  outstanding_4_bl: () =>
    layout({
      demo: {
        invoiceNo: 'OL-4',
        currency: 'INR',
        total: '2,191.80',
        words: 'Rupee Two Thousand One Hundred Ninety-One and Eighty PAISA Only',
        billToPhone: 'N/A',
        partyLeft: OL_PARTY,
        letterBody: OL_LETTER.replace('10-Feb-19', '10-FEB-19'),
        tableHeaders: [
          'Date',
          'Voucher No',
          'POL',
          'MBL / MAWB',
          'HBL / HAWB',
          'PO No.',
          'Amount',
          'O/S Amount',
          'Running Total',
          'Aging',
        ],
        tableRows: [
          ['15-OCT-18', 'MAABR1800065', '', '', '', '', '0.00', '-36,596.20', '-36,596.20', '116'],
          ['01-DEC-18', 'BOMINV1800494', 'MILANO, ITALY', '', 'PLJEAMAA00003', '', '2,000.00', '1,000.00', '-35,596.20', '69'],
          ['25-JAN-19', 'MAAINV1900713', 'JEBEL ALI, UAE', 'MBLCOPY87666666', 'PLJEAMAA00001', '467', '9,440.00', '9,440.00', '-26,156.20', '14'],
          ['31-JAN-19', 'MAAINV1900728', 'CHENNAI, INDIA', '', 'PLJEAMAA00056', '', '2,950.00', '2,950.00', '-23,206.20', '8'],
          ['31-JAN-19', 'MAAINV1900729', 'CHENNAI, INDIA', '', 'PLJEAMAA00066', '789', '2,500.00', '2,500.00', '-23,656.20', '8'],
          ['05-FEB-19', 'MAAINV1900731', 'CHENNAI, INDIA', '', 'PLMAAJEA00082', '678', '20,434.00', '20,434.00', '-3,472.20', '3'],
          ['10-FEB-19', 'MAAINV1900736', 'JEBEL ALI, UAE', 'MAEU9812678888', 'DMMMAA20190202', '234', '5,664.00', '5,664.00', '2,191.80', '-2'],
        ],
        agingHeaders: OL_AGING_HEADERS,
        agingRow: ['2,191.80', '37,788.00', '1,000.00', '-36,596.20', '', '', '', ''],
        termsLines: OL_BANK,
        bankLines: BANK,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'OUTSTANDING LETTER', align: 'center' },
        { type: 'letterBody' },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'agingSummary' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** outstanding-letter-report-format-5-with-invoices */
  outstanding_5_invoices: () =>
    layout({
      demo: {
        invoiceNo: 'OL-5',
        currency: 'INR',
        total: '48,486.00',
        words: 'Rupee Forty-Eight Thousand Four Hundred Eighty-Six Only',
        billToPhone: 'N/A',
        partyLeft: OL_PARTY,
        letterBody: OL_LETTER.replace('10-Feb-19', '10-FEB-19'),
        tableHeaders: [
          'Date',
          'Invoice No',
          'Shipment / Job',
          'Invoice Amount',
          'Received',
          'O/S Amount',
          'Aging',
        ],
        tableRows: [
          ['25-JAN-19', 'MAAINV1900713', 'B/SFI/19/0166', '9,440.00', '', '9,440.00', '14'],
          ['31-JAN-19', 'MAAINV1900728', 'B/EXP/19/0255', '2,950.00', '', '2,950.00', '8'],
          ['05-FEB-19', 'MAAINV1900731', 'B/EXP/19/0256', '20,434.00', '', '20,434.00', '3'],
          ['10-FEB-19', 'MAAINV1900736', 'B/SI/19/0039', '15,662.00', '', '15,662.00', '-2'],
        ],
        termsLines: OL_BANK,
        bankLines: BANK,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'OUTSTANDING LETTER — WITH INVOICES', align: 'center' },
        { type: 'letterBody' },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** ap-aging-summary-report-format.pdf */
  ap_aging: () =>
    layout({
      demo: {
        invoiceNo: 'AP-AGE-1',
        currency: 'INR',
        total: '960,963.40',
        words: 'Total Amount: 960,963.40',
        totalLabel: 'Total Amount:',
        metaRows: [
          { k: 'Branch Name', v: 'ALL' },
          { k: 'COA Name', v: 'SUNDRY CREDITORS' },
          { k: 'To Date', v: '14-FEB-19' },
        ],
        fieldGrid: [
          { k: 'Branch Name', v: 'ALL' },
          { k: 'COA Name', v: 'SUNDRY CREDITORS' },
          { k: 'To Date', v: '14-FEB-19' },
        ],
        tableHeaders: [
          'Organization',
          'Salesperson',
          'O/S Amount',
          '0 to 30',
          '31 To 60',
          '61 To 90',
          '91 To 120',
          '121 To 150',
          '151 Above',
        ],
        tableRows: [
          ['3M LOGISTICS SERVICE', 'ARUL SELVAN', '3,850.00', '3,850.00', '', '', '', '', ''],
          ['4G LOGISTICS INDIA PVT LTD', 'RAM', '200.00', '200.00', '', '', '', '', ''],
          ['ABC INDIA PVT LTD', 'K N PRAVIN KUMAR', '956,913.40', '23,930.00', '1,152.40', '', '', '', '931,831.00'],
          ['Total Amount:', '', '960,963.40', '27,980.00', '1,152.40', '', '', '', '931,831.00'],
        ],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: 'A/P Aging Summary', align: 'center' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** ar-aging-summary-report-format.pdf */
  ar_aging: () =>
    layout({
      demo: {
        invoiceNo: 'AR-AGE-1',
        currency: 'INR',
        total: '1,245,320.00',
        words: 'Total Amount: 1,245,320.00',
        totalLabel: 'Total Amount:',
        fieldGrid: [
          { k: 'Branch Name', v: 'ALL' },
          { k: 'COA Name', v: 'SUNDRY DEBTORS' },
          { k: 'To Date', v: '14-FEB-19' },
        ],
        tableHeaders: [
          'Organization',
          'Salesperson',
          'O/S Amount',
          '0 to 30',
          '31 To 60',
          '61 To 90',
          '91 To 120',
          '121 To 150',
          '151 Above',
        ],
        tableRows: [
          ['AL NASER TRADING COMPANY LLC', 'RAM', '48,486.00', '48,486.00', '', '', '', '', ''],
          ['4G LOGISTICS INDIA PVT LTD', 'ARUL SELVAN', '1,196,834.00', '25,000.00', '11,000.00', '', '', '', '1,160,834.00'],
          ['Total Amount:', '', '1,245,320.00', '73,486.00', '11,000.00', '', '', '', '1,160,834.00'],
        ],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: 'A/R Aging Summary', align: 'center' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** ar-job-not-invoice-report-format.xlsx */
  ar_job_not_invoice: () =>
    layout({
      demo: {
        invoiceNo: 'AR-JNI-1',
        currency: 'INR',
        total: '3',
        words: 'Jobs without sales invoice: 3',
        fieldGrid: [
          { k: 'From Date', v: '01-JAN-19' },
          { k: 'To Date', v: '14-FEB-19' },
          { k: 'Branch', v: 'ALL' },
        ],
        tableHeaders: ['Job No.', 'Shipment No.', 'Customer', 'ETD', 'ATA', 'Status'],
        tableRows: [
          ['CEXP190148', 'B/EXP/19/0251', '4G LOGISTICS INDIA PVT LTD', '20-JAN-19', '', 'Open'],
          ['CEXP190150', 'B/EXP/19/0254', 'AL NASER TRADING', '28-JAN-19', '', 'Open'],
          ['CSFI190012', 'B/SFI/19/0166', '3M LOGISTICS SERVICE', '05-FEB-19', '', 'Open'],
        ],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: 'AR JOB NOT INVOICE', align: 'center' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'accent' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** bank-cash-book-summary-list-report-format.xlsx */
  bank_cash_book: () =>
    layout({
      demo: {
        invoiceNo: 'BCB-1',
        currency: 'INR',
        total: '125,450.00',
        words: 'Closing Balance: 125,450.00',
        fieldGrid: [
          { k: 'From Date', v: '01-JAN-19' },
          { k: 'To Date', v: '14-FEB-19' },
          { k: 'Bank / Cash', v: 'HDFC CURRENT A/C' },
        ],
        tableHeaders: ['Date', 'Voucher No.', 'Narration', 'Debit', 'Credit', 'Balance'],
        tableRows: [
          ['01-JAN-19', '', 'Opening Balance', '', '', '100,000.00'],
          ['15-JAN-19', 'MAABR1900089', 'Customer receipt', '40,000.00', '', '140,000.00'],
          ['28-JAN-19', 'MAAPV1900042', 'Vendor payment', '', '14,550.00', '125,450.00'],
        ],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: 'BANK / CASH BOOK SUMMARY', align: 'center' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'colorfulFooter' },
      ],
    }),

  purchase_invoice_1: () =>
    layout({
      demo: {
        invoiceNo: 'MAPINV190021',
        invoiceDate: '28-JAN-19',
        currency: 'INR',
        total: '18,880.00',
        words: 'Rupee Eighteen Thousand Eight Hundred Eighty Only',
        partyLeft: {
          title: 'Vendor',
          lines: ['OCEAN CARRIER LINES', 'CHENNAI TAMIL NADU INDIA'],
        },
        fieldGrid: [
          { k: 'Purchase Invoice No.', v: 'MAPINV190021' },
          { k: 'Date', v: '28-JAN-19' },
          { k: 'Job / Shipment', v: 'B/EXP/19/0254' },
          { k: 'Currency', v: 'INR' },
        ],
        tableHeaders: ['Charge', 'Qty', 'Rate', 'Amount'],
        tableRows: [
          ['Ocean Freight', '1', '12,000.00', '12,000.00'],
          ['THC', '1', '4,000.00', '4,000.00'],
          ['Documentation', '1', '2,880.00', '2,880.00'],
        ],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'PURCHASE INVOICE — FORMAT 1', align: 'center', band: true },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'wordsAndTotal' },
        { type: 'colorfulFooter' },
      ],
    }),

  purchase_invoice_2: () =>
    layout({
      demo: {
        invoiceNo: 'MAPINV190022',
        invoiceDate: '30-JAN-19',
        currency: 'USD',
        total: '875.00',
        words: 'USD Eight Hundred Seventy-Five Only',
        partyLeft: {
          title: 'Vendor',
          lines: ['GLOBAL FREIGHT AGENTS LLC', 'DUBAI UAE'],
        },
        fieldGrid: [
          { k: 'Purchase Invoice No.', v: 'MAPINV190022' },
          { k: 'Date', v: '30-JAN-19' },
          { k: 'Job / Shipment', v: 'B/SFI/19/0166' },
          { k: 'Currency', v: 'USD' },
        ],
        tableHeaders: ['Charge', 'Qty', 'Rate', 'Amount'],
        tableRows: [
          ['Agency Fee', '1', '500.00', '500.00'],
          ['Handling', '1', '375.00', '375.00'],
        ],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'PURCHASE INVOICE — FORMAT 2', align: 'center', band: true },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'accent' },
        { type: 'wordsAndTotal' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** ap-outstanding-statement-report-format.pdf */
  ap_outstanding: () =>
    layout({
      demo: {
        invoiceNo: 'AP-OS-1',
        currency: 'INR',
        total: '3,850.00',
        words: 'Rupee Three Thousand Eight Hundred Fifty Only',
        billToPhone: '044 22435678',
        partyLeft: {
          title: 'To',
          lines: [
            '3M LOGISTICS SERVICE',
            'NO. 178, 4TH CROSS STREET NUNGAMBAKKAM',
            'CHENNAI TAMILNADU 600062',
          ],
        },
        letterBody: 'Please find the below Outstanding details.',
        tableHeaders: [
          'Date',
          'Voucher No',
          'Branch',
          'Ref No',
          'Ref Date',
          'Narration',
          'Amount',
          'O/S Amount',
          'Running Total',
          'Aging',
        ],
        tableRows: [
          ['22-OCT-18', 'BOMINV1800443', 'MUMBAI', '', '', 'MBL No. / HBL No. / JOB NO.', '3,000.00', '3,000.00', '3,000.00', '114'],
          ['24-OCT-18', 'BOMPI1800195', 'MUMBAI', '5468', '25-OCT-18', 'CEXP180112', '300.00', '300.00', '3,300.00', '112'],
          ['24-OCT-18', 'BOMPI1800194', 'MUMBAI', '7536', '25-OCT-18', 'CEXP180112', '250.00', '250.00', '3,550.00', '112'],
          ['24-OCT-18', 'BOMPI1800196', 'MUMBAI', '2220', '25-OCT-18', 'CP180002', '300.00', '300.00', '3,850.00', '112'],
        ],
        agingHeaders: OL_AGING_HEADERS,
        agingRow: ['3,850.00', '', '', '', '3,850.00', '', '', ''],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'A/P OUTSTANDING STATEMENT', align: 'center' },
        { type: 'letterBody' },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'agingSummary' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** gl-listing-sort-by-customer-code-voucher-report-format.pdf */
  gl_listing: () =>
    layout({
      demo: {
        invoiceNo: 'GL-CUST-1',
        currency: 'INR',
        total: '28,288.00',
        words: 'GL listings sort by customer code',
        metaRows: [
          { k: 'Branch', v: 'ALL' },
          { k: 'From', v: '01-JAN-19' },
          { k: 'To', v: '13-FEB-19' },
          { k: 'Account', v: 'SUNDRYDEBTORS - SUNDRY DEBTORS' },
        ],
        fieldGrid: [
          { k: 'Branch', v: 'ALL' },
          { k: 'From', v: '01-JAN-19' },
          { k: 'To', v: '13-FEB-19' },
          { k: 'Account', v: 'SUNDRYDEBTORS - SUNDRY DEBTORS' },
        ],
        tableHeaders: [
          'GL Date',
          'Voucher No.',
          'Organization',
          'Narration',
          'Job No.',
          'Currency',
          'Debit',
          'Credit',
          'Org.Amount',
        ],
        tableRows: [
          ['31-DEC-18', '', '', 'OPENING BALANCE', '', '', '80,623.75', '54,596.20', '135,219.95'],
          ['23-JAN-19', 'MAABR1900089', '4G LOGISTICS INDIA PVT LTD', 'Receipt', '', 'INR', '0.00', '116,219.95', '116,219.95'],
          ['25-JAN-19', 'MAAINV1900713', '4G LOGISTICS INDIA PVT LTD', 'B/SFI/19/0166 MBLCOPY87666666', 'CSFI190012', 'INR', '9,440.00', '0.00', '9,440.00'],
          ['28-JAN-19', 'MAAINV1900717', '4G LOGISTICS INDIA PVT LTD', 'B/EXP/19/0251 MBLC9878909999', 'CEXP190148', 'INR', '17,384.00', '0.00', '17,384.00'],
          ['28-JAN-19', 'MAACN1900032', '4G LOGISTICS INDIA PVT LTD', 'REVERSED VOUCHER AGAINST MAAINV1900717', 'CEXP190148', 'INR', '0.00', '17,384.00', '17,384.00'],
          ['29-JAN-19', 'MAAINV1900709', '4G LOGISTICS INDIA PVT LTD', 'CEXP190150 / B/EXP/19/0254', 'CEXP190150', 'INR', '25,658.00', '0.00', '25,658.00'],
          ['31-JAN-19', 'MAAINV1900728', '4G LOGISTICS INDIA PVT LTD', 'B/EXP/19/0255', '', 'INR', '2,950.00', '0.00', '2,950.00'],
          ['05-FEB-19', 'MAAINV1900731', '4G LOGISTICS INDIA PVT LTD', 'B/EXP/19/0256 PLMAAJEA00082', 'CEXP190151', 'INR', '20,434.00', '0.00', '20,434.00'],
          ['05-FEB-19', 'MAABR1900097', '4G LOGISTICS INDIA PVT LTD', 'RECEIPT VOUCHER', '', 'INR', '0.00', '25,658.00', '25,658.00'],
          ['11-FEB-19', 'MAAINV1900739', '4G LOGISTICS INDIA PVT LTD', 'CEXP190153 MBLASIAAN98789', 'CEXP190153', 'INR', '28,288.00', '0.00', '28,288.00'],
        ],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: 'GL LISTINGS SORT BY CUSTOMER CODE', align: 'center' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** gl-report-currency-wise-voucher-report-format.pdf */
  gl_currency: () =>
    layout({
      demo: {
        invoiceNo: 'GL-CCY-1',
        currency: 'MULTI',
        total: '24,815.80',
        words: 'Grand Total Debit 180,890.70 / Credit 156,074.90',
        totalLabel: 'Grand Total',
        metaRows: [
          { k: 'Branch', v: 'ALL' },
          { k: 'From', v: '01-JAN-19' },
          { k: 'To', v: '13-FEB-19' },
          { k: 'Account', v: 'SUNDRY DEBTORS - RECEIVABLES' },
        ],
        fieldGrid: [
          { k: 'Branch', v: 'ALL' },
          { k: 'From', v: '01-JAN-19' },
          { k: 'To', v: '13-FEB-19' },
          { k: 'Account', v: 'SUNDRY DEBTORS - RECEIVABLES' },
        ],
        tableHeaders: [
          'Subledger',
          'Voucher No.',
          'GL Date',
          'Narration',
          'Currency',
          'Debit',
          'Credit',
          'Net Amount',
        ],
        tableRows: [
          ['', '', '31-DEC-18', 'OPENING BALANCE', '', '80,623.75', '54,596.20', '135,219.95'],
          ['4G LOGISTICS INDIA', 'MAABR1900089', '23-JAN-19', 'Receipt', 'INR', '0.00', '54,096.20', '-35,596.20'],
          ['4G LOGISTICS INDIA', 'MAAINV1900713', '25-JAN-19', 'B/SFI/19/0166', 'INR', '9,440.00', '0.00', '-26,156.20'],
          ['4G LOGISTICS INDIA', 'MAAINV1900717', '28-JAN-19', 'B/EXP/19/0251', 'INR', '17,384.00', '0.00', '-8,772.20'],
          ['4G LOGISTICS INDIA', 'MAACN1900032', '28-JAN-19', 'REVERSED VOUCHER', 'INR', '0.00', '17,384.00', '-26,156.20'],
          ['4G LOGISTICS INDIA', 'MAAINV1900709', '29-JAN-19', 'CEXP190150', 'INR', '25,658.00', '0.00', '-498.20'],
          ['Currency Total INR', '', '', '', '', '74,680.20', '58,197.50', ''],
          ['4G LOGISTICS INDIA', 'MAABR1900089', '23-JAN-19', 'USD receipt', 'USD', '0.00', '875.00', '-35,596.20'],
          ['Currency Total USD', '', '', '', '', '0.00', '875.00', ''],
          ['4G LOGISTICS INDIA', 'MAAINV1900731', '05-FEB-19', 'B/EXP/19/0256', 'INR', '20,434.00', '0.00', '22,451.30'],
          ['4G LOGISTICS INDIA', 'MAAINV1900739', '11-FEB-19', 'CEXP190153', 'INR', '28,288.00', '0.00', '24,815.80'],
          ['Period Total', '', '', '', '', '106,919.50', '101,478.70', ''],
          ['Grand Total', '', '', '', '', '180,890.70', '156,074.90', '24,815.80'],
        ],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: 'GENERAL LEDGER CURRENCY WISE', align: 'center' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** gl-report-voucher-report-format.pdf */
  gl_report: () =>
    layout({
      demo: {
        invoiceNo: 'GL-1',
        currency: 'INR',
        total: '24,815.80',
        words: 'Period Total Dr/Cr balanced',
        totalLabel: 'Period Total :',
        metaRows: [
          { k: 'Account', v: 'SUNDRYDEBTORS - SUNDRY DEBTORS' },
          { k: 'Branch', v: 'All' },
          { k: 'From', v: '01-JAN-19' },
          { k: 'To', v: '13-FEB-19' },
        ],
        fieldGrid: [
          { k: 'Account', v: 'SUNDRYDEBTORS - SUNDRY DEBTORS' },
          { k: 'Branch', v: 'All' },
          { k: 'From', v: '01-JAN-19' },
          { k: 'To', v: '13-FEB-19' },
        ],
        tableHeaders: [
          'Subledger',
          'Voucher No.',
          'GL Date',
          'Narration',
          'Currency',
          'Dr Amt',
          'Cr Amt',
          'Running Amt',
        ],
        tableRows: [
          ['', '', '31-DEC-18', 'Opening Balance', '', '80,623.75', '', '80,623.75'],
          ['4G LOGISTICS INDIA PVT LTD', 'MAABR1900089', '23-JAN-19', 'CEXP180108', 'INR', '', '36,596.20', '44,027.55'],
          ['4G LOGISTICS INDIA PVT LTD', 'MAAINV1900713', '25-JAN-19', 'B/SFI/19/0166 MBLCOPY87666666', 'INR', '9,440.00', '', '35,967.55'],
          ['4G LOGISTICS INDIA PVT LTD', 'MAAINV1900717', '28-JAN-19', 'B/EXP/19/0251 MBLC9878909999', 'INR', '17,384.00', '', '53,351.55'],
          ['4G LOGISTICS INDIA PVT LTD', 'MAACN1900032', '28-JAN-19', 'REVERSED VOUCHER AGAINST MAAINV1900717', 'INR', '', '17,384.00', '35,967.55'],
          ['4G LOGISTICS INDIA PVT LTD', 'MAAINV1900709', '29-JAN-19', 'CEXP190150', 'INR', '25,658.00', '', '61,625.55'],
          ['4G LOGISTICS INDIA PVT LTD', 'MAAINV1900728', '31-JAN-19', 'B/EXP/19/0255', 'INR', '2,950.00', '', '64,841.05'],
          ['Currency Total :', '', '', '', '', '74,680.20', '58,197.50', ''],
          ['4G LOGISTICS INDIA PVT LTD', 'MAAINV1900731', '05-FEB-19', 'B/EXP/19/0256 PLMAAJEA00082', 'INR', '20,434.00', '', '22,451.30'],
          ['4G LOGISTICS INDIA PVT LTD', 'MAABR1900097', '05-FEB-19', 'Receipt', 'INR', '', '25,658.00', '(3,206.70)'],
          ['4G LOGISTICS INDIA PVT LTD', 'MAAINV1900739', '11-FEB-19', 'CEXP190153 MBLASIAAN98789', 'INR', '28,288.00', '', '24,815.80'],
          ['Period Total :', '', '', '', '', '106,919.50', '', '162,727.45'],
        ],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader' },
        { type: 'docTitle', text: 'GENERAL LEDGER', align: 'center' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** statement-of-accounts-report-format.pdf */
  soa: () =>
    layout({
      demo: {
        invoiceNo: 'SOA-1',
        currency: 'INR',
        total: '24,815.80',
        words: 'PLEASE FIND HERE BELOW STATEMENT OF ACCOUNTS FROM. 01-JAN-19 TO 13-FEB-19',
        billToLabel: 'Account Name',
        billToName: '4G LOGISTICS INDIA PVT LTD',
        billToAddress: '—',
        metaRows: [
          { k: 'From', v: '01-JAN-19' },
          { k: 'To', v: '13-FEB-19' },
        ],
        fieldGrid: [
          { k: 'Account Name', v: '4G LOGISTICS INDIA PVT LTD' },
          { k: 'From', v: '01-JAN-19' },
          { k: 'To', v: '13-FEB-19' },
        ],
        tableHeaders: [
          'Voucher No.',
          'Voucher Date',
          'GL Date',
          'Shipment No.',
          'Job No.',
          'Narration',
          'Currency',
          'Net FCY Amount',
          'Net Local Amount',
          'Running Amount',
        ],
        tableRows: [
          ['', '31-DEC-18', '31-DEC-18', '', '', 'Opening Balance', 'INR', '19,375.00', '80,623.75', '80,623.75'],
          ['MAABR1900089', '23-JAN-19', '23-JAN-19', 'B/SFI/18/0164', 'CEXP180156', 'MBL NO. / HBL NO.', 'USD', '-875.00', '-62,123.75', '18,500.00'],
          ['MAABR1900089', '23-JAN-19', '23-JAN-19', 'B/SFI/18/0163', 'CEXP180108', 'MBL NO. / HBL NO.', 'INR', '-36,596.20', '-36,596.20', '-18,096.20'],
          ['MAAINV1900713', '25-JAN-19', '25-JAN-19', 'B/SFI/19/0166', 'CSFI190012', 'MBLCOPY87666666', 'INR', '9,440.00', '9,440.00', '-26,156.20'],
          ['MAAINV1900717', '28-JAN-19', '28-JAN-19', 'B/EXP/19/0251', 'CEXP190148', 'MBLC9878909999 / PLMAAJEA00080', 'INR', '17,384.00', '17,384.00', '-8,772.20'],
          ['MAACN1900032', '28-JAN-19', '28-JAN-19', 'B/EXP/19/0251', 'CEXP190148', 'REVERSED VOUCHER AGAINST MAAINV1900717', 'INR', '-17,384.00', '-17,384.00', '-26,156.20'],
          ['MAAINV1900709', '29-JAN-19', '29-JAN-19', 'B/EXP/19/0254', 'CEXP190150', 'CEXP190150', 'INR', '25,658.00', '25,658.00', '-498.20'],
          ['MAAINV1900728', '31-JAN-19', '31-JAN-19', 'B/EXP/19/0255', '', 'MBL NO. / HBL NO.', 'INR', '2,950.00', '2,950.00', '2,717.30'],
          ['MAABR1900095', '31-JAN-19', '31-JAN-19', 'B/EXP/19/0256', '', 'MAAINV1900728 - SHIPMENT', 'INR', '-2,950.00', '-2,950.00', '-232.70'],
          ['MAAINV1900731', '05-FEB-19', '05-FEB-19', 'B/EXP/19/0256', 'CEXP190151', 'PLMAAJEA00082', 'INR', '20,434.00', '20,434.00', '22,451.30'],
          ['MAAINV1900739', '11-FEB-19', '11-FEB-19', 'B/EXP/19/0262', 'CEXP190153', 'MBLASIAAN98789', 'INR', '28,288.00', '28,288.00', '24,815.80'],
        ],
        termsLines: TERMS,
        bankLines: BANK,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'STATEMENT OF ACCOUNTS', align: 'center' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'colorfulFooter' },
      ],
    }),
};

function buildRow([code, name, kind, n]) {
  const factory = KINDS[kind];
  if (!factory) throw new Error(`Missing kind ${kind}`);
  const base = factory(n);
  return {
    code,
    formatNumber: n,
    name,
    paper: base.paper || 'A4',
    rtl: false,
    theme: base.theme,
    branding: base.branding,
    demo: base.demo,
    blocks: base.blocks,
  };
}

const layouts = CATALOG.map(buildRow);
const outJson = path.join(root, 'src/features/reports/data/accountsFormatUiLayouts.json');
const outTs = path.join(root, 'src/features/reports/data/accountsFormatUiLayouts.generated.ts');
fs.writeFileSync(outJson, JSON.stringify(layouts, null, 2) + '\n', 'utf8');
fs.writeFileSync(
  outTs,
  `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
    `/** Auto-generated Accounts formats — run: node scripts/build-accounts-format-ui-layouts.mjs */\n` +
    `export const ACCOUNTS_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = ${JSON.stringify(layouts, null, 2)} as InvoiceFormatUiLayout[];\n`,
  'utf8',
);
console.log(`Wrote ${layouts.length} accounts layouts (all matched to Fresa sample PDFs)`);
