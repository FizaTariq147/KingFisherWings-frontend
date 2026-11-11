/**
 * Sanitized catalogue PDF fixtures shaped like InvoiceFormatPdfData /
 * resolveCatalogContextPdfData output — not invented production secrets.
 * Field names mirror existing FE mapping contracts only.
 */
import type { InvoiceFormatPdfData } from '../../utils/invoiceFormatToInvoicePdfModel';

const brand = {
  companyName: 'KingFisher Wings LLC',
  companyAddress: 'Demo Free Zone\nDubai, UAE',
  companyPhone: '+971 00 000 0000',
  companyEmail: 'ops@example.invalid',
  companyWeb: 'www.example.invalid',
};

/** Bound commercial invoice — totals must come from backend-shaped fields. */
export const fixtureCommercialInvoiceBound: InvoiceFormatPdfData = {
  ...brand,
  entityBound: true,
  invoiceNumber: 'INV-DEMO-1001',
  invoiceDate: '2026-01-15',
  dueDate: '2026-01-30',
  billToName: 'Acme Trading FZCO',
  billToAddress: 'Warehouse 12\nJebel Ali',
  billToPhone: '+971 00 111 1111',
  billToEmail: 'ap@acme.invalid',
  currencyCode: 'AED',
  lines: [
    { description: 'Ocean freight', qty: '1', rate: '1200.00', amount: '1200.00' },
    { description: 'THC', qty: '1', rate: '150.00', amount: '150.00' },
  ],
  subtotal: '1350.00',
  tax: '67.50',
  total: '1417.50',
  discount: '0.00',
};

/** Bound purchase invoice (vendor in billTo* slots per AP mapping). */
export const fixturePurchaseInvoiceBound: InvoiceFormatPdfData = {
  ...brand,
  entityBound: true,
  invoiceNumber: 'VIN-88421',
  invoiceDate: '2026-02-01',
  dueDate: '2026-02-15',
  billToName: 'Gulf Trucking LLC',
  billToAddress: 'Industrial Area 3\nSharjah',
  referenceNo: 'PO-2026-0099',
  currencyCode: 'AED',
  lines: [{ description: 'Inland haulage', qty: '2', rate: '400.00', amount: '800.00' }],
  subtotal: '800.00',
  tax: '40.00',
  total: '840.00',
};

export const fixtureQuotationBound: InvoiceFormatPdfData = {
  ...brand,
  entityBound: true,
  quotationNumber: 'Q-2026-055',
  validUntil: '2026-03-01',
  billToName: 'Blue Ocean Imports',
  billToAddress: 'Abu Dhabi',
  pol: 'INMAA',
  pod: 'AEJEA',
  incoterm: 'CIF',
  currencyCode: 'USD',
  lines: [{ description: 'Air freight estimate', qty: '1', rate: '980.00', amount: '980.00' }],
  subtotal: '980.00',
  tax: '0.00',
  total: '980.00',
};

export const fixtureHblBound: InvoiceFormatPdfData = {
  ...brand,
  entityBound: true,
  referenceNo: 'HBL-DEM-001',
  jobNumber: 'JOB-100',
  shipmentNumber: 'SHP-100',
  shipperLines: ['Shipper Co', 'Chennai'],
  consigneeLines: ['Consignee Co', 'Jebel Ali'],
  notifyLines: ['Notify Agent'],
  vesselFlight: 'VESSEL / V001',
  pol: 'INMAA',
  pod: 'AEJEA',
  etd: '2026-01-10',
  eta: '2026-01-24',
  commodity: 'General cargo',
  tableHeaders: ['Container', 'Pkgs', 'Weight', 'CBM'],
  tableRows: [['MSCU1234567', '10', '12500', '28.4']],
};

export const fixtureHawbBound: InvoiceFormatPdfData = {
  ...brand,
  entityBound: true,
  referenceNo: '157-12345678',
  jobNumber: 'AIR-200',
  shipperLines: ['Air Shipper'],
  consigneeLines: ['Air Consignee'],
  notifyLines: ['Notify'],
  vesselFlight: 'EK999',
  pol: 'OMDB',
  pod: 'VOBL',
  etd: '2026-02-02',
  eta: '2026-02-03',
  commodity: 'Electronics',
  tableHeaders: ['Pkgs', 'Weight', 'Dimensions'],
  tableRows: [['4', '220', '120x80x60']],
};

export const fixtureMawbBound: InvoiceFormatPdfData = {
  ...brand,
  entityBound: true,
  referenceNo: '176-99887766',
  jobNumber: 'AIR-M-01',
  shipperLines: ['KingFisher Consolidator Desk', 'DXB'],
  vesselFlight: 'EK051',
  pol: 'OMDB',
  pod: 'KJFK',
  etd: '2026-02-10',
  eta: '2026-02-11',
  commodity: 'Consol mixed',
  tableHeaders: ['HAWB', 'Shipper', 'Consignee', 'Pkgs', 'Weight'],
  tableRows: [
    ['157-111', 'A Co', 'B Co', '2', '50'],
    ['157-222', 'C Co', 'D Co', '3', '75'],
  ],
};

export const fixtureArrivalBound: InvoiceFormatPdfData = {
  ...fixtureHblBound,
  referenceNo: 'AN-441',
  lines: [{ description: 'Demurrage notice', amount: '0.00' }],
  subtotal: '0.00',
  tax: '0.00',
  total: '0.00',
};

