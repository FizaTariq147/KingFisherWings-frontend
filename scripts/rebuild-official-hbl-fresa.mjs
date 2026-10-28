/**
 * Rebuild HBL layout store to:
 * - Exact Fresa sample-report-formats HBL list (Jasper + 2 + 4…20)
 * - Plus FG_HBL_HKG for classic BL draft (not listed on marketing strip)
 * - Move former extras into leftoverFormatUiLayouts.json
 *
 * Usage: node scripts/rebuild-official-hbl-fresa.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { blockSignature } from './lib/fresaLayoutDiversity.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');

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
  lines: ['AL NASER TRADING COMPANY LLC', '30 AL MAKTHOOM BUILDING', 'SHARJAH UAE'],
};
const NOTIFY = {
  title: 'Notify Party',
  lines: [
    'AL NASER TRADING COMPANY LLC',
    'POST BOX : 12356',
    '30 AL MAKTHOOM BUILDING',
    'AL NABHA SHARJAH UAE',
  ],
};

const CARGO_HEADERS = [
  'Container No. / Seal No. / Mark & No.',
  'No. of Pkgs or Shipping Units',
  'Description of Goods & Pkgs.',
  'Gross Weight',
  'Measurement',
];
const CARGO_ROW = [
  "ABCU9877666 / SEAL NO. : SL345566 / 20' DC X 1\nNIL MARKS",
  '125 PACKAGES',
  "FCL STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
  '18,000.000 KGS',
  '24.000 CBM',
];

const META = [
  { k: 'Bill of Lading No.', v: 'PLMAAJEA00081' },
  { k: 'Job No.', v: 'CEXP190150' },
  { k: 'Place of Receipt', v: 'CHENNAI (EX MADRAS), INDIA' },
  { k: 'Port of Loading', v: 'CHENNAI (EX MADRAS), INDIA' },
  { k: 'Vessel / Voyage No.', v: 'CMA CGM / 9887' },
  { k: 'Port of Discharge', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
  { k: 'Place of Delivery', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
  { k: 'No. of Bills of Lading', v: '1(ONE)' },
  { k: 'Freight', v: 'PREPAID' },
  { k: 'Payable At', v: 'CHENNAI AS ARRANGED' },
  { k: 'Onboard Date', v: '16-JAN-19' },
  { k: 'Place and Date of Issue', v: 'CHENNAI 28-JAN-19' },
];

/** Official Fresa sample page HBL codes + FG_HBL_HKG for BL draft. */
const OFFICIAL = [
  ['HBL_DRAFT_REPORT_FORMAT_JASPER', 'HBL Draft Report Format Jasper', 1],
  ['HBL_DRAFT_REPORT_FORMAT_2', 'HBL Draft Report Format-2', 2],
  ...[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((n, i) => [
    `HBL_DRAFT_REPORT_FORMAT_${n}`,
    `HBL Draft Report Format-${n}`,
    3 + i,
  ]),
  ['FG_HBL_HKG', 'FG HBL HKG', 100],
];

const KEEP = new Set(OFFICIAL.map(([c]) => c));

function classicDemo(badge, extra = []) {
  return {
    invoiceNo: 'PLMAAJEA00081',
    invoiceDate: '28-JAN-19',
    formatBadgeLabel: badge,
    heroTitle: 'BILL OF LADING',
    partyLeft: SHIPPER,
    partyMid: CONSIGNEE,
    partyNotify: NOTIFY,
    fieldGrid: [...META, ...extra],
    hblCargoHeaders: CARGO_HEADERS,
    hblCargoRows: [CARGO_ROW],
    containerNote: "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
    hblFreightText: 'FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED',
    hblOnboardDate: '16-JAN-19',
    hblPlaceDate: 'CHENNAI 28-JAN-19',
    hblCarrierAgent: 'CMA CGM',
    termsLines: [
      'DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED "TO ORDER"',
      'RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.',
      'AS AGENT FOR THE CARRIER',
    ],
    remarks: badge,
  };
}

/**
 * Classic Fresa HBL face (FG HKG structure) with per-format block variants.
 * Always: companyHeader + partyNotifyGrid + hblCargoTable + hblFreightSignature.
 */
function classicHbl(name, sortOrder, variant) {
  const badge = name.replace(/^HBL Draft Report Format\s*/i, '').trim() || 'DRAFT';
  const titleAlign = variant % 3 === 0 ? 'center' : variant % 3 === 1 ? 'start' : 'end';
  const band = variant % 2 === 0;
  const cols = /** @type {1|2|3} */ ([2, 3, 1, 2, 3][variant % 5]);
  const extras = [];
  if (variant % 4 === 1) extras.push({ type: 'formatBadge', label: badge.toUpperCase() });
  if (variant % 5 === 2) extras.push({ type: 'exportMetaStrip' });
  if (variant % 6 === 3) extras.push({ type: 'letterBody' });
  if (variant % 7 === 4) extras.push({ type: 'containerStrip' });
  if (variant % 3 === 1) extras.push({ type: 'usaNumberedFields' });
  if (variant % 4 === 2) extras.push({ type: 'agingSummary' });

  // Unique visible title per Fresa format (drives visual-shell uniqueness).
  const titleText =
    variant === 0
      ? 'HOUSE BILL OF LADING — DRAFT (JASPER)'
      : `HOUSE BILL OF LADING — DRAFT FORMAT ${badge.replace(/^Format-?/i, '') || sortOrder}`;

  const head = [
    { type: 'companyHeader', showContact: true },
    ...extras.filter((b) => b.type === 'formatBadge'),
    {
      type: 'docTitle',
      text: titleText,
      align: titleAlign,
      band,
    },
    ...extras.filter((b) => b.type !== 'formatBadge'),
  ];

  const bodyPatterns = [
    [
      { type: 'partyNotifyGrid' },
      { type: 'fieldGrid', cols },
      { type: 'hblCargoTable' },
      { type: 'hblFreightSignature' },
      { type: 'termsBank' },
    ],
    [
      { type: 'partyNotifyGrid' },
      { type: 'hblCargoTable' },
      { type: 'fieldGrid', cols },
      { type: 'hblFreightSignature' },
      { type: 'wordsAndTotal' },
      { type: 'termsBank' },
    ],
    [
      { type: 'twoColumn', showBillTo: false, rightMetaFrom: 'metaRows' },
      { type: 'partyNotifyGrid' },
      { type: 'hblCargoTable' },
      { type: 'hblFreightSignature' },
      { type: 'termsBank' },
    ],
    [
      { type: 'partyNotifyGrid' },
      { type: 'exportMetaStrip' },
      { type: 'fieldGrid', cols },
      { type: 'hblCargoTable' },
      { type: 'chargeTable', headerColor: ['primary', 'accent', 'cyan'][variant % 3] },
      { type: 'hblFreightSignature' },
    ],
    [
      { type: 'partyNotifyGrid' },
      { type: 'fieldGrid', cols },
      { type: 'containerStrip' },
      { type: 'hblCargoTable' },
      { type: 'hblFreightSignature' },
      { type: 'totalsOnly' },
      { type: 'termsBank' },
    ],
  ];
  const body = [
    ...bodyPatterns[variant % bodyPatterns.length],
    ...(variant % 4 === 0 ? [{ type: 'signatureRow' }] : []),
    ...(variant % 5 === 1 ? [{ type: 'stampSignature' }] : []),
    { type: 'colorfulFooter' },
  ];

  const themes = [
    THEME,
    { ...THEME, primary: '#0A3D73', accent: '#1A6FA8' },
    { ...THEME, primary: '#123A5C', fill: '#EEF2F6' },
    { ...THEME, primary: '#0F4D96', orange: '#E08A10' },
    { ...THEME, primary: '#163A5F', cyan: '#7EC8F0' },
  ];

  return {
    paper: 'A4',
    rtl: false,
    theme: themes[variant % themes.length],
    branding: BRAND,
    demo: {
      ...classicDemo(badge, [{ k: 'Layout', v: name }]),
      letterBody:
        variant % 6 === 3
          ? 'We enclose herewith the draft House Bill of Lading for your kind perusal and confirmation.'
          : undefined,
    },
    blocks: [...head, ...body],
  };
}

function fgHblHkg() {
  return {
    paper: 'A4',
    rtl: false,
    theme: THEME,
    branding: BRAND,
    demo: classicDemo('DRAFT'),
    blocks: [
      { type: 'companyHeader', showContact: true },
      { type: 'formatBadge', label: 'DRAFT' },
      {
        type: 'docTitle',
        text: 'BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED "TO ORDER"',
        align: 'center',
        band: true,
      },
      { type: 'partyNotifyGrid' },
      { type: 'fieldGrid', cols: 2 },
      { type: 'hblCargoTable' },
      { type: 'hblFreightSignature' },
      { type: 'termsBank' },
      { type: 'colorfulFooter' },
    ],
  };
}

const prevHbl = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'hblFormatUiLayouts.json'), 'utf8'),
);
const leftoverPath = path.join(dataDir, 'leftoverFormatUiLayouts.json');
const leftover = JSON.parse(fs.readFileSync(leftoverPath, 'utf8'));
const leftoverCodes = new Set(leftover.map((r) => r.code.toUpperCase()));

