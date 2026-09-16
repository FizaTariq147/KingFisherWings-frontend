/**
 * Exact sample-driven WMS Advance Shipping Note layouts.
 * Usage: node scripts/build-wms-format-ui-layouts.mjs
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
  primary: '#0F4D96',
  accent: '#2286C8',
  fill: '#F3F3F3',
  panel: '#EBF0F4',
  orange: '#F7A21C',
  red: '#DE1F26',
  cyan: '#9AD7FF',
  ink: '#101010',
  gray: '#656565',
  white: '#FFFFFF',
};

const CATALOG = [
  ['ADVANCE_SHIPPING_NOTE_FORMAT_1', 'Advance Shipping Note Format-1', 'asn_format_1', 1],
  ['ADVANCE_SHIPPING_NOTE', 'Advance Shipping Note', 'asn_standard', 2],
  ['ADVANCE_SHIPPING_NOTE_LOCATION_WISE', 'Advance Shipping Note Location Wise', 'asn_location_wise', 3],
  ['ADVANCE_SHIPPING_NOTE_LOCATION_WISE_2', 'Advance Shipping Note Location Wise-2', 'asn_location_wise_2', 4],
  ['ADVANCE_SHIPPING_NOTE_SUMMARY', 'Advance Shipping Note Summary', 'asn_summary', 5],
];

const TERMS = ['1. This is a computer generated document and does not require a signature.'];

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

const ASN_LINES_DETAILED = [
  ['1', '112541AASD52', 'WD EXTERNAL HDD', '500', '500', 'BOX', '250.000', '1.000'],
  ['2', '2253465', 'HP LAPTOP', '1024662001', '1', 'BOX', '2.750', '3.000'],
  ['3', '2253465', 'HP LAPTOP', '1024662002', '1', 'BOX', '2.750', '3.000'],
  ['4', '2253465', 'HP LAPTOP', '1024662003', '1', 'BOX', '2.750', '3.000'],
  ['5', '2253465', 'HP LAPTOP', '1024662004', '1', 'BOX', '2.750', '3.000'],
  ['6', '2253465100', 'HP MOUSE', '1200', '1200', 'BOX', '120.000', '12000.000'],
  ['7', '22534653', 'HP MONITOR', '550', '550', 'BOX', '55.000', '11000.000'],
  ['8', '2253465350', 'HP KEYBOARD', '750', '750', 'BOX', '75.000', '11250.000'],
  ['9', '5251255220', 'NVIDIA GPU', '600', '600', 'BOX', '150.000', '7200.000'],
  ['10', '5251255220', 'NVIDIA GPU', '600', '600', 'BOX', '150.000', '7200.000'],
  ['Total :', '', '', '4204', '4204', '', '811.000', '48663.000'],
];

const ASN_LINES_FORMAT1 = [
  ['1', 'WD', 'EXTERNAL HDD', 'NA', 'INDIA', '500', 'BOX', '250.000', '1.000'],
  ['2', 'HP', 'LAPTOP', 'NA', 'INDIA', '1', 'BOX', '2.750', '3.000'],
  ['3', 'HP', 'LAPTOP', 'NA', 'INDIA', '1', 'BOX', '2.750', '3.000'],
  ['4', 'HP', 'LAPTOP', 'NA', 'INDIA', '1', 'BOX', '2.750', '3.000'],
  ['5', 'HP', 'LAPTOP', 'NA', 'INDIA', '1', 'BOX', '2.750', '3.000'],
  ['6', 'HP', 'MOUSE', 'NA', 'INDIA', '1200', 'BOX', '120.000', '12000.000'],
  ['7', 'HP', 'MONITOR', 'NA', 'INDIA', '550', 'BOX', '55.000', '11000.000'],
  ['8', 'HP', 'KEYBOARD', 'NA', 'INDIA', '750', 'BOX', '75.000', '11250.000'],
  ['9', 'NVIDIA', 'GPU', 'NA', 'INDIA', '600', 'BOX', '150.000', '7200.000'],
  ['10', 'NVIDIA', 'GPU', 'NA', 'INDIA', '600', 'BOX', '150.000', '7200.000'],
  ['Total :', '', '', '', '', '4204', '', '811.000', '48663.000'],
];

const ASN_LOCATION_ROWS = [
  ['1', '22534653', 'HP MONITOR', 'GOODS_RECEIPT_AREA', '', '550'],
  ['2', '2253465', 'HP LAPTOP', 'AB0001', '1024662004', '1'],
  ['3', '5251255220', 'NVIDIA GPU', 'GOODS_RECEIPT_AREA', '', '600'],
  ['4', '2253465350', 'HP KEYBOARD', 'GOODS_RECEIPT_AREA', '', '750'],
  ['5', '5251255220', 'NVIDIA GPU', 'GOODS_RECEIPT_AREA', '', '600'],
  ['6', '112541AASD52', 'WD EXTERNAL HDD', 'AB0001', '', '500'],
  ['7', '2253465', 'HP LAPTOP', 'AB0001', '1024662001', '1'],
  ['8', '2253465', 'HP LAPTOP', 'AB0001', '1024662002', '1'],
  ['9', '2253465', 'HP LAPTOP', 'AB0001', '1024662003', '1'],
  ['10', '2253465100', 'HP MOUSE', 'AB-001-B', '', '1200'],
  ['Total :', '', '', '', '', '4204'],
];

const ASN_SUMMARY_ROWS = [
  ['1', '112541AASD52', 'WD EXTERNAL HDD', '500', 'BOX', '250.000', '1.000'],
  ['2', '22534653', 'HP MONITOR', '550', 'BOX', '55.000', '11000.000'],
  ['3', '5251255220', 'NVIDIA GPU', '1200', 'BOX', '300.000', '14400.000'],
  ['4', '2253465', 'HP LAPTOP', '4', 'BOX', '11.000', '12.000'],
  ['5', '2253465100', 'HP MOUSE', '1200', 'BOX', '120.000', '12000.000'],
  ['6', '2253465350', 'HP KEYBOARD', '750', 'BOX', '75.000', '11250.000'],
  ['Total :', '', '', '4204', '', '811.000', '48663.000'],
];

const KINDS = {
  /** ADVANCE-SHIPPING-NOTE-FORMAT1.pdf */
  asn_format_1: () =>
    layout({
      demo: {
        invoiceNo: 'ASN/000033',
        currency: 'INR',
        total: '4204',
        words: 'Total Qty 4204 · Weight 811.000 · Volume 48663.000',
        totalLabel: 'Total :',
        billToLabel: 'Client Name',
        billToName: 'DEMO PVT LTD',
        billToAddress: '—',
        metaRows: [
          { k: 'ASN No.', v: 'ASN/000033 / 10-FEB-20' },
          { k: 'Client No.', v: 'DMO/ASN/0002' },
          { k: 'Source Ref', v: '511252 / 10-FEB-20' },
          { k: 'BOE No.', v: '757657868/20' },
          { k: 'Container No.', v: 'MSKU1234567' },
          { k: 'HBL / HAWB No.', v: 'MAAJEA0445' },
        ],
        fieldGrid: [
          { k: 'ASN No.', v: 'ASN/000033 / 10-FEB-20' },
          { k: 'Client No.', v: 'DMO/ASN/0002' },
          { k: 'Source Ref', v: '511252 / 10-FEB-20' },
          { k: 'BOE No.', v: '757657868/20' },
          { k: 'Container No.', v: 'MSKU1234567' },
          { k: 'HBL / HAWB No.', v: 'MAAJEA0445' },
        ],
        tableHeaders: [
          'S.No.',
          'Product Code',
          'Product Name',
          'Category',
          'COO',
          'Qty',
          'Pack Code',
          'Weight',
          'Volume',
        ],
        tableRows: ASN_LINES_FORMAT1,
        signatureLabels: ['Checked by', 'Received by'],
        termsLines: TERMS,
      },
      blocks: [
        { type: 'docTitle', text: 'ADVANCE SHIPPING NOTE', align: 'center' },
        { type: 'twoColumn', showBillTo: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'signatureRow' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** ADVANCE_SHIPPING_NOTE.pdf */
  asn_standard: () =>
    layout({
      demo: {
        invoiceNo: 'ASN/000033',
        currency: 'INR',
        total: '4204',
        words: 'Total Qty 4204 · Weight 811.000 · Volume 48663.000',
        totalLabel: 'Total :',
        metaRows: [
          { k: 'Client No', v: 'DMO/ASN/0002' },
          { k: 'ASN No', v: 'ASN/000033 / 10-FEB-20' },
          { k: 'Client', v: 'DEMO PVT LTD' },
          { k: 'Bill of Entry No', v: '757657868/20' },
          { k: 'Bill of Entry Date', v: '10-FEB-20' },
          { k: 'Warehouse', v: 'WAREHOUSE-01' },
          { k: 'Source Reference No', v: '511252 / 10-FEB-20' },
          { k: 'Container No', v: 'MSKU1234567' },
          { k: 'Vessel / Flight Name', v: 'MSC MARIA / V012' },
          { k: 'HBL / HAWB No', v: 'MAAJEA0445' },
        ],
        fieldGrid: [
          { k: 'Client No', v: 'DMO/ASN/0002' },
          { k: 'ASN No', v: 'ASN/000033 / 10-FEB-20' },
          { k: 'Client', v: 'DEMO PVT LTD' },
          { k: 'Bill of Entry No', v: '757657868/20' },
          { k: 'Bill of Entry Date', v: '10-FEB-20' },
          { k: 'Warehouse', v: 'WAREHOUSE-01' },
          { k: 'Source Reference No', v: '511252 / 10-FEB-20' },
          { k: 'Container No', v: 'MSKU1234567' },
          { k: 'Vessel / Flight Name', v: 'MSC MARIA / V012' },
          { k: 'HBL / HAWB No', v: 'MAAJEA0445' },
        ],
        tableHeaders: [
          'SNo',
          'Product Code',
          'Product Name',
          'Serial No',
          'ASN Qty',
          'Qty',
          'Pack Code',
          'Weight',
          'Volume',
        ],
        tableRows: ASN_LINES_DETAILED,
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'ADVANCE SHIPPING NOTE / ASN No - ASN/000033', align: 'center' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'wordsAndTotal' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** ADVANCE_SHIPPING_NOTE_LOCATION_WISE.pdf */
  asn_location_wise: () =>
    layout({
      demo: {
        invoiceNo: 'ASN/000033',
        currency: 'INR',
        total: '4204',
        words: 'Total Qty 4204',
        totalLabel: 'Total :',
        metaRows: [
          { k: 'Client No', v: 'DMO/ASN/0002' },
          { k: 'ASN No', v: 'ASN/000033 / 07-OCT-19' },
          { k: 'Client', v: 'DEMO PVT LTD' },
          { k: 'Bill of Entry No', v: '757657868/20' },
          { k: 'Bill of Entry Date', v: '10-FEB-20' },
          { k: 'Warehouse', v: 'WAREHOUSE-01' },
          { k: 'Client Ref No', v: '511252 / 07-OCT-19' },
        ],
        fieldGrid: [
          { k: 'Client No', v: 'DMO/ASN/0002' },
          { k: 'ASN No', v: 'ASN/000033 / 07-OCT-19' },
          { k: 'Client', v: 'DEMO PVT LTD' },
          { k: 'Bill of Entry No', v: '757657868/20' },
          { k: 'Bill of Entry Date', v: '10-FEB-20' },
          { k: 'Warehouse', v: 'WAREHOUSE-01' },
          { k: 'Client Ref No', v: '511252 / 07-OCT-19' },
        ],
        tableHeaders: ['SNO', 'Product Code', 'Product Name', 'Location', 'Serial No', 'Qty'],
        tableRows: ASN_LOCATION_ROWS,
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'ASN LOCATION WISE / ASN No - ASN/000033', align: 'center' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'wordsAndTotal' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** ADVANCE_SHIPPING_NOTE_LOCATION_WISE_.pdf */
  asn_location_wise_2: () =>
    layout({
      demo: {
        invoiceNo: 'ASN/000033',
        currency: 'INR',
        total: '4204',
        words: 'Total Qty 4204',
        totalLabel: 'Total :',
        metaRows: [
          { k: 'Client No', v: 'DMO/ASN/0002' },
          { k: 'ASN No', v: 'ASN/000033 / 10-FEB-20' },
          { k: 'Client', v: 'DEMO PVT LTD' },
          { k: 'Bill of Entry No', v: '757657868/20' },
          { k: 'Bill of Entry Date', v: '10-FEB-20' },
          { k: 'Warehouse', v: 'WAREHOUSE-01' },
          { k: 'Client Ref No', v: '511252 / 10-FEB-20' },
        ],
        fieldGrid: [
          { k: 'Client No', v: 'DMO/ASN/0002' },
          { k: 'ASN No', v: 'ASN/000033 / 10-FEB-20' },
          { k: 'Client', v: 'DEMO PVT LTD' },
          { k: 'Bill of Entry No', v: '757657868/20' },
          { k: 'Bill of Entry Date', v: '10-FEB-20' },
          { k: 'Warehouse', v: 'WAREHOUSE-01' },
          { k: 'Client Ref No', v: '511252 / 10-FEB-20' },
        ],
        tableHeaders: ['SNO', 'Product Code', 'Product Name', 'Location', 'Serial No', 'Qty'],
        tableRows: ASN_LOCATION_ROWS,
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'ASN LOCATION WISE / ASN No - ASN/000033', align: 'center' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'wordsAndTotal' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** ADVANCE_SHIPPING_NOTE_SUMMARY.pdf */
  asn_summary: () =>
    layout({
      demo: {
        invoiceNo: 'ASN/000033',
        currency: 'INR',
        total: '4204',
        words: 'Total Qty 4204 · Weight 811.000 · Volume 48663.000',
        totalLabel: 'Total :',
        metaRows: [
          { k: 'Client No', v: 'DMO/ASN/0002' },
          { k: 'ASN No', v: 'ASN/000033 / 10-FEB-20' },
          { k: 'Client', v: 'DEMO PVT LTD' },
          { k: 'Bill of Entry No', v: '757657868/20' },
          { k: 'Bill of Entry Date', v: '10-FEB-20' },
          { k: 'Warehouse', v: 'WAREHOUSE-01' },
          { k: 'Source Reference No', v: '10-FEB-20 / 10-FEB-20' },
          { k: 'Container No', v: 'MSKU1234567' },
          { k: 'Vessel / Flight Name', v: 'MSC MARIA / V012' },
          { k: 'HBL / HAWB No', v: 'MAAJEA0445' },
        ],
        fieldGrid: [
          { k: 'Client No', v: 'DMO/ASN/0002' },
          { k: 'ASN No', v: 'ASN/000033 / 10-FEB-20' },
          { k: 'Client', v: 'DEMO PVT LTD' },
          { k: 'Bill of Entry No', v: '757657868/20' },
          { k: 'Bill of Entry Date', v: '10-FEB-20' },
          { k: 'Warehouse', v: 'WAREHOUSE-01' },
          { k: 'Source Reference No', v: '10-FEB-20 / 10-FEB-20' },
          { k: 'Container No', v: 'MSKU1234567' },
          { k: 'Vessel / Flight Name', v: 'MSC MARIA / V012' },
          { k: 'HBL / HAWB No', v: 'MAAJEA0445' },
        ],
        tableHeaders: ['SNo', 'Product Code', 'Product Name', 'Qty', 'Pack Code', 'Weight', 'Volume'],
        tableRows: ASN_SUMMARY_ROWS,
        termsLines: TERMS,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'ADVANCE SHIPPING NOTE / ASN No - ASN/000033', align: 'center' },
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
const outJson = path.join(root, 'src/features/reports/data/wmsFormatUiLayouts.json');
const outTs = path.join(root, 'src/features/reports/data/wmsFormatUiLayouts.generated.ts');
fs.writeFileSync(outJson, JSON.stringify(layouts, null, 2) + '\n', 'utf8');
fs.writeFileSync(
  outTs,
  `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
    `/** Auto-generated WMS ASN formats — run: node scripts/build-wms-format-ui-layouts.mjs */\n` +
    `export const WMS_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = ${JSON.stringify(layouts, null, 2)} as InvoiceFormatUiLayout[];\n`,
  'utf8',
);
console.log(`Wrote ${layouts.length} WMS ASN layouts matched to Fresa sample PDFs`);
