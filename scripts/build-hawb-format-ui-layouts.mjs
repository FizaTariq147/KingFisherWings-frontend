/**
 * HAWB formats — exact Fresa sample-report-formats list (5).
 * https://fresatechnologies.com/sample-report-formats/
 * KingFisher logo / company chrome only.
 *
 * Usage: node scripts/build-hawb-format-ui-layouts.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const BRAND = {
  company: 'KingFisher Wings',
  address: 'Dubai, United Arab Emirates',
  web: 'www.kingfisherwingsgroup.com',
  phone: '+971 55 5355 286',
  email: 'inquiry@kingfishertec.com',
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

/** Exact Fresa sample page — do not add extras. */
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
  title: "Shipper's Name and Address",
  lines: [
    '4G LOGISTICS INDIA PVT LTD',
    '10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD',
    'CHENNAI TAMIL NADU 600084 INDIA',
  ],
};

const CONSIGNEE = {
  title: "Consignee's Name and Address",
  lines: [
    'AL NASER TRADING COMPANY LLC',
    '30 AL MAKTHOOM BUILDING',
    'SHARJAH UAE',
  ],
};

const AGENT = {
  title: 'Issuing Carrier’s Agent Name and City',
  lines: ['KingFisher Wings', 'Dubai, United Arab Emirates', 'IATA Code : 16-4 1234 / 0123'],
};

const ROUTE = [
  { k: 'Airport of Departure (Addr. of First Carrier) and Requested Routing', v: 'CHENNAI (MAA)' },
  { k: 'Airport of Destination', v: 'DUBAI (DXB)' },
  { k: 'Flight / Date', v: 'EK-512 / 29-JAN-19' },
  { k: 'To / By First Carrier', v: 'DXB / EK' },
  { k: 'Currency', v: 'USD' },
  { k: 'CHGS Code', v: 'PP' },
];

const GOODS_HEADERS = [
  'No. of Pieces RCP',
  'Gross Weight',
  'kg lb',
  'Rate Class',
  'Commodity Item No.',
  'Chargeable Weight',
  'Rate / Charge',
  'Total',
  'Nature and Quantity of Goods',
];
const GOODS_ROW = [
  '125',
  '18000.0',
  'K',
  'Q',
  '',
  '18000.0',
  'AS AGREED',
  'AS PER AWB',
  'STC: VALVE MATERIALS FOR MACHINERY PARTS',
];

function layout(partial) {
  return {
    paper: partial.paper || 'A4',
    rtl: false,
    theme: { ...THEME, ...(partial.theme || {}) },
    branding: BRAND,
    demo: partial.demo,
    blocks: partial.blocks,
  };
}

function baseDemo(opts = {}) {
  const draft = opts.draft !== false;
  return {
    invoiceNo: 'PLMAAJEA00081',
    invoiceDate: '29-JAN-19',
    formatBadgeLabel: opts.badge,
    heroTitle: draft ? 'HAWB DRAFT' : 'HAWB ORIGINAL',
    partyLeft: SHIPPER,
    partyMid: CONSIGNEE,
    partyNotify: AGENT,
    fieldGrid: [
      { k: 'HAWB No.', v: 'PLMAAJEA00081' },
      { k: 'MAWB No.', v: '176-12345678' },
      { k: 'Shipper’s Account Number', v: '—' },
      { k: 'Consignee’s Account Number', v: '—' },
      { k: 'Accounting Information', v: 'FREIGHT PREPAID' },
      { k: 'Reference Number', v: 'CEXP190150' },
      { k: 'Declared Value for Carriage', v: 'NVD' },
      { k: 'Declared Value for Customs', v: 'NCV' },
      { k: 'Amount of Insurance', v: 'XXX' },
      { k: 'Handling Information', v: 'HANDLE WITH CARE' },
      { k: 'SCI', v: '' },
      ...(opts.extraGrid || []),
    ],
    hawbRouteFields: ROUTE,
    tableHeaders: GOODS_HEADERS,
    tableRows: [GOODS_ROW],
    termsLines: [
      draft
        ? 'DRAFT — Not valid for carriage until issued as original Air Waybill.'
        : 'ORIGINAL — For carrier pre-printed stock / negotiable when duly signed.',
      'It is agreed that the goods described herein are accepted for carriage subject to the conditions of contract.',
      'Shipper certifies that the particulars on the face hereof are correct.',
    ],
    remarks: opts.badge,
    signatureLabels: ['Signature of Shipper or Agent', 'Signature of Issuing Carrier or Agent'],
  };
}

