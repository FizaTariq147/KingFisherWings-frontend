/**
 * Phase 4 Batch 1 — evidence-based JSON layout fixes (no engine rewrite).
 * Updates JSON stores + matching *.generated.ts exports.
 *
 * Usage: node scripts/fresa-phase4-batch1-apply.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');

const STORES = [
  {
    json: 'wmsFormatUiLayouts.json',
    generated: 'wmsFormatUiLayouts.generated.ts',
    exportName: 'WMS_FORMAT_UI_LAYOUTS',
  },
  {
    json: 'arrivalNoticeFormatUiLayouts.json',
    generated: 'arrivalNoticeFormatUiLayouts.generated.ts',
    exportName: 'ARRIVAL_NOTICE_FORMAT_UI_LAYOUTS',
  },
  {
    json: 'invoiceFormatUiLayouts.json',
    generated: 'invoiceFormatUiLayouts.generated.ts',
    exportName: 'INVOICE_FORMAT_UI_LAYOUTS',
  },
  {
    json: 'seaDocsExtraFormatUiLayouts.json',
    generated: 'seaDocsExtraFormatUiLayouts.generated.ts',
    exportName: 'SEA_DOCS_EXTRA_FORMAT_UI_LAYOUTS',
  },
];

function load(store) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, store.json), 'utf8'));
}

function save(store, layouts) {
  const jsonPath = path.join(dataDir, store.json);
  fs.writeFileSync(jsonPath, `${JSON.stringify(layouts, null, 2)}\n`);
  const genPath = path.join(dataDir, store.generated);
  if (fs.existsSync(genPath)) {
    const body = `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\nexport const ${store.exportName}: InvoiceFormatUiLayout[] = ${JSON.stringify(layouts, null, 2)} as InvoiceFormatUiLayout[];\n`;
    fs.writeFileSync(genPath, body);
  }
}

function find(layouts, code) {
  const i = layouts.findIndex((r) => r.code === code);
  if (i < 0) throw new Error(`Missing layout ${code}`);
  return { i, row: layouts[i] };
}

function patchAsn(row) {
  row.demo = {
    ...row.demo,
    invoiceNo: 'ASN/000033',
    docSubtitle: 'ADVANCE SHIPPING NOTE / ASN No - ASN/000033',
  };
  // Fix 9-column product rows (Serial No was missing → cells shifted).
  row.demo.tableHeaders = [
    'SNo',
    'Product Code',
    'Product Name',
    'Serial No',
    'ASN Qty',
    'Qty',
    'Pack Code',
    'Weight',
    'Volume',
  ];
  row.demo.tableRows = [
    ['1', '112541AASD52', 'WD EXTERNAL HDD', '', '500', '500', 'BOX', '250.000', '1.000'],
    ['2', '2253465', 'HP LAPTOP', '1024662001', '1', '1', 'BOX', '2.750', '3.000'],
    ['3', '2253465', 'HP LAPTOP', '1024662002', '1', '1', 'BOX', '2.750', '3.000'],
    ['4', '2253465', 'HP LAPTOP', '1024662003', '1', '1', 'BOX', '2.750', '3.000'],
    ['5', '2253465', 'HP LAPTOP', '1024662004', '1', '1', 'BOX', '2.750', '3.000'],
    ['6', '2253465100', 'HP MOUSE', '', '1200', '1200', 'BOX', '120.000', '12000.000'],
    ['7', '22534653', 'HP MONITOR', '', '550', '550', 'BOX', '55.000', '11000.000'],
    ['8', '2253465350', 'HP KEYBOARD', '', '750', '750', 'BOX', '75.000', '11250.000'],
    ['9', '5251255220', 'NVIDIA GPU', '', '600', '600', 'BOX', '150.000', '7200.000'],
    ['10', '5251255220', 'NVIDIA GPU', '', '600', '600', 'BOX', '150.000', '7200.000'],
    ['Total :', '', '', '', '4204', '4204', '', '811.000', '48663.000'],
  ];
  delete row.demo.termsLines;
  delete row.demo.bankLines;
  delete row.demo.partyLeft;
  delete row.demo.partyMid;
  delete row.demo.letterBody;
  row.blocks = [
    { type: 'companyHeader', showContact: true },
    {
      type: 'docTitle',
      text: 'ADVANCE SHIPPING NOTE / ASN No - ASN/000033',
      align: 'center',
      band: true,
    },
    { type: 'fieldGrid', cols: 3 },
    { type: 'chargeTable', headerColor: 'primary' },
    { type: 'colorfulFooter' },
  ];
  return row;
}

function patchAsnLocationWise(row) {
  row.blocks = [
    { type: 'companyHeader', showContact: true },
    {
      type: 'docTitle',
      text: 'ADVANCE SHIPPING NOTE — LOCATION WISE',
      align: 'center',
      band: true,
    },
    { type: 'fieldGrid', cols: 3 },
    { type: 'chargeTable', headerColor: 'primary' },
    { type: 'colorfulFooter' },
  ];
  delete row.demo.termsLines;
  delete row.demo.bankLines;
  return row;
}

function patchVietnamFcl(row) {
  row.demo.partyThird = {
    title: 'Người liên hệ / Attn',
    lines: ['Import Department'],
  };
  // Move Attn out of partyLeft lines if duplicated.
  if (row.demo.partyLeft?.lines) {
    row.demo.partyLeft.lines = row.demo.partyLeft.lines.filter(
      (l) => !/^Attn:/i.test(l) && !/^Người liên hệ/i.test(l),
    );
  }
  row.demo.osTableTitle = 'ALL CHARGES HAVE TO PAY BEFORE PICK UP D/O ( Các phí cần thanh toán trước khi lấy lệnh )';
  delete row.demo.termsLines;
  row.demo.agingHeaders = ['No. of Containers', 'Type'];
  row.demo.agingRow = ['1', "20' DC"];
  row.blocks = [
    { type: 'companyHeader', showContact: true },
    {
      type: 'docTitle',
      text: 'ARRIVAL NOTICE (THÔNG BÁO HÀNG ĐẾN)',
      align: 'center',
      band: true,
    },
    { type: 'partyTriple' },
    { type: 'fieldGrid', cols: 2 },
    {
      type: 'docTitle',
      text: 'CHI TIẾT CỤ THỂ / DETAIL CARGO',
      align: 'center',
      band: true,
    },
    { type: 'chargeTable', headerColor: 'fill' },
    { type: 'agingSummary' },
    { type: 'outstandingTable' },
    { type: 'colorfulFooter' },
  ];
  return row;
}

function patchVietnamLcl(row) {
  row.demo.partyThird = {
    title: 'Người liên hệ / Attn',
    lines: ['Import Department'],
  };
  delete row.demo.termsLines;
  row.blocks = [
    { type: 'companyHeader', showContact: true },
    {
      type: 'docTitle',
      text: 'ARRIVAL NOTICE (THÔNG BÁO HÀNG ĐẾN) — LCL',
      align: 'center',
      band: true,
    },
    { type: 'partyTriple' },
    { type: 'fieldGrid', cols: 2 },
    {
      type: 'docTitle',
      text: 'CHI TIẾT CỤ THỂ / DETAIL CARGO',
      align: 'center',
      band: true,
    },
    { type: 'chargeTable', headerColor: 'fill' },
    { type: 'outstandingTable' },
    { type: 'colorfulFooter' },
  ];
  return row;
}

function patchInvoice11Land(row) {
  // Reference PDF is a TAX INVOICE (not landFreightHeader / transportation shell).
  row.demo = {
    ...row.demo,
    invoiceNo: 'INV1800564',
    invoiceDate: '27-NOV-18',
    billToLabel: 'Bill To',
    billToName: 'FRESA DEMO DUBAI LLC',
    billToAddress: 'AL NABHA, DUBAI',
    billToPhone: '04-233456',
    billToGstin: '29760737473',
    vatNo: 'VATNO98766655555',
    creditTerm: 'CASH',
    currency: 'AED',
    words: 'UAE Dirham Seven Hundred Fifty-Six and 21/100 Only',
    subtotal: '720.20',
    tax: '36.01',
    total: '756.21',
    totalLabel: 'Total : AED',
    docSubtitle: 'TAX INVOICE - INV1800564',
    trnNo: 'ABC123',
    metaRows: [
      { k: 'Invoice No.', v: 'INV1800564 / 27-NOV-18 (CREATED)' },
      { k: 'Credit Term', v: 'CASH' },
      { k: 'TRN No', v: 'VATNO98766655555' },
      { k: 'GSTIN No.', v: '29760737473' },
    ],
    fieldGrid: [
      { k: 'Consignee', v: 'FRESA DEMO DUBAI LLC' },
      { k: 'Shipper', v: 'PAHILAJRAI JAIKISHIN AND CO' },
      { k: 'Shipment No.', v: 'BDXBSI180115 / 27-NOV-18' },
      { k: 'Job No.', v: 'CCDXBSI18000061 / 27-NOV-18' },
      { k: 'MBL / MAWB No.', v: 'NSA.JEA.18/26917 / 12-OCT-18' },
      { k: 'Port of Loading', v: 'NHAVA SHEVA (JAWAHARLAL NEHRU), INDIA' },
      { k: 'Port of Discharge', v: 'JEBEL ALI, UAE' },
      { k: 'Vessel / Flight Name', v: 'NORTHERN GENERAL' },
      { k: 'Place of Delivery', v: 'JEBEL ALI, UAE' },
      { k: 'Place of Receipt', v: '—' },
    ],
    containerHeaders: [
      'Truck No.',
      'Container No.',
      'Type',
      'No of Pcs',
      'Gross Weight',
      'Volume',
    ],
    containerRow: ['—', '—', '—', '—', '—', '—'],
    tableHeaders: [
      'Charge Description',
      'Qty',
      'Unit',
      'Currency',
      'Unit Price',
      'Amount',
      'VAT %',
      'VAT Amount',
      'Total (AED)',
    ],
    tableRows: [
      ['Delivery Order Charges', '1', 'SHPT', 'AED', '150.00', '150.00', '5', '7.50', '157.50'],
      ['THC Charges', '1', 'SHPT', 'AED', '250.00', '250.00', '5', '12.50', '262.50'],
      ['Documentation Fee', '1', 'SHPT', 'AED', '320.20', '320.20', '5', '16.01', '336.21'],
    ],
    taxAmountLines: ['VAT-05 36.010'],
    termsLines: [
      '1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt.',
      '2. Any discrepancy should be notified to us in writing within 15 days from the invoice date after which NONE will be accepted.',
    ],
    bankLines: row.demo.bankLines,
  };
  delete row.demo.referenceRows;
  delete row.demo.subtotalParts;
  row.blocks = [
    { type: 'companyHeader', showContact: true },
    {
      type: 'docTitle',
      text: 'TAX INVOICE - INV1800564',
      align: 'center',
      band: true,
    },
    { type: 'twoColumn', showBillTo: true },
    { type: 'fieldGrid', cols: 2 },
    { type: 'containerStrip' },
    { type: 'chargeTable', headerColor: 'fill' },
    { type: 'taxAmountBox' },
    { type: 'wordsAndTotal' },
    { type: 'termsBank' },
    { type: 'colorfulFooter' },
  ];
  return row;
}

function patchInvoice18Land(row) {
  // Keep landFreightHeader (correct family); drop duplicate companyHeader.
  row.blocks = row.blocks.filter((b) => b.type !== 'companyHeader');
  if (!row.blocks.some((b) => b.type === 'landFreightHeader')) {
    row.blocks.unshift({
      type: 'landFreightHeader',
      title: row.demo.docSubtitle || 'VAT / TAX INVOICE — LAND FREIGHT / TRANSPORTATION',
    });
  }
  return row;
}

function patchArrivalFormat5(row) {
  // Light polish: ensure cargo title band + drop redundant empty terms duplication only if terms == os title.
  const hasCargoTitle = row.blocks.some(
    (b) => b.type === 'docTitle' && /CARGO|DETAIL/i.test(String(b.text || '')),
  );
  if (!hasCargoTitle) {
    const idx = row.blocks.findIndex((b) => b.type === 'chargeTable');
    if (idx >= 0) {
      row.blocks.splice(idx, 0, {
        type: 'docTitle',
        text: 'CARGO / CONTAINER DETAILS',
        align: 'center',
        band: true,
      });
    }
  }
  return row;
}

function patchJobHouses(row) {
  row.demo.fieldGrid = [
    { k: 'Job No.', v: 'B/EXP/19/0251' },
    { k: 'Customer', v: '4G LOGISTICS INDIA PVT LTD' },
    { k: 'Status', v: 'In Progress' },
    { k: 'As Of', v: '10-FEB-19' },
  ];
  row.demo.tableHeaders = [
    'House B/L',
    'Shipper',
    'Consignee',
    'PP/CC',
    'POF',
    'Forwarder',
    'Pkgs',
    'Weight',
    'Volume',
  ];
  row.demo.tableRows = [
    [
      'PLMAAJEA00080',
      '4G LOGISTICS INDIA PVT LTD',
      'AL NASER TRADING COMPANY LLC',
      'PP',
      'Collect',
      'KingFisher Agent',
      '125',
      '18,000.000',
      '20.000',
    ],
    [
      'PLMAAJEA00081',
      'GULF FREIGHT LLC',
      'DEMO CONSIGNEE FZE',
      'CC',
      'Prepaid',
      'KingFisher Agent',
      '40',
      '4,200.000',
      '8.500',
    ],
  ];
  row.blocks = [
    { type: 'companyHeader', showContact: true },
    {
      type: 'docTitle',
      text: 'JOB HOUSES RECORD LIST',
      align: 'center',
      band: true,
    },
    { type: 'fieldGrid', cols: 2 },
    { type: 'chargeTable', headerColor: 'orange' },
    { type: 'colorfulFooter' },
  ];
  return row;
}

const changed = [];

{
  const store = STORES[0];
  const layouts = load(store);
  let { i, row } = find(layouts, 'ADVANCE_SHIPPING_NOTE');
  layouts[i] = patchAsn(row);
  changed.push(row.code);
  ({ i, row } = find(layouts, 'ADVANCE_SHIPPING_NOTE_LOCATION_WISE'));
  layouts[i] = patchAsnLocationWise(row);
  changed.push(row.code);
  save(store, layouts);
}

{
  const store = STORES[1];
  const layouts = load(store);
  let { i, row } = find(layouts, 'ARRIVAL_NOTICE_REPORT_FORMAT_10_SEA_ARRIVAL_NOTICE_FCL_VIETNAM');
  layouts[i] = patchVietnamFcl(row);
  changed.push(row.code);
  ({ i, row } = find(layouts, 'SEA_ARRIVAL_NOTICE_LCL_VIETNAM'));
  layouts[i] = patchVietnamLcl(row);
  changed.push(row.code);
  ({ i, row } = find(layouts, 'ARRIVAL_NOTICE_REPORT_FORMAT_5_CARGO_ARRIVAL_NOTICE_SEA'));
  layouts[i] = patchArrivalFormat5(row);
  changed.push(row.code);
  save(store, layouts);
}

{
  const store = STORES[2];
  const layouts = load(store);
  let { i, row } = find(layouts, 'INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND');
  layouts[i] = patchInvoice11Land(row);
  changed.push(row.code);
  ({ i, row } = find(layouts, 'INVOICE_REPORT_FORMAT_18_LAND_FREIGHT_TRANSPORTATION_INVOICE'));
  layouts[i] = patchInvoice18Land(row);
  changed.push(row.code);
  save(store, layouts);
}

{
  const store = STORES[3];
  const layouts = load(store);
  const { i, row } = find(layouts, 'JOB_HOUSES_RECORD_LIST_REPORT_FORMAT');
  layouts[i] = patchJobHouses(row);
  changed.push(row.code);
  save(store, layouts);
}

console.log(JSON.stringify({ changed, count: changed.length }, null, 2));
