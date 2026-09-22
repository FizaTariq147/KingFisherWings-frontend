/**
 * HAWB formats from Fresa official report-format PDFs.
 * Usage: node scripts/build-hawb-format-ui-layouts.mjs
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

/** [code, name, kind, sortOrder] — synced with hawbFormatCatalog.ts */
const CATALOG = [
  ['HAWB_DRAFT_REPORT_FORMAT', 'HAWB Draft Report Format', 'hawb_draft', 1],
  ['HAWB_DRAFT_REPORT_FORMAT_1', 'HAWB Draft Report Format-1', 'hawb_draft_format_1', 2],
  ['HAWB_DRAFT_REPORT_FORMAT_2', 'HAWB Draft Report Format-2', 'hawb_draft_format_2', 3],
  [
    'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1',
    'HAWB Original Pre Printed Report Format-1',
    'hawb_original_pre_printed_1',
    4,
  ],
  [
    'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2',
    'HAWB Original Pre Printed Report Format-2',
    'hawb_original_pre_printed_2',
    5,
  ],
];

const SHIPPER = {
  title: 'Shipper',
  lines: [
    '4G LOGISTICS INDIA PVT LTD',
    '10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD',
    'CHENNAI TAMIL NADU 600084 INDIA',
  ],
};

const CONSIGNEE = {
  title: 'Consignee',
  lines: [
    'AL NASER TRADING COMPANY LLC',
    '30 AL MAKTHOOM BUILDING',
    'SHARJAH UAE',
  ],
};

const AGENT = {
  title: 'Issuing Carrier Agent',
  lines: ['KingFisher Logistic', 'Dubai, United Arab Emirates'],
};

const HAWB_META = [
  { k: 'HAWB No.', v: 'PLMAAJEA00081' },
  { k: 'MAWB No.', v: '176-12345678' },
  { k: 'Airport of Departure', v: 'CHENNAI (MAA)' },
  { k: 'Airport of Destination', v: 'DUBAI (DXB)' },
  { k: 'Flight / Date', v: 'EK-512 / 29-JAN-19' },
  { k: 'Currency', v: 'USD' },
  { k: 'WT/VAL', v: 'PPD' },
  { k: 'Other', v: 'PPD' },
  { k: 'Declared Value Carriage', v: 'NVD' },
  { k: 'Declared Value Customs', v: 'NCV' },
  { k: 'Amount of Insurance', v: 'XXX' },
  { k: 'Pieces', v: '125' },
  { k: 'Gross Weight', v: '18,000.0 K' },
  { k: 'Chargeable Weight', v: '18,000.0 K' },
  { k: 'Rate / Charge', v: 'As agreed' },
  { k: 'Total', v: 'As per AWB' },
];

const GOODS_HEADERS = ['No. of Pieces', 'Gross Weight', 'Rate Class', 'Nature of Goods'];
const GOODS_ROW = ['125', '18,000.0 K', 'Q', 'STC: VALVE MATERIALS FOR MACHINERY PARTS'];

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

function hawbLayout(title, opts = {}) {
  const { headerColor = 'primary', badge, extraGrid = [], draft = true } = opts;
  return layout({
    demo: {
      invoiceNo: 'PLMAAJEA00081',
      invoiceDate: '29-JAN-19',
      partyLeft: SHIPPER,
      partyMid: CONSIGNEE,
      partyNotify: AGENT,
      fieldGrid: [...HAWB_META, ...extraGrid],
      tableHeaders: GOODS_HEADERS,
      tableRows: [GOODS_ROW],
      termsLines: [
        draft
          ? 'DRAFT — Not valid for carriage until issued as original AWB.'
          : 'ORIGINAL PRE-PRINTED — For carrier pre-printed stock.',
        'Shipper certifies that particulars on the face hereof are correct.',
      ],
      remarks: badge,
    },
    blocks: [
      { type: 'companyHeader', showContact: true },
      ...(badge ? [{ type: 'formatBadge' }] : []),
      { type: 'docTitle', text: title, align: 'center', band: true },
      { type: 'partyTriple' },
      { type: 'fieldGrid', cols: 2 },
      { type: 'chargeTable', headerColor },
      { type: 'termsBank' },
      { type: 'signatureRow' },
      { type: 'colorfulFooter' },
    ],
  });
}

const KINDS = {
  hawb_draft: () =>
    hawbLayout('HOUSE AIR WAYBILL — HAWB DRAFT', {
      draft: true,
      headerColor: 'primary',
      badge: 'Draft Report Format',
    }),

  hawb_draft_format_1: () =>
    hawbLayout('HOUSE AIR WAYBILL — HAWB DRAFT FORMAT 1', {
      draft: true,
      headerColor: 'accent',
      badge: 'Draft Report Format-1',
      extraGrid: [{ k: 'Layout', v: 'Draft Format-1' }],
    }),

  hawb_draft_format_2: () =>
    hawbLayout('HOUSE AIR WAYBILL — HAWB DRAFT FORMAT 2', {
      draft: true,
      headerColor: 'fill',
      badge: 'Draft Report Format-2',
      extraGrid: [{ k: 'Layout', v: 'Draft Format-2' }],
    }),

  hawb_original_pre_printed_1: () =>
    hawbLayout('HOUSE AIR WAYBILL — ORIGINAL (PRE-PRINTED) FORMAT 1', {
      draft: false,
      headerColor: 'orange',
      badge: 'Original Pre Printed Format-1',
      extraGrid: [{ k: 'Stock', v: 'Pre-printed Format-1' }],
    }),

  hawb_original_pre_printed_2: () =>
    hawbLayout('HOUSE AIR WAYBILL — ORIGINAL (PRE-PRINTED) FORMAT 2', {
      draft: false,
      headerColor: 'cyan',
      badge: 'Original Pre Printed Format-2',
      extraGrid: [{ k: 'Stock', v: 'Pre-printed Format-2' }],
    }),
};

function buildRow([code, name, kind, n]) {
  const factory = KINDS[kind];
  if (!factory) throw new Error(`Missing kind ${kind}`);
  const base = factory();
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
const outJson = path.join(root, 'src/features/reports/data/hawbFormatUiLayouts.json');
const outTs = path.join(root, 'src/features/reports/data/hawbFormatUiLayouts.generated.ts');
fs.writeFileSync(outJson, JSON.stringify(layouts, null, 2) + '\n', 'utf8');
fs.writeFileSync(
  outTs,
  `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
    `/** Auto-generated HAWB formats — run: node scripts/build-hawb-format-ui-layouts.mjs */\n` +
    `export const HAWB_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = ${JSON.stringify(layouts, null, 2)} as InvoiceFormatUiLayout[];\n`,
  'utf8',
);
console.log(`Wrote ${layouts.length} HAWB layouts matched to Fresa report-format PDFs`);