/** Fresa HAWB Draft — classic party + route + goods table. */
function hawbDraft() {
  return layout({
    demo: baseDemo({ draft: true, badge: 'HAWB Draft Report Format' }),
    blocks: [
      { type: 'companyHeader', showContact: true, title: 'HOUSE AIR WAYBILL' },
      { type: 'formatBadge', label: 'DRAFT' },
      { type: 'docTitle', text: 'HOUSE AIR WAYBILL — DRAFT', align: 'center', band: true },
      { type: 'partyNotifyGrid' },
      { type: 'hawbRouteGrid' },
      { type: 'fieldGrid', cols: 2 },
      { type: 'chargeTable', headerColor: 'primary' },
      { type: 'termsBank' },
      { type: 'signatureRow' },
      { type: 'colorfulFooter' },
    ],
  });
}

/** Fresa HAWB Draft Format-1 — badge + export meta + accent goods header. */
function hawbDraft1() {
  return layout({
    theme: { ...THEME, primary: '#0A3D73', accent: '#1A6FA8' },
    demo: baseDemo({
      draft: true,
      badge: 'HAWB Draft Report Format-1',
      extraGrid: [{ k: 'Layout', v: 'Draft Format-1' }],
    }),
    blocks: [
      { type: 'companyHeader', showContact: true },
      { type: 'formatBadge', label: 'DRAFT FORMAT-1' },
      { type: 'docTitle', text: 'HOUSE AIR WAYBILL — DRAFT FORMAT 1', align: 'start', band: true },
      { type: 'exportMetaStrip' },
      { type: 'partyNotifyGrid' },
      { type: 'hawbRouteGrid' },
      { type: 'fieldGrid', cols: 3 },
      { type: 'chargeTable', headerColor: 'accent' },
      { type: 'termsBank' },
      { type: 'signatureRow' },
      { type: 'colorfulFooter' },
    ],
  });
}

/** Fresa HAWB Draft Format-2 — summary hero + cyan charges. */
function hawbDraft2() {
  return layout({
    theme: { ...THEME, primary: '#0F4D96', cyan: '#7EC8F0' },
    demo: {
      ...baseDemo({
        draft: true,
        badge: 'HAWB Draft Report Format-2',
        extraGrid: [{ k: 'Layout', v: 'Draft Format-2' }],
      }),
      docSubtitle: 'HAWB DRAFT FORMAT-2',
    },
    blocks: [
      { type: 'summaryHero' },
      { type: 'companyHeader', showContact: true },
      { type: 'docTitle', text: 'HOUSE AIR WAYBILL — DRAFT FORMAT 2', align: 'center', band: true },
      { type: 'partyNotifyGrid' },
      { type: 'hawbRouteGrid' },
      { type: 'fieldGrid', cols: 2 },
      { type: 'chargeTable', headerColor: 'cyan' },
      { type: 'containerStrip' },
      { type: 'termsBank' },
      { type: 'stampSignature' },
      { type: 'colorfulFooter' },
    ],
  });
}

/** Fresa HAWB Original Pre Printed Format-1. */
function hawbOriginal1() {
  return layout({
    theme: { ...THEME, primary: '#1A1A1A', orange: '#C45C00', fill: '#FAFAFA' },
    demo: baseDemo({
      draft: false,
      badge: 'HAWB Original Pre Printed Report Format-1',
      extraGrid: [
        { k: 'Stock', v: 'Pre-printed Format-1' },
        { k: 'Document Type', v: 'ORIGINAL' },
      ],
    }),
    blocks: [
      { type: 'companyHeader', showContact: true, title: 'AIR WAYBILL' },
      { type: 'formatBadge', label: 'ORIGINAL PRE-PRINTED 1' },
      {
        type: 'docTitle',
        text: 'HOUSE AIR WAYBILL — ORIGINAL (PRE-PRINTED) FORMAT 1',
        align: 'center',
        band: true,
      },
      { type: 'partyNotifyGrid' },
      { type: 'hawbRouteGrid' },
      { type: 'fieldGrid', cols: 2 },
      { type: 'chargeTable', headerColor: 'orange' },
      { type: 'termsBank' },
      { type: 'signatureRow' },
      { type: 'colorfulFooter' },
    ],
  });
}

