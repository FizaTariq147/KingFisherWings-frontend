/**
 * HBL formats — official Fresa catalogue of 113 entries.
 * https://fresatechnologies.com/sample-report-formats/
 *
 * Usage: node scripts/build-hbl-format-ui-layouts.mjs
 *
 * Page-1 = Bill of Lading form (hblBlShell + hblFreightSignature).
 * BL Terms & Conditions remain the separate BL T&C PDF append (unchanged).
 *
 * 95 Jasper / FG variants + 18 legacy drafts (Format 2, 4–20).
 * Visual shells are shared by family after sampling official PDFs — not 113 unique designs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HBL_OFFICIAL_113 } from './hblOfficial113.mjs';

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
  primary: '#101010',
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

const TITLES = {
  combined: 'Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT',
  jasper: 'BILL OF LADING  NOT NEGOTIABLE UNLESS CONSIGNED "TO ORDER"',
  multimodal: 'MULTI-MODAL TRANSPORT DOCUMENT',
  mt: 'MULTIMODAL TRANSPORT DOCUMENT',
  ocean: 'BILL OF LADING',
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
  lines: [
    'AL NASER TRADING COMPANY LLC',
    '30 AL MAKTHOOM BUILDING',
    'SHARJAH UAE',
  ],
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

const DELIVERY = {
  title: 'APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:',
  lines: [
    'KingFisher Wings Dubai LLC',
    'DUBAI UNITED ARAB EMIRATES',
    'TEL: +971 55 5355 286',
    'EMAIL: inquiry@kingfishertec.com',
  ],
};

const CARGO_HEADERS = [
  'Container Nos, Seal Nos, Mark and Nos',
  'Number and kind of packages : description of goods',
  'Gross Weight(Kg)',
  'Volume',
];

const CARGO_ROW = [
  "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
  "STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE'S ACCOUNT",
  '18,000.000 KGS',
  '24.000 CBM',
];

function fieldGrid(extra = []) {
  return [
    { k: 'Bill of Lading No.', v: 'PLMAAJEA00081' },
    { k: 'HBL No.', v: 'PLMAAJEA00081' },
    { k: 'MBL No.', v: 'MBLCOPY87667888' },
    { k: 'Job No.', v: 'CEXP190150' },
    { k: 'Booking Ref.', v: 'B/EXP/19/0254' },
    { k: 'Place of Receipt', v: 'CHENNAI (EX MADRAS), INDIA' },
    { k: 'Port of Loading', v: 'CHENNAI (EX MADRAS), INDIA' },
    { k: 'Vessel / Voyage', v: 'CMA CGM / 9887' },
    { k: 'Ocean Vessel', v: 'CMA CGM' },
    { k: 'Voyage Number', v: '9887' },
    { k: 'Port of Discharge', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
    { k: 'Place of Delivery', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
    { k: 'No. of Bills of Lading', v: '1(ONE)' },
    { k: 'Freight', v: 'PREPAID' },
    { k: 'Payable At', v: 'CHENNAI AS ARRANGED' },
    { k: 'Onboard Date', v: '16-JAN-19' },
    { k: 'Place and Date of Issue', v: 'CHENNAI 28-JAN-19' },
    { k: 'Gross Weight', v: '18,000.000 KGS' },
    { k: 'Measurement', v: '24.000 CBM' },
    { k: 'Pre-carriage by', v: '' },
    ...extra,
  ];
}

function hblShellLayout(row) {
  const variant = row.variant || 'combined';
  const isOriginal = row.isOriginal === true;
  const badge = isOriginal ? 'ORIGINAL' : row.family === 'jasper' ? 'JASPER' : 'DRAFT';

  return {
    paper: 'A4',
    rtl: false,
    appendCustomerTerms: true,
    theme: THEME,
    branding: BRAND,
    demo: {
      invoiceNo: 'PLMAAJEA00081',
      invoiceDate: '28-JAN-19',
      formatBadgeLabel: badge,
      heroTitle: isOriginal ? 'ORIGINAL BILL OF LADING' : 'DRAFT BILL OF LADING',
      partyLeft: { ...SHIPPER },
      partyMid: { ...CONSIGNEE },
      partyNotify: { ...NOTIFY },
      fieldGrid: fieldGrid([
        { k: 'Layout', v: row.name },
        { k: 'Catalogue', v: `${row.family} #${row.sortOrder}` },
      ]),
      hblCargoHeaders: CARGO_HEADERS,
      hblCargoRows: [CARGO_ROW],
      tableHeaders: ['Container No.', 'Type', 'Seal', 'Pkgs', 'Weight', 'Volume'],
      tableRows: [['ABCU9877666', "20' DC", 'SL988888', '125', '18,000.000', '24.000']],
      containerNote: "Total Number of Containers or Packages (In words): ONE(1X20' DC) CONTAINER ONLY",
      hblFreightText: 'FREIGHT PREPAID PAYABLE AT : CHENNAI AS ARRANGED',
      hblOnboardDate: '16-JAN-19',
      hblPlaceDate: 'CHENNAI 28-JAN-19',
      hblCarrierAgent: 'CMA CGM',
      hblBlTitle: TITLES[variant] || TITLES.combined,
      hblOriginals: '1(ONE)',
      hblRegisteredNo: 'MTO/DGS/1182/APR/2019',
      hblDeliveryAgent: { ...DELIVERY },
      termsLines: [
        isOriginal
          ? 'ORIGINAL — Negotiable when duly endorsed.'
          : 'DRAFT — BILL OF LADING NOT NEGOTIABLE UNLESS CONSIGNED "TO ORDER"',
        'RECEIVED by the Carrier the Goods as specified above in apparent good order and condition unless otherwise stated.',
        'AS AGENT FOR THE CARRIER',
      ],
      remarks: badge,
    },
    blocks: [
      { type: 'hblBlShell', embedLogo: true, variant },
      { type: 'hblFreightSignature', variant: 'blClosing' },
      { type: 'colorfulFooter', variant: 'plain' },
    ],
  };
}

const layouts = HBL_OFFICIAL_113.map((row) => {
  const base = hblShellLayout(row);
  return {
    code: row.code,
    formatNumber: row.sortOrder,
    name: row.name,
    paper: base.paper,
    rtl: false,
    appendCustomerTerms: true,
    theme: base.theme,
    branding: base.branding,
    demo: base.demo,
    blocks: base.blocks,
  };
});

const outJson = path.join(root, 'src/features/reports/data/hblFormatUiLayouts.json');
const outTs = path.join(root, 'src/features/reports/data/hblFormatUiLayouts.generated.ts');
const outCatalog = path.join(root, 'src/features/reports/constants/hblOfficialCatalog.generated.ts');

fs.writeFileSync(outJson, JSON.stringify(layouts, null, 2) + '\n', 'utf8');
fs.writeFileSync(
  outTs,
  `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
    `/** Auto-generated HBL formats — run: node scripts/build-hbl-format-ui-layouts.mjs */\n` +
    `export const HBL_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = ${JSON.stringify(layouts, null, 2)} as InvoiceFormatUiLayout[];\n`,
  'utf8',
);

const catalogRows = HBL_OFFICIAL_113.map((row) => ({
  code: row.code,
  name: row.name,
  kind: row.kind,
  sortOrder: row.sortOrder,
  family: 'sea_docs',
  hblFamily: row.family,
  samplePdfUrl: row.samplePdfUrl,
  variant: row.variant,
}));

fs.writeFileSync(
  outCatalog,
  `/** Auto-generated from scripts/hblOfficial113.mjs — run: node scripts/build-hbl-format-ui-layouts.mjs */\n` +
    `export type HblOfficialCatalogRow = {\n` +
    `  code: string;\n` +
    `  name: string;\n` +
    `  kind: string;\n` +
    `  sortOrder: number;\n` +
    `  family: 'sea_docs';\n` +
    `  hblFamily: 'jasper' | 'legacy';\n` +
    `  samplePdfUrl: string | null;\n` +
    `  variant: string;\n` +
    `};\n\n` +
    `export const HBL_OFFICIAL_CATALOG: HblOfficialCatalogRow[] = ${JSON.stringify(catalogRows, null, 2)};\n`,
  'utf8',
);

const byVariant = layouts.reduce((acc, row) => {
  const v = row.blocks.find((b) => b.type === 'hblBlShell')?.variant || '?';
  acc[v] = (acc[v] || 0) + 1;
  return acc;
}, {});
const jasper = HBL_OFFICIAL_113.filter((r) => r.family === 'jasper').length;
const legacy = HBL_OFFICIAL_113.filter((r) => r.family === 'legacy').length;

console.log(`Wrote ${layouts.length} HBL layouts (jasper ${jasper} + legacy ${legacy})`);
console.log('Variants:', byVariant);