export const fixtureDeliveryOrderBound: InvoiceFormatPdfData = {
  ...fixtureHblBound,
  referenceNo: 'DO-771',
  commodity: 'Release after payment confirmation',
};

export const fixtureManifestLandscape: InvoiceFormatPdfData = {
  ...brand,
  entityBound: true,
  vesselFlight: 'VESSEL / V002',
  pol: 'CNSHA',
  pod: 'AEJEA',
  etd: '2026-01-01',
  eta: '2026-01-20',
  tableHeaders: ['B/L', 'Shipper', 'Consignee', 'Pkgs', 'Weight', 'Commodity'],
  tableRows: Array.from({ length: 40 }, (_, i) => [
    `BL-${1000 + i}`,
    `Shipper ${i}`,
    `Consignee ${i}`,
    String((i % 5) + 1),
    String(100 + i),
    i % 7 === 0
      ? 'Long description of general merchandise including packing notes and marks '.repeat(2)
      : 'General',
  ]),
};

export const fixturePaymentVoucherBound: InvoiceFormatPdfData = {
  ...brand,
  entityBound: true,
  invoiceNumber: 'PV-3001',
  invoiceDate: '2026-02-05',
  billToName: 'Vendor Payee LLC',
  currencyCode: 'AED',
  total: '840.00',
  tableHeaders: ['Account', 'Particulars', 'Debit', 'Credit'],
  tableRows: [
    ['2100', 'Accounts payable', '840.00', ''],
    ['1100', 'Bank', '', '840.00'],
  ],
};

export const fixtureReceiptVoucherBound: InvoiceFormatPdfData = {
  ...brand,
  entityBound: true,
  invoiceNumber: 'RV-2002',
  invoiceDate: '2026-02-06',
  billToName: 'Customer Payer LLC',
  currencyCode: 'USD',
  total: '500.00',
  tableHeaders: ['Account', 'Particulars', 'Debit', 'Credit'],
  tableRows: [
    ['1100', 'Bank', '500.00', ''],
    ['1200', 'Accounts receivable', '', '500.00'],
  ],
};

export const fixtureLedgerBoundEmptyBalances: InvoiceFormatPdfData = {
  ...brand,
  entityBound: true,
  billToName: 'Ledger Customer',
  tableHeaders: ['Date', 'Doc', 'Particulars', 'Debit', 'Credit', 'Balance'],
  tableRows: [
    ['2026-01-01', 'INV-1', 'Invoice', '100.00', '', '100.00'],
    ['2026-01-05', 'RV-1', 'Receipt', '', '40.00', '60.00'],
  ],
  // opening/closing intentionally omitted — FE must not invent
};

export const fixtureFinancialStatementBound: InvoiceFormatPdfData = {
  ...brand,
  entityBound: true,
  tableHeaders: ['Line', 'Amount'],
  tableRows: [
    ['Revenue', '10000.00'],
    ['Expenses', '6500.00'],
  ],
  total: '3500.00',
};

export const fixtureDailyStatusReport: InvoiceFormatPdfData = {
  ...brand,
  entityBound: true,
  tableHeaders: ['Job', 'Customer', 'POL', 'POD', 'ETD', 'Status'],
  tableRows: [
    ['JOB-1', 'Acme', 'INMAA', 'AEJEA', '2026-01-10', 'Sailed'],
    ['JOB-2', 'Blue', 'CNSHA', 'AEJEA', '2026-01-12', 'Booked'],
  ],
};

export const fixtureMissingOptional: InvoiceFormatPdfData = {
  entityBound: true,
  companyName: 'KingFisher Wings LLC',
};

export const fixtureEmptyDataset: InvoiceFormatPdfData = {
  ...brand,
  entityBound: true,
  tableHeaders: ['Col A', 'Col B'],
  tableRows: [],
  lines: [],
};

export const FIXTURE_BY_REPORT: Record<string, InvoiceFormatPdfData> = {
  HBL_DRAFT_REPORT_FORMAT_11: fixtureHblBound,
  HAWB_DRAFT_REPORT_FORMAT_1: fixtureHawbBound,
  MAWB_DRAFT_REPORT_FORMAT: fixtureMawbBound,
  INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA: fixtureCommercialInvoiceBound,
  PURCHASE_INVOICE_REPORT_FORMAT_1: fixturePurchaseInvoiceBound,
  QUOTATION_REPORT_FORMAT_1: fixtureQuotationBound,
  ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER: fixtureArrivalBound,
  ARRIVAL_NOTICE_REPORT_FORMAT_11: fixtureArrivalBound,
  DELIVERY_ORDER_REPORT_FORMAT_10: fixtureDeliveryOrderBound,
  CARGO_MANIFEST_REPORT_FORMAT: fixtureManifestLandscape,
  PAYMENT_VOUCHER_REPORT_FORMAT_1: fixturePaymentVoucherBound,
  RECEIPT_VOUCHER_REPORT_FORMAT_1: fixtureReceiptVoucherBound,
  STATEMENT_OF_ACCOUNTS_REPORT_FORMAT: fixtureLedgerBoundEmptyBalances,
  PROFIT_AND_LOSS_REPORT_FORMAT_1_LANDSCAPE: fixtureFinancialStatementBound,
  DAILY_STATUS_REPORT_FORMAT_1: fixtureDailyStatusReport,
};
