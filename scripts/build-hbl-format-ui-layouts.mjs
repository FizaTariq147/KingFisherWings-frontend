/**
 * HBL formats from Fresa sample PDFs.
 * Usage: node scripts/build-hbl-format-ui-layouts.mjs
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
  ['HBL_DRAFT_REPORT_FORMAT_JASPER', 'HBL Draft Report Format Jasper', 'hbl_draft_jasper', 0],
  ['FG_HBL_HKG', 'FG HBL HKG', 'fg_hbl_hkg', 1],
  ['FG_HBL_FORMAT_1', 'FG HBL Format-1', 'fg_hbl_format_1', 2],
  ['FG_HBL_MAGICLOGISYS', 'FG HBL Magiclogisys', 'fg_hbl_magiclogisys', 3],
  ['HBL_DRAFT_REPORT_FORMAT_2', 'HBL Draft Report Format-2', 'hbl_draft_2', 4],
  ...[4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((n, i) => [
    `HBL_DRAFT_REPORT_FORMAT_${n}`,
    `HBL Draft Report Format-${n}`,
    `hbl_draft_${n}`,
    5 + i,
  ]),
  ['HBL_DRAFT_REPORT_FORMAT_14', 'HBL Draft Report Format-14', 'hbl_draft_14', 15],
  ['HBL_DRAFT_REPORT_FORMAT_15', 'HBL Draft Report Format-15', 'hbl_draft_15', 16],
  ['HBL_DRAFT_REPORT_FORMAT_16', 'HBL Draft Report Format-16', 'hbl_draft_16', 17],
  ['HBL_DRAFT_REPORT_FORMAT_17', 'HBL Draft Report Format-17', 'hbl_draft_17', 18],
  ['HBL_DRAFT_REPORT_FORMAT_18', 'HBL Draft Report Format-18', 'hbl_draft_18', 19],
  ['HBL_DRAFT_REPORT_FORMAT_19', 'HBL Draft Report Format-19', 'hbl_draft_19', 20],
  ['HBL_DRAFT_REPORT_FORMAT_20', 'HBL Draft Report Format-20', 'hbl_draft_20', 21],
  ['HBL_DRAFT_REPORT_FORMAT_23', 'HBL Draft Report Format-23', 'hbl_draft_23', 22],
  ['HBL_DRAFT_REPORT_FORMAT_25', 'HBL Draft Report Format-25', 'hbl_draft_25', 23],
  ['HBL_DRAFT_REPORT_FORMAT_26', 'HBL Draft Report Format-26', 'hbl_draft_26', 24],
  ['HBL_DRAFT_REPORT_FORMAT_27', 'HBL Draft Report Format-27', 'hbl_draft_27', 25],
  ['HBL_DRAFT_REPORT_FORMAT_29', 'HBL Draft Report Format-29', 'hbl_draft_29_html', 26],
  ['HBL_DRAFT_REPORT_FORMAT_33', 'HBL Draft Report Format-33', 'hbl_draft_33', 27],
  ['HBL_DRAFT_REPORT_FORMAT_40', 'HBL Draft Report Format-40', 'hbl_draft_40', 28],
  ['HBL_DRAFT_REPORT_FORMAT_41', 'HBL Draft Report Format-41', 'hbl_draft_41', 29],
  ['HBL_DRAFT_REPORT_FORMAT_42', 'HBL Draft Report Format-42', 'hbl_draft_42', 30],
  ['HBL_DRAFT_REPORT_FORMAT_43', 'HBL Draft Report Format-43', 'hbl_draft_43', 31],
  ['HBL_DRAFT_REPORT_FORMAT_44', 'HBL Draft Report Format-44', 'hbl_draft_44', 32],
  ['HBL_DRAFT_REPORT_FORMAT_45', 'HBL Draft Report Format-45', 'hbl_draft_45', 33],
  ['HBL_DRAFT_REPORT_FORMAT_46', 'HBL Draft Report Format-46', 'hbl_draft_46', 34],
  ['HBL_DRAFT_REPORT_FORMAT_47', 'HBL Draft Report Format-47', 'hbl_draft_47', 35],
  ['HBL_DRAFT_REPORT_FORMAT_48', 'HBL Draft Report Format-48', 'hbl_draft_48', 36],
  ['HBL_DRAFT_REPORT_FORMAT_49', 'HBL Draft Report Format-49', 'hbl_draft_49', 37],
  ['HBL_DRAFT_REPORT_FORMAT_50', 'HBL Draft Report Format-50', 'hbl_draft_50', 38],
  ['HBL_DRAFT_REPORT_FORMAT_51', 'HBL Draft Report Format-51', 'hbl_draft_51', 39],
  ['HBL_DRAFT_REPORT_FORMAT_52', 'HBL Draft Report Format-52', 'hbl_draft_52', 40],
  ['HBL_DRAFT_REPORT_FORMAT_53', 'HBL Draft Report Format-53', 'hbl_draft_53', 41],
  ['HBL_DRAFT_REPORT_FORMAT_54', 'HBL Draft Report Format-54', 'hbl_draft_54', 42],
  ['HBL_DRAFT_REPORT_FORMAT_55', 'HBL Draft Report Format-55', 'hbl_draft_55', 43],
  ['HBL_DRAFT_REPORT_FORMAT_56', 'HBL Draft Report Format-56', 'hbl_draft_56', 44],
  ['HBL_DRAFT_REPORT_FORMAT_59', 'HBL Draft Report Format-59', 'hbl_draft_59', 45],
  ['HBL_DRAFT_REPORT_FORMAT_60', 'HBL Draft Report Format-60', 'hbl_draft_60', 46],
  ['HBL_DRAFT_REPORT_FORMAT_61', 'HBL Draft Report Format-61', 'hbl_draft_61', 47],
  ['HBL_DRAFT_REPORT_FORMAT_63', 'HBL Draft Report Format-63', 'hbl_draft_63', 48],
  ['HBL_DRAFT_REPORT_FORMAT_64', 'HBL Draft Report Format-64', 'hbl_draft_64', 49],
  ['HBL_DRAFT_REPORT_FORMAT_65', 'HBL Draft Report Format-65', 'hbl_draft_65', 50],
  ['HBL_DRAFT_REPORT_FORMAT_66', 'HBL Draft Report Format-66', 'hbl_draft_66', 51],
  ['HBL_DRAFT_REPORT_FORMAT_67', 'HBL Draft Report Format-67', 'hbl_draft_67', 52],
  ['HBL_DRAFT_REPORT_FORMAT_68', 'HBL Draft Report Format-68', 'hbl_draft_68', 53],
  ['HBL_DRAFT_REPORT_FORMAT_69', 'HBL Draft Report Format-69', 'hbl_draft_69', 54],
  ['HBL_DRAFT_REPORT_FORMAT_70', 'HBL Draft Report Format-70', 'hbl_draft_70', 55],
  ['HBL_DRAFT_REPORT_FORMAT_72', 'HBL Draft Report Format-72', 'hbl_draft_72', 55],
  ['HBL_DRAFT_REPORT_FORMAT_73', 'HBL Draft Report Format-73', 'hbl_draft_73', 56],
  ['HBL_DRAFT_REPORT_FORMAT_75', 'HBL Draft Report Format-75', 'hbl_draft_75', 57],
  ['HBL_DRAFT_REPORT_FORMAT_77', 'HBL Draft Report Format-77', 'hbl_draft_77', 58],
  ['HBL_DRAFT_REPORT_FORMAT_83', 'HBL Draft Report Format-83', 'hbl_draft_83', 59],
  ['HBL_DRAFT_REPORT_FORMAT_84', 'HBL Draft Report Format-84', 'hbl_draft_84', 60],
  ['HBL_DRAFT_REPORT_FORMAT_85', 'HBL Draft Report Format-85', 'hbl_draft_85', 61],
  ['HBL_DRAFT_REPORT_FORMAT_86', 'HBL Draft Report Format-86', 'hbl_draft_86', 62],
  ['HBL_DRAFT_REPORT_FORMAT_87', 'HBL Draft Report Format-87', 'hbl_draft_87', 63],
  ['FG_HBL_ORIGINAL_FORMAT_87', 'FG HBL Original Format-87', 'fg_hbl_original_format_87', 64],
  ['HBL_DRAFT_REPORT_FORMAT_88', 'HBL Draft Report Format-88', 'hbl_draft_88', 66],
  ['HBL_DRAFT_REPORT_FORMAT_89', 'HBL Draft Report Format-89', 'hbl_draft_89', 67],
  ['HBL_DRAFT_REPORT_FORMAT_90', 'HBL Draft Report Format-90', 'hbl_draft_90', 68],
  ['HBL_DRAFT_REPORT_FORMAT_92', 'HBL Draft Report Format-92', 'hbl_draft_92', 69],
  ['HBL_DRAFT_REPORT_FORMAT_95', 'HBL Draft Report Format-95', 'hbl_draft_95', 70],
  ['HBL_DRAFT_REPORT_FORMAT_96', 'HBL Draft Report Format-96', 'hbl_draft_96', 71],
  ...[
    97, 99, 100, 101, 102, 107, 109, 114, 116, 117, 118, 120, 122, 127, 128, 129, 130, 132, 134,
    135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 151, 171, 172,
  ].map((n, i) => [
    `HBL_DRAFT_REPORT_FORMAT_${n}`,
    `HBL Draft Report Format-${n}`,
    `hbl_draft_${n}`,
    72 + i,
  ]),
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

const NOTIFY = {
  title: 'Notify Party',
  lines: CONSIGNEE.lines,
};

const HBL_META = [
  { k: 'HBL No.', v: 'PLMAAJEA00081' },
  { k: 'MBL No.', v: 'MBLCOPY87667888' },
  { k: 'Booking Ref.', v: 'B/EXP/19/0254' },
  { k: 'Port of Loading', v: 'CHENNAI (EX MADRAS), INDIA' },
  { k: 'Port of Discharge', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
  { k: 'Place of Delivery', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
  { k: 'Vessel / Voyage', v: 'EVERGREEN MARINE / 9887' },
  { k: 'ETD', v: '29-JAN-19' },
  { k: 'ETA', v: '07-FEB-19' },
  { k: 'Service Type', v: 'FCL' },
  { k: 'Freight', v: 'PREPAID' },
  { k: 'No. of Packages', v: '125' },
  { k: 'Gross Weight', v: '18,000.000 KGS' },
  { k: 'Measurement', v: '24.000 CBM' },
];

const CONTAINER_HEADERS = ['Container No.', 'Type', 'Seal', 'Pkgs', 'Weight', 'Volume'];
const CONTAINER_ROW = ['ABCU9877666', "20' DC", 'SL988888', '125', '18,000.000', '24.000'];

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

function standardHbl(docTitle, opts = {}) {
  const {
    headerColor = 'primary',
    extraGrid = [],
    badge,
    letterBody,
    termsExtra,
    isDraft = true,
  } = opts;
  const blocks = [
    { type: 'companyHeader', showContact: true },
    ...(badge ? [{ type: 'formatBadge' }] : []),
    { type: 'docTitle', text: docTitle, align: 'center', band: true },
  ];
  if (letterBody) blocks.push({ type: 'letterBody' });
  blocks.push(
    { type: 'partyTriple' },
    { type: 'fieldGrid', cols: 2 },
    { type: 'chargeTable', headerColor },
    { type: 'containerStrip' },
    { type: 'termsBank' },
    { type: 'signatureRow' },
    { type: 'colorfulFooter' },
  );
  return layout({
    demo: {
      invoiceNo: 'PLMAAJEA00081',
      invoiceDate: '28-JAN-19',
      letterBody,
      partyLeft: SHIPPER,
      partyMid: CONSIGNEE,
      partyNotify: NOTIFY,
      fieldGrid: [...HBL_META, ...extraGrid],
      tableHeaders: CONTAINER_HEADERS,
      tableRows: [CONTAINER_ROW],
      termsLines: [
        isDraft
          ? 'DRAFT — Not negotiable unless marked original.'
          : 'ORIGINAL — Negotiable when duly endorsed.',
        ...(termsExtra ? [termsExtra] : []),
        'STC: VALVE MATERIALS FOR MACHINERY PARTS',
      ],
      remarks: badge,
    },
    blocks,
  });
}

function draftFormat(n, headerColor = 'primary') {
  return standardHbl(`HOUSE BILL OF LADING — DRAFT FORMAT ${n}`, {
    headerColor,
    extraGrid: [{ k: 'Layout', v: `HBL Draft Report Format-${n}` }],
    badge: `Format-${n}`,
  });
}

const KINDS = {
  hbl_draft_jasper: () =>
    standardHbl('HOUSE BILL OF LADING — DRAFT (JASPER)', {
      headerColor: 'primary',
      extraGrid: [{ k: 'Layout', v: 'HBL Draft Report Format Jasper' }],
      badge: 'Jasper Draft',
    }),

  fg_hbl_hkg: () =>
    standardHbl('FG HBL — HONG KONG', {
      headerColor: 'accent',
      extraGrid: [{ k: 'Region', v: 'HKG' }],
      badge: 'FG HBL HKG',
    }),

  fg_hbl_format_1: () =>
    standardHbl('FG HBL — FORMAT 1', {
      headerColor: 'fill',
      extraGrid: [{ k: 'Layout', v: 'FG HBL Format-1' }],
      badge: 'FG Format-1',
    }),

  fg_hbl_magiclogisys: () =>
    standardHbl('FG HBL — MAGICLOGISYS', {
      headerColor: 'primary',
      extraGrid: [{ k: 'Template', v: 'Magiclogisys' }],
      badge: 'Magiclogisys',
    }),

  hbl_draft_14: () => draftFormat(14, 'primary'),
  hbl_draft_16: () => draftFormat(16, 'accent'),
  hbl_draft_20: () => draftFormat(20, 'fill'),
  hbl_draft_23: () => draftFormat(23, 'primary'),
  hbl_draft_25: () => draftFormat(25, 'accent'),
  hbl_draft_26: () => draftFormat(26, 'fill'),
  hbl_draft_27: () => draftFormat(27, 'primary'),

  hbl_draft_29_html: () =>
    standardHbl('HOUSE BILL OF LADING — DRAFT FORMAT 29 (HTML)', {
      headerColor: 'cyan',
      extraGrid: [
        { k: 'Layout', v: 'HBL Draft Report Format-29' },
        { k: 'Renderer', v: 'HTML draft layout' },
      ],
      badge: 'HTML Format-29',
      letterBody: 'HTML-rendered draft HBL — sample export from Fresa Gold.',
      termsExtra: 'Generated from HTML draft template.',
    }),

  hbl_draft_33: () => draftFormat(33, 'accent'),
  hbl_draft_40: () => draftFormat(40, 'orange'),
  hbl_draft_41: () => draftFormat(41, 'primary'),
  hbl_draft_42: () => draftFormat(42, 'accent'),
  hbl_draft_43: () => draftFormat(43, 'fill'),
  hbl_draft_44: () => draftFormat(44, 'primary'),
  hbl_draft_45: () => draftFormat(45, 'accent'),
  hbl_draft_46: () => draftFormat(46, 'fill'),
  hbl_draft_47: () => draftFormat(47, 'primary'),
  hbl_draft_48: () => draftFormat(48, 'accent'),
  hbl_draft_49: () => draftFormat(49, 'fill'),
  hbl_draft_50: () => draftFormat(50, 'primary'),
  hbl_draft_51: () => draftFormat(51, 'accent'),
  hbl_draft_52: () => draftFormat(52, 'fill'),
  hbl_draft_53: () => draftFormat(53, 'orange'),
  hbl_draft_54: () => draftFormat(54, 'cyan'),
  hbl_draft_55: () => draftFormat(55, 'primary'),
  hbl_draft_56: () => draftFormat(56, 'accent'),
  hbl_draft_59: () => draftFormat(59, 'fill'),
  hbl_draft_60: () => draftFormat(60, 'primary'),
  hbl_draft_61: () => draftFormat(61, 'accent'),
  hbl_draft_63: () => draftFormat(63, 'fill'),
  hbl_draft_64: () => draftFormat(64, 'primary'),
  hbl_draft_65: () => draftFormat(65, 'accent'),
  hbl_draft_66: () => draftFormat(66, 'fill'),
  hbl_draft_67: () => draftFormat(67, 'orange'),
  hbl_draft_68: () => draftFormat(68, 'cyan'),
  hbl_draft_69: () => draftFormat(69, 'primary'),
  hbl_draft_70: () => draftFormat(70, 'primary'),
  hbl_draft_72: () => draftFormat(72, 'accent'),
  hbl_draft_73: () => draftFormat(73, 'fill'),
  hbl_draft_75: () => draftFormat(75, 'primary'),
  hbl_draft_77: () => draftFormat(77, 'accent'),
  hbl_draft_83: () => draftFormat(83, 'fill'),
  hbl_draft_84: () => draftFormat(84, 'primary'),
  hbl_draft_85: () => draftFormat(85, 'accent'),
  hbl_draft_86: () => draftFormat(86, 'fill'),
  hbl_draft_87: () => draftFormat(87, 'primary'),
  fg_hbl_original_format_87: () =>
    standardHbl('HOUSE BILL OF LADING — ORIGINAL FORMAT 87', {
      headerColor: 'orange',
      isDraft: false,
      extraGrid: [
        { k: 'Layout', v: 'FG HBL Original Format-87' },
        { k: 'Document Type', v: 'ORIGINAL' },
      ],
      badge: 'Original Format-87',
      termsExtra: 'FG HBL original sample (Format-87).',
    }),
  hbl_draft_88: () => draftFormat(88, 'accent'),
  hbl_draft_89: () => draftFormat(89, 'fill'),
  hbl_draft_90: () => draftFormat(90, 'fill'),
  hbl_draft_92: () => draftFormat(92, 'primary'),
  hbl_draft_95: () => draftFormat(95, 'accent'),
  hbl_draft_96: () => draftFormat(96, 'cyan'),
};

const HEADER_CYCLE = ['primary', 'accent', 'fill', 'orange', 'cyan'];
for (const [, , kind, n] of CATALOG) {
  if (KINDS[kind]) continue;
  const m = /^hbl_draft_(\d+)$/.exec(kind);
  if (m) {
    const num = Number(m[1]);
    KINDS[kind] = () => draftFormat(num, HEADER_CYCLE[n % HEADER_CYCLE.length]);
  }
}

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
const outJson = path.join(root, 'src/features/reports/data/hblFormatUiLayouts.json');
const outTs = path.join(root, 'src/features/reports/data/hblFormatUiLayouts.generated.ts');
fs.writeFileSync(outJson, JSON.stringify(layouts, null, 2) + '\n', 'utf8');
fs.writeFileSync(
  outTs,
  `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
    `/** Auto-generated HBL formats — run: node scripts/build-hbl-format-ui-layouts.mjs */\n` +
    `export const HBL_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = ${JSON.stringify(layouts, null, 2)} as InvoiceFormatUiLayout[];\n`,
  'utf8',
);
console.log(`Wrote ${layouts.length} HBL layouts matched to Fresa sample PDFs`);
