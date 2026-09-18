/**
 * Distinct Quotation Report Format-1..15 layouts.
 * Shared: companyHeader + colorfulFooter (KingFisher branding).
 * Body/structure varies per format number.
 *
 * Usage: node scripts/build-quotation-format-ui-layouts.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRAND, THEME, SHIPPER, CONSIGNEE, layout } from './lib/kfReportLayoutKit.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const CATALOG = Array.from({ length: 15 }, (_, i) => {
  const n = i + 1;
  return [
    `QUOTATION_REPORT_FORMAT_${n}`,
    `Quotation Report Format-${n}`,
    n,
  ];
});

const CHARGES = [
  ['1', 'Ocean Freight', '1', '1,250.00', 'USD', '1,250.00'],
  ['2', 'THC Origin', '1', '85.00', 'USD', '85.00'],
  ['3', 'Documentation', '1', '45.00', 'USD', '45.00'],
];

const AIR_CHARGES = [
  ['1', 'Air Freight', '450', '3.80', 'USD', '1,710.00'],
  ['2', 'Fuel Surcharge', '450', '0.45', 'USD', '202.50'],
  ['3', 'Security', '1', '35.00', 'USD', '35.00'],
];

const FCL_META = [
  { k: 'POL', v: 'CHENNAI, INDIA' },
  { k: 'POD', v: 'JEBEL ALI, UAE' },
  { k: 'Incoterm', v: 'FOB' },
  { k: 'Validity', v: '30 Days' },
  { k: 'Container', v: "1 x 20' DC" },
];

const AIR_META = [
  { k: 'Origin Airport', v: 'CHENNAI (MAA)' },
  { k: 'Dest. Airport', v: 'DUBAI (DXB)' },
  { k: 'Incoterm', v: 'CPT' },
  { k: 'Validity', v: '15 Days' },
  { k: 'Chargeable Wt', v: '450 KGS' },
];

const HEADER_COLORS = ['primary', 'accent', 'fill', 'orange', 'cyan'];

function sharedDemo(n, extras = {}) {
  return {
    invoiceNo: `QTN-19-${String(n).padStart(4, '0')}`,
    invoiceDate: '28-JAN-19',
    dueDate: '28-FEB-19',
    quotationNo: `QTN-19-${String(n).padStart(4, '0')}`,
    billToName: 'AL NASER TRADING COMPANY LLC',
    billToAddress: '30 AL MAKTHOOM BUILDING, SHARJAH UAE',
    currency: 'USD',
    partyLeft: SHIPPER,
    partyMid: CONSIGNEE,
    subtotal: extras.subtotal || '1,380.00',
    tax: extras.tax || '0.00',
    total: extras.total || '1,380.00',
    words: extras.words || 'USD One Thousand Three Hundred Eighty Only',
    remarks: `Format-${n}`,
    ...extras,
  };
}

/** Same header + footer; different body composition per format. */
function quotationVariant(n) {
  const headerColor = HEADER_COLORS[(n - 1) % HEADER_COLORS.length];
  const title = `QUOTATION — FORMAT ${n}`;
  const badge = `Format-${n}`;

  // Shared bookends
  const header = [
    { type: 'companyHeader', showContact: true },
    { type: 'formatBadge' },
  ];
  const footer = [{ type: 'colorfulFooter' }];

  switch (n) {
    case 1:
      return layout({
        demo: sharedDemo(n, {
          fieldGrid: [...FCL_META, { k: 'Layout', v: 'Classic FCL quotation' }],
          tableHeaders: ['#', 'Charge', 'Qty', 'Rate', 'Currency', 'Amount'],
          tableRows: CHARGES,
          termsLines: ['Classic sea quotation — rates subject to space.'],
        }),
        blocks: [
          ...header,
          { type: 'docTitle', text: title, align: 'center', band: true },
          { type: 'partyTriple' },
          { type: 'fieldGrid', cols: 2 },
          { type: 'chargeTable', headerColor },
          { type: 'wordsAndTotal' },
          { type: 'termsBank' },
          { type: 'signatureRow' },
          ...footer,
        ],
      });
    case 2:
      return layout({
        demo: sharedDemo(n, {
          letterBody:
            'Thank you for your enquiry. Please find our competitive quotation as below.',
          fieldGrid: FCL_META,
          tableHeaders: ['#', 'Charge', 'Qty', 'Rate', 'Currency', 'Amount'],
          tableRows: CHARGES,
          termsLines: ['Letter-style quotation with intro paragraph.'],
        }),
        blocks: [
          ...header,
          { type: 'docTitle', text: title, align: 'center', band: true },
          { type: 'letterBody' },
          { type: 'partyTriple' },
          { type: 'fieldGrid', cols: 3 },
          { type: 'chargeTable', headerColor },
          { type: 'wordsAndTotal' },
          { type: 'termsBank' },
          ...footer,
        ],
      });
    case 3:
      return layout({
        demo: sharedDemo(n, {
          fieldGrid: AIR_META,
          tableHeaders: ['#', 'Charge', 'Chg Wt', 'Rate', 'Currency', 'Amount'],
          tableRows: AIR_CHARGES,
          subtotal: '1,947.50',
          total: '1,947.50',
          words: 'USD One Thousand Nine Hundred Forty Seven And 50/100',
          termsLines: ['Air quotation layout — chargeable weight based.'],
        }),
        blocks: [
          ...header,
          { type: 'docTitle', text: 'AIR QUOTATION — FORMAT 3', align: 'center', band: true },
          { type: 'fieldGrid', cols: 2 },
          { type: 'partyTriple' },
          { type: 'chargeTable', headerColor },
          { type: 'wordsAndTotal' },
          { type: 'signatureRow' },
          { type: 'termsBank' },
          ...footer,
        ],
      });
    case 4:
      return layout({
        paper: 'Letter',
        demo: sharedDemo(n, {
          fieldGrid: [...FCL_META, { k: 'Paper', v: 'US Letter' }],
          tableHeaders: ['#', 'Description', 'Qty', 'Unit', 'Curr', 'Amount'],
          tableRows: CHARGES,
          termsLines: ['US Letter paper quotation format.'],
        }),
        blocks: [
          ...header,
          { type: 'docTitle', text: title, align: 'center', band: true },
          { type: 'partyTriple' },
          { type: 'chargeTable', headerColor },
          { type: 'fieldGrid', cols: 2 },
          { type: 'wordsAndTotal' },
          { type: 'termsBank' },
          { type: 'signatureRow' },
          ...footer,
        ],
      });
    case 5:
      return layout({
        demo: sharedDemo(n, {
          fieldGrid: FCL_META,
          tableHeaders: ['Charge Code', 'Description', 'Amount (USD)'],
          tableRows: [
            ['OFR', 'Ocean Freight', '1,250.00'],
            ['THC', 'Terminal Handling', '85.00'],
            ['DOC', 'Documentation', '45.00'],
          ],
          termsLines: ['Compact 3-column charge summary.'],
        }),
        blocks: [
          ...header,
          { type: 'docTitle', text: title, align: 'center', band: true },
          { type: 'fieldGrid', cols: 2 },
          { type: 'chargeTable', headerColor },
          { type: 'wordsAndTotal' },
          { type: 'signatureRow' },
          ...footer,
        ],
      });
    case 6:
      return layout({
        demo: sharedDemo(n, {
          letterBody: 'Quotation valid for 30 days from date of issue.',
          fieldGrid: [
            ...FCL_META,
            { k: 'Salesperson', v: 'A. Kumar' },
            { k: 'Branch', v: 'Dubai' },
          ],
          tableHeaders: ['#', 'Charge', 'Qty', 'Rate', 'Currency', 'Amount'],
          tableRows: CHARGES,
          agingHeaders: ['Freight', 'Local', 'Docs', 'Total'],
          agingRow: ['1,250.00', '85.00', '45.00', '1,380.00'],
          termsLines: ['Includes charge summary strip.'],
        }),
        blocks: [
          ...header,
          { type: 'docTitle', text: title, align: 'center', band: true },
          { type: 'letterBody' },
          { type: 'fieldGrid', cols: 3 },
          { type: 'partyTriple' },
          { type: 'chargeTable', headerColor },
          { type: 'agingSummary' },
          { type: 'wordsAndTotal' },
          { type: 'termsBank' },
          ...footer,
        ],
      });
    case 7:
      return layout({
        demo: sharedDemo(n, {
          partyNotify: {
            title: 'Notify / Customer',
            lines: CONSIGNEE.lines,
          },
          fieldGrid: FCL_META,
          tableHeaders: ['#', 'Charge', 'Qty', 'Rate', 'Currency', 'Amount'],
          tableRows: [...CHARGES, ['4', 'Insurance', '1', '28.00', 'USD', '28.00']],
          subtotal: '1,408.00',
          total: '1,408.00',
          words: 'USD One Thousand Four Hundred Eight Only',
          termsLines: ['Four-party notify layout with insurance line.'],
        }),
        blocks: [
          ...header,
          { type: 'docTitle', text: title, align: 'center', band: true },
          { type: 'partyTriple' },
          { type: 'fieldGrid', cols: 2 },
          { type: 'chargeTable', headerColor },
          { type: 'containerStrip' },
          { type: 'wordsAndTotal' },
          { type: 'termsBank' },
          { type: 'signatureRow' },
          ...footer,
        ],
      });
    case 8:
      return layout({
        demo: sharedDemo(n, {
          fieldGrid: [
            { k: 'Quote Type', v: 'FCL Export' },
            { k: 'Transit', v: '9 Days' },
            ...FCL_META,
          ],
          tableHeaders: ['#', 'Charge', 'Buy', 'Sell', 'Curr', 'Profit'],
          tableRows: [
            ['1', 'Ocean Freight', '1,100.00', '1,250.00', 'USD', '150.00'],
            ['2', 'THC', '70.00', '85.00', 'USD', '15.00'],
            ['3', 'Docs', '30.00', '45.00', 'USD', '15.00'],
          ],
          termsLines: ['Buy/Sell/Profit quotation sheet.'],
        }),
        blocks: [
          ...header,
          { type: 'docTitle', text: 'QUOTATION WITH MARGIN — FORMAT 8', align: 'center', band: true },
          { type: 'fieldGrid', cols: 2 },
          { type: 'chargeTable', headerColor },
          { type: 'wordsAndTotal' },
          { type: 'termsBank' },
          { type: 'signatureRow' },
          ...footer,
        ],
      });
    case 9:
      return layout({
        demo: sharedDemo(n, {
          letterBody: 'Please confirm acceptance by return email to proceed with booking.',
          fieldGrid: AIR_META,
          tableHeaders: ['#', 'Charge', 'Chg Wt', 'Rate', 'Currency', 'Amount'],
          tableRows: AIR_CHARGES,
          subtotal: '1,947.50',
          total: '1,947.50',
          words: 'USD One Thousand Nine Hundred Forty Seven And 50/100',
          termsLines: ['Air pre-alert style quotation confirmation.'],
        }),
        blocks: [
          ...header,
          { type: 'docTitle', text: title, align: 'center', band: true },
          { type: 'letterBody' },
          { type: 'chargeTable', headerColor },
          { type: 'fieldGrid', cols: 2 },
          { type: 'partyTriple' },
          { type: 'wordsAndTotal' },
          { type: 'signatureRow' },
          ...footer,
        ],
      });
    case 10:
      return layout({
        demo: sharedDemo(n, {
          fieldGrid: FCL_META,
          tableHeaders: ['#', 'Charge', 'Qty', 'Rate', 'Currency', 'Amount'],
          tableRows: CHARGES,
          bankLines: [
            'Bank: Emirates NBD',
            'Account: KingFisher Logistic LLC',
            'IBAN: AE070260001234567890123',
            'Swift: EBILAEAD',
          ],
          termsLines: ['Includes bank settlement details.'],
        }),
        blocks: [
          ...header,
          { type: 'docTitle', text: title, align: 'center', band: true },
          { type: 'partyTriple' },
          { type: 'fieldGrid', cols: 2 },
          { type: 'chargeTable', headerColor },
          { type: 'wordsAndTotal' },
          { type: 'termsBank' },
          { type: 'wireBox' },
          { type: 'signatureRow' },
          ...footer,
        ],
      });
    case 11:
      return layout({
        demo: sharedDemo(n, {
          fieldGrid: [
            { k: 'Mode', v: 'Sea FCL' },
            { k: 'Commodity', v: 'General Cargo' },
            ...FCL_META,
          ],
          tableHeaders: ['#', 'Charge', 'Qty', 'Rate', 'Currency', 'Amount'],
          tableRows: CHARGES,
          containerHeaders: ['Container', 'Type', 'Payload'],
          containerRow: ['TBA', "20' DC", '18,000 KGS'],
          termsLines: ['Shipment + container planning quotation.'],
        }),
        blocks: [
          ...header,
          { type: 'docTitle', text: title, align: 'center', band: true },
          { type: 'fieldGrid', cols: 3 },
          { type: 'containerStrip' },
          { type: 'chargeTable', headerColor },
          { type: 'partyTriple' },
          { type: 'wordsAndTotal' },
          { type: 'termsBank' },
          ...footer,
        ],
      });
    case 12:
      return layout({
        demo: sharedDemo(n, {
          fieldGrid: FCL_META,
          tableHeaders: ['Sl', 'Particulars', 'Amount'],
          tableRows: [
            ['1', 'Ocean Freight FCL', '1,250.00'],
            ['2', 'Origin Local Charges', '85.00'],
            ['3', 'Documentation Fee', '45.00'],
            ['', 'Grand Total (USD)', '1,380.00'],
          ],
          termsLines: ['Simple particulars list — India trade style.'],
        }),
        blocks: [
          ...header,
          { type: 'docTitle', text: title, align: 'center', band: true },
          { type: 'partyTriple' },
          { type: 'chargeTable', headerColor },
          { type: 'fieldGrid', cols: 2 },
          { type: 'wordsAndTotal' },
          { type: 'signatureRow' },
          { type: 'termsBank' },
          ...footer,
        ],
      });
    case 13:
      return layout({
        demo: sharedDemo(n, {
          letterBody: 'This quotation supersedes all previous offers for the same shipment.',
          fieldGrid: [...FCL_META, { k: 'Revision', v: 'Rev-B' }],
          tableHeaders: ['#', 'Charge', 'Qty', 'Rate', 'Currency', 'Amount'],
          tableRows: CHARGES,
          termsLines: ['Revision-aware quotation layout.'],
        }),
        blocks: [
          ...header,
          { type: 'docTitle', text: title, align: 'center', band: true },
          { type: 'letterBody' },
          { type: 'fieldGrid', cols: 2 },
          { type: 'chargeTable', headerColor },
          { type: 'partyTriple' },
          { type: 'wordsAndTotal' },
          { type: 'termsBank' },
          { type: 'signatureRow' },
          ...footer,
        ],
      });
    case 14:
      return layout({
        demo: sharedDemo(n, {
          fieldGrid: AIR_META,
          tableHeaders: ['#', 'Charge', 'Chg Wt', 'Rate', 'Currency', 'Amount'],
          tableRows: AIR_CHARGES,
          subtotal: '1,947.50',
          tax: '97.38',
          total: '2,044.88',
          words: 'USD Two Thousand Forty Four And 88/100',
          termsLines: ['VAT-inclusive air quotation.'],
        }),
        blocks: [
          ...header,
          { type: 'docTitle', text: 'QUOTATION WITH TAX — FORMAT 14', align: 'center', band: true },
          { type: 'partyTriple' },
          { type: 'fieldGrid', cols: 2 },
          { type: 'chargeTable', headerColor },
          { type: 'subtotalBar', variant: 'tax' },
          { type: 'wordsAndTotal' },
          { type: 'termsBank' },
          ...footer,
        ],
      });
    case 15:
    default:
      return layout({
        demo: sharedDemo(n, {
          letterBody: 'We look forward to your confirmation to proceed with booking.',
          fieldGrid: [
            ...FCL_META,
            { k: 'Prepared By', v: 'Commercial Team' },
            { k: 'Approved By', v: 'Branch Manager' },
          ],
          tableHeaders: ['#', 'Charge', 'Qty', 'Rate', 'Currency', 'Amount'],
          tableRows: CHARGES,
          signatureLabels: ['Prepared By', 'Checked By', 'Approved By'],
          termsLines: ['Executive approval quotation format.'],
        }),
        blocks: [
          ...header,
          { type: 'docTitle', text: title, align: 'center', band: true },
          { type: 'letterBody' },
          { type: 'partyTriple' },
          { type: 'fieldGrid', cols: 3 },
          { type: 'chargeTable', headerColor },
          { type: 'wordsAndTotal' },
          { type: 'termsBank' },
          { type: 'signatureRow' },
          ...footer,
        ],
      });
  }
}

const layouts = CATALOG.map(([code, name, n]) => {
  const base = quotationVariant(n);
  return {
    code,
    formatNumber: n,
    name,
    paper: base.paper || 'A4',
    rtl: false,
    theme: base.theme || THEME,
    branding: base.branding || BRAND,
    demo: { ...base.demo, remarks: `Format-${n}` },
    blocks: base.blocks,
  };
});

const outJson = path.join(root, 'src/features/reports/data/quotationFormatUiLayouts.json');
const outTs = path.join(root, 'src/features/reports/data/quotationFormatUiLayouts.generated.ts');
fs.writeFileSync(outJson, `${JSON.stringify(layouts, null, 2)}\n`, 'utf8');
fs.writeFileSync(
  outTs,
  `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
    `/** Auto-generated Quotation formats — run: node scripts/build-quotation-format-ui-layouts.mjs */\n` +
    `export const QUOTATION_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = ${JSON.stringify(
      layouts,
      null,
      2,
    )} as InvoiceFormatUiLayout[];\n`,
  'utf8',
);

const unique = new Set(layouts.map((l) => JSON.stringify(l.blocks))).size;
console.log(`Wrote ${layouts.length} quotation layouts (${unique} distinct block structures)`);