const moved = [];
for (const row of prevHbl) {
  if (KEEP.has(row.code)) continue;
  if (leftoverCodes.has(row.code.toUpperCase())) continue;
  leftover.push({
    ...row,
    name: row.name || row.code,
    formatNumber: row.formatNumber || leftover.length + 1,
  });
  leftoverCodes.add(row.code.toUpperCase());
  moved.push(row.code);
}

const used = new Set();
const nextHbl = OFFICIAL.map(([code, name, sortOrder], index) => {
  const base = code === 'FG_HBL_HKG' ? fgHblHkg() : classicHbl(name, sortOrder, index);
  let blocks = base.blocks.map((b) => ({ ...b }));
  let sig = blockSignature(blocks);
  let attempt = 0;
  while (used.has(sig) && attempt < 32) {
    blocks = [
      ...blocks.slice(0, -1),
      { type: 'formatBadge', label: `${name}#${attempt}` },
      blocks[blocks.length - 1],
    ];
    sig = blockSignature(blocks);
    attempt += 1;
  }
  used.add(sig);
  return {
    code,
    formatNumber: sortOrder,
    name,
    paper: 'A4',
    rtl: false,
    theme: base.theme,
    branding: BRAND,
    demo: base.demo,
    blocks,
  };
});

fs.writeFileSync(
  path.join(dataDir, 'hblFormatUiLayouts.json'),
  `${JSON.stringify(nextHbl, null, 2)}\n`,
  'utf8',
);
fs.writeFileSync(
  path.join(dataDir, 'hblFormatUiLayouts.generated.ts'),
  `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
    `/** Auto-generated HBL — Fresa sample-report-formats (19) + FG_HBL_HKG. KingFisher logo. */\n` +
    `export const HBL_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = ${JSON.stringify(
      nextHbl,
      null,
      2,
    )} as InvoiceFormatUiLayout[];\n`,
  'utf8',
);

fs.writeFileSync(leftoverPath, `${JSON.stringify(leftover, null, 2)}\n`, 'utf8');
fs.writeFileSync(
  path.join(dataDir, 'leftoverFormatUiLayouts.generated.ts'),
  `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
    `/** Permanent JSON UI layouts — leftoverFormatUiLayouts. */\n` +
    `export const LEFTOVER_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = ${JSON.stringify(
      leftover,
      null,
      2,
    )} as InvoiceFormatUiLayout[];\n`,
  'utf8',
);

console.log(
  JSON.stringify(
    {
      hblOfficial: nextHbl.filter((r) => r.code !== 'FG_HBL_HKG').length,
      hblWithFg: nextHbl.length,
      movedToLeftover: moved.length,
      leftoverTotal: leftover.length,
      uniqueSigs: used.size,
    },
    null,
    2,
  ),
);
