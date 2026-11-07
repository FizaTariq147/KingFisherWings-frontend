/**
 * HAWB formats matching Fresa official IATA Air Waybill sample PDFs.
 * https://fresatechnologies.com/sample-report-formats/
 *
 * Usage: node scripts/build-hawb-format-ui-layouts.mjs
 *
 * Page-1 = HOUSE AIR WAYBILL / Air Waybill form (hawbAwbShell).
 * Terms & Conditions remain the separate Airway T&C PDF append (unchanged).
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
  email: 'inquiry@kingfishertec.com',
  logo: 'kingfisher',
};

/** Near-black IATA form ink (Fresa HAWB samples). */
const THEME = {
  primary: '#101010',
  accent: '#2286C8',
  fill: '#F7F7F7',
  panel: '#EFEFEF',
  orange: '#F7A21C',
  red: '#DE1F26',
  cyan: '#9AD7FF',
  ink: '#101010',
  gray: '#656565',
  white: '#FFFFFF',
};

const CATALOG = [
  ['HAWB_DRAFT_REPORT_FORMAT', 'HAWB Draft Report Format', 'draft', 1],
  ['HAWB_DRAFT_REPORT_FORMAT_1', 'HAWB Draft Report Format-1', 'draft1', 2],
  ['HAWB_DRAFT_REPORT_FORMAT_2', 'HAWB Draft Report Format-2', 'draft2', 3],
  [
    'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1',
    'HAWB Original Pre Printed Report Format-1',
    'original1',
    4,
  ],
  [
    'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2',
    'HAWB Original Pre Printed Report Format-2',
    'original2',
    5,
  ],
];

const SHIPPER = {
  title: "Shipper's Name and Address",
  lines: [
    'BABU SECTOR PTLTD',
    '144/78B GKM TOWERS MUTHUSAMY STREET, NEAR A2B SIGNAL,',
    'NEELANKARAI CHENNAI TAMILNADU INDIA',
    'CHENNAI, INDIA',
  ],
};

const CONSIGNEE = {
  title: "Consignee's Name and Address",
  lines: [
    'AL NASER TRADING COMPANY LLC',
    '30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE ROUND ABOUT',
    'AL NABHA SHARJAH UNITED ARAB EMIRATES',
  ],
};

const AGENT = {
  title: "Issuing Carrier' Agent Name and city",
  lines: ['KingFisher Logistic', 'Dubai, United Arab Emirates', 'PHONE: +971 55 5355 286'],
};

const NOTIFY = {
  title: 'Notify Party',
  lines: [...CONSIGNEE.lines],
};

function fieldGrid() {
  return [
    { k: 'HAWB No.', v: 'MAA/DXB/1900014' },
    { k: 'MAWB No.', v: '176-23456882' },
    { k: 'JOB NO.', v: 'CAE190028' },
    { k: 'Airport of Departure', v: 'CHENNAI (MAA)' },
    { k: 'Airport of Destination', v: 'DUBAI INTERNATIONAL AIRPORT' },
    { k: 'Flight / Date', v: 'EK9876 / 20-FEB-19' },
    { k: 'Currency', v: 'INR' },
    { k: 'WT/VAL', v: 'PP' },
    { k: 'Other', v: 'PP' },
    { k: 'Declared Value Carriage', v: 'N.V.D.' },
    { k: 'Declared Value Customs', v: 'AS PER INV' },
    { k: 'Amount of Insurance', v: 'NIL' },
    { k: 'Pieces', v: '100' },
    { k: 'Gross Weight', v: '1,250.00' },
    { k: 'Chargeable Weight', v: '1,250.00' },
    { k: 'Rate / Charge', v: 'AS ARRANGED' },
    { k: 'Total', v: 'AS ARRANGED' },
    { k: 'Carrier', v: 'EMIRATES' },
    { k: 'Handling Information', v: 'FREIGHT PREPAID' },
    { k: 'Other Charges', v: 'AS ARRANGED' },
    { k: 'Accounting Information', v: 'JOB NO.: CAE190028' },
  ];
}