/** Fresa HAWB Original Pre Printed Format-2. */
function hawbOriginal2() {
  return layout({
    theme: { ...THEME, primary: '#0F4D96', fill: '#EEF4FA' },
    demo: baseDemo({
      draft: false,
      badge: 'HAWB Original Pre Printed Report Format-2',
      extraGrid: [
        { k: 'Stock', v: 'Pre-printed Format-2' },
        { k: 'Document Type', v: 'ORIGINAL' },
      ],
    }),
    blocks: [
      { type: 'colorBar' },
      { type: 'companyHeader', showContact: true, title: 'AIR WAYBILL' },
      { type: 'formatBadge', label: 'ORIGINAL PRE-PRINTED 2' },
      {
        type: 'docTitle',
        text: 'HOUSE AIR WAYBILL — ORIGINAL (PRE-PRINTED) FORMAT 2',
        align: 'end',
        band: true,
      },
      { type: 'partyNotifyGrid' },
      { type: 'hawbRouteGrid' },
      { type: 'exportMetaStrip' },
      { type: 'fieldGrid', cols: 3 },
      { type: 'chargeTable', headerColor: 'fill' },
      { type: 'termsBank' },
      { type: 'stampSignature' },
      { type: 'colorfulFooter' },
    ],
  });
}

const KINDS = {
  hawb_draft: hawbDraft,
  hawb_draft_format_1: hawbDraft1,
  hawb_draft_format_2: hawbDraft2,
  hawb_original_pre_printed_1: hawbOriginal1,
  hawb_original_pre_printed_2: hawbOriginal2,
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

// Move any previous non-official HAWB rows into leftover (keep deep-link resolve via leftover).
const keep = new Set(CATALOG.map(([c]) => c));
const prevPath = outJson;
if (fs.existsSync(prevPath)) {
  const prev = JSON.parse(fs.readFileSync(prevPath, 'utf8'));
  const leftoverPath = path.join(root, 'src/features/reports/data/leftoverFormatUiLayouts.json');
  const leftover = JSON.parse(fs.readFileSync(leftoverPath, 'utf8'));
  const seen = new Set(leftover.map((r) => String(r.code || '').toUpperCase()));
  let moved = 0;
  for (const row of prev) {
    if (keep.has(row.code)) continue;
    const key = String(row.code || '').toUpperCase();
    if (!key || seen.has(key)) continue;
    leftover.push(row);
    seen.add(key);
    moved += 1;
  }
  if (moved) {
    fs.writeFileSync(leftoverPath, `${JSON.stringify(leftover, null, 2)}\n`, 'utf8');
    fs.writeFileSync(
      path.join(root, 'src/features/reports/data/leftoverFormatUiLayouts.generated.ts'),
      `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
        `/** Permanent JSON UI layouts — leftoverFormatUiLayouts. */\n` +
        `export const LEFTOVER_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = ${JSON.stringify(
          leftover,
          null,
          2,
        )} as InvoiceFormatUiLayout[];\n`,
      'utf8',
    );
    console.log(`Moved ${moved} non-official HAWB layouts to leftover`);
  }
}

fs.writeFileSync(outJson, `${JSON.stringify(layouts, null, 2)}\n`, 'utf8');
fs.writeFileSync(
  outTs,
  `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
    `/** Auto-generated HAWB — exact Fresa sample-report-formats (5). KingFisher logo. */\n` +
    `export const HAWB_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = ${JSON.stringify(
      layouts,
      null,
      2,
    )} as InvoiceFormatUiLayout[];\n`,
  'utf8',
);
console.log(`Wrote ${layouts.length} HAWB layouts (Fresa sample page exact)`);