function hawbLayout(variant, opts = {}) {
  const draft = variant.startsWith('draft');
  const customs =
    variant === 'draft2' || variant === 'original2' ? 'N.C.V' : 'AS PER INV';
  const grid = fieldGrid().map((f) =>
    f.k === 'Declared Value Customs' ? { ...f, v: customs } : f,
  );

  return {
    paper: 'A4',
    rtl: false,
    appendCustomerTerms: true,
    theme: THEME,
    branding: BRAND,
    demo: {
      invoiceNo: 'MAA/DXB/1900014',
      invoiceDate: '18-FEB-19',
      currency: 'INR',
      formatBadgeLabel: opts.badge,
      heroTitle: draft ? 'HAWB DRAFT' : 'HAWB ORIGINAL',
      partyLeft: SHIPPER,
      partyMid: CONSIGNEE,
      partyNotify: variant === 'draft1' ? NOTIFY : AGENT,
      fieldGrid: grid,
      hawbRouteFields: [
        { k: 'Airport of Departure', v: 'CHENNAI (MAA)' },
        { k: 'Airport of Destination', v: 'DUBAI INTERNATIONAL AIRPORT' },
        { k: 'Flight / Date', v: 'EK9876 / 20-FEB-19' },
        { k: 'Pieces', v: '100' },
        { k: 'Gross Weight', v: '1,250.00' },
        { k: 'Chargeable Weight', v: '1,250.00' },
      ],
      tableHeaders: [
        'No. of Pieces RCP',
        'Gross Weight',
        'kg',
        'Rate Class',
        'Chargeable Weight',
        'Rate / Charge',
        'Total',
        'Nature and Quantity of Goods (Incl. Dimensions or Volume)',
      ],
      tableRows: [
        [
          '100',
          '1,250.00',
          'K',
          'Q',
          '1,250.00',
          'AS ARRANGED',
          'AS ARRANGED',
          'STC: PAPER CUPS\nTOTAL : (100) PACKAGES ONLY\nCTN 1-20\nDIMS IN CM',
        ],
      ],
      goodsDescription: 'STC: PAPER CUPS',
      remarks: 'FREIGHT PREPAID',
      hblCarrierAgent: 'EMIRATES',
      termsLines: [
        draft
          ? 'DRAFT — Not valid for carriage until issued as original AWB.'
          : 'ORIGINAL PRE-PRINTED — For carrier pre-printed stock.',
      ],
    },
    blocks: [
      { type: 'hawbAwbShell', variant },
      { type: 'colorfulFooter', variant: 'plain' },
    ],
  };
}

const layouts = CATALOG.map(([code, name, variant, n]) => {
  const base = hawbLayout(variant, {
    badge:
      variant === 'draft'
        ? 'Draft Report Format'
        : variant === 'draft1'
          ? 'Draft Report Format-1'
          : variant === 'draft2'
            ? 'Draft Report Format-2'
            : variant === 'original1'
              ? 'Original Pre Printed Format-1'
              : 'Original Pre Printed Format-2',
  });
  return {
    code,
    formatNumber: n,
    name,
    paper: base.paper,
    rtl: false,
    appendCustomerTerms: true,
    theme: base.theme,
    branding: base.branding,
    demo: base.demo,
    blocks: base.blocks,
  };
});

const outJson = path.join(root, 'src/features/reports/data/hawbFormatUiLayouts.json');
const outTs = path.join(root, 'src/features/reports/data/hawbFormatUiLayouts.generated.ts');
fs.writeFileSync(outJson, `${JSON.stringify(layouts, null, 2)}\n`, 'utf8');
fs.writeFileSync(
  outTs,
  `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
    `/** Auto-generated HAWB IATA shells — run: node scripts/build-hawb-format-ui-layouts.mjs */\n` +
    `export const HAWB_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = ${JSON.stringify(
      layouts,
      null,
      2,
    )} as InvoiceFormatUiLayout[];\n`,
  'utf8',
);
console.log(`Wrote ${layouts.length} Fresa-parity HAWB AWB layouts`);
